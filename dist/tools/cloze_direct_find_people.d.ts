/**
 * Direct Cloze Find People Tool
 * This is a simplified version that bypasses the schema validation system
 * to ensure it works with the MCP server in different parameter formats
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
