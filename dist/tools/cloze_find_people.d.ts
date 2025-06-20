/**
 * Cloze Find People Tool
 * Searches for people in Cloze CRM
 */
/**
 * Direct handler without schema validation that manually extracts parameters
 * from the MCP request
 */
declare const handler: (params: any, extra?: any) => Promise<{
    content: {
        type: "text";
        text: string;
    }[];
}>;
export default handler;
/**
 * Tool metadata for registration
 */
export declare const metadata: {
    name: string;
    description: string;
};
