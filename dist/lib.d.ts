import type { Options, RateLimitRequestHandler } from './types';
/**
 *
 * Create an instance of IP rate-limiting middleware for Express.
 *
 * @param passedOptions {Options} - Options to configure the rate limiter.
 *
 * @returns {RateLimitRequestHandler} - The middleware that rate-limits clients based on your configuration.
 *
 * @public
 */
declare const rateLimit: (passedOptions?: Partial<Options>) => RateLimitRequestHandler;
export default rateLimit;
