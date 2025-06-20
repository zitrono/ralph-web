/**
 * Email Tool
 *
 * Tools for managing email communications in the Cloze API.
 */

import { ToolDefinition } from '../../core/types/mcp/tool-types.js';
import { ClozeApiClient } from '../../core/api/cloze-api-client.js';
import { configManager } from '../../core/config/config-manager.js';
import { logger } from '../../core/utils/logger.js';
import { formatDateParam } from '../../core/utils/param-utils.js';
import { SearchParams } from '../../core/types/api-types.js';
import { UtilityTool } from '../core/base/utility-tool.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { withErrorHandling } from '../core/middleware/error-handling.js';
import { validateParams, validateAtLeastOneParam } from '../core/middleware/validation.js';
import { logOperationStart, logOperationComplete } from '../core/middleware/logging.js';
import {
  extractMcpParameters,
  validateRequiredParams,
  validateAtLeastOneParam as validateAtLeastOneMcpParam,
  formatSuccessResponse,
  formatErrorResponse
} from '../../core/utils/mcp-param-utils.js';

// Define interfaces for email tools
interface EmailSearchParams {
  query?: string;
  sender?: string;
  recipient?: string;
  subject?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
  [key: string]: any; // Allow other properties
}

interface EmailThreadParams {
  threadId: string;
  includeAttachments?: boolean;
  [key: string]: any; // Allow other properties
}

interface EmailSummaryParams {
  personId?: string;
  personEmail?: string;
  companyId?: string;
  companyDomain?: string;
  limit?: number;
  daysBack?: number;
  [key: string]: any; // Allow other properties
}

interface SendEmailParams {
  subject: string;
  recipients: string | string[];
  content: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: string[];
  [key: string]: any; // Allow other properties
}

/**
 * Email utility tools for working with Cloze emails
 */
export class EmailTool extends UtilityTool {
  /**
   * Creates a new email tool
   */
  constructor() {
    super('email');
  }

  /**
   * Register email tools with the MCP server
   *
   * @param server MCP server instance
   * @returns Number of registered tools
   */
  public register(server: McpServer): number {
    logger.debug('Registering email tools');
    const toolDefinitions = this.getToolDefinitions();

    // Register all tools with both new and legacy names for backward compatibility
    let toolCount = 0;
    for (const tool of toolDefinitions) {
      // Register the new style name (e.g., cloze_email_search_emails)
      server.tool(
        tool.name,
        tool.description,
        tool.parameters,
        tool.handler
      );
      toolCount++;
    }

    logger.info(`Registered ${toolCount} email tools`);
    return toolCount;
  }

  /**
   * Get all tool definitions for email operations
   * 
   * @returns Array of tool definitions
   */
  protected getToolDefinitions(): ToolDefinition[] {
    return [
      // New style with backward compatibility
      {
        name: this.createUtilityToolName('search_emails'),
        description: 'Search for specific emails using advanced filters',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            sender: { type: 'string' },
            recipient: { type: 'string' },
            subject: { type: 'string' },
            fromDate: { type: 'string' },
            toDate: { type: 'string' },
            limit: { type: 'number', exclusiveMinimum: 0 },
            offset: { type: 'number', minimum: 0 }
          },
          additionalProperties: false
        },
        handler: withErrorHandling(async (context) => {
              const startTime = Date.now();

              try {
                // Extract parameters using standardized method
                const params = extractMcpParameters<EmailSearchParams>(context, {
                  debug: process.env.DEBUG_CLOZE === 'true',
                  toolName: this.createUtilityToolName('search_emails'),
                  defaultValues: {
                    query: ''
                  }
                });

                // Log the start of the operation
                logOperationStart('email', 'search_emails', params);

                // Build a comprehensive search query from the individual fields
                let searchQuery = params.query || '';
                
                if (params.sender) {
                  searchQuery += ` from:${params.sender}`;
                }
                
                if (params.recipient) {
                  searchQuery += ` to:${params.recipient}`;
                }
                
                if (params.subject) {
                  searchQuery += ` subject:"${params.subject}"`;
                }
                
                // Format dates if provided
                let fromDate = params.fromDate ? formatDateParam(params.fromDate) : undefined;
                let toDate = params.toDate ? formatDateParam(params.toDate) : undefined;
                
                if (fromDate) {
                  // Convert ISO date to YYYY/MM/DD for Gmail-like search
                  const date = new Date(fromDate);
                  const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
                  searchQuery += ` after:${formattedDate}`;
                }
                
                if (toDate) {
                  // Convert ISO date to YYYY/MM/DD for Gmail-like search
                  const date = new Date(toDate);
                  const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
                  searchQuery += ` before:${formattedDate}`;
                }
                
                // Use the enhanced search query
                const searchParams: SearchParams = {
                  query: searchQuery.trim() || 'email', // Default to searching for 'email' if no other criteria
                  types: ['email'],
                  limit: params.limit,
                  offset: params.offset
                };
                
                logger.debug(`Executing search with query: ${searchParams.query}`);
                
                const result = await this.apiClient.searchCommunications(searchParams);

                if (!result.success) {
                  return formatErrorResponse(result.error || 'Failed to search emails');
                }

                // Calculate operation duration
                const duration = Date.now() - startTime;

                // Log the completion of the operation
                logOperationComplete('email', 'search_emails', result, duration);

                return formatSuccessResponse({
                  emails: result.data.results || [],
                  total: result.data.total,
                  hasMore: result.data.hasMore
                });
              } catch (error) {
                // Error will be handled by withErrorHandling
                throw error;
              }
            })
      },
      
