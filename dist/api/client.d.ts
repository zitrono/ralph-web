/**
 * Cloze API client
 * Handles authentication and API requests to the Cloze API
 */
import { ClozeApiResponse } from './types.js';
/**
 * Base API client for making requests to the Cloze API
 */
export declare const apiClient: {
    /**
     * Make a GET request to the Cloze API
     */
    get: <T extends ClozeApiResponse>(url: string, params?: Record<string, any>) => Promise<T>;
    /**
     * Make a POST request to the Cloze API
     */
    post: <T extends ClozeApiResponse>(url: string, data?: Record<string, any>, params?: Record<string, any>) => Promise<T>;
    /**
     * Make a DELETE request to the Cloze API
     */
    delete: <T extends ClozeApiResponse>(url: string, params?: Record<string, any>) => Promise<T>;
};
export default apiClient;
