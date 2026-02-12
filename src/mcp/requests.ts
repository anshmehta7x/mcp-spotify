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

const authService = AuthService.getInstance();
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export async function makeRequest<T>(
    sessionId: string,
    method: Method,
    endpoint: string,
    config?: AxiosRequestConfig
): Promise<T> {
    const accessToken = await authService.getAccessToken(sessionId);
    
    if (!accessToken) {
        throw new Error("User is not authenticated or token has expired");
    }

    try {
        const result = await axios({
            method,
            url: `${SPOTIFY_API_BASE}/${endpoint}`,
            headers: {
                Authorization: `Bearer ${accessToken}`,
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

export async function getPlaybackState(sessionId: string, market?: string, additionalTypes?: string) {
    const data = await makeRequest<any>(sessionId, "GET", "me/player", {
        params: {
            market,
            additional_types: additionalTypes,
        },
    });
    return slimPlaybackState(data);
}

export async function transferPlayback(sessionId: string, deviceIds: string[], play?: boolean) {
    await makeRequest(sessionId, "PUT", "me/player", {
        data: {
            device_ids: deviceIds,
            play: play,
        },
    });
    return { success: true };
}

export async function getAvailableDevices(sessionId: string) {
    const data = await makeRequest<any>(sessionId, "GET", "me/player/devices");
    return {
        devices: data.devices.map(slimDevice),
    };
}

export async function getCurrentlyPlayingTrack(sessionId: string, market?: string, additionalTypes?: string) {
    const data = await makeRequest<any>(sessionId, "GET", "me/player/currently-playing", {
        params: {
            market,
            additional_types: additionalTypes,
        },
    });
    return slimPlaybackState(data);
}

export async function startResumePlayback(
    sessionId: string,
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

    await makeRequest(sessionId, "PUT", "me/player/play", {
        data: body,
        params: deviceId ? { device_id: deviceId } : undefined,
    });
    return { success: true };
}

export async function pausePlayback(sessionId: string, deviceId?: string) {
    await makeRequest(sessionId, "PUT", "me/player/pause", {
        params: deviceId ? { device_id: deviceId } : undefined,
    });
    return { success: true };
}

export async function skipToNext(sessionId: string, deviceId?: string) {
    await makeRequest(sessionId, "POST", "me/player/next", {
        params: deviceId ? { device_id: deviceId } : undefined,
    });
    return { success: true };
}

export async function skipToPrevious(sessionId: string, deviceId?: string) {
    await makeRequest(sessionId, "POST", "me/player/previous", {
        params: deviceId ? { device_id: deviceId } : undefined,
    });
    return { success: true };
}

export async function seekToPosition(sessionId: string, positionMs: number, deviceId?: string) {
    await makeRequest(sessionId, "PUT", "me/player/seek", {
        params: {
            position_ms: positionMs,
            ...(deviceId && { device_id: deviceId }),
        },
    });
    return { success: true };
}

export async function setRepeatMode(sessionId: string, state: "track" | "context" | "off", deviceId?: string) {
    await makeRequest(sessionId, "PUT", "me/player/repeat", {
        params: {
            state: state,
            ...(deviceId && { device_id: deviceId }),
        },
    });
    return { success: true };
}

export async function setPlaybackVolume(sessionId: string, volumePercent: number, deviceId?: string) {
    await makeRequest(sessionId, "PUT", "me/player/volume", {
        params: {
            volume_percent: volumePercent,
            ...(deviceId && { device_id: deviceId }),
        },
    });
    return { success: true };
}

export async function togglePlaybackShuffle(sessionId: string, state: boolean, deviceId?: string) {
    await makeRequest(sessionId, "PUT", "me/player/shuffle", {
        params: {
            state: state,
            ...(deviceId && { device_id: deviceId }),
        },
    });
    return { success: true };
}

export async function getRecentlyPlayedTracks(sessionId: string, limit?: number, after?: number, before?: number) {
    const data = await makeRequest<any>(sessionId, "GET", "me/player/recently-played", {
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

export async function getUserQueue(sessionId: string) {
    const data = await makeRequest<any>(sessionId, "GET", "me/player/queue");
    return {
        currently_playing: slimTrack(data.currently_playing),
        queue: data.queue.map(slimTrack),
    };
}

export async function addItemToPlaybackQueue(sessionId: string, uri: string, deviceId?: string) {
    await makeRequest(sessionId, "POST", "me/player/queue", {
        params: {
            uri: uri,
            ...(deviceId && { device_id: deviceId }),
        },
    });
    return { success: true };
}

export async function getPlaylist(sessionId: string, playlistId: string, market?: string, fields?: string, additionalTypes?: string) {
    const data = await makeRequest<any>(sessionId, "GET", `playlists/${playlistId}`, {
        params: {
            market,
            fields,
            additional_types: additionalTypes,
        },
    });
    return slimPlaylist(data);
}

export async function changePlaylistDetails(
    sessionId: string,
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

    await makeRequest(sessionId, "PUT", `playlists/${playlistId}`, { data: body });
    return { success: true };
}

export async function getPlaylistItems(
    sessionId: string,
    playlistId: string,
    market?: string,
    fields?: string,
    limit?: number,
    offset?: number,
    additionalTypes?: string
) {
    const data = await makeRequest<any>(sessionId, "GET", `playlists/${playlistId}/tracks`, {
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
    sessionId: string,
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

    const result = await makeRequest<any>(sessionId, "PUT", `playlists/${playlistId}/tracks`, {
        data: body,
        params: uris ? params : undefined,
    });

    return {
        success: true,
        snapshot_id: result.snapshot_id,
    };
}

export async function addItemsToPlaylist(
    sessionId: string,
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

    const result = await makeRequest<any>(sessionId, "POST", `playlists/${playlistId}/tracks`, {
        data: body,
        params: Object.keys(params).length > 0 ? params : undefined,
    });

    return {
        success: true,
        snapshot_id: result.snapshot_id,
    };
}

export async function searchItems(
    sessionId: string,
    q: string,
    type: string,
    market?: string,
    limit?: number,
    offset?: number,
    include_external?: "audio"
) {
    const data = await makeRequest<any>(sessionId, "GET", "search", {
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

export async function getTrack(sessionId: string, id: string, market?: string) {
    const data = await makeRequest<any>(sessionId, "GET", `tracks/${id}`, {
        params: { market },
    });
    return slimTrack(data);
}

export async function getSeveralTracks(sessionId: string, ids: string, market?: string) {
    const data = await makeRequest<any>(sessionId, "GET", "tracks", {
        params: { ids, market },
    });
    return {
        tracks: data.tracks.map(slimTrack),
    };
}

export async function getSavedTracks(sessionId: string, market?: string, limit?: number, offset?: number) {
    const data = await makeRequest<any>(sessionId, "GET", "me/tracks", {
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

export async function saveTracks(sessionId: string, ids: string) {
    const idArray = ids.split(',').map(id => id.trim());
    await makeRequest(sessionId, "PUT", "me/tracks", {
        data: { ids: idArray },
    });
    return { success: true };
}

export async function removeSavedTracks(sessionId: string, ids: string) {
    const idArray = ids.split(',').map(id => id.trim());
    await makeRequest(sessionId, "DELETE", "me/tracks", {
        data: { ids: idArray },
    });
    return { success: true };
}

export async function checkSavedTracks(sessionId: string, ids: string) {
    return await makeRequest<any>(sessionId, "GET", "me/tracks/contains", {
        params: { ids },
    });
}

export async function getUserProfile(sessionId: string, userId: string) {
    return await makeRequest<any>(sessionId, "GET", `users/${userId}`);
}

export async function getCurrentUserProfile(sessionId: string) {
    return await makeRequest<any>(sessionId, "GET", "me");
}

export async function getCurrentUserTopItems(
    sessionId: string,
    type: "tracks" | "artists",
    time_range?: "medium_term" | "short_term" | "long_term",
    limit?: number,
    offset?: number
) {
    const finalLimit = (limit && limit >= 1 && limit <= 50) ? limit : 20;

    return await makeRequest<any>(sessionId, "GET", `me/top/${type}`, {
        params: {
            time_range: time_range || "medium_term",
            limit: finalLimit,
            offset: offset || 0,
        },
    });
}

export async function followOrUnfollowPlaylist(sessionId: string, playlistId: string, follow: boolean) {
    const method = follow ? "PUT" : "DELETE";
    await makeRequest(sessionId, method, `playlists/${playlistId}/followers`);
    return { success: true };
}

export async function getFollowedArtists(
    sessionId: string,
    type: "artist",
    after?: string,
    limit?: number
) {
    const finalLimit = (limit && limit >= 1 && limit <= 50) ? limit : 20;

    return await makeRequest<any>(sessionId, "GET", "me/following", {
        params: {
            type,
            after,
            limit: finalLimit,
        },
    });
}

export async function followArtistsOrUsers(
    sessionId: string,
    type: "artist" | "user",
    ids: string
) {
    await makeRequest(sessionId, "PUT", "me/following", {
        params: { type },
        data: {
            ids: ids.split(",").map(id => id.trim()),
        },
    });
    return { success: true };
}

export async function unfollowArtistsOrUsers(
    sessionId: string,
    type: "artist" | "user",
    ids: string
) {
    await makeRequest(sessionId, "DELETE", "me/following", {
        params: { type },
        data: {
            ids: ids.split(",").map(id => id.trim()),
        },
    });
    return { success: true };
}

export async function checkIfUserFollows(
    sessionId: string,
    type: "artist" | "user",
    ids: string
) {
    return await makeRequest<any>(sessionId, "GET", "me/following/contains", {
        params: { type, ids },
    });
}

export async function checkIfCurrentUserFollowsPlaylist(sessionId: string, playlistId: string, ids: string) {
    return await makeRequest<any>(sessionId, "GET", `playlists/${playlistId}/followers/contains`, {
        params: { ids },
    });
}

// ============ NEW FEATURES ============

export async function getRecommendations(
    sessionId: string,
    seedArtists?: string,
    seedTracks?: string,
    seedGenres?: string,
    targetEnergy?: number,
    targetDanceability?: number,
    targetValence?: number,
    limit?: number
) {
    const params: any = {
        limit: limit || 20,
    };
    
    if (seedArtists) params.seed_artists = seedArtists;
    if (seedTracks) params.seed_tracks = seedTracks;
    if (seedGenres) params.seed_genres = seedGenres;
    if (targetEnergy !== undefined) params.target_energy = targetEnergy;
    if (targetDanceability !== undefined) params.target_danceability = targetDanceability;
    if (targetValence !== undefined) params.target_valence = targetValence;

    const data = await makeRequest<any>(sessionId, "GET", "recommendations", { params });
    
    return {
        tracks: data.tracks.map(slimTrack),
        seeds: data.seeds.map((seed: any) => ({
            id: seed.id,
            afterRelinking: seed.afterRelinking,
            initialPoolSize: seed.initialPoolSize,
            afterRelinkingTotal: seed.afterRelinkingTotal,
        })),
    };
}

export async function getNewReleases(sessionId: string, limit?: number, offset?: number) {
    const data = await makeRequest<any>(sessionId, "GET", "browse/new-releases", {
        params: {
            limit: limit || 20,
            offset: offset || 0,
        },
    });
    
    return {
        albums: data.albums.items.map((album: any) => slimAlbum(album)),
        total: data.albums.total,
        next: data.albums.next,
    };
}

export async function getFeaturedPlaylists(sessionId: string, limit?: number, offset?: number) {
    const data = await makeRequest<any>(sessionId, "GET", "browse/featured-playlists", {
        params: {
            limit: limit || 20,
            offset: offset || 0,
        },
    });
    
    return {
        message: data.message,
        playlists: data.playlists.items.map((playlist: any) => slimPlaylist(playlist)),
        total: data.playlists.total,
        next: data.playlists.next,
    };
}

export async function createPlaylist(
    sessionId: string,
    name: string,
    description?: string,
    publicPlaylist?: boolean
) {
    const data = await makeRequest<any>(sessionId, "POST", "me/playlists", {
        data: {
            name,
            description: description || "",
            public: publicPlaylist || false,
        },
    });
    
    return slimPlaylist(data);
}

export async function getArtistTopTracks(sessionId: string, artistId: string, market?: string) {
    const data = await makeRequest<any>(sessionId, "GET", `artists/${artistId}/top-tracks`, {
        params: {
            market: market || "US",
        },
    });
    
    return {
        tracks: data.tracks.map(slimTrack),
    };
}

export async function getArtistRelatedArtists(sessionId: string, artistId: string) {
    const data = await makeRequest<any>(sessionId, "GET", `artists/${artistId}/related-artists`);
    
    return {
        artists: data.artists.map((artist: any) => slimArtist(artist)),
    };
}

export async function getArtistAlbums(
    sessionId: string,
    artistId: string,
    includeGroups?: string,
    limit?: number,
    offset?: number
) {
    const data = await makeRequest<any>(sessionId, "GET", `artists/${artistId}/albums`, {
        params: {
            include_groups: includeGroups || "album,single",
            limit: limit || 20,
            offset: offset || 0,
        },
    });
    
    return {
        items: data.items.map((album: any) => slimAlbum(album)),
        total: data.total,
        next: data.next,
    };
}

export async function getAlbumTracks(sessionId: string, albumId: string, market?: string) {
    const data = await makeRequest<any>(sessionId, "GET", `albums/${albumId}/tracks`, {
        params: { market },
    });
    
    return {
        items: data.items.map(slimTrack),
        total: data.total,
    };
}

export async function getShowEpisodes(sessionId: string, showId: string, limit?: number, offset?: number) {
    const data = await makeRequest<any>(sessionId, "GET", `shows/${showId}/episodes`, {
        params: {
            limit: limit || 20,
            offset: offset || 0,
        },
    });
    
    return {
        items: data.items.map((episode: any) => slimEpisode(episode)),
        total: data.total,
        next: data.next,
    };
}

export async function removePlaylistItems(sessionId: string, playlistId: string, uris: string[], snapshotId?: string) {
    const body: any = {
        tracks: uris.map((uri) => ({ uri })),
    };
    if (snapshotId) body.snapshot_id = snapshotId;

    const result = await makeRequest<any>(sessionId, "DELETE", `playlists/${playlistId}/tracks`, {
        data: body,
    });
    
    return {
        snapshot_id: result.snapshot_id,
        tracks_removed: result.tracks_removed,
    };
}
