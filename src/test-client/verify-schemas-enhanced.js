/**
 * Enhanced Schema Verification Script
 * 
 * This script verifies that proper schema definitions exist in all tool files.
 * It checks every MCP tool for proper schema implementation, including:
 * - Exported paramSchema
 * - Schema enhancements with examples
 * - Use of enhanced validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.resolve(__dirname, '..', 'tools');
const outputDir = path.resolve(__dirname, 'output');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

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
 * Main function to verify schema definitions in all tool files
 */
async function verifyAllSchemas() {
  log.info('Starting schema verification for all MCP tools');
  
  // First, verify that our server.ts is logging schema information
  const serverPath = path.resolve(__dirname, '..', 'server.ts');
  const serverHasDebugLogging = await checkServerDebugLogging(serverPath);
  
  // Get all tool files
  const toolFiles = findAllToolFiles();
  log.info(`Found ${toolFiles.length} tool files for verification`);
  
  // Check each tool file
  const results = [];
  for (const toolFilePath of toolFiles) {
    const toolName = path.basename(toolFilePath, '.ts');
    const result = await checkToolSchema(toolFilePath, toolName);
    results.push({ toolName, ...result });
  }
  
  // Calculate statistics
  const stats = {
    total: results.length,
    hasSchema: results.filter(r => r.hasSchema).length,
    hasEnhancements: results.filter(r => r.hasEnhancements).length,
    usesEnhancedValidation: results.filter(r => r.usesEnhancedValidation).length
  };
  
  // Generate report
  generateReport(results, stats, serverHasDebugLogging);
  
  // Report overall results
  log.info('Schema verification summary:');
  log.info(`Server debug logging: ${serverHasDebugLogging ? 'Enabled' : 'Missing'}`);
  log.info(`Tools with schema: ${stats.hasSchema}/${stats.total} (${(stats.hasSchema/stats.total*100).toFixed(2)}%)`);
  log.info(`Tools with enhancements: ${stats.hasEnhancements}/${stats.total} (${(stats.hasEnhancements/stats.total*100).toFixed(2)}%)`);
  log.info(`Tools with enhanced validation: ${stats.usesEnhancedValidation}/${stats.total} (${(stats.usesEnhancedValidation/stats.total*100).toFixed(2)}%)`);
  
  // Check if all tools have schemas and verification is successful
  const success = stats.hasSchema === stats.total;
  
  if (success) {
    log.success('All tools have proper schema definitions!');
    return true;
  } else {
    log.error(`Schema verification failed. ${stats.total - stats.hasSchema} tools are missing schemas.`);
    return false;
  }
}

/**
 * Find all tool files in the tools directory
 */
function findAllToolFiles() {
  try {
    const files = fs.readdirSync(toolsDir);
    return files
      .filter(file => file.startsWith('cloze_') && file.endsWith('.ts'))
      .map(file => path.join(toolsDir, file));
  } catch (error) {
    log.error(`Error finding tool files: ${error.message}`);
    return [];
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

/**
 * Generate a detailed report of schema verification
 */
function generateReport(results, stats, serverHasDebugLogging) {
  // Sort results by toolName
  results.sort((a, b) => a.toolName.localeCompare(b.toolName));
  
  // Create report data
  const report = {
    timestamp: new Date().toISOString(),
    serverHasDebugLogging,
    stats,
    tools: results
  };
  
  // Save report to file
  fs.writeFileSync(
    path.resolve(outputDir, 'schema-verification-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Create markdown report
  let markdown = `# Schema Verification Report\n\n`;
  markdown += `Generated on: ${new Date().toLocaleString()}\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- Server debug logging: ${serverHasDebugLogging ? '✅ Enabled' : '❌ Missing'}\n`;
  markdown += `- Tools with schema: ${stats.hasSchema}/${stats.total} (${(stats.hasSchema/stats.total*100).toFixed(2)}%)\n`;
  markdown += `- Tools with enhancements: ${stats.hasEnhancements}/${stats.total} (${(stats.hasEnhancements/stats.total*100).toFixed(2)}%)\n`;
  markdown += `- Tools with enhanced validation: ${stats.usesEnhancedValidation}/${stats.total} (${(stats.usesEnhancedValidation/stats.total*100).toFixed(2)}%)\n\n`;
  
  markdown += `## Tool Details\n\n`;
  markdown += `| Tool | Schema | Enhancements | Enhanced Validation |\n`;
  markdown += `| ---- | ------ | ------------ | ------------------ |\n`;
  
  for (const result of results) {
    markdown += `| ${result.toolName} | ${result.hasSchema ? '✅' : '❌'} | ${result.hasEnhancements ? '✅' : '❌'} | ${result.usesEnhancedValidation ? '✅' : '❌'} |\n`;
  }
  
  // Add tools missing schema section if any
  const missingSchema = results.filter(r => !r.hasSchema);
  if (missingSchema.length > 0) {
    markdown += `\n## Tools Missing Schema\n\n`;
    for (const result of missingSchema) {
      markdown += `- ${result.toolName}\n`;
    }
  }
  
  // Add tools missing enhancements section if any
  const missingEnhancements = results.filter(r => !r.hasEnhancements);
  if (missingEnhancements.length > 0) {
    markdown += `\n## Tools Missing Enhancements\n\n`;
    for (const result of missingEnhancements) {
      markdown += `- ${result.toolName}\n`;
    }
  }
  
  // Save markdown report to file
  fs.writeFileSync(
    path.resolve(outputDir, 'schema-verification-report.md'),
    markdown
  );
  
  log.success('Generated verification report');
}

// Run verification
verifyAllSchemas().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log.error(`Fatal error during verification: ${error.message}`);
  process.exit(1);
});