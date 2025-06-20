/**
 * Enhanced parameter validation utilities for MCP tools
 * Provides improved error messages and examples for validation failures
 */
import logger from '../../logging.js';
import { createValidationError } from './param_validation.js';
/**
 * Helper function to log parameter debug info only when DEBUG_PARAMS is enabled
 */
function logParamDebug(message, ...args) {
    if (process.env.DEBUG_PARAMS === 'true') {
        logger.info(`PARAM_DEBUG: ${message}`, ...args);
    }
    else {
        // Always log at debug level
        logger.debug(`PARAM_DEBUG: ${message}`, ...args);
    }
}
/**
 * Utility function to preprocess parameters and handle different MCP formats
 * Extracts parameters from nested formats and normalizes them
 */
export const preprocessParams = (params) => {
    // If parameters are null or undefined, return empty object
    if (params === null || params === undefined) {
        logParamDebug('Parameters are null or undefined, returning empty object');
        return {};
    }
    // Enhanced logging for debugging parameter structure
    logParamDebug('Preprocessing parameters of type:', typeof params);
    logParamDebug('Parameter keys:', Object.keys(params));
    logParamDebug('Parameter structure check:', {
        isObject: typeof params === 'object',
        isArray: Array.isArray(params),
        hasArguments: params?.arguments !== undefined,
        hasParams: params?.params !== undefined,
        hasParamsArguments: params?.params?.arguments !== undefined,
        hasName: params?.name !== undefined,
        hasParameters: params?.parameters !== undefined,
        hasFreeformQuery: params?.freeformquery !== undefined,
        nestedPaths: Object.keys(params).map(key => `${key}: ${typeof params[key]}`)
    });
    try {
        // Log raw parameters for detailed debugging
        if (process.env.DEBUG_PARAMS === 'true') {
            logger.debug('Parameter details:', JSON.stringify(params, null, 2));
        }
    }
    catch (error) {
        logParamDebug('Could not stringify params:', error);
    }
    // Check for Claude MCP format which might be different from standard MCP
    // Claude sends parameters in a different format compared to direct MCP calls
    if (params?.parameters && typeof params.parameters === 'object') {
        logParamDebug('Found Claude MCP format with params.parameters');
        // Extract a specific parameter if it exists
        if (params.parameters.freeformquery) {
            logParamDebug('Found direct parameter in params.parameters:', params.parameters);
            return params.parameters;
        }
        // For other structures, try to find nested parameters
        for (const key in params.parameters) {
            logParamDebug(`Examining parameter: ${key} type: ${typeof params.parameters[key]}`);
            if (typeof params.parameters[key] === 'object' && params.parameters[key] !== null) {
                logParamDebug(`Found object parameter: ${key}`);
                return params.parameters[key];
            }
        }
        return params.parameters;
    }
    // Special case for MCP format where params has a "params" object containing "arguments"
    if (params?.params?.arguments) {
        logParamDebug('Found MCP format with params.params.arguments:', JSON.stringify(params.params.arguments, null, 2));
        return params.params.arguments;
    }
    // If parameters are nested in arguments, extract them
    if (params?.arguments) {
        logParamDebug('Extracted parameters from arguments:', JSON.stringify(params.arguments, null, 2));
        return params.arguments;
    }
    // Handle format where name and parameters are at root level
    if (params?.name && params?.parameters) {
        logParamDebug('Found name and parameters at root level:', JSON.stringify(params.parameters, null, 2));
        return params.parameters;
    }
    // If parameters are already in the right format, return as is
    if (typeof params === 'object' && !params.arguments && !params.parameters) {
        logParamDebug('Parameters are in direct format');
        return params;
    }
    // Handle string parameter (could be JSON string)
    if (typeof params === 'string') {
        try {
            const parsed = JSON.parse(params);
            logParamDebug('Parsed parameters from JSON string:', JSON.stringify(parsed, null, 2));
            // Check different possible nested structures
            if (parsed.arguments)
                return parsed.arguments;
            if (parsed.parameters)
                return parsed.parameters;
            if (parsed.params?.arguments)
                return parsed.params.arguments;
            return parsed;
        }
        catch (error) {
            logParamDebug('Failed to parse parameters as JSON, returning as is');
            return params;
        }
    }
    // Return parameters as is if no other condition matches
    logParamDebug('No preprocessing pattern matched, returning params as is');
    return params;
};
/**
 * Extract parameter examples from schema enhancements
 */
export const getParameterExamples = (paramName, schemaEnhancements) => {
    if (!schemaEnhancements || !schemaEnhancements[paramName] || !schemaEnhancements[paramName].examples) {
        return [];
    }
    return schemaEnhancements[paramName].examples.map(example => typeof example === 'string' ? `"${example}"` : String(example));
};
/**
 * Create a user-friendly error message for missing required parameter
 */
export const createMissingParameterError = (paramName, schemaEnhancements) => {
    // Get examples from schema enhancements if available
    const examples = schemaEnhancements ? getParameterExamples(paramName, schemaEnhancements) : [];
    // Get parameter description if available
    const description = schemaEnhancements?.[paramName]?.description || '';
    // Create error message
    let errorMessage = `${paramName}: Required`;
    // Add description if available
    if (description) {
        errorMessage += `\nDescription: ${description}`;
    }
    // Create the validation error
    return createValidationError(errorMessage, paramName, examples);
};
/**
 * Create a user-friendly error message for invalid parameter
 */
