/**
 * Cloze Create Company Tool
 * Creates a new company in Cloze CRM
 */
import { z } from 'zod';
import { createCompany } from '../api/endpoints/companies.js';
import { createToolHandler, personSegmentSchema, personStageSchema } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_create_company tool
 */
const paramSchema = z.object({
    // Required fields
    name: z.string()
        .describe('Company name (required)'),
    // Optional fields
    domains: z.array(z.string()).optional()
        .describe('Array of domain names (e.g., ["company.com"])'),
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
 * Create a new company in Cloze CRM
 */
const handler = async (params) => {
    logger.info('Creating new company:', params);
    // Call the API to create the company
    const response = await createCompany(params);
    logger.info('Company created successfully');
    return response;
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_create_company',
    description: `Creates a new company in Cloze CRM.
  
Required parameters:
- name: Company name

Optional parameters:
- domains: Array of domain names (e.g., ["company.com"])
- segment: Company segment (customer, partner, competitor, family, friend, network, coworker, none)
- stage: Company stage (lead, future, current, past, out)
- description: Company description
- industry: Industry name
- location: Text description of location
- keywords: Array of tags

Domain names should be provided without protocol (e.g., "company.com" not "https://company.com").`,
};
//# sourceMappingURL=cloze_create_company.js.map