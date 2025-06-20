/**
 * Parameter validation utilities for MCP tools
 * Provides functions to validate and transform parameters
 */
import { z } from 'zod';
import logger from '../../logging.js';
import { PEOPLE_SEGMENTS, PEOPLE_STAGES, PROJECT_SEGMENTS, PROJECT_STAGES } from '../../api/types.js';
/**
 * Creates a validation error response with suggested values
 */
export const createValidationError = (message, param, suggestedValues) => {
    let errorMessage = `Validation Error: ${message}`;
    if (param) {
        errorMessage += `\nParameter: ${param}`;
    }
    if (suggestedValues && suggestedValues.length > 0) {
        errorMessage += `\nValid values: ${suggestedValues.join(', ')}`;
    }
    logger.warn(`Validation error: ${errorMessage}`);
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    error: {
                        message: errorMessage
                    }
                }, null, 2)
            }
        ]
    };
};
/**
 * Helper to validate parameters against a Zod schema
 */
export const validateParams = (schema, params) => {
    try {
        const result = schema.safeParse(params);
        if (!result.success) {
            // Format error messages
            const errorMessages = result.error.errors.map(err => {
                const path = err.path.join('.');
                return `${path}: ${err.message}`;
            });
            return {
                success: false,
                error: createValidationError(errorMessages.join('\n'))
            };
        }
        return {
            success: true,
            data: result.data
        };
    }
    catch (error) {
        logger.error('Unexpected error during parameter validation:', error);
        return {
            success: false,
            error: createValidationError(error instanceof Error ? error.message : 'Unknown validation error')
        };
    }
};
/**
 * Middleware for validating parameters against a schema
 */
export const withParamValidation = (schema, handler) => {
    return async (params) => {
        const validation = validateParams(schema, params);
        if (!validation.success) {
            return validation.error;
        }
        return handler(validation.data);
    };
};
/**
 * Common schemas for reuse across tools
 */
// Person email schema
export const personEmailSchema = z.object({
    value: z.string().email('Invalid email format'),
    primary: z.boolean().optional(),
    work: z.boolean().optional(),
    personal: z.boolean().optional()
});
// Person phone schema
export const personPhoneSchema = z.object({
    value: z.string(),
    primary: z.boolean().optional(),
    work: z.boolean().optional(),
    mobile: z.boolean().optional(),
    home: z.boolean().optional()
});
// Person address schema
export const personAddressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
    primary: z.boolean().optional(),
    work: z.boolean().optional(),
    home: z.boolean().optional()
});
// Create schema for validating person segment
export const personSegmentSchema = z.enum(PEOPLE_SEGMENTS).optional()
    .describe(`Person segment (${PEOPLE_SEGMENTS.join(', ')})`);
// Create schema for validating person stage
export const personStageSchema = z.enum(PEOPLE_STAGES).optional()
    .describe(`Person stage (${PEOPLE_STAGES.join(', ')})`);
// Create schema for validating project segment
export const projectSegmentSchema = z.enum(PROJECT_SEGMENTS).optional()
    .describe(`Project segment (${PROJECT_SEGMENTS.join(', ')})`);
// Create schema for validating project stage
export const projectStageSchema = z.enum(PROJECT_STAGES).optional()
    .describe(`Project stage (${PROJECT_STAGES.join(', ')})`);
// Common pagination parameters
export const paginationSchema = z.object({
    pagesize: z.number().min(1).max(100).optional()
        .describe('Number of results per page (default: 10)'),
    pagenumber: z.number().min(1).optional()
        .describe('Page number (default: 1)')
});
// Schema for AppLink used in projects
export const appLinkSchema = z.object({
    uniqueid: z.string()
        .describe('A unique identifier for the project link'),
    source: z.string()
        .describe('Source system identifier'),
    url: z.string()
        .describe('URL related to the project'),
    label: z.string()
        .describe('Display label for the link')
});
/**
 * Helper function to validate and suggest values
 */
export const isValidEnumValue = (value, allowedValues) => {
    if (!value)
        return true; // undefined is valid for optional fields
    return allowedValues.includes(value);
};
/**
 * Format allowed values for error messages
 */
export const formatAllowedValues = (allowedValues) => {
    return allowedValues.map(value => `'${value}'`).join(', ');
};
//# sourceMappingURL=param_validation.js.map