      {
        name: this.createUtilityToolName('get_email_thread'),
        description: 'Get complete email thread history',
        parameters: {
          type: 'object',
          properties: {
            threadId: { type: 'string' },
            includeAttachments: { type: 'boolean', default: false }
          },
          required: ['threadId'],
          additionalProperties: false
        },
        handler: withErrorHandling(async (context) => {
              const startTime = Date.now();

              try {
                // Extract parameters using standardized method
                const params = extractMcpParameters<EmailThreadParams>(context, {
                  debug: process.env.DEBUG_CLOZE === 'true',
                  toolName: this.createUtilityToolName('get_email_thread'),
                  defaultValues: {
                    includeAttachments: false
                  }
                });

                // Log the start of the operation
                logOperationStart('email', 'get_email_thread', params);

                // Validate required parameters
                validateRequiredParams(params, ['threadId'], {
                  toolName: this.createUtilityToolName('get_email_thread')
                });
                // Create search parameters to find all emails in the thread
                const searchParams: SearchParams = {
                  query: `thread:${params.threadId}`,
                  types: ['email'],
                  limit: 100 // Get a reasonable number of emails from the thread
                };
                
                const result = await this.apiClient.searchCommunications(searchParams);

                if (!result.success) {
                  return formatErrorResponse(result.error || 'Failed to retrieve email thread');
                }

                // Sort emails by date ascending to get proper thread order
                const threadEmails = result.data.results || [];
                threadEmails.sort((a, b) => {
                  const dateA = new Date(a.date || 0).getTime();
                  const dateB = new Date(b.date || 0).getTime();
                  return dateA - dateB;
                });
                
                // Extract metadata about the thread
                const threadSubject = threadEmails.length > 0 ? 
                  threadEmails[0].subject?.replace(/^(Re:|Fwd:)\s*/i, '') : // Clean up the subject
                  'Unknown Subject';
                  
                const threadParticipants = new Set();
                threadEmails.forEach(email => {
                  if (email.from?.email) threadParticipants.add(email.from.email);
                  (email.to || []).forEach(recipient => {
                    if (recipient.email) threadParticipants.add(recipient.email);
                  });
                });
                
                // Calculate operation duration
                const duration = Date.now() - startTime;

                // Log the completion of the operation
                logOperationComplete('email', 'get_email_thread', result, duration);

                return formatSuccessResponse({
                  thread: {
                    id: params.threadId,
                    subject: threadSubject,
                    participants: Array.from(threadParticipants),
                    emails: threadEmails,
                    count: threadEmails.length,
                    startDate: threadEmails.length > 0 ? threadEmails[0].date : null,
                    lastUpdated: threadEmails.length > 0 ? threadEmails[threadEmails.length - 1].date : null
                  }
                });
              } catch (error) {
                // Error will be handled by withErrorHandling
                throw error;
              }
            })
      },
      
