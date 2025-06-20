/**
 * Direct Cloze Find People Tool
 * This is a simplified version that bypasses the schema validation system
 * to ensure it works with the MCP server in different parameter formats
 */

import { findPeople } from '../api/endpoints/people.js';
import logger, { logClaudeDesktopRequest } from '../logging.js';

/**
 * Direct handler without schema validation that manually extracts parameters
 * from the MCP request
 */
const handler = async (params: any, extra?: any) => {
  // Enhanced Claude Desktop request logging - write every request to a dedicated file
  logger.claudeDesktop('DIRECT_FIND_PEOPLE tool called', {
    params,
    extra,
    timestamp: new Date().toISOString(),
    paramsType: typeof params,
    paramsIsNull: params === null,
    paramsIsArray: Array.isArray(params),
    paramsObjectKeys: typeof params === 'object' && params !== null ? Object.keys(params) : [],
    paramsStringify: JSON.stringify(params, null, 2),
    extraType: typeof extra,
    extraIsNull: extra === null,
    extraObjectKeys: typeof extra === 'object' && extra !== null ? Object.keys(extra) : [],
    requestInfo: extra?.request || null,
    // Look for backtick patterns
    hasFreeformqueryLiteral: typeof params === 'object' && 
      params !== null && 
      Object.keys(params).some(key => key === 'freeformquery' || key === '`freeformquery`')
  });

  logger.info('Direct find people handler called with:', 
    JSON.stringify({
      params_type: typeof params,
      params_null: params === null,
      params_undefined: params === undefined,
      has_extra: !!extra,
      empty_params: params && Object.keys(params).length === 0
    }, null, 2));
  
  let freeformquery: string | undefined;
  let segment: string | undefined;
  let stage: string | undefined;
  let pagesize: number | undefined;
  let pagenumber: number | undefined;
  
  // Access raw request from MCP
  try {
    // Check for request in extra.request
    if (extra?.request) {
      logger.info('Found request in extra:', JSON.stringify(extra.request, null, 2));
      
      // Try to extract from request.params.arguments (MCP format)
      if (extra.request.params?.arguments) {
        const args = extra.request.params.arguments;
        logger.info('Found arguments in request.params:', JSON.stringify(args, null, 2));
        
        freeformquery = args.freeformquery;
        segment = args.segment;
        stage = args.stage;
        pagesize = args.pagesize;
        pagenumber = args.pagenumber;
        
        logger.info(`Extracted from request.params.arguments: freeformquery=${freeformquery}`);
      }
    }
    
    // If parameters weren't found in request, try direct params
    if (!freeformquery && params) {
      // Try to extract from direct params
      if (typeof params === 'object') {
        if (params.freeformquery) {
          freeformquery = params.freeformquery;
          segment = params.segment;
          stage = params.stage;
          pagesize = params.pagesize;
          pagenumber = params.pagenumber;
          
          logger.info(`Extracted from direct params: freeformquery=${freeformquery}`);
        }
        
        // Special case for Claude Desktop's backtick format
        if (!freeformquery) {
          // Check for backtick-wrapped keys
          for (const key of Object.keys(params)) {
            logger.info(`DIRECT FIND PEOPLE: Checking key: "${key}"`);
            
            if (key === '`freeformquery`' || key.includes('freeformquery')) {
              // Found Claude Desktop's backtick format
              freeformquery = params[key];
              logger.info(`DIRECT FIND PEOPLE: Found backtick-wrapped parameter: ${freeformquery}`);
              
              // Special logging for Claude Desktop backtick format
              logClaudeDesktopRequest({
                foundBacktickFormat: true, 
                key,
                value: freeformquery,
                fullParams: params
              }, 'Claude Desktop backtick format detected');
              break;
            }
          }
        }
      }
    }
    
    // Validate the required parameter
    if (!freeformquery) {
      logger.error('Missing required parameter: freeformquery');
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              error: {
                message: 'Missing required parameter: freeformquery'
              }
            }, null, 2)
          }
        ]
      };
    }
    
    // Prepare search parameters
    const searchParams: any = {
      freeformquery
    };
    
    // Add optional parameters if present
    if (segment) searchParams.segment = segment;
    if (stage) searchParams.stage = stage;
    
    // Handle pagination parameters
    if (pagesize !== undefined) {
      searchParams.pagesize = typeof pagesize === 'string' ? 
        parseInt(pagesize, 10) : pagesize;
    }
    
    if (pagenumber !== undefined) {
      searchParams.pagenumber = typeof pagenumber === 'string' ? 
        parseInt(pagenumber, 10) : pagenumber;
    }
    
    // Call the API to find people
    logger.info('Calling findPeople API with params:', JSON.stringify(searchParams));
    
    const response = await findPeople(searchParams);
    logger.info(`Found ${response.people.length} people out of ${response.availablecount} total matches`);
    
    // Format the response with MCP content format
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            people: response.people,
            pagination: {
              totalCount: response.availablecount,
              page: response.pagenumber || 1,
              pageSize: response.pagesize || 10,
              totalPages: Math.ceil(response.availablecount / (response.pagesize || 10))
            }
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    logger.error('Error finding people:', error);
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            error: {
              message: error instanceof Error ? error.message : String(error)
            }
          }, null, 2)
        }
      ]
    };
  }
};

// Export the handler directly
export default handler;

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_direct_find_people',
  description: `Direct implementation of Find People tool that bypasses schema validation.
  
Required parameters:
- freeformquery: Search query (name, email, or phone)

Optional parameters:
- segment: Filter by segment (customer, partner, competitor, family, friend, network, coworker, none)
- stage: Filter by stage (lead, future, current, past, out)
- pagesize: Number of results per page (default: 10)
- pagenumber: Page number (default: 1)

This is a direct implementation that handles different parameter formats.`,
};