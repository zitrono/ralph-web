#!/usr/bin/env node

/**
 * Parameter format comparison utility
 * 
 * This script demonstrates and compares different parameter formats
 * used by Claude Desktop and other clients when calling the MCP server.
 */

const fs = require('fs');
const path = require('path');

// Ensure debug directories exist
const paramDebugDir = path.join(__dirname, 'logs', 'param-debug');
if (!fs.existsSync(paramDebugDir)) {
  fs.mkdirSync(paramDebugDir, { recursive: true });
}

// Create a timestamp for the log files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputFile = path.join(paramDebugDir, `format-comparison-${timestamp}.json`);

// The different parameter formats we observe
const formats = {
  // Format 1: Claude Desktop directly passes the parameter object
  claudeDesktopFormat: {
    freeformquery: "test@example.com"
  },
  
  // Format 2: Standard MCP format with params object
  standardMCPFormat: {
    params: {
      freeformquery: "test@example.com"
    }
  },
  
  // Format 3: Another variant sometimes seen
  nestedParamsFormat: {
    tool: "mcp__cloze__cloze_find_people",
    params: {
      freeformquery: "test@example.com"
    }
  },
  
  // Format 4: The format our direct tool implementation expects
  directToolFormat: {
    freeformquery: "test@example.com"
  }
};

// Save all formats for comparison
fs.writeFileSync(
  outputFile,
  JSON.stringify(formats, null, 2)
);

console.log("Parameter format comparison saved to:", outputFile);
console.log("\nFormat comparison:");
console.log(JSON.stringify(formats, null, 2));

console.log("\nPossible solutions:");
console.log("1. Update param_validation.ts to handle Claude Desktop format");
console.log("2. Use direct tool implementation that bypasses schema validation");
console.log("3. Standardize parameter handling across all implementations");