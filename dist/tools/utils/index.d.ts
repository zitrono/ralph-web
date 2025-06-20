/**
 * Utilities for MCP tools
 * Exports all utility functions for use in tool implementations
 */
export * from './param_validation.js';
export * from './param_validation_enhanced.js';
export * from './error_handling.js';
export * from './response_formatting.js';
import { z } from 'zod';
import { McpToolResponse } from './error_handling.js';
import { ClozeApiResponse } from '../../api/types.js';
/**
 * Create a tool handler with validation, error handling, and response formatting
 */
export declare const createToolHandler: <P, R extends ClozeApiResponse>(schema: z.ZodType<P>, handler: (params: P) => Promise<R>, transformer?: (response: R) => any) => (params: Record<string, any>) => Promise<McpToolResponse>;
