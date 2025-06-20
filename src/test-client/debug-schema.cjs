/**
 * Simple direct schema test script
 * Logs schema information for debugging
 */

// Import necessary modules
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// Test schema debugging
async function testSchemaDebug() {
  log.info('Starting MCP server for debug schema testing');
  
  // Create output directory if it doesn't exist
  const outputDir = path.resolve(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Start the server process with enhanced debug output
  const serverProcess = spawn('node', ['./dist/index.js'], {
    cwd: path.resolve(__dirname, '../..'),
    env: {
      ...process.env,
      DEBUG_SCHEMA: 'true',
      NODE_DEBUG: 'mcp,server'
    }
  });
  
  // Log messages from server
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    logAndSaveOutput(output, 'STDOUT');
    checkForSchemaInfo(output);
  });
  
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    logAndSaveOutput(output, 'STDERR');
    checkForSchemaInfo(output);
  });
  
  // Keep track of collected data
  let allOutput = '';
  
  // Log and save output
  function logAndSaveOutput(output, source) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}][${source}]: ${output.trim()}`);
    allOutput += `[${timestamp}][${source}]: ${output}\n`;
    
    // Save to file
    fs.writeFileSync(
      path.join(outputDir, 'server-log.txt'),
      allOutput
    );
  }
  
  // Check for schema info in logs
  function checkForSchemaInfo(output) {
    if (output.includes('SCHEMA_DEBUG')) {
      log.success('Found schema debug information!');
      
      // Try to extract schema
      try {
        const match = output.match(/SCHEMA_DEBUG: Schema for (.*?): ({.*})/);
        if (match) {
          const toolName = match[1];
          const schemaJson = match[2];
          
          log.success(`Extracted schema for ${toolName}`);
          
          // Save to file
          fs.writeFileSync(
            path.join(outputDir, `${toolName}_schema.json`),
            schemaJson
          );
        }
      } catch (error) {
        log.error(`Error extracting schema: ${error.message}`);
      }
    }
  }
  
  // Wait for server to initialize and log schema info
  log.info('Waiting for server to initialize...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Shutdown server
  log.info('Terminating server');
  serverProcess.kill();
  
  log.success('Debug test completed');
}

// Run the test
testSchemaDebug().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});