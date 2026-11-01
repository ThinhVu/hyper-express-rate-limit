import type { Response } from 'hyper-express';
import type { RateLimitInfo } from './types';
/**
 * Sets `X-RateLimit-*` headers on a response.
 *
 * @param response {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 */
export declare const setLegacyHeaders: (response: Response, info: RateLimitInfo) => void;
/**
 * Sets `RateLimit-*`` headers based on the sixth draft of the IETF specification.
 * See https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-06.
 *
 * @param response {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
export declare const setDraft6Headers: (response: Response, info: RateLimitInfo, windowMs: number) => void;
/**
 * Sets `RateLimit` & `RateLimit-Policy` headers based on the seventh draft of the spec.
 * See https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-07.
 *
 * @param response {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
export declare const setDraft7Headers: (response: Response, info: RateLimitInfo, windowMs: number) => void;
/**
 * Sets the `Retry-After` header.
 *
 * @param response {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
export declare const setRetryAfterHeader: (response: Response, info: RateLimitInfo, windowMs: number) => void;
