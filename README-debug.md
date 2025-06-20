# Parameter Format Debug Tools

This directory contains tools to debug parameter format issues between Claude Desktop and the MCP server.

## Debug Scripts

### debug-param-format.js

Tests actual parameter handling by making API calls to the cloze_debug_params and cloze_direct_find_people tools.

```bash
# Make sure MCP server is running first
node debug-param-format.js
```

### compare-param-formats.js

Shows a side-by-side comparison of different parameter formats used by various clients.

```bash
node compare-param-formats.js
```

## Running the Debug

1. Start the MCP server in a separate terminal:
   ```bash
   npm start
   ```

2. Run the debug script:
   ```bash
   node debug-param-format.js
   ```

3. Check the logs in `logs/param-debug/` directory to see the parameter format
   details and server responses.

## Parameter Format Differences

- **Claude Desktop Format**: Passes parameters directly without a `params` wrapper
- **Standard MCP Format**: Uses a `params` wrapper object
- **Direct Tool Format**: Expects parameters in the direct object format

The debug tools will help identify which format is causing validation issues.