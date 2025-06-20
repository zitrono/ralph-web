# Claude Desktop Parameter Handling Solution

## Issue Overview

After extensive testing and analysis, we have identified that Claude Desktop is sending parameters in a format that our Cloze MCP server is having trouble handling. The issue appears to be related to:

1. Parameter format mismatches between what Claude Desktop sends and what our server expects
2. Potentially backtick-wrapped parameter keys causing JSON parsing issues
3. Complex nesting of parameters that makes extraction challenging

## Testing Results

We've tested several parameter formats:

1. **Direct Format**:
   ```json
   {
     "freeformquery": "test@example.com"
   }
   ```
   This format works correctly when sent directly, but appears to break in the MCP pipeline.

2. **MCP Format**:
   ```json
   {
     "arguments": {
       "freeformquery": "test@example.com"
     }
   }
   ```
   This format seems to be getting lost in translation between the client and our server.

3. **Claude Desktop Format**:
   ```json
   {
     "name": "cloze_find_people",
     "parameters": {
       "freeformquery": "test@example.com"
     }
   }
   ```
   Our simulation of this format is being rejected by the server.

4. **Backtick-Wrapped Format**:
   ```json
   {
     `freeformquery`: `test@example.com`
   }
   ```
   This unusual format might be what Claude Desktop is actually sending.

## Current Status

1. We've added extensive logging to capture the exact parameter format that Claude Desktop is sending
2. We've implemented a hybrid parameter extraction approach in `cloze_find_people.ts` that tries multiple methods to extract parameters
3. We've created a direct implementation (`cloze_direct_find_people`) that bypasses the standard schema validation
4. We've documented the various parameter formats and our solution approach

## Potential Solutions

1. **Enhanced Parameter Extraction**:
   The current approach checks multiple parameter formats and tries to extract the request in different ways. This should handle most formats including the backtick-wrapped format.

2. **Log-Driven Development**:
   Our enhanced logging will capture the exact format used by Claude Desktop, allowing us to further refine our solution.

3. **Direct Tool Implementation**:
   The `cloze_direct_find_people` tool bypasses schema validation and directly extracts parameters, which may be more robust.

## Next Steps

1. Test with actual Claude Desktop requests to capture the exact format
2. Analyze the log files generated during Claude Desktop interaction
3. Update the parameter extraction logic based on the actual format being used
4. Apply the solution approach to other tools if needed
5. Test again with Claude Desktop to verify the solution works

## Implementation Details

The enhanced parameter extraction logic in `cloze_find_people.ts` attempts the following extraction methods:

1. Direct extraction from the request object
2. Extraction from a nested `parameters` object (Claude Desktop format)
3. Extraction from a nested `arguments` object (MCP format)
4. Special handling for backtick-wrapped keys
5. Traversal of all object properties to find parameter-like values

This multi-level approach should handle most parameter formats, including unusual ones like backtick-wrapped keys.

## Additional Testing

We should create a test harness that simulates the exact Claude Desktop request format and verify our solution works correctly. This will involve:

1. Capturing an actual Claude Desktop request through our enhanced logging
2. Creating a test script that replicates this exact format
3. Running the test against our enhanced implementation
4. Verifying that parameters are correctly extracted and processed

## Recommendation

Continue to collect logs from actual Claude Desktop interactions to further refine our understanding of the parameter format issues. Use this data to implement a robust, well-tested solution that handles all parameter formats correctly.