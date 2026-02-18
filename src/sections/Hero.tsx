import { useState, useEffect, useRef } from 'react';
import { LinkButton } from '../components/LinkButton';

interface Destination {
  image: string;
  name: string;
}

const destinations: Destination[] = [
  { image: '/dest-tokyo.png', name: 'Tokyo, Japan' },
  { image: '/dest-paris.png', name: 'Paris, France' },
  { image: '/dest-bali.png', name: 'Bali, Indonesia' },
  { image: '/dest-barcelona.png', name: 'Barcelona, Spain' },
  { image: '/hero-egypt.png', name: 'Egypt' },
  { image: '/hero-dubai.png', name: 'Dubai' },
  { image: '/hero-great-wall.png', name: 'Great Wall, China' },
  { image: '/hero-nepal.png', name: 'Nepal' },
  { image: '/dest-rome.png', name: 'Rome, Italy' },
  { image: '/dest-nyc.png', name: 'New York City' },
  { image: '/dest-sydney.png', name: 'Sydney, Australia' },
  { image: '/dest-london.png', name: 'London, UK' },
  { image: '/hero-yosemite.png', name: 'Yosemite' },
  { image: '/hero-london.png', name: 'London Bridge' },
  { image: '/hero-porto.png', name: 'Porto, Portugal' },
  { image: '/hero-tuscany.png', name: 'Tuscany, Italy' },
  { image: '/hero-mexico.png', name: 'Mexico City' },
];

const SLOT_COUNT = 4;
const CYCLE_MS = 8000;
const STAGGER_MS = 2000;
const FADE_MS = 2000;

function RotatingImage({
  items,
  startIndex,
  delay,
  className,
}: {
  items: Destination[];
  startIndex: number;
  delay: number;
  className: string;
}) {
  const [activeIdx, setActiveIdx] = useState(startIndex);
  const [nextIdx, setNextIdx] = useState(startIndex);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const cycle = () => {
      setNextIdx((prev) => {
        const next = (prev + SLOT_COUNT) % items.length;
        setFading(true);
        setTimeout(() => {
          setActiveIdx(next);
          setFading(false);
        }, FADE_MS);
        return next;
      });
    };

    const initialTimer = setTimeout(() => {
      cycle();
      intervalRef.current = setInterval(cycle, CYCLE_MS);
    }, delay);

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [items.length, delay]);

  const current = items[activeIdx];
  const next = items[nextIdx];

  return (
    <div className={`${className} overflow-hidden`}>
      <img
        src={next.image}
        alt={next.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <img
        src={current.image}
        alt={current.name}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity ease-in-out ${
          fading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-b from-[#f0f7ff] via-[#f7faff] to-white">
      <div className="hero-glow hero-glow-1" />
      <div className="hero-glow hero-glow-2" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-0">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

          {/* Left: Text */}
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
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-zinc-900 hover:text-gray-600 font-medium text-base px-2 py-3.5 transition-colors duration-300"
              >
                <span className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-sm">▶</span>
                See how it works
              </a>
            </div>
          </div>

          {/* Right: Rotating image collage */}
          <div className="hero-images relative h-[480px] lg:h-[560px]">
            <RotatingImage
              items={destinations}
              startIndex={0}
              delay={STAGGER_MS * 0 + CYCLE_MS}
              className="absolute left-0 top-8 w-[48%] h-[260px] rounded-2xl shadow-xl"
            />
            <RotatingImage
              items={destinations}
              startIndex={1}
              delay={STAGGER_MS * 1 + CYCLE_MS}
              className="absolute right-0 top-0 w-[50%] h-[300px] rounded-2xl shadow-2xl"
            />
            <RotatingImage
              items={destinations}
              startIndex={2}
              delay={STAGGER_MS * 2 + CYCLE_MS}
              className="absolute left-0 bottom-8 w-[48%] h-[230px] rounded-2xl shadow-xl"
            />
            <RotatingImage
              items={destinations}
              startIndex={3}
              delay={STAGGER_MS * 3 + CYCLE_MS}
              className="absolute right-0 bottom-0 w-[50%] h-[220px] rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
