import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { type: 'user' as const, text: "Plan a 5-day trip to Paris for a couple. We love food, art, and have a moderate budget." },
  { type: 'ai' as const, text: "Great choice! Paris is perfect for food and art lovers. Let me ask a few things to personalize your trip. What pace do you prefer — relaxed, balanced, or packed?" },
  { type: 'chips' as const, items: ['🍽️ Fine Dining', '🏛️ Culture & Art', '🌿 Parks', '🎭 Theater', '🛍️ Shopping', '📸 Photography'] },
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

const STEP_DELAY_MS = 1800;

export function WalkthroughModal({ isOpen, onClose }: WalkthroughModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    if (prefersReduced) {
      setCurrentStep(STEPS.length);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setCurrentStep(i + 1), (i + 1) * STEP_DELAY_MS));
    });

    return () => timers.forEach(clearTimeout);
  }, [isOpen, prefersReduced]);

  const handleContinue = () => {
    onClose();
    setTimeout(() => {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  if (!isOpen) return null;

  const visibleSteps = prefersReduced ? STEPS : STEPS.slice(0, currentStep);
  const isComplete = currentStep >= STEPS.length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={prefersReduced ? {} : { opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center">
                <span className="text-white text-sm font-bold">E</span>
              </div>
              <span className="text-sm font-semibold text-zinc-900">See how ExplorePlan works</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {visibleSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={prefersReduced ? {} : { opacity: 0, y: 12 }}
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
                    <div className="w-7 h-7 rounded-full bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">E</span>
                    </div>
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
                        initial={prefersReduced ? {} : { opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: j * 0.08 }}
                        className="px-3 py-1.5 bg-blue-50 text-[#0073cf] rounded-full text-xs font-semibold border border-blue-100"
                      >
                        {chip}
                      </motion.span>
                    ))}
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
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">AI Generated Itinerary</span>
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

            {/* Typing indicator */}
            {!isComplete && !prefersReduced && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">E</span>
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
            <span className="text-xs text-gray-400">
              {isComplete ? "That's how easy it is!" : 'Watch the magic happen...'}
            </span>
            <button
              onClick={handleContinue}
              className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-full hover:bg-zinc-800 transition-colors"
            >
              {isComplete ? 'Continue →' : 'Skip'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
