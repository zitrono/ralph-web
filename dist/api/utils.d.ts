/**
 * Utility functions for the Cloze API client
 */
import { ClozeApiResponse } from './types.js';
/**
 * Format error details from API responses
 */
export declare const formatApiError: (error: any) => string;
/**
 * Create a response object in the format expected by MCP tools
 */
export declare const createMcpResponse: (data: any) => any;
/**
 * Create an error response in the format expected by MCP tools
 */
export declare const createMcpErrorResponse: (error: any) => any;
/**
 * Validate the result of an API call
 */
export declare const validateApiResponse: <T extends ClozeApiResponse>(response: T) => T;
/**
 * Add authentication parameters to API request params
 */
export declare const addAuthParams: (params: Record<string, any>) => Record<string, any>;
/**
 * Process pagination parameters
 */
export declare const processPaginationParams: (params: Record<string, any>) => Record<string, any>;
/**
 * Check if a value is one of the allowed values
 */
export declare const isValidEnumValue: (value: string, allowedValues: string[]) => boolean;
/**
 * Format allowed values for error messages
 */
export declare const formatAllowedValues: (allowedValues: string[]) => string;
