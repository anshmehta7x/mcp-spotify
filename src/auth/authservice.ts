import { generateRandomString, shortenURL } from "./utils.js";

export class AuthService {
    private static instance: AuthService;
    private authenticated: boolean = false;
    private accessToken: string | null = null;

    private constructor() {}

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    setAuthenticated(authenticated: boolean): void {
        this.authenticated = authenticated;
    }

    isAuthenticated(): boolean {
        return this.authenticated;
    }

    async generateAuthLink(): Promise<string> {
        const scopes = [
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
        ];

        var scopes_joined = scopes.join(" ");
        var state = generateRandomString(16);

        var query_params = new URLSearchParams({
            response_type: "code",
            client_id: process.env.SPOTIFY_CLIENT_ID ?? "",
            scope: scopes_joined,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI ?? "",
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

    async receiveToken(code: string, state: string): Promise<boolean> {
        try {
            const client_id = process.env.SPOTIFY_CLIENT_ID ?? "";
            const client_secret = process.env.SPOTIFY_CLIENT_SECRET ?? "";
            const redirect_uri = process.env.SPOTIFY_REDIRECT_URI ?? "";

            const body = new URLSearchParams({
                code: code,
                redirect_uri: redirect_uri,
                grant_type: "authorization_code",
            });

            const authHeader =
                "Basic " +
                Buffer.from(client_id + ":" + client_secret).toString("base64");

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
                console.error(
                    "Failed to get token:",
                    response.status,
                    response.statusText,
                );
                return false;
            }
            const data = await response.json();
            this.accessToken = data.access_token;
            this.setAuthenticated(true);
            return true;
        } catch (error) {
            console.error("Error getting token:", error);
            return false;
        }
    }

    getAccessToken(): string | null {
        return this.accessToken;
    }
}
