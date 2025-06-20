/**
 * Parameter validation utilities for communication-related tools
 * Provides schemas for validating communication parameters
 */
import { z } from 'zod';
// Supported communication styles
export const COMMUNICATION_STYLES = [
    'email', // Email message
    'meeting', // Meeting
    'direct', // Note/direct message
    'call', // Phone call
    'text', // Text message
];
// Schema for communication style
export const communicationStyleSchema = z.enum(COMMUNICATION_STYLES)
    .describe(`Communication style (${COMMUNICATION_STYLES.join(', ')})`);
// Schema for communication recipient
export const recipientSchema = z.object({
    value: z.string()
        .describe('Email address or contact identifier of the recipient'),
    name: z.string().optional()
        .describe('Name of the recipient')
});
// Schema for reference to other entities
export const referenceSchema = z.object({
    type: z.enum(['person', 'company', 'project'])
        .describe('Type of entity being referenced'),
    value: z.string()
        .describe('Identifier (syncKey) of the referenced entity')
});
// Base schema for all communications
export const baseCommunicationSchema = z.object({
    // Required fields
    date: z.string()
        .describe('Date and time of the communication (ISO 8601 format, e.g., "2023-05-14T14:30:00Z")'),
    subject: z.string()
        .describe('Subject or title of the communication'),
    from: z.string()
        .describe('Email address or identifier of the sender'),
    // Optional fields
    body: z.string().optional()
        .describe('Content or description of the communication'),
    bodytype: z.enum(['text', 'html']).optional()
        .describe('Format of the body content (text or html)'),
    recipients: z.array(recipientSchema).optional()
        .describe('Array of recipients/attendees'),
    references: z.array(referenceSchema).optional()
        .describe('Array of related entities (people, companies, projects)'),
});
// Schema specifically for meeting communications
export const meetingCommunicationSchema = baseCommunicationSchema.extend({
    style: z.literal('meeting').optional()
        .describe('Communication style (always "meeting" for this tool)'),
    location: z.string().optional()
        .describe('Physical or virtual location of the meeting'),
    duration: z.number().optional()
        .describe('Duration of the meeting in minutes')
});
// Schema specifically for note communications
export const noteCommunicationSchema = baseCommunicationSchema.extend({
    style: z.literal('direct').optional()
        .describe('Communication style (always "direct" for notes)'),
});
// Schema specifically for email communications
export const emailCommunicationSchema = baseCommunicationSchema.extend({
    style: z.literal('email').optional()
        .describe('Communication style (always "email" for this tool)'),
    recipients: z.array(recipientSchema).min(1)
        .describe('Array of email recipients (at least one required)')
});
//# sourceMappingURL=param_validation_communication.js.map