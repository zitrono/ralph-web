/**
 * Parameter validation utilities for MCP tools
 * Provides functions to validate and transform parameters
 */
import { z } from 'zod';
/**
 * Error response interface for validation errors
 */
export interface ValidationErrorResponse {
    content: {
        type: 'text';
        text: string;
    }[];
}
/**
 * Creates a validation error response with suggested values
 */
export declare const createValidationError: (message: string, param?: string, suggestedValues?: string[]) => ValidationErrorResponse;
/**
 * Helper to validate parameters against a Zod schema
 */
export declare const validateParams: <T>(schema: z.ZodType<T>, params: Record<string, any>) => {
    success: true;
    data: T;
} | {
    success: false;
    error: ValidationErrorResponse;
};
/**
 * Middleware for validating parameters against a schema
 */
export declare const withParamValidation: <T>(schema: z.ZodType<T>, handler: (params: T) => Promise<any>) => (params: Record<string, any>) => Promise<any>;
/**
 * Common schemas for reuse across tools
 */
export declare const personEmailSchema: z.ZodObject<{
    value: z.ZodString;
    primary: z.ZodOptional<z.ZodBoolean>;
    work: z.ZodOptional<z.ZodBoolean>;
    personal: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    value: string;
    primary?: boolean | undefined;
    work?: boolean | undefined;
    personal?: boolean | undefined;
}, {
    value: string;
    primary?: boolean | undefined;
    work?: boolean | undefined;
    personal?: boolean | undefined;
}>;
export declare const personPhoneSchema: z.ZodObject<{
    value: z.ZodString;
    primary: z.ZodOptional<z.ZodBoolean>;
    work: z.ZodOptional<z.ZodBoolean>;
    mobile: z.ZodOptional<z.ZodBoolean>;
    home: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    value: string;
    primary?: boolean | undefined;
    work?: boolean | undefined;
    mobile?: boolean | undefined;
    home?: boolean | undefined;
}, {
    value: string;
    primary?: boolean | undefined;
    work?: boolean | undefined;
    mobile?: boolean | undefined;
    home?: boolean | undefined;
}>;
export declare const personAddressSchema: z.ZodObject<{
    street: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    state: z.ZodOptional<z.ZodString>;
    postal_code: z.ZodOptional<z.ZodString>;
    country: z.ZodOptional<z.ZodString>;
    primary: z.ZodOptional<z.ZodBoolean>;
    work: z.ZodOptional<z.ZodBoolean>;
    home: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    primary?: boolean | undefined;
    work?: boolean | undefined;
    home?: boolean | undefined;
    street?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    postal_code?: string | undefined;
    country?: string | undefined;
}, {
    primary?: boolean | undefined;
    work?: boolean | undefined;
    home?: boolean | undefined;
    street?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    postal_code?: string | undefined;
    country?: string | undefined;
}>;
export declare const personSegmentSchema: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
export declare const personStageSchema: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
export declare const projectSegmentSchema: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
export declare const projectStageSchema: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
export declare const paginationSchema: z.ZodObject<{
    pagesize: z.ZodOptional<z.ZodNumber>;
    pagenumber: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    pagenumber?: number | undefined;
    pagesize?: number | undefined;
}, {
    pagenumber?: number | undefined;
    pagesize?: number | undefined;
}>;
export declare const appLinkSchema: z.ZodObject<{
    uniqueid: z.ZodString;
    source: z.ZodString;
    url: z.ZodString;
    label: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uniqueid: string;
    source: string;
    url: string;
    label: string;
}, {
    uniqueid: string;
    source: string;
    url: string;
    label: string;
}>;
/**
 * Helper function to validate and suggest values
 */
export declare const isValidEnumValue: (value: string | undefined, allowedValues: string[]) => boolean;
/**
 * Format allowed values for error messages
 */
export declare const formatAllowedValues: (allowedValues: string[]) => string;
