/**
 * Cloze Metadata Raw Tool
 * Access raw metadata endpoints directly
 */

import { z } from 'zod';
import { accessRawMetadata } from '../api/endpoints/metadata.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_metadata_raw tool
 */
const paramSchema = z.object({
  endpoint: z.string()
    .refine(val => val.startsWith('/v1/user/'), {
      message: 'Endpoint must start with /v1/user/'
    })
    .describe('Raw metadata endpoint path (must start with /v1/user/)')
});

/**
 * Access a raw metadata endpoint in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info(`Accessing raw metadata endpoint: ${params.endpoint}`);
  
  // Call the API to access the raw endpoint
  const response = await accessRawMetadata(params.endpoint);
  
  logger.info(`Raw metadata access complete for endpoint: ${params.endpoint}`);
  return response;
};

// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_metadata_raw',
  description: `Access raw metadata endpoints directly in Cloze CRM.
  
Parameters:
- endpoint: Raw metadata endpoint path (must start with /v1/user/)

This tool allows direct access to raw metadata endpoints in the Cloze API.
It's a fallback for accessing endpoints that don't have dedicated tools.

The following endpoints are known to work:
- /v1/user/profile (get user profile information)
- /v1/user/stages/people (get people stages)
- /v1/user/stages/projects (get project stages)
- /v1/user/segments/people (get people segments)
- /v1/user/segments/projects (get project segments)

Many other /v1/user/ endpoints may return 404 errors.

Example:
{
  "endpoint": "/v1/user/profile"
}`,
};