      {
        name: this.createUtilityToolName('summarize_recent_conversations'),
        description: 'Summarize recent email exchanges with a person or company',
        parameters: {
          type: 'object',
          properties: {
            personId: { type: 'string' },
            personEmail: { type: 'string' },
            companyId: { type: 'string' },
            companyDomain: { type: 'string' },
            limit: { type: 'number', default: 10 },
            daysBack: { type: 'number', default: 30 }
          },
          additionalProperties: false
        },
        handler: withErrorHandling(async (context) => {
              const startTime = Date.now();

              try {
                // Extract parameters using standardized method
                const params = extractMcpParameters<EmailSummaryParams>(context, {
                  debug: process.env.DEBUG_CLOZE === 'true',
                  toolName: this.createUtilityToolName('summarize_recent_conversations'),
                  defaultValues: {
                    limit: 10,
                    daysBack: 30
                  }
                });

                // Log the start of the operation
                logOperationStart('email', 'summarize_recent_conversations', params);

                // Validate that at least one identifier is provided
                validateAtLeastOneMcpParam(
                  params,
                  ['personId', 'personEmail', 'companyId', 'companyDomain'],
                  {
                    toolName: this.createUtilityToolName('summarize_recent_conversations'),
                    paramGroupName: 'contact identifiers'
                  }
                );
                
                // Calculate fromDate based on daysBack
                const daysBack = params.daysBack || 30;
                const now = new Date();
                const fromDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
                const fromDateStr = fromDate.toISOString();
                
                // Build search query based on provided parameters
                let searchQuery = '';
                
                if (params.personId) {
                  // Get the person first to retrieve their email
                  const personResult = await this.apiClient.findPerson({ id_str: params.personId } as any);
                  if (personResult.success && personResult.data && personResult.data.email) {
                    searchQuery = `from:${personResult.data.email} OR to:${personResult.data.email}`;
                  } else {
                    return formatErrorResponse(`Could not find person with ID: ${params.personId}`);
                  }
                } else if (params.personEmail) {
                  searchQuery = `from:${params.personEmail} OR to:${params.personEmail}`;
                } else if (params.companyId) {
                  // Get the company first to retrieve its domain
                  const companyResult = await this.apiClient.findCompany({ id_str: params.companyId } as any);
                  if (companyResult.success && companyResult.data) {
                    const domain = Array.isArray(companyResult.data.domains)
                      ? companyResult.data.domains[0]
                      : (companyResult.data.domains || companyResult.data.domain);

                    if (domain) {
                      searchQuery = `domain:${domain}`;
                    } else {
                      return formatErrorResponse(`Company with ID ${params.companyId} does not have a domain`);
                    }
                  } else {
                    return formatErrorResponse(`Could not find company with ID: ${params.companyId}`);
                  }
                } else if (params.companyDomain) {
                  searchQuery = `domain:${params.companyDomain}`;
                }
                
                // Create search parameters
                const searchParams: SearchParams = {
                  query: searchQuery,
                  types: ['email'],
                  fromDate: fromDateStr,
                  limit: params.limit || 10
                };
                
                const result = await this.apiClient.searchCommunications(searchParams);

                if (!result.success) {
                  return formatErrorResponse(result.error || 'Failed to summarize conversations');
                }
                
                // Group emails by thread to create conversation clusters
                const threads: Record<string, any[]> = {};
                const emails = result.data.results || [];
                
                emails.forEach(email => {
                  const threadId = email.threadId || email.id;
                  if (!threads[threadId]) {
                    threads[threadId] = [];
                  }
                  threads[threadId].push(email);
                });
                
                // Process each thread to create a summary of the conversation
                const conversations = Object.keys(threads).map(threadId => {
                  const threadEmails = threads[threadId];
                  // Sort emails by date
                  threadEmails.sort((a, b) => {
                    const dateA = new Date(a.date || 0).getTime();
                    const dateB = new Date(b.date || 0).getTime();
                    return dateA - dateB;
                  });
                  
                  // Get first and last email for the summary
                  const firstEmail = threadEmails[0];
                  const lastEmail = threadEmails[threadEmails.length - 1];
                  const isActive = new Date(lastEmail.date).getTime() > (Date.now() - (7 * 24 * 60 * 60 * 1000)); // Within last week
                  
                  // Create a unique set of participants
                  const participantSet = new Set();
                  threadEmails.forEach(email => {
                    if (email.from?.email) participantSet.add(email.from.email);
                    if (email.to) {
                      email.to.forEach(recipient => {
                        if (recipient.email) participantSet.add(recipient.email);
                      });
                    }
                  });

                  return {
                    threadId,
                    subject: firstEmail.subject,
                    started: firstEmail.date,
                    lastUpdated: lastEmail.date,
                    participants: Array.from(participantSet),
                    messageCount: threadEmails.length,
                    isActive
                  };
                });
                
                // Sort conversations by last updated (most recent first)
                conversations.sort((a, b) => {
                  const dateA = new Date(a.lastUpdated || 0).getTime();
                  const dateB = new Date(b.lastUpdated || 0).getTime();
                  return dateB - dateA;
                });
                
                // Calculate operation duration
                const duration = Date.now() - startTime;

                // Log the completion of the operation
                logOperationComplete('email', 'summarize_recent_conversations', result, duration);

                return formatSuccessResponse({
                  conversations,
                  period: {
                    from: fromDateStr,
                    to: new Date().toISOString(),
                    daysBack
                  },
                  total: conversations.length,
                  activeThreads: conversations.filter(c => c.isActive).length
                });
              } catch (error) {
                // Error will be handled by withErrorHandling
                throw error;
              }
            })
      },
      
