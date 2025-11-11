import { z } from "zod";
import { AuthService } from "./authservice.js";

const authService = AuthService.getInstance();

const isAuthenticatedTool = {
    name:"is-authenticated",
    config:
    {
        title: "Is Authenticated",
            description: "Check if the user is authenticated with Spotify",
        inputSchema: {},
        outputSchema: { isAuthenticated: z.boolean() },
    },
    handler:
async () => {
    const isAuth = authService.isAuthenticated();
    const output = { isAuthenticated: isAuth };
    return {
        content: [{ type: "text", text: JSON.stringify(output) } as const],
        structuredContent: output,
    };
},
}

const getAuthLinkTool = {
    name:"get-auth-link",
    config:
    {
        title: "Get Auth Link IN TERMINAL",
            description:
        "Get the Spotify authentication link for Users who are not authenticated, which the user must visit to authenticate.THE LINK MUST BE COPIED FROM TERMINAL, DO NOT INCLUDE SPACES",
            inputSchema: {},
        outputSchema: { authLink: z.string() },
    },
    handler:
async () => {
    const authLink = await authService.generateAuthLink();
    const output = { authLink: authLink };
    return {
        content: [{ type: "text", text: JSON.stringify(output) } as const],
        structuredContent: output,
    };
},
}

export const authTools = [
    getAuthLinkTool,
    isAuthenticatedTool
]