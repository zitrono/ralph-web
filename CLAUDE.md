# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server implementation for Cloze CRM, providing a bridge between AI assistants like Claude and the Cloze CRM system. It implements a set of tools that allow AI assistants to perform operations such as:

- Managing people and companies
- Creating and updating projects
- Logging communications (meetings, notes, emails)
- Managing tags and locations
- Accessing metadata and health information

## Environment Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Cloze CRM account with API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:zitrono/cloze.git
   cd cloze2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with your Cloze credentials:
   ```
   CLOZE_USER_EMAIL=your_email@example.com
   CLOZE_API_KEY=your_api_key
   DEBUG_CLOZE=false
   ```

### Claude Desktop Integration

To use this MCP server with Claude Desktop, add the following configuration to your Claude Desktop configuration file:

```json
"mcpServers": {
  "cloze2": {
    "command": "node",
    "args": [
      "/path/to/cloze2/dist/index.js"
    ],
    "env": {
      "CLOZE_USER_EMAIL": "your_email@example.com",
      "CLOZE_API_KEY": "your_api_key",
      "DEBUG_CLOZE": "false",
      "CLAUDE_DESKTOP": "true",
      "MCP_MODE": "true"
    }
  }
}
```

## Commands

### Build and Run

- **Build the project**: `npm run build`
- **Start the MCP server**: `npm start`
- **Run TypeScript type checking**: `npm run lint`

### Testing

- **Run all workflow tests**: `npm test`
- **Run a specific workflow test**: `npm test -- people` (options: people, company, project, communication, tag, location, health)
- **Run comprehensive MCP client tests**: `npm run test:mcp`
- **Test schema transmission**: `npm run test:schema` 
- **Verify schema implementation**: `npm run verify:schemas`
- **Run unit tests**: `npm run test:unit`
- **Run client-side validation example**: `npm run validate:example`
- **Test schema in MCP format**: `npm run test:mcp-format`
- **Run quick MCP format test**: `npm run test:mcp-format:quick`

### Workflow Test Example

```typescript
// Example of a complete workflow test (simplified)
export async function runPeopleWorkflow() {
  // Step 1: Create a test person
  console.log("Creating test person...");
  const person = await createPersonTool({
    name: "Test Person",
    emails: [{ value: "test-person@example.com" }]
  });
  
  // Step 2: Verify person was created
  console.log("Finding created person...");
  const foundPerson = await findPersonTool({
    freeformquery: "test-person@example.com"
  });
  
  // Step 3: Update the person
  console.log("Updating person...");
  const updatedPerson = await updatePersonTool({
    syncKey: person.syncKey,
    job_title: "Software Engineer"
  });
  
  // Step 4: Clean up - delete the test person
  console.log("Cleaning up - deleting test person...");
  const deletedPerson = await deletePersonTool({
    uniqueid: person.syncKey
  });
  
  // Step 5: Verify cleanup
  console.log("Verifying cleanup...");
  const afterDeleteSearch = await findPersonTool({
    freeformquery: "test-person@example.com"
  });
  
  if (afterDeleteSearch.people.length > 0) {
    throw new Error("Cleanup failed - test person still exists");
  }
  
  console.log("Workflow test completed successfully!");
}
```

### Tool Standardization

- **Standardize all tool files**: `npm run tools:standardize`
- **Standardize a single tool file**: `npm run tools:standardize-one`

## Architecture

The project follows a domain-driven architecture with clear separation of concerns:

1. **MCP Server Layer**: Handles the Model Context Protocol communication
   - Registers tools with the MCP protocol
   - Manages client connections
   - Routes requests to appropriate tools

2. **Tool Layer**: Implements each MCP tool
   - Each tool is in its own file (e.g., `cloze_find_people.ts`)
   - Tools validate input parameters
   - Tools call the appropriate API functions
   - Tools format responses for the MCP client

