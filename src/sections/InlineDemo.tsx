import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ASSISTANT_AVATAR, ASSISTANT_NAME, BRAND_NAME } from '../lib/constants/branding';

const DEMO_STEPS = [
  {
    type: 'user' as const,
    text: "Plan a 5-day trip to Paris for a couple. We love food, art, and have a moderate budget.",
  },
  {
    type: 'ai' as const,
    text: `Ooh, Paris! 🥐 Fantastic choice — did you know Paris has over 1,800 bakeries? You're going to eat SO well. Let me ask a few things to personalise your trip. What pace do you prefer?`,
  },
  {
    type: 'chips' as const,
    items: ['relaxed', 'balanced', 'packed'],
  },
  {
    type: 'user' as const,
    text: 'balanced',
  },
  {
    type: 'chips-category' as const,
    label: 'What kind of experiences?',
    items: ['🍽️ Fine Dining', '🏛️ Culture & Art', '🌿 Parks', '🎭 Theater', '🛍️ Shopping', '📸 Photography'],
  },
  {
    type: 'itinerary' as const,
    title: '5-Day Paris Itinerary',
    subtitle: 'Art, food & culture — balanced pace',
    days: [
      'Day 1: Eiffel Tower & Seine Cruise',
      'Day 2: Louvre Museum & Le Marais',
      'Day 3: Versailles Day Trip',
      'Day 4: Montmartre & Sacré-Cœur',
      'Day 5: Champs-Élysées & Farewell Dinner',
    ],
  },
];

const STEP_DELAY = 1600;

export function InlineDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.25 },
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    if (prefersReduced) {
      setVisibleCount(DEMO_STEPS.length);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    DEMO_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), (i + 1) * STEP_DELAY));
    });
    return () => timers.forEach(clearTimeout);
  }, [hasStarted, prefersReduced]);

  const isComplete = visibleCount >= DEMO_STEPS.length;
  const visibleSteps = DEMO_STEPS.slice(0, visibleCount);

  return (
    <section className="py-16 sm:py-24 bg-[#faf9f6]" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Watch {ASSISTANT_NAME} plan your trip
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Just describe what you want. {ASSISTANT_NAME} does the rest — in seconds.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Demo window */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60">
              <img
                src={ASSISTANT_AVATAR}
                alt={ASSISTANT_NAME}
                className="w-9 h-9 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-sm font-semibold text-zinc-900">{BRAND_NAME}</p>
                <p className="text-[11px] text-emerald-500 font-medium">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-6 space-y-4 min-h-[300px]">
              <AnimatePresence initial={false}>
                {visibleSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={prefersReduced ? {} : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {step.type === 'user' && (
                      <div className="flex justify-end">
                        <div className="bg-zinc-900 text-white px-4 py-3 rounded-2xl rounded-br-sm text-sm max-w-[85%] leading-relaxed">
                          {step.text}
                        </div>
                      </div>
                    )}

                    {step.type === 'ai' && (
                      <div className="flex gap-3">
                        <img
                          src={ASSISTANT_AVATAR}
                          alt={ASSISTANT_NAME}
                          className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5"
                        />
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-zinc-800 max-w-[85%] leading-relaxed">
                          {step.text}
                        </div>
                      </div>
                    )}

                    {step.type === 'chips' && (
                      <div className="flex flex-wrap gap-2 pl-10">
                        {step.items?.map((chip, j) => (
                          <motion.span
                            key={j}
                            initial={prefersReduced ? {} : { opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: j * 0.08 }}
                            className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-zinc-700"
                          >
                            {chip}
                          </motion.span>
                        ))}
                      </div>
                    )}

                    {step.type === 'chips-category' && (
                      <div className="pl-10">
                        {step.label && (
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            {step.label}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {step.items?.map((chip, j) => (
                            <motion.span
                              key={j}
                              initial={prefersReduced ? {} : { opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: j * 0.08 }}
                              className="px-3 py-1.5 bg-blue-50 text-[#0073cf] rounded-full text-xs font-semibold border border-blue-100"
                            >
                              {chip}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.type === 'itinerary' && (
                      <motion.div
                        initial={prefersReduced ? {} : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="ml-10 bg-gradient-to-br from-[#0073cf] to-[#00b4d8] rounded-2xl p-5 text-white"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-white/80" />
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
                            AI Generated Itinerary
                          </span>
                        </div>
                        <h4 className="font-bold text-base mb-1">{step.title}</h4>
                        <p className="text-xs text-white/70 mb-3">{step.subtitle}</p>
                        <div className="space-y-1.5">
                          {step.days?.map((day, j) => (
                            <motion.div
                              key={j}
                              initial={prefersReduced ? {} : { opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: j * 0.1 }}
                              className="text-sm text-white/90 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                              {day}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {!isComplete && hasStarted && !prefersReduced && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <img
                    src={ASSISTANT_AVATAR}
                    alt={ASSISTANT_NAME}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {isComplete && (
              <motion.div
                initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-6 py-5 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between"
              >
                <p className="text-sm text-gray-500">That's how easy it is!</p>
                <button
                  onClick={() => navigate('/chat')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors"
                >
                  Start chatting
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
