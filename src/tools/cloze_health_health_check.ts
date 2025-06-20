/**
 * Cloze Health Check Tool
 * Checks the health and connectivity of the Cloze API
 */

import { z } from 'zod';
import { healthCheck } from '../api/endpoints/health.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';

/**
 * No parameters needed for this tool
 */
const paramSchema = z.object({});

/**
 * Check the health of the Cloze API
 */
const handler = async () => {
  logger.info('Performing Cloze API health check');
  
  // Call the API to check health
  const response = await healthCheck();
  
  logger.info(`Health check complete. Status: ${response.data.status}`);
  return {
    errorcode: 0,
    ...response
  };
};

// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_health_health_check',
  description: `Checks the health and connectivity of the Cloze API.
  
This tool verifies that the Cloze API is accessible and that authentication is working properly.
No parameters are required.

Returns:
- success: true/false indicating if the health check was successful
- data: An object containing health status information
  - status: "healthy" or "unhealthy"
  - apiConnectivity: true/false indicating if the API can be reached
  - authenticated: true/false indicating if authentication is working
  - profile: User profile information (if authenticated)

This tool uses the Cloze user profile endpoint as a proxy for health checking.`,
};