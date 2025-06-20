/**
 * Cloze Delete People Tool
 * Deletes a person from Cloze CRM
 */
import { z } from 'zod';
import { deletePerson } from '../api/endpoints/people.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_delete_people tool
 */
const paramSchema = z.object({
    uniqueid: z.string()
        .describe('Email or syncKey of the person to delete')
});
/**
 * Delete a person from Cloze CRM
 */
const handler = async (params) => {
    logger.info(`Deleting person with ID: ${params.uniqueid}`);
    // Call the API to delete the person
    const response = await deletePerson(params.uniqueid);
    logger.info('Person deleted successfully');
    return response;
};
// Transform the response to a more user-friendly format
const transformResponse = () => {
    return {
        success: true,
        message: 'Person deleted successfully'
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler, transformResponse);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_delete_people',
    description: `Deletes a person from Cloze CRM.
  
Required parameters:
- uniqueid: Email or syncKey of the person to delete

It's safer to use syncKey instead of email when possible. For email identifiers, the API resolves the email to a syncKey first. If the person is not found, an error will be returned with code 62.`,
};
//# sourceMappingURL=cloze_delete_people.js.map