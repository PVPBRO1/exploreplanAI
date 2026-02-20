/**
 * Shared ScraperClaw run helper for Netlify proxy functions.
 * Handles the 3-step async pattern: discover ID -> start run -> poll -> fetch results.
 */

const SCRAPERCLAW_URL = process.env.SCRAPERCLAW_URL || 'http://localhost:8000';
const TIMEOUT_MS = parseInt(process.env.SCRAPERCLAW_PROVIDER_TIMEOUT_MS || '90000', 10);
const POLL_MS = parseInt(process.env.SCRAPERCLAW_POLL_INTERVAL_MS || '2000', 10);

let nameToIdCache: Map<string, string> | null = null;

async function resolveScraperId(scraperName: string): Promise<string> {
  if (nameToIdCache?.has(scraperName)) {
    return nameToIdCache.get(scraperName)!;
  }

  const res = await fetch(`${SCRAPERCLAW_URL}/api/scrapers`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Failed to list scrapers: ${res.status}`);

  const scrapers = (await res.json()) as Array<{ id: string; name: string }>;
  nameToIdCache = new Map(scrapers.map((s) => [s.name, s.id]));

  const id = nameToIdCache.get(scraperName);
  if (!id) throw new Error(`Scraper "${scraperName}" not found in ScraperClaw`);
  return id;
}

export async function runScraperByName(
  scraperName: string,
  params: Record<string, unknown>,
): Promise<{ results: Record<string, unknown>[]; error?: string }> {
  const start = Date.now();
  const scraperId = await resolveScraperId(scraperName);

  // Step 1: Start the run
  const runRes = await fetch(`${SCRAPERCLAW_URL}/api/scrapers/${scraperId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ params }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!runRes.ok) {
    const errText = await runRes.text().catch(() => '');
    return { results: [], error: `Start run failed: ${runRes.status} ${errText}` };
  }

  const { run_id: runId } = (await runRes.json()) as { run_id: string };

  // Step 2: Poll until done
  const deadline = start + TIMEOUT_MS;
  let status = 'running';

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_MS));

    const statusRes = await fetch(`${SCRAPERCLAW_URL}/api/runs/${runId}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!statusRes.ok) continue;

    const data = (await statusRes.json()) as { status: string };
    status = data.status;
    if (status === 'success' || status === 'failed') break;
  }

  if (status === 'failed') {
    return { results: [], error: 'Scraper run failed' };
  }

  if (status !== 'success') {
    return { results: [], error: `Timed out after ${TIMEOUT_MS}ms` };
  }

  // Step 3: Fetch results
  const resultsRes = await fetch(`${SCRAPERCLAW_URL}/api/runs/${runId}/results`, {
    signal: AbortSignal.timeout(10_000),
  });

  if (!resultsRes.ok) {
    return { results: [], error: `Fetch results failed: ${resultsRes.status}` };
  }

  const { results } = (await resultsRes.json()) as { results: Record<string, unknown>[] };
  console.log(`[scraperclaw-run] ${scraperName}: ${(results ?? []).length} results in ${Date.now() - start}ms`);

  return { results: results ?? [] };
}
