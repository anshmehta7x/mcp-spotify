import { AuthService } from "../../auth/authservice.js";
import axios from "axios";

const authservice = AuthService.getInstance();
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

const slimPlaylistOwner = (owner: any) => {
    if (!owner) return null;
    return {
        id: owner.id,
        type: owner.type,
        uri: owner.uri,
        display_name: owner.display_name,
        external_url: owner.external_urls?.spotify
    };
};

const slimImage = (image: any) => {
    if (!image) return null;
    return {
        url: image.url,
        height: image.height,
        width: image.width
    };
};

const slimArtist = (artist: any) => {
    if (!artist) return null;
    return {
        id: artist.id,
        name: artist.name,
        type: artist.type,
        uri: artist.uri,
        external_url: artist.external_urls?.spotify
    };
};

const slimAlbum = (album: any) => {
    if (!album) return null;
    return {
        id: album.id,
        name: album.name,
        album_type: album.album_type,
        total_tracks: album.total_tracks,
        release_date: album.release_date,
        images: album.images?.map(slimImage) || [],
        artists: album.artists?.map(slimArtist) || [],
        external_url: album.external_urls?.spotify,
        uri: album.uri
    };
};

const slimTrack = (track: any) => {
    if (!track) return null;
    return {
        id: track.id,
        name: track.name,
        artists: track.artists?.map(slimArtist) || [],
        album: slimAlbum(track.album),
        duration_ms: track.duration_ms,
        explicit: track.explicit,
        is_playable: track.is_playable,
        popularity: track.popularity,
        track_number: track.track_number,
        disc_number: track.disc_number,
        external_url: track.external_urls?.spotify,
        uri: track.uri,
        is_local: track.is_local
    };
};

const slimPlaylistTrack = (item: any) => {
    if (!item) return null;
    return {
        added_at: item.added_at,
        added_by: slimPlaylistOwner(item.added_by),
        is_local: item.is_local,
        track: slimTrack(item.track)
    };
};

const slimPlaylist = (data: any) => {
    if (!data) return null;
    return {
        id: data.id,
        name: data.name,
        description: data.description,
        collaborative: data.collaborative,
        public: data.public,
        owner: slimPlaylistOwner(data.owner),
        images: data.images?.map(slimImage) || [],
        snapshot_id: data.snapshot_id,
        tracks: {
            href: data.tracks?.href,
            total: data.tracks?.total,
            limit: data.tracks?.limit,
            offset: data.tracks?.offset,
            next: data.tracks?.next,
            previous: data.tracks?.previous,
            items: data.tracks?.items?.map(slimPlaylistTrack) || []
        },
        external_url: data.external_urls?.spotify,
        uri: data.uri,
        type: data.type
    };
};

export async function getPlaylist(
    playlistId: string,
    market?: string,
    fields?: string,
    additionalTypes?: string
) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        const result = await axios.get(
            `${SPOTIFY_API_BASE}/playlists/${playlistId}`,
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: {
                    market,
                    fields,
                    additional_types: additionalTypes
                }
            }
        );

        return slimPlaylist(result.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error("Playlist not found");
            }
            if (error.response?.status === 401) {
                throw new Error("Invalid or expired access token");
            }
        }
        throw new Error("Failed to fetch playlist");
    }
}

export async function changePlaylistDetails(
    playlistId: string,
    name?: string,
    description?: string,
    publicPlaylist?: boolean,
    collaborative?: boolean
) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    const body: any = {};
    if (name !== undefined) body.name = name;
    if (description !== undefined) body.description = description;
    if (publicPlaylist !== undefined) body.public = publicPlaylist;
    if (collaborative !== undefined) body.collaborative = collaborative;

    try {
        await axios.put(
            `${SPOTIFY_API_BASE}/playlists/${playlistId}`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                    "Content-Type": "application/json"
                }
            }
        );
        return { success: true };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 403) {
                throw new Error("You don't have permission to modify this playlist");
            }
            if (error.response?.status === 404) {
                throw new Error("Playlist not found");
            }
        }
        return { success: false, error: "Failed to change playlist details" };
    }
}

export async function getPlaylistItems(
    playlistId: string,
    market?: string,
    fields?: string,
    limit?: number,
    offset?: number,
    additionalTypes?: string
) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        const result = await axios.get(
            `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                },
                params: {
                    market,
                    fields,
                    limit,
                    offset,
                    additional_types: additionalTypes
                }
            }
        );

        return {
            href: result.data.href,
            total: result.data.total,
            limit: result.data.limit,
            offset: result.data.offset,
            next: result.data.next,
            previous: result.data.previous,
            items: result.data.items?.map(slimPlaylistTrack) || []
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error("Playlist not found");
            }
        }
        throw new Error("Failed to fetch playlist items");
    }
}

export async function updatePlaylistItems(
    playlistId: string,
    uris?: string[],
    rangeStart?: number,
    insertBefore?: number,
    rangeLength?: number,
    snapshotId?: string
) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    const body: any = {};
    const params: any = {};

    // Replace operation (uris provided)
    if (uris && uris.length > 0) {
        body.uris = uris;
        // Can also be passed as query param
        params.uris = uris.join(',');
    }

    // Reorder operation (range parameters provided)
    if (rangeStart !== undefined) {
        body.range_start = rangeStart;
    }
    if (insertBefore !== undefined) {
        body.insert_before = insertBefore;
    }
    if (rangeLength !== undefined) {
        body.range_length = rangeLength;
    }
    if (snapshotId) {
        body.snapshot_id = snapshotId;
    }

    try {
        const result = await axios.put(
            `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                    "Content-Type": "application/json"
                },
                params: uris ? params : undefined
            }
        );

        return {
            success: true,
            snapshot_id: result.data.snapshot_id
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 403) {
                throw new Error("You don't have permission to modify this playlist");
            }
            if (error.response?.status === 404) {
                throw new Error("Playlist not found");
            }
        }
        return { success: false, error: "Failed to update playlist items" };
    }
}

export async function addItemsToPlaylist(
    playlistId: string,
    uris: string[],
    position?: number
) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    const body: any = {
        uris: uris
    };

    if (position !== undefined) {
        body.position = position;
    }

    const params: any = {};
    if (position !== undefined) {
        params.position = position;
    }

    try {
        const result = await axios.post(
            `${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${authservice.getAccessToken()}`,
                    "Content-Type": "application/json"
                },
                params: Object.keys(params).length > 0 ? params : undefined
            }
        );

        return {
            success: true,
            snapshot_id: result.data.snapshot_id
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 403) {
                throw new Error("You don't have permission to modify this playlist");
            }
            if (error.response?.status === 404) {
                throw new Error("Playlist not found");
            }
        }
        return { success: false, error: "Failed to add items to playlist" };
    }
}