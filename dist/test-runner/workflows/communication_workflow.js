/**
 * Communication workflow test
 * Tests the complete lifecycle of Communication operations
 */
import logger from '../../logging.js';
/**
 * Test the communication operations
 */
export async function testCommunicationWorkflow(server) {
    logger.info('Running communication workflow test');
    // Generate random test data
    const testPrefix = `Test_${Date.now()}`;
    const testEmailFrom = `sender_${Date.now()}@example.com`;
    const testEmailTo = `recipient_${Date.now()}@example.com`;
    const testDate = new Date().toISOString(); // Current time
    // Step 1: Create a note
    logger.info(`Step 1: Creating a note`);
    const noteResult = await server.callTool('cloze_communication_add_note', {
        date: testDate,
        subject: `${testPrefix} - Test Note`,
        from: testEmailFrom,
        body: 'This is a test note created for the communication workflow test.',
        bodytype: 'text'
    });
    // Verify note creation was successful
    if (noteResult.error) {
        throw new Error(`Failed to create note: ${JSON.stringify(noteResult.error)}`);
    }
    logger.info('Note created successfully');
    // Step 2: Create a meeting
    logger.info(`Step 2: Creating a meeting`);
    const meetingResult = await server.callTool('cloze_communication_add_meeting', {
        date: testDate,
        subject: `${testPrefix} - Test Meeting`,
        from: testEmailFrom,
        body: 'Meeting details and agenda items',
        bodytype: 'text',
        location: 'Conference Room A',
        duration: 60,
        recipients: [
            {
                value: testEmailTo,
                name: 'Test Recipient'
            }
        ]
    });
    // Verify meeting creation was successful
    if (meetingResult.error) {
        throw new Error(`Failed to create meeting: ${JSON.stringify(meetingResult.error)}`);
    }
    logger.info('Meeting created successfully');
    // Step 3: Log an email
    logger.info(`Step 3: Logging an email`);
    const emailResult = await server.callTool('cloze_communication_log_email', {
        date: testDate,
        subject: `${testPrefix} - Test Email`,
        from: testEmailFrom,
        body: 'This is a test email body.',
        bodytype: 'text',
        recipients: [
            {
                value: testEmailTo,
                name: 'Test Recipient'
            }
        ]
    });
    // Verify email logging was successful
    if (emailResult.error) {
        throw new Error(`Failed to log email: ${JSON.stringify(emailResult.error)}`);
    }
    logger.info('Email logged successfully');
    // Note: Cloze API doesn't provide endpoints to directly retrieve or list communications
    // Therefore, we can't verify the created communications with additional API calls
    // We rely on the success of the creation calls
    logger.info('Communication workflow test completed successfully');
}
//# sourceMappingURL=communication_workflow.js.map