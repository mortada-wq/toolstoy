import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Volume2, Minimize2, X, Maximize2, RotateCw, Image as ImageIcon, Play } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'character';
  timestamp: Date;
}

interface CharacterWidgetProps {
  characterName?: string;
  characterImage?: string;
  layout?: 'side-by-side' | 'character-top' | 'chat-focus';
  isMinimized?: boolean;
  onMinimize?: () => void;
  onClose?: () => void;
  showControls?: boolean;
  showSpecialDock?: boolean;
}

export function CharacterWidget({
  characterName = 'Nike Air Max Guide',
  characterImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  layout = 'character-top',
  isMinimized = false,
  onMinimize,
  onClose,
  showControls = true,
  showSpecialDock = false,
}: CharacterWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hey there! Ready to step up your sneaker game?', sender: 'character', timestamp: new Date() },
    { id: 2, text: "I'm looking for comfortable running shoes", sender: 'user', timestamp: new Date() },
    { id: 3, text: "Perfect! The Air Max 97 offers incredible cushioning with Air Max technology. What's your size?", sender: 'character', timestamp: new Date() },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'thinking' | 'talking'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate character typing
    setIsTyping(true);
    setAnimationState('thinking');
    
    setTimeout(() => {
      setIsTyping(false);
      setAnimationState('talking');
      
      const characterMessage: Message = {
        id: Date.now() + 1,
        text: "Great question! Let me help you with that. The Air Max 97 runs true to size, but if you prefer a roomier fit, go half a size up.",
        sender: 'character',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, characterMessage]);
      
      setTimeout(() => setAnimationState('idle'), 2000);
    }, 2000);
  };

  if (isMinimized) {
    return <MinimizedWidget characterName={characterName} lastMessage={messages[messages.length - 1]} />;
  }

  return (
    <div className="relative w-[480px] h-[640px] bg-[#F5F5DC] rounded-[32px] shadow-2xl overflow-hidden">
      {/* Animated gradient stroke border */}
      <div 
        className="absolute inset-0 rounded-[32px] pointer-events-none"
        style={{
          padding: '2px',
          background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B, #B7410E, #FF8C00)',
          backgroundSize: '300% 100%',
          animation: 'gradientFlow 4s ease infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Controls (top-right, appear on hover) */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute top-4 right-4 flex gap-2 z-20"
        >
          <ControlButton icon={Volume2} label="Voice" />
          <ControlButton icon={Maximize2} label="Position" />
          {onMinimize && <ControlButton icon={Minimize2} label="Minimize" onClick={onMinimize} />}
          {onClose && <ControlButton icon={X} label="Close" onClick={onClose} />}
        </motion.div>
      )}

      {/* Character Area (60%) */}
      <div className="relative h-[60%] overflow-hidden rounded-t-[32px]">
        {/* Radial gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(218, 165, 32, 0.05) 0%, transparent 70%)',
          }}
        />
        
        {/* Character Image/Video */}
        <div className="relative h-full flex items-center justify-center p-8">
          <motion.div
            animate={{
              scale: animationState === 'talking' ? [1, 1.02, 1] : animationState === 'thinking' ? [1, 0.98, 1] : 1,
            }}
            transition={{ duration: 1, repeat: animationState !== 'idle' ? Infinity : 0 }}
            className="relative w-full h-full rounded-2xl overflow-hidden"
          >
            <img 
              src={characterImage} 
              alt={characterName}
              className="w-full h-full object-cover"
            />
            
            {/* Animation state indicator */}
            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1 bg-[#36454F]/80 backdrop-blur-sm text-[#F5F5DC] text-xs rounded-full border border-[#B8860B]/30">
                {animationState === 'idle' && '✨ Idle'}
                {animationState === 'thinking' && '🤔 Thinking'}
                {animationState === 'talking' && '💬 Talking'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Character name badge */}
        <div className="absolute top-4 left-4">
          <div className="px-4 py-2 bg-[#F5F5DC] rounded-full border border-[#B8860B]/30 shadow-lg">
            <p className="text-[#36454F] font-semibold text-sm">{characterName}</p>
          </div>
        </div>
      </div>

      {/* Chat Area (40%) */}
      <div className="h-[40%] flex flex-col bg-[#F5F5DC]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {/* Typing Indicator */}
          {isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#B8860B]/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 bg-white border border-[#B8860B]/30 rounded-full text-[#36454F] placeholder:text-[#6A6A6A] focus:border-[#FF8C00] focus:outline-none transition-colors text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-12 h-12 rounded-full bg-[#FF8C00] hover:bg-[#B7410E] disabled:bg-[#6A6A6A] disabled:cursor-not-allowed text-[#F5F5DC] flex items-center justify-center transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Special Dock (optional) */}
      {showSpecialDock && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-2 bg-[#F5F5DC]/95 backdrop-blur-sm rounded-full p-2 border border-[#B8860B]/30 shadow-lg"
          >
            <DockButton icon={RotateCw} label="Rotate 3D" />
            <DockButton icon={ImageIcon} label="Show Image" />
            <DockButton icon={Play} label="Play Video" />
            
            {/* Gradient stroke accent */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                padding: '1px',
                background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
          isUser
            ? 'bg-[#36454F] text-[#F5F5DC]'
            : 'bg-white border border-[#B8860B]/30 text-[#36454F]'
        }`}
      >
        {message.text}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-[#B8860B]/30 rounded-2xl px-4 py-3 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full bg-[#DAA520]"
          />
        ))}
      </div>
    </div>
  );
}

function ControlButton({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="w-9 h-9 rounded-full bg-[#F5F5DC] border border-[#B8860B]/30 hover:bg-white hover:border-[#FF8C00]/50 text-[#36454F] flex items-center justify-center transition-all shadow-sm"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function DockButton({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button
      title={label}
      className="w-10 h-10 rounded-full bg-white hover:bg-[#FF8C00]/10 text-[#36454F] hover:text-[#FF8C00] flex items-center justify-center transition-all"
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

function MinimizedWidget({ characterName, lastMessage }: { characterName: string; lastMessage: Message }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-80 bg-[#F5F5DC] rounded-2xl shadow-xl p-4 cursor-pointer hover:shadow-2xl transition-shadow"
    >
      {/* Gradient stroke border */}
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          padding: '2px',
          background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B, #B7410E)',
          backgroundSize: '300% 100%',
          animation: 'gradientFlow 4s ease infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#B7410E] flex items-center justify-center flex-shrink-0">
          <span className="text-[#F5F5DC] font-bold text-sm">
            {characterName.split(' ').map(w => w[0]).join('')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#36454F] font-semibold text-sm truncate">{characterName}</p>
          <p className="text-[#6A6A6A] text-xs truncate">{lastMessage.text}</p>
        </div>
        <Maximize2 className="w-5 h-5 text-[#FF8C00] flex-shrink-0" />
      </div>
    </motion.div>
  );
}
