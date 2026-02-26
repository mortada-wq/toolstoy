import React, { useState } from 'react';
import { useParams } from 'react-router';
import { motion } from 'motion/react';
import { Share2, Copy, Check } from 'lucide-react';

export function PublicCharacter() {
  const { slug } = useParams();
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey there! Ready to step up your sneaker game?', sender: 'character', timestamp: new Date() },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const characterName = 'Nike Air Max Guide';
  const characterImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const characterMessage = {
        id: Date.now() + 1,
        text: "Great question! The Air Max 97 features full-length visible Air Max cushioning for all-day comfort. It's perfect for both running and casual wear!",
        sender: 'character',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, characterMessage]);
    }, 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#36454F] via-[#2A343C] to-[#36454F] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#B7410E] flex items-center justify-center">
              <span className="text-[#F5F5DC] font-bold">
                {characterName.split(' ').map(w => w[0]).join('')}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5F5DC]">{characterName}</h1>
              <p className="text-[#FFDAB9]/60 text-sm">Ask me anything about this product</p>
            </div>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 bg-[#2A343C] hover:bg-[#1E262E] text-[#FFDAB9] hover:text-[#DAA520] rounded-full transition-all border border-[#B8860B]/30"
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Copy Link
              </>
            )}
          </button>
        </div>

        {/* Main Chat Interface */}
        <div className="bg-[#2A343C] rounded-2xl shadow-2xl overflow-hidden border border-[#B8860B]/30">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Character Area */}
            <div className="relative bg-gradient-to-br from-[#1E262E] to-[#2A343C] p-8 lg:p-12 flex items-center justify-center">
              {/* Thin gradient stroke around character area */}
              <div 
                className="absolute inset-0 lg:right-auto lg:w-[2px]"
                style={{
                  background: 'linear-gradient(180deg, #FF8C00, #DAA520, #B8860B, #B7410E)',
                  opacity: 0.3,
                }}
              />
              
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden"
              >
                <img 
                  src={characterImage} 
                  alt={characterName}
                  className="w-full h-full object-cover"
                />
                
                {/* Radial gradient overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, transparent 40%, rgba(46, 52, 60, 0.4) 100%)',
                  }}
                />
              </motion.div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-[#36454F] text-[#F5F5DC]'
                          : 'bg-[#F5F5DC] text-[#36454F] border border-[#B8860B]/30'
                      }`}
                    >
                      {message.text}
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#F5F5DC] border border-[#B8860B]/30 rounded-2xl px-4 py-3 flex gap-1">
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
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-[#B8860B]/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything..."
                    className="flex-1 px-4 py-3 bg-[#1E262E] border border-[#B8860B]/30 rounded-full text-[#F5F5DC] placeholder:text-[#6A6A6A] focus:border-[#FF8C00] focus:outline-none transition-colors"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className="px-6 py-3 bg-[#FF8C00] hover:bg-[#B7410E] disabled:bg-[#6A6A6A] disabled:cursor-not-allowed text-[#F5F5DC] font-semibold rounded-full transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[#FFDAB9]/60 text-sm">
            Powered by{' '}
            <a href="/" className="text-[#FF8C00] hover:text-[#B7410E] transition-colors font-semibold">
              Toolstoy
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
