/**
 * Cloze Update Company Tool
 * Updates an existing company in Cloze CRM
 */

import { z } from 'zod';
import { updateCompany } from '../api/endpoints/companies.js';
import { createToolHandler, personSegmentSchema, personStageSchema } from './utils/index.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_update_company tool
 */
const paramSchema = z.object({
  // Required fields for identification
  name: z.string()
    .describe('Company name (required for identification)'),
  domains: z.array(z.string())
    .describe('Array of domain names (required for identification)'),
  
  // Optional fields to update
  segment: personSegmentSchema,
  stage: personStageSchema,
  description: z.string().optional()
    .describe('Company description'),
  industry: z.string().optional()
    .describe('Industry name'),
  location: z.string().optional()
    .describe('Location of the company (e.g., "San Francisco, CA")'),
  keywords: z.array(z.string()).optional()
    .describe('Tags for the company')
});

/**
 * Update an existing company in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info('Updating company:', params);
  
  // Call the API to update the company
  const response = await updateCompany(params);
  
  logger.info('Company updated successfully');
  return response;
};

// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_update_company',
  description: `Updates an existing company in Cloze CRM.
  
Required parameters:
- name: Company name (required for identification)
- domains: Array of domain names (required for identification)

Optional parameters (only include fields you want to update):
- segment: Company segment (customer, partner, competitor, family, friend, network, coworker, none)
- stage: Company stage (lead, future, current, past, out)
- description: Company description
- industry: Industry name
- location: Text description of location
- keywords: Array of tags

Note: Even when using other identifiers, name and domains are required for company updates.
The tool will only update the fields you provide in the request.`,
};