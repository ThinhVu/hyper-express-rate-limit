"use strict";
// /source/lib.ts
// The option parser and rate limiting middleware
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const headers_1 = require("./headers");
const validations_1 = require("./validations");
const memory_store_1 = __importDefault(require("./memory-store"));
/**
 * Type guard to check if a store is legacy store.
 *
 * @param store {LegacyStore | Store} - The store to check.
 *
 * @return {boolean} - Whether the store is a legacy store.
 */
const isLegacyStore = (store) => 
// Check that `incr` exists but `increment` does not - store authors might want
// to keep both around for backwards compatibility.
typeof store.incr === 'function' &&
    typeof store.increment !== 'function';
/**
 * Converts a legacy store to the promisified version.
 *
 * @param store {LegacyStore | Store} - The store passed to the middleware.
 *
 * @returns {Store} - The promisified version of the store.
 */
const promisifyStore = (passedStore) => {
    if (!isLegacyStore(passedStore)) {
        // It's not an old store, return as is
        return passedStore;
    }
    const legacyStore = passedStore;
    // A promisified version of the store
    class PromisifiedStore {
        async increment(key) {
            return new Promise((resolve, reject) => {
                legacyStore.incr(key, (error, totalHits, resetTime) => {
                    if (error)
                        reject(error);
                    resolve({ totalHits, resetTime });
                });
            });
        }
        async decrement(key) {
            return legacyStore.decrement(key);
        }
        async resetKey(key) {
            return legacyStore.resetKey(key);
        }
        /* istanbul ignore next */
        async resetAll() {
            if (typeof legacyStore.resetAll === 'function')
                return legacyStore.resetAll();
        }
    }
    return new PromisifiedStore();
};
/**
 * Converts a `Configuration` object to a valid `Options` object, in case the
 * configuration needs to be passed back to the user.
 *
 * @param config {Configuration} - The configuration object to convert.
 *
 * @returns {Partial<Options>} - The options derived from the configuration.
 */
const getOptionsFromConfig = (config) => {
    const { validations, ...directlyPassableEntries } = config;
    return {
        ...directlyPassableEntries,
        validate: validations.enabled,
    };
};
/**
 *
 * Remove any options where their value is set to undefined. This avoids overwriting defaults
 * in the case a user passes undefined instead of simply omitting the key.
 *
 * @param passedOptions {Options} - The options to omit.
 *
 * @returns {Options} - The same options, but with all undefined fields omitted.
 *
 * @private
 */
const omitUndefinedOptions = (passedOptions) => {
    const omittedOptions = {};
    for (const k of Object.keys(passedOptions)) {
        const key = k;
        if (passedOptions[key] !== undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            // @ts-ignore
            omittedOptions[key] = passedOptions[key];
        }
    }
    return omittedOptions;
};
/**
 * Type-checks and adds the defaults for options the user has not specified.
 *
 * @param options {Options} - The options the user specifies.
 *
 * @returns {Configuration} - A complete configuration object.
 */
const parseOptions = (passedOptions) => {
    var _a, _b, _c, _d, _e;
    // Passing undefined should be equivalent to not passing an option at all, so we'll
    // omit all fields where their value is undefined.
    const notUndefinedOptions = omitUndefinedOptions(passedOptions);
    // Create the validator before even parsing the rest of the options.
    const validations = (0, validations_1.getValidations)((_a = notUndefinedOptions === null || notUndefinedOptions === void 0 ? void 0 : notUndefinedOptions.validate) !== null && _a !== void 0 ? _a : true);
    validations.validationsConfig();
    // Warn for the deprecated options. Note that these options have been removed
    // from the type definitions in v7.
    validations.draftPolliHeaders(
    // @ts-expect-error see the note above.
    notUndefinedOptions.draft_polli_ratelimit_headers);
    // @ts-expect-error see the note above.
    validations.onLimitReached(notUndefinedOptions.onLimitReached);
    // The default value for the `standardHeaders` option is `false`. If set to
    // `true`, it resolve to `draft-6`. `draft-7` (recommended) is used only if
    // explicitly set.
    let standardHeaders = (_b = notUndefinedOptions.standardHeaders) !== null && _b !== void 0 ? _b : false;
    if (standardHeaders === true)
        standardHeaders = 'draft-6';
    // See ./types.ts#Options for a detailed description of the options and their
    // defaults.
    const config = {
        windowMs: 60 * 1000,
        limit: (_c = passedOptions.max) !== null && _c !== void 0 ? _c : 5, // `max` is deprecated, but support it anyways.
        message: 'Too many requests, please try again later.',
        statusCode: 429,
        legacyHeaders: (_d = passedOptions.headers) !== null && _d !== void 0 ? _d : true,
        requestPropertyName: 'rateLimit',
        skipFailedRequests: false,
        skipSuccessfulRequests: false,
        requestWasSuccessful: (_request, response) => 
        // @ts-ignore
        response.statusCode < 400,
        skip: (_request, _response) => false,
        keyGenerator(request, _response) {
            // Run the validation checks on the IP and headers to make sure everything
            // is working as intended.
            validations.ip(request.ip);
            validations.trustProxy(request);
            validations.xForwardedForHeader(request);
            // By default, use the IP address to rate limit users.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            return request.ip;
        },
        async handler(request, response, _optionsUsed) {
            // Set the response status code.
            response.status(config.statusCode);
            // Call the `message` if it is a function.
            const message = typeof config.message === 'function'
                ? await config.message(request, response)
                : config.message;
            // Send the response if writable.
            if (!response.writableEnded) {
                // @ts-ignore
                response.send(message);
            }
        },
        // Allow the default options to be overriden by the options passed to the middleware.
        ...notUndefinedOptions,
        // `standardHeaders` is resolved into a draft version above, use that.
        standardHeaders,
        // Note that this field is declared after the user's options are spread in,
        // so that this field doesn't get overriden with an un-promisified store!
        store: promisifyStore((_e = notUndefinedOptions.store) !== null && _e !== void 0 ? _e : new memory_store_1.default()),
        // Print an error to the console if a few known misconfigurations are detected.
        validations,
    };
    // Ensure that the store passed implements the `Store` interface
    if (typeof config.store.increment !== 'function' ||
        typeof config.store.decrement !== 'function' ||
        typeof config.store.resetKey !== 'function' ||
        (config.store.resetAll !== undefined &&
            typeof config.store.resetAll !== 'function') ||
        (config.store.init !== undefined && typeof config.store.init !== 'function')) {
        throw new TypeError('An invalid store was passed. Please ensure that the store is a class that implements the `Store` interface.');
    }
    return config;
};
/**
 * Just pass on any errors for the developer to handle, usually as a HTTP 500
 * Internal Server Error.
 *
 * @param fn {RequestHandler} - The request handler for which to handle errors.
 *
 * @returns {RequestHandler} - The request handler wrapped with a `.catch` clause.
 *
 * @private
 */
