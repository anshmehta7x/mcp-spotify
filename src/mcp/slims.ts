export const slimDevice = (device: any) => {
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

export const slimTrack = (item: any) => {
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

export const slimPlaybackState = (data: any) => {
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

export const slimPlaylistOwner = (owner: any) => {
    if (!owner) return null;
    return {
        id: owner.id,
        type: owner.type,
        uri: owner.uri,
        display_name: owner.display_name,
        external_url: owner.external_urls?.spotify
    };
};

export const slimImage = (image: any) => {
    if (!image) return null;
    return {
        url: image.url,
        height: image.height,
        width: image.width
    };
};

export const slimArtist = (artist: any) => {
    if (!artist) return null;
    return {
        id: artist.id,
        name: artist.name,
        type: artist.type,
        uri: artist.uri,
        external_url: artist.external_urls?.spotify
    };
};

export const slimAlbum = (album: any) => {
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

export const slimPlaylistTrack = (item: any) => {
    if (!item) return null;
    return {
        added_at: item.added_at,
        added_by: slimPlaylistOwner(item.added_by),
        is_local: item.is_local,
        track: slimTrack(item.track)
    };
};

export const slimPlaylist = (data: any) => {
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

export const slimShow = (item: any) => {
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

export const slimEpisode = (item: any) => {
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

export const slimAudiobook = (item: any) => {
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

export const processPagingObject = (pagingObject: any, slimFunction: (item: any) => any) => {
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
