# Live Data Policy Implementation Guide

This guide helps you implement the Live Data Policy in your development workflow with the Cloze API Client.

## Getting Started

1. **Set Up API Credentials**:
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit with your API credentials
   nano .env
   ```

2. **Verify Environment Variables**:
   ```bash
   # Required
   export CLOZE_API_KEY=your_api_key_here
   export CLOZE_API_USER=your_email@example.com
   
   # Optional
   export USE_LIVE_DATA=true
   ```

3. **Run the Mock Removal Script**:
   ```bash
   node remove-mocks.js
   ```

## Testing with Real API Data

### Basic Tests

Run individual tools with the fast test script:

```bash
# Run a health check
./fast-test.sh cloze_health_check

# Find a person
./fast-test.sh "cloze_find_person?name=John"

# Run a test file
./fast-test.sh basic.json
```

### API Credentials

The Live API Client looks for credentials in this order:
1. Environment variables: `CLOZE_API_KEY` and `CLOZE_API_USER`
2. Configuration: `config.get('api.key')` and `config.get('api.user')`
3. `.env` file in the project root

### Rate Limit Handling

The Live API Client includes built-in rate limit handling:

- Automatically detects 429 responses
- Uses the `Retry-After` header when available
- Implements exponential backoff for retries
- Configurable retry count and initial delay

```javascript
// Example of custom retry options
const response = await liveApiClient.get('/people/search', params, {
  maxRetries: 5,
  initialRetryDelay: 500
});
```

## Debugging Live API Calls

Enable debug mode to see detailed API logs:

```bash
DEBUG_CLOZE=true ./fast-test.sh cloze_health_check
```

The logs will show:
- Request URLs and parameters
- Response status codes
- Error details with stack traces
- Retry attempts and backoff times

## Handling API Errors

The Live API Client provides enhanced error handling:

```javascript
try {
  const result = await liveApiClient.get('/people/search', params);
  // Process successful result
} catch (error) {
  if (!error.success) {
    switch (error.status) {
      case 401:
      case 403:
        // Handle authentication errors
        break;
      case 429:
        // Handle rate limiting
        break;
      case 404:
        // Handle not found
        break;
      default:
        // Handle general errors
    }
  }
}
```

## Best Practices

1. **Handle Credentials Securely**:
   - Never commit API keys to the repository
   - Use environment variables or secret management
   - Consider using temporary/scoped API keys for development

2. **Respect Rate Limits**:
   - Use batch operations where possible
   - Implement caching for frequently used data
   - Space out multiple requests in test suites

3. **Manage Test Data**:
   - Create dedicated test accounts for development
   - Periodically clean up test data
   - Prefer read operations over write during routine testing

4. **Error Handling**:
   - Always implement proper error handling
   - Log API errors with appropriate context
   - Consider implementing circuit breakers for repeated failures

5. **Performance Optimization**:
   - Use field selectors to limit response size
   - Implement local caching for lookup data
   - Parallelize independent API calls when appropriate

## Common Issues

### Authentication Failures

```
Error: Authentication failed (401)
```

**Solution**: Check your API key and user email in the `.env` file.

### Rate Limit Exceeded

```
Rate limit exceeded, retrying after 1000ms (attempt 1/3)
```

**Solution**: The client will automatically retry. If this happens frequently, consider:
- Implementing more caching
- Using batch endpoints
- Spacing out test runs

### Network/Connection Issues

```
Network error, no response received
```

**Solution**:
- Check your internet connection
- Verify the API endpoint is accessible
- Increase timeout values for slow connections