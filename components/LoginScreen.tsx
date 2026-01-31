import React, { useState } from 'react';
import { UserProfile } from '../types';
import { loadUser, saveUser, createInitialGameState } from '../services/storage';

interface LoginScreenProps {
  onSuccess: (user: UserProfile, isNew: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
        setError('Please enter username and password');
        return;
    }

    const existingUser = loadUser(username);

    if (existingUser) {
        if (existingUser.passwordHash === password) {
            onSuccess(existingUser, false);
        } else {
            setError('Invalid credentials');
        }
    } else {
       setError('No saved game found.');
    }
  };

  const handleRegister = (e: React.MouseEvent) => {
      e.preventDefault();
      setError('');
      if (!username || !password) {
        setError('Please enter username and password');
        return;
      }
      
      const existingUser = loadUser(username);
      if (existingUser) {
          setError('User already exists');
          return;
      }

      const newUser: UserProfile = {
          username,
          passwordHash: password,
          characterId: null,
          gameState: createInitialGameState()
      };
      saveUser(newUser);
      onSuccess(newUser, true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#7eb8d8' }}>
      
      {/* Big Title */}
      <div className="text-center mb-6">
        <h1 
          className="text-4xl md:text-5xl font-bold tracking-tight animate-pulse"
          style={{ 
            color: '#facc15',
            textShadow: '4px 4px 0 #4080a8, 6px 6px 0 #306080, 0 0 20px rgba(255,255,255,0.5)',
            fontFamily: '"Press Start 2P", monospace',
            animation: 'retroPulse 2s ease-in-out infinite'
          }}
        >
          WEALTH QUEST
        </h1>
        <p className="text-sm mt-3 font-bold" style={{ color: '#305878' }}>
          Your financial adventure awaits!
        </p>
        <style>{`
          @keyframes retroPulse {
            0%, 100% { 
              transform: scale(1);
              text-shadow: 4px 4px 0 #4080a8, 6px 6px 0 #306080, 0 0 10px rgba(255,255,255,0.3);
            }
            50% { 
              transform: scale(1.05);
              text-shadow: 4px 4px 0 #4080a8, 6px 6px 0 #306080, 0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(100,200,255,0.4);
            }
          }
        `}</style>
      </div>

      {/* Main Panel - Pixel art style outer frame */}
      <div 
        className="w-full max-w-lg p-2"
        style={{ 
          backgroundColor: '#9ccce8',
          border: '4px solid #5a98b8',
          borderRadius: '8px',
          boxShadow: 'inset 2px 2px 0 #b8e0f0, inset -2px -2px 0 #4888a8'
        }}
      >
        
        {/* Title Bar - like classic game windows */}
        <div 
          className="flex items-center justify-between px-3 py-2 mb-2"
          style={{ 
            backgroundColor: '#5a98b8',
            borderRadius: '4px'
          }}
        >
          <span className="text-white font-bold text-sm tracking-wide">Login</span>
          <span className="text-white/70 text-xs">▼ Menu</span>
        </div>

        {/* Inner Content Panel - cream/white with pixel border */}
        <div 
          className="p-4"
          style={{ 
            backgroundColor: '#fffef8',
            border: '4px solid #c8d8e8',
            borderRadius: '4px',
            boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8'
          }}
        >
          
          {error && (
            <div 
              className="mb-4 p-2 text-center text-sm font-bold"
              style={{ 
                backgroundColor: '#ffcccc',
                border: '3px solid #cc6666',
                color: '#881111'
              }}
            >
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-700">NAME</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                className="w-full p-3 font-mono uppercase text-gray-800 focus:outline-none"
                style={{ 
                  backgroundColor: '#f0f8ff',
                  border: '3px solid #a8c8e0',
                  borderRadius: '2px',
                  boxShadow: 'inset 1px 1px 0 #d0e0f0'
                }}
                maxLength={12}
                placeholder="ENTER NAME..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-gray-700">PASSWORD</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 font-mono text-gray-800 focus:outline-none"
                style={{ 
                  backgroundColor: '#f0f8ff',
                  border: '3px solid #a8c8e0',
                  borderRadius: '2px',
                  boxShadow: 'inset 1px 1px 0 #d0e0f0'
                }}
                placeholder="••••••••"
              />
            </div>
          </form>
        </div>

        {/* Bottom Dialog Box - pill shaped like the reference */}
        <div 
          className="mt-2 py-3 px-6 text-center"
          style={{ 
            backgroundColor: '#4888b0',
            borderRadius: '20px',
            border: '3px solid #3070a0',
            boxShadow: 'inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888'
          }}
        >
          <p className="text-white font-bold text-sm">What would you like to do?</p>
        </div>

        {/* Action Buttons - classic RPG style */}
        <div className="flex gap-2 mt-2 justify-center">
          <button 
            type="button"
            onClick={handleRegister}
            className="px-5 py-2 font-bold text-sm text-gray-700 active:translate-y-0.5"
            style={{ 
              backgroundColor: '#f8f8f0',
              border: '3px solid #c0c0b0',
              borderRadius: '4px',
              boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 #a0a090, 0 2px 0 #909080'
            }}
          >
            New Game
          </button>
          <button 
            type="button"
            onClick={handleLogin}
            className="px-5 py-2 font-bold text-sm text-gray-700 active:translate-y-0.5"
            style={{ 
              backgroundColor: '#f8f8f0',
              border: '3px solid #c0c0b0',
              borderRadius: '4px',
              boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 #a0a090, 0 2px 0 #909080'
            }}
          >
            Continue
          </button>
        </div>
      </div>
      
      <p className="mt-6 text-xs text-blue-900/60 font-bold">Made at ElleHacks 2026 by BLT: Built Like That</p>
    </div>
  );
};
