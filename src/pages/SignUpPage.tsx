import { Link } from 'react-router-dom'
import logoSrc from '@/assets/Finaltoolstoy.svg'

export function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-toolstoy-softgrey py-12 font-inter">
      <div className="bg-white rounded-lg p-8 md:p-12 w-[92vw] md:w-[440px] shadow-toolstoy">
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
          Create your account.
        </h1>
        <p className="mt-2 text-[15px] text-toolstoy-muted text-center">
          Your products&apos; first words are about to happen.
        </p>

        <form className="mt-8" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Leo Tolstoy"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-toolstoy-charcoal focus:outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="leo@toolstoy.app"
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
          </div>

          <div className="mt-4">
            <label className="block font-medium text-[13px] text-toolstoy-nearblack mb-1.5">
              Your Store URL
            </label>
            <input
              type="url"
              placeholder="https://yourstore.com"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] font-normal focus:border-toolstoy-charcoal focus:outline-none"
            />
            <p className="mt-1 text-[12px] text-toolstoy-muted">
              Works on any platform — Wix, Squarespace, WordPress, Webflow, or custom HTML.
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-7 bg-toolstoy-charcoal text-white font-semibold text-[15px] py-3.5 rounded-lg transition-all duration-200 hover:opacity-90"
          >
            Create Free Account
          </button>
        </form>

        <p className="mt-4 text-center text-[12px] text-toolstoy-muted">
          By signing up you agree to our{' '}
          <a href="#" className="text-toolstoy-nearblack underline">Terms</a>
          {' '}and{' '}
          <a href="#" className="text-toolstoy-nearblack underline">Privacy Policy</a>.
        </p>

        <p className="mt-5 text-center text-sm text-toolstoy-muted">
          Already have an account?{' '}
          <Link to="/signin" className="text-toolstoy-nearblack underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
