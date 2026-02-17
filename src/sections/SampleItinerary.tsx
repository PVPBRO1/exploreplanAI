import { useEffect, useRef, useState } from 'react';
import { MapPin, Clock, Coffee, Sun, Moon, Utensils, Star, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const dayActivities = [
  {
    time: '9:00 AM',
    title: 'Coffee at Café de Flore',
    description: 'Start your day with authentic Parisian coffee and croissants at this historic café.',
    tip: 'Pro tip: Arrive before 9:30 AM to avoid the morning rush.',
    icon: Coffee,
    cost: '€5',
  },
  {
    time: '10:30 AM',
    title: 'The Louvre Museum',
    description: 'Explore the world\'s largest art museum, home to the Mona Lisa and Venus de Milo.',
    tip: 'Pro tip: Book tickets online to skip the 2-hour lines.',
    icon: Sun,
    cost: '€17',
  },
  {
    time: '1:00 PM',
    title: 'Lunch at L\'Ami Jean',
    description: 'Authentic Basque-French cuisine in a cozy bistro setting.',
    tip: 'Pro tip: Try their famous rice pudding for dessert!',
    icon: Utensils,
    cost: '€25',
  },
  {
    time: '3:00 PM',
    title: 'Stroll Through Tuileries Garden',
    description: 'Beautiful formal gardens perfect for a post-lunch walk.',
    tip: 'Pro tip: Free entry! Great for photos.',
    icon: MapPin,
    cost: 'Free',
  },
  {
    time: '6:00 PM',
    title: 'Sunset at Eiffel Tower',
    description: 'Watch the sunset from Trocadéro for the best views.',
    tip: 'Pro tip: The tower sparkles every hour after sunset!',
    icon: Moon,
    cost: 'Free',
  },
];

export function SampleItinerary() {
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
    <section
      id="sample"
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-[#1e40af] to-[#2563eb]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div
            className={`text-white transition-all duration-600 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 text-[#f59e0b]" />
              <span>Sample Itinerary Preview</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See What You'll Get
            </h2>
            <p className="text-lg text-white/80 mb-8">
              A preview of Day 1 from our Paris itinerary. Every itinerary includes
              detailed schedules, insider tips, costs, and transit directions.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold px-6 shadow-button hover:shadow-lg hover:scale-[1.02] transition-all">
                Get Full Sample Itinerary
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-6"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Sample
              </Button>
            </div>

          </div>

          {/* Right Column - Preview Card */}
          <div
            className={`transition-all duration-600 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-10'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-float">
              {/* Card Header */}
              <div className="bg-[#f7fafc] px-6 py-4 border-b border-[#e2e8f0]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#0f172a]">
                      Day 1: Paris Highlights
                    </h3>
                    <p className="text-sm text-[#64748b]">
                      Classic Paris Experience
                    </p>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
                {dayActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={index}
                      className="flex gap-4 group"
                    >
                      {/* Time */}
                      <div className="flex-shrink-0 w-16 text-right">
                        <span className="text-sm font-semibold text-[#f59e0b]">
                          {activity.time}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6 border-l-2 border-[#e2e8f0] pl-4 relative">
                        {/* Dot */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#f59e0b] border-4 border-white shadow-sm" />

                        <div className="bg-[#f7fafc] rounded-xl p-4 hover:bg-[#edf2f7] transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-[#0f172a]" />
                              <h4 className="font-semibold text-[#0f172a]">
                                {activity.title}
                              </h4>
                            </div>
                            <span className="text-sm font-medium text-[#38b2ac]">
                              {activity.cost}
                            </span>
                          </div>
                          <p className="text-sm text-[#475569] mb-2">
                            {activity.description}
                          </p>
                          <p className="text-xs text-[#64748b] italic">
                            {activity.tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Card Footer */}
              <div className="bg-[#f7fafc] px-6 py-4 border-t border-[#e2e8f0]">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-[#64748b]">
                    <Clock className="w-4 h-4" />
                    <span>Full day: ~8 hours</span>
                  </div>
                  <div className="text-[#64748b]">
                    Day 1 of 7
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
