/**
 * Cloze Update Company Tag Tool
 * Updates a specific tag for a company in Cloze CRM
 */
import { z } from 'zod';
import { readCompanyTags, updateCompanyTag } from '../api/endpoints/companies.js';
import { createToolHandler } from './utils/index.js';
import logger from '../logging.js';
/**
 * Parameter schema for the cloze_update_company_tag tool
 */
const paramSchema = z.object({
    name: z.string()
        .describe('Company name'),
    domains: z.array(z.string()).min(1)
        .describe('Array of domain names for the company (required for identification)'),
    oldTag: z.string()
        .describe('The existing tag to update'),
    newTag: z.string()
        .describe('The new tag value')
});
/**
 * Update a tag for a company in Cloze CRM
 */
const handler = async (params) => {
    logger.info(`Updating tag ${params.oldTag} to ${params.newTag} for company: ${params.name}`);
    // First get the existing tags
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
    // Check if the old tag exists
    if (!existingTags.includes(params.oldTag)) {
        return {
            errorcode: 1,
            success: false,
            message: `Tag '${params.oldTag}' not found for company ${params.name}`,
            currentTags: existingTags
        };
    }
    // Replace the old tag with the new tag
    const updatedTags = existingTags.map((tag) => tag === params.oldTag ? params.newTag : tag);
    // Update the company with the new tags
    const response = await updateCompanyTag({
        name: params.name,
        domains: params.domains,
        keywords: updatedTags
    });
    logger.info(`Tag updated successfully for company ${params.name}`);
    return {
        errorcode: 0,
        success: true,
        message: `Tag '${params.oldTag}' updated to '${params.newTag}' for company ${params.name}`,
        tags: updatedTags
    };
};
// Create the tool handler with validation, error handling, and response formatting
export default createToolHandler(paramSchema, handler);
/**
 * Tool metadata for registration
 */
export const metadata = {
    name: 'cloze_update_company_tag',
    description: `Updates a specific tag for a company in Cloze CRM.
  
Required parameters:
- name: Company name
- domains: Array of domain names for the company (required for identification)
- oldTag: The existing tag to update
- newTag: The new tag value

This tool will find the specified tag in the company's tags and replace it with the new value.
If the old tag doesn't exist, the operation will fail.

Example:
{
  "name": "Acme Inc",
  "domains": ["acme.com"],
  "oldTag": "client",
  "newTag": "partner"
}

The operation will first get all existing tags, then replace only the specified tag.`,
};
//# sourceMappingURL=cloze_update_company_tag.js.map