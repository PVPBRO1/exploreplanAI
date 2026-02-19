export interface TripState {
  destination: string | null;
  dates: string | null;
  tripLengthDays: number | null;
  budgetRange: string | null;
  pace: 'relaxed' | 'balanced' | 'packed' | null;
  travelersCount: number | null;
  interests: string[];
  accommodationPreference: string | null;
  departureCity: string | null;
  constraints: string[];
}

export interface ItineraryActivity {
  title: string;
  details: string;
  location: string;
  duration: string;
}

export interface ItineraryDay {
  day: number;
  morning: ItineraryActivity;
  afternoon: ItineraryActivity;
  evening: ItineraryActivity;
  notes: string[];
  mapQuery: string;
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
  type: 'intake' | 'itinerary';
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
}

export function createEmptyTripState(): TripState {
  return {
    destination: null,
    dates: null,
    tripLengthDays: null,
    budgetRange: null,
    pace: null,
    travelersCount: null,
    interests: [],
    accommodationPreference: null,
    departureCity: null,
    constraints: [],
  };
}
