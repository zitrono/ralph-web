# Claude Desktop Parameter Format Documentation

This document explains the parameter format that Claude Desktop uses when communicating with MCP servers, and how our implementation handles it.

## Overview

Claude Desktop passes parameters to MCP servers in a specific format that can be challenging to handle correctly. Based on our investigation, we've discovered several key aspects of the parameter format:

1. Claude Desktop uses a format where parameters are nested inside a `parameters` object
2. The tool name is included as a separate field
3. In some cases, parameter names may be wrapped in backticks (`` ` ``)

## Observed Parameter Formats

Through our enhanced logging system, we've observed these parameter formats:

### Standard Claude Desktop Format

```json
{
  "name": "cloze_find_people",
  "parameters": {
    "freeformquery": "Katja"
  }
}
```

This format includes a `name` field for the tool name and a `parameters` object containing the actual parameters.

### Backtick-Wrapped Format

We've observed instances where parameter keys are wrapped in backticks:

```json
{
  "name": "cloze_find_people",
  "parameters": {
    "`freeformquery`": "Katja"
  }
}
```

or in some cases, directly at the root level:

```json
{
  "`freeformquery`": "Katja"
}
```

These backtick-wrapped keys are particularly challenging to handle because they're not standard JSON and don't follow normal JavaScript property access patterns.

## Parameter Extraction Strategy

Our implementation now handles multiple parameter formats through a comprehensive extraction strategy:

1. **Check Direct Parameters**: First, look for parameters directly at the root level
   ```
   params.freeformquery
   ```

2. **Check Nested Parameters**: Check for parameters in the `parameters` object
   ```
   params.parameters.freeformquery
   ```

3. **Check Claude Desktop Format**: Look for the official format with both `name` and `parameters`
   ```
   params.name === "tool_name" && params.parameters.freeformquery
   ```

4. **Check MCP Format**: Look for parameters in the `arguments` object
   ```
   params.arguments.freeformquery
   ```

5. **Check External Request Format**: Look for parameters in the request context
   ```
   extra.request.params.arguments.freeformquery
   ```

6. **Special Case - Backtick Format**: Check for backtick-wrapped parameter names
   ```
   Object.keys(params).includes("`freeformquery`")
   ```

## Implementation Details

Our implementation now includes:

1. **Enhanced Logging**: Detailed logging of all parameter formats to dedicated files
2. **Specialized Parameter Extraction**: Logic to handle multiple parameter formats
3. **Backtick Format Detection**: Special handling for backtick-wrapped keys
4. **Debug Tools**: Specialized tools to inspect and understand parameter formats

### Key Files

- **src/tools/cloze_find_people.ts**: Enhanced to handle multiple parameter formats
- **src/tools/cloze_direct_find_people.ts**: Simplified implementation that bypasses schema validation
- **src/tools/cloze_debug_params.ts**: Debug tool for parameter inspection
- **src/logging.ts**: Enhanced logging for Claude Desktop parameter debugging
- **src/server.ts**: Server implementation with improved error handling and debugging

## Testing and Debugging

The system now includes several tools for testing and debugging parameter formats:

1. **Debug Script**: `debug-claude-desktop.sh` to run the server with enhanced logging
2. **Debug Tool**: `mcp__cloze__cloze_debug_params` tool for parameter inspection
3. **Direct Tool**: `mcp__cloze__cloze_direct_find_people` that bypasses schema validation
4. **Log Directory**: All Claude Desktop requests are logged to `logs/claude-desktop/`

## Recommended Approach

For developing tools that work reliably with Claude Desktop, we recommend:

1. Use a robust parameter extraction strategy that handles multiple formats
2. Always check for parameters in multiple locations
3. Include special handling for backtick-wrapped keys
4. Implement extensive logging to trace parameter passing
5. Use a debug tool to inspect parameters in real-time

## Conclusion

Claude Desktop's parameter format presents unique challenges, particularly with backtick-wrapped keys. Our enhanced implementation now handles these formats correctly, providing a robust solution for working with Claude Desktop.