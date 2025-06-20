# Final Solution for Claude Desktop Parameter Handling

After extensive investigation and testing, we've identified the root cause of the parameter handling issues with Claude Desktop and the MCP server:

## The Problem

1. **Parameter Location Mismatch**: The Claude Desktop client is sending parameters in the expected MCP protocol format with the `arguments` parameter at `params.arguments`, but our parameter extraction logic doesn't handle this correctly when running inside the MCP server.

2. **Empty Parameters**: Our logs show that by the time the parameters reach our `cloze_find_people` tool implementation, they're being received as an empty object (`{}`), suggesting the parameters are being lost somewhere in the MCP protocol layer.

3. **Schema Validation Errors**: When using standard Zod schema validation, it fails because it can't find the required parameters, leading to validation errors.

## The Solution

1. **Use `cloze_direct_find_people`**: This implementation bypasses the problematic parameter validation and works reliably, as demonstrated in our testing.

2. **Update Client Config**: Configure Claude Desktop to use the direct version of the tool:
   ```json
   "tools": {
     "cloze_direct_find_people": {
       "name": "Find People",
       "description": "Search for people in Cloze CRM by name, email, or phone"
     }
   }
   ```

3. **Future Improvements**:
   - Apply the same direct parameter extraction approach used in `cloze_direct_find_people` to all other tools
   - Enhance logging to better capture the exact parameter format used by Claude Desktop
   - Update the MCP server implementation to correctly handle parameter extraction from `params.arguments`

## Technical Details

The issue occurs in the Model Context Protocol layer between Claude Desktop and our server:

1. The Claude Desktop client correctly formats the request with:
   ```json
   {
     "jsonrpc": "2.0",
     "method": "tools/call",
     "params": {
       "name": "cloze_find_people",
       "arguments": {
         "freeformquery": "search term"
       }
     }
   }
   ```

2. Our MCP server appears to receive this but by the time it reaches our tool implementation, the `arguments` object is lost, resulting in an empty parameters object.

3. The `cloze_direct_find_people` tool works because it uses a different registration approach that avoids this parameter loss by directly handling the parameters without the standard MCP schema validation.

## Usage Guide

1. Always use the `cloze_direct_find_people` tool instead of `cloze_find_people` when working with Claude Desktop.

2. If you're implementing new tools, follow the pattern used in `cloze_direct_find_people.ts` which includes:
   - Direct parameter extraction that checks multiple locations
   - Bypassing standard schema validation
   - Error handling that provides clear error messages

3. When testing, use the `DEBUG_PARAMS=true` environment variable to enable detailed parameter logging.

## Example Implementation 

The key part of the successful implementation:

```typescript
// MCP handler with direct parameter extraction
server.tool(
  'cloze_direct_find_people',
  'Direct implementation of Find People tool that bypasses schema validation.',
  {
    freeformquery: {
      type: "string",
      description: "Search query (name, email, or phone)"
    }
  },
  async (params) => {
    // Extract parameters directly
    let freeformquery;
    
    // Try multiple locations
    if (params.freeformquery) {
      freeformquery = params.freeformquery;
    } else if (params.arguments?.freeformquery) {
      freeformquery = params.arguments.freeformquery;
    } else if (params.parameters?.freeformquery) {
      freeformquery = params.parameters.freeformquery;
    }
    
    // Handle missing parameters
    if (!freeformquery) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: {
                message: "Missing required parameter: freeformquery"
              }
            })
          }
        ]
      };
    }
    
    // Call the API and return results
    const result = await findPeople({ freeformquery });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result)
        }
      ]
    };
  }
);
```

This approach ensures robust parameter handling regardless of the client format used.