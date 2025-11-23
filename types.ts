export interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  publicKey?: CryptoKey; // Simulated public key
}

export interface Message {
  id: string;
  senderId: string;
  content: string; // This will be encrypted in transit, decrypted for view
  timestamp: number;
  type: 'text' | 'image' | 'file';
  fileName?: string;
  fileSize?: string;
  fileData?: string; // Base64
  isEncrypted: boolean;
  quantumVerified?: boolean;
}

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  timestamp: number;
  expiresAt: number;
  viewed: boolean;
}

export enum EncryptionStatus {
  NONE = 'NONE',
  HANDSHAKE = 'HANDSHAKE',
  SECURE = 'SECURE',
  POST_QUANTUM = 'POST_QUANTUM'
}