const handleAsyncErrors = (fn) => async (request, response, next) => {
    try {
        await Promise.resolve(fn(request, response, next)).catch(next);
    }
    catch (error) {
        /* istanbul ignore next */
        // @ts-ignore
        next(error);
    }
};
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
const rateLimit = (passedOptions) => {
    // Parse the options and add the default values for unspecified options
    const config = parseOptions(passedOptions !== null && passedOptions !== void 0 ? passedOptions : {});
    const options = getOptionsFromConfig(config);
    // Call the `init` method on the store, if it exists
    if (typeof config.store.init === 'function')
        config.store.init(options);
    // Then return the actual middleware
    const middleware = handleAsyncErrors(async (request, response) => {
        // First check if we should skip the request
        const skip = await config.skip(request, response);
        if (skip) {
            return;
        }
        // Create an augmented request
        const augmentedRequest = request;
        // Get a unique key for the client
        const key = await config.keyGenerator(request, response);
        // Increment the client's hit counter by one.
        const { totalHits, resetTime } = await config.store.increment(key);
        // Make sure that -
        // - the hit count is incremented only by one.
        // - the returned hit count is a positive integer.
        config.validations.positiveHits(totalHits);
        config.validations.singleCount(request, config.store, key);
        // Get the limit (max number of hits) for each client.
        const retrieveLimit = typeof config.limit === 'function'
            ? config.limit(request, response)
            : config.limit;
        const limit = await retrieveLimit;
        config.validations.limit(limit);
        // Define the rate limit info for the client.
        const info = {
            limit,
            used: totalHits,
            remaining: Math.max(limit - totalHits, 0),
            resetTime,
        };
        // Set the `current` property on the object, but hide it from iteration
        // and `JSON.stringify`. See the `./types#RateLimitInfo` for details.
        Object.defineProperty(info, 'current', {
            configurable: false,
            enumerable: false,
            value: totalHits,
        });
        // Set the rate limit information on the augmented request object
        augmentedRequest[config.requestPropertyName] = info;
        // Set the `X-RateLimit` headers on the response object if enabled.
        if (config.legacyHeaders && !response.headersSent) {
            (0, headers_1.setLegacyHeaders)(response, info);
        }
        // Set the standardized `RateLimit-*` headers on the response object if
        // enabled.
        if (config.standardHeaders && !response.headersSent) {
            if (config.standardHeaders === 'draft-6') {
                (0, headers_1.setDraft6Headers)(response, info, config.windowMs);
            }
            else if (config.standardHeaders === 'draft-7') {
                config.validations.headersResetTime(info.resetTime);
                (0, headers_1.setDraft7Headers)(response, info, config.windowMs);
            }
        }
        // If we are to skip failed/successfull requests, decrement the
        // counter accordingly once we know the status code of the request
        if (config.skipFailedRequests || config.skipSuccessfulRequests) {
            let decremented = false;
            const decrementKey = async () => {
                if (!decremented) {
                    await config.store.decrement(key);
                    decremented = true;
                }
            };
            if (config.skipFailedRequests) {
                response.on('finish', async () => {
                    if (!(await config.requestWasSuccessful(request, response)))
                        await decrementKey();
                });
                response.on('close', async () => {
                    if (!response.writableEnded)
                        await decrementKey();
                });
                response.on('error', async () => {
                    await decrementKey();
                });
            }
            if (config.skipSuccessfulRequests) {
                response.on('finish', async () => {
                    if (await config.requestWasSuccessful(request, response))
                        await decrementKey();
                });
            }
        }
        // Disable the validations, since they should have run at least once by now.
        config.validations.disable();
        // If the client has exceeded their rate limit, set the Retry-After header
        // and call the `handler` function.
        if (totalHits > limit) {
            if (config.legacyHeaders || config.standardHeaders) {
                (0, headers_1.setRetryAfterHeader)(response, info, config.windowMs);
            }
            await config.handler(request, response, options);
            return;
        }
    });
    const getThrowFn = () => {
        throw new Error('The current store does not support the get/getKey method');
    };
    middleware.resetKey =
        config.store.resetKey.bind(config.store);
    middleware.getKey =
        typeof config.store.get === 'function'
            ? config.store.get.bind(config.store)
            : getThrowFn;
    return middleware;
};
// Export it to the world!
exports.default = rateLimit;
