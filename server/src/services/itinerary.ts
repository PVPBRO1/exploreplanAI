import type { TripPlanInputs, NormalizedTripInputs, Itinerary } from '../types.js';

const DEFAULT_INTERESTS = ['highlights', 'food'];
const DEFAULT_TRIP_LENGTH = 3;

export function normalizeTripInputs(raw: TripPlanInputs): NormalizedTripInputs {
  const tripLength = raw.tripLength ?? inferTripLength(raw.dates) ?? DEFAULT_TRIP_LENGTH;

  const pace = raw.pace === '' ? 'balanced' : raw.pace;

  const interests = raw.interests.length > 0 ? raw.interests : DEFAULT_INTERESTS;

  return {
    destination: raw.destination.trim(),
    dates: raw.dates?.trim() ?? '',
    tripLength,
    budget: raw.budget.trim(),
    travelers: raw.travelers ?? 1,
    pace,
    interests: interests.map((i) => i.trim()).filter(Boolean),
    accommodation: raw.accommodation.trim(),
  };
}

function inferTripLength(dates?: string): number | undefined {
  if (!dates) return undefined;

  const dayMatch = dates.match(/(\d+)\s*day/i);
  if (dayMatch) return parseInt(dayMatch[1], 10);

  const nightMatch = dates.match(/(\d+)\s*night/i);
  if (nightMatch) return parseInt(nightMatch[1], 10);

  return undefined;
}

export function ensureMapQueries(itinerary: Itinerary, destination: string): Itinerary {
  return {
    ...itinerary,
    days: itinerary.days.map((day) => {
      if (day.mapQuery && day.mapQuery.startsWith('https://')) {
        return day;
      }

      const places = extractPlaces(day);
      const query = `${destination} ${places}`;
      const encoded = encodeURIComponent(query);
      const mapQuery = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

      return { ...day, mapQuery };
    }),
  };
}

function extractPlaces(day: { morning: string; afternoon: string; evening: string }): string {
  const combined = `${day.morning} ${day.afternoon} ${day.evening}`;
  const properNouns = combined.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) ?? [];
  const unique = [...new Set(properNouns)].slice(0, 6);
  return unique.join(', ');
}

export function finalValidateItinerary(itinerary: Itinerary, expectedDays: number): Itinerary {
  if (itinerary.days.length !== expectedDays) {
    if (itinerary.days.length > expectedDays) {
      itinerary = { ...itinerary, days: itinerary.days.slice(0, expectedDays) };
    }
  }

  return {
    ...itinerary,
    days: itinerary.days.map((day, idx) => ({
      ...day,
      day: idx + 1,
    })),
  };
}
