import { MapPin, ChevronDown } from 'lucide-react';
import { LinkButton } from '../components/LinkButton';
import { useTransitionNavigate } from '../components/TransitionContext';
import { QUICK_ACTIONS } from '../lib/constants/images';

const chatMessages = [
  { role: 'ai', text: "Hey there! I'm your ExplorePlan travel agent. Tell me about your dream trip — or pick a quick action below to get started!" },
  { role: 'user', text: "I want to go to Paris for 4 days. I love art, good food, and historic sites." },
  { role: 'ai', text: "Paris is perfect for that! Let me put together a personalized itinerary. First — what's your budget like?" },
];

const experienceChips = [
  '🏖️ Beach & Relaxation', '🍽️ Fine Dining', '🏛️ Historical Tours',
  '🌿 Wellness & Spa', '🎭 Theater & Shows', '🦁 Wildlife Safari',
  '⛵ Sailing', '🚵 Cycling & Active',
];

const itineraryPreview = [
  { day: 'Day 1', activity: 'Eiffel Tower + Seine Cruise', time: '9:00 AM', tag: 'Morning', color: 'bg-amber-50 text-amber-600' },
  { day: 'Day 1', activity: 'Louvre Museum', time: '1:00 PM', tag: 'Afternoon', color: 'bg-blue-50 text-[#0073cf]' },
  { day: 'Day 2', activity: 'Montmartre + Sacré Coeur', time: '9:00 AM', tag: 'Morning', color: 'bg-amber-50 text-amber-600' },
  { day: 'Day 2', activity: 'Le Marais Neighborhood Walk', time: '2:00 PM', tag: 'Afternoon', color: 'bg-blue-50 text-[#0073cf]' },
  { day: 'Day 3', activity: 'Versailles Day Trip', time: '8:30 AM', tag: 'Full Day', color: 'bg-emerald-50 text-emerald-600' },
];

export function HowItWorks() {
  const { navigateWithTransition } = useTransitionNavigate();

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
                Talk to our AI travel agent like you would a friend. Tell us where you want to go,
                what you love, and we'll handle the rest.
              </p>
              <div className="flex flex-wrap gap-3">
                <LinkButton
                  to="/chat"
                  className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-6 py-3 rounded-full text-sm"
                >
                  Start chatting
                </LinkButton>
                <a
                  href="#inspired"
                  className="inline-flex items-center gap-2 text-[#0073cf] hover:text-[#005fa3] font-medium text-sm px-4 py-3 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                  See how I can help you
                </a>
              </div>
            </div>

            {/* Chat visual — Layla-style */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">E</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">ExplorePlan Agent</p>
                  <p className="text-[11px] text-emerald-500 font-medium">Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                    {msg.role === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-[9px] font-bold">E</span>
                      </div>
                    )}
                    <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#0073cf] text-white rounded-2xl rounded-br-md shadow-sm'
                        : 'bg-gray-50 text-zinc-800 rounded-2xl rounded-bl-md border border-gray-100'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Experience chips */}
              <div className="px-5 pb-2">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2.5">What kind of experience?</p>
                <div className="flex flex-wrap gap-1.5">
                  {experienceChips.map((cat) => (
                    <span key={cat} className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full text-xs font-semibold text-[#0073cf] hover:shadow-sm transition-shadow cursor-default">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/40">
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.slice(0, 4).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => navigateWithTransition(`/chat?intent=${action.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-zinc-700 hover:border-[#0073cf] hover:text-[#0073cf] hover:shadow-sm transition-all"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Get your itinerary */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">
            <div className="mb-12 lg:mb-0 order-2 lg:order-1">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <span className="text-xs font-semibold text-[#0073cf] bg-blue-50 px-2.5 py-1 rounded-full">AI Generated</span>
                </div>

                <div className="p-5">
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-0.5">15 Mar, 2026 – 18 Mar, 2026</p>
                    <h4 className="text-base font-bold text-zinc-900">4 Days in Paris, France 🇫🇷</h4>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Sightseeing', 'Culture', 'Food'].map(tag => (
                        <span key={tag} className="text-[10px] font-semibold text-[#0073cf] bg-blue-50 px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Timeline itinerary */}
                  <div className="space-y-2.5 border-l-2 border-gray-100 ml-2 pl-4">
                    {itineraryPreview.map((item, i) => (
                      <div key={i} className="relative flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                        <div className="absolute -left-[23px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#0073cf] border-2 border-white" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">{item.activity}</p>
                          <p className="text-xs text-gray-400">{item.day} · {item.time}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${item.color}`}>
                          {item.tag}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">10 activities planned</span>
                    <button className="text-xs font-semibold text-zinc-900 hover:text-[#0073cf] transition-colors">View full itinerary →</button>
                  </div>
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
                We scan across major booking platforms to surface the best prices for your dates.
                Compare stays and flights side by side and book with confidence.
              </p>
            </div>

            {/* Stays visual — scanning visualization */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button className="flex-1 py-3.5 text-xs font-bold text-zinc-900 border-b-2 border-zinc-900">Stays</button>
                <button className="flex-1 py-3.5 text-xs font-medium text-gray-400">Flights</button>
                <button className="flex-1 py-3.5 text-xs font-medium text-gray-400">Experiences</button>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { name: 'Charming Loft near Eiffel Tower', price: '$124/night', rating: '4.92', source: 'Airbnb' },
                  { name: 'Le Marais Designer Studio', price: '$98/night', rating: '4.87', source: 'Booking.com' },
                ].map((stay) => (
                  <div key={stay.name} className="flex gap-3 items-center p-3 bg-gray-50 rounded-xl">
                    <div className="w-14 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#0073cf]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{stay.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-zinc-900">{stay.price}</span>
                        <span className="text-gray-300 text-xs">|</span>
                        <span className="text-xs text-gray-500">★ {stay.rating}</span>
                        <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">{stay.source}</span>
                      </div>
                    </div>
                    <button className="text-xs font-semibold text-[#0073cf] whitespace-nowrap hover:underline">View</button>
                  </div>
                ))}
                <div className="pt-2 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-[#0073cf] border-t-transparent animate-spin" />
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
