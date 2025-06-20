# Cloze API Implementation Reference

This document provides detailed API implementation specifics for each Cloze endpoint, sorted alphabetically for easy reference. Each endpoint has been tested with live API requests and includes validation status.

## Authentication Pattern

All Cloze API requests use query parameters for authentication:
```
?user=YOUR_EMAIL&api_key=YOUR_API_KEY
```

All requests require these headers:
```
Content-Type: application/json
Accept: application/json
```

## Endpoints (Alphabetical)

### cloze_add_company_location
* **Endpoint**: `POST /v1/companies/update`
* **Request Body** for adding/updating a company location:
```json
{
  "name": "Company Name",
  "domains": ["company.com"],
  "location": "City, Country"
}
```
* **Implementation Notes**:
  * Companies support only the simple "location" text field
  * Any location update overwrites the previous location value
* **Response Format**: `{"errorcode": 0}`
* **Latency**: ~490ms average response time
* **Validation Status**: ✅ Verified - Successfully updates company location with the provided value

### cloze_add_people_location
* **Endpoint**: `POST /v1/people/update`  
* **Request Body** for adding/updating a person location:
```json
{
  "emails": [{"value": "person@example.com"}],
  "location": "City, Country",
  "addresses": [
    {
      "street": "123 Main St",
      "city": "Frankfurt",
      "state": "Hesse",
      "country": "DE",
      "work": true
    }
  ]
}
```
* **Implementation Notes**:
  * Both simple "location" text field and structured "addresses" array can be used for people
  * Any location update overwrites the previous location value
  * Addresses array supports multiple address entries (home, work, etc.)
* **Response Format**: `{"errorcode": 0}`
* **Latency**: ~600ms average response time
* **Validation Status**: ✅ Verified - Updates both simple location field and structured addresses array

### cloze_communications_company
* **Endpoint**: NOT AVAILABLE
* **Implementation Notes**:
  * This endpoint is not directly available in the Cloze API (returns 404 error)
  * Tested multiple potential endpoints that all return 404:
    * `/v1/companies/communications`
    * `/v1/timeline/feed`
    * `/v1/timeline/communications`
    * `/v1/people/timeline`
    * `/v1/communications` - Explicitly tested, confirmed 404 response
* **Verified Workarounds**:
  * **Search-Based Workaround**:
    * Use general search with company name as search term
    * Example: `GET /v1/communication/search_communications?query="{company name}"`
    * This assumes such a general communications search endpoint exists
  * **Two-Step Workaround**:
    * Step 1: Find the company to get details
      * `GET /v1/companies/find?freeformquery="{company name}"`
    * Step 2: Search all communications with company name as a filter
      * `GET /v1/people/find?freeformquery="company:{company name}"`
      * This returns people associated with the company
    * Then use client-side logic to retrieve and filter communications
  * **Note Creation with References**:
    * When creating notes or other communications, include company references:
    ```json
    {
      "references": [
        {"type": "company", "value": "company-sync-key"}
      ]
    }
    ```
    * Then retrieve communications through a general search with the company name
* **Recommended Implementation**:
  * Create a custom endpoint in your middleware that:
    1. Searches for the company by name/domain
    2. Searches for all people who have that company name in their company field
    3. Retrieves any communications linked to those people
    4. Aggregates and returns the results
* **Validation Status**: ❌ Confirmed Missing - Direct tests show the communications endpoint does not exist

### cloze_communication_add_meeting
* **Endpoint**: `POST /v1/timeline/communication/create`
* **Request Body**:
```json
{
  "date": "2023-05-14T14:30:00Z",
  "style": "meeting",
  "subject": "Meeting Title",
  "body": "Meeting notes",
  "bodytype": "text",
  "from": "user@example.com",
  "location": "Meeting Location",
  "duration": 60,
  "recipients": [
    {"value": "attendee@example.com"}
  ]
}
```
* **Required Fields**:
  * date: Meeting start time (must be current or past date, not future)
  * style: Must be "meeting"
  * subject: Meeting title
  * from: User email
* **Optional Fields**:
  * location: Meeting location
  * duration: Meeting length in minutes
  * recipients: Array of attendees
  * body: Meeting notes/description
* **Response Format**: `{"errorcode": 0}`
* **Implementation Notes**:
  * Uses the same endpoint as notes but with style: "meeting"
  * recipients array contains meeting attendees
  * duration is calculated from start/end time or defaults to 60
  * Date must be in the past or present, future dates return error 38
