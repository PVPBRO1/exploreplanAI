import { BedDouble, Plane, Home, UtensilsCrossed, Ticket, Map } from 'lucide-react';

const categories = [
  {
    icon: BedDouble,
    label: 'Hotels',
    description: 'Stay at the best hotels around the world for the best prices.',
    soon: false,
  },
  {
    icon: Plane,
    label: 'Flights',
    description: 'Get real-time airfares for anywhere you want to jet off to.',
    soon: false,
  },
  {
    icon: Home,
    label: 'Stays',
    description: 'Find the perfect Airbnb or vacation rental matched to your preferences.',
    soon: false,
  },
  {
    icon: UtensilsCrossed,
    label: 'Restaurants',
    description: 'Snag a coveted table at the hottest restaurants near your destination.',
    soon: false,
  },
  {
    icon: Ticket,
    label: 'Experiences',
    description: 'Make reservations for your favorite activities, then make memories.',
    soon: true,
  },
  {
    icon: Map,
    label: 'Tours',
    description: "Get an insider's perspective on any location or attraction.",
    soon: true,
  },
];

export function OrganizeGrid() {
  return (
    <section className="bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-4">
            Organize it all in one place.
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From flights and hotels to restaurants and experiences, everything you need for your trip is right here.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.label}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 relative"
              >
                {cat.soon && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold text-white bg-zinc-800 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-zinc-700" />
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">{cat.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{cat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
