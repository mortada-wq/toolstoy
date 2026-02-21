import { useState } from 'react'

export interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set())

  const toggle = (index: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-6 cursor-pointer transition-all duration-200"
          onClick={() => toggle(index)}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-base text-toolstoy-nearblack">
              {item.question}
            </span>
            <span className="text-toolstoy-charcoal flex-shrink-0">
              {openIndices.has(index) ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </span>
          </div>
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${openIndices.has(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3 pt-3 border-t border-[#E5E7EB] text-[15px] text-[#6B7280] leading-relaxed">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
