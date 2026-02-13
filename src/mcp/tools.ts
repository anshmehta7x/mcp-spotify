import { z } from "zod";
import * as R from "./requests.js";

const T = {
    o: (d: string) => z.object({ deviceId: z.string().optional() }),
    m: (d = "") => z.object({ market: z.string().optional(), ...(d && { [d]: z.string().optional() }) }),
    p: (max = 50) => z.object({ limit: z.number().min(1).max(max).optional().default(20), offset: z.number().min(0).optional().default(0) }),
    mkR: (n: string, d: string, s: z.ZodType<any>, h: (s: string, i: any) => Promise<any>) => ({
        name: n, config: { title: n.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()), description: d, inputSchema: s },
        handler: async (c: any, i: any) => ({ content: [{ type: "text" as const, text: JSON.stringify(await h(c.sessionId, i)) }], structuredContent: await h(c.sessionId, i) })
    }),
    mkA: (n: string, d: string, s: z.ZodType<any>, h: (s: string, i: any) => Promise<any>) => ({
        name: n, config: { title: n.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()), description: d, inputSchema: s },
        handler: async (c: any, i: any) => { await h(c.sessionId, i); return { content: [{ type: "text" as const, text: '{"success":true}' }], structuredContent: { success: true } }; }
    }),
};

// PLAYBACK
export const getPlayState = T.mkR("get-playback-state", "Get current playback state", T.m(), (s, i) => R.getPlaybackState(s, i.market));
export const getCurrPlay = T.mkR("get-currently-playing", "Get currently playing track", T.m(), (s, i) => R.getCurrentlyPlaying(s, i.market));
export const getDevs = T.mkR("get-available-devices", "Get available devices", z.object({}), s => R.getDevices(s));
export const startPlay = T.mkA("start-resume-playback", "Start/resume playback", z.object({ deviceId: z.string().optional(), contextUri: z.string().optional(), uris: z.array(z.string()).optional(), positionMs: z.number().optional() }), (s, i) => R.play(s, i.deviceId, { context_uri: i.contextUri, uris: i.uris, position_ms: i.positionMs }));
export const pausePlay = T.mkA("pause-playback", "Pause playback", T.o(""), (s, i) => R.pause(s, i.deviceId));
export const skipNext = T.mkA("skip-to-next", "Skip to next", T.o(""), (s, i) => R.next(s, i.deviceId));
export const skipPrev = T.mkA("skip-to-previous", "Skip to previous", T.o(""), (s, i) => R.prev(s, i.deviceId));
export const seekPos = T.mkA("seek-to-position", "Seek to position (ms)", z.object({ positionMs: z.number().min(0), deviceId: z.string().optional() }), (s, i) => R.seek(s, i.positionMs, i.deviceId));
export const setRep = T.mkA("set-repeat-mode", "Set repeat mode", z.object({ state: z.enum(["track", "context", "off"]), deviceId: z.string().optional() }), (s, i) => R.repeat(s, i.state, i.deviceId));
export const setVol = T.mkA("set-playback-volume", "Set volume 0-100", z.object({ volumePercent: z.number().min(0).max(100), deviceId: z.string().optional() }), (s, i) => R.volume(s, i.volumePercent, i.deviceId));
export const togShuf = T.mkA("toggle-shuffle", "Toggle shuffle", z.object({ state: z.boolean(), deviceId: z.string().optional() }), (s, i) => R.shuffle(s, i.state, i.deviceId));
export const getRec = T.mkR("get-recently-played", "Get recently played", z.object({ limit: z.number().min(1).max(50).optional().default(20) }), (s, i) => R.recent(s, i.limit));
export const getQue = T.mkR("get-user-queue", "Get user queue", z.object({}), s => R.queue(s));
export const addQue = T.mkA("add-to-queue", "Add to queue", z.object({ uri: z.string(), deviceId: z.string().optional() }), (s, i) => R.addQ(s, i.uri, i.deviceId));
export const rmQue = T.mkA("remove-from-queue", "Remove from queue", z.object({ uri: z.string(), deviceId: z.string().optional() }), (s, i) => R.rmQ(s, i.uri, i.deviceId));

