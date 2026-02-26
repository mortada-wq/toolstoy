import React from 'react';
import toolstoyLogo from 'figma:asset/8f32f6214b3f07ba3fc963db66909f4448057ccd.png';

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

export function Logo({ variant = 'full', className = '' }: LogoProps) {
  return (
    <div className={className}>
      <img 
        src={toolstoyLogo} 
        alt="Toolstoy" 
        className="h-12"
        style={{ 
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}