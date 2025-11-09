import { z } from "zod";
import {
    getPlaybackState,
    transferPlayback,
    getAvailableDevices,
    getCurrentlyPlayingTrack,
    startResumePlayback,
    pausePlayback
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

export const playerTools = [
    getPlaybackStateTool,
    transferPlaybackTool,
    getAvailableDevicesTool,
    getCurrentlyPlayingTrackTool,
    startResumePlaybackTool,
    pausePlaybackTool
];