# Parameter Format Testing

This document explains how to use the parameter format testing scripts to diagnose issues with different MCP client parameter formats.

## Overview

The parameter format testing system allows you to:

1. Test how the MCP server handles different parameter formats from various clients
2. Validate that tools correctly parse and process parameters from Claude, Claude Desktop, and other MCP clients
3. Save detailed logs of the request/response cycle for analysis
4. Identify issues in parameter handling without modifying the production code

## Available Parameter Formats

The following parameter formats can be tested:

- `direct`: Simple direct parameters `{ param1: "value1", param2: "value2" }`
- `claude`: Claude Web format `{ parameters: { param1: "value1", param2: "value2" } }`
- `claude_desktop`: Claude Desktop format `{ name: "tool_name", parameters: { param1: "value1", param2: "value2" } }`
- `mcp`: MCP format `{ arguments: { param1: "value1", param2: "value2" } }`

## Usage

### Testing All Formats at Once

The easiest way to test is to use the `test:all-formats` npm script:

```bash
# Basic usage with default tool (cloze_find_people) and value (Katja)
npm run test:all-formats

# Specify a different tool
npm run test:all-formats -- cloze_direct_find_people

# Specify a tool and test value
npm run test:all-formats -- cloze_find_people "John"
```

This will run tests for all parameter formats and save the results in the `logs` directory. The test runner will also provide a summary of which format tests passed or failed.

### Testing a Specific Format

To test a specific parameter format:

```bash
# Format: npm run test:param-format <tool_name> <format> <log_file> [test_value]

# Test the cloze_find_people tool with Claude Desktop format
npm run test:param-format cloze_find_people claude_desktop param-test.json "Katja"
```

## Analyzing Test Results

The test results are saved as JSON files in the `logs` directory. Each file contains:

- `tool_name`: The name of the tool that was tested
- `param_format`: The parameter format that was used
- `raw_params`: The exact parameters that were sent to the tool
- `result`: The response from the tool (or error information if it failed)

You can use these logs to:

1. Compare how different parameter formats are handled
2. Identify which formats work and which don't
3. Diagnose issues in parameter extraction and validation
4. Verify that fixes for parameter handling are working

## Extending the Tests

The parameter testing system is designed to be extensible:

- Add new parameter formats by modifying the `createTestParams` function in `src/test-runner/param_tester.ts`
- Add support for new tools by updating the base parameters in the `main` function
- Customize test values via command line arguments
- Add additional logging or output formats as needed

## Debugging Tips

- Set the `LOG_LEVEL=debug` environment variable for more detailed logging:
  ```bash
  LOG_LEVEL=debug npm run test:all-formats
  ```

- Look for "Raw test flag detected" in the logs to confirm parameters are being passed through without modification

- Enable parameter debugging in the MCP server to see detailed parameter processing:
  ```bash
  DEBUG_PARAMS=true npm run test:param-format cloze_find_people direct param-debug.json
  ```

- Compare logs across different parameter formats to identify which format works best

- When developing a solution, focus on fixing the format that Claude Desktop uses (the `claude_desktop` format)

- For the most thorough testing, run parameter format tests for both the standard and direct implementations of a tool:
  ```bash
  npm run test:all-formats -- cloze_find_people
  npm run test:all-formats -- cloze_direct_find_people
  ```