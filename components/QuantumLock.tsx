import React from 'react';
import { EncryptionStatus } from '../types';

interface Props {
  status: EncryptionStatus;
}

export const QuantumLock: React.FC<Props> = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case EncryptionStatus.POST_QUANTUM: return 'text-neon-green border-neon-green shadow-[0_0_10px_#00ff9d]';
      case EncryptionStatus.SECURE: return 'text-blue-400 border-blue-400';
      case EncryptionStatus.HANDSHAKE: return 'text-yellow-400 border-yellow-400 animate-pulse';
      default: return 'text-red-500 border-red-500';
    }
  };

  const getText = () => {
    switch (status) {
        case EncryptionStatus.POST_QUANTUM: return 'PQ-CRYPTO: LATTICE';
        case EncryptionStatus.SECURE: return 'AES-256-GCM';
        case EncryptionStatus.HANDSHAKE: return 'HANDSHAKE...';
        default: return 'UNSECURED';
      }
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded border ${getColor()} bg-black/40 backdrop-blur-md transition-all duration-500`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span className="text-xs font-mono font-bold tracking-wider">{getText()}</span>
    </div>
  );
};