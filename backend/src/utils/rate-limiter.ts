/**
 * @file rate-limiter.ts
 * @description Rate limiter utility for API calls
 *
 * @principles
 * - SRP: ✅ Single responsibility - rate limiting only
 * - Sliding Window: Tracks requests in a time window
 * - Auto Wait: Automatically waits if limit exceeded
 *
 * @usage
 * const limiter = new RateLimiter(256, 15 * 60 * 1000); // 256 requests per 15 minutes
 * await limiter.waitIfNeeded(); // Wait if limit exceeded
 * // Make API call
 */

import logger from './logger';

export class RateLimiter {
  private requests: number[] = []; // Timestamps of requests
  private limit: number; // Maximum requests per window
  private windowMs: number; // Time window in milliseconds

  /**
   * Create a rate limiter
   *
   * @param limit Maximum number of requests per window
   * @param windowMs Time window in milliseconds
   *
   * @example
   * // solved.ac API: 256 requests per 15 minutes
   * const limiter = new RateLimiter(256, 15 * 60 * 1000);
   */
  constructor(limit: number = 256, windowMs: number = 15 * 60 * 1000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /**
   * Wait if rate limit is exceeded
   * Automatically cleans up old requests outside the time window
   *
   * @returns Promise that resolves when it's safe to make a request
   *
   * @example
   * await limiter.waitIfNeeded();
   * const response = await api.call();
   */
  async waitIfNeeded(): Promise<void> {
    const now = Date.now();

    // Remove requests outside the time window
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);

    // If limit exceeded, calculate wait time
    if (this.requests.length >= this.limit) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);

      if (waitTime > 0) {
        logger.warn(`Rate limit reached. Waiting ${(waitTime / 1000).toFixed(1)}s...`);
        await this.sleep(waitTime);

        // After waiting, clean up again
        const afterWait = Date.now();
        this.requests = this.requests.filter((timestamp) => afterWait - timestamp < this.windowMs);
      }
    }

    // Record this request
    this.requests.push(Date.now());
  }

  /**
   * Get remaining requests in current window
   *
   * @returns Number of remaining requests
   */
  getRemaining(): number {
    const now = Date.now();
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);
    return Math.max(0, this.limit - this.requests.length);
  }

  /**
   * Get time until next available slot
   *
   * @returns Time in milliseconds (0 if available now)
   */
  getTimeUntilNextSlot(): number {
    const now = Date.now();
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);

    if (this.requests.length < this.limit) {
      return 0;
    }

    const oldestRequest = this.requests[0];
    return Math.max(0, this.windowMs - (now - oldestRequest));
  }

  /**
   * Reset the limiter (clear all request history)
   */
  reset(): void {
    this.requests = [];
    logger.info('Rate limiter reset');
  }

  /**
   * Check if a request can be made now without waiting
   *
   * @returns true if request can be made immediately
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);
    return this.requests.length < this.limit;
  }

  /**
   * Get statistics about rate limiter
   *
   * @returns Object with current statistics
   */
  getStats() {
    const now = Date.now();
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);

    return {
      limit: this.limit,
      windowMs: this.windowMs,
      requestsInWindow: this.requests.length,
      remaining: this.limit - this.requests.length,
      timeUntilNextSlot: this.getTimeUntilNextSlot(),
      utilizationPercent: ((this.requests.length / this.limit) * 100).toFixed(1),
    };
  }

  /**
   * Sleep for specified milliseconds
   *
   * @param ms Milliseconds to sleep
   * @returns Promise that resolves after delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Global rate limiter instance for solved.ac API
 * 256 requests per 15 minutes
 */
export const solvedacRateLimiter = new RateLimiter(256, 15 * 60 * 1000);
