/**
 * Cloze Health Reset Connection Tool
 * Resets the connection to the Cloze API
 */

import { z } from 'zod';
import { resetConnection } from '../api/endpoints/health.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';

/**
 * No parameters needed for this tool
 */
const paramSchema = z.object({});

/**
 * Reset the connection to the Cloze API
 */
const handler = async () => {
  logger.info('Resetting Cloze API connection');
  
  // Call the API to reset the connection
  const response = await resetConnection();
  
  logger.info(`Connection reset complete. Status: ${response.data.status}`);
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
  name: 'cloze_health_health_reset_connection',
  description: `Resets the connection to the Cloze API.
  
This tool attempts to reset the connection to the Cloze API by clearing any cached data and verifying connectivity.
No parameters are required.

Returns:
- success: true/false indicating if the reset was successful
- data: An object containing reset status information
  - reset: true/false indicating if the connection was reset
  - cacheCleared: true/false indicating if the cache was cleared
  - rateLimitsReset: true/false indicating if rate limits were reset
  - status: A descriptive message about the reset operation

Note: Since the Cloze API does not have a dedicated reset endpoint, this tool simulates
reset behavior by verifying connectivity and clearing local caches. Actual rate limits
are controlled by the API server and cannot be reset by this tool.`,
};