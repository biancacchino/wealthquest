import React, { useState } from 'react';
import { CHARACTERS } from '../constants';
import { CharacterId } from '../types';

interface CharacterSelectProps {
  onSelected: (id: CharacterId) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelected }) => {
  const [selected, setSelected] = useState<CharacterId | null>(null);

  const handleConfirm = () => {
    if (selected) {
      onSelected(selected);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4" style={{ backgroundColor: '#7eb8d8' }}>
      {/* Main Panel - Pixel style */}
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
          <span className="text-white font-bold text-sm tracking-wide">Character Select</span>
          <button 
            className="px-3 py-1 text-xs font-bold"
            style={{ 
              backgroundColor: '#d86040',
              color: 'white',
              borderRadius: '4px',
              border: '2px solid #b84830'
            }}
          >
            Exit
          </button>
        </div>

        {/* Inner Content Panel */}
        <div 
          className="p-4"
          style={{ 
            backgroundColor: '#fffef8',
            border: '4px solid #c8d8e8',
            borderRadius: '4px',
            boxShadow: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #b8c8d8'
          }}
        >
          
          {/* Character Grid */}
          <div className="flex gap-4 justify-center mb-4">
            {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => (
              <div 
                key={id}
                className="flex flex-col items-center cursor-pointer p-3"
                style={{ 
                  backgroundColor: selected === id ? '#fff8d0' : '#f0f8ff',
                  border: `4px solid ${selected === id ? '#e0a820' : '#a8c8e0'}`,
                  borderRadius: '4px',
                  boxShadow: selected === id 
                    ? 'inset 2px 2px 0 #fffae0, inset -2px -2px 0 #c89818'
                    : 'inset 2px 2px 0 #fff, inset -2px -2px 0 #90b0c8'
                }}
                onClick={() => setSelected(id)}
              >
                {/* Character Portrait */}
                <div 
                  className="w-24 h-24 mb-2 flex items-center justify-center"
                  style={{ 
                    backgroundColor: '#d8e8f0',
                    border: '3px solid #a0b8c8',
                    borderRadius: '2px'
                  }}
                >
                  <img 
                    src={CHARACTERS[id].spriteSheet} 
                    alt={CHARACTERS[id].name} 
                    className="w-16 h-16 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                
                {/* Name */}
                <span className="font-bold text-gray-700 text-sm">{CHARACTERS[id].name}</span>
                
                {selected === id && (
                  <span className="text-xs font-bold mt-1" style={{ color: '#d89010' }}>★ SELECTED</span>
                )}
              </div>
            ))}
          </div>

          {/* Info Panel */}
          {selected && (
            <div 
              className="p-3"
              style={{ 
                backgroundColor: '#fffce0',
                border: '3px solid #e8d898',
                borderRadius: '2px'
              }}
            >
              <p className="text-sm text-gray-700">
                <span className="font-bold" style={{ color: CHARACTERS[selected].color }}>{CHARACTERS[selected].name}</span> is ready!
              </p>
            </div>
          )}
        </div>

        {/* Dialog Box */}
        <div 
          className="mt-2 py-3 px-6 text-center"
          style={{ 
            backgroundColor: '#4888b0',
            borderRadius: '20px',
            border: '3px solid #3070a0',
            boxShadow: 'inset 0 2px 0 #68a8d0, inset 0 -2px 0 #285888'
          }}
        >
          <p className="text-white font-bold text-sm">
            {selected ? `Play as ${CHARACTERS[selected].name}?` : 'Choose your character!'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-2 mt-2">
          <button 
            onClick={handleConfirm}
            disabled={!selected}
            className={`px-6 py-2 font-bold text-sm ${!selected ? 'opacity-50' : 'active:translate-y-0.5'}`}
            style={{ 
              backgroundColor: selected ? '#f8f8f0' : '#e0e0d8',
              color: selected ? '#444' : '#888',
              border: '3px solid #c0c0b0',
              borderRadius: '4px',
              boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 #a0a090, 0 2px 0 #909080'
            }}
          >
            OK
          </button>
          <button 
            className="px-5 py-2 font-bold text-sm text-gray-600 active:translate-y-0.5"
            style={{ 
              backgroundColor: '#f8f8f0',
              border: '3px solid #c0c0b0',
              borderRadius: '4px',
              boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 #a0a090, 0 2px 0 #909080'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
