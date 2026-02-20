import type { APIResponse, TripState } from './types';

const FUNCTION_URL = '/.netlify/functions/planTrip';
const REQUEST_TIMEOUT_MS = 180_000;

interface PlanTripRequest {
  messages: { role: string; content: string }[];
  tripState: TripState | null;
  language: string;
  intent?: string;
}

export async function callPlanTrip(request: PlanTripRequest): Promise<APIResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  if (import.meta.env.DEV) {
    console.log('[ExplorePlan] Calling planTrip:', {
      messageCount: request.messages.length,
      language: request.language,
      tripState: request.tripState,
    });
  }

  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      throw new Error(`Server error (${res.status}): ${errorBody || res.statusText}`);
    }

    const data: APIResponse = await res.json();

    if (import.meta.env.DEV) {
      console.log('[ExplorePlan] Response:', {
        type: data.type,
        hasItinerary: !!data.itinerary,
        nextQuestion: data.nextQuestion?.key,
      });
    }

    return data;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out. The server took too long to respond. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
