import { AuthService } from "../auth/authservice.js";
import axios from "axios";

const authservice = AuthService.getInstance();

export async function getCurrentUserProfile() {
    if (!authservice.isAuthenticated) {
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
