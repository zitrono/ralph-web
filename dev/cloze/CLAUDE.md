# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 Project Research

* **Begin by reading** the following files in your project directory:

  * `/Users/zitrono/dev/cloze/README.md`
  * `/Users/zitrono/dev/cloze/ARCHITECTURE.md`

> **Do not change architecture without my explicit approval.**
> **Do not write any code until I explicitly ask you to or approve your request.**
> **NEVER modify this CLAUDE.md file unless explicitly asked by the user.**
> > Create all debug and temporary scripts and other files in /tmp


## 📝 Logs Location

* **Claude Desktop logs** for the cloze MCP server can be found at:

  ```
  /Users/zitrono/Library/Logs/Claude/mcp-server-cloze.log
  ```

## 🛠️ Common Commands

### Build & Run Commands

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server with build
npm start

# Run linting
npm run lint

# Format code
npm run format

# Run both lint and format checks
npm run check

# Clean build artifacts
npm run clean

# Clean logs (keeps latest 10)
npm run clean:logs
```

### Test Commands

```bash
# Run tests using the main test runner
npm test

# Run specific test workflow
npm run test workflows/person-find-updated.json

# Run specific test suite
npm run test:basic       # Basic tests
npm run test:person      # Person tools tests
npm run test:company     # Company tools tests
npm run test:multi       # Multi-step workflow tests

# Run specific tool directly
npm run test cloze_health_check

# Run tool with parameters
npm run test cloze_find_person?name=John%20Doe

# Run tests with debug logging
DEBUG_CLOZE=true npm run test workflows/runner-validation.json
```

### Swagger API Commands

```bash
# List all API endpoints
npm run swagger:endpoints

# Search for endpoints by tag
npm run swagger:tags

# Search for specific endpoint
npm run swagger:search -- "companies"
```

## Best Practices

When debugging issues or developing new features for the Cloze.com API:

1. **Test with cURL first** before updating any code.
2. **Query the Swagger file** directly using `jq` commands:

   ```bash
   # List all API endpoints
   jq '.paths | keys' /Users/zitrono/dev/cloze/cloze-swagger.json

   # Search for endpoints containing a keyword (replace "companies" with your term)
   jq '.paths | keys | map(select(. | contains("companies")))' \
     /Users/zitrono/dev/cloze/cloze-swagger.json

   # View detailed info for a specific endpoint (replace with your endpoint path)
   jq '.paths["/v1/companies/find"]' /Users/zitrono/dev/cloze/cloze-swagger.json

   # Example cURL test (fill in credentials):
   curl "https://api.cloze.com/v1/companies/find?user=zitrono@gmail.com&api_key=1bd86d77cb1e053284c9081fdf7f3323"
   ```

3. **Test Parameter Handling**:
   - Always check if parameters are being correctly extracted from different request formats
   - Test with standardized parameter formats as specified in README.md
   - Use the unified parameter extraction approach for all tool implementations

4. **Workflow Testing**:
   - When working with test workflows, ensure all steps (including optional ones) are being executed
   - Verify performance metrics are being captured correctly
   - Check that cleanup steps run properly to remove test data

## Parameter Handling System

- Always use the unified parameter extraction method as per the architecture document
- Follow best practices for parameter validation and transformation
- Use proper error handling for invalid parameters
- Do not use fallback values that might mask issues

The standard extraction method should handle multiple parameter formats:

```typescript
function extractParameters(context) {
  // Check common locations
  if (context?.params?.parameters) return context.params.parameters;
  if (context?.parameters) return context.parameters;
  if (context?._meta?.requestJSON?.params?.parameters) return context._meta.requestJSON.params.parameters;
  
  // Fallback to direct context for testing
  return context;
}
```

## Test Runner Architecture

The project uses a consolidated test runner that supports:

1. **Main Test Runner**: `test-consolidated.js` - Runs workflows and direct tool tests
2. **Workflow Framework**: Executes multi-step workflow JSON files with variables and assertions

Key test runner features:
- Dynamic variable resolution and substitution
- Multi-step testing with variable capture
- Assertions for validating responses
- Performance monitoring with configurable thresholds
- Real MCP server spawning for authentic testing

## Project Constraints

* **Language:** Stay within **TypeScript**. Do **not** switch to JavaScript.
* **Server Entry Point:** Only work with the main version at:

  ```
  /Users/zitrono/dev/cloze/src/index.ts
  ```

  * Ensure it's always registered in Claude Desktop config.
  * **Do not** create or use other server versions.

## Tools Registry

The codebase uses a centralized tool registry system. When implementing new tools:

1. Create the tool implementation following the domain-driven architecture
2. Register the tool using the standard registry mechanism
3. Follow the naming conventions (internal domain-specific name + standardized external name)
4. Add tests for the new tool

## API Authentication

All tools require proper Cloze API authentication:

1. Create a `.env` file in the project root with:
   ```
   CLOZE_USER_EMAIL=your_email@example.com
   CLOZE_API_KEY=your_api_key
   DEBUG_CLOZE=false  # Set to true for detailed logging
   ```

2. All API requests should use these credentials, obtained via environment variables
3. Authentication errors should be properly reported with clear error messages

## Troubleshooting

When encountering issues:

1. Enable debug logging: `DEBUG_CLOZE=true npm run test ...`
2. Check Claude Desktop logs: 
   ```bash
   tail -f "$HOME/Library/Logs/Claude/mcp-server-cloze.log"
   ```
3. Test directly with cURL to verify API behavior
4. Examine parameter extraction and validate actual request formats
5. For Claude Desktop integration issues, verify server registration and credentials