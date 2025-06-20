/**
 * Self-destruct timer for tests
 * Provides utilities to prevent test processes from hanging
 */
import logger from '../../logging.js';
/**
 * Set a global timeout that will force exit the process if not cleared
 */
export function setSelfDestructTimer(timeoutMs = 30000) {
    logger.info(`Setting self-destruct timer for ${timeoutMs}ms`);
    const timerId = setTimeout(() => {
        logger.error(`SELF-DESTRUCT: Process timed out after ${timeoutMs}ms`);
        logger.error('SELF-DESTRUCT: Forcing process exit');
        // Force exit the process
        process.exit(1);
    }, timeoutMs);
    // Return a function to cancel the self-destruct
    return {
        cancel: () => {
            logger.info('Cancelling self-destruct timer');
            clearTimeout(timerId);
        }
    };
}
/**
 * Create a self-destruct wrapper for an async function
 */
export function withSelfDestruct(fn, timeoutMs = 30000) {
    // Set up the self-destruct timer
    const selfDestruct = setSelfDestructTimer(timeoutMs);
    // Wrap the function execution
    return fn()
        .then(result => {
        selfDestruct.cancel();
        return result;
    })
        .catch(error => {
        selfDestruct.cancel();
        throw error;
    });
}
//# sourceMappingURL=self-destruct-timer.js.map