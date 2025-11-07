import {
    McpServer,
    ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";

import {
    SpotifyUserProfile,
    SpotifyUserProfileSchema,
    SpotifyUserProfileShape,
} from "./types/user.js";

import { z } from "zod";
import { AuthService } from "./auth/authservice.js";
import { getCurrentUserProfile } from "./mcp/user.js";
// import { getCurrentUserProfile } from "./mcp/user/requests.js";

export const spotifyMcpServer = new McpServer({
    name: "mcp-spotify",
    version: "1.0.0",
});

const authService = AuthService.getInstance();

spotifyMcpServer.registerTool(
    "get-current-user-profile",
    {
        title: "Get Current User Profile",
        description:
            "(REQUIRES AUTHENTICATION) Get detailed profile information about the current user (including the current user's username, country, email, explicit_content,followers,images,url,uri",
        inputSchema: {},
        outputSchema: { structuredContent: SpotifyUserProfileSchema },
    },
    async () => {
        const profile: SpotifyUserProfile = await getCurrentUserProfile();
        return {
            content: [{ type: "text", text: JSON.stringify(profile) }],
            structuredContent: profile,
        };
    },
);

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
            "Get the Spotify authentication link for Users who are not authenticated, which the user must visit to authenticate.",
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

// spotifyMcpServer.registerTool(
//     "get-current-user-details",
//     {
//         title: "Get Current User Details",
//         description:
//             "Gets information about the current user's profile on spotify",
//         inputSchema: {},
//         outputSchema: SpotifyUserProfileShape,
//     },
//     async () => {
//         const profile = await getCurrentUserProfile(process.env.SPOTIFY_TOKEN);
//         return {
//             content: [{ type: "text", text: JSON.stringify(profile) }],
//             structuredContent: profile,
//         };
//     },
// );
