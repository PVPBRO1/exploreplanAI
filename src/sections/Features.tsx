import {
  Pencil,
  Home,
  Download,
  Plane,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';

export function Features() {
  return (
    <section className="pt-20 sm:pt-28 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-5xl font-bold text-zinc-900 mb-12 max-w-2xl">
          Everything you need to plan your next trip
        </h2>

        {/* Feature 1 - Full Width */}
        <div className="bg-[#FEF3EC] rounded-2xl p-8 lg:p-12 mb-8">
          <div className="lg:flex lg:items-start lg:gap-12">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                Customize your itinerary down to every detail
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Rearrange your schedule, swap out activities, or add hidden gems
                along the way. Your entire trip stays organized on a single,
                editable page that updates in real time.
              </p>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Pencil className="w-5 h-5 text-[#F56551]" />
                  <span className="text-sm font-semibold text-zinc-900">Day 1 Itinerary</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-[#F56551]" />
                    <span className="text-sm text-gray-700">Morning: Mercado de San Miguel</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-[#0073cf]" />
                    <span className="text-sm text-gray-700">Afternoon: Prado Museum Tour</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-[#38b2ac]" />
                    <span className="text-sm text-gray-700">Evening: Rooftop Dinner</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 + 3 - Side by Side */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Airbnb Feature */}
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-10">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-5">
              <Home className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">
              Find your perfect stay
            </h3>
            <p className="text-gray-600 leading-relaxed mb-5">
              We match you with the best Airbnb listings based on your
              location, group size, budget, and personal preferences. No more
              endless scrolling through hundreds of options.
            </p>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Home className="w-4 h-4 text-[#F56551]" />
                <span className="text-xs font-semibold text-zinc-900">Top Matches</span>
              </div>
              <div className="space-y-2">
                {['Cozy Studio near Eiffel Tower', 'Le Marais Loft, 2BR', 'Montmartre Terrace Flat'].map(
                  (name) => (
                    <div key={name} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-700">{name}</span>
                      <span className="text-[10px] text-gray-400">Matched</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Offline Access */}
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-10">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-5">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">
              Access your plans anywhere
            </h3>
            <p className="text-gray-600 leading-relaxed mb-5">
              Download a complete PDF of your itinerary or copy everything
              straight to your notes app. Your trip details are always at your
              fingertips, even without Wi-Fi.
            </p>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#FEF3EC] flex items-center justify-center">
                  <span className="text-xs">💬</span>
                </div>
                <p className="text-xs text-gray-600">I won't have internet access. How do I check my plans?</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                </div>
                <p className="text-xs text-gray-600">You can download it as PDF and store it locally.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4 + 5 - Side by Side */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Cheapest Flights */}
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-10">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-5">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">
              Cross reference the cheapest flights
            </h3>
            <p className="text-gray-600 leading-relaxed mb-5">
              We scan across major booking platforms to surface the lowest fares
              for your dates and destination. Stop overpaying when a better deal
              is one search away.
            </p>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-3 mb-3">
                <Plane className="w-4 h-4 text-[#0073cf]" />
                <span className="text-xs font-semibold text-zinc-900">Best Fares Found</span>
              </div>
              <div className="space-y-2">
                {[
                  { route: 'NYC → Paris', price: '$389' },
                  { route: 'LAX → Paris', price: '$412' },
                  { route: 'ORD → Paris', price: '$367' },
                ].map((fare) => (
                  <div key={fare.route} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-700">{fare.route}</span>
                    <span className="text-xs font-semibold text-[#0073cf]">{fare.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-gray-50 rounded-2xl p-8 lg:p-10">
            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-3">
              AI powered recommendations
            </h3>
            <p className="text-gray-600 leading-relaxed mb-5">
              From restaurants and activities to local experiences, get
              intelligent suggestions tailored to your taste. Every
              recommendation is curated to fit the way you travel.
            </p>
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-zinc-900 mb-2">Recommended places</p>
              <div className="flex gap-2 overflow-hidden">
                {[
                  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&q=80',
                  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=80&q=80',
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=80&q=80',
                  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&q=80',
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Recommended spot"
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature 6 - Full Width */}
        <div className="bg-[#FEF3EC] rounded-2xl p-8 lg:p-12">
          <div className="lg:flex lg:items-start lg:gap-12">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                Everything organized in one place
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Whether it's your own personalized trip or a bookmarked plan,
                you'll find everything neatly organized on a single dashboard
                for your convenience.
              </p>
            </div>
            <div className="lg:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <LayoutDashboard className="w-5 h-5 text-[#F56551]" />
                  <span className="text-sm font-semibold text-zinc-900">My Trips</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Paris, France', 'Bali, Indonesia', 'Tokyo, Japan', 'NYC, USA'].map(
                    (trip) => (
                      <div
                        key={trip}
                        className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium"
                      >
                        {trip}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
