import React from 'react';
import { motion } from 'motion/react';
import { Upload, Sparkles, Code } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Upload Your Product',
      description: 'Any image, video, or 3D model. Our AI understands what makes it special.',
      icon: Upload,
      color: '#FF8C00',
    },
    {
      number: '02',
      title: 'AI Builds Personality',
      description: 'Features become conversation topics. Specs become stories. In seconds.',
      icon: Sparkles,
      color: '#D4AF37',
    },
    {
      number: '03',
      title: 'Embed & Sell',
      description: 'One line of code. Your product starts talking on your site instantly.',
      icon: Code,
      color: '#D2691E',
    },
  ];

  return (
    <section className="relative bg-gradient-to-b from-[#36454F] via-[#2A343C] to-[#36454F] py-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
            <span className="text-[#F5F5DC]">Three Steps to </span>
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#FF8C00] via-[#DAA520] to-[#FF8C00] bg-clip-text text-transparent">
                Life
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF8C00] via-[#DAA520] to-[#FF8C00] blur-xl opacity-20" />
            </span>
          </h2>
          <p className="text-[#FFDAB9]/70 text-lg font-light">
            From static product to living personality in minutes
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-full w-full h-px">
                  <div className="w-1/2 h-full bg-gradient-to-r from-[#B8860B]/40 to-transparent" />
                </div>
              )}

              {/* Icon circle */}
              <div className="relative mb-8 flex justify-center">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#B7410E] flex items-center justify-center shadow-xl shadow-[#FF8C00]/20 group-hover:shadow-2xl group-hover:shadow-[#FF8C00]/40 transition-all duration-500 group-hover:scale-110">
                  <div className="w-20 h-20 rounded-full bg-[#2A343C] flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-[#FF8C00]" />
                  </div>
                  
                  {/* Animated ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3],
                      opacity: [0.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                    className="absolute inset-0 rounded-full border-2 border-[#FF8C00]"
                  />
                </div>
                
                {/* Number badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[#36454F] border-2 border-[#B8860B] flex items-center justify-center">
                  <span className="text-[#DAA520] font-bold text-sm">{step.number}</span>
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-[#F5F5DC] text-2xl font-bold mb-3 group-hover:text-[#FF8C00] transition-colors">
                  {step.title}
                </h3>
                <p className="text-[#FFDAB9]/70 leading-relaxed font-light">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}