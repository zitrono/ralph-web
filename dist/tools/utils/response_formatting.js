/**
 * Response formatting utilities for MCP tools
 * Provides functions to format API responses for MCP clients
 */
import logger from '../../logging.js';
/**
 * Format a successful API response for MCP
 */
export const formatApiResponse = (response, transform) => {
    try {
        // If a transform function is provided, use it
        const responseData = transform ? transform(response) : response;
        // Remove sensitive or internal fields
        const cleanedData = cleanResponse(responseData);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(cleanedData, null, 2)
                }
            ]
        };
    }
    catch (error) {
        logger.error('Error formatting API response:', error);
        // Return the original response if formatting fails
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response, null, 2)
                }
            ]
        };
    }
};
/**
 * Remove sensitive or internal fields from a response
 */
const cleanResponse = (data) => {
    // If it's not an object or is null, return as-is
    if (typeof data !== 'object' || data === null) {
        return data;
    }
    // If it's an array, clean each item
    if (Array.isArray(data)) {
        return data.map(item => cleanResponse(item));
    }
    // Create a new object with cleaned properties
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        // Skip sensitive fields
        if (key === 'api_key' || key === 'apiKey') {
            continue;
        }
        // Clean nested objects
        result[key] = cleanResponse(value);
    }
    return result;
};
/**
 * Format simple success response
 */
export const formatSuccessResponse = (message, data) => {
    const response = {
        success: true,
        message
    };
    if (data !== undefined) {
        response.data = data;
    }
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(response, null, 2)
            }
        ]
    };
};
/**
 * Format pagination information
 */
export const formatPaginationInfo = (response) => {
    const pagination = {};
    if (response.availablecount !== undefined) {
        pagination.totalCount = response.availablecount;
    }
    if (response.pagenumber !== undefined) {
        pagination.page = response.pagenumber;
    }
    if (response.pagesize !== undefined) {
        pagination.pageSize = response.pagesize;
    }
    if (response.cursor !== undefined) {
        pagination.cursor = response.cursor;
    }
    if (response.availablecount !== undefined && response.pagesize !== undefined) {
        pagination.totalPages = Math.ceil(response.availablecount / response.pagesize);
    }
    return pagination;
};
/**
 * Format empty response with success message
 */
export const formatEmptySuccessResponse = (message = 'Operation completed successfully') => {
    return formatSuccessResponse(message);
};
//# sourceMappingURL=response_formatting.js.map