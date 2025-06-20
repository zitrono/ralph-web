export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
/**
 * Update the current log level
 */
export declare const setLogLevel: (level: LogLevel) => void;
/**
 * Function to log Claude Desktop request data to a dedicated file
 * This ensures we capture the exact format Claude Desktop is using
 */
export declare const logClaudeDesktopRequest: (data: any, context?: string) => string | null;
/**
 * Function to log raw request objects to a dedicated file
 * This captures the complete raw request format from any client
 * @param requestObject The raw request object to log
 * @param toolName The name of the tool being called (if known)
 * @param clientInfo Additional client information (if available)
 * @returns The path to the created log file, or null if logging failed
 */
export declare const logRawRequest: (requestObject: any, toolName?: string, clientInfo?: any) => string | null;
/**
 * Logger implementation with methods for each log level
 */
export declare const logger: {
    /**
     * Log a debug message
     * Only displayed when log level is set to 'debug'
     */
    debug: (message: string, ...args: any[]) => void;
    /**
     * Log an info message
     * Displayed when log level is 'debug' or 'info'
     */
    info: (message: string, ...args: any[]) => void;
    /**
     * Log a warning message
     * Displayed when log level is 'debug', 'info', or 'warn'
     */
    warn: (message: string, ...args: any[]) => void;
    /**
     * Log an error message
     * Always displayed regardless of log level
     */
    error: (message: string, ...args: any[]) => void;
    /**
     * Special method to log Claude Desktop requests
     * This always logs regardless of the log level
     * and writes to both console and a dedicated file
     */
    claudeDesktop: (context: string, data: any) => void;
    /**
     * Special method to log raw request objects
     * This always logs regardless of the log level
     * and writes to a dedicated file with complete details
     */
    rawRequest: (requestObject: any, toolName?: string, clientInfo?: any) => void;
};
export default logger;
