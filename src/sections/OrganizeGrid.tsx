import { BedDouble, Plane, Home, UtensilsCrossed, Ticket, Map, Bot, CheckCircle } from 'lucide-react';

const categories = [
  {
    icon: Bot,
    label: 'AI Itinerary Planning',
    description: 'Tell our agent where you want to go and get a complete day-by-day itinerary built for you.',
    ready: true,
  },
  {
    icon: BedDouble,
    label: 'Hotels & Stays',
    description: 'The agent searches across platforms to find the best accommodation for your dates and budget.',
    ready: false,
  },
  {
    icon: Plane,
    label: 'Flight Comparison',
    description: 'Get real-time airfare comparisons from major airlines and booking platforms.',
    ready: false,
  },
  {
    icon: UtensilsCrossed,
    label: 'Restaurant Picks',
    description: 'Personalized dining recommendations built into your itinerary based on your food preferences.',
    ready: true,
  },
  {
    icon: Ticket,
    label: 'Activities & Experiences',
    description: 'The agent suggests and schedules activities, tours, and experiences that fit your style.',
    ready: true,
  },
  {
    icon: Map,
    label: 'Trip Notes & Checklists',
    description: 'Keep packing lists, travel notes, and reminders organized alongside your itinerary.',
    ready: false,
  },
];

export function OrganizeGrid() {
  return (
    <section className="bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-4">
            Your AI travel agent, end to end.
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            From building your itinerary to organizing every detail, the agent handles it all
            in one place — so you can focus on the adventure.
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
                <div className="absolute top-4 right-4">
                  {cat.ready ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Live
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      Coming soon
                    </span>
                  )}
                </div>
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
