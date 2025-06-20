/**
 * Script to standardize a tool file by adding schema enhancements and
 * updating it to use the enhanced validation handler
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.resolve(__dirname, '..');

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
 * Standardize a tool file by extracting schema information and adding enhancements
 */
async function standardizeTool(toolFileName) {
  const toolPath = path.join(toolsDir, toolFileName);
  log.info(`Standardizing tool: ${toolFileName}`);
  
  try {
    // Read the original file
    if (!fs.existsSync(toolPath)) {
      log.error(`Tool file not found: ${toolPath}`);
      return false;
    }
    
    const content = fs.readFileSync(toolPath, 'utf8');
    
    // Extract key information
    const toolId = path.basename(toolFileName, '.ts');
    const toolDescription = extractToolDescription(content);
    
    // Extract schema information
    const schemaMatch = content.match(/const\s+paramSchema\s*=\s*z\.object\(\{([\s\S]*?)\}\)/);
    if (!schemaMatch) {
      log.error(`Could not find parameter schema in ${toolFileName}`);
      return false;
    }
    
    const parameterSchema = schemaMatch[1];
    
    // Generate schema enhancements based on the parameter schema
    const schemaEnhancements = generateSchemaEnhancements(parameterSchema);
    
    // Check if already standardized
    if (content.includes('export const schemaEnhancements =')) {
      log.warn(`Tool ${toolFileName} already has schema enhancements. Skipping.`);
      return false;
    }
    
    // Generate the standardized content
    const standardizedContent = generateStandardizedContent(
      content,
      toolId,
      toolDescription,
      parameterSchema,
      schemaEnhancements
    );
    
    // Write the backup
    const backupPath = `${toolPath}.bak`;
    fs.writeFileSync(backupPath, content, 'utf8');
    log.info(`Backed up original to ${backupPath}`);
    
    // Write the standardized content
    fs.writeFileSync(toolPath, standardizedContent, 'utf8');
    log.success(`Standardized ${toolFileName}`);
    
    return true;
  } catch (error) {
    log.error(`Error standardizing ${toolFileName}: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    return false;
  }
}

/**
 * Extract the tool description from the file content
 */
function extractToolDescription(content) {
  // Try to extract from metadata
  const metadataMatch = content.match(/description:\s*`([^`]+)`/);
  if (metadataMatch) {
    // Take the first line of the description
    const descLines = metadataMatch[1].trim().split('\n');
    return descLines[0].trim();
  }
  
  // Try to extract from the initial comment
  const commentMatch = content.match(/\/\*\*[\s\S]*?\*\s*(.*?)[\s\S]*?\*\//);
  if (commentMatch && commentMatch[1]) {
    return commentMatch[1].trim();
  }
  
  // Default description
  return 'Cloze CRM tool';
}

/**
 * Generate schema enhancements from the parameter schema
 */
function generateSchemaEnhancements(parameterSchema) {
  // Parse the schema to extract parameter names and types
  const paramRegex = /(\w+):\s*([^,]+)/g;
  let match;
  const enhancements = {};
  
  while ((match = paramRegex.exec(parameterSchema)) !== null) {
    const paramName = match[1].trim();
    const paramType = match[2].trim();
    
    let examples = [];
    let description = '';
    
    // Extract description if available
    const describeMatch = parameterSchema.match(new RegExp(`${paramName}[^.]+\\.describe\\('([^']+)'\\)`));
    if (describeMatch) {
      description = describeMatch[1];
    }
    
    // Generate examples based on type
    if (paramType.includes('string')) {
      examples = [`"example-${paramName}"`];
    } else if (paramType.includes('number')) {
      examples = [1, 10, 100];
    } else if (paramType.includes('boolean')) {
      examples = [true, false];
    } else if (paramType.includes('array')) {
      examples = ['[]'];
    } else if (paramType.includes('enum')) {
      // Try to extract enum values
      const enumMatch = paramType.match(/enum\\([^)]*\\)/);
      if (enumMatch) {
        examples = ['enumValue1', 'enumValue2'];
      }
    }
    
    enhancements[paramName] = {
      description: description || `Parameter: ${paramName}`,
      examples: examples
    };
  }
  
  return Object.entries(enhancements)
    .map(([key, value]) => {
      return `  ${key}: {
    examples: [${value.examples.join(', ')}],
    description: "${value.description}"
  }`;
    })
    .join(',\n');
}

/**
 * Generate standardized content for the tool file
 */
function generateStandardizedContent(
  originalContent,
  toolId,
  toolDescription,
  parameterSchema,
  schemaEnhancements
) {
  // Check if already using enhanced validation
  const usesEnhancedValidation = originalContent.includes('createToolHandlerWithEnhancedValidation');
  
  // If already using enhanced validation, just add schema enhancements
  if (usesEnhancedValidation) {
    // Find the position after the paramSchema definition
    const schemaEndPos = originalContent.indexOf('});') + 3;
    
    // Insert schema enhancements
    return originalContent.slice(0, schemaEndPos) + 
      `\n\n/**
 * Schema enhancements to add examples and additional information
 */
export const schemaEnhancements = {
${schemaEnhancements}
};` + 
      originalContent.slice(schemaEndPos);
  }
  
  // Update imports
  let updatedContent = originalContent
    .replace(
      /import {([^}]*)}/,
      (match, imports) => {
        // Add createToolHandlerWithEnhancedValidation if not already included
        if (!imports.includes('createToolHandlerWithEnhancedValidation')) {
          return `import {${imports}, createToolHandlerWithEnhancedValidation}`;
        }
        return match;
      }
    )
    .replace(
      /from '.\/utils\/index.js';/,
      `from './utils/index.js';\nimport { enhanceJsonSchema } from './utils/schema_converter.js';`
    );
  
  // Add export to paramSchema
  updatedContent = updatedContent.replace(
    /const paramSchema/,
    'export const paramSchema'
  );
  
  // Add schema enhancements after paramSchema
  const schemaEndPos = updatedContent.indexOf('});') + 3;
  updatedContent = updatedContent.slice(0, schemaEndPos) + 
    `\n\n/**
 * Schema enhancements to add examples and additional information
 */
export const schemaEnhancements = {
${schemaEnhancements}
};` + 
    updatedContent.slice(schemaEndPos);
  
  // Update handler export
  updatedContent = updatedContent.replace(
    /export default createToolHandler\(paramSchema, handler([^)]*)\);/,
    `export default createToolHandlerWithEnhancedValidation(
  paramSchema, 
  schemaEnhancements, 
  handler$1
);`
  );
  
  return updatedContent;
}

// If called directly
if (process.argv.length > 2) {
  const toolFileName = process.argv[2];
  
  if (!toolFileName.endsWith('.ts')) {
    log.error('Tool file name must end with .ts');
    process.exit(1);
  }
  
  standardizeTool(toolFileName)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log.error(`Fatal error: ${error.message}`);
      process.exit(1);
    });
} else {
  log.error('Please provide a tool file name (e.g., cloze_find_company.ts)');
  process.exit(1);
}