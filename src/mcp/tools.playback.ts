import { z, mkRead, mkAction, empty, mkt } from "./toolFactory.js";
import { makeReq, getPlay, getCurr } from "./requests.js";

const devId = z.object({ deviceId: z.string().optional() });
const playOpts = z.object({
    deviceId: z.string().optional(), contextUri: z.string().optional(),
    uris: z.array(z.string()).optional(), offset: z.union([
        z.object({ position: z.number() }), z.object({ uri: z.string() })
    ]).optional(), positionMs: z.number().min(0).optional()
});
const seek = z.object({ positionMs: z.number().min(0), deviceId: z.string().optional() });
const vol = z.object({ volumePercent: z.number().min(0).max(100), deviceId: z.string().optional() });
const rep = z.object({ state: z.enum(["track", "context", "off"]), deviceId: z.string().optional() });
const shuf = z.object({ state: z.boolean(), deviceId: z.string().optional() });
const q = z.object({ uri: z.string(), deviceId: z.string().optional() });
const rec = z.object({ limit: z.number().min(1).max(50).optional().default(20), after: z.number().optional(), before: z.number().optional() });

export const getPlayState = mkRead("get-playback-state", "Get current playback state", mkt, async (s, i) => getPlay(s, i.market));
export const getCurrPlay = mkRead("get-currently-playing", "Get currently playing track", mkt, async (s, i) => getCurr(s, i.market));
export const getDevs = mkRead("get-available-devices", "Get available devices", empty, async (s) => makeReq<any>(s, "GET", "me/player/devices"));
export const transPlay = mkAction("transfer-playback", "Transfer to device", z.object({ deviceIds: z.array(z.string()).min(1), play: z.boolean().optional() }), async (s, i) => makeReq(s, "PUT", "me/player", { data: { device_ids: i.deviceIds, play: i.play } }));
export const startPlay = mkAction("start-resume-playback", "Start/resume playback", playOpts, async (s, i) => {
    const b: any = {};
    if (i.contextUri) b.context_uri = i.contextUri;
    if (i.uris) b.uris = i.uris;
    if (i.offset) b.offset = i.offset;
    if (i.positionMs !== undefined) b.position_ms = i.positionMs;
    await makeReq(s, "PUT", "me/player/play", { data: b, params: i.deviceId ? { device_id: i.deviceId } : void 0 });
});
export const pausePlay = mkAction("pause-playback", "Pause playback", devId, async (s, i) => makeReq(s, "PUT", "me/player/pause", { params: i.deviceId ? { device_id: i.deviceId } : void 0 }));
export const skipNext = mkAction("skip-to-next", "Skip to next", devId, async (s, i) => makeReq(s, "POST", "me/player/next", { params: i.deviceId ? { device_id: i.deviceId } : void 0 }));
export const skipPrev = mkAction("skip-to-previous", "Skip to previous", devId, async (s, i) => makeReq(s, "POST", "me/player/previous", { params: i.deviceId ? { device_id: i.deviceId } : void 0 }));
export const seekPos = mkAction("seek-to-position", "Seek to position", seek, async (s, i) => makeReq(s, "PUT", "me/player/seek", { params: { position_ms: i.positionMs, ...(i.deviceId && { device_id: i.deviceId }) } }));
export const setRep = mkAction("set-repeat-mode", "Set repeat mode", rep, async (s, i) => makeReq(s, "PUT", "me/player/repeat", { params: { state: i.state, ...(i.deviceId && { device_id: i.deviceId }) } }));
export const setVol = mkAction("set-playback-volume", "Set volume 0-100", vol, async (s, i) => makeReq(s, "PUT", "me/player/volume", { params: { volume_percent: i.volumePercent, ...(i.deviceId && { device_id: i.deviceId }) } }));
export const togShuf = mkAction("toggle-shuffle", "Toggle shuffle", shuf, async (s, i) => makeReq(s, "PUT", "me/player/shuffle", { params: { state: i.state, ...(i.deviceId && { device_id: i.deviceId }) } }));
export const getRec = mkRead("get-recently-played", "Get recently played", rec, async (s, i) => makeReq<any>(s, "GET", "me/player/recently-played", { params: { limit: i.limit, after: i.after, before: i.before } }));
export const getQue = mkRead("get-user-queue", "Get user queue", empty, async (s) => makeReq<any>(s, "GET", "me/player/queue"));
export const addQue = mkAction("add-to-queue", "Add to queue", q, async (s, i) => makeReq(s, "POST", "me/player/queue", { params: { uri: i.uri, ...(i.deviceId && { device_id: i.deviceId }) } }));

export const playbackTools = [getPlayState, getCurrPlay, getDevs, transPlay, startPlay, pausePlay, skipNext, skipPrev, seekPos, setRep, setVol, togShuf, getRec, getQue, addQue];
