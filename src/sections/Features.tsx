import { MessageSquare, Search, Download, Copy } from 'lucide-react';
import { FEATURE_IMAGES } from '../lib/constants/images';
import { ImageSkeleton } from '../components/ImageSkeleton';

const recommendations = [
  { label: 'Fine Dining', image: FEATURE_IMAGES.fineDining, tag: '🍽️' },
  { label: 'Historical Sites', image: FEATURE_IMAGES.historical, tag: '🏛️' },
  { label: 'Beach & Nature', image: FEATURE_IMAGES.beach, tag: '🏖️' },
  { label: 'Local Markets', image: FEATURE_IMAGES.markets, tag: '🛍️' },
];

const agentEdits = [
  { user: "Swap the Louvre for Musée d'Orsay — I prefer Impressionist art", response: "Done! I've replaced the Louvre visit with Musée d'Orsay and adjusted the afternoon timing." },
  { user: "Add a day trip to Versailles on Day 3", response: "Added! Day 3 is now a full-day Versailles excursion with train details." },
  { user: "Lower the budget — skip luxury restaurants", response: "Updated! I've switched to bistro picks and local favorites to keep it affordable." },
];

const itineraryItems = [
  { label: 'Eiffel Tower Visit', time: '9:00 AM', color: 'bg-blue-50' },
  { label: 'Louvre Museum Tour', time: '1:00 PM', color: 'bg-amber-50' },
  { label: 'Seine River Cruise', time: '6:00 PM', color: 'bg-emerald-50' },
];

const priceScanSources = [
  { name: 'Priceline', color: 'bg-blue-500' },
  { name: 'Skyscanner', color: 'bg-cyan-500' },
  { name: 'Kayak', color: 'bg-orange-500' },
  { name: 'Google Flights', color: 'bg-emerald-500' },
  { name: 'Booking.com', color: 'bg-indigo-500' },
  { name: 'Airbnb', color: 'bg-rose-500' },
];

function PriceScanFallback() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-bold text-zinc-900">Scanning Best Prices</p>
        <span className="text-xs font-medium text-[#0073cf] bg-blue-50 px-2.5 py-1 rounded-full">Live comparison</span>
      </div>

      {/* Source logos/badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        {priceScanSources.map((s) => (
          <span key={s.name} className={`${s.color} text-white text-[10px] font-bold px-2.5 py-1 rounded-lg`}>{s.name}</span>
        ))}
      </div>

      {/* Scanning animation */}
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
        <Search className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-700">Save up to $145 vs booking direct</span>
      </div>
    </div>
  );
}

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
                    <ImageSkeleton
                      src={rec.image}
                      alt={rec.label}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white text-xs font-semibold">{rec.tag} {rec.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2: Agent-driven editing */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
            <div className="mb-12 lg:mb-0 order-2 lg:order-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Tell the agent what to change</p>
                    <p className="text-xs text-gray-400">Type your edits naturally</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {agentEdits.map((edit, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-end">
                        <div className="bg-zinc-900 text-white px-3.5 py-2 rounded-2xl rounded-br-sm text-xs max-w-[85%] leading-relaxed">
                          {edit.user}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#0073cf] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-[8px] font-bold">E</span>
                        </div>
                        <div className="bg-blue-50 text-zinc-700 px-3.5 py-2 rounded-2xl rounded-bl-sm text-xs max-w-[85%] leading-relaxed border border-blue-100">
                          {edit.response}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                    <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-400">Tell me what to change...</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-5 leading-tight">
                Edit your trip with natural language.
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-4">
                No dragging, no complex menus. Just tell the agent what you want to change
                — swap activities, adjust your budget, add a day trip — and it updates your
                itinerary instantly.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your entire trip stays organized and updates in real time.
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

          {/* 4: Best prices with scan visualization */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
            <div className="mb-12 lg:mb-0 order-2 lg:order-1">
              <PriceScanImage />
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-5 leading-tight">
                Best prices on stays and flights.
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-4">
                Our agent scans across major booking platforms to find the lowest fares and
                best accommodation options for your exact dates. Compare everything
                side by side and see your total trip cost before you book.
              </p>
              <p className="text-gray-400 text-sm">
                Priceline, Skyscanner, Kayak, Booking.com, and more — compared automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceScanImage() {
  return <PriceScanFallback />;
}
