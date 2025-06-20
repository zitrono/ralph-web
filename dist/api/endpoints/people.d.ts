/**
 * People-related API endpoints implementation
 * Handles all API operations for people in Cloze CRM
 */
import { Person, PeopleResponse, ClozeApiResponse } from '../types.js';
/**
 * Find people by email, name, or other criteria
 */
export declare const findPeople: (params: Record<string, any>) => Promise<PeopleResponse>;
/**
 * Create a new person in Cloze CRM
 */
export declare const createPerson: (person: Person) => Promise<ClozeApiResponse>;
/**
 * Update an existing person in Cloze CRM
 */
export declare const updatePerson: (person: Partial<Person>) => Promise<ClozeApiResponse>;
/**
 * Delete a person from Cloze CRM by email or syncKey
 */
export declare const deletePerson: (uniqueid: string) => Promise<ClozeApiResponse>;
/**
 * Find people near a specific location
 */
export declare const findNearbyPeople: (location: string, params?: Record<string, any>) => Promise<PeopleResponse>;
/**
 * Add location to a person
 */
export declare const addPersonLocation: (person: Person) => Promise<ClozeApiResponse>;
/**
 * Create a tag for a person
 */
export declare const createPersonTag: (email: string, tags: string[]) => Promise<ClozeApiResponse>;
/**
 * Read tags for a person
 */
export declare const readPersonTags: (email: string) => Promise<PeopleResponse>;
/**
 * Update a person's tag
 */
export declare const updatePersonTag: (email: string, tags: string[]) => Promise<ClozeApiResponse>;
/**
 * Delete a tag from a person
 */
export declare const deletePersonTag: (email: string, tagsToKeep: string[]) => Promise<ClozeApiResponse>;
/**
 * Get locations for a person
 */
export declare const getPersonLocations: (email: string) => Promise<PeopleResponse>;
