import React, { useEffect } from 'react';
import { useRetroAudio } from '../hooks/useRetroAudio';

export const BeachPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { startBackgroundMusic } = useRetroAudio();

    useEffect(() => {
        // Optional: Play different ambient sounds for beach?
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-[#87CEEB] flex flex-col items-center justify-center font-[family-name:var(--font-press-start-2p)]">
            <div className="relative w-full h-64 bg-[#1E90FF] overflow-hidden mb-8 border-y-8 border-[#4682B4]">
                {/* Simple CSS Waves Animation */}
                <div className="absolute inset-0 opacity-30 animate-pulse bg-white/10" style={{ transform: "scaleY(1.5)" }}></div>
                <div className="absolute bottom-4 left-1/4 w-8 h-8 bg-orange-300 rounded-full animate-bounce"></div> {/* Swimmer head */}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#F4A460]"></div> {/* Sand */}
            </div>
            
            <h2 className="text-2xl text-white mb-4" style={{ textShadow: "2px 2px #000" }}>RELAXING...</h2>
            <p className="text-white text-sm mb-8 animate-pulse">Just swimming. No spending.</p>

            <button 
                onClick={onClose}
                className="px-6 py-3 bg-red-500 hover:bg-red-400 text-white rounded border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
            >
                LEAVE BEACH
            </button>
        </div>
    );
};