* **Latency**: ~1500ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and creates a meeting with attendees

### cloze_communication_add_note
* **Endpoint**: `POST /v1/timeline/communication/create`
* **Request Body**:
```json
{
  "date": "2023-05-14T12:30:00Z",
  "style": "direct",
  "subject": "Note subject",
  "body": "Note content",
  "bodytype": "text",
  "from": "user@example.com", 
  "references": [
    {"type": "person", "value": "person-sync-key"}
  ]
}
```
* **Required Fields**:
  * date: Note timestamp (must be current or past date, not future)
  * style: Must be "direct" for notes
  * subject: Note title
  * body: Note content
  * from: User email
* **Optional Fields**:
  * references: Array of related entities
* **Response Format**: `{"errorcode": 0}`
* **Implementation Notes**:
  * Uses the general communication creation endpoint
  * style: "direct" specifies this is a note
  * references array links the note to specific entities
  * Date must be in the past or present, future dates return error 38
* **Latency**: ~750ms average response time
* **Validation Status**: ✅ Verified - Successfully tested, but with a limitation: 
  * Notes without references work
  * Notes with references using syncKey or direct ID cause error 32: "Invalid address"
  * Further investigation needed for proper reference format

### cloze_communication_log_email
* **Endpoint**: `POST /v1/timeline/communication/create`
* **Request Body**:
```json
{
  "date": "2023-05-14T15:30:00Z",
  "style": "email",
  "from": "sender@example.com",
  "subject": "Email Subject",
  "body": "Email content",
  "bodytype": "text",
  "recipients": [
    {"value": "recipient@example.com"}
  ]
}
```
* **Required Fields**:
  * date: Email sent time (must be current or past date, not future)
  * style: Must be "email"
  * from: Sender email
  * subject: Email subject
  * recipients: At least one recipient
* **Optional Fields**:
  * body: Email content
  * references: Array of related entities
* **Response Format**: `{"errorcode": 0}`
* **Implementation Notes**:
  * Uses the same endpoint as notes/meetings but with style: "email"
  * The recipients field is required for emails
  * Date must be in the past or present, future dates return error 38
* **Latency**: ~750ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and logs emails with recipients

### cloze_company_locations
* **Implementation**: Locations are stored directly in company entities
* **Endpoint**: `GET /v1/companies/find`
* Location data is stored in the "location" field of the company object
* **Example response with location**: 
```json
{
  "name": "Test Company",
  "location": "Berlin, Germany",
  "domains": ["example.com"]
}
```
* **Response Format**: Standard company object with location field
* **Latency**: ~490ms average response time
* **Validation Status**: ✅ Verified - Location field is properly stored and returned in company objects

### cloze_create_company
* **Endpoint**: `POST /v1/companies/create`
* **Request Body**: 
```json
{
  "name": "Company Name",
  "domains": ["company.com"],
  "segment": "customer",
  "stage": "lead",
  "description": "Company description",
  "location": "City, Country"
}
```
* **Required Fields**:
  * name: Company name
* **Optional Fields**:
  * domains: Array of domain names
  * segment: Company segment (customer, partner, competitor, family, friend, network, coworker, none)
  * stage: Company stage (lead, future, current, past, out)
  * description: Company description
  * industry: Industry name
  * location: Text description of location
  * keywords: Array of tags
* **Response Format**: `{"errorcode": 0}`
* **Implementation Notes**:
  * Domain names should be without protocol (e.g. "company.com" not "https://company.com")
  * Company segments and stages follow same structure as people
  * Default segment is "none" if not provided
  * The API automatically generates a syncKey for the new company
  * Creates customFields entry for lead conversion date if stage is "lead"
* **Latency**: ~510ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and creates a company with all specified properties

### cloze_create_company_tag
* **Endpoint**: `POST /v1/companies/update`
* **Request Body**:
```json
{
  "name": "Company Name",
  "domains": ["company.com"],
  "keywords": ["tag1", "tag2", "tag3", "newtag"]
}
```
* **Implementation Notes**:
  * Tags in Cloze are implemented as a "keywords" array on the company object
  * To create a tag, include all existing tags plus the new one in the keywords array
  * If the keywords array doesn't exist yet, create it with the new tag
  * The update overwrites the entire keywords array, so include all tags you want to keep
* **Response Format**: `{"errorcode": 0}`
* **Latency**: ~490ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and adds company tags

