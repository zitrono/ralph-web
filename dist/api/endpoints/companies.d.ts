/**
 * Companies-related API endpoints implementation
 * Handles all API operations for companies in Cloze CRM
 */
import { Company, CompaniesResponse, ClozeApiResponse } from '../types.js';
/**
 * Find companies by name, domain, or other criteria
 */
export declare const findCompanies: (params: Record<string, any>) => Promise<CompaniesResponse>;
/**
 * Create a new company in Cloze CRM
 */
export declare const createCompany: (company: Company) => Promise<ClozeApiResponse>;
/**
 * Update an existing company in Cloze CRM
 */
export declare const updateCompany: (company: Partial<Company>) => Promise<ClozeApiResponse>;
/**
 * List companies with cursor-based pagination
 */
export declare const listCompanies: (params?: Record<string, any>) => Promise<CompaniesResponse>;
/**
 * Find companies near a specific location
 */
export declare const findNearbyCompanies: (location: string, params?: Record<string, any>) => Promise<CompaniesResponse>;
/**
 * Add location to a company
 */
export declare const addCompanyLocation: (company: Partial<Company>) => Promise<ClozeApiResponse>;
/**
 * Get company locations
 */
export declare const getCompanyLocations: (nameOrDomain: string) => Promise<CompaniesResponse>;
/**
 * Create a tag for a company
 */
export declare const createCompanyTag: (company: Partial<Company>) => Promise<ClozeApiResponse>;
/**
 * Read tags for a company
 */
export declare const readCompanyTags: (nameOrDomain: string) => Promise<CompaniesResponse>;
/**
 * Update a company's tags
 */
export declare const updateCompanyTag: (company: Partial<Company>) => Promise<ClozeApiResponse>;
/**
 * Delete a tag from a company
 */
export declare const deleteCompanyTag: (company: Partial<Company>) => Promise<ClozeApiResponse>;
