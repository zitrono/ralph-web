/**
 * Script to standardize all tool files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.resolve(__dirname, '..');
const standardizeToolPath = path.join(__dirname, 'standardize-tool.js');

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
 * Find all tool files
 */
function findAllToolFiles() {
  return fs.readdirSync(toolsDir)
    .filter(file => file.startsWith('cloze_') && file.endsWith('.ts'));
}

/**
 * Standardize all tool files
 */
async function standardizeAllTools() {
  log.info('Starting standardization of all tools');
  
  const toolFiles = findAllToolFiles();
  log.info(`Found ${toolFiles.length} tool files`);
  
  let success = 0;
  let skipped = 0;
  let failed = 0;
  
  // Standardize each tool
  for (const toolFile of toolFiles) {
    try {
      log.info(`Processing ${toolFile}...`);
      
      // Skip files that are already standardized (to avoid infinite recursion)
      if (isAlreadyStandardized(path.join(toolsDir, toolFile))) {
        log.warn(`${toolFile} already standardized, skipping`);
        skipped++;
        continue;
      }
      
      // Run the standardize-tool.js script
      execSync(`node ${standardizeToolPath} ${toolFile}`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      success++;
    } catch (error) {
      log.error(`Failed to standardize ${toolFile}: ${error.message}`);
      failed++;
    }
  }
  
  // Report results
  log.info('Standardization complete:');
  log.info(`- Successfully standardized: ${success}`);
  log.info(`- Skipped (already standardized): ${skipped}`);
  log.info(`- Failed: ${failed}`);
  
  return failed === 0;
}

/**
 * Check if a tool file is already standardized
 */
function isAlreadyStandardized(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes('export const schemaEnhancements =') &&
           content.includes('createToolHandlerWithEnhancedValidation');
  } catch (error) {
    log.error(`Error checking if ${filePath} is standardized: ${error.message}`);
    return false;
  }
}

// Run the standardization
standardizeAllTools()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });