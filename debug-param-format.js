#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure debug directories exist
const paramDebugDir = path.join(__dirname, 'logs', 'param-debug');
if (!fs.existsSync(paramDebugDir)) {
  fs.mkdirSync(paramDebugDir, { recursive: true });
}

// Create a timestamp for the log files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFile = path.join(paramDebugDir, `param-debug-${timestamp}.json`);

// Simulate Claude Desktop format parameter call to debug_params tool
const claudeDesktopFormat = {
  freeformquery: "test@example.com"
};

console.log("Testing cloze_debug_params with Claude Desktop format:");
console.log(JSON.stringify(claudeDesktopFormat, null, 2));

// Write the input format to a log file
fs.writeFileSync(
  path.join(paramDebugDir, `input-${timestamp}.json`), 
  JSON.stringify(claudeDesktopFormat, null, 2)
);

try {
  // Execute the debug params tool directly
  // This will require the server to be running separately
  const result = execSync(`curl -s -X POST -H "Content-Type: application/json" -d '${JSON.stringify({
    tool: "mcp__cloze__cloze_debug_params",
    params: claudeDesktopFormat
  })}' http://localhost:3000/execute`);
  
  // Parse and save the response
  const response = result.toString();
  console.log("Response:", response);
  fs.writeFileSync(logFile, response);
  console.log(`Debug output saved to: ${logFile}`);
  
  // Also try direct_find_people which bypasses schema validation
  console.log("\nTesting cloze_direct_find_people with same format:");
  const directResult = execSync(`curl -s -X POST -H "Content-Type: application/json" -d '${JSON.stringify({
    tool: "mcp__cloze__cloze_direct_find_people",
    params: claudeDesktopFormat
  })}' http://localhost:3000/execute`);
  
  const directResponse = directResult.toString();
  console.log("Direct response:", directResponse);
  fs.writeFileSync(
    path.join(paramDebugDir, `direct-${timestamp}.json`), 
    directResponse
  );
  
} catch (error) {
  console.error("Error executing the debug tool:", error.message);
  fs.writeFileSync(
    path.join(paramDebugDir, `error-${timestamp}.log`), 
    error.toString()
  );
}

// Also create a test script with standard parameter format for comparison
const standardFormat = {
  params: {
    freeformquery: "test@example.com"
  }
};

fs.writeFileSync(
  path.join(paramDebugDir, `standard-format-${timestamp}.json`), 
  JSON.stringify(standardFormat, null, 2)
);

console.log("\nAlso created standard format example for comparison.");
console.log("Make sure the MCP server is running when executing this script.");
console.log("Run with: node debug-param-format.js");