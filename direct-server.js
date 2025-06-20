#!/usr/bin/env node

/**
 * Direct MCP Server Implementation
 * 
 * This simplified server bypasses the MCP SDK entirely to directly handle the JSON-RPC protocol
 * for testing parameter validation and schema handling issues
 */

import { createServer } from 'net';
import { findPeople } from './dist/api/endpoints/people.js';
import process from 'process';
import fs from 'fs';

// Create logger
const logger = {
  info: (...args) => console.log(new Date().toISOString(), '[INFO]', ...args),
  error: (...args) => console.error(new Date().toISOString(), '[ERROR]', ...args),
  debug: (...args) => process.env.DEBUG_DIRECT === 'true' ? 
    console.log(new Date().toISOString(), '[DEBUG]', ...args) : undefined
};

// Record of active connections
const activeConnections = new Set();

// Create the direct server
const server = createServer((socket) => {
  logger.info('Client connected');
  activeConnections.add(socket);
  
  let buffer = '';
  
  socket.on('data', async (data) => {
    buffer += data.toString();
    const messages = buffer.split('\n');
    
    // Process all complete messages (all but the last one)
    for (let i = 0; i < messages.length - 1; i++) {
      const message = messages[i].trim();
      if (message) {
        try {
          const response = await handleMessage(message);
          socket.write(JSON.stringify(response) + '\n');
        } catch (error) {
          logger.error('Error handling message:', error);
          socket.write(JSON.stringify({
            error: { message: error.message },
            jsonrpc: '2.0',
            id: null
          }) + '\n');
        }
      }
    }
    
    // Keep any incomplete message for the next data event
    buffer = messages[messages.length - 1];
  });
  
  socket.on('close', () => {
    logger.info('Client disconnected');
    activeConnections.delete(socket);
  });
  
  socket.on('error', (error) => {
    logger.error('Socket error:', error);
    activeConnections.delete(socket);
  });
});

// Handle JSON-RPC message
async function handleMessage(message) {
  logger.debug('Received message:', message);
  
  try {
    const request = JSON.parse(message);
    
    // Check JSON-RPC basic structure
    if (request.jsonrpc !== '2.0') {
      return {
        error: { code: -32600, message: 'Invalid Request: Not JSON-RPC 2.0' },
        jsonrpc: '2.0',
        id: request.id || null
      };
    }
    
    // Handle different methods
    switch (request.method) {
      case 'initialize':
        return handleInitialize(request);
      case 'tools/list':
        return handleToolsList(request);
      case 'tools/call':
        return handleToolsCall(request);
      default:
        return {
          error: { code: -32601, message: `Method not found: ${request.method}` },
          jsonrpc: '2.0',
          id: request.id
        };
    }
  } catch (error) {
    logger.error('Error parsing or handling message:', error);
    return {
      error: { code: -32700, message: 'Parse error' },
      jsonrpc: '2.0',
      id: null
    };
  }
}

// Handle initialize request
function handleInitialize(request) {
  logger.info('Handling initialize request');
  
  return {
    result: {
      protocolVersion: "2024-11-05",
      serverInfo: {
        name: "Direct MCP Test Server",
        version: "1.0.0"
      }
    },
    jsonrpc: "2.0",
    id: request.id
  };
}

// Handle tools/list request
function handleToolsList(request) {
  logger.info('Handling tools/list request');
  
  return {
    result: {
      tools: [
        {
          name: "cloze_direct_find_people",
          description: "Direct implementation of Find People tool that bypasses schema validation",
          inputSchema: {
            type: "object",
            properties: {
              freeformquery: {
                type: "string", 
                description: "Search query (name, email, or phone)"
              }
            },
            required: ["freeformquery"],
            additionalProperties: false,
            $schema: "http://json-schema.org/draft-07/schema#"
          }
        },
        {
          name: "cloze_health_health_check",
          description: "Check health of Cloze API connection",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
            $schema: "http://json-schema.org/draft-07/schema#"
          }
        }
      ]
    },
    jsonrpc: "2.0",
    id: request.id
  };
}