// PLAYLIST
export const getPl = T.mkR("get-playlist", "Get playlist details", z.object({ playlistId: z.string().min(1), market: z.string().optional() }), (s, i) => R.getPlaylist(s, i.playlistId, i.market));
export const getPlItems = T.mkR("get-playlist-items", "Get playlist tracks", z.object({ playlistId: z.string().min(1), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0), market: z.string().optional() }), (s, i) => R.getPlTracks(s, i.playlistId, i.limit, i.offset, i.market));
export const getUsrPls = T.mkR("get-user-playlists", "Get user playlists", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), (s, i) => R.getMyPlaylists(s, i.limit, i.offset));
export const crPl = T.mkA("create-playlist", "Create playlist", z.object({ name: z.string().min(1), description: z.string().optional(), public: z.boolean().optional().default(false) }), (s, i) => R.createPlaylist(s, i.name, i.description, i.public));
export const addPlIt = T.mkA("add-items-to-playlist", "Add items to playlist", z.object({ playlistId: z.string().min(1), uris: z.array(z.string()).min(1), position: z.number().optional() }), (s, i) => R.addToPlaylist(s, i.playlistId, i.uris, i.position));
export const rmPlIt = T.mkA("remove-playlist-items", "Remove items", z.object({ playlistId: z.string().min(1), uris: z.array(z.string()).min(1) }), (s, i) => R.rmFromPlaylist(s, i.playlistId, i.uris));
export const folPl = T.mkA("follow-playlist", "Follow playlist", z.object({ playlistId: z.string().min(1) }), (s, i) => R.followPl(s, i.playlistId));
export const unfolPl = T.mkA("unfollow-playlist", "Unfollow playlist", z.object({ playlistId: z.string().min(1) }), (s, i) => R.unfollowPl(s, i.playlistId));

// LIBRARY
export const getTracks = T.mkR("get-saved-tracks", "Get saved tracks", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0), market: z.string().optional() }), (s, i) => R.getSavedTracks(s, i.limit, i.offset, i.market));
export const saveTracks = T.mkA("save-tracks", "Save tracks", z.object({ ids: z.string().min(1) }), (s, i) => R.saveTracks(s, i.ids.split(",").map((x: string) => x.trim())));
export const rmTracks = T.mkA("remove-saved-tracks", "Remove saved tracks", z.object({ ids: z.string().min(1) }), (s, i) => R.rmSavedTracks(s, i.ids.split(",").map((x: string) => x.trim())));
export const getAlbums = T.mkR("get-saved-albums", "Get saved albums", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), (s, i) => R.getSavedAlbums(s, i.limit, i.offset));
export const saveAlbums = T.mkA("save-albums", "Save albums", z.object({ ids: z.string().min(1) }), (s, i) => R.saveAlbums(s, i.ids.split(",").map((x: string) => x.trim())));
export const rmAlbums = T.mkA("remove-saved-albums", "Remove saved albums", z.object({ ids: z.string().min(1) }), (s, i) => R.rmSavedAlbums(s, i.ids.split(",").map((x: string) => x.trim())));
export const getShows = T.mkR("get-saved-shows", "Get saved shows", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), (s, i) => R.getSavedShows(s, i.limit, i.offset));
export const saveShows = T.mkA("save-shows", "Save shows", z.object({ ids: z.string().min(1) }), (s, i) => R.saveShows(s, i.ids.split(",").map((x: string) => x.trim())));
export const rmShows = T.mkA("remove-saved-shows", "Remove saved shows", z.object({ ids: z.string().min(1) }), (s, i) => R.rmSavedShows(s, i.ids.split(",").map((x: string) => x.trim())));
export const getEps = T.mkR("get-saved-episodes", "Get saved episodes", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0), market: z.string().optional() }), (s, i) => R.getSavedEps(s, i.limit, i.offset, i.market));
export const rmEps = T.mkA("remove-saved-episodes", "Remove saved episodes", z.object({ ids: z.string().min(1) }), (s, i) => R.rmSavedEps(s, i.ids.split(",").map((x: string) => x.trim())));
export const getArt = T.mkR("get-followed-artists", "Get followed artists", z.object({ limit: z.number().min(1).max(50).optional().default(20), after: z.string().optional() }), (s, i) => R.getFollowedArtists(s, i.limit, i.after));
export const folArt = T.mkA("follow-artists", "Follow artists", z.object({ ids: z.string().min(1) }), (s, i) => R.followArtists(s, i.ids.split(",").map((x: string) => x.trim())));
export const unfolArt = T.mkA("unfollow-artists", "Unfollow artists", z.object({ ids: z.string().min(1) }), (s, i) => R.unfollowArtists(s, i.ids.split(",").map((x: string) => x.trim())));

