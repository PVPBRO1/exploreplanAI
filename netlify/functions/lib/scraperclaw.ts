/**
 * Lightweight ScraperClaw client for Netlify functions.
 * Mirrors the server/src/services/scraperclaw.ts logic but tuned for
 * Netlify's shorter execution window.
 */

type ProviderKey = 'airbnb' | 'priceline' | 'skyscanner';

interface ProviderResult {
  provider: ProviderKey;
  status: 'ok' | 'error' | 'timeout';
  results: Record<string, unknown>[];
  error?: string;
  durationMs: number;
}

export interface Verification {
  searchedAt: string;
  providersAttempted: ProviderKey[];
  providersSucceeded: ProviderKey[];
  providerErrors: Record<string, string>;
  counts: Record<string, number>;
  status: 'ok' | 'partial' | 'scrape_failed';
}

export interface NetlifySearchBundle {
  stays: Record<string, unknown>[];
  flights: Record<string, unknown>[];
  verification: Verification;
}

const SCRAPER_NAME_MAP: Record<ProviderKey, string> = {
  airbnb: 'Airbnb Listings',
  priceline: 'Priceline Hotels',
  skyscanner: 'Skyscanner Flights',
};

const STAYS_PATTERN = /airbnb|home|house|rental|villa|cabin|cottage|entire|bnb/i;
const STAYS_ALWAYS_PATTERN = /hotel|hostel|resort|boutique|lodge|motel|inn|accommodation/i;
const CONFIRMATION_PATTERN = /looks good|let'?s go|yes|yep|yeah|confirm|do it|build|go for it|i'?m ready|sounds? (good|great|perfect)|please|absolutely|for sure/i;

const SCRAPERCLAW_URL = process.env.SCRAPERCLAW_URL || 'http://localhost:8000';
const PROVIDER_TIMEOUT_MS = parseInt(process.env.SCRAPERCLAW_PROVIDER_TIMEOUT_MS || '45000', 10);
const POLL_INTERVAL_MS = parseInt(process.env.SCRAPERCLAW_POLL_INTERVAL_MS || '1500', 10);
const BUNDLE_TIMEOUT_MS = parseInt(process.env.SCRAPERCLAW_BUNDLE_TIMEOUT_MS || '45000', 10);

let scraperIdCache: Map<ProviderKey, string> | null = null;

interface TripStateLike {
  destination?: string | null;
  tripLengthDays?: number | null;
  dates?: string | null;
  budgetAmount?: number | null;
  pace?: string | null;
  departureCity?: string | null;
  travelersCount?: number | null;
  accommodationPreference?: string | null;
  startIso?: string | null;
  endIso?: string | null;
}

// ---------------------------------------------------------------------------
// Gating
// ---------------------------------------------------------------------------

export function needsStays(acc: string | null | undefined, destination: string | null | undefined): boolean {
  if (!destination) return false;
  if (!acc) return true;
  return STAYS_PATTERN.test(acc) || STAYS_ALWAYS_PATTERN.test(acc) || acc.length > 0;
}

export function needsFlights(departureCity: string | null | undefined, destination: string | null | undefined): boolean {
  if (!departureCity || !destination) return false;
  return departureCity.toLowerCase().trim() !== destination.toLowerCase().trim();
}

export function isLikelyItineraryPhase(
  tripState: TripStateLike | null,
  lastUserMessage: string,
): boolean {
  if (!tripState) return false;
  const allSet =
    tripState.destination &&
    (tripState.tripLengthDays || tripState.dates) &&
    tripState.budgetAmount &&
    tripState.pace &&
    tripState.departureCity &&
    tripState.travelersCount;
  if (!allSet) return false;
  return CONFIRMATION_PATTERN.test(lastUserMessage);
}

// ---------------------------------------------------------------------------
// Scraper ID discovery
// ---------------------------------------------------------------------------

async function discoverScraperIds(): Promise<Map<ProviderKey, string>> {
  if (scraperIdCache) return scraperIdCache;

  const res = await fetch(`${SCRAPERCLAW_URL}/api/scrapers`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`List scrapers failed: ${res.status}`);

  const scrapers: Array<{ id: string; name: string }> = await res.json() as Array<{ id: string; name: string }>;
  const idMap = new Map<ProviderKey, string>();

  for (const [key, name] of Object.entries(SCRAPER_NAME_MAP)) {
    const match = scrapers.find((s) => s.name === name);
    if (match) idMap.set(key as ProviderKey, match.id);
  }

  scraperIdCache = idMap;
  return idMap;
}

