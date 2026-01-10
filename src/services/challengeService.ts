import { Challenge } from "../data/challenges";

export class ChallengeService {
    private static readonly API_URL = "http://localhost:3000/idelab/challenges";

    /**
     * Fetches the list of challenges from the API.
     * Throws an error if the request fails.
     */
    public static async getChallenges(): Promise<Challenge[]> {
        try {
            const response = await fetch(this.API_URL);

            if (!response.ok) {
                throw new Error(
                    `API request failed with status ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();
            return data as Challenge[];
        } catch (error) {
            console.error("Failed to fetch challenges:", error);
            throw error; // Re-throw to be handled by the caller (UI)
        }
    }

    /**
     * Fetches a specific challenge by ID.
     * Currently fetches all and finds the specific one as the API endpoint suggests a collection.
     */
    public static async getChallenge(
        id: string
    ): Promise<Challenge | undefined> {
        try {
            const challenges = await this.getChallenges();
            return challenges.find((c) => c.id === id);
        } catch (error) {
            console.error(`Failed to fetch challenge ${id}:`, error);
            throw error;
        }
    }
}
