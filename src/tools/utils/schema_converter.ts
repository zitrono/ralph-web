/**
 * Utility functions for converting Zod schemas to JSON Schema format
 * for MCP tool registration
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import logger from '../../logging.js';

/**
 * Converts a Zod schema to JSON Schema format for MCP tool registration
 * 
 * @param schema - The Zod schema to convert
 * @param name - Optional name for the schema (used for logging)
 * @returns JSON Schema representation of the Zod schema
 */
export function convertZodSchemaToJsonSchema(schema: z.ZodTypeAny, name: string = 'unnamed'): any {
  try {
    logger.debug(`Converting schema for ${name} to JSON Schema`);
    
    // Convert the Zod schema to JSON Schema
    const jsonSchema = zodToJsonSchema(schema, {
      // Include property descriptions from Zod schema
      $refStrategy: 'none',
      // Generate a proper title
      target: 'jsonSchema7'
    });
    
    logger.debug(`Successfully converted schema for ${name}`);
    return jsonSchema;
  } catch (error) {
    logger.error(`Failed to convert schema for ${name} to JSON Schema:`, error);
    
    // Return a minimal schema if conversion fails
    return {
      type: 'object',
      properties: {}
    };
  }
}

/**
 * Enhances a schema with examples and improved descriptions
 * Use this to add more context to schemas beyond what Zod provides
 * 
 * @param schema - The JSON Schema to enhance
 * @param enhancements - Object with enhancements for specific properties
 * @returns Enhanced JSON Schema
 */
export function enhanceJsonSchema(
  schema: any, 
  enhancements: Record<string, { 
    description?: string; 
    examples?: any[]; 
    enumDescriptions?: Record<string, string>;
  }>
): any {
  // Make a deep copy of the schema to avoid modifying the original
  const enhancedSchema = JSON.parse(JSON.stringify(schema));
  
  // Apply enhancements to properties
  if (enhancedSchema.properties) {
    for (const [propName, propEnhancements] of Object.entries(enhancements)) {
      if (enhancedSchema.properties[propName]) {
        // Add or override description
        if (propEnhancements.description) {
          enhancedSchema.properties[propName].description = propEnhancements.description;
        }
        
        // Add examples
        if (propEnhancements.examples && propEnhancements.examples.length > 0) {
          enhancedSchema.properties[propName].examples = propEnhancements.examples;
        }
        
        // Add enum descriptions if property has enum
        if (propEnhancements.enumDescriptions && enhancedSchema.properties[propName].enum) {
          enhancedSchema.properties[propName].enumDescriptions = propEnhancements.enumDescriptions;
        }
      }
    }
  }
  
  return enhancedSchema;
}

export default {
  convertZodSchemaToJsonSchema,
  enhanceJsonSchema
};