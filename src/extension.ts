import * as vscode from "vscode";
import { IDELabViewProvider } from "./ideLabViewProvider";

export function activate(context: vscode.ExtensionContext) {
    const provider = new IDELabViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            IDELabViewProvider.viewType,
            provider
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("ide-lab.helloWorld", () => {
            vscode.window.showInformationMessage("Hello World from IDE-Lab!");
        })
    );
}

export function deactivate() {}
