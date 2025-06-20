#!/usr/bin/env node

/**
 * Cloze CRM MCP Server
 * Main entry point that initializes the server
 */

import logger from './logging.js';
import config from './config.js';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createServer, connectServer, registerTools, registerTool } from './server.js';

/**
 * Main function to start the server
 */
async function main() {
  try {
    // Log startup information
    logger.info('Starting Cloze CRM MCP server...');
    logger.info(`Environment: MCP Mode: ${config.environment.isMcpMode}, Claude Desktop: ${config.environment.isClaudeDesktop}`);
    
    // Create the server
    const server = createServer();
    
    // Register tools with the server (synchronously)
    logger.info('Registering tools with the server (pre-connection)');
    await registerToolsSync(server);
    
    // Short delay to ensure tools are fully registered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Connect the server to the transport
    await connectServer(server);
    
    logger.info('Cloze CRM MCP server initialized and ready');
  } catch (error) {
    logger.error('Failed to start Cloze CRM MCP server:', error);
    process.exit(1);
  }
}

/**
 * Register tools synchronously with the server
 * This ensures all tools are registered before the server starts
 */
async function registerToolsSync(server: McpServer): Promise<void> {
  // Import tool modules directly (no dynamic imports)
  const tools = [
    { 
      path: './tools/cloze_create_people.js',
      name: 'cloze_create_people'
    },
    { 
      path: './tools/cloze_find_people.js',
      name: 'cloze_find_people'
    },
    { 
      path: './tools/cloze_update_people.js',
      name: 'cloze_update_people'
    },
    { 
      path: './tools/cloze_delete_people.js',
      name: 'cloze_delete_people'
    },
    // Add other tools here as needed
  ];
  
  // Register each tool
  for (const tool of tools) {
    try {
      const module = await import(tool.path);
      registerTool(server, module.metadata.name, module.metadata.description, {}, module.default);
      logger.info(`Registered tool: ${module.metadata.name}`);
    } catch (error) {
      logger.error(`Failed to register tool ${tool.name}:`, error);
    }
  }
  
  // Also register tools the original way as a fallback
  registerTools(server);
}

// Start the server
main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});