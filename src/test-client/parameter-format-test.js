/**
 * Parameter Format Test for Cloze MCP Server
 *
 * This script tests multiple parameter formats to identify which format is expected by Claude Desktop.
 * It sends the same query with different parameter formats and logs the results.
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the current directory
const __dirname = dirname(fileURLToPath(import.meta.url));
const serverPath = resolve(__dirname, '..', '..', 'dist', 'index.js');
const outputDir = resolve(__dirname, 'output', 'parameter-formats');

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
 * Launch the server process
 */
async function launchServer() {
  log.info(`Starting MCP server from ${serverPath}`);
  
  const serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      MCP_MODE: 'true',
      DEBUG_SCHEMA: 'true',
      DEBUG_PARAMS: 'true'  // Enable parameter debugging
    }
  });
  
  // Set up log files
  const stdoutLog = fs.createWriteStream(resolve(outputDir, 'server-stdout.log'));
  const stderrLog = fs.createWriteStream(resolve(outputDir, 'server-stderr.log'));
  const fullLog = fs.createWriteStream(resolve(outputDir, 'server-full.log'));
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    stdoutLog.write(output);
    fullLog.write(output);
    
    // Log all server output for this test
    console.log(`${colors.gray}[SERVER]${colors.reset} ${output.trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    stderrLog.write(output);
    fullLog.write(output);
    log.error(`Server stderr: ${output.trim()}`);
  });
  
  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return serverProcess;
}

/**
 * Connect to the server
 */
async function connectToServer(serverProcess) {
  log.info('Creating transport to connect to server');
  
  const transport = new StdioClientTransport({
    process: serverProcess
  });
  
  log.info('Creating MCP client');
  const client = new Client({
    name: 'parameter-format-test-client',
    version: '1.0.0'
  });
  
  log.info('Connecting client to transport');
  await client.connect(transport);
  log.success('Connected to MCP server');
  
  return client;
}

/**
 * Test a specific parameter format
 */
async function testParameterFormat(client, formatName, params) {
  log.info(`Testing format: ${formatName}`);
  
  try {
    // Create format-specific directory
    const formatDir = resolve(outputDir, formatName);
    if (!fs.existsSync(formatDir)) {
      fs.mkdirSync(formatDir, { recursive: true });
    }
    
    // Save the test parameters to a file
    fs.writeFileSync(
      resolve(formatDir, 'params.json'),
      JSON.stringify(params, null, 2)
    );
    
    // Make the tool request
    const toolRequest = {
      method: 'tools/use',
      params: {
        name: 'cloze_debug_params', // Use our debug tool instead
        input: params
      }
    };
    
    log.info(`Sending request with ${formatName} format`);
    const result = await client.request(toolRequest);
    
    // Save the result to a file
    fs.writeFileSync(
      resolve(formatDir, 'result.json'),
      JSON.stringify(result, null, 2)
    );
    
    log.success(`Format ${formatName} executed successfully`);
    return {
      success: true,
      format: formatName,
      params: params,
      result: result
    };
  } catch (error) {
    log.error(`Format ${formatName} failed: ${error.message}`);
    
    // Save the error to a file
    fs.writeFileSync(
      resolve(outputDir, `${formatName}-error.json`),
      JSON.stringify({ error: error.message, stack: error.stack }, null, 2)
    );
    
    return {
      success: false,
      format: formatName,
      params: params,
      error: error.message
    };
  }
}

/**
 * Main test runner function
 */
async function runTests() {
  log.info('Starting parameter format tests');
  
  let serverProcess = null;
  let client = null;
  const results = [];
  
  try {
    // Start the server
    serverProcess = await launchServer();
    
    // Connect to the server
    client = await connectToServer(serverProcess);
    
    // Test different parameter formats
    
    // Format 1: Direct format
    results.push(await testParameterFormat(client, 'direct-format', {
      freeformquery: "Katja"
    }));
    
    // Format 2: Wrapped format
    results.push(await testParameterFormat(client, 'wrapped-format', {
      parameters: {
        freeformquery: "Katja"
      }
    }));
    
    // Format 3: Claude Desktop format
    results.push(await testParameterFormat(client, 'claude-desktop-format', {
      name: "cloze_find_people",
      parameters: {
        freeformquery: "Katja"
      }
    }));
    
    // Format 4: Arguments format
    results.push(await testParameterFormat(client, 'arguments-format', {
      arguments: {
        freeformquery: "Katja"
      }
    }));

    // Format 5: MCP format with function call style
    results.push(await testParameterFormat(client, 'mcp-function-call-format', {
      function_call: {
        name: "cloze_find_people",
        arguments: {
          freeformquery: "Katja"
        }
      }
    }));
    
    // Generate summary report
    generateSummaryReport(results);
    
    log.success('Parameter format tests completed');
    return true;
  } catch (error) {
    log.error(`Test run failed with error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    return false;
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
  }
}

/**
 * Generate a summary report
 */
function generateSummaryReport(results) {
  log.info('Generating summary report');
  
  const summary = {
    timestamp: new Date().toISOString(),
    results: results.map(r => ({
      format: r.format,
      success: r.success,
      error: r.error || null
    })),
    successfulFormats: results.filter(r => r.success).map(r => r.format),
    failedFormats: results.filter(r => !r.success).map(r => r.format)
  };
  
  // Save the summary to a file
  fs.writeFileSync(
    resolve(outputDir, 'summary-report.json'),
    JSON.stringify(summary, null, 2)
  );
  
  // Print the summary to the console
  log.info('Test Summary:');
  log.info(`Formats tested: ${results.length}`);
  log.info(`Successful formats: ${summary.successfulFormats.join(', ') || 'None'}`);
  log.info(`Failed formats: ${summary.failedFormats.join(', ') || 'None'}`);
  
  // Log all results in detail
  results.forEach(result => {
    if (result.success) {
      log.success(`Format ${result.format}: SUCCESS`);
    } else {
      log.error(`Format ${result.format}: FAILED - ${result.error}`);
    }
  });
}

// Run the tests
runTests().then(success => {
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}).catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});