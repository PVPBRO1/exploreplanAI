import { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah M.',
    location: 'Paris trip',
    avatar: 'SM',
    rating: 5,
    text: "I was skeptical at first, but the itinerary was incredible! Every restaurant recommendation was spot-on, and the local tips saved us so much time. We discovered hidden gems we never would have found on our own.",
  },
  {
    id: 2,
    name: 'James K.',
    location: 'Tokyo trip',
    avatar: 'JK',
    rating: 5,
    text: "Best $79 I've ever spent. Our Tokyo itinerary included hidden gems we never would have found on our own. Delivery was in 35 minutes! The PDF was beautifully designed and easy to follow.",
  },
  {
    id: 3,
    name: 'Emily R.',
    location: 'Rome trip',
    avatar: 'ER',
    rating: 5,
    text: "The presentation is beautiful - like a premium travel magazine. We followed the Rome itinerary exactly and had the best vacation ever. The pro tips about when to visit the Colosseum were priceless!",
  },
  {
    id: 4,
    name: 'Michael T.',
    location: 'Bali trip',
    avatar: 'MT',
    rating: 5,
    text: "We used WanderPlan for our honeymoon in Bali and it exceeded all expectations. The itinerary balanced relaxation and adventure perfectly. The restaurant picks were amazing!",
  },
  {
    id: 5,
    name: 'Lisa Chen',
    location: 'Barcelona trip',
    avatar: 'LC',
    rating: 5,
    text: "As a busy professional, I don't have time to plan trips. WanderPlan saved me hours of research and delivered an amazing Barcelona itinerary. Will definitely use again!",
  },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section ref={sectionRef} className="py-24 bg-[#f7fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0f172a] mb-4">
              Loved by Travelers Worldwide
            </h2>
            <p className="text-lg text-[#475569] max-w-xl">
              See what our customers say about their expertly planned trips
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border-2 border-[#e2e8f0] bg-white flex items-center justify-center text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border-2 border-[#e2e8f0] bg-white flex items-center justify-center text-[#64748b] hover:border-[#2563eb] hover:text-[#2563eb] transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`flex-shrink-0 w-[350px] sm:w-[400px] snap-start transition-all duration-600 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 h-full">
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-[#2563eb]/20 mb-4" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-[#475569] leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1e40af] to-[#2563eb] flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-[#0f172a]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[#64748b]">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
