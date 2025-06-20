/**
 * Self-destruct test script
 * This script deliberately hangs to test the self-destruct feature
 */

import { TestServer } from './dist/test-runner/runner.js';
import logger from './dist/logging.js';

// Create a deliberately hanging test
async function runHangingTest() {
  logger.info('Starting hanging test to verify self-destruct timers');
  
  // Create test server with a short timeout (5 seconds)
  const server = new TestServer();
  
  try {
    // Start the server (this should have a 3 second startup timeout)
    await server.start(5000); // 5 second operation timeout
    
    logger.info('Server started, now entering an infinite wait...');
    
    // This promise never resolves, simulating a hanging test
    await new Promise(resolve => {
      logger.info('Test is now hanging, self-destruct should trigger soon...');
      // We never call resolve, so this promise never completes
    });
    
    // This code is never reached
    logger.info('This message should never appear');
    
  } catch (error) {
    logger.error('Error in hanging test:', error);
    throw error;
  } finally {
    // This is unlikely to be called since the process will be terminated
    logger.info('Test cleanup');
    await server.stop();
  }
}

// Run the hanging test
runHangingTest().catch(error => {
  logger.error('Fatal error in hanging test:', error);
  process.exit(1);
});