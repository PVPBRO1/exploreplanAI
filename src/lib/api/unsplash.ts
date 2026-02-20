import type { ItineraryDay } from '../ai/types';

const IMAGE_FUNCTION_URL = '/.netlify/functions/getLocationImage';
const cache = new Map<string, string>();

const DESTINATION_FALLBACKS: Record<string, string> = {
  paris: '/destinations/paris.jpg',
  france: '/destinations/paris.jpg',
  tokyo: '/destinations/tokyo.jpg',
  japan: '/destinations/tokyo.jpg',
  kyoto: '/destinations/tokyo.jpg',
  osaka: '/destinations/tokyo.jpg',
  bali: '/destinations/bali.jpg',
  indonesia: '/destinations/bali.jpg',
  rome: '/destinations/rome.jpg',
  italy: '/destinations/rome.jpg',
  'italian village': '/destinations/italian-village.jpg',
  venice: '/destinations/italian-village.jpg',
  florence: '/destinations/italian-village.jpg',
  amalfi: '/destinations/italian-village.jpg',
  barcelona: '/destinations/barcelona.jpg',
  spain: '/destinations/barcelona.jpg',
  madrid: '/destinations/barcelona.jpg',
  london: '/destinations/london.jpg',
  uk: '/destinations/london.jpg',
  england: '/destinations/london.jpg',
  stonehenge: '/destinations/stonehenge.jpg',
  dubai: '/destinations/dubai.jpg',
  uae: '/destinations/dubai.jpg',
  'united arab emirates': '/destinations/dubai.jpg',
  'new york': '/destinations/nyc.jpg',
  nyc: '/destinations/nyc.jpg',
  'new york city': '/destinations/nyc.jpg',
  manhattan: '/destinations/nyc.jpg',
  sydney: '/destinations/sydney.jpg',
  australia: '/destinations/sydney.jpg',
  marrakech: '/destinations/marrakech.jpg',
  morocco: '/destinations/marrakech.jpg',
  egypt: '/destinations/egypt.jpg',
  cairo: '/destinations/egypt.jpg',
  pyramids: '/destinations/egypt.jpg',
  nepal: '/destinations/nepal.jpg',
  himalayas: '/destinations/nepal.jpg',
  everest: '/destinations/nepal.jpg',
  yosemite: '/destinations/yosemite.jpg',
  porto: '/destinations/porto.jpg',
  portugal: '/destinations/porto.jpg',
  lisbon: '/destinations/porto.jpg',
  mexico: '/destinations/mexico.jpg',
  'mexico city': '/destinations/mexico.jpg',
  maldives: '/destinations/beach.jpg',
  bahamas: '/destinations/beach.jpg',
  caribbean: '/destinations/beach.jpg',
  santorini: '/destinations/beach.jpg',
  greece: '/destinations/beach.jpg',
  'great wall': '/destinations/great-wall.jpg',
  china: '/destinations/great-wall.jpg',
  beijing: '/destinations/great-wall.jpg',
  'cape town': '/destinations/beach.jpg',
  'south africa': '/destinations/beach.jpg',
  'costa rica': '/destinations/bali.jpg',
  thailand: '/destinations/bali.jpg',
  bangkok: '/destinations/bali.jpg',
  'new zealand': '/destinations/nepal.jpg',
  iceland: '/destinations/nepal.jpg',
  peru: '/destinations/nepal.jpg',
  'machu picchu': '/destinations/nepal.jpg',
  singapore: '/destinations/dubai.jpg',
  seoul: '/destinations/tokyo.jpg',
  'south korea': '/destinations/tokyo.jpg',
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

  try {
    const res = await fetch(IMAGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, count: 1 }),
    });
    if (!res.ok) throw new Error(`Image API ${res.status}`);
    const data = await res.json();
    const imageUrl = data?.imageUrl;

    if (imageUrl && !imageUrl.startsWith('/destinations/')) {
      cache.set(cacheKey, imageUrl);
      return imageUrl;
    }

    return '';
  } catch (e) {
    console.warn('Image fetch failed for', query, e);
    return '';
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

export async function fetchActivityImages(query: string, count = 4): Promise<string[]> {
  const cacheKey = `activity:${query.toLowerCase().trim()}:${count}`;
  if (cache.has(cacheKey)) return JSON.parse(cache.get(cacheKey)!);

  try {
    const res = await fetch(IMAGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, count }),
    });
    if (!res.ok) throw new Error(`Image API ${res.status}`);
    const data = await res.json();
    const urls: string[] = (data?.imageUrls || (data?.imageUrl ? [data.imageUrl] : []))
      .filter((u: string) => u && !u.startsWith('/destinations/'));
    if (urls.length > 0) {
      cache.set(cacheKey, JSON.stringify(urls));
      return urls;
    }
  } catch (e) {
    console.warn('Activity image fetch failed for', query, e);
  }

  return [];
}

export async function fetchDayImagesForItinerary(
  days: ItineraryDay[],
  destination?: string,
): Promise<Record<number, string[]>> {
  const entries = await Promise.all(
    days.map(async (day) => {
      const baseQueries = [
        `${destination || ''} ${day.title} travel photo`,
        ...day.activities.slice(0, 3).map((a) => `${destination || ''} ${a.title} ${a.location || ''}`.trim()),
      ].filter(Boolean);

      const images = await Promise.allSettled(
        baseQueries.map(async (q) => fetchLocationImage(q)),
      );
      const remote = images
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map((r) => r.value)
        .filter((url) => url && !url.startsWith('/destinations/'));
      const uniqueRemote = [...new Set(remote)];
      return [day.day, uniqueRemote.slice(0, 5)] as const;
    }),
  );

  return Object.fromEntries(entries);
}

