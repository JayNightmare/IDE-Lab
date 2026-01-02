import * as vscode from "vscode";
import { challenges } from "./data/challenges";
import { ProgressManager } from "./data/progressManager";

export class IDELabViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "ide-lab.sidebar";
    private _view?: vscode.WebviewView;
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
                    const progress =
                        await this.progressManager.getAllProgress();
                    webviewView.webview.postMessage({
                        type: "challenges",
                        challenges,
                        progress,
                    });
                    break;
                }
                case "getChallenge": {
                    const challenge = challenges.find((c) => c.id === data.id);
                    const progress = await this.progressManager.getProgress(
                        data.id
                    );
                    if (challenge) {
                        // Mark as opened/in-progress if not already handled outside
                        await this.progressManager.updateProgress(data.id, {
                            inProgress: true,
                        });
                        webviewView.webview.postMessage({
                            type: "showChallenge",
                            challenge,
                            progress,
                        });
                    }
                    break;
                }
                case "saveProgress": {
                    await this.progressManager.updateProgress(data.id, {
                        code: data.code,
                        inProgress: true,
                    });
                    break;
                }
                case "runCode": {
                    const challenge = challenges.find(
                        (c) => c.id === data.challengeId
                    );
                    if (!challenge) return;

                    // Save code first
                    await this.progressManager.updateProgress(
                        data.challengeId,
                        { code: data.code }
                    );

                    // Execute code (Primitive validation)
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
                    } else {
                        vscode.window.showErrorMessage(
                            `Test Failed: ${result.message}`
                        );
                    }

                    webviewView.webview.postMessage({
                        type: "executionResult",
                        success: result.success,
                        message: result.message,
                        challengeId: data.challengeId,
                    });
                    break;
                }
            }
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
            // WARNING: This is a simple eval-based runner for demonstration/MVP.
            // In a real production environment, this should be sandboxed.
            // We wrap it in a function context to avoid polluting global scope slightly.

            for (const testCase of challenge.testCases) {
                const { input, expected } = testCase;
                // Construct a function runner
                // We expect the user to define the function name as specified in starterCode
                // e.g. twoSum(nums, target)

                // Extract function name from starter code
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

                // Create a runner string
                // We basically eval the user code, then call the function with input
                const runnerScript = `
                    ${userCode}
                    return ${functionName}(...${JSON.stringify(input)});
                `;

                const run = new Function(runnerScript);
                let result = run();

                // Compare result with expected
                // Simple JSON stringify comparison for arrays/objects
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

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, "media", "styles.css")
        );
        // Use a nonce to only allow specific scripts to be run
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
