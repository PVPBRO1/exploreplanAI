import { LinkButton } from '../components/LinkButton';
import { ImageSkeleton } from '../components/ImageSkeleton';
import { HERO_IMAGES } from '../lib/constants/images';

interface HeroProps {
  onSeeHowItWorks?: () => void;
}

export function Hero({ onSeeHowItWorks }: HeroProps) {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-b from-[#f0f7ff] via-[#f7faff] to-white">
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-0">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="hero-heading mb-12 lg:mb-0">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-zinc-900 mb-6">
              Travel<br />differently.
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed mb-10 max-w-md">
              ExplorePlan brings the world to you. Tell our AI where you want to go
              and it builds a personalized, day by day itinerary around your style,
              budget, and interests.
            </p>
            <div className="hero-cta flex flex-wrap items-center gap-4">
              <LinkButton
                to="/chat"
                className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-base px-7 py-3.5 rounded-full hover:shadow-xl hover:-translate-y-0.5"
              >
                Start chatting
              </LinkButton>
              <button
                onClick={onSeeHowItWorks}
                className="inline-flex items-center gap-2 text-zinc-900 hover:text-gray-600 font-medium text-base px-2 py-3.5 transition-colors duration-300"
              >
                <span className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm">▶</span>
                See how it works
              </button>
            </div>
          </div>

          <div className="hero-images relative h-[480px] lg:h-[560px]">
            <div className="absolute left-0 top-8 w-[48%] h-[260px] rounded-2xl shadow-xl overflow-hidden">
              <ImageSkeleton
                src={HERO_IMAGES[0].src}
                alt={HERO_IMAGES[0].alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            <div className="absolute right-0 top-0 w-[50%] h-[300px] rounded-2xl shadow-2xl overflow-hidden">
              <ImageSkeleton
                src={HERO_IMAGES[1].src}
                alt={HERO_IMAGES[1].alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            <div className="absolute left-0 bottom-8 w-[48%] h-[230px] rounded-2xl shadow-xl overflow-hidden">
              <ImageSkeleton
                src={HERO_IMAGES[2].src}
                alt={HERO_IMAGES[2].alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            <div className="absolute right-0 bottom-0 w-[50%] h-[220px] rounded-2xl shadow-xl overflow-hidden">
              <ImageSkeleton
                src={HERO_IMAGES[3].src}
                alt={HERO_IMAGES[3].alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
