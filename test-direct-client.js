#!/usr/bin/env node

/**
 * Direct MCP Client Test Script
 * 
 * Tests the interaction with our direct MCP server implementation
 */

import net from 'net';
import process from 'process';

// Default configuration
const config = {
  serverHost: 'localhost',
  serverPort: 3000,
  toolCalls: [
    'cloze_direct_find_people?freeformquery=test@example.com',
    'cloze_direct_find_people', // This should fail with a validation error for missing required param
    'cloze_direct_find_people?freeformquery=john.doe@example.com&pagesize=5',
    'cloze_health_health_check'
  ],
  timeout: 10000, // 10 seconds
  debugOutput: true
};

// Logger
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

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

// Connect to the server
log(`Connecting to MCP server at ${config.serverHost}:${config.serverPort}`);

const client = net.createConnection({
  host: config.serverHost,
  port: config.serverPort
}, () => {
  log('Connected to server');
  
  // Send initialization request
  log('Sending initialize request');
  
  const initRequest = {
    jsonrpc: "2.0", 
    method: "initialize", 
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "direct-mcp-test", version: "1.0.0" }
    },
    id: 0
  };
  
  client.write(JSON.stringify(initRequest) + '\n');
});

// Handle data from the server
let responseBuffer = '';

client.on('data', (data) => {
  responseBuffer += data.toString();
  const responses = responseBuffer.split('\n');
  
  // Process all complete responses
  for (let i = 0; i < responses.length - 1; i++) {
    const response = responses[i].trim();
    if (response) {
      try {
        const parsed = JSON.parse(response);
        log(`SERVER RESPONSE: ${JSON.stringify(parsed, null, 2)}`);
        
        handleResponse(parsed);
      } catch (e) {
        log(`SERVER RAW OUTPUT: ${response}`);
      }
    }
  }
  
  // Keep any incomplete response
  responseBuffer = responses[responses.length - 1];
});

// Track request IDs and their corresponding tool calls
const pendingRequests = new Map();
let currentToolCallIndex = 0;

// Handle response from the server
function handleResponse(response) {
  // If we received the initialize response, send tools/list
  if (response.id === 0) {
    log('Received initialize response, sending tools/list');
    
    const listRequest = {
      jsonrpc: "2.0",
      method: "tools/list",
      params: {},
      id: 1
    };
    
    client.write(JSON.stringify(listRequest) + '\n');
  }
  
  // If we received the tools/list response, start sending tool calls
  if (response.id === 1) {
    log('Received tools/list response, starting tool calls');
    sendNextToolCall();
  }
  
  // If this is a response to a tool call, send the next one
  if (response.id > 1 && pendingRequests.has(response.id)) {
    const toolCall = pendingRequests.get(response.id);
    log(`Received response for ${toolCall}`);
    pendingRequests.delete(response.id);
    
    // Send the next tool call
    sendNextToolCall();
  }
}

// Send the next tool call in the sequence
function sendNextToolCall() {
  if (currentToolCallIndex < config.toolCalls.length) {
    const toolCallStr = config.toolCalls[currentToolCallIndex];
    const { tool, params } = parseToolCall(toolCallStr);
    
    log(`Sending tools/call request for ${tool} with params: ${JSON.stringify(params)}`);
    
    const requestId = currentToolCallIndex + 2; // Start at 2, after initialize and tools/list
    
    const callRequest = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: tool,
        arguments: params
      },
      id: requestId
    };
    
    // Store the pending request
    pendingRequests.set(requestId, toolCallStr);
    
    // Send the request
    client.write(JSON.stringify(callRequest) + '\n');
    
    // Increment the index for the next call
    currentToolCallIndex++;
  } else {
    log('All tool calls completed, disconnecting');
    setTimeout(() => {
      client.end();
    }, 1000);
  }
}

// Handle errors
client.on('error', (error) => {
  log(`CLIENT ERROR: ${error.message}`);
  process.exit(1);
});

// Handle close
client.on('close', () => {
  log('Connection to server closed');
  process.exit(0);
});

// Set up a timeout
setTimeout(() => {
  log(`Test timeout reached (${config.timeout}ms)`);
  client.end();
  process.exit(1);
}, config.timeout);