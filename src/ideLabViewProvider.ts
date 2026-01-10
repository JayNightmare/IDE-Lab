import * as vscode from "vscode";
import { Challenge } from "./data/challenges";
import { ChallengeService } from "./services/challengeService";
import { ProgressManager } from "./data/progressManager";

export class IDELabViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "ide-lab.sidebar";
    private _view?: vscode.WebviewView;
    private _editorPanel?: vscode.WebviewPanel;
    private progressManager: ProgressManager;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this.progressManager = new ProgressManager();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "getChallenges": {
                    await this.fetchAndSendChallenges(webviewView);
                    break;
                }
                case "refresh": {
                    // Handle refresh request
                    await this.fetchAndSendChallenges(webviewView);
                    break;
                }
                case "getChallenge": {
                    try {
                        const challenge = await ChallengeService.getChallenge(
                            data.id
                        );
                        if (challenge) {
                            const progress =
                                await this.progressManager.getProgress(data.id);
                            // Mark as opened/in-progress if not already handled outside
                            await this.progressManager.updateProgress(data.id, {
                                inProgress: true,
                            });
                            webviewView.webview.postMessage({
                                type: "showChallenge",
                                challenge,
                                progress,
                            });
                        } else {
                            vscode.window.showErrorMessage(
                                "Challenge not found"
                            );
                        }
                    } catch (error) {
                        vscode.window.showErrorMessage(
                            "Failed to load challenge: " + error
                        );
                    }
                    break;
                }
                case "openEditor": {
                    const challenge = await ChallengeService.getChallenge(
                        data.id
                    );
                    if (challenge) {
                        this.createOrShowEditorPanel(challenge);
                    }
                    break;
                }
            }
        });
    }

    private async fetchAndSendChallenges(webviewView: vscode.WebviewView) {
        try {
            const challenges = await ChallengeService.getChallenges();
            const progress = await this.progressManager.getAllProgress();
            webviewView.webview.postMessage({
                type: "challenges",
                challenges,
                progress,
            });
        } catch (error) {
            webviewView.webview.postMessage({
                type: "error",
                message:
                    "Failed to load challenges. Please check your internet connection.",
            });
        }
    }

    private async createOrShowEditorPanel(challenge: any) {
        const column = vscode.window.activeTextEditor
            ? vscode.ViewColumn.Beside
            : vscode.ViewColumn.One;

        // If we already have a panel, show it.
        // Note: In a real app we might want one panel per challenge or a tabbed system.
        // For now, we'll reuse the single panel or replace it.
        if (this._editorPanel) {
            this._editorPanel.reveal(column);
            // Update the content for the new challenge
            this._updateEditorPanel(challenge);
            return;
        }

        // Create a new panel
        this._editorPanel = vscode.window.createWebviewPanel(
            "ideLabEditor",
            `IDE Lab: ${challenge.title}`,
            column,
            {
                enableScripts: true,
                localResourceRoots: [this._extensionUri],
                retainContextWhenHidden: true,
            }
        );

        this._editorPanel.webview.html = this._getHtmlForEditor(
            this._editorPanel.webview,
            challenge
        );

        // Listen for disposal
        this._editorPanel.onDidDispose(
            () => {
                this._editorPanel = undefined;
            },
            null,
            []
        );

        // Handle messages from the editor panel
        this._editorPanel.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case "saveProgress": {
                    await this.progressManager.updateProgress(data.id, {
                        code: data.code,
                        inProgress: true,
                    });
                    break;
                }
                case "runCode": {
                    const challenge = await ChallengeService.getChallenge(
                        data.challengeId
                    );
                    // eslint-disable-next-line curly
                    if (!challenge) return;

                    // Save code first
                    await this.progressManager.updateProgress(
                        data.challengeId,
                        { code: data.code }
                    );

                    // Execute code
                    const result = this.validateCode(data.code, challenge);

                    if (result.success) {
                        await this.progressManager.updateProgress(
                            data.challengeId,
                            { completed: true, inProgress: false }
                        );
                        vscode.window.showInformationMessage(
                            `Challenge "${
                                challenge.title
                            }" Completed! +${this.getPoints(
                                challenge.difficulty
                            )} points`
                        );

                        // Update sidebar progress too
                        if (this._view) {
                            // Re-fetch to ensure sync (optional, but safe)
                            this.fetchAndSendChallenges(this._view);
                        }
                    } else {
                        vscode.window.showErrorMessage(
                            `Test Failed: ${result.message}`
                        );
                    }

                    this._editorPanel?.webview.postMessage({
                        type: "executionResult",
                        success: result.success,
                        message: result.message,
                        challengeId: data.challengeId,
                    });
                    break;
                }
            }
        });

        // Initialize state
        this._updateEditorPanel(challenge);
    }

    private async _updateEditorPanel(challenge: any) {
        // eslint-disable-next-line curly
        if (!this._editorPanel) return;

        this._editorPanel.title = `IDE Lab: ${challenge.title}`;
        const progress = await this.progressManager.getProgress(challenge.id);

        this._editorPanel.webview.postMessage({
            type: "init",
            challenge: challenge,
            progress: progress,
        });
    }

    private getPoints(difficulty: string): number {
        switch (difficulty) {
            case "easy":
                return 1;
            case "medium":
                return 3;
            case "hard":
                return 5;
            default:
                return 0;
        }
    }

    private validateCode(
        userCode: string,
        challenge: any
    ): { success: boolean; message: string } {
        try {
            for (const testCase of challenge.testCases) {
                const { input, expected } = testCase;

                const functionNameMatch =
                    challenge.starterCode.match(/function\s+(\w+)/);
                const functionName = functionNameMatch
                    ? functionNameMatch[1]
                    : null;

                if (!functionName) {
                    return {
                        success: false,
                        message: "Could not identify function name.",
                    };
                }

                const runnerScript = `
                    ${userCode}
                    return ${functionName}(...${JSON.stringify(input)});
                `;

                const run = new Function(runnerScript);
                let result = run();

                if (JSON.stringify(result) !== JSON.stringify(expected)) {
                    return {
                        success: false,
                        message: `Input: ${JSON.stringify(
                            input
                        )}\nExpected: ${JSON.stringify(
                            expected
                        )}\nGot: ${JSON.stringify(result)}`,
                    };
                }
            }

            return { success: true, message: "All test cases passed!" };
        } catch (e: any) {
            return { success: false, message: e.toString() };
        }
    }

    // Sidebar HTML
    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "styles.css")
        );
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>IDE Lab</title>
            </head>
            <body>
                <div id="app"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    // Editor Panel HTML
    private _getHtmlForEditor(webview: vscode.Webview, challenge: any) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "editor.js")
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "styles.css")
        );
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>IDE Lab Editor</title>
            </head>
            <body>
                <div id="app"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
