#!/usr/bin/env node
/**
 * Parameter Format Test Runner
 * Tests tool parameter handling with different parameter formats
 *
 * Usage: node param_tester.js <tool_name> <param_format> <log_file>
 *
 * param_format options:
 *   - direct - Direct parameters: { freeformquery: "value" }
 *   - claude - Claude Web format: { parameters: { freeformquery: "value" } }
 *   - claude_desktop - Claude Desktop format: { name: "tool", parameters: { freeformquery: "value" } }
 *   - mcp - MCP format: { arguments: { freeformquery: "value" } }
 */
import { TestServer } from './runner.js';
import logger from '../logging.js';
import fs from 'fs';
import path from 'path';
/**
 * Create test parameters in the specified format
 */
function createTestParams(toolName, paramFormat, baseParams) {
    switch (paramFormat) {
        case 'direct':
            // Direct parameter format: { param1: "value1", param2: "value2" }
            return { ...baseParams };
        case 'claude':
            // Claude Web format: { parameters: { param1: "value1", param2: "value2" } }
            return {
                parameters: { ...baseParams }
            };
        case 'claude_desktop':
            // Claude Desktop format: { name: "tool_name", parameters: { param1: "value1", param2: "value2" } }
            return {
                name: toolName,
                parameters: { ...baseParams }
            };
        case 'mcp':
            // MCP format: { arguments: { param1: "value1", param2: "value2" } }
            return {
                arguments: { ...baseParams }
            };
        default:
            logger.error(`Unknown parameter format: ${paramFormat}`);
            process.exit(1);
    }
}
/**
 * Save results to a log file
 */
function saveResultsToLog(logFile, data) {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
    // Create the full log file path
    const logPath = path.join(logsDir, logFile);
    // Write the data to the log file
    fs.writeFileSync(logPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        ...data
    }, null, 2));
    logger.info(`Results saved to ${logPath}`);
}
/**
 * Main function to run the parameter test
 */
async function main() {
    // Get command line args
    const args = process.argv.slice(2);
    if (args.length < 3) {
        logger.error('Error: Missing required arguments');
        console.log('Usage: node param_tester.js <tool_name> <param_format> <log_file> [test_value]');
        console.log('param_format options: direct, claude, claude_desktop, mcp');
        process.exit(1);
    }
    const toolName = args[0];
    const paramFormat = args[1];
    const logFile = args[2];
    const testValue = args.length > 3 ? args[3] : 'Katja';
    logger.info(`Starting Parameter Format Test for tool "${toolName}" with format "${paramFormat}"`);
    // Create base parameters for different tools
    let baseParams;
    if (toolName.includes('find_people')) {
        baseParams = { freeformquery: testValue };
    }
    else {
        logger.error(`Unsupported tool: ${toolName}. Only find_people tools are currently supported.`);
        process.exit(1);
    }
    // Create test parameters in the specified format
    const testParams = createTestParams(toolName, paramFormat, baseParams);
    // Log the test parameters
    logger.info(`Test parameters (${paramFormat} format):`, JSON.stringify(testParams, null, 2));
    // Create the test server
    const server = new TestServer();
    try {
        // Start the server
        await server.start();
        // Add a special parameter flag to prevent the test runner from modifying parameters
        testParams._raw_test = true;
        // Run the test
        logger.info(`Calling tool "${toolName}" with ${paramFormat} format parameters`);
        const result = await server.callTool(toolName, testParams);
        // Prepare results for logging
        const testResults = {
            tool_name: toolName,
            param_format: paramFormat,
            raw_params: testParams,
            result: result
        };
        // Save results to log file
        saveResultsToLog(logFile, testResults);
        logger.info(`Parameter test completed successfully`);
        process.exit(0);
    }
    catch (error) {
        logger.error('Error running parameter test:', error);
        // Save error to log file
        saveResultsToLog(logFile, {
            tool_name: toolName,
            param_format: paramFormat,
            raw_params: testParams,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null
        });
        process.exit(1);
    }
    finally {
        // Stop the server
        await server.stop();
    }
}
// Run the test
main().catch((error) => {
    logger.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=param_tester.js.map