import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoSrc from '@/assets/Finaltoolstoy.svg'

const ONBOARDING_KEY = 'toolstoy_onboarding_complete'

export function WelcomePage() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState(1)
  const [productUrl, setProductUrl] = useState('')

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    navigate('/dashboard', { replace: true })
  }

  const handleLetsGo = () => {
    setScreen(2)
  }

  const handleStartBuilding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    if (productUrl.trim()) {
      navigate(`/dashboard/studio?url=${encodeURIComponent(productUrl.trim())}`, { replace: true })
    } else {
      navigate('/dashboard/studio', { replace: true })
    }
  }

  const handleAddManually = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    navigate('/dashboard/studio', { replace: true })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      {screen === 1 && (
        <div className="max-w-[560px] w-full text-center">
          <Link to="/" className="inline-block mb-8">
            <img
              src={logoSrc}
              alt="toolstoy"
              className="h-[22.4px] w-auto"
              style={{ filter: 'contrast(0) brightness(0)' }}
            />
          </Link>
          <h1 className="font-bold text-[44px] text-[#1A1A1A]">
            Welcome to Toolstoy.
          </h1>
          <p className="mt-4 text-[20px] text-[#6B7280]">
            Your products have been waiting for a voice. Let&apos;s find it.
          </p>
          <button
            type="button"
            onClick={handleLetsGo}
            className="mt-12 bg-[#1A1A1A] text-white font-semibold text-[15px] px-8 py-3.5 rounded-lg hover:opacity-90"
          >
            Let&apos;s Go
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="block mt-4 text-[13px] text-[#6B7280] hover:text-[#1A1A1A]"
          >
            Skip setup
          </button>
        </div>
      )}

      {screen === 2 && (
        <div className="max-w-[560px] w-full">
          <h1 className="font-bold text-[32px] text-[#1A1A1A] text-center">
            Which product goes first?
          </h1>
          <p className="mt-4 text-[17px] text-[#6B7280] text-center">
            Paste the URL of your first product. We&apos;ll do the rest.
          </p>
          <input
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="https://yourstore.com/your-product"
            className="mt-8 w-full border border-[#E5E7EB] rounded-lg px-4 py-4 text-[16px] focus:border-[#1A1A1A] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleStartBuilding}
            className="mt-6 w-full bg-[#1A1A1A] text-white font-semibold text-[15px] py-3.5 rounded-lg hover:opacity-90"
          >
            Start Building
          </button>
          <button
            type="button"
            onClick={handleAddManually}
            className="block mt-4 w-full text-[14px] text-[#6B7280] hover:text-[#1A1A1A]"
          >
            I&apos;ll add it manually
          </button>
        </div>
      )}
    </div>
  )
}
