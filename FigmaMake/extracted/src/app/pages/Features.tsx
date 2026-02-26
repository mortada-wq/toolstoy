import React from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  MessageSquare, 
  Palette, 
  Code, 
  BarChart3, 
  Zap,
  Globe,
  Lock,
  Layers
} from 'lucide-react';
import { Logo } from '../components/Logo';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Characters',
    description: 'Create living, breathing product personalities powered by advanced AI that understands context and emotion.',
    color: '#FF8C00',
  },
  {
    icon: MessageSquare,
    title: 'Natural Conversations',
    description: 'Characters engage in natural, contextual conversations that feel human and build genuine connections.',
    color: '#DAA520',
  },
  {
    icon: Palette,
    title: 'Customizable Appearance',
    description: 'Full control over character design, animation states, and visual style to match your brand perfectly.',
    color: '#B8860B',
  },
  {
    icon: Code,
    title: 'Easy Integration',
    description: 'Embed with a single line of code. Works seamlessly with any website platform or e-commerce solution.',
    color: '#B7410E',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track conversations, satisfaction scores, and customer insights to optimize your character\'s performance.',
    color: '#FF8C00',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant responses powered by optimized AI models. Your customers never have to wait.',
    color: '#DAA520',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Characters can converse in multiple languages, expanding your global reach effortlessly.',
    color: '#B8860B',
  },
  {
    icon: Lock,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, SOC 2 compliance, and data privacy controls for peace of mind.',
    color: '#B7410E',
  },
  {
    icon: Layers,
    title: 'Multiple Layouts',
    description: '7 different widget layouts to fit any design aesthetic, from minimal to immersive.',
    color: '#FF8C00',
  },
];

const stats = [
  { value: '10M+', label: 'Conversations', color: '#FF8C00' },
  { value: '50k+', label: 'Characters Created', color: '#DAA520' },
  { value: '98%', label: 'Customer Satisfaction', color: '#B8860B' },
  { value: '<1s', label: 'Avg Response Time', color: '#B7410E' },
];

export function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#36454F] via-[#2A343C] to-[#36454F]">
      {/* Header */}
      <header className="relative border-b border-[#B8860B]/20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#FFDAB9]/70 hover:text-[#F5F5DC] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <Logo />
          <Link 
            to="/sign-up"
            className="px-6 py-2 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all"
          >
            Get Started
          </Link>
        </div>

        {/* Animated gradient border */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, #FF8C00, #FF7F00, #D4AF37, #D2691E, #CC5500, #B7410E, #FF8C00)',
            backgroundSize: '300% 100%',
            animation: 'gradientFlow 4s ease infinite',
          }}
        />
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-[#F5F5DC] mb-6">
            Everything You Need to <br />
            <span className="bg-gradient-to-r from-[#FF8C00] via-[#DAA520] to-[#B8860B] bg-clip-text text-transparent">
              Bring Products to Life
            </span>
          </h1>
          <p className="text-xl text-[#FFDAB9]/70 max-w-3xl mx-auto">
            Toolstoy combines cutting-edge AI with beautiful design to create product characters that engage, convert, and delight your customers.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6 text-center hover:border-[#DAA520]/50 transition-all"
            >
              {/* Gradient accent */}
              <div 
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                style={{
                  background: `linear-gradient(90deg, ${stat.color}, transparent)`,
                  opacity: 0.5,
                }}
              />
              
              <p className="text-4xl font-bold text-[#FF8C00] mb-2">{stat.value}</p>
              <p className="text-[#FFDAB9]/70 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Gradient Divider */}
        <div 
          className="h-[2px] mb-20"
          style={{
            background: 'linear-gradient(90deg, transparent, #FF8C00, #DAA520, #B8860B, #B7410E, transparent)',
            opacity: 0.3,
          }}
        />

        {/* Features Grid */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#F5F5DC] mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-[#FFDAB9]/70">
              Everything you need to create engaging product experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-6 hover:border-[#DAA520]/50 transition-all group"
                >
                  {/* Gradient accent */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(90deg, ${feature.color}, transparent)`,
                    }}
                  />
                  
                  <div 
                    className="w-12 h-12 rounded-full mb-4 flex items-center justify-center"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  
                  <h3 className="text-[#F5F5DC] font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-[#FFDAB9]/70 text-sm">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Gradient Divider */}
        <div 
          className="h-[2px] mb-20"
          style={{
            background: 'linear-gradient(90deg, transparent, #FF8C00, #DAA520, #B8860B, #B7410E, transparent)',
            opacity: 0.3,
          }}
        />

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[#F5F5DC] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[#FFDAB9]/70 mb-12">
            Create living product characters in three simple steps
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: '01',
                title: 'Upload & Configure',
                description: 'Upload your product image and choose a character type. Our AI analyzes your product automatically.',
                color: '#FF8C00',
              },
              {
                step: '02',
                title: 'Customize Personality',
                description: 'Define voice, tone, and knowledge. Train your character on product details and FAQs.',
                color: '#DAA520',
              },
              {
                step: '03',
                title: 'Deploy & Engage',
                description: 'Embed with one line of code. Your character starts engaging customers immediately.',
                color: '#B8860B',
              },
            ].map((step, index) => (
              <div key={step.step} className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.2 }}
                  className="relative bg-[#2A343C] border border-[#B8860B]/30 rounded-xl p-8 hover:border-[#DAA520]/50 transition-all"
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
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center border-2"
                    style={{ 
                      borderColor: step.color,
                      backgroundColor: `${step.color}20`,
                    }}
                  >
                    <span className="text-2xl font-bold" style={{ color: step.color }}>
                      {step.step}
                    </span>
                  </div>
                  
                  <h3 className="text-[#F5F5DC] font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-[#FFDAB9]/70">{step.description}</p>
                </motion.div>

                {/* Connector line (except last item) */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-[2px] -z-10">
                    <div 
                      className="w-1/2"
                      style={{
                        height: '2px',
                        background: `linear-gradient(90deg, ${step.color}, transparent)`,
                        opacity: 0.3,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-16"
        >
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF8C00] hover:bg-[#B7410E] text-[#F5F5DC] font-semibold rounded-full transition-all text-lg shadow-xl shadow-[#FF8C00]/20"
          >
            <Sparkles className="w-5 h-5" />
            Start Creating Characters
          </Link>
          <p className="text-[#FFDAB9]/60 text-sm mt-4">
            No credit card required • 14-day free trial of Pro features
          </p>
        </motion.div>
      </div>
    </div>
  );
}