/**
 * Communications-related API endpoints implementation
 * Handles all API operations for communications in Cloze CRM
 * Supports meeting creation, note creation, and email logging
 */
import { Communication, ClozeApiResponse } from '../types.js';
/**
 * Create a new communication record in Cloze CRM
 * Supports different communication styles: meetings, notes, emails
 */
export declare const createCommunication: (communication: Communication) => Promise<ClozeApiResponse>;
/**
 * Add a meeting to Cloze CRM
 * This is a specialized version of createCommunication with style="meeting"
 */
export declare const addMeeting: (meeting: Omit<Communication, "style"> & {
    style?: "meeting";
}) => Promise<ClozeApiResponse>;
/**
 * Add a note to Cloze CRM
 * This is a specialized version of createCommunication with style="direct"
 */
export declare const addNote: (note: Omit<Communication, "style"> & {
    style?: "direct";
}) => Promise<ClozeApiResponse>;
/**
 * Log an email in Cloze CRM
 * This is a specialized version of createCommunication with style="email"
 */
export declare const logEmail: (email: Omit<Communication, "style"> & {
    style?: "email";
}) => Promise<ClozeApiResponse>;
