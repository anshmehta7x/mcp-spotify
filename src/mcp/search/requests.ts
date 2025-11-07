import {AuthService} from "../../auth/authservice.js";
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

const slimAlbum = (item: any) => {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        artists: item.artists.map((a: any) => a.name),
        total_tracks: item.total_tracks,
        release_date: item.release_date,
        external_url: item.external_urls?.spotify,
        uri: item.uri
    };
};

const slimArtist = (item: any) => {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        genres: item.genres,
        popularity: item.popularity,
        followers: item.followers?.total,
        external_url: item.external_urls?.spotify,
        uri: item.uri
    };
};

const slimPlaylist = (item: any) => {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        description: item.description,
        owner: item.owner?.display_name,
        external_url: item.external_urls?.spotify,
        uri: item.uri
    };
};

const slimShow = (item: any) => {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        publisher: item.publisher,
        description: item.description,
        explicit: item.explicit,
        external_url: item.external_urls?.spotify,
        uri: item.uri
    };
};

const slimEpisode = (item: any) => {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        description: item.description,
        duration_ms: item.duration_ms,
        release_date: item.release_date,
        explicit: item.explicit,
        external_url: item.external_urls?.spotify,
        uri: item.uri
    };
};

const slimAudiobook = (item: any) => {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        authors: item.authors.map((a: any) => a.name),
        narrators: item.narrators.map((n: any) => n.name),
        publisher: item.publisher,
        description: item.description,
        explicit: item.explicit,
        external_url: item.external_urls?.spotify,
        uri: item.uri
    };
};

const processPagingObject = (pagingObject: any, slimFunction: (item: any) => any) => {
    if (!pagingObject) {
        return undefined;
    }
    return {
        total: pagingObject.total,
        limit: pagingObject.limit,
        offset: pagingObject.offset,
        next: pagingObject.next,
        items: pagingObject.items.map(slimFunction)
    };
};

export async function searchItems(
    q: string,
    type: string,
    market?: string,
    limit?: number,
    offset?: number,
    include_external?: "audio"
) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        const result = await axios.get(`${SPOTIFY_API_BASE}/search`, {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            },
            params: {
                q,
                type,
                market,
                limit: limit || 20,
                offset: offset || 0,
                include_external
            }
        });

        const data = result.data;

        return {
            tracks: processPagingObject(data.tracks, slimTrack),
            artists: processPagingObject(data.artists, slimArtist),
            albums: processPagingObject(data.albums, slimAlbum),
            playlists: processPagingObject(data.playlists, slimPlaylist),
            shows: processPagingObject(data.shows, slimShow),
            episodes: processPagingObject(data.episodes, slimEpisode),
            audiobooks: processPagingObject(data.audiobooks, slimAudiobook)
        };

    } catch (error) {
        throw new Error("Failed to perform search");
    }
}