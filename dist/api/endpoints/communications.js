/**
 * Communications-related API endpoints implementation
 * Handles all API operations for communications in Cloze CRM
 * Supports meeting creation, note creation, and email logging
 */
import apiClient from '../client.js';
import logger from '../../logging.js';
/**
 * Create a new communication record in Cloze CRM
 * Supports different communication styles: meetings, notes, emails
 */
export const createCommunication = async (communication) => {
    logger.debug('Creating communication record:', communication);
    return apiClient.post('/v1/timeline/communication/create', communication);
};
/**
 * Add a meeting to Cloze CRM
 * This is a specialized version of createCommunication with style="meeting"
 */
export const addMeeting = async (meeting) => {
    logger.debug('Adding meeting:', meeting);
    // Validate required fields
    if (!meeting.date || !meeting.subject || !meeting.from) {
        throw new Error('Required fields missing: date, subject, and from are required for meetings');
    }
    // Force the style to be meeting
    const meetingData = {
        date: meeting.date,
        subject: meeting.subject,
        from: meeting.from,
        style: 'meeting',
        // Include optional fields if they exist
        ...(meeting.body && { body: meeting.body }),
        ...(meeting.bodytype && { bodytype: meeting.bodytype }),
        ...(meeting.recipients && { recipients: meeting.recipients }),
        ...(meeting.references && { references: meeting.references }),
        ...(meeting.location && { location: meeting.location }),
        ...(meeting.duration && { duration: meeting.duration })
    };
    return createCommunication(meetingData);
};
/**
 * Add a note to Cloze CRM
 * This is a specialized version of createCommunication with style="direct"
 */
export const addNote = async (note) => {
    logger.debug('Adding note:', note);
    // Validate required fields
    if (!note.date || !note.subject || !note.from) {
        throw new Error('Required fields missing: date, subject, and from are required for notes');
    }
    // Force the style to be direct
    const noteData = {
        date: note.date,
        subject: note.subject,
        from: note.from,
        style: 'direct',
        // Include optional fields if they exist
        ...(note.body && { body: note.body }),
        ...(note.bodytype && { bodytype: note.bodytype }),
        ...(note.recipients && { recipients: note.recipients }),
        ...(note.references && { references: note.references })
    };
    return createCommunication(noteData);
};
/**
 * Log an email in Cloze CRM
 * This is a specialized version of createCommunication with style="email"
 */
export const logEmail = async (email) => {
    logger.debug('Logging email:', email);
    // Validate required fields
    if (!email.date || !email.subject || !email.from) {
        throw new Error('Required fields missing: date, subject, and from are required for emails');
    }
    // Validate email recipients
    if (!email.recipients || email.recipients.length === 0) {
        throw new Error('At least one recipient is required for emails');
    }
    // Force the style to be email
    const emailData = {
        date: email.date,
        subject: email.subject,
        from: email.from,
        style: 'email',
        recipients: email.recipients,
        // Include optional fields if they exist
        ...(email.body && { body: email.body }),
        ...(email.bodytype && { bodytype: email.bodytype }),
        ...(email.references && { references: email.references })
    };
    return createCommunication(emailData);
};
//# sourceMappingURL=communications.js.map