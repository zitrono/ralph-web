/**
 * Cloze List Projects Tool
 * Lists projects in Cloze CRM with pagination
 */
import { z } from 'zod';
import { listProjects } from '../api/endpoints/projects.js';
import { createToolHandler, projectStageSchema } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_list_projects tool
 */
const paramSchema = z.object({
    // Optional search parameters
    query: z.string().optional()
        .describe('Search text to filter projects'),
    stage: projectStageSchema,
    companyId: z.string().optional()
        .describe('Company filter'),
    // Pagination parameters
    pagesize: z.number().min(1).max(100).optional()
        .describe('Number of results per page (default: 10)'),
    cursor: z.string().optional()
        .describe('Cursor token for pagination (from previous response)')
});
/**
 * List projects in Cloze CRM
 */
const handler = async (params) => {
    logger.info('Listing projects with params:', params);
    // Process pagination parameters
    const listParams = { ...params };
    // Convert pagesize to number if it's a string
    if (typeof listParams.pagesize === 'string') {
        listParams.pagesize = parseInt(listParams.pagesize, 10);
    }
    // Call the API to list projects
    const response = await listProjects(listParams);
    logger.info(`Found ${response.projects.length} projects out of ${response.availablecount} total matches`);
    return response;
};
// Transform the response to format pagination information
const transformResponse = (response) => {
    return {
        projects: response.projects,
        pagination: {
            totalCount: response.availablecount,
            pageSize: response.pagesize || 10,
            hasMoreResults: response.projects.length === (response.pagesize || 10) && response.projects.length < response.availablecount,
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
    name: 'cloze_list_projects',
    description: `Lists projects in Cloze CRM with pagination.
  
Optional parameters:
- query: Search text to filter projects
- stage: Stage filter (future, current, pending, won, lost)
- companyId: Company filter
- pagesize: Number of results per page (default: 10)
- cursor: Cursor token for pagination (from previous response)

This tool uses cursor-based pagination rather than page numbers.
The cursor value should be passed in subsequent requests to get the next page.
Empty query returns all projects.
Results are sorted chronologically by firstSeen date (newest first).`,
};
//# sourceMappingURL=cloze_list_projects.js.map