// SEARCH
export const search = T.mkR("search-items", "Search tracks/artists/albums/playlists", z.object({ q: z.string().min(1), types: z.array(z.string()).optional().default(["track", "artist", "album", "playlist"]), limit: z.number().min(1).max(50).optional().default(20), market: z.string().optional() }), (s, i) => R.search(s, i.q, i.types.join(","), i.limit, i.market));

// USER
export const getMe = T.mkR("get-current-user-profile", "Get current user profile", z.object({}), s => R.getMe(s));
export const getUser = T.mkR("get-user-profile", "Get user by ID", z.object({ userId: z.string().min(1) }), (s, i) => R.getUser(s, i.userId));
export const getTop = T.mkR("get-user-top-items", "Get top tracks/artists", z.object({ type: z.enum(["tracks", "artists"]), timeRange: z.enum(["short_term", "medium_term", "long_term"]).optional().default("medium_term"), limit: z.number().min(1).max(50).optional().default(20) }), (s, i) => R.getTop(s, i.type, i.limit, i.timeRange));
export const fol = T.mkA("follow-artists-or-users", "Follow artists/users", z.object({ type: z.enum(["artist", "user"]), ids: z.string().min(1) }), (s, i) => i.type === "artist" ? R.followArtists(s, i.ids.split(",").map((x: string) => x.trim())) : R.followUsers(s, i.ids.split(",").map((x: string) => x.trim())));
export const unfol = T.mkA("unfollow-artists-or-users", "Unfollow artists/users", z.object({ type: z.enum(["artist", "user"]), ids: z.string().min(1) }), (s, i) => i.type === "artist" ? R.unfollowArtists(s, i.ids.split(",").map((x: string) => x.trim())) : R.unfollowUsers(s, i.ids.split(",").map((x: string) => x.trim())));
export const chkFol = T.mkR("check-if-user-follows", "Check if following", z.object({ type: z.enum(["artist", "user"]), ids: z.string().min(1) }), (s, i) => R.checkFollows(s, i.type, i.ids.split(",").map((x: string) => x.trim())));

