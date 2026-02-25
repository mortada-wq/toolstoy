import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from 'aws-amplify/auth'
import { Logo } from '@/components/ui/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

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
        options: { userAttributes, autoSignIn: false },
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
          : msg,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary py-12">
      <div className="bg-bg-secondary border border-border/15 rounded-lg p-8 md:p-12 w-[92vw] md:w-[440px] max-w-[440px] shadow-md">
        {/* Logo — dark variant on #252A36 (bg-secondary) */}
        <div className="flex justify-center mb-8">
          <Logo variant="dark" height={32} />
        </div>

        <h1 className="text-ds-2xl font-bold text-cream text-center">
          Create your account.
        </h1>
        <p className="mt-2 text-ds-base text-slate-text text-center">
          Your products&apos; first words are about to happen.
        </p>

        {error && (
          <div className="mt-6 p-4 bg-coral/10 border border-coral/25 rounded-md flex items-start gap-2">
            <svg className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-ds-sm text-coral">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            type="text"
            placeholder="Leo Tolstoy"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="leo@toolstoy.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <p className="mt-2 text-ds-sm text-steel-blue">Min 8 chars, 1 uppercase, 1 number, 1 symbol.</p>
          </div>
          <div>
            <Input
              label="Your Store URL"
              type="url"
              placeholder="https://yourstore.com"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
            />
            <p className="mt-2 text-ds-sm text-steel-blue">Works on any platform — Shopify, Wix, Webflow, or custom HTML.</p>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            intrinsic={false}
            size="lg"
            className="mt-2"
          >
            {isLoading ? 'Creating account…' : 'Create Free Account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-ds-sm text-steel-blue">
          By signing up you agree to our{' '}
          <Link to="/terms" className="text-slate-text underline hover:text-cream transition-colors">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-slate-text underline hover:text-cream transition-colors">Privacy Policy</Link>.
        </p>

        <p className="mt-5 text-center text-ds-sm text-steel-blue">
          Already have an account?{' '}
          <Link to="/signin" className="text-cream font-medium underline hover:no-underline transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
