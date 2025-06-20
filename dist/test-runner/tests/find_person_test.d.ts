/**
 * Find Person Test
 * Tests the ability to find a person by query parameter in Cloze
 */
import { TestServer } from '../runner.js';
/**
 * Find a person in Cloze API based on search parameter
 * Test is considered successful if API responds properly, regardless of whether person is found
 *
 * @param server The test server instance
 * @param searchQuery The query to search for (email, name, etc.)
 */
export declare function testFindPerson(server: TestServer, searchQuery: string): Promise<boolean>;
