/**
 * Cloze Metadata Get Segments Tool
 * Gets available segments for a specific entity type in Cloze CRM
 */
import { z } from 'zod';
import { getSegments } from '../api/endpoints/metadata.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_metadata_get_segments tool
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
 * Get segments for a specific entity type in Cloze CRM
 */
const handler = async (rawParams) => {
    // Parse with the schema that has defaults
    const params = paramSchemaWithDefault.parse(rawParams);
    logger.info(`Getting segments for entity type: ${params.entityType}`);
    // Call the API to get segments
    const response = await getSegments(params.entityType);
    logger.info(`Retrieved ${response.list?.length || 0} segments for ${params.entityType}`);
    return response;
};
// Transform the response for a cleaner format
const transformResponse = (response) => {
    return {
        entityType: response.entityType || 'people',
        segments: response.list || [],
        count: response.list?.length || 0
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler, transformResponse);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_metadata_get_segments',
    description: `Gets available segments for a specific entity type in Cloze CRM.
  
Parameters:
- entityType: Entity type to get segments for (people or projects, defaults to people)

Returns an object containing:
- entityType: The entity type requested
- segments: Array of segment objects, each containing:
  - name: Display name of the segment
  - key: Unique key for the segment used in API calls
- count: Total number of segments returned

People segments include:
- customer (Client)
- partner (Partner)
- competitor (Competitor)
- family (Family)
- friend (Friend)
- network (Connection)
- coworker (Coworker)
- none (None)

Project segments include:
- project (Project)
- project1 (Process Improvement)
- none (None)

Companies use the same segments as people.`,
};
//# sourceMappingURL=cloze_metadata_get_segments.js.map