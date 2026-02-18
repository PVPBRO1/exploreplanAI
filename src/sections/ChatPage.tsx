import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ArrowLeft, MapPin, Plus, Sparkles, Calendar, Clock, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ChatMessage, TripPlanInputs, Itinerary } from '../lib/ai/types';
import { createEmptyTripInputs } from '../lib/ai/types';
import { generateItinerary } from '../lib/ai/client';
import { generateFallbackItinerary } from '../lib/ai/fallback';
import { getNextQuestion, isReadyToGenerate } from '../lib/planner/questions';
import { parseUserResponse, extractDestinationFromMessage } from '../lib/planner/parser';

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'ai',
    text: "Hi! I'm your AI travel planner. Tell me where you'd like to go and I'll build a personalized itinerary for you.",
  },
];

const suggestedQuestions = [
  'Plan a 5-day trip to Tokyo',
  'Best beaches in Southeast Asia',
  'Weekend getaway from NYC',
  'Italy food and culture tour',
  'Budget trip to Bali',
  'European summer itinerary',
];

const categories = [
  '🏖️ Beach',
  '🍽️ Fine Dining',
  '🏛️ History',
  '🌿 Nature',
  '🎭 Culture',
  '🦁 Wildlife',
  '🎿 Adventure',
  '💆 Wellness',
];

const recentConversations = [
  { id: 1, title: 'Paris 4-day trip', preview: 'Eiffel Tower, Louvre...', date: 'Today' },
  { id: 2, title: 'Tokyo food tour', preview: 'Shibuya, Tsukiji...', date: 'Yesterday' },
  { id: 3, title: 'Bali wellness retreat', preview: 'Ubud, Seminyak...', date: '3 days ago' },
];

function ItineraryCard({ itinerary }: { itinerary: Itinerary }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm max-w-lg">
      <div className="bg-gradient-to-r from-[#0073cf] to-[#00b4d8] px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-white/80" />
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">AI Generated Itinerary</span>
        </div>
        <h3 className="text-lg font-bold text-white">{itinerary.tripTitle}</h3>
      </div>

      <div className="px-5 py-4">
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{itinerary.summary}</p>

        <div className="space-y-4">
          {itinerary.days.map((day) => (
            <div key={day.day} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-3.5 h-3.5 text-[#0073cf]" />
                <span className="text-sm font-bold text-zinc-900">Day {day.day}</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="inline-block text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">AM</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{day.morning}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="inline-block text-[10px] font-semibold bg-blue-50 text-[#0073cf] px-2 py-0.5 rounded-full">PM</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{day.afternoon}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className="inline-block text-[10px] font-semibold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">EVE</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{day.evening}</p>
                </div>
              </div>

              {day.optionalNotes && (
                <p className="mt-2.5 text-xs text-gray-400 italic border-t border-gray-50 pt-2">
                  {day.optionalNotes}
                </p>
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
      </div>
    </div>
  );
}

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [tripInputs, setTripInputs] = useState<TripPlanInputs>(createEmptyTripInputs());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addAiMessage = useCallback((text: string, itinerary?: Itinerary) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'ai', text, itinerary },
    ]);
  }, []);

  const doGenerateItinerary = useCallback(
    async (inputs: TripPlanInputs) => {
      setIsTyping(true);
      addAiMessage(
        `I have everything I need! Let me build your perfect itinerary for **${inputs.destination}**...`
      );

      await new Promise((r) => setTimeout(r, 600));

      try {
        const itinerary = await generateItinerary(inputs);
        setIsTyping(false);
        addAiMessage("Here's your personalized itinerary:", itinerary);
      } catch {
        const fallback = generateFallbackItinerary(inputs);
        setIsTyping(false);
        addAiMessage(
          "I've put together an itinerary based on your preferences. (Note: running in offline mode — connect the API server for AI-powered results!)",
          fallback
        );
      }
    },
    [addAiMessage]
  );

  async function handleSend(text?: string) {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text: msg }]);
    setInput('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 400));

    let updatedInputs = { ...tripInputs };

    let isFirstMessage = false;

    if (!updatedInputs.destination) {
      isFirstMessage = true;
      const dest = extractDestinationFromMessage(msg);
      if (dest) {
        updatedInputs.destination = dest;
      } else {
        updatedInputs.destination = msg.trim();
      }

      const dayMatch = msg.match(/(\d+)\s*[-–]?\s*day/i);
      if (dayMatch) {
        updatedInputs.tripLength = parseInt(dayMatch[1], 10);
      }
    }

    if (!isFirstMessage) {
      const parsed = parseUserResponse(msg, updatedInputs);
      if (parsed) {
        if (parsed.field === 'interests' && Array.isArray(parsed.value)) {
          updatedInputs = { ...updatedInputs, interests: parsed.value as string[] };
        } else if (parsed.field === 'tripLength') {
          updatedInputs = { ...updatedInputs, tripLength: parsed.value as number };
        } else if (parsed.field === 'travelers') {
          updatedInputs = { ...updatedInputs, travelers: parsed.value as number };
        } else if (parsed.field === 'pace') {
          updatedInputs = { ...updatedInputs, pace: parsed.value as TripPlanInputs['pace'] };
        } else {
          updatedInputs = { ...updatedInputs, [parsed.field]: parsed.value };
        }
      }
    }

    setTripInputs(updatedInputs);

    if (isReadyToGenerate(updatedInputs)) {
      setIsTyping(false);
      await doGenerateItinerary(updatedInputs);
      return;
    }

    const nextQ = getNextQuestion(updatedInputs);
    setIsTyping(false);

    if (nextQ) {
      const ack = updatedInputs.destination && !tripInputs.destination
        ? `Great choice — **${updatedInputs.destination}**! `
        : 'Got it! ';
      addAiMessage(ack + nextQ);
    } else {
      addAiMessage(
        "Thanks! Let me put your itinerary together now..."
      );
      await doGenerateItinerary(updatedInputs);
    }
  }

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
            Back to home
          </Link>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-zinc-900">ExplorePlan</span>
            <button
              onClick={() => {
                setMessages(initialMessages);
                setTripInputs(createEmptyTripInputs());
              }}
              className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Recent trips
          </p>
          <div className="space-y-1">
            {recentConversations.map((conv) => (
              <button
                key={conv.id}
                className="w-full text-left px-3 py-3 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0073cf]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{conv.title}</p>
                    <p className="text-xs text-gray-400 truncate">{conv.preview}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
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
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Link to="/" className="text-gray-500 hover:text-zinc-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-base font-bold text-zinc-900">ExplorePlan</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 1 ? (
            <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
              <div className="text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto mb-5">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-2">
                  Where would you like to go?
                </h2>
                <p className="text-gray-500">
                  Tell our AI about your dream trip and we'll build a personalized
                  itinerary in seconds.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      handleSend(
                        `I'm interested in ${cat.split(' ').slice(1).join(' ')} experiences`
                      )
                    }
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQuestions.map((q) => (
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
          ) : (
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
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
                          : 'bg-gray-100 text-zinc-800 rounded-bl-sm'
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: msg.text
                          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>'),
                      }}
                    />
                    {msg.itinerary && (
                      <div className="mt-3">
                        <ItineraryCard itinerary={msg.itinerary} />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">E</span>
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
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
                placeholder="Ask me anything about your trip..."
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
              ExplorePlan can make mistakes. Verify important travel details before
              booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
