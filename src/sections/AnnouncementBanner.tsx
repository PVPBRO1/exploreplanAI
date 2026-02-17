import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

export function AnnouncementBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-[#1a365d] to-[#2c5282] text-white py-3 px-4 animate-slide-down">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
        <Sparkles className="w-4 h-4 text-[#ed8936]" />
        <span>
          <span className="font-semibold">Launch Special:</span> Get 30% off your
          first itinerary! Use code{' '}
          <span className="font-mono bg-white/20 px-2 py-0.5 rounded">
            WANDERLUST30
          </span>
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Close announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
