/**
 * Enhanced parameter validation utilities for MCP tools
 * Provides improved error messages and examples for validation failures
 */
import { z } from 'zod';
import { ValidationErrorResponse } from './param_validation.js';
/**
 * Utility function to preprocess parameters and handle different MCP formats
 * Extracts parameters from nested formats and normalizes them
 */
export declare const preprocessParams: (params: any) => any;
/**
 * Extract parameter examples from schema enhancements
 */
export declare const getParameterExamples: (paramName: string, schemaEnhancements: Record<string, {
    examples?: any[];
}>) => string[];
/**
 * Create a user-friendly error message for missing required parameter
 */
export declare const createMissingParameterError: (paramName: string, schemaEnhancements?: Record<string, {
    examples?: any[];
    description?: string;
}>) => ValidationErrorResponse;
/**
 * Create a user-friendly error message for invalid parameter
 */
export declare const createInvalidParameterError: (paramName: string, providedValue: any, expectedType: string, schemaEnhancements?: Record<string, {
    examples?: any[];
    description?: string;
}>) => ValidationErrorResponse;
/**
 * Enhanced middleware for validating parameters with improved error messages
 * Handles various MCP formats including Claude's format
 */
export declare const withEnhancedParamValidation: <T>(schema: z.ZodType<T>, handler: (params: T) => Promise<any>, schemaEnhancements?: Record<string, {
    examples?: any[];
    description?: string;
}>) => (params: Record<string, any>) => Promise<any>;
/**
 * Create a tool handler with enhanced validation, error handling, and response formatting
 * Handles various MCP formats including Claude's format
 */
export declare const createToolHandlerWithEnhancedValidation: <P>(schema: z.ZodType<P>, schemaEnhancements: Record<string, {
    examples?: any[];
    description?: string;
}>, handler: (params: P) => Promise<any>, transformer?: (response: any) => any) => (params: Record<string, any>) => Promise<any>;
