import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paperclip, Mic, Send, ChevronDown } from 'lucide-react';
import { ASSISTANT_AVATAR, HERO_BG, TAGLINE, SUBTITLE } from '../lib/constants/branding';
import { useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder';

const placeholders = [
  'Create a 7-day Paris itinerary for a birthday getaway',
  'Help me plan a budget-friendly vacation to Barcelona',
  'Plan a romantic 5-day trip to Rome for couples',
  'Design an unforgettable adventure trip to Japan',
  'Tokyo in 6 days: food, culture & bucket-list stops',
  'Best way to explore Bali in 10 days',
  'Best 7-day beach vacation itinerary in Greece',
  'Plan a road trip along the Pacific Coast Highway',
];

const quickActions = [
  { label: 'Create a new trip', message: "I'd like to plan a new trip!" },
  { label: 'Inspire me where to go', message: "Inspire me — where should I travel next?" },
  { label: 'Plan a road trip', message: "Help me plan an epic road trip!" },
  { label: 'Plan a last-minute escape', message: "I need a last-minute getaway — what do you suggest?" },
  { label: 'Take a quiz', message: "Give me a quick travel quiz to figure out my ideal destination!" },
];

export function Hero() {
  const [inputValue, setInputValue] = useState('');
  const { currentPlaceholder, isAnimating } = useRotatingPlaceholder(placeholders, 3000);
  const navigate = useNavigate();

  const handleSubmit = (message?: string) => {
    const msg = message || inputValue.trim();
    if (!msg) return;
    navigate(`/chat?msg=${encodeURIComponent(msg)}`);
  };

  const scrollToContent = () => {
    document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={HERO_BG}
          alt="City skyline at dusk"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center mb-8">
          {/* Vincent avatar */}
          <div className="flex justify-center mb-5">
            <img
              src={ASSISTANT_AVATAR}
              alt="Vincent"
              className="h-16 w-16 rounded-full object-cover border-2 border-white/60 shadow-xl"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            {TAGLINE}
          </h1>
          <p className="text-lg sm:text-xl text-white/85 max-w-xl mx-auto"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            {SUBTITLE}
          </p>
        </div>

        {/* Chat Input Box */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-5 mb-6 mx-auto max-w-2xl">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={currentPlaceholder}
            className="w-full min-h-[72px] resize-none border-0 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-base sm:text-lg leading-relaxed"
            style={{ opacity: isAnimating ? 0.6 : 1, transition: 'opacity 0.3s ease' }}
          />

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
              <Paperclip className="w-4 h-4" />
              Attach
            </button>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={!inputValue.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors text-sm font-semibold disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Plan my trip
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 max-w-2xl mx-auto">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSubmit(action.message)}
              className="px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium border border-white/30 hover:bg-white/25 hover:border-white/50 transition-all duration-300"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToContent}
          className="flex flex-col items-center gap-2 text-white/75 hover:text-white transition-colors mx-auto"
        >
          <span className="text-sm font-medium">See how I can help you</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </div>
    </section>
  );
}
