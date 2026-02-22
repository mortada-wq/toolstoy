import { ShowcaseCard, type LayoutType } from './ShowcaseCard'
import { ScrollReveal } from './ScrollReveal'

const CARDS: { layoutName: LayoutType; characterName: string; productType: string }[] = [
  { layoutName: 'Side by Side', characterName: 'Max', productType: 'Wireless Headphones' },
  { layoutName: 'Character Top', characterName: 'Luna', productType: 'Skincare Serum' },
  { layoutName: 'Chat Focus', characterName: 'Atlas', productType: 'Travel Backpack' },
  { layoutName: 'Mirror', characterName: 'Sage', productType: 'Smart Home Hub' },
  { layoutName: 'Immersive', characterName: 'Nova', productType: 'Gaming Keyboard' },
  { layoutName: 'Compact', characterName: 'Finn', productType: 'Coffee Maker' },
  { layoutName: 'Cinematic', characterName: 'Echo', productType: 'Electric Bike' },
]

interface ShowcaseProps {
  onCardClick: (index: number) => void
}

export function Showcase({ onCardClick }: ShowcaseProps) {
  return (
    <section id="showcase" className="scroll-mt-20 px-4 md:px-6 py-16 sm:py-[60px] lg:py-[100px] bg-toolstoy-canvas">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-[30px] sm:text-[44px] font-normal text-toolstoy-nearblack text-center">
          See It In Action
        </h2>
        <p className="text-lg text-toolstoy-muted text-center mt-2 font-normal">
          Click any character to have a real conversation.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          {CARDS.map((card, index) => {
            const isFeatured = card.layoutName === 'Cinematic' || card.layoutName === 'Immersive'
            return (
              <ScrollReveal
                key={card.layoutName}
                delay={index * 100}
                className={isFeatured ? 'lg:col-span-2' : ''}
              >
                <ShowcaseCard
                  layoutName={card.layoutName}
                  characterName={card.characterName}
                  productType={card.productType}
                  onClick={() => onCardClick(index)}
                />
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
