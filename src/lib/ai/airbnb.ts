import type { AirbnbListing } from './types';

const FUNCTION_URL = '/.netlify/functions/getAirbnb';
const REQUEST_TIMEOUT_MS = 90_000;

interface AirbnbSearchParams {
  location: string;
  checkin: string;
  checkout: string;
  budget?: string;
}

function budgetToMaxPerNight(budget?: string): number | undefined {
  if (!budget) return undefined;
  const num = parseInt(budget.replace(/[^0-9]/g, ''), 10);
  if (num && num > 0) {
    // Rough heuristic: allocate ~40% of total budget to accommodation,
    // spread across ~5 nights as a default ceiling
    return Math.round((num * 0.4) / 5);
  }
  const b = budget.toLowerCase();
  if (b === 'budget') return 80;
  if (b === 'moderate') return 200;
  if (b === 'luxury') return undefined;
  return undefined;
}

export async function fetchAirbnbListings(params: AirbnbSearchParams): Promise<AirbnbListing[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const body = {
      location: params.location,
      checkin: params.checkin,
      checkout: params.checkout,
      max_per_night: budgetToMaxPerNight(params.budget),
      max_results: 4,
    };

    if (import.meta.env.DEV) {
      console.log('[Vincent] Fetching Airbnb listings:', body);
    }

    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      throw new Error(`Airbnb search failed (${res.status}): ${errorBody || res.statusText}`);
    }

    const data = await res.json();
    return (data.listings || []) as AirbnbListing[];
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Airbnb search timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