3. **API Layer**: Communicates with the Cloze API
   - Handles authentication
   - Manages HTTP requests
   - Processes API responses
   - Provides a consistent interface for all operations

4. **Test Runner**: Executes workflow-based tests
   - Tests complete entity lifecycles (create, find, update, delete)
   - Ensures proper cleanup of test data
   - Provides comprehensive logging
   - Implements rate limiting to avoid API throttling

## Development Policies

1. **No Backward Compatibility**: 
   - Code focuses solely on current implementations without accommodating legacy formats
   - Do not include conditional code paths for legacy formats
   - Remove any existing compatibility layers during refactoring
   - Document breaking changes clearly in CHANGELOG.md
   - Use clear version numbering to indicate compatibility breaks

2. **Mandatory TypeScript Checks**:
   - All TypeScript errors must be fixed before committing
   - Run `npm run build` to verify TypeScript compilation
   - Never use `// @ts-ignore` to bypass type checking
   - Maintain strict type safety throughout the codebase

3. **Complete Unfinished Refactoring First**:
   - When finding unfinished refactoring, complete it before proceeding with new tasks
   - Rename files to their final names (without suffixes like `-refactored`)
   - Remove backup files and update imports after refactoring
   - Add clear deprecation notices to files that should no longer be used
   - Update documentation to reflect the new structure
   - Ensure no ambiguous file naming remains in the codebase
   - Run tests to verify refactoring didn't break functionality

4. **Live API Testing**:
   - All tests use the live Cloze API
   - Test with real API data to ensure compatibility
   - Implement proper test data cleanup within each workflow test
   - Catch actual API errors and response format changes
   - All test data created during tests must be deleted at the end of the test
   - Each workflow test must include cleanup verification as its final step

   **Recommendation**:
   When developing or debugging Cloze API functionality, first validate live performance of endpoints with direct curl calls to Cloze. Example:
   ```bash
   curl -s -X GET "https://api.cloze.com/v1/user/stages/people?user=your_email@example.com&api_key=your_api_key" \
   -H "Content-Type: application/json" \
   -H "Accept: application/json"
   ```

5. **Parameter Standardization**:
   - Use the `withParamValidation` middleware for all tools
   - Handle multiple parameter formats (direct, MCP formatted, test framework)
   - Provide clear error messages for missing required parameters
   - Use default values for optional parameters where appropriate
   - Validate parameters before use

6. **Commit and Documentation Standards**:
   - Add JSDoc comments for all public functions and classes
   - Update documentation files for significant changes
   - Follow the commit message format: `<type>: <description>`
   - Include tests for all new functionality
   - Update CHANGELOG.md with all significant changes

## Best Practices

1. **Tool Implementation**:
   - Each tool should be in its own file
   - Use Zod for parameter validation
   - Use the `createToolHandlerWithEnhancedValidation` utility for consistent error handling and response formatting
   - Include detailed metadata with descriptions and parameter information
   - Follow this standard pattern:

   ```typescript
   // Example of a standard tool implementation
   import { z } from 'zod';
   import { createToolHandlerWithEnhancedValidation } from '../utils/param_validation_enhanced';
   import { logger } from '../../logging';
   
   // 1. Define parameter schema with detailed descriptions
   const paramSchema = z.object({
     requiredParam: z.string().describe('Description of the required parameter'),
     optionalParam: z.string().optional().describe('Description of the optional parameter')
   });
   
   // 2. Define schema enhancements for better documentation
   const schemaEnhancements = {
     requiredParam: {
       examples: ['example1', 'example2'],
       description: 'More detailed description with examples'
     }
   };
   
   // 3. Implement the handler function
   async function handler(params: z.infer<typeof paramSchema>) {
     logger.info('Executing tool with params:', params);
     
     try {
       // Tool implementation logic
       const result = await apiCall(params);
       return { success: true, data: result };
     } catch (error) {
       logger.error('Error executing tool:', error);
       return { 
         success: false, 
         error: { 
           message: 'Error message',
           code: 'ERROR_CODE'
         }
       };
     }
   }
   
   // 4. Export the tool with enhanced validation
   export default createToolHandlerWithEnhancedValidation(
     paramSchema,
     schemaEnhancements,
     handler,
     // Optional response transform function
     (response) => response
   );
   ```

