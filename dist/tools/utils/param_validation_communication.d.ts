/**
 * Parameter validation utilities for communication-related tools
 * Provides schemas for validating communication parameters
 */
import { z } from 'zod';
export declare const COMMUNICATION_STYLES: readonly ["email", "meeting", "direct", "call", "text"];
export type CommunicationStyle = typeof COMMUNICATION_STYLES[number];
export declare const communicationStyleSchema: z.ZodEnum<["email", "meeting", "direct", "call", "text"]>;
export declare const recipientSchema: z.ZodObject<{
    value: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: string;
    name?: string | undefined;
}, {
    value: string;
    name?: string | undefined;
}>;
export declare const referenceSchema: z.ZodObject<{
    type: z.ZodEnum<["person", "company", "project"]>;
    value: z.ZodString;
}, "strip", z.ZodTypeAny, {
    value: string;
    type: "company" | "project" | "person";
}, {
    value: string;
    type: "company" | "project" | "person";
}>;
export declare const baseCommunicationSchema: z.ZodObject<{
    date: z.ZodString;
    subject: z.ZodString;
    from: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    bodytype: z.ZodOptional<z.ZodEnum<["text", "html"]>>;
    recipients: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name?: string | undefined;
    }, {
        value: string;
        name?: string | undefined;
    }>, "many">>;
    references: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["person", "company", "project"]>;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: "company" | "project" | "person";
    }, {
        value: string;
        type: "company" | "project" | "person";
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    date: string;
    subject: string;
    from: string;
    body?: string | undefined;
    bodytype?: "text" | "html" | undefined;
    recipients?: {
        value: string;
        name?: string | undefined;
    }[] | undefined;
    references?: {
        value: string;
        type: "company" | "project" | "person";
    }[] | undefined;
}, {
    date: string;
    subject: string;
    from: string;
    body?: string | undefined;
    bodytype?: "text" | "html" | undefined;
    recipients?: {
        value: string;
        name?: string | undefined;
    }[] | undefined;
    references?: {
        value: string;
        type: "company" | "project" | "person";
    }[] | undefined;
}>;
export declare const meetingCommunicationSchema: z.ZodObject<{
    date: z.ZodString;
    subject: z.ZodString;
    from: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    bodytype: z.ZodOptional<z.ZodEnum<["text", "html"]>>;
    recipients: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name?: string | undefined;
    }, {
        value: string;
        name?: string | undefined;
    }>, "many">>;
    references: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["person", "company", "project"]>;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: "company" | "project" | "person";
    }, {
        value: string;
        type: "company" | "project" | "person";
    }>, "many">>;
} & {
    style: z.ZodOptional<z.ZodLiteral<"meeting">>;
    location: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    date: string;
    subject: string;
    from: string;
    location?: string | undefined;
    style?: "meeting" | undefined;
    body?: string | undefined;
    bodytype?: "text" | "html" | undefined;
    recipients?: {
        value: string;
        name?: string | undefined;
    }[] | undefined;
    references?: {
        value: string;
        type: "company" | "project" | "person";
    }[] | undefined;
    duration?: number | undefined;
}, {
    date: string;
    subject: string;
    from: string;
    location?: string | undefined;
    style?: "meeting" | undefined;
    body?: string | undefined;
    bodytype?: "text" | "html" | undefined;
    recipients?: {
        value: string;
        name?: string | undefined;
    }[] | undefined;
    references?: {
        value: string;
        type: "company" | "project" | "person";
    }[] | undefined;
    duration?: number | undefined;
}>;
export declare const noteCommunicationSchema: z.ZodObject<{
    date: z.ZodString;
    subject: z.ZodString;
    from: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    bodytype: z.ZodOptional<z.ZodEnum<["text", "html"]>>;
    recipients: z.ZodOptional<z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name?: string | undefined;
    }, {
        value: string;
        name?: string | undefined;
    }>, "many">>;
    references: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["person", "company", "project"]>;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: "company" | "project" | "person";
    }, {
        value: string;
        type: "company" | "project" | "person";
    }>, "many">>;
} & {
    style: z.ZodOptional<z.ZodLiteral<"direct">>;
}, "strip", z.ZodTypeAny, {
    date: string;
    subject: string;
    from: string;
    style?: "direct" | undefined;
    body?: string | undefined;
    bodytype?: "text" | "html" | undefined;
    recipients?: {
        value: string;
        name?: string | undefined;
    }[] | undefined;
    references?: {
        value: string;
        type: "company" | "project" | "person";
    }[] | undefined;
}, {
    date: string;
    subject: string;
    from: string;
    style?: "direct" | undefined;
    body?: string | undefined;
    bodytype?: "text" | "html" | undefined;
    recipients?: {
        value: string;
        name?: string | undefined;
    }[] | undefined;
    references?: {
        value: string;
        type: "company" | "project" | "person";
    }[] | undefined;
}>;
export declare const emailCommunicationSchema: z.ZodObject<{
    date: z.ZodString;
    subject: z.ZodString;
    from: z.ZodString;
    body: z.ZodOptional<z.ZodString>;
    bodytype: z.ZodOptional<z.ZodEnum<["text", "html"]>>;
    references: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["person", "company", "project"]>;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: "company" | "project" | "person";
    }, {
        value: string;
        type: "company" | "project" | "person";
    }>, "many">>;
} & {
    style: z.ZodOptional<z.ZodLiteral<"email">>;
    recipients: z.ZodArray<z.ZodObject<{
        value: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        value: string;
        name?: string | undefined;
    }, {
        value: string;
        name?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    date: string;
    subject: string;
    from: string;
    recipients: {
        value: string;
        name?: string | undefined;
    }[];
    style?: "email" | undefined;
    body?: string | undefined;
    bodytype?: "text" | "html" | undefined;
    references?: {
        value: string;
        type: "company" | "project" | "person";
    }[] | undefined;
}, {
    date: string;
    subject: string;
    from: string;
    recipients: {
        value: string;
        name?: string | undefined;
    }[];
    style?: "email" | undefined;
    body?: string | undefined;
    bodytype?: "text" | "html" | undefined;
    references?: {
        value: string;
        type: "company" | "project" | "person";
    }[] | undefined;
}>;
