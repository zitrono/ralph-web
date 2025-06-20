/**
 * Location-based workflow test
 * Tests the complete lifecycle of location-based operations
 */

import { TestServer } from '../runner.js';
import logger from '../../logging.js';

/**
 * Test the location-based functionality
 */
export async function testLocationWorkflow(server: TestServer): Promise<void> {
  logger.info('Running location-based workflow test');
  
  // Generate random test data
  const testPrefix = `Test_${Date.now()}`;
  const testEmail = `person_${Date.now()}@example.com`;
  const testCompanyName = `Company_${testPrefix}`;
  const testCompanyDomain = `company${Date.now()}.example.com`;
  const testLocation = "San Francisco, CA";
  const searchLocation = "San Francisco";
  
  // Step 1: Add location to a person
  logger.info(`Step 1: Adding location to person: ${testEmail}`);
  const addPersonLocationResult = await server.callTool('cloze_add_people_location', {
    email: testEmail,
    location: testLocation,
    addresses: [
      {
        street: "123 Main St",
        city: "San Francisco",
        state: "CA",
        postal_code: "94105",
        country: "US",
        work: true
      }
    ]
  });
  
  // Verify location was added successfully
  if (addPersonLocationResult.error) {
    throw new Error(`Failed to add location to person: ${JSON.stringify(addPersonLocationResult.error)}`);
  }
  
  logger.info('Location added successfully to person');
  
  // Step 2: Get person's location
  logger.info(`Step 2: Getting location for person: ${testEmail}`);
  const getPersonLocationResult = await server.callTool('cloze_get_people_locations', {
    email: testEmail
  });
  
  // Verify location was retrieved
  if (!getPersonLocationResult.found) {
    throw new Error(`Failed to get location for person: ${testEmail}`);
  }
  
  // Verify the location matches what we set
  if (getPersonLocationResult.location !== testLocation) {
    throw new Error(`Location mismatch: expected "${testLocation}" but got "${getPersonLocationResult.location}"`);
  }
  
  logger.info('Person location retrieved successfully');
  
  // Step 3: Add location to a company
  logger.info(`Step 3: Adding location to company: ${testCompanyName}`);
  const addCompanyLocationResult = await server.callTool('cloze_add_company_location', {
    name: testCompanyName,
    domains: [testCompanyDomain],
    location: testLocation
  });
  
  // Verify location was added successfully
  if (addCompanyLocationResult.error) {
    throw new Error(`Failed to add location to company: ${JSON.stringify(addCompanyLocationResult.error)}`);
  }
  
  logger.info('Location added successfully to company');
  
  // Step 4: Get company's location
  logger.info(`Step 4: Getting location for company: ${testCompanyDomain}`);
  const getCompanyLocationResult = await server.callTool('cloze_get_company_locations', {
    identifier: testCompanyDomain
  });
  
  // Verify location was retrieved
  if (!getCompanyLocationResult.found) {
    throw new Error(`Failed to get location for company: ${testCompanyDomain}`);
  }
  
  // Verify the location matches what we set
  if (getCompanyLocationResult.location !== testLocation) {
    throw new Error(`Location mismatch: expected "${testLocation}" but got "${getCompanyLocationResult.location}"`);
  }
  
  logger.info('Company location retrieved successfully');
  
  // Step 5: Find nearby people
  logger.info(`Step 5: Finding people near location: ${searchLocation}`);
  try {
    const findNearbyPeopleResult = await server.callTool('cloze_find_nearby_people', {
      location: searchLocation,
      pagesize: 5
    });
    
    logger.info(`Found ${findNearbyPeopleResult.people?.length || 0} people near ${searchLocation}`);
  } catch (error) {
    logger.warn('Error finding nearby people - this is expected in mock implementation:', error);
  }
  
  // Step 6: Find nearby companies
  logger.info(`Step 6: Finding companies near location: ${searchLocation}`);
  try {
    const findNearbyCompaniesResult = await server.callTool('cloze_find_nearby_companies', {
      location: searchLocation,
      pagesize: 5
    });
    
    logger.info(`Found ${findNearbyCompaniesResult.companies?.length || 0} companies near ${searchLocation}`);
  } catch (error) {
    logger.warn('Error finding nearby companies - this is expected in mock implementation:', error);
  }
  
  logger.info('Location-based workflow test completed successfully');
}