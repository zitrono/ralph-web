/**
 * Projects-related API endpoints implementation
 * Handles all API operations for projects in Cloze CRM
 */
import { Project, ProjectsResponse, ClozeApiResponse } from '../types.js';
/**
 * Find projects by name or other criteria
 */
export declare const findProjects: (params: Record<string, any>) => Promise<ProjectsResponse>;
/**
 * Create a new project in Cloze CRM
 */
export declare const createProject: (project: Project) => Promise<ClozeApiResponse>;
/**
 * Update an existing project in Cloze CRM
 */
export declare const updateProject: (project: Partial<Project>) => Promise<ClozeApiResponse>;
/**
 * List projects with cursor-based pagination
 */
export declare const listProjects: (params?: Record<string, any>) => Promise<ProjectsResponse>;
