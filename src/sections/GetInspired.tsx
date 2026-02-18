import { ImageSkeleton } from '../components/ImageSkeleton';
import { LinkButton } from '../components/LinkButton';
import { useTransitionNavigate } from '../components/TransitionContext';
import type { MouseEvent } from 'react';

const destinations = [
  { name: 'Paris, France', image: '/dest-paris.png', size: 'tall' },
  { name: '4-Days in Rome', image: '/dest-rome.png', size: 'normal' },
  { name: "Foodie's Tokyo", image: '/dest-tokyo.png', size: 'normal' },
  { name: 'Bali, Indonesia', image: '/dest-bali.png', size: 'normal' },
  { name: 'New York City', image: '/dest-nyc.png', size: 'normal' },
  { name: 'Barcelona, Spain', image: '/dest-barcelona.png', size: 'tall' },
  { name: 'Sydney, Australia', image: '/dest-sydney.png', size: 'normal' },
  { name: 'London, UK', image: '/dest-london.png', size: 'normal' },
];

export function GetInspired() {
  const { navigateWithTransition } = useTransitionNavigate();

  const handleCardClick = (e: MouseEvent<HTMLButtonElement>, _destName: string) => {
    const el = e.currentTarget;
    el.style.transform = 'scale(0.97)';
    el.style.opacity = '0.9';
    el.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
    setTimeout(() => {
      navigateWithTransition('/chat');
    }, 150);
  };

  return (
    <section id="inspired" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-3">
              Get inspired.
            </h2>
            <p className="text-gray-500 text-lg">
              Explore popular destinations and start planning your trip.
            </p>
          </div>
          <LinkButton
            to="/chat"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-[#0073cf]"
          >
            Plan a trip →
          </LinkButton>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {destinations.map((dest) => (
            <button
              key={dest.name}
              onClick={(e) => handleCardClick(e, dest.name)}
              className="group relative rounded-2xl overflow-hidden cursor-pointer block transition-all duration-150 text-left"
              style={{ aspectRatio: '3/4' }}
            >
              <ImageSkeleton
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-semibold text-sm sm:text-base leading-tight">{dest.name}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <LinkButton
            to="/chat"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:text-[#0073cf]"
          >
            Plan a trip →
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
