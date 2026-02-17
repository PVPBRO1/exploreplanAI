export function FeaturedTrips() {
  const trips = [
    {
      label: 'MOST POPULAR',
      title: '7-Day Paris Itinerary',
      description:
        'Explore the Eiffel Tower, hidden bistros in Le Marais, day trips to Versailles, and evening walks along the Seine.',
      cta: 'View Plan',
      bg: 'bg-gradient-to-br from-[#1a365d] to-[#2c5282]',
    },
    {
      label: 'ADVENTURE',
      title: 'Bali Explorer Package',
      description:
        'Rice terraces, temple visits, surf lessons in Canggu, and sunset dinners in Uluwatu. 10 days of adventure.',
      cta: 'View Plan',
      bg: 'bg-gradient-to-br from-[#0073cf] to-[#005fa3]',
    },
    {
      label: 'WEEKEND GETAWAY',
      title: 'NYC in 3 Days',
      description:
        'Central Park, Broadway, Brooklyn Bridge, and the best pizza spots. Everything you need for a packed weekend.',
      cta: 'View Plan',
      bg: 'bg-gradient-to-br from-[#ed8936] to-[#dd6b20]',
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-zinc-900 mb-6">Featured trip plans</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {trips.map((trip, index) => (
            <div
              key={index}
              className={`${trip.bg} rounded-2xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow`}
            >
              <p className="text-xs font-bold tracking-wider opacity-80 mb-2">{trip.label}</p>
              <h3 className="text-xl font-bold mb-2">{trip.title}</h3>
              <p className="text-sm opacity-90 mb-4 leading-relaxed">{trip.description}</p>
              <button className="text-sm font-semibold underline hover:no-underline">
                {trip.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
