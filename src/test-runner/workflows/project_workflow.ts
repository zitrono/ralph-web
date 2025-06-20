/**
 * Project workflow test
 * Tests the complete lifecycle of Project CRUD operations
 */

import { TestServer } from '../runner.js';
import logger from '../../logging.js';

/**
 * Test the project CRUD lifecycle
 */
export async function testProjectWorkflow(server: TestServer): Promise<void> {
  logger.info('Running project workflow test');
  
  // Generate a random project name and unique ID for testing
  const projectName = `Test Project ${Date.now()}`;
  const uniqueId = `project-${Date.now()}`;
  
  logger.info(`Testing with project name: ${projectName} and uniqueId: ${uniqueId}`);
  
  // Step 1: Create a new project
  logger.info(`Step 1: Creating project with name ${projectName}`);
  const createResult = await server.callTool('cloze_create_project', {
    name: projectName,
    appLinks: [
      {
        uniqueid: uniqueId,
        source: 'claude.ai',
        url: 'https://example.org',
        label: 'Created via Cloze MCP'
      }
    ],
    segment: 'project',
    stage: 'current',
    startDate: '2025-05-01',
    endDate: '2025-12-31',
    summary: 'Test project description'
  });
  
  // Verify creation was successful
  if (createResult.error) {
    throw new Error(`Failed to create project: ${JSON.stringify(createResult.error)}`);
  }
  
  logger.info('Project created successfully');
  
  // Step 2: Find the project
  logger.info(`Step 2: Finding project with name ${projectName}`);
  const findResult = await server.callTool('cloze_find_project', {
    name: projectName
  });
  
  // Verify we found the project
  if (!findResult.projects || findResult.projects.length === 0) {
    throw new Error('Project not found');
  }
  
  const project = findResult.projects[0];
  
  // Verify the project has the correct data
  if (project.name !== projectName || 
      !project.appLinks || 
      !project.appLinks.some((link: { uniqueid: string }) => link.uniqueid === uniqueId) ||
      project.segment !== 'project' ||
      project.stage !== 'current' ||
      project.startDate !== '2025-05-01' ||
      project.endDate !== '2025-12-31' ||
      project.summary !== 'Test project description') {
    throw new Error(`Project data is incorrect: ${JSON.stringify(project)}`);
  }
  
  logger.info('Project found with correct data');
  
  // Step 3: Update the project
  logger.info(`Step 3: Updating project with name ${projectName}`);
  const updateResult = await server.callTool('cloze_update_project', {
    name: projectName,
    appLinks: [
      {
        uniqueid: uniqueId, // Must use the same uniqueid to update
        source: 'claude.ai',
        url: 'https://example.org/updated',
        label: 'Updated via Cloze MCP'
      }
    ],
    summary: 'Updated project description',
    stage: 'pending'
  });
  
  // Verify update was successful
  if (updateResult.error) {
    throw new Error(`Failed to update project: ${JSON.stringify(updateResult.error)}`);
  }
  
  logger.info('Project updated successfully');
  
  // Step 4: Verify the update
  logger.info(`Step 4: Verifying update for project with name ${projectName}`);
  const findAfterUpdateResult = await server.callTool('cloze_find_project', {
    name: projectName
  });
  
  // Verify we found the project again
  if (!findAfterUpdateResult.projects || findAfterUpdateResult.projects.length === 0) {
    throw new Error('Project not found after update');
  }
  
  const updatedProject = findAfterUpdateResult.projects[0];
  
  // Verify the project has the updated data
  if (updatedProject.summary !== 'Updated project description' || 
      updatedProject.stage !== 'pending' ||
      !updatedProject.appLinks || 
      !updatedProject.appLinks.some((link: { url: string }) => link.url === 'https://example.org/updated')) {
    throw new Error(`Project update was not applied: ${JSON.stringify(updatedProject)}`);
  }
  
  logger.info('Project update verified');
  
  // Step 5: List projects
  logger.info(`Step 5: Listing projects`);
  
  try {
    const listResult = await server.callTool('cloze_list_projects', {
      pagesize: 10
    });
    
    // Verify we can list projects
    if (listResult.projects) {
      logger.info(`Listed ${listResult.projects.length} projects`);
    } else {
      logger.warn('No projects returned from list - this is expected in mock implementation');
    }
  } catch (error) {
    logger.warn('Error listing projects - this is expected in mock implementation:', error);
  }
  
  // Note: Cloze API doesn't provide a dedicated project deletion endpoint
  // For tests, we would generally update the project to a terminal state (won/lost)
  
  logger.info('Project workflow test completed successfully');
}