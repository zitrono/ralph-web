/**
 * Cloze Find Project Tool
 * Searches for projects in Cloze CRM
 */

import { z } from 'zod';
import { findProjects } from '../api/endpoints/projects.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_find_project tool
 */
const paramSchema = z.object({
  // At least one of these search parameters
  freeformquery: z.string().optional()
    .describe('Free form search query (most effective for searching)'),
  name: z.string().optional()
    .describe('Project name'),
  query: z.string().optional()
    .describe('General search query for project'),
  
  // Pagination parameters
  pagesize: z.number().min(1).max(100).optional()
    .describe('Number of results per page (default: 10)'),
  pagenumber: z.number().min(1).optional()
    .describe('Page number (default: 1)')
}).refine(data => data.freeformquery || data.name || data.query, {
  message: 'At least one of freeformquery, name, or query must be provided',
  path: ['freeformquery']
});

/**
 * Search for projects in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info('Finding projects with params:', params);
  
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
  
  // Call the API to find projects
  const response = await findProjects(searchParams);
  
  logger.info(`Found ${response.projects.length} projects out of ${response.availablecount} total matches`);
  return response;
};

// Transform the response to format pagination information
const transformResponse = (response: any) => {
  return {
    projects: response.projects,
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
  name: 'cloze_find_project',
  description: `Searches for projects in Cloze CRM.
  
Required parameters:
- At least one of:
  - freeformquery: Free form search query (most effective for searching)
  - name: Project name
  - query: General search query for project

Optional parameters:
- pagesize: Number of results per page (default: 10)
- pagenumber: Page number (default: 1)

Using the freeformquery parameter provides the best search results.
The endpoint doesn't support direct searching by ID or syncKey.`,
};