/**
 * Cloze API client
 * Handles authentication and API requests to the Cloze API
 */
import axios from 'axios';
import config from '../config.js';
import logger from '../logging.js';
/**
 * Create an authenticated Axios instance for Cloze API requests
 */
const createAxiosInstance = () => {
    logger.debug('Creating Axios instance for Cloze API');
    const instance = axios.create({
        baseURL: config.cloze.baseUrl,
        timeout: 10000, // 10 seconds
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    // Add authentication parameters to all requests
    instance.interceptors.request.use((requestConfig) => {
        // Add authentication query parameters
        requestConfig.params = {
            ...requestConfig.params,
            user: config.cloze.userEmail,
            api_key: config.cloze.apiKey
        };
        // Log request details if debug is enabled
        if (config.cloze.debug) {
            logger.debug(`API Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`, {
                params: requestConfig.params,
                data: requestConfig.data
            });
        }
        return requestConfig;
    });
    // Log responses and format errors
    instance.interceptors.response.use((response) => {
        // Log response details if debug is enabled
        if (config.cloze.debug) {
            logger.debug(`API Response: ${response.status}`, response.data);
        }
        return response;
    }, (error) => {
        // Extract response data if available
        const errorResponse = error.response?.data;
        // Log error details
        logger.error('API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            errorCode: errorResponse?.errorcode,
            message: errorResponse?.message || error.message
        });
        // Rethrow the error
        return Promise.reject(error);
    });
    return instance;
};
// Create the Axios instance
const axiosInstance = createAxiosInstance();
/**
 * Base API client for making requests to the Cloze API
 */
export const apiClient = {
    /**
     * Make a GET request to the Cloze API
     */
    get: async (url, params = {}) => {
        try {
            logger.debug(`Making GET request to ${url}`);
            const response = await axiosInstance.get(url, { params });
            // Check for Cloze API error
            if (response.data.errorcode !== 0) {
                throw new Error(`Cloze API Error: ${response.data.errorcode} - ${response.data.message || 'Unknown error'}`);
            }
            return response.data;
        }
        catch (error) {
            logger.error(`GET request to ${url} failed:`, error);
            throw error;
        }
    },
    /**
     * Make a POST request to the Cloze API
     */
    post: async (url, data = {}, params = {}) => {
        try {
            logger.debug(`Making POST request to ${url}`);
            const response = await axiosInstance.post(url, data, { params });
            // Check for Cloze API error
            if (response.data.errorcode !== 0) {
                throw new Error(`Cloze API Error: ${response.data.errorcode} - ${response.data.message || 'Unknown error'}`);
            }
            return response.data;
        }
        catch (error) {
            logger.error(`POST request to ${url} failed:`, error);
            throw error;
        }
    },
    /**
     * Make a DELETE request to the Cloze API
     */
    delete: async (url, params = {}) => {
        try {
            logger.debug(`Making DELETE request to ${url}`);
            const response = await axiosInstance.delete(url, { params });
            // Check for Cloze API error
            if (response.data.errorcode !== 0) {
                throw new Error(`Cloze API Error: ${response.data.errorcode} - ${response.data.message || 'Unknown error'}`);
            }
            return response.data;
        }
        catch (error) {
            logger.error(`DELETE request to ${url} failed:`, error);
            throw error;
        }
    }
};
// Export the API client
export default apiClient;
//# sourceMappingURL=client.js.map