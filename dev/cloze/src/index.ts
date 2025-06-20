#!/usr/bin/env node
/**
 * Cloze MCP Server for Claude Desktop Integration
 * 
 * This implementation follows a domain-driven architecture with tools
 * organized by business domain and utility function for improved
 * maintainability and clearer organization.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './core/utils/logger.js';
import { initializeApi } from './core/api/init.js';
import { storeToolCall } from './core/utils/mcp-server-hook.js';
import { applyDirectArgumentFix } from './core/utils/direct-fix.js';

// Import the new domain-driven architecture tools registration
import { registerAllTools } from './tools/index.js';

// Set environment variable to indicate we're running in Claude Desktop mode
process.env.CLAUDE_DESKTOP = 'true';

// Configure process to handle errors without crashing
process.on('uncaughtException', (err) => {
  // Log to stderr to avoid corrupting stdout JSON communication
  console.error(`[${new Date().toISOString()}] [ERROR] [cloze] Uncaught exception: ${err instanceof Error ? err.message : String(err)}`);
  if (err instanceof Error && err.stack) {
    console.error(`[${new Date().toISOString()}] [ERROR] [cloze] Stack trace: ${err.stack}`);
  }
  // Don't exit on uncaught exceptions
});

process.on('unhandledRejection', (reason) => {
  // Log to stderr to avoid corrupting stdout JSON communication
  console.error(`[${new Date().toISOString()}] [ERROR] [cloze] Unhandled rejection: ${String(reason)}`);
  if (reason instanceof Error && reason.stack) {
    console.error(`[${new Date().toISOString()}] [ERROR] [cloze] Stack trace: ${reason.stack}`);
  }
  // Don't exit on unhandled rejections
});

// Add signal handlers to prevent unexpected termination
process.on('SIGINT', () => {
  // Log to stderr to avoid corrupting stdout JSON communication
  console.error(`[${new Date().toISOString()}] [INFO] [cloze] Received SIGINT signal - ignoring`);
  // Don't exit
});

process.on('SIGTERM', () => {
  // Log to stderr to avoid corrupting stdout JSON communication
  console.error(`[${new Date().toISOString()}] [INFO] [cloze] Received SIGTERM signal - ignoring`);
  // Don't exit
});

// Initialize API client extensions
initializeApi();

logger.info('Starting Cloze MCP Server with domain-driven architecture...');

// Main server function
async function main() {
  try {
    // Create MCP server with proper capabilities
    const server = new McpServer({
      name: "Cloze MCP",
      version: "1.0.0",
      capabilities: {
        tools: {
          listChanged: true
        }
      }
    });

    logger.info('MCP server created successfully');

    // Apply the direct argument fix to patch the server
    // This fixes the parameter handling for Claude Desktop
    applyDirectArgumentFix(server);

    // Monkey-patch the server to intercept both tool registration and tool calls
    const registeredTools = new Set<string>();

    // Patch the tool registration method to track registered tools
    const originalTool = server.tool.bind(server);
    // Override the tool method with our own implementation
    (server as any).tool = function(name: string, description: string, parameters: any, handler: any) {
      logger.debug(`Registering tool: ${name}`);
      if (registeredTools.has(name)) {
        logger.warn(`Skipping duplicate tool registration: ${name}`);
        return; // Skip registration of duplicate tools
      }

      // Wrap the handler to capture arguments before they're passed to the real handler
      const wrappedHandler = async (args: any, context: any) => {
        // Store the tool call for retrieval by handlers
        if (context?.requestId) {
          logger.debug(`Tool called: ${name}, requestId: ${context.requestId}`);

          // Capture the tool call arguments from the original unwrapped MCP call
          // This happens at the JSON-RPC protocol layer, before our handler sees the args
          try {
            // Log more detail for debugging
            logger.debug(`Handler received args for ${name}: ${JSON.stringify(args)}`);
            logger.debug(`global.latestMcpToolCall: ${JSON.stringify(global.latestMcpToolCall || 'null')}`);

            const actualArgs = (args && typeof args === 'object' &&
                              Object.keys(args).filter(k => !['signal', 'requestId', 'authInfo'].includes(k)).length > 0)
                              ? args
                              : (global.latestMcpToolCall?.arguments || {});

            // Log the actual arguments
            logger.debug(`Tool arguments for ${name}: ${JSON.stringify(actualArgs)}`);

            // Store the arguments for retrieval
            storeToolCall(name, actualArgs);

            // Call the original handler with both arguments
            return await handler(actualArgs, context);
          } catch (error) {
            logger.error(`Error in parameter capture for ${name}: ${error instanceof Error ? error.message : String(error)}`);
            // Fall back to original behavior
            return await handler(args, context);
          }
        } else {
          // Just pass through if no request ID (e.g., during tests)
          return await handler(args, context);
        }
      };

      registeredTools.add(name);
      return originalTool(name, description, parameters, wrappedHandler);
    };

    // Add a custom function to capture tool calls by patching the server's CallToolRequestSchema handler
    const serverAny = server as any;

    // The onConnection method is called when a new transport is connected
    const originalOnConnection = serverAny.onConnection;

    serverAny.onConnection = function(transport: any) {
      // First call the original
      const result = originalOnConnection.call(this, transport);

      // Now set up a global hook to capture incoming tool calls
      const incomingMessageHandler = (message: any) => {
        try {
          if (message?.method === 'tools/call' && message?.params?.name) {
            const toolName = message.params.name;
            const args = message.params.arguments || {};
            logger.debug(`Captured tools/call for ${toolName}`);
            logger.debug(`Captured arguments: ${JSON.stringify(args)}`);

            // Create a global variable to directly store the arguments
            (global as any).latestToolArgs = args;
            (global as any).latestToolName = toolName;

            // Store parameters globally for retrieval by handlers
            storeToolCall(toolName, args);
          }
        } catch (error) {
          // Don't crash on errors
          logger.error(`Error in message capture: ${error instanceof Error ? error.message : String(error)}`);
        }
      };

      // Add our listener to the transport
      if (transport.on) {
        transport.on('message', incomingMessageHandler);
      }

      return result;
    };
    
    // Register all tools using the new architecture
    const totalTools = registerAllTools(server);
    
    // Log all registered tools
    logger.debug(`Registered tools: ${Array.from(registeredTools).join(', ')}`);
    logger.info(`Registered ${totalTools} tools`);
    
    // Setup transport
    const transport = new StdioServerTransport();
    logger.info('Transport created successfully');
    
    // Connect to the transport
    logger.info('Connecting to transport...');
    await server.connect(transport);
    
    logger.info('Server initialized and ready');

    // Keep process alive
    process.stdin.resume();
    
    // Set up heartbeat
    setInterval(() => {
      // Make sure this goes to stderr
      process.stderr.write(`[${new Date().toISOString()}] [DEBUG] [cloze] Server heartbeat\n`);
    }, 30000).unref();
  } catch (err) {
    logger.error(`Error starting server: ${err instanceof Error ? err.stack : String(err)}`);
    process.exit(1);
  }
}

// Start the server
main().catch(err => {
  logger.error(`Fatal error: ${err instanceof Error ? err.stack : String(err)}`);
  process.exit(1);
});