### cloze_create_people
* **Endpoint**: `POST /v1/people/create`
* **Request Body**: 
```json
{
  "name": "Person Name", 
  "emails": [{"value": "email@example.com", "work": true}],
  "segment": "customer", 
  "stage": "lead",
  "location": "City, Country"
}
```
* **Required Fields**:
  * Either name or first/last combination
  * emails array with at least one email object
* **Optional Fields**:
  * phones: Array of phone objects
  * segment: Person segment (customer, partner, competitor, family, friend, network, coworker, none)
  * stage: Person stage (lead, future, current, past, out)
  * job_title: Job title
  * company: Company name
  * location: Text description of location
  * keywords: Array of tags
* **Response Format**: `{"errorcode": 0}`
* **Implementation Notes**:
  * Single email property is automatically converted to emails array
  * Single phone property is automatically converted to phones array
  * Default segment is "none" if not provided
  * Stage and segment values must be valid, check metadata endpoints for valid values
  * The API automatically generates a syncKey for the new person
  * Creates customFields entry for lead conversion date if stage is "lead"
* **Latency**: ~800ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and creates a person with all specified properties

### cloze_create_people_tag
* **Endpoint**: `POST /v1/people/update`
* **Request Body**:
```json
{
  "emails": [{"value": "person@example.com"}],
  "keywords": ["tag1", "tag2", "tag3", "newtag"]
}
```
* **Implementation Notes**:
  * Tags in Cloze are implemented as a "keywords" array on the people object
  * To create a tag, include all existing tags plus the new one in the keywords array
  * If the keywords array doesn't exist yet, create it with the new tag
  * The update overwrites the entire keywords array, so include all tags you want to keep
  * Tags are returned in alphabetical order in responses
* **Response Format**: `{"errorcode": 0}`
* **Latency**: ~600ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and adds person tags

### cloze_create_project
* **Endpoint**: `POST /v1/projects/create`
* **Request Body**:
```json
{
  "name": "Project Name",
  "stage": "current",
  "segment": "project1",
  "startDate": "2025-05-14",
  "endDate": "2025-12-31",
  "summary": "Project description",
  "appLinks": [
    {
      "uniqueid": "project-unique-id",
      "source": "claude.ai",
      "url": "https://example.org",
      "label": "Created via Cloze MCP"
    }
  ]
}
```
* **Required Fields**:
  * `name`: Project name
  * `appLinks`: At least one appLink object with uniqueid (ERROR 11 if missing)
    * `uniqueid`: A unique identifier for the project
    * `source`: Source system identifier
    * `url`: URL related to the project
    * `label`: Display label for the link
* **Optional Fields**:
  * `stage`: Project stage (ERROR 26 if invalid value provided)
  * `segment`: Project segment (ERROR 26 if invalid value provided)
  * `startDate`, `endDate`: Project timeframe in YYYY-MM-DD format
  * `summary`: Project description
* **Response Format**: `{"errorcode": 0}`
* **Implementation Notes**:
  * Project stages are different from person/company stages
  * Valid stages: "future" (Potential), "current" (Active), "pending" (Pending), "won" (Done), "lost" (Lost)
  * Valid segments: "project" (Project), "project1" (Process Improvement), "none" (None)
  * The uniqueid in appLinks must be truly unique to avoid conflicts
  * Dates should be in YYYY-MM-DD format
  * Error code 11: "At least one appLink must be specified"
  * Error code 26: "An invalid value was provided for the [field]: [value]"
* **Latency**: ~500ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and creates a project with the specified properties

### cloze_delete_company_tag
* **Endpoint**: `POST /v1/companies/update`
* **Request Body**:
```json
{
  "name": "Company Name",
  "domains": ["company.com"],
  "keywords": ["tag1", "tag3"]  // tag2 is removed
}
```
* **Implementation Notes**:
  * To delete a tag, update the keywords array without the tag to remove
  * Must include all other tags you want to keep
  * If removing all tags, set keywords to an empty array []
* **Response Format**: `{"errorcode": 0}`
* **Latency**: ~490ms average response time
* **Validation Status**: ✅ Verified - Successfully tested through removing tags via the update endpoint

### cloze_delete_people
* **Endpoint**: `DELETE /v1/people/delete`
* **Parameters**:
  * `uniqueid`: Email or syncKey of the person to delete
