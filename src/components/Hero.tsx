export function Hero() {
  return (
    <section className="relative px-4 md:px-6 py-20 md:py-28 lg:py-[140px] bg-white">
      <div className="max-w-[720px] mx-auto text-center relative">
        <h1 className="text-[36px] leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[72px] font-normal text-toolstoy-nearblack mb-8">
          Give Every Product a Voice.
        </h1>
        <p className="text-lg sm:text-xl text-toolstoy-muted leading-relaxed font-normal">
          Upload your product. We build the character.
          <br className="hidden sm:block" />
          It talks to your customers — on any website.
        </p>
        <a
          href="#start"
          className="inline-block mt-11 border border-gray-300 bg-gray-50 text-toolstoy-nearblack font-normal text-base sm:text-[17px] px-9 py-4 rounded-lg w-full sm:w-auto transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 min-h-[44px] flex items-center justify-center"
        >
          Create Your First Character
        </a>
      </div>
    </section>
  )
}
