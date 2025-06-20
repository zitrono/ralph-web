/**
 * MCP Test Client for Schema Validation (ESM version)
 *
 * This script connects to the MCP server and checks if schemas are properly transmitted
 * for the tools/list endpoint. Used to verify schema metadata is correctly being sent.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory and path to server executable
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.resolve(__dirname, '..', '..', 'dist', 'index.js');
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
 * Test schema transmission by running the server and checking its output
 */
async function testSchemaTransmission() {
  log.info(`Starting MCP server from ${serverPath} to check schema transmission`);
  
  // Set up log files
  const stdoutLogPath = path.resolve(outputDir, 'server-stdout.log');
  const stderrLogPath = path.resolve(outputDir, 'server-stderr.log');
  const stdoutLog = fs.createWriteStream(stdoutLogPath);
  const stderrLog = fs.createWriteStream(stderrLogPath);
  
  // Debug mode to see schema logging - ensure it's a string "true"
  console.log(`${colors.yellow}[SETUP]${colors.reset} Setting DEBUG_SCHEMA=true for server process`);
  
  // Force-set the environment variables for the child process
  const serverEnv = {
    ...process.env,
    MCP_MODE: 'true',
    DEBUG_SCHEMA: 'true', // Enable schema debugging in server.ts
    NODE_OPTIONS: '--enable-source-maps', // Enable source maps for better debugging
    LOG_LEVEL: 'debug' // Set log level to debug to ensure all logs are captured
  };
  
  console.log(`${colors.yellow}[SETUP]${colors.reset} Starting server with DEBUG_SCHEMA=${serverEnv.DEBUG_SCHEMA}`);
  
  // Print all env variables for debugging
  console.log(`${colors.gray}[ENV]${colors.reset} Environment variables:`, 
    JSON.stringify({
      MCP_MODE: serverEnv.MCP_MODE,
      DEBUG_SCHEMA: serverEnv.DEBUG_SCHEMA,
      LOG_LEVEL: serverEnv.LOG_LEVEL
    }, null, 2)
  );
  
  const serverProcess = spawn('node', [serverPath], { env: serverEnv });
  
  let schemaFound = false;
  let schemaJson = null;
  const schemas = {};
  
  // Listen for schema debug output
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    stderrLog.write(output + '\n');
    
    // Process schema debug output for any tool - look for our special marker
    if (output.includes('SCHEMA_DEBUG:')) {
      try {
        // Try to extract schema info using regex - Tool name and schema JSON
        // Log the output to debug what we're seeing
        console.log(`${colors.cyan}[DEBUG SCHEMA]${colors.reset} Examining: ${output}`);
        
        // Modified regex to handle multiline output with JSON and our special marker
        const schemaMatch = output.match(/SCHEMA_DEBUG: Schema for ([a-zA-Z0-9_]+): ({[\s\S]*})/);
        if (schemaMatch && schemaMatch[1] && schemaMatch[2]) {
          const toolName = schemaMatch[1];
          const schemaString = schemaMatch[2];
          
          log.success(`Found schema debug output for ${toolName} tool!`);
          
          try {
            const parsedSchema = JSON.parse(schemaString);
            schemas[toolName] = parsedSchema;
            
            if (toolName === 'cloze_find_people') {
              schemaJson = parsedSchema;
              schemaFound = true;
            }
            
            log.success(`Successfully parsed schema JSON for ${toolName}`);
          } catch (parseError) {
            log.error(`Failed to parse schema JSON for ${toolName}: ${parseError.message}`);
          }
        }
      } catch (error) {
        log.error(`Error processing schema output: ${error.message}`);
      }
    }
  });
  
  // Listen for general server output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    stdoutLog.write(output + '\n');
    
    if (output.includes('error') || output.includes('Error')) {
      log.debug(`Server stdout: ${output}`);
    }
  });
  
  // Wait for server to start and process some messages
  log.info('Waiting for server to start and schemas to be logged');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Clean up
  log.info('Terminating server process');
  serverProcess.kill();
  
  // Write collected schemas to file
  const schemasOutputPath = path.resolve(outputDir, 'all-schemas.json');
  fs.writeFileSync(
    schemasOutputPath, 
    JSON.stringify(schemas, null, 2)
  );
  log.info(`Wrote all schemas to ${schemasOutputPath} for inspection`);
  
  // Report results
  if (schemaFound) {
    log.success('Schema transmission test completed successfully!');
    
    // Validate the primary schema (cloze_find_people)
    validateSchema(schemaJson);
    
    return true;
  } else {
    log.error('Failed to detect schema transmission for cloze_find_people');
    log.error('Make sure DEBUG_SCHEMA is enabled in server.ts');
    return false;
  }
}

