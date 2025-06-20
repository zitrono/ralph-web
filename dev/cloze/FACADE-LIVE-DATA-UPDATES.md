# API Facade Live Data Updates

This document summarizes the changes made to the API Facade (`src/core/api/facade.ts`) to implement the Live Data Policy.

## Background

The API Facade class provides a simplified interface to the Cloze API. Previously, it contained several methods that returned mock data, especially for analytics and communication-related operations. As part of the Live Data Policy implementation, we've updated all these methods to use real API calls instead.

## Changes Made

### Communication Operations

| Method | Before | After |
|--------|--------|-------|
| `findPersonCommunications` | Returned mock communication data | Uses real API call to `/v1/communications/search` with person_id parameter |
| `findCompanyCommunications` | Returned mock communication data | Uses real API call to `/v1/communications/search` with company_id parameter |
| `findProjectCommunications` | Returned mock communication data | Uses real API call to `/v1/communications/search` with project_id parameter |
| `searchCommunications` | Returned mock search results | Uses real API call to `/v1/communications/search` with query parameters |

### Timeline Operations

| Method | Before | After |
|--------|--------|-------|
| `addNote` | Returned mock success response | Uses real API call to `/v1/timeline/add_note` |
| `addEmail` | Returned mock success response | Uses real API call to `/v1/timeline/add_email` |
| `addCall` | Returned mock success response | Uses real API call to `/v1/timeline/add_call` |
| `addMeeting` | Returned mock success response | Uses real API call to `/v1/timeline/add_meeting` |

### Analytics Operations

| Method | Before | After |
|--------|--------|-------|
| `analyzeCommunicationActivity` | Generated mock activity data | Uses real API call to `/v1/analytics/communication_activity` |
| `rankRecentCommunications` | Generated mock ranked communications | Uses real API call to `/v1/analytics/rank_communications` |
| `getCommunicationStatistics` | Generated mock statistics | Uses real API call to `/v1/analytics/communication_statistics` |
| `summarizeRelationshipCommunications` | Generated mock relationship summary | Uses real API call to `/v1/analytics/relationship_summary` |

## Implementation Details

For each method, we followed this pattern:

1. Import the live API client: `const { liveApiClient } = await import('./live-client.js');`
2. Prepare appropriate request parameters based on the method inputs
3. Make the API call to the corresponding endpoint
4. Process the response to match the expected return structure
5. Add appropriate error handling
6. Add comments explaining the Live Data Policy implementation

## Benefits

1. **Real Data**: All analytics and communication operations now use real data from the Cloze API.
2. **Consistency**: Behavior is consistent across all environments, including Claude Desktop mode.
3. **Accuracy**: Data reflects the actual state of the user's Cloze account, providing more accurate insights.
4. **Maintainability**: Code is more maintainable as it uses a consistent pattern for API calls.

## Example Change

```typescript
// Before:
public async addNote(params: {/*...*/}): Promise<any> {
  try {
    // For demonstration purposes, return mock data
    debug(`Adding note: ${params.subject}`);
    
    // Example implementation - In actual code, this would use HTTP client
    return {
      success: true,
      id: params.uniqueid,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    // Error handling...
  }
}

// After:
public async addNote(params: {/*...*/}): Promise<any> {
  try {
    // Per the Live Data Policy, we should use the real API client for all requests
    debug(`Adding note: ${params.subject}`);
    
    // Import and use the live API client
    const { liveApiClient } = await import('./live-client.js');
    
    // Format the request payload
    const noteData = {/*...*/};
    
    // Execute the API request to add the note
    const response = await liveApiClient.post('/v1/timeline/add_note', noteData);
    
    return {
      success: response.data?.success || true,
      id: response.data?.id || params.uniqueid,
      timestamp: response.data?.timestamp || new Date().toISOString()
    };
  } catch (err) {
    // Error handling...
  }
}
```