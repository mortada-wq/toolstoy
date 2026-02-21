import { useState } from 'react'

export interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg p-6 cursor-pointer transition-all duration-200"
          onClick={() => setOpenIndex(openIndex === index ? null : index)}
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-base text-toolstoy-nearblack">
              {item.question}
            </span>
            <span className="text-toolstoy-charcoal flex-shrink-0">
              {openIndex === index ? (
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
          {openIndex === index && (
            <div
              className="mt-3 pt-3 border-t border-gray-100 text-[15px] text-toolstoy-muted leading-relaxed"
              onClick={(e) => e.stopPropagation()}
            >
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
