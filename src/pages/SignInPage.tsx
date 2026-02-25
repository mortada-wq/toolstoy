import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { signIn } from 'aws-amplify/auth'
import { useUser } from '@/context/UserContext'

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isLoading: authLoading, refreshUser } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  // Already signed in → go straight to dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [authLoading, isAuthenticated, navigate, from])
  const stateEmail = (location.state as { email?: string })?.email
  const [email, setEmail] = useState(stateEmail ?? '')
  const [verifiedSuccess, setVerifiedSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      setVerifiedSuccess(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])
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

      if (nextStep.signInStep === 'DONE') {
        navigate(from, { replace: true })
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        // User needs to verify email
        navigate(`/verify?email=${encodeURIComponent(email.trim())}`, { replace: true })
      } else {
        setError('Additional verification required. Please check your email or contact support.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      const errObj = err as { name?: string }
      const isAlreadySignedIn =
        errObj?.name === 'UserAlreadyAuthenticatedException' ||
        msg.includes('already a signed in user') ||
        msg.includes('signed in user')

      if (isAlreadySignedIn) {
        await refreshUser()
        navigate(from, { replace: true })
        return
      }

      // Better error messages based on error type
      if (errObj?.name === 'UserNotFoundException' || errObj?.name === 'NotAuthorizedException') {
        setError('Incorrect email or password. Please try again.')
      } else if (errObj?.name === 'UserNotConfirmedException') {
        setError('Please verify your email first.')
        setTimeout(() => {
          navigate(`/verify?email=${encodeURIComponent(email.trim())}`)
        }, 2000)
      } else {
        setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-toolstoy-bg-primary">
        <div className="w-8 h-8 rounded-full border-2 border-toolstoy-orange border-t-transparent animate-spin" aria-label="Loading" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-toolstoy-bg-primary font-inter">
      <div className="bg-toolstoy-bg-secondary border border-toolstoy-steelBlue/15 rounded-toolstoy-lg p-8 md:p-12 w-[92vw] md:w-[440px] shadow-toolstoy-md max-w-[440px]">
        <div className="flex justify-center mb-8">
          <img
            src="/logos/logo-darkmode.svg"
            alt="Toolstoy"
            className="h-8 w-auto object-contain min-w-[100px]"
          />
        </div>

        <h1 className="text-[28px] font-bold text-toolstoy-cream text-center">
          Welcome back
        </h1>
        <p className="mt-2 text-[15px] text-toolstoy-slateText text-center">
          Sign in to your Toolstoy account
        </p>

        {/* Email verified success message */}
        {verifiedSuccess && (
          <div className="mt-6 p-3.5 bg-toolstoy-teal/20 border border-toolstoy-teal/40 rounded-toolstoy-md flex items-start gap-2">
            <svg className="w-5 h-5 text-toolstoy-teal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[14px] text-toolstoy-teal leading-relaxed">
              Email verified! Sign in to continue.
            </p>
          </div>
        )}

        {/* Error message at top */}
        {error && (
          <div className="mt-6 p-3.5 bg-toolstoy-coral/20 border border-toolstoy-coral/40 rounded-toolstoy-md flex items-start gap-2">
            <svg className="w-5 h-5 text-toolstoy-coral flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[14px] text-toolstoy-coral leading-relaxed">
              {error}
            </p>
          </div>
        )}

        <form className="mt-8" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-[14px] text-toolstoy-cream mb-1.5">
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
              className={`w-full border rounded-toolstoy-md px-4 py-3 text-[15px] font-normal text-toolstoy-cream placeholder:text-toolstoy-steelBlue focus:outline-none transition-all duration-200 bg-toolstoy-bg-overlay ${
                error && !email.trim()
                  ? 'border-toolstoy-coral focus:border-toolstoy-coral'
                  : 'border-toolstoy-steelBlue/25 focus:border-toolstoy-teal/60 focus:ring-2 focus:ring-toolstoy-teal/20'
              }`}
              required
            />
          </div>

          <div className="mt-4">
            <label className="block font-medium text-[14px] text-toolstoy-cream mb-1.5">
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
                className={`w-full border rounded-toolstoy-md px-4 py-3 pr-11 text-[15px] font-normal text-toolstoy-cream placeholder:text-toolstoy-steelBlue focus:outline-none transition-all duration-200 bg-toolstoy-bg-overlay ${
                  error && !password
                    ? 'border-toolstoy-coral focus:border-toolstoy-coral'
                    : 'border-toolstoy-steelBlue/25 focus:border-toolstoy-teal/60 focus:ring-2 focus:ring-toolstoy-teal/20'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-toolstoy-slateText hover:text-toolstoy-cream transition-colors p-1"
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
              className="block text-right mt-2 text-[14px] text-toolstoy-slateText hover:text-toolstoy-cream transition-all duration-200"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-toolstoy-orange text-toolstoy-cream font-semibold text-[15px] py-3.5 rounded-full transition-all duration-200 hover:shadow-orange-glow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
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
          <div className="flex-1 h-px bg-toolstoy-steelBlue/15" />
          <span className="text-sm text-toolstoy-slateText">or</span>
          <div className="flex-1 h-px bg-toolstoy-steelBlue/15" />
        </div>

        <p className="mt-6 mb-2 text-center text-[14px] text-toolstoy-slateText">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-toolstoy-cream font-medium underline hover:no-underline transition-all duration-200">
            Start free
          </Link>
        </p>
      </div>
    </div>
  )
}
