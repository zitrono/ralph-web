/**
 * Cloze Get Company Locations Tool
 * Gets location information for a company in Cloze CRM
 */
import { z } from 'zod';
import { getCompanyLocations } from '../api/endpoints/companies.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_get_company_locations tool
 */
const paramSchema = z.object({
    identifier: z.string()
        .describe('Company name or domain to get locations for')
});
/**
 * Get location information for a company in Cloze CRM
 */
const handler = async (params) => {
    logger.info(`Getting locations for company: ${params.identifier}`);
    // Call the API to get the company's locations
    const response = await getCompanyLocations(params.identifier);
    if (!response.companies || response.companies.length === 0) {
        logger.info(`No company found with identifier: ${params.identifier}`);
        return {
            errorcode: 0,
            identifier: params.identifier,
            found: false,
            message: 'Company not found',
            location: null
        };
    }
    const company = response.companies[0];
    logger.info(`Found location for company ${company.name}`);
    return {
        errorcode: 0,
        identifier: params.identifier,
        found: true,
        name: company.name,
        domains: company.domains,
        location: company.location || null
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_get_company_locations',
    description: `Gets location information for a company in Cloze CRM.
  
Required parameters:
- identifier: Company name or domain to get locations for

Returns:
- Location information if the company is found

Example:
{
  "identifier": "acme.com"
}

Example Response:
{
  "identifier": "acme.com",
  "found": true,
  "name": "Acme Inc",
  "domains": ["acme.com"],
  "location": "San Francisco, CA"
}

If the company is not found, returns an object with found: false.

Note: Companies only support a simple text location field, unlike people which can have structured addresses.`,
};
//# sourceMappingURL=cloze_get_company_locations.js.map