# MCP Schema Validation Fix Action Plan

This document outlines the steps required to fix the schema validation issues between the MCP client and server in the Cloze CRM integration.

## Problem Statement

The MCP server is failing to validate parameters properly, resulting in validation errors even when parameters appear to be correctly provided. The root cause is a mismatch between how the MCP client formats parameters and how the server expects to receive them.

## Action Plan

### Server-side Changes

#### 1. Simplify Schema Registration
Instead of the complex schema conversion process, directly use Zod schemas in the `server.tool()` method. The MCP SDK can handle Zod schemas natively.

```typescript
// Before:
const jsonSchema = convertZodSchemaToJsonSchema(paramSchema, name);
server.tool(name, description, jsonSchema, handler);

// After:
server.tool(name, description, paramSchema, handler);
```

#### 2. Update the registerTool Function
Remove the schema conversion logic from `registerTool` and directly pass the Zod schema:

```typescript
export const registerTool = (
  server: McpServer,
  name: string,
  description: string,
  paramSchema: z.ZodType<any>,
  handler: any
): void => {
  logger.debug(`Registering tool: ${name}`);
  server.tool(name, description, paramSchema, handler);
};
```

#### 3. Standardize Tool Registration
Update all tool registrations in `registerTools` to use the same pattern:

```typescript
// For every tool import:
import('./tools/cloze_find_people.js').then(module => {
  registerTool(
    server, 
    module.metadata.name, 
    module.metadata.description, 
    module.paramSchema, 
    module.default
  );
}).catch(error => {
  logger.error(`Failed to register tool: ${error.message}`);
});
```

#### 4. Fix Parameter Validation
Update the parameter validation to properly handle MCP format:

```typescript
// In param_validation_enhanced.ts
export const withEnhancedParamValidation = <T>(
  schema: z.ZodType<T>,
  handler: (params: T) => Promise<any>
) => {
  return async (params: Record<string, any>) => {
    // Check if params is nested in an 'arguments' field (MCP format)
    const actualParams = params.arguments || params;
    
    try {
      const result = schema.safeParse(actualParams);
      // Rest of validation logic...
    } catch (error) {
      // Error handling...
    }
  };
};
```

### Debugging and Testing

#### 5. Add Debug Logging
Add detailed logging to trace parameter transformation between client and server:

```typescript
// In your handler:
logger.debug('Raw params received:', JSON.stringify(params));
// After extracting parameters:
logger.debug('Processed params:', JSON.stringify(actualParams));
```

#### 6. Test with Reference Implementation
Create a simple test that uses both the reference MCP client and your server to verify proper parameter passing:

```javascript
// Example test script
const testMcpInteraction = async () => {
  // Start your server
  const server = startServer();
  
  // Use reference MCP client to connect
  const client = connectReferenceClient(server);
  
  // Make test calls
  const result = await client.callTool('cloze_find_people', {
    freeformquery: 'test@example.com'
  });
  
  console.log('Test result:', result);
};
```

### Client-side Fixes

#### 7. Update Parameter Handling in Tool Handlers
Make sure handlers extract parameters correctly from the MCP request format:

```typescript
// In tool handlers
const handler = async (params: any) => {
  // Extract parameters from possible MCP format
  const { freeformquery } = params.arguments || params;
  
  // Rest of handler logic...
};
```

#### 8. Fix Argument Parsing in MCP Client
The MCP client may need to be updated to format parameters correctly:

```typescript
// In MCP client wrapper for tools
const callClozeFindPeople = async (params) => {
  // Format parameters correctly for MCP
  const mcpParams = {
    name: 'cloze_find_people',
    arguments: params // Ensure parameters are in the correct format
  };
  
  return await client.request({
    method: 'tools/call',
    params: mcpParams
  });
};
```

#### 9. Implement Parameter Preprocessing
Add preprocessing to handle nested parameters:

```typescript
// Utility function to preprocess parameters
const preprocessParams = (params: any): any => {
  // If parameters are already in the right format, return as is
  if (params.freeformquery !== undefined) return params;
  
  // If parameters are nested in arguments, extract them
  if (params.arguments && params.arguments.freeformquery) {
    return params.arguments;
  }
  
  // Handle other potential formats
  return params;
};
```

### Verification

#### 10. Create Verification Tests
Create comprehensive tests to verify tools work with the MCP client:

```typescript
// Test suite for MCP integration
const testMcpIntegration = async () => {
  // Test various parameter formats
  await testToolWithParams('cloze_find_people', { freeformquery: 'test' });
  await testToolWithParams('cloze_find_people', { arguments: { freeformquery: 'test' } });
  
  // Test all tools
  for (const tool of getAllTools()) {
    await testToolWithValidParams(tool.name);
  }
};
```

## Implementation Strategy

1. **Start with parameter validation fixes** (Step 4): This is the most critical change and may resolve many issues immediately.
2. **Add debug logging** (Step 5): This will help identify exactly how parameters are being passed.
3. **Update tool handlers** (Step 7): Make handlers more robust by handling different parameter formats.
4. **Simplify schema registration** (Steps 1-3): Once parameter handling is working, simplify the schema registration process.
5. **Test and verify** (Steps 6, 10): Create tests to ensure everything works correctly.
6. **Update MCP client if needed** (Steps 8-9): If server-side changes aren't sufficient, modify the client-side code.

## Expected Outcomes

- All MCP tools will properly validate parameters
- `cloze_find_people` and other tools will work correctly with the MCP client
- Schema validation errors will be clear and actionable
- The codebase will be simplified by removing unnecessary schema conversion

## Verification Steps

After implementing these changes, validate by:

1. Testing all tools with the MCP client
2. Verifying parameter validation works correctly
3. Checking debug logs to confirm parameters are being processed correctly
4. Running the schema verification scripts to ensure all tools have proper schemas