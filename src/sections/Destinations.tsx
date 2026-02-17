import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const destinations = [
  {
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&q=80',
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=500&q=80',
  },
  {
    name: 'Rome',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&q=80',
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1573790387438-4da905039392?w=500&q=80',
  },
  {
    name: 'New York City',
    country: 'USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&q=80',
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=500&q=80',
  },
  {
    name: 'London',
    country: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&q=80',
  },
  {
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=500&q=80',
  },
];

export function Destinations() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -280 : 280,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="destinations" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-zinc-900">Popular destinations</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-[#e2e8f0] flex items-center justify-center text-[#718096] hover:border-[#0073cf] hover:text-[#0073cf] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-[#e2e8f0] flex items-center justify-center text-[#718096] hover:border-[#0073cf] hover:text-[#0073cf] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-gray-500 mb-6">Curated itineraries for every kind of traveler</p>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        >
          {destinations.map((dest, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-[260px] snap-start group cursor-pointer"
            >
              <div className="relative h-[320px] rounded-2xl overflow-hidden">
                <img
                  src={dest.image}
                  alt={`${dest.name}, ${dest.country}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">{dest.name}</h3>
                  <p className="text-white/80 text-sm">{dest.country}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
