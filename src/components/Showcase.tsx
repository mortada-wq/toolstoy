import { ShowcaseCard, type LayoutType } from './ShowcaseCard'
import { ScrollReveal } from './ScrollReveal'

const CARDS: { layoutName: LayoutType; characterName: string; productType: string }[] = [
  { layoutName: 'Side by Side', characterName: 'Character Name', productType: 'Product Type' },
  { layoutName: 'Character Top', characterName: 'Character Name', productType: 'Product Type' },
  { layoutName: 'Chat Focus', characterName: 'Character Name', productType: 'Product Type' },
  { layoutName: 'Mirror', characterName: 'Character Name', productType: 'Product Type' },
  { layoutName: 'Immersive', characterName: 'Character Name', productType: 'Product Type' },
  { layoutName: 'Compact', characterName: 'Character Name', productType: 'Product Type' },
  { layoutName: 'Cinematic', characterName: 'Character Name', productType: 'Product Type' },
]

interface ShowcaseProps {
  onCardClick: (index: number) => void
}

export function Showcase({ onCardClick }: ShowcaseProps) {
  return (
    <section className="px-4 md:px-6 py-16 sm:py-[60px] lg:py-[100px] bg-white">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-[30px] sm:text-[44px] font-normal text-toolstoy-nearblack text-center">
          See It In Action
        </h2>
        <p className="text-lg text-toolstoy-muted text-center mt-2 font-normal">
          Click any character to have a real conversation.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {CARDS.map((card, index) => (
            <ScrollReveal key={card.layoutName} delay={index * 80}>
              <ShowcaseCard
                layoutName={card.layoutName}
                characterName={card.characterName}
                productType={card.productType}
                onClick={() => onCardClick(index)}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
