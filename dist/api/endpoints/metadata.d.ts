/**
 * Metadata-related API endpoints implementation
 * Handles all API operations for metadata in Cloze CRM
 */
import { MetadataResponse, ClozeApiResponse } from '../types.js';
/**
 * Get segments for a specific entity type (people, projects)
 */
export declare const getSegments: (entityType?: string) => Promise<MetadataResponse>;
/**
 * Get stages for a specific entity type (people, projects)
 */
export declare const getStages: (entityType?: string) => Promise<MetadataResponse>;
/**
 * Access raw metadata endpoint
 * Use this for direct access to metadata endpoints that start with /v1/user/
 */
export declare const accessRawMetadata: (endpoint: string) => Promise<ClozeApiResponse>;
