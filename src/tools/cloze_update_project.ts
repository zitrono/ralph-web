/**
 * Cloze Update Project Tool
 * Updates an existing project in Cloze CRM
 */

import { z } from 'zod';
import { updateProject } from '../api/endpoints/projects.js';
import { createToolHandler, projectSegmentSchema, projectStageSchema, appLinkSchema } from './utils/index.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_update_project tool
 */
const paramSchema = z.object({
  // Required fields for identification
  name: z.string()
    .describe('Project name (required for identification)'),
  appLinks: z.array(appLinkSchema).min(1)
    .describe('Array of app links (at least one required, must include the original uniqueid)'),
  
  // Optional fields to update
  segment: projectStageSchema,
  stage: projectStageSchema,
  startDate: z.string().optional()
    .describe('Project start date in YYYY-MM-DD format'),
  endDate: z.string().optional()
    .describe('Project end date in YYYY-MM-DD format'),
  summary: z.string().optional()
    .describe('Project description')
});

/**
 * Update an existing project in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info('Updating project:', params);
  
  // Call the API to update the project
  const response = await updateProject(params);
  
  logger.info('Project updated successfully');
  return response;
};

// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_update_project',
  description: `Updates an existing project in Cloze CRM.
  
Required parameters:
- name: Project name (required for identification)
- appLinks: Array of app link objects, each containing:
  - uniqueid: A unique identifier for the project link (must match the original uniqueid)
  - source: Source system identifier
  - url: URL related to the project
  - label: Display label for the link

Optional parameters (only include fields you want to update):
- segment: Project segment (project, project1, none)
- stage: Project stage (future, current, pending, won, lost)
- startDate: Project start date in YYYY-MM-DD format
- endDate: Project end date in YYYY-MM-DD format
- summary: Project description

IMPORTANT: The uniqueid in appLinks must match the original uniqueid used when creating the project.
If a different uniqueid is provided, a new project will be created instead of updating the existing one.
Each project can only be identified by the combination of name and uniqueid in appLinks.`,
};