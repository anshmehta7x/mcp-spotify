import { z, mkRead } from "./toolFactory.js";
import { makeReq } from "./requests.js";

const sPag = z.object({ q: z.string().min(1), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0), market: z.string().optional() });

export const search = mkRead("search-items", "Search tracks/artists/albums/playlists", z.object({ q: z.string().min(1), types: z.array(z.string()).optional().default(["track", "artist", "album", "playlist"]), market: z.string().optional(), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), async (s, i) => makeReq<any>(s, "GET", "search", { params: { q: i.q, type: (i.types || ["track", "artist", "album", "playlist"]).join(','), market: i.market, limit: i.limit, offset: i.offset } }));

const mkSearch = (t: string) => mkRead(`search-${t}`, `Search ${t}`, sPag, async (s, i) => makeReq<any>(s, "GET", "search", { params: { q: i.q, type: t, limit: i.limit, offset: i.offset, market: i.market } }));

export const sTracks = mkSearch("track");
export const sArtists = mkSearch("artist");
export const sAlbums = mkSearch("album");
export const sPlaylists = mkSearch("playlist");
export const sShows = mkSearch("show");
export const sEpisodes = mkSearch("episode");
export const sAudiobooks = mkSearch("audiobook");

export const searchTools = [search, sTracks, sArtists, sAlbums, sPlaylists, sShows, sEpisodes, sAudiobooks];
