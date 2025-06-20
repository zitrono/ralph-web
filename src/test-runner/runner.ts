/**
 * Test runner for the Cloze MCP server
 * Provides functionality to run tests against the Cloze API directly
 * Includes self-destruct timeouts to prevent hanging tests
 */

import logger from '../logging.js';

// Import tool modules for real API calls - direct import
import clozeCreatePeople from '../tools/cloze_create_people.js';
import clozeFindPeople from '../tools/cloze_find_people.js';
import clozeUpdatePeople from '../tools/cloze_update_people.js';
import clozeDeletePeople from '../tools/cloze_delete_people.js';

// Import error handling utilities for tests
import { handleApiError } from './utils.js';

// Import self-destruct timer utility
import { setSelfDestructTimer } from './utils/self-destruct-timer.js';

/**
 * Default timeout values (in milliseconds)
 */
export const DEFAULT_TIMEOUTS = {
  OPERATION: 10000,  // 10 seconds for the entire operation
  REQUEST: 5000,     // 5 seconds for individual requests
  SHUTDOWN: 1000     // 1 second for graceful shutdown
};

/**
 * Class to manage direct API calls with timeout protection
 */
export class TestServer {
  private timeouts = new Map<string, NodeJS.Timeout>();
  private operationComplete = false;
  private selfDestructTimer: { cancel: () => void } | null = null;
  
  /**
   * Start the test runner with self-destruct timers
   */
  async start(timeoutMs = DEFAULT_TIMEOUTS.OPERATION): Promise<void> {
    logger.info('Starting test runner with timeout:', timeoutMs, 'ms');
    
    // Set up the global self-destruct timer
    this.selfDestructTimer = setSelfDestructTimer(timeoutMs);
    
    // Set main operation timeout
    this.setTimeout('operation', () => {
      if (!this.operationComplete) {
        logger.error(`Operation timed out after ${timeoutMs}ms`);
        this.forceCleanup();
        process.exit(1);
      }
    }, timeoutMs);
  }
  
  /**
   * Stop the test runner and clean up resources
   */
  async stop(): Promise<void> {
    logger.info('Stopping test runner');
    this.operationComplete = true;
    this.cleanup();
    logger.info('Test runner stopped');
  }
  
  /**
   * Set a timeout with a name
   */
  private setTimeout(name: string, callback: () => void, ms: number): void {
    // Clear any existing timeout with this name
    this.clearTimeout(name);
    
    // Set the new timeout
    const timeoutId = setTimeout(() => {
      this.timeouts.delete(name);
      callback();
    }, ms);
    
    // Store the timeout ID
    this.timeouts.set(name, timeoutId);
    logger.debug(`Timer '${name}' set for ${ms}ms`);
  }
  
