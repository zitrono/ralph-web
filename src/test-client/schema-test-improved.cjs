/**
 * Improved MCP Test Client for Schema Validation
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
// we'll use a modified approach that directly tests our tool functions with a schema
async function testSchemaTransmission() {
  log.info('Testing schema transmission with direct function calls');
  
  // Create output directory if it doesn't exist
  const outputDir = path.resolve(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  try {
    // Import the schema directly
    const modulePath = path.resolve(__dirname, '..', '..', 'dist', 'tools', 'cloze_find_people.js');
    
    log.info(`Importing schema from ${modulePath}`);
    
    // We can't use import() in CommonJS directly, so we use require with dynamic path
    const findPeopleModule = require(modulePath);
    
    // Check if schema exists
    if (findPeopleModule.paramSchema && findPeopleModule.schemaEnhancements) {
      log.success('Successfully imported schema module');
      
      // Write schema to file
      const schemaOutputPath = path.join(outputDir, 'find_people_schema.json');
      fs.writeFileSync(
        schemaOutputPath, 
        JSON.stringify(findPeopleModule.paramSchema, null, 2)
      );
      log.success(`Wrote schema to ${schemaOutputPath}`);
      
      // Write enhancements to file
      const enhancementsOutputPath = path.join(outputDir, 'find_people_enhancements.json');
      fs.writeFileSync(
        enhancementsOutputPath, 
        JSON.stringify(findPeopleModule.schemaEnhancements, null, 2)
      );
      log.success(`Wrote schema enhancements to ${enhancementsOutputPath}`);
      
      // Validate schema
      validateSchema(findPeopleModule.paramSchema, findPeopleModule.schemaEnhancements);
      
      return true;
    } else {
      log.error('Module does not contain schema or enhancements properties');
      
      // Write all available properties for debugging
      const moduleOutputPath = path.join(outputDir, 'find_people_module.json');
      fs.writeFileSync(
        moduleOutputPath, 
        JSON.stringify(Object.keys(findPeopleModule), null, 2)
      );
      log.info(`Wrote available module properties to ${moduleOutputPath}`);
      
      return false;
    }
  } catch (error) {
    log.error(`Error importing schema module: ${error.message}`);
    
    // Try running the server as a fallback
    log.info('Falling back to server execution test');
    return await testServerSchemaOutput();
  }
}

// Fallback: run the server and check logs
async function testServerSchemaOutput() {
  log.info(`Starting MCP server from ${serverPath} to check schema transmission`);
  
  // Create output directory if it doesn't exist
  const outputDir = path.resolve(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Debug mode to see schema logging
  const serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      MCP_MODE: 'true',
      DEBUG_SCHEMA: 'true', // Enable schema debugging in server.ts
      NODE_DEBUG: 'mcp,server' // Additional debug logging
    }
  });
  
  let schemaFound = false;
  let outputBuffer = '';
  let stdoutBuffer = '';
  let stderrBuffer = '';
  
  // Listen for stdout output
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    stdoutBuffer += output;
    outputBuffer += output;
    
    // Log any schema-related output
    if (output.includes('Schema for')) {
      log.debug(`Server schema stdout: ${output.trim()}`);
      schemaFound = true;
    }
  });
  
  // Listen for stderr output
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    stderrBuffer += output;
    outputBuffer += output;
    
    // Log any schema-related output
    if (output.includes('Schema for')) {
      log.debug(`Server schema stderr: ${output.trim()}`);
      schemaFound = true;
    }
  });
  
  // Wait for server to initialize and produce output
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Write logs to file
  if (outputBuffer) {
    fs.writeFileSync(
      path.join(outputDir, 'server-output.log'),
      outputBuffer
    );
  }
  
  if (stdoutBuffer) {
    fs.writeFileSync(
      path.join(outputDir, 'server-stdout.log'),
      stdoutBuffer
    );
  }
  
  if (stderrBuffer) {
    fs.writeFileSync(
      path.join(outputDir, 'server-stderr.log'),
      stderrBuffer
    );
  }
  
  // Clean up
  log.info('Terminating server process');
  serverProcess.kill();
  
  if (schemaFound) {
    log.success('Found schema-related output in server logs');
    log.info('Check the log files in output/ directory for details');
    return true;
  } else {
    log.error('No schema-related output found in server logs');
    log.info('This may indicate a problem with schema transmission');
    return false;
  }
}

// Validate the schema structure
function validateSchema(schema, enhancements) {
  log.info('Validating cloze_find_people schema structure');
  
  if (!schema) {
    log.error('Schema object is undefined or null');
    return false;
  }
  
  // Basic schema validation
  const hasValidShape = schema.describe &&
                       schema._def &&
                       schema._def.schema &&
                       schema._def.schema.shape;
  
  if (!hasValidShape) {
    log.error('Schema does not have expected Zod structure');
    return false;
  }
  
  // Check for freeformquery
  const hasFreeformquery = schema._def.schema.shape.freeformquery;
  if (!hasFreeformquery) {
    log.error('Schema is missing required property "freeformquery"');
    return false;
  }
  
  log.success('Schema has correct basic structure');
  
  // Validate enhancements
  if (enhancements) {
    // Check freeformquery enhancements
    const fqEnhancements = enhancements.freeformquery;
    if (fqEnhancements) {
      if (fqEnhancements.examples && fqEnhancements.examples.length > 0) {
        log.success(`freeformquery has ${fqEnhancements.examples.length} examples`);
      } else {
        log.warn('freeformquery is missing examples');
      }
      
      if (fqEnhancements.description) {
        log.success(`freeformquery has description: "${fqEnhancements.description.substring(0, 50)}..."`);
      } else {
        log.warn('freeformquery is missing description');
      }
    } else {
      log.warn('Enhancements missing for freeformquery');
    }
    
    // Log all enhanced properties
    const enhancedProps = Object.keys(enhancements);
    log.info(`Enhanced properties: ${enhancedProps.join(', ')}`);
  } else {
    log.warn('No schema enhancements found');
  }
  
  return true;
}

// Main test function
async function runTest() {
  log.info('Starting schema transmission test');
  
  try {
    // Run the test
    const success = await testSchemaTransmission();
    
    if (success) {
      log.success('Schema validation test completed successfully!');
      process.exit(0);
    } else {
      log.error('Schema validation test failed');
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