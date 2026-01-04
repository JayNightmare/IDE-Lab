const vscode = acquireVsCodeApi();

// State
let state = {
    challenge: null,
    progress: null,
};

// DOM Elements
const app = document.getElementById("app");

// Initialization
window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
        case "init":
            state.challenge = message.challenge;
            state.progress = message.progress;
            render();
            break;
        case "executionResult":
            const statusEl = document.getElementById("status-message");
            if (statusEl) {
                statusEl.innerText = message.message;
                statusEl.className = message.success ? "success" : "error";
            }
            break;
    }
});

function render() {
    app.innerHTML = "";
    if (!state.challenge) return;

    const c = state.challenge;
    const p = state.progress;

    const wrapper = document.createElement("div");
    wrapper.className = "editor-view";

    wrapper.innerHTML = `
        <header>
            <h2>${c.title} <span class="badge ${c.difficulty}">${
        c.difficulty
    }</span></h2>
            <div class="actions">
                <button id="run-btn">Run Code</button>
            </div>
        </header>

        <div class="code-editor-container full-height">
            <textarea id="code-input" spellcheck="false">${
                p?.code || c.starterCode
            }</textarea>
        </div>
        
        <div id="status-message"></div>
    `;

    app.appendChild(wrapper);

    // Event Listeners
    document.getElementById("run-btn").onclick = () => {
        const code = document.getElementById("code-input").value;
        vscode.postMessage({ type: "runCode", challengeId: c.id, code });
    };

    const textarea = document.getElementById("code-input");

    // Auto-save logic
    textarea.oninput = (e) => {
        vscode.postMessage({
            type: "saveProgress",
            id: c.id,
            code: e.target.value,
        });
    };

    // Auto-indentation and Tab support
    textarea.addEventListener("keydown", function (e) {
        if (e.key === "Tab") {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;

            // Insert 4 spaces
            this.value =
                this.value.substring(0, start) +
                "    " +
                this.value.substring(end);

            // Put cursor at right position
            this.selectionStart = this.selectionEnd = start + 4;
        } else if (e.key === "Enter") {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            const value = this.value;

            // Find start of the current line
            const lastNewLine = value.lastIndexOf("\n", start - 1);
            const currentLineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;

            // Get indentation logic
            const currentLine = value.substring(currentLineStart, start);
            const match = currentLine.match(/^\s*/);
            const currentIndent = match ? match[0] : "";

            // Check if last character was '{' (simple auto-indent)
            const isBlockStart = value.substring(start - 1, start) === "{";
            const extraIndent = isBlockStart ? "    " : "";

            const insertion = "\n" + currentIndent + extraIndent;

            this.value =
                value.substring(0, start) + insertion + value.substring(end);

            this.selectionStart = this.selectionEnd = start + insertion.length;
        }
    });

    // Focus editor
    textarea.focus();
}
