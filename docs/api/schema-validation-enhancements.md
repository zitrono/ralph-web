# Schema Validation Enhancements

This document provides a comprehensive overview of the schema validation enhancements implemented for the Cloze MCP server.

## Table of Contents

1. [Introduction](#introduction)
2. [Schema Converter Utility](#schema-converter-utility)
3. [Enhanced Validation](#enhanced-validation)
4. [Standardized Tool Implementation](#standardized-tool-implementation)
5. [Client-Side Validation](#client-side-validation)
6. [Testing and Verification](#testing-and-verification)
7. [Usage Examples](#usage-examples)

## Introduction

Schema validation is a critical part of the MCP protocol. It ensures that tool parameters are properly validated before execution, providing better error messages and examples to users. This document describes the enhanced schema validation system implemented in this codebase.

Key components of the enhanced schema validation system:

- **Schema Converter**: Converts Zod schemas to JSON Schema format
- **Enhanced Validation**: Provides better error messages with examples
- **Standardized Tool Implementation**: Ensures consistent schema definition across all tools
- **Client-Side Validation**: Validates parameters before sending to the server
- **Testing Utilities**: Verifies proper schema implementation and transmission

## Schema Converter Utility

The schema converter (`schema_converter.ts`) is responsible for converting Zod schemas to JSON Schema format for MCP tool registration.

### Key Functions

1. `convertZodSchemaToJsonSchema`: Converts a Zod schema to JSON Schema format
2. `enhanceJsonSchema`: Enhances a JSON Schema with examples and improved descriptions

### Usage

```typescript
import { z } from 'zod';
import { convertZodSchemaToJsonSchema, enhanceJsonSchema } from './utils/schema_converter.js';

// Define a Zod schema
const schema = z.object({
  name: z.string().describe('The name of the person'),
  age: z.number().min(0).max(120).describe('Age in years')
});

// Convert to JSON Schema
const jsonSchema = convertZodSchemaToJsonSchema(schema, 'person');

// Define schema enhancements
const enhancements = {
  name: {
    examples: ['John Doe', 'Jane Smith'],
    description: 'Full name of the person'
  },
  age: {
    examples: [25, 30, 45],
    description: 'Age in years (must be between 0 and 120)'
  }
};

// Enhance the JSON Schema
const enhancedSchema = enhanceJsonSchema(jsonSchema, enhancements);
```

## Enhanced Validation

Enhanced validation (`param_validation_enhanced.ts`) provides improved error messages with examples for parameter validation failures.

### Key Functions

1. `createMissingParameterError`: Creates a user-friendly error for missing parameters
2. `createInvalidParameterError`: Creates a user-friendly error for invalid parameters
3. `withEnhancedParamValidation`: Middleware for validating parameters with improved messages
4. `createToolHandlerWithEnhancedValidation`: Creates a tool handler with enhanced validation

### Error Message Format

Enhanced error messages include:
- Parameter name
- Error description
- Parameter examples
- Additional context

Example:
```
freeformquery: Required
Description: Search query for finding people by name, email, or phone number
Examples: "john.doe@example.com", "Jane Smith", "+1 555-123-4567"
```

## Standardized Tool Implementation

To ensure consistent schema implementation across all tools, a standardization process has been implemented.

### Standardization Scripts

1. `standardize-tool.js`: Standardizes a single tool file
2. `standardize-all-tools.js`: Standardizes all tool files

### Standardized Tool Format

Each tool should follow this format:
- Export a Zod `paramSchema` for validation
- Export `schemaEnhancements` with examples and descriptions
- Use `createToolHandlerWithEnhancedValidation` for parameter validation

Example:
```typescript
export const paramSchema = z.object({
  name: z.string().describe('The name of the person')
});

export const schemaEnhancements = {
  name: {
    examples: ['John Doe', 'Jane Smith'],
    description: 'Full name of the person'
  }
};

export default createToolHandlerWithEnhancedValidation(
  paramSchema, 
  schemaEnhancements, 
  handler, 
  transformResponse
);
```

## Client-Side Validation

Client-side validation (`client-schema-validation.js`) enables validation of parameters before sending requests to the server, providing faster feedback and reducing server load.

### Key Components

1. `ValidatingMcpClient`: Extended MCP client with schema validation
2. `createValidatingClient`: Creates a validating client connected to an MCP server

### Usage

```javascript
import { createValidatingClient } from './client-schema-validation.js';

// Create a validating client
const { client, serverProcess } = await createValidatingClient();

try {
  // Call a tool with validation
  const result = await client.callTool('cloze_find_people', {
    freeformquery: 'test@example.com'
  });

  console.log('Result:', result);
} finally {
  // Clean up
  await client.close();
  serverProcess.kill();
}
```

## Testing and Verification

Several utilities are provided for testing and verifying schema implementation and transmission.

### Verification Scripts

1. `verify-schemas-enhanced.js`: Checks all tools for proper schema implementation
2. `schema-test-esm.js`: Tests schema transmission for the MCP server (ESM version)
3. `comprehensive-test.js`: Tests the complete MCP server, including schemas

### Running Tests

```bash
# Verify schema implementation
npm run verify:schemas

# Test schema transmission
npm run test:schema

# Run comprehensive tests
npm run test:mcp

# Run unit tests for schema converter
npm run test:unit

# Run client-side validation example
npm run validate:example
```

## Usage Examples

This section provides examples of how to use the enhanced schema validation system.

### Defining a Tool with Enhanced Validation

```typescript
import { z } from 'zod';
import { createToolHandlerWithEnhancedValidation } from './utils/index.js';
import logger from '../logging.js';

// Define parameter schema
export const paramSchema = z.object({
  query: z.string().describe('Search query'),
  pagesize: z.number().min(1).max(100).optional().describe('Results per page')
});

// Define schema enhancements
export const schemaEnhancements = {
  query: {
    examples: ['example query', 'another query'],
    description: 'Search query to find records'
  },
  pagesize: {
    examples: [10, 25, 50],
    description: 'Number of results per page (1-100)'
  }
};

// Define handler function
const handler = async (params) => {
  logger.info('Handling request with params:', params);
  
  // Call API function
  const response = await someApiFunction(params);
  
  return response;
};

// Create tool handler with enhanced validation
export default createToolHandlerWithEnhancedValidation(
  paramSchema, 
  schemaEnhancements, 
  handler
);
```

### Client-Side Validation Example

```javascript
import { ValidatingMcpClient } from './client-schema-validation.js';

// Example of client-side validation
async function clientExample() {
  // Create validating client
  const { client, serverProcess } = await createValidatingClient();
  
  try {
    // Valid input example
    const result1 = await client.callTool('cloze_find_people', {
      freeformquery: 'john.doe@example.com'
    });
    console.log('Valid result:', result1);
    
    // Invalid input example (will throw an error)
    try {
      await client.callTool('cloze_find_people', {
        // Missing required parameter
      });
    } catch (error) {
      console.error('Expected error:', error.message);
    }
  } finally {
    // Clean up
    await client.close();
    serverProcess.kill();
  }
}
```

---

For more details on specific components, see:
- [Schema Validation](./schema-validation.md)
- [MCP Tools Reference](./reference/mcp-tools-reference.md)
- [Schema Reference](./reference/schema-reference.md)