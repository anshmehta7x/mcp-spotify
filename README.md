# mcp-spotify

MCP (Model Context Protocol) server for Spotify — control playback, manage playlists, search, and more via MCP clients.

## Features

### Playback Control
- Get playback state, currently playing track
- Play, pause, skip, seek, volume, repeat, shuffle
- View queue, add to queue, remove from queue
- Transfer playback between devices

### Playlists
- Create, edit, delete playlists
- Add/remove/reorder tracks
- Get playlist details and tracks
- Follow/unfollow playlists

### Library
- Save/remove tracks, albums, shows
- Get saved content
- Follow/unfollow artists

### Search
- Search tracks, artists, albums, playlists
- Filter by market

### Discovery
- Get recommendations (by seeds, genres, mood)
- New releases
- Artist top tracks, related artists
- Audio features (tempo, energy, danceability)

### Stats & Utilities
- Listening stats (top tracks, genres, BPM)
- Find tracks by BPM range
- Generate share links
- Multi-user authentication

## Setup

```bash
npm install
```

## Configuration

Create `.env`:
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

Get credentials at: https://developer.spotify.com/dashboard

## Usage

```bash
# Development (uses ts-node)
npm run dev

# Build
npm run build

# Production
npm start
```

Server runs at `http://localhost:3000/mcp`

## Tools

| Tool | Description |
|------|-------------|
| `get-playback-state` | Get current playback info |
| `start-resume-playback` | Start/resume playback |
| `pause-playback` | Pause playback |
| `skip-to-next` | Skip to next track |
| `seek-to-position` | Seek to position (ms) |
| `set-playback-volume` | Set volume 0-100 |
| `toggle-shuffle` | Toggle shuffle |
| `set-repeat-mode` | Set repeat mode |
| `get-user-queue` | Get playback queue |
| `add-to-queue` | Add item to queue |
| `get-playlist` | Get playlist details |
| `create-playlist` | Create new playlist |
| `add-items-to-playlist` | Add tracks to playlist |
| `search-items` | Search Spotify |
| `get-recommendations` | Get recommendations |
| `get-listening-stats` | Your listening stats |
| And more... |

## Multi-User Auth

Each user authenticates via Spotify OAuth. Auth links available at:
- `/auth` - Get auth link for current session
- `/auth/all` - Admin: view all authenticated users

## Architecture

```
src/
├── index.ts          # MCP server setup
├── server.ts         # HTTP server, routes
├── auth/
│   ├── authservice.ts    # Multi-user auth
│   └── tools.ts          # Auth tools
└── mcp/
    ├── api.ts        # Shared API helpers
    ├── requests.ts   # Spotify API calls
    ├── slims.ts      # Response shaping
    └── tools.ts      # All MCP tools (factory pattern)
```

## Tech Stack

- TypeScript
- Express
- @modelcontextprotocol/sdk
- Zod for validation
- Axios for HTTP

## License

ISC
