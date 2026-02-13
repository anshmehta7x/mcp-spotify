import { z, mkRead, mkAction, ids } from "./toolFactory.js";
import { makeReq } from "./requests.js";

const plId = z.object({ playlistId: z.string().min(1) });
const plDet = z.object({ playlistId: z.string().min(1), name: z.string().optional(), description: z.string().optional(), public: z.boolean().optional(), collaborative: z.boolean().optional() });
const plItems = z.object({ playlistId: z.string().min(1), market: z.string().optional(), fields: z.string().optional(), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) });
const addIt = z.object({ playlistId: z.string().min(1), uris: z.array(z.string()).min(1), position: z.number().optional() });
const updPl = z.object({ playlistId: z.string().min(1), uris: z.array(z.string()).optional(), rangeStart: z.number().optional(), insertBefore: z.number().optional(), rangeLength: z.number().optional(), snapshotId: z.string().optional() });
const rmIt = z.object({ playlistId: z.string().min(1), uris: z.array(z.string()).min(1), snapshotId: z.string().optional() });
const crPl = z.object({ name: z.string().min(1), description: z.string().optional(), public: z.boolean().optional().default(false) });
const reord = z.object({ playlistId: z.string().min(1), rangeStart: z.number().min(0), insertBefore: z.number().min(0), rangeLength: z.number().optional(), snapshotId: z.string().optional() });

export const getPl = mkRead("get-playlist", "Get playlist details", z.object({ playlistId: z.string().min(1), market: z.string().optional(), fields: z.string().optional() }), async (s, i) => makeReq<any>(s, "GET", `playlists/${i.playlistId}`, { params: { market: i.market, fields: i.fields } }));
export const getPlItems = mkRead("get-playlist-items", "Get playlist tracks", plItems, async (s, i) => makeReq<any>(s, "GET", `playlists/${i.playlistId}/tracks`, { params: { market: i.market, fields: i.fields, limit: i.limit, offset: i.offset } }));
export const getUsrPls = mkRead("get-user-playlists", "Get user playlists", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), async (s, i) => makeReq<any>(s, "GET", "me/playlists", { params: { limit: i.limit, offset: i.offset } }));
export const getPlImg = mkRead("get-playlist-cover-image", "Get playlist cover", plId, async (s, i) => makeReq<any>(s, "GET", `playlists/${i.playlistId}/images`));
export const crPlTool = mkAction("create-playlist", "Create playlist", crPl, async (s, i) => makeReq<any>(s, "POST", "me/playlists", { data: { name: i.name, description: i.description || "", public: i.public ?? false } }));
export const chgPlDet = mkAction("change-playlist-details", "Update playlist", plDet, async (s, i) => {
    const b: any = {};
    if (i.name !== undefined) b.name = i.name;
    if (i.description !== undefined) b.description = i.description;
    if (i.public !== undefined) b.public = i.public;
    if (i.collaborative !== undefined) b.collaborative = i.collaborative;
    await makeReq(s, "PUT", `playlists/${i.playlistId}`, { data: b });
});
export const addPlIt = mkAction("add-items-to-playlist", "Add items to playlist", addIt, async (s, i) => makeReq<any>(s, "POST", `playlists/${i.playlistId}/tracks`, { data: { uris: i.uris }, params: i.position !== undefined ? { position: i.position } : void 0 }));
export const updPlIt = mkAction("update-playlist-items", "Replace/reorder items", updPl, async (s, i) => {
    const b: any = {};
    const p: any = {};
    if (i.uris?.length) { b.uris = i.uris; p.uris = i.uris.join(','); }
    if (i.rangeStart !== undefined) b.range_start = i.rangeStart;
    if (i.insertBefore !== undefined) b.insert_before = i.insertBefore;
    if (i.rangeLength !== undefined) b.range_length = i.rangeLength;
    if (i.snapshotId) b.snapshot_id = i.snapshotId;
    return makeReq<any>(s, "PUT", `playlists/${i.playlistId}/tracks`, { data: b, params: i.uris ? p : void 0 });
});
export const rmPlIt = mkAction("remove-playlist-items", "Remove items", rmIt, async (s, i) => makeReq<any>(s, "DELETE", `playlists/${i.playlistId}/tracks`, { data: { tracks: i.uris.map((u: string) => ({ uri: u })), ...(i.snapshotId && { snapshot_id: i.snapshotId }) } }));
export const reordPl = mkAction("reorder-playlist-items", "Reorder items", reord, async (s, i) => makeReq<any>(s, "PUT", `playlists/${i.playlistId}/tracks`, { data: { range_start: i.rangeStart, insert_before: i.insertBefore, ...(i.rangeLength !== undefined && { range_length: i.rangeLength }), ...(i.snapshotId && { snapshot_id: i.snapshotId }) } }));
export const addPlImg = mkAction("add-playlist-cover-image", "Add cover image", z.object({ playlistId: z.string().min(1), imageBase64: z.string() }), async (s, i) => makeReq(s, "PUT", `playlists/${i.playlistId}/images`, { headers: { "Content-Type": "image/jpeg" }, data: i.imageBase64 }));
export const folPl = mkAction("follow-playlist", "Follow playlist", plId, async (s, i) => makeReq(s, "PUT", `playlists/${i.playlistId}/followers`));
export const unfolPl = mkAction("unfollow-playlist", "Unfollow playlist", plId, async (s, i) => makeReq(s, "DELETE", `playlists/${i.playlistId}/followers`));
export const chkPlFlw = mkRead("check-playlist-followers", "Check followers", z.object({ playlistId: z.string().min(1), ids: z.string().min(1) }), async (s, i) => makeReq<any>(s, "GET", `playlists/${i.playlistId}/followers/contains`, { params: { ids: i.ids } }));

export const playlistTools = [getPl, getPlItems, getUsrPls, getPlImg, crPlTool, chgPlDet, addPlIt, updPlIt, rmPlIt, reordPl, addPlImg, folPl, unfolPl, chkPlFlw];
