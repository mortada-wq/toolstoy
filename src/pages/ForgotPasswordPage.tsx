import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resetPassword } from 'aws-amplify/auth'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      await resetPassword({ username: email.trim() })
      setSent(true)
      navigate('/reset-password', { state: { email: email.trim() } })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Check your email and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-toolstoy-softgrey py-12 font-inter">
        <div className="bg-white rounded-lg p-8 md:p-12 w-[92vw] md:w-[400px] shadow-toolstoy text-center">
          <h1 className="text-[24px] font-bold text-toolstoy-nearblack">Check your email.</h1>
          <p className="mt-2 text-[15px] text-toolstoy-muted">
            We sent a reset link to <span className="font-medium text-toolstoy-nearblack">{email}</span>
          </p>
          <Link
            to="/signin"
            className="mt-6 inline-block text-toolstoy-nearblack underline"
          >
            Back to Sign In
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
          Forgot password?
        </h1>
        <p className="mt-2 text-[15px] text-toolstoy-muted text-center">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form className="mt-8" onSubmit={handleSubmit}>
          <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-toolstoy-charcoal focus:outline-none"
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
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-toolstoy-muted">
          Remember your password?{' '}
          <Link to="/signin" className="text-toolstoy-nearblack underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
