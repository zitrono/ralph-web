/**
 * Cloze Metadata Get Stages Tool
 * Gets available stages for a specific entity type in Cloze CRM
 */
import { z } from 'zod';
import { getStages } from '../api/endpoints/metadata.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_metadata_get_stages tool
 */
const entityTypeEnum = z.enum(['people', 'projects']);
// Schema with default value for API parameter extraction
const paramSchemaWithDefault = z.object({
    entityType: entityTypeEnum.default('people')
        .describe('Entity type (people or projects)')
});
// Final schema without default for the createToolHandler
const paramSchema = z.object({
    entityType: entityTypeEnum
        .describe('Entity type (people or projects)')
});
/**
 * Get stages for a specific entity type in Cloze CRM
 */
const handler = async (rawParams) => {
    // Parse with the schema that has defaults
    const params = paramSchemaWithDefault.parse(rawParams);
    logger.info(`Getting stages for entity type: ${params.entityType}`);
    // Call the API to get stages
    const response = await getStages(params.entityType);
    logger.info(`Retrieved ${response.list?.length || 0} stages for ${params.entityType}`);
    return response;
};
// Transform the response for a cleaner format
const transformResponse = (response) => {
    return {
        entityType: response.entityType || 'people',
        stages: response.list || [],
        count: response.list?.length || 0
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler, transformResponse);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_metadata_get_stages',
    description: `Gets available stages for a specific entity type in Cloze CRM.
  
Parameters:
- entityType: Entity type to get stages for (people or projects, defaults to people)

Returns an object containing:
- entityType: The entity type requested
- stages: Array of stage objects, each containing:
  - name: Display name of the stage
  - key: Unique key for the stage used in API calls
- count: Total number of stages returned

People stages include:
- lead (Lead)
- future (Potential)
- current (Active)
- past (Inactive)
- out (Lost)

Project stages include:
- future (Potential)
- current (Active)
- pending (Pending)
- won (Done)
- lost (Lost)

Companies use the same stages as people.`,
};
//# sourceMappingURL=cloze_metadata_get_stages.js.map