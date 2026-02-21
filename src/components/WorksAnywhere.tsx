export function WorksAnywhere() {
  const platforms = ['Wix', 'Squarespace', 'WordPress', 'Webflow', 'Custom HTML']

  return (
    <section className="px-4 md:px-6 py-16 bg-white">
      <p className="text-[#6B7280] text-xs font-medium tracking-[0.1em] uppercase text-center">
        WORKS ON ANY PLATFORM
      </p>
      <div className="mt-4 flex flex-wrap justify-center items-center gap-x-7 md:gap-x-12">
        {platforms.map((platform, i) => (
          <span key={platform} className="text-[#6B7280] font-normal text-[15px]">
            {platform}
            {i < platforms.length - 1 && ' · '}
          </span>
        ))}
      </div>
    </section>
  )
}
