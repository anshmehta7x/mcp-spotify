import { AuthService } from "../../auth/authservice.js";
import axios from "axios";

const authservice = AuthService.getInstance();
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

const slimDevice = (device: any) => {
    if (!device) return null;
    return {
        id: device.id,
        is_active: device.is_active,
        is_private_session: device.is_private_session,
        is_restricted: device.is_restricted,
        name: device.name,
        type: device.type,
        volume_percent: device.volume_percent,
        supports_volume: device.supports_volume
    };
};

const slimTrack = (item: any) => {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        artists: item.artists?.map((artist: any) => artist.name) || [],
        album: item.album?.name,
        duration_ms: item.duration_ms,
        explicit: item.explicit,
        external_url: item.external_urls?.spotify,
        uri: item.uri
    };
};

const slimPlaybackState = (data: any) => {
    if (!data) return null;
    return {
        device: slimDevice(data.device),
        repeat_state: data.repeat_state,
        shuffle_state: data.shuffle_state,
        timestamp: data.timestamp,
        progress_ms: data.progress_ms,
        is_playing: data.is_playing,
        item: slimTrack(data.item),
        currently_playing_type: data.currently_playing_type,
        context: data.context ? {
            type: data.context.type,
            uri: data.context.uri,
            external_url: data.context.external_urls?.spotify
        } : null
    };
};

export async function getPlaybackState(market?: string, additionalTypes?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }
    try {
        const result = await axios.get(`${SPOTIFY_API_BASE}/me/player`, {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            },
            params: {
                market,
                additional_types: additionalTypes
            }
        });

        if (result.status === 204) {
            return { message: "No active playback" };
        }

        return slimPlaybackState(result.data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 204) {
            return { message: "No active playback" };
        }
        throw new Error("Failed to fetch playback state");
    }
}

export async function transferPlayback(deviceIds: string[], play?: boolean) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        await axios.put(
            `${SPOTIFY_API_BASE}/me/player`,
            {
                device_ids: deviceIds,
                play: play
            },
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to transfer playback" };
    }
}

export async function getAvailableDevices() {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }
    try {
        const result = await axios.get(`${SPOTIFY_API_BASE}/me/player/devices`, {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            }
        });

        return {
            devices: result.data.devices.map(slimDevice)
        };
    } catch (error) {
        throw new Error("Failed to fetch available devices");
    }
}

export async function getCurrentlyPlayingTrack(market?: string, additionalTypes?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }
    try {
        const result = await axios.get(`${SPOTIFY_API_BASE}/me/player/currently-playing`, {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            },
            params: {
                market,
                additional_types: additionalTypes
            }
        });

        if (result.status === 204) {
            return { message: "No track currently playing" };
        }

        return slimPlaybackState(result.data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 204) {
            return { message: "No track currently playing" };
        }
        throw new Error("Failed to fetch currently playing track");
    }
}

export async function startResumePlayback(
    deviceId?: string,
    contextUri?: string,
    uris?: string[],
    offset?: { position?: number; uri?: string },
    positionMs?: number
) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    const body: any = {};
    if (contextUri) body.context_uri = contextUri;
    if (uris) body.uris = uris;
    if (offset) body.offset = offset;
    if (positionMs !== undefined) body.position_ms = positionMs;

    try {
        await axios.put(
            `${SPOTIFY_API_BASE}/me/player/play`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                    "Content-Type": "application/json"
                },
                params: deviceId ? { device_id: deviceId } : undefined
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to start/resume playback" };
    }
}

export async function pausePlayback(deviceId?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        await axios.put(
            `${SPOTIFY_API_BASE}/me/player/pause`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: deviceId ? { device_id: deviceId } : undefined
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to pause playback" };
    }
}

export async function skipToNext(deviceId?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        await axios.post(
            `${SPOTIFY_API_BASE}/me/player/next`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: deviceId ? { device_id: deviceId } : undefined
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to skip to next track" };
    }
}

export async function skipToPrevious(deviceId?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        await axios.post(
            `${SPOTIFY_API_BASE}/me/player/previous`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: deviceId ? { device_id: deviceId } : undefined
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to skip to previous track" };
    }
}

export async function seekToPosition(positionMs: number, deviceId?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        await axios.put(
            `${SPOTIFY_API_BASE}/me/player/seek`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: {
                    position_ms: positionMs,
                    ...(deviceId && { device_id: deviceId })
                }
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to seek to position" };
    }
}

export async function setRepeatMode(state: "track" | "context" | "off", deviceId?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        await axios.put(
            `${SPOTIFY_API_BASE}/me/player/repeat`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: {
                    state: state,
                    ...(deviceId && { device_id: deviceId })
                }
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to set repeat mode" };
    }
}

export async function setPlaybackVolume(volumePercent: number, deviceId?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        await axios.put(
            `${SPOTIFY_API_BASE}/me/player/volume`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: {
                    volume_percent: volumePercent,
                    ...(deviceId && { device_id: deviceId })
                }
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to set playback volume" };
    }
}

export async function togglePlaybackShuffle(state: boolean, deviceId?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        await axios.put(
            `${SPOTIFY_API_BASE}/me/player/shuffle`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: {
                    state: state,
                    ...(deviceId && { device_id: deviceId })
                }
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to toggle playback shuffle" };
    }
}

export async function getRecentlyPlayedTracks(limit?: number, after?: number, before?: number) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        const result = await axios.get(
            `${SPOTIFY_API_BASE}/me/player/recently-played`,
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: {
                    limit,
                    after,
                    before
                }
            }
        );
        return {
            items: result.data.items.map((item: any) => ({
                track: slimTrack(item.track),
                played_at: item.played_at,
                context: item.context
            }))
        };
    } catch (error) {
        return { success: false, error: "Failed to get recently played tracks" };
    }
}

export async function getUserQueue() {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        const result = await axios.get(
            `${SPOTIFY_API_BASE}/me/player/queue`,
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                }
            }
        );
        return {
            currently_playing: slimTrack(result.data.currently_playing),
            queue: result.data.queue.map(slimTrack)
        };
    } catch (error) {
        return { success: false, error: "Failed to get user queue" };
    }
}

export async function addItemToPlaybackQueue(uri: string, deviceId?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        await axios.post(
            `${SPOTIFY_API_BASE}/me/player/queue`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: {
                    uri: uri,
                    ...(deviceId && { device_id: deviceId })
                }
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to add item to playback queue" };
    }
}