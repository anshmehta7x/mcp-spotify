import { z } from "zod";
import axios, { AxiosRequestConfig, Method } from "axios";
import { AuthService } from "../auth/authservice.js";
import { slimDevice, slimTrack, slimArtist, slimAlbum, slimPlaylist, slimEpisode, slimShow, slimAudiobook, processPagingObject } from "./slims.js";

const auth = AuthService.getInstance();
const API = "https://api.spotify.com/v1";

async function req<T>(s: string, m: Method, e: string, o?: AxiosRequestConfig): Promise<T> {
    const t = await auth.getAccessToken(s);
    if (!t) throw new Error("Not authenticated");
    try { return (await axios({ method: m, url: `${API}/${e}`, headers: { Authorization: `Bearer ${t}` }, ...o })).data; }
    catch (e: any) { throw new Error(e.response?.data?.error?.message || "API error"); }
}

export { slimDevice, slimTrack, slimArtist, slimAlbum, slimPlaylist, slimEpisode, slimShow, slimAudiobook, processPagingObject };
export const getPlaybackState = (s: string, m?: string) => req<any>(s, "GET", "me/player", { params: { market: m } });
export const getCurrentlyPlaying = (s: string, m?: string) => req<any>(s, "GET", "me/player/currently-playing", { params: { market: m } });
export const getDevices = (s: string) => req<any>(s, "GET", "me/player/devices");
export const transfer = (s: string, ids: string[], play?: boolean) => req(s, "PUT", "me/player", { data: { device_ids: ids, play } });
export const play = (s: string, d?: string, b?: any) => req(s, "PUT", "me/player/play", { data: b, params: d ? { device_id: d } : undefined });
export const pause = (s: string, d?: string) => req(s, "PUT", "me/player/pause", { params: d ? { device_id: d } : undefined });
export const next = (s: string, d?: string) => req(s, "POST", "me/player/next", { params: d ? { device_id: d } : undefined });
export const prev = (s: string, d?: string) => req(s, "POST", "me/player/previous", { params: d ? { device_id: d } : undefined });
export const seek = (s: string, ms: number, d?: string) => req(s, "PUT", "me/player/seek", { params: { position_ms: ms, ...(d && { device_id: d }) } });
export const repeat = (s: string, st: string, d?: string) => req(s, "PUT", "me/player/repeat", { params: { state: st, ...(d && { device_id: d }) } });
export const volume = (s: string, pct: number, d?: string) => req(s, "PUT", "me/player/volume", { params: { volume_percent: pct, ...(d && { device_id: d }) } });
export const shuffle = (s: string, st: boolean, d?: string) => req(s, "PUT", "me/player/shuffle", { params: { state: st, ...(d && { device_id: d }) } });
export const recent = (s: string, l?: number) => req<any>(s, "GET", "me/player/recently-played", { params: { limit: l } });
export const queue = (s: string) => req<any>(s, "GET", "me/player/queue");
export const addQ = (s: string, u: string, d?: string) => req(s, "POST", "me/player/queue", { params: { uri: u, ...(d && { device_id: d }) } });
export const rmQ = (s: string, u: string, d?: string) => req(s, "DELETE", "me/player/queue", { params: { uri: u, ...(d && { device_id: d }) } });
export const getPlaylist = (s: string, id: string, m?: string) => req<any>(s, "GET", `playlists/${id}`, { params: { market: m } });
export const getPlTracks = (s: string, id: string, l = 20, o = 0, m?: string) => req<any>(s, "GET", `playlists/${id}/tracks`, { params: { limit: l, offset: o, market: m } });
export const getMyPlaylists = (s: string, l = 20, o = 0) => req<any>(s, "GET", "me/playlists", { params: { limit: l, offset: o } });
export const createPlaylist = (s: string, n: string, d?: string, pub = false) => req<any>(s, "POST", "me/playlists", { data: { name: n, description: d || "", public: pub } });
export const addToPlaylist = (s: string, id: string, uris: string[], pos?: number) => req<any>(s, "POST", `playlists/${id}/tracks`, { data: { uris }, params: pos ? { position: pos } : undefined });
export const rmFromPlaylist = (s: string, id: string, uris: string[]) => req<any>(s, "DELETE", `playlists/${id}/tracks`, { data: { tracks: uris.map((u: string) => ({ uri: u })) } });
export const followPl = (s: string, id: string) => req(s, "PUT", `playlists/${id}/followers`);
export const unfollowPl = (s: string, id: string) => req(s, "DELETE", `playlists/${id}/followers`);
export const getSavedTracks = (s: string, l = 20, o = 0, m?: string) => req<any>(s, "GET", "me/tracks", { params: { limit: l, offset: o, market: m } });
export const saveTracks = (s: string, ids: string[]) => req(s, "PUT", "me/tracks", { data: { ids } });
export const rmSavedTracks = (s: string, ids: string[]) => req(s, "DELETE", "me/tracks", { data: { ids } });
export const getSavedAlbums = (s: string, l = 20, o = 0) => req<any>(s, "GET", "me/albums", { params: { limit: l, offset: o } });
export const saveAlbums = (s: string, ids: string[]) => req(s, "PUT", "me/albums", { data: { ids } });
export const rmSavedAlbums = (s: string, ids: string[]) => req(s, "DELETE", "me/albums", { data: { ids } });
export const getSavedShows = (s: string, l = 20, o = 0) => req<any>(s, "GET", "me/shows", { params: { limit: l, offset: o } });
export const saveShows = (s: string, ids: string[]) => req(s, "PUT", "me/shows", { params: { ids: ids.join(",") } });
export const rmSavedShows = (s: string, ids: string[]) => req(s, "DELETE", "me/shows", { params: { ids: ids.join(",") } });
export const getSavedEps = (s: string, l = 20, o = 0, m?: string) => req<any>(s, "GET", "me/episodes", { params: { limit: l, offset: o, market: m } });
export const rmSavedEps = (s: string, ids: string[]) => req(s, "DELETE", "me/episodes", { data: { ids } });
export const getFollowedArtists = (s: string, l = 20, a?: string) => req<any>(s, "GET", "me/following", { params: { type: "artist", limit: l, after: a } });
export const followArtists = (s: string, ids: string[]) => req(s, "PUT", "me/following", { params: { type: "artist" }, data: { ids } });
export const unfollowArtists = (s: string, ids: string[]) => req(s, "DELETE", "me/following", { params: { type: "artist" }, data: { ids } });
export const search = (s: string, q: string, t: string, l = 20, m?: string) => req<any>(s, "GET", "search", { params: { q, type: t, limit: l, market: m } });
export const getMe = (s: string) => req<any>(s, "GET", "me");
export const getUser = (s: string, id: string) => req<any>(s, "GET", `users/${id}`);
export const getTop = (s: string, type: string, l = 20, tr = "medium_term") => req<any>(s, "GET", `me/top/${type}`, { params: { limit: l, time_range: tr } });
export const followUsers = (s: string, ids: string[]) => req(s, "PUT", "me/following", { params: { type: "user" }, data: { ids } });
export const unfollowUsers = (s: string, ids: string[]) => req(s, "DELETE", "me/following", { params: { type: "user" }, data: { ids } });
export const checkFollows = (s: string, type: string, ids: string[]) => req<any>(s, "GET", "me/following/contains", { params: { type, ids: ids.join(",") } });
export const recs = (s: string, p: any) => req<any>(s, "GET", "recommendations", { params: p });
export const genres = (s: string) => req<any>(s, "GET", "recommendations/available-genre-seeds");
export const markets = (s: string) => req<any>(s, "GET", "markets");
export const newReleases = (s: string, l = 20, o = 0) => req<any>(s, "GET", "browse/new-releases", { params: { limit: l, offset: o } });
export const featured = (s: string, l = 20, o = 0) => req<any>(s, "GET", "browse/featured-playlists", { params: { limit: l, offset: o } });
export const categories = (s: string, l = 20, o = 0) => req<any>(s, "GET", "browse/categories", { params: { limit: l, offset: o, country: "US" } });
export const catPlaylists = (s: string, id: string, l = 20, o = 0) => req<any>(s, "GET", `browse/categories/${id}/playlists`, { params: { limit: l, offset: o, country: "US" } });
export const artistTop = (s: string, id: string, m = "US") => req<any>(s, "GET", `artists/${id}/top-tracks`, { params: { market: m } });
export const relatedArtists = (s: string, id: string) => req<any>(s, "GET", `artists/${id}/related-artists`);
export const artistAlbums = (s: string, id: string, l = 20, o = 0, g = "album,single") => req<any>(s, "GET", `artists/${id}/albums`, { params: { include_groups: g, limit: l, offset: o } });
export const albumTracks = (s: string, id: string, m?: string) => req<any>(s, "GET", `albums/${id}/tracks`, { params: { market: m } });
export const showEpisodes = (s: string, id: string, l = 20, o = 0) => req<any>(s, "GET", `shows/${id}/episodes`, { params: { limit: l, offset: o } });
export const audioFeatures = (s: string, ids: string) => req<any>(s, "GET", "audio-features", { params: { ids } });
export const audioAnalysis = (s: string, id: string) => req<any>(s, "GET", `audio-analysis/${id}`);

// External API calls for extended features
export const getConcerts = async (artistId: string) => {
    // Would use Songkick or Bandsintown API
    return { message: "Concert data requires Songkick/Bandsintown API integration" };
};
