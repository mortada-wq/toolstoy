import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import outputs from '../../amplify_outputs.json'

const API_BASE =
  (outputs as { custom?: { API?: Record<string, { endpoint?: string }> } }).custom?.API?.ToolstoyApi?.endpoint?.replace(
    /\/$/,
    ''
  ) ?? ''

interface CharacterConfig {
  name: string
  imageUrl: string | null
  productName?: string
  catchphrase?: string
  greeting: string
  layout?: string
  position?: string
  trigger?: string
}

export function PublicCharacterPage() {
  const { slug } = useParams<{ slug: string }>()
  const token = slug
  const [config, setConfig] = useState<CharacterConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetch(`${API_BASE}/api/widget/load?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          name: data.name ?? 'Character',
          imageUrl: data.imageUrl ?? null,
          productName: data.productName,
          catchphrase: data.catchphrase,
          greeting: data.greeting ?? 'Hi. How can I help?',
        })
        setMessages([{ role: 'assistant', text: data.greeting ?? 'Hi. How can I help?' }])
      })
      .catch(() => setConfig(null))
      .finally(() => setLoading(false))
  }, [token])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending || !token) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setSending(true)
    try {
      const res = await fetch(`${API_BASE}/api/widget/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          message: text,
          session_id: 'public_' + Math.random().toString(36).slice(2),
          page_context: { url: typeof window !== 'undefined' ? window.location.href : '', page_type: 'public' },
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', text: data.reply ?? "I'm not sure how to respond right now." }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: "Sorry, I couldn't respond. Try again." }])
    } finally {
      setSending(false)
    }
  }

  const handleCopyUrl = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    navigator.clipboard.writeText(url)
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-[15px] text-[#6B7280]">Character not found.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse w-48 h-48 bg-[#F5F5F5] rounded-2xl" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <p className="text-[15px] text-[#6B7280]">Character not found.</p>
        <Link to="/" className="mt-4 text-[14px] text-[#1A1A1A] font-medium underline">
          Go to Toolstoy
        </Link>
      </div>
    )
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-4 pt-16 md:pt-24 pb-12">
        <div className="max-w-[720px] mx-auto text-center">
          <div className="bg-[#F5F5F5] rounded-2xl p-10 md:p-12 flex items-center justify-center">
            {config.imageUrl ? (
              <img
                src={config.imageUrl}
                alt=""
                className="max-h-[320px] w-auto object-contain"
              />
            ) : (
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl bg-[#E5E7EB] flex items-center justify-center text-[#6B7280] text-[14px]">
                [ Character ]
              </div>
            )}
          </div>
          <h1 className="mt-6 font-bold text-[36px] md:text-[40px] text-[#1A1A1A]">
            {config.name}
          </h1>
          {config.productName && (
            <span className="inline-block mt-3 bg-[#F5F5F5] text-[#6B7280] font-medium text-[13px] px-4 py-1.5 rounded-full">
              {config.productName}
            </span>
          )}
          {config.catchphrase && (
            <p className="mt-4 max-w-[480px] mx-auto text-[18px] text-[#6B7280] italic">
              &ldquo;{config.catchphrase}&rdquo;
            </p>
          )}
        </div>
      </section>

      {/* Chat section */}
      <section className="px-4 py-12 md:py-16">
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-center font-semibold text-[22px] text-[#1A1A1A]">
            Chat with {config.name}
          </h2>
          <p className="text-center mt-2 text-[15px] text-[#6B7280]">
            {config.productName ? `Ask them anything about ${config.productName}.` : 'Ask them anything.'}
          </p>

          <div className="mt-8 bg-white border border-[#E5E7EB] rounded-lg overflow-hidden" style={{ height: 480 }}>
            <div className="h-12 px-4 flex items-center border-b border-[#E5E7EB] bg-[#F5F5F5]">
              <span className="font-semibold text-[14px] text-[#1A1A1A]">{config.name}</span>
              <span className="ml-2 w-2 h-2 rounded-full bg-[#22C55E]" />
            </div>
            <div className="h-[calc(100%-120px)] overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-lg text-[14px] ${
                    m.role === 'user'
                      ? 'self-end bg-[#1A1A1A] text-white'
                      : 'self-start bg-[#F5F5F5] text-[#1A1A1A]'
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="h-16 border-t border-[#E5E7EB] flex gap-2 p-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[14px] focus:border-[#1A1A1A] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="bg-[#1A1A1A] text-white font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Share row */}
      <section className="px-4 py-8">
        <div className="max-w-[600px] mx-auto">
          <p className="font-medium text-[14px] text-[#1A1A1A] mb-2">
            Share {config.name} with your customers
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-[14px] text-[#6B7280] bg-[#FAFAFA]"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className="border border-[#E5E7EB] bg-white text-[#1A1A1A] font-semibold text-[13px] px-4 py-2.5 rounded-lg hover:bg-[#F5F5F5]"
            >
              Copy
            </button>
          </div>
          <Link
            to="/dashboard/widget"
            className="inline-block mt-3 border border-[#1A1A1A] bg-white text-[#1A1A1A] font-semibold text-[14px] px-5 py-2.5 rounded-lg hover:bg-[#FAFAFA]"
          >
            Add to your store
          </Link>
        </div>
      </section>

      {/* Footer - only on public character pages */}
      <footer className="py-10 text-center border-t border-[#E5E7EB] mt-4">
        <p className="text-[13px] text-[#6B7280]">
          Powered by{' '}
          <Link to="/" className="text-[#1A1A1A] underline hover:no-underline">
            Toolstoy
          </Link>
        </p>
      </footer>
    </div>
  )
}
