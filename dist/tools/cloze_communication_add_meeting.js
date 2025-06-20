/**
 * Cloze Add Meeting Tool
 * Creates a new meeting record in Cloze CRM
 */
import { addMeeting } from '../api/endpoints/communications.js';
import { createToolHandler } from './utils/index.js';
import { meetingCommunicationSchema } from './utils/param_validation_communication.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_communication_add_meeting tool
 */
const paramSchema = meetingCommunicationSchema;
/**
 * Create a new meeting in Cloze CRM
 */
const handler = async (params) => {
    logger.info('Adding new meeting:', params);
    // Call the API to create the meeting
    const response = await addMeeting(params);
    logger.info('Meeting added successfully');
    return response;
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_communication_add_meeting',
    description: `Adds a new meeting record to Cloze CRM.
  
Required parameters:
- date: Date and time of the meeting (ISO 8601 format, e.g., "2023-05-14T14:30:00Z")
  Note: Date must be in the past or present, future dates return error
- subject: Title of the meeting
- from: Email address of the meeting organizer

Optional parameters:
- location: Physical or virtual location of the meeting
- duration: Duration of the meeting in minutes (default: 60)
- recipients: Array of attendees, each containing:
  - value: Email address of the attendee
  - name: Name of the attendee (optional)
- body: Meeting notes or description
- bodytype: Format of the body content ("text" or "html")
- references: Array of related entities, each containing:
  - type: Entity type ("person", "company", or "project")
  - value: Identifier (syncKey) of the referenced entity

The date parameter must be in the past or present, as Cloze API doesn't support future-dated communications.
`,
};
//# sourceMappingURL=cloze_communication_add_meeting.js.map