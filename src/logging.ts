/**
 * Logging utility for the Cloze MCP server
 * Provides consistent logging with timestamps and log levels
 */
import * as fs from 'fs';
import * as path from 'path';

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Default log level if not specified
const DEFAULT_LOG_LEVEL: LogLevel = 'info';

// Get log level from environment variable or use default
const getLogLevel = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && ['debug', 'info', 'warn', 'error'].includes(envLevel)) {
    return envLevel as LogLevel;
  }
  return DEFAULT_LOG_LEVEL;
};

// Current log level
let currentLogLevel = getLogLevel();

// Create a special directory for Claude Desktop parameter logging
const CLAUDE_DESKTOP_LOG_DIR = path.join(process.cwd(), 'logs', 'claude-desktop');
const RAW_REQUESTS_LOG_DIR = path.join(process.cwd(), 'logs', 'raw-requests');

// Ensure the log directories exist
try {
  // Create Claude Desktop log directory
  if (!fs.existsSync(CLAUDE_DESKTOP_LOG_DIR)) {
    fs.mkdirSync(CLAUDE_DESKTOP_LOG_DIR, { recursive: true });
    console.error(`Created Claude Desktop log directory: ${CLAUDE_DESKTOP_LOG_DIR}`);
  }
  
  // Create Raw Requests log directory
  if (!fs.existsSync(RAW_REQUESTS_LOG_DIR)) {
    fs.mkdirSync(RAW_REQUESTS_LOG_DIR, { recursive: true });
    console.error(`Created Raw Requests log directory: ${RAW_REQUESTS_LOG_DIR}`);
  }
} catch (error) {
  console.error(`Error creating log directories: ${error}`);
}

// Log level precedence for filtering
const LOG_LEVEL_PRECEDENCE: Record<LogLevel, number> = {
  'debug': 0,
  'info': 1,
  'warn': 2,
  'error': 3
};

/**
 * Check if a log at the given level should be displayed
 * based on the current log level setting
 */
const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVEL_PRECEDENCE[level] >= LOG_LEVEL_PRECEDENCE[currentLogLevel];
};

/**
 * Format the current timestamp for log messages
 */
const timestamp = (): string => {
  return `[${new Date().toISOString()}]`;
};

/**
 * Format a log message with timestamp and level
 */
const formatLogMessage = (level: LogLevel, message: string): string => {
  return `${timestamp()} [${level.toUpperCase()}] ${message}`;
};

/**
 * Update the current log level
 */
export const setLogLevel = (level: LogLevel): void => {
  currentLogLevel = level;
  logger.info(`Log level set to: ${level}`);
};

/**
 * Function to log Claude Desktop request data to a dedicated file
 * This ensures we capture the exact format Claude Desktop is using
 */
export const logClaudeDesktopRequest = (data: any, context?: string): string | null => {
  try {
    // Generate filename with timestamp for uniqueness
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `claude-desktop-request-${timestamp}.json`;
    const filePath = path.join(CLAUDE_DESKTOP_LOG_DIR, filename);
    
    // Log that we're writing to a file (goes to standard output)
    console.error(`Logging Claude Desktop request to: ${filePath}`);
    
    // Create object with metadata
    const logData = {
      timestamp: new Date().toISOString(),
      context: context || 'unknown',
      data: data,
      dataType: typeof data,
      isArray: Array.isArray(data),
      keys: typeof data === 'object' && data !== null ? Object.keys(data) : []
    };
    
    // Write to file
    fs.writeFileSync(filePath, JSON.stringify(logData, null, 2));
    
    // Also log to console so it appears in general logs
    console.error(`[CLAUDE_DESKTOP_LOG] Wrote request data to ${filename}`);
    return filePath;
  } catch (error) {
    console.error(`Error logging Claude Desktop request: ${error}`);
    return null;
  }
};

/**
 * Function to log raw request objects to a dedicated file
 * This captures the complete raw request format from any client
 * @param requestObject The raw request object to log
 * @param toolName The name of the tool being called (if known)
 * @param clientInfo Additional client information (if available)
 * @returns The path to the created log file, or null if logging failed
 */
