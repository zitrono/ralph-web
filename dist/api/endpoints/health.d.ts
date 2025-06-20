/**
 * Health-related API endpoints implementation
 * Handles all API operations for health checks in Cloze CRM
 */
interface HealthResponse {
    success: boolean;
    data: {
        status: string;
        apiConnectivity: boolean;
        authenticated: boolean;
        profile?: any;
    };
}
interface ConnectionStatusResponse {
    success: boolean;
    data: {
        status: string;
        authenticated: boolean;
        requestLimit: string;
        remainingRequests: string;
        rateLimitReset: string;
        detailed?: {
            apiVersion: string;
            userEmail: string;
            userName: string;
        };
    };
}
interface ResetConnectionResponse {
    success: boolean;
    data: {
        reset: boolean;
        cacheCleared: boolean;
        rateLimitsReset: boolean;
        status: string;
    };
}
/**
 * Check the health of the Cloze API
 * Uses the profile endpoint as a proxy for health
 */
export declare const healthCheck: () => Promise<HealthResponse>;
/**
 * Get the connection status
 * Uses the profile endpoint as a proxy
 */
export declare const connectionStatus: () => Promise<ConnectionStatusResponse>;
/**
 * Reset the connection
 * Simulates reset behavior since there's no actual API endpoint
 */
export declare const resetConnection: () => Promise<ResetConnectionResponse>;
export {};
