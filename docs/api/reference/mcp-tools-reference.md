# Cloze MCP Tools Reference

This document provides a comprehensive reference for all MCP (Model Context Protocol) tools available in the Cloze integration. These tools allow AI assistants like Claude to interact with the Cloze CRM system.

Each tool implements schema validation using JSON Schema, which is automatically transmitted to MCP clients. For more information on schema implementation and validation, see [Schema Validation in MCP Tools](../schema-validation.md).

## Table of Contents

1. [People Tools](#people-tools)
2. [Company Tools](#company-tools)
3. [Project Tools](#project-tools)
4. [Communication Tools](#communication-tools)
5. [Metadata Tools](#metadata-tools)
6. [Health Tools](#health-tools)

---

## People Tools

Tools for managing people (contacts) in the Cloze CRM.

### cloze_create_people

Creates a new person in Cloze.

**Parameters:**
- `name` (required): Full name of the person
- `emails` (optional): Array of email addresses
- `phones` (optional): Array of phone numbers
- `company` (optional): Company name
- `title` (optional): Job title
- `bio` (optional): Biographical information
- `social_profiles` (optional): Array of social profile URLs
- `addresses` (optional): Array of physical addresses
- `notes` (optional): Additional notes about the person

**Example:**
```json
{
  "name": "John Doe",
  "emails": ["john@example.com"],
  "phones": ["+1-555-123-4567"],
  "company": "Acme Inc",
  "title": "Product Manager"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "abc123",
    "name": "John Doe",
    "emails": ["john@example.com"],
    "phones": ["+1-555-123-4567"],
    "company": "Acme Inc",
    "title": "Product Manager"
  }
}
```

### cloze_find_people

Finds people in Cloze based on search criteria.

**Parameters:**
- `freeformquery` (required): Search query (name, email, or phone). For best results with email searches, use the exact email address.
- `segment` (optional): Filter by segment (customer, partner, competitor, family, friend, network, coworker, none)
- `stage` (optional): Filter by stage (lead, future, current, past, out)
- `pagesize` (optional): Number of results per page (default: 10, max: 100)
- `pagenumber` (optional): Page number to retrieve (default: 1)

**Examples:**
```json
// Search by email
{
  "freeformquery": "john.doe@example.com"
}

// Search by name with pagination
{
  "freeformquery": "John Smith",
  "pagesize": 25,
  "pagenumber": 1
}

// Search with filters
{
  "freeformquery": "Jane",
  "segment": "customer",
  "stage": "current"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "John Doe",
      "emails": ["john@example.com"],
      "phones": ["+1-555-123-4567"],
      "company": "Acme Inc",
      "title": "Product Manager"
    }
  ]
}
```

### cloze_update_people

Updates an existing person in Cloze.

**Parameters:**
- `id` (required): Person ID
- `name` (optional): Full name of the person
- `emails` (optional): Array of email addresses
- `phones` (optional): Array of phone numbers
- `company` (optional): Company name
- `title` (optional): Job title
- `bio` (optional): Biographical information
- `social_profiles` (optional): Array of social profile URLs
- `addresses` (optional): Array of physical addresses
- `notes` (optional): Additional notes about the person

**Example:**
```json
{
  "id": "abc123",
  "title": "Senior Product Manager"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "abc123",
    "name": "John Doe",
    "emails": ["john@example.com"],
    "title": "Senior Product Manager"
  }
}
```

### cloze_delete_people

Deletes a person from Cloze.

**Parameters:**
- `id` (required): Person ID

**Example:**
```json
{
  "id": "abc123"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "deleted": true,
    "id": "abc123"
  }
}
```

### cloze_add_people_location

Adds a location to a person in Cloze.

**Parameters:**
- `people_id` (required): Person ID
- `name` (required): Location name
- `address` (required): Street address
- `city` (optional): City name
- `state` (optional): State or province
- `postal_code` (optional): Postal code
- `country` (optional): Country
- `latitude` (optional): Latitude coordinate
- `longitude` (optional): Longitude coordinate

**Example:**
```json
{
  "people_id": "abc123",
  "name": "Office",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "postal_code": "94105",
  "country": "USA"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "loc123",
    "people_id": "abc123",
    "name": "Office",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94105",
    "country": "USA"
  }
}
```

### cloze_get_people_locations

Gets all locations for a person in Cloze.

**Parameters:**
- `people_id` (required): Person ID

**Example:**
```json
{
  "people_id": "abc123"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "loc123",
      "people_id": "abc123",
      "name": "Office",
      "address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94105",
      "country": "USA",
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  ]
}
```

### cloze_find_nearby_people

Finds people near a specified location.

**Parameters:**
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `radius` (optional): Search radius in miles (default: 5)
- `limit` (optional): Maximum number of results to return (default: 10)

**Example:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "radius": 10
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "John Doe",
      "distance": 2.5,
      "location": {
        "id": "loc123",
        "name": "Office",
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA"
      }
    }
  ]
}
```

### cloze_create_people_tag

Creates a tag for a person in Cloze.

**Parameters:**
- `people_id` (required): Person ID
- `name` (required): Tag name

**Example:**
```json
{
  "people_id": "abc123",
  "name": "VIP Client"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "tag123",
    "people_id": "abc123",
    "name": "VIP Client"
  }
}
```

### cloze_read_people_tag

Gets all tags for a person in Cloze.

**Parameters:**
- `people_id` (required): Person ID

**Example:**
```json
{
  "people_id": "abc123"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "tag123",
      "people_id": "abc123",
      "name": "VIP Client"
    }
  ]
}
```

### cloze_update_people_tag

Updates a tag for a person in Cloze.

**Parameters:**
- `tag_id` (required): Tag ID
- `people_id` (required): Person ID
- `name` (required): New tag name

**Example:**
```json
{
  "tag_id": "tag123",
  "people_id": "abc123",
  "name": "Key Account"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "tag123",
    "people_id": "abc123",
    "name": "Key Account"
  }
}
```

### cloze_delete_people_tag

Deletes a tag from a person in Cloze.

**Parameters:**
- `tag_id` (required): Tag ID
- `people_id` (required): Person ID

**Example:**
```json
{
  "tag_id": "tag123",
  "people_id": "abc123"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "deleted": true,
    "id": "tag123"
  }
}
```

---

## Company Tools

Tools for managing companies in the Cloze CRM.

### cloze_create_company

Creates a new company in Cloze.

**Parameters:**
- `name` (required): Company name
- `domain` (optional): Company website domain
- `phone` (optional): Company phone number
- `industry` (optional): Industry description
- `description` (optional): Company description
- `addresses` (optional): Array of physical addresses

**Example:**
```json
{
  "name": "Acme Inc",
  "domain": "acme.com",
  "industry": "Technology"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "comp123",
    "name": "Acme Inc",
    "domain": "acme.com",
    "industry": "Technology"
  }
}
```

### cloze_find_company

Finds companies in Cloze based on search criteria.

**Parameters:**
- `query` (required): Search query (name, domain, etc.)
- `limit` (optional): Maximum number of results to return (default: 10)

**Example:**
```json
{
  "query": "acme.com"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "comp123",
      "name": "Acme Inc",
      "domain": "acme.com",
      "industry": "Technology"
    }
  ]
}
```

### cloze_update_company

Updates an existing company in Cloze.

**Parameters:**
- `id` (required): Company ID
- `name` (optional): Company name
- `domain` (optional): Company website domain
- `phone` (optional): Company phone number
- `industry` (optional): Industry description
- `description` (optional): Company description
- `addresses` (optional): Array of physical addresses

**Example:**
```json
{
  "id": "comp123",
  "industry": "Enterprise Software"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "comp123",
    "name": "Acme Inc",
    "domain": "acme.com",
    "industry": "Enterprise Software"
  }
}
```

### cloze_list_companies

Lists companies in Cloze with optional filtering.

**Parameters:**
- `limit` (optional): Maximum number of results to return (default: 10)
- `offset` (optional): Offset for pagination (default: 0)
- `segment_id` (optional): Filter by segment ID

**Example:**
```json
{
  "limit": 5,
  "offset": 0
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "comp123",
      "name": "Acme Inc",
      "domain": "acme.com",
      "industry": "Enterprise Software"
    },
    {
      "id": "comp124",
      "name": "Beta Corp",
      "domain": "betacorp.com",
      "industry": "Manufacturing"
    }
  ]
}
```

### cloze_add_company_location

Adds a location to a company in Cloze.

**Parameters:**
- `company_id` (required): Company ID
- `name` (required): Location name
- `address` (required): Street address
- `city` (optional): City name
- `state` (optional): State or province
- `postal_code` (optional): Postal code
- `country` (optional): Country
- `latitude` (optional): Latitude coordinate
- `longitude` (optional): Longitude coordinate

**Example:**
```json
{
  "company_id": "comp123",
  "name": "Headquarters",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "postal_code": "94105",
  "country": "USA"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "loc456",
    "company_id": "comp123",
    "name": "Headquarters",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94105",
    "country": "USA"
  }
}
```

### cloze_get_company_locations

Gets all locations for a company in Cloze.

**Parameters:**
- `company_id` (required): Company ID

**Example:**
```json
{
  "company_id": "comp123"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "loc456",
      "company_id": "comp123",
      "name": "Headquarters",
      "address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94105",
      "country": "USA",
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  ]
}
```

### cloze_find_nearby_companies

Finds companies near a specified location.

**Parameters:**
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `radius` (optional): Search radius in miles (default: 5)
- `limit` (optional): Maximum number of results to return (default: 10)

**Example:**
```json
{
  "latitude": 37.7749,
  "longitude": -122.4194,
  "radius": 10
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "comp123",
      "name": "Acme Inc",
      "distance": 1.2,
      "location": {
        "id": "loc456",
        "name": "Headquarters",
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA"
      }
    }
  ]
}
```

### cloze_create_company_tag

Creates a tag for a company in Cloze.

**Parameters:**
- `company_id` (required): Company ID
- `name` (required): Tag name

**Example:**
```json
{
  "company_id": "comp123",
  "name": "Key Account"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "tag456",
    "company_id": "comp123",
    "name": "Key Account"
  }
}
```

### cloze_read_company_tag

Gets all tags for a company in Cloze.

**Parameters:**
- `company_id` (required): Company ID

**Example:**
```json
{
  "company_id": "comp123"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "tag456",
      "company_id": "comp123",
      "name": "Key Account"
    }
  ]
}
```

### cloze_update_company_tag

Updates a tag for a company in Cloze.

**Parameters:**
- `tag_id` (required): Tag ID
- `company_id` (required): Company ID
- `name` (required): New tag name

**Example:**
```json
{
  "tag_id": "tag456",
  "company_id": "comp123",
  "name": "Enterprise Account"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "tag456",
    "company_id": "comp123",
    "name": "Enterprise Account"
  }
}
```

### cloze_delete_company_tag

Deletes a tag from a company in Cloze.

**Parameters:**
- `tag_id` (required): Tag ID
- `company_id` (required): Company ID

**Example:**
```json
{
  "tag_id": "tag456",
  "company_id": "comp123"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "deleted": true,
    "id": "tag456"
  }
}
```

---

## Project Tools

Tools for managing projects in the Cloze CRM.

### cloze_create_project

Creates a new project in Cloze.

**Parameters:**
- `name` (required): Project name
- `description` (optional): Project description
- `stage_id` (optional): Project stage ID
- `due_date` (optional): Due date in ISO format
- `related_people` (optional): Array of related person IDs
- `related_companies` (optional): Array of related company IDs
- `app_links` (optional): Array of external application links

**Example:**
```json
{
  "name": "Website Redesign",
  "description": "Complete overhaul of company website",
  "due_date": "2023-12-31",
  "related_companies": ["comp123"]
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "proj123",
    "name": "Website Redesign",
    "description": "Complete overhaul of company website",
    "due_date": "2023-12-31",
    "related_companies": [
      {
        "id": "comp123",
        "name": "Acme Inc"
      }
    ]
  }
}
```

### cloze_find_project

Finds projects in Cloze based on search criteria.

**Parameters:**
- `query` (required): Search query (name, description, etc.)
- `limit` (optional): Maximum number of results to return (default: 10)

**Example:**
```json
{
  "query": "Website"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "proj123",
      "name": "Website Redesign",
      "description": "Complete overhaul of company website",
      "due_date": "2023-12-31",
      "related_companies": [
        {
          "id": "comp123",
          "name": "Acme Inc"
        }
      ]
    }
  ]
}
```

### cloze_update_project

Updates an existing project in Cloze.

**Parameters:**
- `id` (required): Project ID
- `name` (optional): Project name
- `description` (optional): Project description
- `stage_id` (optional): Project stage ID
- `due_date` (optional): Due date in ISO format
- `related_people` (optional): Array of related person IDs
- `related_companies` (optional): Array of related company IDs
- `app_links` (optional): Array of external application links

**Example:**
```json
{
  "id": "proj123",
  "stage_id": "stage456",
  "due_date": "2024-01-15"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "proj123",
    "name": "Website Redesign",
    "description": "Complete overhaul of company website",
    "stage_id": "stage456",
    "stage_name": "In Progress",
    "due_date": "2024-01-15",
    "related_companies": [
      {
        "id": "comp123",
        "name": "Acme Inc"
      }
    ]
  }
}
```

### cloze_list_projects

Lists projects in Cloze with optional filtering.

**Parameters:**
- `limit` (optional): Maximum number of results to return (default: 10)
- `offset` (optional): Offset for pagination (default: 0)
- `segment_id` (optional): Filter by segment ID
- `stage_id` (optional): Filter by stage ID

**Example:**
```json
{
  "limit": 5,
  "offset": 0,
  "stage_id": "stage456"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "proj123",
      "name": "Website Redesign",
      "description": "Complete overhaul of company website",
      "stage_id": "stage456",
      "stage_name": "In Progress",
      "due_date": "2024-01-15"
    }
  ]
}
```

---

## Communication Tools

Tools for managing communications in the Cloze CRM.

### cloze_communication_add_meeting

Adds a meeting record to Cloze.

**Parameters:**
- `title` (required): Meeting title
- `date` (required): Meeting date in ISO format
- `duration` (optional): Duration in minutes
- `location` (optional): Meeting location
- `notes` (optional): Meeting notes
- `participants` (required): Array of participant IDs
- `status` (optional): Meeting status (scheduled, completed, cancelled)

**Example:**
```json
{
  "title": "Project Kickoff",
  "date": "2023-09-15T14:00:00Z",
  "duration": 60,
  "location": "Conference Room A",
  "notes": "Initial project discussion",
  "participants": ["abc123", "def456"],
  "status": "scheduled"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "meet123",
    "title": "Project Kickoff",
    "date": "2023-09-15T14:00:00Z",
    "duration": 60,
    "location": "Conference Room A",
    "notes": "Initial project discussion",
    "participants": [
      {
        "id": "abc123",
        "name": "John Doe"
      },
      {
        "id": "def456",
        "name": "Jane Smith"
      }
    ],
    "status": "scheduled"
  }
}
```

### cloze_communication_add_note

Adds a note to Cloze.

**Parameters:**
- `content` (required): Note content
- `related_people` (optional): Array of related person IDs
- `related_companies` (optional): Array of related company IDs
- `related_projects` (optional): Array of related project IDs

**Example:**
```json
{
  "content": "Follow up on proposal next week",
  "related_people": ["abc123"],
  "related_companies": ["comp123"]
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "note123",
    "content": "Follow up on proposal next week",
    "created_at": "2023-09-01T10:30:00Z",
    "related_people": [
      {
        "id": "abc123",
        "name": "John Doe"
      }
    ],
    "related_companies": [
      {
        "id": "comp123",
        "name": "Acme Inc"
      }
    ]
  }
}
```

### cloze_communication_log_email

Logs an email in Cloze.

**Parameters:**
- `subject` (required): Email subject
- `body` (required): Email body
- `date` (required): Email date in ISO format
- `from` (required): Sender email
- `to` (required): Array of recipient emails
- `cc` (optional): Array of CC recipient emails
- `related_people` (optional): Array of related person IDs
- `related_companies` (optional): Array of related company IDs
- `related_projects` (optional): Array of related project IDs

**Example:**
```json
{
  "subject": "Proposal Review",
  "body": "Please review the attached proposal and provide feedback.",
  "date": "2023-09-01T09:15:00Z",
  "from": "jane@example.com",
  "to": ["john@acme.com"],
  "related_people": ["abc123"],
  "related_companies": ["comp123"]
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "id": "email123",
    "subject": "Proposal Review",
    "body": "Please review the attached proposal and provide feedback.",
    "date": "2023-09-01T09:15:00Z",
    "from": "jane@example.com",
    "to": ["john@acme.com"],
    "related_people": [
      {
        "id": "abc123",
        "name": "John Doe"
      }
    ],
    "related_companies": [
      {
        "id": "comp123",
        "name": "Acme Inc"
      }
    ]
  }
}
```

---

## Metadata Tools

Tools for accessing Cloze metadata.

### cloze_metadata_get_segments

Gets available segments for a specific entity type.

**Parameters:**
- `entity_type` (optional): Entity type (people, companies, projects) (default: people)

**Example:**
```json
{
  "entity_type": "people"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "seg123",
      "name": "Active Clients",
      "entity_type": "people",
      "count": 142
    },
    {
      "id": "seg124",
      "name": "Leads",
      "entity_type": "people",
      "count": 78
    }
  ]
}
```

### cloze_metadata_get_stages

Gets available stages for a specific entity type.

**Parameters:**
- `entity_type` (optional): Entity type (people, projects) (default: projects)

**Example:**
```json
{
  "entity_type": "projects"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": [
    {
      "id": "stage123",
      "name": "Discovery",
      "entity_type": "projects",
      "order": 1
    },
    {
      "id": "stage124",
      "name": "Proposal",
      "entity_type": "projects",
      "order": 2
    },
    {
      "id": "stage125",
      "name": "Negotiation",
      "entity_type": "projects",
      "order": 3
    },
    {
      "id": "stage126",
      "name": "Closed Won",
      "entity_type": "projects",
      "order": 4
    }
  ]
}
```

### cloze_metadata_raw

Gets raw metadata from Cloze API.

**Parameters:**
- `endpoint` (required): Metadata endpoint path (e.g., `/v1/user/segments/people`)

**Example:**
```json
{
  "endpoint": "/v1/user/profile"
}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "profile": {
      "id": "user123",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "plan": "Enterprise",
      "created_at": "2022-03-15T10:00:00Z"
    }
  }
}
```

---

## Health Tools

Tools for checking the health of the Cloze integration.

### cloze_health_health_check

Performs a health check on the Cloze API.

**Parameters:**
None

**Example:**
```json
{}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "status": "healthy",
    "apiConnectivity": true,
    "authenticated": true,
    "profile": {
      "id": "user123",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }
}
```

### cloze_health_health_connection_status

Gets the current connection status with the Cloze API.

**Parameters:**
None

**Example:**
```json
{}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "connected": true,
    "api_url": "https://api.cloze.com/v1",
    "last_connected": "2023-09-01T15:45:00Z",
    "status": "active"
  }
}
```

### cloze_health_health_reset_connection

Resets the connection with the Cloze API.

**Parameters:**
None

**Example:**
```json
{}
```

**Response:**
```json
{
  "errorcode": 0,
  "success": true,
  "data": {
    "reset": true,
    "new_connection_id": "conn789",
    "status": "reset_complete"
  }
}
```