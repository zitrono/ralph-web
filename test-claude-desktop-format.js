#!/usr/bin/env node

/**
 * Simulates Claude Desktop's parameter format
 * Creates a specific test to handle the backtick-wrapped parameter format
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

// Create a timestamp for log files
const timestamp = new Date().toISOString().replace(/:/g, '-');

// Create a test file with the backtick format parameters
const testParams = {
  '`freeformquery`': 'Katja'
};

// Also create a version with tool wrapper
const wrappedTestParams = {
  tool: 'cloze_find_people',
  params: {
    '`freeformquery`': 'Katja'
  }
};

const testFilePath = path.join(logsDir, 'claude-desktop-backtick-params.json');
fs.writeFileSync(testFilePath, JSON.stringify(testParams, null, 2));
console.log(`Created test parameters file: ${testFilePath}`);
console.log('Test Parameters:', JSON.stringify(testParams, null, 2));

const wrappedTestFilePath = path.join(logsDir, 'claude-desktop-wrapped-params.json');
fs.writeFileSync(wrappedTestFilePath, JSON.stringify(wrappedTestParams, null, 2));
console.log(`Created wrapped test parameters file: ${wrappedTestFilePath}`);

// Create a parameter format with "tool" syntax
const toolTestParams = {
  tool: "cloze_find_people",
  params: {
    freeformquery: "Katja"
  }
};
const toolTestFilePath = path.join(logsDir, 'tool-params.json');
fs.writeFileSync(toolTestFilePath, JSON.stringify(toolTestParams, null, 2));

// Start the server in another process
console.log('Starting server in the background...');
const startServerCmd = 'node dist/index.js > server-log.txt 2>&1 &';
execSync(startServerCmd);

// Give the server time to start
console.log('Waiting for server to start...');
execSync('sleep 3');

// Try with the wrapped tool format first
console.log('Testing with wrapped tool format...');
const wrappedCurlCmd = `curl -s -X POST -H "Content-Type: application/json" -d @${wrappedTestFilePath} http://localhost:3000/execute`;
try {
  const wrappedResponse = execSync(wrappedCurlCmd).toString();
  console.log('Response for wrapped format:');
  console.log(wrappedResponse);
  
  // Save to file
  fs.writeFileSync(path.join(logsDir, `wrapped-response-${timestamp}.json`), wrappedResponse);
} catch (error) {
  console.error('Error testing wrapped format:', error.message);
}

// Try with the tool parameter format
console.log('Testing with tool parameter format...');
const toolCurlCmd = `curl -s -X POST -H "Content-Type: application/json" -d @${toolTestFilePath} http://localhost:3000/execute`;
try {
  const toolResponse = execSync(toolCurlCmd).toString();
  console.log('Response for tool format:');
  console.log(toolResponse);
  
  // Save to file
  fs.writeFileSync(path.join(logsDir, `tool-response-${timestamp}.json`), toolResponse);
} catch (error) {
  console.error('Error testing tool format:', error.message);
}

// Create a test specifically for the cloze_debug_params tool
const debugParams = {
  tool: "cloze_debug_params",
  params: testParams  // Use the backtick format parameters
};
const debugParamsPath = path.join(logsDir, 'debug-params.json');
fs.writeFileSync(debugParamsPath, JSON.stringify(debugParams, null, 2));

// Run the debug tool to see exact parameter structure
console.log('Testing with debug tool...');
const debugCurlCmd = `curl -s -X POST -H "Content-Type: application/json" -d @${debugParamsPath} http://localhost:3000/execute`;
try {
  const debugResponse = execSync(debugCurlCmd).toString();
  console.log('Debug tool response:');
  console.log(debugResponse);
  
  // Save to file
  fs.writeFileSync(path.join(logsDir, `debug-response-${timestamp}.json`), debugResponse);
} catch (error) {
  console.error('Error testing debug tool:', error.message);
}

// Clean up
try {
  console.log('Killing the server...');
  execSync('pkill -f "node dist/index.js" || true');
} catch (error) {
  console.log('Note: Server process may have already terminated');
}

console.log('Test completed');