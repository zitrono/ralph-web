/**
 * Test utilities for the Cloze MCP server
 * Provides helper functions for tests
 */
import { TestServer } from './runner.js';
/**
 * Handle API errors in a consistent way for testing
 */
export declare function handleApiError(error: any, toolName: string): Record<string, any>;
/**
 * Retry a function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    shouldRetry?: (error: any) => boolean;
}): Promise<T>;
/**
 * Check if an error is due to rate limiting
 */
export declare function isRateLimitError(error: any): boolean;
/**
 * Get the appropriate delay time from a rate limit error
 * Returns milliseconds to wait, or 0 if no specific wait time is provided
 */
export declare function getRateLimitDelay(error: any): number;
/**
 * Generate a random email address for testing
 */
export declare function generateRandomEmail(): string;
/**
 * Assert that a condition is true
 */
export declare function assert(condition: boolean, message?: string): void;
/**
 * Sleep for a specified number of milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Class to encapsulate test steps and assertions
 */
export declare class TestHelper {
    private server;
    constructor(server: TestServer);
    /**
     * Call a tool and log the result
     */
    callTool(name: string, args?: Record<string, any>): Promise<any>;
    /**
     * Assert that a condition is true
     */
    assert(condition: boolean, message?: string): void;
    /**
     * Assert that two values are equal
     */
    assertEquals(actual: any, expected: any, message?: string): void;
    /**
     * Assert that a value contains the expected properties
     */
    assertContains(actual: any, expected: any, message?: string): void;
    /**
     * Assert that an operation succeeds (doesn't throw an error)
     */
    assertSucceeds(operation: () => Promise<any>, message?: string): Promise<any>;
    /**
     * Assert that an operation fails (throws an error)
     */
    assertFails(operation: () => Promise<any>, message?: string): Promise<void>;
}
