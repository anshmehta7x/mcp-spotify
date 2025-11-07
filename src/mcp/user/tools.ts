import {SpotifyUserProfile} from "../../types/user.js";
import {getCurrentUserProfile, getCurrentUserTopItems, getUserProfile} from "./requests.js";

import { z } from "zod";

const UserProfileInputRawShape = {
    userId: z.string().min(1, "User ID cannot be empty"),
};

const UserProfileInputSchema = z.object(UserProfileInputRawShape);

type UserProfileInput = z.infer<typeof UserProfileInputSchema>;

export const getUserProfileTool = {
    name: "get-user-profile",
    config: {
        title: "Get User Profile",
        description: "Get detailed profile information about a Spotify user by their user ID (including the user's username, country, email, explicit_content, followers, images, url, uri).",
        inputSchema: UserProfileInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: UserProfileInput) => {
        try {
            const profile = await getUserProfile(input.userId);
            if (!profile) {
                throw new Error("Failed to retrieve user profile");
            }

            return {
                content: [{ type: "text" as const, text: JSON.stringify(profile) }],
                structuredContent: profile,
            };
        }
        catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
            throw new Error(`Failed to get user profile: ${errorMessage}`);
        }
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

export const getCurrentUserTopItemsTool = {
    name: "get-current-user-top-items",
    config:
    {
        title: "Get Current User Top Items",
        description: "(REQUIRES AUTHENTICATION) Get the current user's top tracks or artists based on calculated affinity. You can specify the type (tracks or artists), time range (short_term, medium_term, long_term), limit (1-50), and offset for pagination.",
        inputSchema: TopItemsInputRawShape,
        authenticationRequired: true
    },
    handler: async (input: TopItemsInput) => {
        try {
            const result = await getCurrentUserTopItems(
                input.type,
                input.time_range,
                input.limit,
                input.offset
            );
            if (!result) {
                throw new Error("Failed to retrieve user's top items");
            }

            return {
                content: [{ type: "text", text: JSON.stringify(result) } as const],
                structuredContent: result,
            };
        }
        catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";
            throw new Error(`Failed to get user's top items: ${errorMessage}`);

        }
    }
}

export const getCurrentUserProfileTool = {
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
            try {

                const profile: SpotifyUserProfile = await getCurrentUserProfile();
                if (!profile) {
                    throw new Error("Failed to retrieve user profile");
                }

                return {
                    content: [{ type: "text", text: JSON.stringify(profile) } as const],
                    structuredContent: profile,
                };
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred";
                throw new Error(`Failed to get user profile: ${errorMessage}`);
            }
    },
}