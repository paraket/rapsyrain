/**
 * Browser Cache Utilities
 * High-level API for managing the Cache API and pre-fetching heavy assets.
 */

const CACHE_NAME = 'mypdf-lite-v1';

/**
 * Pre-fetches a list of URLs and stores them in the cache.
 * Useful for "warming up" heavy libraries after the main page is interactive.
 */
export const prefetchAssets = async (urls) => {
  if (!('caches' in window)) return;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    // Use a non-blocking check: only add if not already there
    for (const url of urls) {
      const match = await cache.match(url);
      if (!match) {
        console.log(`[Cache] Pre-fetching: ${url}`);
        cache.add(url).catch(err => console.warn(`Failed to pre-cache ${url}:`, err));
      }
    }
  } catch (error) {
    console.error('[Cache] Prefetch error:', error);
  }
};

/**
 * Checks if an asset is already in the cache.
 */
export const isAssetCached = async (url) => {
  if (!('caches' in window)) return false;
  const match = await caches.match(url);
  return !!match;
};
