/**
 * Schema Validation MCP Format Verification Test
 * 
 * This script tests the schema validation with MCP-formatted parameters
 * It verifies that our parameter validation middleware correctly handles
 * parameters in the MCP format (with arguments field)
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

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Set up output file
const outputFile = resolve(outputDir, 'schema-verification-report.md');
const jsonOutputFile = resolve(outputDir, 'schema-verification-report.json');

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

// Test results
const results = {
  totalTools: 0,
  passedTools: 0,
  failedTools: 0,
  skippedTools: 0,
  toolResults: []
};

// Launch the server process
async function launchServer() {
  log.info(`Starting MCP server from ${serverPath}`);
  
  const serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      MCP_MODE: 'true',
      DEBUG_SCHEMA: 'true',
      DEBUG_CLOZE: 'true'
    }
  });
  
  const serverOutput = [];
  
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    serverOutput.push(output);
    log.debug(`Server stdout: ${output}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    const output = data.toString().trim();
    serverOutput.push(output);
    log.debug(`Server stderr: ${output}`);
  });
  
  // Save server output to file
  process.on('exit', () => {
    fs.writeFileSync(resolve(outputDir, 'server-output.log'), serverOutput.join('\n'));
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
    name: 'schema-verification-client',
    version: '1.0.0'
  });
  
  log.info('Connecting client to transport');
  await client.connect(transport);
  log.success('Connected to MCP server');
  
  return client;
}

// Get all tools from the server
async function getTools(client) {
  log.info('Requesting tools list from server');
  
  try {
    // Get the list of available tools
    const toolsRequest = {
      method: 'tools/list',
      params: {}
    };
    const toolsResult = await client.request(toolsRequest, ListToolsResultSchema);
    log.success(`Received ${toolsResult.tools.length} tools from server`);
    
    // Save all schemas to a file
    fs.writeFileSync(
      resolve(outputDir, 'all-schemas.json'), 
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

// Test MCP format for a specific tool
async function testToolWithMcpFormat(client, tool) {
  const toolResult = {
    name: tool.name,
    success: false,
    regularFormat: { tested: false, success: false, error: null },
    mcpFormat: { tested: false, success: false, error: null },
    missingParam: { tested: false, success: false, error: null },
    schema: tool.inputSchema
  };
  
  log.info(`Testing tool: ${tool.name}`);
  
  // Skip tools without input schemas
  if (!tool.inputSchema || !tool.inputSchema.properties) {
    log.warn(`Tool ${tool.name} has no input schema or properties, skipping`);
    toolResult.skipped = true;
    toolResult.skipReason = 'No input schema or properties';
    results.skippedTools++;
    return toolResult;
  }
  
  // Get required parameters from schema
  const requiredParams = tool.inputSchema.required || [];
  
  // Find first required parameter to test with
  const firstRequiredParam = requiredParams.length > 0 ? requiredParams[0] : null;
  
  if (!firstRequiredParam) {
    log.warn(`Tool ${tool.name} has no required parameters, skipping validation test`);
    toolResult.skipped = true;
    toolResult.skipReason = 'No required parameters';
    results.skippedTools++;
    return toolResult;
  }
  
  // Generate test parameters
  const paramSchema = tool.inputSchema.properties[firstRequiredParam];
  let testValue = generateTestValue(paramSchema);
  
  if (testValue === undefined) {
    log.warn(`Unable to generate test value for ${tool.name}.${firstRequiredParam}, skipping`);
    toolResult.skipped = true;
    toolResult.skipReason = `Unable to generate test value for ${firstRequiredParam}`;
    results.skippedTools++;
    return toolResult;
  }
  
  // Test with regular format
  try {
    toolResult.regularFormat.tested = true;
    log.info(`Testing ${tool.name} with regular parameter format`);
    
    const regularParams = {};
    regularParams[firstRequiredParam] = testValue;
    
    log.debug(`Calling tool with params: ${JSON.stringify(regularParams)}`);
    const regularFormatRequest = {
      method: 'tools/call',
      params: {
        name: tool.name,
        arguments: regularParams
      }
    };
    
    await client.request(regularFormatRequest);
    toolResult.regularFormat.success = true;
    log.success(`Tool ${tool.name} works with regular parameter format`);
  } catch (error) {
    toolResult.regularFormat.success = false;
    toolResult.regularFormat.error = error.message;
    log.error(`Tool ${tool.name} failed with regular parameter format: ${error.message}`);
  }
  
  // Test with MCP format (nested arguments)
  try {
    toolResult.mcpFormat.tested = true;
    log.info(`Testing ${tool.name} with MCP parameter format (nested arguments)`);
    
    const mcpParams = {};
    mcpParams[firstRequiredParam] = testValue;
    
    log.debug(`Calling tool with MCP format params: ${JSON.stringify({ arguments: mcpParams })}`);
    const mcpFormatRequest = {
      method: 'tools/call',
      params: {
        name: tool.name,
        arguments: {
          arguments: mcpParams
        }
      }
    };
    
    await client.request(mcpFormatRequest);
    toolResult.mcpFormat.success = true;
    log.success(`Tool ${tool.name} works with MCP parameter format`);
  } catch (error) {
    toolResult.mcpFormat.success = false;
    toolResult.mcpFormat.error = error.message;
    log.error(`Tool ${tool.name} failed with MCP parameter format: ${error.message}`);
  }
  
  // Test with missing required parameter
  try {
    toolResult.missingParam.tested = true;
    log.info(`Testing ${tool.name} with missing required parameter`);
    
    const missingParamRequest = {
      method: 'tools/call',
      params: {
        name: tool.name,
        arguments: {}
      }
    };
    
    await client.request(missingParamRequest);
    
    // If we get here, the validation failed (it should have thrown an error)
    toolResult.missingParam.success = false;
    toolResult.missingParam.error = 'No error thrown for missing required parameter';
    log.error(`Tool ${tool.name} validation failed: No error thrown for missing required parameter`);
  } catch (error) {
    // In this case, an error is expected and indicates successful validation
    toolResult.missingParam.success = true;
    toolResult.missingParam.error = error.message;
    log.success(`Tool ${tool.name} correctly rejected missing required parameter: ${error.message}`);
  }
  
  // Overall success
  toolResult.success = toolResult.regularFormat.success && toolResult.mcpFormat.success && toolResult.missingParam.success;
  
  if (toolResult.success) {
    log.success(`Tool ${tool.name} passed all validation tests`);
    results.passedTools++;
  } else {
    log.error(`Tool ${tool.name} failed validation tests`);
    results.failedTools++;
  }
  
  return toolResult;
}

// Helper to generate test values for parameters
function generateTestValue(paramSchema) {
  if (!paramSchema) return undefined;
  
  // Use example if available
  if (paramSchema.examples && paramSchema.examples.length > 0) {
    return paramSchema.examples[0];
  }
  
  // Generate based on type
  switch (paramSchema.type) {
    case 'string':
      return 'test_value';
    case 'number':
    case 'integer':
      return 42;
    case 'boolean':
      return true;
    case 'array':
      return [generateTestValue(paramSchema.items)];
    case 'object':
      const obj = {};
      if (paramSchema.properties) {
        for (const [key, prop] of Object.entries(paramSchema.properties)) {
          obj[key] = generateTestValue(prop);
        }
      }
      return obj;
    default:
      return undefined;
  }
}

// Generate markdown report
function generateReport() {
  const passRate = results.totalTools > 0 
    ? Math.round((results.passedTools / (results.totalTools - results.skippedTools)) * 100) 
    : 0;
  
  let report = `# Schema Validation MCP Format Verification Report\n\n`;
  report += `Report generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- Total tools tested: ${results.totalTools}\n`;
  report += `- Passed: ${results.passedTools}\n`;
  report += `- Failed: ${results.failedTools}\n`;
  report += `- Skipped: ${results.skippedTools}\n`;
  report += `- Pass rate: ${passRate}%\n\n`;
  
  report += `## Detailed Results\n\n`;
  
  for (const result of results.toolResults) {
    report += `### ${result.name}\n\n`;
    
    if (result.skipped) {
      report += `**Result: Skipped** - ${result.skipReason}\n\n`;
      continue;
    }
    
    report += `**Result: ${result.success ? 'PASSED' : 'FAILED'}**\n\n`;
    
    report += `#### Regular Parameter Format\n\n`;
    report += `- Tested: ${result.regularFormat.tested ? 'Yes' : 'No'}\n`;
    report += `- Success: ${result.regularFormat.success ? 'Yes' : 'No'}\n`;
    if (result.regularFormat.error) {
      report += `- Error: ${result.regularFormat.error}\n`;
    }
    report += `\n`;
    
    report += `#### MCP Parameter Format (Nested Arguments)\n\n`;
    report += `- Tested: ${result.mcpFormat.tested ? 'Yes' : 'No'}\n`;
    report += `- Success: ${result.mcpFormat.success ? 'Yes' : 'No'}\n`;
    if (result.mcpFormat.error) {
      report += `- Error: ${result.mcpFormat.error}\n`;
    }
    report += `\n`;
    
    report += `#### Missing Required Parameter\n\n`;
    report += `- Tested: ${result.missingParam.tested ? 'Yes' : 'No'}\n`;
    report += `- Success: ${result.missingParam.success ? 'Yes' : 'No'}\n`;
    if (result.missingParam.error) {
      report += `- Error: ${result.missingParam.error}\n`;
    }
    report += `\n`;
    
    report += `#### Schema\n\n`;
    report += '```json\n';
    report += JSON.stringify(result.schema, null, 2);
    report += '\n```\n\n';
  }
  
  return report;
}

/**
 * Simplified test to validate specific key parameters format handling
 */