// DISCOVER
export const getRecs = T.mkR("get-recommendations", "Get recommendations", z.object({ seedArtists: z.string().optional(), seedTracks: z.string().optional(), seedGenres: z.string().optional(), targetEnergy: z.number().min(0).max(1).optional(), targetDanceability: z.number().min(0).max(1).optional(), targetValence: z.number().min(0).max(1).optional(), limit: z.number().min(1).max(100).optional().default(20), market: z.string().optional() }), (s, i) => {
    const p: any = {};
    if (i.seedArtists) p.seed_artists = i.seedArtists;
    if (i.seedTracks) p.seed_tracks = i.seedTracks;
    if (i.seedGenres) p.seed_genres = i.seedGenres;
    if (i.targetEnergy !== undefined) p.target_energy = i.targetEnergy;
    if (i.targetDanceability !== undefined) p.target_danceability = i.targetDanceability;
    if (i.targetValence !== undefined) p.target_valence = i.targetValence;
    if (i.limit) p.limit = i.limit;
    if (i.market) p.market = i.market;
    return R.recs(s, p);
});
export const getGens = T.mkR("get-available-genres", "Get available genres", z.object({}), s => R.genres(s));
export const getMkts = T.mkR("get-available-markets", "Get available markets", z.object({}), s => R.markets(s));
export const getNew = T.mkR("get-new-releases", "Get new releases", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), (s, i) => R.newReleases(s, i.limit, i.offset));
export const getFeat = T.mkR("get-featured-playlists", "Get featured playlists", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), (s, i) => R.featured(s, i.limit, i.offset));
export const getCats = T.mkR("get-browse-categories", "Get browse categories", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), (s, i) => R.categories(s, i.limit, i.offset));
export const getCatPls = T.mkR("get-category-playlists", "Get category playlists", z.object({ categoryId: z.string().min(1), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), (s, i) => R.catPlaylists(s, i.categoryId, i.limit, i.offset));
export const artTop = T.mkR("get-artist-top-tracks", "Get artist top tracks", z.object({ artistId: z.string().min(1), market: z.string().optional() }), (s, i) => R.artistTop(s, i.artistId, i.market));
export const artRel = T.mkR("get-artist-related-artists", "Get related artists", z.object({ artistId: z.string().min(1) }), (s, i) => R.relatedArtists(s, i.artistId));
export const artAlb = T.mkR("get-artist-albums", "Get artist albums", z.object({ artistId: z.string().min(1), includeGroups: z.string().optional(), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), (s, i) => R.artistAlbums(s, i.artistId, i.limit, i.offset, i.includeGroups));
export const albTr = T.mkR("get-album-tracks", "Get album tracks", z.object({ albumId: z.string().min(1), market: z.string().optional() }), (s, i) => R.albumTracks(s, i.albumId, i.market));
export const shEp = T.mkR("get-show-episodes", "Get show episodes", z.object({ showId: z.string().min(1), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), (s, i) => R.showEpisodes(s, i.showId, i.limit, i.offset));
export const getAf = T.mkR("get-audio-features", "Get audio features", z.object({ ids: z.string().min(1) }), (s, i) => R.audioFeatures(s, i.ids));
export const getAa = T.mkR("get-audio-analysis", "Get audio analysis", z.object({ trackId: z.string().min(1) }), (s, i) => R.audioAnalysis(s, i.trackId));

// NEW FEATURES
export const getShare = T.mkR("get-share-link", "Generate shareable Spotify link", z.object({ uri: z.string().min(1), platform: z.enum(["spotify", "web"]).optional().default("web") }), (s, i) => {
    const link = i.platform === "spotify" ? i.uri : `https://open.spotify.com/${i.uri.replace("spotify:", "").replace(":", "/")}`;
    return Promise.resolve({ shareLink: link, uri: i.uri, shortUrl: link.replace("open.spotify.com", "spotify.link") });
});

export const getStats = T.mkR("get-listening-stats", "Get listening stats: total time, top genres, avg BPM", z.object({ timeRange: z.enum(["short_term", "medium_term", "long_term"]).optional().default("medium_term") }), async (s, i) => {
    const [topTracks, topArtists] = await Promise.all([R.getTop(s, "tracks", 50, i.timeRange), R.getTop(s, "artists", 50, i.timeRange)]);
    const genres = topArtists.items.flatMap((a: any) => a.genres || []);
    const genreCounts = genres.reduce((acc: any, g: string) => { acc[g] = (acc[g] || 0) + 1; return acc; }, {});
    const topGenres = Object.entries(genreCounts).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(([g]) => g);
    return { totalTracks: topTracks.total, topGenres, estimatedListeningMinutes: Math.round(topTracks.total * 3.5) };
});

export const getTracksByBPM = T.mkR("get-tracks-by-bpm", "Find tracks by BPM range using audio features", z.object({ minBpm: z.number().min(60).max(200).optional().default(100), maxBpm: z.number().min(60).max(200).optional().default(140), minEnergy: z.number().min(0).max(1).optional(), maxEnergy: z.number().min(0).max(1).optional(), limit: z.number().min(1).max(50).optional().default(20) }), (s, i) => {
    const mid = (i.minBpm + i.maxBpm) / 2;
    const p: any = { limit: i.limit, target_tempo: mid };
    if (i.minEnergy && i.maxEnergy) p.target_energy = (i.minEnergy + i.maxEnergy) / 2;
    if (i.minBpm) p.min_tempo = i.minBpm;
    if (i.maxBpm) p.max_tempo = i.maxBpm;
    if (i.minEnergy) p.min_energy = i.minEnergy;
    if (i.maxEnergy) p.max_energy = i.maxEnergy;
    return R.recs(s, p);
});

export const allTools = [
    getPlayState, getCurrPlay, getDevs, startPlay, pausePlay, skipNext, skipPrev, seekPos, setRep, setVol, togShuf, getRec, getQue, addQue, rmQue,
    getPl, getPlItems, getUsrPls, crPl, addPlIt, rmPlIt, folPl, unfolPl,
    getTracks, saveTracks, rmTracks, getAlbums, saveAlbums, rmAlbums, getShows, saveShows, rmShows, getEps, rmEps, getArt, folArt, unfolArt,
    search, getMe, getUser, getTop, fol, unfol, chkFol,
    getRecs, getGens, getMkts, getNew, getFeat, getCats, getCatPls, artTop, artRel, artAlb, albTr, shEp, getAf, getAa,
    getShare, getStats, getTracksByBPM
];
