#!/usr/bin/env node

/**
 * Simulates Claude Desktop's parameter format with backtick-wrapped keys
 * This is a simplified test script to isolate the specific format issue
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a timestamp for the log files
const timestamp = new Date().toISOString().replace(/:/g, '-');

// Create a test JSON file with backtick-wrapped parameter format
const testJsonFilePath = path.join(logsDir, 'backtick-format.json');

// Use JSON.stringify to create a proper JSON string, then manually replace the key for testing
let jsonContent = JSON.stringify({ freeformquery: "Katja" }, null, 2);
jsonContent = jsonContent.replace('"freeformquery"', '"`freeformquery`"');

// Write the test file
fs.writeFileSync(testJsonFilePath, jsonContent);
console.log(`Created test file: ${testJsonFilePath}`);
console.log('Test file contents:');
console.log(fs.readFileSync(testJsonFilePath, 'utf8'));

// Start the MCP server in the background
console.log('Starting MCP server in the background...');
const serverProcess = execSync('node dist/index.js > server-log-backtick.txt 2>&1 &');

// Wait for the server to start
console.log('Waiting for server to start...');
execSync('sleep 3');

// Now test with the cloze_find_people endpoint directly
console.log('Testing directly with cloze_find_people...');
try {
  // Wrap the parameter in the MCP format
  const mcpParamPath = path.join(logsDir, 'mcp-backtick-format.json');
  fs.writeFileSync(mcpParamPath, JSON.stringify({
    tool: "mcp__cloze__cloze_find_people",
    params: JSON.parse(jsonContent)
  }, null, 2));
  
  // Execute the request
  const response = execSync(`curl -s -X POST -H "Content-Type: application/json" -d @${mcpParamPath} http://localhost:3000/execute`).toString();
  
  // Save and display the response
  const responsePath = path.join(logsDir, `backtick-response-${timestamp}.json`);
  fs.writeFileSync(responsePath, response);
  
  console.log('Response received:');
  console.log(response);
  console.log(`Response saved to: ${responsePath}`);
} catch (error) {
  console.error('Error sending request:', error.message);
} finally {
  // Kill the server
  console.log('Killing the server...');
  try {
    execSync('pkill -f "node dist/index.js"');
  } catch (error) {
    console.log('Note: Server might have already exited');
  }
}

console.log('Test completed');