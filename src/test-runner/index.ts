/**
 * Test runner entry point
 * Runs all workflow tests to verify MCP server functionality with rate limiting
 */

import logger from '../logging.js';
import { TestServer, runTests } from './runner.js';
import { sleep } from './utils.js';
import { testPeopleWorkflow } from './workflows/people_workflow.js';
import { testCompanyWorkflow } from './workflows/company_workflow.js';
import { testProjectWorkflow } from './workflows/project_workflow.js';
import { testCommunicationWorkflow } from './workflows/communication_workflow.js';
import { testTagWorkflow } from './workflows/tag_workflow.js';
import { testLocationWorkflow } from './workflows/location_workflow.js';
import { testHealthMetadataWorkflow } from './workflows/health_metadata_workflow.js';

// Rate limiting configuration
const RATE_LIMIT = {
  enabled: true,         // Whether to apply rate limiting
  delay: 500,            // Minimum delay between API calls in milliseconds
  lastCallTime: 0,       // Timestamp of the last API call
};

/**
 * Apply rate limiting between API calls
 */
async function applyRateLimit() {
  if (!RATE_LIMIT.enabled) return;
  
  const now = Date.now();
  const elapsedSinceLastCall = now - RATE_LIMIT.lastCallTime;
  
  if (elapsedSinceLastCall < RATE_LIMIT.delay) {
    const waitTime = RATE_LIMIT.delay - elapsedSinceLastCall;
    logger.debug(`Rate limiting: Waiting ${waitTime}ms before next API call`);
    await sleep(waitTime);
  }
  
  RATE_LIMIT.lastCallTime = Date.now();
}

/**
 * Create a rate-limited test server
 */
class RateLimitedTestServer extends TestServer {
  /**
   * Override callTool to apply rate limiting
   */
  async callTool(name: string, args: Record<string, any> = {}): Promise<any> {
    // Apply rate limiting before making the API call
    await applyRateLimit();
    
    // Call the original method
    return super.callTool(name, args);
  }
}

/**
 * Main function to run all tests
 */
async function main() {
  logger.info('Starting Cloze CRM MCP tests with rate limiting');
  
  // Process command line arguments
  const args = process.argv.slice(2);
  const singleTestMode = args.length > 0;
  const testToRun = singleTestMode ? args[0] : null;
  
  // Create the rate-limited test server
  const server = new RateLimitedTestServer();
  
  try {
    // Start the server
    await server.start();
    
    // If running a single test
    if (singleTestMode && testToRun) {
      logger.info(`Running single test: ${testToRun}`);
      
      switch (testToRun.toLowerCase()) {
        case 'people':
          await testPeopleWorkflow(server);
          break;
        case 'company':
          await testCompanyWorkflow(server);
          break;
        case 'project':
          await testProjectWorkflow(server);
          break;
        case 'communication':
          await testCommunicationWorkflow(server);
          break;
        case 'tag':
          await testTagWorkflow(server);
          break;
        case 'location':
          await testLocationWorkflow(server);
          break;
        case 'health':
          await testHealthMetadataWorkflow(server);
          break;
        default:
          logger.error(`Unknown test: ${testToRun}`);
          process.exit(1);
      }
      
      logger.info(`Test ${testToRun} completed successfully`);
    } else {
      // Run all enabled tests
      // For now, only enable the People Workflow test since we're focusing on people tools
      await runTests([
        { name: 'People Workflow', test: () => testPeopleWorkflow(server) },
        // The following tests are commented out until we convert them to real API calls
        // { name: 'Company Workflow', test: () => testCompanyWorkflow(server) },
        // { name: 'Project Workflow', test: () => testProjectWorkflow(server) },
        // { name: 'Communication Workflow', test: () => testCommunicationWorkflow(server) },
        // { name: 'Tag Management Workflow', test: () => testTagWorkflow(server) },
        // { name: 'Location Workflow', test: () => testLocationWorkflow(server) }
      ]);
      
      logger.info('All tests completed successfully');
    }
  } catch (error) {
    logger.error('Tests failed:', error);
    process.exit(1);
  } finally {
    // Stop the server
    await server.stop();
  }
}

// Run the tests
main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});