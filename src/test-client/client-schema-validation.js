/**
 * Client-side Schema Validation for MCP Tools
 * 
 * This module implements client-side schema validation to catch validation errors
 * before making server calls. It's useful for providing faster feedback and reducing
 * load on the MCP server.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(__dirname, '..', '..', 'dist', 'index.js');
const outputDir = resolve(__dirname, 'output');
const schemasCachePath = resolve(outputDir, 'schemas-cache.json');

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

// Initialize AJV (JSON Schema Validator)
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Extended MCP Client with schema validation
 */
export class ValidatingMcpClient {
  constructor(serverProcess) {
    this._serverProcess = serverProcess;
    this._client = null;
    this._schemas = new Map();
    this._validateFlag = true;
  }
  
  /**
   * Connect to the MCP server
   */
  async connect() {
    log.info('Creating transport to connect to server');
    
    const transport = new StdioClientTransport({
      process: this._serverProcess
    });
    
    log.info('Creating MCP client');
    this._client = new Client({
      name: 'validating-mcp-client',
      version: '1.0.0'
    });
    
    log.info('Connecting client to transport');
    await this._client.connect(transport);
    log.success('Connected to MCP server');
    
    // Load schemas from the server
    await this._loadSchemas();
    
    return this;
  }
  
  /**
   * Close the client connection
   */
  async close() {
    if (this._client) {
      await this._client.close();
    }
  }
  
  /**
   * Enable or disable validation
   */
  setValidation(enabled) {
    this._validateFlag = enabled;
    log.info(`Schema validation ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Load schemas from the server
   */
  async _loadSchemas() {
    try {
      // Check if we have cached schemas
      if (fs.existsSync(schemasCachePath)) {
        log.info('Loading schemas from cache');
        const cachedSchemas = JSON.parse(fs.readFileSync(schemasCachePath, 'utf8'));
        
        // Add each schema to the map
        for (const [toolName, schema] of Object.entries(cachedSchemas)) {
          this._schemas.set(toolName, schema);
        }
        
        log.success(`Loaded ${this._schemas.size} schemas from cache`);
        return;
      }
    } catch (error) {
      log.warn(`Failed to load schemas from cache: ${error.message}`);
    }
    
    // If no cache, load from the server
    log.info('Requesting schemas from server');
    
    try {
      const toolsRequest = {
        method: 'tools/list',
        params: {}
      };
      
      const toolsResult = await this._client.request(toolsRequest, ListToolsResultSchema);
      log.success(`Received ${toolsResult.tools.length} tools from server`);
      
      // Store each tool's schema
      for (const tool of toolsResult.tools) {
        if (tool.inputSchema && typeof tool.inputSchema === 'object') {
          this._schemas.set(tool.name, tool.inputSchema);
          
          // Compile the schema validator
          try {
            ajv.compile(tool.inputSchema);
          } catch (error) {
            log.warn(`Failed to compile schema for ${tool.name}: ${error.message}`);
          }
        }
      }
      
      // Cache the schemas
      this._cacheSchemas();
      
    } catch (error) {
      log.error(`Failed to retrieve schemas from server: ${error.message}`);
    }
  }
  
  /**
   * Cache schemas to disk
   */
  _cacheSchemas() {
    try {
      const schemasObject = {};
      for (const [toolName, schema] of this._schemas.entries()) {
        schemasObject[toolName] = schema;
      }
      
      fs.writeFileSync(
        schemasCachePath,
        JSON.stringify(schemasObject, null, 2)
      );
      
      log.success(`Cached ${this._schemas.size} schemas to disk`);
    } catch (error) {
      log.error(`Failed to cache schemas: ${error.message}`);
    }
  }
  
  /**
   * Validate tool input against its schema
   */
  validateToolInput(toolName, input) {
    if (!this._validateFlag) {
      return { valid: true };
    }
    
    if (!this._schemas.has(toolName)) {
      return {
        valid: false,
        error: `No schema found for tool: ${toolName}`
      };
    }
    
    const schema = this._schemas.get(toolName);
    
    try {
      const validate = ajv.compile(schema);
      const valid = validate(input);
      
      if (!valid) {
        return {
          valid: false,
          error: 'Validation failed',
          errors: validate.errors
        };
      }
      
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${error.message}`
      };
    }
  }
  
  /**
   * Call a tool with validation
   */
  async callTool(toolName, input) {
    // Validate input
    const validation = this.validateToolInput(toolName, input);
    
    if (!validation.valid) {
      log.error(`Validation failed for ${toolName}:`);
      
      if (validation.errors) {
        for (const error of validation.errors) {
          const path = error.instancePath || '/';
          log.error(`- ${path}: ${error.message}`);
        }
      } else {
        log.error(`- ${validation.error}`);
      }
      
      throw new Error(`Validation failed for ${toolName}: ${validation.error}`);
    }
    
    // Call the tool
    const toolRequest = {
      method: 'tools/use',
      params: {
        name: toolName,
        input: input
      }
    };
    
    try {
      log.info(`Calling tool: ${toolName}`);
      const result = await this._client.request(toolRequest);
      log.success(`Tool ${toolName} executed successfully`);
      return result;
    } catch (error) {
      log.error(`Error calling tool ${toolName}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get the list of available tools
   */
  async getToolsList() {
    const toolsRequest = {
      method: 'tools/list',
      params: {}
    };
    
    try {
      const toolsResult = await this._client.request(toolsRequest, ListToolsResultSchema);
      return toolsResult.tools;
    } catch (error) {
      log.error(`Failed to retrieve tools list: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get the schema for a specific tool
   */
  getSchema(toolName) {
    return this._schemas.get(toolName);
  }
  
  /**
   * Get all available schemas
   */
  getAllSchemas() {
    const schemas = {};
    for (const [toolName, schema] of this._schemas.entries()) {
      schemas[toolName] = schema;
    }
    return schemas;
  }
}

/**
 * Launch the server and create a validating client
 */
export async function createValidatingClient() {
  // Launch the server
  log.info(`Starting MCP server from ${serverPath}`);
  
  const serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      MCP_MODE: 'true',
      DEBUG_SCHEMA: 'true'
    }
  });
  
  // Set up log files
  const stdoutLog = fs.createWriteStream(resolve(outputDir, 'server-stdout.log'));
  const stderrLog = fs.createWriteStream(resolve(outputDir, 'server-stderr.log'));
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    stdoutLog.write(output);
  });
  
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    stderrLog.write(output);
  });
  
  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Create and connect the client
  const client = new ValidatingMcpClient(serverProcess);
  await client.connect();
  
  return { client, serverProcess };
}

