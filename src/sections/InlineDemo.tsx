import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Send, Paperclip, Mic, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { ASSISTANT_AVATAR, ASSISTANT_NAME, BRAND_NAME } from '../lib/constants/branding';

interface DemoStep {
  type: 'user' | 'ai' | 'chips';
  text?: string;
  items?: string[];
}

const DEMO_STEPS: DemoStep[] = [
  { type: 'user', text: 'Plan a 5-day trip to Paris for a couple. We love food, art, and have a moderate budget.' },
  { type: 'ai', text: '**Paris** in 5 days — solid choice. Louvre, croissants, the Seine at dusk. What pace are you thinking?' },
  { type: 'chips', items: ['Relaxed', 'Balanced', 'Packed'] },
];

const STEP_DELAY = 1800;
const RIGHT_PANEL_IMAGE = '/destinations/paris.jpg';

export function InlineDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.25 },
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    if (prefersReduced) { setVisibleCount(DEMO_STEPS.length); return; }
    const timers: ReturnType<typeof setTimeout>[] = [];
    DEMO_STEPS.forEach((_, i) => { timers.push(setTimeout(() => setVisibleCount(i + 1), (i + 1) * STEP_DELAY)); });
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

        {/* Browser Frame Mockup */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-lg px-3 py-1 text-xs text-gray-400 border border-gray-200 max-w-md mx-auto text-center truncate">
                  wanderplan.ai/chat
                </div>
              </div>
            </div>

            {/* Split layout mimicking chat page */}
            <div className="flex" style={{ height: 460 }}>
              {/* Left: Chat panel */}
              <div className="flex-1 flex flex-col min-w-0" style={{ flex: '0 0 58%' }}>
                {/* Chat top bar */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white/95 flex-shrink-0">
                  <button className="flex items-center gap-1 text-xs text-gray-500">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <img src={ASSISTANT_AVATAR} alt={ASSISTANT_NAME} className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-xs font-bold text-zinc-900">{BRAND_NAME}</span>
                  </div>
                  <div className="w-10" />
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-hidden px-4 py-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {visibleSteps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={prefersReduced ? {} : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        {step.type === 'user' && (
                          <div className="flex justify-end">
                            <div className="bg-zinc-900 text-white px-3.5 py-2.5 rounded-2xl rounded-br-sm text-xs max-w-[85%] leading-relaxed">
                              {step.text}
                            </div>
                          </div>
                        )}
                        {step.type === 'ai' && (
                          <div className="flex gap-2">
                            <img src={ASSISTANT_AVATAR} alt={ASSISTANT_NAME} className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
                            <div
                              className="bg-gray-100 px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-xs text-zinc-800 max-w-[85%] leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: (step.text || '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
                            />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {!isComplete && hasStarted && !prefersReduced && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                      <img src={ASSISTANT_AVATAR} alt={ASSISTANT_NAME} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                      <div className="bg-gray-100 px-3.5 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Chip bar above input */}
                {visibleSteps.some((s) => s.type === 'chips') && (
                  <div className="px-4 pb-2 flex-shrink-0">
                    <div className="flex gap-1.5 flex-wrap">
                      {(visibleSteps.find((s) => s.type === 'chips')?.items || []).map((chip, j) => (
                        <motion.span
                          key={j}
                          initial={prefersReduced ? {} : { opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: j * 0.06 }}
                          className="px-3 py-1.5 rounded-full bg-white/90 text-gray-700 text-[11px] font-medium border border-gray-200"
                        >
                          {chip}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fake input bar */}
                <div className="p-3 flex-shrink-0 border-t border-gray-100">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
                    <div className="text-xs text-gray-400 mb-2">Tell me about your dream trip...</div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 text-[10px] text-gray-500">
                        <Calendar className="w-2.5 h-2.5" /> Select dates
                      </span>
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 text-[10px] text-gray-500">
                        <Users className="w-2.5 h-2.5" /> 2 travelers
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-50">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Paperclip className="w-2.5 h-2.5" /> Attach
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Mic className="w-3 h-3 text-gray-300" />
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 text-white text-[10px] font-semibold">
                          <Send className="w-2.5 h-2.5" /> Plan my trip
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Inspiration image */}
              <div className="hidden md:block relative border-l border-gray-100" style={{ flex: '0 0 42%' }}>
                <img src={RIGHT_PANEL_IMAGE} alt="Paris, France" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white text-xl font-bold" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>Paris, France</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className={`h-1 rounded-full ${i === 1 ? 'bg-white w-4' : 'bg-white/40 w-1'}`} />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                        <ChevronLeft className="w-3 h-3 text-white" />
                      </span>
                      <span className="w-6 h-6 rounded-full bg-white/20 border border-white/30 flex items-center justify-center">
                        <ChevronRight className="w-3 h-3 text-white" />
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white text-zinc-900 text-[10px] font-bold">Plan this trip</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA footer */}
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
