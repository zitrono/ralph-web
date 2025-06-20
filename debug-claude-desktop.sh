#!/bin/bash
# Script to run the MCP server with enhanced debugging for Claude Desktop

# Create log directory
mkdir -p logs/claude-desktop

# Set environment variables for enhanced debugging
export LOG_LEVEL=debug
export DEBUG_CLAUDE=true
export CLAUDE_DESKTOP=true
export MCP_MODE=true
export DEBUG_PARAMS=true

echo "Starting MCP server with enhanced Claude Desktop debugging..."
echo "All Claude Desktop requests will be logged to logs/claude-desktop/"

# Build the project if needed
npm run build

# Start the server with node directly (not via npm script)
node dist/index.js

# Note: Leave this terminal window open while you use Claude Desktop
# After using Claude Desktop, check the logs in logs/claude-desktop/