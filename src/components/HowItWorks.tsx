import { ScrollReveal } from './ScrollReveal'

export function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Upload Your Product',
      description: 'Paste a URL or upload an image. We handle the rest.',
    },
    {
      number: '02',
      title: 'AI Builds the Character',
      description:
        "Our Soul Engine — powered by Amazon Bedrock — generates a full personality, voice, and animated character. Unique to your product. Every time.",
    },
    {
      number: '03',
      title: 'Paste. Go Live.',
      description:
        'Two lines of code. That\'s it. Works on Wix, Squarespace, WordPress, Webflow, or any HTML page on the planet.',
    },
  ]

  return (
    <section className="px-4 md:px-6 py-16 sm:py-[60px] lg:py-[100px] bg-gray-50">
      <div className="max-w-[900px] mx-auto">
        <h2 className="text-[30px] sm:text-[44px] font-normal text-toolstoy-nearblack text-center">
          From Product to Personality.
        </h2>
        <p className="text-lg text-toolstoy-muted text-center mt-2 font-normal">
          Three steps. No technical knowledge required.
        </p>

        <div className="mt-16 flex flex-col md:flex-row gap-12 md:gap-12">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} delay={index * 80}>
            <div className="flex-1 relative min-w-0">
              <span className="absolute -top-2 left-0 font-light text-[96px] text-gray-200 leading-none select-none -z-0">
                {step.number}
              </span>
              <h3 className="relative z-10 font-normal text-[22px] text-toolstoy-nearblack -mt-1">
                {step.title}
              </h3>
              <p className="mt-3 text-base text-toolstoy-muted leading-relaxed font-normal">
                {step.description}
              </p>
            </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
