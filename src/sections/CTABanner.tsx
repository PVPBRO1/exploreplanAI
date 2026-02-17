export function CTABanner() {
  return (
    <section className="px-4 sm:px-8 py-12 sm:py-20">
      <div className="max-w-4xl mx-auto bg-zinc-950 rounded-2xl px-8 py-14 sm:py-16 text-center">
        <h2 className="text-2xl sm:text-4xl font-semibold text-white leading-snug sm:leading-[3rem] mb-8 max-w-2xl mx-auto">
          Stop researching for hours. Let AI build your ideal trip plan in
          minutes, completely free.
        </h2>
        <a
          href="#plan"
          className="inline-block bg-white text-zinc-900 font-medium text-base px-8 py-3.5 rounded-lg hover:opacity-90 transition-all duration-300"
        >
          Try It Now
        </a>
      </div>
    </section>
  );
}
