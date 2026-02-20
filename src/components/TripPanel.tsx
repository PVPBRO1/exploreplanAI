import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Building2, MapPin, Calendar, Users, ChevronRight,
  ExternalLink, Star, Clock, Train, Download, ArrowRight, Lightbulb,
} from 'lucide-react';
import type { Itinerary, ItineraryDay, AirbnbListing, FlightEstimate } from '../lib/ai/types';
import { TripMap } from './TripMap';
import { TripGenerationLoader } from './TripGenerationLoader';
import { fetchActivityImages } from '../lib/api/unsplash';

interface TripPanelProps {
  itinerary: Itinerary | null;
  isGenerating: boolean;
  dataReady?: boolean;
  generationProgress?: number;
  generationLabel?: string;
  departureCity?: string;
  destination?: string;
  dates?: string;
  travelersCount?: number;
  budgetAmount?: number;
  heroImage?: string;
  locationImages: Map<string, string>;
  dayImageMap?: Record<number, string[]>;
  airbnbListings: AirbnbListing[];
  flightEstimates: FlightEstimate[];
  isAirbnbLoading: boolean;
  isFlightLoading: boolean;
  onGenerationComplete?: () => void;
  startIso?: string;
  endIso?: string;
  onSwapActivity?: (dayNum: number, swapText: string) => void;
}

interface CityGroup {
  city: string;
  days: ItineraryDay[];
  startDate?: string;
  endDate?: string;
}

function parseCities(destination?: string): string[] {
  if (!destination) return [];
  const cleaned = destination.replace(/,\s*(Japan|Thailand|France|Italy|Spain|UK|USA|Indonesia|India|Mexico|Australia|Portugal|Morocco|Iceland|Turkey|Jordan|Canada|New Zealand|Croatia|Greece|Germany|Austria|Switzerland|Netherlands|Belgium|Czech Republic|Hungary|Poland|Vietnam|South Korea|China|Brazil|Argentina|Peru|Colombia|Egypt|South Africa|Kenya|Tanzania|UAE|Maldives|Sri Lanka|Malaysia|Singapore|Philippines)$/i, '');
  return cleaned.split(/\s*[&+]\s*|\s+and\s+/i).map((c) => c.trim()).filter(Boolean);
}

function groupDaysByCity(days: ItineraryDay[], cities: string[]): CityGroup[] {
  if (cities.length <= 1) {
    const city = cities[0] || 'Destination';
    return [{ city, days, startDate: days[0]?.date, endDate: days[days.length - 1]?.date }];
  }

  const groups: CityGroup[] = cities.map((c) => ({ city: c, days: [], startDate: undefined, endDate: undefined }));
  let currentIdx = 0;

  for (const day of days) {
    const text = `${day.title} ${day.activities.map((a) => `${a.title} ${a.location || ''}`).join(' ')}`.toLowerCase();
    for (let i = currentIdx; i < cities.length; i++) {
      if (i > currentIdx && text.includes(cities[i].toLowerCase())) {
        currentIdx = i;
        break;
      }
    }
    groups[currentIdx].days.push(day);
  }

  return groups
    .filter((g) => g.days.length > 0)
    .map((g) => ({
      ...g,
      startDate: g.days[0]?.date,
      endDate: g.days[g.days.length - 1]?.date,
    }));
}

