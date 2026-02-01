import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onLoadComplete: () => void;
  characterName?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete, characterName = 'Adventurer' }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  
  const loadingMessages = [
    'Initializing...',
    'Loading map data...',
    'Preparing sprites...',
    'Setting up economy...',
    'Spawning NPCs...',
    'Brewing coffee...',
    'Counting coins...',
    'Almost there...',
    'Ready!'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15 + 5;
        
        const messageIndex = Math.min(
          Math.floor((next / 100) * loadingMessages.length),
          loadingMessages.length - 1
        );
        setLoadingText(loadingMessages[messageIndex]);
        
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => onLoadComplete(), 500);
          return 100;
        }
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [onLoadComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#7eb8d8' }}>
      <div 
        className="w-full max-w-lg p-2"
        style={{ 
          backgroundColor: '#9ccce8',
          border: '4px solid #5a98b8',
          borderRadius: '8px',
          boxShadow: 'inset 2px 2px 0 #b8e0f0, inset -2px -2px 0 #4888a8'
        }}
      >
        {/* Title Bar */}
        <div 
          className="flex items-center justify-between px-3 py-2 mb-2"
          style={{ backgroundColor: '#5a98b8', borderRadius: '4px' }}
        >
          <span className="text-white font-bold text-sm tracking-wide">Loading...</span>
          <span className="text-white/70 text-xs">{Math.floor(progress)}%</span>
        </div>

        {/* Inner Content Panel */}
        <div 
          className="p-6"
          style={{ 
            backgroundColor: '#fffef8',
            border: '4px solid #c8d8e8',
            borderRadius: '4px',
            boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8'
          }}
        >
          {/* Bouncing icon */}
          <div className="flex justify-center mb-6">
            <div 
              className="w-16 h-16 animate-bounce"
              style={{ 
                backgroundColor: '#d8ecf8',
                border: '3px solid #a0b8c8',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}
            >
              🎮
            </div>
          </div>

          {/* Loading message */}
          <div className="text-center mb-4">
            <p className="text-gray-700 font-bold text-sm mb-1">Get ready, {characterName}!</p>
            <p className="text-gray-500 text-xs">{loadingText}</p>
          </div>

          {/* Progress bar */}
          <div 
            className="h-6 overflow-hidden"
            style={{ 
              backgroundColor: '#d8e8f0',
              border: '3px solid #a0b8c8',
              borderRadius: '2px',
              boxShadow: 'inset 1px 1px 0 #c0d0d8'
            }}
          >
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                backgroundColor: '#58a8d0',
                boxShadow: 'inset 0 2px 0 #78c8e8, inset 0 -2px 0 #3888b0'
              }}
            />
          </div>

          {/* Blinking dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-2 h-2"
                style={{ 
                  backgroundColor: '#5a98b8',
                  animation: `pixelBlink 1s ease-in-out ${i * 0.2}s infinite`
                }}
              />
            ))}
          </div>
        </div>

        {/* Tip box */}
        <div 
          className="mt-2 py-3 px-4 text-center"
          style={{ 
            backgroundColor: '#4888b0',
            borderRadius: '20px',
            border: '3px solid #3070a0',
            boxShadow: 'inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888'
          }}
        >
          <p className="text-white font-bold text-xs">💡 Tip: Balance spending with saving to reach your goals!</p>
        </div>
      </div>

      <style>{`
        @keyframes pixelBlink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
