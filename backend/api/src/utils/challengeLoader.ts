import * as fs from "fs";
import * as path from "path";
import { Challenge } from "../types";

export async function loadChallenges(): Promise<Challenge[]> {
    const challengesDir = path.join(__dirname, "../data/challenges");
    const challenges: Challenge[] = [];

    async function scanDirectory(dir: string) {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                await scanDirectory(fullPath);
            } else if (
                entry.isFile() &&
                (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))
            ) {
                // Import the module dynamically
                // We use require here to be compatible with commonjs which ts-node uses by default
                // or dynamic import() if ESM. Given tsconfig is commonjs, require is safer/easier.
                try {
                    const module = require(fullPath);
                    // Assume the module exports the challenge object as a named export matching the filename or just finds the first exported object that looks like a challenge
                    // Or simpler: assume specific export names or just taking all exports

                    // Strategy: iterate exports and find valid Challenge objects
                    for (const key in module) {
                        const exportItem = module[key];
                        if (isValidChallenge(exportItem)) {
                            challenges.push(exportItem);
                        }
                    }
                } catch (err) {
                    console.error(
                        `Failed to load challenge from ${fullPath}:`,
                        err
                    );
                }
            }
        }
    }

    await scanDirectory(challengesDir);
    return challenges;
}

function isValidChallenge(obj: any): obj is Challenge {
    return (
        obj &&
        typeof obj.id === "string" &&
        typeof obj.title === "string" &&
        (obj.difficulty === "easy" ||
            obj.difficulty === "medium" ||
            obj.difficulty === "hard") &&
        Array.isArray(obj.testCases)
    );
}
