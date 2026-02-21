import { useState } from 'react'
import { Hero } from '../components/Hero'
import { Showcase } from '../components/Showcase'
import { DemoModal } from '../components/DemoModal'
import { HowItWorks } from '../components/HowItWorks'
import { WorksAnywhere } from '../components/WorksAnywhere'
import { CTASection } from '../components/CTASection'
import { type LayoutType } from '../components/ShowcaseCard'

const LAYOUTS: LayoutType[] = [
  'Side by Side',
  'Character Top',
  'Chat Focus',
  'Mirror',
  'Immersive',
  'Compact',
  'Cinematic',
]

export function HomePage() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null)

  return (
    <>
      <Hero />
      <Showcase onCardClick={(index) => setSelectedCard(index)} />
      <HowItWorks />
      <WorksAnywhere />
      <CTASection />
      {selectedCard !== null && (
        <DemoModal
          layout={LAYOUTS[selectedCard]}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </>
  )
}
