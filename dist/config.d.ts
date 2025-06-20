/**
 * Configuration module for the Cloze MCP server
 * Loads environment variables and provides configuration values
 */
import { LogLevel } from './logging.js';
/**
 * Configuration interface for the Cloze MCP server
 */
export interface Config {
    cloze: {
        userEmail: string;
        apiKey: string;
        baseUrl: string;
        debug: boolean;
    };
    server: {
        name: string;
        version: string;
    };
    logging: {
        level: LogLevel;
    };
    environment: {
        isMcpMode: boolean;
        isClaudeDesktop: boolean;
    };
}
/**
 * Load and validate configuration from environment variables
 */
export declare const loadConfig: () => Config;
declare const _default: Config;
export default _default;
