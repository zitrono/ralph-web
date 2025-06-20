/**
 * Tag Management workflow test
 * Tests the complete lifecycle of tag management operations
 */
import logger from '../../logging.js';
/**
 * Test the tag management workflows
 */
export async function testTagWorkflow(server) {
    logger.info('Running tag management workflow test');
    // Generate test data
    const testPrefix = `Test_${Date.now()}`;
    const testEmail = `person_${Date.now()}@example.com`;
    const testCompanyName = `Company_${testPrefix}`;
    const testCompanyDomain = `company${Date.now()}.example.com`;
    // Test People Tags
    logger.info('Testing People Tag Management');
    // Step 1: Create tags for a person
    logger.info(`Step 1: Creating tags for person: ${testEmail}`);
    const createTagsResult = await server.callTool('cloze_create_people_tag', {
        email: testEmail,
        tags: ['test', 'important', 'follow-up']
    });
    // Verify creation was successful
    if (createTagsResult.error) {
        throw new Error(`Failed to create tags: ${JSON.stringify(createTagsResult.error)}`);
    }
    logger.info('Tags created successfully for person');
    // Step 2: Read tags for the person
    logger.info(`Step 2: Reading tags for person: ${testEmail}`);
    const readTagsResult = await server.callTool('cloze_read_people_tag', {
        email: testEmail
    });
    // Verify tags were found
    if (!readTagsResult.tags || readTagsResult.tags.length !== 3) {
        throw new Error(`Expected 3 tags, but found ${readTagsResult.tags?.length || 0}`);
    }
    logger.info(`Read ${readTagsResult.tags.length} tags for person`);
    // Step 3: Update a tag for the person
    logger.info(`Step 3: Updating tag for person: ${testEmail}`);
    const updateTagResult = await server.callTool('cloze_update_people_tag', {
        email: testEmail,
        oldTag: 'important',
        newTag: 'critical'
    });
    // Verify update was successful
    if (updateTagResult.error) {
        throw new Error(`Failed to update tag: ${JSON.stringify(updateTagResult.error)}`);
    }
    logger.info('Tag updated successfully for person');
    // Step 4: Delete a tag from the person
    logger.info(`Step 4: Deleting tag for person: ${testEmail}`);
    const deleteTagResult = await server.callTool('cloze_delete_people_tag', {
        email: testEmail,
        tags: ['follow-up']
    });
    // Verify deletion was successful
    if (deleteTagResult.error) {
        throw new Error(`Failed to delete tag: ${JSON.stringify(deleteTagResult.error)}`);
    }
    logger.info('Tag deleted successfully for person');
    // Test Company Tags
    logger.info('Testing Company Tag Management');
    // Step 5: Create tags for a company
    logger.info(`Step 5: Creating tags for company: ${testCompanyName}`);
    const createCompanyTagsResult = await server.callTool('cloze_create_company_tag', {
        name: testCompanyName,
        domains: [testCompanyDomain],
        tags: ['client', 'active', 'enterprise']
    });
    // Verify creation was successful
    if (createCompanyTagsResult.error) {
        throw new Error(`Failed to create company tags: ${JSON.stringify(createCompanyTagsResult.error)}`);
    }
    logger.info('Tags created successfully for company');
    // Step 6: Read tags for the company
    logger.info(`Step 6: Reading tags for company: ${testCompanyName}`);
    const readCompanyTagsResult = await server.callTool('cloze_read_company_tag', {
        identifier: testCompanyDomain
    });
    // Verify tags were found
    if (!readCompanyTagsResult.tags || readCompanyTagsResult.tags.length !== 3) {
        throw new Error(`Expected 3 company tags, but found ${readCompanyTagsResult.tags?.length || 0}`);
    }
    logger.info(`Read ${readCompanyTagsResult.tags.length} tags for company`);
    // Step 7: Update a tag for the company
    logger.info(`Step 7: Updating tag for company: ${testCompanyName}`);
    const updateCompanyTagResult = await server.callTool('cloze_update_company_tag', {
        name: testCompanyName,
        domains: [testCompanyDomain],
        oldTag: 'enterprise',
        newTag: 'key-account'
    });
    // Verify update was successful
    if (updateCompanyTagResult.error) {
        throw new Error(`Failed to update company tag: ${JSON.stringify(updateCompanyTagResult.error)}`);
    }
    logger.info('Tag updated successfully for company');
    // Step 8: Delete a tag from the company
    logger.info(`Step 8: Deleting tag for company: ${testCompanyName}`);
    const deleteCompanyTagResult = await server.callTool('cloze_delete_company_tag', {
        name: testCompanyName,
        domains: [testCompanyDomain],
        tags: ['active']
    });
    // Verify deletion was successful
    if (deleteCompanyTagResult.error) {
        throw new Error(`Failed to delete company tag: ${JSON.stringify(deleteCompanyTagResult.error)}`);
    }
    logger.info('Tag deleted successfully for company');
    logger.info('Tag management workflow test completed successfully');
}
//# sourceMappingURL=tag_workflow.js.map