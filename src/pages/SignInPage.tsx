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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim() || !password) {
      setError('Please enter both email and password.')
      return
    }
    
    setIsLoading(true)
    try {
      const { nextStep } = await signIn({ username: email.trim(), password })
      
      console.log('Sign in next step:', nextStep) // Debug log
      
      if (nextStep.signInStep === 'DONE') {
        navigate(from, { replace: true })
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        // User needs to verify email
        navigate(`/verify?email=${encodeURIComponent(email.trim())}`, { replace: true })
      } else {
        setError('Additional verification required. Please check your email or contact support.')
      }
    } catch (err: any) {
      console.error('Sign in error:', err) // Debug log
      
      // Better error messages based on error type
      if (err.name === 'UserNotFoundException' || err.name === 'NotAuthorizedException') {
        setError('Incorrect email or password. Please try again.')
      } else if (err.name === 'UserNotConfirmedException') {
        setError('Please verify your email first.')
        setTimeout(() => {
          navigate(`/verify?email=${encodeURIComponent(email.trim())}`)
        }, 2000)
      } else {
        setError(err.message || 'Sign in failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#F5F5F5] py-12 font-inter">
      <div className="bg-white rounded-lg p-8 md:p-12 w-[92vw] md:w-[440px] shadow-toolstoy max-w-[440px]">
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
          Welcome back
        </h1>
        <p className="mt-2 text-[15px] text-[#6B7280] text-center">
          Sign in to your Toolstoy account
        </p>

        {/* Error message at top */}
        {error && (
          <div className="mt-6 p-3.5 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg flex items-start gap-2">
            <svg className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[14px] text-[#EF4444] leading-relaxed">
              {error}
            </p>
          </div>
        )}

        <form className="mt-8" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-[14px] text-[#1A1A1A] mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('') // Clear error on input
              }}
              className={`w-full border rounded-lg px-3.5 py-3 text-[15px] font-normal focus:outline-none transition-all duration-200 ${
                error && !email.trim()
                  ? 'border-[#EF4444] bg-[#FEF2F2] focus:border-[#EF4444]'
                  : 'border-[#E5E7EB] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10'
              }`}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block font-medium text-[14px] text-[#1A1A1A] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('') // Clear error on input
                }}
                className={`w-full border rounded-lg px-3.5 py-3 pr-11 text-[15px] font-normal focus:outline-none transition-all duration-200 ${
                  error && !password
                    ? 'border-[#EF4444] bg-[#FEF2F2] focus:border-[#EF4444]'
                    : 'border-[#E5E7EB] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <Link
              to="/forgot-password"
              className="block text-right mt-2 text-[14px] text-[#6B7280] hover:text-[#1A1A1A] transition-all duration-200"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-[#1A1A1A] text-white font-semibold text-[15px] py-3.5 rounded-lg transition-all duration-200 hover:bg-[#2A2A2A] hover:shadow-lg active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1A1A1A] disabled:hover:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="text-sm text-[#6B7280]">or</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        <p className="mt-6 mb-2 text-center text-[14px] text-[#6B7280]">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-[#1A1A1A] font-medium underline hover:no-underline transition-all duration-200">
            Start free
          </Link>
        </p>
      </div>
    </div>
  )
}
