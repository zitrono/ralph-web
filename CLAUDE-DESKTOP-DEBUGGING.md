# Claude Desktop Parameter Debugging

This document explains how to debug Claude Desktop's parameter format issues with our enhanced logging system.

## Steps to Debug Claude Desktop Parameter Issues

1. **Run the debug script**

   ```bash
   ./debug-claude-desktop.sh
   ```

   This will start the MCP server with enhanced logging enabled. Leave this terminal window open.

2. **Configure Claude Desktop to use this MCP server**

   Ensure your Claude Desktop config is pointing to this server:

   ```json
   "mcpServers": {
     "cloze2": {
       "command": "node",
       "args": [
         "/path/to/cloze2/dist/index.js"
       ],
       "env": {
         "CLOZE_USER_EMAIL": "your_email@example.com",
         "CLOZE_API_KEY": "your_api_key",
         "DEBUG_CLOZE": "true",
         "CLAUDE_DESKTOP": "true",
         "MCP_MODE": "true"
       }
     }
   }
   ```

3. **Use the debug tools in Claude Desktop**

   In Claude Desktop, try using these tools to debug parameter passing:
   
   a. Use the debug tool to inspect parameter format:
   ```
   mcp__cloze__cloze_debug_params
   ```
   
   b. Try using the find people tool to search for someone:
   ```
   mcp__cloze__cloze_find_people
   ```
   or try:
   ```
   mcp__cloze__cloze_direct_find_people
   ```

4. **Check the log files**

   After using the tools, check the log files in the `logs/claude-desktop/` directory:
   
   ```bash
   ls -la logs/claude-desktop/
   ```
   
   Each request is logged in a separate JSON file with a timestamp. You can examine these files to see exactly what format Claude Desktop is sending.

5. **Analyze the results**

   The log files contain detailed information about the parameter format, including:
   - Raw parameters exactly as received
   - Parameter structure and types
   - Presence of backtick-wrapped keys
   - Nested parameter structures

## Common Parameter Formats

The server has been enhanced to handle multiple parameter formats:

1. **Direct format**:
   ```json
   { "freeformquery": "Katja" }
   ```

2. **Claude Desktop format** (name + parameters):
   ```json
   { "name": "cloze_find_people", "parameters": { "freeformquery": "Katja" } }
   ```

3. **MCP format**:
   ```json
   { "arguments": { "freeformquery": "Katja" } }
   ```

4. **Backtick-wrapped format** (detected in Claude Desktop):
   ```json
   { "`freeformquery`": "Katja" }
   ```

The server now includes enhanced logging and parameter extraction to handle all these formats.