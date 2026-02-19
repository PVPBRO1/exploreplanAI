import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, ArrowLeft, Plus, Sparkles, Calendar, Map, MapPin,
  Globe, RefreshCw, Compass, Plane, Route, Zap, HelpCircle,
  ChevronDown, Paperclip, Mic,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage, TripState, Itinerary, NextQuestion, ItineraryDay, ItineraryActivity } from '../lib/ai/types';
import { createEmptyTripState } from '../lib/ai/types';
import { callPlanTrip } from '../lib/ai/client';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS, type Language } from '../lib/i18n/translations';
import { HERO_BG } from '../lib/constants/branding';
import { ASSISTANT_AVATAR, ASSISTANT_NAME, BRAND_NAME } from '../lib/constants/branding';
import { useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder';

const ICON_MAP: Record<string, typeof Compass> = {
  Compass, Sparkles, Route, Zap, HelpCircle, Plane,
};

const chatPlaceholders = [
  'Tell me about your dream trip...',
  'Where in the world do you want to go?',
  'Plan a 5-day trip to Tokyo...',
  'Honeymoon in Santorini...',
  'Road trip across the USA...',
  'Budget-friendly Europe adventure...',
];

const quickActions = [
  { id: 'new-trip', label: 'Create a new trip', icon: 'Compass', message: "I'd like to plan a new trip!" },
  { id: 'inspire', label: 'Inspire me where to go', icon: 'Sparkles', message: "Inspire me — where should I travel next?" },
  { id: 'road-trip', label: 'Plan a road trip', icon: 'Route', message: "Help me plan an epic road trip!" },
  { id: 'last-minute', label: 'Plan a last-minute escape', icon: 'Zap', message: "I need a last-minute getaway — what do you suggest?" },
  { id: 'quiz', label: 'Take a quiz', icon: 'HelpCircle', message: "Give me a quick travel quiz to figure out my ideal destination!" },
];

const categoryChips = [
  { emoji: '🏖️', label: 'Beach' },
  { emoji: '🍽️', label: 'Fine Dining' },
  { emoji: '🏛️', label: 'History' },
  { emoji: '🌿', label: 'Nature' },
  { emoji: '🎭', label: 'Culture' },
  { emoji: '🦁', label: 'Wildlife' },
  { emoji: '🎿', label: 'Adventure' },
  { emoji: '💆', label: 'Wellness' },
];

const suggestedPrompts = [
  'Plan a 5-day trip to Tokyo',
  'Best beaches in Southeast Asia',
  'Weekend getaway from NYC',
  'Italy food and culture tour',
  'Budget trip to Bali',
  'European summer itinerary',
];

// Fallback chips per question type for when AI doesn't provide them
const FALLBACK_CHIPS: Record<string, string[]> = {
  destination: ['Paris 🇫🇷', 'Tokyo 🇯🇵', 'Bali 🇮🇩', 'New York 🇺🇸', 'Rome 🇮🇹', 'Barcelona 🇪🇸', 'Santorini 🇬🇷', 'Maldives 🇲🇻'],
  tripLength: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
  dates: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
  budgetRange: ['budget', 'moderate', 'luxury'],
  pace: ['relaxed', 'balanced', 'packed'],
  interests: ['Food & Dining 🍽️', 'Art & Culture 🏛️', 'Nature 🌿', 'Nightlife 🎉', 'History 📜', 'Adventure 🎿', 'Shopping 🛍️', 'Wellness 💆'],
  accommodationPreference: ['Hotel', 'Airbnb', 'Boutique', 'Hostel', 'Resort'],
  travelersCount: ['Solo', '2 people', 'Family (3-4)', 'Group (5+)'],
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'ai',
    text: `Hey! I'm ${ASSISTANT_NAME} 👋 Tell me where you'd like to go and I'll build a personalised itinerary just for you.`,
  },
];

