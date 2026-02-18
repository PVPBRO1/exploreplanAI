export interface TripPlanInputs {
  destination: string;
  dates?: string;
  tripLength?: number;
  budget: string;
  travelers?: number;
  pace: 'relaxed' | 'balanced' | 'packed' | '';
  interests: string[];
  accommodation: string;
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
