/**
 * Cloze Add Company Location Tool
 * Adds or updates a location for a company in Cloze CRM
 */
import { z } from 'zod';
import { addCompanyLocation } from '../api/endpoints/companies.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_add_company_location tool
 */
const paramSchema = z.object({
    // Required fields for identification
    name: z.string()
        .describe('Company name (required for identification)'),
    domains: z.array(z.string())
        .describe('Array of domain names (required for identification)'),
    // Required location field
    location: z.string()
        .describe('Location of the company (e.g., "San Francisco, CA")')
});
/**
 * Add or update a location for a company in Cloze CRM
 */
const handler = async (params) => {
    logger.info('Adding location to company:', params);
    // Call the API to update the company location
    const response = await addCompanyLocation(params);
    logger.info('Company location added successfully');
    return response;
};
// Transform the response
const transformResponse = () => {
    return {
        success: true,
        message: 'Company location updated successfully'
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler, transformResponse);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_add_company_location',
    description: `Adds or updates a location for a company in Cloze CRM.
  
Required parameters:
- name: Company name (required for identification)
- domains: Array of domain names (required for identification)
- location: Text description of location (e.g., "San Francisco, CA")

Companies support only a simple text location field.
Any location update will overwrite the previous location value.`,
};
//# sourceMappingURL=cloze_add_company_location.js.map