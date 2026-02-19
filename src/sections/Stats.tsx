import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import { useCountUp } from '../hooks/useCountUp';
import { ASSISTANT_NAME } from '../lib/constants/branding';

export function Stats() {
  const navigate = useNavigate();
  const { formattedCount, ref } = useCountUp({
    end: 1340,
    start: 340,
    duration: 2500,
    delay: 200,
  });

  return (
    <section id="stats-section" className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 sm:p-12 lg:p-16"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-16">
            {/* Left */}
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Your trip in minutes,
                <br />
                not weeks.
              </h2>
              <p className="text-gray-500 text-lg mb-6 max-w-md">
                Plan your next adventure with {ASSISTANT_NAME} and save hours of research.
                Get a full personalised itinerary before you finish your coffee.
              </p>
              <button
                onClick={() => navigate('/chat')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                Plan my trip
              </button>
            </div>

            {/* Right — counter */}
            <div className="flex flex-col items-start lg:items-end flex-shrink-0">
              <span className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight tabular-nums">
                {formattedCount}
              </span>
              <span className="text-gray-500 text-lg mt-2">Trips Planned</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