2. **Error Handling**:
   - Use the error handling utilities in `tools/utils/error_handling.ts`
   - Provide clear error messages with suggested values for invalid parameters
   - Log errors with appropriate context

3. **Testing**:
   - Create comprehensive workflow tests that cover complete entity lifecycles
   - Ensure proper cleanup of test data
   - Use rate limiting to avoid API throttling
   - Use the retry mechanism for potentially flaky operations
   - Add error handling with cleanup in catch blocks to ensure no test data remains
   - Use random test identifiers to prevent conflicts with existing data

4. **Rate Limiting**:
   - Be mindful of Cloze API rate limits
   - Use the rate limiting utilities in the test runner
   - Add appropriate delays between API calls
   - Implement retry logic for rate-limited requests

## Working with the Codebase

1. **Adding a New Tool**:
   - Create a new file in the `src/tools` directory
   - Define a Zod schema for parameter validation
   - Implement the tool handler function
   - Define metadata for the tool (name, description)
   - Add the tool registration in `src/server.ts`
   - Create corresponding tests in the workflow tests

2. **Adding a New API Endpoint**:
   - Implement the endpoint in the appropriate file in `src/api/endpoints`
   - Add TypeScript interfaces for request/response in `src/api/types.ts`
   - Use the `apiClient` from `src/api/client.ts` for making requests
   - Add proper error handling and response formatting

3. **Adding a New Test Workflow**:
   - Create a new file in `src/test-runner/workflows`
   - Implement a complete entity lifecycle test (create, read, update, delete)
   - Include proper cleanup of test data with verification
   - Register the workflow in `src/test-runner/index.ts`
   - Test with rate limiting to avoid API throttling

## API Documentation

For comprehensive API documentation, refer to:

- [MCP Tools Reference](./docs/api/reference/mcp-tools-reference.md)
- [Schema Reference](./docs/api/reference/schema-reference.md)
- [Integration Guide](./docs/api/integration-guide.md)
- [Examples](./docs/api/examples.md)
- [Schema Validation Guide](./docs/api/reference/schema-validation-guide.md)
- [Validated Cloze Endpoints](./docs/api/reference/validated%20cloze%20entpoints.md)

## Git Repository Information

