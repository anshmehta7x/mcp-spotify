import { z } from "zod";
import { searchItems } from "./requests.js";

const SearchInputRawShape = {
    q: z.string().min(1, "Query cannot be empty"),
    type: z.string().min(1, "Type cannot be empty. Comma-separated list of types (e.g., 'track,artist')."),
    market: z.string().optional(),
    limit: z.number().min(1).max(50).optional(),
    offset: z.number().min(0).max(1000).optional(),
    include_external: z.enum(["audio"]).optional()
};

const SearchInputSchema = z.object(SearchInputRawShape);

type SearchInput = z.infer<typeof SearchInputSchema>;

const searchForItemTool = {
    name: "search-for-item",
    config: {
        title: "Search for Item",
        description: "Search Spotify for albums, artists, playlists, tracks, shows, episodes, or audiobooks using a keyword string. Specify types as a comma-separated list (e.g., 'track,artist').",
        inputSchema: SearchInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: SearchInput) => {
        try {
            const results = await searchItems(
                input.q,
                input.type,
                input.market,
                input.limit,
                input.offset,
                input.include_external
            );

            if (!results) {
                throw new Error("Failed to retrieve search results");
            }

            return {
                content: [{ type: "text", text: JSON.stringify(results) } as const],
                structuredContent: results,
            };
        }
        catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
            throw new Error(`Failed to perform search: ${errorMessage}`);
        }
    }
};

export const searchTools = [
    searchForItemTool
];