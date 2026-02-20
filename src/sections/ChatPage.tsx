import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, ArrowLeft, Plus, Sparkles, Calendar,
  Globe, RefreshCw, Compass, Route, Zap, HelpCircle,
  ChevronDown, ChevronLeft, ChevronRight, Paperclip, Mic, Users, Minus,
  X, Loader2, DollarSign, Pencil, Plane, MapPin,
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage, TripState, Itinerary, NextQuestion, AirbnbListing, FlightEstimate, SearchResults } from '../lib/ai/types';
import { createEmptyTripState } from '../lib/ai/types';
import { callPlanTrip } from '../lib/ai/client';
import { fetchAirbnbListings } from '../lib/ai/airbnb';
import { fetchFlightEstimates } from '../lib/ai/flights';
import { fetchDayImagesForItinerary, fetchLocationImage, fetchMultipleLocationImages } from '../lib/api/unsplash';
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

/* ─── Airport / IP Detection ─── */

interface Airport { code: string; name: string; city: string; lat: number; lng: number; dist?: number; }

const MAJOR_AIRPORTS: Airport[] = [
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York', lat: 40.6413, lng: -73.7781 },
  { code: 'LGA', name: 'LaGuardia', city: 'New York', lat: 40.7769, lng: -73.874 },
  { code: 'EWR', name: 'Newark Liberty', city: 'Newark', lat: 40.6895, lng: -74.1745 },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', lat: 33.9425, lng: -118.4081 },
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', lat: 37.6213, lng: -122.379 },
  { code: 'SJC', name: 'San Jose Intl', city: 'San Jose', lat: 37.3626, lng: -121.9292 },
  { code: 'OAK', name: 'Oakland Intl', city: 'Oakland', lat: 37.7213, lng: -122.2208 },
  { code: 'ORD', name: "O'Hare Intl", city: 'Chicago', lat: 41.9742, lng: -87.9073 },
  { code: 'MDW', name: 'Midway', city: 'Chicago', lat: 41.7868, lng: -87.7522 },
  { code: 'MIA', name: 'Miami Intl', city: 'Miami', lat: 25.7959, lng: -80.287 },
  { code: 'ATL', name: 'Hartsfield-Jackson', city: 'Atlanta', lat: 33.6407, lng: -84.4277 },
  { code: 'DFW', name: 'Dallas Fort Worth', city: 'Dallas', lat: 32.8998, lng: -97.0403 },
  { code: 'SEA', name: 'Seattle-Tacoma', city: 'Seattle', lat: 47.4502, lng: -122.3088 },
  { code: 'BOS', name: 'Logan Intl', city: 'Boston', lat: 42.3656, lng: -71.0096 },
  { code: 'DEN', name: 'Denver Intl', city: 'Denver', lat: 39.8561, lng: -104.6737 },
  { code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix', lat: 33.4373, lng: -112.0078 },
  { code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas', lat: 36.084, lng: -115.1537 },
  { code: 'MCO', name: 'Orlando Intl', city: 'Orlando', lat: 28.4312, lng: -81.3081 },
  { code: 'IAH', name: 'George Bush Intl', city: 'Houston', lat: 29.9902, lng: -95.3368 },
  { code: 'MSP', name: 'Minneapolis-St. Paul', city: 'Minneapolis', lat: 44.882, lng: -93.2218 },
  { code: 'DTW', name: 'Detroit Metro', city: 'Detroit', lat: 42.2124, lng: -83.3534 },
  { code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia', lat: 39.8744, lng: -75.2424 },
  { code: 'CLT', name: 'Charlotte Douglas', city: 'Charlotte', lat: 35.214, lng: -80.9431 },
  { code: 'PDX', name: 'Portland Intl', city: 'Portland', lat: 45.5898, lng: -122.5951 },
  { code: 'SAN', name: 'San Diego Intl', city: 'San Diego', lat: 32.7336, lng: -117.1897 },
  { code: 'TPA', name: 'Tampa Intl', city: 'Tampa', lat: 27.9755, lng: -82.5332 },
  { code: 'BNA', name: 'Nashville Intl', city: 'Nashville', lat: 36.1263, lng: -86.6774 },
  { code: 'AUS', name: 'Austin-Bergstrom', city: 'Austin', lat: 30.1975, lng: -97.6664 },
  { code: 'LHR', name: 'Heathrow', city: 'London', lat: 51.4775, lng: -0.4614 },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', lat: 49.0097, lng: 2.5479 },
  { code: 'FRA', name: 'Frankfurt Intl', city: 'Frankfurt', lat: 50.0379, lng: 8.5622 },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', lat: 52.3105, lng: 4.7683 },
  { code: 'NRT', name: 'Tokyo Narita', city: 'Tokyo', lat: 35.772, lng: 140.3929 },
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', lat: -33.9399, lng: 151.1753 },
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', lat: 25.2532, lng: 55.3657 },
  { code: 'SIN', name: 'Changi', city: 'Singapore', lat: 1.3644, lng: 103.9915 },
  { code: 'ICN', name: 'Incheon Intl', city: 'Seoul', lat: 37.4602, lng: 126.4407 },
  { code: 'YYZ', name: 'Toronto Pearson', city: 'Toronto', lat: 43.6772, lng: -79.6306 },
  { code: 'YVR', name: 'Vancouver Intl', city: 'Vancouver', lat: 49.1947, lng: -123.1839 },
  { code: 'MEX', name: 'Benito Juárez Intl', city: 'Mexico City', lat: 19.4363, lng: -99.0721 },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface GeoResult { lat: number; lng: number; city: string | null }

const GEO_CACHE_KEY = 'vincent_geo_cache';

async function geolocateViaIP(): Promise<GeoResult> {
  // Check sessionStorage first so we only do one network call per browser session
  try {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as GeoResult;
      if (parsed.lat && parsed.lng) return parsed;
    }
  } catch { /* ignore */ }

  // Cascade through multiple free providers — first success wins
  const providers: Array<() => Promise<GeoResult>> = [
    // 1. ip-api.com (no key needed, 45 req/min, HTTP only from browser but works fine)
    async () => {
      const r = await fetch('http://ip-api.com/json/?fields=lat,lon,city,status', { signal: AbortSignal.timeout(4000) });
      const d = await r.json() as { status: string; lat?: number; lon?: number; city?: string };
      if (d.status !== 'success' || !d.lat || !d.lon) throw new Error('ip-api fail');
      return { lat: d.lat, lng: d.lon, city: d.city || null };
    },
    // 2. ipwho.is (no key, generous limits)
    async () => {
      const r = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
      const d = await r.json() as { success?: boolean; latitude?: number; longitude?: number; city?: string };
      if (!d.success || !d.latitude || !d.longitude) throw new Error('ipwho fail');
      return { lat: d.latitude, lng: d.longitude, city: d.city || null };
    },
    // 3. ipapi.co (backup — rate-limited but sometimes works)
    async () => {
      const r = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
      const d = await r.json() as { latitude?: number; longitude?: number; city?: string };
      if (!d.latitude || !d.longitude) throw new Error('ipapi.co fail');
      return { lat: d.latitude, lng: d.longitude, city: d.city || null };
    },
    // 4. Browser Geolocation API (requires permission, most accurate)
    () => new Promise<GeoResult>((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('no geolocation')); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, city: null }),
        (err) => reject(err),
        { timeout: 5000, maximumAge: 300_000 },
      );
    }),
  ];

  for (const provider of providers) {
    try {
      const result = await provider();
      // Persist so we don't re-fetch on re-renders / new chat
      try { sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(result)); } catch { /* ignore */ }
      return result;
    } catch {
      continue;
    }
  }
  throw new Error('All geolocation providers failed');
}

