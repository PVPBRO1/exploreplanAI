import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ASSISTANT_NAME, BRAND_NAME } from '../lib/constants/branding';

const fullText = `Looking for the perfect trip planner for your next family vacation, romantic getaway, anniversary escape, or birthday trip? You're in the right place. Ask ${ASSISTANT_NAME} anything about planning your vacation — from dreamy destinations and cozy stays to flights, road trips, and more. Whether you're travelling with kids, your partner, or solo, ${ASSISTANT_NAME} will help you build the perfect itinerary. No more juggling tabs and apps — ${BRAND_NAME} is the only AI travel planner you'll ever need. Get inspired with personalised destination ideas and discover hidden gems you'd never find on your own. Then, customise every detail to make the most of your precious vacation days. ${ASSISTANT_NAME} speaks your language, understands your budget, and crafts every trip around your unique travel style.`;

export function AllInOne() {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 lg:p-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            All-in-One AI Trip Planner
          </h2>

          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            {fullText}
          </p>

          <div className="block">
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors font-medium"
            >
              <span>Create a new trip</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
