import { AuthService } from "../auth/authservice.js";
import axios, { AxiosRequestConfig, Method } from "axios";
import {
    slimDevice,
    slimPlaybackState,
    slimTrack,
    slimPlaylist,
    slimPlaylistTrack,
    processPagingObject,
    slimAlbum,
    slimArtist,
    slimAudiobook,
    slimEpisode,
    slimShow,
} from "./slims.js";

const authservice = AuthService.getInstance();
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export async function makeRequest<T>(
    method: Method,
    endpoint: string,
    config?: AxiosRequestConfig
): Promise<T> {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        const result = await axios({
            method,
            url: `${SPOTIFY_API_BASE}/${endpoint}`,
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
                "Content-Type": "application/json",
            },
            ...config,
        });
        return result.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.error?.message || "An API error occurred");
        }
        throw new Error("An unknown error occurred");
    }
}

export async function getPlaybackState(market?: string, additionalTypes?: string) {
    const data = await makeRequest("GET", "me/player", {
        params: {
            market,
            additional_types: additionalTypes,
        },
    });
    return slimPlaybackState(data);
}

export async function transferPlayback(deviceIds: string[], play?: boolean) {
    await makeRequest("PUT", "me/player", {
        data: {
            device_ids: deviceIds,
            play: play,
        },
    });
    return { success: true };
}

export async function getAvailableDevices() {
    const data = await makeRequest<any>("GET", "me/player/devices");
    return {
        devices: data.devices.map(slimDevice),
    };
}

export async function getCurrentlyPlayingTrack(market?: string, additionalTypes?: string) {
    const data = await makeRequest("GET", "me/player/currently-playing", {
        params: {
            market,
            additional_types: additionalTypes,
        },
    });
    return slimPlaybackState(data);
}

export async function startResumePlayback(
    deviceId?: string,
    contextUri?: string,
    uris?: string[],
    offset?: { position?: number; uri?: string },
    positionMs?: number
) {
    const body: any = {};
    if (contextUri) body.context_uri = contextUri;
    if (uris) body.uris = uris;
    if (offset) body.offset = offset;
    if (positionMs !== undefined) body.position_ms = positionMs;

    await makeRequest("PUT", "me/player/play", {
        data: body,
        params: deviceId ? { device_id: deviceId } : undefined,
    });
    return { success: true };
}

export async function pausePlayback(deviceId?: string) {
    await makeRequest("PUT", "me/player/pause", {
        params: deviceId ? { device_id: deviceId } : undefined,
    });
    return { success: true };
}

export async function skipToNext(deviceId?: string) {
    await makeRequest("POST", "me/player/next", {
        params: deviceId ? { device_id: deviceId } : undefined,
    });
    return { success: true };
}

export async function skipToPrevious(deviceId?: string) {
    await makeRequest("POST", "me/player/previous", {
        params: deviceId ? { device_id: deviceId } : undefined,
    });
    return { success: true };
}

export async function seekToPosition(positionMs: number, deviceId?: string) {
    await makeRequest("PUT", "me/player/seek", {
        params: {
            position_ms: positionMs,
            ...(deviceId && { device_id: deviceId }),
        },
    });
    return { success: true };
}

export async function setRepeatMode(state: "track" | "context" | "off", deviceId?: string) {
    await makeRequest("PUT", "me/player/repeat", {
        params: {
            state: state,
            ...(deviceId && { device_id: deviceId }),
        },
    });
    return { success: true };
}

export async function setPlaybackVolume(volumePercent: number, deviceId?: string) {
    await makeRequest("PUT", "me/player/volume", {
        params: {
            volume_percent: volumePercent,
            ...(deviceId && { device_id: deviceId }),
        },
    });
    return { success: true };
}

export async function togglePlaybackShuffle(state: boolean, deviceId?: string) {
    await makeRequest("PUT", "me/player/shuffle", {
        params: {
            state: state,
            ...(deviceId && { device_id: deviceId }),
        },
    });
    return { success: true };
}

