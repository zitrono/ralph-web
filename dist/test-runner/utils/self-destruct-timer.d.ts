/**
 * Self-destruct timer for tests
 * Provides utilities to prevent test processes from hanging
 */
/**
 * Set a global timeout that will force exit the process if not cleared
 */
export declare function setSelfDestructTimer(timeoutMs?: number): {
    cancel: () => void;
};
/**
 * Create a self-destruct wrapper for an async function
 */
export declare function withSelfDestruct<T>(fn: () => Promise<T>, timeoutMs?: number): Promise<T>;
