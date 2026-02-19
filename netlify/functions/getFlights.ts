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

  const scraperUrl = process.env.SCRAPERCLAW_URL || 'http://localhost:8000';

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

    console.log('[getFlights] Calling scraperclaw:', { scraperUrl, params });

    const res = await fetch(`${scraperUrl}/api/scrapers/skyscanner/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[getFlights] Scraper error:', res.status, errText);
      return {
        statusCode: 502,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Flight scraper service error', details: errText }),
      };
    }

    const data = await res.json();
    const flights = data.results || data.data || [];

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ flights }),
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
