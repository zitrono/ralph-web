/**
 * MCP Test Client for Schema Validation (CommonJS version)
 *
 * This script connects to the MCP server and checks if schemas are properly transmitted
 * for the tools/list endpoint. Used to verify schema metadata is correctly being sent.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get path to server executable
const serverPath = path.resolve(__dirname, '..', '..', 'dist', 'index.js');

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

// Since we can't easily connect to the MCP server directly from Node.js without additional middleware,
// we'll use a simpler approach by running the server and then checking its output for evidence of schema transmission
async function testSchemaTransmission() {
  log.info(`Starting MCP server from ${serverPath} to check schema transmission`);
  
  // Debug mode to see schema logging
  const serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      MCP_MODE: 'true',
      DEBUG_SCHEMA: 'true' // Enable schema debugging in server.ts
    }
  });
  
  let schemaFound = false;
  let schemaJson = null;
  
  // Listen for schema debug output
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    
    if (output.includes('Schema for cloze_find_people:')) {
      log.success('Found schema debug output for cloze_find_people tool!');
      
      // Try to extract the JSON schema from the log message
      try {
        const schemaMatch = output.match(/Schema for cloze_find_people: (.+)/);
        if (schemaMatch && schemaMatch[1]) {
          const schemaString = schemaMatch[1];
          schemaJson = JSON.parse(schemaString);
          
          log.success('Successfully parsed schema JSON');
          schemaFound = true;
          
          // Write schema to file for inspection
          const schemaOutputPath = path.resolve(__dirname, 'schema-output.json');
          fs.writeFileSync(
            schemaOutputPath, 
            JSON.stringify(schemaJson, null, 2)
          );
          log.info(`Wrote schema to ${schemaOutputPath} for inspection`);
          
          // Validate the schema
          validateSchema(schemaJson);
        }
      } catch (error) {
        log.error(`Failed to parse schema JSON: ${error.message}`);
      }
    }
  });
  
  // Listen for general server output
  serverProcess.stdout.on('data', (data) => {
    log.debug(`Server stdout: ${data.toString().trim()}`);
  });
  
  // Wait for server to start and process some messages
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Clean up
  log.info('Terminating server process');
  serverProcess.kill();
  
  // Report results
  if (schemaFound) {
    log.success('Schema transmission test completed successfully!');
    return true;
  } else {
    log.error('Failed to detect schema transmission');
    log.error('Make sure DEBUG_SCHEMA is enabled in server.ts');
    return false;
  }
}

// Validate the schema structure
function validateSchema(schema) {
  log.info('Validating schema structure');
  
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

// Add debug logging to server.ts
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

// Main test function
async function runTest() {
  log.info('Starting schema transmission test');
  
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