import { runScraperByName } from './lib/scraperclaw-run';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler = async (event: { httpMethod: string; body: string | null }) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const {
      origin,
      destination,
      departure_date,
      return_date,
      adults = 1,
      children = 0,
      max_results = 5,
    } = JSON.parse(event.body || '{}');

    if (!origin || !destination || !departure_date) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields: origin, destination, departure_date' }),
      };
    }

    const params: Record<string, string | number> = {
      origin,
      destination,
      departure_date,
      return_date: return_date || departure_date,
      adults,
      children,
      max_results,
    };

    console.log('[getFlights] Calling scraperclaw:', params);

    const { results, error } = await runScraperByName('Skyscanner Flights', params);

    if (error) {
      console.error('[getFlights] Scraper error:', error);
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Flight scraper service error', details: error }),
      };
    }

    console.log('[getFlights] Raw results sample:', JSON.stringify(results.slice(0, 2)));

    const normalized = results.map((r) => {
      const raw = r as Record<string, unknown>;
      let priceTotal = Number(raw.price_total ?? raw.price ?? raw.amount ?? 0);
      let pricePerPerson = Number(raw.price_per_person ?? priceTotal);

      // Strip dollar signs/commas from string prices
      if (typeof raw.price_total === 'string') {
        priceTotal = Number(String(raw.price_total).replace(/[^0-9.]/g, '')) || 0;
      }
      if (typeof raw.price_per_person === 'string') {
        pricePerPerson = Number(String(raw.price_per_person).replace(/[^0-9.]/g, '')) || 0;
      }
      if (typeof raw.price === 'string') {
        const parsed = Number(String(raw.price).replace(/[^0-9.]/g, '')) || 0;
        if (!priceTotal) priceTotal = parsed;
        if (!pricePerPerson) pricePerPerson = parsed;
      }

      // If per-person price is given but total is not, multiply by adults
      if (pricePerPerson > 0 && priceTotal <= pricePerPerson) {
        priceTotal = pricePerPerson * adults;
      }

      return {
        airline: raw.airline ?? raw.carrier ?? 'Unknown',
        departure_time: raw.departure_time ?? raw.depart_time ?? '',
        arrival_time: raw.arrival_time ?? raw.arrive_time ?? '',
        duration: raw.duration ?? raw.flight_duration ?? '',
        stops: Number(raw.stops ?? raw.num_stops ?? 0),
        price_total: priceTotal,
        price_per_person: pricePerPerson,
        booking_url: raw.booking_url ?? raw.url ?? raw.link ?? '',
        departure_airport: raw.departure_airport ?? raw.origin_airport ?? origin,
        arrival_airport: raw.arrival_airport ?? raw.destination_airport ?? destination,
      };
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ flights: normalized }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[getFlights] Error:', message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to fetch flight estimates', details: message }),
    };
  }
};
