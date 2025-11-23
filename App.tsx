import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, User, Story, EncryptionStatus } from './types';
import { generateAESKey, encryptMessage, decryptMessage } from './services/cryptoService';
import { getSmartReply } from './services/geminiService';
import { StoryView } from './components/StoryView';
import { QuantumLock } from './components/QuantumLock';

// Icons
const PaperAirplaneIcon = () => <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const PlusIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const PhotoIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const AttachmentIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>;
const RobotIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;

const MY_ID = 'me';
const ALICE_ID = 'alice';

export default function App() {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus>(EncryptionStatus.HANDSHAKE);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [fileInput, setFileInput] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize
  useEffect(() => {
    // 1. Simulate Handshake
    setTimeout(() => setEncryptionStatus(EncryptionStatus.SECURE), 1000);
    setTimeout(() => {
      setEncryptionStatus(EncryptionStatus.POST_QUANTUM);
      // Initialize Crypto Key
      generateAESKey().then(setCryptoKey);
    }, 2500);

    // 2. Load Mock Stories
    setStories([
      { id: '1', userId: ALICE_ID, imageUrl: 'https://picsum.photos/seed/cyber/400/800', timestamp: Date.now() - 3600000, expiresAt: Date.now() + 86400000, viewed: false },
      { id: '2', userId: ALICE_ID, imageUrl: 'https://picsum.photos/seed/neon/400/800', timestamp: Date.now() - 1800000, expiresAt: Date.now() + 86400000, viewed: false },
    ]);

    // 3. Initial Message
    setMessages([
        {
            id: 'init-1',
            senderId: ALICE_ID,
            content: "Connexion sécurisée établie. Canal Salsifie actif.",
            timestamp: Date.now(),
            type: 'text',
            isEncrypted: true,
            quantumVerified: true
        }
    ]);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Send
  const handleSend = async () => {
    if ((!inputValue.trim() && !fileInput) || !cryptoKey) return;

    const newMessageId = Date.now().toString();
    const tempMessages = [...messages];

    let contentToSend = inputValue;
    let msgType: 'text' | 'file' = 'text';
    let fileDataStr = undefined;
    let fileName = undefined;
    let fileSize = undefined;

    // Handle File (Max 1 file, simulate expiration check logic by just allowing it now)
    if (fileInput) {
        msgType = 'file';
        fileName = fileInput.name;
        fileSize = (fileInput.size / 1024).toFixed(1) + ' KB';
        // Convert to Base64
        fileDataStr = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(fileInput);
        });
        contentToSend = "Fichier Crypté"; // Placeholder text for encryption
    }

    // Encrypt
    const { cipherText } = await encryptMessage(contentToSend, cryptoKey);
    // In a real app, we'd send cipherText. Here we store both for display demo.
    // Ideally, we store the plaintext in local state for "me" and assume "alice" decrypts it.
    
    const newMessage: Message = {
      id: newMessageId,
      senderId: MY_ID,
      content: msgType === 'file' ? 'Fichier envoyé' : inputValue,
      timestamp: Date.now(),
      type: msgType,
      fileName,
      fileSize,
      fileData: fileDataStr,
      isEncrypted: true,
      quantumVerified: true
    };

    setMessages([...tempMessages, newMessage]);
    setInputValue('');
    setFileInput(null);
    if(fileInputRef.current) fileInputRef.current.value = '';

    // Simulate Alice Reply
    simulateAliceReply(inputValue, tempMessages);
  };

  const simulateAliceReply = useCallback(async (userText: string, history: Message[]) => {
    setIsTyping(true);
    
    // Extract history text
    const textHistory = history.map(m => `${m.senderId === MY_ID ? 'User' : 'Salsifie'}: ${m.content}`);
    
    // Artificial delay
    setTimeout(async () => {
      // Get local smart reply
      const replyText = await getSmartReply(textHistory, userText);

      const replyMsg: Message = {
        id: Date.now().toString(),
        senderId: ALICE_ID,
        content: replyText,
        timestamp: Date.now(),
        type: 'text',
        isEncrypted: true,
        quantumVerified: true
      };
      setMessages(prev => [...prev, replyMsg]);
      setIsTyping(false);
    }, 2000);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileInput(e.target.files[0]);
    }
  };

  const openStory = (story: Story) => {
    setActiveStory(story);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden font-sans">
      
      {/* Sidebar (Contacts & Stories) */}
      <div className="w-20 md:w-80 border-r border-gray-800 flex flex-col bg-gray-900/50 backdrop-blur-sm">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h1 className="hidden md:block font-mono text-xl text-neon-green tracking-tighter font-bold">SALSIFIE</h1>
            <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-neon-green border border-neon-green">
                <span className="font-bold">S</span>
            </div>
        </div>

        {/* Stories Rail */}
        <div className="p-4 border-b border-gray-800 overflow-x-auto">
            <h2 className="hidden md:block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Stories (24h)</h2>
            <div className="flex space-x-3">
                {/* My Story Add */}
                <div className="flex flex-col items-center space-y-1 cursor-pointer group">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center group-hover:border-neon-green transition-colors">
                        <PlusIcon />
                    </div>
                    <span className="text-[10px] text-gray-400">Moi</span>
                </div>
                {/* Alice Story */}
                {stories.map(story => (
                    <div key={story.id} onClick={() => openStory(story)} className="flex flex-col items-center space-y-1 cursor-pointer">
                        <div className={`w-12 h-12 rounded-full p-[2px] ${story.viewed ? 'bg-gray-700' : 'bg-gradient-to-tr from-neon-green to-neon-purple'}`}>
                             <img src={`https://picsum.photos/seed/${story.userId}/50`} className="w-full h-full rounded-full border border-black" alt="avatar" />
                        </div>
                        <span className="text-[10px] text-gray-400">Alice</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
            <div className="p-3 hover:bg-gray-800 cursor-pointer flex items-center space-x-3 border-l-2 border-neon-green bg-gray-800/30">
                <div className="relative">
                    <img src="https://picsum.photos/seed/alice/50" className="w-10 h-10 rounded-full" alt="Alice" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-neon-green rounded-full border-2 border-gray-900"></span>
                </div>
                <div className="hidden md:block">
                    <h3 className="text-sm font-semibold text-white">Alice (Anonyme)</h3>
                    <p className="text-xs text-gray-400 truncate">En ligne - Crypté</p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 bg-gray-900/80 backdrop-blur flex items-center justify-between px-6 z-10 shadow-lg">
            <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                    <span className="font-bold text-white">Alice</span>
                    <span className="text-xs text-neon-green font-mono">ID: 8f7a-2b1c-9d4e</span>
                </div>
            </div>
            <QuantumLock status={encryptionStatus} />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderId === MY_ID ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md ${msg.senderId === MY_ID ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`
                            relative px-4 py-3 rounded-2xl shadow-xl 
                            ${msg.senderId === MY_ID 
                                ? 'bg-gradient-to-br from-neon-purple/20 to-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-none' 
                                : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-tl-none'}
                        `}>
                            {msg.type === 'file' ? (
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-gray-900 rounded">
                                       <svg className="w-8 h-8 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold truncate max-w-[150px]">{msg.fileName}</p>
                                        <p className="text-xs text-gray-400">{msg.fileSize} • Expire 24h</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                            )}
                            
                            {/* Metadata */}
                            <div className="flex items-center justify-end space-x-1 mt-1 opacity-70">
                                {msg.quantumVerified && (
                                    <svg className="w-3 h-3 text-neon-green" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                )}
                                <span className="text-[10px]">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                     <div className="bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-none border border-gray-700 flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                     </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 z-10">
            {fileInput && (
                <div className="mb-2 flex items-center justify-between bg-gray-800 p-2 rounded border border-neon-green/50">
                    <span className="text-xs text-neon-green flex items-center">
                        <AttachmentIcon />
                        <span className="ml-2">{fileInput.name} (Prêt à crypter)</span>
                    </span>
                    <button onClick={() => setFileInput(null)} className="text-red-400 hover:text-red-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-neon-green hover:bg-gray-800 rounded-full transition-all"
                    title="Envoyer Fichier (Max 1)"
                >
                   <PlusIcon />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileSelect}
                />
                
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Message crypté..."
                        className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 rounded-full py-3 px-5 focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                    />
                </div>

                <button 
                    onClick={handleSend}
                    disabled={(!inputValue && !fileInput) || encryptionStatus !== EncryptionStatus.POST_QUANTUM}
                    className={`p-3 rounded-full transition-all duration-300 ${
                        (!inputValue && !fileInput) || encryptionStatus !== EncryptionStatus.POST_QUANTUM
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                        : 'bg-neon-green text-black hover:bg-green-400 shadow-[0_0_15px_#00ff9d]'
                    }`}
                >
                    <PaperAirplaneIcon />
                </button>
            </div>
            <div className="mt-2 text-center">
                <p className="text-[10px] text-gray-600 font-mono">
                    <span className="text-neon-green">●</span> Chiffrage de bout en bout (Simulé: AES-256) • Messages éphémères
                </p>
            </div>
        </div>

        {/* Story Modal */}
        {activeStory && (
            <StoryView 
                story={activeStory} 
                onClose={() => setActiveStory(null)} 
                onNext={() => {
                    // Logic to move to next story in array
                    const currentIndex = stories.findIndex(s => s.id === activeStory.id);
                    if (currentIndex < stories.length - 1) {
                        setActiveStory(stories[currentIndex + 1]);
                    } else {
                        setActiveStory(null);
                    }
                }}
            />
        )}
      </div>
    </div>
  );
}