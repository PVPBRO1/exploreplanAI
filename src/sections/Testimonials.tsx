import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "Vincent planned our entire 10-day Japan trip in under 5 minutes. Every restaurant recommendation was spot-on, and the local tips saved us so much time. Absolute game-changer.",
    name: 'Sarah M.',
    age: 34,
    trip: 'Tokyo trip',
    initials: 'SM',
  },
  {
    id: 2,
    quote: "I was sceptical at first, but the Paris itinerary was incredible. We discovered hidden gems we never would have found on our own. Can't imagine planning a trip without Vincent now.",
    name: 'James K.',
    age: 29,
    trip: 'Paris trip',
    initials: 'JK',
  },
  {
    id: 3,
    quote: "Used Vincent for our honeymoon in Santorini — it balanced romance and adventure perfectly. The hotel picks were stunning and the dining suggestions were world class.",
    name: 'Emily & Chris R.',
    age: 31,
    trip: 'Santorini honeymoon',
    initials: 'EC',
  },
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-12 text-center">
          What travellers say about me
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-gray-50 rounded-2xl p-7">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{t.name}, {t.age}</p>
                  <p className="text-xs text-gray-400">{t.trip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
