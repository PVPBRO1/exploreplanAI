import { MapPin, Star, Search } from 'lucide-react';
import { LinkButton } from '../components/LinkButton';

const categories = [
  '🏖️ Beach', '🍽️ Fine Dining', '🏛️ Historical Tours',
  '🌿 Wellness', '🎭 Theater', '🦁 Wildlife',
  '⛵ Sailing', '🚵 Cycling',
];

const chatMessages = [
  { role: 'ai', text: "Hi! Where would you like to go? Tell me about your dream trip." },
  { role: 'user', text: "I want to go to Paris for 4 days. I love art, good food, and historic sites." },
  { role: 'ai', text: "Perfect! I'm building your personalized Paris itinerary now..." },
];

const itineraryPreview = [
  { day: 'Day 1', activity: 'Eiffel Tower + Seine Cruise', time: '9:00 AM', tag: 'Morning' },
  { day: 'Day 1', activity: 'Louvre Museum', time: '1:00 PM', tag: 'Afternoon' },
  { day: 'Day 2', activity: 'Montmartre + Sacré Coeur', time: '9:00 AM', tag: 'Morning' },
];

const stays = [
  { name: 'Charming Loft near Eiffel Tower', price: '$124/night', rating: '4.92', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200&q=80' },
  { name: 'Le Marais Designer Studio', price: '$98/night', rating: '4.87', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&q=80' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#faf9f6]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32">

        <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 mb-20 text-center">
          How it Works
        </h2>

        <div className="space-y-32">

          {/* Step 1: Start chatting */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
            <div className="mb-12 lg:mb-0">
              <p className="text-sm font-semibold text-[#0073cf] uppercase tracking-widest mb-4">Step 1</p>
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-5 leading-tight">
                Start chatting with us.
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                Ask for suggestions for any destination or get a full itinerary built for you.
                Be as specific as you like about the experiences you enjoy.
              </p>
              <LinkButton to="/chat" className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-6 py-3 rounded-full text-sm">
                Start chatting
              </LinkButton>
            </div>
            {/* Chat visual */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="space-y-3 mb-5">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-zinc-900 text-white rounded-br-sm'
                        : 'bg-gray-100 text-zinc-800 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-400 mb-3 font-medium">What kind of experience?</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span key={cat} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-zinc-700">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Get your itinerary */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
            {/* Visual first on desktop for alternating layout */}
            <div className="mb-12 lg:mb-0 order-2 lg:order-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">15 Mar, 2026 – 18 Mar, 2026</p>
                    <h4 className="text-base font-bold text-zinc-900">4 Days in Paris, France 🇫🇷</h4>
                  </div>
                  <span className="text-xs font-semibold text-[#0073cf] bg-blue-50 px-2.5 py-1 rounded-full">AI Generated</span>
                </div>
                <div className="space-y-3">
                  {itineraryPreview.map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-[#0073cf]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{item.activity}</p>
                        <p className="text-xs text-gray-400">{item.day} · {item.time}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-[#0073cf] bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">6 activities planned</span>
                  <button className="text-xs font-semibold text-zinc-900 hover:text-[#0073cf] transition-colors">View full itinerary →</button>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold text-[#0073cf] uppercase tracking-widest mb-4">Step 2</p>
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-5 leading-tight">
                Get your personalized itinerary.
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                In seconds, our AI assembles a complete day by day plan with activities,
                restaurants, and local tips tailored precisely to how you want to travel.
                Every itinerary is built from scratch just for you.
              </p>
            </div>
          </div>

          {/* Step 3: Book stays and flights */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
            <div className="mb-12 lg:mb-0">
              <p className="text-sm font-semibold text-[#0073cf] uppercase tracking-widest mb-4">Step 3</p>
              <h3 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-5 leading-tight">
                Book stays and flights.
              </h3>
              <p className="text-gray-500 text-lg leading-relaxed">
                We scan Airbnb, hotels, and major booking platforms to surface the best
                prices for your dates. Compare stays and flights side by side and book
                with confidence.
              </p>
            </div>
            {/* Stays visual */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button className="flex-1 py-3 text-xs font-bold text-zinc-900 border-b-2 border-zinc-900">Airbnb</button>
                <button className="flex-1 py-3 text-xs font-medium text-gray-400">Hotels</button>
                <button className="flex-1 py-3 text-xs font-medium text-gray-400">Flights</button>
              </div>
              <div className="p-5 space-y-3">
                {stays.map((stay) => (
                  <div key={stay.name} className="flex gap-3 items-center">
                    <img src={stay.image} alt={stay.name} className="w-16 h-14 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{stay.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-zinc-900">{stay.price}</span>
                        <span className="text-gray-300 text-xs">|</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs text-gray-500">{stay.rating}</span>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-[#0073cf] whitespace-nowrap hover:underline">Select</button>
                  </div>
                ))}
                <div className="pt-2 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-[#0073cf]" />
                  <span className="text-xs text-[#0073cf] font-medium">Scanning 12+ platforms for best prices...</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
