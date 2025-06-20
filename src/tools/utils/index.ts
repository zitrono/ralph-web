/**
 * Utilities for MCP tools
 * Exports all utility functions for use in tool implementations
 */

// Export parameter validation utilities
export * from './param_validation.js';

// Export enhanced parameter validation utilities
export * from './param_validation_enhanced.js';

// Export error handling utilities
export * from './error_handling.js';

// Export response formatting utilities
export * from './response_formatting.js';

// Export a wrapper function that combines validation, error handling, and response formatting
import { z } from 'zod';
import { withParamValidation } from './param_validation.js';
import { withErrorHandling, McpToolResponse } from './error_handling.js';
import { formatApiResponse } from './response_formatting.js';
import { ClozeApiResponse } from '../../api/types.js';

/**
 * Create a tool handler with validation, error handling, and response formatting
 */
export const createToolHandler = <P, R extends ClozeApiResponse>(
  schema: z.ZodType<P>,
  handler: (params: P) => Promise<R>,
  transformer?: (response: R) => any
) => {
  // Define the handler with response formatting
  const handlerWithFormatting = async (params: P): Promise<McpToolResponse> => {
    const response = await handler(params);
    return formatApiResponse(response, transformer);
  };
  
  // Add validation and error handling
  return withErrorHandling(withParamValidation(schema, handlerWithFormatting));
};