/**
 * Cloze Read Company Tag Tool
 * Gets tags for a company in Cloze CRM
 */
import { z } from 'zod';
import { readCompanyTags } from '../api/endpoints/companies.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_read_company_tag tool
 */
const paramSchema = z.object({
    identifier: z.string()
        .describe('Company name or domain to search for')
});
/**
 * Get tags for a company in Cloze CRM
 */
const handler = async (params) => {
    logger.info(`Reading tags for company: ${params.identifier}`);
    // Call the API to get the company's tags
    const response = await readCompanyTags(params.identifier);
    // Format the response to focus on the tags
    if (response.companies && response.companies.length > 0) {
        const company = response.companies[0];
        return {
            errorcode: 0,
            name: company.name,
            domains: company.domains || [],
            tags: company.keywords || [],
            total: company.keywords?.length || 0
        };
    }
    // Return empty tags if company not found
    return {
        errorcode: 0,
        identifier: params.identifier,
        tags: [],
        total: 0,
        message: 'Company not found or has no tags'
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_read_company_tag',
    description: `Gets tags for a company in Cloze CRM.
  
Required parameters:
- identifier: Company name or domain to search for

Returns an object containing:
- name: The name of the company (if found)
- domains: Array of domains for the company
- tags: Array of tags for the company
- total: Total number of tags

Example:
{
  "identifier": "acme.com"
}

Example Response:
{
  "name": "Acme Inc",
  "domains": ["acme.com"],
  "tags": ["client", "priority", "active"],
  "total": 3
}

If the company is not found or has no tags, returns an empty tags array.`,
};
//# sourceMappingURL=cloze_read_company_tag.js.map