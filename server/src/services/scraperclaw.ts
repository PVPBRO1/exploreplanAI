import { config } from '../config.js';
import type {
  NormalizedTripInputs,
  ProviderKey,
  ProviderResult,
  Verification,
  ScraperSearchBundle,
} from '../types.js';

const STAYS_PATTERN = /airbnb|home|house|rental|villa|cabin|cottage|entire|bnb/i;
const STAYS_ALWAYS_PATTERN = /hotel|hostel|resort|boutique|lodge|motel|inn|accommodation/i;

const SCRAPER_NAME_MAP: Record<ProviderKey, string> = {
  airbnb: 'Airbnb Listings',
  priceline: 'Priceline Hotels',
  skyscanner: 'Skyscanner Flights',
};

let scraperIdCache: Map<ProviderKey, string> | null = null;

// ---------------------------------------------------------------------------
// Gating (deterministic, server-side)
// ---------------------------------------------------------------------------

export function needsStays(inputs: NormalizedTripInputs): boolean {
  const acc = inputs.accommodation;
  if (!acc) return !!inputs.destination;
  return STAYS_PATTERN.test(acc) || STAYS_ALWAYS_PATTERN.test(acc) || acc.length > 0;
}

export function needsFlights(inputs: NormalizedTripInputs): boolean {
  const origin = inputs.origin;
  if (!origin) return false;
  return origin.toLowerCase().trim() !== inputs.destination.toLowerCase().trim();
}

// ---------------------------------------------------------------------------
// Scraper ID discovery (cached for process lifetime)
// ---------------------------------------------------------------------------

export async function discoverScraperIds(): Promise<Map<ProviderKey, string>> {
  if (scraperIdCache) return scraperIdCache;

  const url = `${config.scraperclaw.url}/api/scrapers`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) {
    throw new Error(`[scraperclaw] Failed to list scrapers: ${res.status}`);
  }

  const scrapers: Array<{ id: string; name: string }> = await res.json() as Array<{ id: string; name: string }>;
  const idMap = new Map<ProviderKey, string>();

  for (const [key, name] of Object.entries(SCRAPER_NAME_MAP)) {
    const match = scrapers.find((s) => s.name === name);
    if (match) {
      idMap.set(key as ProviderKey, match.id);
    }
  }

  scraperIdCache = idMap;
  return idMap;
}

export function clearScraperIdCache(): void {
  scraperIdCache = null;
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

  const attempt = async (retryNum: number): Promise<ProviderResult> => {
    try {
      const ids = await discoverScraperIds();
      const scraperId = ids.get(providerKey);
      if (!scraperId) {
        return {
          provider: providerKey,
          status: 'error',
          results: [],
          error: `Scraper "${SCRAPER_NAME_MAP[providerKey]}" not found in ScraperClaw`,
          durationMs: Date.now() - start,
        };
      }

      console.log(`${tag} starting run (attempt ${retryNum + 1})`, params);

      // Step 1: Start the run
      const runRes = await fetch(
        `${config.scraperclaw.url}/api/scrapers/${scraperId}/run`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ params }),
          signal: AbortSignal.timeout(15_000),
        },
      );

      if (!runRes.ok) {
        const errText = await runRes.text().catch(() => '');
        throw new Error(`Start run failed: ${runRes.status} ${errText}`);
      }

      const runData = await runRes.json() as { run_id: string };
      const runId = runData.run_id;
      console.log(`${tag} run started: ${runId}`);

      // Step 2: Poll for completion
      const deadline = start + config.scraperclaw.providerTimeoutMs;
      let runStatus = 'running';

      while (Date.now() < deadline) {
        await sleep(config.scraperclaw.pollIntervalMs);

        const statusRes = await fetch(
          `${config.scraperclaw.url}/api/runs/${runId}`,
          { signal: AbortSignal.timeout(10_000) },
        );

        if (!statusRes.ok) {
          console.warn(`${tag} poll failed: ${statusRes.status}`);
          continue;
        }

        const statusData = await statusRes.json() as { status: string; error?: string };
        runStatus = statusData.status;

        if (runStatus === 'success' || runStatus === 'failed') {
          break;
        }
      }

      if (runStatus !== 'success' && runStatus !== 'failed') {
        return {
          provider: providerKey,
          status: 'timeout',
          results: [],
          error: `Timed out after ${config.scraperclaw.providerTimeoutMs}ms`,
          durationMs: Date.now() - start,
        };
      }

      if (runStatus === 'failed') {
        return {
          provider: providerKey,
          status: 'error',
          results: [],
          error: 'Scraper run failed',
          durationMs: Date.now() - start,
        };
      }

      // Step 3: Fetch results
      const resultsRes = await fetch(
        `${config.scraperclaw.url}/api/runs/${runId}/results`,
        { signal: AbortSignal.timeout(10_000) },
      );

      if (!resultsRes.ok) {
        throw new Error(`Fetch results failed: ${resultsRes.status}`);
      }

      const resultsData = await resultsRes.json() as { results: Record<string, unknown>[] };
      const results = resultsData.results ?? [];
      const duration = Date.now() - start;

      console.log(`${tag} completed: ${results.length} results in ${duration}ms`);

      return {
        provider: providerKey,
        status: 'ok',
        results,
        durationMs: duration,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const duration = Date.now() - start;

      if (retryNum < config.scraperclaw.maxRetries) {
        console.warn(`${tag} attempt ${retryNum + 1} failed (${msg}), retrying...`);
        return attempt(retryNum + 1);
      }

      console.error(`${tag} failed after ${retryNum + 1} attempts: ${msg} (${duration}ms)`);
      return {
        provider: providerKey,
        status: 'error',
        results: [],
        error: msg,
        durationMs: duration,
      };
    }
  };

  return attempt(0);
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

