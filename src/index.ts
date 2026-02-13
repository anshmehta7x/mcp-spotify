import {
    McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { authTools } from "./auth/tools.js";
import { allTools } from "./mcp/tools.js";

export const spotifyMcpServer = new McpServer({
    name: "mcp-spotify",
    version: "1.0.0",
});

// Register tools without wrapping - handlers will receive sessionId via request context
const tools = [...authTools, ...allTools];

for (const tool of tools) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spotifyMcpServer.registerTool(
        tool.name,
        tool.config as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (request: any, input: any) => {
            // Session ID comes from MCP transport via request.sessionId
            const sessionId = request.sessionId || "anonymous";
            
            // Call the original handler with our context
            return tool.handler({ sessionId } as any, input);
        }
    );
}
