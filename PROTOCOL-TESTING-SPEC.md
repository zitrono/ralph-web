# MCP Schema Validation Testing Specification

This document outlines the specifications for "Schema Validation Testing" (SVT) for the Model Context Protocol (MCP) implementation. SVT ensures that our MCP server implementation correctly defines, serves, and validates schemas for tool parameters.

## 1. Overview

Schema Validation Testing verifies that our MCP server implementation correctly converts Zod schemas to JSON Schema, serves these schemas through the MCP protocol, and properly validates incoming parameters against these schemas. This testing focuses exclusively on schema-related aspects of the MCP implementation.

## 2. Schema Validation Testing

Tests that verify our server correctly defines and validates tool parameters:

- **Schema Definition**: Verify that JSON Schema definitions are correctly derived from Zod schemas.
- **Schema Serving**: Confirm that schemas are correctly included in tools/list responses.
- **Parameter Validation**: Confirm that requests with invalid parameters are properly rejected with appropriate error messages.
- **Required Parameters**: Test that missing required parameters result in validation errors.
- **Optional Parameters**: Verify that optional parameters can be omitted without error.
- **Type Validation**: Ensure that parameters with incorrect types are properly rejected.
- **Schema Documentation**: Confirm that schema descriptions and examples are properly included.
- **Schema Conversion**: Verify that the conversion from Zod schemas to JSON Schema is accurate and complete.

## 3. Testing Approach

### 3.1 Schema Validation Assertions

Assertions specifically for schema validation:

```javascript
// Verify schema conversion
assertValidJsonSchema(zodSchema, expectedJsonSchema);

// Verify schema validation
assertSchemaValidation(schema, validParams, invalidParams);

// Verify schema documentation
assertSchemaDocumentation(schema, expectedDescriptions, expectedExamples);

// Verify error responses for schema validation
assertValidationErrorResponse(request, expectedErrorMessage);
```

## 4. Schema Transmission Testing

The focus of our testing is to ensure that the schemas we define are correctly transmitted to clients via the MCP protocol. Rather than testing the validation logic itself, we need to verify that schemas are properly included in the server responses and match what we intend to send.

### 4.1 Schema Transmission Tests

1. **Tools/List Schema Verification**
   - Verify that the tools/list response includes schema definitions for all registered tools
   - Confirm that each tool's schema in the response matches the Zod schema defined for that tool
   - Ensure that required parameters are correctly marked as required in the transmitted schema
   - Verify that parameter descriptions and examples are included in the transmitted schema

2. **Schema Structure Verification**
   - Verify that the JSON Schema structure adheres to the Draft-07 specification
   - Confirm that the schema includes the appropriate $schema reference
   - Verify that additionalProperties is correctly set according to our requirements
   - Ensure that all property types are correctly specified in the schema

3. **Schema Completeness Testing**
   - Test that all tool schemas are complete with no missing parameters
   - Verify that optional parameters are correctly marked as such
   - Ensure that parameter constraints (min, max, pattern) are preserved in the schema
   - Confirm that object and array parameters preserve their nested schema structure

### 4.2 Tool Schema Registry Testing

1. **Tool Registration Verification**
   - Verify that each tool is registered with the correct schema
   - Confirm that the schema used for registration matches the schema received in tools/list
   - Test that schema changes during development are correctly reflected in the tools/list response
   - Ensure that all tools have unique names and don't override each other's schemas

2. **Schema Consistency Testing**
   - Verify that the schema remains consistent between server restarts
   - Test that the schema is consistent across different types of clients
   - Confirm that schema changes propagate correctly to all connected clients
   - Verify that schemas are identical when requested from different sessions

## 5. Implementation Plan

### 5.1 Schema Transmission Testing Implementation

1. Create schema snapshot generator for each tool
   - Generate a JSON Schema snapshot directly from each Zod schema
   - Store these snapshots as reference files
   
2. Implement schema comparison utilities
   - Create a tool to compare the expected schema with the received schema
   - Implement detailed reporting on schema differences
   
3. Implement test infrastructure
   - Extend existing test runner to call tools/list and extract schemas
   - Develop utilities to extract schemas from tools/list response
   - Create reporting mechanism for schema verification results
   
4. Create schema transmission tests
   - Implement tools/list schema verification tests
   - Implement schema structure verification tests
   - Implement schema completeness tests
   
5. Implement schema registry tests
   - Create tool registration verification tests
   - Implement schema consistency tests
   
6. Integrate with CI pipeline
   - Add schema verification tests to the CI workflow
   - Generate schema verification reports as part of the build process

## 6. Schema Transmission Troubleshooting

### 6.1 Common Schema Transmission Issues

1. **Schema conversion failures**: Complex Zod schemas may not convert correctly to JSON Schema
2. **Metadata loss**: Descriptions, examples, and other metadata may be lost during schema conversion
3. **Schema structure mismatch**: The structure of the received schema may differ from the intended schema
4. **Required field inconsistencies**: Required fields may not be correctly marked as required
5. **$schema reference issues**: The JSON Schema draft reference may be incorrect or missing
6. **additionalProperties issues**: The additionalProperties setting may not be correctly transmitted

### 6.2 Debugging Schema Transmission Issues

1. Enable verbose schema conversion logging
2. Use the schema comparison tool to identify specific differences
3. Inspect the raw tools/list response to verify schema structure
4. Compare schemas directly with a JSONSchema validator
5. Check for MCP SDK version compatibility issues

## 7. References

1. JSON Schema Specification (Draft-07)
2. Zod Documentation
3. MCP SDK Documentation for schema handling
4. MCP Protocol Specification for tools/list endpoint

---

By implementing this Schema Transmission Testing specification, we can ensure that our MCP server implementation correctly transmits schema definitions to clients, providing a robust and reliable integration with Claude Desktop and other MCP clients.