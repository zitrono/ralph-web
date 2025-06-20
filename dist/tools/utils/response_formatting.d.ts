/**
 * Response formatting utilities for MCP tools
 * Provides functions to format API responses for MCP clients
 */
import { McpToolResponse } from './error_handling.js';
import { ClozeApiResponse } from '../../api/types.js';
/**
 * Format a successful API response for MCP
 */
export declare const formatApiResponse: <T extends ClozeApiResponse>(response: T, transform?: (data: T) => any) => McpToolResponse;
/**
 * Format simple success response
 */
export declare const formatSuccessResponse: (message: string, data?: any) => McpToolResponse;
/**
 * Format pagination information
 */
export declare const formatPaginationInfo: (response: {
    availablecount?: number;
    pagenumber?: number;
    pagesize?: number;
    cursor?: string;
}) => Record<string, any>;
/**
 * Format empty response with success message
 */
export declare const formatEmptySuccessResponse: (message?: string) => McpToolResponse;
