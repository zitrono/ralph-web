#!/usr/bin/env node

/**
 * Claude Desktop Parameter Format Debug Tool
 * 
 * This script helps debug the exact parameter format that Claude Desktop sends.
 * It sets up a simple HTTP server that logs incoming requests from Claude Desktop.
 * 
 * Usage:
 * 1. Run this script: node claude-desktop-debug.js
 * 2. Update your Claude Desktop config to point to this server instead of the normal MCP server
 * 3. Try a cloze_find_people request in Claude Desktop
 * 4. Check the console output and log file for the exact parameter format
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a timestamp for the log files
const timestamp = new Date().toISOString().replace(/:/g, '-');
const logFile = path.join(logsDir, `claude-desktop-params-${timestamp}.json`);

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  let body = '';
  
  // Collect request body data
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  
  // Process the request
  req.on('end', () => {
    console.log('===== Received request =====');
    console.log(`URL: ${req.url}`);
    console.log(`Method: ${req.method}`);
    console.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
    
    let jsonBody;
    try {
      jsonBody = JSON.parse(body);
      console.log('Request Body (parsed):');
      console.log(JSON.stringify(jsonBody, null, 2));
      
      // Save request to log file
      fs.writeFileSync(logFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: jsonBody
      }, null, 2));
      
      console.log(`Request logged to: ${logFile}`);
      
      // Check if this is a find_people request
      if (jsonBody.tool === 'mcp__cloze__cloze_find_people' || jsonBody.name === 'cloze_find_people') {
        console.log('===== FIND PEOPLE REQUEST DETECTED =====');
        console.log('Parameters:');
        console.log(JSON.stringify(jsonBody.params || jsonBody.parameters, null, 2));
        
        // Save find_people specific log
        const findPeopleLogFile = path.join(logsDir, `find-people-params-${timestamp}.json`);
        fs.writeFileSync(findPeopleLogFile, JSON.stringify({
          timestamp: new Date().toISOString(),
          params: jsonBody.params || jsonBody.parameters,
          fullRequest: jsonBody
        }, null, 2));
        
        console.log(`Find People parameters logged to: ${findPeopleLogFile}`);
      }
    } catch (error) {
      console.error('Error parsing request body:', error);
      console.log('Raw request body:', body);
    }
    
    // Send a mock response
    const mockResponse = {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            message: "Debug server received your request. Check server logs for parameter format."
          })
        }
      ]
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockResponse));
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Parameter debug server running at http://localhost:${PORT}`);
  console.log(`Waiting for Claude Desktop requests...`);
  console.log(`Log file will be saved to: ${logFile}`);
});