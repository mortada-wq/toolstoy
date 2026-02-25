import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
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
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useUser()
  const [selectedCard, setSelectedCard] = useState<number | null>(null)

  // Signed in → go to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

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
