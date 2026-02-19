import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ASSISTANT_NAME } from '../lib/constants/branding';

export function CTABanner() {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f5f3ff] rounded-3xl p-8 sm:p-12 lg:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Ready to give it a try?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto">
            See how {ASSISTANT_NAME} can turn any idea into a trip in under a minute.
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-zinc-900 text-white hover:bg-zinc-700 transition-colors font-medium text-lg"
          >
            <span>Try {ASSISTANT_NAME} now</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
