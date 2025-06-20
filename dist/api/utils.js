/**
 * Utility functions for the Cloze API client
 */
import logger from '../logging.js';
/**
 * Format error details from API responses
 */
export const formatApiError = (error) => {
    // Extract error information
    const errorCode = error?.response?.data?.errorcode || error?.code || 'unknown';
    const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
    return `Error ${errorCode}: ${errorMessage}`;
};
/**
 * Create a response object in the format expected by MCP tools
 */
export const createMcpResponse = (data) => {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(data, null, 2)
            }
        ]
    };
};
/**
 * Create an error response in the format expected by MCP tools
 */
export const createMcpErrorResponse = (error) => {
    const errorMessage = formatApiError(error);
    logger.error(`API error: ${errorMessage}`);
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    error: errorMessage,
                    details: error?.response?.data || error?.message || 'No additional details'
                }, null, 2)
            }
        ]
    };
};
/**
 * Validate the result of an API call
 */
export const validateApiResponse = (response) => {
    if (response.errorcode !== 0) {
        const errorMessage = `Cloze API Error: ${response.errorcode} - ${response.message || 'Unknown error'}`;
        logger.error(errorMessage);
        throw new Error(errorMessage);
    }
    return response;
};
/**
 * Add authentication parameters to API request params
 */
export const addAuthParams = (params) => {
    // Note: The axios instance in client.ts already adds authentication parameters,
    // but this is included for direct fetch calls if needed
    return {
        ...params,
        user: process.env.CLOZE_USER_EMAIL,
        api_key: process.env.CLOZE_API_KEY
    };
};
/**
 * Process pagination parameters
 */
export const processPaginationParams = (params) => {
    const result = { ...params };
    // Convert pagesize to number if it's a string
    if (typeof result.pagesize === 'string') {
        result.pagesize = parseInt(result.pagesize, 10);
    }
    // Convert pagenumber to number if it's a string
    if (typeof result.pagenumber === 'string') {
        result.pagenumber = parseInt(result.pagenumber, 10);
    }
    return result;
};
/**
 * Check if a value is one of the allowed values
 */
export const isValidEnumValue = (value, allowedValues) => {
    return allowedValues.includes(value);
};
/**
 * Format allowed values for error messages
 */
export const formatAllowedValues = (allowedValues) => {
    return allowedValues.map(value => `'${value}'`).join(', ');
};
//# sourceMappingURL=utils.js.map