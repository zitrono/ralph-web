/**
 * Companies-related API endpoints implementation
 * Handles all API operations for companies in Cloze CRM
 */
import apiClient from '../client.js';
import logger from '../../logging.js';
/**
 * Find companies by name, domain, or other criteria
 */
export const findCompanies = async (params) => {
    logger.debug('Finding companies with params:', params);
    return apiClient.get('/v1/companies/find', params);
};
/**
 * Create a new company in Cloze CRM
 */
export const createCompany = async (company) => {
    logger.debug('Creating company:', company);
    return apiClient.post('/v1/companies/create', company);
};
/**
 * Update an existing company in Cloze CRM
 */
export const updateCompany = async (company) => {
    logger.debug('Updating company:', company);
    return apiClient.post('/v1/companies/update', company);
};
/**
 * List companies with cursor-based pagination
 */
export const listCompanies = async (params = {}) => {
    logger.debug('Listing companies with params:', params);
    return apiClient.get('/v1/companies/feed', params);
};
/**
 * Find companies near a specific location
 */
export const findNearbyCompanies = async (location, params = {}) => {
    const searchParams = {
        ...params,
        freeformquery: `near:${location}`
    };
    logger.debug('Finding companies near location:', location);
    return findCompanies(searchParams);
};
/**
 * Add location to a company
 */
export const addCompanyLocation = async (company) => {
    logger.debug('Adding location to company:', company);
    return updateCompany(company);
};
/**
 * Get company locations
 */
export const getCompanyLocations = async (nameOrDomain) => {
    logger.debug(`Getting locations for company: ${nameOrDomain}`);
    return findCompanies({ freeformquery: nameOrDomain });
};
/**
 * Create a tag for a company
 */
export const createCompanyTag = async (company) => {
    logger.debug('Creating tag for company:', company);
    return updateCompany(company);
};
/**
 * Read tags for a company
 */
export const readCompanyTags = async (nameOrDomain) => {
    logger.debug(`Reading tags for company: ${nameOrDomain}`);
    return findCompanies({ freeformquery: nameOrDomain });
};
/**
 * Update a company's tags
 */
export const updateCompanyTag = async (company) => {
    logger.debug('Updating tags for company:', company);
    return updateCompany(company);
};
/**
 * Delete a tag from a company
 */
export const deleteCompanyTag = async (company) => {
    logger.debug('Deleting tags for company:', company);
    return updateCompany(company);
};
//# sourceMappingURL=companies.js.map