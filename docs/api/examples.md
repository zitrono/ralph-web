# Cloze MCP Tools Usage Examples

This document provides practical examples of using the Cloze MCP tools in different scenarios. These examples show how to perform common operations with the Cloze CRM.

## Table of Contents

1. [People Management Examples](#people-management-examples)
2. [Company Management Examples](#company-management-examples)
3. [Project Management Examples](#project-management-examples)
4. [Communication Examples](#communication-examples)
5. [Location-Based Examples](#location-based-examples)
6. [Tag Management Examples](#tag-management-examples)
7. [Metadata Access Examples](#metadata-access-examples)
8. [Health Check Examples](#health-check-examples)
9. [Workflow Examples](#workflow-examples)

## People Management Examples

### Creating a New Contact

```javascript
// Create a new person in Cloze
const createPersonResult = await callTool('cloze_create_people', {
  name: "Jane Smith",
  emails: ["jane.smith@example.com", "jsmith@company.org"],
  phones: ["+1-555-123-4567", "+1-555-987-6543"],
  company: "Example Corporation",
  title: "Chief Marketing Officer",
  bio: "Marketing executive with 15+ years experience in B2B software",
  social_profiles: [
    "https://linkedin.com/in/janesmith",
    "https://twitter.com/janesmith"
  ],
  addresses: [
    {
      street: "123 Business Ave",
      city: "San Francisco",
      state: "CA",
      postal_code: "94105",
      country: "USA"
    }
  ],
  notes: "Met at SaaS Conference 2023. Interested in enterprise solutions."
});

if (createPersonResult.success) {
  console.log(`Created person with ID: ${createPersonResult.data.id}`);
  
  // Now we can add a tag to categorize this contact
  const tagResult = await callTool('cloze_create_people_tag', {
    people_id: createPersonResult.data.id,
    name: "Enterprise Prospect"
  });
  
  if (tagResult.success) {
    console.log(`Added tag: ${tagResult.data.name}`);
  }
}
```

### Finding and Updating a Contact

```javascript
// Find a person by email
const findResult = await callTool('cloze_find_people', {
  query: "jane.smith@example.com"
});

if (findResult.success && findResult.data.length > 0) {
  const person = findResult.data[0];
  console.log(`Found person: ${person.name} (${person.id})`);
  
  // Update the person's job title
  const updateResult = await callTool('cloze_update_people', {
    id: person.id,
    title: "SVP of Marketing"
  });
  
  if (updateResult.success) {
    console.log(`Updated ${person.name}'s title to: ${updateResult.data.title}`);
  }
}
```

### Finding Nearby Contacts

```javascript
// Find people near a specific location (e.g., conference venue)
const nearbyResult = await callTool('cloze_find_nearby_people', {
  latitude: 37.7749,
  longitude: -122.4194,  // San Francisco coordinates
  radius: 10,  // 10 mile radius
  limit: 5
});

if (nearbyResult.success) {
  console.log(`Found ${nearbyResult.data.length} nearby contacts:`);
  
  nearbyResult.data.forEach(person => {
    console.log(`- ${person.name} (${person.distance.toFixed(1)} miles away at ${person.location.name})`);
  });
}
```

## Company Management Examples

### Creating and Managing a Company

```javascript
// Create a new company
const createCompanyResult = await callTool('cloze_create_company', {
  name: "Tech Innovations Inc",
  domain: "techinnovations.com",
  phone: "+1-555-987-6543",
  industry: "Software Development",
  description: "Leading provider of AI-driven software solutions"
});

if (createCompanyResult.success) {
  const companyId = createCompanyResult.data.id;
  console.log(`Created company: ${createCompanyResult.data.name} (${companyId})`);
  
  // Add company headquarters location
  const addLocationResult = await callTool('cloze_add_company_location', {
    company_id: companyId,
    name: "Headquarters",
    address: "555 Technology Way",
    city: "Mountain View",
    state: "CA",
    postal_code: "94043",
    country: "USA"
  });
  
  if (addLocationResult.success) {
    console.log(`Added headquarters location: ${addLocationResult.data.id}`);
  }
  
  // Add company tag
  const tagResult = await callTool('cloze_create_company_tag', {
    company_id: companyId,
    name: "Enterprise Account"
  });
  
  if (tagResult.success) {
    console.log(`Added tag: ${tagResult.data.name}`);
  }
}
```

### Finding Companies by Query

```javascript
// Search for companies by domain
const findCompanyResult = await callTool('cloze_find_company', {
  query: "techinnovations.com"
});

if (findCompanyResult.success && findCompanyResult.data.length > 0) {
  const company = findCompanyResult.data[0];
  console.log(`Found company: ${company.name} (${company.id})`);
  
  // Get company locations
  const locationsResult = await callTool('cloze_get_company_locations', {
    company_id: company.id
  });
  
  if (locationsResult.success) {
    console.log(`Company has ${locationsResult.data.length} locations:`);
    locationsResult.data.forEach(location => {
      console.log(`- ${location.name}: ${location.address}, ${location.city}, ${location.state}`);
    });
  }
}
```

### Finding Nearby Companies

```javascript
// Find companies near a specific location
const nearbyCompaniesResult = await callTool('cloze_find_nearby_companies', {
  latitude: 37.4133,
  longitude: -122.1162,  // Mountain View coordinates
  radius: 15,  // 15 mile radius
  limit: 5
});

if (nearbyCompaniesResult.success) {
  console.log(`Found ${nearbyCompaniesResult.data.length} nearby companies:`);
  
  nearbyCompaniesResult.data.forEach(company => {
    console.log(`- ${company.name} (${company.distance.toFixed(1)} miles away at ${company.location.name})`);
  });
}
```

## Project Management Examples

### Creating and Managing Projects

```javascript
// Create a new project
const createProjectResult = await callTool('cloze_create_project', {
  name: "Mobile App Development",
  description: "Develop a mobile application for client Tech Innovations Inc",
  due_date: "2023-12-31",
  related_companies: ["comp123"]  // Tech Innovations Inc company ID
});

if (createProjectResult.success) {
  const projectId = createProjectResult.data.id;
  console.log(`Created project: ${createProjectResult.data.name} (${projectId})`);
  
  // Get available project stages
  const stagesResult = await callTool('cloze_metadata_get_stages', {
    entity_type: "projects"
  });
  
  if (stagesResult.success) {
    // Find the "In Progress" stage
    const inProgressStage = stagesResult.data.find(stage => 
      stage.name.toLowerCase() === "in progress");
    
    if (inProgressStage) {
      // Update project status to "In Progress"
      const updateResult = await callTool('cloze_update_project', {
        id: projectId,
        stage_id: inProgressStage.id
      });
      
      if (updateResult.success) {
        console.log(`Updated project stage to: ${inProgressStage.name}`);
      }
    }
  }
}
```

### Managing Project Relationships

```javascript
// First, find the project
const findProjectResult = await callTool('cloze_find_project', {
  query: "Mobile App Development"
});

if (findProjectResult.success && findProjectResult.data.length > 0) {
  const project = findProjectResult.data[0];
  
  // Find project stakeholders
  const findPeopleResult = await callTool('cloze_find_people', {
    query: "jane.smith@example.com"
  });
  
  if (findPeopleResult.success && findPeopleResult.data.length > 0) {
    const stakeholderId = findPeopleResult.data[0].id;
    
    // Update project to add stakeholder
    const updateResult = await callTool('cloze_update_project', {
      id: project.id,
      related_people: [stakeholderId, ...project.related_people?.map(p => p.id) || []]
    });
    
    if (updateResult.success) {
      console.log(`Added stakeholder to project`);
    }
  }
}
```

## Communication Examples

### Logging a Meeting

```javascript
// First, find the people who will attend the meeting
const findJaneResult = await callTool('cloze_find_people', {
  query: "jane.smith@example.com"
});

const findJohnResult = await callTool('cloze_find_people', {
  query: "john.doe@techinnovations.com"
});

if (findJaneResult.success && findJaneResult.data.length > 0 &&
    findJohnResult.success && findJohnResult.data.length > 0) {
  
  const janeId = findJaneResult.data[0].id;
  const johnId = findJohnResult.data[0].id;
  
  // Log the meeting
  const meetingResult = await callTool('cloze_communication_add_meeting', {
    title: "Mobile App Requirements Discussion",
    date: "2023-09-15T14:00:00Z",
    duration: 60,
    location: "Tech Innovations HQ, Conference Room A",
    notes: "Initial discussion of mobile app requirements and timeline",
    participants: [janeId, johnId],
    status: "scheduled"
  });
  
  if (meetingResult.success) {
    console.log(`Scheduled meeting: ${meetingResult.data.title}`);
    console.log(`Date: ${new Date(meetingResult.data.date).toLocaleString()}`);
    console.log(`Participants: ${meetingResult.data.participants.map(p => p.name).join(", ")}`);
  }
}
```

### Adding a Note

```javascript
// First, find the company and project
const findCompanyResult = await callTool('cloze_find_company', {
  query: "techinnovations.com"
});

const findProjectResult = await callTool('cloze_find_project', {
  query: "Mobile App Development"
});

if (findCompanyResult.success && findCompanyResult.data.length > 0 &&
    findProjectResult.success && findProjectResult.data.length > 0) {
  
  const companyId = findCompanyResult.data[0].id;
  const projectId = findProjectResult.data[0].id;
  
  // Add a note about the company and project
  const noteResult = await callTool('cloze_communication_add_note', {
    content: "Client requested additional features for the mobile app: push notifications and offline mode. Budget impact to be discussed in next meeting.",
    related_companies: [companyId],
    related_projects: [projectId]
  });
  
  if (noteResult.success) {
    console.log(`Added note: ${noteResult.data.id}`);
    console.log(`Content: ${noteResult.data.content.substr(0, 50)}...`);
  }
}
```

### Logging an Email

```javascript
// Find the people involved
const findClientResult = await callTool('cloze_find_people', {
  query: "john.doe@techinnovations.com"
});

if (findClientResult.success && findClientResult.data.length > 0) {
  const clientId = findClientResult.data[0].id;
  
  // Find the company
  const findCompanyResult = await callTool('cloze_find_company', {
    query: "techinnovations.com"
  });
  
  if (findCompanyResult.success && findCompanyResult.data.length > 0) {
    const companyId = findCompanyResult.data[0].id;
    
    // Log an email
    const emailResult = await callTool('cloze_communication_log_email', {
      subject: "Mobile App Development Proposal",
      body: "Dear John,\n\nPlease find attached our proposal for the mobile app development project. The proposal includes timeline, cost estimates, and feature specifications as discussed in our previous meeting.\n\nLet me know if you have any questions.\n\nBest regards,\nJane Smith",
      date: "2023-09-10T10:15:00Z",
      from: "jane.smith@example.com",
      to: ["john.doe@techinnovations.com"],
      related_people: [clientId],
      related_companies: [companyId]
    });
    
    if (emailResult.success) {
      console.log(`Logged email: ${emailResult.data.subject}`);
      console.log(`Date: ${new Date(emailResult.data.date).toLocaleString()}`);
    }
  }
}
```

## Location-Based Examples

### Adding a Location to a Person

```javascript
// Find the person
const findPersonResult = await callTool('cloze_find_people', {
  query: "jane.smith@example.com"
});

if (findPersonResult.success && findPersonResult.data.length > 0) {
  const personId = findPersonResult.data[0].id;
  
  // Add a home location for the person
  const addLocationResult = await callTool('cloze_add_people_location', {
    people_id: personId,
    name: "Home",
    address: "456 Residential St",
    city: "Palo Alto",
    state: "CA",
    postal_code: "94301",
    country: "USA",
    latitude: 37.4419,
    longitude: -122.1430
  });
  
  if (addLocationResult.success) {
    console.log(`Added home location: ${addLocationResult.data.id}`);
    
    // Get all locations for the person
    const getLocationsResult = await callTool('cloze_get_people_locations', {
      people_id: personId
    });
    
    if (getLocationsResult.success) {
      console.log(`Person has ${getLocationsResult.data.length} locations:`);
      getLocationsResult.data.forEach(location => {
        console.log(`- ${location.name}: ${location.address}, ${location.city}, ${location.state}`);
      });
    }
  }
}
```

### Finding People for a Business Trip

```javascript
// Scenario: Planning a business trip to Boston
const nearbyPeopleResult = await callTool('cloze_find_nearby_people', {
  latitude: 42.3601,
  longitude: -71.0589,  // Boston coordinates
  radius: 25,  // 25 mile radius
  limit: 10
});

if (nearbyPeopleResult.success) {
  console.log(`Found ${nearbyPeopleResult.data.length} contacts in Boston area:`);
  
  nearbyPeopleResult.data.forEach(person => {
    console.log(`- ${person.name} (${person.distance.toFixed(1)} miles from city center)`);
    console.log(`  Location: ${person.location.name} - ${person.location.address}, ${person.location.city}`);
  });
  
  // Find companies in the same area
  const nearbyCompaniesResult = await callTool('cloze_find_nearby_companies', {
    latitude: 42.3601,
    longitude: -71.0589,  // Boston coordinates
    radius: 25,  // 25 mile radius
    limit: 10
  });
  
  if (nearbyCompaniesResult.success) {
    console.log(`\nFound ${nearbyCompaniesResult.data.length} companies in Boston area:`);
    
    nearbyCompaniesResult.data.forEach(company => {
      console.log(`- ${company.name} (${company.distance.toFixed(1)} miles from city center)`);
      console.log(`  Location: ${company.location.name} - ${company.location.address}, ${company.location.city}`);
    });
  }
}
```

## Tag Management Examples

### Organizing Contacts with Tags

```javascript
// Find multiple people to tag
const findPeopleResult = await callTool('cloze_find_people', {
  query: "example.com",  // Find all people from example.com
  limit: 20
});

if (findPeopleResult.success && findPeopleResult.data.length > 0) {
  const peopleIds = findPeopleResult.data.map(person => person.id);
  
  console.log(`Found ${peopleIds.length} people from example.com`);
  
  // Create a tag for each person
  const tagPromises = peopleIds.map(peopleId => 
    callTool('cloze_create_people_tag', {
      people_id: peopleId,
      name: "Example Team"
    })
  );
  
  // Wait for all tag creations to complete
  const tagResults = await Promise.all(tagPromises);
  
  const successful = tagResults.filter(result => result.success).length;
  console.log(`Tagged ${successful} people with "Example Team" tag`);
  
  // Now read tags for a specific person
  if (peopleIds.length > 0) {
    const readTagsResult = await callTool('cloze_read_people_tag', {
      people_id: peopleIds[0]
    });
    
    if (readTagsResult.success) {
      console.log(`Tags for ${findPeopleResult.data[0].name}:`);
      readTagsResult.data.forEach(tag => {
        console.log(`- ${tag.name}`);
      });
    }
  }
}
```

### Updating and Removing Tags

```javascript
// Find a person
const findPersonResult = await callTool('cloze_find_people', {
  query: "jane.smith@example.com"
});

if (findPersonResult.success && findPersonResult.data.length > 0) {
  const personId = findPersonResult.data[0].id;
  
  // Get existing tags
  const readTagsResult = await callTool('cloze_read_people_tag', {
    people_id: personId
  });
  
  if (readTagsResult.success) {
    console.log(`Current tags for ${findPersonResult.data[0].name}:`);
    readTagsResult.data.forEach(tag => {
      console.log(`- ${tag.name} (ID: ${tag.id})`);
    });
    
    // Find "Enterprise Prospect" tag and update it to "Enterprise Customer"
    const prospectTag = readTagsResult.data.find(tag => 
      tag.name === "Enterprise Prospect");
    
    if (prospectTag) {
      const updateTagResult = await callTool('cloze_update_people_tag', {
        tag_id: prospectTag.id,
        people_id: personId,
        name: "Enterprise Customer"
      });
      
      if (updateTagResult.success) {
        console.log(`Updated tag from "Enterprise Prospect" to "Enterprise Customer"`);
      }
    }
    
    // Delete an obsolete tag if it exists
    const obsoleteTag = readTagsResult.data.find(tag => 
      tag.name === "Potential Lead");
    
    if (obsoleteTag) {
      const deleteTagResult = await callTool('cloze_delete_people_tag', {
        tag_id: obsoleteTag.id,
        people_id: personId
      });
      
      if (deleteTagResult.success) {
        console.log(`Deleted tag "Potential Lead"`);
      }
    }
  }
}
```

## Metadata Access Examples

### Working with Segments

```javascript
// Get all segments for people
const peopleSegmentsResult = await callTool('cloze_metadata_get_segments', {
  entity_type: "people"
});

if (peopleSegmentsResult.success) {
  console.log(`Found ${peopleSegmentsResult.data.length} people segments:`);
  peopleSegmentsResult.data.forEach(segment => {
    console.log(`- ${segment.name} (${segment.count || 0} people)`);
  });
  
  // Find a specific segment
  const vipSegment = peopleSegmentsResult.data.find(segment => 
    segment.name.toLowerCase().includes("vip"));
  
  if (vipSegment) {
    // List companies in this segment
    const listCompaniesResult = await callTool('cloze_list_companies', {
      limit: 5,
      segment_id: vipSegment.id
    });
    
    if (listCompaniesResult.success) {
      console.log(`\nCompanies in the "${vipSegment.name}" segment:`);
      listCompaniesResult.data.forEach(company => {
        console.log(`- ${company.name}`);
      });
    }
  }
  
  // Get segments for projects
  const projectSegmentsResult = await callTool('cloze_metadata_get_segments', {
    entity_type: "projects"
  });
  
  if (projectSegmentsResult.success) {
    console.log(`\nFound ${projectSegmentsResult.data.length} project segments:`);
    projectSegmentsResult.data.forEach(segment => {
      console.log(`- ${segment.name} (${segment.count || 0} projects)`);
    });
  }
}
```

### Working with Project Stages

```javascript
// Get all stages for projects
const projectStagesResult = await callTool('cloze_metadata_get_stages', {
  entity_type: "projects"
});

if (projectStagesResult.success) {
  console.log(`Project stages in order:`);
  
  // Sort by order property
  const sortedStages = [...projectStagesResult.data].sort((a, b) => a.order - b.order);
  
  sortedStages.forEach(stage => {
    console.log(`${stage.order}. ${stage.name} (ID: ${stage.id})`);
  });
  
  // Find projects in the "Closed Won" stage
  const closedWonStage = sortedStages.find(stage => 
    stage.name.toLowerCase().includes("closed won"));
  
  if (closedWonStage) {
    const projectsInStageResult = await callTool('cloze_list_projects', {
      limit: 5,
      stage_id: closedWonStage.id
    });
    
    if (projectsInStageResult.success) {
      console.log(`\nProjects in "${closedWonStage.name}" stage:`);
      projectsInStageResult.data.forEach(project => {
        console.log(`- ${project.name}`);
      });
    }
  }
}
```

### Raw Metadata Access

```javascript
// Get user profile information
const profileResult = await callTool('cloze_metadata_raw', {
  endpoint: "/v1/user/profile"
});

if (profileResult.success) {
  console.log(`User profile information:`);
  console.log(`Name: ${profileResult.data.profile.name}`);
  console.log(`Email: ${profileResult.data.profile.email}`);
  console.log(`Plan: ${profileResult.data.profile.plan}`);
  
  // Get custom fields for people
  const customFieldsResult = await callTool('cloze_metadata_raw', {
    endpoint: "/v1/user/custom_fields/people"
  });
  
  if (customFieldsResult.success) {
    console.log(`\nCustom fields for people:`);
    customFieldsResult.data.custom_fields.forEach(field => {
      console.log(`- ${field.name} (${field.type})`);
    });
  }
}
```

## Health Check Examples

### Performing Health Checks

```javascript
// Check the general health of the Cloze API connection
const healthCheckResult = await callTool('cloze_health_health_check', {});

if (healthCheckResult.success) {
  console.log(`Cloze API Health Status: ${healthCheckResult.data.status}`);
  console.log(`API Connectivity: ${healthCheckResult.data.apiConnectivity ? "Yes" : "No"}`);
  console.log(`Authenticated: ${healthCheckResult.data.authenticated ? "Yes" : "No"}`);
  
  if (healthCheckResult.data.profile) {
    console.log(`Connected as: ${healthCheckResult.data.profile.name} (${healthCheckResult.data.profile.email})`);
  }
  
  // Get more detailed connection status
  const connectionStatusResult = await callTool('cloze_health_health_connection_status', {});
  
  if (connectionStatusResult.success) {
    console.log(`\nConnection Details:`);
    console.log(`Currently Connected: ${connectionStatusResult.data.connected ? "Yes" : "No"}`);
    console.log(`API URL: ${connectionStatusResult.data.api_url}`);
    console.log(`Last Connected: ${new Date(connectionStatusResult.data.last_connected).toLocaleString()}`);
    console.log(`Status: ${connectionStatusResult.data.status}`);
  }
}
```

### Resetting Connection

```javascript
// Reset connection if experiencing issues
const resetResult = await callTool('cloze_health_health_reset_connection', {});

if (resetResult.success) {
  console.log(`Connection reset: ${resetResult.data.reset ? "Success" : "Failed"}`);
  
  if (resetResult.data.reset) {
    console.log(`New Connection ID: ${resetResult.data.new_connection_id}`);
    console.log(`Status: ${resetResult.data.status}`);
    
    // Verify health after reset
    const healthCheckResult = await callTool('cloze_health_health_check', {});
    
    if (healthCheckResult.success) {
      console.log(`\nHealth Status After Reset: ${healthCheckResult.data.status}`);
      console.log(`API Connectivity: ${healthCheckResult.data.apiConnectivity ? "Yes" : "No"}`);
      console.log(`Authenticated: ${healthCheckResult.data.authenticated ? "Yes" : "No"}`);
    }
  }
}
```

## Workflow Examples

### Complete Contact Management Workflow

```javascript
// Complete workflow for creating and managing a contact

// Step 1: Create a new person
const createPersonResult = await callTool('cloze_create_people', {
  name: "Robert Johnson",
  emails: ["robert.johnson@newclient.com"],
  phones: ["+1-555-321-7890"],
  company: "New Client LLC",
  title: "Chief Technology Officer"
});

if (!createPersonResult.success) {
  throw new Error(`Failed to create person: ${createPersonResult.error.message}`);
}

const personId = createPersonResult.data.id;
console.log(`Created person: ${createPersonResult.data.name} (${personId})`);

// Step 2: Add location for the person
const addLocationResult = await callTool('cloze_add_people_location', {
  people_id: personId,
  name: "Office",
  address: "789 Tech Blvd",
  city: "Austin",
  state: "TX",
  postal_code: "78701",
  country: "USA"
});

if (!addLocationResult.success) {
  throw new Error(`Failed to add location: ${addLocationResult.error.message}`);
}

console.log(`Added office location: ${addLocationResult.data.id}`);

// Step 3: Create a tag for the person
const tagResult = await callTool('cloze_create_people_tag', {
  people_id: personId,
  name: "New Lead"
});

if (!tagResult.success) {
  throw new Error(`Failed to create tag: ${tagResult.error.message}`);
}

console.log(`Added tag: ${tagResult.data.name}`);

// Step 4: Find or create the company
const findCompanyResult = await callTool('cloze_find_company', {
  query: "New Client LLC"
});

let companyId;

if (findCompanyResult.success && findCompanyResult.data.length > 0) {
  // Use existing company
  companyId = findCompanyResult.data[0].id;
  console.log(`Found existing company: ${findCompanyResult.data[0].name} (${companyId})`);
} else {
  // Create new company
  const createCompanyResult = await callTool('cloze_create_company', {
    name: "New Client LLC",
    domain: "newclient.com",
    industry: "Technology"
  });
  
  if (!createCompanyResult.success) {
    throw new Error(`Failed to create company: ${createCompanyResult.error.message}`);
  }
  
  companyId = createCompanyResult.data.id;
  console.log(`Created new company: ${createCompanyResult.data.name} (${companyId})`);
}

// Step 5: Create a new project
const createProjectResult = await callTool('cloze_create_project', {
  name: "AI Integration Project",
  description: "Integrate AI capabilities into New Client's platform",
  due_date: "2023-12-15",
  related_people: [personId],
  related_companies: [companyId]
});

if (!createProjectResult.success) {
  throw new Error(`Failed to create project: ${createProjectResult.error.message}`);
}

const projectId = createProjectResult.data.id;
console.log(`Created project: ${createProjectResult.data.name} (${projectId})`);

// Step 6: Log an initial note about the project
const noteResult = await callTool('cloze_communication_add_note', {
  content: "Initial contact with Robert Johnson, CTO of New Client LLC. Discussed potential AI integration project. They're interested in implementing natural language processing for their customer service platform.",
  related_people: [personId],
  related_companies: [companyId],
  related_projects: [projectId]
});

if (!noteResult.success) {
  throw new Error(`Failed to add note: ${noteResult.error.message}`);
}

console.log(`Added initial note: ${noteResult.data.id}`);

// Step 7: Schedule a follow-up meeting
const meetingResult = await callTool('cloze_communication_add_meeting', {
  title: "AI Integration Project Kickoff",
  date: "2023-10-01T14:00:00Z",
  duration: 90,
  location: "Virtual (Zoom)",
  notes: "Initial project kickoff meeting to discuss scope, timeline, and requirements",
  participants: [personId],
  status: "scheduled"
});

if (!meetingResult.success) {
  throw new Error(`Failed to schedule meeting: ${meetingResult.error.message}`);
}

console.log(`Scheduled kickoff meeting: ${meetingResult.data.id}`);
console.log(`Meeting date: ${new Date(meetingResult.data.date).toLocaleString()}`);

// Final status report
console.log("\nContact Management Workflow Completed Successfully");
console.log(`Created person: ${createPersonResult.data.name}`);
console.log(`Added office location in ${addLocationResult.data.city}, ${addLocationResult.data.state}`);
console.log(`Tagged as: ${tagResult.data.name}`);
console.log(`Associated with company: ${companyId}`);
console.log(`Created project: ${createProjectResult.data.name}`);
console.log(`Added initial contact note`);
console.log(`Scheduled kickoff meeting for ${new Date(meetingResult.data.date).toLocaleString()}`);
```

### Complete Company Discovery Workflow

```javascript
// Complete workflow for discovering and organizing companies in a specific area

// Step 1: Define target area (San Francisco)
const latitude = 37.7749;
const longitude = -122.4194;
const radius = 15; // miles

// Step 2: Find nearby companies
const nearbyCompaniesResult = await callTool('cloze_find_nearby_companies', {
  latitude,
  longitude,
  radius,
  limit: 20
});

if (!nearbyCompaniesResult.success) {
  throw new Error(`Failed to find nearby companies: ${nearbyCompaniesResult.error.message}`);
}

const companies = nearbyCompaniesResult.data;
console.log(`Found ${companies.length} companies within ${radius} miles of San Francisco:`);

// Step 3: Get segments to categorize companies
const segmentsResult = await callTool('cloze_metadata_get_segments', {
  entity_type: "companies"
});

if (!segmentsResult.success) {
  throw new Error(`Failed to get segments: ${segmentsResult.error.message}`);
}

// Find or create "SF Area" segment using raw metadata access
const rawSegmentResult = await callTool('cloze_metadata_raw', {
  endpoint: "/v1/user/segments/companies"
});

let sfAreaSegmentId;

if (rawSegmentResult.success) {
  // Check if "SF Area" segment exists
  const sfAreaSegment = rawSegmentResult.data.segments.find(segment => 
    segment.name === "SF Area");
  
  if (sfAreaSegment) {
    sfAreaSegmentId = sfAreaSegment.id;
    console.log(`Found existing "SF Area" segment (${sfAreaSegmentId})`);
  } else {
    // Would create segment here if API supported it
    console.log(`Would create "SF Area" segment if API supported it`);
  }
}

// Step 4: Process each company
const processedCompanies = [];

for (const company of companies) {
  console.log(`\nProcessing company: ${company.name}`);
  
  // Get company details
  const findCompanyResult = await callTool('cloze_find_company', {
    query: company.name
  });
  
  if (!findCompanyResult.success || findCompanyResult.data.length === 0) {
    console.log(`Could not find detailed information for ${company.name}`);
    continue;
  }
  
  const companyDetails = findCompanyResult.data[0];
  const companyId = companyDetails.id;
  
  // Add "SF Area" tag to company
  const tagResult = await callTool('cloze_create_company_tag', {
    company_id: companyId,
    name: "SF Area"
  });
  
  if (!tagResult.success) {
    console.log(`Failed to tag ${company.name}: ${tagResult.error.message}`);
  } else {
    console.log(`Tagged ${company.name} as "SF Area"`);
  }
  
  // Get all company locations
  const locationsResult = await callTool('cloze_get_company_locations', {
    company_id: companyId
  });
  
  if (locationsResult.success) {
    console.log(`Company has ${locationsResult.data.length} locations:`);
    locationsResult.data.forEach(location => {
      console.log(`- ${location.name}: ${location.address}, ${location.city}, ${location.state}`);
    });
  }
  
  // Add company to our processed list
  processedCompanies.push({
    id: companyId,
    name: company.name,
    distance: company.distance,
    locations: locationsResult.success ? locationsResult.data.length : 0
  });
}

// Step 5: Create a note summarizing the discovery
const discoveryNoteContent = `
SF Area Company Discovery Results:

Found ${processedCompanies.length} companies within ${radius} miles of San Francisco.

Closest companies:
${processedCompanies
  .sort((a, b) => a.distance - b.distance)
  .slice(0, 5)
  .map(company => `- ${company.name} (${company.distance.toFixed(1)} miles away)`)
  .join("\n")}

All companies have been tagged with "SF Area" for future reference.
`;

const noteResult = await callTool('cloze_communication_add_note', {
  content: discoveryNoteContent
});

if (!noteResult.success) {
  throw new Error(`Failed to create discovery note: ${noteResult.error.message}`);
}

console.log(`\nCreated discovery summary note: ${noteResult.data.id}`);

// Final status report
console.log("\nCompany Discovery Workflow Completed Successfully");
console.log(`Discovered ${processedCompanies.length} companies in San Francisco area`);
console.log(`Tagged all companies with "SF Area" tag`);
console.log(`Created discovery summary note`);
```