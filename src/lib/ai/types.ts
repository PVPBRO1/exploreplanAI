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

export interface ChatMessage {
  id: number;
  role: 'ai' | 'user';
  text: string;
  itinerary?: Itinerary;
}

export type PlannerField = keyof TripPlanInputs;

export function createEmptyTripInputs(): TripPlanInputs {
  return {
    destination: '',
    dates: '',
    tripLength: undefined,
    budget: '',
    travelers: undefined,
    pace: '',
    interests: [],
    accommodation: '',
  };
}
