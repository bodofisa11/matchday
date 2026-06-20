/**
 * Tiny client-side cache for the v2 query layer.
 *
 * Persistent L2 cache (localStorage) layered under the existing in-memory
 * Promise caches (events.ts, team-codes-cache.ts) that dedupe within a session.
 * Goal: instant repeat paints and fewer redundant Supabase calls. No deps.
 *
 * Strategy is stale-while-revalidate by default — a stale entry is returned
 * immediately while a background refetch refreshes the stored copy, so the
 * *next* mount/navigation paints fresh. Expired entries with no value block on
 * the fetch as usual.
 *
 * Bump {@link SCHEMA_VERSION} to invalidate every entry at once (e.g. on a DB
 * shape change). All entries live under the `wf-cache:v<N>:` key prefix.
 */

/** Cache schema version — bump to invalidate all persisted entries. */
const SCHEMA_VERSION = 1;
const PREFIX = `wf-cache:v${SCHEMA_VERSION}:`;

/** Per-category TTLs (ms). See the data-volatility table in the cache plan. */
export const TTL = {
  /** Live scores / in-progress sessions. */
  LIVE: 30_000,
  /** Daily fixture rails that embed live scores. */
  SCHEDULE: 60_000,
  /** Standings, scorers, paged fixtures — hourly. */
  STANDINGS: 60 * 60_000,
  /** Completed / historical detail — effectively immutable. */
  RESULTS: 7 * 24 * 60 * 60_000,
  /** Reference / metadata (squads, calendars, seasons). */
  REFERENCE: 24 * 60 * 60_000,
} as const;

interface Entry<T> {
  data: T;
  expiresAt: number;
}

function isEmpty(value: unknown): boolean {
  return value == null || (Array.isArray(value) && value.length === 0);
}

function read<T>(key: string): Entry<T> | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as Entry<T>;
  } catch {
    return null;
  }
}

function write<T>(key: string, entry: Entry<T>): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // QuotaExceeded or corrupt store — clear our own namespace and retry once.
    try {
      clearCache();
      localStorage.setItem(PREFIX + key, JSON.stringify(entry));
    } catch {
      // Give up silently — cache is best-effort, never break the fetch.
    }
  }
}

/** Remove every entry written by this cache (our prefix only). */
export function clearCache(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  } catch {
    // ignore
  }
}

interface CacheOpts {
  /** Stale-while-revalidate (default true). When false, refetch blocks. */
  swr?: boolean;
  /** Skip caching empty results (null / []) so transient empties don't stick. Default true. */
  skipEmpty?: boolean;
}

/**
 * Run `fetcher`, caching its result under `key` for `ttlMs`.
 *
 * - No window (SSR / static prerender) → calls `fetcher` directly, no caching.
 * - Fresh entry → returned without fetching.
 * - Stale entry + swr → stale value returned now, background refetch updates store.
 * - Stale entry + !swr, or no entry → awaits fetcher, stores, returns.
 */
export async function cachedQuery<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  opts: CacheOpts = {},
): Promise<T> {
  const { swr = true, skipEmpty = true } = opts;

  if (typeof window === "undefined") return fetcher();

  const store = async (): Promise<T> => {
    const data = await fetcher();
    if (!(skipEmpty && isEmpty(data))) {
      write(key, { data, expiresAt: Date.now() + ttlMs });
    }
    return data;
  };

  const entry = read<T>(key);
  if (!entry) return store();

  const fresh = Date.now() < entry.expiresAt;
  if (fresh) return entry.data;

  if (swr) {
    // Return stale immediately; refresh in the background for the next mount.
    void store().catch(() => {});
    return entry.data;
  }
  return store();
}
