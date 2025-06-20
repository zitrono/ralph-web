/**
 * Test utilities for the Cloze MCP server
 * Provides helper functions for tests
 */
import { randomUUID } from 'crypto';
import logger from '../logging.js';
/**
 * Handle API errors in a consistent way for testing
 */
export function handleApiError(error, toolName) {
    // Extract information from the error
    const status = error.response?.status;
    const errorCode = error.response?.data?.errorcode;
    const message = error.response?.data?.message || error.message;
    logger.error(`API error in tool ${toolName}:`, {
        status,
        errorCode,
        message
    });
    // Return a formatted error response
    return {
        error: {
            tool: toolName,
            status,
            errorCode,
            message
        }
    };
}
/**
 * Retry a function with exponential backoff
 */
export async function retry(fn, options = {}) {
    const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, factor = 2, shouldRetry = () => true } = options;
    let attempt = 0;
    let delay = initialDelay;
    while (true) {
        try {
            return await fn();
        }
        catch (error) {
            attempt++;
            // Check if we should retry
            if (attempt >= maxRetries || !shouldRetry(error)) {
                throw error;
            }
            // Handle rate limiting specifically
            if (isRateLimitError(error)) {
                const rateLimitDelay = getRateLimitDelay(error);
                if (rateLimitDelay > 0) {
                    delay = rateLimitDelay;
                    logger.warn(`Rate limit hit. Waiting ${delay}ms before retrying...`);
                }
                else {
                    // Calculate next delay with exponential backoff
                    delay = Math.min(delay * factor, maxDelay);
                }
            }
            else {
                // Calculate next delay with exponential backoff for non-rate-limit errors
                delay = Math.min(delay * factor, maxDelay);
            }
            // Log retry attempt
            logger.info(`Retrying after error (attempt ${attempt}/${maxRetries}), waiting ${delay}ms...`);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}
/**
 * Check if an error is due to rate limiting
 */
export function isRateLimitError(error) {
    // Check HTTP status code 429 (Too Many Requests)
    if (error.response?.status === 429) {
        return true;
    }
    // Check for common rate limit error codes
    if (error.response?.data?.errorcode === 'RATE_LIMIT_EXCEEDED' ||
        error.response?.data?.errorcode === 'TOO_MANY_REQUESTS') {
        return true;
    }
    // Check for rate limit keywords in error message
    const message = error.response?.data?.message || error.message || '';
    return message.toLowerCase().includes('rate limit') ||
        message.toLowerCase().includes('too many requests');
}
/**
 * Get the appropriate delay time from a rate limit error
 * Returns milliseconds to wait, or 0 if no specific wait time is provided
 */
export function getRateLimitDelay(error) {
    // Check for Retry-After header (standard way to indicate retry time)
    const retryAfter = error.response?.headers?.['retry-after'];
    if (retryAfter) {
        // Convert to milliseconds (Retry-After is in seconds)
        return parseInt(retryAfter, 10) * 1000;
    }
    // Check for rate reset time in the response
    const resetTime = error.response?.data?.rateLimitReset ||
        error.response?.data?.rateLimit?.reset ||
        error.response?.headers?.['x-rate-limit-reset'];
    if (resetTime) {
        if (typeof resetTime === 'number') {
            // If it's a timestamp, calculate the wait time
            const now = Math.floor(Date.now() / 1000);
            if (resetTime > now) {
                return (resetTime - now) * 1000 + 100; // Add a small buffer
            }
        }
        else if (typeof resetTime === 'string') {
            // Try to parse as a number or date
            if (!isNaN(parseInt(resetTime, 10))) {
                const resetTimestamp = parseInt(resetTime, 10);
                const now = Math.floor(Date.now() / 1000);
                if (resetTimestamp > now) {
                    return (resetTimestamp - now) * 1000 + 100;
                }
            }
            else {
                try {
                    const resetDate = new Date(resetTime);
                    const waitTime = resetDate.getTime() - Date.now();
                    if (waitTime > 0) {
                        return waitTime + 100;
                    }
                }
                catch (e) {
                    // Ignore parsing errors
                }
            }
        }
    }
    // Default rate limit delay if no specific information is provided
    return 5000; // 5 seconds is a reasonable default
}
/**
 * Generate a random email address for testing
 */
export function generateRandomEmail() {
    const randomId = randomUUID().slice(0, 8);
    return `test-${randomId}@example.com`;
}
/**
 * Assert that a condition is true
 */
export function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}
/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Class to encapsulate test steps and assertions
 */
export class TestHelper {
    server;
    constructor(server) {
        this.server = server;
    }
    /**
     * Call a tool and log the result
     */
    async callTool(name, args = {}) {
        const result = await this.server.callTool(name, args);
        logger.debug(`Tool ${name} returned:`, result);
        return result;
    }
    /**
     * Assert that a condition is true
     */
    assert(condition, message) {
        assert(condition, message);
    }
    /**
     * Assert that two values are equal
     */
    assertEquals(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
        }
    }
    /**
     * Assert that a value contains the expected properties
     */
    assertContains(actual, expected, message) {
        for (const [key, value] of Object.entries(expected)) {
            if (JSON.stringify(actual[key]) !== JSON.stringify(value)) {
                throw new Error(message || `Expected ${key} to be ${JSON.stringify(value)} but got ${JSON.stringify(actual[key])}`);
            }
        }
    }
    /**
     * Assert that an operation succeeds (doesn't throw an error)
     */
    async assertSucceeds(operation, message) {
        try {
            return await operation();
        }
        catch (error) {
            throw new Error(message || `Expected operation to succeed, but it failed: ${error}`);
        }
    }
    /**
     * Assert that an operation fails (throws an error)
     */
    async assertFails(operation, message) {
        try {
            await operation();
            throw new Error(message || 'Expected operation to fail, but it succeeded');
        }
        catch (error) {
            // Expected failure
            return;
        }
    }
}
//# sourceMappingURL=utils.js.map