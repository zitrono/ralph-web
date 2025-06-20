# Parameter Format Testing Tool

This tool helps identify which parameter format is expected by Claude Desktop when interacting with MCP servers. It tests multiple parameter formats to determine which one is compatible with the current implementation.

## Background

When developing MCP servers for Claude Desktop, it's important to understand how parameters are passed from Claude to the MCP server. Different clients may format parameters differently, and this tool helps identify which format works with the current implementation.

## Formats Tested

1. **Direct Format**
   ```json
   { "freeformquery": "Katja" }
   ```

2. **Wrapped Format**
   ```json
   { "parameters": { "freeformquery": "Katja" } }
   ```

3. **Claude Desktop Format**
   ```json
   { "name": "cloze_find_people", "parameters": { "freeformquery": "Katja" } }
   ```

4. **Arguments Format**
   ```json
   { "arguments": { "freeformquery": "Katja" } }
   ```

5. **MCP Function Call Format**
   ```json
   { "function_call": { "name": "cloze_find_people", "arguments": { "freeformquery": "Katja" } } }
   ```

## How to Run

1. Build the project:
   ```bash
   npm run build
   ```

2. Run the parameter format test:
   ```bash
   npm run test:parameter-formats
   ```

3. Or use the convenience script:
   ```bash
   ./test-parameter-formats.sh
   ```

## Interpreting Results

The test will create a summary report in `src/test-client/output/parameter-formats/summary-report.json`. This report shows which parameter formats were successful and which failed.

The detailed results for each format are saved in separate directories under `src/test-client/output/parameter-formats/`.

## Using the Debug Tool Directly

The `cloze_debug_params` tool can be used directly in Claude Desktop to debug parameter passing issues. When called, it returns detailed information about the parameters it received, allowing you to see exactly how Claude is formatting the parameters.

Example in Claude:
```
Use the cloze_debug_params tool to see how parameters are being formatted.
```

## Implementing Compatible Parameter Handling

Based on the test results, update your parameter handling code to support the formats that Claude Desktop uses. The most common approaches are:

1. Use the preprocessParams function in `src/tools/utils/param_validation_enhanced.ts` to handle multiple formats.
2. Update your tool handlers to accept parameters in the format Claude Desktop uses.

## Advanced Debugging

For more detailed debugging, set the DEBUG_PARAMS environment variable to true:

```bash
DEBUG_PARAMS=true npm run test:parameter-formats
```

This will enable additional parameter logging in the server output, making it easier to trace how parameters are being processed.