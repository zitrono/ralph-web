/**
 * Cloze Update People Tag Tool
 * Updates a specific tag for a person in Cloze CRM
 */
import { z } from 'zod';
import { readPersonTags, updatePersonTag } from '../api/endpoints/people.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_update_people_tag tool
 */
const paramSchema = z.object({
    email: z.string().email()
        .describe('Email address of the person'),
    oldTag: z.string()
        .describe('The existing tag to update'),
    newTag: z.string()
        .describe('The new tag value')
});
/**
 * Update a tag for a person in Cloze CRM
 */
const handler = async (params) => {
    logger.info(`Updating tag ${params.oldTag} to ${params.newTag} for person: ${params.email}`);
    // First get the existing tags
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
    // Check if the old tag exists
    if (!existingTags.includes(params.oldTag)) {
        return {
            errorcode: 1,
            success: false,
            message: `Tag '${params.oldTag}' not found for person ${params.email}`,
            currentTags: existingTags
        };
    }
    // Replace the old tag with the new tag
    const updatedTags = existingTags.map((tag) => tag === params.oldTag ? params.newTag : tag);
    // Update the person with the new tags
    const response = await updatePersonTag(params.email, updatedTags);
    logger.info(`Tag updated successfully for person ${params.email}`);
    return {
        errorcode: 0,
        success: true,
        message: `Tag '${params.oldTag}' updated to '${params.newTag}' for person ${params.email}`,
        tags: updatedTags
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_update_people_tag',
    description: `Updates a specific tag for a person in Cloze CRM.
  
Required parameters:
- email: Email address of the person
- oldTag: The existing tag to update
- newTag: The new tag value

This tool will find the specified tag in the person's tags and replace it with the new value.
If the old tag doesn't exist, the operation will fail.

Example:
{
  "email": "person@example.com",
  "oldTag": "client",
  "newTag": "partner"
}

The operation will first get all existing tags, then replace only the specified tag.`,
};
//# sourceMappingURL=cloze_update_people_tag.js.map