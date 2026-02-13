import { z, mkRead, mkAction, empty } from "./toolFactory.js";
import { makeReq } from "./requests.js";

export const getMe = mkRead("get-current-user-profile", "Get current user profile", empty, async (s) => makeReq<any>(s, "GET", "me"));
export const getUser = mkRead("get-user-profile", "Get user by ID", z.object({ userId: z.string().min(1) }), async (s, i) => makeReq<any>(s, "GET", `users/${i.userId}`));
export const getTop = mkRead("get-user-top-items", "Get top tracks/artists", z.object({ type: z.enum(["tracks", "artists"]), time_range: z.enum(["medium_term", "short_term", "long_term"]).optional().default("medium_term"), limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), async (s, i) => makeReq<any>(s, "GET", `me/top/${i.type}`, { params: { time_range: i.time_range || "medium_term", limit: i.limit, offset: i.offset } }));
export const fol = mkAction("follow-artists-or-users", "Follow artists/users", z.object({ type: z.enum(["artist", "user"]), ids: z.string().min(1) }), async (s, i) => makeReq(s, "PUT", "me/following", { params: { type: i.type }, data: { ids: i.ids.split(",").map((x: string) => x.trim()) } }));
export const unfol = mkAction("unfollow-artists-or-users", "Unfollow artists/users", z.object({ type: z.enum(["artist", "user"]), ids: z.string().min(1) }), async (s, i) => makeReq(s, "DELETE", "me/following", { params: { type: i.type }, data: { ids: i.ids.split(",").map((x: string) => x.trim()) } }));
export const chkFol = mkRead("check-if-user-follows", "Check if following", z.object({ type: z.enum(["artist", "user"]), ids: z.string().min(1) }), async (s, i) => makeReq<any>(s, "GET", "me/following/contains", { params: { type: i.type, ids: i.ids } }));
export const getMyPls = mkRead("get-user-playlists-created", "Get created playlists", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), async (s, i) => makeReq<any>(s, "GET", "me/playlists", { params: { limit: i.limit, offset: i.offset, type: "created" } }));
export const getFldPls = mkRead("get-user-playlists-followed", "Get followed playlists", z.object({ limit: z.number().min(1).max(50).optional().default(20), offset: z.number().min(0).optional().default(0) }), async (s, i) => makeReq<any>(s, "GET", "me/playlists", { params: { limit: i.limit, offset: i.offset, type: "followed" } }));

export const userTools = [getMe, getUser, getTop, fol, unfol, chkFol, getMyPls, getFldPls];
