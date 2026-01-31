import React, { useState, useEffect } from 'react';
import { RetroBox } from './RetroBox';
import { TypewriterText } from './TypewriterText';

interface IntroSceneProps {
  username: string;
  onFinished: () => void;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ username, onFinished }) => {
  const [step, setStep] = useState(0);

  const lines = [
    `Hello there.\nWelcome to the city.`,
    `This place doesn’t come with instructions.\nNo tutorial.\nNo guide.`,
    `You’ll make choices every day.\nSome you’ll notice.\nSome you won’t.`,
    `Most of them won’t matter right away.\nAt least, it won’t feel like they do.`,
    `A shortcut.\nA delay.\nA habit you keep repeating.`,
    `Those are the ones that tend to stick.`,
    `Later on, they show up.\nIn ways you didn’t plan for.`,
    `There’s no right way to play here.\nNo perfect path.`,
    `Some people rush.\nSome people wait.\nMost people do a bit of both.`,
    `What matters isn’t the move itself.\nIt’s what it leads to.`,
    `You’re free to do whatever you want.`,
    `Just remember—`,
    `Choices don’t disappear.\nThey add up.`,
    `Alright.\nGo see what happens.`
  ];

  const handleNext = () => {
    if (step < lines.length - 1) {
      setStep(step + 1);
    } else {
      onFinished();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black font-mono relative">
       {/* Background pattern: Tiny repeating dots, VERY low opacity */}
       <div 
         className="absolute inset-0 pointer-events-none opacity-5" 
         style={{ 
           backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
           backgroundSize: '4px 4px'
         }}
       />
       
       {/* Character Window (top panel) - Plain, centered sprite, no depth */}
       <div className="z-10 mb-8">
          <div 
            className="w-24 h-24 mx-auto image-pixelated"
            style={{
                backgroundImage: 'url(/assets/sprites/prf.png)',
                backgroundSize: '400% 200%', // 4 cols, 2 rows
                backgroundPosition: '0 0',     // First sprite
                imageRendering: 'pixelated'
            }}
          />
       </div>

       {/* Dialogue Box - Classic Game Boy style */}
       <div className="w-full max-w-xl z-10 px-4" onClick={handleNext}>
         <div className="bg-gray-100 border-4 border-black p-4 relative min-h-[160px]">
           <TypewriterText text={lines[step]} onComplete={() => {}} speed={30} />
           {/* Blinking arrow to indicate more text */}
           <div className="absolute bottom-4 right-4 animate-bounce">▼</div>
         </div>
       </div>
    </div>
  );
};
