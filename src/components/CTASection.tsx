import { Link } from 'react-router-dom'
import { ScrollReveal } from './ScrollReveal'

export function CTASection() {
  return (
    <section className="px-4 md:px-6 py-20 sm:py-[100px] lg:py-[140px] bg-gray-50">
      <div className="max-w-[640px] mx-auto text-center">
        <ScrollReveal delay={0}>
          <h2 className="text-[28px] sm:text-4xl lg:text-[52px] font-normal text-toolstoy-nearblack leading-tight tracking-[-0.02em]">
            Your products have been silent long enough.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <p className="mt-5 text-lg sm:text-[22px] text-toolstoy-muted font-normal">
            Give them something to say.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={160}>
          <Link
            to="/signup"
            className="inline-block mt-11 border border-gray-300 bg-white text-toolstoy-nearblack font-normal text-[17px] px-10 py-4 rounded-lg w-full sm:w-auto transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 min-h-[44px] flex items-center justify-center"
          >
            Start Free — toolstoy.app
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
