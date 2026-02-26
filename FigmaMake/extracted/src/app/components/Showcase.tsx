import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ShowcaseCardProps {
  layout: string;
  characterName: string;
  productType: string;
  span?: boolean;
  onClick: () => void;
  index: number;
}

function ShowcaseCard({ layout, characterName, productType, span = false, onClick, index }: ShowcaseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-[#2A343C]/40 backdrop-blur-sm border border-[#B8860B]/20 rounded-3xl p-8 cursor-pointer hover:border-[#FF8C00]/40 hover:-translate-y-1 transition-all duration-500 overflow-hidden ${
        span ? 'md:col-span-2' : ''
      }`}
      style={{
        boxShadow: isHovered ? '0 0 30px rgba(255, 140, 0, 0.15)' : 'none',
      }}
    >
      {/* Orange bottom border accent on hover */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF8C00] via-[#DAA520] to-[#FF8C00] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />
      
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C00]/0 via-[#FF8C00]/0 to-[#FF8C00]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Layout Badge */}
      <div className="relative z-10 text-[#FFDAB9]/60 text-sm mb-6">
        {layout}
      </div>

      {/* Character Preview Area with animated orb */}
      <div 
        className="relative bg-gradient-to-br from-[#4A5057]/50 via-[#3C444A]/50 to-[#36454F]/50 backdrop-blur-sm rounded-2xl mb-6 flex items-center justify-center border border-[#B8860B]/10 group-hover:border-[#D4AF37]/30 transition-all duration-500 overflow-hidden" 
        style={{ height: span ? '320px' : '240px' }}
      >
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7F00]/10 via-[#D2691E]/5 to-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Character orb */}
        <div className="relative">
          <motion.div
            animate={isHovered ? {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            } : {}}
            transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#FF8C00] via-[#D2691E] to-[#CC5500] flex items-center justify-center shadow-xl shadow-[#FF8C00]/30"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3C444A] to-[#4A5057] flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#D4AF37]" />
            </div>
            
            {/* Pulsing ring */}
            <motion.div
              animate={isHovered ? {
                scale: [1, 1.8],
                opacity: [0.5, 0],
              } : {}}
              transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
              className="absolute inset-0 rounded-full border-2 border-[#D4AF37]"
            />
          </motion.div>
          
          <p className="text-[#778899] text-sm mt-4 text-center group-hover:text-[#FFE4B5] transition-colors">
            Living Character
          </p>
        </div>
      </div>

      {/* Card Info */}
      <div className="relative z-10">
        <h3 className="text-[#FFF8DC] font-semibold text-xl mb-1.5 group-hover:text-[#FF8C00] transition-colors">
          {characterName}
        </h3>
        <p className="text-[#D2B48C]/70 text-sm font-light">{productType}</p>
      </div>

      {/* Hover arrow */}
      <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <div className="text-[#FF8C00] text-2xl">→</div>
      </div>
    </motion.div>
  );
}

interface ShowcaseProps {
  onCardClick: (layout: string) => void;
}

export function Showcase({ onCardClick }: ShowcaseProps) {
  const cards = [
    { layout: 'Side by Side', characterName: 'Luna', productType: 'Smart Home Lighting', span: false },
    { layout: 'Character Top', characterName: 'Brew', productType: 'Coffee Machine', span: false },
    { layout: 'Chat Focus', characterName: 'Fit', productType: 'Fitness Tracker', span: false },
    { layout: 'Mirror', characterName: 'Echo', productType: 'Smart Speaker', span: false },
    { layout: 'Immersive', characterName: 'Nova', productType: 'GPS Device', span: true },
    { layout: 'Compact', characterName: 'Snap', productType: 'Action Camera', span: false },
    { layout: 'Cinematic', characterName: 'Aura', productType: 'Home Theater', span: true },
  ];

  return (
    <section id="showcase" className="relative bg-[#36454F] py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B8860B]/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-[#2A343C]/60 backdrop-blur-sm border border-[#B8860B]/30 px-5 py-2 rounded-full mb-8"
          >
            <span className="text-[#DAA520] text-sm font-medium tracking-wider">7 UNIQUE LAYOUTS</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            <span className="text-[#F5F5DC]">See Them </span>
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#FF8C00] via-[#DAA520] to-[#FF8C00] bg-clip-text text-transparent">
                Alive
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C00] via-[#DAA520] to-[#FF8C00] blur-xl opacity-20" />
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-[#FFDAB9]/70 text-lg font-light max-w-2xl mx-auto"
          >
            Click any character to start a real conversation. Each one has personality.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <ShowcaseCard
              key={index}
              layout={card.layout}
              characterName={card.characterName}
              productType={card.productType}
              span={card.span}
              onClick={() => onCardClick(card.layout)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}