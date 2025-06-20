/**
 * MCP server implementation for Cloze CRM
 * Sets up the server and registers tools
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
/**
 * Create and configure the MCP server
 */
export declare const createServer: () => McpServer;
/**
 * Connect the server to the transport
 */
export declare const connectServer: (server: McpServer) => Promise<void>;
/**
 * Register a single tool with the server
 * Following the reference implementation pattern
 */
export declare const registerTool: (server: McpServer, name: string, description: string, paramSchema: any, handler: any) => void;
/**
 * Create a simple debug tool to help diagnose parameter passing issues
 */
export declare const createDebugTool: (server: McpServer) => void;
/**
 * Register all tools with the server
 */
export declare const registerTools: (server: McpServer) => void;
declare const _default: {
    createServer: () => McpServer;
    connectServer: (server: McpServer) => Promise<void>;
    registerTools: (server: McpServer) => void;
    registerTool: (server: McpServer, name: string, description: string, paramSchema: any, handler: any) => void;
};
export default _default;
