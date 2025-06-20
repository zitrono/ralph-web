/**
 * Cloze Update People Tool
 * Updates an existing person in Cloze CRM
 */
import { z } from 'zod';
import { updatePerson } from '../api/endpoints/people.js';
import { createToolHandlerWithEnhancedValidation, personEmailSchema, personPhoneSchema, personAddressSchema, personSegmentSchema, personStageSchema } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_update_people tool
 */
export const paramSchema = z.object({
    // Identifier (required): Either syncKey or include the person's email in the emails array
    syncKey: z.string().optional()
        .describe('Unique identifier for the person (preferred if available)'),
    // At least one email is required if syncKey is not provided
    emails: z.array(personEmailSchema).optional()
        .describe('Email addresses for the person (required if syncKey not provided)'),
    // Optional fields to update
    name: z.string().optional()
        .describe('Full name of the person'),
    first: z.string().optional()
        .describe('First name of the person'),
    last: z.string().optional()
        .describe('Last name of the person'),
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
}).refine(data => data.syncKey || (data.emails && data.emails.length > 0), {
    message: 'Either syncKey or at least one email must be provided',
    path: ['emails']
});
/**
 * Schema enhancements to add examples and additional information
 */
export const schemaEnhancements = {
    syncKey: {
        examples: ["example-syncKey"],
        description: "Parameter: syncKey"
    },
    emails: {
        examples: [[]],
        description: "Parameter: emails"
    },
    name: {
        examples: ["example-name"],
        description: "Parameter: name"
    },
    first: {
        examples: ["example-first"],
        description: "Parameter: first"
    },
    last: {
        examples: ["example-last"],
        description: "Parameter: last"
    },
    phones: {
        examples: [1, 10, 100],
        description: "Parameter: phones"
    },
    company: {
        examples: ["example-company"],
        description: "Parameter: company"
    },
    job_title: {
        examples: ["example-job_title"],
        description: "Parameter: job_title"
    },
    segment: {
        examples: [],
        description: "Parameter: segment"
    },
    stage: {
        examples: [],
        description: "Parameter: stage"
    },
    location: {
        examples: ["example-location"],
        description: "Parameter: location"
    },
    addresses: {
        examples: [[]],
        description: "Parameter: addresses"
    },
    keywords: {
        examples: ["example-keywords"],
        description: "Parameter: keywords"
    },
    customFields: {
        examples: ["example-customFields"],
        description: "Parameter: customFields"
    }
};
/**
 * Update an existing person in Cloze CRM
 */
const handler = async (params) => {
    logger.info('Updating person:', params);
    // Ensure emails is not undefined if provided
    const updateData = { ...params };
    if (!updateData.emails) {
        delete updateData.emails;
    }
    // Call the API to update the person
    const response = await updatePerson(updateData);
    logger.info('Person updated successfully');
    return response;
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandlerWithEnhancedValidation(paramSchema, schemaEnhancements, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_update_people',
    description: `Updates an existing person in Cloze CRM.
  
Required parameters:
- Either syncKey or at least one email address in the emails array

Optional parameters (only include fields you want to update):
- name: Full name of the person
- first: First name of the person
- last: Last name of the person
- phones: Array of phone objects
- company: Company name
- job_title: Job title
- segment: Person segment (customer, partner, competitor, family, friend, network, coworker, none)
- stage: Person stage (lead, future, current, past, out)
- location: Text description of location
- addresses: Array of structured address objects
- keywords: Array of tags

The tool will only update the fields you provide in the request.`,
};
//# sourceMappingURL=cloze_update_people.js.map