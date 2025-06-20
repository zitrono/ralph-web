/**
 * Cloze Read People Tag Tool
 * Gets tags for a person in Cloze CRM
 */
import { z } from 'zod';
import { readPersonTags } from '../api/endpoints/people.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_read_people_tag tool
 */
const paramSchema = z.object({
    email: z.string().email()
        .describe('Email address of the person to get tags for')
});
/**
 * Get tags for a person in Cloze CRM
 */
const handler = async (params) => {
    logger.info(`Reading tags for person: ${params.email}`);
    // Call the API to get the person's tags
    const response = await readPersonTags(params.email);
    // Format the response to focus on the tags
    if (response.people && response.people.length > 0) {
        const person = response.people[0];
        return {
            errorcode: 0,
            email: params.email,
            name: person.name,
            tags: person.keywords || [],
            total: person.keywords?.length || 0
        };
    }
    // Return empty tags if person not found
    return {
        errorcode: 0,
        email: params.email,
        tags: [],
        total: 0,
        message: 'Person not found or has no tags'
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_read_people_tag',
    description: `Gets tags for a person in Cloze CRM.
  
Required parameters:
- email: Email address of the person to get tags for

Returns an object containing:
- email: The email address of the person
- name: The name of the person (if found)
- tags: Array of tags for the person
- total: Total number of tags

Example:
{
  "email": "person@example.com"
}

Example Response:
{
  "email": "person@example.com",
  "name": "John Doe",
  "tags": ["client", "priority", "active"],
  "total": 3
}

If the person is not found or has no tags, returns an empty tags array.`,
};
//# sourceMappingURL=cloze_read_people_tag.js.map