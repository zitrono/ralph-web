/**
 * Cloze Add People Location Tool
 * Adds or updates location information for a person in Cloze CRM
 */

import { z } from 'zod';
import { addPersonLocation } from '../api/endpoints/people.js';
import { createToolHandler } from './utils/index.js';
import { personEmailSchema, personAddressSchema } from './utils/param_validation.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_add_people_location tool
 */
const paramSchema = z.object({
  // Required fields
  email: z.string().email()
    .describe('Email address of the person to update'),
  
  // Location fields (at least one is required)
  location: z.string().optional()
    .describe('Text description of the person\'s location (e.g., "New York, NY")'),
  addresses: z.array(personAddressSchema).optional()
    .describe('Array of structured address objects')
}).refine(data => data.location || data.addresses, {
  message: 'Either location or addresses must be provided',
  path: ['location']
});

/**
 * Add location information to a person in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info('Adding location for person:', params);
  
  // Prepare the person data with location info
  const personData = {
    emails: [{ value: params.email }],
    ...(params.location && { location: params.location }),
    ...(params.addresses && { addresses: params.addresses })
  };
  
  // Call the API to update the person's location
  const response = await addPersonLocation(personData);
  
  logger.info(`Location added successfully for person ${params.email}`);
  return {
    errorcode: 0,
    success: true,
    message: `Location updated for person ${params.email}`,
    location: params.location,
    addresses: params.addresses
  };
};

// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_add_people_location',
  description: `Adds or updates location information for a person in Cloze CRM.
  
Required parameters:
- email: Email address of the person to update
- Either location or addresses (or both) must be provided:
  - location: Text description of location (e.g., "New York, NY")
  - addresses: Array of structured address objects, each containing:
    - street: Street address
    - city: City name
    - state: State or province
    - postal_code: ZIP or postal code
    - country: Country code (e.g., "US")
    - primary: Set to true if this is the primary address
    - work: Set to true if this is a work address
    - home: Set to true if this is a home address

Example with simple location:
{
  "email": "person@example.com",
  "location": "San Francisco, CA"
}

Example with structured address:
{
  "email": "person@example.com",
  "addresses": [
    {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94105",
      "country": "US",
      "work": true
    }
  ]
}

Note: This operation will overwrite any existing location information.`,
};