import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const navigate = useNavigate()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    if (value && index === 5 && newCode.every(d => d)) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
    setCode(newCode)
    
    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (codeString: string) => {
    if (!email || !codeString || codeString.length !== 6) {
      setError('Enter the 6-digit code from your email.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      await confirmSignUp({ username: email, confirmationCode: codeString })
      // User is not auto-signed in after verification — redirect to sign in with success message
      navigate('/signin?verified=1', { replace: true, state: { email } })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid code. Check the code and try again.'
      )
      // Clear code on error
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleVerify(code.join(''))
  }

  const handleResend = async () => {
    if (!email) return
    setError('')
    setResending(true)
    setResendSuccess(false)
    try {
      await resendSignUpCode({ username: email })
      setError('')
      setCode(['', '', '', '', '', ''])
      setResendSuccess(true)
      inputRefs.current[0]?.focus()
      setTimeout(() => setResendSuccess(false), 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not resend. Try again later.'
      )
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-toolstoy-softgrey py-12 font-inter">
        <div className="bg-white rounded-lg p-8 md:p-12 w-[92vw] md:w-[400px] shadow-toolstoy text-center">
          <h1 className="text-[24px] font-bold text-toolstoy-nearblack">Missing email</h1>
          <p className="mt-2 text-[15px] text-toolstoy-muted">
            Please complete sign up to receive a verification code.
          </p>
          <Link to="/signup" className="mt-4 inline-block text-toolstoy-nearblack underline">
            Back to Sign Up
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-toolstoy-softgrey py-12 font-inter">
      <div className="bg-white rounded-lg p-8 md:p-12 w-[92vw] md:w-[480px] shadow-toolstoy">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-toolstoy-charcoal rounded-lg px-5 py-3">
            <img
              src={logoSrc}
              alt="toolstoy"
              className="h-[19.2px] w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
        </div>

        {/* Email icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-toolstoy-nearblack text-center">
          Check your email
        </h1>
        <p className="mt-3 text-[15px] text-toolstoy-muted text-center leading-relaxed">
          We sent a 6-digit code to<br />
          <span className="font-semibold text-toolstoy-nearblack">{email}</span>
        </p>

        <form className="mt-10" onSubmit={handleSubmit}>
          <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-3 text-center">
            Enter verification code
          </label>
          
          {/* 6-digit code inputs */}
          <div className="flex gap-2 md:gap-3 justify-center" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 md:w-14 md:h-16 text-center text-[24px] font-semibold border-2 rounded-lg transition-all duration-200 ${
                  error
                    ? 'border-[#EF4444] bg-[#FEF2F2]'
                    : digit
                    ? 'border-[#1A1A1A] bg-white'
                    : 'border-[#E5E7EB] bg-white hover:border-[#6B7280]'
                } focus:border-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10`}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg">
              <p className="text-[13px] text-[#EF4444] text-center">{error}</p>
            </div>
          )}

          {resendSuccess && (
            <div className="mt-4 p-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-lg">
              <p className="text-[13px] text-[#22C55E] text-center">Code sent! Check your email.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || code.some(d => !d)}
            className="w-full mt-6 bg-toolstoy-charcoal text-white font-semibold text-[15px] py-3.5 rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
          <p className="text-center text-[14px] text-toolstoy-muted">
            Didn&apos;t receive the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-toolstoy-nearblack font-medium underline hover:no-underline disabled:opacity-60 transition-opacity"
            >
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          </p>
          <p className="mt-3 text-center text-[13px] text-[#6B7280]">
            Wrong email?{' '}
            <Link to="/signup" className="text-toolstoy-nearblack underline hover:no-underline">
              Sign up again
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
