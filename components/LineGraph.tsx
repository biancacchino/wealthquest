import React, { useId } from 'react';

interface LineGraphProps {
    data: number[];
    color: string;
    width?: number;
    height?: number;
    className?: string;
}

export const LineGraph: React.FC<LineGraphProps> = ({ 
    data, 
    color, 
    width = 200, 
    height = 100,
    className
}) => {
    const uniqueId = useId();
    if (!data || data.length < 2) return <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">Wait for data...</div>;

    const max = Math.max(...data);
    const min = Math.min(...data);
    // Add some padding to the range so the line isn't hugging the edge
    const range = (max - min) * 1.2 || 1; 
    const padding = (max - min) * 0.1;
    const adjustedMin = min - padding;
    
    // Normalize to viewbox 0,0 to width,height
    // Y needs to be inverted (SVG 0 is top)
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const normalizedY = (val - adjustedMin) / range; 
        const y = height - (normalizedY * height); // Invert
        return `${x},${y}`;
    }).join(' ');

    const gradientId = `grad-${uniqueId}`;

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
             {/* Gradient fill */}
            <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
                    <stop offset="100%" stopColor={color} stopOpacity="0"/>
                </linearGradient>
            </defs>
            
            {/* Area under line */}
            <path 
                d={`M 0,${height} ${points} L ${width},${height} Z`} 
                fill={`url(#${gradientId})`} 
                stroke="none"
            />
            
            {/* The Line */}
            <path 
                d={`M ${points}`} 
                fill="none" 
                stroke={color} 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round" 
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};
