import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'

const PLATFORMS: Record<
  string,
  { title: string; steps: { title: string; desc: string }[]; estimate: string }
> = {
  wix: {
    title: 'Wix',
    estimate: '5 minutes',
    steps: [
      { title: 'Go to your Wix Editor', desc: 'Open your site in the Wix Editor.' },
      { title: 'Click Add > Embed > Custom Embed', desc: 'From the left menu, add an embed element.' },
      { title: 'Paste your embed code into the HTML box', desc: 'Copy the embed code from Widget Settings and paste it.' },
      { title: 'Publish your site. Done.', desc: 'Hit Publish and your character is live.' },
    ],
  },
  squarespace: {
    title: 'Squarespace',
    estimate: '5 minutes',
    steps: [
      { title: 'Open Page Editor', desc: 'Edit the page where you want the character.' },
      { title: 'Add a Code Block to your page', desc: 'Insert a Code block from the block menu.' },
      { title: 'Paste embed code. Save.', desc: 'Paste your embed code from Widget Settings.' },
      { title: 'Publish. Done.', desc: 'Save and publish your site.' },
    ],
  },
  wordpress: {
    title: 'WordPress',
    estimate: '5 minutes',
    steps: [
      { title: 'Go to Appearance > Theme Editor', desc: 'Or use the HTML block in Gutenberg.' },
      { title: 'Paste embed code before </body>', desc: 'Add the script tag before the closing body tag.' },
      { title: 'Save. Done.', desc: 'Save your changes.' },
    ],
  },
  webflow: {
    title: 'Webflow',
    estimate: '5 minutes',
    steps: [
      { title: 'Open Project Settings > Custom Code', desc: 'In your Webflow project, go to Project Settings.' },
      { title: 'Paste embed code in Footer Code', desc: 'Add the script to the Footer Code section.' },
      { title: 'Publish. Done.', desc: 'Publish your site to go live.' },
    ],
  },
  custom: {
    title: 'Custom HTML',
    estimate: '2 minutes',
    steps: [
      { title: 'Open your HTML file', desc: 'Edit your page or template.' },
      { title: 'Paste embed code before </body>', desc: 'Add the script tag before the closing body tag.' },
      { title: 'Save and upload. Done.', desc: 'Save and deploy your changes.' },
    ],
  },
}

const DEFAULT_EMBED = `<script
  src="https://cdn.toolstoy.app/widget.js"
  data-persona="YOUR_TOKEN"
  data-position="bottom-right"
></script>`

export function InstallGuidePage() {
  const { platform } = useParams<{ platform: string }>()
  const [copied, setCopied] = useState(false)
  const config = platform ? PLATFORMS[platform.toLowerCase()] : null

  const handleCopy = () => {
    navigator.clipboard.writeText(DEFAULT_EMBED)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[720px] mx-auto px-4 md:px-6 pt-20 pb-20">
        <nav className="text-[14px] text-[#6B7280] mb-8">
          <Link to="/" className="hover:text-[#1A1A1A] transition-all duration-200">Docs</Link>
          <span className="mx-2">→</span>
          <Link to="/docs/install" className="hover:text-[#1A1A1A] transition-all duration-200">Installation</Link>
          {config && (
            <>
              <span className="mx-2">/</span>
              <span className="text-[#1A1A1A]">{config.title}</span>
            </>
          )}
        </nav>

        {config ? (
          <>
            <h1 className="font-bold text-[40px] text-[#1A1A1A]">
              Installing Toolstoy on {config.title}
            </h1>
            <span className="inline-block mt-3 bg-[#F5F5F5] text-[#6B7280] font-medium text-[14px] px-3 py-1 rounded-[20px]">
              {config.estimate}
            </span>

            <div className="mt-12 space-y-8">
              {config.steps.map((step, i) => (
                <div key={i} className="flex gap-6">
                  <span className="flex-shrink-0 w-12 h-12 rounded-lg border-2 border-[#1A1A1A] flex items-center justify-center font-bold text-[18px] text-[#1A1A1A]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-semibold text-[18px] text-[#1A1A1A]">{step.title}</h3>
                    <p className="mt-1.5 text-[15px] text-[#6B7280]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-[#F5F5F5] rounded-lg">
              <p className="font-medium text-[13px] text-[#1A1A1A] mb-3">Your embed code</p>
              <pre className="p-4 bg-[#1A1A1A] rounded-lg text-[#22C55E] text-[13px] font-mono overflow-x-auto">
                {DEFAULT_EMBED}
              </pre>
              <button
                type="button"
                onClick={handleCopy}
                className="mt-3 border border-[#E5E7EB] bg-white text-[#1A1A1A] font-semibold text-[14px] px-4 py-2 rounded-lg hover:bg-[#FAFAFA]"
              >
                {copied ? 'Copied! ✓' : 'Copy'}
              </button>
            </div>

            <p className="mt-12 text-[14px] text-[#6B7280]">
              Still stuck? Email us at{' '}
              <a href="mailto:hello@toolstoy.app" className="text-[#1A1A1A] underline hover:no-underline">
                hello@toolstoy.app
              </a>
              .
            </p>
          </>
        ) : (
          <div>
            <h1 className="font-bold text-[40px] text-[#1A1A1A]">Installation Guides</h1>
            <p className="mt-4 text-[15px] text-[#6B7280]">
              Choose your platform to get step-by-step instructions.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(PLATFORMS).map((p) => (
                <Link
                  key={p}
                  to={`/docs/install/${p}`}
                  className="block p-4 border border-[#E5E7EB] rounded-lg hover:bg-[#FAFAFA]"
                >
                  <span className="font-semibold text-[15px] text-[#1A1A1A]">{PLATFORMS[p].title}</span>
                  <span className="block mt-1 text-[13px] text-[#6B7280]">{PLATFORMS[p].estimate}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
