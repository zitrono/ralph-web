/**
 * Debug tool for tracing parameter passing between Claude Desktop and the MCP server
 * This tool returns the exact parameters it received, allowing visualization of formatting
 */

import { z } from 'zod';
import { createToolHandlerWithEnhancedValidation } from './utils/param_validation_enhanced.js';
import { logger, logClaudeDesktopRequest } from '../logging.js';

// Accept any parameter structure
const paramSchema = z.any().describe('Any parameters to echo back for debugging');

// Extract and log raw parameter structure
async function handler(params: any) {
  // Write the complete params to a dedicated file for later analysis
  const logPath = logClaudeDesktopRequest(params, 'DEBUG TOOL - RAW PARAMETERS');
  logger.info(`CLAUDE_DESKTOP_DEBUG: Logged raw parameters to ${logPath}`);
  
  // Specialized Claude Desktop debug logging
  logger.claudeDesktop('DEBUG TOOL CALLED', {
    rawParams: params,
    timestamp: new Date().toISOString(),
    paramsType: typeof params,
    paramsIsNull: params === null,
    paramsIsArray: Array.isArray(params),
    paramsObjectKeys: typeof params === 'object' && params !== null ? Object.keys(params) : [],
    hasName: params?.name !== undefined,
    hasParameters: params?.parameters !== undefined,
    parametersType: typeof params?.parameters,
    parametersKeys: params?.parameters && typeof params.parameters === 'object' ? Object.keys(params.parameters) : [],
    // Look for backtick patterns
    keyFormats: typeof params === 'object' && params !== null ? 
      Object.keys(params).map(key => ({ 
        key, 
        containsBacktick: key.includes('`'),
        isBacktickFormat: key.startsWith('`') && key.endsWith('`')
      })) : []
  });
  
  // Standard debug logging
  logger.info('CLAUDE_DESKTOP_DEBUG: Debug tool handler called');
  logger.info(`CLAUDE_DESKTOP_DEBUG: Raw request body: ${JSON.stringify(params)}`);
  logger.info(`CLAUDE_DESKTOP_DEBUG: Raw request body (direct): ${params}`);
  logger.info(`CLAUDE_DESKTOP_DEBUG: Request body type: ${typeof params}`);
  
  // If it's an object, log all keys at the root level
  if (typeof params === 'object' && params !== null) {
    logger.info(`CLAUDE_DESKTOP_DEBUG: Request body keys: ${Object.keys(params).join(', ')}`);
    // Log special cases for known properties
    if (params.name) logger.info(`CLAUDE_DESKTOP_DEBUG: params.name: ${params.name}`);
    if (params.parameters) logger.info(`CLAUDE_DESKTOP_DEBUG: params.parameters type: ${typeof params.parameters}`);
    if (params.parameters) logger.info(`CLAUDE_DESKTOP_DEBUG: params.parameters keys: ${Object.keys(params.parameters || {}).join(', ')}`);
    
    // Deep inspection of the parameters structure
    logger.info('CLAUDE_DESKTOP_DEBUG: Deep inspection of the parameters structure');
    inspectObject('params', params, 3);
  }
  
  // Original debug logging
  logger.info('PARAM_DEBUG: Received raw parameters in debug tool:', JSON.stringify(params));
  
  // Create a debug response with detailed parameter format info
  const result = {
    success: true,
    receivedParams: params,
    parameterInfo: {
      type: typeof params,
      isObject: typeof params === 'object',
      isArray: Array.isArray(params),
      keys: params && typeof params === 'object' ? Object.keys(params) : [],
      nestedStructure: getNestedStructure(params)
    },
    message: 'Parameter debug information captured successfully',
    claudeDesktopDebug: {
      rawFormat: params,
      typeInfo: typeof params,
      topLevelKeys: params && typeof params === 'object' ? Object.keys(params) : [],
      hasNameProperty: params?.name !== undefined,
      hasParametersProperty: params?.parameters !== undefined,
      parametersKeys: params?.parameters && typeof params.parameters === 'object' ? Object.keys(params.parameters) : [],
      // Additional backtick information
      backtickAnalysis: {
        hasBacktickKeys: typeof params === 'object' && params !== null ? 
          Object.keys(params).some(key => key.includes('`')) : false,
        backtickKeys: typeof params === 'object' && params !== null ?
          Object.keys(params).filter(key => key.includes('`')) : [],
        keyDetails: typeof params === 'object' && params !== null ?
          Object.keys(params).map(key => ({
            key,
            containsBacktick: key.includes('`'),
            isBacktickWrapped: key.startsWith('`') && key.endsWith('`'),
            value: typeof params[key] === 'object' ? '<object>' : String(params[key])
          })) : []
      }
    }
  };
  
  return result;
}

// Helper function to analyze nested structure
function getNestedStructure(params: any): any {
  if (!params || typeof params !== 'object') {
    return { type: typeof params, value: params };
  }
  
  if (Array.isArray(params)) {
    return params.map(item => getNestedStructure(item));
  }
  
  const result: Record<string, any> = {};
  
  for (const key of Object.keys(params)) {
    if (typeof params[key] === 'object' && params[key] !== null) {
      result[key] = {
        type: Array.isArray(params[key]) ? 'array' : 'object',
        keys: Object.keys(params[key]),
        nestedStructure: getNestedStructure(params[key])
      };
    } else {
      result[key] = {
        type: typeof params[key],
        value: params[key]
      };
    }
  }
  
  return result;
}

// Helper function for deep inspection of objects for debugging
function inspectObject(path: string, obj: any, maxDepth: number = 2, currentDepth: number = 0): void {
  if (currentDepth > maxDepth) {
    logger.info(`CLAUDE_DESKTOP_DEBUG: ${path} - Max depth reached`);
    return;
  }
  
  if (!obj || typeof obj !== 'object') {
    logger.info(`CLAUDE_DESKTOP_DEBUG: ${path} = ${obj} (${typeof obj})`);
    return;
  }
  
  if (Array.isArray(obj)) {
    logger.info(`CLAUDE_DESKTOP_DEBUG: ${path} is Array with ${obj.length} items`);
    if (obj.length > 0) {
      for (let i = 0; i < Math.min(5, obj.length); i++) { // Limit to first 5 items
        inspectObject(`${path}[${i}]`, obj[i], maxDepth, currentDepth + 1);
      }
      if (obj.length > 5) {
        logger.info(`CLAUDE_DESKTOP_DEBUG: ${path} - Additional ${obj.length - 5} items not shown`);
      }
    }
    return;
  }
  
  const keys = Object.keys(obj);
  logger.info(`CLAUDE_DESKTOP_DEBUG: ${path} is Object with keys: ${keys.join(', ')}`);
  
  for (const key of keys) {
    inspectObject(`${path}.${key}`, obj[key], maxDepth, currentDepth + 1);
  }
}

// No schema enhancements needed for this debug tool
const schemaEnhancements = {};

// Export the tool with enhanced validation
export default createToolHandlerWithEnhancedValidation(
  paramSchema,
  schemaEnhancements,
  handler
);