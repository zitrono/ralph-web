/**
 * Type definitions for the Cloze API
 * Defines interfaces for API requests and responses
 */
// Valid segment and stage values
export const PEOPLE_SEGMENTS = [
    'customer', // Client
    'partner', // Partner
    'competitor', // Competitor
    'family', // Family
    'friend', // Friend
    'network', // Connection
    'coworker', // Coworker
    'none' // None
];
export const PEOPLE_STAGES = [
    'lead', // Lead
    'future', // Potential
    'current', // Active
    'past', // Inactive
    'out' // Lost
];
export const PROJECT_SEGMENTS = [
    'project', // Project
    'project1', // Process Improvement
    'none' // None
];
export const PROJECT_STAGES = [
    'future', // Potential
    'current', // Active
    'pending', // Pending
    'won', // Done
    'lost' // Lost
];
//# sourceMappingURL=types.js.map