/**
 * People workflow test
 * Tests the complete lifecycle of a person in Cloze CRM
 */

import { TestServer } from '../../src/test-runner/runner.js';
import { generateRandomEmail } from '../../src/test-runner/utils.js';
import logger from '../../src/logging.js';

/**
 * Test the complete lifecycle of a person
 */
export async function testPeopleWorkflow(): Promise<void> {
  logger.info('Starting people workflow test');
  
  const server = new TestServer();
  await server.start();
  
  try {
    // Generate a random email for testing to avoid conflicts
    const testEmail = generateRandomEmail();
    
    logger.info(`Testing with email: ${testEmail}`);
    
    // Step 1: Create a new person
    const createResult = await server.callTool('cloze_create_people', {
      name: 'Test Person',
      emails: [{ value: testEmail, work: true }],
      segment: 'customer',
      stage: 'lead',
      location: 'Test City, Test Country'
    });
    
    if (createResult.error) {
      throw new Error(`Failed to create person: ${createResult.error.message}`);
    }
    
    logger.info('Person created successfully');
    
    // Step 2: Find the person
    const findResult = await server.callTool('cloze_find_people', {
      freeformquery: testEmail
    });
    
    if (!findResult.people || findResult.people.length === 0) {
      throw new Error('Person not found after creation');
    }
    
    const person = findResult.people[0];
    
    logger.info(`Found person: ${person.name}`);
    
    // Step 3: Update the person
    const updateResult = await server.callTool('cloze_update_people', {
      emails: [{ value: testEmail }],
      segment: 'partner',
      job_title: 'Updated Job Title'
    });
    
    if (updateResult.error) {
      throw new Error(`Failed to update person: ${updateResult.error.message}`);
    }
    
    logger.info('Person updated successfully');
    
    // Step 4: Find the person again to verify the update
    const findAfterUpdateResult = await server.callTool('cloze_find_people', {
      freeformquery: testEmail
    });
    
    if (!findAfterUpdateResult.people || findAfterUpdateResult.people.length === 0) {
      throw new Error('Person not found after update');
    }
    
    const updatedPerson = findAfterUpdateResult.people[0];
    
    // Verify the update worked
    if (updatedPerson.segment !== 'partner' || updatedPerson.job_title !== 'Updated Job Title') {
      throw new Error(`Update was not applied correctly: ${JSON.stringify(updatedPerson)}`);
    }
    
    logger.info('Update verified successfully');
    
    // Step 5: Delete the person
    const deleteResult = await server.callTool('cloze_delete_people', {
      uniqueid: testEmail
    });
    
    if (!deleteResult.success) {
      throw new Error(`Failed to delete person: ${JSON.stringify(deleteResult)}`);
    }
    
    logger.info('Person deleted successfully');
    
    // Step 6: Verify the person is gone
    const findAfterDeleteResult = await server.callTool('cloze_find_people', {
      freeformquery: testEmail
    });
    
    if (findAfterDeleteResult.people && findAfterDeleteResult.people.length > 0) {
      throw new Error('Person still found after deletion');
    }
    
    logger.info('Person deletion verified successfully');
    
  } finally {
    await server.stop();
  }
  
  logger.info('People workflow test completed successfully');
}