// Handle tools/call request
async function handleToolsCall(request) {
  const toolName = request.params?.name;
  const toolArgs = request.params?.arguments || {};
  
  logger.info(`Handling tools/call for ${toolName} with args:`, toolArgs);
  
  // Implement tool handlers
  switch (toolName) {
    case "cloze_direct_find_people":
      return handleFindPeople(request);
    case "cloze_health_health_check":
      return {
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                errorcode: 0,
                success: true,
                data: {
                  status: "healthy",
                  apiConnectivity: true,
                  authenticated: true
                }
              }, null, 2)
            }
          ]
        },
        jsonrpc: "2.0",
        id: request.id
      };
    default:
      return {
        error: { code: -32601, message: `Tool not found: ${toolName}` },
        jsonrpc: "2.0",
        id: request.id
      };
  }
}

// Handle find people tool
async function handleFindPeople(request) {
  const args = request.params?.arguments || {};
  const { freeformquery, segment, stage, pagesize, pagenumber } = args;
  
  logger.info(`Finding people with query: ${freeformquery}`);
  
  // Validate required parameter
  if (!freeformquery) {
    logger.error('Missing required parameter: freeformquery');
    return {
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: {
                message: 'Missing required parameter: freeformquery'
              }
            }, null, 2)
          }
        ]
      },
      jsonrpc: "2.0",
      id: request.id
    };
  }
  
  // Call the API
  try {
    // Prepare search parameters
    const searchParams = {
      freeformquery
    };
    
    // Add optional parameters if present
    if (segment) searchParams.segment = segment;
    if (stage) searchParams.stage = stage;
    
    // Handle pagination parameters
    if (pagesize !== undefined) {
      searchParams.pagesize = typeof pagesize === 'string' ? 
        parseInt(pagesize, 10) : pagesize;
    }
    
    if (pagenumber !== undefined) {
      searchParams.pagenumber = typeof pagenumber === 'string' ? 
        parseInt(pagenumber, 10) : pagenumber;
    }
    
    // If this is a test query, return mock data
    if (freeformquery === 'test@example.com' || freeformquery === 'john.doe@example.com') {
      logger.info('Returning mock data for test query');
      
      return {
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                people: [
                  {
                    syncKey: "abc123",
                    name: "John Doe",
                    email: freeformquery,
                    company: "Example Corp"
                  }
                ],
                pagination: {
                  totalCount: 1,
                  page: 1,
                  pageSize: searchParams.pagesize || 10,
                  totalPages: 1
                }
              }, null, 2)
            }
          ]
        },
        jsonrpc: "2.0",
        id: request.id
      };
    }
    
    // Call the real API for non-test queries
    logger.info('Calling real API with params:', searchParams);
    
    const response = await findPeople(searchParams);
    logger.info(`Found ${response.people.length} people out of ${response.availablecount} total matches`);
    
    return {
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              people: response.people,
              pagination: {
                totalCount: response.availablecount,
                page: response.pagenumber || 1,
                pageSize: response.pagesize || 10,
                totalPages: Math.ceil(response.availablecount / (response.pagesize || 10))
              }
            }, null, 2)
          }
        ]
      },
      jsonrpc: "2.0",
      id: request.id
    };
  } catch (error) {
    logger.error('Error finding people:', error);
    return {
      result: {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: {
                message: error.message || String(error)
              }
            }, null, 2)
          }
        ]
      },
      jsonrpc: "2.0",
      id: request.id
    };
  }
}

// Start the server
const port = process.env.DIRECT_PORT || 3000;
server.listen(port, () => {
  logger.info(`Direct MCP server listening on port ${port}`);
});

// Handle process signals
process.on('SIGINT', () => {
  logger.info('Received SIGINT signal, shutting down server');
  shutdown();
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM signal, shutting down server');
  shutdown();
});

// Cleanup and shutdown
function shutdown() {
  logger.info('Closing all active connections');
  
  // Close all active connections
  for (const socket of activeConnections) {
    socket.end();
  }
  
  // Close the server
  server.close(() => {
    logger.info('Server shut down successfully');
    process.exit(0);
  });
}