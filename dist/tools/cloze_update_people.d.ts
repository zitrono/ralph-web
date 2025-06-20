/**
 * Cloze Update People Tool
 * Updates an existing person in Cloze CRM
 */
import { z } from 'zod';
/**
 * Parameter schema for the cloze_update_people tool
 */
export declare const paramSchema: z.ZodEffects<z.ZodObject<{
    syncKey: z.ZodOptional<z.ZodString>;
    emails: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
    name: z.ZodOptional<z.ZodString>;
    first: z.ZodOptional<z.ZodString>;
    last: z.ZodOptional<z.ZodString>;
    phones: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
    company: z.ZodOptional<z.ZodString>;
    job_title: z.ZodOptional<z.ZodString>;
    segment: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    stage: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    location: z.ZodOptional<z.ZodString>;
    addresses: z.ZodOptional<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    customFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    syncKey?: string | undefined;
    first?: string | undefined;
    last?: string | undefined;
    emails?: {
        value: string;
        primary?: boolean | undefined;
        work?: boolean | undefined;
        personal?: boolean | undefined;
    }[] | undefined;
    phones?: {
        value: string;
        primary?: boolean | undefined;
        work?: boolean | undefined;
        mobile?: boolean | undefined;
        home?: boolean | undefined;
    }[] | undefined;
    addresses?: {
        primary?: boolean | undefined;
        work?: boolean | undefined;
        home?: boolean | undefined;
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postal_code?: string | undefined;
        country?: string | undefined;
    }[] | undefined;
    company?: string | undefined;
    job_title?: string | undefined;
    segment?: string | undefined;
    stage?: string | undefined;
    location?: string | undefined;
    keywords?: string[] | undefined;
    customFields?: Record<string, any> | undefined;
}, {
    name?: string | undefined;
    syncKey?: string | undefined;
    first?: string | undefined;
    last?: string | undefined;
    emails?: {
        value: string;
        primary?: boolean | undefined;
        work?: boolean | undefined;
        personal?: boolean | undefined;
    }[] | undefined;
    phones?: {
        value: string;
        primary?: boolean | undefined;
        work?: boolean | undefined;
        mobile?: boolean | undefined;
        home?: boolean | undefined;
    }[] | undefined;
    addresses?: {
        primary?: boolean | undefined;
        work?: boolean | undefined;
        home?: boolean | undefined;
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postal_code?: string | undefined;
        country?: string | undefined;
    }[] | undefined;
    company?: string | undefined;
    job_title?: string | undefined;
    segment?: string | undefined;
    stage?: string | undefined;
    location?: string | undefined;
    keywords?: string[] | undefined;
    customFields?: Record<string, any> | undefined;
}>, {
    name?: string | undefined;
    syncKey?: string | undefined;
    first?: string | undefined;
    last?: string | undefined;
    emails?: {
        value: string;
        primary?: boolean | undefined;
        work?: boolean | undefined;
        personal?: boolean | undefined;
    }[] | undefined;
    phones?: {
        value: string;
        primary?: boolean | undefined;
        work?: boolean | undefined;
        mobile?: boolean | undefined;
        home?: boolean | undefined;
    }[] | undefined;
    addresses?: {
        primary?: boolean | undefined;
        work?: boolean | undefined;
        home?: boolean | undefined;
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postal_code?: string | undefined;
        country?: string | undefined;
    }[] | undefined;
    company?: string | undefined;
    job_title?: string | undefined;
    segment?: string | undefined;
    stage?: string | undefined;
    location?: string | undefined;
    keywords?: string[] | undefined;
    customFields?: Record<string, any> | undefined;
}, {
    name?: string | undefined;
    syncKey?: string | undefined;
    first?: string | undefined;
    last?: string | undefined;
    emails?: {
        value: string;
        primary?: boolean | undefined;
        work?: boolean | undefined;
        personal?: boolean | undefined;
    }[] | undefined;
    phones?: {
        value: string;
        primary?: boolean | undefined;
        work?: boolean | undefined;
        mobile?: boolean | undefined;
        home?: boolean | undefined;
    }[] | undefined;
    addresses?: {
        primary?: boolean | undefined;
        work?: boolean | undefined;
        home?: boolean | undefined;
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        postal_code?: string | undefined;
        country?: string | undefined;
    }[] | undefined;
    company?: string | undefined;
    job_title?: string | undefined;
    segment?: string | undefined;
    stage?: string | undefined;
    location?: string | undefined;
    keywords?: string[] | undefined;
    customFields?: Record<string, any> | undefined;
}>;
/**
 * Schema enhancements to add examples and additional information
 */
export declare const schemaEnhancements: {
    syncKey: {
        examples: string[];
        description: string;
    };
    emails: {
        examples: never[][];
        description: string;
    };
    name: {
        examples: string[];
        description: string;
    };
    first: {
        examples: string[];
        description: string;
    };
    last: {
        examples: string[];
        description: string;
    };
    phones: {
        examples: number[];
        description: string;
    };
    company: {
        examples: string[];
        description: string;
    };
    job_title: {
        examples: string[];
        description: string;
    };
    segment: {
        examples: never[];
        description: string;
    };
    stage: {
        examples: never[];
        description: string;
    };
    location: {
        examples: string[];
        description: string;
    };
    addresses: {
        examples: never[][];
        description: string;
    };
    keywords: {
        examples: string[];
        description: string;
    };
    customFields: {
        examples: string[];
        description: string;
    };
};
declare const _default: (params: Record<string, any>) => Promise<any>;
export default _default;
/**
 * Tool metadata for registration
 */
export declare const metadata: {
    name: string;
    description: string;
};
