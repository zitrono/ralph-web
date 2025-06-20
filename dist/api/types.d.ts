/**
 * Type definitions for the Cloze API
 * Defines interfaces for API requests and responses
 */
export interface ClozeApiResponse {
    errorcode: number;
    [key: string]: any;
}
export interface ClozeErrorResponse {
    errorcode: number;
    message?: string;
}
export interface PersonEmail {
    value: string;
    primary?: boolean;
    work?: boolean;
    personal?: boolean;
}
export interface PersonPhone {
    value: string;
    primary?: boolean;
    work?: boolean;
    mobile?: boolean;
    home?: boolean;
}
export interface PersonAddress {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    primary?: boolean;
    work?: boolean;
    home?: boolean;
}
export interface Person {
    syncKey?: string;
    name?: string;
    first?: string;
    last?: string;
    emails: PersonEmail[];
    phones?: PersonPhone[];
    addresses?: PersonAddress[];
    company?: string;
    job_title?: string;
    segment?: string;
    stage?: string;
    location?: string;
    keywords?: string[];
    [key: string]: any;
}
export interface PeopleResponse extends ClozeApiResponse {
    people: Person[];
    availablecount: number;
    pagenumber?: number;
    pagesize?: number;
}
export interface Company {
    syncKey?: string;
    name: string;
    domains?: string[];
    segment?: string;
    stage?: string;
    description?: string;
    industry?: string;
    location?: string;
    keywords?: string[];
    [key: string]: any;
}
export interface CompaniesResponse extends ClozeApiResponse {
    companies: Company[];
    availablecount: number;
    pagenumber?: number;
    pagesize?: number;
    cursor?: string;
}
export interface AppLink {
    uniqueid: string;
    source: string;
    url: string;
    label: string;
}
export interface Project {
    syncKey?: string;
    name: string;
    stage?: string;
    segment?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    appLinks: AppLink[];
    [key: string]: any;
}
export interface ProjectsResponse extends ClozeApiResponse {
    projects: Project[];
    availablecount: number;
    cursor?: string;
}
export interface Recipient {
    value: string;
    name?: string;
}
export interface Reference {
    type: string;
    value: string;
}
export interface Communication {
    date: string;
    style: 'email' | 'meeting' | 'direct';
    subject: string;
    body?: string;
    bodytype?: 'text' | 'html';
    from: string;
    recipients?: Recipient[];
    references?: Reference[];
    location?: string;
    duration?: number;
    [key: string]: any;
}
export interface MetadataItem {
    name: string;
    key: string;
}
export interface MetadataResponse extends ClozeApiResponse {
    list: MetadataItem[];
}
export declare const PEOPLE_SEGMENTS: string[];
export declare const PEOPLE_STAGES: string[];
export declare const PROJECT_SEGMENTS: string[];
export declare const PROJECT_STAGES: string[];
