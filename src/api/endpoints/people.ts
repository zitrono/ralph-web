/**
 * People-related API endpoints implementation
 * Handles all API operations for people in Cloze CRM
 */

import apiClient from '../client.js';
import logger from '../../logging.js';
import { Person, PeopleResponse, ClozeApiResponse } from '../types.js';

/**
 * Find people by email, name, or other criteria
 */
export const findPeople = async (params: Record<string, any>): Promise<PeopleResponse> => {
  logger.debug('Finding people with params:', params);
  return apiClient.get<PeopleResponse>('/v1/people/find', params);
};

/**
 * Create a new person in Cloze CRM
 */
export const createPerson = async (person: Person): Promise<ClozeApiResponse> => {
  logger.debug('Creating person:', person);
  return apiClient.post<ClozeApiResponse>('/v1/people/create', person);
};

/**
 * Update an existing person in Cloze CRM
 */
export const updatePerson = async (person: Partial<Person>): Promise<ClozeApiResponse> => {
  logger.debug('Updating person:', person);
  return apiClient.post<ClozeApiResponse>('/v1/people/update', person);
};

/**
 * Delete a person from Cloze CRM by email or syncKey
 */
export const deletePerson = async (uniqueid: string): Promise<ClozeApiResponse> => {
  logger.debug(`Deleting person with ID: ${uniqueid}`);
  return apiClient.delete<ClozeApiResponse>('/v1/people/delete', { uniqueid });
};

/**
 * Find people near a specific location
 */
export const findNearbyPeople = async (location: string, params: Record<string, any> = {}): Promise<PeopleResponse> => {
  const searchParams = {
    ...params,
    freeformquery: `near:${location}`
  };
  
  logger.debug('Finding people near location:', location);
  return findPeople(searchParams);
};

/**
 * Add location to a person
 */
export const addPersonLocation = async (person: Person): Promise<ClozeApiResponse> => {
  logger.debug('Adding location to person:', person);
  return updatePerson(person);
};

/**
 * Create a tag for a person
 */
export const createPersonTag = async (email: string, tags: string[]): Promise<ClozeApiResponse> => {
  logger.debug(`Creating tags for person ${email}:`, tags);
  
  const personData: Person = {
    emails: [{ value: email }],
    keywords: tags
  };
  
  return updatePerson(personData);
};

/**
 * Read tags for a person
 */
export const readPersonTags = async (email: string): Promise<PeopleResponse> => {
  logger.debug(`Reading tags for person: ${email}`);
  return findPeople({ freeformquery: email });
};

/**
 * Update a person's tag
 */
export const updatePersonTag = async (email: string, tags: string[]): Promise<ClozeApiResponse> => {
  logger.debug(`Updating tags for person ${email}:`, tags);
  
  const personData: Person = {
    emails: [{ value: email }],
    keywords: tags
  };
  
  return updatePerson(personData);
};

/**
 * Delete a tag from a person
 */
export const deletePersonTag = async (email: string, tagsToKeep: string[]): Promise<ClozeApiResponse> => {
  logger.debug(`Deleting tags for person ${email}, keeping:`, tagsToKeep);
  
  const personData: Person = {
    emails: [{ value: email }],
    keywords: tagsToKeep
  };
  
  return updatePerson(personData);
};

/**
 * Get locations for a person
 */
export const getPersonLocations = async (email: string): Promise<PeopleResponse> => {
  logger.debug(`Getting locations for person: ${email}`);
  return findPeople({ freeformquery: email });
};