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
    const { location, checkin, checkout, max_per_night, max_results = 4 } = JSON.parse(event.body || '{}');

    if (!location || !checkin || !checkout) {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Missing required fields: location, checkin, checkout' }) };
    }

    const params: Record<string, string | number> = { location, checkin, checkout, max_results };
    if (max_per_night) params.max_per_night = max_per_night;

    console.log('[getAirbnb] Calling scraperclaw:', params);

    const { results, error } = await runScraperByName('Airbnb Listings', params);

    if (error) {
      console.error('[getAirbnb] Scraper error:', error);
      return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: 'Scraper service error', details: error }) };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ listings: results }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[getAirbnb] Error:', message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to fetch Airbnb listings', details: message }),
    };
  }
};
