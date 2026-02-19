const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '';

const cache = new Map<string, string>();

const DESTINATION_FALLBACKS: Record<string, string> = {
  paris: '/destinations/paris.jpg',
  tokyo: '/destinations/tokyo.jpg',
  bali: '/destinations/bali.jpg',
  rome: '/destinations/rome.jpg',
  barcelona: '/destinations/barcelona.jpg',
  london: '/destinations/london.jpg',
  dubai: '/destinations/dubai.jpg',
  'new york': '/destinations/nyc.jpg',
  nyc: '/destinations/nyc.jpg',
  sydney: '/destinations/sydney.jpg',
  marrakech: '/destinations/marrakech.jpg',
  egypt: '/destinations/egypt.jpg',
  nepal: '/destinations/nepal.jpg',
  yosemite: '/destinations/yosemite.jpg',
  porto: '/destinations/porto.jpg',
  mexico: '/destinations/mexico.jpg',
};

function findFallback(query: string): string | null {
  const lower = query.toLowerCase();
  for (const [key, url] of Object.entries(DESTINATION_FALLBACKS)) {
    if (lower.includes(key)) return url;
  }
  return null;
}

export async function fetchLocationImage(query: string): Promise<string> {
  const cacheKey = query.toLowerCase().trim();
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;

  const fallback = findFallback(query) || '/destinations/beach.jpg';

  if (!UNSPLASH_KEY) {
    cache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' travel')}&per_page=1&orientation=landscape&client_id=${UNSPLASH_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Unsplash ${res.status}`);

    const data = await res.json();
    const imageUrl = data.results?.[0]?.urls?.regular;

    if (imageUrl) {
      cache.set(cacheKey, imageUrl);
      return imageUrl;
    }

    cache.set(cacheKey, fallback);
    return fallback;
  } catch (e) {
    console.warn('Unsplash fetch failed for', query, e);
    cache.set(cacheKey, fallback);
    return fallback;
  }
}

export async function fetchMultipleLocationImages(
  queries: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  const promises = queries.map(async (q) => {
    const url = await fetchLocationImage(q);
    results.set(q, url);
  });
  await Promise.allSettled(promises);
  return results;
}
