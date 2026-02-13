import { z, mkRead, mkAction, ids } from "./toolFactory.js";
import { makeReq } from "./requests.js";

const libPag = z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) });
const libMkt = z.object({ market: z.string().optional(), ...libPag.shape });

// Generic lib handler
const libGet = (pt: string, p: string) => mkRead(`get-saved-${pt}`, `Get saved ${pt}`, libMkt, async (s, i) => makeReq<any>(s, "GET", `me/${p}`, { params: { ...i, limit: i.limit, offset: i.offset } }));
const libSave = (pt: string, p: string) => mkAction(`save-${pt}`, `Save ${pt}`, ids, async (s, i) => makeReq(s, "PUT", `me/${p}`, { data: { ids: i.ids.split(',').map((x: string) => x.trim()) } }));
const libRem = (pt: string, p: string) => mkAction(`remove-saved-${pt}`, `Remove saved ${pt}`, ids, async (s, i) => makeReq(s, "DELETE", `me/${p}`, { data: { ids: i.ids.split(',').map((x: string) => x.trim()) } }));
const libChk = (pt: string, p: string) => mkRead(`check-saved-${pt}`, `Check if saved`, ids, async (s, i) => makeReq<any>(s, "GET", `me/${p}/contains`, { params: { ids: i.ids } }));

export const getTracks = libGet("tracks", "tracks");
export const saveTracks = libSave("tracks", "tracks");
export const rmTracks = libRem("saved-tracks", "tracks");
export const chkTracks = libChk("saved-tracks", "tracks");

export const getAlbums = libGet("albums", "albums");
export const saveAlbums = libSave("albums", "albums");
export const rmAlbums = libRem("saved-albums", "albums");
export const chkAlbums = libChk("saved-albums", "albums");

export const getShows = mkRead("get-saved-shows", "Get saved shows", libPag, async (s, i) => makeReq<any>(s, "GET", "me/shows", { params: { limit: i.limit, offset: i.offset } }));
export const saveShows = mkAction("save-shows", "Save shows", ids, async (s, i) => makeReq(s, "PUT", "me/shows", { params: { ids: i.ids.split(',').map((x: string) => x.trim()).join(',') } }));
export const rmShows = mkAction("remove-saved-shows", "Remove shows", ids, async (s, i) => makeReq(s, "DELETE", "me/shows", { params: { ids: i.ids.split(',').map((x: string) => x.trim()).join(',') } }));
export const chkShows = libChk("saved-shows", "shows");

export const getEps = mkRead("get-saved-episodes", "Get saved episodes", libMkt, async (s, i) => makeReq<any>(s, "GET", "me/episodes", { params: { ...i, limit: i.limit, offset: i.offset } }));
export const rmEps = mkAction("remove-saved-episodes", "Remove episodes", ids, async (s, i) => makeReq(s, "DELETE", "me/episodes", { data: { ids: i.ids.split(',').map((x: string) => x.trim()) } }));
export const chkEps = libChk("saved-episodes", "episodes");

export const getArt = mkRead("get-followed-artists", "Get followed artists", z.object({ after: z.string().optional(), limit: z.number().min(1).max(50).optional().default(20) }), async (s, i) => makeReq<any>(s, "GET", "me/following", { params: { type: "artist", after: i.after, limit: i.limit } }));
export const folArt = mkAction("follow-artists", "Follow artists", ids, async (s, i) => makeReq(s, "PUT", "me/following", { params: { type: "artist" }, data: { ids: i.ids.split(",").map((x: string) => x.trim()) } }));
export const unfolArt = mkAction("unfollow-artists", "Unfollow artists", ids, async (s, i) => makeReq(s, "DELETE", "me/following", { params: { type: "artist" }, data: { ids: i.ids.split(",").map((x: string) => x.trim()) } }));
export const chkArt = mkRead("check-following-artists", "Check if following", ids, async (s, i) => makeReq<any>(s, "GET", "me/following/contains", { params: { type: "artist", ids: i.ids } }));

export const libraryTools = [getTracks, saveTracks, rmTracks, chkTracks, getAlbums, saveAlbums, rmAlbums, chkAlbums, getShows, saveShows, rmShows, chkShows, getEps, rmEps, chkEps, getArt, folArt, unfolArt, chkArt];
