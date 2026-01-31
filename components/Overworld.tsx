import React from 'react';
import { UserProfile } from '../types';
import { clearSession } from '../services/storage';

interface OverworldProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Overworld: React.FC<OverworldProps> = ({ user, onLogout }) => {
  const handleLogout = () => {
    clearSession();
    onLogout();
  };

  return (
    <div className="flex flex-col min-h-screen bg-green-800 text-white relative overflow-hidden">
        {/* Simple map visualisation */}
        <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 31px, #ffffff 31px, #ffffff 32px), repeating-linear-gradient(90deg, transparent, transparent 31px, #ffffff 31px, #ffffff 32px)',
            backgroundSize: '32px 32px' 
        }}></div>

        <div className="z-10 bg-white text-black p-4 border-b-4 border-gray-700 flex justify-between items-center shadow-lg">
            <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                    {/* Character avatar based on ID would go here */}
                    <div className="w-full h-full bg-blue-500"></div>
                </div>
                <div>
                    <h3 className="font-bold">{user.username}</h3>
                    <div className="text-xs text-gray-500">📍 {user.gameState.location}</div>
                </div>
            </div>
            
            <div className="flex gap-2">
                 <div className="bg-gray-100 px-3 py-1 rounded border-2 border-gray-300 flex items-center gap-2">
                    <span className="text-xs font-bold">MONEY</span>
                    <span className="font-mono">$3000</span>
                 </div>
                 <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 text-xs font-bold border-b-4 border-red-700 active:border-b-0 active:mt-1 hover:bg-red-600 rounded">
                     LOGOUT
                 </button>
            </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 z-10">
            <div className="bg-white text-black p-6 rounded-lg border-4 border-black max-w-md w-full shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]">
                <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">CURRENT PARTY</h2>
                <div className="flex flex-col gap-2">
                    {user.gameState.party.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-200 hover:bg-blue-50 cursor-pointer">
                            <img src={p.sprite} className="w-10 h-10 bg-gray-200 rounded-full" alt={p.name} />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-sm">{p.name}</span>
                                    <span className="text-xs bg-gray-200 px-1 rounded">Lv.{p.level}</span>
                                </div>
                                <div className="w-full bg-gray-300 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-green-500 h-full" 
                                        style={{ width: `${(p.hp.current / p.hp.max) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] text-right mt-0.5 text-gray-500">
                                    {p.hp.current}/{p.hp.max} HP
                                </div>
                            </div>
                        </div>
                    ))}
                    {user.gameState.party.length === 0 && (
                        <div className="text-center py-6 text-gray-400 italic">No Pokémon yet...</div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
