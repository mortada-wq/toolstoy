import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !code.trim()) {
      setError('Enter the 6-digit code from your email.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      await confirmSignUp({ username: email, confirmationCode: code.trim() })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid code. Check the code and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setError('')
    setResending(true)
    try {
      await resendSignUpCode({ username: email })
      setError('')
      setCode('')
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
      <div className="bg-white rounded-lg p-8 md:p-12 w-[92vw] md:w-[400px] shadow-toolstoy">
        <div className="flex justify-center mb-8">
          <div className="bg-toolstoy-charcoal rounded-lg px-5 py-3">
            <img
              src={logoSrc}
              alt="toolstoy"
              className="h-6 w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
        </div>

        <h1 className="text-[24px] font-bold text-toolstoy-nearblack text-center">
          Check your email.
        </h1>
        <p className="mt-2 text-[15px] text-toolstoy-muted text-center">
          We sent a 6-digit code to <span className="font-medium text-toolstoy-nearblack">{email}</span>
        </p>

        <form className="mt-8" onSubmit={handleVerify}>
          <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-1.5">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-[18px] font-medium tracking-[0.3em] text-center focus:border-toolstoy-charcoal focus:outline-none"
          />
          {error && (
            <p className="mt-2 text-[13px] text-[#EF4444]" style={{ marginTop: 8 }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-toolstoy-charcoal text-white font-semibold text-[15px] py-3.5 rounded-lg transition-all duration-200 hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-toolstoy-muted">
          Didn&apos;t get the code?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-toolstoy-nearblack underline hover:no-underline disabled:opacity-60"
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        </p>
      </div>
    </div>
  )
}
