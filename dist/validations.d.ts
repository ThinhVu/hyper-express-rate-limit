import type { Request } from 'hyper-express';
import type { Store, EnabledValidations } from './types';
/**
 * The validations that can be run, as well as the methods to run them.
 */
declare const validations: {
    enabled: {
        [key: string]: boolean;
    };
    disable(): void;
    /**
     * Checks whether the IP address is valid, and that it does not have a port
     * number in it.
     *
     * See https://github.com/ThinhVu/hyper-express-rate-limit/wiki/Error-Codes#err_erl_invalid_ip_address.
     *
     * @param ip {string | undefined} - The IP address provided by Express as request.ip.
     *
     * @returns {void}
     */
    ip(ip: string | undefined): void;
    /**
     * Makes sure the trust proxy setting is not set to `true`.
     *
     * See https://github.com/ThinhVu/hyper-express-rate-limit/wiki/Error-Codes#err_erl_permissive_trust_proxy.
     *
     * @param request {Request} - The Express request object.
     *
     * @returns {void}
     */
    trustProxy(request: Request): void;
    /**
     * Makes sure the trust proxy setting is set in case the `X-Forwarded-For`
     * header is present.
     *
     * See https://github.com/ThinhVu/hyper-express-rate-limit/wiki/Error-Codes#err_erl_unset_trust_proxy.
     *
     * @param request {Request} - The Express request object.
     *
     * @returns {void}
     */
    xForwardedForHeader(request: Request): void;
    /**
     * Ensures totalHits value from store is a positive integer.
     *
     * @param hits {any} - The `totalHits` returned by the store.
     */
    positiveHits(hits: any): void;
    /**
     * Ensures a given key is incremented only once per request.
     *
     * @param request {Request} - The Express request object.
     * @param store {Store} - The store class.
     * @param key {string} - The key used to store the client's hit count.
     *
     * @returns {void}
     */
    singleCount(request: Request, store: Store, key: string): void;
    /**
     * Warns the user that the behaviour for `max: 0` / `limit: 0` is changing in the next
     * major release.
     *
     * @param limit {number} - The maximum number of hits per client.
     *
     * @returns {void}
     */
    limit(limit: number): void;
    /**
     * Warns the user that the `draft_polli_ratelimit_headers` option is deprecated
     * and will be removed in the next major release.
     *
     * @param draft_polli_ratelimit_headers {any | undefined} - The now-deprecated setting that was used to enable standard headers.
     *
     * @returns {void}
     */
    draftPolliHeaders(draft_polli_ratelimit_headers?: any): void;
    /**
     * Warns the user that the `onLimitReached` option is deprecated and will be removed in the next
     * major release.
     *
     * @param onLimitReached {any | undefined} - The maximum number of hits per client.
     *
     * @returns {void}
     */
    onLimitReached(onLimitReached?: any): void;
    /**
     * Warns the user when the selected headers option requires a reset time but
     * the store does not provide one.
     *
     * @param resetTime {Date | undefined} - The timestamp when the client's hit count will be reset.
     *
     * @returns {void}
     */
    headersResetTime(resetTime?: Date): void;
    /**
     * Checks the options.validate setting to ensure that only recognized validations are enabled or disabled.
     *
     * If any unrecognized values are found, an error is logged that includes the list of supported vaidations.
     */
    validationsConfig(): void;
};
export type Validations = typeof validations;
/**
 * Creates a copy of the validations object where each method is wrapped to catch and log any thrown errors.
 * Sets `enabled` to the provided value, allowing different instances of express-rate-limit to have different validations settings.
 *
 * @param enabled {boolean} - The list of enabled validations.
 *
 * @returns {Validations} - The validation functions.
 */
export declare const getValidations: (_enabled: boolean | EnabledValidations) => Validations;
export {};
