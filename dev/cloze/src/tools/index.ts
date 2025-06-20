/**
 * Tools Index
 * 
 * Main entry point for tool registration and usage following a 
 * domain-driven architecture.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../core/utils/logger.js';
import { ToolRegistry } from './core/registry.js';

// Import tool implementations - API entity tools
import { PersonTool } from './api/person.js';
import { CompanyTool } from './api/company.js';
import { ProjectTool } from './api/project.js';
import { TimelineTool } from './api/timeline.js';
import { CommunicationTool } from './api/communication.js';

// Import tool implementations - Utility tools
import { HealthTool } from './utility/health.js';
import { LocationTool } from './utility/location.js';
import { EmailTool } from './utility/email.js';
import { TestingTool } from './utility/testing.js';
import { TaskTool } from './utility/task.js';

// Import metadata tools
import { MetadataTool } from './utility/metadata.js';

// No legacy tool names - using only domain-driven architecture

/**
 * Register all tools with the MCP server
 * 
 * @param server MCP server instance
 * @returns Number of registered tools (total count)
 */
export function registerAllTools(server: McpServer): number {
  logger.info('Registering all tools using domain-driven architecture');
  
  const registry = new ToolRegistry(server);
  
  // Register API entity tools
  registry.register(new PersonTool());
  registry.register(new CompanyTool());
  registry.register(new ProjectTool());
  registry.register(new TimelineTool());
  registry.register(new CommunicationTool());

  // Register utility tools
  registry.register(new HealthTool());
  registry.register(new LocationTool());
  registry.register(new EmailTool());
  registry.register(new TestingTool());
  registry.register(new TaskTool());
  registry.register(new MetadataTool());

  // All tools have been migrated to the domain-driven architecture
  let legacyToolCount = 0;
  
  logger.info(`Registered ${registry.getRegisteredCount()} tools from domain-driven architecture`);
  logger.info(`Registered ${legacyToolCount} tools from legacy structure`);
  
  return registry.getRegisteredCount() + legacyToolCount;
}

/**
 * Re-export base classes for external use
 */
export { Tool } from './core/base/tool.js';
export { EntityTool } from './core/base/entity-tool.js';
export { ApiTool } from './core/base/api-tool.js';
export { UtilityTool } from './core/base/utility-tool.js';

/**
 * Re-export middleware for external use
 */
export { 
  withErrorHandling, 
  withErrorRecovery,
  ErrorRecoveryOptions 
} from './core/middleware/error-handling.js';

export {
  validateParams,
  validateAtLeastOneParam,
  validateParamValues,
  ValidationError
} from './core/middleware/validation.js';

export {
  logOperationStart,
  logOperationComplete,
  logValidation,
  LogLevel,
  ParamLogMode
} from './core/middleware/logging.js';