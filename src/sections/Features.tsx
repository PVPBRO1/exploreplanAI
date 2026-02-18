import { GripVertical, Download, Copy } from 'lucide-react';

const recommendations = [
  { label: 'Fine Dining', image: '/fine-dining.png', tag: '🍽️' },
  { label: 'Historical Sites', image: '/historical-sites.png', tag: '🏛️' },
  { label: 'Beach & Nature', image: '/beach-nature.png', tag: '🏖️' },
  { label: 'Local Markets', image: '/local-markets.png', tag: '🛍️' },
];

const itineraryItems = [
  { label: 'Eiffel Tower Visit', time: '9:00 AM', color: 'bg-blue-50' },
  { label: 'Louvre Museum Tour', time: '1:00 PM', color: 'bg-amber-50' },
  { label: 'Seine River Cruise', time: '6:00 PM', color: 'bg-emerald-50' },
];

export function Features() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32">

        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-4">
            Everything you need<br className="hidden sm:block" /> for your next adventure
          </h2>
        </div>

        <div className="space-y-28">

          {/* 1: Personalized recommendations */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
            <div className="mb-12 lg:mb-0">
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-5 leading-tight">
                Tailored recommendations.
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-4">
                From the best restaurants in your destination to local hidden gems,
                we surface personalized suggestions based on your exact taste and travel style.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Powered by real reviews and local knowledge, not generic lists.
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-3">
                {recommendations.map((rec) => (
                  <div key={rec.label} className="relative rounded-2xl overflow-hidden aspect-square shadow-sm group">
                    <img
                      src={rec.image}
                      alt={rec.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2: Customizable trip plans (text RIGHT) */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
            <div className="mb-12 lg:mb-0 order-2 lg:order-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                    <GripVertical className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Paris Itinerary</p>
                    <p className="text-xs text-gray-400">Drag to reorder</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {itineraryItems.map((item) => (
                    <div key={item.label} className={`flex items-center gap-3 p-3.5 ${item.color} rounded-xl`}>
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-900">{item.label}</p>
                      </div>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="w-full py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
                    + Add activity
                  </button>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-5 leading-tight">
                Customizable trip plans.
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-4">
                Rearrange your schedule, swap out activities, or add hidden gems along the way.
                Your entire trip stays organized on a single editable page that updates in real time.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Changes save instantly. Share your plan with friends or family.
              </p>
            </div>
          </div>

          {/* 3: Access anywhere */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
            <div className="mb-12 lg:mb-0">
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-5 leading-tight">
                Access your plans anywhere.
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-4">
                Download a complete PDF of your itinerary or copy everything straight to your
                notes app. Your trip details are always at your fingertips, even without Wi-Fi.
              </p>
              <p className="text-gray-400 text-sm">Works offline. No account required to export.</p>
            </div>
            <div>
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Mock toolbar */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex-1" />
                  <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-gray-100">
                    <Download className="w-3.5 h-3.5" />
                    Save as PDF
                  </button>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-gray-100">
                    <Copy className="w-3.5 h-3.5" />
                    Copy to Notes
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-400 mb-1">15 Mar, 2026 – 18 Mar, 2026</p>
                  <h4 className="text-lg font-bold text-zinc-900 mb-3">4 Days in Paris, France 🇫🇷</h4>
                  <div className="space-y-2">
                    {itineraryItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                        <span className="text-zinc-700 font-medium">{item.label}</span>
                        <span className="text-gray-400 text-xs">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4: Best prices (text RIGHT) */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
            <div className="mb-12 lg:mb-0 order-2 lg:order-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-bold text-zinc-900">Best Fares Found</p>
                  <span className="text-xs font-medium text-[#0073cf] bg-blue-50 px-2.5 py-1 rounded-full">Scanning 12+ platforms</span>
                </div>
                <div className="space-y-3 mb-5">
                  {[
                    { route: 'NYC → Paris', airline: 'Air France', price: '$389', original: '$534' },
                    { route: 'LAX → Paris', airline: 'Delta', price: '$412', original: '$557' },
                    { route: 'ORD → Paris', airline: 'United', price: '$367', original: '$498' },
                  ].map((fare) => (
                    <div key={fare.route} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{fare.route}</p>
                        <p className="text-xs text-gray-400">{fare.airline}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#0073cf]">{fare.price}</p>
                        <p className="text-xs text-gray-400 line-through">{fare.original}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 rounded-xl">
                  <span className="text-sm font-semibold text-emerald-700">✦ Save up to $145 vs booking direct</span>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-5 leading-tight">
                Best prices on stays and flights.
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-4">
                We scan across major booking platforms to find the lowest fares and
                best Airbnb or hotel options for your exact dates. Compare everything
                side by side and see your total trip cost before you book.
              </p>
              <p className="text-gray-400 text-sm">
                Airbnb, hotels, and flights compared automatically.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
