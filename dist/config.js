/**
 * Configuration module for the Cloze MCP server
 * Loads environment variables and provides configuration values
 */
import { config as loadEnv } from 'dotenv';
import logger from './logging.js';
// Load environment variables from .env file if present
loadEnv();
/**
 * Get a required environment variable or throw an error if not found
 */
const requireEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Required environment variable ${name} is missing`);
    }
    return value;
};
/**
 * Get an optional environment variable with a default value
 */
const optionalEnv = (name, defaultValue) => {
    return process.env[name] || defaultValue;
};
/**
 * Get an optional boolean environment variable with a default value
 */
const optionalBoolEnv = (name, defaultValue) => {
    const value = process.env[name];
    if (value === undefined)
        return defaultValue;
    return value.toLowerCase() === 'true';
};
/**
 * Load and validate configuration from environment variables
 */
export const loadConfig = () => {
    try {
        logger.debug('Loading configuration from environment variables');
        // Create configuration object
        const config = {
            cloze: {
                userEmail: requireEnv('CLOZE_USER_EMAIL'),
                apiKey: requireEnv('CLOZE_API_KEY'),
                baseUrl: optionalEnv('CLOZE_API_URL', 'https://api.cloze.com'),
                debug: optionalBoolEnv('DEBUG_CLOZE', false),
            },
            server: {
                name: optionalEnv('SERVER_NAME', 'cloze-mcp-server'),
                version: '1.0.0',
            },
            logging: {
                level: optionalEnv('LOG_LEVEL', 'info'),
            },
            environment: {
                isMcpMode: optionalBoolEnv('MCP_MODE', true),
                isClaudeDesktop: optionalBoolEnv('CLAUDE_DESKTOP', false),
            }
        };
        logger.debug('Configuration loaded successfully');
        return config;
    }
    catch (error) {
        logger.error('Failed to load configuration:', error);
        throw error;
    }
};
// Export the configuration
export default loadConfig();
//# sourceMappingURL=config.js.map