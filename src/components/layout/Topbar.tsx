interface TopbarProps {
  title: string
  onMenuClick: () => void
  isAdmin?: boolean
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  return (
    <header className="h-16 bg-toolstoy-bg-secondary border-b border-toolstoy-steelBlue/15 flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-toolstoy-cream transition-all duration-200"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="font-semibold text-[17px] text-toolstoy-cream hidden md:block">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative w-10 h-10 flex items-center justify-center text-toolstoy-slateText">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Red dot for alerts - optional */}
          {/* <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" /> */}
        </button>
      </div>
    </header>
  )
}
