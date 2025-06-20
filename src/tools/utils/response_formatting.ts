/**
 * Response formatting utilities for MCP tools
 * Provides functions to format API responses for MCP clients
 */

import { McpToolResponse } from './error_handling.js';
import { ClozeApiResponse } from '../../api/types.js';
import logger from '../../logging.js';

/**
 * Format a successful API response for MCP
 */
export const formatApiResponse = <T extends ClozeApiResponse>(
  response: T,
  transform?: (data: T) => any
): McpToolResponse => {
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
  } catch (error) {
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
const cleanResponse = (data: any): any => {
  // If it's not an object or is null, return as-is
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  // If it's an array, clean each item
  if (Array.isArray(data)) {
    return data.map(item => cleanResponse(item));
  }
  
  // Create a new object with cleaned properties
  const result: Record<string, any> = {};
  
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
export const formatSuccessResponse = (
  message: string,
  data?: any
): McpToolResponse => {
  const response: Record<string, any> = {
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
export const formatPaginationInfo = (
  response: {
    availablecount?: number;
    pagenumber?: number;
    pagesize?: number;
    cursor?: string;
  }
): Record<string, any> => {
  const pagination: Record<string, any> = {};
  
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
export const formatEmptySuccessResponse = (message: string = 'Operation completed successfully'): McpToolResponse => {
  return formatSuccessResponse(message);
};