// Since we don't have the original code for these components, I will create them based on the imports in App.tsx and typical functionality.
// This is an "shim" implementation to make the app compile and run based on the user's intent to replace everything.

import React from "react";
import { CHARACTERS } from "../constants";
import { CharacterId } from "../types";

interface CharacterSelectProps {
  onSelected: (id: CharacterId) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  onSelected,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-2xl mb-8 font-bold press-start">CHOOSE YOUR LOOK</h2>
      <div className="flex gap-8">
        {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => (
          <div
            key={id}
            className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onSelected(id)}
          >
            <div className="w-32 h-32 bg-gray-800 border-4 border-white rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              {/* In a real app we'd use the sprite sheet, here we use the image URL */}
              <img
                src={CHARACTERS[id].spriteSheet}
                alt={CHARACTERS[id].name}
                className="w-full h-full object-cover"
              />
            </div>
            <span style={{ color: CHARACTERS[id].color }} className="font-bold">
              {CHARACTERS[id].name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
