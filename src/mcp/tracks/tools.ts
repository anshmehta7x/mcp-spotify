import { z } from "zod";
import {
    getTrack,
    getSeveralTracks,
    getSavedTracks,
    saveTracks,
    removeSavedTracks,
    checkSavedTracks
} from "./requests.js";

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
        try {
            const track = await getTrack(input.id, input.market);
            if (!track) {
                throw new Error("Failed to retrieve track");
            }
            return {
                content: [{ type: "text", text: JSON.stringify(track) } as const],
                structuredContent: track,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get track: ${errorMessage}`);
        }
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
        try {
            const tracks = await getSeveralTracks(input.ids, input.market);
            if (!tracks) {
                throw new Error("Failed to retrieve tracks");
            }
            return {
                content: [{ type: "text", text: JSON.stringify(tracks) } as const],
                structuredContent: tracks,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get several tracks: ${errorMessage}`);
        }
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
        try {
            const savedTracks = await getSavedTracks(input.market, input.limit, input.offset);
            if (!savedTracks) {
                throw new Error("Failed to retrieve saved tracks");
            }
            return {
                content: [{ type: "text", text: JSON.stringify(savedTracks) } as const],
                structuredContent: savedTracks,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get saved tracks: ${errorMessage}`);
        }
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
        try {
            const result = await saveTracks(input.ids);
            if (!result.success) {
                throw new Error(result.error || "Unknown save error");
            }
            const response = {
                message: `Successfully saved tracks: ${input.ids}`,
                action: "saved"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to save tracks: ${errorMessage}`);
        }
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
        try {
            const result = await removeSavedTracks(input.ids);
            if (!result.success) {
                throw new Error(result.error || "Unknown remove error");
            }
            const response = {
                message: `Successfully removed tracks: ${input.ids}`,
                action: "removed"
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to remove tracks: ${errorMessage}`);
        }
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
        try {
            const statuses = await checkSavedTracks(input.ids);
            const response = {
                ids: input.ids.split(',').map(id => id.trim()),
                statuses: statuses
            };
            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to check saved tracks: ${errorMessage}`);
        }
    }
};

export const trackTools = [
    getTrackTool,
    getSeveralTracksTool,
    getSavedTracksTool,
    saveTracksTool,
    removeSavedTracksTool,
    checkSavedTracksTool
];