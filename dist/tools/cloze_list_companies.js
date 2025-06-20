/**
 * Cloze List Companies Tool
 * Lists companies in Cloze CRM with pagination
 */
import { z } from 'zod';
import { listCompanies } from '../api/endpoints/companies.js';
import { createToolHandler, personSegmentSchema } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_list_companies tool
 */
const paramSchema = z.object({
    // Optional search parameters
    query: z.string().optional()
        .describe('Search text to filter companies'),
    industry: z.string().optional()
        .describe('Industry filter'),
    segment: personSegmentSchema,
    // Pagination parameters
    pagesize: z.number().min(1).max(100).optional()
        .describe('Number of results per page (default: 10)'),
    cursor: z.string().optional()
        .describe('Cursor token for pagination (from previous response)')
});
/**
 * List companies in Cloze CRM
 */
const handler = async (params) => {
    logger.info('Listing companies with params:', params);
    // Process pagination parameters
    const listParams = { ...params };
    // Convert pagesize to number if it's a string
    if (typeof listParams.pagesize === 'string') {
        listParams.pagesize = parseInt(listParams.pagesize, 10);
    }
    // Call the API to list companies
    const response = await listCompanies(listParams);
    logger.info(`Found ${response.companies.length} companies out of ${response.availablecount} total matches`);
    return response;
};
// Transform the response to format pagination information
const transformResponse = (response) => {
    return {
        companies: response.companies,
        pagination: {
            totalCount: response.availablecount,
            pageSize: response.pagesize || 10,
            hasMoreResults: response.companies.length === (response.pagesize || 10) && response.companies.length < response.availablecount,
            nextCursor: response.cursor || null
        }
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler, transformResponse);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_list_companies',
    description: `Lists companies in Cloze CRM with pagination.
  
Optional parameters:
- query: Search text to filter companies
- industry: Industry filter
- segment: Segment filter (customer, partner, competitor, family, friend, network, coworker, none)
- pagesize: Number of results per page (default: 10)
- cursor: Cursor token for pagination (from previous response)

This tool uses cursor-based pagination rather than page numbers.
The cursor value should be passed in subsequent requests to get the next page.
Empty query returns all companies.`,
};
//# sourceMappingURL=cloze_list_companies.js.map