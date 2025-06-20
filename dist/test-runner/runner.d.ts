/**
 * Test runner for the Cloze MCP server
 * Provides functionality to run tests against the Cloze API directly
 * Includes self-destruct timeouts to prevent hanging tests
 */
/**
 * Default timeout values (in milliseconds)
 */
export declare const DEFAULT_TIMEOUTS: {
    OPERATION: number;
    REQUEST: number;
    SHUTDOWN: number;
};
/**
 * Class to manage direct API calls with timeout protection
 */
export declare class TestServer {
    private timeouts;
    private operationComplete;
    private selfDestructTimer;
    /**
     * Start the test runner with self-destruct timers
     */
    start(timeoutMs?: number): Promise<void>;
    /**
     * Stop the test runner and clean up resources
     */
    stop(): Promise<void>;
    /**
     * Set a timeout with a name
     */
    private setTimeout;
    /**
     * Clear a specific timeout by name
     */
    private clearTimeout;
    /**
     * Clear all timeouts
     */
    private clearAllTimeouts;
    /**
     * Clean up resources gracefully
     */
    private cleanup;
    /**
     * Force cleanup when timeout occurs
     */
    private forceCleanup;
    /**
     * Call a tool using real API client with request timeout
     */
    callTool(name: string, args?: Record<string, any>): Promise<any>;
    /**
     * Add test identification to prevent conflicts with production data
     */
    private addTestIdentifier;
}
/**
 * Interface for test functions
 */
export interface TestFunction {
    (): Promise<void>;
}
/**
 * Run a test with the server
 */
export declare function runTest(name: string, testFn: TestFunction): Promise<void>;
/**
 * Run multiple tests sequentially
 */
export declare function runTests(tests: {
    name: string;
    test: TestFunction;
}[]): Promise<void>;
