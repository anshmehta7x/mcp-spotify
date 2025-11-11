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
    addItemToPlaybackQueue
} from "./requests.js";

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
        try {
            const playbackState = await getPlaybackState(input.market, input.additional_types);
            if (!playbackState) {
                throw new Error("Failed to retrieve playback state");
            }
            return {
                content: [{ type: "text", text: JSON.stringify(playbackState) } as const],
                structuredContent: playbackState,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get playback state: ${errorMessage}`);
        }
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
        try {
            // Split comma-separated device IDs, but note that only one is supported
            const deviceIds = input.device_ids.split(',').map(id => id.trim());

            const result = await transferPlayback(deviceIds, input.play);
            if (!result.success) {
                throw new Error(result.error || "Unknown transfer error");
            }
            const response = {
                message: `Successfully transferred playback to device: ${input.device_ids}`,
                action: "transferred"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to transfer playback: ${errorMessage}`);
        }
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
        try {
            const devices = await getAvailableDevices();
            if (!devices) {
                throw new Error("Failed to retrieve available devices");
            }
            return {
                content: [{ type: "text", text: JSON.stringify(devices) } as const],
                structuredContent: devices,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get available devices: ${errorMessage}`);
        }
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
        try {
            const currentTrack = await getCurrentlyPlayingTrack(input.market, input.additional_types);
            if (!currentTrack) {
                throw new Error("Failed to retrieve currently playing track");
            }
            return {
                content: [{ type: "text", text: JSON.stringify(currentTrack) } as const],
                structuredContent: currentTrack,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get currently playing track: ${errorMessage}`);
        }
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
        try {
            const urisArray = input.uris ? input.uris.split(',').map(uri => uri.trim()) : undefined;

            const offset = input.offset_position !== undefined || input.offset_uri
                ? {
                    position: input.offset_position,
                    uri: input.offset_uri
                }
                : undefined;

            const result = await startResumePlayback(
                input.device_id,
                input.context_uri,
                urisArray,
                offset,
                input.position_ms
            );

            if (!result.success) {
                throw new Error(result.error || "Unknown playback error");
            }

            const response = {
                message: "Successfully started/resumed playback",
                action: "play"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to start/resume playback: ${errorMessage}`);
        }
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
        try {
            const result = await pausePlayback(input.device_id);
            if (!result.success) {
                throw new Error(result.error || "Unknown pause error");
            }
            const response = {
                message: "Successfully paused playback",
                action: "pause"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to pause playback: ${errorMessage}`);
        }
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
        try {
            const result = await skipToNext(input.device_id);
            if (!result.success) {
                throw new Error(result.error || "Unknown skip to next error");
            }
            const response = {
                message: "Successfully skipped to the next track",
                action: "next"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to skip to next track: ${errorMessage}`);
        }
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
        try {
            const result = await skipToPrevious(input.device_id);
            if (!result.success) {
                throw new Error(result.error || "Unknown skip to previous error");
            }
            const response = {
                message: "Successfully skipped to the previous track",
                action: "previous"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to skip to previous track: ${errorMessage}`);
        }
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
        try {
            const result = await seekToPosition(input.position_ms, input.device_id);
            if (!result.success) {
                throw new Error(result.error || "Unknown seek to position error");
            }
            const response = {
                message: `Successfully sought to position ${input.position_ms}ms`,
                action: "seek"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to seek to position: ${errorMessage}`);
        }
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
        try {
            const result = await setRepeatMode(input.state, input.device_id);
            if (!result.success) {
                throw new Error(result.error || "Unknown set repeat mode error");
            }
            const response = {
                message: `Successfully set repeat mode to ${input.state}`,
                action: "set_repeat_mode"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to set repeat mode: ${errorMessage}`);
        }
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
        try {
            const result = await setPlaybackVolume(input.volume_percent, input.device_id);
            if (!result.success) {
                throw new Error(result.error || "Unknown set playback volume error");
            }
            const response = {
                message: `Successfully set playback volume to ${input.volume_percent}%`,
                action: "set_volume"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to set playback volume: ${errorMessage}`);
        }
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
        try {
            const result = await togglePlaybackShuffle(input.state, input.device_id);
            if (!result.success) {
                throw new Error(result.error || "Unknown toggle playback shuffle error");
            }
            const response = {
                message: `Successfully set shuffle to ${input.state ? "on" : "off"}`,
                action: "toggle_shuffle"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to toggle playback shuffle: ${errorMessage}`);
        }
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
        try {
            const result = await getRecentlyPlayedTracks(input.limit, input.after, input.before);
            if (!result.items) {
                throw new Error(result.error || "Unknown get recently played tracks error");
            }
            return {
                content: [{ type: "text", text: JSON.stringify(result) } as const],
                structuredContent: result,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get recently played tracks: ${errorMessage}`);
        }
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
        try {
            const result = await getUserQueue();
            if (!result.queue) {
                throw new Error(result.error || "Unknown get user queue error");
            }
            return {
                content: [{ type: "text", text: JSON.stringify(result) } as const],
                structuredContent: result,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get user queue: ${errorMessage}`);
        }
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
        try {
            const result = await addItemToPlaybackQueue(input.uri, input.device_id);
            if (!result.success) {
                throw new Error(result.error || "Unknown add item to playback queue error");
            }
            const response = {
                message: `Successfully added ${input.uri} to the playback queue`,
                action: "add_to_queue"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to add item to playback queue: ${errorMessage}`);
        }
    }
};

export const playerTools = [
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
    addItemToPlaybackQueueTool
];