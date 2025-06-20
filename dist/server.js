/**
 * MCP server implementation for Cloze CRM
 * Sets up the server and registers tools
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod';
import config from './config.js';
import logger from './logging.js';
import { convertZodSchemaToJsonSchema } from './tools/utils/schema_converter.js';
/**
 * Create and configure the MCP server
 */
export const createServer = () => {
    logger.info('Creating MCP server');
    // Create the server instance with explicit Claude Desktop configuration
    const server = new McpServer({
        name: config.server.name,
        version: config.server.version,
        capabilities: {
            tools: {
                // Pre-define tool capabilities to ensure they're available when Claude Desktop connects
                cloze_create_people: {
                    enabled: true
                },
                cloze_find_people: {
                    enabled: true
                },
                cloze_update_people: {
                    enabled: true
                },
                cloze_delete_people: {
                    enabled: true
                },
                // Add other tools here in the same format
            }
        }
    });
    // Set up error handlers for the server
    setupErrorHandlers();
    logger.info('MCP server created successfully');
    return server;
};
/**
 * Set up process error handlers to prevent unexpected termination
 */
const setupErrorHandlers = () => {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        logger.error('UNCAUGHT EXCEPTION', error);
        // Don't exit
    });
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
        logger.error('UNHANDLED REJECTION', reason);
        // Don't exit
    });
    // Handle SIGINT signal
    process.on('SIGINT', () => {
        logger.info('Received SIGINT signal - ignoring');
        // Don't exit
    });
    // Handle SIGTERM signal
    process.on('SIGTERM', () => {
        logger.info('Received SIGTERM signal - ignoring');
        // Don't exit
    });
    logger.debug('Error handlers set up');
};
/**
 * Connect the server to the transport
 */
export const connectServer = async (server) => {
    logger.info('Connecting server to transport');
    try {
        // Create the transport
        const transport = new StdioServerTransport();
        // Add special event listeners to the transport if possible
        // Type check for 'on' method since StdioServerTransport might not have it
        if ('on' in transport && typeof transport.on === 'function') {
            transport.on('data', (data) => {
                logger.info('CLAUDE_DESKTOP_DEBUG: Raw transport data received:', typeof data);
                try {
                    logger.info(`CLAUDE_DESKTOP_DEBUG: Raw data content: ${JSON.stringify(data)}`);
                }
                catch (error) {
                    logger.info(`CLAUDE_DESKTOP_DEBUG: Could not stringify raw data: ${error}`);
                }
            });
            // Monkey patch the transport's send method to log outgoing data if possible
            const originalSend = transport.send;
            if (typeof originalSend === 'function') {
                transport.send = function (data) {
                    logger.info('CLAUDE_DESKTOP_DEBUG: Sending data through transport');
                    try {
                        logger.info(`CLAUDE_DESKTOP_DEBUG: Outgoing data: ${JSON.stringify(data)}`);
                    }
                    catch (error) {
                        logger.info(`CLAUDE_DESKTOP_DEBUG: Could not stringify outgoing data: ${error}`);
                    }
                    return originalSend.call(this, data);
                };
            }
        }
        // Connect the server to the transport
        await server.connect(transport);
        logger.info('Server connected to transport');
        // Patch the server's message handling if possible
        // Type-safe check for _handleMessage property which might be private/internal
        if ('_handleMessage' in server && typeof server._handleMessage === 'function') {
            const originalHandleMessage = server._handleMessage;
            server._handleMessage = function (message) {
                // Standard debug logging for all messages
                logger.info('CLAUDE_DESKTOP_DEBUG: Server handling message');
                try {
                    // Log raw message with conventional debug format
                    logger.info(`CLAUDE_DESKTOP_DEBUG: Message content: ${JSON.stringify(message)}`);
                    // Enhanced detailed logging of complete raw message object to file
                    logger.rawRequest(message, 'server-message', {
                        source: 'message_handler',
                        timestamp: new Date().toISOString(),
                        messageType: message?.type || 'unknown'
                    });
                    // Extract any tool calls for additional specialized logging
                    if (message?.type === 'tool' && message?.params?.name) {
                        const toolName = message.params.name;
                        const toolParams = message.params.params || message.params.parameters || message.params.arguments || {};
                        // Special enhanced logging for tool calls
                        logger.rawRequest(message.params, toolName, {
                            source: 'tool_call',
                            timestamp: new Date().toISOString(),
                            messageId: message.id,
                            toolName: toolName
                        });
                        logger.info(`RAW_REQUEST_DEBUG: ${toolName}: Captured raw tool call`);
                    }
                }
                catch (error) {
                    logger.info(`CLAUDE_DESKTOP_DEBUG: Could not stringify message: ${error}`);
                }
                // Call original handler to continue normal processing
                return originalHandleMessage.call(this, message);
            };
        }
        // Keep the process running with a heartbeat
        setInterval(() => {
            logger.debug('Heartbeat - server still alive');
        }, 30000).unref();
    }
    catch (error) {
        logger.error('Failed to connect server to transport:', error);
        throw error;
    }
};
/**
 * Register a single tool with the server
 * Following the reference implementation pattern
 */
