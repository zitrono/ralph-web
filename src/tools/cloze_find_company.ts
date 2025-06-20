/**
 * Cloze Find Company Tool
 * Searches for companies in Cloze CRM
 */

import { z } from 'zod';
import { findCompanies } from '../api/endpoints/companies.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_find_company tool
 */
const paramSchema = z.object({
  // At least one of these search parameters
  freeformquery: z.string().optional()
    .describe('Free form search query (most effective for searching)'),
  name: z.string().optional()
    .describe('Company name'),
  domain: z.string().optional()
    .describe('Company domain'),
  
  // Pagination parameters
  pagesize: z.number().min(1).max(100).optional()
    .describe('Number of results per page (default: 10)'),
  pagenumber: z.number().min(1).optional()
    .describe('Page number (default: 1)')
}).refine(data => data.freeformquery || data.name || data.domain, {
  message: 'At least one of freeformquery, name, or domain must be provided',
  path: ['freeformquery']
});

/**
 * Search for companies in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info('Finding companies with params:', params);
  
  // Process pagination parameters
  const searchParams = { ...params };
  
  // Convert pagesize to number if it's a string
  if (typeof searchParams.pagesize === 'string') {
    searchParams.pagesize = parseInt(searchParams.pagesize, 10);
  }
  
  // Convert pagenumber to number if it's a string
  if (typeof searchParams.pagenumber === 'string') {
    searchParams.pagenumber = parseInt(searchParams.pagenumber, 10);
  }
  
  // Call the API to find companies
  const response = await findCompanies(searchParams);
  
  logger.info(`Found ${response.companies.length} companies out of ${response.availablecount} total matches`);
  return response;
};

// Transform the response to format pagination information
const transformResponse = (response: any) => {
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
  name: 'cloze_find_company',
  description: `Searches for companies in Cloze CRM.
  
Required parameters:
- At least one of:
  - freeformquery: Free form search query (most effective for searching)
  - name: Company name
  - domain: Company domain

Optional parameters:
- pagesize: Number of results per page (default: 10)
- pagenumber: Page number (default: 1)

Using the freeformquery parameter with a company name or domain provides the best search results.
Using domain for search typically gives more precise results than searching by name.`,
};