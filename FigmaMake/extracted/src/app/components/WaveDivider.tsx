import React from 'react';

interface WaveDividerProps {
  color?: string;
  flip?: boolean;
}

export function WaveDivider({ color = '#2A343C', flip = false }: WaveDividerProps) {
  return (
    <div className={`relative w-full overflow-hidden ${flip ? 'rotate-180' : ''}`} style={{ height: '80px' }}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="absolute bottom-0 w-full h-full"
      >
        <path
          d="M0,0 C150,60 350,0 600,40 C850,80 1050,20 1200,60 L1200,120 L0,120 Z"
          style={{ fill: color }}
        />
      </svg>
    </div>
  );
}
