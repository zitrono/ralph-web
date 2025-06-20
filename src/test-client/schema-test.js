/**
 * MCP Test Client for Schema Validation
 *
 * This script connects to the MCP server and checks if schemas are properly transmitted
 * for the tools/list endpoint. Used to verify schema metadata is correctly being sent.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(__dirname, '..', '..', 'dist', 'index.js');

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

// Launch the server process
async function launchServer() {
  log.info(`Starting MCP server from ${serverPath}`);
  
  const serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      MCP_MODE: 'true'
    }
  });
  
  serverProcess.stdout.on('data', (data) => {
    log.debug(`Server stdout: ${data.toString().trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    log.debug(`Server stderr: ${data.toString().trim()}`);
  });
  
  return serverProcess;
}

// Connect to the server
async function connectToServer(serverProcess) {
  log.info('Creating transport to connect to server');
  
  const transport = new StdioClientTransport({
    process: serverProcess
  });
  
  log.info('Creating MCP client');
  const client = new Client({
    name: 'schema-test-client',
    version: '1.0.0'
  });
  
  log.info('Connecting client to transport');
  await client.connect(transport);
  log.success('Connected to MCP server');
  
  return client;
}

// Test the tools/list endpoint and schema transmission
async function testToolsList(client) {
  log.info('Requesting tools list from server');
  
  try {
    // Get the list of available tools
    const toolsRequest = {
      method: 'tools/list',
      params: {}
    };
    const toolsResult = await client.request(toolsRequest, ListToolsResultSchema);
    log.success(`Received ${toolsResult.tools.length} tools from server`);
    
    // Find our specific tool
    const findPeopleTool = toolsResult.tools.find(tool => tool.name === 'cloze_find_people');
    
    if (!findPeopleTool) {
      log.error('cloze_find_people tool not found in tools list');
      return false;
    }
    
    log.success('Found cloze_find_people tool');
    
    // Validate the schema
    const schema = findPeopleTool.inputSchema;
    log.info('Validating schema for cloze_find_people tool');
    
    // Check if schema is properly formatted
    if (!schema || typeof schema !== 'object') {
      log.error('Schema is missing or not an object');
      return false;
    }
    
    if (schema.type !== 'object') {
      log.error(`Expected schema type 'object', got '${schema.type}'`);
      return false;
    }
    
    if (!schema.properties || !schema.properties.freeformquery) {
      log.error('Required property "freeformquery" not found in schema');
      return false;
    }
    
    log.success('Schema has correct basic structure');
    
    // Check for enhancements (descriptions and examples)
    const freeformqueryProp = schema.properties.freeformquery;
    
    if (!freeformqueryProp.description) {
      log.warn('Property "freeformquery" is missing description');
    } else {
      log.success(`Description found: "${freeformqueryProp.description}"`);
    }
    
    if (!freeformqueryProp.examples || !freeformqueryProp.examples.length) {
      log.warn('Property "freeformquery" is missing examples');
    } else {
      log.success(`Examples found: ${JSON.stringify(freeformqueryProp.examples)}`);
    }
    
    // Output the complete schema
    log.info('Complete schema:');
    console.log(JSON.stringify(schema, null, 2));
    
    return true;
  } catch (error) {
    log.error(`Failed to retrieve tools list: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    return false;
  }
}

// Main test function
async function runTest() {
  log.info('Starting schema transmission test');
  
  let serverProcess = null;
  let client = null;
  let success = false;
  
  try {
    serverProcess = await launchServer();
    
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    client = await connectToServer(serverProcess);
    success = await testToolsList(client);
    
    if (success) {
      log.success('Schema transmission test completed successfully!');
    } else {
      log.error('Schema transmission test failed');
    }
  } catch (error) {
    log.error(`Test failed with error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    // Clean up resources
    if (client) {
      try {
        log.info('Closing client connection');
        await client.close();
      } catch (error) {
        log.error(`Error closing client: ${error.message}`);
      }
    }
    
    if (serverProcess) {
      log.info('Terminating server process');
      serverProcess.kill();
    }
    
    process.exit(success ? 0 : 1);
  }
}

// Run the test
runTest();