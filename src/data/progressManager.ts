import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export interface ChallengeStatus {
    completed: boolean;
    inProgress: boolean;
    code: string;
}

export interface UserProgress {
    [challengeId: string]: ChallengeStatus;
}

export class ProgressManager {
    private getProgressFilePath(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return undefined;
        }
        return path.join(
            workspaceFolders[0].uri.fsPath,
            ".vscode",
            "IDE-Lab.json"
        );
    }

    private async ensureProgressFileExists(): Promise<string | undefined> {
        const filePath = this.getProgressFilePath();
        if (!filePath) {
            return undefined;
        }

        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }

        if (!fs.existsSync(filePath)) {
            await fs.promises.writeFile(filePath, JSON.stringify({}, null, 4));
        }

        return filePath;
    }

    public async getProgress(
        challengeId: string
    ): Promise<ChallengeStatus | undefined> {
        const allProgress = await this.getAllProgress();
        return allProgress[challengeId];
    }

    public async getAllProgress(): Promise<UserProgress> {
        const filePath = await this.ensureProgressFileExists();
        if (!filePath) {
            return {};
        }

        try {
            const content = await fs.promises.readFile(filePath, "utf8");
            return JSON.parse(content) as UserProgress;
        } catch (error) {
            console.error("Error reading progress file:", error);
            return {};
        }
    }

    public async updateProgress(
        challengeId: string,
        status: Partial<ChallengeStatus>
    ): Promise<void> {
        const filePath = await this.ensureProgressFileExists();
        if (!filePath) {
            return;
        }

        const allProgress = await this.getAllProgress();
        const currentStatus = allProgress[challengeId] || {
            completed: false,
            inProgress: false,
            code: "",
        };

        allProgress[challengeId] = {
            ...currentStatus,
            ...status,
        };

        await fs.promises.writeFile(
            filePath,
            JSON.stringify(allProgress, null, 4)
        );
    }
}
