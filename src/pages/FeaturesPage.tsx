import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: 'brain',
    title: 'Soul Engine',
    description: 'Amazon Bedrock generates a full Character Bible before a single pixel is drawn. Personality, backstory, quirks — all automatic.',
  },
  {
    icon: 'book',
    title: 'Auto-Built Knowledge Base',
    description: 'Paste a URL. Upload an image. AI generates 30 ready-to-use Q&A pairs. You review, edit, approve. Done.',
  },
  {
    icon: 'chat',
    title: 'Conversations That Actually Work',
    description: 'Powered by Amazon Bedrock. Your character answers real questions, in character, grounded in your product data.',
  },
  {
    icon: 'play',
    title: 'Four Animation States',
    description: 'Idle. Thinking. Talking. Celebrating. The character\'s body language is a language. Every state means something.',
  },
  {
    icon: 'code',
    title: 'Two Lines of Code',
    description: 'One script tag. Works on Wix, Squarespace, WordPress, Webflow, or any HTML page on the planet.',
  },
  {
    icon: 'chart',
    title: 'Toolstizer — The Machine Room',
    description: 'Merchant health scores. Pipeline monitor. Quality control. Toolstizer knows something is wrong before the merchant emails you at 11pm.',
  },
]

const IconComponent = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'brain':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    case 'book':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'chat':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    case 'play':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'code':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      )
    case 'chart':
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    default:
      return null
  }
}

export function FeaturesPage() {
  return (
    <div className="bg-toolstoy-canvas font-inter">
      {/* Hero */}
      <section className="px-4 md:px-6 pt-[80px] md:pt-[120px] pb-12">
        <div className="max-w-[720px] mx-auto text-center">
          <h1 className="text-[32px] sm:text-[40px] md:text-[64px] font-bold text-toolstoy-nearblack leading-[1.05] tracking-[-0.02em]">
            Everything Your Character Needs to Sell.
          </h1>
          <p className="mt-5 text-lg md:text-xl text-toolstoy-muted font-normal">
            Soul Engine. Smart conversations. Two lines of code.
            <br />
            Built entirely on AWS — no external services.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 md:px-6 py-12 md:py-20 lg:py-[80px]">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-toolstoy-softgrey rounded-lg p-8 transition-all duration-200 ease-in hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
              >
                <div className="w-10 h-10 bg-toolstoy-charcoal rounded-lg flex items-center justify-center mb-5">
                  <IconComponent icon={feature.icon} />
                </div>
                <h3 className="font-semibold text-lg text-toolstoy-nearblack">{feature.title}</h3>
                <p className="mt-2.5 text-[15px] text-toolstoy-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AWS Callout */}
      <section className="px-4 md:px-6 py-12 md:py-20 lg:py-[80px] bg-toolstoy-charcoal">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-2xl md:text-[36px] font-bold text-white">
            Powered entirely by AWS.
          </h2>
          <p className="mt-4 text-[17px] text-toolstoy-muted">
            Amazon Bedrock for AI. RDS PostgreSQL for data.
            S3 for assets. App Runner for the API.
            CloudFront for delivery. Zero external dependencies.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-4 md:px-6 py-12 md:py-20 lg:py-[80px] bg-toolstoy-canvas">
        <div className="max-w-[640px] mx-auto text-center">
          <h2 className="text-[26px] md:text-[36px] font-bold text-toolstoy-nearblack">
            Ready to give your products a voice?
          </h2>
          <Link
            to="/signup"
            className="inline-block mt-8 w-fit px-10 py-3.5 bg-toolstoy-charcoal text-white font-semibold text-base rounded-lg transition-all duration-200 hover:opacity-90"
          >
            Start Free — toolstoy.app
          </Link>
        </div>
      </section>
    </div>
  )
}
