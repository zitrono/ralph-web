# Cloze CRM MCP Server Architecture

This document outlines the architecture of the Cloze CRM MCP (Model Context Protocol) server implementation.

## Overview

The Cloze CRM MCP server provides a bridge between AI assistants like Claude and the Cloze CRM system. It implements a set of tools that allow AI assistants to perform operations on Cloze CRM data, such as managing people, companies, projects, and communications.

The server is designed to be:
- Simple and maintainable
- Easy to understand for AI assistants without context
- Reliable with comprehensive logging
- Well-tested with workflow-based tests

## Project Structure

```
cloze-mcp/
├── src/
│   ├── index.ts                         # Main entry point
│   ├── config.ts                        # Configuration management
│   ├── logging.ts                       # Logging utilities
│   ├── server.ts                        # MCP server setup
│   ├── api/
│   │   ├── client.ts                    # Base API client
│   │   ├── types.ts                     # API types and interfaces
│   │   └── utils.ts                     # Shared API utilities
│   ├── tools/
│   │   ├── cloze_add_company_location.ts
│   │   ├── cloze_add_people_location.ts
│   │   ├── cloze_communications_company.ts
│   │   ├── cloze_communication_add_meeting.ts
│   │   ├── cloze_communication_add_note.ts
│   │   ├── cloze_communication_log_email.ts
│   │   ├── cloze_company_locations.ts
│   │   ├── cloze_create_company.ts
│   │   ├── cloze_create_company_tag.ts
│   │   ├── cloze_create_people.ts
│   │   ├── cloze_create_people_tag.ts
│   │   ├── cloze_create_project.ts
│   │   ├── cloze_delete_company_tag.ts
│   │   ├── cloze_delete_people.ts
│   │   ├── cloze_delete_people_tag.ts
│   │   ├── cloze_find_company.ts
│   │   ├── cloze_find_nearby_companies.ts
│   │   ├── cloze_find_nearby_people.ts
│   │   ├── cloze_find_people.ts
│   │   ├── cloze_find_project.ts
│   │   ├── cloze_health_health_check.ts
│   │   ├── cloze_health_health_connection_status.ts
│   │   ├── cloze_health_health_reset_connection.ts
│   │   ├── cloze_list_companies.ts
│   │   ├── cloze_list_projects.ts
│   │   ├── cloze_metadata_get_segments.ts
│   │   ├── cloze_metadata_get_stages.ts
│   │   ├── cloze_metadata_raw.ts
│   │   ├── cloze_people_locations.ts
│   │   ├── cloze_read_company_tag.ts
│   │   ├── cloze_read_people_tag.ts
│   │   ├── cloze_update_company.ts
│   │   ├── cloze_update_company_tag.ts
│   │   ├── cloze_update_people.ts
│   │   ├── cloze_update_people_tag.ts
│   │   ├── cloze_update_project.ts
│   │   └── utils/                       # Shared tool utilities
│   │       ├── param_validation.ts      # Parameter validation helpers
│   │       ├── error_handling.ts        # Error handling utilities
│   │       └── response_formatting.ts   # Response formatting utilities
│   └── test-runner/                     # Test runner implementation
│       ├── runner.ts                    # Test runner core
│       ├── utils.ts                     # Test utilities
│       └── workflows/                   # Test workflow definitions
├── tests/
│   ├── workflows/
│   │   ├── people_workflow.ts           # Complete people lifecycle test
│   │   ├── company_workflow.ts          # Complete company lifecycle test
│   │   ├── project_workflow.ts          # Complete project lifecycle test
│   │   ├── communications_workflow.ts   # Communications test
│   │   ├── tags_workflow.ts             # Tags management test
│   │   └── locations_workflow.ts        # Location-based test
│   └── utils/                           # Test helper utilities
├── dist/                                # Compiled code
├── tsconfig.json                        # TypeScript configuration
├── package.json                         # Package configuration
└── .env.example                         # Example environment variables
```

## Core Components

### 1. MCP Server

The MCP server is built on the Model Context Protocol SDK and is responsible for:
- Registering tools with the MCP protocol
- Handling client requests
- Routing requests to the appropriate tool implementation
- Managing error handling and logging

Key files:
- `src/server.ts`: Sets up the MCP server and registers tools
- `src/index.ts`: Entry point that initializes the server

### 2. API Layer

The API layer is responsible for communication with the Cloze API:
- Manages authentication with Cloze API
- Handles HTTP requests and responses
- Provides a consistent interface for all Cloze API operations

Key files:
- `src/api/client.ts`: Base API client with authentication and request handling
- `src/api/types.ts`: TypeScript interfaces for Cloze API data structures
- `src/api/utils.ts`: Shared utilities for API requests

### 3. Tool Layer

