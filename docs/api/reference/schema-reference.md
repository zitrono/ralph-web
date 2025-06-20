# Cloze Schema Reference

This document provides detailed schema information for the data structures used in the Cloze MCP integration. These schemas define the data validation rules and types used across the API.

## Table of Contents

1. [Common Schemas](#common-schemas)
2. [People Schemas](#people-schemas)
3. [Company Schemas](#company-schemas)
4. [Project Schemas](#project-schemas)
5. [Communication Schemas](#communication-schemas)
6. [Location Schemas](#location-schemas)
7. [Tag Schemas](#tag-schemas)
8. [Metadata Schemas](#metadata-schemas)
9. [Response Schemas](#response-schemas)

## Common Schemas

### ID Schema

UUID or other identifier format used across Cloze entities.

```typescript
export const idSchema = z.string().min(1);
```

### Email Schema

Email address validation schema.

```typescript
export const emailSchema = z.string().email();
```

### Phone Schema

Phone number validation schema.

```typescript
export const phoneSchema = z.string().min(5);
```

### Address Schema

Structure for physical addresses.

```typescript
export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional()
});
```

### Date Schema

ISO 8601 date format validation.

```typescript
export const dateSchema = z.string().refine(
  (value) => !isNaN(Date.parse(value)),
  { message: "Invalid date format, must be ISO 8601 format" }
);
```

### URL Schema

URL validation schema.

```typescript
export const urlSchema = z.string().url();
```

### Geographic Coordinates Schema

Latitude and longitude validation.

```typescript
export const latitudeSchema = z.number().min(-90).max(90);
export const longitudeSchema = z.number().min(-180).max(180);
```

## People Schemas

### Create Person Schema

Schema for creating a new person in Cloze.

```typescript
export const createPersonSchema = z.object({
  name: z.string().min(1),
  emails: z.array(emailSchema).optional(),
  phones: z.array(phoneSchema).optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  social_profiles: z.array(urlSchema).optional(),
  addresses: z.array(addressSchema).optional(),
  notes: z.string().optional()
});
```

### Find Person Schema

Schema for finding people in Cloze.

```typescript
export const findPersonSchema = z.object({
  query: z.string().min(1),
  limit: z.number().positive().optional().default(10),
  include_related: z.boolean().optional().default(false)
});
```

### Update Person Schema

Schema for updating an existing person in Cloze.

```typescript
export const updatePersonSchema = z.object({
  id: idSchema,
  name: z.string().min(1).optional(),
  emails: z.array(emailSchema).optional(),
  phones: z.array(phoneSchema).optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  social_profiles: z.array(urlSchema).optional(),
  addresses: z.array(addressSchema).optional(),
  notes: z.string().optional()
});
```

### Delete Person Schema

Schema for deleting a person from Cloze.

```typescript
export const deletePersonSchema = z.object({
  id: idSchema
});
```

### Person Response Schema

Schema for a person response from Cloze.

```typescript
export const personResponseSchema = z.object({
  id: idSchema,
  name: z.string(),
  emails: z.array(emailSchema).optional(),
  phones: z.array(phoneSchema).optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  social_profiles: z.array(urlSchema).optional(),
  addresses: z.array(addressSchema).optional(),
  notes: z.string().optional(),
  created_at: dateSchema.optional(),
  updated_at: dateSchema.optional()
});
```

## Company Schemas

### Create Company Schema

Schema for creating a new company in Cloze.

```typescript
export const createCompanySchema = z.object({
  name: z.string().min(1),
  domain: z.string().optional(),
  phone: phoneSchema.optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  addresses: z.array(addressSchema).optional()
});
```

### Find Company Schema

Schema for finding companies in Cloze.

```typescript
export const findCompanySchema = z.object({
  query: z.string().min(1),
  limit: z.number().positive().optional().default(10)
});
```

### Update Company Schema

Schema for updating an existing company in Cloze.

```typescript
export const updateCompanySchema = z.object({
  id: idSchema,
  name: z.string().min(1).optional(),
  domain: z.string().optional(),
  phone: phoneSchema.optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  addresses: z.array(addressSchema).optional()
});
```

### List Companies Schema

Schema for listing companies in Cloze.

```typescript
export const listCompaniesSchema = z.object({
  limit: z.number().positive().optional().default(10),
  offset: z.number().nonnegative().optional().default(0),
  segment_id: idSchema.optional()
});
```

### Company Response Schema

Schema for a company response from Cloze.

```typescript
export const companyResponseSchema = z.object({
  id: idSchema,
  name: z.string(),
  domain: z.string().optional(),
  phone: phoneSchema.optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  addresses: z.array(addressSchema).optional(),
  created_at: dateSchema.optional(),
  updated_at: dateSchema.optional()
});
```

## Project Schemas

### Create Project Schema

Schema for creating a new project in Cloze.

```typescript
export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  stage_id: idSchema.optional(),
  due_date: dateSchema.optional(),
  related_people: z.array(idSchema).optional(),
  related_companies: z.array(idSchema).optional(),
  app_links: z.array(urlSchema).optional()
});
```

### Find Project Schema

Schema for finding projects in Cloze.

```typescript
export const findProjectSchema = z.object({
  query: z.string().min(1),
  limit: z.number().positive().optional().default(10)
});
```

### Update Project Schema

Schema for updating an existing project in Cloze.

```typescript
export const updateProjectSchema = z.object({
  id: idSchema,
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  stage_id: idSchema.optional(),
  due_date: dateSchema.optional(),
  related_people: z.array(idSchema).optional(),
  related_companies: z.array(idSchema).optional(),
  app_links: z.array(urlSchema).optional()
});
```

### List Projects Schema

Schema for listing projects in Cloze.

```typescript
export const listProjectsSchema = z.object({
  limit: z.number().positive().optional().default(10),
  offset: z.number().nonnegative().optional().default(0),
  segment_id: idSchema.optional(),
  stage_id: idSchema.optional()
});
```

### Project Response Schema

Schema for a project response from Cloze.

```typescript
export const projectResponseSchema = z.object({
  id: idSchema,
  name: z.string(),
  description: z.string().optional(),
  stage_id: idSchema.optional(),
  stage_name: z.string().optional(),
  due_date: dateSchema.optional(),
  related_people: z.array(z.object({
    id: idSchema,
    name: z.string()
  })).optional(),
  related_companies: z.array(z.object({
    id: idSchema,
    name: z.string()
  })).optional(),
  app_links: z.array(urlSchema).optional(),
  created_at: dateSchema.optional(),
  updated_at: dateSchema.optional()
});
```

## Communication Schemas

### Add Meeting Schema

Schema for adding a meeting record to Cloze.

```typescript
export const addMeetingSchema = z.object({
  title: z.string().min(1),
  date: dateSchema,
  duration: z.number().positive().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  participants: z.array(idSchema).min(1),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional().default('scheduled')
});
```

### Add Note Schema

Schema for adding a note to Cloze.

```typescript
export const addNoteSchema = z.object({
  content: z.string().min(1),
  related_people: z.array(idSchema).optional(),
  related_companies: z.array(idSchema).optional(),
  related_projects: z.array(idSchema).optional()
});
```

### Log Email Schema

Schema for logging an email in Cloze.

```typescript
export const logEmailSchema = z.object({
  subject: z.string().min(1),
  body: z.string(),
  date: dateSchema,
  from: emailSchema,
  to: z.array(emailSchema).min(1),
  cc: z.array(emailSchema).optional(),
  related_people: z.array(idSchema).optional(),
  related_companies: z.array(idSchema).optional(),
  related_projects: z.array(idSchema).optional()
});
```

### Meeting Response Schema

Schema for a meeting response from Cloze.

```typescript
export const meetingResponseSchema = z.object({
  id: idSchema,
  title: z.string(),
  date: dateSchema,
  duration: z.number().positive().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  participants: z.array(z.object({
    id: idSchema,
    name: z.string()
  })),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  created_at: dateSchema.optional()
});
```

### Note Response Schema

Schema for a note response from Cloze.

```typescript
export const noteResponseSchema = z.object({
  id: idSchema,
  content: z.string(),
  created_at: dateSchema,
  related_people: z.array(z.object({
    id: idSchema,
    name: z.string()
  })).optional(),
  related_companies: z.array(z.object({
    id: idSchema,
    name: z.string()
  })).optional(),
  related_projects: z.array(z.object({
    id: idSchema,
    name: z.string()
  })).optional()
});
```

### Email Response Schema

Schema for an email response from Cloze.

```typescript
export const emailResponseSchema = z.object({
  id: idSchema,
  subject: z.string(),
  body: z.string(),
  date: dateSchema,
  from: emailSchema,
  to: z.array(emailSchema),
  cc: z.array(emailSchema).optional(),
  related_people: z.array(z.object({
    id: idSchema,
    name: z.string()
  })).optional(),
  related_companies: z.array(z.object({
    id: idSchema,
    name: z.string()
  })).optional(),
  related_projects: z.array(z.object({
    id: idSchema,
    name: z.string()
  })).optional(),
  created_at: dateSchema.optional()
});
```

## Location Schemas

### Add Location Schema

Schema for adding a location to a person or company in Cloze.

```typescript
export const addLocationSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional()
});
```

### Add People Location Schema

Schema for adding a location to a person in Cloze.

```typescript
export const addPeopleLocationSchema = addLocationSchema.extend({
  people_id: idSchema
});
```

### Add Company Location Schema

Schema for adding a location to a company in Cloze.

```typescript
export const addCompanyLocationSchema = addLocationSchema.extend({
  company_id: idSchema
});
```

### Get Locations Schema

Schema for getting locations for a person or company in Cloze.

```typescript
export const getPeopleLocationsSchema = z.object({
  people_id: idSchema
});

export const getCompanyLocationsSchema = z.object({
  company_id: idSchema
});
```

### Find Nearby Schema

Schema for finding people or companies near a location.

```typescript
export const findNearbySchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  radius: z.number().positive().optional().default(5),
  limit: z.number().positive().optional().default(10)
});
```

### Location Response Schema

Schema for a location response from Cloze.

```typescript
export const locationResponseSchema = z.object({
  id: idSchema,
  name: z.string(),
  address: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  latitude: latitudeSchema.optional(),
  longitude: longitudeSchema.optional(),
  created_at: dateSchema.optional(),
  updated_at: dateSchema.optional()
});
```

### People Location Response Schema

Schema for a person location response from Cloze.

```typescript
export const peopleLocationResponseSchema = locationResponseSchema.extend({
  people_id: idSchema
});
```

### Company Location Response Schema

Schema for a company location response from Cloze.

```typescript
export const companyLocationResponseSchema = locationResponseSchema.extend({
  company_id: idSchema
});
```

### Nearby Entity Response Schema

Schema for nearby people or companies response from Cloze.

```typescript
export const nearbyEntityResponseSchema = z.object({
  id: idSchema,
  name: z.string(),
  distance: z.number().nonnegative(),
  location: z.object({
    id: idSchema,
    name: z.string(),
    address: z.string(),
    city: z.string().optional(),
    state: z.string().optional()
  })
});
```

## Tag Schemas

### Create Tag Schema

Schema for creating a tag for a person or company in Cloze.

```typescript
export const createTagSchema = z.object({
  name: z.string().min(1)
});
```

### Create People Tag Schema

Schema for creating a tag for a person in Cloze.

```typescript
export const createPeopleTagSchema = createTagSchema.extend({
  people_id: idSchema
});
```

### Create Company Tag Schema

Schema for creating a tag for a company in Cloze.

```typescript
export const createCompanyTagSchema = createTagSchema.extend({
  company_id: idSchema
});
```

### Read Tag Schema

Schema for getting tags for a person or company in Cloze.

```typescript
export const readPeopleTagSchema = z.object({
  people_id: idSchema
});

export const readCompanyTagSchema = z.object({
  company_id: idSchema
});
```

### Update Tag Schema

Schema for updating a tag for a person or company in Cloze.

```typescript
export const updatePeopleTagSchema = z.object({
  tag_id: idSchema,
  people_id: idSchema,
  name: z.string().min(1)
});

export const updateCompanyTagSchema = z.object({
  tag_id: idSchema,
  company_id: idSchema,
  name: z.string().min(1)
});
```

### Delete Tag Schema

Schema for deleting a tag from a person or company in Cloze.

```typescript
export const deletePeopleTagSchema = z.object({
  tag_id: idSchema,
  people_id: idSchema
});

export const deleteCompanyTagSchema = z.object({
  tag_id: idSchema,
  company_id: idSchema
});
```

### Tag Response Schema

Schema for a tag response from Cloze.

```typescript
export const tagResponseSchema = z.object({
  id: idSchema,
  name: z.string(),
  created_at: dateSchema.optional()
});
```

### People Tag Response Schema

Schema for a person tag response from Cloze.

```typescript
export const peopleTagResponseSchema = tagResponseSchema.extend({
  people_id: idSchema
});
```

### Company Tag Response Schema

Schema for a company tag response from Cloze.

```typescript
export const companyTagResponseSchema = tagResponseSchema.extend({
  company_id: idSchema
});
```

## Metadata Schemas

### Get Segments Schema

Schema for getting segments for a specific entity type.

```typescript
export const getSegmentsSchema = z.object({
  entity_type: z.enum(['people', 'companies', 'projects']).optional().default('people')
});
```

### Get Stages Schema

Schema for getting stages for a specific entity type.

```typescript
export const getStagesSchema = z.object({
  entity_type: z.enum(['people', 'projects']).optional().default('projects')
});
```

### Raw Metadata Schema

Schema for getting raw metadata from Cloze API.

```typescript
export const rawMetadataSchema = z.object({
  endpoint: z.string().min(1)
});
```

### Segment Response Schema

Schema for a segment response from Cloze.

```typescript
export const segmentResponseSchema = z.object({
  id: idSchema,
  name: z.string(),
  entity_type: z.enum(['people', 'companies', 'projects']),
  count: z.number().nonnegative().optional()
});
```

### Stage Response Schema

Schema for a stage response from Cloze.

```typescript
export const stageResponseSchema = z.object({
  id: idSchema,
  name: z.string(),
  entity_type: z.enum(['people', 'projects']),
  order: z.number().nonnegative()
});
```

## Response Schemas

### Success Response Schema

Base schema for successful responses from all tools.

```typescript
export const successResponseSchema = z.object({
  errorcode: z.literal(0),
  success: z.literal(true),
  data: z.any()
});
```

### Error Response Schema

Base schema for error responses from all tools.

```typescript
export const errorResponseSchema = z.object({
  errorcode: z.number().positive(),
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional()
  }),
  stack: z.string().optional() // Only in development mode
});
```

### Health Response Schema

Schema for health check responses.

```typescript
export const healthResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  apiConnectivity: z.boolean(),
  authenticated: z.boolean(),
  profile: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional()
  }).optional()
});
```

### Connection Status Response Schema

Schema for connection status responses.

```typescript
export const connectionStatusResponseSchema = z.object({
  connected: z.boolean(),
  api_url: z.string().optional(),
  last_connected: dateSchema.optional(),
  status: z.enum(['active', 'inactive', 'error']).optional()
});
```

### Reset Connection Response Schema

Schema for reset connection responses.

```typescript
export const resetConnectionResponseSchema = z.object({
  reset: z.boolean(),
  new_connection_id: z.string().optional(),
  status: z.enum(['reset_complete', 'reset_failed', 'partial_reset']).optional()
});
```