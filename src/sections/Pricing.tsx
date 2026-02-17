import { useEffect, useRef, useState } from 'react';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    id: '3day',
    name: '3-Day Quick Getaway',
    description: 'Perfect for weekend trips',
    price: '$39',
    originalPrice: '$59',
    icon: Sparkles,
    popular: false,
    features: [
      'Day-by-day schedule',
      '3-5 activities per day',
      'Restaurant recommendations',
      'Basic map with pins',
      'PDF download',
      '1 free revision',
    ],
  },
  {
    id: '7day',
    name: '7-Day Standard Vacation',
    description: 'Our most popular choice',
    price: '$79',
    originalPrice: '$129',
    icon: Zap,
    popular: true,
    features: [
      'Everything in 3-Day, plus:',
      'Complete week plan',
      'Local secrets & hidden gems',
      'Interactive map with routes',
      'Pro tips for each activity',
      'Transit directions',
      'Priority delivery (30 min)',
    ],
  },
  {
    id: '14day',
    name: '14-Day Extended Adventure',
    description: 'For the ultimate explorers',
    price: '$149',
    originalPrice: '$249',
    icon: Crown,
    popular: false,
    features: [
      'Everything in 7-Day, plus:',
      'Two-week comprehensive plan',
      'Multiple cities support',
      'Day trip suggestions',
      'Cultural etiquette guide',
      'Packing checklist',
      '24/7 chat support',
    ],
  },
];

const addOns = [
  { name: 'Local Secrets Add-on', price: '+$29' },
  { name: 'Revision Pass (3 extra)', price: '+$19' },
];

export function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-[#475569] max-w-2xl mx-auto">
            Choose the perfect itinerary length for your trip. All plans include
            our satisfaction guarantee.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 transition-all duration-600 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                } ${
                  plan.popular
                    ? 'bg-gradient-to-b from-[#1e40af] to-[#2563eb] text-white shadow-xl scale-105 lg:scale-110 z-10'
                    : 'bg-white border-2 border-[#e2e8f0] hover:border-[#2563eb]/50 hover:shadow-lg'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#2563eb] text-white px-4 py-1.5 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      plan.popular
                        ? 'bg-white/20'
                        : 'bg-[#f7fafc]'
                    }`}
                  >
                    <Icon
                      className={`w-8 h-8 ${
                        plan.popular ? 'text-white' : 'text-[#2563eb]'
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      plan.popular ? 'text-white' : 'text-[#0f172a]'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      plan.popular ? 'text-white/70' : 'text-[#64748b]'
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-3">
                    <span
                      className={`text-2xl line-through ${
                        plan.popular ? 'text-white/50' : 'text-[#64748b]'
                      }`}
                    >
                      {plan.originalPrice}
                    </span>
                    <span
                      className={`text-5xl font-bold ${
                        plan.popular ? 'text-white' : 'text-[#0f172a]'
                      }`}
                    >
                      {plan.price}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li
                      key={fIndex}
                      className={`flex items-start gap-3 ${
                        plan.popular ? 'text-white/90' : 'text-[#475569]'
                      }`}
                    >
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          plan.popular ? 'text-[#2563eb]' : 'text-[#38b2ac]'
                        }`}
                      />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full py-6 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] ${
                    plan.popular
                      ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-button'
                      : 'bg-[#f7fafc] hover:bg-[#2563eb] hover:text-white text-[#0f172a]'
                  }`}
                >
                  Get Started
                </Button>
              </div>
            );
          })}
        </div>

        {/* Add-ons */}
        <div
          className={`bg-[#f7fafc] rounded-2xl p-6 sm:p-8 transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '450ms' }}
        >
          <h3 className="text-lg font-bold text-[#0f172a] mb-4 text-center">
            Optional Add-ons
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {addOns.map((addon) => (
              <div
                key={addon.name}
                className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl border border-[#e2e8f0] hover:border-[#2563eb] cursor-pointer transition-colors"
              >
                <span className="text-[#475569]">{addon.name}</span>
                <span className="font-bold text-[#2563eb]">{addon.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guarantee */}
        <p
          className={`text-center text-sm text-[#64748b] mt-6 transition-all duration-600 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          30-day money-back guarantee • No questions asked
        </p>
      </div>
    </section>
  );
}