/**
 * Validate the schema structure
 */
function validateSchema(schema) {
  log.info('Validating schema structure');
  
  // Write schema to file for inspection
  const schemaOutputPath = path.resolve(outputDir, 'find-people-schema.json');
  fs.writeFileSync(
    schemaOutputPath, 
    JSON.stringify(schema, null, 2)
  );
  log.info(`Wrote cloze_find_people schema to ${schemaOutputPath} for inspection`);
  
  // Basic validation
  if (!schema || typeof schema !== 'object') {
    log.error('Schema is not a valid object');
    return false;
  }
  
  if (schema.type !== 'object') {
    log.error(`Expected schema type 'object', got '${schema.type}'`);
    return false;
  }
  
  if (!schema.properties) {
    log.error('Schema is missing properties object');
    return false;
  }
  
  // Check for required freeformquery field
  if (!schema.properties.freeformquery) {
    log.error('Required property "freeformquery" not found in schema');
    return false;
  }
  
  log.success('Schema has correct basic structure');
  
  // Check for enhanced features
  const freeformqueryProp = schema.properties.freeformquery;
  
  // Check for description
  if (!freeformqueryProp.description) {
    log.warn('Property "freeformquery" is missing description');
  } else {
    log.success(`Description found: "${freeformqueryProp.description}"`);
  }
  
  // Check for examples
  if (!freeformqueryProp.examples || !freeformqueryProp.examples.length) {
    log.warn('Property "freeformquery" is missing examples');
  } else {
    log.success(`Examples found: ${JSON.stringify(freeformqueryProp.examples)}`);
  }
  
  return true;
}

/**
 * Add debug logging to server.ts if not already present
 */
async function addDebugLogging() {
  const serverFilePath = path.resolve(__dirname, '..', 'server.ts');
  
  try {
    let serverCode = fs.readFileSync(serverFilePath, 'utf8');
    
    // Check if debug logging is already added
    if (serverCode.includes('DEBUG_SCHEMA')) {
      log.info('Debug logging already present in server.ts');
      return true;
    }
    
    // Find the registerTool function
    const targetPattern = 'const jsonSchema = typeof paramSchema.parse === \'function\' \n    ? convertZodSchemaToJsonSchema(paramSchema, name)\n    : paramSchema || {};';
    const replacement = 'const jsonSchema = typeof paramSchema.parse === \'function\' \n    ? convertZodSchemaToJsonSchema(paramSchema, name)\n    : paramSchema || {};\n  \n  // Debug schema if debug flag is enabled\n  if (process.env.DEBUG_SCHEMA === \'true\') {\n    logger.debug(`Schema for ${name}:`, JSON.stringify(jsonSchema));\n  }';
    
    // Replace the target with the debug code
    const updatedCode = serverCode.replace(targetPattern, replacement);
    
    if (updatedCode === serverCode) {
      log.warn('Could not find target pattern in server.ts');
      return false;
    }
    
    // Write updated code back to file
    fs.writeFileSync(serverFilePath, updatedCode, 'utf8');
    log.success('Added debug logging to server.ts');
    
    return true;
  } catch (error) {
    log.error(`Failed to add debug logging: ${error.message}`);
    return false;
  }
}

/**
 * Main test function
 */
async function runTest() {
  log.info('Starting schema transmission test (ESM version)');
  
  try {
    // First add debug logging if needed
    await addDebugLogging();
    
    // Then run the test
    const success = await testSchemaTransmission();
    
    if (success) {
      log.success('Schema transmission test completed successfully!');
      process.exit(0);
    } else {
      log.error('Schema transmission test failed');
      process.exit(1);
    }
  } catch (error) {
    log.error(`Test failed with error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the test
runTest();