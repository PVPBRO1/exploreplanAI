import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { NormalizedTripInputs } from '../types.js';

// We import the functions under test. The module reads config at import time,
// so we mock the config and then dynamically import the module.
vi.mock('../config.js', () => ({
  config: {
    scraperclaw: {
      url: 'http://mock-scraperclaw:8000',
      providerTimeoutMs: 5_000,
      pollIntervalMs: 100,
      maxRetries: 1,
    },
  },
}));

const { needsStays, needsFlights, gatherSearchBundle, clearScraperIdCache } =
  await import('../services/scraperclaw.js');

function makeInputs(overrides: Partial<NormalizedTripInputs> = {}): NormalizedTripInputs {
  return {
    destination: 'Paris',
    dates: '',
    tripLength: 5,
    budget: '2000',
    travelers: 2,
    pace: 'balanced',
    interests: ['food', 'art'],
    accommodation: 'Hotel',
    origin: undefined,
    currency: undefined,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Gating logic
// ---------------------------------------------------------------------------

describe('needsStays', () => {
  it('returns true for Airbnb accommodation', () => {
    expect(needsStays(makeInputs({ accommodation: 'Airbnb' }))).toBe(true);
  });

  it('returns true for home/house/villa/cabin keywords', () => {
    for (const acc of ['home', 'house', 'villa', 'cabin', 'cottage', 'rental', 'entire place']) {
      expect(needsStays(makeInputs({ accommodation: acc }))).toBe(true);
    }
  });

  it('returns true for hotel/hostel/resort', () => {
    for (const acc of ['Hotel', 'Hostel', 'Resort', 'Boutique']) {
      expect(needsStays(makeInputs({ accommodation: acc }))).toBe(true);
    }
  });

  it('returns true for any non-empty accommodation', () => {
    expect(needsStays(makeInputs({ accommodation: 'whatever' }))).toBe(true);
  });

  it('returns true for empty accommodation when destination is set', () => {
    expect(needsStays(makeInputs({ accommodation: '' }))).toBe(true);
  });

  it('returns false when no destination', () => {
    expect(needsStays(makeInputs({ accommodation: '', destination: '' }))).toBe(false);
  });
});

describe('needsFlights', () => {
  it('returns true when origin differs from destination', () => {
    expect(needsFlights(makeInputs({ origin: 'New York', destination: 'Paris' }))).toBe(true);
  });

  it('returns false when no origin is set', () => {
    expect(needsFlights(makeInputs({ origin: undefined }))).toBe(false);
  });

  it('returns false when origin matches destination', () => {
    expect(needsFlights(makeInputs({ origin: 'paris', destination: 'Paris' }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// gatherSearchBundle with mocked fetch
// ---------------------------------------------------------------------------

describe('gatherSearchBundle', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    clearScraperIdCache();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetchResponses(responses: Record<string, unknown>) {
    const callLog: string[] = [];
    globalThis.fetch = vi.fn(async (input: string | URL | Request, _init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      callLog.push(url);

      // Fetch results — must come before poll check
      if (/\/api\/runs\/[^/]+\/results$/.test(url)) {
        const parts = url.split('/');
        const runId = parts[parts.length - 2];
        const results = (responses as Record<string, Record<string, unknown>>)[runId]?.results ?? [];
        return new Response(JSON.stringify({ results }), { status: 200 });
      }

      // Poll status — /api/runs/{runId} (no trailing segments)
      if (/\/api\/runs\/[^/]+$/.test(url) && !url.includes('/api/scrapers')) {
        const runId = url.split('/').pop()!;
        const providerStatus = (responses as Record<string, Record<string, unknown>>)[runId]?.status ?? 'success';
        return new Response(JSON.stringify({ status: providerStatus }), { status: 200 });
      }

      // Start run — /api/scrapers/{id}/run
      if (/\/api\/scrapers\/[^/]+\/run$/.test(url)) {
        const provider = url.includes('uuid-airbnb') ? 'airbnb'
          : url.includes('uuid-priceline') ? 'priceline'
          : 'skyscanner';
        return new Response(JSON.stringify({
          run_id: `run-${provider}`,
          status: 'running',
        }), { status: 200 });
      }

      // List scrapers — /api/scrapers (no trailing segments)
      if (/\/api\/scrapers\/?$/.test(url)) {
        return new Response(JSON.stringify([
          { id: 'uuid-airbnb', name: 'Airbnb Listings' },
          { id: 'uuid-priceline', name: 'Priceline Hotels' },
          { id: 'uuid-skyscanner', name: 'Skyscanner Flights' },
        ]), { status: 200 });
      }

      return new Response('not found', { status: 404 });
    }) as typeof fetch;

    return callLog;
  }

  it('calls airbnb + priceline when accommodation is set, skips flights without origin', async () => {
    const callLog = mockFetchResponses({
      'run-airbnb': { status: 'success', results: [{ title: 'Cozy Loft', price_per_night: 100 }] },
      'run-priceline': { status: 'success', results: [{ hotel_name: 'Grand Hotel', price_per_night: 150 }] },
    });

    const bundle = await gatherSearchBundle(makeInputs({ accommodation: 'Hotel' }), 'test-1');

    expect(bundle.stays).toHaveLength(2);
    expect(bundle.flights).toHaveLength(0);
    expect(bundle.verification.status).toBe('ok');
    expect(bundle.verification.providersAttempted).toEqual(['airbnb', 'priceline']);
    expect(bundle.verification.providersSucceeded).toEqual(['airbnb', 'priceline']);

    const runCalls = callLog.filter((u) => u.includes('/run'));
    expect(runCalls.some((u) => u.includes('uuid-airbnb'))).toBe(true);
    expect(runCalls.some((u) => u.includes('uuid-priceline'))).toBe(true);
    expect(runCalls.some((u) => u.includes('uuid-skyscanner'))).toBe(false);
  });

  it('calls skyscanner when origin is set', async () => {
    mockFetchResponses({
      'run-airbnb': { status: 'success', results: [] },
      'run-priceline': { status: 'success', results: [] },
      'run-skyscanner': { status: 'success', results: [{ airline: 'Delta', price_total: 500 }] },
    });

    const bundle = await gatherSearchBundle(
      makeInputs({ accommodation: 'Airbnb', origin: 'New York' }),
      'test-2',
    );

    expect(bundle.flights).toHaveLength(1);
    expect(bundle.verification.providersAttempted).toContain('skyscanner');
    expect(bundle.verification.providersSucceeded).toContain('skyscanner');
  });

  it('returns partial status when one provider fails', async () => {
    mockFetchResponses({
      'run-airbnb': { status: 'failed', results: [] },
      'run-priceline': { status: 'success', results: [{ hotel_name: 'Good Hotel' }] },
    });

    const bundle = await gatherSearchBundle(makeInputs({ accommodation: 'Hotel' }), 'test-3');

    expect(bundle.verification.status).toBe('partial');
    expect(bundle.verification.providersSucceeded).toEqual(['priceline']);
    expect(bundle.verification.providerErrors).toHaveProperty('airbnb');
    expect(bundle.stays).toHaveLength(1);
  });

  it('returns scrape_failed when all providers fail', async () => {
    mockFetchResponses({
      'run-airbnb': { status: 'failed', results: [] },
      'run-priceline': { status: 'failed', results: [] },
    });

    const bundle = await gatherSearchBundle(makeInputs({ accommodation: 'Hotel' }), 'test-4');

    expect(bundle.verification.status).toBe('scrape_failed');
    expect(bundle.verification.providersSucceeded).toEqual([]);
    expect(bundle.stays).toHaveLength(0);
  });

  it('returns empty bundle when nothing is needed', async () => {
    mockFetchResponses({});

    const bundle = await gatherSearchBundle(
      makeInputs({ accommodation: '', origin: undefined }),
      'test-5',
    );

    expect(bundle.stays).toHaveLength(0);
    expect(bundle.flights).toHaveLength(0);
    expect(bundle.verification.status).toBe('ok');
    expect(bundle.verification.providersAttempted).toEqual([]);
  });

  it('includes verification counts per provider', async () => {
    mockFetchResponses({
      'run-airbnb': { status: 'success', results: [{ title: 'A' }, { title: 'B' }] },
      'run-priceline': { status: 'success', results: [{ hotel_name: 'C' }] },
      'run-skyscanner': { status: 'success', results: [{ airline: 'X' }, { airline: 'Y' }, { airline: 'Z' }] },
    });

    const bundle = await gatherSearchBundle(
      makeInputs({ accommodation: 'Hotel', origin: 'NYC' }),
      'test-6',
    );

    expect(bundle.verification.counts).toEqual({
      airbnb: 2,
      priceline: 1,
      skyscanner: 3,
    });
  });
});
