import { LinkButton } from '../components/LinkButton';

export function CTABanner() {
  return (
    <section className="px-4 sm:px-8 py-12 sm:py-20 bg-white">
      <div className="max-w-5xl mx-auto bg-zinc-950 rounded-3xl px-8 sm:px-16 py-16 sm:py-20 text-center relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#0073cf]/20 blur-[80px] rounded-full pointer-events-none" />

        <p className="text-sm font-semibold text-[#00b4d8] uppercase tracking-widest mb-5 relative z-10">Start planning</p>
        <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-6 max-w-2xl mx-auto relative z-10">
          Stop researching for hours.<br className="hidden sm:block" />
          Let AI plan your trip in minutes.
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto relative z-10">
          Completely free. No account needed to get started.
        </p>
        <LinkButton
          to="/chat"
          className="relative z-10 inline-flex items-center gap-2 bg-white text-zinc-900 font-semibold text-base px-8 py-3.5 rounded-full hover:opacity-90 hover:-translate-y-0.5 hover:shadow-xl"
        >
          Start chatting
        </LinkButton>
      </div>
    </section>
  );
}
