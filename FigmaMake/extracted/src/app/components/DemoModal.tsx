import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: string;
}

export function DemoModal({ isOpen, onClose, layout }: DemoModalProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'character', text: 'Hey there! 👋 I\'m your product character. Ask me anything!' },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessages([
        { sender: 'character', text: 'Hey there! 👋 I\'m your product character. Ask me anything!' },
      ]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setMessage('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, 
        { sender: 'character', text: 'I love answering that! In the live version, I\'d have deep product knowledge and personality. Want to know more?' }
      ]);
    }, 1500);
  };

  const CharacterPreview = ({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) => {
    const sizes = {
      small: { orb: 'w-16 h-16', inner: 'w-12 h-12', dot: 'w-3 h-3' },
      medium: { orb: 'w-28 h-28', inner: 'w-20 h-20', dot: 'w-5 h-5' },
      large: { orb: 'w-40 h-40', inner: 'w-32 h-32', dot: 'w-6 h-6' },
    };

    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className={`relative ${sizes[size].orb} rounded-full bg-gradient-to-br from-[#FF8C00] via-[#DAA520] to-[#B7410E] flex items-center justify-center shadow-2xl shadow-[#FF8C00]/40`}
          >
            <div className={`${sizes[size].inner} rounded-full bg-[#1E262E] flex items-center justify-center`}>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`${sizes[size].dot} rounded-full bg-[#FF8C00]`}
              />
            </div>
            
            {/* Breathing glow */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#DAA520] blur-2xl"
            />
          </motion.div>
        </div>
      </div>
    );
  };

  const ChatPanel = ({ height = 'auto', compact = false }: { height?: string; compact?: boolean }) => (
    <div className="flex flex-col h-full" style={{ maxHeight: height }}>
      <div className="flex-1 overflow-y-auto space-y-4 p-6">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-5 py-3 rounded-3xl ${
                  msg.sender === 'user'
                    ? 'bg-[#FF8C00] text-[#36454F] font-medium'
                    : 'bg-[#2A343C] text-[#F5F5DC] border border-[#B8860B]/20'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-[#2A343C] text-[#F5F5DC] px-5 py-3 rounded-3xl border border-[#B8860B]/20">
              <motion.div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 bg-[#FF8C00] rounded-full"
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="p-6 border-t border-[#B8860B]/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 bg-[#2A343C] text-[#F5F5DC] px-6 py-3 rounded-full border border-[#B8860B]/20 focus:outline-none focus:border-[#FF8C00]/40 transition-colors placeholder:text-[#6A6A6A]"
          />
          <button
            onClick={handleSend}
            className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-[#36454F] p-3 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#FF8C00]/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const getLayoutContent = () => {
    switch (layout) {
      case 'Side by Side':
        return (
          <div className="grid grid-cols-5 gap-8 h-full">
            <div className="col-span-2 flex items-center justify-center bg-[#1E262E]/30 rounded-3xl">
              <CharacterPreview size="large" />
            </div>
            <div className="col-span-3">
              <ChatPanel height="100%" />
            </div>
          </div>
        );

      case 'Character Top':
        return (
          <div className="flex flex-col gap-6 h-full">
            <div className="h-72 bg-[#1E262E]/30 rounded-3xl">
              <CharacterPreview size="large" />
            </div>
            <div className="flex-1">
              <ChatPanel />
            </div>
          </div>
        );

      case 'Chat Focus':
        return (
          <div className="grid grid-cols-6 gap-6 h-full">
            <div className="col-span-1 flex items-center justify-center bg-[#1E262E]/30 rounded-3xl">
              <CharacterPreview size="medium" />
            </div>
            <div className="col-span-5">
              <ChatPanel height="100%" />
            </div>
          </div>
        );

      case 'Mirror':
        return (
          <div className="grid grid-cols-5 gap-8 h-full">
            <div className="col-span-3">
              <ChatPanel height="100%" />
            </div>
            <div className="col-span-2 flex items-center justify-center bg-[#1E262E]/30 rounded-3xl">
              <CharacterPreview size="large" />
            </div>
          </div>
        );

      case 'Immersive':
        return (
          <div className="relative h-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E262E] to-[#2A343C]">
            <div className="absolute inset-0 flex items-center justify-center">
              <CharacterPreview size="large" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="bg-[#36454F]/95 backdrop-blur-xl rounded-3xl border border-[#B8860B]/20 shadow-2xl">
                <ChatPanel compact />
              </div>
            </div>
          </div>
        );

      case 'Compact':
        return (
          <div className="flex flex-col gap-6 h-full max-w-lg mx-auto">
            <div className="h-56 bg-[#1E262E]/30 rounded-3xl">
              <CharacterPreview size="medium" />
            </div>
            <ChatPanel />
          </div>
        );

      case 'Cinematic':
        return (
          <div className="relative h-full rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E262E] via-[#2A343C] to-[#1E262E]" />
            <div className="relative z-10 grid grid-cols-7 gap-8 h-full p-8">
              <div className="col-span-4 flex items-center justify-center">
                <CharacterPreview size="large" />
              </div>
              <div className="col-span-3 flex items-center">
                <div className="w-full h-[90%]">
                  <ChatPanel height="100%" />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <CharacterPreview size="large" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#36454F] rounded-3xl w-full max-w-6xl shadow-2xl border border-[#B8860B]/20"
          style={{ maxHeight: '90vh', height: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-[#B8860B]/10">
            <div>
              <h2 className="text-[#F5F5DC] text-2xl font-bold">{layout}</h2>
              <p className="text-[#FFDAB9]/60 text-sm mt-1 font-light">Try chatting with this living character</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#F5F5DC] hover:text-[#FF8C00] p-2 hover:bg-[#2A343C] rounded-full transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Layout Content */}
          <div className="p-8 overflow-auto" style={{ height: 'calc(100% - 100px)' }}>
            {getLayoutContent()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
