import type { Handler } from '@netlify/functions';
import {
  getCachedImage,
  getCachedImages,
  cacheImage,
  cacheImages,
  ensureBucket,
} from './lib/supabase-cache';

interface PexelsPhoto {
  src: {
    original: string;
    large2x: string;
    large: string;
    landscape: string;
  };
  width: number;
  height: number;
  alt: string;
}

interface PexelsResponse {
  photos?: PexelsPhoto[];
  total_results?: number;
}

const FALLBACK = '';

let bucketEnsured = false;

const BORING_TERMS = /\b(stadium|soccer|football|crowd|flag|protest|office|laptop|meeting|parking|warehouse|factory|highway|traffic|portrait|selfie|model|headshot|closeup|close-up|plant|flower|potted|indoor|face|hands|person standing|corporate|business|stock photo|illustration|vector|cartoon|icon|logo|graphic design)\b/i;

function pickBestUrl(photo: PexelsPhoto): string {
  return photo.src.large2x || photo.src.large || photo.src.landscape || photo.src.original;
}

function isBoringPhoto(photo: PexelsPhoto): boolean {
  return BORING_TERMS.test(photo.alt || '');
}

function pickBest(photos: PexelsPhoto[]): string | null {
  const good = photos.filter((p) => !isBoringPhoto(p));
  const pool = good.length > 0 ? good : photos;
  for (const p of pool) {
    if (p.width >= 800) return pickBestUrl(p);
  }
  return pool[0] ? pickBestUrl(pool[0]) : null;
}

async function fetchFromPexels(query: string, count: number): Promise<string[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const searchQuery = `${query} travel destination landscape photography`;
  const perPage = Math.max(count + 4, 8);
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=${perPage}`;

  const response = await fetch(url, {
    headers: { Authorization: apiKey },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) throw new Error(`Pexels API ${response.status}`);

  const data = (await response.json()) as PexelsResponse;
  const photos = (data.photos || []).filter((p) => !isBoringPhoto(p));

  if (count === 1) {
    const best = pickBest(photos);
    return best ? [best] : [];
  }

  return photos
    .slice(0, count)
    .map(pickBestUrl)
    .filter(Boolean);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!bucketEnsured) {
    await ensureBucket();
    bucketEnsured = true;
  }

  try {
    const body = JSON.parse(event.body || '{}') as { query?: string; count?: number };
    const query = (body.query || '').trim();
    if (!query) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing query' }) };
    }

    const requestedCount = body.count || 1;

    /* ── Layer 1: Supabase cache check ── */
    if (requestedCount === 1) {
      const cached = await getCachedImage(query);
      if (cached) {
        return ok({ imageUrl: cached, source: 'supabase-cache' });
      }
    } else {
      const queryVariants = Array.from({ length: requestedCount }, (_, i) =>
        i === 0 ? query : `${query} ${i + 1}`,
      );
      const cached = await getCachedImages(queryVariants);
      const allCached = cached.every((u) => u !== null);
      if (allCached) {
        const urls = cached as string[];
        return ok({
          imageUrl: urls[0],
          imageUrls: urls,
          source: 'supabase-cache',
        });
      }
    }

    /* ── Layer 2: Pexels API ── */
    let pexelsUrls: string[] = [];
    try {
      pexelsUrls = await fetchFromPexels(query, requestedCount);
    } catch (e) {
      console.warn('[getLocationImage] Pexels fetch failed:', e);
    }

    if (pexelsUrls.length === 0) {
      return ok({
        imageUrl: FALLBACK,
        imageUrls: requestedCount > 1 ? [FALLBACK] : undefined,
        source: 'fallback',
      });
    }

    /* ── Layer 3: Cache fetched images to Supabase (fire & return immediately) ── */
    if (requestedCount === 1) {
      const pexelsUrl = pexelsUrls[0];
      // Try to cache in Supabase — don't block the response
      const cachedUrl = await cacheImage(query, pexelsUrl).catch(() => null);
      const finalUrl = cachedUrl || pexelsUrl;
      return ok({ imageUrl: finalUrl, source: cachedUrl ? 'supabase-cache' : 'pexels' });
    }

    // Multi-image: cache all in parallel
    const entries = pexelsUrls.map((url, i) => ({
      query: i === 0 ? query : `${query} ${i + 1}`,
      sourceUrl: url,
    }));
    const cachedUrls = await cacheImages(entries).catch(() => pexelsUrls.map(() => null));
    const finalUrls = pexelsUrls.map((pUrl, i) => cachedUrls[i] || pUrl);

    return ok({
      imageUrl: finalUrls[0],
      imageUrls: finalUrls,
      source: cachedUrls.some((u) => u) ? 'supabase-cache' : 'pexels',
    });
  } catch (error) {
    console.warn('[getLocationImage] top-level error:', error);
    return ok({ imageUrl: FALLBACK, source: 'fallback' });
  }
};

function ok(body: Record<string, unknown>) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
    body: JSON.stringify(body),
  };
}
