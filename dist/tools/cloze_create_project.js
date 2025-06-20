/**
 * Cloze Create Project Tool
 * Creates a new project in Cloze CRM
 */
import { z } from 'zod';
import { createProject } from '../api/endpoints/projects.js';
import { createToolHandler, projectSegmentSchema, projectStageSchema, appLinkSchema } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_create_project tool
 */
const paramSchema = z.object({
    // Required fields
    name: z.string()
        .describe('Project name (required)'),
    appLinks: z.array(appLinkSchema).min(1)
        .describe('Array of app links (at least one required)'),
    // Optional fields
    segment: projectSegmentSchema,
    stage: projectStageSchema,
    startDate: z.string().optional()
        .describe('Project start date in YYYY-MM-DD format'),
    endDate: z.string().optional()
        .describe('Project end date in YYYY-MM-DD format'),
    summary: z.string().optional()
        .describe('Project description')
});
/**
 * Create a new project in Cloze CRM
 */
const handler = async (params) => {
    logger.info('Creating new project:', params);
    // Call the API to create the project
    const response = await createProject(params);
    logger.info('Project created successfully');
    return response;
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_create_project',
    description: `Creates a new project in Cloze CRM.
  
Required parameters:
- name: Project name
- appLinks: Array of app link objects, each containing:
  - uniqueid: A unique identifier for the project link
  - source: Source system identifier
  - url: URL related to the project
  - label: Display label for the link

Optional parameters:
- segment: Project segment (project, project1, none)
- stage: Project stage (future, current, pending, won, lost)
- startDate: Project start date in YYYY-MM-DD format
- endDate: Project end date in YYYY-MM-DD format
- summary: Project description

At least one appLink must be specified with a uniqueid. This uniqueid should be truly unique to avoid conflicts.`,
};
//# sourceMappingURL=cloze_create_project.js.map