export type LayoutType =
  | 'Side by Side'
  | 'Character Top'
  | 'Chat Focus'
  | 'Mirror'
  | 'Immersive'
  | 'Compact'
  | 'Cinematic'

export interface ShowcaseCardProps {
  layoutName: LayoutType
  characterName: string
  productType: string
  onClick: () => void
}

export function ShowcaseCard({ layoutName, characterName, productType, onClick }: ShowcaseCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-toolstoy-bg-overlay rounded-toolstoy-lg overflow-hidden cursor-pointer text-left transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] hover:shadow-toolstoy-hover active:scale-[0.98] border border-toolstoy-steelBlue/15 min-w-0 shadow-toolstoy"
    >
      {/* Preview zone */}
      <div className="relative bg-toolstoy-bg-primary flex items-center justify-center h-[200px] sm:h-[240px] lg:h-[280px]">
        <span className="text-toolstoy-steelBlue text-sm">[ Character ]</span>
        <span className="absolute top-3 right-3 bg-toolstoy-steelBlue/15 text-toolstoy-slateText font-medium text-[14px] px-2.5 py-1 rounded-toolstoy-sm">
          {layoutName}
        </span>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-toolstoy-cream font-normal text-[17px]">{characterName}</h3>
        <p className="text-toolstoy-slateText text-[14px] font-normal mt-0.5">{productType}</p>
      </div>
    </button>
  )
}