export const registerTool = (server, name, description, paramSchema, handler) => {
    logger.debug(`Registering tool: ${name}`);
    // Extract schema properties object from Zod schema if needed
    let schemaProps = {};
    // Handle Zod schemas - extract shape for MCP Schema
    if (paramSchema && typeof paramSchema.parse === 'function' && paramSchema.shape) {
        logger.debug(`Using shape from Zod schema for ${name}`);
        schemaProps = paramSchema.shape;
    }
    // Handle raw schema objects
    else if (paramSchema && typeof paramSchema === 'object') {
        logger.debug(`Using direct schema object for ${name}`);
        schemaProps = paramSchema;
    }
    // Debug schema if debug flag is enabled
    if (process.env.DEBUG_SCHEMA === 'true') {
        try {
            // If it's a Zod schema, also log the JSON Schema version 
            if (paramSchema && typeof paramSchema.parse === 'function') {
                const jsonSchema = convertZodSchemaToJsonSchema(paramSchema, name);
                logger.debug(`SCHEMA_DEBUG: Schema for ${name}: ${JSON.stringify(jsonSchema, null, 2)}`);
            }
            else {
                // Log the schema properties directly
                logger.debug(`SCHEMA_DEBUG: Schema for ${name}: ${JSON.stringify({
                    type: "object",
                    properties: schemaProps
                }, null, 2)}`);
            }
        }
        catch (error) {
            logger.error(`Error logging schema for ${name}:`, error);
        }
    }
    // Create a wrapper handler that follows the reference implementation pattern
    // Use specific type annotations to match the MCP SDK expectations
    const mcpHandler = async (params, extra) => {
        try {
            // Comprehensive raw request logging - captures the complete request details
            logger.rawRequest({ params, extra }, name, {
                timestamp: new Date().toISOString(),
                toolName: name,
                requestId: extra?.request?.id,
                source: 'tool_handler'
            });
            // Enhanced logging for Claude Desktop debugging
            logger.info(`CLAUDE_DESKTOP_DEBUG: Tool ${name} called`);
            logger.info(`CLAUDE_DESKTOP_DEBUG: Raw request body: ${JSON.stringify(params)}`);
            logger.info(`CLAUDE_DESKTOP_DEBUG: Raw request body (direct): ${params}`);
            logger.info(`CLAUDE_DESKTOP_DEBUG: Request body type: ${typeof params}`);
            // If it's an object, log all keys at the root level
            if (typeof params === 'object' && params !== null) {
                logger.info(`CLAUDE_DESKTOP_DEBUG: Request body keys: ${Object.keys(params).join(', ')}`);
                // Log special cases for known properties
                if (params.name)
                    logger.info(`CLAUDE_DESKTOP_DEBUG: params.name: ${params.name}`);
                if (params.parameters)
                    logger.info(`CLAUDE_DESKTOP_DEBUG: params.parameters type: ${typeof params.parameters}`);
                if (params.parameters)
                    logger.info(`CLAUDE_DESKTOP_DEBUG: params.parameters keys: ${Object.keys(params.parameters || {}).join(', ')}`);
                // Log extra data structure (contains request info)
                logger.info(`CLAUDE_DESKTOP_DEBUG: Extra data structure: ${JSON.stringify(extra, null, 2)}`);
                if (extra?.request) {
                    logger.info(`CLAUDE_DESKTOP_DEBUG: Extra request data: ${JSON.stringify(extra.request, null, 2)}`);
                }
            }
            // Enhanced logging for parameter debugging
            logger.info(`Tool ${name} called with params type: ${typeof params}`);
            logger.info(`Tool ${name} called with params instanceof Array: ${params instanceof Array}`);
            logger.info(`Tool ${name} called with params keys: ${Object.keys(params).join(', ')}`);
            // Log the raw params with proper formatting for debugging
            try {
                logger.info(`Tool ${name} raw params:`, JSON.stringify(params, null, 2));
            }
            catch (error) {
                logger.info(`Tool ${name} raw params cannot be stringified:`, params);
            }
            // Log a structured investigation of the parameter format
            const paramInvestigation = {
                rawType: typeof params,
                isArray: Array.isArray(params),
                rootKeys: typeof params === 'object' && params !== null ? Object.keys(params) : [],
                // Check for common parameter patterns
                hasName: typeof params === 'object' && params !== null && 'name' in params,
                hasParameters: typeof params === 'object' && params !== null && 'parameters' in params,
                hasArguments: typeof params === 'object' && params !== null && 'arguments' in params,
                // Examine nested structure if present
                parametersKeys: typeof params?.parameters === 'object' ? Object.keys(params.parameters) : [],
                argumentsKeys: typeof params?.arguments === 'object' ? Object.keys(params.arguments) : [],
                // Examine extra object
                extraKeys: typeof extra === 'object' && extra !== null ? Object.keys(extra) : [],
                hasRequestInExtra: typeof extra?.request === 'object' && extra.request !== null,
                requestKeys: typeof extra?.request === 'object' && extra.request !== null ? Object.keys(extra.request) : [],
            };
            // Log the parameter investigation to a dedicated file
            logger.rawRequest(paramInvestigation, `${name}-param-investigation`, { timestamp: new Date().toISOString(), source: 'parameter_investigation' });
            // Special case handling for find_people due to parameter issues
            if (name === 'cloze_find_people') {
                logger.info('SPECIAL LOGGING FOR FIND_PEOPLE TOOL');
                // Type-safe access to possible parameter locations
                logger.info(`params.freeformquery: ${params.freeformquery}`);
                logger.info(`params.arguments?.freeformquery: ${params.arguments?.freeformquery}`);
                logger.info(`params.parameters?.freeformquery: ${params.parameters?.freeformquery}`);
                // Check for complex nesting
                if (typeof params === 'object' && params !== null) {
                    for (const key of Object.keys(params)) {
                        logger.info(`params[${key}] type: ${typeof params[key]}`);
                        if (typeof params[key] === 'object' && params[key] !== null) {
                            logger.info(`params[${key}] keys: ${Object.keys(params[key]).join(', ')}`);
                            // Try to find freeformquery in any nested object
                            const nestedObj = params[key];
                            if (nestedObj.freeformquery) {
                                logger.info(`Found freeformquery in params[${key}]: ${nestedObj.freeformquery}`);
                            }
                        }
                    }
                }
            }
            // Call the original handler
            const result = await handler(params);
            // Log the successful result
            logger.info(`Tool ${name} executed successfully`);
            // Format as required by MCP protocol with correct type structure
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result)
                    }
                ]
            };
        }
        catch (error) {
            // Enhanced logging for error states
            logger.error(`CLAUDE_DESKTOP_DEBUG: ERROR in tool ${name}:`, error);
            logger.error(`CLAUDE_DESKTOP_DEBUG: Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
            logger.error(`CLAUDE_DESKTOP_DEBUG: Params at error time:`, JSON.stringify(params, null, 2));
            // Log error state to a dedicated file
            logger.rawRequest({
                error: error instanceof Error ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                } : String(error),
                params: params,
                extra: extra,
            }, `${name}-error`, {
                timestamp: new Date().toISOString(),
                errorType: error instanceof Error ? error.constructor.name : typeof error,
                source: 'tool_error'
            });
            // Standard error logging
            logger.error(`Error executing tool ${name}:`, error);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            error: {
                                message: error instanceof Error ? error.message : String(error),
                                debug: {
                                    paramType: typeof params,
                                    paramKeys: typeof params === 'object' && params !== null ? Object.keys(params) : [],
                                    errorType: error instanceof Error ? error.constructor.name : typeof error
                                }
                            }
                        })
                    }
                ]
            };
        }
    };
    // Register the tool with the MCP server
    server.tool(name, description, schemaProps, mcpHandler);
    logger.info(`Successfully registered tool: ${name}`);
};
/**
 * Create a simple debug tool to help diagnose parameter passing issues
 */
export const createDebugTool = (server) => {
    logger.info('Creating debug tool for parameter tracing');
    // Import the enhanced debug tool handler with file logging
    import('./tools/cloze_debug_params.js').then(module => {
        // Register the debug tool directly (no schema conversion)
        // For the debug tool, use an empty object schema since it accepts any parameters
        server.tool('cloze_debug_params', 'Debug tool for tracing parameter passing', {}, async (params, extra) => {
            try {
                // Call the debug tool handler
                const result = await module.default(params);
                // Format as required by MCP protocol with correct type structure
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                logger.error(`Error in debug tool:`, error);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                error: error instanceof Error ? error.message : String(error)
                            }, null, 2)
                        }
                    ]
                };
            }
        });
        logger.info('Debug tool created successfully');
    }).catch(error => {
        logger.error('Failed to import debug tool:', error);
        // Fallback to inline debug tool if import fails
        const debugToolHandler = async (params, extra) => {
            // Comprehensive raw request logging - captures the entire request payload
            logger.rawRequest({ params, extra }, 'cloze_debug_params', {
                timestamp: new Date().toISOString(),
                source: 'debug_tool_handler'
            });
            // Enhanced Claude Desktop Debug Logging
            logger.info('CLAUDE_DESKTOP_DEBUG: DEBUG TOOL CALLED');
            logger.info(`CLAUDE_DESKTOP_DEBUG: Raw request body: ${JSON.stringify(params)}`);
            logger.info(`CLAUDE_DESKTOP_DEBUG: Raw request body (direct): ${params}`);
            logger.info(`CLAUDE_DESKTOP_DEBUG: Request body type: ${typeof params}`);
            // If it's an object, log all keys at the root level
            if (typeof params === 'object' && params !== null) {
                logger.info(`CLAUDE_DESKTOP_DEBUG: Request body keys: ${Object.keys(params).join(', ')}`);
                // Log special cases for known properties
                if (params.name)
                    logger.info(`CLAUDE_DESKTOP_DEBUG: params.name: ${params.name}`);
                if (params.parameters)
                    logger.info(`CLAUDE_DESKTOP_DEBUG: params.parameters type: ${typeof params.parameters}`);
                if (params.parameters)
                    logger.info(`CLAUDE_DESKTOP_DEBUG: params.parameters keys: ${Object.keys(params.parameters || {}).join(', ')}`);
            }
            // Log the extra object which contains request information
            logger.info(`CLAUDE_DESKTOP_DEBUG: Extra object: ${JSON.stringify(extra, null, 2)}`);
            // Standard debug logging
            logger.info('DEBUG TOOL PARAMS:', JSON.stringify(params, null, 2));
            logger.info('DEBUG TOOL EXTRA:', JSON.stringify(extra, null, 2));
            // Create a detailed parameter format analysis
            const paramAnalysis = {
                timestamp: new Date().toISOString(),
                paramType: typeof params,
                isArray: Array.isArray(params),
                rootKeys: typeof params === 'object' && params !== null ? Object.keys(params) : [],
                // Check common parameter formats
                hasNameField: typeof params === 'object' && params !== null && 'name' in params,
                hasParametersField: typeof params === 'object' && params !== null && 'parameters' in params,
                hasArgumentsField: typeof params === 'object' && params !== null && 'arguments' in params,
                // Check nested structures
                nameValue: params?.name,
                parametersType: typeof params?.parameters,
                parametersKeys: typeof params?.parameters === 'object' ? Object.keys(params.parameters || {}) : [],
                argumentsType: typeof params?.arguments,
                argumentsKeys: typeof params?.arguments === 'object' ? Object.keys(params.arguments || {}) : [],
                // Check request object in extra
                extraType: typeof extra,
                extraKeys: typeof extra === 'object' && extra !== null ? Object.keys(extra) : [],
                hasRequestInExtra: typeof extra?.request === 'object',
                requestType: typeof extra?.request,
                requestKeys: typeof extra?.request === 'object' ? Object.keys(extra.request || {}) : []
            };
            // Log the parameter analysis to a dedicated file
            logger.rawRequest(paramAnalysis, 'debug-tool-param-analysis', { timestamp: new Date().toISOString(), source: 'debug_tool_param_analysis' });
            // Log various parts of the params object to trace how parameters are passed
            if (params.arguments) {
                logger.info('DEBUG TOOL - Found arguments in params:', JSON.stringify(params.arguments, null, 2));
            }
            if (params.params) {
                logger.info('DEBUG TOOL - Found params in params:', JSON.stringify(params.params, null, 2));
            }
            // Check extra parameter for request information
            if (extra?.request?.params?.arguments) {
                logger.info('DEBUG TOOL - Found arguments in request:', JSON.stringify(extra.request.params.arguments, null, 2));
            }
            // Log every possible path to parameters for debugging
            if (extra?.request) {
                logger.info('CLAUDE_DESKTOP_DEBUG: Request object:', JSON.stringify(extra.request, null, 2));
            }
            // Return the params as received for debugging along with the parameter analysis
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            received_params: params,
                            parameter_analysis: paramAnalysis,
                            timestamp: new Date().toISOString()
                        }, null, 2)
                    }
                ]
            };
        };
        // Register the fallback debug tool
        server.tool('cloze_debug_params', 'Debug tool for tracing parameter passing', {}, debugToolHandler);
        logger.info('Fallback debug tool created successfully');
    });
};
/**
 * Register all tools with the server
 */
export const registerTools = (server) => {
    logger.info('Registering tools with the server');
    // Create debug tool first
    createDebugTool(server);
    // Flag to indicate we're registering tools in test mode
    const isTestMode = process.env.DEBUG_SCHEMA === 'true';
    // Log environment variables for debugging
    logger.info(`Environment variables: DEBUG_SCHEMA=${process.env.DEBUG_SCHEMA}, MCP_MODE=${process.env.MCP_MODE}`);
    logger.info(`Debug mode is ${isTestMode ? 'ENABLED' : 'DISABLED'} for schema logging`);
    // Tracking registered tools to avoid duplicates
    const registeredTools = new Set();
    /**
     * Standardized function to register a tool module
     * Consistently handles parameter schemas for all tools
     */
    const registerToolModule = (server, modulePath) => {
        const toolName = modulePath.split('/').pop()?.replace('.js', '') || 'unknown';
        // Skip if already registered
        if (registeredTools.has(toolName)) {
            logger.debug(`Tool ${toolName} already registered, skipping`);
            return;
        }
        import(modulePath).then(module => {
            // Add to registered tools set
            registeredTools.add(toolName);
            // Get the schema from the module directly (Zod schema)
            const paramSchema = module.paramSchema || {};
            // If in test mode, log the schema
            if (isTestMode) {
                try {
                    // Log schema directly for debugging
                    const schemaJson = typeof paramSchema.parse === 'function'
                        ? convertZodSchemaToJsonSchema(paramSchema, toolName)
                        : paramSchema;
                    // Use standardized format for test detection
                    logger.debug(`SCHEMA_DEBUG: Schema for ${toolName}: ${JSON.stringify(schemaJson, null, 2)}`);
                }
                catch (error) {
                    logger.error(`Error processing schema for ${toolName}:`, error);
                }
            }
            // Register the tool with the parameter schema
            registerTool(server, module.metadata.name, module.metadata.description, paramSchema, module.default);
            logger.debug(`Registered tool: ${module.metadata.name}`);
        }).catch(error => {
            logger.error(`Failed to register tool ${toolName}: ${error.message}`);
        });
    };
    // Register our direct find people tool with simple schema
    if (!registeredTools.has('cloze_direct_find_people')) {
        import('./tools/cloze_direct_find_people.js').then(module => {
            registeredTools.add('cloze_direct_find_people');
            logger.info('Registering direct tool with direct handler');
            // Use a simple schema properties object as in the reference implementation
            const schemaProps = {
                freeformquery: z.string().describe("Search query (name, email, or phone)")
            };
            // If in test mode, log the schema
            if (isTestMode) {
                logger.debug(`SCHEMA_DEBUG: Schema for cloze_direct_find_people: ${JSON.stringify({
                    type: "object",
                    properties: {
                        freeformquery: {
                            type: "string",
                            description: "Search query (name, email, or phone)"
                        }
                    },
                    required: ["freeformquery"]
                }, null, 2)}`);
            }
            // Create a handler with the correct type annotations for MCP SDK
            const mcpHandler = async (args, extra) => {
                try {
                    // Enhanced logging for Claude Desktop debugging
                    logger.info('CLAUDE_DESKTOP_DEBUG: DIRECT FIND PEOPLE TOOL CALLED');
                    logger.info(`CLAUDE_DESKTOP_DEBUG: Raw request body: ${JSON.stringify(args)}`);
                    logger.info(`CLAUDE_DESKTOP_DEBUG: Raw request body (direct): ${args}`);
                    logger.info(`CLAUDE_DESKTOP_DEBUG: Request body type: ${typeof args}`);
                    // If it's an object, log all keys at the root level
                    if (typeof args === 'object' && args !== null) {
                        logger.info(`CLAUDE_DESKTOP_DEBUG: Request body keys: ${Object.keys(args).join(', ')}`);
                        // Log special cases for known properties
                        if (args.name)
                            logger.info(`CLAUDE_DESKTOP_DEBUG: args.name: ${args.name}`);
                        if (args.parameters)
                            logger.info(`CLAUDE_DESKTOP_DEBUG: args.parameters type: ${typeof args.parameters}`);
                        if (args.parameters)
                            logger.info(`CLAUDE_DESKTOP_DEBUG: args.parameters keys: ${Object.keys(args.parameters || {}).join(', ')}`);
                    }
                    // Log the extra object which contains request information
                    logger.info(`CLAUDE_DESKTOP_DEBUG: Extra object: ${JSON.stringify(extra, null, 2)}`);
                    // Standard debug logging
                    logger.debug(`Tool cloze_direct_find_people called with args:`, JSON.stringify(args));
                    // Check for required parameter
                    if (!args.freeformquery) {
                        // Try to find freeformquery in other possible locations
                        const paramValue = args.freeformquery ||
                            args.parameters?.freeformquery ||
                            args.arguments?.freeformquery ||
                            extra?.request?.params?.arguments?.freeformquery;
                        if (paramValue) {
                            logger.info(`CLAUDE_DESKTOP_DEBUG: Found freeformquery in alternate location: ${paramValue}`);
                            args.freeformquery = paramValue;
                        }
                        else {
                            return {
                                content: [
                                    {
                                        type: "text",
                                        text: JSON.stringify({
                                            error: {
                                                message: "Missing required parameter: freeformquery"
                                            }
                                        })
                                    }
                                ]
                            };
                        }
                    }
                    // Call the original handler
                    const result = await module.default(args);
                    // Format result as JSON string with the correct type annotations
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(result)
                            }
                        ]
                    };
                }
                catch (error) {
                    // Enhanced logging for error states
                    logger.error(`CLAUDE_DESKTOP_DEBUG: ERROR in direct tool:`, error);
                    logger.error(`CLAUDE_DESKTOP_DEBUG: Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
                    logger.error(`CLAUDE_DESKTOP_DEBUG: Args at error time:`, JSON.stringify(args, null, 2));
                    logger.error(`CLAUDE_DESKTOP_DEBUG: Extra at error time:`, JSON.stringify(extra, null, 2));
                    // Standard error logging
                    logger.error(`Error executing tool cloze_direct_find_people:`, error);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    error: {
                                        message: error instanceof Error ? error.message : String(error),
                                        debug: {
                                            argsType: typeof args,
                                            argsKeys: typeof args === 'object' && args !== null ? Object.keys(args) : [],
                                            errorType: error instanceof Error ? error.constructor.name : typeof error
                                        }
                                    }
                                })
                            }
                        ]
                    };
                }
            };
            // Register using the schema properties object
            server.tool(module.metadata.name, module.metadata.description, schemaProps, mcpHandler);
            logger.info(`Registered direct tool with enhanced schema: ${module.metadata.name}`);
        }).catch(error => {
            logger.error(`Failed to register direct tool: ${error.message}`);
        });
    }
    // Import and register People tools
    registerToolModule(server, './tools/cloze_create_people.js');
    registerToolModule(server, './tools/cloze_find_people.js');
    registerToolModule(server, './tools/cloze_update_people.js');
    registerToolModule(server, './tools/cloze_delete_people.js');
    // Import and register Company tools
    registerToolModule(server, './tools/cloze_create_company.js');
    registerToolModule(server, './tools/cloze_find_company.js');
    registerToolModule(server, './tools/cloze_update_company.js');
    registerToolModule(server, './tools/cloze_list_companies.js');
    registerToolModule(server, './tools/cloze_add_company_location.js');
    registerToolModule(server, './tools/cloze_find_nearby_companies.js');
    // Import and register Project tools
    registerToolModule(server, './tools/cloze_create_project.js');
    registerToolModule(server, './tools/cloze_find_project.js');
    registerToolModule(server, './tools/cloze_update_project.js');
    registerToolModule(server, './tools/cloze_list_projects.js');
    // Import and register Communication tools
    registerToolModule(server, './tools/cloze_communication_add_meeting.js');
    registerToolModule(server, './tools/cloze_communication_add_note.js');
    registerToolModule(server, './tools/cloze_communication_log_email.js');
    // Import and register Tag Management tools for People
    registerToolModule(server, './tools/cloze_create_people_tag.js');
    registerToolModule(server, './tools/cloze_read_people_tag.js');
    registerToolModule(server, './tools/cloze_update_people_tag.js');
    registerToolModule(server, './tools/cloze_delete_people_tag.js');
    // Import and register Tag Management tools for Companies
    registerToolModule(server, './tools/cloze_create_company_tag.js');
    registerToolModule(server, './tools/cloze_read_company_tag.js');
    registerToolModule(server, './tools/cloze_update_company_tag.js');
    registerToolModule(server, './tools/cloze_delete_company_tag.js');
    // Import and register Location-based tools
    registerToolModule(server, './tools/cloze_add_people_location.js');
    registerToolModule(server, './tools/cloze_add_company_location.js');
    registerToolModule(server, './tools/cloze_find_nearby_people.js');
    registerToolModule(server, './tools/cloze_find_nearby_companies.js');
    registerToolModule(server, './tools/cloze_get_people_locations.js');
    registerToolModule(server, './tools/cloze_get_company_locations.js');
    // Import and register Health tools
    registerToolModule(server, './tools/cloze_health_health_check.js');
    registerToolModule(server, './tools/cloze_health_health_connection_status.js');
    registerToolModule(server, './tools/cloze_health_health_reset_connection.js');
    // Import and register Metadata tools
    registerToolModule(server, './tools/cloze_metadata_get_segments.js');
    registerToolModule(server, './tools/cloze_metadata_get_stages.js');
    registerToolModule(server, './tools/cloze_metadata_raw.js');
    logger.info('Tools registered successfully');
};
// Export the server creation functions
export default { createServer, connectServer, registerTools, registerTool };
//# sourceMappingURL=server.js.map