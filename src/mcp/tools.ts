import { z } from "zod";
import {
    getPlaybackState,
    transferPlayback,
    getAvailableDevices,
    getCurrentlyPlayingTrack,
    startResumePlayback,
    pausePlayback,
    skipToNext,
    skipToPrevious,
    seekToPosition,
    setRepeatMode,
    setPlaybackVolume,
    togglePlaybackShuffle,
    getRecentlyPlayedTracks,
    getUserQueue,
    addItemToPlaybackQueue,
    getPlaylist,
    changePlaylistDetails,
    getPlaylistItems,
    updatePlaylistItems,
    addItemsToPlaylist,
    searchItems,
    getTrack,
    getSeveralTracks,
    getSavedTracks,
    saveTracks,
    removeSavedTracks,
    checkSavedTracks,
    getUserProfile,
    getCurrentUserProfile,
    getCurrentUserTopItems,
    followOrUnfollowPlaylist,
    getFollowedArtists,
    followArtistsOrUsers,
    unfollowArtistsOrUsers,
    checkIfUserFollows,
    checkIfCurrentUserFollowsPlaylist,
} from "./requests.js";
import { SpotifyUserProfile } from "../types/user.js";

const GetPlaybackStateInputRawShape = {
    market: z.string().optional(),
    additional_types: z.string().optional()
};
const GetPlaybackStateInputSchema = z.object(GetPlaybackStateInputRawShape);
type GetPlaybackStateInput = z.infer<typeof GetPlaybackStateInputSchema>;

const getPlaybackStateTool = {
    name: "get-playback-state",
    config: {
        title: "Get Playback State",
        description: "Get information about the user's current playback state, including track or episode, progress, and active device.",
        inputSchema: GetPlaybackStateInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetPlaybackStateInput) => {
        const playbackState = await getPlaybackState(input.market, input.additional_types);
        return {
            content: [{ type: "text", text: JSON.stringify(playbackState) } as const],
            structuredContent: playbackState,
        };
    }
};

const TransferPlaybackInputRawShape = {
    device_ids: z.string().min(1, "Device ID cannot be empty"),
    play: z.boolean().optional()
};
const TransferPlaybackInputSchema = z.object(TransferPlaybackInputRawShape);
type TransferPlaybackInput = z.infer<typeof TransferPlaybackInputSchema>;

