export function Hero() {
  return (
    <section className="pt-28 pb-12 sm:pt-36 sm:pb-20 bg-zinc-950 sm:bg-white">
      <div className="max-w-[60rem] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-[42px] sm:text-[64px] font-bold leading-[1.3] mb-4 sm:mb-6 text-white sm:text-zinc-900">
          Plan Smarter Trips,<br />
          Powered by <span className="text-[#F56551]">AI</span>
        </h1>
        <p className="max-w-[44rem] mx-auto text-base sm:text-xl mb-8 sm:mb-12 text-white/80 sm:text-gray-500 sm:leading-8 sm:px-16">
          Your intelligent travel companion that builds personalized, day by day
          itineraries around your style, interests, and budget.
        </p>
        <a
          href="#plan"
          className="inline-block bg-zinc-900 sm:bg-zinc-900 hover:opacity-90 text-white font-medium text-base px-8 py-3.5 rounded-lg transition-all duration-300"
        >
          Start Planning for Free
        </a>
      </div>
    </section>
  );
}