export async function getRecentlyPlayedTracks(limit?: number, after?: number, before?: number) {
    const data = await makeRequest<any>("GET", "me/player/recently-played", {
        params: {
            limit,
            after,
            before,
        },
    });
    return {
        items: data.items.map((item: any) => ({
            track: slimTrack(item.track),
            played_at: item.played_at,
            context: item.context,
        })),
    };
}

export async function getUserQueue() {
    const data = await makeRequest<any>("GET", "me/player/queue");
    return {
        currently_playing: slimTrack(data.currently_playing),
        queue: data.queue.map(slimTrack),
    };
}

export async function addItemToPlaybackQueue(uri: string, deviceId?: string) {
    await makeRequest("POST", "me/player/queue", {
        params: {
            uri: uri,
            ...(deviceId && { device_id: deviceId }),
        },
    });
    return { success: true };
}

export async function getPlaylist(
    playlistId: string,
    market?: string,
    fields?: string,
    additionalTypes?: string
) {
    const data = await makeRequest("GET", `playlists/${playlistId}`, {
        params: {
            market,
            fields,
            additional_types: additionalTypes,
        },
    });
    return slimPlaylist(data);
}

export async function changePlaylistDetails(
    playlistId: string,
    name?: string,
    description?: string,
    publicPlaylist?: boolean,
    collaborative?: boolean
) {
    const body: any = {};
    if (name !== undefined) body.name = name;
    if (description !== undefined) body.description = description;
    if (publicPlaylist !== undefined) body.public = publicPlaylist;
    if (collaborative !== undefined) body.collaborative = collaborative;

    await makeRequest("PUT", `playlists/${playlistId}`, { data: body });
    return { success: true };
}

export async function getPlaylistItems(
    playlistId: string,
    market?: string,
    fields?: string,
    limit?: number,
    offset?: number,
    additionalTypes?: string
) {
    const data = await makeRequest<any>("GET", `playlists/${playlistId}/tracks`, {
        params: {
            market,
            fields,
            limit,
            offset,
            additional_types: additionalTypes,
        },
    });
    return {
        href: data.href,
        total: data.total,
        limit: data.limit,
        offset: data.offset,
        next: data.next,
        previous: data.previous,
        items: data.items?.map(slimPlaylistTrack) || [],
    };
}

export async function updatePlaylistItems(
    playlistId: string,
    uris?: string[],
    rangeStart?: number,
    insertBefore?: number,
    rangeLength?: number,
    snapshotId?: string
) {
    const body: any = {};
    const params: any = {};

    if (uris && uris.length > 0) {
        body.uris = uris;
        params.uris = uris.join(',');
    }

    if (rangeStart !== undefined) body.range_start = rangeStart;
    if (insertBefore !== undefined) body.insert_before = insertBefore;
    if (rangeLength !== undefined) body.range_length = rangeLength;
    if (snapshotId) body.snapshot_id = snapshotId;

    const result = await makeRequest<any>("PUT", `playlists/${playlistId}/tracks`, {
        data: body,
        params: uris ? params : undefined,
    });

    return {
        success: true,
        snapshot_id: result.snapshot_id,
    };
}

export async function addItemsToPlaylist(
    playlistId: string,
    uris: string[],
    position?: number
) {
    const body: any = {
        uris: uris,
    };
    if (position !== undefined) {
        body.position = position;
    }

    const params: any = {};
    if (position !== undefined) {
        params.position = position;
    }

    const result = await makeRequest<any>("POST", `playlists/${playlistId}/tracks`, {
        data: body,
        params: Object.keys(params).length > 0 ? params : undefined,
    });

    return {
        success: true,
        snapshot_id: result.snapshot_id,
    };
}

