import React from 'react';
import { motion } from 'motion/react';

export function WorksAnywhere() {
  const platforms = [
    { name: 'Wix', color: '#FF8C00' },
    { name: 'Squarespace', color: '#DAA520' },
    { name: 'WordPress', color: '#B8860B' },
    { name: 'Webflow', color: '#FF8C00' },
    { name: 'Shopify', color: '#DAA520' },
    { name: 'Custom HTML', color: '#B7410E' },
  ];

  return (
    <section className="relative bg-[#36454F] py-24 overflow-hidden">
      {/* Top border gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B8860B]/40 to-transparent" />
      
      <div className="max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-[#2A343C]/60 backdrop-blur-sm border border-[#B8860B]/30 px-6 py-3 rounded-full mb-12"
        >
          <div className="w-2 h-2 rounded-full bg-[#FF8C00] animate-pulse" />
          <span className="text-[#DAA520] text-sm font-medium tracking-wider">UNIVERSAL COMPATIBILITY</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
        >
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1, y: -5 }}
              className="group cursor-pointer"
            >
              <span 
                className="text-[#F5F5DC]/50 text-lg md:text-2xl font-semibold group-hover:text-[#F5F5DC] transition-all duration-300"
                style={{
                  textShadow: '0 0 20px transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textShadow = `0 0 20px ${platform.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textShadow = '0 0 20px transparent';
                }}
              >
                {platform.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-[#FFDAB9]/60 text-sm mt-12 font-light"
        >
          Embed anywhere. Works everywhere.
        </motion.p>
      </div>

      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B8860B]/40 to-transparent" />
    </section>
  );
}
