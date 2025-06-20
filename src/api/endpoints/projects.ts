/**
 * Projects-related API endpoints implementation
 * Handles all API operations for projects in Cloze CRM
 */

import apiClient from '../client.js';
import logger from '../../logging.js';
import { Project, ProjectsResponse, ClozeApiResponse } from '../types.js';

/**
 * Find projects by name or other criteria
 */
export const findProjects = async (params: Record<string, any>): Promise<ProjectsResponse> => {
  logger.debug('Finding projects with params:', params);
  return apiClient.get<ProjectsResponse>('/v1/projects/find', params);
};

/**
 * Create a new project in Cloze CRM
 */
export const createProject = async (project: Project): Promise<ClozeApiResponse> => {
  logger.debug('Creating project:', project);
  return apiClient.post<ClozeApiResponse>('/v1/projects/create', project);
};

/**
 * Update an existing project in Cloze CRM
 */
export const updateProject = async (project: Partial<Project>): Promise<ClozeApiResponse> => {
  logger.debug('Updating project:', project);
  return apiClient.post<ClozeApiResponse>('/v1/projects/update', project);
};

/**
 * List projects with cursor-based pagination
 */
export const listProjects = async (params: Record<string, any> = {}): Promise<ProjectsResponse> => {
  logger.debug('Listing projects with params:', params);
  return apiClient.get<ProjectsResponse>('/v1/projects/feed', params);
};