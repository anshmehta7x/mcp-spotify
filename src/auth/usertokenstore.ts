export class UserTokenStore {
    private static instance: UserTokenStore;

    private constructor() {}

    public static getInstance(): UserTokenStore {
        if (!UserTokenStore.instance) {
            UserTokenStore.instance = new UserTokenStore();
        }
        return UserTokenStore.instance;
    }

    // spotify API has TTL of 3600 seconds (1 hour) for access tokens
    private sessionToToken: Map<string, { accessToken: string, creation: Date }> = new Map();

    public setToken(sessionId: string, accessToken: string) {
        this.sessionToToken.set(sessionId, { accessToken: accessToken, creation: new Date() });
    }

    public getToken(sessionId: string): string | null {
        const tokenData = this.sessionToToken.get(sessionId);
        if (!tokenData) {
            return null;
        }

        const currentTime = new Date();
        const tokenAgeInSeconds: number = (currentTime.getTime() - tokenData.creation.getTime()) / 1000;

        if (tokenAgeInSeconds > 3600) { // 3600s = 1 hour
            this.sessionToToken.delete(sessionId); // Token is expired, remove it
            return null;
        }
        return tokenData.accessToken;
    }

    public isAuthenticated(sessionId: string): boolean {
        return this.getToken(sessionId) !== null;
    }
}