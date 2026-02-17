import {
  DollarSign,
  ArrowLeftRight,
  Landmark,
  Clock,
  Plug,
  Languages,
  Cloud,
  TrainFront,
  MapPin,
  Download,
  Copy,
  ChevronDown,
} from 'lucide-react';

const tripInfo = {
  dates: '15 Mar, 2026 – 18 Mar, 2026',
  title: '4 Days trip in Paris, France',
  flag: '\u{1F1EB}\u{1F1F7}',
  budget: '1200 – 2800 USD',
  tags: ['Sightseeing', 'Culture', 'Food Exploration'],
  description:
    'Paris is one of the most iconic cities in the world, celebrated for its art, architecture, cuisine, and timeless charm. From world class museums to quaint neighborhood cafes, the city offers something unforgettable at every turn.',
};

const countryInfo = [
  { icon: DollarSign, label: 'EUR', sublabel: 'Euro' },
  { icon: ArrowLeftRight, label: '1 USD = \u20AC0.92', sublabel: '' },
  { icon: Landmark, label: 'Paris', sublabel: 'Capital' },
  { icon: Clock, label: 'UTC+1:00', sublabel: '' },
  { icon: Plug, label: 'Type C / E', sublabel: '' },
  { icon: Languages, label: 'French', sublabel: '' },
  { icon: Cloud, label: '12\u00B0C', sublabel: 'Partly cloudy' },
  { icon: TrainFront, label: 'Metro \u00B7 Bus \u00B7 RER', sublabel: '' },
];

interface Activity {
  id: number;
  name: string;
  description: string;
  image: string;
  duration: string;
  location: string;
}

interface Day {
  day: number;
  date: string;
  activities: Activity[];
}

const itinerary: Day[] = [
  {
    day: 1,
    date: 'Sun, 15 Mar',
    activities: [
      {
        id: 1,
        name: 'Eiffel Tower',
        description:
          'Start your trip with a morning visit to the iconic Eiffel Tower. Head to the second floor for panoramic views across the city.',
        image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=200&q=80',
        duration: '120 min',
        location: 'Champ de Mars, 7th Arr.',
      },
      {
        id: 2,
        name: 'Louvre Museum',
        description:
          'Explore the world\'s largest art museum. See the Mona Lisa, Venus de Milo, and thousands of masterpieces spanning centuries.',
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=200&q=80',
        duration: '180 min',
        location: 'Rue de Rivoli, 1st Arr.',
      },
      {
        id: 3,
        name: 'Seine River Cruise',
        description:
          'End the day with a relaxing evening cruise along the Seine. Watch the city light up as you pass under historic bridges.',
        image: 'https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94?w=200&q=80',
        duration: '90 min',
        location: 'Port de la Bourdonnais',
      },
    ],
  },
  {
    day: 2,
    date: 'Mon, 16 Mar',
    activities: [
      {
        id: 1,
        name: 'Montmartre and Sacr\u00E9 Coeur',
        description:
          'Wander the charming cobblestone streets of Montmartre and climb to the Basilica of Sacr\u00E9 Coeur for sweeping views of Paris.',
        image: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=200&q=80',
        duration: '150 min',
        location: 'Montmartre, 18th Arr.',
      },
      {
        id: 2,
        name: 'Le Marais Neighborhood Walk',
        description:
          'Stroll through Le Marais, one of Paris\u2019s trendiest neighborhoods. Browse vintage shops, galleries, and stop for falafel on Rue des Rosiers.',
        image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=200&q=80',
        duration: '120 min',
        location: 'Le Marais, 3rd Arr.',
      },
    ],
  },
];

export function ItineraryDemo() {
  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Intro */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            See what your itinerary looks like
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            A real example of an AI generated trip plan. Export it as a PDF or
            copy it straight to your notes for offline access.
          </p>
        </div>

        {/* Demo Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <div className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100">
                <Download className="w-3.5 h-3.5" />
                Save as PDF
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-zinc-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100">
                <Copy className="w-3.5 h-3.5" />
                Copy to Notes
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:flex">
            {/* Left Panel */}
            <div className="lg:w-[55%] p-6 sm:p-8 lg:border-r border-gray-100 overflow-y-auto max-h-[700px]">
              {/* Trip Header */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 mb-1">{tripInfo.dates}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 mb-2">
                  {tripInfo.title} {tripInfo.flag}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {tripInfo.budget} &middot;{' '}
                  {tripInfo.tags.map((tag, i) => (
                    <span key={tag}>
                      {tag}
                      {i < tripInfo.tags.length - 1 ? ' \u00B7 ' : ''}
                    </span>
                  ))}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {tripInfo.description}
                </p>
              </div>

              {/* Country Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {countryInfo.map((info, i) => {
                  const Icon = info.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 py-2"
                    >
                      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-zinc-900 leading-tight">
                          {info.label}
                        </p>
                        {info.sublabel && (
                          <p className="text-[11px] text-gray-400">{info.sublabel}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Itinerary */}
              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-zinc-900">Itinerary</h4>
                  <button className="text-xs font-medium text-zinc-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                    Best Deals
                  </button>
                </div>

                {itinerary.map((day) => (
                  <div key={day.day} className="mb-8 last:mb-0">
                    <button className="flex items-center gap-2 mb-4 group">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-zinc-900">
                        Day {day.day}
                      </span>
                      <span className="text-xs text-gray-400">{day.date}</span>
                    </button>

                    <div className="space-y-4 ml-1 border-l-2 border-gray-100 pl-5">
                      {day.activities.map((activity) => (
                        <div key={activity.id} className="relative">
                          {/* Activity dot */}
                          <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#0073cf] border-2 border-white flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">
                              {activity.id}
                            </span>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-semibold text-[#0073cf] mb-1">
                                {activity.name}
                              </h5>
                              <p className="text-xs text-gray-500 leading-relaxed mb-2">
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                <MapPin className="w-3 h-3" />
                                <span>
                                  {activity.duration} &middot; {activity.location}
                                </span>
                              </div>
                            </div>
                            <img
                              src={activity.image}
                              alt={activity.name}
                              className="w-20 h-16 sm:w-24 sm:h-[72px] rounded-lg object-cover flex-shrink-0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel - Map */}
            <div className="lg:w-[45%] lg:sticky lg:top-20 lg:self-start">
              <iframe
                title="Trip destination map"
                src="https://maps.google.com/maps?q=Paris,France&z=12&output=embed"
                className="w-full h-[300px] lg:h-[700px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
