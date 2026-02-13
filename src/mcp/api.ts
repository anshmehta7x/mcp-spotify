import axios, { AxiosRequestConfig, Method } from "axios";
import { AuthService } from "../auth/authservice.js";
import { existsSync, readFileSync } from "fs";

const authService = AuthService.getInstance();
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export async function makeReq<T>(sessionId: string, method: Method, endpoint: string, opts?: any): Promise<T> {
    const token = await authService.getAccessToken(sessionId);
    if (!token) throw new Error("Not authenticated");
    try {
        const res = await axios({ method, url: `${SPOTIFY_API_BASE}/${endpoint}`, headers: { Authorization: `Bearer ${token}` }, ...opts });
        return res.data;
    } catch (e: any) { throw new Error(e.response?.data?.error?.message || "API error"); }
}

// Slim functions
export const slimDevice = (d: any) => d ? { id: d.id, name: d.name, type: d.type, is_active: d.is_active, volume_percent: d.volume_percent } : null;
export const slimTrack = (t: any) => t ? { id: t.id, name: t.name, artists: t.artists?.map((a: any) => a.name), album: t.album?.name, duration_ms: t.duration_ms, uri: t.uri } : null;
export const slimArtist = (a: any) => a ? { id: a.id, name: a.name, uri: a.uri } : null;
export const slimAlbum = (a: any) => a ? { id: a.id, name: a.name, artists: a.artists?.map(slimArtist), release_date: a.release_date, uri: a.uri } : null;
export const slimPlaylist = (p: any) => p ? { id: p.id, name: p.name, owner: p.owner?.display_name, tracks_total: p.tracks?.total, uri: p.uri } : null;
export const slimEpisode = (e: any) => e ? { id: e.id, name: e.name, duration_ms: e.duration_ms, release_date: e.release_date, uri: e.uri } : null;
export const slimShow = (s: any) => s ? { id: s.id, name: s.name, publisher: s.publisher, uri: s.uri } : null;
export const slimAudiobook = (b: any) => b ? { id: b.id, name: b.name, authors: b.authors?.map((a: any) => a.name), uri: b.uri } : null;
export const slimPlayback = (d: any) => d ? { is_playing: d.is_playing, progress_ms: d.progress_ms, item: slimTrack(d.item), device: slimDevice(d.device) } : null;

export async function getPlay(s: string, m?: string) { return slimPlayback(await makeReq<any>(s, "GET", "me/player", { params: { market: m } })); }
export async function getCurr(s: string, m?: string) { return slimPlayback(await makeReq<any>(s, "GET", "me/player/currently-playing", { params: { market: m } })); }