async function runParametersFormatTest() {
  log.info('Running parameters format validation test');
  
  let serverProcess = null;
  let client = null;
  let success = false;
  
  try {
    // These are the high priority tools we definitely want to test
    const priorityTools = [
      'cloze_find_people',
      'cloze_update_people',
      'cloze_create_people',
      'cloze_find_company'
    ];
    
    serverProcess = await launchServer();
    
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    client = await connectToServer(serverProcess);
    
    // Get all tools
    const tools = await getTools(client);
    results.totalTools = tools.length;
    
    // First test our priority tools
    for (const toolName of priorityTools) {
      const tool = tools.find(t => t.name === toolName);
      if (tool) {
        log.info(`Testing priority tool: ${toolName}`);
        const toolResult = await testToolWithMcpFormat(client, tool);
        results.toolResults.push(toolResult);
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        log.warn(`Priority tool ${toolName} not found`);
      }
    }
    
    // Generate report
    const report = generateReport();
    fs.writeFileSync(outputFile, report);
    fs.writeFileSync(jsonOutputFile, JSON.stringify(results, null, 2));
    
    log.success(`Report saved to ${outputFile}`);
    log.success(`JSON results saved to ${jsonOutputFile}`);
    
    // Check if key tools are working
    const findPeopleResult = results.toolResults.find(r => r.name === 'cloze_find_people');
    
    if (findPeopleResult && findPeopleResult.mcpFormat.success) {
      log.success(`cloze_find_people tool successfully handles MCP parameter format!`);
      success = true;
    } else {
      log.error(`cloze_find_people tool failed with MCP parameter format test`);
      success = false;
    }
    
    // Full summary
    if (success) {
      log.success(`Parameters format validation test passed for key tools!`);
    } else {
      log.error(`Parameters format validation test failed for key tools`);
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

// Main test function
async function runTest() {
  log.info('Starting schema validation MCP format verification test');
  
  let serverProcess = null;
  let client = null;
  let success = false;
  
  try {
    // Check for QUICK_TEST environment variable
    if (process.env.QUICK_TEST === 'true') {
      log.info('Running quick parameter format test for key tools only');
      return runParametersFormatTest();
    }
    
    serverProcess = await launchServer();
    
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    client = await connectToServer(serverProcess);
    
    // Get all tools
    const tools = await getTools(client);
    results.totalTools = tools.length;
    
    // Test each tool
    for (const tool of tools) {
      const toolResult = await testToolWithMcpFormat(client, tool);
      results.toolResults.push(toolResult);
      
      // Allow a short delay between tool calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Generate report
    const report = generateReport();
    fs.writeFileSync(outputFile, report);
    fs.writeFileSync(jsonOutputFile, JSON.stringify(results, null, 2));
    
    log.success(`Report saved to ${outputFile}`);
    log.success(`JSON results saved to ${jsonOutputFile}`);
    
    success = results.failedTools === 0;
    
    if (success) {
      log.success(`All tested tools (${results.passedTools}/${results.totalTools - results.skippedTools}) passed validation!`);
    } else {
      log.error(`${results.failedTools} tools failed validation tests`);
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