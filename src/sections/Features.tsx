import { useState } from 'react';
import { Heart, DollarSign, Gem, Shield } from 'lucide-react';
import { ASSISTANT_NAME } from '../lib/constants/branding';

const features = [
  {
    id: 1,
    icon: Heart,
    title: 'Tailor-made',
    shortDescription: `Ask ${ASSISTANT_NAME} to create a personalised itinerary tailored to your preferences and travel style.`,
    fullDescription: `Ask ${ASSISTANT_NAME} to create a personalised itinerary tailored to your preferences and travel style. Discover the ultimate travel experience with customised plans that cater to your unique interests, ensuring every moment of your journey is memorable and perfectly aligned with your desires. Whether you're a foodie, history buff, adventure seeker, or beach lover — ${ASSISTANT_NAME} gets it.`,
  },
  {
    id: 2,
    icon: DollarSign,
    title: 'Cheaper',
    shortDescription: `${ASSISTANT_NAME} finds the best deals and offers, saving you money on your travel plans.`,
    fullDescription: `${ASSISTANT_NAME} finds the best deals and offers, saving you money on your travel plans. With expert guidance, you can explore a wide range of budget-friendly options, from affordable flights to discounted accommodations, ensuring your travel experience is both enjoyable and economical. Travel better for less.`,
  },
  {
    id: 3,
    icon: Gem,
    title: 'Hidden Gems',
    shortDescription: `${ASSISTANT_NAME} uncovers hidden gems and off-the-beaten-path destinations.`,
    fullDescription: `${ASSISTANT_NAME} uncovers hidden gems and off-the-beaten-path destinations, ensuring you experience the very best of where you go. Discover unique attractions and local secrets that are often overlooked by mainstream tourists. With ${ASSISTANT_NAME}'s insider knowledge, you'll explore charming neighbourhoods, breathtaking landscapes, and authentic experiences.`,
  },
  {
    id: 4,
    icon: Shield,
    title: 'No Surprises',
    shortDescription: `${ASSISTANT_NAME} ensures everything runs smoothly, from flights to accommodations.`,
    fullDescription: `${ASSISTANT_NAME} ensures everything runs smoothly, from flights to accommodations, with no unpleasant surprises. Whether you're booking flights, securing accommodations, or arranging activities, ${ASSISTANT_NAME}'s meticulous planning guarantees a stress-free experience. You just focus on creating unforgettable memories — ${ASSISTANT_NAME} handles the rest.`,
  },
];

export function Features() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            I will be there for you in every step
          </h2>
          <p className="text-gray-500 text-lg">
            Curate, save and get notified about your trips on the go.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isExpanded = expandedId === feature.id;

            return (
              <div
                key={feature.id}
                className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-gray-200 mb-4">
                  <Icon className="w-5 h-5 text-gray-700" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-3">
                  {isExpanded ? feature.fullDescription : feature.shortDescription}
                </p>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : feature.id)}
                  className="text-gray-900 text-sm font-medium hover:text-[#0073cf] transition-colors"
                >
                  {isExpanded ? '... Read less' : '... Read more'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
