import React, { useEffect, useState } from 'react';
import { Sparkles, Play } from 'lucide-react';

interface HeroProps {
  onDemoClick: () => void;
}

export function Hero({ onDemoClick }: HeroProps) {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#36454F] pt-24">
      {/* Ambient background glow */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#FF7F00] rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#D4AF37] rounded-full blur-[180px]" />
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-[#D2691E] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#2A343C]/60 backdrop-blur-sm border border-[#B8860B]/30 px-5 py-2 rounded-full mb-8 group hover:border-[#FF8C00]/50 transition-all">
          <Sparkles className="w-4 h-4 text-[#FF8C00]" />
          <span className="text-[#FFDAB9] text-sm">AI-Powered Living Characters</span>
        </div>

        {/* Main Headline */}
        <h1 
          className="text-[#F5F5DC] mb-8 tracking-tight"
          style={{ 
            fontSize: 'clamp(3rem, 8vw, 7rem)', 
            fontWeight: 800, 
            lineHeight: 0.95,
            letterSpacing: '-0.02em'
          }}
        >
          Products That
          <br />
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-[#FF8C00] via-[#DAA520] to-[#FF8C00] bg-clip-text text-transparent">
              Talk Back
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C00] via-[#DAA520] to-[#FF8C00] blur-2xl opacity-20" />
          </span>
        </h1>

        <p className="text-[#FFDAB9]/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          Transform any product into an animated character with personality.
          <br />
          They listen. They respond. They sell.
        </p>

        {/* Living Character Preview - Centered */}
        <div className="mb-16 flex justify-center">
          <div className="relative group cursor-pointer" onClick={onDemoClick}>
            {/* Pulsing rings */}
            <div 
              className={`absolute inset-0 rounded-full border-2 border-[#FF8C00] transition-all duration-1000 ${
                pulse === 0 ? 'scale-100 opacity-100' : 'scale-150 opacity-0'
              }`}
            />
            <div 
              className={`absolute inset-0 rounded-full border-2 border-[#DAA520] transition-all duration-1000 delay-300 ${
                pulse === 1 ? 'scale-100 opacity-100' : 'scale-150 opacity-0'
              }`}
            />
            
            {/* Character orb */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#FF8C00] via-[#DAA520] to-[#B7410E] flex items-center justify-center shadow-2xl shadow-[#FF8C00]/40 group-hover:scale-110 transition-all duration-500">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#2A343C] flex items-center justify-center">
                <Play className="w-10 h-10 md:w-12 md:h-12 text-[#F5F5DC] fill-current" />
              </div>
              
              {/* Breathing glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#DAA520] animate-pulse opacity-50 blur-xl" />
            </div>
            
            <p className="text-[#FFDAB9] text-sm mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to see a character
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="group relative bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-[#36454F] px-10 py-4 rounded-full transition-all font-semibold shadow-lg shadow-[#FF8C00]/30 hover:shadow-xl hover:shadow-[#FF8C00]/40 hover:scale-105 overflow-hidden">
            <span className="relative z-10 flex items-center">
              Create Your Character
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </span>
            
            {/* Breathing radial glow */}
            <div 
              className="absolute inset-0 rounded-full opacity-60"
              style={{
                background: 'radial-gradient(circle at center, rgba(255, 140, 0, 0.4) 0%, transparent 70%)',
                animation: 'breathe 2s ease-in-out infinite',
              }}
            />
          </button>
          <button
            onClick={onDemoClick}
            className="text-[#F5F5DC] hover:text-[#FF8C00] transition-colors flex items-center gap-2 font-medium px-6 py-4"
          >
            <Play className="w-4 h-4" />
            Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-[#FF8C00] text-3xl md:text-4xl font-bold mb-2">100+</div>
            <div className="text-[#FFDAB9]/60 text-sm">Character Styles</div>
          </div>
          <div className="text-center border-x border-[#B8860B]/20">
            <div className="text-[#DAA520] text-3xl md:text-4xl font-bold mb-2">7</div>
            <div className="text-[#FFDAB9]/60 text-sm">Layout Modes</div>
          </div>
          <div className="text-center">
            <div className="text-[#B8860B] text-3xl md:text-4xl font-bold mb-2">∞</div>
            <div className="text-[#FFDAB9]/60 text-sm">Conversations</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-[#B8860B]/40 rounded-full flex justify-center p-2">
          <div className="w-1 h-2 bg-[#FF8C00] rounded-full" />
        </div>
      </div>
    </section>
  );
}