import { z } from "zod";
import {
    getPlaylist,
    changePlaylistDetails,
    getPlaylistItems,
    updatePlaylistItems,
    addItemsToPlaylist
} from "./requests.js";

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
        try {
            const playlist = await getPlaylist(
                input.playlist_id,
                input.market,
                input.fields,
                input.additional_types
            );

            if (!playlist) {
                throw new Error("Failed to retrieve playlist");
            }

            return {
                content: [{ type: "text", text: JSON.stringify(playlist) } as const],
                structuredContent: playlist,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get playlist: ${errorMessage}`);
        }
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
        try {
            const result = await changePlaylistDetails(
                input.playlist_id,
                input.name,
                input.description,
                input.public,
                input.collaborative
            );

            if (!result.success) {
                throw new Error(result.error || "Unknown error");
            }

            const response = {
                message: "Successfully updated playlist details",
                action: "update_playlist"
            };

            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to change playlist details: ${errorMessage}`);
        }
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
        try {
            const items = await getPlaylistItems(
                input.playlist_id,
                input.market,
                input.fields,
                input.limit,
                input.offset,
                input.additional_types
            );

            if (!items) {
                throw new Error("Failed to retrieve playlist items");
            }

            return {
                content: [{ type: "text", text: JSON.stringify(items) } as const],
                structuredContent: items,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get playlist items: ${errorMessage}`);
        }
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
        try {
            const urisArray = input.uris ? input.uris.split(',').map(uri => uri.trim()) : undefined;

            const result = await updatePlaylistItems(
                input.playlist_id,
                urisArray,
                input.range_start,
                input.insert_before,
                input.range_length,
                input.snapshot_id
            );

            if (!result.success) {
                throw new Error(result.error || "Unknown error");
            }

            const response = {
                message: "Successfully updated playlist items",
                action: "update_items",
                snapshot_id: result.snapshot_id
            };

            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to update playlist items: ${errorMessage}`);
        }
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
        try {
            const urisArray = input.uris.split(',').map(uri => uri.trim());

            if (urisArray.length > 100) {
                throw new Error("Maximum 100 items can be added in one request");
            }

            const result = await addItemsToPlaylist(
                input.playlist_id,
                urisArray,
                input.position
            );

            if (!result.success) {
                throw new Error(result.error || "Unknown error");
            }

            const response = {
                message: `Successfully added ${urisArray.length} item(s) to playlist`,
                action: "add_items",
                snapshot_id: result.snapshot_id
            };

            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to add items to playlist: ${errorMessage}`);
        }
    }
};

// Update the export at the bottom
export const playlistTools = [
    getPlaylistTool,
    changePlaylistDetailsTool,
    getPlaylistItemsTool,
    updatePlaylistItemsTool,
    addItemsToPlaylistTool
];


