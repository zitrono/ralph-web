# Schema Validation Tools Guide

This guide explains the new schema validation tools added to the Cloze MCP project and how to use them effectively.

## Table of Contents

1. [Available Tools](#available-tools)
2. [Comprehensive MCP Client](#comprehensive-mcp-client)
3. [Schema Verification Script](#schema-verification-script)
4. [Schema Test Client (ESM)](#schema-test-client-esm)
5. [Schema Standardization Tools](#schema-standardization-tools)
6. [Client-Side Validation](#client-side-validation)
7. [Running the Tools](#running-the-tools)

## Available Tools

The following schema validation tools have been added to the project:

| Tool | File | Description |
|------|------|-------------|
| Comprehensive MCP Client | `src/test-client/comprehensive-test.js` | Complete test client that tests schemas and workflows |
| Schema Verification Script | `src/test-client/verify-schemas-enhanced.js` | Checks all tools for proper schema implementation |
| Schema Test Client (ESM) | `src/test-client/schema-test-esm.js` | Tests schema transmission for the MCP server |
| Tool Standardization | `src/tools/templates/standardize-tool.js` | Standardizes a tool file with schema enhancements |
| All Tools Standardization | `src/tools/templates/standardize-all-tools.js` | Standardizes all tool files |
| Client Validation | `src/test-client/client-schema-validation.js` | Client that validates parameters before sending requests |

## Comprehensive MCP Client

The Comprehensive MCP Client is an end-to-end testing tool that validates the entire MCP server, including schema implementation and transmission.

### Features

- Tests schema validation for all tools
- Runs end-to-end workflow tests for people, companies, and health checks
- Generates detailed reports and logs for troubleshooting
- Comprehensive reporting of test results

### Output Files

The client generates the following output files in `src/test-client/output`:

- `summary-report.json`: Overall test results
- `tools-list.json`: List of all available tools
- `server-stdout.log`: Server standard output
- `server-stderr.log`: Server standard error
- `[tool-name]/...`: Individual tool test results

## Schema Verification Script

The Schema Verification Script checks all tool files for proper schema implementation, including exported schemas and enhancements.

### Features

- Checks all tool files for proper schema structure
- Verifies that schemas include proper exports and enhancements
- Generates a detailed report of schema implementation status
- Identifies tools that need standardization

### Verification Checks

For each tool, the script checks:

1. If the tool exports a `paramSchema` Zod schema
2. If the tool exports `schemaEnhancements` with examples and descriptions
3. If the tool uses `createToolHandlerWithEnhancedValidation` for validation

### Output Files

The script generates the following output files in `src/test-client/output`:

- `schema-verification-report.json`: JSON report of verification results
- `schema-verification-report.md`: Markdown report with details and recommendations

## Schema Test Client (ESM)

The Schema Test Client tests schema transmission between the MCP server and clients, ensuring schemas are properly transmitted in the MCP protocol.

### Features

- Tests schema transmission in ESM format
- Creates a real MCP client connection to the server
- Verifies that schemas include required properties and enhancements
- Checks for proper schema structure and format

### Output Files

The client generates the following output files in `src/test-client/output`:

- `server-stdout.log`: Server standard output
- `server-stderr.log`: Server standard error
- `all-schemas.json`: All schemas captured from the server
- `find-people-schema.json`: Schema for the `cloze_find_people` tool

## Schema Standardization Tools

The Schema Standardization Tools help standardize tool files to follow best practices for schema definition and validation.

### Tool Standardization Script

`standardize-tool.js` standardizes a single tool file by:

1. Adding schema exports if missing
2. Generating schema enhancements with examples
3. Converting to enhanced validation handler
4. Adding proper parameter descriptions

### All Tools Standardization Script

`standardize-all-tools.js` standardizes all tool files by:

1. Finding all tool files in the `src/tools` directory
2. Applying the standardization process to each file
3. Reporting on standardization results
4. Skipping files that are already standardized

## Client-Side Validation

The Client-Side Validation utility provides validation of parameters before sending requests to the server.

### Features

- Validates parameters against schemas before sending to the server
- Provides helpful error messages for validation failures
- Caches schemas for faster validation
- Supports all MCP tools

### Classes and Functions

- `ValidatingMcpClient`: Extended MCP client with schema validation
- `createValidatingClient`: Creates a validating client connected to a server
- `validateToolInput`: Validates input for a specific tool

## Running the Tools

The following npm scripts are available for running the tools:

```bash
# Run the comprehensive MCP client
npm run test:mcp

# Run the schema verification script
npm run verify:schemas

# Run the schema test client
npm run test:schema

# Run client-side validation example
npm run validate:example

# Standardize all tools
npm run tools:standardize

# Standardize a specific tool
npm run tools:standardize-one -- cloze_find_company.ts
```

### Examples

#### Standardizing a Tool File

```bash
# Standardize a specific tool file
npm run tools:standardize-one -- cloze_update_people.ts
```

#### Verifying All Schemas

```bash
# Verify all tool schemas
npm run verify:schemas
```

#### Running Client-Side Validation Example

```bash
# Run the client-side validation example
npm run validate:example
```

---

For more detailed information on schema validation, see:
- [Schema Validation Enhancements](../api/schema-validation-enhancements.md)
- [Schema Validation](../api/schema-validation.md)
- [MCP Tools Reference](../api/reference/mcp-tools-reference.md)