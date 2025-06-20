/**
 * Projects-related API endpoints implementation
 * Handles all API operations for projects in Cloze CRM
 */
import apiClient from '../client.js';
import logger from '../../logging.js';
/**
 * Find projects by name or other criteria
 */
export const findProjects = async (params) => {
    logger.debug('Finding projects with params:', params);
    return apiClient.get('/v1/projects/find', params);
};
/**
 * Create a new project in Cloze CRM
 */
export const createProject = async (project) => {
    logger.debug('Creating project:', project);
    return apiClient.post('/v1/projects/create', project);
};
/**
 * Update an existing project in Cloze CRM
 */
export const updateProject = async (project) => {
    logger.debug('Updating project:', project);
    return apiClient.post('/v1/projects/update', project);
};
/**
 * List projects with cursor-based pagination
 */
export const listProjects = async (params = {}) => {
    logger.debug('Listing projects with params:', params);
    return apiClient.get('/v1/projects/feed', params);
};
//# sourceMappingURL=projects.js.map