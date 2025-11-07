import { config } from "dotenv";
config();

const generateRandomString = function (length) {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

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
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scopes_joined,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    state: state,
});

var auth_url =
    "https://accounts.spotify.com/authorize?" + query_params.toString();

console.log(
    "Open the following URL in your browser to authorize the application:",
);
console.log(auth_url);
