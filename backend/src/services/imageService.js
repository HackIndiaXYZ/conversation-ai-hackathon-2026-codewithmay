import axios from 'axios';

/**
 * imageService.js
 *
 * Fetches real Google Images via SerpApi (uses SERPAPI_KEY env var).
 * Falls back to Picsum photos if SerpApi fails or key is missing.
 *
 * Root cause of the original bug:
 *   1. Google HTML scraping is blocked server-side — returns 429/403
 *   2. The Unsplash `source.unsplash.com` URL used as fallback was
 *      deprecated and shut down in 2023 — always returns 404
 *
 * Fix: Use the SERPAPI_KEY already present in .env to call SerpApi's
 * Google Images engine properly via their JSON API.
 */

class ImageService {
  /**
   * Search Google Images and return thumbnail URLs.
   * @param {string} query   — search terms
   * @param {number} count   — how many images (1–4)
   * @returns {Promise<string[]>}  array of thumbnail URLs
   */
  async search(query, count = 1) {
    count = Math.min(4, Math.max(1, count));

    // ── 1. SerpApi Google Images (uses SERPAPI_KEY from .env) ──────────────
    const serpKey = (process.env.SERPAPI_KEY || '').trim();
    if (serpKey) {
      try {
        const res = await axios.get('https://serpapi.com/search.json', {
          params: {
            engine:  'google_images',
            q:       query,
            api_key: serpKey,
            num:     count,
            safe:    'active',
            hl:      'en',
            gl:      'us',
          },
          timeout: 8000,
        });

        const results = res.data?.images_results || [];
        const urls = results
          .slice(0, count)
          .map(img => img.thumbnail)
          .filter(Boolean);

        if (urls.length > 0) {
          console.log(`[ImageService] SerpApi "${query}" → ${urls.length} images`);
          return urls;
        }

        console.warn(`[ImageService] SerpApi returned 0 results for "${query}"`);
      } catch (err) {
        console.warn('[ImageService] SerpApi failed:', err.message);
      }
    } else {
      console.warn('[ImageService] No SERPAPI_KEY found — skipping SerpApi');
    }

    // ── 2. Picsum reliable fallback (always works, real photos) ────────────
    console.log(`[ImageService] Using Picsum fallback for "${query}"`);
    return Array.from({ length: count }, (_, i) => {
      // Deterministic seed from query so same query → same images each time
      const seed = Math.abs(
        query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + i * 37
      ) % 1000;
      return `https://picsum.photos/seed/${seed}/400/300`;
    });
  }
}

export default new ImageService();
