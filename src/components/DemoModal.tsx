import { useEffect, useState } from 'react'
import { type LayoutType } from './ShowcaseCard'
import { SoulEnginePulse } from './SoulEnginePulse'

interface DemoModalProps {
  layout: LayoutType
  onClose: () => void
}

// Character data for each layout
const CHARACTER_DATA: Record<LayoutType, { name: string; product: string; greeting: string; responses: string[] }> = {
  'Side by Side': {
    name: 'Max',
    product: 'Wireless Headphones',
    greeting: "Hey! I'm Max. These headphones? They're not just audio gear — they're your personal sound studio.",
    responses: [
      "40-hour battery. Active noise cancellation that actually works. And they fold flat — no bulky case needed.",
      "IPX4 water-resistant. Sweat won't kill them. Rain won't either. They're built for real life."
    ]
  },
  'Character Top': {
    name: 'Luna',
    product: 'Skincare Serum',
    greeting: "Hi, I'm Luna. This serum isn't magic — it's science. Let me show you what makes it different.",
    responses: [
      "Hyaluronic acid at 2% concentration. Vitamin C that's actually stable. And it absorbs in under 60 seconds.",
      "Dermatologist-tested. Cruelty-free. And it works on all skin types — I've seen the results myself."
    ]
  },
  'Chat Focus': {
    name: 'Atlas',
    product: 'Travel Backpack',
    greeting: "Atlas here. This backpack has been to 47 countries with me. Want to know why it's still my favorite?",
    responses: [
      "35L capacity but fits as carry-on. Laptop sleeve fits up to 17 inches. And the water bottle pocket? Genius design.",
      "Lifetime warranty. Water-resistant fabric. And every zipper is YKK — they never fail."
    ]
  },
  'Mirror': {
    name: 'Sage',
    product: 'Smart Home Hub',
    greeting: "I'm Sage. This hub connects everything in your home. No complicated setup. No tech degree required.",
    responses: [
      "Works with Alexa, Google, and HomeKit. Controls lights, locks, thermostats — over 5,000 compatible devices.",
      "Setup takes 5 minutes. The app is actually intuitive. And it runs locally — your data stays private."
    ]
  },
  'Immersive': {
    name: 'Nova',
    product: 'Gaming Keyboard',
    greeting: "Nova here. This keyboard isn't for everyone. It's for people who take their setup seriously.",
    responses: [
      "Mechanical switches — your choice of linear, tactile, or clicky. Hot-swappable. RGB that doesn't look cheap.",
      "Aluminum frame. Braided cable. And the keycaps? Double-shot PBT. They'll outlast the keyboard itself."
    ]
  },
  'Compact': {
    name: 'Finn',
    product: 'Coffee Maker',
    greeting: "Finn here. This coffee maker does one thing: makes exceptional coffee. No apps. No subscriptions.",
    responses: [
      "Brews at 200°F — the optimal temperature. 8-cup capacity. And it's done in 6 minutes flat.",
      "Thermal carafe keeps coffee hot for 4 hours. No burnt taste. And it's dishwasher-safe — actually dishwasher-safe."
    ]
  },
  'Cinematic': {
    name: 'Echo',
    product: 'Electric Bike',
    greeting: "I'm Echo. This e-bike will change how you think about commuting. 50-mile range. Zero emissions.",
    responses: [
      "750W motor. Hits 28mph. And the battery? Charges fully in 4 hours from any outlet.",
      "Hydraulic disc brakes. Puncture-resistant tires. And it folds — fits in your trunk or under your desk."
    ]
  },
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

function ChatPanel({ characterName, greeting, responses }: { characterName: string; greeting: string; responses: string[] }) {
  const messages = [
    { id: 1, align: 'start', text: greeting, isUser: false },
    { id: 2, align: 'end', text: 'What makes this product special?', isUser: true },
    { id: 3, align: 'start', text: responses[0], isUser: false },
    { id: 4, align: 'end', text: 'Tell me more about durability', isUser: true },
    { id: 5, align: 'start', text: responses[1], isUser: false },
  ]
  
  return (
    <div className="bg-white flex flex-col h-full min-h-0 flex-1">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
        <h3 className="font-semibold text-[15px] text-toolstoy-nearblack">{characterName}</h3>
        <span className="w-2 h-2 rounded-full bg-[#22C55E] flex-shrink-0" />
        <span className="text-[#6B7280] text-sm">Online</span>
      </div>

      {/* Messages - staggered slide-up (100-200ms), mimics human typing rhythm */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, i) => (
          <div
            key={m.id}
            className={`flex opacity-0 translate-y-3 ${m.align === 'end' ? 'justify-end' : 'justify-start'}`}
            style={{
              animation: 'msgSlideUp 0.35s ease-out forwards',
              animationDelay: `${120 + i * 120}ms`,
              animationFillMode: 'forwards',
            }}
          >
            <div
              className={`text-sm font-normal max-w-[80%] px-4 py-3 ${
                m.isUser
                  ? 'bg-[#282C34] text-white rounded-tl-[12px] rounded-tr-[12px] rounded-br-[2px] rounded-bl-[12px]'
                  : 'bg-[#F5F5F5] text-[#1A1A1A] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[2px]'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-[#E5E7EB] flex gap-2">
        <input
          type="text"
          placeholder="Ask anything..."
          readOnly
          className="flex-1 border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1A1A1A]"
        />
        <button
          type="button"
          className="bg-[#1A1A1A] text-white rounded-lg px-4 py-2.5 text-sm font-medium flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] active:scale-[0.98]"
        >
          Send
        </button>
      </div>
    </div>
  )
}

function CharacterPanel({ characterName, productType }: { characterName: string; productType: string }) {
  return (
    <SoulEnginePulse className="bg-[#F5F5F5] flex flex-col items-center justify-center p-6 min-h-0 rounded-lg">
      <span className="text-[#6B7280] text-sm">[ Character Preview ]</span>
      <h3 className="text-[#1A1A1A] font-semibold text-[17px] mt-2">{characterName}</h3>
      <p className="text-toolstoy-muted text-[13px]">{productType}</p>
    </SoulEnginePulse>
  )
}

export function DemoModal({ layout, onClose }: DemoModalProps) {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const characterData = CHARACTER_DATA[layout]

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const renderLayout = () => {
    if (isMobile) {
      return (
        <div className="flex flex-col h-full w-full">
          <div className="flex-[0.45] min-h-0">
            <CharacterPanel characterName={characterData.name} productType={characterData.product} />
          </div>
          <div className="flex-[0.55] min-h-0">
            <ChatPanel characterName={characterData.name} greeting={characterData.greeting} responses={characterData.responses} />
          </div>
        </div>
      )
    }

    switch (layout) {
      case 'Side by Side':
        return (
          <div className="flex h-full">
            <div className="w-1/2 min-w-0">
              <CharacterPanel characterName={characterData.name} productType={characterData.product} />
            </div>
            <div className="w-1/2 min-w-0">
              <ChatPanel characterName={characterData.name} greeting={characterData.greeting} responses={characterData.responses} />
            </div>
          </div>
        )
      case 'Character Top':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-[0.6] min-h-0">
              <CharacterPanel characterName={characterData.name} productType={characterData.product} />
            </div>
            <div className="flex-[0.4] min-h-0">
              <ChatPanel characterName={characterData.name} greeting={characterData.greeting} responses={characterData.responses} />
            </div>
          </div>
        )
      case 'Chat Focus':
        return (
          <div className="flex h-full relative">
            <div className="absolute top-4 left-4 w-[30%] h-[35%] min-w-[120px] min-h-[140px] rounded-lg overflow-hidden z-10">
              <CharacterPanel characterName={characterData.name} productType={characterData.product} />
            </div>
            <div className="flex-1 ml-0 pl-0">
              <ChatPanel characterName={characterData.name} greeting={characterData.greeting} responses={characterData.responses} />
            </div>
          </div>
        )
      case 'Mirror':
        return (
          <div className="flex h-full flex-row-reverse">
            <div className="w-1/2 min-w-0">
              <CharacterPanel characterName={characterData.name} productType={characterData.product} />
            </div>
            <div className="w-1/2 min-w-0">
              <ChatPanel characterName={characterData.name} greeting={characterData.greeting} responses={characterData.responses} />
            </div>
          </div>
        )
      case 'Immersive':
        return (
          <div className="relative h-full">
            <div className="absolute inset-0">
              <CharacterPanel characterName={characterData.name} productType={characterData.product} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[40%]">
              <ChatPanel characterName={characterData.name} greeting={characterData.greeting} responses={characterData.responses} />
            </div>
          </div>
        )
      case 'Compact':
        return (
          <div className="flex h-full relative">
            <div className="absolute top-0 left-0 w-[25%] h-[30%] min-w-[100px] min-h-[120px] rounded-lg overflow-hidden z-10">
              <CharacterPanel characterName={characterData.name} productType={characterData.product} />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="flex justify-start mb-4">
                      <div className="bg-[#F5F5F5] text-[#1A1A1A] text-sm max-w-[80%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[2px] px-4 py-3">
                        {characterData.greeting}
                      </div>
                    </div>
                    <div className="flex justify-end mb-4">
                      <div className="bg-[#282C34] text-white text-sm max-w-[80%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[2px] rounded-bl-[12px] px-4 py-3">
                        What makes this product special?
                      </div>
                    </div>
                    <div className="flex justify-start mb-4">
                      <div className="bg-[#F5F5F5] text-[#1A1A1A] text-sm max-w-[80%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[2px] px-4 py-3">
                        {characterData.responses[0]}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-[#282C34] text-white text-sm max-w-[80%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[2px] rounded-bl-[12px] px-4 py-3">
                        Tell me more about durability
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-[#E5E7EB] flex gap-2 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="Ask anything..."
                      readOnly
                      className="flex-1 border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-sm"
                    />
                    <button type="button" className="bg-toolstoy-nearblack text-white rounded-lg px-4 py-2.5 text-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] active:scale-[0.98]">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'Cinematic':
        return (
          <div className="flex flex-col h-full">
            <div className="w-full flex-[0.4] min-h-0">
              <CharacterPanel characterName={characterData.name} productType={characterData.product} />
            </div>
            <div className="w-full flex-[0.6] min-h-0">
              <ChatPanel characterName={characterData.name} greeting={characterData.greeting} responses={characterData.responses} />
            </div>
          </div>
        )
      default:
        return (
          <div className="flex h-full">
            <div className="w-1/2 min-w-0">
              <CharacterPanel characterName={characterData.name} productType={characterData.product} />
            </div>
            <div className="w-1/2 min-w-0">
              <ChatPanel characterName={characterData.name} greeting={characterData.greeting} responses={characterData.responses} />
            </div>
          </div>
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-5"
      onClick={onClose}
    >
      {/* Backdrop - subtle fade, Notion-like */}
      <div className="absolute inset-0 bg-black/88 transition-opacity duration-300 ease-out opacity-100" />

      {/* Close button - spring micro-interaction */}
      <button
        onClick={onClose}
        className="fixed top-5 right-5 z-[60] w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 active:scale-95"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className={`relative bg-white w-full h-full md:w-[92vw] md:max-w-[960px] md:max-h-[85vh] rounded-none md:rounded-lg overflow-hidden flex flex-col shadow-2xl border border-[#E5E7EB] transition-all duration-[400ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-dot-active ${
          mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="flex-1 min-h-0 flex flex-col">
          {renderLayout()}
        </div>
      </div>
    </div>
  )
}
