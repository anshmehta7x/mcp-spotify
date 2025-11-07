import {
    McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";


import { z } from "zod";
import { AuthService } from "./auth/authservice.js";
import {
    followOrUnfollowPlaylistTool,
    getCurrentUserProfileTool,
    getCurrentUserTopItemsTool,
    getUserProfileTool
} from "./mcp/user/tools.js";

export const spotifyMcpServer = new McpServer({
    name: "mcp-spotify",
    version: "1.0.0",
});

const authService = AuthService.getInstance();

const tools = [getCurrentUserProfileTool, getCurrentUserTopItemsTool,getUserProfileTool];

spotifyMcpServer.registerTool(
    getCurrentUserProfileTool.name,
    getCurrentUserProfileTool.config,
    getCurrentUserProfileTool.handler
);

spotifyMcpServer.registerTool(
    getCurrentUserTopItemsTool.name,
    getCurrentUserTopItemsTool.config,
    getCurrentUserTopItemsTool.handler
)

spotifyMcpServer.registerTool(
    getUserProfileTool.name,
    getUserProfileTool.config,
    getUserProfileTool.handler
)

spotifyMcpServer.registerTool(
    followOrUnfollowPlaylistTool.name,
    followOrUnfollowPlaylistTool.config,
    followOrUnfollowPlaylistTool.handler
)

spotifyMcpServer.registerTool(
    "is-authenticated",
    {
        title: "Is Authenticated",
        description: "Check if the user is authenticated with Spotify",
        inputSchema: {},
        outputSchema: { isAuthenticated: z.boolean() },
    },
    async () => {
        const isAuth = authService.isAuthenticated();
        const output = { isAuthenticated: isAuth };
        return {
            content: [{ type: "text", text: JSON.stringify(output) }],
            structuredContent: output,
        };
    },
);

spotifyMcpServer.registerTool(
    "get-auth-link",
    {
        title: "Get Auth Link",
        description:
            "Get the Spotify authentication link for Users who are not authenticated, which the user must visit to authenticate.THE LINK MUST BE COPIED FROM TERMINAL, DO NOT INCLUDE SPACES",
        inputSchema: {},
        outputSchema: { authLink: z.string() },
    },
    async () => {
        const authLink = authService.generateAuthLink();
        const output = { authLink: authLink };
        return {
            content: [{ type: "text", text: JSON.stringify(output) }],
            structuredContent: output,
        };
    },
);

