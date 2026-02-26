import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative bg-[#36454F] py-32 overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#B8860B]/40 to-transparent" />
      
      {/* Ambient glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF8C00] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 
            className="mb-6 tracking-tight"
            style={{ 
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
              fontWeight: 800, 
              lineHeight: 1.1 
            }}
          >
            <span className="text-[#F5F5DC]">Stop Selling in </span>
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#FF8C00] via-[#DAA520] to-[#FF8C00] bg-clip-text text-transparent">
                Silence
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C00] via-[#DAA520] to-[#FF8C00] blur-xl opacity-20" />
            </span>
          </h2>
          <p className="text-[#FFDAB9]/70 text-xl md:text-2xl mb-12 font-light max-w-2xl mx-auto">
            Give your products a voice. Watch them come alive.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-[#36454F] px-12 py-5 rounded-full transition-all font-bold text-lg shadow-2xl shadow-[#FF8C00]/40 hover:shadow-[#FF8C00]/60"
          >
            Start Free — No Credit Card
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            
            {/* Animated glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute inset-0 rounded-full bg-[#FF8C00] blur-xl -z-10"
            />
          </motion.button>

          <p className="text-[#FFDAB9]/50 text-sm mt-8 font-light">
            Join 10,000+ brands making their products talk
          </p>
        </motion.div>
      </div>
    </section>
  );
}