export const logRawRequest = (requestObject: any, toolName?: string, clientInfo?: any): string | null => {
  try {
    // Generate a detailed filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const toolNameStr = toolName ? `-${toolName}` : '';
    const filename = `raw-request${toolNameStr}-${timestamp}.json`;
    const filePath = path.join(RAW_REQUESTS_LOG_DIR, filename);
    
    // Log that we're writing to a file
    console.error(`Logging raw request to: ${filePath}`);
    
    // Create structured log object with comprehensive metadata
    const logData = {
      timestamp: new Date().toISOString(),
      toolName: toolName || 'unknown',
      clientInfo: clientInfo || {},
      request: {
        // Original request object
        raw: requestObject,
        // Metadata about the request object
        metadata: {
          type: typeof requestObject,
          isArray: Array.isArray(requestObject),
          rootKeys: typeof requestObject === 'object' && requestObject !== null ? Object.keys(requestObject) : [],
          // Examine common parameter formats
          hasNameField: typeof requestObject === 'object' && requestObject !== null && 'name' in requestObject,
          hasParametersField: typeof requestObject === 'object' && requestObject !== null && 'parameters' in requestObject,
          hasArgumentsField: typeof requestObject === 'object' && requestObject !== null && 'arguments' in requestObject,
          nestedParameters: typeof requestObject?.parameters === 'object' ? Object.keys(requestObject.parameters || {}) : [],
          nestedArguments: typeof requestObject?.arguments === 'object' ? Object.keys(requestObject.arguments || {}) : []
        }
      }
    };
    
    // Write structured log to file with pretty-printing
    fs.writeFileSync(filePath, JSON.stringify(logData, null, 2));
    
    // Also log to console
    console.error(`[RAW_REQUEST_LOG] Wrote request data to ${filename}`);
    return filePath;
  } catch (error) {
    console.error(`Error logging raw request: ${error}`);
    return null;
  }
};

/**
 * Logger implementation with methods for each log level
 */
export const logger = {
  /**
   * Log a debug message
   * Only displayed when log level is set to 'debug'
   */
  debug: (message: string, ...args: any[]): void => {
    if (shouldLog('debug')) {
      console.error(formatLogMessage('debug', message), ...args);
    }
  },

  /**
   * Log an info message
   * Displayed when log level is 'debug' or 'info'
   */
  info: (message: string, ...args: any[]): void => {
    if (shouldLog('info')) {
      console.error(formatLogMessage('info', message), ...args);
    }
    
    // Special case for Claude Desktop debugging
    if (message.includes('CLAUDE_DESKTOP_DEBUG') && args.length > 0) {
      try {
        logClaudeDesktopRequest(args[0], message);
      } catch (error) {
        console.error(`Error in Claude Desktop special logging: ${error}`);
      }
    }
    
    // Special case for raw request logging
    if (message.includes('RAW_REQUEST_DEBUG') && args.length > 0) {
      try {
        const toolName = message.includes(':') ? message.split(':')[1].trim() : undefined;
        logRawRequest(args[0], toolName);
      } catch (error) {
        console.error(`Error in raw request logging: ${error}`);
      }
    }
  },

  /**
   * Log a warning message
   * Displayed when log level is 'debug', 'info', or 'warn'
   */
  warn: (message: string, ...args: any[]): void => {
    if (shouldLog('warn')) {
      console.error(formatLogMessage('warn', message), ...args);
    }
  },

  /**
   * Log an error message
   * Always displayed regardless of log level
   */
  error: (message: string, ...args: any[]): void => {
    if (shouldLog('error')) {
      console.error(formatLogMessage('error', message), ...args);
    }
  },
  
  /**
   * Special method to log Claude Desktop requests
   * This always logs regardless of the log level
   * and writes to both console and a dedicated file
   */
  claudeDesktop: (context: string, data: any): void => {
    // Always log Claude Desktop requests regardless of log level
    console.error(formatLogMessage('info', `CLAUDE_DESKTOP_DEBUG: ${context}`));
    const filePath = logClaudeDesktopRequest(data, context);
    if (filePath !== null) {
      console.error(formatLogMessage('info', `CLAUDE_DESKTOP_DEBUG: Logged to ${filePath}`));
    }
  },
  
  /**
   * Special method to log raw request objects
   * This always logs regardless of the log level
   * and writes to a dedicated file with complete details
   */
  rawRequest: (requestObject: any, toolName?: string, clientInfo?: any): void => {
    // Always log raw requests regardless of log level
    console.error(formatLogMessage('info', `RAW_REQUEST_DEBUG: Logging raw request${toolName ? ` for ${toolName}` : ''}`));
    const filePath = logRawRequest(requestObject, toolName, clientInfo);
    if (filePath !== null) {
      console.error(formatLogMessage('info', `RAW_REQUEST_DEBUG: Logged to ${filePath}`));
    }
  }
};

// Export the logger as default
export default logger;