/**
 * Example usage
 */
async function exampleUsage() {
  log.info('Running example usage');
  
  let client = null;
  let serverProcess = null;
  
  try {
    // Create client
    ({ client, serverProcess } = await createValidatingClient());
    
    // Example 1: Valid input
    log.info('Example 1: Valid input');
    try {
      const result = await client.callTool('cloze_find_people', {
        freeformquery: 'test@example.com'
      });
      
      log.success('Tool executed successfully:');
      log.info(`Found ${result.people.length} people`);
    } catch (error) {
      log.error(`Example 1 failed: ${error.message}`);
    }
    
    // Example 2: Invalid input (missing required parameter)
    log.info('Example 2: Invalid input (missing required parameter)');
    try {
      await client.callTool('cloze_find_people', {
        // Missing freeformquery parameter
      });
    } catch (error) {
      log.success(`Expected validation error caught: ${error.message}`);
    }
    
    // Example 3: Invalid input (wrong type)
    log.info('Example 3: Invalid input (wrong type)');
    try {
      await client.callTool('cloze_find_people', {
        freeformquery: 123 // Should be a string
      });
    } catch (error) {
      log.success(`Expected validation error caught: ${error.message}`);
    }
    
  } catch (error) {
    log.error(`Example usage failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    // Clean up
    if (client) {
      await client.close();
    }
    
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

// If called directly, run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleUsage()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

// Export the module
export default {
  ValidatingMcpClient,
  createValidatingClient
};