function buildProviderParams(
  inputs: NormalizedTripInputs,
  provider: ProviderKey,
): Record<string, unknown> {
  const checkin = inputs.dates || fallbackCheckin();
  const checkout = inputs.dates ? '' : fallbackCheckout(inputs.tripLength);
  const checkoutDate = checkout || addDays(checkin, inputs.tripLength);

  switch (provider) {
    case 'airbnb':
      return {
        location: inputs.destination,
        checkin,
        checkout: checkoutDate,
        max_per_night: budgetToMaxPerNight(inputs.budget, inputs.tripLength),
        max_results: 8,
      };
    case 'priceline':
      return {
        city: inputs.destination,
        checkin,
        checkout: checkoutDate,
        rooms: 1,
        adults: inputs.travelers,
        max_results: 8,
      };
    case 'skyscanner':
      return {
        origin: inputs.origin ?? '',
        destination: inputs.destination,
        departure_date: checkin,
        return_date: checkoutDate,
        adults: inputs.travelers,
        max_results: 6,
      };
  }
}

export async function gatherSearchBundle(
  inputs: NormalizedTripInputs,
  requestId: string,
): Promise<ScraperSearchBundle> {
  const searchedAt = new Date().toISOString();
  const wantStays = needsStays(inputs);
  const wantFlights = needsFlights(inputs);

  const providers: ProviderKey[] = [];
  if (wantStays) {
    providers.push('airbnb', 'priceline');
  }
  if (wantFlights) {
    providers.push('skyscanner');
  }

  console.log(`[scraperclaw:${requestId}] gating: needsStays=${wantStays}, needsFlights=${wantFlights}, providers=[${providers.join(',')}]`);

  if (providers.length === 0) {
    return emptyBundle(searchedAt);
  }

  const tasks = providers.map((key) =>
    runProvider(key, buildProviderParams(inputs, key), requestId),
  );

  const settled = await Promise.allSettled(tasks);

  const results: ProviderResult[] = settled.map((s, i) => {
    if (s.status === 'fulfilled') return s.value;
    return {
      provider: providers[i],
      status: 'error' as const,
      results: [],
      error: s.reason instanceof Error ? s.reason.message : String(s.reason),
      durationMs: 0,
    };
  });

  const stays: Record<string, unknown>[] = [];
  const flights: Record<string, unknown>[] = [];

  for (const r of results) {
    if (r.provider === 'airbnb' || r.provider === 'priceline') {
      stays.push(...r.results);
    } else if (r.provider === 'skyscanner') {
      flights.push(...r.results);
    }
  }

  const succeeded = results.filter((r) => r.status === 'ok').map((r) => r.provider);
  const errors: Record<string, string> = {};
  for (const r of results) {
    if (r.status !== 'ok' && r.error) {
      errors[r.provider] = r.error;
    }
  }

  const counts: Record<string, number> = {};
  for (const r of results) {
    counts[r.provider] = r.results.length;
  }

  let status: Verification['status'] = 'ok';
  if (succeeded.length === 0) status = 'scrape_failed';
  else if (succeeded.length < providers.length) status = 'partial';

  const verification: Verification = {
    searchedAt,
    providersAttempted: providers,
    providersSucceeded: succeeded,
    providerErrors: errors,
    counts,
    status,
  };

  console.log(`[scraperclaw:${requestId}] done: status=${status}, stays=${stays.length}, flights=${flights.length}`);

  return { stays, flights, providers: results, verification };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyBundle(searchedAt: string): ScraperSearchBundle {
  return {
    stays: [],
    flights: [],
    providers: [],
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fallbackCheckin(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return toYmd(d);
}

function fallbackCheckout(tripLength: number): string {
  const d = new Date();
  d.setDate(d.getDate() + 14 + tripLength);
  return toYmd(d);
}

function addDays(ymd: string, days: number): string {
  const parts = ymd.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + days);
  return toYmd(d);
}

function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function budgetToMaxPerNight(budget: string, tripLength: number): number | undefined {
  const num = parseInt(budget.replace(/[^0-9]/g, ''), 10);
  if (num && num > 0) {
    const nights = Math.max(tripLength, 1);
    return Math.round((num * 0.4) / nights);
  }
  const b = budget.toLowerCase();
  if (b === 'budget' || b === 'cheap') return 80;
  if (b === 'moderate' || b === 'mid-range') return 200;
  return undefined;
}
