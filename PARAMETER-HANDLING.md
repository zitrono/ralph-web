# Parameter Handling in Cloze MCP Server

This document outlines the various parameter formats encountered when using the Cloze MCP server with different clients, focusing specifically on the issues with Claude Desktop's unique parameter format.

## Parameter Formats

The Cloze MCP server needs to handle several different parameter formats:

1. **Direct Format**: Parameters are passed directly at the root level
   ```json
   {
     "freeformquery": "test@example.com"
   }
   ```

2. **MCP Format**: Parameters are wrapped in an `arguments` object
   ```json
   {
     "arguments": {
       "freeformquery": "test@example.com"
     }
   }
   ```

3. **Claude Desktop Format**: Parameters are nested under a `parameters` object and the tool name is specified at the root level
   ```json
   {
     "name": "cloze_find_people",
     "parameters": {
       "freeformquery": "test@example.com"
     }
   }
   ```

4. **Backtick-Wrapped Format**: Some clients (like Claude Desktop) may wrap parameter keys in backticks
   ```json
   {
     `freeformquery`: `test@example.com`
   }
   ```

## Usage with Claude Desktop

When using Claude Desktop, you may encounter the following issues:

1. Parameter extraction fails due to the unique parameter format sent by Claude Desktop
2. Backtick-wrapped parameter keys cause JSON parsing errors
3. The `freeformquery` parameter may be nested or formatted in unexpected ways

## Solution Implementation

The Cloze MCP server has been enhanced to handle all these parameter formats through several approaches:

1. **Enhanced Parameter Extraction**: Using a unified parameter extraction strategy that checks multiple locations for parameters
2. **Robust Parameter Handling**: Identifying and properly handling backtick-wrapped parameter keys
3. **Detailed Logging**: Creating comprehensive logs to analyze parameter formats
4. **Direct Access**: Using direct parameter access with type checking for safety

## Testing Parameter Formats

To test parameter formats and ensure your tool can handle them:

1. Use the `cloze_debug_params` tool to see how parameters are being passed
2. Look at the log files in `logs/claude-desktop/` to see the exact parameter format
3. Try the `cloze_direct_find_people` tool which has enhanced parameter handling

## Debugging Parameter Issues

If you encounter parameter format issues:

1. Enable enhanced logging with `DEBUG_PARAMS=true` environment variable
2. Check the log files in `logs/claude-desktop/` for the exact parameter format
3. Use the debug tool to trace parameter passing: `cloze_debug_params`
4. Try updating the parameter extraction logic to handle the specific format

## Implementation Details

The enhanced parameter extraction logic looks something like this:

```typescript
function extractParameters(params: any): any {
  // Case 1: Direct parameters
  if (params.freeformquery) {
    return params;
  }
  
  // Case 2: MCP format with arguments
  if (params.arguments && params.arguments.freeformquery) {
    return params.arguments;
  }
  
  // Case 3: Claude Desktop format with parameters
  if (params.parameters && params.parameters.freeformquery) {
    return params.parameters;
  }
  
  // Case 4: Special handling for backtick-wrapped keys
  for (const key in params) {
    if (key === '`freeformquery`' || key.includes('freeformquery')) {
      return { freeformquery: params[key] };
    }
    
    // Check one level deeper for nested objects
    if (typeof params[key] === 'object' && params[key] !== null) {
      for (const nestedKey in params[key]) {
        if (nestedKey === '`freeformquery`' || nestedKey.includes('freeformquery')) {
          return { freeformquery: params[key][nestedKey] };
        }
      }
    }
  }
  
  // If all else fails, return the original params
  return params;
}
```

## Recommendations

1. **Use Enhanced Parameter Validation**: Implement robust parameter extraction that can handle multiple formats
2. **Enable Detailed Logging**: Use detailed logging to understand how parameters are being passed
3. **Test with Multiple Clients**: Test your tools with different clients to ensure they work with all parameter formats
4. **Handle Edge Cases**: Be prepared for unusual parameter formats like backtick-wrapped keys