Each tool is implemented in its own file, providing a clean separation of concerns:
- Tools validate input parameters
- Tools call the appropriate API functions
- Tools format responses for the MCP client

Each tool file follows a consistent pattern:
- Define parameter schema with zod
- Define tool description with examples and valid values
- Implement the tool function that calls the API

### 4. Test Runner

The test runner is designed to:
- Start and stop the MCP server for each test
- Execute workflow-based tests that cover complete entity lifecycles
- Provide comprehensive logging for debugging

Key files:
- `src/test-runner/runner.ts`: Core test runner implementation
- `src/test-runner/workflows/*.ts`: Workflow definitions for tests
- `tests/workflows/*.ts`: Test implementations

## Technical Implementation Details

### Authentication

The server supports authentication via:
- Environment variables for Cloze credentials
- Configuration for both test and Claude Desktop environments

```typescript
// Example configuration
interface Config {
  cloze: {
    userEmail: string;
    apiKey: string;
    debug: boolean;
  };
  server: {
    name: string;
    version: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}
```

### Error Handling

Error handling follows these principles:
- Cloze API errors are passed directly to the client for transparency
- Parameter validation errors include helpful messages with suggested values
- Comprehensive logging of errors for debugging

Error handling utilities provide consistent error formatting:
```typescript
// Example error handling
function handleApiError(error: any): McpToolResponse {
  const message = error?.response?.data?.message || error.message || 'Unknown error';
  const code = error?.response?.data?.errorcode || error.code || -1;
  
  logger.error(`API Error: ${message} (Code: ${code})`);
  
  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        error: {
          message,
          code
        }
      }, null, 2)
    }]
  };
}
```

### Logging

The logging system provides:
- Different log levels (debug, info, warn, error)
- Timestamps and contextual information
- Comprehensive logging of requests, responses, and errors

```typescript
// Example logging
const logger = {
  debug: (message: string, ...args: any[]) => {
    if (config.logging.level === 'debug') {
      console.error(`[${new Date().toISOString()}] [DEBUG] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    if (['debug', 'info'].includes(config.logging.level)) {
      console.error(`[${new Date().toISOString()}] [INFO] ${message}`, ...args);
    }
  },
  // ...other levels
};
```

### Parameter Validation

Parameter validation ensures:
- Required parameters are provided
- Parameters are of the correct type
- Helpful error messages are returned when validation fails
- Examples of valid values are provided in tool descriptions

```typescript
// Example parameter validation
const paramSchema = z.object({
  email: z.string().email('Invalid email format')
    .describe('Email address of the person to find'),
  pagesize: z.number().min(1).max(100).optional()
    .describe('Number of results per page (default: 10)')
});
```

## Testing Approach

The testing approach is based on workflow tests that:
- Test complete entity lifecycles (create, find, update, delete)
- Clean up after themselves to leave no test data behind
- Provide comprehensive coverage of all tools

Example workflow test:
```typescript
// Example workflow test for people
const peopleWorkflow = async () => {
  // 1. Create a person
  const person = await callTool('cloze_create_people', {
    name: 'Test Person',
    emails: [{ value: 'test@example.com' }],
    segment: 'customer',
    stage: 'lead'
  });
  
  // 2. Find the person
  const foundPerson = await callTool('cloze_find_people', {
    freeformquery: 'test@example.com'
  });
  
  // 3. Update the person
  await callTool('cloze_update_people', {
    emails: [{ value: 'test@example.com' }],
    segment: 'partner'
  });
  
  // 4. Delete the person
  await callTool('cloze_delete_people', {
    uniqueid: 'test@example.com'
  });
  
  // 5. Verify the person is deleted
  const findAfterDelete = await callTool('cloze_find_people', {
    freeformquery: 'test@example.com'
  });
  
  // Assert the person is not found
  assert(findAfterDelete.people.length === 0);
};
```

## API Documentation

Each tool implementation includes inline documentation in its implementation file:
- Description of what the tool does
- Required and optional parameters with descriptions
- Valid values for enumerated parameters
- Example usage
- Response format
- Error codes and their meanings

For comprehensive API documentation, see:
- [MCP Tools Reference](./docs/api/reference/mcp-tools-reference.md) - Complete reference for all MCP tools
- [Schema Reference](./docs/api/reference/schema-reference.md) - Detailed schema information for data structures
- [Integration Guide](./docs/api/integration-guide.md) - Guide for integrating with the MCP server
- [Examples](./docs/api/examples.md) - Practical usage examples for all tools

## Development Approach

The development follows a stepwise approach:
1. Implement core infrastructure (server, API client, logging)
2. Implement People CRUD tools as a foundation
3. Add other entity tools (companies, projects, communications)
4. Create workflow tests for all functionality
5. Test with Claude Desktop

This approach ensures a solid foundation is built first, then expanded to cover all functionality.