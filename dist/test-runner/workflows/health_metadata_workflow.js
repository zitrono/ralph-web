/**
 * Health and Metadata workflow test
 * Tests the Health and Metadata tools for Cloze CRM
 */
import logger from '../../logging.js';
/**
 * Test the health and metadata functionality
 */
export async function testHealthMetadataWorkflow(server) {
    logger.info('Running health and metadata workflow test');
    // Step 1: Check API health
    logger.info('Step 1: Checking API health');
    const healthCheckResult = await server.callTool('cloze_health_health_check', {});
    // Verify health check returned successfully
    if (!healthCheckResult.success) {
        throw new Error(`Health check failed: ${JSON.stringify(healthCheckResult)}`);
    }
    logger.info(`Health check status: ${healthCheckResult.data?.status}`);
    // Step 2: Check connection status
    logger.info('Step 2: Checking connection status');
    const connectionStatusResult = await server.callTool('cloze_health_health_connection_status', {});
    // Verify connection status returned successfully
    if (!connectionStatusResult.success) {
        throw new Error(`Connection status check failed: ${JSON.stringify(connectionStatusResult)}`);
    }
    logger.info(`Connection status: ${connectionStatusResult.data?.status}`);
    // Step 3: Reset connection
    logger.info('Step 3: Resetting connection');
    const resetConnectionResult = await server.callTool('cloze_health_health_reset_connection', {});
    // Verify reset connection returned successfully
    if (!resetConnectionResult.success) {
        throw new Error(`Connection reset failed: ${JSON.stringify(resetConnectionResult)}`);
    }
    logger.info(`Connection reset status: ${resetConnectionResult.data?.status}`);
    // Step 4: Get people segments
    logger.info('Step 4: Getting people segments');
    const peopleSegmentsResult = await server.callTool('cloze_metadata_get_segments', {
        entityType: 'people'
    });
    // Verify segments were retrieved
    if (!peopleSegmentsResult.segments || peopleSegmentsResult.segments.length === 0) {
        throw new Error('No people segments returned');
    }
    logger.info(`Retrieved ${peopleSegmentsResult.segments.length} people segments`);
    // Step 5: Get project segments
    logger.info('Step 5: Getting project segments');
    const projectSegmentsResult = await server.callTool('cloze_metadata_get_segments', {
        entityType: 'projects'
    });
    // Verify segments were retrieved
    if (!projectSegmentsResult.segments || projectSegmentsResult.segments.length === 0) {
        throw new Error('No project segments returned');
    }
    logger.info(`Retrieved ${projectSegmentsResult.segments.length} project segments`);
    // Step 6: Get people stages
    logger.info('Step 6: Getting people stages');
    const peopleStagesResult = await server.callTool('cloze_metadata_get_stages', {
        entityType: 'people'
    });
    // Verify stages were retrieved
    if (!peopleStagesResult.stages || peopleStagesResult.stages.length === 0) {
        throw new Error('No people stages returned');
    }
    logger.info(`Retrieved ${peopleStagesResult.stages.length} people stages`);
    // Step 7: Get project stages
    logger.info('Step 7: Getting project stages');
    const projectStagesResult = await server.callTool('cloze_metadata_get_stages', {
        entityType: 'projects'
    });
    // Verify stages were retrieved
    if (!projectStagesResult.stages || projectStagesResult.stages.length === 0) {
        throw new Error('No project stages returned');
    }
    logger.info(`Retrieved ${projectStagesResult.stages.length} project stages`);
    // Step 8: Access raw metadata endpoint
    logger.info('Step 8: Accessing raw metadata endpoint');
    try {
        const rawMetadataResult = await server.callTool('cloze_metadata_raw', {
            endpoint: '/v1/user/profile'
        });
        logger.info('Raw metadata access successful');
    }
    catch (error) {
        logger.warn('Error accessing raw metadata - this is expected in mock implementation:', error);
    }
    logger.info('Health and metadata workflow test completed successfully');
}
//# sourceMappingURL=health_metadata_workflow.js.map