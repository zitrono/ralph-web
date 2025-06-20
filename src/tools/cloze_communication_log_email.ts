/**
 * Cloze Log Email Tool
 * Logs an email record in Cloze CRM
 */

import { z } from 'zod';
import { logEmail } from '../api/endpoints/communications.js';
import { createToolHandler } from './utils/index.js';
import { emailCommunicationSchema } from './utils/param_validation_communication.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_communication_log_email tool
 */
const paramSchema = emailCommunicationSchema;

/**
 * Log an email in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info('Logging email:', params);
  
  // Call the API to log the email
  const response = await logEmail(params);
  
  logger.info('Email logged successfully');
  return response;
};

// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_communication_log_email',
  description: `Logs an email record in Cloze CRM.
  
Required parameters:
- date: Date and time when the email was sent (ISO 8601 format, e.g., "2023-05-14T14:30:00Z")
  Note: Date must be in the past or present, future dates return error
- subject: Subject line of the email
- from: Email address of the sender
- recipients: Array of email recipients, each containing:
  - value: Email address of the recipient
  - name: Name of the recipient (optional)

Optional parameters:
- body: Content of the email
- bodytype: Format of the body content ("text" or "html")
- references: Array of related entities, each containing:
  - type: Entity type ("person", "company", or "project")
  - value: Identifier (syncKey) of the referenced entity

The date parameter must be in the past or present, as Cloze API doesn't support future-dated communications.
At least one recipient is required for email communications.
`,
};