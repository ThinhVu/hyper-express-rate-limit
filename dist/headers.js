"use strict";
// /source/headers.ts
// The header setting functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRetryAfterHeader = exports.setDraft7Headers = exports.setDraft6Headers = exports.setLegacyHeaders = void 0;
/**
 * Returns the number of seconds left for the window to reset. Uses `windowMs`
 * in case the store doesn't return a `resetTime`.
 *
 * @param resetTime {Date | undefined} - The timestamp at which the store window resets.
 * @param windowMs {number | undefined} - The window length.
 */
const getResetSeconds = (resetTime, windowMs) => {
    let resetSeconds = undefined; // eslint-disable-line no-undef-init
    if (resetTime) {
        const deltaSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
        resetSeconds = Math.max(0, deltaSeconds);
    }
    else if (windowMs) {
        // This isn't really correct, but the field is required by the spec in `draft-7`,
        // so this is the best we can do. The validator should have already logged a
        // warning by this point.
        resetSeconds = Math.ceil(windowMs / 1000);
    }
    return resetSeconds;
};
/**
 * Sets `X-RateLimit-*` headers on a response.
 *
 * @param response {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 */
const setLegacyHeaders = (response, info) => {
    if (response.headersSent)
        return;
    response.setHeader('X-RateLimit-Limit', info.limit.toString());
    response.setHeader('X-RateLimit-Remaining', info.remaining.toString());
    // If we have a resetTime, also provide the current date to help avoid
    // issues with incorrect clocks.
    if (info.resetTime instanceof Date) {
        response.setHeader('Date', new Date().toUTCString());
        response.setHeader('X-RateLimit-Reset', Math.ceil(info.resetTime.getTime() / 1000).toString());
    }
};
exports.setLegacyHeaders = setLegacyHeaders;
/**
 * Sets `RateLimit-*`` headers based on the sixth draft of the IETF specification.
 * See https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-06.
 *
 * @param response {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
const setDraft6Headers = (response, info, windowMs) => {
    if (response.headersSent)
        return;
    const windowSeconds = Math.ceil(windowMs / 1000);
    const resetSeconds = getResetSeconds(info.resetTime);
    response.setHeader('RateLimit-Policy', `${info.limit};w=${windowSeconds}`);
    response.setHeader('RateLimit-Limit', info.limit.toString());
    response.setHeader('RateLimit-Remaining', info.remaining.toString());
    // Set this header only if the store returns a `resetTime`.
    if (resetSeconds)
        response.setHeader('RateLimit-Reset', resetSeconds.toString());
};
exports.setDraft6Headers = setDraft6Headers;
/**
 * Sets `RateLimit` & `RateLimit-Policy` headers based on the seventh draft of the spec.
 * See https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-07.
 *
 * @param response {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
const setDraft7Headers = (response, info, windowMs) => {
    if (response.headersSent)
        return;
    const windowSeconds = Math.ceil(windowMs / 1000);
    const resetSeconds = getResetSeconds(info.resetTime, windowMs);
    response.setHeader('RateLimit-Policy', `${info.limit};w=${windowSeconds}`);
    response.setHeader('RateLimit', `limit=${info.limit}, remaining=${info.remaining}, reset=${resetSeconds}`);
};
exports.setDraft7Headers = setDraft7Headers;
/**
 * Sets the `Retry-After` header.
 *
 * @param response {Response} - The express response object to set headers on.
 * @param info {RateLimitInfo} - The rate limit info, used to set the headers.
 * @param windowMs {number} - The window length.
 */
const setRetryAfterHeader = (response, info, windowMs) => {
    if (response.headersSent)
        return;
    const resetSeconds = getResetSeconds(info.resetTime, windowMs);
    response.setHeader('Retry-After', resetSeconds.toString());
};
exports.setRetryAfterHeader = setRetryAfterHeader;
