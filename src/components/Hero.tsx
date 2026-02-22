import { Link } from 'react-router-dom'
import { ScrollReveal } from './ScrollReveal'

export function Hero() {
  return (
    <section className="relative px-4 md:px-6 py-20 md:py-28 lg:py-[140px] bg-toolstoy-canvas">
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
          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-fit px-10 py-3.5 bg-[#1A1A1A] text-white font-medium text-base sm:text-[17px] rounded-lg transition-all duration-200 hover:bg-[#282C34] flex items-center justify-center"
            >
              Create Your First Character
            </Link>
            <a
              href="#showcase"
              className="text-[15px] text-[#6B7280] hover:text-[#1A1A1A] transition-colors duration-200"
            >
              View demo →
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
