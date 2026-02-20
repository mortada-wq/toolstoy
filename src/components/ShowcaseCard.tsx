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
      className="w-full bg-gray-50 border border-gray-200 rounded-lg overflow-hidden cursor-pointer text-left transition-all duration-200 hover:scale-[1.02] hover:border-gray-300 hover:shadow-md min-w-0"
    >
      {/* Preview zone */}
      <div className="relative bg-gray-200 flex items-center justify-center h-[200px] sm:h-[240px] lg:h-[280px]">
        <span className="text-toolstoy-muted text-sm">[ Character ]</span>
        <span className="absolute top-3 right-3 bg-white/80 text-toolstoy-muted font-normal text-[11px] px-2.5 py-1 rounded border border-gray-200">
          {layoutName}
        </span>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-toolstoy-nearblack font-normal text-[17px]">{characterName}</h3>
        <p className="text-toolstoy-muted text-[13px] font-normal mt-0.5">{productType}</p>
      </div>
    </button>
  )
}