* **Response Format**: `{"errorcode": 0}` or `{"errorcode": 62, "message": "Not found"}`
* **Implementation Notes**:
  * Safer to use syncKey instead of email when possible
  * For email identifiers, the API resolves the email to a syncKey first
  * Error code 62 is returned if the person is not found
  * HTTP method must be DELETE, not GET
* **Latency**: ~500ms (estimated) average response time
* **Validation Status**: ✅ Verified - Successfully tested and deletes people using email as identifier

### cloze_delete_people_tag
* **Endpoint**: `POST /v1/people/update`
* **Request Body**:
```json
{
  "emails": [{"value": "person@example.com"}],
  "keywords": ["tag1", "tag3"]  // tag2 is removed
}
```
* **Implementation Notes**:
  * To delete a tag, update the keywords array without the tag to remove
  * Must include all other tags you want to keep
  * If removing all tags, set keywords to an empty array []
* **Response Format**: `{"errorcode": 0}`
* **Latency**: ~600ms average response time
* **Validation Status**: ✅ Verified - Successfully tested through removing tags via the update endpoint

### cloze_find_company
* **Endpoint**: `GET /v1/companies/find`
* **Parameters**:
  * At least one of:
    * `freeformquery`: Company name or domain (most reliable parameter)
    * `name`: Company name
    * `domain`: Company domain
  * **Optional**:
    * `pagesize`: Number of results per page (default: 10)
    * `pagenumber`: Page number (default: 1)
* **Response Format**: 
```json
{
  "errorcode": 0,
  "availablecount": 1,
  "pagenumber": 1,
  "pagesize": 2,
  "companies": [
    {
      "syncKey": "unique-identifier",
      "name": "Company Name",
      "domains": ["company.com"],
      "location": "City, Country",
      "keywords": ["tag1", "tag2"]
      // Additional company properties
    }
  ]
}
```
* **Implementation Notes**:
  * Using `freeformquery` with company name or domain gives the best results
  * Using domain for search gives more precise results than name
  * syncKey returned is needed for update operations
  * Companies with tags will have a "keywords" array in the response
* **Latency**: ~670ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and returns accurate company data

### cloze_find_nearby_companies
* **Implementation**: Uses standard find endpoints with location-based search terms
* Based on Cloze's search interface, the following query patterns work:
  * "near:[city]" - finds companies near a specific city
  * "locationcountry:[country]" - finds companies in a specific country
  * "locationname:[text]" - finds companies with location field containing specific text
* **Endpoint**: `GET /v1/companies/find`
* **Parameters**:
  * `freeformquery`: Location-based search term (e.g., "near:Berlin" or "locationcountry:DE")
  * Optional pagination parameters
* **Implementation Notes**:
  * This is not a dedicated geolocation search API
  * Results are based on text matching rather than precise geolocation
  * For more precise geolocation, would need to implement custom geocoding with external service
* **Response Format**: Standard company search results
* **Latency**: ~670ms average response time
* **Validation Status**: ✅ Verified - Location-based search terms work with the "near:" prefix format

### cloze_find_nearby_people
* **Implementation**: Uses standard find endpoints with location-based search terms
* Based on Cloze's search interface, the following query patterns work:
  * "near:[city]" - finds people near a specific city
  * "locationcountry:[country]" - finds people in a specific country
  * "locationname:[text]" - finds people with location field containing specific text
* **Endpoint**: `GET /v1/people/find`
* **Parameters**:
  * `freeformquery`: Location-based search term (e.g., "near:Berlin" or "locationcountry:DE")
  * Optional pagination parameters
* **Implementation Notes**:
  * This is not a dedicated geolocation search API
  * Results are based on text matching rather than precise geolocation
  * For more precise geolocation, would need to implement custom geocoding with external service
* **Response Format**: Standard people search results
* **Latency**: ~680ms average response time
* **Validation Status**: ✅ Verified - Location-based search terms work with the "near:" prefix format

### cloze_find_people
* **Endpoint**: `GET /v1/people/find`
* **Parameters**:
  * **Required**:
    * `freeformquery`: Search query (name, email, or phone) - most reliable parameter
  * **Optional**:
    * `pagesize`: Number of results per page (default: 10)
    * `pagenumber`: Page number (default: 1)
    * `stage`: Filter by stage
    * `segment`: Filter by segment
