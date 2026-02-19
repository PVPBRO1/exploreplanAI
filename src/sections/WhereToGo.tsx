import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const trips = [
  {
    id: 1,
    category: 'Family',
    destination: 'Europe Trip',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    msg: "Help me plan a family trip to Europe",
  },
  {
    id: 2,
    category: 'Couples',
    destination: 'Honeymoon in Santorini',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80',
    msg: "Plan a romantic honeymoon trip to Santorini, Greece",
  },
  {
    id: 3,
    category: 'Road Trip',
    destination: 'Pacific Coast Highway',
    image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80',
    msg: "Help me plan an epic road trip along the Pacific Coast Highway",
  },
];

export function WhereToGo() {
  const navigate = useNavigate();

  return (
    <section id="where-to-go" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-12">
          Where to go next
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <button
              key={trip.id}
              onClick={() => navigate(`/chat?msg=${encodeURIComponent(trip.msg)}`)}
              className="group text-left block rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={trip.image}
                  alt={`${trip.category} — ${trip.destination}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5 bg-white">
                <p className="text-gray-400 text-sm mb-1">
                  {trip.category}
                </p>
                <p className="text-gray-900 font-semibold text-base mb-1">{trip.destination}</p>
                <div className="flex items-center gap-1.5 text-zinc-900 font-medium text-sm group-hover:text-[#0073cf] transition-colors">
                  <span>Start planning</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
