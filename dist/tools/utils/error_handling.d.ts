/**
 * Error handling utilities for MCP tools
 * Provides functions to handle API errors and create appropriate responses
 */
/**
 * MCP tool response interface
 */
export interface McpToolResponse {
    content: {
        type: string;
        text: string;
    }[];
}
/**
 * Error response with details
 */
export interface ErrorResponseDetails {
    message: string;
    code?: number | string;
    details?: any;
}
/**
 * Create an error response for MCP tools
 */
export declare const createErrorResponse: (error: ErrorResponseDetails) => McpToolResponse;
/**
 * Handle API errors from Cloze API
 */
export declare const handleApiError: (error: any) => McpToolResponse;
/**
 * Error codes and descriptions for Cloze API
 */
export declare const CLOZE_ERROR_CODES: Record<number, string>;
/**
 * Get a human-readable description for a Cloze API error code
 */
export declare const getErrorDescription: (errorCode: number) => string;
/**
 * Try to execute an API call and handle errors appropriately
 */
export declare const tryApiCall: <T>(apiCall: () => Promise<T>) => Promise<{
    success: true;
    data: T;
} | {
    success: false;
    error: McpToolResponse;
}>;
/**
 * Middleware for wrapping a handler with error handling
 */
export declare const withErrorHandling: <T>(handler: (params: T) => Promise<McpToolResponse>) => (params: T) => Promise<McpToolResponse>;
/**
 * Format the tool response for MCP
 */
export declare const formatToolResponse: (data: any) => McpToolResponse;
