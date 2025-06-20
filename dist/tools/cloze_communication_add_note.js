/**
 * Cloze Add Note Tool
 * Creates a new note record in Cloze CRM
 */
import { addNote } from '../api/endpoints/communications.js';
import { createToolHandler } from './utils/index.js';
import { noteCommunicationSchema } from './utils/param_validation_communication.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_communication_add_note tool
 */
const paramSchema = noteCommunicationSchema;
/**
 * Create a new note in Cloze CRM
 */
const handler = async (params) => {
    logger.info('Adding new note:', params);
    // Call the API to create the note
    const response = await addNote(params);
    logger.info('Note added successfully');
    return response;
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_communication_add_note',
    description: `Adds a new note record to Cloze CRM.
  
Required parameters:
- date: Date and time of the note (ISO 8601 format, e.g., "2023-05-14T14:30:00Z")
  Note: Date must be in the past or present, future dates return error
- subject: Title of the note
- from: Email address of the note creator

Optional parameters:
- body: Content of the note
- bodytype: Format of the body content ("text" or "html")
- references: Array of related entities, each containing:
  - type: Entity type ("person", "company", or "project")
  - value: Identifier (syncKey) of the referenced entity

The date parameter must be in the past or present, as Cloze API doesn't support future-dated communications.
Notes can be linked to specific people, companies, or projects using the references array.
`,
};
//# sourceMappingURL=cloze_communication_add_note.js.map