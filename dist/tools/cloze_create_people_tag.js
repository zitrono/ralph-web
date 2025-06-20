/**
 * Cloze Create People Tag Tool
 * Adds tags to a person in Cloze CRM
 */
import { z } from 'zod';
import { createPersonTag } from '../api/endpoints/people.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_create_people_tag tool
 */
const paramSchema = z.object({
    // Required fields
    email: z.string().email()
        .describe('Email address of the person to tag'),
    tags: z.array(z.string()).min(1)
        .describe('Array of tags to add to the person')
});
/**
 * Add tags to a person in Cloze CRM
 */
const handler = async (params) => {
    logger.info('Creating tags for person:', params);
    // Get the existing tags first
    // For this initial implementation, we'll assume there are no existing tags
    // In a more complete implementation, we would first read existing tags
    // Create the tags
    const response = await createPersonTag(params.email, params.tags);
    logger.info(`Tags added successfully for person ${params.email}`);
    return {
        errorcode: 0,
        success: true,
        message: `Tags added successfully for person ${params.email}`,
        tags: params.tags
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_create_people_tag',
    description: `Adds tags to a person in Cloze CRM.
  
Required parameters:
- email: Email address of the person to tag
- tags: Array of tags to add to the person

All tags provided will be added to the person. If the person already has tags, 
this operation will replace all existing tags with the new set of tags.

Example:
{
  "email": "person@example.com",
  "tags": ["client", "priority", "active"]
}

Note: This operation is destructive - it will overwrite any existing tags
the person may have. To preserve existing tags, first use cloze_read_people_tag
to get the current tags, then include all existing tags plus new ones.`,
};
//# sourceMappingURL=cloze_create_people_tag.js.map