/**
 * In-memory client-side cache and request deduplicator
 * Prevents multiple simultaneous components from firing identical fetch requests
 * and caches results during the session for instant renders.
 */

const memoryCache = new Map();
const inFlightRequests = new Map();

/**
 * Fetch with deduplication and in-memory caching
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [ttlMs=300000] - Cache TTL in ms (default 5 minutes)
 */
export async function cachedFetch(url, options = {}, ttlMs = 300000) {
  // If method is not GET, bypass cache
  const method = options.method ? options.method.toUpperCase() : 'GET';
  if (method !== 'GET') {
    return fetch(url, options).then(res => res.json());
  }

  const cacheKey = `${url}`;
  const now = Date.now();

  // Check valid cached data
  if (memoryCache.has(cacheKey)) {
    const entry = memoryCache.get(cacheKey);
    if (now - entry.timestamp < ttlMs) {
      return entry.data;
    }
    memoryCache.delete(cacheKey);
  }

  // Check in-flight request to deduplicate concurrent calls
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const promise = (async () => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status}`);
      }
      const data = await res.json();
      memoryCache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

/**
 * Invalidate a specific cached URL or clear all
 */
export function invalidateCache(url) {
  if (url) {
    memoryCache.delete(url);
  } else {
    memoryCache.clear();
  }
}
