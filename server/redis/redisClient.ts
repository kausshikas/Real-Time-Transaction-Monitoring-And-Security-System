/**
 * Redis Architecture for Real-Time Fraud Detection Platform
 * Implements:
 * 1. Sliding Window Velocity Tracking (customer:{id}:transactions)
 * 2. Geo-Velocity Tracking (customer:{id}:locations)
 * 3. Rolling Rate Limiting (ratelimit:{ip})
 * 4. Real-time Counter Metrics (counter:{metric})
 * 5. Dashboard Summary Caching (cache:dashboard:summary)
 */

interface TimestampedLocation {
  location: string;
  country: string;
  timestamp: number;
}

class RedisService {
  private velocityStore: Map<string, number[]> = new Map();
  private locationStore: Map<string, TimestampedLocation[]> = new Map();
  private cacheStore: Map<string, { value: any; expiresAt: number }> = new Map();
  private counters: Map<string, number> = new Map();
  private rateLimits: Map<string, number[]> = new Map();

  constructor() {
    console.log('[Redis] Redis client layer initialized with sliding-window velocity tracking.');
  }

  /**
   * Pushes a transaction timestamp to customer sliding window and returns count in window.
   * Redis equivalent:
   * ZADD customer:{id}:transactions <timestamp> <txnId>
   * ZREMRANGEBYSCORE customer:{id}:transactions 0 <now - window>
   * ZCARD customer:{id}:transactions
   */
  public recordTransactionVelocity(customerId: string, timestampMs: number, windowSeconds = 120): number {
    const key = `customer:${customerId}:transactions`;
    let timestamps = this.velocityStore.get(key) || [];
    
    // Add new timestamp
    timestamps.push(timestampMs);
    
    // Evict timestamps outside rolling window
    const cutoff = timestampMs - (windowSeconds * 1000);
    timestamps = timestamps.filter(t => t >= cutoff);
    this.velocityStore.set(key, timestamps);

    return timestamps.length;
  }

  public getTransactionVelocity(customerId: string, windowSeconds = 120): number {
    const key = `customer:${customerId}:transactions`;
    const timestamps = this.velocityStore.get(key) || [];
    const now = Date.now();
    const cutoff = now - (windowSeconds * 1000);
    return timestamps.filter(t => t >= cutoff).length;
  }

  /**
   * Tracks customer recent locations with timestamps to detect physical impossibility (<60m cross-country travel).
   */
  public recordLocation(customerId: string, city: string, country: string, timestampMs: number): TimestampedLocation[] {
    const key = `customer:${customerId}:locations`;
    let history = this.locationStore.get(key) || [];
    history.unshift({ location: `${city}, ${country}`, country, timestamp: timestampMs });
    
    // Keep last 10 locations
    if (history.length > 10) history = history.slice(0, 10);
    this.locationStore.set(key, history);
    return history;
  }

  public getRecentLocations(customerId: string): TimestampedLocation[] {
    const key = `customer:${customerId}:locations`;
    return this.locationStore.get(key) || [];
  }

  /**
   * Rate limiting using sliding window in Redis.
   */
  public checkRateLimit(identifier: string, maxRequests = 60, windowSeconds = 60): { allowed: boolean; remaining: number } {
    const key = `ratelimit:${identifier}`;
    const now = Date.now();
    const cutoff = now - (windowSeconds * 1000);

    let hits = this.rateLimits.get(key) || [];
    hits = hits.filter(t => t >= cutoff);
    hits.push(now);
    this.rateLimits.set(key, hits);

    const allowed = hits.length <= maxRequests;
    const remaining = Math.max(0, maxRequests - hits.length);
    return { allowed, remaining };
  }

  /**
   * Atomic counter increment in Redis (INCR)
   */
  public increment(key: string): number {
    const current = (this.counters.get(key) || 0) + 1;
    this.counters.set(key, current);
    return current;
  }

  public getCounter(key: string): number {
    return this.counters.get(key) || 0;
  }

  /**
   * Cache with TTL (SETEX / GET)
   */
  public set(key: string, value: any, ttlSeconds = 30): void {
    this.cacheStore.set(key, {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
    });
  }

  public get<T>(key: string): T | null {
    const item = this.cacheStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cacheStore.delete(key);
      return null;
    }
    return item.value as T;
  }

  public flushAll(): void {
    this.velocityStore.clear();
    this.locationStore.clear();
    this.cacheStore.clear();
    this.counters.clear();
    this.rateLimits.clear();
  }
}

export const redis = new RedisService();
