import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, ArrowLeft, Plus, Sparkles, Calendar, Map, MapPin,
  Globe, RefreshCw, Compass, Plane, Route, Zap, HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage, TripState, Itinerary, NextQuestion, ItineraryDay, ItineraryActivity } from '../lib/ai/types';
import { createEmptyTripState } from '../lib/ai/types';
import { callPlanTrip } from '../lib/ai/client';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS, type Language } from '../lib/i18n/translations';
import { CHAT_BG_IMAGE, QUICK_ACTIONS } from '../lib/constants/images';

const ICON_MAP: Record<string, typeof Compass> = {
  Compass, Sparkles, Route, Zap, HelpCircle, Plane,
};

const categories = [
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

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'ai',
    text: "Hi! I'm your ExplorePlan travel agent. Tell me where you'd like to go and I'll build a personalized itinerary just for you.",
  },
];

function ActivityBlock({ label, activity }: { label: string; activity: ItineraryActivity; }) {
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

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tripState, setTripState] = useState<TripState>(createEmptyTripState());
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialIntentHandled = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialIntentHandled.current) return;
    initialIntentHandled.current = true;

    const intent = searchParams.get('intent');
    const destination = searchParams.get('destination');

    if (destination) {
      setTimeout(() => handleSend(`I'd like to plan a trip to ${destination}`), 500);
    } else if (intent) {
      const action = QUICK_ACTIONS.find(a => a.id === intent);
      if (action) {
        setTimeout(() => handleSend(action.message), 500);
      }
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
        .filter((m) => m.role !== 'ai' || m.id !== 1)
        .map((m) => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.text,
        }));

      const response = await callPlanTrip({
        messages: apiMessages,
        tripState,
        language,
      });

      if (response.tripState) {
        setTripState(response.tripState);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'ai',
          text: response.assistantMessage,
          nextQuestion: response.nextQuestion,
          itinerary: response.itinerary,
        },
      ]);
    } catch (err) {
      console.error('[ExplorePlan] Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: 'ai',
          text: t('chat.errorMessage'),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, tripState, language, t]);

  const hasConversation = messages.length > 1;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-[#faf9f6] border-r border-gray-100 flex-shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-zinc-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('chat.backHome')}
          </Link>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-zinc-900">ExplorePlan</span>
            <button
              onClick={() => {
                setMessages(initialMessages);
                setTripState(createEmptyTripState());
              }}
              className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center hover:bg-zinc-700 transition-colors"
              title={t('chat.newChat')}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-gray-400 px-1 leading-relaxed">
            Start a conversation with the AI travel agent to plan your perfect trip.
          </p>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold">
              E
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-900">Explorer</p>
              <p className="text-[11px] text-gray-400">Free plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Link to="/" className="md:hidden text-gray-500 hover:text-zinc-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-base font-bold text-zinc-900 md:hidden">ExplorePlan</span>
          </div>
          <LanguageSelector />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!hasConversation ? (
            /* Layla-style entry experience */
            <div className="relative min-h-full flex flex-col">
              {/* Background */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={CHAT_BG_IMAGE}
                  alt=""
                  className="w-full h-full object-cover opacity-[0.04]"
                />
              </div>

              <div className="relative flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-12 sm:py-16 w-full">
                {/* Mascot avatar */}
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-white text-2xl font-bold">E</span>
                </div>

                <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 text-center mb-3 leading-tight">
                  {t('chat.headline')}
                </h2>
                <p className="text-gray-500 text-center text-lg mb-8 max-w-md">
                  {t('chat.subtitle')}
                </p>

                {/* Input bar */}
                <div className="w-full max-w-xl mb-6">
                  <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-lg focus-within:border-[#0073cf] focus-within:shadow-xl transition-all duration-200">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={t('chat.placeholder')}
                      rows={1}
                      className="flex-1 bg-transparent resize-none outline-none text-base text-zinc-900 placeholder-gray-400 max-h-32"
                      style={{ lineHeight: '1.5' }}
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isTyping}
                      className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = ICON_MAP[action.icon] || Compass;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleSend(action.message)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-zinc-700 hover:border-[#0073cf] hover:text-[#0073cf] hover:shadow-md transition-all duration-200"
                      >
                        <Icon className="w-4 h-4" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>

                {/* Category chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {categories.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => handleSend(`I'm interested in ${cat.label} experiences`)}
                      className="group px-4 py-2.5 bg-white/80 backdrop-blur border border-gray-100 rounded-full text-sm font-medium text-zinc-700 hover:border-[#0073cf] hover:bg-blue-50 hover:text-[#0073cf] transition-all duration-200"
                    >
                      <span className="mr-1.5">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Suggested prompts */}
                <div className="w-full max-w-xl">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">Or try a suggestion</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestedPrompts.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="text-left px-4 py-3.5 bg-white border border-gray-100 rounded-xl text-sm text-zinc-700 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Conversation view */
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
                      <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <span className="text-white text-xs font-bold">E</span>
                      </div>
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

                      {/* Retry button on error */}
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

                      {/* Quick-select options from AI */}
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

                      {/* Itinerary card */}
                      {msg.itinerary && (
                        <div className="mt-3">
                          <ItineraryCard itinerary={msg.itinerary} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">E</span>
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input (in conversation view) */}
        {hasConversation && (
          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:border-gray-400 focus-within:bg-white transition-all duration-200">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
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
        )}
      </div>
    </div>
  );
}
