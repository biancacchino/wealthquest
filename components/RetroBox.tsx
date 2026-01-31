import React from 'react';

interface RetroBoxProps {
  title?: string;
  children: React.ReactNode;
  className?: string; // Allow passing external classes
}

export const RetroBox: React.FC<RetroBoxProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white border-4 border-black p-1 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] ${className}`}>
      <div className="border-2 border-black p-4 h-full relative">
        {title && (
            <div className="absolute -top-4 left-4 bg-white px-2 border-2 border-black text-xs font-bold uppercase tracking-wider">
                {title}
            </div>
        )}
        
        {/* Simple Corner Decorations */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-black"></div>
        <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-black"></div>
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-black"></div>
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-black"></div>

        {children}
      </div>
    </div>
  );
};
