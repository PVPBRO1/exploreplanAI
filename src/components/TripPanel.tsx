import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Building2, MapPin, Calendar, Users, ChevronDown,
  ChevronRight, ExternalLink, Star, Clock, Thermometer,
} from 'lucide-react';
import type { Itinerary, ItineraryDay, AirbnbListing, FlightEstimate } from '../lib/ai/types';
import { TripMap } from './TripMap';
import { TripGenerationLoader } from './TripGenerationLoader';

interface TripPanelProps {
  itinerary: Itinerary | null;
  isGenerating: boolean;
  departureCity?: string;
  destination?: string;
  dates?: string;
  travelersCount?: number;
  budgetAmount?: number;
  heroImage?: string;
  locationImages: Map<string, string>;
  airbnbListings: AirbnbListing[];
  flightEstimates: FlightEstimate[];
  isAirbnbLoading: boolean;
  isFlightLoading: boolean;
  onGenerationComplete?: () => void;
}

function DayCard({ day, image, isExpanded, onToggle }: {
  day: ItineraryDay;
  image?: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          {day.day}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{day.title}</span>
            {day.experienceCount && (
              <span className="text-xs text-gray-400">{day.experienceCount} experiences</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
            {day.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {day.weatherHint && (
              <span className="flex items-center gap-1">
                <Thermometer className="w-3 h-3" />
                {day.weatherHint}
              </span>
            )}
          </div>
        </div>
        {image && (
          <img src={image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {day.activities.map((act, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5" />
                    {i < day.activities.length - 1 && <div className="w-px flex-1 bg-violet-200" />}
                  </div>
                  <div className="pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 text-sm">{act.title}</span>
                      {act.time && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />{act.time}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{act.description}</p>
                    {act.location && (
                      <p className="text-xs text-violet-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{act.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {day.tip && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-xs text-amber-700">
                  💡 {day.tip}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlightCard({ flight }: { flight: FlightEstimate }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-gray-800 text-sm">{flight.airline}</span>
        <span className="text-lg font-bold text-violet-600">
          ${flight.price_per_person}
          <span className="text-xs text-gray-400 font-normal">/person</span>
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{flight.departure_airport}</span>
        <Plane className="w-3 h-3" />
        <span>{flight.arrival_airport}</span>
        <span className="text-gray-300">|</span>
        <span>{flight.duration}</span>
        <span className="text-gray-300">|</span>
        <span>{flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
      </div>
      {flight.booking_url && (
        <a
          href={flight.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-xs text-violet-600 hover:text-violet-700"
        >
          Get Live Prices <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

function AirbnbCard({ listing }: { listing: AirbnbListing }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      {listing.image_url && (
        <img src={listing.image_url} alt={listing.title} className="w-full h-32 object-cover" />
      )}
      <div className="p-3">
        <h4 className="font-medium text-gray-800 text-sm line-clamp-1">{listing.title}</h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          {listing.rating && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {listing.rating}
            </span>
          )}
          <span>{listing.home_type_detected}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          {listing.price_per_night && (
            <span className="font-semibold text-gray-800 text-sm">
              ${listing.price_per_night}<span className="text-xs font-normal text-gray-400">/night</span>
            </span>
          )}
          <a
            href={listing.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-0.5"
          >
            View <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function SkeletonCards({ count, height = 'h-20' }: { count: number; height?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${height} bg-gray-100 rounded-xl animate-pulse`} />
      ))}
    </div>
  );
}

export function TripPanel({
  itinerary,
  isGenerating,
  departureCity,
  destination,
  dates,
  travelersCount,
  budgetAmount,
  heroImage,
  locationImages,
  airbnbListings,
  flightEstimates,
  isAirbnbLoading,
  isFlightLoading,
  onGenerationComplete,
}: TripPanelProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [mapLocations, setMapLocations] = useState<{ dayNumber: number; location: string }[]>([]);

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

  if (isGenerating) {
    return (
      <TripGenerationLoader
        isActive
        departureCity={departureCity}
        destination={destination}
        onComplete={onGenerationComplete}
      />
    );
  }

  if (!itinerary) return null;

  const totalExperiences = itinerary.days.reduce(
    (sum, d) => sum + (d.experienceCount || d.activities.length),
    0
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Hero / Summary */}
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={heroImage || '/destinations/beach.jpg'}
            alt={itinerary.tripTitle}
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h2 className="text-xl font-bold leading-tight">{itinerary.tripTitle}</h2>
            <p className="text-sm text-white/80 mt-1 line-clamp-2">{itinerary.summary}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {itinerary.days.length} days
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {destination || '1 city'}
          </span>
          <span className="flex items-center gap-1">
            <Plane className="w-3.5 h-3.5" />
            {totalExperiences} experiences
          </span>
          {travelersCount && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {travelersCount}
            </span>
          )}
        </div>

        {/* Route Visualization */}
        {departureCity && destination && (
          <div className="bg-violet-50 rounded-xl p-3 flex items-center gap-2 text-sm">
            <Plane className="w-4 h-4 text-violet-500" />
            <span className="font-medium text-violet-700">{departureCity}</span>
            <ChevronRight className="w-4 h-4 text-violet-300" />
            <span className="font-medium text-violet-700">{destination}</span>
            <ChevronRight className="w-4 h-4 text-violet-300" />
            <span className="font-medium text-violet-700">{departureCity}</span>
            {dates && <span className="text-violet-400 text-xs ml-auto">{dates}</span>}
          </div>
        )}

        {/* Map */}
        {mapLocations.length > 0 && (
          <TripMap
            locations={mapLocations}
            onPinClick={(day) => setExpandedDay(day === expandedDay ? null : day)}
            className="h-48"
          />
        )}

        {/* Flights */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Plane className="w-4 h-4" /> Flights
          </h3>
          {isFlightLoading ? (
            <SkeletonCards count={2} />
          ) : flightEstimates.length > 0 ? (
            <div className="space-y-2">
              {flightEstimates.slice(0, 3).map((f, i) => (
                <FlightCard key={i} flight={f} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Flight data will appear once your trip is confirmed.</p>
          )}
        </div>

        {/* Stays */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Stays
          </h3>
          {isAirbnbLoading ? (
            <SkeletonCards count={2} height="h-40" />
          ) : airbnbListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {airbnbListings.slice(0, 4).map((l, i) => (
                <AirbnbCard key={i} listing={l} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Stay recommendations will appear once your trip is confirmed.</p>
          )}
        </div>

        {/* Day-by-Day Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Day-by-Day Itinerary
          </h3>
          <div className="space-y-2">
            {itinerary.days.map((day) => (
              <DayCard
                key={day.day}
                day={day}
                image={locationImages.get(day.activities[0]?.location || day.title)}
                isExpanded={expandedDay === day.day}
                onToggle={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              />
            ))}
          </div>
        </div>

        {/* Budget & Areas */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Est. Daily Budget</span>
            <span className="font-medium text-gray-800">{itinerary.estimatedDailyBudget}</span>
          </div>
          {budgetAmount && (
            <div className="flex justify-between">
              <span className="text-gray-500">Total Budget</span>
              <span className="font-medium text-gray-800">${budgetAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Recommended Areas</span>
            <span className="font-medium text-gray-800">{itinerary.recommendedAreasToStay.join(', ')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
