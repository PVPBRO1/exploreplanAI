import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, ArrowLeft, Plus, Sparkles, Calendar,
  Globe, RefreshCw, Compass, Route, Zap, HelpCircle,
  ChevronDown, ChevronLeft, ChevronRight, Paperclip, Mic, Users, Minus,
  X, Loader2, DollarSign, Check, Pencil,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage, TripState, Itinerary, NextQuestion, AirbnbListing, FlightEstimate } from '../lib/ai/types';
import { createEmptyTripState } from '../lib/ai/types';
import { callPlanTrip } from '../lib/ai/client';
import { fetchAirbnbListings } from '../lib/ai/airbnb';
import { fetchFlightEstimates } from '../lib/ai/flights';
import { fetchMultipleLocationImages } from '../lib/api/unsplash';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { LANGUAGE_LABELS, LANGUAGE_FLAGS, type Language } from '../lib/i18n/translations';
import { HERO_BG, ASSISTANT_AVATAR, ASSISTANT_NAME, BRAND_NAME } from '../lib/constants/branding';
import { useRotatingPlaceholder } from '../hooks/useRotatingPlaceholder';
import { TripPanel } from '../components/TripPanel';

const INSPIRATION_SLIDES = [
  { name: 'Dubai, UAE', image: '/destinations/dubai.jpg' },
  { name: 'Paris, France', image: '/destinations/paris.jpg' },
  { name: 'Bali, Indonesia', image: '/destinations/bali.jpg' },
  { name: 'Rome, Italy', image: '/destinations/rome.jpg' },
  { name: 'Barcelona, Spain', image: '/destinations/barcelona.jpg' },
  { name: 'Tokyo, Japan', image: '/destinations/tokyo.jpg' },
  { name: 'Sydney, Australia', image: '/destinations/sydney.jpg' },
  { name: 'New York City', image: '/destinations/nyc.jpg' },
  { name: 'Marrakech, Morocco', image: '/destinations/marrakech.jpg' },
  { name: 'Egyptian Pyramids', image: '/destinations/egypt.jpg' },
  { name: 'Great Wall, China', image: '/destinations/great-wall.jpg' },
  { name: 'Nepal & Himalayas', image: '/destinations/nepal.jpg' },
  { name: 'Yosemite, USA', image: '/destinations/yosemite.jpg' },
  { name: 'Porto, Portugal', image: '/destinations/porto.jpg' },
  { name: 'London, UK', image: '/destinations/london.jpg' },
  { name: 'Italian Village', image: '/destinations/italian-village.jpg' },
  { name: 'Mexico City', image: '/destinations/mexico.jpg' },
  { name: 'Beach Escape', image: '/destinations/beach.jpg' },
  { name: 'Stonehenge, UK', image: '/destinations/stonehenge.jpg' },
];

const ICON_MAP: Record<string, typeof Compass> = {
  Compass, Sparkles, Route, Zap, HelpCircle,
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
  { emoji: '\u{1F3D6}', label: 'Beach' },
  { emoji: '\u{1F37D}', label: 'Fine Dining' },
  { emoji: '\u{1F3DB}', label: 'History' },
  { emoji: '\u{1F33F}', label: 'Nature' },
  { emoji: '\u{1F3AD}', label: 'Culture' },
  { emoji: '\u{1F981}', label: 'Wildlife' },
  { emoji: '\u{26F7}', label: 'Adventure' },
  { emoji: '\u{1F486}', label: 'Wellness' },
];

const suggestedPrompts = [
  'Plan a 5-day trip to Tokyo',
  'Best beaches in Southeast Asia',
  'Weekend getaway from NYC',
  'Italy food and culture tour',
  'Budget trip to Bali',
  'European summer itinerary',
];