      {
        name: this.createUtilityToolName('send_email'),
        description: 'Send an email directly through Cloze',
        parameters: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            recipients: { 
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } }
              ]
            },
            content: { type: 'string' },
            cc: { 
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } }
              ]
            },
            bcc: { 
              oneOf: [
                { type: 'string' },
                { type: 'array', items: { type: 'string' } }
              ]
            },
            attachments: { type: 'array', items: { type: 'string' } }
          },
          required: ['subject', 'recipients', 'content'],
          additionalProperties: false
        },
        handler: withErrorHandling(async (context) => {
              const startTime = Date.now();

              try {
                // Extract parameters using standardized method
                const params = extractMcpParameters<SendEmailParams>(context, {
                  debug: process.env.DEBUG_CLOZE === 'true',
                  toolName: this.createUtilityToolName('send_email'),
                  defaultValues: {}
                });

                // Log the start of the operation
                logOperationStart('email', 'send_email', params);

                // Validate required parameters
                validateRequiredParams(params, ['subject', 'recipients', 'content'], {
                  toolName: this.createUtilityToolName('send_email')
                });
                // Normalize recipients to array if it's a string
                const recipients = typeof params.recipients === 'string' ? [params.recipients] : params.recipients;

                // Normalize cc to array if it's a string or undefined
                const cc = params.cc ? (typeof params.cc === 'string' ? [params.cc] : params.cc) : undefined;

                // Normalize bcc to array if it's a string or undefined
                const bcc = params.bcc ? (typeof params.bcc === 'string' ? [params.bcc] : params.bcc) : undefined;
                
                // Create the complete recipients list for the API
                const recipientsList = [
                  ...recipients.map(email => ({ type: 'to', value: email })),
                  ...(cc ? cc.map(email => ({ type: 'cc', value: email })) : []),
                  ...(bcc ? bcc.map(email => ({ type: 'bcc', value: email })) : [])
                ];
                
                // Create an extended email object with more properties for the API
                const extendedEmailData = {
                  subject: params.subject,
                  from: configManager.getApiConfig().user || '',
                  recipients: recipientsList,
                  body: params.content,
                  bodytype: 'text',
                  date: new Date().toISOString(),
                  style: 'email',
                  // Additional properties would be added here for attachments if the API supported them
                };
                
                // Call the API to log the email
                const result = await this.apiClient.logEmail(extendedEmailData);

                if (!result.success) {
                  return formatErrorResponse(result.error || 'Failed to send email');
                }

                // Calculate operation duration
                const duration = Date.now() - startTime;

                // Log the completion of the operation
                logOperationComplete('email', 'send_email', result, duration);

                return formatSuccessResponse({
                  email: {
                    id: result.data?.id || 'unknown',
                    subject: params.subject,
                    sender: configManager.getApiConfig().user || '',
                    recipients: recipients,
                    cc: cc,
                    bcc: bcc,
                    sentAt: new Date().toISOString()
                  }
                });
              } catch (error) {
                // Error will be handled by withErrorHandling
                throw error;
              }
            })
      }
    ];
  }
}