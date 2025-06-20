# Cloze Integration Guide

This guide provides information on integrating with the Cloze CRM system via our MCP (Model Context Protocol) server. This integration allows AI assistants like Claude to interact with Cloze data programmatically.

## Table of Contents

1. [Overview](#overview)
2. [Integration Methods](#integration-methods)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Best Practices](#best-practices)
7. [Testing](#testing)
8. [Examples](#examples)

## Overview

The Cloze MCP integration provides a comprehensive set of tools to interact with the Cloze CRM. These tools are grouped into several categories:

- **People Tools**: Manage contacts/people in Cloze
- **Company Tools**: Manage companies in Cloze
- **Project Tools**: Manage projects in Cloze
- **Communication Tools**: Log meetings, notes, and emails
- **Metadata Tools**: Access Cloze metadata (segments, stages)
- **Health Tools**: Check integration health and status

Each tool provides a specific function to create, read, update, or delete data in Cloze, or to retrieve metadata about the system.

## Integration Methods

### Claude Desktop Integration

The MCP server is designed to work with Claude Desktop as a plugin. To integrate:

1. Install the Cloze MCP server
2. Configure Claude Desktop to use the MCP server
3. Access Cloze tools directly from Claude

### Direct API Integration

For custom integrations, you can interact with the MCP server directly:

1. Make HTTP POST requests to the MCP server endpoint
2. Include the appropriate tool name and parameters
3. Process the JSON response from the server

## Authentication

Authentication is handled transparently through the MCP server, which manages the API keys and tokens required to interact with Cloze.

The MCP server requires:
- Cloze API Key
- Cloze User ID

These credentials should be provided in the server configuration and are securely stored by the MCP server.

## Error Handling

All tools follow a consistent error handling approach:

1. Success responses include:
   - `errorcode: 0`
   - `success: true`
   - `data: { ... }`

2. Error responses include:
   - `errorcode: [non-zero error code]`
   - `success: false`
   - `error: { message: "Error description", code: "ERROR_CODE" }`
   - Optional: `stack` (in development mode only)

Common error types:
- Authentication errors (401)
- Permission errors (403)
- Not found errors (404)
- Validation errors (422)
- Rate limiting errors (429)
- Server errors (500)

## Rate Limiting

The Cloze API implements rate limiting. The MCP server handles rate limit errors by:

1. Detecting rate limit responses from the Cloze API
2. Providing clear error messages indicating rate limiting
3. Suggesting appropriate retry intervals

To avoid rate limiting issues:
- Batch operations when possible
- Implement exponential backoff for retries
- Cache frequently accessed data

## Best Practices

### Efficient Data Access

- Use specific search criteria to minimize result sets
- Only request the data you need
- Cache metadata that changes infrequently

### Entity Relationship Management

- Maintain proper relationships between people, companies, and projects
- Use related entity fields when creating new entities
- Update relationship fields when appropriate

### Communication Logging

- Log all significant communications for complete records
- Associate communications with the appropriate entities
- Use consistent formatting for dates and times (ISO 8601)

### Error Handling

- Implement proper error handling for all tool calls
- Provide user-friendly error messages
- Retry transient errors with backoff

## Testing

### Test Environment

A test environment is available for integration testing without affecting production data. Configure the MCP server with test environment credentials.

### Test Workflows

The integration provides several test workflows to validate functionality:

1. People workflow
2. Company workflow
3. Project workflow
4. Communication workflow
5. Tag management workflow
6. Location-based workflow
7. Health and metadata workflow

### Validating Functionality

Use the `curl` command line tool to directly test the Cloze API functionality:

```bash
# Example: Get user profile
curl -X GET "https://api.cloze.com/v1/user/profile" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Accept: application/json"
```

This approach allows for precise validation of API functionality and debugging of issues without additional layers of abstraction.

## Examples

### Finding a Person

```javascript
// Using the MCP tool directly
const result = await callTool('cloze_find_people', {
  query: 'john@example.com'
});

// Process the result
if (result.success) {
  const people = result.data;
  console.log(`Found ${people.length} people`);
} else {
  console.error(`Error finding people: ${result.error.message}`);
}
```

### Creating a Meeting

```javascript
// Using the MCP tool directly
const result = await callTool('cloze_communication_add_meeting', {
  title: "Project Kickoff",
  date: "2023-09-15T14:00:00Z",
  duration: 60,
  location: "Conference Room A",
  notes: "Initial project discussion",
  participants: ["abc123", "def456"],
  status: "scheduled"
});

// Process the result
if (result.success) {
  const meeting = result.data;
  console.log(`Created meeting: ${meeting.id}`);
} else {
  console.error(`Error creating meeting: ${result.error.message}`);
}
```

### Getting Metadata

```javascript
// Using the MCP tool directly
const result = await callTool('cloze_metadata_get_stages', {
  entity_type: "projects"
});

// Process the result
if (result.success) {
  const stages = result.data;
  console.log(`Found ${stages.length} project stages`);
  stages.forEach(stage => {
    console.log(`- ${stage.name} (Order: ${stage.order})`);
  });
} else {
  console.error(`Error getting stages: ${result.error.message}`);
}
```

For detailed specifications of all available tools, please refer to the [MCP Tools Reference](./reference/mcp-tools-reference.md).