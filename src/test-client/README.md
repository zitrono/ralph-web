# MCP Test Client for Cloze

This directory contains test clients for validating the Cloze MCP server implementation.

## Available Test Clients

1. **comprehensive-test.js** - A complete test client that performs:
   - Schema validation for all tools
   - End-to-end workflow testing for people, companies, and health checks
   - Detailed output reporting

2. **schema-test.js** - Tests schema transmission for the MCP server (ES modules version)

3. **schema-test.cjs** - Tests schema transmission for the MCP server (CommonJS version)

4. **schema-test-improved.cjs** - Enhanced version of schema-test with better error handling

5. **verify-schemas.js** - Directly verifies schema definitions in source files

## Running the Comprehensive Test Client

To run the comprehensive test client:

```bash
npm run test:mcp
```

This will:
1. Start the MCP server
2. Connect a test client
3. Validate schemas for all tools
4. Run end-to-end workflow tests
5. Generate a detailed report

## Test Output

Test output is saved to the `src/test-client/output` directory:

- **summary-report.json** - Overall test results
- **tools-list.json** - List of all available tools
- **server-stdout.log** - Server standard output
- **server-stderr.log** - Server standard error
- **[tool-name]/...** - Individual tool test results

## Individual Tool Testing

The comprehensive test client also tests individual tools with appropriate parameters. 
For each tool, it saves:

- **tool-definition.json** - Tool metadata
- **input-schema.json** - Tool input schema
- **property-enhancements.json** - Schema property enhancements
- **test-params.json** - Test parameters used
- **test-result.json** - Test result

## Workflows Tested

1. **People Workflow**
   - Create a test person
   - Find the created person
   - Update the person
   - Delete the person
   - Verify deletion

2. **Company Workflow**
   - Create a test company
   - Find the created company
   - Update the company

3. **Health Checks**
   - Basic health check
   - Connection status check

## Extending the Test Client

To add new workflow tests:

1. Create a new test function in `comprehensive-test.js`
2. Add the test to the `runTests` function
3. Update the summary report generation

## Troubleshooting

If tests fail:

1. Check the server logs in the output directory
2. Examine individual tool test results
3. Ensure the Cloze API credentials are properly set in your environment
4. Verify network connectivity to the Cloze API