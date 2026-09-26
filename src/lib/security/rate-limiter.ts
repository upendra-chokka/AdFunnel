export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private buckets = new Map<string, Bucket>();
  private maxTokens: number;
  private refillRateMs: number;

  constructor(maxTokens = 60, refillIntervalMs = 60000) {
    this.maxTokens = maxTokens;
    this.refillRateMs = refillIntervalMs;
  }

  check(identifier: string): RateLimitResult {
    const now = Date.now();
    let bucket = this.buckets.get(identifier);

    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefill: now };
      this.buckets.set(identifier, bucket);
    } else {
      // Calculate refilled tokens based on elapsed time
      const elapsed = now - bucket.lastRefill;
      if (elapsed > this.refillRateMs) {
        bucket.tokens = this.maxTokens;
        bucket.lastRefill = now;
      }
    }

    if (bucket.tokens > 0) {
      bucket.tokens--;
      return {
        allowed: true,
        limit: this.maxTokens,
        remaining: bucket.tokens,
        resetAt: bucket.lastRefill + this.refillRateMs,
      };
    }

    return {
      allowed: false,
      limit: this.maxTokens,
      remaining: 0,
      resetAt: bucket.lastRefill + this.refillRateMs,
    };
  }
}

export const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
export const webhookRateLimiter = new RateLimiter(300, 60000); // 300 webhooks per minute