- **Repository URL**: [https://github.com/zitrono/cloze](https://github.com/zitrono/cloze)
- **Clone URL**: `git@github.com:zitrono/cloze.git`
- **Main Branch**: `main`
- **Local Repository Root**: `/Users/zitrono/dev/cloze2`

### Git Operations

- **Push Changes**:
  ```bash
  git add .
  git commit -m "type: description of changes"
  git push origin main
  ```

- **Pull Changes**:
  ```bash
  git pull origin main
  ```

- **Create a New Branch**:
  ```bash
  git checkout -b feature/branch-name
  ```

## Memories and Guidelines

- Always rebuild and fix ALL TypeScript errors after each todo that modifies TypeScript code
- When standardizing tool implementations, use the templates in `src/tools/templates/`
- For schema validation improvements, refer to the comprehensive guide in the documentation
- Ensure cleanup of test data even when tests fail to avoid orphaned test data
- Use the Batch tool when running multiple operations in parallel for efficiency
- When working with schema validation, use the DEBUG_SCHEMA=true environment flag to troubleshoot issues
- Test workflows should follow the full CRUD lifecycle (create, read, update, delete) with proper cleanup
- Remember that API keys must always be stored in the .env file and never committed to the repository

## MCP Parameter Passing Formats

When working with MCP tools, it's important to understand that parameters may be passed in different formats depending on the client:

1. **Claude Desktop Format**: 
   - Parameters are passed in a structure with `name` and `parameters` fields at the root level
   - Example: `{ name: "tool_name", parameters: { param1: "value1" } }`

2. **Claude Web Format**:
   - Parameters may be wrapped in a `parameters` object
   - Example: `{ parameters: { param1: "value1" } }`

3. **Direct API Format**:
   - Parameters are passed directly at the root level
   - Example: `{ param1: "value1" }`

4. **Traditional MCP Format**:
   - Parameters may be nested in `arguments` or `params.arguments`
   - Example: `{ arguments: { param1: "value1" } }` or `{ params: { arguments: { param1: "value1" } } }`

The parameter validation system in this project has been enhanced to handle all these formats automatically. When implementing new tools, always use the `createToolHandlerWithEnhancedValidation` utility which will correctly extract parameters from any of these formats.

### Troubleshooting Parameter Handling

If you encounter issues with parameter handling:

1. Enable detailed parameter logging:
   ```bash
   DEBUG_PARAMS=true npm start
   ```

2. Use the debug parameters tool to inspect the actual parameter format:
   ```
   mcp__cloze__cloze_debug_params
   ```

3. Check logs in `logs/param-debug/` for the actual parameter structure received from clients

Remember that parameter validation happens in `src/tools/utils/param_validation_enhanced.ts` and follows these steps:
1. First attempts to extract parameters using the `preprocessParams` function
2. Then validates the parameters against the Zod schema
3. Finally passes the validated parameters to the handler function

## Schema Validation and MCP Tool Configuration

### Setting Up Schema Validation

To ensure proper schema validation and transmission to MCP clients:

1. Use Zod schemas in all tool implementation files
2. Enable the enhanced validation in tool exports:
   ```typescript
   // Use the enhanced validation approach (correct)
   export default createToolHandlerWithEnhancedValidation(
     paramSchema, 
     schemaEnhancements, 
     handler, 
     transformResponse
   );
   
   // Do not use the direct handler approach (incorrect)
   // export default directHandlerWrapper;
   ```

3. Set the `DEBUG_SCHEMA=true` environment variable when testing schema validation:
   ```bash
   DEBUG_SCHEMA=true npm run test:schema
   ```

### Schema Format Standards

- All tool schemas must include property descriptions using Zod's `.describe()` method
- Enhance schemas with examples and detailed descriptions when possible
- Schema parameters should follow a consistent format across tools
- Required parameters must be explicitly marked in the schema
- Optional parameters should have sensible defaults when appropriate

### Common Schema Validation Issues

- If tool parameters are not being correctly parsed, check if the schema validation is configured correctly
- Set the `DEBUG_SCHEMA=true` environment variable to debug schema issues
- Use the schema test scripts to verify schema transmission
- Check the schema output in the server logs for any discrepancies
- Ensure that schema logging uses the SCHEMA_DEBUG marker for test detection

### Debugging Tips

1. **Schema Validation Debugging**:
   - Run `DEBUG_SCHEMA=true npm run test:schema` to see detailed schema output
   - Check the schema logs for any validation errors or missing properties
   - Compare schema output with expected format in the schema reference documentation
   - Verify that Zod schema definitions match the expected JSON Schema format

2. **API Endpoint Debugging**:
   - Use direct curl commands to test Cloze API endpoints before implementing in code
   - Set `DEBUG_CLOZE=true` environment variable to see detailed API request/response logs
   - Check for rate limiting issues in API responses (429 responses)
   - Verify authentication credentials are correctly configured in .env file

3. **Test Workflow Debugging**:
   - Run specific workflows with `npm test -- workflow_name` for targeted testing
   - Check test logs for cleanup verification at the end of each test
   - Ensure proper error handling in test workflows
   - Use the `--verbose` flag for more detailed test output: `npm test -- --verbose`
   - Look for rate limiting errors if tests fail intermittently