import React, { useState } from 'react';
import { TypewriterText } from './TypewriterText';

interface IntroSceneProps {
  username: string;
  onFinished: () => void;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ username, onFinished }) => {
  const [step, setStep] = useState(0);

  const lines = [
    `Hey there, ${username}!\nWelcome to Wealth Quest!`,
    `This is a world where your everyday choices shape your future.`,
    `Coffee runs, shopping trips, saving goals... Every decision counts!`,
    `Don't worry - there's no wrong way to play!`,
    `You'll learn as you go. Make choices, see what happens.`,
    `Some days you'll save big. Other days... that latte just hits different.`,
    `The goal? Build good habits and have fun!`,
    `Ready to start your adventure?`,
    `Let's go!`
  ];

  const handleNext = () => {
    if (step < lines.length - 1) {
      setStep(step + 1);
    } else {
      onFinished();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#7eb8d8' }}>
      {/* Main Panel */}
      <div 
        className="w-full max-w-2xl p-2"
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
          style={{ 
            backgroundColor: '#5a98b8',
            borderRadius: '4px'
          }}
        >
          <span className="text-white font-bold text-sm tracking-wide">Welcome!</span>
          <span className="text-white/70 text-xs">{step + 1}/{lines.length}</span>
        </div>

        {/* Inner Content Panel */}
        <div 
          className="overflow-hidden"
          style={{ 
            backgroundColor: '#fffef8',
            border: '4px solid #c8d8e8',
            borderRadius: '4px',
            boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8'
          }}
        >
          
          {/* Scene Area */}
          <div 
            className="h-44 flex items-center justify-center"
            style={{ backgroundColor: '#d8ecf8' }}
          >
            <div className="flex items-end gap-4">
              {/* Character Sprite */}
              <div 
                className="w-20 h-20"
                style={{
                  backgroundImage: 'url(/assets/sprites/RegularPoseBoy.png)',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  imageRendering: 'pixelated'
                }}
              />
            </div>
          </div>

          {/* Text Area */}
          <div 
            className="p-4 min-h-[100px] cursor-pointer border-t-4"
            style={{ borderColor: '#c8d8e8' }}
            onClick={handleNext}
          >
            <TypewriterText text={lines[step]} onComplete={() => {}} speed={25} />
          </div>
        </div>

        {/* Dialog Box */}
        <div 
          className="mt-2 py-3 px-6 text-center cursor-pointer"
          style={{ 
            backgroundColor: '#4888b0',
            borderRadius: '20px',
            border: '3px solid #3070a0',
            boxShadow: 'inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888'
          }}
          onClick={handleNext}
        >
          <p className="text-white font-bold text-sm">
            {step < lines.length - 1 ? '► Click to continue' : '► Start Adventure!'}
          </p>
        </div>

        {/* Progress Bar */}
        <div 
          className="mt-2 h-3 overflow-hidden"
          style={{ 
            backgroundColor: '#a8c8d8',
            border: '2px solid #88a8b8',
            borderRadius: '2px'
          }}
        >
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${((step + 1) / lines.length) * 100}%`,
              backgroundColor: '#58a8d0'
            }}
          />
        </div>
      </div>
    </div>
  );
};
