import { Link } from 'react-router-dom'
import { ScrollReveal } from './ScrollReveal'

export function Hero() {
  return (
    <section className="relative px-4 md:px-6 py-20 md:py-28 lg:py-[140px] bg-white">
      <div className="max-w-[720px] mx-auto text-center relative">
        <ScrollReveal delay={0}>
          <h1 className="text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[72px] font-bold text-[#1A1A1A] mb-8">
            Give Every Product a Voice.
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={80}>
          <p className="text-lg sm:text-xl text-[#6B7280] leading-relaxed font-normal">
            Upload your product. We build the character.
            <br className="hidden sm:block" />
            It talks to your customers — on any website.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={160}>
          <Link
            to="/signup"
            className="inline-block mt-11 bg-[#1A1A1A] text-white font-medium text-base sm:text-[17px] px-9 py-4 rounded-lg w-full sm:w-auto transition-all duration-200 hover:bg-[#282C34] min-h-[44px] flex items-center justify-center"
          >
            Create Your First Character
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}
