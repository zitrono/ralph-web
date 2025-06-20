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
import { withParamValidation } from './param_validation.js';
import { withErrorHandling } from './error_handling.js';
import { formatApiResponse } from './response_formatting.js';
/**
 * Create a tool handler with validation, error handling, and response formatting
 */
export const createToolHandler = (schema, handler, transformer) => {
    // Define the handler with response formatting
    const handlerWithFormatting = async (params) => {
        const response = await handler(params);
        return formatApiResponse(response, transformer);
    };
    // Add validation and error handling
    return withErrorHandling(withParamValidation(schema, handlerWithFormatting));
};
//# sourceMappingURL=index.js.map