const transferPlaybackTool = {
    name: "transfer-playback",
    config: {
        title: "Transfer Playback",
        description: "Transfer playback to a new device and optionally begin playback. Provide a device ID. Note: This only works for Spotify Premium users.",
        inputSchema: TransferPlaybackInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: TransferPlaybackInput) => {
        const deviceIds = input.device_ids.split(',').map(id => id.trim());
        await transferPlayback(deviceIds, input.play);
        const response = {
            message: `Successfully transferred playback to device: ${input.device_ids}`,
            action: "transferred"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const GetAvailableDevicesInputRawShape = {};
const GetAvailableDevicesInputSchema = z.object(GetAvailableDevicesInputRawShape);
type GetAvailableDevicesInput = z.infer<typeof GetAvailableDevicesInputSchema>;

const getAvailableDevicesTool = {
    name: "get-available-devices",
    config: {
        title: "Get Available Devices",
        description: "Get information about a user's available Spotify Connect devices. Some device models are not supported and will not be listed.",
        inputSchema: GetAvailableDevicesInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetAvailableDevicesInput) => {
        const devices = await getAvailableDevices();
        return {
            content: [{ type: "text", text: JSON.stringify(devices) } as const],
            structuredContent: devices,
        };
    }
};

const GetCurrentlyPlayingTrackInputRawShape = {
    market: z.string().optional(),
    additional_types: z.string().optional()
};
const GetCurrentlyPlayingTrackInputSchema = z.object(GetCurrentlyPlayingTrackInputRawShape);
type GetCurrentlyPlayingTrackInput = z.infer<typeof GetCurrentlyPlayingTrackInputSchema>;

const getCurrentlyPlayingTrackTool = {
    name: "get-currently-playing-track",
    config: {
        title: "Get Currently Playing Track",
        description: "Get the track or episode currently being played on the user's Spotify account.",
        inputSchema: GetCurrentlyPlayingTrackInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetCurrentlyPlayingTrackInput) => {
        const currentTrack = await getCurrentlyPlayingTrack(input.market, input.additional_types);
        return {
            content: [{ type: "text", text: JSON.stringify(currentTrack) } as const],
            structuredContent: currentTrack,
        };
    }
};

const StartResumePlaybackInputRawShape = {
    device_id: z.string().optional(),
    context_uri: z.string().optional(),
    uris: z.string().optional(),
    offset_position: z.number().optional(),
    offset_uri: z.string().optional(),
    position_ms: z.number().optional()
};
const StartResumePlaybackInputSchema = z.object(StartResumePlaybackInputRawShape);
type StartResumePlaybackInput = z.infer<typeof StartResumePlaybackInputSchema>;

const startResumePlaybackTool = {
    name: "start-resume-playback",
    config: {
        title: "Start/Resume Playback",
        description: "Start a new context or resume current playback on the user's active device. Provide context_uri (album/playlist URI) OR uris (comma-separated track URIs). Premium only.",
        inputSchema: StartResumePlaybackInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: StartResumePlaybackInput) => {
        const urisArray = input.uris ? input.uris.split(',').map(uri => uri.trim()) : undefined;
        const offset = input.offset_position !== undefined || input.offset_uri
            ? {
                position: input.offset_position,
                uri: input.offset_uri
            }
            : undefined;

        await startResumePlayback(
            input.device_id,
            input.context_uri,
            urisArray,
            offset,
            input.position_ms
        );

        const response = {
            message: "Successfully started/resumed playback",
            action: "play"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const PausePlaybackInputRawShape = {
    device_id: z.string().optional()
};
const PausePlaybackInputSchema = z.object(PausePlaybackInputRawShape);
type PausePlaybackInput = z.infer<typeof PausePlaybackInputSchema>;

const pausePlaybackTool = {
    name: "pause-playback",
    config: {
        title: "Pause Playback",
        description: "Pause playback on the user's account. Premium only.",
        inputSchema: PausePlaybackInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: PausePlaybackInput) => {
        await pausePlayback(input.device_id);
        const response = {
            message: "Successfully paused playback",
            action: "pause"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const SkipToNextInputRawShape = {
    device_id: z.string().optional()
};
const SkipToNextInputSchema = z.object(SkipToNextInputRawShape);
type SkipToNextInput = z.infer<typeof SkipToNextInputSchema>;

const skipToNextTool = {
    name: "skip-to-next",
    config: {
        title: "Skip To Next",
        description: "Skips to the next track in the user’s queue. Premium only.",
        inputSchema: SkipToNextInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: SkipToNextInput) => {
        await skipToNext(input.device_id);
        const response = {
            message: "Successfully skipped to the next track",
            action: "next"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const SkipToPreviousInputRawShape = {
    device_id: z.string().optional()
};
const SkipToPreviousInputSchema = z.object(SkipToPreviousInputRawShape);
type SkipToPreviousInput = z.infer<typeof SkipToPreviousInputSchema>;

const skipToPreviousTool = {
    name: "skip-to-previous",
    config: {
        title: "Skip To Previous",
        description: "Skips to the previous track in the user’s queue. Premium only.",
        inputSchema: SkipToPreviousInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: SkipToPreviousInput) => {
        await skipToPrevious(input.device_id);
        const response = {
            message: "Successfully skipped to the previous track",
            action: "previous"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const SeekToPositionInputRawShape = {
    position_ms: z.number().int().min(0, "Position in milliseconds must be a positive number."),
    device_id: z.string().optional()
};
const SeekToPositionInputSchema = z.object(SeekToPositionInputRawShape);
type SeekToPositionInput = z.infer<typeof SeekToPositionInputSchema>;

const seekToPositionTool = {
    name: "seek-to-position",
    config: {
        title: "Seek To Position",
        description: "Seeks to the given position in the user’s currently playing track. Premium only.",
        inputSchema: SeekToPositionInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: SeekToPositionInput) => {
        await seekToPosition(input.position_ms, input.device_id);
        const response = {
            message: `Successfully sought to position ${input.position_ms}ms`,
            action: "seek"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const SetRepeatModeInputRawShape = {
    state: z.enum(["track", "context", "off"], {
        errorMap: (issue, ctx) => {
            if (issue.code === z.ZodIssueCode.invalid_enum_value) {
                return { message: "State must be 'track', 'context', or 'off'." };
            }
            return { message: ctx.defaultError };
        },
    }),
    device_id: z.string().optional()
};
const SetRepeatModeInputSchema = z.object(SetRepeatModeInputRawShape);
type SetRepeatModeInput = z.infer<typeof SetRepeatModeInputSchema>;

const setRepeatModeTool = {
    name: "set-repeat-mode",
    config: {
        title: "Set Repeat Mode",
        description: "Set the repeat mode for the user's playback. Premium only.",
        inputSchema: SetRepeatModeInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: SetRepeatModeInput) => {
        await setRepeatMode(input.state, input.device_id);
        const response = {
            message: `Successfully set repeat mode to ${input.state}`,
            action: "set_repeat_mode"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const SetPlaybackVolumeInputRawShape = {
    volume_percent: z.number().int().min(0).max(100, "Volume percent must be between 0 and 100 inclusive."),
    device_id: z.string().optional()
};
const SetPlaybackVolumeInputSchema = z.object(SetPlaybackVolumeInputRawShape);
type SetPlaybackVolumeInput = z.infer<typeof SetPlaybackVolumeInputSchema>;

const setPlaybackVolumeTool = {
    name: "set-playback-volume",
    config: {
        title: "Set Playback Volume",
        description: "Set the volume for the user’s current playback device. Premium only.",
        inputSchema: SetPlaybackVolumeInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: SetPlaybackVolumeInput) => {
        await setPlaybackVolume(input.volume_percent, input.device_id);
        const response = {
            message: `Successfully set playback volume to ${input.volume_percent}%`,
            action: "set_volume"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const TogglePlaybackShuffleInputRawShape = {
    state: z.boolean(),
    device_id: z.string().optional()
};
const TogglePlaybackShuffleInputSchema = z.object(TogglePlaybackShuffleInputRawShape);
type TogglePlaybackShuffleInput = z.infer<typeof TogglePlaybackShuffleInputSchema>;

const togglePlaybackShuffleTool = {
    name: "toggle-playback-shuffle",
    config: {
        title: "Toggle Playback Shuffle",
        description: "Toggle shuffle on or off for user’s playback. Premium only.",
        inputSchema: TogglePlaybackShuffleInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: TogglePlaybackShuffleInput) => {
        await togglePlaybackShuffle(input.state, input.device_id);
        const response = {
            message: `Successfully set shuffle to ${input.state ? "on" : "off"}`,
            action: "toggle_shuffle"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const GetRecentlyPlayedTracksInputRawShape = {
    limit: z.number().int().min(1).max(50).optional(),
    after: z.number().int().optional(),
    before: z.number().int().optional()
};
const GetRecentlyPlayedTracksInputSchema = z.object(GetRecentlyPlayedTracksInputRawShape);
type GetRecentlyPlayedTracksInput = z.infer<typeof GetRecentlyPlayedTracksInputSchema>;

const getRecentlyPlayedTracksTool = {
    name: "get-recently-played-tracks",
    config: {
        title: "Get Recently Played Tracks",
        description: "Get tracks from the current user's recently played tracks. Note: Currently doesn't support podcast episodes.",
        inputSchema: GetRecentlyPlayedTracksInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetRecentlyPlayedTracksInput) => {
        const result = await getRecentlyPlayedTracks(input.limit, input.after, input.before);
        return {
            content: [{ type: "text", text: JSON.stringify(result) } as const],
            structuredContent: result,
        };
    }
};

const GetUserQueueInputRawShape = {};
const GetUserQueueInputSchema = z.object(GetUserQueueInputRawShape);
type GetUserQueueInput = z.infer<typeof GetUserQueueInputSchema>;

const getUserQueueTool = {
    name: "get-user-queue",
    config: {
        title: "Get User's Queue",
        description: "Get the list of objects that make up the user's queue.",
        inputSchema: GetUserQueueInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetUserQueueInput) => {
        const result = await getUserQueue();
        return {
            content: [{ type: "text", text: JSON.stringify(result) } as const],
            structuredContent: result,
        };
    }
};

const AddItemToPlaybackQueueInputRawShape = {
    uri: z.string().min(1, "URI cannot be empty"),
    device_id: z.string().optional()
};
const AddItemToPlaybackQueueInputSchema = z.object(AddItemToPlaybackQueueInputRawShape);
type AddItemToPlaybackQueueInput = z.infer<typeof AddItemToPlaybackQueueInputSchema>;

const addItemToPlaybackQueueTool = {
    name: "add-item-to-playback-queue",
    config: {
        title: "Add Item to Playback Queue",
        description: "Add an item to be played next in the user's current playback queue. Premium only.",
        inputSchema: AddItemToPlaybackQueueInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: AddItemToPlaybackQueueInput) => {
        await addItemToPlaybackQueue(input.uri, input.device_id);
        const response = {
            message: `Successfully added ${input.uri} to the playback queue`,
            action: "add_to_queue"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const GetPlaylistInputRawShape = {
    playlist_id: z.string().min(1, "Playlist ID cannot be empty"),
    market: z.string().optional(),
    fields: z.string().optional(),
    additional_types: z.string().optional()
};
const GetPlaylistInputSchema = z.object(GetPlaylistInputRawShape);
type GetPlaylistInput = z.infer<typeof GetPlaylistInputSchema>;

const getPlaylistTool = {
    name: "get-playlist",
    config: {
        title: "Get Playlist",
        description: "Get a playlist owned by a Spotify user. Returns playlist details including tracks, owner information, and metadata. Use the 'fields' parameter to filter specific fields if needed.",
        inputSchema: GetPlaylistInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetPlaylistInput) => {
        const playlist = await getPlaylist(
            input.playlist_id,
            input.market,
            input.fields,
            input.additional_types
        );
        return {
            content: [{ type: "text", text: JSON.stringify(playlist) } as const],
            structuredContent: playlist,
        };
    }
};

const ChangePlaylistDetailsInputRawShape = {
    playlist_id: z.string().min(1, "Playlist ID cannot be empty"),
    name: z.string().optional(),
    description: z.string().optional(),
    public: z.boolean().optional(),
    collaborative: z.boolean().optional()
};
const ChangePlaylistDetailsInputSchema = z.object(ChangePlaylistDetailsInputRawShape);
type ChangePlaylistDetailsInput = z.infer<typeof ChangePlaylistDetailsInputSchema>;

const changePlaylistDetailsTool = {
    name: "change-playlist-details",
    config: {
        title: "Change Playlist Details",
        description: "Change a playlist's name and public/private state. The user must own the playlist. Note: You can only set collaborative to true on non-public playlists.",
        inputSchema: ChangePlaylistDetailsInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: ChangePlaylistDetailsInput) => {
        await changePlaylistDetails(
            input.playlist_id,
            input.name,
            input.description,
            input.public,
            input.collaborative
        );
        const response = {
            message: "Successfully updated playlist details",
            action: "update_playlist"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const GetPlaylistItemsInputRawShape = {
    playlist_id: z.string().min(1, "Playlist ID cannot be empty"),
    market: z.string().optional(),
    fields: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional(),
    offset: z.number().int().min(0).optional(),
    additional_types: z.string().optional()
};
const GetPlaylistItemsInputSchema = z.object(GetPlaylistItemsInputRawShape);
type GetPlaylistItemsInput = z.infer<typeof GetPlaylistItemsInputSchema>;

const getPlaylistItemsTool = {
    name: "get-playlist-items",
    config: {
        title: "Get Playlist Items",
        description: "Get full details of the items (tracks/episodes) of a playlist owned by a Spotify user. Supports pagination with limit and offset parameters.",
        inputSchema: GetPlaylistItemsInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetPlaylistItemsInput) => {
        const items = await getPlaylistItems(
            input.playlist_id,
            input.market,
            input.fields,
            input.limit,
            input.offset,
            input.additional_types
        );
        return {
            content: [{ type: "text", text: JSON.stringify(items) } as const],
            structuredContent: items,
        };
    }
};

const UpdatePlaylistItemsInputRawShape = {
    playlist_id: z.string().min(1, "Playlist ID cannot be empty"),
    uris: z.string().optional(),
    range_start: z.number().int().min(0).optional(),
    insert_before: z.number().int().min(0).optional(),
    range_length: z.number().int().min(1).optional(),
    snapshot_id: z.string().optional()
};
const UpdatePlaylistItemsInputSchema = z.object(UpdatePlaylistItemsInputRawShape);
type UpdatePlaylistItemsInput = z.infer<typeof UpdatePlaylistItemsInputSchema>;

const updatePlaylistItemsTool = {
    name: "update-playlist-items",
    config: {
        title: "Update Playlist Items",
        description: "Either reorder or replace items in a playlist. To reorder: provide range_start, insert_before, range_length, and snapshot_id. To replace: provide uris (comma-separated). Note: Replace and reorder are mutually exclusive operations. Maximum 100 items.",
        inputSchema: UpdatePlaylistItemsInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: UpdatePlaylistItemsInput) => {
        const urisArray = input.uris ? input.uris.split(',').map(uri => uri.trim()) : undefined;
        const result = await updatePlaylistItems(
            input.playlist_id,
            urisArray,
            input.range_start,
            input.insert_before,
            input.range_length,
            input.snapshot_id
        );
        const response = {
            message: "Successfully updated playlist items",
            action: "update_items",
            snapshot_id: result.snapshot_id
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const AddItemsToPlaylistInputRawShape = {
    playlist_id: z.string().min(1, "Playlist ID cannot be empty"),
    uris: z.string().min(1, "URIs cannot be empty"),
    position: z.number().int().min(0).optional()
};
const AddItemsToPlaylistInputSchema = z.object(AddItemsToPlaylistInputRawShape);
type AddItemsToPlaylistInput = z.infer<typeof AddItemsToPlaylistInputSchema>;

const addItemsToPlaylistTool = {
    name: "add-items-to-playlist",
    config: {
        title: "Add Items to Playlist",
        description: "Add one or more items (tracks/episodes) to a user's playlist. Provide comma-separated URIs. Maximum 100 items. Use position parameter to insert at specific index (0-based), or omit to append to end.",
        inputSchema: AddItemsToPlaylistInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: AddItemsToPlaylistInput) => {
        const urisArray = input.uris.split(',').map(uri => uri.trim());
        if (urisArray.length > 100) {
            throw new Error("Maximum 100 items can be added in one request");
        }
        const result = await addItemsToPlaylist(
            input.playlist_id,
            urisArray,
            input.position
        );
        const response = {
            message: `Successfully added ${urisArray.length} item(s) to playlist`,
            action: "add_items",
            snapshot_id: result.snapshot_id
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const SearchItemsInputRawShape = {
    q: z.string().min(1, "Search query cannot be empty"),
    type: z.string().min(1, "Type cannot be empty"),
    market: z.string().optional(),
    limit: z.number().int().min(1).max(50).optional(),
    offset: z.number().int().min(0).optional(),
    include_external: z.enum(["audio"]).optional()
};
const SearchItemsInputSchema = z.object(SearchItemsInputRawShape);
type SearchItemsInput = z.infer<typeof SearchItemsInputSchema>;

const searchItemsTool = {
    name: "search-items",
    config: {
        title: "Search for Items",
        description: "Get Spotify catalog information about albums, artists, playlists, tracks, shows, episodes or audiobooks that match a keyword string. Provide a query (q) and type (album, artist, playlist, track, show, episode, audiobook).",
        inputSchema: SearchItemsInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: SearchItemsInput) => {
        const result = await searchItems(
            input.q,
            input.type,
            input.market,
            input.limit,
            input.offset,
            input.include_external
        );
        return {
            content: [{ type: "text", text: JSON.stringify(result) } as const],
            structuredContent: result,
        };
    }
};

const GetTrackInputRawShape = {
    id: z.string().min(1, "Track ID cannot be empty"),
    market: z.string().optional()
};
const GetTrackInputSchema = z.object(GetTrackInputRawShape);
type GetTrackInput = z.infer<typeof GetTrackInputSchema>;

const getTrackTool = {
    name: "get-track",
    config: {
        title: "Get Track",
        description: "Get Spotify catalog information (name, artists, album, popularity, etc.) for a single track by its unique Spotify ID.",
        inputSchema: GetTrackInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetTrackInput) => {
        const track = await getTrack(input.id, input.market);
        return {
            content: [{ type: "text", text: JSON.stringify(track) } as const],
            structuredContent: track,
        };
    }
};

const GetSeveralTracksInputRawShape = {
    ids: z.string().min(1, "Track IDs cannot be empty. Provide a comma-separated list."),
    market: z.string().optional()
};
const GetSeveralTracksInputSchema = z.object(GetSeveralTracksInputRawShape);
type GetSeveralTracksInput = z.infer<typeof GetSeveralTracksInputSchema>;

const getSeveralTracksTool = {
    name: "get-several-tracks",
    config: {
        title: "Get Several Tracks",
        description: "Get Spotify catalog information for multiple tracks. Provide a comma-separated list of Spotify IDs (max 50).",
        inputSchema: GetSeveralTracksInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetSeveralTracksInput) => {
        const tracks = await getSeveralTracks(input.ids, input.market);
        return {
            content: [{ type: "text", text: JSON.stringify(tracks) } as const],
            structuredContent: tracks,
        };
    }
};

const GetSavedTracksInputRawShape = {
    market: z.string().optional(),
    limit: z.number().min(1).max(50).optional(),
    offset: z.number().min(0).optional()
};
const GetSavedTracksInputSchema = z.object(GetSavedTracksInputRawShape);
type GetSavedTracksInput = z.infer<typeof GetSavedTracksInputSchema>;

const getSavedTracksTool = {
    name: "get-saved-tracks",
    config: {
        title: "Get User's Saved Tracks",
        description: "Get a paginated list of the songs saved in the current user's 'Your Music' library.",
        inputSchema: GetSavedTracksInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetSavedTracksInput) => {
        const savedTracks = await getSavedTracks(input.market, input.limit, input.offset);
        return {
            content: [{ type: "text", text: JSON.stringify(savedTracks) } as const],
            structuredContent: savedTracks,
        };
    }
};

const SaveTracksInputRawShape = {
    ids: z.string().min(1, "Track IDs cannot be empty. Provide a comma-separated list.")
};
const SaveTracksInputSchema = z.object(SaveTracksInputRawShape);
type SaveTracksInput = z.infer<typeof SaveTracksInputSchema>;

const saveTracksTool = {
    name: "save-tracks-for-current-user",
    config: {
        title: "Save Tracks for Current User",
        description: "Save one or more tracks to the current user's 'Your Music' library. Provide a comma-separated list of IDs (max 50).",
        inputSchema: SaveTracksInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: SaveTracksInput) => {
        await saveTracks(input.ids);
        const response = {
            message: `Successfully saved tracks: ${input.ids}`,
            action: "saved"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const RemoveSavedTracksInputRawShape = {
    ids: z.string().min(1, "Track IDs cannot be empty. Provide a comma-separated list.")
};
const RemoveSavedTracksInputSchema = z.object(RemoveSavedTracksInputRawShape);
type RemoveSavedTracksInput = z.infer<typeof RemoveSavedTracksInputSchema>;

const removeSavedTracksTool = {
    name: "remove-users-saved-tracks",
    config: {
        title: "Remove User's Saved Tracks",
        description: "Remove one or more tracks from the current user's 'Your Music' library. Provide a comma-separated list of IDs (max 50).",
        inputSchema: RemoveSavedTracksInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: RemoveSavedTracksInput) => {
        await removeSavedTracks(input.ids);
        const response = {
            message: `Successfully removed tracks: ${input.ids}`,
            action: "removed"
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const CheckSavedTracksInputRawShape = {
    ids: z.string().min(1, "Track IDs cannot be empty. Provide a comma-separated list.")
};
const CheckSavedTracksInputSchema = z.object(CheckSavedTracksInputRawShape);
type CheckSavedTracksInput = z.infer<typeof CheckSavedTracksInputSchema>;

const checkSavedTracksTool = {
    name: "check-users-saved-tracks",
    config: {
        title: "Check User's Saved Tracks",
        description: "Check if one or more tracks are already saved in the user's library. Returns an array of booleans. Provide comma-separated IDs (max 50).",
        inputSchema: CheckSavedTracksInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: CheckSavedTracksInput) => {
        const statuses = await checkSavedTracks(input.ids);
        const response = {
            ids: input.ids.split(',').map(id => id.trim()),
            statuses: statuses
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response,
        };
    }
};

const FollowOrUnfollowPlaylistInputRawShape = {
    playlistId: z.string().min(1, "Playlist ID cannot be empty"),
    follow: z.boolean().optional()  // default follow = true
};

const FollowOrUnfollowPlaylistInputSchema = z.object(FollowOrUnfollowPlaylistInputRawShape);

type FollowOrUnfollowPlaylistInput = z.infer<typeof FollowOrUnfollowPlaylistInputSchema>;

const followOrUnfollowPlaylistTool = {
    name: "follow-or-unfollow-playlist",
    config: {
        title: "Follow or Unfollow Playlist",
        description: "Follow or unfollow a Spotify playlist to User's profile by its ID.",
        inputSchema: FollowOrUnfollowPlaylistInputRawShape,
        authenticationRequired: true
    },

    handler: async (input: FollowOrUnfollowPlaylistInput) => {
        const follow = input.follow ?? true; // default = follow
        await followOrUnfollowPlaylist(input.playlistId, follow);

        const response = {
            message: follow
                ? `Successfully followed playlist ${input.playlistId}`
                : `Successfully unfollowed playlist ${input.playlistId}`,
            playlistId: input.playlistId,
            action: follow ? "followed" : "unfollowed"
        };

        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response
        };
    }
};


const UserProfileInputRawShape = {
    userId: z.string().min(1, "User ID cannot be empty"),
};

const UserProfileInputSchema = z.object(UserProfileInputRawShape);

type UserProfileInput = z.infer<typeof UserProfileInputSchema>;

const getUserProfileTool = {
    name: "get-user-profile",
    config: {
        title: "Get User Profile",
        description: "Get detailed profile information about a Spotify user by their user ID (including the user's username, country, email, explicit_content, followers, images, url, uri).",
        inputSchema: UserProfileInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: UserProfileInput) => {
        const profile = await getUserProfile(input.userId);
        return {
            content: [{ type: "text", text: JSON.stringify(profile) } as const],
            structuredContent: profile,
        };
    }
}



const TopItemsInputRawShape = {
    type: z.enum(["tracks", "artists"]),
    time_range: z.enum(["medium_term", "short_term", "long_term"]).optional(),
    limit: z.number().optional(),
    offset: z.number().optional()
};

const TopItemsInputSchema = z.object(TopItemsInputRawShape);

type TopItemsInput = z.infer<typeof TopItemsInputSchema>;

const getCurrentUserTopItemsTool = {
    name: "get-current-user-top-items",
    config:
    {
        title: "Get Current User Top Items",
        description: "(REQUIRES AUTHENTICATION) Get the current user's top tracks or artists based on calculated affinity. You can specify the type (tracks or artists), time range (short_term, medium_term, long_term), limit (1-50), and offset for pagination.",
        inputSchema: TopItemsInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: TopItemsInput) => {
        const result = await getCurrentUserTopItems(
            input.type,
            input.time_range,
            input.limit,
            input.offset
        );
        return {
            content: [{ type: "text", text: JSON.stringify(result) } as const],
            structuredContent: result,
        };
    }
}

const getCurrentUserProfileTool = {
    name: "get-current-user-profile",
    config:
    {
        title: "Get Current User Profile",
        description:
            "(REQUIRES AUTHENTICATION) Get detailed profile information about the current user (including the current user's username, country, email, explicit_content,followers,images,url,uri",
        inputSchema: {},
        authenticationRequired: true
    },
    handler: async () => {
        const profile: SpotifyUserProfile = await getCurrentUserProfile() as SpotifyUserProfile;
        return {
            content: [{ type: "text", text: JSON.stringify(profile) } as const],
            structuredContent: profile,
        };
    },
}

const GetFollowedArtistsInputRawShape = {
    type: z.literal("artist"),
    after: z.string().optional(),
    limit: z.number().min(1).max(50).optional()
};

const GetFollowedArtistsInputSchema = z.object(GetFollowedArtistsInputRawShape);

type GetFollowedArtistsInput = z.infer<typeof GetFollowedArtistsInputSchema>;

const getFollowedArtistsTool = {
    name: "get-followed-artists",
    config: {
        title: "Get Followed Artists",
        description: "Get the current user's followed artists. Returns artist information including name, genres, popularity, followers, and images.",
        inputSchema: GetFollowedArtistsInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: GetFollowedArtistsInput) => {
        const result = await getFollowedArtists(
            input.type,
            input.after,
            input.limit
        );
        return {
            content: [{ type: "text", text: JSON.stringify(result) } as const],
            structuredContent: result
        };
    }
};

// Follow Artists or Users Tool
const FollowArtistsOrUsersInputRawShape = {
    type: z.enum(["artist", "user"]),
    ids: z.string().min(1, "IDs cannot be empty")
};

const FollowArtistsOrUsersInputSchema = z.object(FollowArtistsOrUsersInputRawShape);

type FollowArtistsOrUsersInput = z.infer<typeof FollowArtistsOrUsersInputSchema>;

const followArtistsOrUsersTool = {
    name: "follow-artists-or-users",
    config: {
        title: "Follow Artists or Users",
        description: "Add the current user as a follower of one or more artists or Spotify users. Provide a comma-separated list of IDs (max 50).",
        inputSchema: FollowArtistsOrUsersInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: FollowArtistsOrUsersInput) => {
        await followArtistsOrUsers(input.type, input.ids);
        const response = {
            message: `Successfully followed ${input.type}(s)`,
            type: input.type,
            ids: input.ids
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response
        };
    }
};

// Unfollow Artists or Users Tool
const unfollowArtistsOrUsersTool = {
    name: "unfollow-artists-or-users",
    config: {
        title: "Unfollow Artists or Users",
        description: "Remove the current user as a follower of one or more artists or Spotify users. Provide a comma-separated list of IDs (max 50).",
        inputSchema: FollowArtistsOrUsersInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: FollowArtistsOrUsersInput) => {
        await unfollowArtistsOrUsers(input.type, input.ids);
        const response = {
            message: `Successfully unfollowed ${input.type}(s)`,
            type: input.type,
            ids: input.ids
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response
        };
    }
};

// Check If User Follows Artists or Users Tool
const CheckIfUserFollowsInputRawShape = {
    type: z.enum(["artist", "user"]),
    ids: z.string().min(1, "IDs cannot be empty")
};

const CheckIfUserFollowsInputSchema = z.object(CheckIfUserFollowsInputRawShape);

type CheckIfUserFollowsInput = z.infer<typeof CheckIfUserFollowsInputSchema>;

const checkIfUserFollowsTool = {
    name: "check-if-user-follows",
    config: {
        title: "Check If User Follows Artists or Users",
        description: "Check to see if the current user is following one or more artists or other Spotify users. Returns an array of booleans. Provide comma-separated IDs (max 50).",
        inputSchema: CheckIfUserFollowsInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: CheckIfUserFollowsInput) => {
        const result = await checkIfUserFollows(input.type, input.ids);
        const response = {
            type: input.type,
            ids: input.ids,
            statuses: result
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response
        };
    }
};

// Check If Current User Follows Playlist Tool
const CheckIfCurrentUserFollowsPlaylistInputRawShape = {
    playlistId: z.string().min(1, "Playlist ID cannot be empty"),
    ids: z.string().min(1, "User IDs cannot be empty")
};

const CheckIfCurrentUserFollowsPlaylistInputSchema = z.object(
    CheckIfCurrentUserFollowsPlaylistInputRawShape
);

type CheckIfCurrentUserFollowsPlaylistInput = z.infer<
    typeof CheckIfCurrentUserFollowsPlaylistInputSchema
>;

const checkIfCurrentUserFollowsPlaylistTool = {
    name: "check-if-current-user-follows-playlist",
    config: {
        title: "Check If Current User Follows Playlist",
        description: "Check to see if the current user is following a specified playlist. Returns a boolean value.",
        inputSchema: CheckIfCurrentUserFollowsPlaylistInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: CheckIfCurrentUserFollowsPlaylistInput) => {
        const result = await checkIfCurrentUserFollowsPlaylist(input.playlistId, input.ids);
        const response = {
            playlistId: input.playlistId,
            isFollowing: result
        };
        return {
            content: [{ type: "text", text: JSON.stringify(response) } as const],
            structuredContent: response
        };
    }
};

export const allTools = [
    getPlaybackStateTool,
    transferPlaybackTool,
    getAvailableDevicesTool,
    getCurrentlyPlayingTrackTool,
    startResumePlaybackTool,
    pausePlaybackTool,
    skipToNextTool,
    skipToPreviousTool,
    seekToPositionTool,
    setRepeatModeTool,
    setPlaybackVolumeTool,
    togglePlaybackShuffleTool,
    getRecentlyPlayedTracksTool,
    getUserQueueTool,
    addItemToPlaybackQueueTool,
    getPlaylistTool,
    changePlaylistDetailsTool,
    getPlaylistItemsTool,
    updatePlaylistItemsTool,
    addItemsToPlaylistTool,
    searchItemsTool,
    getTrackTool,
    getSeveralTracksTool,
    getSavedTracksTool,
    saveTracksTool,
    removeSavedTracksTool,
    checkSavedTracksTool,
    getUserProfileTool,
    getCurrentUserProfileTool,
    getCurrentUserTopItemsTool,
    followOrUnfollowPlaylistTool,
    getFollowedArtistsTool,
    followArtistsOrUsersTool,
    unfollowArtistsOrUsersTool,
    checkIfUserFollowsTool,
    checkIfCurrentUserFollowsPlaylistTool
];