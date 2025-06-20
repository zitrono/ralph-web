/**
 * Comprehensive MCP Test Client for Cloze
 *
 * This script provides a comprehensive testing framework for the Cloze MCP server.
 * It can test individual tools, run end-to-end flows, and verify proper schema transmission.
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
const outputDir = resolve(__dirname, 'output');

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
      DEBUG_SCHEMA: 'true'
    }
  });
  
  // Set up log files
  const stdoutLog = fs.createWriteStream(resolve(outputDir, 'server-stdout.log'));
  const stderrLog = fs.createWriteStream(resolve(outputDir, 'server-stderr.log'));
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    stdoutLog.write(output);
    
    if (output.includes('Schema for') || output.includes('error') || output.includes('Error')) {
      log.debug(`Server stdout: ${output.trim()}`);
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString();
    stderrLog.write(output);
    log.debug(`Server stderr: ${output.trim()}`);
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
    name: 'comprehensive-test-client',
    version: '1.0.0'
  });
  
  log.info('Connecting client to transport');
  await client.connect(transport);
  log.success('Connected to MCP server');
  
  return client;
}

/**
 * Get the list of available tools
 */
async function getToolsList(client) {
  log.info('Requesting tools list from server');
  
  try {
    const toolsRequest = {
      method: 'tools/list',
      params: {}
    };
    
    const toolsResult = await client.request(toolsRequest, ListToolsResultSchema);
    log.success(`Received ${toolsResult.tools.length} tools from server`);
    
    // Save the full tools list to a file
    fs.writeFileSync(
      resolve(outputDir, 'tools-list.json'),
      JSON.stringify(toolsResult.tools, null, 2)
    );
    
    return toolsResult.tools;
  } catch (error) {
    log.error(`Failed to retrieve tools list: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    return [];
  }
}

/**
 * Validate a tool's schema
 */
function validateToolSchema(tool) {
  log.info(`Validating schema for ${tool.name}`);
  
  // Create a directory for this tool
  const toolDir = resolve(outputDir, tool.name);
  if (!fs.existsSync(toolDir)) {
    fs.mkdirSync(toolDir, { recursive: true });
  }
  
  // Save the tool definition to a file
  fs.writeFileSync(
    resolve(toolDir, 'tool-definition.json'),
    JSON.stringify(tool, null, 2)
  );
  
  // Check for schema
  if (!tool.inputSchema || typeof tool.inputSchema !== 'object') {
    log.error(`Tool ${tool.name} has no valid inputSchema`);
    return false;
  }
  
  // Save the schema to a file
  fs.writeFileSync(
    resolve(toolDir, 'input-schema.json'),
    JSON.stringify(tool.inputSchema, null, 2)
  );
  
  // Basic schema validation
  if (tool.inputSchema.type !== 'object') {
    log.error(`Expected schema type 'object' for ${tool.name}, got '${tool.inputSchema.type}'`);
    return false;
  }
  
  // Check for properties
  if (!tool.inputSchema.properties) {
    log.warn(`Schema for ${tool.name} has no properties defined`);
    return false;
  }
  
  // Check for required properties
  if (!tool.inputSchema.required || tool.inputSchema.required.length === 0) {
    log.warn(`Schema for ${tool.name} has no required properties defined`);
  }
  
  // Check for property enhancements (descriptions and examples)
  const propertyEnhancements = {};
  let hasEnhancements = false;
  
  for (const [propName, propSchema] of Object.entries(tool.inputSchema.properties)) {
    const enhancements = {
      hasDescription: !!propSchema.description,
      hasExamples: !!(propSchema.examples && propSchema.examples.length > 0),
      hasEnumDescriptions: !!(propSchema.enumDescriptions)
    };
    
    propertyEnhancements[propName] = enhancements;
    
    if (enhancements.hasDescription || enhancements.hasExamples || enhancements.hasEnumDescriptions) {
      hasEnhancements = true;
    }
  }
  
  // Save property enhancements to a file
  fs.writeFileSync(
    resolve(toolDir, 'property-enhancements.json'),
    JSON.stringify(propertyEnhancements, null, 2)
  );
  
  if (hasEnhancements) {
    log.success(`Schema for ${tool.name} has property enhancements`);
  } else {
    log.warn(`Schema for ${tool.name} has no property enhancements`);
  }
  
  return true;
}

/**
 * Test a specific tool
 */
async function testTool(client, toolName, params) {
  log.info(`Testing tool: ${toolName}`);
  
  try {
    // Create a directory for this tool
    const toolDir = resolve(outputDir, toolName);
    if (!fs.existsSync(toolDir)) {
      fs.mkdirSync(toolDir, { recursive: true });
    }
    
    // Save the test parameters to a file
    fs.writeFileSync(
      resolve(toolDir, 'test-params.json'),
      JSON.stringify(params, null, 2)
    );
    
    // Make the tool request
    const toolRequest = {
      method: 'tools/use',
      params: {
        name: toolName,
        input: params
      }
    };
    
    log.info(`Sending request to ${toolName}`);
    const result = await client.request(toolRequest);
    
    // Save the result to a file
    fs.writeFileSync(
      resolve(toolDir, 'test-result.json'),
      JSON.stringify(result, null, 2)
    );
    
    log.success(`Tool ${toolName} executed successfully`);
    return {
      success: true,
      result: result
    };
  } catch (error) {
    log.error(`Failed to execute tool ${toolName}: ${error.message}`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Run a series of tests for people workflow
 */
async function testPeopleWorkflow(client) {
  log.info('Running people workflow tests');
  
  // Test parameters for a test person
  const testEmail = `test.person.${Date.now()}@example.com`;
  const testPerson = {
    name: 'Test Person',
    emails: [{ value: testEmail }]
  };
  
  try {
    // 1. Create person
    log.info('Step 1: Creating test person');
    const createResult = await testTool(client, 'cloze_create_people', testPerson);
    
    if (!createResult.success) {
      log.error('Failed to create test person');
      return false;
    }
    
    // Get the syncKey from the result
    const syncKey = createResult.result.syncKey;
    log.success(`Created test person with syncKey: ${syncKey}`);
    
    // 2. Find the person
    log.info('Step 2: Finding created person');
    const findResult = await testTool(client, 'cloze_find_people', {
      freeformquery: testEmail
    });
    
    if (!findResult.success || !findResult.result.people || findResult.result.people.length === 0) {
      log.error('Failed to find created person');
      return false;
    }
    
    log.success(`Found test person: ${findResult.result.people[0].name}`);
    
    // 3. Update the person
    log.info('Step 3: Updating test person');
    const updateResult = await testTool(client, 'cloze_update_people', {
      syncKey: syncKey,
      job_title: 'Test Engineer'
    });
    
    if (!updateResult.success) {
      log.error('Failed to update test person');
      return false;
    }
    
    log.success('Updated test person');
    
    // 4. Delete the person
    log.info('Step 4: Deleting test person');
    const deleteResult = await testTool(client, 'cloze_delete_people', {
      uniqueid: testEmail
    });
    
    if (!deleteResult.success) {
      log.error('Failed to delete test person');
      return false;
    }
    
    log.success('Deleted test person');
    
    // Verify person was deleted
    log.info('Step 5: Verifying person was deleted');
    const verifyResult = await testTool(client, 'cloze_find_people', {
      freeformquery: testEmail
    });
    
    if (verifyResult.success && 
        verifyResult.result.people && 
        verifyResult.result.people.length > 0) {
      log.error('Person was not properly deleted');
      return false;
    }
    
    log.success('Verified person was properly deleted');
    return true;
  } catch (error) {
    log.error(`People workflow test failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    return false;
  }
}

/**
 * Run a series of tests for company workflow
 */
async function testCompanyWorkflow(client) {
  log.info('Running company workflow tests');
  
  // Test parameters for a test company
  const testCompanyName = `Test Company ${Date.now()}`;
  const testDomain = `testcompany${Date.now()}.example.com`;
  const testCompany = {
    name: testCompanyName,
    domains: [testDomain]
  };
  
  try {
    // 1. Create company
    log.info('Step 1: Creating test company');
    const createResult = await testTool(client, 'cloze_create_company', testCompany);
    
    if (!createResult.success) {
      log.error('Failed to create test company');
      return false;
    }
    
    log.success(`Created test company: ${testCompanyName}`);
    
    // 2. Find the company
    log.info('Step 2: Finding created company');
    const findResult = await testTool(client, 'cloze_find_company', {
      domain: testDomain
    });
    
    if (!findResult.success || !findResult.result.companies || findResult.result.companies.length === 0) {
      log.error('Failed to find created company');
      return false;
    }
    
    log.success(`Found test company: ${findResult.result.companies[0].name}`);
    
    // 3. Update the company
    log.info('Step 3: Updating test company');
    const updateResult = await testTool(client, 'cloze_update_company', {
      name: testCompanyName,
      domains: [testDomain],
      industry: 'Technology'
    });
    
    if (!updateResult.success) {
      log.error('Failed to update test company');
      return false;
    }
    
    log.success('Updated test company');
    
    // We don't delete the company as it's not a critical operation
    // and the Cloze API might not support it directly
    
    return true;
  } catch (error) {
    log.error(`Company workflow test failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    return false;
  }
}

/**
 * Run health check tests
 */
async function testHealthChecks(client) {
  log.info('Running health check tests');
  
  try {
    // 1. Basic health check
    log.info('Step 1: Basic health check');
    const healthResult = await testTool(client, 'cloze_health_health_check', {});
    
    if (!healthResult.success || !healthResult.result.success) {
      log.error('Health check failed');
      return false;
    }
    
    log.success('Health check passed');
    
    // 2. Connection status
    log.info('Step 2: Connection status check');
    const connectionResult = await testTool(client, 'cloze_health_health_connection_status', {});
    
    if (!connectionResult.success || !connectionResult.result.success) {
      log.error('Connection status check failed');
      return false;
    }
    
    log.success('Connection status check passed');
    
    return true;
  } catch (error) {
    log.error(`Health check tests failed: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    return false;
  }
}

/**
 * Main test runner function
 */
async function runTests() {
  log.info('Starting comprehensive MCP tests');
  
  let serverProcess = null;
  let client = null;
  let results = {};
  
  try {
    // Start the server
    serverProcess = await launchServer();
    
    // Connect to the server
    client = await connectToServer(serverProcess);
    
    // Get the list of tools
    const tools = await getToolsList(client);
    results.toolsCount = tools.length;
    
    // Validate schemas for all tools
    const schemaResults = tools.map(validateToolSchema);
    results.validSchemas = schemaResults.filter(r => r).length;
    results.invalidSchemas = schemaResults.filter(r => !r).length;
    
    // Run workflow tests
    results.peopleWorkflow = await testPeopleWorkflow(client);
    results.companyWorkflow = await testCompanyWorkflow(client);
    results.healthChecks = await testHealthChecks(client);
    
    // Generate summary report
    generateSummaryReport(results);
    
    // Overall success determination
    const success = results.validSchemas > 0 && 
                    results.peopleWorkflow && 
                    results.companyWorkflow && 
                    results.healthChecks;
    
    if (success) {
      log.success('All tests completed successfully!');
    } else {
      log.error('Some tests failed. See summary report for details.');
    }
    
    return success;
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
    toolsCount: results.toolsCount || 0,
    schemaValidation: {
      valid: results.validSchemas || 0,
      invalid: results.invalidSchemas || 0
    },
    workflowTests: {
      people: results.peopleWorkflow ? 'PASSED' : 'FAILED',
      company: results.companyWorkflow ? 'PASSED' : 'FAILED',
      health: results.healthChecks ? 'PASSED' : 'FAILED'
    },
    overallResult: (
      results.validSchemas > 0 && 
      results.peopleWorkflow && 
      results.companyWorkflow && 
      results.healthChecks
    ) ? 'PASSED' : 'FAILED'
  };
  
  // Save the summary to a file
  fs.writeFileSync(
    resolve(outputDir, 'summary-report.json'),
    JSON.stringify(summary, null, 2)
  );
  
  // Print the summary to the console
  log.info('Test Summary:');
  log.info(`Tools validated: ${summary.toolsCount}`);
  log.info(`Schema validation: ${summary.schemaValidation.valid} valid, ${summary.schemaValidation.invalid} invalid`);
  log.info(`People workflow test: ${summary.workflowTests.people}`);
  log.info(`Company workflow test: ${summary.workflowTests.company}`);
  log.info(`Health checks test: ${summary.workflowTests.health}`);
  log.info(`Overall result: ${summary.overallResult}`);
}

// Run the tests
runTests().then(success => {
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}).catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});