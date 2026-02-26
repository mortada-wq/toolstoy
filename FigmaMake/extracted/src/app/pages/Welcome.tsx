import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Sparkles, Zap, Rocket } from 'lucide-react';

export function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#36454F] via-[#2A343C] to-[#36454F] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full text-center"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#B7410E] flex items-center justify-center"
        >
          <Sparkles className="w-12 h-12 text-[#F5F5DC]" />
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-bold text-[#F5F5DC] mb-4">
          Welcome to <span className="text-[#FF8C00]">Toolstoy</span>
        </h1>
        
        <p className="text-xl text-[#FFDAB9]/70 mb-12 max-w-2xl mx-auto">
          Turn your products into living, breathing characters that connect with customers in ways you never imagined.
        </p>

        {/* Gradient Divider */}
        <div 
          className="h-[2px] mb-12 max-w-md mx-auto"
          style={{
            background: 'linear-gradient(90deg, transparent, #FF8C00, #DAA520, #B8860B, #B7410E, transparent)',
            opacity: 0.5,
          }}
        />

        {/* Quick Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Sparkles,
              title: 'Create',
              description: 'Upload your product and choose a personality',
              color: '#FF8C00',
            },
            {
              icon: Zap,
              title: 'Customize',
              description: 'Fine-tune voice, knowledge, and appearance',
              color: '#DAA520',
            },
            {
              icon: Rocket,
              title: 'Deploy',
              description: 'Embed your living character on your site',
              color: '#B8860B',
            },
          ].map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6 hover:border-[#DAA520]/50 transition-all"
              >
                {/* Gradient accent */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                  style={{
                    background: `linear-gradient(90deg, ${step.color}, transparent)`,
                    opacity: 0.5,
                  }}
                />
                
                <div 
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: step.color }} />
                </div>
                
                <h3 className="text-[#F5F5DC] font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-[#FFDAB9]/70 text-sm">{step.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/dashboard/characters/new"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all text-lg shadow-xl shadow-[#FF8C00]/20"
          >
            <Sparkles className="w-5 h-5" />
            Create Your First Character
          </Link>
          
          <p className="text-[#FFDAB9]/60 text-sm mt-4">
            No credit card required • Free forever plan available
          </p>
        </motion.div>

        {/* Skip Option */}
        <div className="mt-12">
          <Link
            to="/dashboard"
            className="text-[#FFDAB9]/70 hover:text-[#F5F5DC] transition-colors text-sm"
          >
            Skip for now →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
