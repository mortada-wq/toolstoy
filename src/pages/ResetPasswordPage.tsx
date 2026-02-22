import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { confirmResetPassword } from 'aws-amplify/auth'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string })?.email ?? ''
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !code.trim() || !password || !confirmPassword) {
      setError('Fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters with uppercase, number, and symbol.')
      return
    }
    setError('')
    setIsLoading(true)
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code.trim(),
        newPassword: password,
      })
      navigate('/signin', { state: { message: 'Password reset. Sign in with your new password.' }, replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again or request a new code.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-toolstoy-softgrey py-12 font-inter">
        <div className="bg-white rounded-lg p-8 md:p-12 w-[92vw] md:w-[400px] shadow-toolstoy text-center">
          <h1 className="text-[24px] font-bold text-toolstoy-nearblack">Session expired</h1>
          <p className="mt-2 text-[15px] text-toolstoy-muted">
            Please request a new password reset link.
          </p>
          <Link to="/forgot-password" className="mt-4 inline-block text-toolstoy-nearblack underline">
            Forgot Password
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
              className="h-[19.2px] w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
        </div>

        <h1 className="text-[24px] font-bold text-toolstoy-nearblack text-center">
          Create new password
        </h1>
        <p className="mt-2 text-[15px] text-toolstoy-muted text-center">
          Enter the code we sent to {email} and your new password.
        </p>

        <form className="mt-8" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-1.5">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-toolstoy-charcoal focus:outline-none"
            />
          </div>
          <div className="mt-4">
            <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-1.5">
              New password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-toolstoy-charcoal focus:outline-none"
            />
          </div>
          <div className="mt-4">
            <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-1.5">
              Confirm password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-toolstoy-charcoal focus:outline-none"
            />
          </div>
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
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-toolstoy-muted">
          <Link to="/signin" className="text-toolstoy-nearblack underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