// ---------------------------------------------------------------------------
// Single provider run (POST -> poll -> results)
// ---------------------------------------------------------------------------

async function runProvider(
  providerKey: ProviderKey,
  params: Record<string, unknown>,
  requestId: string,
): Promise<ProviderResult> {
  const start = Date.now();
  const tag = `[scraperclaw:${providerKey}:${requestId}]`;

  try {
    const ids = await discoverScraperIds();
    const scraperId = ids.get(providerKey);
    if (!scraperId) {
      return { provider: providerKey, status: 'error', results: [], error: `Scraper not found`, durationMs: Date.now() - start };
    }

    console.log(`${tag} starting`, params);

    const runRes = await fetch(`${SCRAPERCLAW_URL}/api/scrapers/${scraperId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!runRes.ok) {
      const errText = await runRes.text().catch(() => '');
      throw new Error(`Start failed: ${runRes.status} ${errText}`);
    }

    const { run_id: runId } = await runRes.json() as { run_id: string };
    const deadline = start + PROVIDER_TIMEOUT_MS;

    let runStatus = 'running';
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const statusRes = await fetch(`${SCRAPERCLAW_URL}/api/runs/${runId}`, {
        signal: AbortSignal.timeout(10_000),
      });
      if (!statusRes.ok) continue;
      const data = await statusRes.json() as { status: string };
      runStatus = data.status;
      if (runStatus === 'success' || runStatus === 'failed') break;
    }

    if (runStatus !== 'success') {
      const status = runStatus === 'failed' ? 'error' : 'timeout';
      return { provider: providerKey, status, results: [], error: `Run ${runStatus}`, durationMs: Date.now() - start };
    }

    const resultsRes = await fetch(`${SCRAPERCLAW_URL}/api/runs/${runId}/results`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!resultsRes.ok) throw new Error(`Fetch results failed: ${resultsRes.status}`);

    const { results } = await resultsRes.json() as { results: Record<string, unknown>[] };
    const duration = Date.now() - start;
    console.log(`${tag} done: ${results.length} results in ${duration}ms`);

    return { provider: providerKey, status: 'ok', results: results ?? [], durationMs: duration };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[scraperclaw:${providerKey}:${requestId}] failed: ${msg}`);
    return { provider: providerKey, status: 'error', results: [], error: msg, durationMs: Date.now() - start };
  }
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export async function gatherSearchBundle(
  tripState: TripStateLike,
  requestId: string,
): Promise<NetlifySearchBundle> {
  const searchedAt = new Date().toISOString();

  const wantStays = needsStays(tripState.accommodationPreference, tripState.destination);
  const wantFlights = needsFlights(tripState.departureCity, tripState.destination);

  const providers: ProviderKey[] = [];
  if (wantStays) providers.push('priceline', 'airbnb');
  if (wantFlights) providers.push('skyscanner');

  console.log(`[scraperclaw:${requestId}] gating: stays=${wantStays}, flights=${wantFlights}, providers=[${providers}]`);

  if (providers.length === 0) {
    return emptyBundle(searchedAt);
  }

  const checkin = tripState.startIso || fallbackDate(14);
  const days = tripState.tripLengthDays || 5;
  const checkout = tripState.endIso || addDays(checkin, days);
  const budget = tripState.budgetAmount;
  const travelers = tripState.travelersCount || 1;

  const paramsByProvider: Record<ProviderKey, Record<string, unknown>> = {
    airbnb: {
      location: tripState.destination,
      checkin,
      checkout,
      max_per_night: budget ? Math.round((budget * 0.4) / Math.max(days, 1)) : undefined,
      max_results: 8,
    },
    priceline: {
      city: tripState.destination,
      checkin,
      checkout,
      rooms: 1,
      adults: travelers,
      max_results: 8,
    },
    skyscanner: {
      origin: tripState.departureCity,
      destination: tripState.destination,
      departure_date: checkin,
      return_date: checkout,
      adults: travelers,
      max_results: 6,
    },
  };

  const completedResults: ProviderResult[] = [];
  let bundleTimedOut = false;

  const providerPromises = providers.map(async (key) => {
    const result = await runProvider(key, paramsByProvider[key], requestId);
    completedResults.push(result);
    return result;
  });

  const bundleTimeout = new Promise<void>((resolve) =>
    setTimeout(() => {
      bundleTimedOut = true;
      console.warn(`[scraperclaw:${requestId}] bundle timed out after ${BUNDLE_TIMEOUT_MS}ms, using ${completedResults.length}/${providers.length} completed results`);
      resolve();
    }, BUNDLE_TIMEOUT_MS),
  );

  await Promise.race([
    Promise.allSettled(providerPromises),
    bundleTimeout,
  ]);

  const results = bundleTimedOut ? [...completedResults] : completedResults;

  const stays: Record<string, unknown>[] = [];
  const flights: Record<string, unknown>[] = [];
  for (const r of results) {
    if (r.provider === 'airbnb' || r.provider === 'priceline') stays.push(...r.results);
    else if (r.provider === 'skyscanner') flights.push(...r.results);
  }

  const succeeded = results.filter((r) => r.status === 'ok').map((r) => r.provider);
  const errors: Record<string, string> = {};
  const counts: Record<string, number> = {};
  for (const r of results) {
    counts[r.provider] = r.results.length;
    if (r.status !== 'ok' && r.error) errors[r.provider] = r.error;
  }

  let status: Verification['status'] = 'ok';
  if (succeeded.length === 0) status = 'scrape_failed';
  else if (bundleTimedOut || succeeded.length < providers.length) status = 'partial';

  console.log(`[scraperclaw:${requestId}] done: status=${status}, stays=${stays.length}, flights=${flights.length}`);

  return {
    stays,
    flights,
    verification: { searchedAt, providersAttempted: providers, providersSucceeded: succeeded, providerErrors: errors, counts, status },
  };
}

// ---------------------------------------------------------------------------
// Prompt section builder
// ---------------------------------------------------------------------------

export function formatSearchResultsForPrompt(bundle: NetlifySearchBundle): string | null {
  const parts: string[] = [];

  if (bundle.stays.length > 0) {
    parts.push('### Stays (from Airbnb + Priceline)');
    for (const s of bundle.stays.slice(0, 12)) {
      const name = s.title ?? s.hotel_name ?? s.name ?? 'Unnamed';
      const price = s.price_per_night ?? s.pricePerNight ?? '';
      const total = s.total_price ?? s.totalPrice ?? '';
      const rating = s.rating ?? '';
      const source = s.source ?? (s.hotel_url ? 'Priceline' : 'Airbnb');
      const link = s.link ?? s.hotel_url ?? s.bookingUrl ?? '';
      let line = `- "${name}"`;
      if (price) line += ` — $${price}/night`;
      if (total) line += ` ($${total} total)`;
      if (rating) line += ` — ${rating} stars`;
      line += ` — ${source}`;
      if (link) line += ` — ${link}`;
      parts.push(line);
    }
  }

  if (bundle.flights.length > 0) {
    parts.push('### Flights (from Skyscanner / Google Flights)');
    for (const f of bundle.flights.slice(0, 8)) {
      const airline = f.airline ?? 'Unknown';
      const dep = f.departure_time ?? '';
      const arr = f.arrival_time ?? '';
      const dur = f.duration ?? '';
      const stops = Number(f.stops ?? 0);
      const price = f.price_total ?? f.price_per_person ?? '';
      const link = f.booking_url ?? '';
      let line = `- ${airline}`;
      if (dep && arr) line += ` ${dep}→${arr}`;
      if (dur) line += ` (${dur})`;
      line += stops === 0 ? ' nonstop' : ` ${stops} stop${stops > 1 ? 's' : ''}`;
      if (price) line += ` — $${price}`;
      if (link) line += ` — ${link}`;
      parts.push(line);
    }
  }

  if (parts.length === 0) return null;

  return [
    '\n[SEARCH RESULTS]',
    'The following are REAL listings from live scraping. You MUST reference these by name and price.',
    'Do NOT invent alternative property names or prices. If a category has no results,',
    'say "Check [provider] for current availability" instead of fabricating options.',
    '',
    ...parts,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyBundle(searchedAt: string): NetlifySearchBundle {
  return {
    stays: [],
    flights: [],
    verification: {
      searchedAt,
      providersAttempted: [],
      providersSucceeded: [],
      providerErrors: {},
      counts: {},
      status: 'ok',
    },
  };
}

function fallbackDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function addDays(ymd: string, days: number): string {
  const parts = ymd.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
