# Schema Validation in MCP Tools

This document explains how schema validation works in the Cloze CRM MCP server, how schemas are transmitted to clients, and how to test schema transmission.

## Overview

The MCP protocol allows servers to expose detailed schema information for tools, which helps clients validate parameters before sending requests. This improves error handling, enables intelligent auto-completion, and provides better documentation for users.

## Schema Implementation

### 1. Zod Schema Definition

Each tool defines its parameters using Zod schemas:

```typescript
// Example from cloze_find_people.ts
export const paramSchema = z.object({
  freeformquery: z.string()
    .describe('Search query for finding people by name, email, or phone number.'),
  
  segment: personSegmentSchema
    .describe('Filter results by person segment (e.g., "customer", "partner")'),
  
  // Additional parameters...
});
```

### 2. Schema Enhancement

We enhance schemas with examples and additional metadata:

```typescript
export const schemaEnhancements = {
  freeformquery: {
    examples: ["john.doe@example.com", "Jane Smith", "+1 555-123-4567"],
    description: "Search query for finding people by name, email, or phone number."
  },
  // More enhancements...
};
```

### 3. Conversion to JSON Schema

When registering tools with the MCP server, Zod schemas are converted to JSON Schema format using the `convertZodSchemaToJsonSchema` utility:

```typescript
// From schema_converter.ts
export function convertZodSchemaToJsonSchema(schema: z.ZodTypeAny, name: string): any {
  try {
    const jsonSchema = zodToJsonSchema(schema, {
      $refStrategy: 'none',
      target: 'jsonSchema7'
    });
    
    return jsonSchema;
  } catch (error) {
    // Error handling...
  }
}
```

### 4. Tool Registration

Tools are registered with their schema:

```typescript
// For cloze_find_people
const paramSchema = module.paramSchema || {};
const jsonSchema = convertZodSchemaToJsonSchema(paramSchema, module.metadata.name);
const enhancedSchema = module.schemaEnhancements 
  ? enhanceJsonSchema(jsonSchema, module.schemaEnhancements)
  : jsonSchema;

registerTool(server, module.metadata.name, module.metadata.description, enhancedSchema, module.default);
```

## Parameter Validation Flow

1. **Definition**: Zod schemas define parameter types, constraints, and descriptions
2. **Enhancement**: Additional metadata like examples and descriptions are added
3. **Conversion**: Schemas are converted to JSON Schema when registering tools
4. **Transmission**: The MCP server sends schema information to clients via the tools/list endpoint
5. **Validation**: Clients can validate parameters against the schema before making requests
6. **Server Validation**: The server performs final validation of parameters when handling requests

## Testing Schema Transmission

We've implemented a test client that verifies schema transmission to clients.

### Using the Schema Test Client

The test client in `src/test-client/schema-test.cjs` can be used to verify schema transmission:

```bash
# Build the project first
npm run build

# Run the test client
node src/test-client/schema-test.cjs
```

The test client:
1. Launches an MCP server with debug logging
2. Checks for schema information in the logs
3. Validates that the schema has the expected structure and enhancements

### Running Manual Tests

You can also manually test schema transmission by:

1. Setting the DEBUG_SCHEMA environment variable:

```bash
DEBUG_SCHEMA=true npm start
```

2. Connecting with an MCP client (like Claude Desktop)
3. Checking the server logs for schema information

## Adding Schemas to New Tools

When implementing a new tool:

1. Define a Zod schema for parameters and export it as `paramSchema`
2. Add schema enhancements (examples, descriptions) as `schemaEnhancements`
3. Register the tool with the schema in `server.ts`

Example:

```typescript
// Define and export schema
export const paramSchema = z.object({
  // Parameter definitions...
});

// Add enhancements
export const schemaEnhancements = {
  // Enhancement definitions...
};

// Export metadata for registration
export const metadata = {
  name: 'your_tool_name',
  description: `Tool description...`
};
```

## Troubleshooting

If schema information isn't being transmitted properly:

1. Verify the tool exports a `paramSchema` object
2. Check that the schema is being properly converted to JSON Schema
3. Enable debug logging with `DEBUG_SCHEMA=true`
4. Verify the MCP client is correctly requesting and processing tools/list data

## References

- [MCP Protocol Documentation](https://modelcontextprotocol.io/docs/concepts/tools)
- [Zod Documentation](https://github.com/colinhacks/zod)
- [JSON Schema Documentation](https://json-schema.org/learn/getting-started-step-by-step)