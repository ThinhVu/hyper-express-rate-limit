import type { Store, Options, ClientRateLimitInfo } from './types';
/**
 * The record that stores information about a client - namely, how many times
 * they have hit the endpoint, and when their hit count resets.
 *
 * Similar to `ClientRateLimitInfo`, except `resetTime` is a compulsory field.
 */
type Client = {
    totalHits: number;
    resetTime: Date;
};
/**
 * A `Store` that stores the hit count for each client in memory.
 *
 * @public
 */
export default class MemoryStore implements Store {
    /**
     * The duration of time before which all hit counts are reset (in milliseconds).
     */
    windowMs: number;
    /**
     * These two maps store usage (requests) and reset time by key (for example, IP
     * addresses or API keys).
     *
     * They are split into two to avoid having to iterate through the entire set to
     * determine which ones need reset. Instead, `Client`s are moved from `previous`
     * to `current` as they hit the endpoint. Once `windowMs` has elapsed, all clients
     * left in `previous`, i.e., those that have not made any recent requests, are
     * known to be expired and can be deleted in bulk.
     */
    previous: Map<string, Client>;
    current: Map<string, Client>;
    /**
     * A reference to the active timer.
     */
    interval?: NodeJS.Timeout;
    /**
     * Confirmation that the keys incremented in once instance of MemoryStore
     * cannot affect other instances.
     */
    localKeys: boolean;
    /**
     * Method that initializes the store.
     *
     * @param options {Options} - The options used to setup the middleware.
     */
    init(options: Options): void;
    /**
     * Method to fetch a client's hit count and reset time.
     *
     * @param key {string} - The identifier for a client.
     *
     * @returns {ClientRateLimitInfo | undefined} - The number of hits and reset time for that client.
     *
     * @public
     */
    get(key: string): Promise<ClientRateLimitInfo | undefined>;
    /**
     * Method to increment a client's hit counter.
     *
     * @param key {string} - The identifier for a client.
     *
     * @returns {ClientRateLimitInfo} - The number of hits and reset time for that client.
     *
     * @public
     */
    increment(key: string): Promise<ClientRateLimitInfo>;
    /**
     * Method to decrement a client's hit counter.
     *
     * @param key {string} - The identifier for a client.
     *
     * @public
     */
    decrement(key: string): Promise<void>;
    /**
     * Method to reset a client's hit counter.
     *
     * @param key {string} - The identifier for a client.
     *
     * @public
     */
    resetKey(key: string): Promise<void>;
    /**
     * Method to reset everyone's hit counter.
     *
     * @public
     */
    resetAll(): Promise<void>;
    /**
     * Method to stop the timer (if currently running) and prevent any memory
     * leaks.
     *
     * @public
     */
    shutdown(): void;
    /**
     * Recycles a client by setting its hit count to zero, and reset time to
     * `windowMs` milliseconds from now.
     *
     * NOT to be confused with `#resetKey()`, which removes a client from both the
     * `current` and `previous` maps.
     *
     * @param client {Client} - The client to recycle.
     * @param now {number} - The current time, to which the `windowMs` is added to get the `resetTime` for the client.
     *
     * @return {Client} - The modified client that was passed in, to allow for chaining.
     */
    private resetClient;
    /**
     * Retrieves or creates a client, given a key. Also ensures that the client being
     * returned is in the `current` map.
     *
     * @param key {string} - The key under which the client is (or is to be) stored.
     *
     * @returns {Client} - The requested client.
     */
    private getClient;
    /**
     * Move current clients to previous, create a new map for current.
     *
     * This function is called every `windowMs`.
     */
    private clearExpired;
}
export {};
