/**
 * Metadata-related API endpoints implementation
 * Handles all API operations for metadata in Cloze CRM
 */
import apiClient from '../client.js';
import logger from '../../logging.js';
/**
 * Get segments for a specific entity type (people, projects)
 */
export const getSegments = async (entityType = 'people') => {
    logger.debug(`Getting segments for entity type: ${entityType}`);
    return apiClient.get(`/v1/user/segments/${entityType}`);
};
/**
 * Get stages for a specific entity type (people, projects)
 */
export const getStages = async (entityType = 'people') => {
    logger.debug(`Getting stages for entity type: ${entityType}`);
    return apiClient.get(`/v1/user/stages/${entityType}`);
};
/**
 * Access raw metadata endpoint
 * Use this for direct access to metadata endpoints that start with /v1/user/
 */
export const accessRawMetadata = async (endpoint) => {
    if (!endpoint.startsWith('/v1/user/')) {
        throw new Error('Raw metadata endpoint must start with /v1/user/');
    }
    logger.debug(`Accessing raw metadata endpoint: ${endpoint}`);
    return apiClient.get(endpoint);
};
//# sourceMappingURL=metadata.js.map