function formatDateShort(iso?: string): string {
  if (!iso) return '';
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return '';
  const d = new Date(iso.slice(0, 10) + 'T12:00:00');
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Activity Photo Carousel (CSS marquee auto-scroll, no scrollbar) ─── */

function ActivityPhotoCarousel({ query, destination }: { query: string; destination?: string }) {
  const [images, setImages] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchActivityImages(query, 6).then((urls) => {
      if (!cancelled) {
        setImages(urls);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, [query, destination]);

  const handleInteraction = useCallback(() => {
    setPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setPaused(false), 5000);
  }, []);

  useEffect(() => {
    return () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); };
  }, []);

  if (!loaded) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-36 h-44 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (images.length === 0) return null;

  const doubled = [...images, ...images];
  const itemWidth = 152; // 144px image + 8px gap
  const totalWidth = images.length * itemWidth;
  const durationSec = Math.max(images.length * 5, 20);

  return (
    <div
      className="overflow-hidden -mx-1 px-1 py-1"
      onMouseEnter={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <div
        className="flex gap-2"
        style={{
          width: `${totalWidth * 2}px`,
          animation: `carousel-scroll ${durationSec}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {doubled.map((src, i) => (
          <div key={`${i}`} className="w-36 h-44 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Day Card ─── */

function DayCard({ day, images, isExpanded, onToggle, destination, onSwapActivity }: {
  day: ItineraryDay;
  images: string[];
  isExpanded: boolean;
  onToggle: () => void;
  destination?: string;
  onSwapActivity?: (dayNum: number, swapText: string) => void;
}) {
  const expCount = day.experienceCount || day.activities.length;
  const dateStr = formatDateShort(day.date);
  const heroImg = images[0];

  const swapMatch = day.tip?.match(/Swap:\s*(.+?)(?:\.|$)/i);
  const swapSuggestion = swapMatch?.[1]?.trim();
  const tipWithoutSwap = day.tip?.replace(/Swap:\s*.+?(?:\.|$)/i, '').trim();

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm">
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex gap-1.5 h-56 overflow-hidden">
          {heroImg && (
            <div className="flex-1 overflow-hidden">
              <img src={heroImg} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          {images[1] && (
            <div className="flex-1 overflow-hidden">
              <img src={images[1]} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          {!heroImg && !images[1] && (
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-300" />
            </div>
          )}
        </div>

        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-full tracking-wide">
                  DAY {day.day}
                </span>
                {dateStr && <span className="text-xs text-gray-500">{dateStr}</span>}
                {day.weatherHint && (
                  <span className="text-xs text-gray-500 truncate">{day.weatherHint}</span>
                )}
              </div>
              <h4 className="font-semibold text-gray-900 text-base leading-tight">{day.title}</h4>
              <p className="text-sm text-gray-500 mt-0.5">{expCount} experience{expCount !== 1 ? 's' : ''}</p>
            </div>
            <ArrowRight className={`w-4 h-4 text-gray-300 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-50 px-4 pb-4 pt-3 space-y-4">
              {day.activities.map((act, i) => (
                <div key={i} className="flex gap-3">
                  {/* Vertical timeline */}
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-800 bg-white" />
                    {i < day.activities.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>

                  {/* Activity card */}
                  <div className="pb-3 min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-base">{act.title}</span>
                      {act.time && (
                        <span className="text-xs text-gray-500 flex items-center gap-0.5 bg-gray-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />{act.time}
                        </span>
                      )}
                      {act.estimated_cost && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {act.estimated_cost}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{act.description}</p>
                    {act.location && (
                      <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{act.location}
                      </p>
                    )}
                    <ActivityPhotoCarousel
                      query={`${destination || ''} ${act.title} travel`}
                      destination={destination}
                    />
                  </div>
                </div>
              ))}

              {/* Tips section */}
              {(tipWithoutSwap || swapSuggestion) && (
                <div className="space-y-2 pt-1">
                  {tipWithoutSwap && (
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-600 leading-relaxed border-l-2 border-gray-200">
                      <Lightbulb className="w-3 h-3 inline mr-1 text-gray-400" />
                      {tipWithoutSwap.replace(/^💡\s*/, '')}
                    </div>
                  )}
                  {swapSuggestion && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSwapActivity?.(day.day, swapSuggestion);
                      }}
                      className="flex items-center gap-2 w-full bg-zinc-50 hover:bg-zinc-100 rounded-xl px-3 py-2.5 text-sm text-zinc-700 transition-colors border border-zinc-100"
                    >
                      <ArrowRight className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                      <span>Swap: <span className="font-medium">{swapSuggestion}</span></span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Flight Card ─── */

function FlightCard({ flight, label, fallbackStartIso, fallbackEndIso }: { flight: FlightEstimate; label: string; fallbackStartIso?: string; fallbackEndIso?: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
            <Plane className="w-3.5 h-3.5 text-zinc-600" />
          </div>
          <span className="text-xs font-semibold text-gray-700">{label}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Estimated</span>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 leading-none">{flight.departure_airport}</p>
            <p className="text-[10px] text-gray-400 mt-1">{formatDateShort(flight.departure_time) || formatDateShort(fallbackStartIso)}</p>
          </div>
          <div className="flex-1 px-3 flex flex-col items-center">
            <p className="text-xs text-gray-400 mb-1.5">{flight.duration}</p>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-gray-200" />
              <Plane className="w-3 h-3 text-gray-300" />
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900 leading-none">{flight.arrival_airport}</p>
            <p className="text-[10px] text-gray-400 mt-1">{formatDateShort(flight.arrival_time) || formatDateShort(fallbackEndIso)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
          {(() => {
            const bookingUrl = flight.booking_url ||
              `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(flight.departure_airport)}+to+${encodeURIComponent(flight.arrival_airport)}${fallbackStartIso ? `&d=${fallbackStartIso}` : ''}${fallbackEndIso ? `&r=${fallbackEndIso}` : ''}`;
            return (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors"
              >
                Get live prices
              </a>
            );
          })()}
          <div className="text-right">
            {flight.price_per_person > 0 ? (
              <>
                <span className="text-base font-bold text-gray-900">
                  ~${flight.price_per_person.toLocaleString()}
                </span>
                <span className="text-xs font-normal text-gray-400 ml-1">/person</span>
              </>
            ) : flight.price_total > 0 ? (
              <>
                <span className="text-base font-bold text-gray-900">
                  ~${flight.price_total.toLocaleString()}
                </span>
                <span className="text-xs font-normal text-gray-400 ml-1">total</span>
              </>
            ) : (
              <span className="text-xs text-gray-400">Check prices</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stay Card ─── */

function StayCard({ listing, travelersCount }: { listing: AirbnbListing; travelersCount?: number }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
          <Building2 className="w-3.5 h-3.5 text-zinc-600" />
        </div>
        <span className="text-xs font-semibold text-gray-700">Where you'll stay</span>
        {listing.source && (
          <span className="ml-auto text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
            via {listing.source}
          </span>
        )}
      </div>

      <div className="flex gap-3 p-4">
        {listing.image_url && (
          <img
            src={listing.image_url}
            alt=""
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">{listing.title}</h4>
          {listing.rating && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-gray-700">{Number(listing.rating).toFixed(1)}</span>
              </div>
              {listing.home_type_detected && (
                <span className="text-xs text-gray-400">{listing.home_type_detected}</span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <a
              href={listing.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 underline underline-offset-2 transition-colors flex items-center gap-1"
            >
              View listing <ExternalLink className="w-3 h-3" />
            </a>
            <div className="text-right">
              {listing.price_per_night && (() => {
                const nightPrice = Number(String(listing.price_per_night).replace(/^\$/, '').replace(/,/g, ''));
                const perPerson = travelersCount && travelersCount > 1 ? Math.round(nightPrice / travelersCount) : 0;
                return (
                  <>
                    <p className="text-sm font-bold text-gray-900">
                      ${nightPrice.toLocaleString()}<span className="text-[10px] font-normal text-gray-400">/night</span>
                    </p>
                    {perPerson > 0 && (
                      <p className="text-[10px] text-gray-400">${perPerson}/person/night</p>
                    )}
                  </>
                );
              })()}
              {!listing.price_per_night && listing.total_price && (
                <p className="text-sm font-bold text-gray-900">
                  ${Number(String(listing.total_price).replace(/^\$/, '').replace(/,/g, '')).toLocaleString()}<span className="text-[10px] font-normal text-gray-400"> total</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */

function SkeletonCard({ height = 'h-24' }: { height?: string }) {
  return <div className={`${height} rounded-2xl bg-gray-100 animate-pulse`} />;
}

/* ─── Route Timeline ─── */

function RouteTimeline({ departureCity, groups }: {
  departureCity: string;
  groups: CityGroup[];
}) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2 scrollbar-none">
      <div className="flex items-center gap-1.5 text-gray-500 flex-shrink-0">
        <div className="w-2 h-2 rounded-full bg-zinc-400" />
        <span className="text-xs font-medium text-gray-600">{departureCity}</span>
      </div>

      {groups.map((g, i) => (
        <div key={g.city} className="flex items-center gap-0 flex-shrink-0">
          <div className="px-2 text-gray-200">
            {i === 0 ? <Plane className="w-3.5 h-3.5" /> : <Train className="w-3.5 h-3.5" />}
          </div>
          <div className="border border-gray-200 rounded-xl px-3 py-1.5 bg-white shadow-sm">
            <p className="text-xs font-bold text-gray-900">{g.city}</p>
            {g.startDate && g.endDate && (
              <p className="text-xs text-gray-500">
                {formatDateShort(g.startDate)} – {formatDateShort(g.endDate)}
              </p>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-0 flex-shrink-0">
        <div className="px-2 text-gray-200">
          <Plane className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-zinc-400" />
          <span className="text-xs font-medium text-gray-600">{departureCity}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── City Section ─── */

function CitySection({ group, groupIndex, cityImages, dayImageMap, collapsedDays, toggleDay, airbnbListings, flightEstimates, isAirbnbLoading, isFlightLoading, isFirstCity, isLastCity, departureCity, startIso, endIso, travelersCount, onSwapActivity }: {
  group: CityGroup;
  groupIndex: number;
  cityImages: string[];
  dayImageMap?: Record<number, string[]>;
  collapsedDays: Set<number>;
  toggleDay: (d: number) => void;
  airbnbListings: AirbnbListing[];
  flightEstimates: FlightEstimate[];
  isAirbnbLoading: boolean;
  isFlightLoading: boolean;
  isFirstCity: boolean;
  isLastCity: boolean;
  departureCity?: string;
  startIso?: string;
  endIso?: string;
  travelersCount?: number;
  onSwapActivity?: (dayNum: number, swapText: string) => void;
}) {
  const dateRange = group.startDate && group.endDate
    ? `${formatDateShort(group.startDate)} – ${formatDateShort(group.endDate)}`
    : '';

  return (
    <div className="space-y-4">
      {/* City header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Days {group.days[0]?.day}–{group.days[group.days.length - 1]?.day}
            {dateRange && ` · ${dateRange}`}
          </span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{group.city}</h3>
      </div>

      {/* City hero images */}
      {cityImages.length > 0 && (
        <div className="flex gap-2 h-52 rounded-2xl overflow-hidden">
          <img src={cityImages[0]} alt={group.city} className="flex-[2] object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/destinations/beach.jpg'; }} />
          {cityImages[1] && (
            <img src={cityImages[1]} alt={group.city} className="flex-1 object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/destinations/paris.jpg'; }} />
          )}
        </div>
      )}

      {/* Inbound flight */}
      {isFirstCity && (
        isFlightLoading
          ? <SkeletonCard height="h-28" />
          : flightEstimates.length > 0
            ? <FlightCard flight={flightEstimates[0]} label={`Inbound · ${formatDateShort(group.startDate) || formatDateShort(startIso)}`} fallbackStartIso={startIso} fallbackEndIso={endIso} />
            : null
      )}

      {/* Stay */}
      {isAirbnbLoading
        ? <SkeletonCard height="h-24" />
        : airbnbListings.length > 0
          ? <StayCard listing={airbnbListings[groupIndex % airbnbListings.length]} travelersCount={travelersCount} />
          : null
      }

      {/* Itinerary header */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Itinerary</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Day cards */}
      <div className="space-y-3">
        {group.days.map((day) => (
          <DayCard
            key={day.day}
            day={day}
            images={dayImageMap?.[day.day] || []}
            isExpanded={!collapsedDays.has(day.day)}
            onToggle={() => toggleDay(day.day)}
            destination={group.city}
            onSwapActivity={onSwapActivity}
          />
        ))}
      </div>

      {/* Outbound flight */}
      {isLastCity && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Return</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          {isFlightLoading
            ? <SkeletonCard height="h-28" />
            : flightEstimates.length > 1
              ? <FlightCard flight={flightEstimates[1]} label={`Outbound · ${formatDateShort(group.endDate) || formatDateShort(endIso)}`} fallbackStartIso={startIso} fallbackEndIso={endIso} />
              : flightEstimates.length > 0
                ? <FlightCard flight={flightEstimates[0]} label={`Return to ${departureCity || 'home'}`} fallbackStartIso={startIso} fallbackEndIso={endIso} />
                : null
          }
        </div>
      )}
    </div>
  );
}

/* ─── Upgrade Tips ─── */

function UpgradeTipsSection({ tips }: { tips: string[] }) {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center">
          <Lightbulb className="w-3.5 h-3.5 text-zinc-600" />
        </div>
        <span className="text-xs font-semibold text-gray-700">To make this trip even better</span>
      </div>
      <div className="p-4 space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-5 h-5 rounded-full bg-zinc-900 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {i + 1}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Panel ─── */

export function TripPanel({
  itinerary,
  isGenerating,
  dataReady,
  generationProgress,
  generationLabel,
  departureCity,
  destination,
  dates,
  travelersCount,
  budgetAmount,
  heroImage,
  locationImages,
  dayImageMap,
  airbnbListings,
  flightEstimates,
  isAirbnbLoading,
  isFlightLoading,
  onGenerationComplete,
  startIso,
  endIso,
  onSwapActivity,
}: TripPanelProps) {
  const [collapsedDays, setCollapsedDays] = useState<Set<number>>(new Set());
  const toggleDay = (dayNum: number) => {
    setCollapsedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNum)) next.delete(dayNum);
      else next.add(dayNum);
      return next;
    });
  };
  const [mapLocations, setMapLocations] = useState<{ dayNumber: number; location: string }[]>([]);

  const cities = useMemo(() => parseCities(destination), [destination]);
  const cityGroups = useMemo(
    () => itinerary ? groupDaysByCity(itinerary.days, cities.length > 0 ? cities : [destination || 'Destination']) : [],
    [itinerary, cities, destination],
  );

  const cityImageSets = useMemo(() => {
    return cityGroups.map((g) => {
      const loc = locationImages.get(g.city);
      if (loc) return [loc, heroImage || '/destinations/beach.jpg'];
      const CITY_MAP: Record<string, string> = {
        tokyo: '/destinations/tokyo.jpg', kyoto: '/destinations/tokyo.jpg', osaka: '/destinations/tokyo.jpg',
        paris: '/destinations/paris.jpg', france: '/destinations/paris.jpg',
        london: '/destinations/london.jpg', england: '/destinations/london.jpg',
        bali: '/destinations/bali.jpg', indonesia: '/destinations/bali.jpg',
        rome: '/destinations/rome.jpg', italy: '/destinations/rome.jpg',
        barcelona: '/destinations/barcelona.jpg', spain: '/destinations/barcelona.jpg',
        dubai: '/destinations/dubai.jpg', uae: '/destinations/dubai.jpg',
        sydney: '/destinations/sydney.jpg', australia: '/destinations/sydney.jpg',
        'new york': '/destinations/nyc.jpg', nyc: '/destinations/nyc.jpg', manhattan: '/destinations/nyc.jpg',
        marrakech: '/destinations/marrakech.jpg', morocco: '/destinations/marrakech.jpg',
        egypt: '/destinations/egypt.jpg', cairo: '/destinations/egypt.jpg',
        nepal: '/destinations/nepal.jpg', kathmandu: '/destinations/nepal.jpg',
        porto: '/destinations/porto.jpg', lisbon: '/destinations/porto.jpg', portugal: '/destinations/porto.jpg',
        maldives: '/destinations/beach.jpg', santorini: '/destinations/beach.jpg', greece: '/destinations/beach.jpg',
      };
      const fallback = Object.entries(CITY_MAP).find(([k]) => g.city.toLowerCase().includes(k));
      const primary = fallback?.[1] || heroImage || '/destinations/beach.jpg';
      return [primary, heroImage || '/destinations/paris.jpg'];
    });
  }, [cityGroups, locationImages, heroImage]);

  useEffect(() => {
    if (!itinerary) return;
    const locs = itinerary.days
      .map((d) => {
        const mainLoc = d.activities[0]?.location || d.title;
        return { dayNumber: d.day, location: mainLoc };
      })
      .filter((l) => l.location);
    setMapLocations(locs);
  }, [itinerary]);

  if (isGenerating && !itinerary) {
    return (
      <TripGenerationLoader
        isActive
        destination={destination}
        dataReady={dataReady}
        progress={generationProgress}
        onComplete={onGenerationComplete}
      />
    );
  }

  if (!itinerary) return null;

  const totalExperiences = itinerary.days.reduce(
    (sum, d) => sum + (d.experienceCount || d.activities.length), 0,
  );
  const cityCount = cityGroups.length;
  const nights = Math.max(1, itinerary.days.length - 1);
  const bestFlightTotal = flightEstimates[0]?.price_total || 0;
  const bestStay = airbnbListings[0];
  const stayTotal = bestStay?.total_price || ((bestStay?.price_per_night || 0) * nights);
  const estimatedTripTotal = Math.round(bestFlightTotal + stayTotal);
  const overBudget = typeof budgetAmount === 'number' && budgetAmount > 0 && estimatedTripTotal > budgetAmount;

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-5">

        {/* Hero image with title overlay */}
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={heroImage || cityImageSets[0]?.[0] || '/destinations/beach.jpg'}
            alt=""
            className="w-full h-56 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/destinations/beach.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-2xl font-bold text-white leading-tight">{itinerary.tripTitle}</h2>
            {itinerary.summary && (
              <p className="text-white/80 text-sm mt-1 line-clamp-2">{itinerary.summary}</p>
            )}
          </div>
        </div>

        {/* Stats chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: Calendar, label: `${itinerary.days.length} days` },
            ...(dates ? [{ icon: Clock, label: dates }] : []),
            { icon: MapPin, label: `${cityCount} ${cityCount === 1 ? 'city' : 'cities'}` },
            { icon: Star, label: `${totalExperiences} exp` },
            ...(travelersCount ? [{ icon: Users, label: `${travelersCount} traveler${travelersCount > 1 ? 's' : ''}` }] : []),
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
              <Icon className="w-3 h-3 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
          ))}
        </div>

        {/* Route timeline */}
        {departureCity && cityGroups.length > 0 && (
          <RouteTimeline departureCity={departureCity} groups={cityGroups} />
        )}

        {/* Map */}
        {mapLocations.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden">
            <TripMap
              locations={mapLocations}
              onPinClick={(day) => toggleDay(day)}
              className="h-44"
            />
          </div>
        )}

        {/* City Sections */}
        <div className="space-y-10">
          {cityGroups.map((group, i) => (
            <CitySection
              key={group.city}
              group={group}
              groupIndex={i}
              cityImages={cityImageSets[i] || []}
              dayImageMap={dayImageMap}
              collapsedDays={collapsedDays}
              toggleDay={toggleDay}
              airbnbListings={airbnbListings}
              flightEstimates={flightEstimates}
              isAirbnbLoading={isAirbnbLoading}
              isFlightLoading={isFlightLoading}
              isFirstCity={i === 0}
              isLastCity={i === cityGroups.length - 1}
              departureCity={departureCity}
              startIso={startIso}
              endIso={endIso}
              travelersCount={travelersCount}
              onSwapActivity={onSwapActivity}
            />
          ))}
        </div>

        {/* Upgrade tips */}
        {itinerary.upgradeTips && itinerary.upgradeTips.length > 0 && (
          <UpgradeTipsSection tips={itinerary.upgradeTips} />
        )}

        {/* Budget summary */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Trip estimate</p>
              {budgetAmount && (
                <p className="text-lg font-bold text-gray-900">Budget: ~${budgetAmount.toLocaleString()}</p>
              )}
              {estimatedTripTotal > 0 && (
                <p className={`text-sm font-semibold mt-0.5 ${overBudget ? 'text-rose-500' : 'text-emerald-600'}`}>
                  Flights + stay: ~${estimatedTripTotal.toLocaleString()}
                  {overBudget && ' · over budget'}
                </p>
              )}
              {itinerary.estimatedDailyBudget && (
                <p className="text-xs text-gray-400 mt-1">{itinerary.estimatedDailyBudget} per day</p>
              )}
            </div>
          </div>
          {itinerary.recommendedAreasToStay?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Where to stay</p>
              <div className="flex flex-wrap gap-1.5">
                {itinerary.recommendedAreasToStay.map((area) => (
                  <span key={area} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2 border-t border-gray-50">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors">
              <Download className="w-4 h-4" /> Download
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors">
              <ChevronRight className="w-4 h-4" /> Book trip
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
