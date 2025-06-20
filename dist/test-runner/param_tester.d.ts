#!/usr/bin/env node
/**
 * Parameter Format Test Runner
 * Tests tool parameter handling with different parameter formats
 *
 * Usage: node param_tester.js <tool_name> <param_format> <log_file>
 *
 * param_format options:
 *   - direct - Direct parameters: { freeformquery: "value" }
 *   - claude - Claude Web format: { parameters: { freeformquery: "value" } }
 *   - claude_desktop - Claude Desktop format: { name: "tool", parameters: { freeformquery: "value" } }
 *   - mcp - MCP format: { arguments: { freeformquery: "value" } }
 */
export {};