export async function searchItems(
    q: string,
    type: string,
    market?: string,
    limit?: number,
    offset?: number,
    include_external?: "audio"
) {
    const data = await makeRequest<any>("GET", "search", {
        params: {
            q,
            type,
            market,
            limit: limit || 20,
            offset: offset || 0,
            include_external,
        },
    });

    return {
        tracks: processPagingObject(data.tracks, slimTrack),
        artists: processPagingObject(data.artists, slimArtist),
        albums: processPagingObject(data.albums, slimAlbum),
        playlists: processPagingObject(data.playlists, slimPlaylist),
        shows: processPagingObject(data.shows, slimShow),
        episodes: processPagingObject(data.episodes, slimEpisode),
        audiobooks: processPagingObject(data.audiobooks, slimAudiobook),
    };
}

export async function getTrack(id: string, market?: string) {
    const data = await makeRequest("GET", `tracks/${id}`, {
        params: { market },
    });
    return slimTrack(data);
}

export async function getSeveralTracks(ids: string, market?: string) {
    const data = await makeRequest<any>("GET", "tracks", {
        params: { ids, market },
    });
    return {
        tracks: data.tracks.map(slimTrack),
    };
}

export async function getSavedTracks(market?: string, limit?: number, offset?: number) {
    const data = await makeRequest<any>("GET", "me/tracks", {
        params: {
            market,
            limit: limit || 20,
            offset: offset || 0,
        },
    });
    return {
        total: data.total,
        limit: data.limit,
        offset: data.offset,
        next: data.next,
        items: data.items.map((item: any) => ({
            added_at: item.added_at,
            track: slimTrack(item.track),
        })),
    };
}

export async function saveTracks(ids: string) {
    const idArray = ids.split(',').map(id => id.trim());
    await makeRequest("PUT", "me/tracks", {
        data: { ids: idArray },
    });
    return { success: true };
}

export async function removeSavedTracks(ids: string) {
    const idArray = ids.split(',').map(id => id.trim());
    await makeRequest("DELETE", "me/tracks", {
        data: { ids: idArray },
    });
    return { success: true };
}

export async function checkSavedTracks(ids: string) {
    return await makeRequest("GET", "me/tracks/contains", {
        params: { ids },
    });
}

export async function getUserProfile(userId: string) {
    return await makeRequest("GET", `users/${userId}`);
}

export async function getCurrentUserProfile() {
    return await makeRequest("GET", "me");
}

export async function getCurrentUserTopItems(
    type: "tracks" | "artists",
    time_range?: "medium_term" | "short_term" | "long_term",
    limit?: number,
    offset?: number
) {
    const finalLimit = (limit && limit >= 1 && limit <= 50) ? limit : 20;

    return await makeRequest("GET", `me/top/${type}`, {
        params: {
            time_range: time_range || "medium_term",
            limit: finalLimit,
            offset: offset || 0,
        },
    });
}

export async function followOrUnfollowPlaylist(playlistId: string, follow: boolean) {
    const method = follow ? "PUT" : "DELETE";
    await makeRequest(method, `playlists/${playlistId}/followers`);
    return { success: true };
}

export async function getFollowedArtists(
    type: "artist",
    after?: string,
    limit?: number
) {
    const finalLimit = (limit && limit >= 1 && limit <= 50) ? limit : 20;

    return await makeRequest("GET", "me/following", {
        params: {
            type,
            after,
            limit: finalLimit,
        },
    });
}

export async function followArtistsOrUsers(
    type: "artist" | "user",
    ids: string
) {
    await makeRequest("PUT", "me/following", {
        params: { type },
        data: {
            ids: ids.split(",").map(id => id.trim()),
        },
    });
    return { success: true };
}

export async function unfollowArtistsOrUsers(
    type: "artist" | "user",
    ids: string
) {
    await makeRequest("DELETE", "me/following", {
        params: { type },
        data: {
            ids: ids.split(",").map(id => id.trim()),
        },
    });
    return { success: true };
}

export async function checkIfUserFollows(
    type: "artist" | "user",
    ids: string
) {
    return await makeRequest("GET", "me/following/contains", {
        params: { type, ids },
    });
}

export async function checkIfCurrentUserFollowsPlaylist(playlistId: string, ids: string) {
    return await makeRequest("GET", `playlists/${playlistId}/followers/contains`, {
        params: { ids },
    });
}