function ActivityBlock({ label, activity }: { label: string; activity: ItineraryActivity }) {
  const colorMap: Record<string, string> = {
    Morning: 'bg-amber-50 text-amber-600',
    Afternoon: 'bg-blue-50 text-[#0073cf]',
    Evening: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorMap[label] || 'bg-gray-50 text-gray-600'}`}>
          {label}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900">{activity.title}</p>
        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{activity.details}</p>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
          <MapPin className="w-3 h-3" />
          <span>{activity.duration} · {activity.location}</span>
        </div>
      </div>
    </div>
  );
}

function ItineraryCard({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-w-lg">
      <div className="bg-gradient-to-r from-[#0073cf] to-[#00b4d8] px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-white/80" />
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">AI Generated Itinerary</span>
        </div>
        <h3 className="text-lg font-bold text-white">{itinerary.tripTitle}</h3>
        {itinerary.estimatedDailyBudget && (
          <p className="text-xs text-white/70 mt-1">Est. daily budget: {itinerary.estimatedDailyBudget}</p>
        )}
      </div>

      <div className="px-5 py-4">
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{itinerary.summary}</p>
        <div className="space-y-4">
          {itinerary.days.map((day: ItineraryDay) => (
            <div key={day.day} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-3.5 h-3.5 text-[#0073cf]" />
                <span className="text-sm font-bold text-zinc-900">Day {day.day}</span>
              </div>
              <div className="space-y-3">
                <ActivityBlock label="Morning" activity={day.morning} />
                <ActivityBlock label="Afternoon" activity={day.afternoon} />
                <ActivityBlock label="Evening" activity={day.evening} />
              </div>
              {day.notes && day.notes.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-50">
                  {day.notes.map((note, i) => (
                    <p key={i} className="text-xs text-gray-400 italic">{note}</p>
                  ))}
                </div>
              )}
              {day.mapQuery && (
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(day.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-[#0073cf] hover:underline"
                >
                  <Map className="w-3 h-3" />
                  View on map
                </a>
              )}
            </div>
          ))}
        </div>
        {itinerary.recommendedAreasToStay && itinerary.recommendedAreasToStay.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-zinc-900 mb-2">Recommended areas to stay</p>
            <div className="flex flex-wrap gap-1.5">
              {itinerary.recommendedAreasToStay.map((area) => (
                <span key={area} className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-100">{area}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur border border-gray-200 text-sm font-medium text-zinc-700 hover:bg-white transition-colors"
      >
        <Globe className="w-3.5 h-3.5 text-gray-400" />
        <span>{LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl border border-gray-200 shadow-lg py-1 min-w-[180px] max-h-[300px] overflow-y-auto">
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => { setLanguage(lang); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${
                  lang === language ? 'font-semibold text-[#0073cf] bg-blue-50/50' : 'text-zinc-700'
                }`}
              >
                <span>{LANGUAGE_FLAGS[lang]}</span>
                <span>{LANGUAGE_LABELS[lang]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EntryScreen({ onSend }: { onSend: (msg: string) => void }) {
  const [input, setInput] = useState('');
  const { currentPlaceholder, isAnimating } = useRotatingPlaceholder(chatPlaceholders, 3000);

  const handleSubmit = (msg?: string) => {
    const text = msg || input.trim();
    if (!text) return;
    onSend(text);
  };

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <img
          src={ASSISTANT_AVATAR}
          alt={ASSISTANT_NAME}
          className="w-16 h-16 rounded-full object-cover border-2 border-white/60 shadow-xl mb-5"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2 leading-tight"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
          Where would you like to go?
        </h1>
        <p className="text-white/80 text-center text-base mb-7 max-w-sm"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
          Tell {ASSISTANT_NAME} about your dream trip and get a personalised itinerary in seconds.
        </p>

        {/* Input */}
        <div className="w-full max-w-xl mb-4">
          <div className="bg-white rounded-3xl shadow-2xl p-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
              }}
              placeholder={currentPlaceholder}
              rows={1}
              className="w-full min-h-[52px] resize-none border-0 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-base leading-relaxed"
              style={{ opacity: isAnimating ? 0.6 : 1, transition: 'opacity 0.3s ease' }}
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium transition-colors">
                <Paperclip className="w-3.5 h-3.5" />
                Attach
              </button>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleSubmit()}
                  disabled={!input.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Plan my trip
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap justify-center gap-2 mb-4 max-w-xl">
          {quickActions.map((action) => {
            const Icon = ICON_MAP[action.icon] || Compass;
            return (
              <button
                key={action.id}
                onClick={() => handleSubmit(action.message)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 backdrop-blur-sm text-white text-xs font-medium border border-white/30 rounded-full hover:bg-white/25 transition-all"
              >
                <Icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-5 max-w-xl">
          {categoryChips.map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleSubmit(`I'm interested in ${cat.label} experiences`)}
              className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-medium text-white hover:bg-white/20 transition-all"
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Suggested prompts */}
        <div className="w-full max-w-xl">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 text-center">Or try a suggestion</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedPrompts.map((q) => (
              <button
                key={q}
                onClick={() => handleSubmit(q)}
                className="text-left px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl text-xs text-white/90 hover:bg-white/20 hover:border-white/30 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tripState, setTripState] = useState<TripState>(createEmptyTripState());
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialIntentHandled = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialIntentHandled.current) return;
    initialIntentHandled.current = true;

    const msg = searchParams.get('msg');
    const intent = searchParams.get('intent');
    const destination = searchParams.get('destination');

    if (msg) {
      setTimeout(() => handleSend(msg), 400);
    } else if (destination) {
      setTimeout(() => handleSend(`I'd like to plan a trip to ${destination}`), 400);
    } else if (intent) {
      const action = quickActions.find((a) => a.id === intent);
      if (action) setTimeout(() => handleSend(action.message), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: msg };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const apiMessages = [...messages, userMessage]
        .filter((m) => !(m.role === 'ai' && m.id === 1))
        .map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

      const response = await callPlanTrip({ messages: apiMessages, tripState, language });

      if (response.tripState) setTripState(response.tripState);

      // Augment nextQuestion options with fallback chips if AI didn't return any
      let nextQuestion: NextQuestion | undefined = response.nextQuestion ?? undefined;
      if (nextQuestion && (!nextQuestion.options || nextQuestion.options.length === 0)) {
        const fallback = FALLBACK_CHIPS[nextQuestion.key];
        if (fallback) {
          nextQuestion = { ...nextQuestion, options: fallback };
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'ai',
          text: response.assistantMessage,
          nextQuestion,
          itinerary: response.itinerary,
        },
      ]);
    } catch (err) {
      console.error('[Vincent] Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'ai', text: t('chat.errorMessage'), isError: true },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, tripState, language, t]);

  const hasConversation = messages.length > 1;

  return (
    <div className="flex h-screen bg-white overflow-hidden flex-col">
      {/* Top bar */}
      <div className={`flex items-center justify-between px-4 py-3 flex-shrink-0 z-10 transition-all duration-300 ${
        hasConversation
          ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
          : 'bg-transparent absolute top-0 left-0 right-0'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              hasConversation ? 'text-gray-500 hover:text-zinc-900' : 'text-white/80 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to home</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {hasConversation && (
            <>
              <img src={ASSISTANT_AVATAR} alt={ASSISTANT_NAME} className="w-6 h-6 rounded-full object-cover" />
              <span className="text-sm font-bold text-zinc-900">{BRAND_NAME}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasConversation && (
            <button
              onClick={() => {
                setMessages(initialMessages);
                setTripState(createEmptyTripState());
              }}
              title="New chat"
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Plus className="w-4 h-4 text-zinc-700" />
            </button>
          )}
          <LanguageSelector />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col min-h-0">
        {!hasConversation ? (
          <EntryScreen onSend={handleSend} />
        ) : (
          <>
            {/* Conversation */}
            <div className="flex-1 overflow-y-auto pt-16">
              <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'ai' && (
                        <img
                          src={ASSISTANT_AVATAR}
                          alt={ASSISTANT_NAME}
                          className="w-7 h-7 rounded-full object-cover mr-3 mt-0.5 flex-shrink-0"
                        />
                      )}
                      <div className="max-w-[85%]">
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                            msg.role === 'user'
                              ? 'bg-zinc-900 text-white rounded-br-sm'
                              : msg.isError
                              ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-sm'
                              : 'bg-gray-100 text-zinc-800 rounded-bl-sm'
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: msg.text
                              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\n/g, '<br/>'),
                          }}
                        />

                        {msg.isError && (
                          <button
                            onClick={() => {
                              const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
                              if (lastUserMsg) {
                                setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                                handleSend(lastUserMsg.text);
                              }
                            }}
                            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
                          >
                            <RefreshCw className="w-3 h-3" />
                            {t('chat.retry')}
                          </button>
                        )}

                        {/* Quick-select chips */}
                        {msg.nextQuestion?.options && msg.nextQuestion.options.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {msg.nextQuestion.options.map((option) => (
                              <button
                                key={option}
                                onClick={() => handleSend(option)}
                                disabled={isTyping}
                                className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-zinc-700 hover:border-[#0073cf] hover:text-[#0073cf] hover:shadow-sm transition-all disabled:opacity-50"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}

                        {msg.itinerary && (
                          <div className="mt-3">
                            <ItineraryCard itinerary={msg.itinerary} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <div className="flex items-center gap-3">
                    <img src={ASSISTANT_AVATAR} alt={ASSISTANT_NAME} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input bar */}
            <div className="border-t border-gray-100 p-4 bg-white flex-shrink-0">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-gray-400 focus-within:bg-white transition-all duration-200">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                    }}
                    placeholder={t('chat.placeholder')}
                    rows={1}
                    className="flex-1 bg-transparent resize-none outline-none text-sm text-zinc-900 placeholder-gray-400 max-h-32"
                    style={{ lineHeight: '1.5' }}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isTyping}
                    className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
                <p className="text-center text-[11px] text-gray-400 mt-2">
                  {t('chat.disclaimer')}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
