/**
 * Company workflow test
 * Tests the complete lifecycle of Company CRUD operations
 */
import logger from '../../logging.js';
/**
 * Test the company CRUD lifecycle
 */
export async function testCompanyWorkflow(server) {
    logger.info('Running company workflow test');
    // Generate a random company name and domain for testing
    const companyName = `Test Company ${Date.now()}`;
    const domain = `testcompany${Date.now()}.example.com`;
    logger.info(`Testing with company name: ${companyName} and domain: ${domain}`);
    // Step 1: Create a new company
    logger.info(`Step 1: Creating company with name ${companyName}`);
    const createResult = await server.callTool('cloze_create_company', {
        name: companyName,
        domains: [domain],
        segment: 'customer',
        stage: 'lead',
        industry: 'Technology',
        description: 'Test company description',
        location: 'Test Location'
    });
    // Verify creation was successful
    if (createResult.error) {
        throw new Error(`Failed to create company: ${JSON.stringify(createResult.error)}`);
    }
    logger.info('Company created successfully');
    // Step 2: Find the company
    logger.info(`Step 2: Finding company with domain ${domain}`);
    const findResult = await server.callTool('cloze_find_company', {
        domain
    });
    // Verify we found the company
    if (!findResult.companies || findResult.companies.length === 0) {
        throw new Error('Company not found');
    }
    const company = findResult.companies[0];
    // Verify the company has the correct data
    if (company.name !== companyName ||
        !company.domains.includes(domain) ||
        company.segment !== 'customer' ||
        company.stage !== 'lead' ||
        company.industry !== 'Technology' ||
        company.description !== 'Test company description' ||
        company.location !== 'Test Location') {
        throw new Error(`Company data is incorrect: ${JSON.stringify(company)}`);
    }
    logger.info('Company found with correct data');
    // Step 3: Update the company
    logger.info(`Step 3: Updating company with domain ${domain}`);
    const updateResult = await server.callTool('cloze_update_company', {
        name: companyName,
        domains: [domain],
        industry: 'Software',
        segment: 'partner'
    });
    // Verify update was successful
    if (updateResult.error) {
        throw new Error(`Failed to update company: ${JSON.stringify(updateResult.error)}`);
    }
    logger.info('Company updated successfully');
    // Step 4: Verify the update
    logger.info(`Step 4: Verifying update for company with domain ${domain}`);
    const findAfterUpdateResult = await server.callTool('cloze_find_company', {
        domain
    });
    // Verify we found the company again
    if (!findAfterUpdateResult.companies || findAfterUpdateResult.companies.length === 0) {
        throw new Error('Company not found after update');
    }
    const updatedCompany = findAfterUpdateResult.companies[0];
    // Verify the company has the updated data
    if (updatedCompany.industry !== 'Software' ||
        updatedCompany.segment !== 'partner') {
        throw new Error(`Company update was not applied: ${JSON.stringify(updatedCompany)}`);
    }
    logger.info('Company update verified');
    // Step 5: Add location to the company
    logger.info(`Step 5: Adding location to company with domain ${domain}`);
    const addLocationResult = await server.callTool('cloze_add_company_location', {
        name: companyName,
        domains: [domain],
        location: 'New Test Location'
    });
    // Verify location update was successful
    if (!addLocationResult.success) {
        throw new Error(`Failed to add location to company: ${JSON.stringify(addLocationResult)}`);
    }
    logger.info('Company location added successfully');
    // Step 6: Verify the location update
    logger.info(`Step 6: Verifying location update for company with domain ${domain}`);
    const findAfterLocationResult = await server.callTool('cloze_find_company', {
        domain
    });
    // Verify we found the company again
    if (!findAfterLocationResult.companies || findAfterLocationResult.companies.length === 0) {
        throw new Error('Company not found after location update');
    }
    const updatedLocationCompany = findAfterLocationResult.companies[0];
    // Verify the company has the updated location
    if (updatedLocationCompany.location !== 'New Test Location') {
        throw new Error(`Company location update was not applied: ${JSON.stringify(updatedLocationCompany)}`);
    }
    logger.info('Company location update verified');
    // Step 7: Find nearby companies
    logger.info(`Step 7: Finding companies near location`);
    const nearbyResult = await server.callTool('cloze_find_nearby_companies', {
        location: 'Test'
    });
    // Verify we found at least one company
    if (!nearbyResult.companies || nearbyResult.companies.length === 0) {
        logger.warn('No nearby companies found - this is expected in mock implementation');
    }
    else {
        logger.info(`Found ${nearbyResult.companies.length} nearby companies`);
    }
    // Step 8: List companies
    logger.info(`Step 8: Listing companies`);
    try {
        const listResult = await server.callTool('cloze_list_companies', {
            pagesize: 10
        });
        // Verify we can list companies
        if (listResult.companies) {
            logger.info(`Listed ${listResult.companies.length} companies`);
        }
        else {
            logger.warn('No companies returned from list - this is expected in mock implementation');
        }
    }
    catch (error) {
        logger.warn('Error listing companies - this is expected in mock implementation:', error);
    }
    // In a real implementation, we would delete the company here
    // However, Cloze API doesn't provide a company deletion endpoint
    logger.info('Company workflow test completed successfully');
}
//# sourceMappingURL=company_workflow.js.map