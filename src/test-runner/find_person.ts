#!/usr/bin/env node
/**
 * Find Person Test Runner
 * Runs a test to find a person by search query
 * 
 * Usage: node find_person.js "search query"
 */

import { TestServer } from './runner.js';
import { testFindPerson } from './tests/find_person_test.js';
import logger from '../logging.js';

/**
 * Main function to run the find person test
 */
async function main() {
  // Get the search query from command line args
  const args = process.argv.slice(2);
  if (args.length === 0) {
    logger.error('Error: No search query provided');
    console.log('Usage: node find_person.js "search query"');
    process.exit(1);
  }
  
  const searchQuery = args[0];
  logger.info(`Starting Find Person test with query: "${searchQuery}"`);
  
  // Create the test server
  const server = new TestServer();
  
  try {
    // Start the server
    await server.start();
    
    // Run the test
    const success = await testFindPerson(server, searchQuery);
    
    // Report results
    if (success) {
      logger.info('Find Person test completed successfully');
      process.exit(0);
    } else {
      logger.error('Find Person test failed');
      process.exit(1);
    }
  } catch (error) {
    logger.error('Error running Find Person test:', error);
    process.exit(1);
  } finally {
    // Stop the server
    await server.stop();
  }
}

// Run the test
main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});