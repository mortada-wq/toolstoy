import { Link } from 'react-router-dom'
import { ScrollReveal } from './ScrollReveal'

import { GradientStroke } from './GradientStroke'

export function Hero() {
  return (
    <section className="relative px-4 md:px-6 py-20 md:py-28 lg:py-[140px] bg-toolstoy-bg-primary">
      <GradientStroke position="bottom" size={2} />
      <div className="max-w-[720px] mx-auto text-center relative">
        <ScrollReveal delay={0}>
          <h1 className="text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[72px] font-bold text-toolstoy-cream mb-8">
            Give Every Product a Voice.
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <p className="text-lg sm:text-xl text-toolstoy-slateText leading-relaxed font-normal">
            Upload your product. We build the character.
            <br className="hidden sm:block" />
            It talks to your customers — on any website.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={160}>
          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-fit px-10 py-3.5 bg-toolstoy-orange text-toolstoy-cream font-semibold text-[15px] sm:text-[17px] rounded-full transition-all duration-200 hover:shadow-orange-glow hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
            >
              Create Your First Character
            </Link>
            <a
              href="#showcase"
              className="text-[15px] text-toolstoy-slateText hover:text-toolstoy-cream transition-colors duration-200"
            >
              View demo →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
