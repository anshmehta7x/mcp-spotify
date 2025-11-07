import {SpotifyUserProfile} from "../../types/user.js";
import {
    getCurrentUserProfile, getCurrentUserTopItems, getUserProfile, followOrUnfollowPlaylist,
    checkIfCurrentUserFollowsPlaylist, checkIfUserFollows, unfollowArtistsOrUsers, followArtistsOrUsers,
    getFollowedArtists
} from "./requests.js";
import { z } from "zod";

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
        try {
            const follow = input.follow ?? true; // default = follow
            const result = await followOrUnfollowPlaylist(input.playlistId, follow);

            if (!result.success) {
                throw new Error(result.error || "Unknown follow/unfollow error");
            }

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
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";

            throw new Error(`Failed to follow/unfollow playlist: ${errorMessage}`);
        }
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
        try {
            const profile = await getUserProfile(input.userId);
            if (!profile) {
                throw new Error("Failed to retrieve user profile");
            }

            return {
                content: [{ type: "text", text: JSON.stringify(profile) } as const],
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
        try {
            const result = await getFollowedArtists(
                input.type,
                input.after,
                input.limit
            );

            if (!result) {
                throw new Error("Failed to retrieve followed artists");
            }

            return {
                content: [{ type: "text", text: JSON.stringify(result) } as const],
                structuredContent: result
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to get followed artists: ${errorMessage}`);
        }
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
        try {
            const result = await followArtistsOrUsers(input.type, input.ids);

            if (!result.success) {
                throw new Error(result.error || "Unknown follow error");
            }

            const response = {
                message: `Successfully followed ${input.type}(s)`,
                type: input.type,
                ids: input.ids
            };

            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to follow ${input.type}(s): ${errorMessage}`);
        }
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
        try {
            const result = await unfollowArtistsOrUsers(input.type, input.ids);

            if (!result.success) {
                throw new Error(result.error || "Unknown unfollow error");
            }

            const response = {
                message: `Successfully unfollowed ${input.type}(s)`,
                type: input.type,
                ids: input.ids
            };

            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to unfollow ${input.type}(s): ${errorMessage}`);
        }
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
        try {
            const result = await checkIfUserFollows(input.type, input.ids);

            if (!result) {
                throw new Error("Failed to check follow status");
            }
            const response = {
                type: input.type,
                ids: input.ids,
                statuses: result   // <-- return as a field
            };

            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to check follow status: ${errorMessage}`);
        }
    }
};

// Check If Current User Follows Playlist Tool
const CheckIfCurrentUserFollowsPlaylistInputRawShape = {
    playlistId: z.string().min(1, "Playlist ID cannot be empty")
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
        try {
            const result = await checkIfCurrentUserFollowsPlaylist(input.playlistId);

            if (result === null || result === undefined) {
                throw new Error("Failed to check playlist follow status");
            }

            const response = {
                playlistId: input.playlistId,
                isFollowing: result
            };

            return {
                content: [{ type: "text", text: JSON.stringify(response) } as const],
                structuredContent: response
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error occurred";
            throw new Error(`Failed to check playlist follow status: ${errorMessage}`);
        }
    }
};

export const userTools = [
    getCurrentUserProfileTool,
    getCurrentUserTopItemsTool,
    getUserProfileTool,
    followOrUnfollowPlaylistTool,
    getFollowedArtistsTool,
    followArtistsOrUsersTool,
    unfollowArtistsOrUsersTool,
    checkIfUserFollowsTool,
    checkIfCurrentUserFollowsPlaylistTool
];