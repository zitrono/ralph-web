#!/usr/bin/env node

/**
 * Parameter Format Test Script
 * 
 * This script tests different parameter formats with the Cloze MCP server
 * to help diagnose parameter handling issues with different clients.
 */

import { spawn } from 'child_process';
import process from 'process';
import fs from 'fs';
import path from 'path';

// Default configuration
const config = {
  serverPath: path.resolve('./dist/index.js'),
  toolName: 'cloze_find_people',
  searchQuery: 'test@example.com',
  timeout: 20000, // 20 seconds
  debugOutput: true
};

// Ensure the logs directory exists
const logsDir = path.resolve('./logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create log files
const logFile = path.join(logsDir, `param-test-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);
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

log('Starting Parameter Format Test');
log(`Server path: ${config.serverPath}`);
log(`Tool: ${config.toolName}`);
log(`Search query: ${config.searchQuery}`);

// Start the MCP server
log('Spawning MCP server process');
const server = spawn('node', [config.serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    DEBUG_SCHEMA: 'true',
    DEBUG_CLOZE: 'true',
    DEBUG_PARAMS: 'true'
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

// Send initialization request
function sendInitialize() {
  log('Sending initialize request');
  
  const initRequest = {
    jsonrpc: "2.0", 
    method: "initialize", 
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "param-format-test", version: "1.0.0" }
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

// Define different parameter formats to test
const parameterFormats = [
  {
    name: "direct",
    format: {
      freeformquery: config.searchQuery
    }
  },
  {
    name: "mcp",
    format: {
      arguments: {
        freeformquery: config.searchQuery
      }
    }
  },
  {
    name: "claude_desktop",
    format: {
      name: config.toolName,
      parameters: {
        freeformquery: config.searchQuery
      }
    }
  },
  {
    name: "backtick_wrapped",
    format: {}
  }
];

// Create the backtick-wrapped format dynamically
// We can't include literal backticks in the JSON, so we'll create a string and manipulate it
let backtickJson = JSON.stringify({ 
  freeformquery: config.searchQuery 
});
// Replace the normal quotes with backtick quotes
backtickJson = backtickJson.replace(/"freeformquery"/, '"`freeformquery`"');
backtickJson = backtickJson.replace(/"test@example.com"/, '`test@example.com`');
// Store the manipulated string to be sent directly
parameterFormats[3].rawJson = backtickJson;

// Send tool calls with different parameter formats
function sendParameterFormatTests() {
  parameterFormats.forEach((format, index) => {
    setTimeout(() => {
      log(`Testing parameter format: ${format.name}`);
      
      const requestId = index + 2;
      let callRequest;
      
      // Special handling for backtick format since we can't represent it directly in JS
      if (format.name === "backtick_wrapped") {
        log(`Using raw JSON string for backtick format: ${format.rawJson}`);
        
        // Create the request template
        const requestTemplate = {
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: config.toolName
          },
          id: requestId
        };
        
        // Convert to string and replace the empty arguments with our backtick JSON
        let rawRequest = JSON.stringify(requestTemplate);
        rawRequest = rawRequest.replace(/"params":{"name":"cloze_find_people"}/, 
          `"params":{"name":"cloze_find_people","arguments":${format.rawJson}}`);
        
        log(`Sending backtick request: ${rawRequest}`);
        server.stdin.write(rawRequest + '\n');
      } else {
        // Regular formats
        callRequest = {
          jsonrpc: "2.0",
          method: "tools/call",
          params: {
            name: config.toolName,
            ...format.format
          },
          id: requestId
        };
        
        log(`Sending ${format.name} format request: ${JSON.stringify(callRequest, null, 2)}`);
        server.stdin.write(JSON.stringify(callRequest) + '\n');
      }
    }, 1000 + (index * 1500)); // More spacing between calls to avoid race conditions
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
setTimeout(sendParameterFormatTests, 3000);

// Terminate the server after tests complete
setTimeout(() => {
  log('Tests completed, terminating server');
  clearTimeout(timeoutId);
  cleanup();
}, 12000); // Allow extra time for all formats to be tested