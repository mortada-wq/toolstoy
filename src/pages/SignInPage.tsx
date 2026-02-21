import { Link, useNavigate } from 'react-router-dom'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function SignInPage() {
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/dashboard') // Dummy redirect — no real auth in Phase 3
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-toolstoy-softgrey py-12 font-inter">
      <div className="bg-white rounded-lg p-8 md:p-12 w-[92vw] md:w-[400px] shadow-toolstoy">
        {/* Logo pill */}
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

        <h1 className="text-[28px] font-bold text-toolstoy-nearblack text-center">
          Welcome back.
        </h1>
        <p className="mt-2 text-[15px] text-toolstoy-muted text-center">
          Sign in to your Toolstoy account.
        </p>

        <form className="mt-8" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-toolstoy-charcoal focus:outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-1.5">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-toolstoy-charcoal focus:outline-none"
            />
            <a href="#" className="block text-right mt-2 text-[13px] text-toolstoy-muted hover:text-toolstoy-nearblack">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-toolstoy-charcoal text-white font-semibold text-[15px] py-3.5 rounded-lg transition-all duration-200 hover:opacity-90"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-toolstoy-muted">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <p className="mt-5 text-center text-sm text-toolstoy-muted">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-toolstoy-nearblack underline">
            Start free
          </Link>
        </p>
      </div>
    </div>
  )
}
