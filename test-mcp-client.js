#!/usr/bin/env node

/**
 * MCP Client Test Script
 * 
 * Tests the interaction between the MCP client and server
 * Verifies parameter validation and schema handling
 */

import { spawn } from 'child_process';
import process from 'process';
import fs from 'fs';
import path from 'path';

// Default configuration
const config = {
  serverPath: path.resolve('./dist/index.js'),
  toolCalls: [
    'cloze_debug_params?test=value&num=123',
    'cloze_direct_find_people?freeformquery=test@example.com',
    'cloze_direct_find_people', // This should fail with a validation error for missing required param
    'cloze_direct_find_people?freeformquery=john.doe@example.com&pagesize=5',
    'cloze_health_health_check'
  ],
  timeout: 20000, // 20 seconds
  debugOutput: true
};

// Get tool calls from command line arguments if provided
if (process.argv.length > 2) {
  config.toolCalls = process.argv.slice(2);
}

// Ensure the logs directory exists
const logsDir = path.resolve('./logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log files
const logFile = path.join(logsDir, `mcp-test-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
const logStream = fs.createWriteStream(logFile);

// Log to console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  
  if (config.debugOutput) {
    console.log(formattedMessage);
  }
  
  logStream.write(formattedMessage + '\n');
}

log('Starting MCP server test');
log(`Server path: ${config.serverPath}`);
log(`Tool calls: ${config.toolCalls.join(', ')}`);

// Start the MCP server
log('Spawning MCP server process');
const server = spawn('node', [config.serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    DEBUG_SCHEMA: 'true',
    DEBUG_CLOZE: 'true'
  }
});

// Handle server output
server.stdout.on('data', (data) => {
  const responses = data.toString().trim().split('\n').filter(line => line.trim() !== '');
  
  responses.forEach(response => {
    try {
      const parsed = JSON.parse(response);
      log(`SERVER RESPONSE: ${JSON.stringify(parsed, null, 2)}`);
    } catch (e) {
      log(`SERVER RAW OUTPUT: ${response}`);
    }
  });
});

// Handle server stderr
server.stderr.on('data', (data) => {
  log(`SERVER LOG: ${data.toString().trim()}`);
});

// Handle errors
server.on('error', (error) => {
  log(`SERVER ERROR: ${error.message}`);
  cleanup();
});

// Handle server exit
server.on('exit', (code, signal) => {
  log(`SERVER EXITED: code=${code}, signal=${signal}`);
  cleanup();
});

// Parse tool call string into tool name and params
function parseToolCall(toolCallStr) {
  const [toolName, paramsStr] = toolCallStr.split('?');
  const params = {};
  
  if (paramsStr) {
    paramsStr.split('&').forEach(param => {
      const [key, value] = param.split('=');
      params[key] = value;
    });
  }
  
  return { tool: toolName, params };
}

// Send initialization request
function sendInitialize() {
  log('Sending initialize request');
  
  const initRequest = {
    jsonrpc: "2.0", 
    method: "initialize", 
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "cloze-mcp-test", version: "1.0.0" }
    },
    id: 0
  };

  server.stdin.write(JSON.stringify(initRequest) + '\n');
}

// Send tools/list request
function sendToolsList() {
  log('Sending tools/list request');
  
  const listRequest = {
    jsonrpc: "2.0",
    method: "tools/list",
    params: {},
    id: 1
  };

  server.stdin.write(JSON.stringify(listRequest) + '\n');
}

// Send tool call requests
function sendToolCalls() {
  config.toolCalls.forEach((toolCallStr, index) => {
    setTimeout(() => {
      const { tool, params } = parseToolCall(toolCallStr);
      log(`Sending tools/call request for ${tool} with params: ${JSON.stringify(params)}`);
      
      // For our direct implementation, explicitly use the right format
      if (tool === 'cloze_direct_find_people') {
        const callRequest = {
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: tool,
            arguments: params
          },
          id: index + 2
        };
        
        log(`Using standard MCP format for direct tool: ${JSON.stringify(callRequest, null, 2)}`);
        server.stdin.write(JSON.stringify(callRequest) + '\n');
      } else {
        // Regular format for other tools
        const callRequest = {
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: tool,
            arguments: params
          },
          id: index + 2
        };
        server.stdin.write(JSON.stringify(callRequest) + '\n');
      }
    }, 1000 + (index * 1000));
  });
}

// Clean up and exit
function cleanup() {
  log('Cleaning up');
  
  try {
    server.kill();
  } catch (e) {
    // Ignore errors when killing the server
  }
  
  // Close the log stream
  logStream.end();
  
  // Exit after a short delay to ensure logs are written
  setTimeout(() => {
    log('Test completed');
    process.exit(0);
  }, 500);
}

// Handle process signals
process.on('SIGINT', () => {
  log('Received SIGINT signal');
  cleanup();
});

process.on('SIGTERM', () => {
  log('Received SIGTERM signal');
  cleanup();
});

// Set up a timeout
const timeoutId = setTimeout(() => {
  log(`Test timeout reached (${config.timeout}ms)`);
  cleanup();
}, config.timeout);

// Run the test sequence
setTimeout(sendInitialize, 1000);
setTimeout(sendToolsList, 2000);
setTimeout(sendToolCalls, 3000);

// Terminate the server after tests complete
setTimeout(() => {
  log('Tests completed, terminating server');
  clearTimeout(timeoutId);
  cleanup();
}, 3000 + (config.toolCalls.length * 1000) + 2000);