export const createInvalidParameterError = (paramName, providedValue, expectedType, schemaEnhancements) => {
    // Get examples from schema enhancements if available
    const examples = schemaEnhancements ? getParameterExamples(paramName, schemaEnhancements) : [];
    // Get parameter description if available
    const description = schemaEnhancements?.[paramName]?.description || '';
    // Format provided value for display
    const formattedValue = typeof providedValue === 'string'
        ? `"${providedValue}"`
        : JSON.stringify(providedValue);
    // Create error message
    let errorMessage = `${paramName}: Invalid value ${formattedValue}. Expected ${expectedType}.`;
    // Add description if available
    if (description) {
        errorMessage += `\nDescription: ${description}`;
    }
    // Create the validation error
    return createValidationError(errorMessage, paramName, examples);
};
/**
 * Enhanced middleware for validating parameters with improved error messages
 * Handles various MCP formats including Claude's format
 */
export const withEnhancedParamValidation = (schema, handler, schemaEnhancements) => {
    return async (params) => {
        try {
            // Debug raw params received from client
            logger.info('VALIDATION: Raw params received of type:', typeof params);
            // Check if params is empty or undefined
            if (!params || Object.keys(params).length === 0) {
                logger.info('VALIDATION: Empty or undefined parameters received');
                // Get required fields from schema if possible
                let requiredField = '';
                try {
                    // Try to extract required fields from schema description
                    if (schema.description) {
                        const description = schema.description;
                        if (description.required && Array.isArray(description.required)) {
                            requiredField = description.required[0];
                        }
                    }
                }
                catch (error) {
                    logger.info('VALIDATION: Could not extract required fields from schema description');
                }
                // If we found a required field or we have schema enhancements, create error
                if (requiredField || schemaEnhancements) {
                    // Get first key from schemaEnhancements if we couldn't get required field from schema
                    if (!requiredField && schemaEnhancements) {
                        requiredField = Object.keys(schemaEnhancements)[0];
                    }
                    logger.info(`VALIDATION: Missing required field: ${requiredField}`);
                    return createMissingParameterError(requiredField, schemaEnhancements);
                }
            }
            try {
                logger.debug('VALIDATION: Raw params content:', JSON.stringify(params, null, 2));
            }
            catch (error) {
                logger.info('VALIDATION: Could not stringify params:', error);
            }
            // Preprocess parameters to handle different MCP formats
            // This will extract parameters from nested formats used by Claude and other clients
            const actualParams = preprocessParams(params);
            logger.info('VALIDATION: Processed params keys:', Object.keys(actualParams).join(', '));
            // Special handling for certain known formats
            if ('arguments' in actualParams && typeof actualParams.arguments === 'object') {
                logger.info('VALIDATION: Found arguments object, processing it directly');
                const result = schema.safeParse(actualParams.arguments);
                if (result.success) {
                    return handler(result.data);
                }
            }
            // Handle claude-desktop specific format
            if (params?.name && params?.parameters) {
                logger.info('VALIDATION: Found Claude Desktop format (name + parameters)');
                const claudeParams = params.parameters;
                const result = schema.safeParse(claudeParams);
                if (result.success) {
                    return handler(result.data);
                }
            }
            // Attempt validation with the processed parameters
            const result = schema.safeParse(actualParams);
            if (!result.success) {
                // Get the first error
                const firstError = result.error.errors[0];
                const path = firstError.path.join('.');
                logger.info(`VALIDATION: Failed for param '${path}': ${firstError.message}`);
                // Check if it's a missing required parameter
                if (firstError.message === 'Required') {
                    return createMissingParameterError(path, schemaEnhancements);
                }
                // Otherwise it's an invalid parameter
                return createInvalidParameterError(path, actualParams[path], firstError.message, schemaEnhancements);
            }
            // If validation succeeds, pass the validated data to the handler
            logger.info('VALIDATION: Successful, passing validated data to handler');
            return handler(result.data);
        }
        catch (error) {
            logger.error('VALIDATION: Unexpected error during parameter validation:', error);
            return createValidationError(error instanceof Error ? error.message : 'Unknown validation error');
        }
    };
};
/**
 * Create a tool handler with enhanced validation, error handling, and response formatting
 * Handles various MCP formats including Claude's format
 */
export const createToolHandlerWithEnhancedValidation = (schema, schemaEnhancements, handler, transformer) => {
    // Original handler with response formatting 
    const handlerWithFormatting = async (params) => {
        try {
            logger.info('HANDLER: Executing handler with validated params');
            // Execute the handler with validated parameters
            const response = await handler(params);
            // Apply response transformation if provided
            const transformedResponse = transformer ? transformer(response) : response;
            // Log the response size for debugging
            try {
                const responseStr = JSON.stringify(transformedResponse);
                logger.info(`HANDLER: Response size: ${responseStr.length} characters`);
            }
            catch (error) {
                logger.info('HANDLER: Could not stringify response for logging');
            }
            return transformedResponse;
        }
        catch (error) {
            logger.error('HANDLER: Error in handler execution:', error);
            throw error; // Rethrow to be caught by the validation wrapper
        }
    };
    // Add enhanced validation and return the wrapped handler
    return withEnhancedParamValidation(schema, handlerWithFormatting, schemaEnhancements);
};
//# sourceMappingURL=param_validation_enhanced.js.map