  /**
   * Clear a specific timeout by name
   */
  private clearTimeout(name: string): void {
    const timeoutId = this.timeouts.get(name);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(name);
      logger.debug(`Timer '${name}' cleared`);
    }
  }
  
  /**
   * Clear all timeouts
   */
  private clearAllTimeouts(): void {
    for (const [name, timeoutId] of this.timeouts.entries()) {
      clearTimeout(timeoutId);
      logger.debug(`Timer '${name}' cleared during cleanup`);
    }
    this.timeouts.clear();
    logger.debug('All timers cleared');
    
    // Cancel self-destruct timer if it exists
    if (this.selfDestructTimer) {
      this.selfDestructTimer.cancel();
      this.selfDestructTimer = null;
      logger.debug('Self-destruct timer cancelled');
    }
  }
  
  /**
   * Clean up resources gracefully
   */
  private cleanup(): void {
    logger.info('Cleaning up resources');
    
    // Clear all timeouts
    this.clearAllTimeouts();
  }
  
  /**
   * Force cleanup when timeout occurs
   */
  private forceCleanup(): void {
    logger.warn('Performing force cleanup');
    
    // Clear all timeouts
    this.clearAllTimeouts();
  }

  /**
   * Call a tool using real API client with request timeout
   */
  async callTool(name: string, args: Record<string, any> = {}): Promise<any> {
    logger.debug(`Calling tool ${name} with args:`, args);
    
    // Add test identifier to arguments if needed
    args = this.addTestIdentifier(args, name);
    
    // Set request timeout
    this.setTimeout('request', () => {
      logger.error(`Request to tool ${name} timed out after ${DEFAULT_TIMEOUTS.REQUEST}ms`);
      // Don't exit here, let the main operation timeout handle it
    }, DEFAULT_TIMEOUTS.REQUEST);
    
    try {
      let result;
      
      // Handle People tools
      if (name.startsWith('cloze_') && name.includes('people')) {
        switch (name) {
          case 'cloze_create_people':
            result = await clozeCreatePeople(args);
            break;
          
          case 'cloze_find_people':
            result = await clozeFindPeople(args);
            break;
          
          case 'cloze_update_people':
            result = await clozeUpdatePeople(args);
            break;
          
          case 'cloze_delete_people':
            result = await clozeDeletePeople(args);
            break;
            
          default:
            throw new Error(`Unknown people tool: ${name}`);
        }
      }
      else {
        // For other tools, throw an error - we're only focusing on people tools for now
        throw new Error(`Tool not implemented for testing: ${name}`);
      }
      
      // Clear request timeout since we got a response
      this.clearTimeout('request');
      return result;
      
    } catch (error) {
      // Clear request timeout since we got an error
      this.clearTimeout('request');
      
      // Handle API errors
      logger.error(`Error calling tool ${name}:`, error);
      return handleApiError(error, name);
    }
  }
  
  /**
   * Add test identification to prevent conflicts with production data
   */
  private addTestIdentifier(args: Record<string, any>, toolName: string): Record<string, any> {
    // Clone the arguments to avoid modifying the original
    const modifiedArgs = { ...args };
    
    // Skip modifying parameters if _raw_test flag is set
    // This allows testing raw parameter formats without test markers
    if (modifiedArgs._raw_test) {
      logger.debug('Raw test flag detected, skipping parameter modification');
      
      // Remove the _raw_test flag to avoid passing it to the tool
      delete modifiedArgs._raw_test;
      
      return modifiedArgs;
    }
    
    // For people tools, add test identifier to names and emails
    if (toolName.includes('people')) {
      // For create and update operations, add test identifier to name
      if (toolName === 'cloze_create_people' || toolName === 'cloze_update_people') {
        if (modifiedArgs.name && !modifiedArgs.name.includes('[TEST]')) {
          modifiedArgs.name = `[TEST] ${modifiedArgs.name}`;
        }
        
        // Add test identifier to emails if they don't already have it
        if (modifiedArgs.emails && Array.isArray(modifiedArgs.emails)) {
          modifiedArgs.emails = modifiedArgs.emails.map((email: any) => {
            if (email.value && !email.value.includes('test-')) {
              // Insert 'test-' before the @ symbol
              const parts = email.value.split('@');
              email.value = `${parts[0]}-test@${parts[1]}`;
            }
            return email;
          });
        }
      }
      
      // For find operations, add test identifier to query if it's an email
      if (toolName === 'cloze_find_people' && modifiedArgs.freeformquery) {
        if (modifiedArgs.freeformquery.includes('@') && !modifiedArgs.freeformquery.includes('test-')) {
          // Insert 'test-' before the @ symbol
          const parts = modifiedArgs.freeformquery.split('@');
          modifiedArgs.freeformquery = `${parts[0]}-test@${parts[1]}`;
        }
      }
    }
    
    return modifiedArgs;
  }
}

/**
 * Interface for test functions
 */
export interface TestFunction {
  (): Promise<void>;
}

/**
 * Run a test with the server
 */
export async function runTest(name: string, testFn: TestFunction): Promise<void> {
  logger.info(`Running test: ${name}`);
  
  try {
    // Run the test
    await testFn();
    
    logger.info(`Test "${name}" passed`);
  } catch (error) {
    logger.error(`Test "${name}" failed:`, error);
    throw error;
  }
}

/**
 * Run multiple tests sequentially
 */
export async function runTests(tests: { name: string; test: TestFunction }[]): Promise<void> {
  logger.info(`Running ${tests.length} tests`);
  
  const results = {
    passed: 0,
    failed: 0,
    failures: [] as string[]
  };
  
  for (const { name, test } of tests) {
    try {
      await runTest(name, test);
      results.passed++;
    } catch (error) {
      results.failed++;
      results.failures.push(name);
    }
  }
  
  logger.info(`Tests completed: ${results.passed} passed, ${results.failed} failed`);
  
  if (results.failed > 0) {
    logger.error(`Failed tests: ${results.failures.join(', ')}`);
    process.exit(1);
  }
}