function useNearbyAirports() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    geolocateViaIP()
      .then((geo) => {
        if (cancelled) return;
        setDetectedCity(geo.city);
        const sorted = [...MAJOR_AIRPORTS]
          .map((a) => ({ ...a, dist: haversineKm(geo.lat, geo.lng, a.lat, a.lng) }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 3);
        setAirports(sorted);
      })
      .catch(() => {
        if (cancelled) return;
        // Absolute fallback — major US hubs
        setAirports([
          MAJOR_AIRPORTS.find((a) => a.code === 'JFK')!,
          MAJOR_AIRPORTS.find((a) => a.code === 'LAX')!,
          MAJOR_AIRPORTS.find((a) => a.code === 'ORD')!,
        ]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { airports, detectedCity, loading };
}

/* ─── Departure City Widget ─── */

function DepartureCityWidget({ onSelect }: { onSelect: (city: string) => void }) {
  const { airports, detectedCity, loading } = useNearbyAirports();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Plane className="w-3.5 h-3.5 text-gray-400" />
        {loading ? 'From...' : detectedCity ? `Near ${detectedCity}` : 'Departure'}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden min-w-[240px]">
            {detectedCity && (
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-500">Detected: <strong className="text-gray-700">{detectedCity}</strong></p>
              </div>
            )}
            <div className="p-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-1 pb-1.5">Nearby airports</p>
              {airports.map((a) => {
                const miles = a.dist ? Math.round(a.dist * 0.621371) : null;
                return (
                  <button
                    key={a.code}
                    onClick={() => { onSelect(a.code); setOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-sky-700 transition-colors">{a.code}</span>
                      <span className="ml-2 text-xs text-gray-500">{a.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {miles !== null ? `${miles} mi` : a.city}
                    </span>
                  </button>
                );
              })}
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => { setOpen(false); onSelect('__custom__'); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-sky-50 transition-colors text-xs font-semibold text-sky-600 flex items-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Type another city...
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const DESTINATION_POOL = [
  'Paris', 'Tokyo', 'Bali', 'New York', 'Rome', 'Barcelona', 'London', 'Santorini',
  'Dubai', 'Maldives', 'Istanbul', 'Lisbon', 'Marrakech', 'Sydney', 'Seoul',
  'Cape Town', 'Iceland', 'Cancún', 'Prague', 'Singapore', 'Buenos Aires',
  'Kyoto', 'Athens', 'Vienna', 'Amsterdam', 'Costa Rica', 'Fiji', 'Zanzibar',
];

function pickRandomDestinations(exclude: string[], count = 4): string[] {
  const pool = DESTINATION_POOL.filter((d) => !exclude.includes(d));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const FALLBACK_CHIPS: Record<string, string[]> = {
  destination: ['Paris', 'Tokyo', 'Maldives', 'Surprise me!'],
  tripLength: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
  dates: ['3 days', '5 days', '1 week', '10 days', '2 weeks'],
  timing: ['March', 'April', 'May', 'June', 'July', 'August'],
  budgetAmount: ['$1,000', '$2,000', '$5,000', 'Custom'],
  budgetRange: ['$1,000', '$2,000', '$5,000', 'Custom'],
  pace: ['Relaxed · room to breathe', 'Balanced · best of both', 'Packed · see it all'],
  interests: ['Food & Dining', 'Art & Culture', 'Nature', 'Nightlife', 'History', 'Adventure', 'Shopping', 'Wellness'],
  accommodationPreference: ['Hotel', 'Airbnb', 'Boutique', 'Hostel', 'Resort'],
  travelersCount: ['Solo', 'Couple', 'Family', 'Group of friends'],
  departureCity: ['New York (JFK)', 'Los Angeles (LAX)', 'Chicago (ORD)', 'San Francisco (SFO)', 'Somewhere else'],
  confirmation: ['Looks good!', 'Change dates', 'Add activities'],
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

function sanitizeAssistantText(text: string): string {
  return text
    .replace(/\[\s*"(?:[^"]+)"(?:\s*,\s*"(?:[^"]+)")+\s*\]/g, (m) =>
      m.replace(/[\[\]"]/g, '').replace(/\s*,\s*/g, ', '),
    )
    .replace(/\[\s*'(?:[^']+)'(?:\s*,\s*'(?:[^']+)')+\s*\]/g, (m) =>
      m.replace(/[\[\]']/g, '').replace(/\s*,\s*/g, ', '),
    )
    .replace(/\[(?:SEARCH RESULTS|\/SEARCH RESULTS)\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function seasonToStartDate(dates: string | null | undefined): Date | null {
  if (!dates || typeof dates !== 'string') return null;
  const lower = dates.toLowerCase();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (/\bnext month\b/i.test(lower)) {
    return new Date(year, month + 1, 1);
  }
  if (/\bthis month\b/i.test(lower)) {
    return new Date(year, month, 1);
  }

  const seasonMap: Record<string, number> = { spring: 2, summer: 5, fall: 8, autumn: 8, winter: 11 };
  for (const [season, startMonth] of Object.entries(seasonMap)) {
    if (lower.includes(season)) {
      const y = startMonth > month ? year : year + 1;
      return new Date(y, startMonth, 1);
    }
  }

  const monthMatch = lower.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i);
  if (monthMatch) {
    const idx = MONTH_NAMES.findIndex((m) => m.toLowerCase() === monthMatch[1].toLowerCase());
    if (idx !== -1) {
      const y = idx >= month ? year : year + 1;
      return new Date(y, idx, 1);
    }
  }

  return null;
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
  const label = typeof tripState.dates === 'string' ? tripState.dates : 'Select dates';

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

/* ─── Confirmation is now just rendered as normal AI text. Chips handle the CTA. ─── */

/* ─── Hero-Style Input Box ─── */

function ChatInputBox({
  value, onChange, onSend, onDepartureSelect, placeholder, isAnimating, disabled, tripState, onTripStateUpdate,
  calendarOpen, onCalendarOpenHandled, prefillStart, prefillEnd,
}: {
  value: string; onChange: (v: string) => void; onSend: () => void;
  onDepartureSelect?: (city: string) => void;
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
      <div className="flex items-center gap-2 mt-1 mb-2 flex-wrap">
        <DatePickerWidget
          tripState={tripState}
          onUpdate={onTripStateUpdate}
          externalOpen={calendarOpen}
          onExternalOpenHandled={onCalendarOpenHandled}
          prefillStart={prefillStart}
          prefillEnd={prefillEnd}
        />
        <TravelerWidget tripState={tripState} onUpdate={onTripStateUpdate} />
        {onDepartureSelect && (
          <DepartureCityWidget onSelect={onDepartureSelect} />
        )}
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

  const handleDepartureSelect = (city: string) => {
    if (city === '__custom__') {
      setInput((prev) => prev || 'Flying from ');
    } else {
      onTripStateUpdate({ departureCity: city });
      onSend(`Flying from ${city}`);
    }
  };

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
          <ChatInputBox value={input} onChange={setInput} onSend={() => handleSubmit()} onDepartureSelect={handleDepartureSelect} placeholder={currentPlaceholder} isAnimating={isAnimating} disabled={false} tripState={tripState} onTripStateUpdate={onTripStateUpdate} />
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
  const nearbyAirports = useNearbyAirports();
  const [showItinerary, setShowItinerary] = useState<Itinerary | null>(null);
  const [latestChips, setLatestChips] = useState<{ key: string; options: string[] } | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarPrefillStart, setCalendarPrefillStart] = useState<string | null>(null);
  const [calendarPrefillEnd, setCalendarPrefillEnd] = useState<string | null>(null);
  const handleSendRef = useRef<(text?: string) => Promise<void>>();
  const [showCustomBudget, setShowCustomBudget] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMeta, setGenerationMeta] = useState<{ progress: number; label: string }>({
    progress: 15,
    label: 'Optimizing your route, end to end',
  });
  const pendingItineraryRef = useRef<Itinerary | null>(null);
  const [scrapersComplete, setScrapersComplete] = useState(false);
  const [airbnbListings, setAirbnbListings] = useState<AirbnbListing[]>([]);
  const [flightEstimates, setFlightEstimates] = useState<FlightEstimate[]>([]);
  const [isAirbnbLoading, setIsAirbnbLoading] = useState(false);
  const [isFlightLoading, setIsFlightLoading] = useState(false);
  const [locationImages, setLocationImages] = useState<Map<string, string>>(new Map());
  const [heroImage, setHeroImage] = useState<string>('');
  const [dayImageMap, setDayImageMap] = useState<Record<number, string[]>>({});
  const [rightPanelWidth, setRightPanelWidth] = useState(42);
  const isDraggingDivider = useRef(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingDivider.current) return;
      const pct = 100 - (e.clientX / window.innerWidth) * 100;
      setRightPanelWidth(Math.min(80, Math.max(20, pct)));
    };
    const onMouseUp = () => { isDraggingDivider.current = false; document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, []);

  const startDividerDrag = useCallback(() => {
    isDraggingDivider.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const updateGenerationMeta = useCallback((progress: number, label: string) => {
    setGenerationMeta((prev) => {
      if (progress <= prev.progress) return prev;
      return { progress, label };
    });
  }, []);
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

    if (key === 'travelersCount') {
      const lower = text.toLowerCase();
      if (lower === 'solo' || lower === 'just me') {
        handleTripStateUpdate({ travelersCount: 1 });
      } else if (lower === 'couple' || lower === 'two' || lower === '2') {
        handleTripStateUpdate({ travelersCount: 2 });
      } else if (/family|friends|group|3\+|more/i.test(lower)) {
        setLatestChips(null);
        setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text }]);
        setShowGroupPicker(true);
        return;
      }
    }

    // Departure city chip: parse airport code and set tripState
    if (key === 'departureCity') {
      if (text === 'Somewhere else') {
        setInput('Flying from ');
        return;
      }
      const codeMatch = text.match(/\(([A-Z]{3})\)/);
      if (codeMatch) {
        handleTripStateUpdate({ departureCity: codeMatch[1] });
      }
    }

    // Month chip -> open calendar to that month
    const monthNames = getMonthChips();
    if (key === 'timing' && monthNames.includes(text)) {
      handleSendRef.current?.(text);
      setTimeout(() => {
        const idx = MONTH_NAMES.indexOf(text);
        if (idx !== -1) {
          const now = new Date();
          const year = idx >= now.getMonth() ? now.getFullYear() : now.getFullYear() + 1;
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
    setShowGroupPicker(false);

    // Budget chip: parse dollar amount
    const budgetNum = parseBudgetAmount(text);
    if ((key === 'budgetAmount' || key === 'budgetRange') && budgetNum) {
      handleTripStateUpdate({ budgetAmount: budgetNum });
    }

    // Duration chip: pre-fill calendar using season/timing hint if available
    const days = parseDurationToDays(text);
    if ((key === 'tripLength' || key === 'dates') && days) {
      const timingHint = tripState.dates
        || messages.filter((m) => m.role === 'user').map((m) => m.text).reverse().join(' ');
      const seasonStart = seasonToStartDate(timingHint);
      const start = seasonStart || new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + days);
      const startIso = toDateKey(start);
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
  }, [handleTripStateUpdate, messages, tripState]);

  const handleCustomBudgetSubmit = useCallback((amountText: string) => {
    setShowCustomBudget(false);
    const num = parseBudgetAmount(amountText);
    if (num) handleTripStateUpdate({ budgetAmount: num });
    handleSendRef.current?.(amountText);
  }, [handleTripStateUpdate]);

  const handleGroupSizeSelect = useCallback((count: number) => {
    setShowGroupPicker(false);
    handleTripStateUpdate({ travelersCount: count });
    handleSendRef.current?.(`${count} people`);
  }, [handleTripStateUpdate]);

  const handleDepartureSelectInConversation = useCallback((city: string) => {
    if (city === '__custom__') {
      setInput('Flying from ');
    } else {
      handleTripStateUpdate({ departureCity: city });
      handleSendRef.current?.(`Flying from ${city}`);
    }
  }, [handleTripStateUpdate]);

  const pushProgressMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role: 'ai', text }]);
  }, []);

  const triggerPostGeneration = useCallback(async (state: TripState, itinerary: Itinerary, embeddedResults?: SearchResults | null) => {
    setScrapersComplete(false);
    setGenerationMeta({ progress: 15, label: 'Optimizing your route, end to end' });
    pushProgressMessage('Let me build that for you...');

    const tasks: Promise<void>[] = [];

    const hasEmbeddedStays = embeddedResults?.stays && embeddedResults.stays.length > 0;
    const hasEmbeddedFlights = embeddedResults?.flights && embeddedResults.flights.length > 0;
    console.log('[Vincent] triggerPostGeneration:', { hasEmbeddedStays, hasEmbeddedFlights, dest: state.destination, departure: state.departureCity });

    if (hasEmbeddedStays) {
      const listings = embeddedResults!.stays.map((s) => ({
        title: (s.title ?? s.hotel_name ?? s.name ?? 'Unnamed') as string,
        price_per_night: (s.price_per_night ?? s.pricePerNight ?? null) as number | null,
        total_price: (s.total_price ?? s.totalPrice ?? null) as number | null,
        rating: (s.rating ?? null) as number | null,
        home_type_detected: (s.home_type_detected ?? '') as string,
        image_url: (s.image_url ?? s.imageUrl ?? null) as string | null,
        link: (s.link ?? s.hotel_url ?? s.bookingUrl ?? '') as string,
        source: (s.source ?? (String(s.link || '').includes('airbnb') ? 'Airbnb' : String(s.link || '').includes('priceline') ? 'Priceline' : '')) as string,
      })) as AirbnbListing[];
      setAirbnbListings(listings);
      updateGenerationMeta(75, 'Finding stays for your budget');
      pushProgressMessage(`Located **${listings.length} stays** in **${state.destination || 'your destination'}**...`);
    } else if (state.destination && (state.startIso || state.tripLengthDays)) {
      const dest = state.destination;
      setIsAirbnbLoading(true);
      tasks.push(
        (async () => {
          try {
            const today = new Date();
            const checkin = state.startIso || toDateKey(today);
            const days = state.tripLengthDays || 5;
            const checkoutDate = new Date(parseDateKey(checkin));
            checkoutDate.setDate(checkoutDate.getDate() + days);
            const checkout = state.endIso || toDateKey(checkoutDate);

            const listings = await fetchAirbnbListings({
              location: dest,
              checkin,
              checkout,
              budget: state.budgetAmount ? String(state.budgetAmount) : undefined,
            });
            setAirbnbListings(listings);
            updateGenerationMeta(75, 'Finding stays for your budget');
            if (listings.length > 0) {
              pushProgressMessage(`Located **${listings.length} stays** in **${dest}**...`);
            }
          } catch (err) {
            console.warn('[Vincent] Airbnb fetch error:', err);
          } finally {
            setIsAirbnbLoading(false);
          }
        })(),
      );
    }

    if (hasEmbeddedFlights) {
      const flights = embeddedResults!.flights.map((f) => {
        let priceTotal = Number(typeof f.price_total === 'string' ? String(f.price_total).replace(/[^0-9.]/g, '') : f.price_total) || 0;
        let pricePP = Number(typeof f.price_per_person === 'string' ? String(f.price_per_person).replace(/[^0-9.]/g, '') : f.price_per_person) || 0;
        const rawPrice = Number(typeof f.price === 'string' ? String(f.price).replace(/[^0-9.]/g, '') : f.price) || 0;
        if (!priceTotal && rawPrice) priceTotal = rawPrice;
        if (!pricePP && rawPrice) pricePP = rawPrice;
        if (pricePP > 0 && priceTotal <= pricePP) priceTotal = pricePP * (state.travelersCount || 1);
        return {
          airline: (f.airline ?? f.carrier ?? 'Unknown') as string,
          departure_time: (f.departure_time ?? '') as string,
          arrival_time: (f.arrival_time ?? '') as string,
          duration: (f.duration ?? '') as string,
          stops: Number(f.stops ?? 0),
          price_total: priceTotal,
          price_per_person: pricePP,
          booking_url: (f.booking_url ?? f.url ?? '') as string,
          departure_airport: (f.departure_airport ?? '') as string,
          arrival_airport: (f.arrival_airport ?? '') as string,
        };
      }) as FlightEstimate[];
      setFlightEstimates(flights);
      updateGenerationMeta(35, 'Searching for flight options');
      pushProgressMessage(`Found **${flights.length} flight options** from **${state.departureCity || 'your airport'}**...`);
    } else if (state.departureCity && state.destination) {
      const origin = state.departureCity;
      const dest = state.destination;
      setIsFlightLoading(true);
      pushProgressMessage(`Optimizing your route...`);
      tasks.push(
        (async () => {
          try {
            const flights = await fetchFlightEstimates({
              origin,
              destination: dest,
              departure_date: state.startIso || toDateKey(new Date()),
              return_date: state.endIso ?? undefined,
              adults: state.travelersCount || 1,
            });
            setFlightEstimates(flights);
            updateGenerationMeta(35, 'Searching for flight options');
            if (flights.length > 0) {
              pushProgressMessage(`Found **${flights.length} flight options** from **${origin}**...`);
            }
          } catch (err) {
            console.warn('[Vincent] Flight fetch error:', err);
          } finally {
            setIsFlightLoading(false);
          }
        })(),
      );
    }

    if (itinerary.days.length > 0) {
      tasks.push(
        (async () => {
          updateGenerationMeta(55, 'Curating local recommendations');
          const queries = itinerary.days.map((d) => d.activities[0]?.location || d.title);
          const images = await fetchMultipleLocationImages(queries);
          setLocationImages(images);
          const dayImages = await fetchDayImagesForItinerary(itinerary.days, state.destination || undefined);
          setDayImageMap(dayImages);

          if (state.destination) {
            const hero = await fetchLocationImage(state.destination);
            setHeroImage(hero);
          }
        })(),
      );
    }

    await Promise.allSettled(tasks);
    updateGenerationMeta(90, 'Tailoring the plan to you');
    updateGenerationMeta(100, 'Your trip is ready!');
    pushProgressMessage('**Your trip is ready!** Take a look.');
    setScrapersComplete(true);
  }, [updateGenerationMeta, pushProgressMessage]);

  const handleSend = useCallback(async (text?: string, opts?: { skipUserMsg?: boolean }) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;

    setLatestChips(null);
    setShowCustomBudget(false);
    setShowGroupPicker(false);
    const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: msg };
    if (!opts?.skipUserMsg) {
      setMessages((prev) => [...prev, userMessage]);
    }
    setInput('');
    setIsTyping(true);

    const lastAi = [...messages].reverse().find((m) => m.role === 'ai');
    const isConfirmationStep = lastAi?.nextQuestion?.key === 'confirmation';
    const isConfirmationMsg = /looks good|let'?s go|yes|yep|yeah|confirm|do it|go for it|i'?m ready|sounds? (good|great|perfect)|absolutely|for sure/i.test(msg);
    if (isConfirmationMsg && isConfirmationStep) {
      setIsGenerating(true);
      setScrapersComplete(false);
      setGenerationMeta({ progress: 15, label: 'Optimizing your route, end to end' });
    }

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
              if (k === 'dates' && typeof v === 'object' && v !== null) {
                const d = v as Record<string, string>;
                if (d.startIso && d.endIso) {
                  (merged as Record<string, unknown>)[k] = `${d.startIso} to ${d.endIso}`;
                  (merged as Record<string, unknown>)['startIso'] = d.startIso;
                  (merged as Record<string, unknown>)['endIso'] = d.endIso;
                }
              } else {
                (merged as Record<string, unknown>)[k] = v;
              }
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

      if (nextQuestion?.key === 'departureCity' && nearbyAirports.airports.length > 0) {
        const airportChips = nearbyAirports.airports.map((a) => `${a.city} (${a.code})`);
        setLatestChips({ key: 'departureCity', options: [...airportChips, 'Somewhere else'] });
      } else if (nextQuestion?.options && nextQuestion.options.length > 0) {
        let opts = [...new Set(nextQuestion.options)];
        if (nextQuestion.key === 'destination' && !opts.some((o) => /^(surprise me!?|somewhere else|show me more|other)$/i.test(o))) {
          opts = [...opts.slice(0, 4), 'Surprise me!'];
        }
        setLatestChips({ key: nextQuestion.key, options: opts });
      }

      const aiMsg: ChatMessage = {
        id: Date.now(),
        role: 'ai',
        text: sanitizeAssistantText(response.assistantMessage),
        nextQuestion,
        itinerary: response.itinerary,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (response.itinerary) {
        pendingItineraryRef.current = response.itinerary;
        setScrapersComplete(false);
        setIsGenerating(true);
        setGenerationMeta({ progress: 15, label: 'Optimizing your route, end to end' });
        triggerPostGeneration(updatedState, response.itinerary, response.searchResults);
      }

      if (updatedState.tripLengthDays && !tripState.tripLengthDays) {
        const allUserText = [...messages, userMessage].filter((m) => m.role === 'user').map((m) => m.text).reverse().join(' ');
        const timingHint = updatedState.dates || response.assistantMessage || allUserText;
        const seasonStart = seasonToStartDate(timingHint) || seasonToStartDate(allUserText);

        let base: Date;
        if (seasonStart) {
          base = seasonStart;
        } else if (updatedState.startIso) {
          base = parseDateKey(updatedState.startIso);
        } else {
          base = new Date(Date.now() + 14 * 86_400_000);
        }

        const end = new Date(base);
        end.setDate(end.getDate() + updatedState.tripLengthDays);
        const start = toDateKey(base);
        const endKey = toDateKey(end);
        setTripState((prev) => ({ ...prev, startIso: start, endIso: endKey, dates: prev.dates || `${formatDateShort(start)} \u2013 ${formatDateShort(endKey)}` }));
        setCalendarPrefillStart(start);
        setCalendarPrefillEnd(endKey);
        setCalendarOpen(true);
      }
    } catch (err) {
      console.error('[Vincent] Chat error:', err);
      setMessages((prev) => [...prev, { id: Date.now(), role: 'ai', text: t('chat.errorMessage'), isError: true }]);
      setIsGenerating(false);
      setGenerationMeta({ progress: 15, label: 'Optimizing your route, end to end' });
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages, tripState, language, t, triggerPostGeneration]);

  handleSendRef.current = handleSend;

  const handleGenerationComplete = useCallback(() => {
    setGenerationMeta({ progress: 100, label: 'Your trip is ready!' });
    if (pendingItineraryRef.current) {
      setShowItinerary(pendingItineraryRef.current);
      pendingItineraryRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  const handleSwapActivity = useCallback((dayNum: number, swapText: string) => {
    const currentDay = showItinerary?.days.find((d) => d.day === dayNum);
    const currentTitle = currentDay?.title || `Day ${dayNum}`;
    const swapMessage = `Swap Day ${dayNum} (${currentTitle}): Replace with "${swapText}"`;
    handleSendRef.current?.(swapMessage);
  }, [showItinerary]);

  // Direct effect: auto-reveal itinerary as soon as scraping completes (bypasses loader timing issues)
  useEffect(() => {
    if (!scrapersComplete) return;
    const it = pendingItineraryRef.current;
    if (!it) return;
    const t = setTimeout(() => {
      setShowItinerary(it);
      pendingItineraryRef.current = null;
      setIsGenerating(false);
    }, 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrapersComplete]);

  const { currentPlaceholder, isAnimating } = useRotatingPlaceholder(chatPlaceholders, 3000);
  const hasConversation = messages.length > 1;

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
              setShowGroupPicker(false);
              setIsGenerating(false);
              pendingItineraryRef.current = null;
              setScrapersComplete(false);
              setAirbnbListings([]);
              setFlightEstimates([]);
              setLocationImages(new Map());
              setHeroImage('');
              setDayImageMap({});
              setGenerationMeta({ progress: 15, label: 'Optimizing your route, end to end' });
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
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={(showItinerary || isGenerating) ? { width: `calc(100% - ${rightPanelWidth}% - 6px)` } : undefined}>
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                      if (msg.role === 'user') {
                        return (
                          <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex justify-end">
                            <div className="bg-zinc-900 text-white px-5 py-2.5 rounded-2xl rounded-br-sm text-[15px] leading-relaxed max-w-[80%]">
                              {msg.text}
                            </div>
                          </motion.div>
                        );
                      }

                      return (
                        <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                          <div className="min-w-0">
                            {msg.isAirbnbLoading ? (
                              <div className="text-zinc-600 text-base leading-relaxed flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />
                                <span>{msg.text}</span>
                              </div>
                            ) : msg.isError ? (
                              <div className="bg-red-50 text-red-700 border border-red-100 rounded-2xl px-4 py-3 text-base leading-relaxed">
                                <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                              </div>
                            ) : (
                              <div
                                className="text-zinc-800 text-base leading-[1.75] whitespace-pre-line"
                                dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-zinc-900">$1</strong>').replace(/\n/g, '<br/>') }}
                              />
                            )}

                            {msg.isError && (
                              <button onClick={() => { const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user'); if (lastUserMsg) { setMessages((prev) => prev.filter((m) => m.id !== msg.id)); handleSend(lastUserMsg.text, { skipUserMsg: true }); } }} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700">
                                <RefreshCw className="w-3 h-3" />{t('chat.retry')}
                              </button>
                            )}

                            {msg.itinerary && (
                              <button onClick={() => setShowItinerary(msg.itinerary!)} className="mt-3 lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors">
                                <Sparkles className="w-4 h-4" />View your trip
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3"
                    >
                      <img src={ASSISTANT_AVATAR} alt={ASSISTANT_NAME} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      <div className="flex items-center gap-1.5 pt-2">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="block w-[7px] h-[7px] bg-gray-300 rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.65, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Chip bar above input */}
              {latestChips && latestChips.options.length > 0 && (
                <div className="px-5 pb-2 flex-shrink-0">
                  <div className="max-w-2xl mx-auto flex gap-2 flex-wrap">
                    {latestChips.options.map((opt) => (
                      <button key={opt} onClick={() => handleChipClick(opt, latestChips.key)} disabled={isTyping} className="px-4 py-2 rounded-full text-zinc-700 text-[14px] font-medium border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50">
                        {opt}
                      </button>
                    ))}
                  </div>
                  {showCustomBudget && (
                    <div className="max-w-2xl mx-auto mt-2 pl-11">
                      <BudgetInput onSubmit={handleCustomBudgetSubmit} />
                    </div>
                  )}
                </div>
              )}
              {showGroupPicker && (
                <div className="px-5 pb-2 flex-shrink-0">
                  <div className="max-w-2xl mx-auto mt-2">
                    <p className="text-xs font-semibold text-gray-500 mb-2.5">How many people?</p>
                    <div className="flex gap-2.5 flex-wrap">
                      {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <button
                          key={n}
                          onClick={() => handleGroupSizeSelect(n)}
                          className="w-11 h-11 rounded-full border-2 border-gray-200 text-zinc-800 text-base font-bold hover:border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center"
                        >
                          {n}
                        </button>
                      ))}
                      <button
                        onClick={() => { setShowGroupPicker(false); setInput('We are '); }}
                        className="px-5 h-11 rounded-full border-2 border-gray-200 text-zinc-500 text-sm font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
                      >
                        Other
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Input bar */}
              <div className="p-4 bg-white flex-shrink-0 border-t border-gray-100">
                <div className="max-w-2xl mx-auto">
                  <ChatInputBox
                    value={input} onChange={setInput} onSend={() => handleSend()} onDepartureSelect={handleDepartureSelectInConversation} placeholder={currentPlaceholder} isAnimating={isAnimating} disabled={isTyping} tripState={tripState} onTripStateUpdate={handleTripStateUpdate}
                    calendarOpen={calendarOpen} onCalendarOpenHandled={() => setCalendarOpen(false)} prefillStart={calendarPrefillStart} prefillEnd={calendarPrefillEnd}
                  />
                  <p className="text-center text-[11px] text-gray-400 mt-2">{t('chat.disclaimer')}</p>
                </div>
              </div>
            </div>

            {/* DRAG DIVIDER */}
            {(showItinerary || isGenerating) && (
              <div
                onMouseDown={startDividerDrag}
                className="hidden lg:flex w-[6px] cursor-col-resize items-center justify-center hover:bg-slate-200/60 active:bg-slate-300/80 transition-colors group flex-shrink-0 relative z-10"
              >
                <div className="w-[2px] h-8 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
              </div>
            )}

            {/* RIGHT PANEL */}
            <div className="hidden lg:flex flex-col min-h-0 relative shrink-0" style={{ width: `${rightPanelWidth}%` }}>
              {showItinerary || isGenerating ? (
                <div className="h-full flex flex-col bg-gradient-to-br from-rose-50 via-pink-50/60 to-fuchsia-50/40 border-l border-rose-100/60">
                  <div className="px-5 py-4 border-b border-rose-100/50 flex items-center justify-between flex-shrink-0 bg-white/50 backdrop-blur-sm">
                    <h3 className="text-sm font-bold text-slate-800">Your Trip</h3>
                    <button onClick={() => { setShowItinerary(null); setIsGenerating(false); pendingItineraryRef.current = null; }} className="p-1 rounded-lg hover:bg-rose-100/40 transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <TripPanel
                      itinerary={showItinerary}
                      isGenerating={isGenerating}
                      dataReady={scrapersComplete}
                      generationProgress={generationMeta.progress}
                      generationLabel={generationMeta.label}
                      departureCity={tripState.departureCity || undefined}
                      destination={tripState.destination || undefined}
                      dates={typeof tripState.dates === 'string' ? tripState.dates : undefined}
                      travelersCount={tripState.travelersCount || undefined}
                      budgetAmount={tripState.budgetAmount || undefined}
                      heroImage={heroImage}
                      locationImages={locationImages}
                      dayImageMap={dayImageMap}
                      airbnbListings={airbnbListings}
                      flightEstimates={flightEstimates}
                      isAirbnbLoading={isAirbnbLoading}
                      isFlightLoading={isFlightLoading}
                      onGenerationComplete={handleGenerationComplete}
                      startIso={tripState.startIso || undefined}
                      endIso={tripState.endIso || undefined}
                      onSwapActivity={handleSwapActivity}
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
                generationProgress={generationMeta.progress}
                generationLabel={generationMeta.label}
                departureCity={tripState.departureCity || undefined}
                destination={tripState.destination || undefined}
                dates={typeof tripState.dates === 'string' ? tripState.dates : undefined}
                travelersCount={tripState.travelersCount || undefined}
                budgetAmount={tripState.budgetAmount || undefined}
                heroImage={heroImage}
                locationImages={locationImages}
                dayImageMap={dayImageMap}
                airbnbListings={airbnbListings}
                flightEstimates={flightEstimates}
                isAirbnbLoading={isAirbnbLoading}
                isFlightLoading={isFlightLoading}
                startIso={tripState.startIso || undefined}
                endIso={tripState.endIso || undefined}
                onSwapActivity={handleSwapActivity}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
