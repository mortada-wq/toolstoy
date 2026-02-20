import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Showcase } from './components/Showcase'
import { DemoModal } from './components/DemoModal'
import { HowItWorks } from './components/HowItWorks'
import { WorksAnywhere } from './components/WorksAnywhere'
import { CTASection } from './components/CTASection'
import { Footer } from './components/Footer'
import { type LayoutType } from './components/ShowcaseCard'

const LAYOUTS: LayoutType[] = [
  'Side by Side',
  'Character Top',
  'Chat Focus',
  'Mirror',
  'Immersive',
  'Compact',
  'Cinematic',
]

function App() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Showcase onCardClick={(index) => setSelectedCard(index)} />
        <HowItWorks />
        <WorksAnywhere />
        <CTASection />
        <Footer />
      </main>

      {selectedCard !== null && (
        <DemoModal
          layout={LAYOUTS[selectedCard]}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  )
}

export default App
