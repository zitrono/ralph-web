/**
 * Cloze Health Connection Status Tool
 * Gets detailed information about the Cloze API connection status
 */

import { z } from 'zod';
import { connectionStatus } from '../api/endpoints/health.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';

/**
 * No parameters needed for this tool
 */
const paramSchema = z.object({});

/**
 * Get the connection status of the Cloze API
 */
const handler = async () => {
  logger.info('Getting Cloze API connection status');
  
  // Call the API to get connection status
  const response = await connectionStatus();
  
  logger.info(`Connection status check complete. Status: ${response.data.status}`);
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
  name: 'cloze_health_health_connection_status',
  description: `Gets detailed information about the Cloze API connection status.
  
This tool checks the connection status to the Cloze API and provides additional details about the current session.
No parameters are required.

Returns:
- success: true/false indicating if the connection check was successful
- data: An object containing connection status information
  - status: "connected" or "disconnected"
  - authenticated: true/false indicating if authentication is working
  - requestLimit: Information about API rate limits (if available)
  - remainingRequests: Number of remaining requests in the rate limit window (if available)
  - rateLimitReset: Time until rate limit reset (if available)
  - detailed: Additional information about the connection
    - apiVersion: The API version being used
    - userEmail: The email address of the authenticated user
    - userName: The name of the authenticated user

This tool uses the Cloze user profile endpoint to check connection status.`,
};