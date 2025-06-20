# Cloze CRM MCP Server

A Model Context Protocol (MCP) server implementation for integrating Cloze CRM with AI assistants like Claude.

## Overview

This project provides a bridge between AI assistants and the Cloze CRM system through the Model Context Protocol. The MCP server exposes a set of tools that allow AI assistants to perform operations such as:

- Managing people and companies
- Creating and updating projects
- Logging communications (meetings, notes, emails)
- Managing tags and locations
- Accessing metadata and health information

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Cloze CRM account with API credentials

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
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

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

## Usage with Claude Desktop

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

## Development

### Running Tests

To run tests:

```bash
npm test
```

This will execute the workflow tests that validate the functionality of each tool.

### Available Scripts

- `npm run build`: Builds the project
- `npm start`: Starts the MCP server
- `npm test`: Runs workflow tests
- `npm run lint`: Runs TypeScript type checking
- `npm run test:mcp`: Runs comprehensive MCP client tests
- `npm run test:schema`: Tests schema transmission
- `npm run verify:schemas`: Verifies schema implementation
- `npm run test:unit`: Runs unit tests
- `npm run validate:example`: Runs client-side validation example
- `npm run tools:standardize`: Standardizes all tool files
- `npm run tools:standardize-one`: Standardizes a single tool file

## Development Policies

### 1. No Backward Compatibility

#### Policy
To maintain code simplicity and reduce technical debt, we no longer support backward compatibility for deprecated features or APIs. All development should focus on current implementations only, without accommodating legacy formats or interfaces.

#### Implementation Guidelines
- Do not include conditional code paths for legacy formats
- Remove any existing compatibility layers during refactoring
- Document breaking changes clearly in CHANGELOG.md
- Use clear version numbering to indicate compatibility breaks

### 2. Mandatory TypeScript Checks

#### Policy
TypeScript errors must always be fixed before committing code. The build process will no longer ignore TypeScript errors.

#### Requirements
Developers must:
- Run `npm run build` to verify TypeScript compilation before commits
- Fix all TypeScript errors immediately when identified
- Never use the `// @ts-ignore` comment to bypass type checking
- Maintain strict type safety throughout the codebase

### 3. Complete Unfinished Refactoring First

#### Policy
When examining the codebase, if you find unfinished refactoring that isn't part of your current task, finish the refactoring first before proceeding. This policy helps maintain code consistency and prevents technical debt from accumulating.

#### Clean Refactoring Requirements
1. After completing a refactoring, rename files to their final names (without suffixes like `-refactored`)
2. Remove any backup files (`.bak`, `.old`, etc.) that were created during refactoring
3. Update all import statements across the codebase to reference the new files
4. Add clear deprecation notices to files that should no longer be used but are kept for reference
5. Update documentation to reflect the new structure
6. Ensure no ambiguous file naming remains in the codebase
7. Run all tests to verify the refactoring didn't break existing functionality

### 4. Live API Testing

#### Policy
All tests must use the live Cloze API. Mock implementations have been removed to ensure authentic testing results.

#### Implementation Requirements
1. Create a `.env` file in the project root with your Cloze credentials
2. Avoid creating mock implementations except for controlled testing scenarios where explicitly required
3. Test with real API data to ensure compatibility with the actual service
4. Catch actual API errors and response format changes
5. Implement proper test data cleanup within each workflow test
   - All test data created during tests must be deleted at the end of the test
   - Each workflow test must include cleanup verification as its final step
   - Cleanup must be implemented as a native part of each test workflow, not as a separate utility

#### Recommendation
When developing or debugging Cloze API functionality, first validate live performance of endpoints with direct curl calls to Cloze. Analyze the responses and modify your curl requests accordingly. With this knowledge, your development and debugging will be more precise.

Example:
```bash
curl -s -X GET "https://api.cloze.com/v1/user/stages/people?user=your_email@example.com&api_key=your_api_key" \
-H "Content-Type: application/json" \
-H "Accept: application/json"
```

### 5. Parameter Standardization and Schema Validation

#### Policy
All tools must use the unified parameter validation system with schema-based validation to ensure consistency across all components.

#### Implementation Requirements
- Use the `withEnhancedParamValidation` middleware for all tools
- Define schema using Zod with complete parameter descriptions
- Define schema enhancements with examples and detailed descriptions
- Handle multiple parameter formats (direct, MCP formatted, test framework)
- Provide clear error messages with examples for validation failures
- Use default values for optional parameters where appropriate
- Standardize tool implementation using `createToolHandlerWithEnhancedValidation`

### 6. Commit and Documentation Standards

#### Policy
All code changes must be properly documented and follow the established commit message formatting.

#### Requirements
- Add JSDoc comments for all public functions and classes
- Update relevant documentation files when making significant changes
- Follow the commit message format: `<type>: <description>`
- Include tests for all new functionality
- Update CHANGELOG.md with all significant changes

## Documentation

### Architecture
For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

### API Reference
- [MCP Tools Reference](./docs/api/reference/mcp-tools-reference.md) - Comprehensive reference for all available MCP tools
- [Schema Reference](./docs/api/reference/schema-reference.md) - Detailed schema information for data structures
- [Integration Guide](./docs/api/integration-guide.md) - Guide for integrating with the MCP server
- [Examples](./docs/api/examples.md) - Practical usage examples for all tools

### Schema Validation
- [Schema Validation Enhancements](./docs/api/schema-validation-enhancements.md) - Overview of schema validation enhancements
- [Schema Tools Guide](./docs/tools/schema-tools-guide.md) - Guide to using schema validation tools
- [Schema Validation Guide](./docs/api/reference/schema-validation-guide.md) - Detailed guide for implementing schema validation

### Validated Endpoints
For information about the validated Cloze endpoints implemented in this project, see [docs/api/reference/validated cloze entpoints.md](./docs/api/reference/validated%20cloze%20entpoints.md).

## License

[MIT](LICENSE)