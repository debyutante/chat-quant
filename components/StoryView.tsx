import React, { useEffect, useState } from 'react';
import { Story } from '../types';

interface StoryViewProps {
  story: Story;
  onClose: () => void;
  onNext: () => void;
}

export const StoryView: React.FC<StoryViewProps> = ({ story, onClose, onNext }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000; // 5 seconds per story
    const intervalTime = 50;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onNext();
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [story, onNext]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="relative w-full max-w-md h-full bg-gray-900 flex flex-col">
        {/* Progress Bar */}
        <div className="absolute top-4 left-2 right-2 flex space-x-1 z-20">
          <div className="h-1 bg-gray-600 flex-1 rounded overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 z-20 flex items-center">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-green to-neon-blue p-[2px]">
             <img src={`https://picsum.photos/seed/${story.userId}/50`} className="w-full h-full rounded-full border border-black" alt="avatar" />
           </div>
           <span className="ml-2 text-white font-bold drop-shadow-md">Utilisateur Anonyme</span>
           <span className="ml-2 text-gray-300 text-xs drop-shadow-md">
             {new Date(story.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
           </span>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-4 z-20 text-white hover:text-gray-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center bg-gray-800 relative">
           <img src={story.imageUrl} alt="Story" className="w-full h-full object-cover" />
           <div className="absolute bottom-10 left-0 right-0 text-center">
             <span className="bg-black/50 px-4 py-2 rounded-full text-neon-green text-sm border border-neon-green/30 backdrop-blur-sm">
                🔒 Cryptage Post-Quantique Activé
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};