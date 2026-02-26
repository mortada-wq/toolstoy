import { Link } from 'react-router-dom'
import { ScrollReveal } from './ScrollReveal'
import { GradientStroke } from './GradientStroke'

export function CTASection() {
  return (
    <section className="relative px-4 md:px-6 py-20 sm:py-[100px] lg:py-[140px] bg-toolstoy-bg-overlay">
      <GradientStroke position="top" size={2} />
      <GradientStroke position="bottom" size={2} />
      <div className="max-w-[640px] mx-auto text-center">
        <ScrollReveal delay={0}>
          <h2 className="text-[28px] sm:text-4xl lg:text-[52px] font-bold text-toolstoy-cream leading-tight tracking-[-0.02em]">
            Your products have been silent long enough.
          </h2>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <p className="mt-5 text-lg sm:text-[22px] text-toolstoy-slateText font-normal">
            Give them something to say.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={160}>
          <Link
            to="/signup"
            className="inline-block mt-11 w-fit px-10 py-3.5 bg-toolstoy-orange text-toolstoy-cream font-semibold text-[17px] rounded-full transition-all duration-200 hover:shadow-orange-glow hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            Start Free — toolstoy.app
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
