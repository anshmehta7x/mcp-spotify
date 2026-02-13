import { generateRandomString, shortenURL } from "./utils.js";

export interface SpotifyTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number; // timestamp in milliseconds
}

export interface AuthServiceConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
}

export class AuthService {
    private static instance: AuthService;
    
    // Store tokens per session ID
    private sessionTokens: Map<string, SpotifyTokens> = new Map();
    
    // Pending auth requests (state -> sessionId mapping)
    private pendingAuth: Map<string, string> = new Map();
    
    private config: AuthServiceConfig;

    private constructor() {
        this.config = {
            clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
            redirectUri: process.env.SPOTIFY_REDIRECT_URI ?? "",
            scopes: [
                // Spotify Connect
                "user-read-playback-state",
                "user-modify-playback-state",
                "user-read-currently-playing",

                // Playlists
                "playlist-read-private",
                "playlist-read-collaborative",
                "playlist-modify-private",
                "playlist-modify-public",

                // Follow
                "user-follow-modify",
                "user-follow-read",

                // Listening History
                "user-read-playback-position",
                "user-top-read",
                "user-read-recently-played",

                // Library
                "user-library-modify",
                "user-library-read",

                // Users
                "user-read-email",
                "user-read-private",
            ],
        };
    }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Generate an authentication link for a specific session
     */
    async generateAuthLink(sessionId: string): Promise<string> {
        const state = generateRandomString(16);
        
        // Store the mapping of state -> sessionId
        this.pendingAuth.set(state, sessionId);
        
        const scopes_joined = this.config.scopes.join(" ");

        const query_params = new URLSearchParams({
            response_type: "code",
            client_id: this.config.clientId,
            scope: scopes_joined,
            redirect_uri: this.config.redirectUri,
            state: state,
        });

        const spotifyAuthLink: string = `https://accounts.spotify.com/authorize?${query_params.toString()}`;
        
        try {
            return await shortenURL(spotifyAuthLink);
        } catch (error) {
            console.error("Error generating short URL:", error);
            return spotifyAuthLink;
        }
    }

    /**
     * Exchange authorization code for tokens and store for session
     */
    async receiveToken(code: string, state: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
        // Look up the session ID from the state
        const sessionId = this.pendingAuth.get(state);
        if (!sessionId) {
            return { success: false, error: "Invalid state parameter - no matching session" };
        }
        
        // Clean up pending auth
        this.pendingAuth.delete(state);

        try {
            const body = new URLSearchParams({
                code: code,
                redirect_uri: this.config.redirectUri,
                grant_type: "authorization_code",
            });

            const authHeader =
                "Basic " +
                Buffer.from(this.config.clientId + ":" + this.config.clientSecret).toString("base64");

            const response = await fetch(
                "https://accounts.spotify.com/api/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: authHeader,
                    },
                    body: body.toString(),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Failed to get token:", response.status, errorData);
                return { success: false, error: errorData.error_description || "Token exchange failed" };
            }
            
            const data = await response.json();
            
            // Store tokens for this session
            const tokens: SpotifyTokens = {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: Date.now() + (data.expires_in * 1000),
            };
            
            this.sessionTokens.set(sessionId, tokens);
            
            return { success: true, sessionId };
        } catch (error) {
            console.error("Error getting token:", error);
            return { success: false, error: "Internal server error during token exchange" };
        }
    }

    /**
     * Get access token for a session, refreshing if necessary
     */
    async getAccessToken(sessionId: string): Promise<string | null> {
        const tokens = this.sessionTokens.get(sessionId);
        if (!tokens) {
            return null;
        }

        // Check if token is expired or will expire in the next 5 minutes
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (tokens.expiresAt <= now + fiveMinutes) {
            // Token is expired or expiring soon, try to refresh
            const refreshed = await this.refreshAccessToken(sessionId);
            if (!refreshed) {
                return null;
            }
        }

        return tokens.accessToken;
    }

    /**
     * Refresh the access token for a session
     */
    private async refreshAccessToken(sessionId: string): Promise<boolean> {
        const tokens = this.sessionTokens.get(sessionId);
        if (!tokens || !tokens.refreshToken) {
            return false;
        }

        try {
            const body = new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: tokens.refreshToken,
            });

            const authHeader =
                "Basic " +
                Buffer.from(this.config.clientId + ":" + this.config.clientSecret).toString("base64");

            const response = await fetch(
                "https://accounts.spotify.com/api/token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: authHeader,
                    },
                    body: body.toString(),
                },
            );

            if (!response.ok) {
                console.error("Failed to refresh token:", response.status);
                return false;
            }

            const data = await response.json();
            
            // Update stored tokens
            tokens.accessToken = data.access_token;
            tokens.expiresAt = Date.now() + (data.expires_in * 1000);
            
            // If Spotify returns a new refresh token, save it
            if (data.refresh_token) {
                tokens.refreshToken = data.refreshToken;
            }
            
            this.sessionTokens.set(sessionId, tokens);
            return true;
        } catch (error) {
            console.error("Error refreshing token:", error);
            return false;
        }
    }

    /**
     * Check if a session is authenticated
     */
    isAuthenticated(sessionId: string): boolean {
        return this.sessionTokens.has(sessionId);
    }

    /**
     * Get all authenticated session IDs (for admin purposes)
     */
    getAuthenticatedSessions(): string[] {
        return Array.from(this.sessionTokens.keys());
    }

    /**
     * Get number of authenticated users
     */
    getAuthenticatedUserCount(): number {
        return this.sessionTokens.size;
    }

    /**
     * Revoke access for a session (logout)
     */
    revokeSession(sessionId: string): void {
        this.sessionTokens.delete(sessionId);
    }

    /**
     * Clear all sessions (admin function)
     */
    clearAllSessions(): void {
        this.sessionTokens.clear();
        this.pendingAuth.clear();
    }
}
