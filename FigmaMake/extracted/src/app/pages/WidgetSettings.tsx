import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Code as CodeIcon } from 'lucide-react';
import { CharacterWidget } from '../components/CharacterWidget';

const layouts = [
  { id: 'side-by-side', name: 'Side by Side', description: 'Character and chat side by side' },
  { id: 'character-top', name: 'Character Top', description: 'Character above, chat below' },
  { id: 'chat-focus', name: 'Chat Focus', description: 'Chat prominent, character minimized' },
  { id: 'mirror', name: 'Mirror', description: 'Mirrored layout for flexibility' },
  { id: 'immersive', name: 'Immersive', description: 'Full-screen character experience' },
  { id: 'compact', name: 'Compact', description: 'Minimal space, maximum impact' },
  { id: 'cinematic', name: 'Cinematic', description: 'Wide format for storytelling' },
];

const positions = [
  { id: 'intimate', label: 'Intimate', description: 'Close and personal' },
  { id: 'balanced', label: 'Balanced', description: 'Comfortable viewing' },
  { id: 'ambient', label: 'Ambient', description: 'Subtle presence' },
];

export function WidgetSettings() {
  const [selectedLayout, setSelectedLayout] = useState('character-top');
  const [selectedPosition, setSelectedPosition] = useState('balanced');
  const [copied, setCopied] = useState(false);

  const embedCode = `<!-- Toolstoy Widget -->
<script src="https://toolstoy.app/widget.js"></script>
<div id="toolstoy-widget" 
     data-character="nike-air-max-guide"
     data-layout="${selectedLayout}"
     data-position="${selectedPosition}">
</div>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#F5F5DC] mb-2">Widget Settings</h1>
        <p className="text-[#FFDAB9]/70 text-lg">Customize how your character appears on your site</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings */}
        <div className="space-y-8">
          {/* Layout Picker */}
          <section>
            <h2 className="text-xl font-bold text-[#F5F5DC] mb-4">Layout Style</h2>
            <div className="grid grid-cols-2 gap-4">
              {layouts.map((layout) => (
                <motion.button
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout.id)}
                  whileHover={{ scale: 1.02 }}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                    selectedLayout === layout.id
                      ? 'border-[#FF8C00] bg-[#FF8C00]/10'
                      : 'border-[#B8860B]/30 bg-[#2A343C] hover:border-[#DAA520]/50'
                  }`}
                >
                  {/* Gradient stroke accent */}
                  {selectedLayout === layout.id && (
                    <div 
                      className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
                      style={{
                        background: 'linear-gradient(90deg, #FF8C00, #DAA520, #B8860B)',
                      }}
                    />
                  )}

                  {/* Icon placeholder */}
                  <div className="h-20 bg-[#1E262E] rounded-lg mb-3 flex items-center justify-center">
                    <CodeIcon className="w-8 h-8 text-[#FF8C00]/30" />
                  </div>

                  <h3 className="text-[#F5F5DC] font-semibold text-sm mb-1">{layout.name}</h3>
                  <p className="text-[#FFDAB9]/60 text-xs">{layout.description}</p>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Gradient Divider */}
          <div 
            className="h-[1px]"
            style={{
              background: 'linear-gradient(90deg, transparent, #FF8C00, #DAA520, #B8860B, #B7410E, transparent)',
              opacity: 0.3,
            }}
          />

          {/* Position Options */}
          <section>
            <h2 className="text-xl font-bold text-[#F5F5DC] mb-4">Character Position</h2>
            <div className="flex gap-3">
              {positions.map((position) => (
                <button
                  key={position.id}
                  onClick={() => setSelectedPosition(position.id)}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedPosition === position.id
                      ? 'bg-gradient-to-r from-[#FF8C00] to-[#B8860B] text-[#F5F5DC]'
                      : 'bg-[#2A343C] text-[#FFDAB9]/70 border border-[#B8860B]/30 hover:border-[#DAA520]/50'
                  }`}
                >
                  <div className="font-semibold">{position.label}</div>
                  <div className="text-xs opacity-70">{position.description}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Gradient Divider */}
          <div 
            className="h-[1px]"
            style={{
              background: 'linear-gradient(90deg, transparent, #FF8C00, #DAA520, #B8860B, #B7410E, transparent)',
              opacity: 0.3,
            }}
          />

          {/* Trigger Options */}
          <section>
            <h2 className="text-xl font-bold text-[#F5F5DC] mb-4">Trigger Behavior</h2>
            <div className="space-y-3">
              {[
                { id: 'auto', label: 'Auto-open on page load', description: 'Widget appears immediately' },
                { id: 'scroll', label: 'Trigger on scroll', description: 'Widget appears after scrolling 50%' },
                { id: 'click', label: 'Click to open', description: 'User clicks to activate' },
              ].map((trigger) => (
                <label
                  key={trigger.id}
                  className="flex items-center gap-3 p-4 bg-[#2A343C] border border-[#B8860B]/30 rounded-xl hover:border-[#DAA520]/50 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name="trigger"
                    defaultChecked={trigger.id === 'auto'}
                    className="w-5 h-5 accent-[#FF8C00]"
                  />
                  <div className="flex-1">
                    <p className="text-[#F5F5DC] font-medium text-sm">{trigger.label}</p>
                    <p className="text-[#FFDAB9]/60 text-xs">{trigger.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Embed Code */}
          <section>
            <h2 className="text-xl font-bold text-[#F5F5DC] mb-4">Embed Code</h2>
            <div className="relative">
              <pre className="bg-[#1E262E] border border-[#B8860B]/30 rounded-xl p-4 text-[#DAA520] text-xs overflow-x-auto font-mono">
                {embedCode}
              </pre>
              <button
                onClick={handleCopyCode}
                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-[#2A343C] hover:bg-[#DAA520]/20 text-[#DAA520] rounded-lg text-xs font-medium transition-all border border-[#B8860B]/30"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </section>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-8 h-fit">
          <h2 className="text-xl font-bold text-[#F5F5DC] mb-4">Live Preview</h2>
          <div className="bg-[#2A343C] border border-[#B8860B]/30 rounded-2xl p-8 flex items-center justify-center">
            {/* Gradient stroke border */}
            <div className="relative">
              <CharacterWidget 
                layout={selectedLayout as any}
                showControls={true}
                showSpecialDock={false}
              />
            </div>
          </div>
          
          <p className="text-[#FFDAB9]/60 text-sm text-center mt-4">
            This is how your widget will appear on your website
          </p>
        </div>
      </div>
    </div>
  );
}
