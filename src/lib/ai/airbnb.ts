import type { AirbnbListing } from './types';

const FUNCTION_URL = '/.netlify/functions/getAirbnb';
const REQUEST_TIMEOUT_MS = 90_000;

interface AirbnbSearchParams {
  location: string;
  checkin: string;
  checkout: string;
  budget?: string;
}

function budgetToMaxPerNight(budget?: string, checkin?: string, checkout?: string): number | undefined {
  if (!budget) return undefined;
  const num = parseInt(budget.replace(/[^0-9]/g, ''), 10);
  if (num && num > 0) {
    // Allocate ~40% of total budget to accommodation across actual nights.
    const nights = (() => {
      if (!checkin || !checkout) return 5;
      const start = new Date(`${checkin}T12:00:00`);
      const end = new Date(`${checkout}T12:00:00`);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(1, diff);
    })();
    return Math.round((num * 0.4) / nights);
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
      max_per_night: budgetToMaxPerNight(params.budget, params.checkin, params.checkout),
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
    return ((data.listings || []) as AirbnbListing[]).map((l) => ({
      ...l,
      source: l.source || (l.link?.includes('airbnb') ? 'Airbnb' : l.link?.includes('priceline') ? 'Priceline' : 'Airbnb'),
    }));
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Airbnb search timed out');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
