import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from 'aws-amplify/auth'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function SignUpPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeUrl, setStoreUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const userAttributes: Record<string, string> = {
        email: email.trim(),
        name: name.trim(),
      }
      if (storeUrl.trim()) {
        userAttributes['custom:store_url'] = storeUrl.trim()
      }
      const { nextStep } = await signUp({
        username: email.trim(),
        password,
        options: {
          userAttributes,
          autoSignIn: false,
        },
      })
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        navigate(`/verify?email=${encodeURIComponent(email.trim())}`, { replace: true })
      } else if (nextStep.signUpStep === 'DONE') {
        navigate('/dashboard', { replace: true })
      } else {
        navigate(`/verify?email=${encodeURIComponent(email.trim())}`, { replace: true })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed. Try again.'
      setError(
        msg.includes('User already exists') ? 'An account with this email already exists. Sign in instead.'
          : msg.includes('password') ? 'Password must be at least 8 characters with uppercase, number, and symbol.'
          : msg
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F5F5F5] py-12 font-inter">
      <div className="bg-white rounded-lg p-8 md:p-12 w-[92vw] md:w-[440px] max-w-[440px] shadow-toolstoy">
        <div className="flex justify-center mb-8">
          <div className="bg-toolstoy-charcoal rounded-lg px-5 py-3">
            <img
              src={logoSrc}
              alt="toolstoy"
              className="h-[19.2px] w-auto object-contain brightness-0 invert"
            />
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-[#1A1A1A] text-center">
          Create your account.
        </h1>
        <p className="mt-2 text-[15px] text-[#6B7280] text-center">
          Your products&apos; first words are about to happen.
        </p>

        <form className="mt-8" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-[14px] text-[#1A1A1A] mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Leo Tolstoy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-[#1A1A1A] focus:outline-none transition-all duration-200"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block font-medium text-[14px] text-[#1A1A1A] mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="leo@toolstoy.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-[#1A1A1A] focus:outline-none transition-all duration-200"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block font-medium text-[14px] text-[#1A1A1A] mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-[#1A1A1A] focus:outline-none transition-all duration-200"
              required
              minLength={8}
            />
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Min 8 chars, 1 uppercase, 1 number, 1 symbol.
            </p>
          </div>

          <div className="mt-4">
            <label className="block font-medium text-[14px] text-[#1A1A1A] mb-1.5">
              Your Store URL
            </label>
            <input
              type="url"
              placeholder="https://yourstore.com"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-[#1A1A1A] focus:outline-none transition-all duration-200"
            />
            <p className="mt-1 text-[14px] text-[#6B7280]">
              Works on any platform — Wix, Squarespace, WordPress, Webflow, or custom HTML.
            </p>
          </div>

          {error && (
            <p className="mt-4 text-[14px] text-[#EF4444]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-7 bg-[#1A1A1A] text-white font-semibold text-[15px] py-3.5 rounded-lg transition-all duration-200 hover:bg-[#282C34] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create Free Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-[14px] text-[#6B7280]">
          By signing up you agree to our{' '}
          <Link to="/terms" className="text-[#1A1A1A] underline transition-all duration-200">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-[#1A1A1A] underline transition-all duration-200">Privacy Policy</Link>.
        </p>

        <p className="mt-5 text-center text-sm text-[#6B7280]">
          Already have an account?{' '}
          <Link to="/signin" className="text-[#1A1A1A] underline transition-all duration-200">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
