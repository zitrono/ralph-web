/**
 * Simple MCP Test Client for Schema Validation
 * This script tests if the schemas for cloze_find_people and cloze_update_people are properly served.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory
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
 * Run the test
 */
async function runTest() {
  log.info('Starting simple schema test');
  
  // Start the server with DEBUG_SCHEMA enabled
  log.info(`Starting MCP server from ${serverPath}`);
  const serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      MCP_MODE: 'true',
      DEBUG_SCHEMA: 'true'
    }
  });
  
  // Set up log file for server output
  const logFile = path.resolve(outputDir, 'server-log.txt');
  const logStream = fs.createWriteStream(logFile);
  
  // Variables to track schema logging
  let findPeopleSchemaLogged = false;
  let updatePeopleSchemaLogged = false;
  let findPeopleSchemaContent = null;
  let updatePeopleSchemaContent = null;
  
  // Handle stdout
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    logStream.write(output);
    
    // Process schemas
    processSchemaOutput(output);
  });
  
  // Handle stderr
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    logStream.write(output);
    
    // Process schemas
    processSchemaOutput(output);
  });
  
  // Function to process schema output
  function processSchemaOutput(output) {
    // Check for find_people schema
    if (output.includes('Schema for cloze_find_people:')) {
      log.success('Found schema logging for cloze_find_people');
      findPeopleSchemaLogged = true;
      
      // Try to extract the schema JSON
      try {
        const schemaMatch = output.match(/Schema for cloze_find_people: (.+)/);
        if (schemaMatch && schemaMatch[1]) {
          findPeopleSchemaContent = JSON.parse(schemaMatch[1]);
          log.success('Successfully parsed cloze_find_people schema JSON');
          
          // Save the schema to a file
          fs.writeFileSync(
            path.resolve(outputDir, 'cloze_find_people_schema.json'),
            JSON.stringify(findPeopleSchemaContent, null, 2)
          );
        }
      } catch (error) {
        log.error(`Failed to parse cloze_find_people schema JSON: ${error.message}`);
      }
    }
    
    // Check for update_people schema
    if (output.includes('Schema for cloze_update_people:')) {
      log.success('Found schema logging for cloze_update_people');
      updatePeopleSchemaLogged = true;
      
      // Try to extract the schema JSON
      try {
        const schemaMatch = output.match(/Schema for cloze_update_people: (.+)/);
        if (schemaMatch && schemaMatch[1]) {
          updatePeopleSchemaContent = JSON.parse(schemaMatch[1]);
          log.success('Successfully parsed cloze_update_people schema JSON');
          
          // Save the schema to a file
          fs.writeFileSync(
            path.resolve(outputDir, 'cloze_update_people_schema.json'),
            JSON.stringify(updatePeopleSchemaContent, null, 2)
          );
        }
      } catch (error) {
        log.error(`Failed to parse cloze_update_people schema JSON: ${error.message}`);
      }
    }
  }
  
  // Wait for server to start and log schemas
  log.info('Waiting for server to start and log schemas...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Stop the server
  log.info('Stopping server process');
  serverProcess.kill();
  
  // Check if schemas were logged
  let findPeopleSuccess = false;
  let updatePeopleSuccess = false;
  
  // Check find_people schema
  if (findPeopleSchemaLogged) {
    log.success('Schema for cloze_find_people was logged by the server');
    if (findPeopleSchemaContent) {
      log.success('Schema content for cloze_find_people was successfully parsed and saved');
      
      // Verify schema properties
      if (findPeopleSchemaContent.properties && findPeopleSchemaContent.properties.freeformquery) {
        log.success('cloze_find_people schema includes freeformquery property');
        
        // Check for examples
        if (findPeopleSchemaContent.properties.freeformquery.examples) {
          log.success('cloze_find_people schema includes examples for freeformquery');
          log.info(`Examples: ${JSON.stringify(findPeopleSchemaContent.properties.freeformquery.examples)}`);
          findPeopleSuccess = true;
        } else {
          log.warn('cloze_find_people schema does not include examples for freeformquery');
        }
      } else {
        log.error('cloze_find_people schema is missing freeformquery property');
      }
    }
  } else {
    log.error('Schema for cloze_find_people was NOT logged by the server');
  }
  
  // Check update_people schema
  if (updatePeopleSchemaLogged) {
    log.success('Schema for cloze_update_people was logged by the server');
    if (updatePeopleSchemaContent) {
      log.success('Schema content for cloze_update_people was successfully parsed and saved');
      
      // Verify schema properties
      if (updatePeopleSchemaContent.properties && 
          (updatePeopleSchemaContent.properties.syncKey || updatePeopleSchemaContent.properties.emails)) {
        log.success('cloze_update_people schema includes required properties');
        
        // Check for examples
        if (updatePeopleSchemaContent.properties.syncKey && 
            updatePeopleSchemaContent.properties.syncKey.examples) {
          log.success('cloze_update_people schema includes examples for parameters');
          updatePeopleSuccess = true;
        } else {
          log.warn('cloze_update_people schema does not include necessary examples');
        }
      } else {
        log.error('cloze_update_people schema is missing required properties');
      }
    }
  } else {
    log.error('Schema for cloze_update_people was NOT logged by the server');
  }
  
  // Return overall success
  const success = findPeopleSuccess && updatePeopleSuccess;
  if (success) {
    log.success('Both schemas were properly logged and validated!');
  } else {
    log.error('One or both schemas failed validation - check the logs for details');
  }
  
  return success;
}

// Run the test
runTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log.error(`Test failed with error: ${error.message}`);
    process.exit(1);
  });