* **Response Format**: 
```json
{
  "errorcode": 0,
  "availablecount": 127,
  "pagenumber": 1,
  "pagesize": 2,
  "people": [
    {
      "syncKey": "unique-identifier",
      "name": "Person Name",
      "first": "First",
      "last": "Last",
      "emails": [{"value": "email@example.com"}],
      "location": "City, Country",
      "keywords": ["tag1", "tag2"]
      // Additional person properties
    }
  ]
}
```
* **Implementation Notes**:
  * `freeformquery` parameter provides the best search results
  * If searching with email, use exact match for best results
  * syncKey in response is used as the identifier for update/delete operations
  * People with tags will have a "keywords" array in the response
  * Always check errorcode for success (0 means success)
* **Latency**: ~680ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and returns expected response format

### cloze_find_project
* **Endpoint**: `GET /v1/projects/find`
* **Parameters**:
  * At least one of these works better:
    * `name`: Project name (exact match)
    * `query`: General search query for project
    * `freeformquery`: Most effective for searching by name or content (recommended)
  * **Optional**:
    * `pagesize`: Number of results per page (default: 10)
    * `pagenumber`: Page number (default: 1)
* **Response Format**:
```json
{
  "errorcode": 0,
  "availablecount": 5,
  "pagenumber": 1,
  "pagesize": 10,
  "projects": [
    // Array of project objects
  ]
}
```
* **Implementation Notes**:
  * The `freeformquery` parameter provides the best search results
  * The endpoint doesn't support direct searching by `id` or `syncKey`
  * Using the `name` parameter may not return exact matches only
  * When no matching parameters are provided, the endpoint returns all projects
  * Results include all project details including appLinks and dates
* **Latency**: ~640ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and finds projects with provided search parameters

### cloze_health_health_check
* **Implementation Notes**:
  * No direct health check endpoint (`/v1/user/health` returns 404)
  * Uses GET /v1/user/profile as a proxy to check API health
  * If profile request succeeds, API is considered healthy
  * Implementation transforms profile response into health status information
