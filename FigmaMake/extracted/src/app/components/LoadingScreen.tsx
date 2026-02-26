import React from 'react';
import toolstoyLogo from 'figma:asset/8f32f6214b3f07ba3fc963db66909f4448057ccd.png';

interface LoadingScreenProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <div 
      className={`fixed inset-0 bg-[#36454F] z-50 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className={`transition-all duration-700 ease-in-out ${
        isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
      }`}>
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 blur-2xl opacity-30 animate-pulse">
            <img 
              src={toolstoyLogo} 
              alt="" 
              className="h-[82px]"
              style={{ 
                objectFit: 'contain',
                objectPosition: 'center',
                width: 'auto',
                height: '82px'
              }}
            />
          </div>
          
          {/* Main logo - 1.7x bigger */}
          <img 
            src={toolstoyLogo} 
            alt="Toolstoy" 
            className="h-[82px] relative animate-breathe"
            style={{ 
              objectFit: 'contain',
              objectPosition: 'center',
              width: 'auto',
              height: '82px'
            }}
          />
        </div>
      </div>
    </div>
  );
}