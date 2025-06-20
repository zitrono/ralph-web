/**
 * Cloze Create Company Tag Tool
 * Adds tags to a company in Cloze CRM
 */

import { z } from 'zod';
import { createCompanyTag } from '../api/endpoints/companies.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_create_company_tag tool
 */
const paramSchema = z.object({
  // Required fields
  name: z.string()
    .describe('Company name'),
  domains: z.array(z.string()).min(1)
    .describe('Array of domain names for the company (required for identification)'),
  tags: z.array(z.string()).min(1)
    .describe('Array of tags to add to the company')
});

/**
 * Add tags to a company in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info('Creating tags for company:', params);
  
  // Prepare company data with tags
  const companyData = {
    name: params.name,
    domains: params.domains,
    keywords: params.tags
  };
  
  // Create the tags
  const response = await createCompanyTag(companyData);
  
  logger.info(`Tags added successfully for company ${params.name}`);
  return {
    errorcode: 0,
    success: true,
    message: `Tags added for company ${params.name}`,
    tags: params.tags
  };
};

// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_create_company_tag',
  description: `Adds tags to a company in Cloze CRM.
  
Required parameters:
- name: Company name
- domains: Array of domain names for the company (required for identification)
- tags: Array of tags to add to the company

All tags provided will be added to the company. If the company already has tags, 
this operation will replace all existing tags with the new set of tags.

Example:
{
  "name": "Acme Inc",
  "domains": ["acme.com"],
  "tags": ["client", "priority", "active"]
}

Note: This operation is destructive - it will overwrite any existing tags
the company may have. To preserve existing tags, first use cloze_read_company_tag
to get the current tags, then include all existing tags plus new ones.`,
};