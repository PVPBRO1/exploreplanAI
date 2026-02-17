import { MessageSquareText, Sparkles, SlidersHorizontal, Map } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Share Your Travel Preferences',
    description:
      'Tell us your destination, dates, and what matters most to you. It takes less than two minutes.',
    icon: MessageSquareText,
    color: '#1a365d',
  },
  {
    id: 2,
    title: 'AI Crafts Your Itinerary',
    description:
      'Our engine scans thousands of options, checks details, and assembles a complete day-by-day travel plan.',
    icon: Sparkles,
    color: '#0073cf',
  },
  {
    id: 3,
    title: 'Review and Refine',
    description:
      'Receive your itinerary within the hour. Adjust anything, swap activities, or request a free revision.',
    icon: SlidersHorizontal,
    color: '#38b2ac',
  },
  {
    id: 4,
    title: 'Travel with Confidence',
    description:
      'Open your plan anytime with maps, tips, and booking links. Everything you need, right in your pocket.',
    icon: Map,
    color: '#ed8936',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-14 bg-[#f7fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-3">How ExplorePlan Works</h2>
          <p className="text-gray-500">From idea to itinerary in four simple steps</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="text-center">
                <div className="inline-block relative mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: step.color }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-xs font-bold text-zinc-900 border border-gray-200">
                    {step.id}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
