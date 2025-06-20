/**
 * Cloze Get People Locations Tool
 * Gets location information for a person in Cloze CRM
 */

import { z } from 'zod';
import { getPersonLocations } from '../api/endpoints/people.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_get_people_locations tool
 */
const paramSchema = z.object({
  email: z.string().email()
    .describe('Email address of the person to get locations for')
});

/**
 * Get location information for a person in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info(`Getting locations for person: ${params.email}`);
  
  // Call the API to get the person's locations
  const response = await getPersonLocations(params.email);
  
  if (!response.people || response.people.length === 0) {
    logger.info(`No person found with email: ${params.email}`);
    return {
      errorcode: 0,
      email: params.email,
      found: false,
      message: 'Person not found',
      location: null,
      addresses: null
    };
  }
  
  const person = response.people[0];
  logger.info(`Found locations for person ${params.email}`);
  
  return {
    errorcode: 0,
    email: params.email,
    found: true,
    name: person.name,
    location: person.location || null,
    addresses: person.addresses || null
  };
};

// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_get_people_locations',
  description: `Gets location information for a person in Cloze CRM.
  
Required parameters:
- email: Email address of the person to get locations for

Returns:
- Location information if the person is found, including both the simple location field and structured addresses

Example:
{
  "email": "person@example.com"
}

Example Response:
{
  "email": "person@example.com",
  "found": true,
  "name": "John Doe",
  "location": "San Francisco, CA",
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

If the person is not found, returns an object with found: false.`,
};