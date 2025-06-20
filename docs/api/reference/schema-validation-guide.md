# Schema Validation Guide

This guide provides detailed information on the schema validation system used in the Cloze MCP server, including how to implement and maintain robust schema validation for tools.

## Table of Contents

1. [Schema Definition](#schema-definition)
2. [Parameter Enhancement](#parameter-enhancement)
3. [Error Messages](#error-messages)
4. [Implementation Patterns](#implementation-patterns)
5. [Testing Schema Validation](#testing-schema-validation)
6. [Troubleshooting](#troubleshooting)

## Schema Definition

All MCP tools should define their parameter schemas using Zod, which provides a type-safe way to validate parameters.

### Basic Schema Definition

```typescript
import { z } from 'zod';

export const paramSchema = z.object({
  // Required parameters with descriptions
  name: z.string()
    .describe('Full name of the person'),
  
  emails: z.array(
    z.object({
      value: z.string().email().describe('Email address'),
      primary: z.boolean().optional().describe('Whether this is the primary email')
    })
  ).min(1).describe('Email addresses for the person'),
  
  // Optional parameters
  phones: z.array(personPhoneSchema).optional()
    .describe('Phone numbers for the person'),
  
  // Enums
  segment: personSegmentSchema
    .describe('Person segment (customer, partner, etc.)'),
  
  // Numbers with constraints
  pagesize: z.number().min(1).max(100).optional()
    .describe('Number of results per page (1-100)')
});
```

### Best Practices for Schema Definition

1. **Always include descriptions**: Use `.describe()` for all parameters
2. **Use appropriate types**: Match parameter types to their expected values
3. **Add constraints**: Use Zod's validators like `.min()`, `.max()`, `.email()`
4. **Group related fields**: Structure objects with related fields
5. **Document optional vs. required**: Make required parameters clear

## Parameter Enhancement

Schema enhancements provide additional information beyond what Zod can express, particularly examples, which are valuable for users.

### Example Enhancements

```typescript
export const schemaEnhancements = {
  name: {
    examples: ['John Doe', 'Jane Smith'],
    description: 'Full name of the person'
  },
  emails: {
    examples: [[{ value: 'john.doe@example.com', primary: true }]],
    description: 'Array of email addresses and their properties'
  },
  segment: {
    examples: ['customer', 'partner', 'competitor'],
    enumDescriptions: {
      'customer': 'Client or customer relationship',
      'partner': 'Business partner or ally',
      'competitor': 'Competitive relationship'
    }
  }
};
```

### Enhancement Types

1. **examples**: Example values for the parameter
2. **description**: Detailed description overriding the Zod description
3. **enumDescriptions**: Descriptions for enum values

## Error Messages

Enhanced error messages provide users with clear information about what went wrong and how to fix it.

### Error Message Format

```
Parameter: Required
Description: Detailed description of the parameter
Examples: "example1", "example2", 123
```

### Error Message Types

1. **Missing Required Parameter**:
   ```
   freeformquery: Required
   Description: Search query for finding people
   Examples: "john.doe@example.com", "Jane Smith"
   ```

2. **Invalid Parameter Type**:
   ```
   pagesize: Invalid value "ten". Expected number.
   Description: Number of results per page (1-100)
   Examples: 10, 25, 50
   ```

3. **Invalid Parameter Value**:
   ```
   pagesize: Invalid value 200. Expected number <= 100.
   Description: Number of results per page (1-100)
   Examples: 10, 25, 50
   ```

## Implementation Patterns

There are several patterns for implementing schema validation in tool handlers.

### Pattern 1: Enhanced Validation with Response Transformation

```typescript
// Define schema
export const paramSchema = z.object({
  // ... parameter definitions
});

// Define enhancements
export const schemaEnhancements = {
  // ... parameter enhancements
};

// Define handler function
const handler = async (params) => {
  // ... implementation
};

// Define response transformation function
const transformResponse = (response) => {
  return {
    // ... transformed response
  };
};

// Create tool handler with enhanced validation
export default createToolHandlerWithEnhancedValidation(
  paramSchema, 
  schemaEnhancements, 
  handler, 
  transformResponse
);
```

### Pattern 2: Enhanced Validation without Response Transformation

```typescript
// Define schema
export const paramSchema = z.object({
  // ... parameter definitions
});

// Define enhancements
export const schemaEnhancements = {
  // ... parameter enhancements
};

// Define handler function
const handler = async (params) => {
  // ... implementation
};

// Create tool handler with enhanced validation (no transformation)
export default createToolHandlerWithEnhancedValidation(
  paramSchema, 
  schemaEnhancements, 
  handler
);
```

## Testing Schema Validation

Several approaches can be used to test schema validation.

### Unit Testing

```typescript
// Example unit test for schema validation
describe('paramSchema', () => {
  test('should validate valid parameters', () => {
    const validParams = {
      name: 'John Doe',
      emails: [{ value: 'john.doe@example.com', primary: true }]
    };
    
    const result = paramSchema.safeParse(validParams);
    expect(result.success).toBe(true);
  });
  
  test('should reject invalid parameters', () => {
    const invalidParams = {
      // Missing required 'name' field
      emails: [{ value: 'not-an-email', primary: true }]
    };
    
    const result = paramSchema.safeParse(invalidParams);
    expect(result.success).toBe(false);
    expect(result.error.errors[0].path).toContain('name');
  });
});
```

### Integration Testing

```typescript
// Example integration test for schema validation
test('tool should reject invalid parameters', async () => {
  const client = new ValidatingMcpClient(serverProcess);
  await client.connect();
  
  try {
    await client.callTool('cloze_find_people', {
      // Missing required parameter
    });
    
    fail('Expected validation error');
  } catch (error) {
    expect(error.message).toContain('Required');
  } finally {
    await client.close();
  }
});
```

## Troubleshooting

Common issues with schema validation and their solutions.

### Schema Not Being Transmitted

**Problem**: The schema is defined but not being transmitted to clients.

**Solution**:
1. Ensure `DEBUG_SCHEMA=true` is set in the environment
2. Check that `registerTool` is properly converting the schema
3. Verify that the schema is exported as `paramSchema`

### Validation Not Using Enhanced Messages

**Problem**: Validation fails but doesn't show enhanced error messages.

**Solution**:
1. Ensure the tool uses `createToolHandlerWithEnhancedValidation`
2. Check that `schemaEnhancements` is exported and contains entries
3. Verify that parameter names match between the schema and enhancements

### Schema Conversion Errors

**Problem**: Schema fails to convert to JSON Schema format.

**Solution**:
1. Simplify complex schemas or custom validators
2. Use basic Zod types and validators
3. Add error handling for conversion failures

### Examples Not Showing in Errors

**Problem**: Error messages don't include examples.

**Solution**:
1. Ensure `schemaEnhancements` includes `examples` arrays
2. Make sure examples are of the correct type for the parameter
3. Check that the `createMissingParameterError` function is used

---

For more information, see:
- [Schema Validation Enhancements](../schema-validation-enhancements.md)
- [Schema Testing Tools](../../tools/schema-tools-guide.md)