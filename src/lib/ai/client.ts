import type { TripPlanInputs, Itinerary } from './types';

const API_ENDPOINT = import.meta.env.VITE_AI_API_URL || '/api/generate-itinerary';

const REQUEST_TIMEOUT_MS = 30_000;

interface GenerateRequest {
  tripInputs: TripPlanInputs;
}

interface GenerateResponse {
  itinerary: Itinerary;
}

export async function generateItinerary(
  tripInputs: TripPlanInputs
): Promise<Itinerary> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripInputs } satisfies GenerateRequest),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      throw new Error(
        `Server error (${res.status}): ${errorBody || res.statusText}`
      );
    }

    const data: GenerateResponse = await res.json();
    return data.itinerary;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        'Request timed out. The server took too long to respond. Please try again.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
