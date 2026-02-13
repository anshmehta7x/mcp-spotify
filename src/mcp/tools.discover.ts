import { z, mkRead, empty } from "./toolFactory.js";
import { makeReq } from "./requests.js";

const rec = z.object({ seedArtists: z.string().optional(), seedTracks: z.string().optional(), seedGenres: z.string().optional(), targetEnergy: z.number().min(0).max(1).optional(), targetDanceability: z.number().min(0).max(1).optional(), targetValence: z.number().min(0).max(1).optional(), limit: z.number().min(1).max(100).optional().default(20), market: z.string().optional() });
const bPag = z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) });
const catPl = z.object({ categoryId: z.string().min(1), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) });
const artT = z.object({ artistId: z.string().min(1), market: z.string().optional() });
const artAl = z.object({ artistId: z.string().min(1), includeGroups: z.string().optional(), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) });
const albT = z.object({ albumId: z.string().min(1), market: z.string().optional() });
const shE = z.object({ showId: z.string().min(1), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) });
const af = z.object({ ids: z.string().min(1) });
const aa = z.object({ trackId: z.string().min(1) });

export const getRecs = mkRead("get-recommendations", "Get recommendations", rec, async (s, i) => {
    const p: any = { limit: i.limit || 20 };
    if (i.seedArtists) p.seed_artists = i.seedArtists;
    if (i.seedTracks) p.seed_tracks = i.seedTracks;
    if (i.seedGenres) p.seed_genres = i.seedGenres;
    if (i.targetEnergy !== undefined) p.target_energy = i.targetEnergy;
    if (i.targetDanceability !== undefined) p.target_danceability = i.targetDanceability;
    if (i.targetValence !== undefined) p.target_valence = i.targetValence;
    if (i.market) p.market = i.market;
    return makeReq<any>(s, "GET", "recommendations", { params: p });
});
export const getGens = mkRead("get-available-genres", "Get available genres", empty, async (s) => makeReq<any>(s, "GET", "recommendations/available-genre-seeds"));
export const getMkts = mkRead("get-available-markets", "Get available markets", empty, async (s) => makeReq<any>(s, "GET", "markets"));
export const getNew = mkRead("get-new-releases", "Get new releases", bPag, async (s, i) => makeReq<any>(s, "GET", "browse/new-releases", { params: { limit: i.limit, offset: i.offset } }));
export const getFeat = mkRead("get-featured-playlists", "Get featured playlists", bPag, async (s, i) => makeReq<any>(s, "GET", "browse/featured-playlists", { params: { limit: i.limit, offset: i.offset } }));
export const getCats = mkRead("get-browse-categories", "Get browse categories", bPag, async (s, i) => makeReq<any>(s, "GET", "browse/categories", { params: { limit: i.limit, offset: i.offset, country: "US" } }));
export const getCatPls = mkRead("get-category-playlists", "Get category playlists", catPl, async (s, i) => makeReq<any>(s, "GET", `browse/categories/${i.categoryId}/playlists`, { params: { limit: i.limit, offset: i.offset, country: "US" } }));
export const artTop = mkRead("get-artist-top-tracks", "Get artist top tracks", artT, async (s, i) => makeReq<any>(s, "GET", `artists/${i.artistId}/top-tracks`, { params: { market: i.market || "US" } }));
export const artRel = mkRead("get-artist-related-artists", "Get related artists", z.object({ artistId: z.string().min(1) }), async (s, i) => makeReq<any>(s, "GET", `artists/${i.artistId}/related-artists`));
export const artAlb = mkRead("get-artist-albums", "Get artist albums", artAl, async (s, i) => makeReq<any>(s, "GET", `artists/${i.artistId}/albums`, { params: { include_groups: i.includeGroups || "album,single", limit: i.limit, offset: i.offset } }));
export const albTr = mkRead("get-album-tracks", "Get album tracks", albT, async (s, i) => makeReq<any>(s, "GET", `albums/${i.albumId}/tracks`, { params: { market: i.market } }));
export const shEp = mkRead("get-show-episodes", "Get show episodes", shE, async (s, i) => makeReq<any>(s, "GET", `shows/${i.showId}/episodes`, { params: { limit: i.limit, offset: i.offset } }));
export const getAf = mkRead("get-audio-features", "Get audio features", af, async (s, i) => makeReq<any>(s, "GET", "audio-features", { params: { ids: i.ids } }));
export const getAa = mkRead("get-audio-analysis", "Get audio analysis", aa, async (s, i) => makeReq<any>(s, "GET", `audio-analysis/${i.trackId}`));

export const discoverTools = [getRecs, getGens, getMkts, getNew, getFeat, getCats, getCatPls, artTop, artRel, artAlb, albTr, shEp, getAf, getAa];
