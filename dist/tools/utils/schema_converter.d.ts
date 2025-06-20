/**
 * Utility functions for converting Zod schemas to JSON Schema format
 * for MCP tool registration
 */
import { z } from 'zod';
/**
 * Converts a Zod schema to JSON Schema format for MCP tool registration
 *
 * @param schema - The Zod schema to convert
 * @param name - Optional name for the schema (used for logging)
 * @returns JSON Schema representation of the Zod schema
 */
export declare function convertZodSchemaToJsonSchema(schema: z.ZodTypeAny, name?: string): any;
/**
 * Enhances a schema with examples and improved descriptions
 * Use this to add more context to schemas beyond what Zod provides
 *
 * @param schema - The JSON Schema to enhance
 * @param enhancements - Object with enhancements for specific properties
 * @returns Enhanced JSON Schema
 */
export declare function enhanceJsonSchema(schema: any, enhancements: Record<string, {
    description?: string;
    examples?: any[];
    enumDescriptions?: Record<string, string>;
}>): any;
declare const _default: {
    convertZodSchemaToJsonSchema: typeof convertZodSchemaToJsonSchema;
    enhanceJsonSchema: typeof enhanceJsonSchema;
};
export default _default;
