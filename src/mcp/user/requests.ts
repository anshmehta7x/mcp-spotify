import {AuthService} from "../../auth/authservice.js";
import axios from "axios";

const authservice = AuthService.getInstance();

export async function getUserProfile(userId: string) {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }
    try {
        const result = await axios.get(`https://api.spotify.com/v1/users/${userId}`, {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            },
        });
        return result.data;
    } catch (error) {
        throw new Error("Failed to fetch user profile");
    }
}

export async function getCurrentUserProfile() {
    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }
    try {
        const result = await axios.get("https://api.spotify.com/v1/me", {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            },
        });
        return result.data;
    } catch (error) {
        throw new Error("Failed to fetch user profile");
    }
}

export async function getCurrentUserTopItems(
    type: "tracks" | "artists",
    time_range?: "medium_term" | "short_term" | "long_term",
    limit?: number,
    offset?: number
) {
    const finalLimit = (limit && limit >= 1 && limit <= 50) ? limit : 20;

    if (!authservice.isAuthenticated()) {
        throw new Error("User is not authenticated");
    }

    try {
        const result = await axios.get(`https://api.spotify.com/v1/me/top/${type}`, {
            headers: {
                Authorization: `Bearer ${authservice.getAccessToken()}`,
            },
            params: {
                time_range: time_range || "medium_term",
                limit: finalLimit,
                offset: offset || 0
            }
        });

        if (type === "tracks") {
            return {
                total: result.data.total,
                limit: result.data.limit,
                offset: result.data.offset,
                next: result.data.next,
                items: result.data.items.map((item: any) => ({
                    name: item.name,
                    artists: item.artists.map((artist: any) => artist.name),
                    album: item.album.name,
                    popularity: item.popularity,
                    preview_url: item.preview_url,
                    external_url: item.external_urls?.spotify
                }))
            };
        }
        else if (type === "artists") {
            return {
                total: result.data.total,
                limit: result.data.limit,
                offset: result.data.offset,
                next: result.data.next,
                items: result.data.items.map((artist: any) => ({
                    name: artist.name,
                    popularity: artist.popularity,
                    followers: artist.followers?.total,
                    genres: artist.genres,
                    external_url: artist.external_urls?.spotify,
                    image: artist.images?.[0]?.url || null
                }))
            };
        }

        return result.data;

    } catch (error) {
        throw new Error("Failed to fetch user top items");
    }
}
