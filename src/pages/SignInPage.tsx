import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signIn } from 'aws-amplify/auth'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { nextStep } = await signIn({ username: email.trim(), password })
      if (nextStep.signInStep === 'DONE') {
        navigate(from, { replace: true })
      } else {
        setError('Additional verification required. Please try again or contact support.')
      }
    } catch (err) {
      setError('Incorrect email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F5F5F5] py-12 font-inter">
      <div className="bg-white rounded-lg p-8 md:p-12 w-[92vw] md:w-[400px] shadow-toolstoy max-w-[400px]">
        <div className="flex justify-center mb-8">
          <div className="bg-toolstoy-charcoal rounded-lg px-5 py-3">
            <img
              src={logoSrc}
              alt="toolstoy"
              className="h-6 w-auto object-contain brightness-0 invert"
            />
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-[#1A1A1A] text-center">
          Welcome back.
        </h1>
        <p className="mt-2 text-[15px] text-[#6B7280] text-center">
          Sign in to your Toolstoy account.
        </p>

        <form className="mt-8" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-[14px] text-[#1A1A1A] mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
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
            />
            <Link
              to="/forgot-password"
              className="block text-right mt-2 text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-all duration-200"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="mt-4 text-[14px] text-[#EF4444]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-[#1A1A1A] text-white font-semibold text-[15px] py-3.5 rounded-lg transition-all duration-200 hover:bg-[#282C34] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-sm text-[#6B7280]">or</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        <p className="mt-5 text-center text-sm text-[#6B7280]">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-[#1A1A1A] underline transition-all duration-200">
            Start free
          </Link>
        </p>
      </div>
    </div>
  )
}
