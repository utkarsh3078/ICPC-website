/**
 * Simple in-memory cache utility for expensive operations
 * Uses TTL (time-to-live) to automatically expire cached data
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class Cache {
  private store = new Map<string, CacheEntry<any>>();

  /**
   * Get a cached value if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set a cached value with TTL in milliseconds
   */
  set<T>(key: string, value: T, ttlMs: number = 60000): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Invalidate a specific cache key
   */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /**
   * Invalidate multiple keys matching a pattern
   */
  invalidatePattern(pattern: RegExp | string): void {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.store.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.store.delete(key));
  }

  /**
   * Get or set - if key exists and not expired, return it
   * Otherwise call the provider function and cache the result
   */
  async getOrSet<T>(
    key: string,
    provider: () => Promise<T>,
    ttlMs: number = 60000,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const value = await provider();
    this.set(key, value, ttlMs);
    return value;
  }
}

export default new Cache();
