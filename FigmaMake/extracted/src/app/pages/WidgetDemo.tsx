import React from 'react';
import { motion } from 'motion/react';
import { CharacterWidget } from '../components/CharacterWidget';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export function WidgetDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#36454F] via-[#2A343C] to-[#36454F]">
      {/* Simple Header */}
      <header className="p-6">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-[#FFDAB9]/70 hover:text-[#F5F5DC] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-[#F5F5DC] mb-4">
            Character Widget Demo
          </h1>
          <p className="text-[#FFDAB9]/70 text-xl">
            Experience a living product character in action
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Widget Container */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              {/* Gradient stroke border around widget area */}
              <div 
                className="absolute -inset-4 rounded-[40px] opacity-30"
                style={{
                  background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B, #B7410E)',
                  filter: 'blur(20px)',
                }}
              />
              
              <CharacterWidget 
                characterName="Nike Air Max Guide"
                characterImage="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
                showControls={true}
                showSpecialDock={true}
              />
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-[#F5F5DC] mb-6">
              See It In Action
            </h2>

            {[
              {
                title: 'Animated Character States',
                description: 'Watch as the character transitions between idle, thinking, and talking states',
                color: '#FF8C00',
              },
              {
                title: 'Natural Conversations',
                description: 'Ask questions and get instant, contextual responses about the product',
                color: '#DAA520',
              },
              {
                title: 'Interactive Controls',
                description: 'Adjust volume, position, and view settings on the fly',
                color: '#B8860B',
              },
              {
                title: 'Special Capabilities',
                description: 'Rotate 3D views, show images, and play product videos',
                color: '#B7410E',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="relative bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6 hover:border-[#DAA520]/50 transition-all"
              >
                {/* Gradient accent */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                  style={{
                    background: `linear-gradient(90deg, ${feature.color}, transparent)`,
                    opacity: 0.5,
                  }}
                />
                
                <h3 className="text-[#F5F5DC] font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-[#FFDAB9]/70">{feature.description}</p>
              </motion.div>
            ))}

            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all"
            >
              Create Your Own Character
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
