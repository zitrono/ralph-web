/**
 * Cloze Delete Company Tag Tool
 * Removes tags from a company in Cloze CRM
 */

import { z } from 'zod';
import { readCompanyTags, deleteCompanyTag } from '../api/endpoints/companies.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';

/**
 * Parameter schema for the cloze_delete_company_tag tool
 */
const paramSchema = z.object({
  name: z.string()
    .describe('Company name'),
  domains: z.array(z.string()).min(1)
    .describe('Array of domain names for the company (required for identification)'),
  tags: z.array(z.string()).min(1)
    .describe('Array of tags to remove from the company'),
  removeAll: z.boolean().optional()
    .default(false)
    .describe('Set to true to remove all tags from the company')
});

/**
 * Remove tags from a company in Cloze CRM
 */
const handler = async (params: z.infer<typeof paramSchema>) => {
  logger.info(`Deleting tags for company: ${params.name}`, params.tags);
  
  // If removeAll is true, delete all tags
  if (params.removeAll) {
    const response = await deleteCompanyTag({
      name: params.name,
      domains: params.domains,
      keywords: []
    });
    
    logger.info(`All tags removed for company ${params.name}`);
    return {
      success: true,
      message: `All tags removed for company ${params.name}`,
      tags: []
    };
  }
  
  // Otherwise, get existing tags and remove the specified ones
  const existingTagsResponse = await readCompanyTags(params.domains[0]);
  
  if (!existingTagsResponse.companies || existingTagsResponse.companies.length === 0) {
    return {
      errorcode: 1,
      success: false,
      message: `Company with domain ${params.domains[0]} not found`
    };
  }
  
  const company = existingTagsResponse.companies[0];
  const existingTags = company.keywords || [];
  
  // Check if any of the specified tags exist
  const tagsToRemove = params.tags.filter((tag: string) => existingTags.includes(tag));
  
  if (tagsToRemove.length === 0) {
    return {
      errorcode: 1,
      success: false,
      message: `None of the specified tags found for company ${params.name}`,
      currentTags: existingTags
    };
  }
  
  // Filter out the tags to remove
  const updatedTags = existingTags.filter((tag: string) => !params.tags.includes(tag));
  
  // Update the company with the remaining tags
  const response = await deleteCompanyTag({
    name: params.name,
    domains: params.domains,
    keywords: updatedTags
  });
  
  logger.info(`Tags removed successfully for company ${params.name}`);
  return {
    errorcode: 0,
    success: true,
    message: `Tags removed for company ${params.name}`,
    removedTags: tagsToRemove,
    remainingTags: updatedTags
  };
};

// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler as any);

/**
 * Tool metadata for registration
 */
export const metadata = {
  name: 'cloze_delete_company_tag',
  description: `Removes tags from a company in Cloze CRM.
  
Required parameters:
- name: Company name
- domains: Array of domain names for the company (required for identification)
- tags: Array of tags to remove from the company

Optional parameters:
- removeAll: Set to true to remove all tags from the company (defaults to false)

If removeAll is true, all tags will be removed regardless of the tags parameter.
Otherwise, only the specified tags will be removed.

Example:
{
  "name": "Acme Inc",
  "domains": ["acme.com"],
  "tags": ["client", "priority"]
}

Example (remove all tags):
{
  "name": "Acme Inc",
  "domains": ["acme.com"],
  "removeAll": true
}

The operation will get all existing tags, then remove only the specified tags.`,
};