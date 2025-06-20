/**
 * Cloze Create People Tool
 * Creates a new person in Cloze CRM
 */

import { z } from 'zod';
import { createPerson } from '../api/endpoints/people.js';
import { createToolHandler, personEmailSchema, personPhoneSchema, personAddressSchema, personSegmentSchema, personStageSchema } from './utils/index.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_create_people tool
 */
const paramSchema = z.object({
  // Either name or first/last is required
  name: z.string().optional()
    .describe('Full name of the person (either name or first/last required)'),
  first: z.string().optional()
    .describe('First name of the person'),
  last: z.string().optional()
    .describe('Last name of the person'),
  
  // Require at least one email
  emails: z.array(personEmailSchema).min(1)
    .describe('Email addresses for the person (at least one required)'),
  
  // Optional fields
  phones: z.array(personPhoneSchema).optional()
    .describe('Phone numbers for the person'),
  company: z.string().optional()
    .describe('Company name'),
  job_title: z.string().optional()
    .describe('Job title'),
  segment: personSegmentSchema,
  stage: personStageSchema,
  location: z.string().optional()
    .describe('Location of the person (e.g., "New York, NY")'),
  addresses: z.array(personAddressSchema).optional()
    .describe('Structured addresses for the person'),
  keywords: z.array(z.string()).optional()
    .describe('Tags for the person'),
  
  // Additional custom fields
  customFields: z.record(z.string(), z.any()).optional()
    .describe('Custom fields for the person')
}).refine(data => data.name || (data.first && data.last), {
  message: 'Either name or both first and last name must be provided',
  path: ['name']
});

/**
 * Create a new person in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info('Creating new person:', params);
  
  // Emails are already an array from our schema
  
  // Call the API to create the person
  const response = await createPerson(params);
  
  logger.info('Person created successfully');
  return response;
};

// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_create_people',
  description: `Creates a new person in Cloze CRM.
  
Required parameters:
- Either name or both first and last name
- At least one email address

Optional parameters:
- phones: Array of phone objects
- company: Company name
- job_title: Job title
- segment: Person segment (customer, partner, competitor, family, friend, network, coworker, none)
- stage: Person stage (lead, future, current, past, out)
- location: Text description of location
- addresses: Array of structured address objects
- keywords: Array of tags`,
};