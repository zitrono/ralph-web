/**
 * Cloze Find Nearby Companies Tool
 * Finds companies near a specific location
 */
import { z } from 'zod';
import { findNearbyCompanies } from '../api/endpoints/companies.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_find_nearby_companies tool
 */
const paramSchema = z.object({
    // Required location parameter
    location: z.string()
        .describe('Location to search near (e.g., "New York" or "Berlin")'),
    // Pagination parameters
    pagesize: z.number().min(1).max(100).optional()
        .describe('Number of results per page (default: 10)'),
    pagenumber: z.number().min(1).optional()
        .describe('Page number (default: 1)')
});
/**
 * Find companies near a specific location
 */
const handler = async (params) => {
    logger.info('Finding companies near location:', params.location);
    // Extract location and pagination parameters
    const { location, ...paginationParams } = params;
    // Call the API to find nearby companies
    const response = await findNearbyCompanies(location, paginationParams);
    logger.info(`Found ${response.companies.length} companies near "${location}"`);
    return response;
};
// Transform the response to format pagination information
const transformResponse = (response) => {
    return {
        companies: response.companies,
        pagination: {
            totalCount: response.availablecount,
            page: response.pagenumber || 1,
            pageSize: response.pagesize || 10,
            totalPages: Math.ceil(response.availablecount / (response.pagesize || 10))
        }
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler, transformResponse);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_find_nearby_companies',
    description: `Finds companies near a specific location.
  
Required parameters:
- location: Location to search near (e.g., "New York" or "Berlin")

Optional parameters:
- pagesize: Number of results per page (default: 10)
- pagenumber: Page number (default: 1)

This tool uses the Cloze location search feature, which is based on text matching rather than precise geolocation.
Results are based on the "near:" search operator in Cloze.`,
};
//# sourceMappingURL=cloze_find_nearby_companies.js.map