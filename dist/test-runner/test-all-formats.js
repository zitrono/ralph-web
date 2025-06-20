#!/usr/bin/env node
/**
 * Test all parameter formats for a specific tool
 * Runs the parameter tester with all available formats
 *
 * Usage: node test-all-formats.js [tool_name] [test_value]
 */
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import logger from '../logging.js';
// Define parameter formats to test
const FORMATS = [
    'direct',
    'claude',
    'claude_desktop',
    'mcp'
];
/**
 * Run a single parameter format test
 */
async function runParamTest(toolName, format, logFile, testValue) {
    return new Promise((resolve) => {
        logger.info(`Testing ${format} format...`);
        const args = [
            '--loader=ts-node/esm',
            'src/test-runner/param_tester.ts',
            toolName,
            format,
            logFile,
            testValue
        ];
        const process = spawn('node', args, { stdio: 'inherit' });
        process.on('close', (code) => {
            const success = code === 0;
            if (success) {
                logger.info(`✅ ${format} format test completed successfully`);
            }
            else {
                logger.error(`❌ ${format} format test failed with code ${code}`);
            }
            resolve(success);
        });
    });
}
/**
 * Main function to run all tests
 */
async function main() {
    // Process command line arguments
    const args = process.argv.slice(2);
    const toolName = args[0] || 'cloze_find_people';
    const testValue = args[1] || 'Katja';
    logger.info(`Testing all parameter formats for tool: ${toolName} with value: ${testValue}`);
    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
    }
    // Track test results
    const results = {
        total: FORMATS.length,
        passed: 0,
        failed: 0,
        failures: []
    };
    // Run tests for each format
    for (const format of FORMATS) {
        const logFile = `param-test-${format}.json`;
        const success = await runParamTest(toolName, format, logFile, testValue);
        if (success) {
            results.passed++;
        }
        else {
            results.failed++;
            results.failures.push(format);
        }
    }
    // Show summary
    logger.info('\n=== Test Summary ===');
    logger.info(`Total: ${results.total}`);
    logger.info(`Passed: ${results.passed}`);
    logger.info(`Failed: ${results.failed}`);
    if (results.failed > 0) {
        logger.info(`Failed formats: ${results.failures.join(', ')}`);
        logger.info('Check logs directory for details on failures.');
        process.exit(1);
    }
    else {
        logger.info('All parameter format tests passed successfully!');
        logger.info('Results are available in the logs directory.');
    }
}
// Run the main function
main().catch((error) => {
    logger.error('Fatal error running parameter tests:', error);
    process.exit(1);
});
//# sourceMappingURL=test-all-formats.js.map