const FALLBACK_CHIPS: Record<string, string[]> = {
  destination: ['Paris', 'Tokyo', 'Bali', 'New York', 'Rome', 'Barcelona', 'London', 'Santorini'],
  tripLength: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
  dates: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
  timing: ['March', 'April', 'May', 'June', 'July', 'August'],
  budgetAmount: ['$1,000', '$2,000', '$5,000', 'Custom'],
  budgetRange: ['$1,000', '$2,000', '$5,000', 'Custom'],
  pace: ['Relaxed', 'Balanced', 'Packed'],
  interests: ['Food & Dining', 'Art & Culture', 'Nature', 'Nightlife', 'History', 'Adventure', 'Shopping', 'Wellness'],
  accommodationPreference: ['Hotel', 'Airbnb', 'Boutique', 'Hostel', 'Resort'],
  travelersCount: ['Solo', 'Couple', 'Family (3-4)', 'Group (5+)'],
  confirmation: ['Looks good!', 'Change something'],
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'ai',
    text: `Hey, I'm ${ASSISTANT_NAME} \u{1F44B} Tell me where you want to go and I'll put together a trip for you.`,
  },
];

function parseDurationToDays(text: string): number | null {
  const lower = text.toLowerCase().trim();
  const numMatch = lower.match(/^(\d+)\s*days?$/);
  if (numMatch) return parseInt(numMatch[1], 10);
  if (lower === '1 week') return 7;
  if (lower === '2 weeks') return 14;
  if (lower === '10 days') return 10;
  return null;
}

