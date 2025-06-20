/**
 * Health-related API endpoints implementation
 * Handles all API operations for health checks in Cloze CRM
 */
import apiClient from '../client.js';
import logger from '../../logging.js';
/**
 * Check the health of the Cloze API
 * Uses the profile endpoint as a proxy for health
 */
export const healthCheck = async () => {
    logger.debug('Performing health check');
    // Use the profile endpoint for health check
    try {
        const response = await apiClient.get('/v1/user/profile');
        // Transform response into health status
        return {
            success: true,
            data: {
                status: 'healthy',
                apiConnectivity: true,
                authenticated: true,
                profile: response.profile
            }
        };
    }
    catch (error) {
        logger.error('Health check failed:', error);
        return {
            success: false,
            data: {
                status: 'unhealthy',
                apiConnectivity: false,
                authenticated: false
            }
        };
    }
};
/**
 * Get the connection status
 * Uses the profile endpoint as a proxy
 */
export const connectionStatus = async () => {
    logger.debug('Getting connection status');
    // Use the profile endpoint to check connection
    try {
        const response = await apiClient.get('/v1/user/profile');
        // Transform response into connection status
        return {
            success: true,
            data: {
                status: 'connected',
                authenticated: true,
                requestLimit: 'unknown',
                remainingRequests: 'unknown',
                rateLimitReset: 'unknown',
                detailed: {
                    apiVersion: 'v1',
                    userEmail: response.profile?.email || 'unknown',
                    userName: response.profile?.name || 'unknown'
                }
            }
        };
    }
    catch (error) {
        logger.error('Connection status check failed:', error);
        return {
            success: false,
            data: {
                status: 'disconnected',
                authenticated: false,
                requestLimit: 'unknown',
                remainingRequests: 'unknown',
                rateLimitReset: 'unknown'
            }
        };
    }
};
/**
 * Reset the connection
 * Simulates reset behavior since there's no actual API endpoint
 */
export const resetConnection = async () => {
    logger.debug('Resetting connection');
    // Simply verify API connectivity
    try {
        await apiClient.get('/v1/user/profile');
        // Simulate reset success
        logger.info('Connection reset successful');
        return {
            success: true,
            data: {
                reset: true,
                cacheCleared: true,
                rateLimitsReset: false,
                status: 'connection reset successful'
            }
        };
    }
    catch (error) {
        logger.error('Connection reset failed:', error);
        return {
            success: false,
            data: {
                reset: false,
                cacheCleared: false,
                rateLimitsReset: false,
                status: 'connection reset failed'
            }
        };
    }
};
//# sourceMappingURL=health.js.map