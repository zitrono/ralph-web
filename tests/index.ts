/**
 * Main test runner
 * Executes all tests for the Cloze MCP server
 */

import { runTests } from '../src/test-runner/runner.js';
import { TestServer } from '../src/test-runner/runner.js';
import { testPeopleWorkflow } from '../src/test-runner/workflows/people_workflow.js';
import { testCompanyWorkflow } from '../src/test-runner/workflows/company_workflow.js';
import logger from '../src/logging.js';

/**
 * Main function to run all tests
 */
async function main() {
  logger.info('Starting Cloze MCP server tests');
  
  try {
    await runTests([
      {
        name: 'People CRUD Lifecycle',
        test: async () => {
          const server = new TestServer();
          await server.start();
          
          try {
            await testPeopleWorkflow(server);
          } finally {
            await server.stop();
          }
        }
      },
      {
        name: 'Company CRUD Lifecycle',
        test: async () => {
          const server = new TestServer();
          await server.start();
          
          try {
            await testCompanyWorkflow(server);
          } finally {
            await server.stop();
          }
        }
      }
      // Additional tests will be added here
    ]);
    
    logger.info('All tests completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Tests failed:', error);
    process.exit(1);
  }
}

// Run the tests
main().catch(error => {
  logger.error('Unhandled error in tests:', error);
  process.exit(1);
});