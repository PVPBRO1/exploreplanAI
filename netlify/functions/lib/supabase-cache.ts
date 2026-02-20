import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'travel-images';
let _client: SupabaseClient | null = null;
let _initFailed = false;

function getClient(): SupabaseClient | null {
  if (_initFailed) return null;
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('[supabase-cache] SUPABASE_URL or SUPABASE_ANON_KEY not set — caching disabled');
    _initFailed = true;
    return null;
  }

  try {
    _client = createClient(url, key);
    return _client;
  } catch (e) {
    console.warn('[supabase-cache] Failed to create client:', e);
    _initFailed = true;
    return null;
  }
}

function slugify(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

function buildPublicUrl(path: string): string {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * Check if a cached version of this image exists in Supabase Storage.
 * Returns the public CDN URL if found, null otherwise.
 */
export async function getCachedImage(query: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  const slug = slugify(query);
  const path = `cache/${slug}.jpg`;
  const publicUrl = buildPublicUrl(path);

  try {
    const res = await fetch(publicUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
    });
    return res.ok ? publicUrl : null;
  } catch {
    return null;
  }
}

/**
 * Check multiple cached images at once. Returns an array matching the input queries.
 * null entries mean that query is not cached.
 */
export async function getCachedImages(queries: string[]): Promise<(string | null)[]> {
  return Promise.all(queries.map(getCachedImage));
}

/**
 * Download an image from sourceUrl and upload it to Supabase Storage.
 * Returns the permanent public CDN URL, or null if caching failed.
 */
export async function cacheImage(query: string, sourceUrl: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  if (!sourceUrl || sourceUrl.startsWith('/')) return null;

  const slug = slugify(query);
  const path = `cache/${slug}.jpg`;

  try {
    const imgRes = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(12000),
    });
    if (!imgRes.ok) {
      console.warn(`[supabase-cache] Failed to download image: ${imgRes.status} for ${sourceUrl.slice(0, 80)}`);
      return null;
    }

    const arrayBuffer = await imgRes.arrayBuffer();
    if (arrayBuffer.byteLength < 1000) {
      console.warn('[supabase-cache] Image too small, skipping cache');
      return null;
    }

    const { error } = await client.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, {
        contentType: imgRes.headers.get('content-type') || 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.warn(`[supabase-cache] Upload failed: ${error.message}`);
      return null;
    }

    const publicUrl = buildPublicUrl(path);
    console.log(`[supabase-cache] Cached: ${query.slice(0, 50)} → ${publicUrl.slice(-60)}`);
    return publicUrl;
  } catch (e) {
    console.warn('[supabase-cache] cacheImage error:', e);
    return null;
  }
}

/**
 * Cache multiple images in parallel. Returns array of CDN URLs (null for failures).
 */
export async function cacheImages(
  entries: { query: string; sourceUrl: string }[],
): Promise<(string | null)[]> {
  return Promise.all(entries.map(({ query, sourceUrl }) => cacheImage(query, sourceUrl)));
}

/**
 * Ensure the storage bucket exists. Call once on cold start.
 * Fails silently if bucket already exists or permissions are insufficient.
 */
export async function ensureBucket(): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    const { error } = await client.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });
    if (error && !error.message?.includes('already exists')) {
      console.warn('[supabase-cache] Bucket creation note:', error.message);
    }
  } catch {
    // Bucket likely already exists or we lack permission — both fine
  }
}
