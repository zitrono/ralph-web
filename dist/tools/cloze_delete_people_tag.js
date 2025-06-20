/**
 * Cloze Delete People Tag Tool
 * Removes tags from a person in Cloze CRM
 */
import { z } from 'zod';
import { readPersonTags, deletePersonTag } from '../api/endpoints/people.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_delete_people_tag tool
 */
const paramSchema = z.object({
    email: z.string().email()
        .describe('Email address of the person'),
    tags: z.array(z.string()).min(1)
        .describe('Array of tags to remove from the person'),
    removeAll: z.boolean().optional()
        .default(false)
        .describe('Set to true to remove all tags from the person')
});
/**
 * Remove tags from a person in Cloze CRM
 */
const handler = async (params) => {
    logger.info(`Deleting tags for person: ${params.email}`, params.tags);
    // If removeAll is true, delete all tags
    if (params.removeAll) {
        const response = await deletePersonTag(params.email, []);
        logger.info(`All tags removed for person ${params.email}`);
        return {
            success: true,
            message: `All tags removed for person ${params.email}`,
            tags: []
        };
    }
    // Otherwise, get existing tags and remove the specified ones
    const existingTagsResponse = await readPersonTags(params.email);
    if (!existingTagsResponse.people || existingTagsResponse.people.length === 0) {
        return {
            errorcode: 1,
            success: false,
            message: `Person with email ${params.email} not found`
        };
    }
    const person = existingTagsResponse.people[0];
    const existingTags = person.keywords || [];
    // Check if any of the specified tags exist
    const tagsToRemove = params.tags.filter((tag) => existingTags.includes(tag));
    if (tagsToRemove.length === 0) {
        return {
            errorcode: 1,
            success: false,
            message: `None of the specified tags found for person ${params.email}`,
            currentTags: existingTags
        };
    }
    // Filter out the tags to remove
    const updatedTags = existingTags.filter((tag) => !params.tags.includes(tag));
    // Update the person with the remaining tags
    const response = await deletePersonTag(params.email, updatedTags);
    logger.info(`Tags removed successfully for person ${params.email}`);
    return {
        errorcode: 0,
        success: true,
        message: `Tags removed for person ${params.email}`,
        removedTags: tagsToRemove,
        remainingTags: updatedTags
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_delete_people_tag',
    description: `Removes tags from a person in Cloze CRM.
  
Required parameters:
- email: Email address of the person
- tags: Array of tags to remove from the person

Optional parameters:
- removeAll: Set to true to remove all tags from the person (defaults to false)

If removeAll is true, all tags will be removed regardless of the tags parameter.
Otherwise, only the specified tags will be removed.

Example:
{
  "email": "person@example.com",
  "tags": ["client", "priority"]
}

Example (remove all tags):
{
  "email": "person@example.com",
  "removeAll": true
}

The operation will get all existing tags, then remove only the specified tags.`,
};
//# sourceMappingURL=cloze_delete_people_tag.js.map