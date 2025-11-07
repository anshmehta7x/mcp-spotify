import { AuthService } from "../../auth/authservice.js";
import axios from "axios";

const authservice = AuthService.getInstance();
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

const slimTrack = (item: any) => {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        artists: item.artists.map((artist: any) => artist.name),
        album: item.album.name,
        popularity: item.popularity,
        duration_ms: item.duration_ms,
        explicit: item.explicit,
        external_url: item.external_urls?.spotify,
        uri: item.uri
    };
};

export async function getTrack(id: string, market?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }
    try {
        const result = await axios.get(`${SPOTIFY_API_BASE}/tracks/${id}`, {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            },
            params: { market }
        });
        return slimTrack(result.data);
    } catch (error) {
        throw new Error("Failed to fetch track");
    }
}

export async function getSeveralTracks(ids: string, market?: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }
    try {
        const result = await axios.get(`${SPOTIFY_API_BASE}/tracks`, {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            },
            params: { ids, market }
        });

        return {
            tracks: result.data.tracks.map(slimTrack)
        };
    } catch (error) {
        throw new Error("Failed to fetch several tracks");
    }
}

export async function getSavedTracks(market?: string, limit?: number, offset?: number) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }
    try {
        const result = await axios.get(`${SPOTIFY_API_BASE}/me/tracks`, {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            },
            params: {
                market: market,
                limit: limit || 20,
                offset: offset || 0
            }
        });

        return {
            total: result.data.total,
            limit: result.data.limit,
            offset: result.data.offset,
            next: result.data.next,
            items: result.data.items.map((item: any) => ({
                added_at: item.added_at,
                track: slimTrack(item.track)
            }))
        };
    } catch (error) {
        throw new Error("Failed to fetch saved tracks");
    }
}

export async function saveTracks(ids: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    const idArray = ids.split(',').map(id => id.trim());

    try {
        await axios.put(
            `${SPOTIFY_API_BASE}/me/tracks`,
            { ids: idArray },
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to save tracks" };
    }
}

export async function removeSavedTracks(ids: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    const idArray = ids.split(',').map(id => id.trim());

    try {
        await axios.delete(
            `${SPOTIFY_API_BASE}/me/tracks`,
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                    "Content-Type": "application/json"
                },
                data: { ids: idArray }
            }
        );
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to remove tracks" };
    }
}

export async function checkSavedTracks(ids: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }
    try {
        const result = await axios.get(`${SPOTIFY_API_BASE}/me/tracks/contains`, {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            },
            params: { ids }
        });

        return result.data;
    } catch (error) {
        throw new Error("Failed to check saved tracks");
    }
}