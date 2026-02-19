export interface TripState {
  destination: string | null;
  dates: string | null;
  tripLengthDays: number | null;
  budgetRange: string | null;
  budgetAmount: number | null;
  pace: 'relaxed' | 'balanced' | 'packed' | null;
  travelersCount: number | null;
  interests: string[];
  accommodationPreference: string | null;
  departureCity: string | null;
  constraints: string[];
  startIso: string | null;
  endIso: string | null;
}

export interface ItineraryActivity {
  title: string;
  time?: string;
  description: string;
  location?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  date?: string;
  experienceCount?: number;
  weatherHint?: string;
  activities: ItineraryActivity[];
  tip?: string;
}

export interface Itinerary {
  tripTitle: string;
  summary: string;
  days: ItineraryDay[];
  recommendedAreasToStay: string[];
  estimatedDailyBudget: string;
}

export interface NextQuestion {
  key: string;
  prompt: string;
  options?: string[];
}

export interface APIResponse {
  type: 'intake' | 'confirmation' | 'itinerary';
  assistantMessage: string;
  nextQuestion: NextQuestion | null;
  tripState: TripState;
  itinerary: Itinerary | null;
}

export interface ChatMessage {
  id: number;
  role: 'ai' | 'user';
  text: string;
  nextQuestion?: NextQuestion | null;
  itinerary?: Itinerary | null;
  isError?: boolean;
  isAirbnbLoading?: boolean;
  airbnbListings?: AirbnbListing[];
  isFlightLoading?: boolean;
  flightEstimates?: FlightEstimate[];
}

export interface AirbnbListing {
  title: string;
  price_per_night: number | null;
  total_price: number | null;
  rating: number | null;
  home_type_detected: string;
  image_url: string | null;
  link: string;
}

export interface FlightEstimate {
  airline: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  stops: number;
  price_total: number;
  price_per_person: number;
  booking_url: string;
  departure_airport: string;
  arrival_airport: string;
}

export function createEmptyTripState(): TripState {
  return {
    destination: null,
    dates: null,
    tripLengthDays: null,
    budgetRange: null,
    budgetAmount: null,
    pace: null,
    travelersCount: null,
    interests: [],
    accommodationPreference: null,
    departureCity: null,
    constraints: [],
    startIso: null,
    endIso: null,
  };
}
