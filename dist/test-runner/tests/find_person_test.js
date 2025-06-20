/**
 * Find Person Test
 * Tests the ability to find a person by query parameter in Cloze
 */
import { retry } from '../utils.js';
import logger from '../../logging.js';
/**
 * Find a person in Cloze API based on search parameter
 * Test is considered successful if API responds properly, regardless of whether person is found
 *
 * @param server The test server instance
 * @param searchQuery The query to search for (email, name, etc.)
 */
export async function testFindPerson(server, searchQuery) {
    logger.info(`Running Find Person test with query: "${searchQuery}"`);
    try {
        // Make the API call with retry logic
        const findResult = await retry(async () => {
            const result = await server.callTool('cloze_find_people', {
                freeformquery: searchQuery
            });
            return result;
        }, { maxRetries: 3, initialDelay: 1000 });
        // Process the response which might be wrapped in a content object
        let processedResult = findResult;
        // Check if the response is wrapped in a content array with text
        if (findResult.content && Array.isArray(findResult.content)) {
            try {
                // Try to parse the JSON string in the text field
                const textContent = findResult.content.find((item) => item.type === 'text' && item.text);
                if (textContent && textContent.text) {
                    processedResult = JSON.parse(textContent.text);
                    logger.debug('Successfully parsed response from content wrapper');
                }
            }
            catch (error) {
                logger.error('Failed to parse response from content wrapper:', error);
            }
        }
        // Check if we received a valid response (not whether a person was found)
        if (processedResult &&
            (processedResult.people !== undefined) &&
            (processedResult.pagination || processedResult.availablecount !== undefined)) {
            // Log result details
            const peopleCount = processedResult.people?.length || 0;
            const totalCount = processedResult.pagination?.totalCount ||
                processedResult.availablecount || 0;
            if (peopleCount > 0) {
                logger.info(`Test succeeded: Found ${peopleCount} person(s) matching query "${searchQuery}"`);
                logger.info(`First match: ${processedResult.people[0].name}`);
            }
            else {
                logger.info(`Test succeeded: API responded correctly, but no people matching "${searchQuery}" were found`);
            }
            return true;
        }
        else {
            logger.error(`Test failed: Invalid API response structure: ${JSON.stringify(processedResult)}`);
            return false;
        }
    }
    catch (error) {
        logger.error(`Find Person test failed for query "${searchQuery}":`, error);
        return false;
    }
}
//# sourceMappingURL=find_person_test.js.map