# Cloze MCP Integration

![License: Private](
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6)
![Build: Passing](https://img.shields.io/badge/Build-Passing-brightgreen)
project folder: /Users/zitrono/dev/cloze

> **TypeScript Update**: As of May 14, 2025, all TypeScript errors have been fixed. The codebase now builds without any TypeScript errors.

A  Model Context Protocol (MCP) implementation for integrating with the Cloze CRM API. This project provides essential tools for managing companies, people, and projects within Cloze, enabling Claude Desktop to interact with Cloze data and functionality.



## 🧪 Testing

See [TESTING.md](TESTING.md) for comprehensive testing documentation.

### Testing Principle: Claude Desktop Emulation

The core principle of our test framework is to **fully emulate Claude Desktop's interactions** with the MCP server. This ensures that what works in tests will work in production.

The consolidated test runner:
1. Spawns the actual MCP server process (not a mock)
2. Uses the exact same JSON-RPC protocol format as Claude Desktop
3. Sends real requests and captures genuine responses
4. Processes test results for verification
5. Properly cleans up the server process after testing
6. Provides detailed performance metrics and validation

This approach tests the entire request-response cycle exactly as it occurs in production, ensuring compatibility and catching parameter handling issues that might otherwise be missed.

### Live API Testing

All tests must use the live Cloze API. Mock implementations have been removed to ensure authentic testing results.

1. Create a `.env` file in the project root with your Cloze credentials:
   ```
   CLOZE_USER_EMAIL=your_email@example.com
   CLOZE_API_KEY=your_api_key
   DEBUG_CLOZE=false
   ```

2. Run tests using the consolidated test runner:
   ```bash
   # Run a specific workflow file
   npm run test workflows/person-find-updated.json
   
   # Test a multi-step workflow
   npm run test workflows/multi-step-updated.json
   
   # Test company operations
   npm run test workflows/company-basic-updated.json
   
   # Test a specific tool directly
   npm run test cloze_health_check
   
   # Test a tool with parameters
   npm run test cloze_find_person?name=John%20Doe
   
   # Run via predefined npm scripts
   npm test
   npm run test:basic
   npm run test:person
   npm run test:company
   npm run test:multi
   ```

The test framework automatically loads credentials from the `.env` file and uses them for all API requests. This ensures consistent behavior across development and production environments.

All workflow files are stored in the `/workflows` directory and follow a standardized format with support for variables, assertions, and performance monitoring.

### Workflow Format

Test workflows use a standardized JSON format that supports:

```json
{
  "name": "Workflow Name",
  "description": "Workflow description",
  "variables": {
    "timestamp": "{{Date.now()}}",
    "testPrefix": "cloze_test",
    "testEmail": "{{variables.testPrefix}}_{{variables.timestamp}}@example.com"
  },
  "tests": [
    {
      "name": "Step Name",
      "tool": "cloze_tool_name",
      "parameters": {
        "param1": "value1",
        "param2": "{{variables.testEmail}}"
      },
      "assertions": [
        "response.success === true",
        "response.data.errorcode === 0"
      ],
      "capture": {
        "someValue": "response.data.value",
        "latency": "performance.duration",
        "retries": "performance.retries || 0"
      }
    }
  ],
  "config": {
    "failFast": true,
    "timeout": 30000,
    "performanceMonitoring": {
      "detailed": true,
      "thresholds": {
        "find": {"warning": 500, "error": 2000}
      }
    }
  }
}
```

Key workflow features:
- **Dynamic Variables**: Support for expressions and variable substitution
- **Multi-step Flows**: Build complex test scenarios with step dependencies
- **Assertions**: Validate response data with flexible expressions
- **Variable Capture**: Extract data from responses for use in later steps
- **Performance Monitoring**: Capture and validate API performance metrics
- **Conditional Execution**: Run steps based on dynamic conditions

### Example Workflows

The repository includes several example workflows:

1. **person-find-updated.json**: Basic person search example
2. **company-basic-updated.json**: Company search and validation
3. **multi-step-updated.json**: Multi-step workflow with variable passing
4. **runner-validation.json**: Test runner validation workflow

These examples demonstrate the key features of the workflow format and can be used as templates for creating custom test workflows.

### Performance Monitoring

The test runner automatically captures performance metrics for each operation:

```json
"performance": {
  "duration": 632,
  "retries": 0,
  "startTime": 1747155882462,
  "endTime": 1747155883094
}
```

You can configure performance thresholds in the workflow configuration:

```json
"performanceMonitoring": {
  "detailed": true,
  "thresholds": {
    "find": {"warning": 500, "error": 2000},
    "create": {"warning": 1000, "error": 5000}
  }
}
```

This enables automatic detection of performance regressions and API latency issues.

## 🔍 Troubleshooting

### Server Won't Start

**Symptoms:**
- Error: `Error starting server: SyntaxError: Unexpected token`
- Error: `Error: Cannot find module`

**Solutions:**
1. Rebuild the project: `npm run build`
2. Check for TypeScript compilation errors
3. Verify that all dependencies are installed: `npm install`

### API Authentication Issues

**Symptoms:**
- Error: `Authentication failed`
- Error: `API returned error: Invalid API key`
- Error: `Missing Cloze API credentials`
- Tools returning `"success": false` with authentication errors

**Solutions:**
1. Verify your Cloze API credentials in `.env` file at project root
2. Ensure the API key is active and has the necessary permissions
3. Check network connectivity to the Cloze API
4. Run `cloze_health_check` tool to verify API connectivity:
   ```bash
   npm run test cloze_health_check
   ```
5. Use verbose logging for more details:
   ```bash
   DEBUG_CLOZE=true npm run test workflows/runner-validation.json
   ```
6. Verify credentials are being loaded correctly in server logs

### Test Runner Issues

**Symptoms:**
- Error: `Test file not found: workflows/file.json`
- Error: `Error running workflow: [...]`
- Error: `Variable resolution error: Cannot read property of undefined`

**Solutions:**
1. Verify workflow file path and format
2. Check for syntax errors in workflow JSON
3. Enable debug logging with `DEBUG_CLOZE=true`
4. Examine variable references for typos or undefined variables
5. Check assertion expressions for errors

### Response Processing Issues

**Symptoms:**
- Error: `Failed to capture variable: Cannot read properties of undefined`
- Error: `Assertion failed: response.data.people && response.data.people.length > 0`

**Solutions:**
1. Inspect the actual response format with debug logging
2. Check that your capture paths match the actual response structure
3. Adjust assertions to match the actual response format
4. Use optional chaining in expressions: `response.data?.people?.length > 0`

### Test Failures

**Symptoms:**
- Tests failing with API errors
- Tests failing with timeout errors
- Tests reporting parameter errors even with correct parameters
- Different results between test runner and Claude Desktop

**Solutions:**
1. Enable debug logging: `DEBUG_CLOZE=true npm run test workflows/runner-validation.json`
2. Check tool implementation for parameter extraction issues
3. Verify that tool implementation matches the Claude Desktop parameter format
4. Test API connectivity directly with cURL (see below)
5. For parameter issues, add logging to the tool handler to see the exact format of incoming parameters

### Claude Desktop Integration Issues

**Symptoms:**
- Tools working in test runner but failing in Claude Desktop
- Parameter errors in Claude Desktop logs
- Missing or incorrect responses in Claude Desktop

**Solutions:**
1. Verify the server is correctly started in Claude Desktop: 
   ```bash
   tail -f "$HOME/Library/Logs/Claude/mcp-server-cloze.log"
   ```
2. Check parameter handling in tool implementation - ensure it extracts parameters using all possible formats
3. Test the same tool with identical parameters using the test runner to compare behavior
4. Set `DEBUG_CLOZE=true` in Claude Desktop configuration for verbose logging
5. Restart Claude Desktop completely to apply configuration changes

### Running with Debug Output

For detailed logging of the test execution process:

```bash
DEBUG_CLOZE=true npm run test workflows/my-workflow.json
```

This will show:
- Raw request/response data
- Variable resolution steps
- Expression evaluation details
- Performance metrics
- Server communication details

### Debugging with cURL

You can test the Cloze API directly using cURL:

```bash
curl -s -X GET "https://api.cloze.com/v1/user/stages/people?user=YOUR_EMAIL&api_key=YOUR_API_KEY" \
-H "Content-Type: application/json" \
-H "Accept: application/json"
```

Replace `YOUR_EMAIL` and `YOUR_API_KEY` with your actual credentials.

## 📋 Parameter Handling

Robust parameter handling is crucial for compatibility between testing and Claude Desktop integration. 

### Parameter Format in Claude Desktop

Claude Desktop uses the following JSON-RPC format for tool calls:

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "cloze_find_person",
    "parameters": {
      "email": "test@example.com"
    }
  },
  "id": 123
}
```

In the MCP handler, these parameters can be accessed in different ways depending on the handler implementation:

### Best Practices for Parameter Extraction

1. **Use a Unified Extraction Method**:
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

2. **Validate Required Parameters**:
   ```typescript
   if (!params.email && !params.name && !params.phone) {
     return {
       success: false,
       error: 'At least one of email, name, or phone is required'
     };
   }
   ```

3. **Apply Parameter Transformations**:
   ```typescript
   // Set freeformquery from other parameters if needed
   if (!params.freeformquery) {
     if (params.query) params.freeformquery = params.query;
     else if (params.name) params.freeformquery = params.name;
     else if (params.email) params.freeformquery = params.email;
   }
   ```

4. **Always Log Parameter Source**:
   ```typescript
   logger.debug(`Extracted parameters from ${source}: ${JSON.stringify(params)}`);
   ```

5. **Test Multiple Parameter Formats**:
   Ensure your tool handlers work with parameters passed in various formats used by:
   - Claude Desktop production environment
   - Test framework
   - Direct MCP calls
   - Your test runner

By following these practices, you ensure your tools will work consistently across all environments.

## 🏗️ Architecture

This project follows a domain-driven architecture for maximum maintainability, with a focus on clear domain separation, consistent patterns, and extensive type safety.

For detailed architectural documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

The architecture document covers:
- Directory structure
- Domain organization
- Tool registration system
- Type system design
- Error handling patterns
- Validation approach
- Configuration management
- Field transformations
- Testing strategy
- Best practices

All contributors should review the architecture documentation before making changes.

### Testing Framework

The project includes a standardized testing framework that:
- Spawns the MCP server as a child process
- Uses direct JSON-RPC requests to test the implementation
- Simulates the communication pattern used by Claude Desktop
- Supports custom tool testing via command-line arguments
- Provides detailed output for debugging and verification

For a comprehensive description of the testing framework, see [readme-test.md](readme-test.md).

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Cloze account with API access
- API credentials (set in .env file)

### Configuration

Create a `.env` file in the project root with:

```
CLOZE_API_KEY=your_api_key_here
CLOZE_USER_EMAIL=your_email_here
DEBUG_CLOZE=false  # Set to true for detailed logging
```

**Important**: Always use live API credentials. Mock implementations have been removed to ensure authentic testing and behavior. The `.env` file is used by both the server and test infrastructure to ensure consistent credentials across all environments.

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Claude Desktop Integration

To integrate the MCP server with Claude Desktop, follow these steps:

1. **Update Claude Desktop configuration**:
   Edit the Claude Desktop configuration file at `~/Library/Application Support/Claude/claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "cloze": {
         "command": "node",
         "args": [
           "/Users/zitrono/dev/cloze/dist/index.js"
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
   }
   ```

2. **Restart Claude Desktop**:
   - Quit Claude Desktop completely (⌘Q)
   - Relaunch Claude Desktop

3. **Verify Integration**:
   - Check if the MCP server is running by looking at the log file:
     ```bash
     tail -f "$HOME/Library/Logs/Claude/mcp-server-cloze.log"
     ```
   - Test the integration by asking Claude to use Cloze tools

## 🔧 Available Tools

The implementation includes a comprehensive set of tools organized by category. All tools use the standard `cloze_` prefix.

### Health Tools
- `cloze_health_check` - Check the connection to Cloze API
- `cloze_get_connection_status` - Get detailed connection status information
- `cloze_reset_connection` - Reset the connection to the Cloze API

### People Tools
- `cloze_find_person` - Find a person by name or email
- `cloze_create_person` - Create a new person in Cloze
- `cloze_update_person` - Update an existing person in Cloze
- `cloze_person_communications` - Get communications history for a person

### Company Tools
- `cloze_find_company` - Find a company by name or domain
- `cloze_create_company` - Create a new company in Cloze
- `cloze_update_company` - Update an existing company in Cloze
- `cloze_company_communications` - Get communications history for a company
- `cloze_list_companies` - List companies in Cloze with optional filtering

### Project Tools
- `cloze_find_project` - Find a project by name or ID
- `cloze_create_project` - Create a new project in Cloze
- `cloze_update_project` - Update an existing project in Cloze
- `cloze_list_projects` - List projects in Cloze with optional filtering

### Communication Tools
- `cloze_add_note` - Add a note to Cloze
- `cloze_add_meeting` - Add a meeting to Cloze
- `cloze_log_email` - Log an email in Cloze
- `cloze_search_communications` - Search for communications in Cloze

### Timeline Tools
- `cloze_person_timeline` - Get a timeline of activities for a person
- `cloze_company_timeline` - Get a timeline of activities for a company
- `cloze_project_timeline` - Get a timeline of activities for a project

### Location Tools
- `cloze_company_locations` - Get the locations associated with a company
- `cloze_add_company_location` - Add a location to a company
- `cloze_find_nearby_companies` - Find companies near a specified location

## 📡 Direct Cloze API Access

The Cloze API can be accessed directly using standard HTTP requests:

### Authentication

The Cloze API uses query parameters for authentication:

```
?user=YOUR_EMAIL&api_key=YOUR_API_KEY
```

### API Endpoint Structure

The base URL is: `https://api.cloze.com`

Common endpoints:
- People: `/v1/people/...`
- Companies: `/v1/companies/...`
- Projects: `/v1/projects/...`
- User metadata: `/v1/user/...`

### Example cURL Commands

```bash
# Get People Stages
curl -s -X GET "https://api.cloze.com/v1/user/stages/people?user=YOUR_EMAIL&api_key=YOUR_API_KEY" \
-H "Content-Type: application/json" \
-H "Accept: application/json"
```

## 🧰 Test Framework Architecture

The testing framework is designed to provide accurate emulation of Claude Desktop's interaction with the MCP server:

### Core Test Framework Components

```
/test-consolidated.js       # Main test runner
/workflows/                 # Workflow directory
  runner-validation.json    # Test runner validation workflow
  person-find-updated.json  # Person search workflow
  company-basic-updated.json # Company operations workflow
  multi-step-updated.json   # Multi-step workflow example
```

### Test Framework Design

1. **Claude Desktop Protocol Emulation**: The test framework uses the exact same JSON-RPC protocol as Claude Desktop, ensuring format compatibility.

2. **Full Process Testing**: Each test:
   - Spawns a complete MCP server process
   - Initializes the server with the correct protocol version
   - Executes tools with properly formatted parameters
   - Captures and validates responses
   - Cleans up the process after testing

3. **Parameter Validation**: Tests validate that parameters are correctly passed and processed, capturing format inconsistencies.

4. **Real API Interaction**: Tests use the live Cloze API to ensure authentic behavior and response handling.

### Testing Best Practices

When implementing new tools or modifying existing ones:

1. **Create Workflow Files**: Always create workflow files for new tools in `/workflows/`.

2. **Test Parameter Variations**: Include tests for valid, invalid, and edge-case parameters.

3. **Test Tool Combinations**: For tools that work together (e.g., create + find), create multi-step workflows.

4. **Test Protocol Compatibility**: Ensure new tools handle parameters correctly in the Claude Desktop format.

5. **Run the Full Test Suite**: Before submitting changes, run both targeted tests and the full suite:
   ```bash
   # Test specific tools
   npm run test your-new-tool?param=value
   
   # Run validation tests to verify no regressions
   npm run test workflows/runner-validation.json
   ```

This testing approach ensures that what works in tests will work seamlessly when deployed with Claude Desktop.

## 📖 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Comprehensive architecture documentation
- [TESTING.md](TESTING.md) - Comprehensive testing documentation
- [ROADMAP.md](ROADMAP.md) - Development roadmap
- [CHANGELOG.md](CHANGELOG.md) - Version history and changes

## 📋 Overview

This MCP integration allows AI assistants like Claude to interact with the Cloze CRM using standardized MCP tools. It provides capabilities for:
- Finding and managing companies, people, and projects
- Adding notes and other communications
- Running health checks and diagnostics
- Self-testing capabilities to verify functionality

The project follows standardized testing and validation procedures using a flexible testing script to ensure reliability. All code changes must be verified with the test script before integration.