function parseBudgetAmount(text: string): number | null {
  const cleaned = text.replace(/[$,]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

function getMonthChips(): string[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(d.toLocaleString('en-US', { month: 'long' }));
  }
  return months;
}

/* ─── Custom Calendar Helpers ─── */

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateShort(key: string): string {
  const d = parseDateKey(key);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

/* ─── Date Picker Widget ─── */

function DatePickerWidget({
  tripState,
  onUpdate,
  externalOpen,
  onExternalOpenHandled,
  prefillStart,
  prefillEnd,
}: {
  tripState: TripState;
  onUpdate: (s: Partial<TripState>) => void;
  externalOpen?: boolean;
  onExternalOpenHandled?: () => void;
  prefillStart?: string | null;
  prefillEnd?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const todayKey = toDateKey(now);

  useEffect(() => {
    if (externalOpen && !open) {
      if (prefillStart) setStartDate(prefillStart);
      if (prefillEnd) setEndDate(prefillEnd);
      if (prefillStart) {
        const d = parseDateKey(prefillStart);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
      openCalendar();
      onExternalOpenHandled?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalOpen]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const openCalendar = () => {
    if (!triggerRef.current) { setOpen(true); return; }
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverW = 308;
    const popoverH = 380;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = rect.left;
    let top: number;
    if (rect.top - popoverH - 8 > 0) { top = rect.top - popoverH - 8; }
    else { top = rect.bottom + 8; }
    if (left + popoverW > vw - 8) left = vw - popoverW - 8;
    if (left < 8) left = 8;
    if (top + popoverH > vh - 8) top = vh - popoverH - 8;
    if (top < 8) top = 8;
    setPopoverStyle({ position: 'fixed', top, left, width: popoverW });
    setOpen(true);
  };

  const handleDayClick = (dayNum: number) => {
    const key = toDateKey(new Date(viewYear, viewMonth, dayNum));
    if (key < todayKey) return;
    if (!startDate || (startDate && endDate)) {
      setStartDate(key);
      setEndDate(null);
    } else if (key < startDate) {
      setStartDate(key);
    } else {
      setEndDate(key);
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      const s = parseDateKey(startDate);
      const e = parseDateKey(endDate);
      const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
      onUpdate({
        dates: `${formatDateShort(startDate)} \u2013 ${formatDateShort(endDate)}`,
        tripLengthDays: days,
        startIso: startDate,
        endIso: endDate,
      });
    }
    setOpen(false);
  };

  const isInRange = (key: string) => {
    if (!startDate) return false;
    const rangeEnd = endDate || hoverDate;
    if (!rangeEnd) return false;
    return key > startDate && key < rangeEnd;
  };

  const calendarDays = getCalendarDays(viewYear, viewMonth);
  const label = tripState.dates || 'Select dates';

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => open ? setOpen(false) : openCalendar()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        {label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div style={popoverStyle} className="z-50 bg-white rounded-2xl border border-gray-200 shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <ChevronDown className="w-4 h-4 text-gray-500 rotate-90" />
              </button>
              <span className="text-sm font-semibold text-zinc-900">{MONTH_NAMES[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <ChevronDown className="w-4 h-4 text-gray-500 -rotate-90" />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAY_HEADERS.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((dayNum, i) => {
                if (dayNum === null) return <div key={`empty-${i}`} />;
                const key = toDateKey(new Date(viewYear, viewMonth, dayNum));
                const isPast = key < todayKey;
                const isStart = key === startDate;
                const isEnd = key === endDate;
                const isSelected = isStart || isEnd;
                const inRange = isInRange(key);
                const isToday = key === todayKey;
                return (
                  <button
                    key={key}
                    disabled={isPast}
                    onClick={() => handleDayClick(dayNum)}
                    onMouseEnter={() => { if (startDate && !endDate) setHoverDate(key); }}
                    onMouseLeave={() => setHoverDate(null)}
                    className={`relative h-9 text-xs font-medium transition-all duration-150
                      ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                      ${isSelected ? 'bg-zinc-900 text-white rounded-full hover:bg-zinc-800 z-10' : ''}
                      ${inRange ? 'bg-zinc-100 text-zinc-700' : ''}
                      ${isStart && endDate ? 'rounded-l-full' : ''}
                      ${isEnd ? 'rounded-r-full' : ''}
                      ${isToday && !isSelected ? 'font-bold text-zinc-900' : ''}
                      ${!isSelected && !inRange && !isPast ? 'text-zinc-700 rounded-full' : ''}
                    `}
                  >
                    {dayNum}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-zinc-900" />
                    )}
                  </button>
                );
              })}
            </div>
            {startDate && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <span className="font-semibold">{formatDateShort(startDate)}</span>
                  {endDate ? (
                    <>
                      <span className="text-gray-300">{'\u2192'}</span>
                      <span className="font-semibold">{formatDateShort(endDate)}</span>
                      <span className="ml-auto text-gray-400">
                        {Math.ceil((parseDateKey(endDate).getTime() - parseDateKey(startDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-400">Select end date</span>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => { setStartDate(null); setEndDate(null); }} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">Clear</button>
              <button onClick={handleApply} disabled={!startDate || !endDate} className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-full hover:bg-zinc-700 disabled:opacity-40 transition-colors">Apply</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Traveler Count Widget ─── */

function TravelerWidget({ tripState, onUpdate }: { tripState: TripState; onUpdate: (s: Partial<TripState>) => void }) {
  const [open, setOpen] = useState(false);
  const count = tripState.travelersCount || 2;
  const setCount = (n: number) => { onUpdate({ travelersCount: Math.max(1, Math.min(20, n)) }); };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
        <Users className="w-3.5 h-3.5 text-gray-400" />
        {count} traveler{count > 1 ? 's' : ''}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-xl border border-gray-200 shadow-xl p-4 min-w-[200px]">
            <p className="text-xs font-semibold text-zinc-700 mb-3">Travelers</p>
            <div className="flex items-center justify-between">
              <button onClick={() => setCount(count - 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"><Minus className="w-4 h-4 text-gray-600" /></button>
              <span className="text-lg font-bold text-zinc-900 w-10 text-center">{count}</span>
              <button onClick={() => setCount(count + 1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"><Plus className="w-4 h-4 text-gray-600" /></button>
            </div>
            <button onClick={() => setOpen(false)} className="mt-3 w-full px-3 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-full hover:bg-zinc-700 transition-colors">Done</button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Language Selector ─── */

function LanguageSelector({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const isDark = variant === 'dark';
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDark ? 'text-white/80 hover:text-white' : 'bg-white/80 backdrop-blur border border-gray-200 text-zinc-700 hover:bg-white'}`}>
        <Globe className="w-3.5 h-3.5" />
        <span>{LANGUAGE_FLAGS[language]} {LANGUAGE_LABELS[language]}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-xl border border-gray-200 shadow-lg py-1 min-w-[180px] max-h-[300px] overflow-y-auto">
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
              <button key={lang} onClick={() => { setLanguage(lang); setOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors ${lang === language ? 'font-semibold text-[#0073cf] bg-blue-50/50' : 'text-zinc-700'}`}>
                <span>{LANGUAGE_FLAGS[lang]}</span><span>{LANGUAGE_LABELS[lang]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Custom Budget Input ─── */

function BudgetInput({ onSubmit }: { onSubmit: (amount: string) => void }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (num && num > 0) {
      onSubmit(`$${num.toLocaleString()}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1.5">
        <DollarSign className="w-3.5 h-3.5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Enter amount"
          className="w-24 text-sm border-0 outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!value}
        className="px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-700 disabled:opacity-40 transition-colors"
      >
        Set
      </button>
    </div>
  );
}

/* ─── Confirmation Card ─── */

function ConfirmationCard({
  message,
  onConfirm,
  onEdit,
}: {
  message: string;
  onConfirm: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-5 space-y-4">
      <div
        className="text-sm text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: message
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>'),
        }}
      />
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
        >
          <Check className="w-4 h-4" />
          Looks good!
        </button>
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Change something
        </button>
      </div>
    </div>
  );
}

/* ─── Hero-Style Input Box ─── */

function ChatInputBox({
  value, onChange, onSend, placeholder, isAnimating, disabled, tripState, onTripStateUpdate,
  calendarOpen, onCalendarOpenHandled, prefillStart, prefillEnd,
}: {
  value: string; onChange: (v: string) => void; onSend: () => void;
  placeholder: string; isAnimating: boolean; disabled: boolean;
  tripState: TripState; onTripStateUpdate: (s: Partial<TripState>) => void;
  calendarOpen?: boolean; onCalendarOpenHandled?: () => void;
  prefillStart?: string | null; prefillEnd?: string | null;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-lg p-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
        placeholder={placeholder}
        rows={1}
        className="w-full min-h-[48px] resize-none border-0 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-base leading-relaxed"
        style={{ opacity: isAnimating ? 0.6 : 1, transition: 'opacity 0.3s ease' }}
      />
      <div className="flex items-center gap-2 mt-1 mb-2">
        <DatePickerWidget
          tripState={tripState}
          onUpdate={onTripStateUpdate}
          externalOpen={calendarOpen}
          onExternalOpenHandled={onCalendarOpenHandled}
          prefillStart={prefillStart}
          prefillEnd={prefillEnd}
        />
        <TravelerWidget tripState={tripState} onUpdate={onTripStateUpdate} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium transition-colors">
          <Paperclip className="w-3.5 h-3.5" />Attach
        </button>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"><Mic className="w-4 h-4" /></button>
          <button onClick={onSend} disabled={!value.trim() || disabled} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-40 transition-colors">
            <Send className="w-3.5 h-3.5" />Plan my trip
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Right Panel: Travel Inspiration Feed ─── */

function InspirationPanel({ onSelectDestination }: { onSelectDestination: (name: string) => void }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = INSPIRATION_SLIDES.length;

  const go = (dir: number) => { setDirection(dir); setIndex((prev) => (prev + dir + total) % total); };

  useEffect(() => {
    const timer = setInterval(() => go(1), 6000);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slide = INSPIRATION_SLIDES[index];

  return (
    <div className="h-full flex flex-col border-l border-gray-100 overflow-hidden">
      <AnimatePresence mode="sync" custom={direction}>
        <motion.div
          key={slide.image}
          custom={direction}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt={slide.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <div className="flex-1" />
        <div className="px-5 pb-5">
          <p className="text-white text-2xl font-bold leading-tight mb-1" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            {slide.name}
          </p>
          <div className="flex items-center justify-between mt-3 pointer-events-auto">
            <div className="flex gap-1.5">
              {INSPIRATION_SLIDES.map((_, i) => (
                <button key={i} onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'bg-white w-5' : 'bg-white/40 w-1.5 hover:bg-white/70'}`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => go(-1)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/35 transition-colors"><ChevronLeft className="w-4 h-4 text-white" /></button>
              <button onClick={() => go(1)} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/35 transition-colors"><ChevronRight className="w-4 h-4 text-white" /></button>
              <button onClick={() => onSelectDestination(slide.name)} className="px-4 py-2 rounded-full bg-white text-zinc-900 text-xs font-bold hover:bg-gray-100 transition-colors">Plan this trip</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Entry Screen ─── */

function EntryScreen({ onSend, tripState, onTripStateUpdate }: { onSend: (msg: string) => void; tripState: TripState; onTripStateUpdate: (s: Partial<TripState>) => void }) {
  const [input, setInput] = useState('');
  const { currentPlaceholder, isAnimating } = useRotatingPlaceholder(chatPlaceholders, 3000);

  const handleSubmit = (msg?: string) => { const text = msg || input.trim(); if (!text) return; onSend(text); };

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      <div className="absolute inset-0">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        <img src={ASSISTANT_AVATAR} alt={ASSISTANT_NAME} className="w-16 h-16 rounded-full object-cover border-2 border-white/60 shadow-xl mb-5" />
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-2 leading-tight" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>Where would you like to go?</h1>
        <p className="text-white/80 text-center text-base mb-7 max-w-sm" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>Tell {ASSISTANT_NAME} about your dream trip and get a personalised itinerary in seconds.</p>
        <div className="w-full max-w-xl mb-4">
          <ChatInputBox value={input} onChange={setInput} onSend={() => handleSubmit()} placeholder={currentPlaceholder} isAnimating={isAnimating} disabled={false} tripState={tripState} onTripStateUpdate={onTripStateUpdate} />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-4 max-w-xl">
          {quickActions.map((action) => {
            const Icon = ICON_MAP[action.icon] || Compass;
            return (<button key={action.id} onClick={() => handleSubmit(action.message)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 text-gray-700 text-sm font-medium hover:bg-white hover:shadow-md transition-all"><Icon className="w-3.5 h-3.5" />{action.label}</button>);
          })}
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-5 max-w-xl">
          {categoryChips.map((cat) => (
            <button key={cat.label} onClick={() => handleSubmit(`I'm interested in ${cat.label} experiences`)} className="px-4 py-2 rounded-full bg-white/90 text-gray-700 text-sm font-medium hover:bg-white hover:shadow-md transition-all">{cat.emoji} {cat.label}</button>
          ))}
        </div>
        <div className="w-full max-w-xl">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 text-center">Or try a suggestion</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedPrompts.map((q) => (<button key={q} onClick={() => handleSubmit(q)} className="text-left px-4 py-3 rounded-xl bg-white/90 text-gray-700 text-sm font-medium hover:bg-white hover:shadow-md transition-all">{q}</button>))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ChatPage Component ─── */

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
  const [showItinerary, setShowItinerary] = useState<Itinerary | null>(null);
  const [latestChips, setLatestChips] = useState<{ key: string; options: string[] } | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarPrefillStart, setCalendarPrefillStart] = useState<string | null>(null);
  const [calendarPrefillEnd, setCalendarPrefillEnd] = useState<string | null>(null);
  const handleSendRef = useRef<(text?: string) => Promise<void>>();
  const [showCustomBudget, setShowCustomBudget] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [airbnbListings, setAirbnbListings] = useState<AirbnbListing[]>([]);
  const [flightEstimates, setFlightEstimates] = useState<FlightEstimate[]>([]);
  const [isAirbnbLoading, setIsAirbnbLoading] = useState(false);
  const [isFlightLoading, setIsFlightLoading] = useState(false);
  const [locationImages, setLocationImages] = useState<Map<string, string>>(new Map());
  const [heroImage, setHeroImage] = useState<string>('');
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (initialIntentHandled.current) return;
    initialIntentHandled.current = true;
    const msg = searchParams.get('msg');
    const intent = searchParams.get('intent');
    const destination = searchParams.get('destination');
    if (msg) { setTimeout(() => handleSend(msg), 400); }
    else if (destination) { setTimeout(() => handleSend(`I'd like to plan a trip to ${destination}`), 400); }
    else if (intent) { const action = quickActions.find((a) => a.id === intent); if (action) setTimeout(() => handleSend(action.message), 400); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTripStateUpdate = useCallback((partial: Partial<TripState>) => {
    setTripState((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleChipClick = useCallback((text: string, key: string) => {
    if (text === 'Custom' && (key === 'budgetAmount' || key === 'budgetRange')) {
      setShowCustomBudget(true);
      return;
    }

    // Month chip -> open calendar to that month
    const monthNames = getMonthChips();
    if (key === 'timing' && monthNames.includes(text)) {
      handleSendRef.current?.(text);
      setTimeout(() => {
        const idx = MONTH_NAMES.indexOf(text);
        if (idx !== -1) {
          const year = idx >= new Date().getMonth() ? new Date().getFullYear() : new Date().getFullYear() + 1;
          const firstOfMonth = new Date(year, idx, 1);
          const startKey = toDateKey(firstOfMonth);
          setCalendarPrefillStart(startKey);
          setCalendarPrefillEnd(null);
          setCalendarOpen(true);
        }
      }, 300);
      return;
    }

    handleSendRef.current?.(text);
    setShowCustomBudget(false);

    // Budget chip: parse dollar amount
    const budgetNum = parseBudgetAmount(text);
    if ((key === 'budgetAmount' || key === 'budgetRange') && budgetNum) {
      handleTripStateUpdate({ budgetAmount: budgetNum });
    }

    // Duration chip: pre-fill calendar
    const days = parseDurationToDays(text);
    if ((key === 'tripLength' || key === 'dates') && days) {
      const today = new Date();
      const end = new Date(today);
      end.setDate(end.getDate() + days);
      const startIso = toDateKey(today);
      const endIso = toDateKey(end);
      handleTripStateUpdate({
        tripLengthDays: days,
        dates: `${formatDateShort(startIso)} \u2013 ${formatDateShort(endIso)}`,
        startIso,
        endIso,
      });
      setCalendarPrefillStart(startIso);
      setCalendarPrefillEnd(endIso);
      setCalendarOpen(true);
    }
  }, [handleTripStateUpdate]);

  const handleCustomBudgetSubmit = useCallback((amountText: string) => {
    setShowCustomBudget(false);
    const num = parseBudgetAmount(amountText);
    if (num) handleTripStateUpdate({ budgetAmount: num });
    handleSendRef.current?.(amountText);
  }, [handleTripStateUpdate]);

  const triggerPostGeneration = useCallback(async (state: TripState, itinerary: Itinerary) => {
    // Fetch Airbnb listings
    if (state.destination && (state.startIso || state.tripLengthDays)) {
      setIsAirbnbLoading(true);
      try {
        const today = new Date();
        const checkin = state.startIso || toDateKey(today);
        const days = state.tripLengthDays || 5;
        const checkoutDate = new Date(parseDateKey(checkin));
        checkoutDate.setDate(checkoutDate.getDate() + days);
        const checkout = state.endIso || toDateKey(checkoutDate);

        const listings = await fetchAirbnbListings({
          location: state.destination,
          checkin,
          checkout,
          budget: state.budgetAmount ? String(state.budgetAmount) : undefined,
        });
        setAirbnbListings(listings);
      } catch (err) {
        console.warn('[Vincent] Airbnb fetch error:', err);
      } finally {
        setIsAirbnbLoading(false);
      }
    }

    // Fetch flight estimates
    if (state.departureCity && state.destination) {
      setIsFlightLoading(true);
      try {
        const flights = await fetchFlightEstimates({
          origin: state.departureCity,
          destination: state.destination,
          departure_date: state.startIso || toDateKey(new Date()),
          return_date: state.endIso,
          adults: state.travelersCount || 1,
        });
        setFlightEstimates(flights);
      } catch (err) {
        console.warn('[Vincent] Flight fetch error:', err);
      } finally {
        setIsFlightLoading(false);
      }
    }

    // Fetch location images for itinerary days
    if (itinerary.days.length > 0) {
      const queries = itinerary.days.map((d) => d.activities[0]?.location || d.title);
      const images = await fetchMultipleLocationImages(queries);
      setLocationImages(images);

      // Hero image for the destination
      if (state.destination) {
        const { fetchLocationImage } = await import('../lib/api/unsplash');
        const hero = await fetchLocationImage(state.destination);
        setHeroImage(hero);
      }
    }
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    setLatestChips(null);
    setShowCustomBudget(false);
    const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: msg };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const apiMessages = [...messages, userMessage]
        .filter((m) => !(m.role === 'ai' && m.id === 1))
        .map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

      const response = await callPlanTrip({ messages: apiMessages, tripState, language });

      let updatedState = tripState;
      if (response.tripState) {
        setTripState((prev) => {
          const merged = { ...prev };
          for (const [k, v] of Object.entries(response.tripState)) {
            if (v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)) {
              (merged as Record<string, unknown>)[k] = v;
            }
          }
          updatedState = merged as TripState;
          return merged as TripState;
        });
      }

      let nextQuestion: NextQuestion | undefined = response.nextQuestion ?? undefined;
      if (nextQuestion && (!nextQuestion.options || nextQuestion.options.length === 0)) {
        const fallback = FALLBACK_CHIPS[nextQuestion.key];
        if (fallback) nextQuestion = { ...nextQuestion, options: fallback };
      }

      if (nextQuestion?.options && nextQuestion.options.length > 0) {
        setLatestChips({ key: nextQuestion.key, options: nextQuestion.options });
      }

      const aiMsg: ChatMessage = {
        id: Date.now(),
        role: 'ai',
        text: response.assistantMessage,
        nextQuestion,
        itinerary: response.itinerary,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (response.itinerary) {
        setShowItinerary(response.itinerary);
        setIsGenerating(true);
        triggerPostGeneration(updatedState, response.itinerary);
      }

      // Auto-open calendar when trip length is newly set
      if (updatedState.tripLengthDays && !tripState.tripLengthDays && !updatedState.startIso) {
        const today = new Date();
        const end = new Date(today);
        end.setDate(end.getDate() + updatedState.tripLengthDays);
        const start = toDateKey(today);
        const endKey = toDateKey(end);
        setTripState((prev) => ({ ...prev, startIso: start, endIso: endKey, dates: prev.dates || `${formatDateShort(start)} \u2013 ${formatDateShort(endKey)}` }));
        setCalendarPrefillStart(start);
        setCalendarPrefillEnd(endKey);
        setCalendarOpen(true);
      }
    } catch (err) {
      console.error('[Vincent] Chat error:', err);
      setMessages((prev) => [...prev, { id: Date.now(), role: 'ai', text: t('chat.errorMessage'), isError: true }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, tripState, language, t, triggerPostGeneration]);

  handleSendRef.current = handleSend;

  const { currentPlaceholder, isAnimating } = useRotatingPlaceholder(chatPlaceholders, 3000);
  const hasConversation = messages.length > 1;

  const lastAiMsg = [...messages].reverse().find((m) => m.role === 'ai');
  const isConfirmation = lastAiMsg?.nextQuestion?.key === 'confirmation';

  return (
    <div className="flex h-screen bg-white overflow-hidden flex-col">
      {/* Top bar */}
      <div className={`flex items-center justify-between px-4 py-3 flex-shrink-0 z-20 transition-all duration-300 ${hasConversation ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100' : 'bg-transparent absolute top-0 left-0 right-0'}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${hasConversation ? 'text-gray-500 hover:text-zinc-900' : 'text-white/80 hover:text-white'}`}>
            <ArrowLeft className="w-4 h-4" /><span className="hidden sm:inline">Back to home</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {hasConversation && (<><img src={ASSISTANT_AVATAR} alt={ASSISTANT_NAME} className="w-6 h-6 rounded-full object-cover" /><span className="text-sm font-bold text-zinc-900">{BRAND_NAME}</span></>)}
        </div>
        <div className="flex items-center gap-2">
          {hasConversation && (
            <button onClick={() => {
              setMessages(initialMessages);
              setTripState(createEmptyTripState());
              setShowItinerary(null);
              setLatestChips(null);
              setShowCustomBudget(false);
              setIsGenerating(false);
              setAirbnbListings([]);
              setFlightEstimates([]);
              setLocationImages(new Map());
              setHeroImage('');
            }} title="New chat" className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"><Plus className="w-4 h-4 text-zinc-700" /></button>
          )}
          <LanguageSelector variant={hasConversation ? 'light' : 'dark'} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col min-h-0">
        {!hasConversation ? (
          <EntryScreen onSend={handleSend} tripState={tripState} onTripStateUpdate={handleTripStateUpdate} />
        ) : (
          <div className="flex-1 flex min-h-0">
            {/* LEFT PANEL */}
            <div className="flex-1 lg:w-[58%] lg:flex-none flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'ai' && (<img src={ASSISTANT_AVATAR} alt={ASSISTANT_NAME} className="w-7 h-7 rounded-full object-cover mr-3 mt-0.5 flex-shrink-0" />)}
                        <div className="max-w-[85%]">
                          {msg.isAirbnbLoading ? (
                            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-100 text-zinc-800 text-sm flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                              <span>{msg.text}</span>
                            </div>
                          ) : msg.nextQuestion?.key === 'confirmation' ? (
                            <ConfirmationCard
                              message={msg.text}
                              onConfirm={() => handleSend('Looks good!')}
                              onEdit={() => handleSend('Change something')}
                            />
                          ) : (
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'bg-zinc-900 text-white rounded-br-sm' : msg.isError ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-sm' : 'bg-gray-100 text-zinc-800 rounded-bl-sm'}`}
                              dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}
                            />
                          )}

                          {msg.isError && (
                            <button onClick={() => { const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user'); if (lastUserMsg) { setMessages((prev) => prev.filter((m) => m.id !== msg.id)); handleSend(lastUserMsg.text); } }} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700">
                              <RefreshCw className="w-3 h-3" />{t('chat.retry')}
                            </button>
                          )}

                          {msg.itinerary && (
                            <button onClick={() => setShowItinerary(msg.itinerary!)} className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors">
                              <Sparkles className="w-4 h-4" />View your trip
                            </button>
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

              {/* Chip bar above input */}
              {!isConfirmation && latestChips && latestChips.options.length > 0 && (
                <div className="px-4 pb-2 flex-shrink-0">
                  <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
                    {latestChips.options.map((opt) => (
                      <button key={opt} onClick={() => handleChipClick(opt, latestChips.key)} disabled={isTyping} className="px-4 py-2 rounded-full bg-white/90 text-gray-700 text-sm font-medium hover:bg-white hover:shadow-md border border-gray-200 transition-all disabled:opacity-50">
                        {opt}
                      </button>
                    ))}
                  </div>
                  {showCustomBudget && (
                    <div className="max-w-2xl mx-auto mt-2">
                      <BudgetInput onSubmit={handleCustomBudgetSubmit} />
                    </div>
                  )}
                </div>
              )}

              {/* Input bar */}
              <div className="p-4 bg-white flex-shrink-0 border-t border-gray-100">
                <div className="max-w-2xl mx-auto">
                  <ChatInputBox
                    value={input} onChange={setInput} onSend={() => handleSend()} placeholder={currentPlaceholder} isAnimating={isAnimating} disabled={isTyping} tripState={tripState} onTripStateUpdate={handleTripStateUpdate}
                    calendarOpen={calendarOpen} onCalendarOpenHandled={() => setCalendarOpen(false)} prefillStart={calendarPrefillStart} prefillEnd={calendarPrefillEnd}
                  />
                  <p className="text-center text-[11px] text-gray-400 mt-2">{t('chat.disclaimer')}</p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="hidden lg:flex lg:w-[42%] flex-col min-h-0 relative">
              {showItinerary || isGenerating ? (
                <div className="h-full flex flex-col bg-gray-50/50 border-l border-gray-100">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-sm font-bold text-zinc-900">Your Trip</h3>
                    <button onClick={() => { setShowItinerary(null); setIsGenerating(false); }} className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <TripPanel
                      itinerary={showItinerary}
                      isGenerating={isGenerating && !showItinerary}
                      departureCity={tripState.departureCity || undefined}
                      destination={tripState.destination || undefined}
                      dates={tripState.dates || undefined}
                      travelersCount={tripState.travelersCount || undefined}
                      budgetAmount={tripState.budgetAmount || undefined}
                      heroImage={heroImage}
                      locationImages={locationImages}
                      airbnbListings={airbnbListings}
                      flightEstimates={flightEstimates}
                      isAirbnbLoading={isAirbnbLoading}
                      isFlightLoading={isFlightLoading}
                      onGenerationComplete={() => setIsGenerating(false)}
                    />
                  </div>
                </div>
              ) : (
                <InspirationPanel onSelectDestination={(name) => handleSend(`I'd like to plan a trip to ${name}`)} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile trip overlay */}
      {showItinerary && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 flex items-end">
          <div className="bg-white w-full max-h-[85vh] rounded-t-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-bold text-zinc-900">Your Trip</h3>
              <button onClick={() => setShowItinerary(null)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TripPanel
                itinerary={showItinerary}
                isGenerating={false}
                departureCity={tripState.departureCity || undefined}
                destination={tripState.destination || undefined}
                dates={tripState.dates || undefined}
                travelersCount={tripState.travelersCount || undefined}
                budgetAmount={tripState.budgetAmount || undefined}
                heroImage={heroImage}
                locationImages={locationImages}
                airbnbListings={airbnbListings}
                flightEstimates={flightEstimates}
                isAirbnbLoading={isAirbnbLoading}
                isFlightLoading={isFlightLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