const ALL_LOCAL_IMAGES = [
  '/destinations/tokyo.jpg',
  '/destinations/paris.jpg',
  '/destinations/bali.jpg',
  '/destinations/rome.jpg',
  '/destinations/barcelona.jpg',
  '/destinations/london.jpg',
  '/destinations/dubai.jpg',
  '/destinations/nyc.jpg',
  '/destinations/sydney.jpg',
  '/destinations/marrakech.jpg',
  '/destinations/egypt.jpg',
  '/destinations/nepal.jpg',
  '/destinations/yosemite.jpg',
  '/destinations/porto.jpg',
  '/destinations/mexico.jpg',
  '/destinations/great-wall.jpg',
  '/destinations/italian-village.jpg',
  '/destinations/stonehenge.jpg',
  '/destinations/beach.jpg',
];

const KEYWORD_IMAGE_MAP: [RegExp, string[]][] = [
  [/japan|tokyo|kyoto|osaka|fuji|samurai|geisha|sakura|onsen|sushi|ramen|manga|anime/i, ['/destinations/tokyo.jpg']],
  [/maldives|bungalow|overwater|lagoon|turquoise|atoll|snorkel|dive|coral/i, ['/destinations/beach.jpg']],
  [/paris|eiffel|louvre|france|seine|montmartre|croissant|baguette/i, ['/destinations/paris.jpg']],
  [/bali|ubud|temple|rice terrace|indonesia|gamelan|batik/i, ['/destinations/bali.jpg']],
  [/dubai|burj|abu dhabi|uae|desert safari|gold souk/i, ['/destinations/dubai.jpg']],
  [/rome|colosseum|vatican|pantheon|italy|gelato|piazza|trevi/i, ['/destinations/rome.jpg']],
  [/spain|barcelona|sagrada|gaudi|tapas|flamenco|siesta/i, ['/destinations/barcelona.jpg']],
  [/london|thames|big ben|buckingham|england|pub|uk|british/i, ['/destinations/london.jpg']],
  [/morocco|marrakech|medina|souk|camel|sahara|fez|tagine/i, ['/destinations/marrakech.jpg']],
  [/egypt|pyramid|sphinx|cairo|pharaoh|nile|luxor|ancient egypt/i, ['/destinations/egypt.jpg']],
  [/nepal|everest|himalaya|kathmandu|trekking|base camp|sherpa/i, ['/destinations/nepal.jpg']],
  [/new york|manhattan|brooklyn|times square|statue of liberty|central park/i, ['/destinations/nyc.jpg']],
  [/sydney|harbour|opera house|australia|bondi|kangaroo/i, ['/destinations/sydney.jpg']],
  [/porto|portugal|lisbon|douro|azulejo|pasteis|fado/i, ['/destinations/porto.jpg']],
  [/temple|shrine|zen|garden|pagoda|bamboo|torii/i, ['/destinations/tokyo.jpg', '/destinations/bali.jpg']],
  [/market|food|street food|restaurant|cuisine|culinary|spice|cooking/i, ['/destinations/marrakech.jpg', '/destinations/mexico.jpg', '/destinations/italian-village.jpg']],
  [/beach|ocean|island|coast|surf|bay|sea|tropical/i, ['/destinations/beach.jpg', '/destinations/bali.jpg', '/destinations/sydney.jpg']],
  [/skyline|skyscraper|downtown|neon|nightlife|shopping|luxury/i, ['/destinations/nyc.jpg', '/destinations/dubai.jpg', '/destinations/tokyo.jpg']],
  [/history|ancient|ruins|castle|palace|fortress|medieval|museum|heritage/i, ['/destinations/egypt.jpg', '/destinations/rome.jpg', '/destinations/london.jpg']],
  [/mountain|hiking|trek|valley|waterfall|volcano|national park|glacier/i, ['/destinations/nepal.jpg', '/destinations/yosemite.jpg']],
  [/art|gallery|cathedral|church|architecture|baroque|renaissance/i, ['/destinations/paris.jpg', '/destinations/barcelona.jpg', '/destinations/italian-village.jpg']],
  [/wine|vineyard|winery|sunset|villa|countryside/i, ['/destinations/italian-village.jpg', '/destinations/porto.jpg', '/destinations/paris.jpg']],
  [/arrival|check.in|hotel|resort|accommodation|welcome|explore|first day/i, ['/destinations/beach.jpg', '/destinations/bali.jpg', '/destinations/paris.jpg']],
];

export function getImagesForDay(
  dayTitle: string,
  activities: { title: string; location?: string }[],
  count = 5,
  seed = 0,
): string[] {
  const text = [dayTitle, ...activities.map((a) => `${a.title} ${a.location || ''}`)].join(' ');
  const matched = new Set<string>();

  for (const [pattern, images] of KEYWORD_IMAGE_MAP) {
    if (pattern.test(text)) {
      images.forEach((img) => matched.add(img));
    }
  }

  if (matched.size < count) {
    for (const img of ALL_LOCAL_IMAGES) {
      if (matched.size >= count * 2) break;
      matched.add(img);
    }
  }

  const pool = Array.from(matched);
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(pool[(i + seed) % pool.length]);
  }
  return result;
}
