import { z } from "zod";
import { AuthService } from "./authservice.js";

const authService = AuthService.getInstance();

interface RequestContext {
    sessionId: string;
}

const isAuthenticatedTool = {
    name: "is-authenticated",
    config: {
        title: "Is Authenticated",
        description: "Check if the user is authenticated with Spotify for the current session",
        inputSchema: {},
        outputSchema: { isAuthenticated: z.boolean() },
    },
    handler: async (request: RequestContext) => {
        const isAuth = authService.isAuthenticated(request.sessionId);
        const output = { isAuthenticated: isAuth };
        return {
            content: [{ type: "text", text: JSON.stringify(output) } as const],
            structuredContent: output,
        };
    },
}

const getAuthLinkTool = {
    name: "get-auth-link",
    config: {
        title: "Get Auth Link IN TERMINAL",
        description:
            "Get the Spotify authentication link for Users who are not authenticated, which the user must visit to authenticate. THE LINK MUST BE COPIED FROM TERMINAL, DO NOT INCLUDE SPACES",
        inputSchema: {},
        outputSchema: { authLink: z.string() },
    },
    handler: async (request: RequestContext) => {
        const authLink = await authService.generateAuthLink(request.sessionId);
        const output = { authLink: authLink };
        return {
            content: [{ type: "text", text: JSON.stringify(output) } as const],
            structuredContent: output,
        };
    },
}

const getAuthenticatedUsersTool = {
    name: "get-authenticated-users",
    config: {
        title: "Get Authenticated Users",
        description: "Get a list of all authenticated user sessions (admin function). Returns the count and list of session IDs.",
        inputSchema: {},
        outputSchema: {
            count: z.number(),
            sessions: z.array(z.string()),
        },
    },
    handler: async () => {
        const sessions = authService.getAuthenticatedSessions();
        const output = {
            count: sessions.length,
            sessions: sessions,
        };
        return {
            content: [{ type: "text", text: JSON.stringify(output) } as const],
            structuredContent: output,
        };
    },
}

const logoutSessionTool = {
    name: "logout-session",
    config: {
        title: "Logout Current Session",
        description: "Revoke authentication for the current session. The user will need to authenticate again to use Spotify features.",
        inputSchema: {},
        outputSchema: {
            message: z.string(),
            success: z.boolean(),
        },
    },
    handler: async (request: RequestContext) => {
        const wasAuthenticated = authService.isAuthenticated(request.sessionId);
        authService.revokeSession(request.sessionId);
        
        const output = {
            message: wasAuthenticated 
                ? "Successfully logged out from Spotify" 
                : "Session was not authenticated",
            success: true,
        };
        return {
            content: [{ type: "text", text: JSON.stringify(output) } as const],
            structuredContent: output,
        };
    },
}

export const authTools = [
    getAuthLinkTool,
    isAuthenticatedTool,
    getAuthenticatedUsersTool,
    logoutSessionTool,
]
