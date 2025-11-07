import {
    McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import {userTools} from "./mcp/user/tools.js";
import {authTools} from "./auth/tools.js";

export const spotifyMcpServer = new McpServer({
    name: "mcp-spotify",
    version: "1.0.0",
});

const tools = [...userTools, ...authTools];

for( const tool of tools){
    spotifyMcpServer.registerTool(
        tool.name,
        tool.config as any,
        tool.handler as any
    );

}