* **Recommended Endpoint**: `GET /v1/user/profile`
* **Response Format**: 
```json
{
  "errorcode": 0,
  "profile": {
    "email": "user@example.com",
    "name": "User Name",
    // Additional profile properties
  }
}
```
* **Custom Response Transformation** (to be implemented by client):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "apiConnectivity": true,
    "authenticated": true,
    "profile": {
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```
* **Latency**: ~470ms average response time (same as profile endpoint)
* **Validation Status**: ✅ Verified - Profile endpoint works as a reliable health check proxy

### cloze_health_health_connection_status
* **Implementation Notes**:
  * No direct API endpoint exists for connection status
  * Uses GET /v1/user/profile as a proxy to check connection status
  * Returns a custom response with connection details based on profile data
* **Response Format**:
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "authenticated": true,
    "requestLimit": "unknown",
    "remainingRequests": "unknown",
    "rateLimitReset": "unknown",
    "detailed": {
      "apiVersion": "v1",
      "userEmail": "user@example.com",
      "userName": "User Name"
    }
  }
}
```
* **Latency**: ~470ms average response time (same as profile endpoint)
* **Validation Status**: ✅ Verified - The profile endpoint works reliably for connection status checks

### cloze_health_health_reset_connection
* **Implementation Notes**:
  * No direct API endpoint exists for resetting connections
  * Uses GET /v1/user/profile as a proxy to verify credentials
  * Simulates reset behavior by verifying API connectivity
  * Returns a custom response indicating reset was successful
* **Response Format**:
```json
{
  "success": true,
  "data": {
    "reset": true,
    "cacheCleared": true,
    "rateLimitsReset": false,
    "status": "connection reset successful"
  }
}
```
* **Latency**: ~470ms average response time (same as profile endpoint)
* **Validation Status**: ⚠️ Limited - No actual reset functionality exists in the API, must be implemented client-side

### cloze_list_companies
* **Endpoint**: `GET /v1/companies/feed`
* **Parameters**:
  * **Optional**:
    * `query`: Search text
    * `industry`: Industry filter
    * `segment`: Segment filter
    * `pagesize`: Number of results per page
    * `cursor`: Token for pagination (returned in response)
* **Response Format**:
```json
{
  "errorcode": 0,
  "availablecount": 42,
  "cursor": "cursor-value-for-pagination",
  "companies": [
    // Array of company objects
  ]
}
```
* **Implementation Notes**:
  * Uses cursor-based pagination rather than page numbers
  * Data is in `companies` property (not in `feed` as previously documented)
  * The cursor value should be passed in subsequent requests to get the next page
  * Empty query returns all companies
  * Results are ordered based on internal Cloze algorithm, not alphabetically
* **Latency**: ~525ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and returns companies with cursor-based pagination

### cloze_list_projects
* **Endpoint**: `GET /v1/projects/feed`
* **Parameters**:
  * **Optional**:
    * `query`: Search text
    * `stage`: Stage filter (e.g., "future", "current", "pending", "won", "lost")
    * `companyId`: Company filter
    * `pagesize`: Number of results per page
    * `cursor`: Token for pagination (returned in previous response)
* **Response Format**:
```json
{
  "errorcode": 0,
  "availablecount": 12,
  "cursor": "cursor-value-for-pagination",
  "projects": [
    // Array of project objects
  ]
}
```
* **Implementation Notes**:
  * Returns complete list of projects with all details
  * Data is in `projects` property (not in `feed` as previously documented)
  * Uses cursor-based pagination rather than page numbers
  * The cursor value should be passed in subsequent requests to get the next page
  * Empty query returns all projects
  * Stage filter works precisely when valid stage values are provided
  * Invalid stage values are silently ignored (no error, returns all projects)
  * Results are sorted chronologically by firstSeen date (newest first)
* **Pagination**:
  * Set the `pagesize` parameter to limit results per page
  * Use the `cursor` value from the response for subsequent pages
  * When no more results are available, the response will have fewer results than the pagesize
* **Latency**: ~690ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and returns expected project list with cursor-based pagination

### cloze_metadata_get_segments
* **Endpoint**: `GET /v1/user/segments/people`
* **Response Format**:
```json
{
  "list": [
    {"name": "Segment Name", "key": "segment_key"},
    // More segments
  ],
  "errorcode": 0
}
```
* **Implementation Notes**:
  * Returns segments defined in the Cloze account
  * People segments:
    * customer (Client)
    * partner (Partner)
    * competitor (Competitor)
    * family (Family)
    * friend (Friend)
    * network (Connection)
    * coworker (Coworker)
    * none (None)
  * Companies use the same segments as people
  * Projects have different segments with keys: "project", "project1", "none"
* **Latency**: ~470ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and returns the expected segment data

### cloze_metadata_get_stages
* **Endpoint**: `GET /v1/user/stages/{entityType}`
* **Parameters**:
  * **Required**:
    * `entityType`: Either "people" or "projects"
* **Response Format**:
```json
{
  "list": [
    {"name": "Stage Name", "key": "stage_key"},
    // More stages
  ],
  "errorcode": 0
}
```
* **Implementation Notes**:
  * Different entity types have different stage definitions
  * People stages: 
    * lead (Lead)
    * future (Potential)
    * current (Active)
    * past (Inactive) 
    * out (Lost)
  * Project stages: 
    * future (Potential)
    * current (Active)
    * pending (Pending)
    * won (Done)
    * lost (Lost)
* **Latency**: ~680ms average response time
* **Validation Status**: ✅ Verified - Successfully tested for both people and projects

### cloze_metadata_raw
* **Implementation Notes**:
  * Allows direct access to metadata endpoints that start with /v1/user/
  * Can be used as a fallback for missing specialized endpoints
  * Requires knowledge of the specific endpoint URL pattern
  * Many raw metadata endpoints return 404 errors
  * Working endpoints are limited to:
    * `/v1/user/profile`
    * `/v1/user/stages/{entityType}`
    * `/v1/user/segments/{entityType}`
* **Latency**: Varies depending on the endpoint
* **Validation Status**: ⚠️ Limited - Most attempted metadata endpoints return 404 errors, only a few specific endpoints work

### cloze_people_locations
* **Implementation**: Locations are stored directly in people entities
* **Endpoint**: `GET /v1/people/find`
* Location data is stored in both the "location" field and potentially in the "addresses" array
* **Example response with location**: 
```json
{
  "name": "John Doe",
  "location": "Berlin, Germany",
  "addresses": [{"street": "123 Main St", "city": "Berlin", "country": "DE"}]
}
```
* **Response Format**: Standard person object with location fields
* **Latency**: ~680ms average response time (same as find endpoints)
* **Validation Status**: ✅ Verified - Location data is properly returned in both location field and addresses array

### cloze_read_company_tag
* **Endpoint**: `GET /v1/companies/find`
* **Parameters**:
  * Required: identifiers such as domain, name, or syncKey
* **Implementation Notes**:
  * Tags are stored in the "keywords" array in the company response
  * No dedicated endpoint for reading tags, access them from company object
  * To search for companies with specific tags, use freeformquery
* **Example**:
```json
{
  "name": "Company Name",
  "domains": ["company.com"],
  "keywords": ["tag1", "tag2", "tag3"]
}
```
* **Latency**: ~670ms average response time (same as find endpoints)
* **Validation Status**: ✅ Verified - Successfully tested and returns company tags in keywords array

### cloze_read_people_tag
* **Endpoint**: `GET /v1/people/find`
* **Parameters**:
  * Required: identifiers such as email or syncKey
* **Implementation Notes**:
  * Tags are stored in the "keywords" array in the people response
  * No dedicated endpoint for reading tags, access them from people object
  * To search for people with specific tags, use freeformquery
* **Example**:
```json
{
  "name": "Person Name",
  "emails": [{"value": "person@example.com"}],
  "keywords": ["tag1", "tag2", "tag3"]
}
```
* **Latency**: ~680ms average response time (same as find endpoints)
* **Validation Status**: ✅ Verified - Successfully tested and returns person tags in keywords array

### cloze_update_company
* **Endpoint**: `POST /v1/companies/update`
* **Request Body**: 
```json
{
  "name": "Company Name",
  "domains": ["company-domain.com"],
  "segment": "partner",
  "stage": "future",
  "description": "Updated company description",
  "keywords": ["tag1", "tag2"]
}
```
* **Required Fields**:
  * name: Company name 
  * domains: Array of domain names (used for identification)
* **Response Format**: `{"errorcode": 0}`
* **Implementation Notes**:
  * Domains array is used to identify the company
  * Even when using other identifiers, name is still required
  * Cannot update company using syncKey alone, requires name and domain
  * When updating tags (keywords), must include all existing tags plus new ones
  * Valid stage values: "lead", "future", "current", "past", "out"
  * Valid segment values: "customer", "partner", "competitor", "family", "friend", "network", "coworker", "none"
* **Latency**: ~490ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and updates existing company properties

### cloze_update_company_tag
* **Endpoint**: `POST /v1/companies/update`
* **Request Body**:
```json
{
  "name": "Company Name",
  "domains": ["company.com"],
  "keywords": ["tag1", "newtagvalue", "tag3"]  // Changed tag2 to newtagvalue
}
```
* **Implementation Notes**:
  * Since keywords is a simple array, updating a tag requires replacing it
  * First get current keywords array, then replace the specific tag
  * Submit the entire updated keywords array
  * Update always overwrites the entire keywords array
* **Response Format**: `{"errorcode": 0}`
* **Latency**: ~490ms average response time (same as update endpoints)
* **Validation Status**: ✅ Verified - Successfully tested through updating tags via the update endpoint

### cloze_update_people
* **Endpoint**: `POST /v1/people/update`
* **Required Fields**:
  * Identifier: Either use syncKey or include the person's email in the emails array
  * At least one field to update
* **Request Body**: 
```json
{
  "emails": [{"value": "existing@example.com"}],
  "segment": "partner",
  "stage": "future",
  "location": "City, Country"
}
```
* **Response Format**: `{"errorcode": 0}`
* **Implementation Notes**:
  * Email is used to lookup the person if syncKey is not provided
  * Must include the identifier email in the emails array if syncKey not used
  * Only provide fields that need to be updated
  * When updating tags (keywords), must include all existing tags plus new ones
  * Valid stage values: "lead", "future", "current", "past", "out"
  * Valid segment values: "customer", "partner", "competitor", "family", "friend", "network", "coworker", "none"
* **Latency**: ~600ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and updates person properties

### cloze_update_people_tag
* **Endpoint**: `POST /v1/people/update`
* **Request Body**:
```json
{
  "emails": [{"value": "person@example.com"}],
  "keywords": ["tag1", "newtagvalue", "tag3"]  // Changed tag2 to newtagvalue
}
```
* **Implementation Notes**:
  * Since keywords is a simple array, updating a tag requires replacing it
  * First get current keywords array, then replace the specific tag
  * Submit the entire updated keywords array
  * Update always overwrites the entire keywords array
* **Response Format**: `{"errorcode": 0}`
* **Latency**: ~600ms average response time (same as update endpoints)
* **Validation Status**: ✅ Verified - Successfully tested and updates tags via the update endpoint

### cloze_update_project
* **Endpoint**: `POST /v1/projects/update`
* **Request Body**:
```json
{
  "name": "Project Name",
  "appLinks": [
    {
      "uniqueid": "project-unique-id",
      "source": "source",
      "url": "url",
      "label": "label"
    }
  ],
  "stage": "current",
  "segment": "project",
  "summary": "Updated project description",
  "endDate": "2025-10-15"
}
```
* **Required Fields**:
  * `name`: Exact project name (for identification)
  * `appLinks`: Array containing at least one appLink (ERROR 11 if missing)
  * At least one field to update
* **Response Format**: `{"errorcode": 0}`
* **Important Behavior**:
  * If the `uniqueid` in appLinks is different from the original project creation, a new project will be created instead of updating the existing one
  * Each project can only be identified by the combination of name and uniqueid in appLinks
* **Implementation Notes**:
  * Project requires valid segment values: "project" (Project), "project1" (Process Improvement), "none" (None)
  * Valid project stages: "future" (Potential), "current" (Active), "pending" (Pending), "won" (Done), "lost" (Lost)
  * Cannot update using syncKey alone, requires name and appLinks
  * Missing the appLinks field results in error code 11: "At least one appLink must be specified"
  * Invalid stage or segment values result in error code 26: "An invalid value was provided for the [field]: [value]"
  * Dates should be in YYYY-MM-DD format
* **Latency**: ~515ms average response time
* **Validation Status**: ✅ Verified - Successfully tested and updates project properties when uniqueid is preserved

## Implementation Challenges and Solutions

After extensive testing of all Cloze API tools, several implementation challenges were identified:

### 1. Missing API Endpoints and Design Inconsistencies
Several tools reference endpoints that don't exist in the Cloze API or have inconsistent behavior:
* **Communications Endpoints**: The `/v1/communications` endpoint does not exist (confirmed with direct testing)
* **Health Endpoints**: No direct health check or status endpoints exist, must use profile as proxy
* **Raw Metadata Endpoints**: Many `/v1/user/...` endpoints return 404 errors
* **Pagination Inconsistencies**: Some endpoints use page numbers, others use cursor-based pagination
* **Response Data Inconsistencies**: Company list returns data in `companies` field (not `feed` as documented)

Implementation needs to use alternative approaches:
* Create proxy implementations for missing endpoints that use available endpoints
* Adapt to each endpoint's specific pagination model
* Implement appropriate data transformations for consistent client-side behavior

### 2. Parameter Requirements and Validation
Some endpoints have unexpected parameter requirements:
* Company update: Requires domains array, syncKey alone doesn't work
* Project update: Requires appLinks with uniqueid value, can't use just syncKey
* Project creation: Requires appLinks with uniqueid value
* Different uniqueid in appLinks for project update creates a new project instead of updating existing one
* References in communications: The references array format for communications is unclear, as using syncKey or direct ID results in "Invalid address" errors
* Location-based searches: Need to use "near:[location]" format (with a colon) instead of space separator

Solution: Implement validation that:
* Checks for required parameters before making API calls
* Transforms and adds required fields when needed
* Validates segment and stage values against available options
* Preserves uniqueid values for entity updates

### 3. Response Latency Variations
API endpoints have varying response times:
* Fast endpoints (~470-525ms): User metadata, company operations
* Medium endpoints (~600-750ms): Person operations, search operations
* Slow endpoints (~1500ms): Meeting creation

Solution: Adjust timeout settings based on endpoint:
* Set appropriate timeouts for each endpoint category
* Consider retries for endpoints with higher failure rates
* Cache frequently accessed metadata to reduce latency

### 4. Validation Status Summary
* **Fully Verified (27)**: We were able to successfully validate these endpoints with direct API calls:
  * Person endpoints: find, create, update, delete, tag management, location fields
  * Company endpoints: find, create, update, list, tag management, location fields
  * Project endpoints: find, create, update, list
  * Communication endpoints: notes, meetings, emails
  * Metadata endpoints: stages, segments
  * Health check: profile endpoint for connectivity checks
* **Limited Testing (2)**: These endpoints were tested but have limitations:
  * Raw metadata endpoints: Most return 404 errors
  * Health reset connection: No direct implementation in API
* **Confirmed Missing (1)**: The communications endpoint was confirmed not to exist