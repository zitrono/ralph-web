/**
 * Error handling utilities for MCP tools
 * Provides functions to handle API errors and create appropriate responses
 */

import { AxiosError } from 'axios';
import logger from '../../logging.js';
import { ClozeApiResponse } from '../../api/types.js';
import { ValidationErrorResponse } from './param_validation.js';

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
export const createErrorResponse = (
  error: ErrorResponseDetails
): McpToolResponse => {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          error
        }, null, 2)
      }
    ]
  };
};

/**
 * Handle API errors from Cloze API
 */
export const handleApiError = (error: any): McpToolResponse => {
  // Get error information
  const axiosError = error as AxiosError<ClozeApiResponse>;
  const errorCode = axiosError.response?.data?.errorcode || 
                   axiosError.code || 
                   'unknown';
  const errorMessage = axiosError.response?.data?.message || 
                      axiosError.message || 
                      'Unknown error';
  
  // Log detailed error information
  logger.error(`API Error: ${errorMessage} (Code: ${errorCode})`, {
    url: axiosError.config?.url,
    method: axiosError.config?.method,
    status: axiosError.response?.status,
    data: axiosError.response?.data
  });
  
  // Create and return error response
  return createErrorResponse({
    message: errorMessage,
    code: errorCode,
    details: axiosError.response?.data
  });
};

/**
 * Error codes and descriptions for Cloze API
 */
export const CLOZE_ERROR_CODES: Record<number, string> = {
  0: 'Success',
  11: 'At least one appLink must be specified',
  26: 'An invalid value was provided for the field',
  32: 'Invalid address',
  38: 'Future dates are not allowed',
  62: 'Not found'
};

/**
 * Get a human-readable description for a Cloze API error code
 */
export const getErrorDescription = (errorCode: number): string => {
  return CLOZE_ERROR_CODES[errorCode] || 'Unknown error';
};

/**
 * Try to execute an API call and handle errors appropriately
 */
export const tryApiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: McpToolResponse }> => {
  try {
    const result = await apiCall();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: handleApiError(error)
    };
  }
};

/**
 * Middleware for wrapping a handler with error handling
 */
export const withErrorHandling = <T>(
  handler: (params: T) => Promise<McpToolResponse>
) => {
  return async (params: T): Promise<McpToolResponse> => {
    try {
      return await handler(params);
    } catch (error) {
      // If it's already a validation error, pass it through
      if (isValidationErrorResponse(error)) {
        return error as ValidationErrorResponse;
      }
      
      return handleApiError(error);
    }
  };
};

/**
 * Check if an object is a validation error response
 */
function isValidationErrorResponse(obj: any): boolean {
  return obj && 
         Array.isArray(obj.content) && 
         obj.content.length > 0 && 
         obj.content[0].type === 'text';
}

/**
 * Format the tool response for MCP
 */
export const formatToolResponse = (data: any): McpToolResponse => {
  // If it's already a properly formatted MCP response, return it as-is
  if (data && Array.isArray(data.content)) {
    return data as McpToolResponse;
  }
  
  // Otherwise, format it as JSON
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(data, null, 2)
      }
    ]
  };
};