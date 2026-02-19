import type { FlightEstimate } from './types';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchFlightEstimates(params: {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  adults?: number;
  children?: number;
}): Promise<FlightEstimate[]> {
  try {
    const url = API_URL
      ? `${API_URL}/getFlights`
      : '/.netlify/functions/getFlights';

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: params.origin,
        destination: params.destination,
        departure_date: params.departure_date,
        return_date: params.return_date || params.departure_date,
        adults: params.adults || 1,
        children: params.children || 0,
        max_results: 5,
      }),
    });

    if (!res.ok) {
      console.warn('[flights] API returned', res.status);
      return [];
    }

    const data = await res.json();
    return data.flights || [];
  } catch (e) {
    console.warn('[flights] Fetch failed:', e);
    return [];
  }
}
