import { useEffect, useState } from 'react'
import { type LayoutType } from './ShowcaseCard'

interface DemoModalProps {
  layout: LayoutType
  onClose: () => void
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

function ChatPanel() {
  return (
    <div className="bg-white flex flex-col h-full min-h-0 flex-1">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center gap-2">
        <h3 className="font-semibold text-[15px] text-toolstoy-nearblack">Character Name</h3>
        <span className="w-2 h-2 rounded-full bg-[#22C55E] flex-shrink-0" />
        <span className="text-toolstoy-muted text-xs">Online</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex justify-end">
          <div className="bg-toolstoy-nearblack text-white text-sm font-normal max-w-[80%] rounded-tl-xl rounded-tr-xl rounded-br-md rounded-bl-xl px-4 py-3">
            What makes this product special?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-gray-100 text-toolstoy-nearblack text-sm font-normal max-w-[80%] rounded-tl-md rounded-tr-xl rounded-br-xl rounded-bl-xl px-4 py-3">
            Great question. Let me walk you through what makes this one genuinely different...
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-toolstoy-nearblack text-white text-sm font-normal max-w-[80%] rounded-tl-xl rounded-tr-xl rounded-br-md rounded-bl-xl px-4 py-3">
            Can I see the full specs?
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="p-4 border-t border-[#F0F0F0] flex gap-2">
        <input
          type="text"
          placeholder="Ask anything..."
          readOnly
          className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-toolstoy-nearblack"
        />
        <button
          type="button"
          className="bg-toolstoy-nearblack text-white rounded-lg px-4 py-2.5 text-sm font-medium flex-shrink-0"
        >
          Send
        </button>
      </div>
    </div>
  )
}

function CharacterPanel() {
  return (
    <div className="bg-gray-100 flex flex-col items-center justify-center p-6 min-h-0">
      <span className="text-toolstoy-muted text-sm">[ Character Preview ]</span>
      <h3 className="text-toolstoy-nearblack font-semibold text-[17px] mt-2">Character Name</h3>
      <p className="text-toolstoy-muted text-[13px]">Product Type</p>
    </div>
  )
}

export function DemoModal({ layout, onClose }: DemoModalProps) {
  const isMobile = useIsMobile()

  const renderLayout = () => {
    if (isMobile) {
      return (
        <div className="flex flex-col h-full w-full">
          <div className="flex-[0.45] min-h-0">
            <CharacterPanel />
          </div>
          <div className="flex-[0.55] min-h-0">
            <ChatPanel />
          </div>
        </div>
      )
    }

    switch (layout) {
      case 'Side by Side':
        return (
          <div className="flex h-full">
            <div className="w-1/2 min-w-0">
              <CharacterPanel />
            </div>
            <div className="w-1/2 min-w-0">
              <ChatPanel />
            </div>
          </div>
        )
      case 'Character Top':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-[0.6] min-h-0">
              <CharacterPanel />
            </div>
            <div className="flex-[0.4] min-h-0">
              <ChatPanel />
            </div>
          </div>
        )
      case 'Chat Focus':
        return (
          <div className="flex h-full relative">
            <div className="absolute top-4 left-4 w-[30%] h-[35%] min-w-[120px] min-h-[140px] rounded-lg overflow-hidden z-10">
              <CharacterPanel />
            </div>
            <div className="flex-1 ml-0 pl-0">
              <ChatPanel />
            </div>
          </div>
        )
      case 'Mirror':
        return (
          <div className="flex h-full flex-row-reverse">
            <div className="w-1/2 min-w-0">
              <CharacterPanel />
            </div>
            <div className="w-1/2 min-w-0">
              <ChatPanel />
            </div>
          </div>
        )
      case 'Immersive':
        return (
          <div className="relative h-full">
            <div className="absolute inset-0">
              <CharacterPanel />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[40%]">
              <ChatPanel />
            </div>
          </div>
        )
      case 'Compact':
        return (
          <div className="flex h-full relative">
            <div className="absolute top-0 left-0 w-[25%] h-[30%] min-w-[100px] min-h-[120px] rounded-lg overflow-hidden z-10">
              <CharacterPanel />
            </div>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full flex flex-col">
                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="flex justify-end mb-4">
                      <div className="bg-toolstoy-nearblack text-white text-sm max-w-[80%] rounded-tl-xl rounded-tr-xl rounded-br-md rounded-bl-xl px-4 py-3">
                        What makes this product special?
                      </div>
                    </div>
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-100 text-toolstoy-nearblack text-sm max-w-[80%] rounded-tl-md rounded-tr-xl rounded-br-xl rounded-bl-xl px-4 py-3">
                        Great question. Let me walk you through...
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-toolstoy-charcoal text-white text-sm max-w-[80%] rounded-tl-xl rounded-tr-xl rounded-br-md rounded-bl-xl px-4 py-3">
                        Can I see the full specs?
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-[#F0F0F0] flex gap-2 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="Ask anything..."
                      readOnly
                      className="flex-1 border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-sm"
                    />
                    <button type="button" className="bg-toolstoy-nearblack text-white rounded-lg px-4 py-2.5 text-sm">
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
              <CharacterPanel />
            </div>
            <div className="w-full flex-[0.6] min-h-0">
              <ChatPanel />
            </div>
          </div>
        )
      default:
        return (
          <div className="flex h-full">
            <div className="w-1/2 min-w-0">
              <CharacterPanel />
            </div>
            <div className="w-1/2 min-w-0">
              <ChatPanel />
            </div>
          </div>
        )
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/88" />

      {/* Close button - fixed viewport position */}
      <button
        onClick={onClose}
        className="fixed top-5 right-5 z-[60] w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors"
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div
        className="relative bg-white w-full h-full sm:w-[92vw] sm:max-w-[960px] sm:max-h-[85vh] sm:rounded-xl overflow-hidden flex flex-col shadow-2xl border border-gray-200"
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
