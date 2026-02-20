export interface TripPlanInputs {
  destination: string;
  dates?: string;
  tripLength?: number;
  budget: string;
  travelers?: number;
  pace: 'relaxed' | 'balanced' | 'packed' | '';
  interests: string[];
  accommodation: string;
  origin?: string | string[];
  currency?: string;
}

export interface ItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
  optionalNotes?: string;
  mapQuery?: string;
}

export interface Itinerary {
  tripTitle: string;
  summary: string;
  days: ItineraryDay[];
  options?: SearchBundle;
  verification?: SearchMeta;
}

export interface NormalizedTripInputs {
  destination: string;
  dates: string;
  tripLength: number;
  budget: string;
  travelers: number;
  pace: 'relaxed' | 'balanced' | 'packed';
  interests: string[];
  accommodation: string;
  origin?: string;
  currency?: string;
}

export interface StayOption {
  name: string;
  type: string;
  area: string;
  pricePerNight?: number;
  currency?: string;
  totalPrice?: number;
  rating?: number;
  pros: string[];
  cons: string[];
  bookingUrl?: string;
  source?: string;
}

export interface FlightOption {
  airline: string;
  route: string;
  departure?: string;
  arrival?: string;
  duration?: string;
  stops: number;
  pricePerPerson?: number;
  priceTotal?: number;
  currency?: string;
  bookingUrl?: string;
  source?: string;
}

export interface SearchMeta {
  searchedAt?: string;
  staysSource?: string;
  flightsSource?: string;
  assumptions?: string[];
  disclaimer?: string;
}

export interface SearchBundle {
  stays?: StayOption[];
  flights?: FlightOption[];
}

export type ProviderKey = 'airbnb' | 'priceline' | 'skyscanner';

export interface ProviderResult {
  provider: ProviderKey;
  status: 'ok' | 'error' | 'timeout';
  results: Record<string, unknown>[];
  error?: string;
  durationMs: number;
}

export interface Verification {
  searchedAt: string;
  providersAttempted: ProviderKey[];
  providersSucceeded: ProviderKey[];
  providerErrors: Record<string, string>;
  counts: Record<string, number>;
  status: 'ok' | 'partial' | 'scrape_failed';
}

export interface ScraperSearchBundle {
  stays: Record<string, unknown>[];
  flights: Record<string, unknown>[];
  providers: ProviderResult[];
  verification: Verification;
}

export interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}

export interface HealthResponse {
  ok: true;
  version: string;
  uptime: number;
}
