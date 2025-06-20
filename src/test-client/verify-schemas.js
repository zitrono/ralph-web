/**
 * Schema Verification Script
 * 
 * This script verifies that proper schema definitions exist in key tool files.
 * It's a simplified approach that directly checks source files rather than
 * trying to run the MCP server or import compiled code.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.resolve(__dirname, '..', 'tools');

// Set up colorized output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

// Logger setup
const log = {
  info: (msg) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  debug: (msg) => console.log(`${colors.gray}[DEBUG]${colors.reset} ${msg}`)
};

/**
 * Main function to verify schema definitions in tool files
 */
async function verifySchemas() {
  log.info('Starting schema verification');
  
  // First, verify that our server.ts is logging schema information
  const serverPath = path.resolve(__dirname, '..', 'server.ts');
  const serverHasDebugLogging = await checkServerDebugLogging(serverPath);
  
  // Check cloze_find_people.ts file for schema and enhancements
  const findPeoplePath = path.join(toolsDir, 'cloze_find_people.ts');
  const findPeopleResults = await checkToolSchema(findPeoplePath, 'cloze_find_people');
  
  // Check a few other tool files to verify consistent approach
  const otherToolPaths = [
    'cloze_find_company.ts',
    'cloze_find_nearby_people.ts',
    'cloze_find_project.ts'
  ];
  
  const otherResults = await Promise.all(
    otherToolPaths.map(filename => 
      checkToolSchema(path.join(toolsDir, filename), filename)
    )
  );
  
  // Report overall results
  log.info('Schema verification summary:');
  log.info(`Server debug logging: ${serverHasDebugLogging ? 'Enabled' : 'Missing'}`);
  log.info(`cloze_find_people schema: ${findPeopleResults.hasSchema ? 'Found' : 'Missing'}`);
  log.info(`cloze_find_people schema enhancements: ${findPeopleResults.hasEnhancements ? 'Found' : 'Missing'}`);
  
  // Check if at least the main file has been enhanced
  const success = findPeopleResults.hasSchema && findPeopleResults.hasEnhancements;
  
  if (success) {
    log.success('Schema verification completed successfully!');
    return true;
  } else {
    log.error('Schema verification failed. Missing schema or enhancements.');
    return false;
  }
}

/**
 * Check if server.ts has debug logging for schemas
 */
async function checkServerDebugLogging(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      log.error(`Server file not found at ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for the DEBUG_SCHEMA environment variable check
    const hasDebugSchemaCheck = content.includes('DEBUG_SCHEMA') &&
                               content.includes('logger.debug(`Schema for');
    
    if (hasDebugSchemaCheck) {
      log.success('Server has debug logging for schemas');
      return true;
    } else {
      log.warn('Server is missing debug logging for schemas');
      return false;
    }
  } catch (error) {
    log.error(`Error checking server file: ${error.message}`);
    return false;
  }
}

/**
 * Check a tool file for schema and enhancements
 */
async function checkToolSchema(filePath, toolName) {
  log.info(`Checking schema for ${toolName}...`);
  
  try {
    if (!fs.existsSync(filePath)) {
      log.error(`Tool file not found at ${filePath}`);
      return { hasSchema: false, hasEnhancements: false };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for exported paramSchema
    const hasSchema = content.includes('export const paramSchema =') &&
                     content.includes('z.object(');
    
    // Check for schema enhancements
    const hasEnhancements = content.includes('export const schemaEnhancements =') &&
                           content.includes('examples:');
    
    // Check for enhanced validation
    const usesEnhancedValidation = content.includes('createToolHandlerWithEnhancedValidation(');
    
    if (hasSchema) {
      log.success(`✓ ${toolName} has proper schema definition`);
    } else {
      log.error(`✗ ${toolName} is missing proper schema definition`);
    }
    
    if (hasEnhancements) {
      log.success(`✓ ${toolName} has schema enhancements with examples`);
    } else {
      log.warn(`✗ ${toolName} is missing schema enhancements`);
    }
    
    if (usesEnhancedValidation) {
      log.success(`✓ ${toolName} uses enhanced validation`);
    } else {
      log.warn(`✗ ${toolName} uses basic validation`);
    }
    
    return {
      hasSchema,
      hasEnhancements,
      usesEnhancedValidation
    };
  } catch (error) {
    log.error(`Error checking ${toolName}: ${error.message}`);
    return {
      hasSchema: false,
      hasEnhancements: false,
      usesEnhancedValidation: false
    };
  }
}

// Run verification
verifySchemas().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log.error(`Fatal error during verification: ${error.message}`);
  process.exit(1);
});