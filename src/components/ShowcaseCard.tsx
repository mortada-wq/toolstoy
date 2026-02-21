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
      className="w-full bg-[#F5F5F5] border border-[#E5E7EB] rounded-lg overflow-hidden cursor-pointer text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] min-w-0"
    >
      {/* Preview zone */}
      <div className="relative bg-[#E5E7EB] flex items-center justify-center h-[200px] sm:h-[240px] lg:h-[280px]">
        <span className="text-[#6B7280] text-sm">[ Character ]</span>
        <span className="absolute top-3 right-3 bg-[rgba(255,255,255,0.1)] text-[#6B7280] font-medium text-[14px] px-2.5 py-1 rounded-[4px]">
          {layoutName}
        </span>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="text-[#1A1A1A] font-normal text-[17px]">{characterName}</h3>
        <p className="text-[#6B7280] text-[14px] font-normal mt-0.5">{productType}</p>
      </div>
    </button>
  )
}
