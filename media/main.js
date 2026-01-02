const vscode = acquireVsCodeApi();

// State
let state = {
    view: "home", // 'home' | 'challenge' | 'account'
    challenges: [],
    progress: {},
    activeChallenge: null,
};

// DOM Elements
const app = document.getElementById("app");

// Initialization
window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.type) {
        case "challenges":
            state.challenges = message.challenges;
            state.progress = message.progress;
            render();
            break;
        case "showChallenge":
            state.activeChallenge = message.challenge;
            if (message.progress) {
                state.progress[message.challenge.id] = message.progress;
            }
            state.view = "challenge";
            render();
            break;
        case "executionResult":
            const statusEl = document.getElementById("status-message");
            if (statusEl) {
                statusEl.innerText = message.message;
                statusEl.className = message.success ? "success" : "error";
            }
            // Update local state if success
            if (message.success) {
                if (!state.progress[message.challengeId])
                    state.progress[message.challengeId] = {};
                state.progress[message.challengeId].completed = true;
                state.progress[message.challengeId].inProgress = false;
            }
            break;
    }
});

// Request initial data
vscode.postMessage({ type: "getChallenges" });

// Rendering
function render() {
    app.innerHTML = "";

    // Navigation Bar
    const nav = document.createElement("nav");
    nav.innerHTML = `
        <button onclick="navigate('home')">Home</button>
        <button onclick="navigate('account')">Account</button>
    `;
    app.appendChild(nav);

    const content = document.createElement("main");
    app.appendChild(content);

    if (state.view === "home") {
        renderHome(content);
    } else if (state.view === "challenge") {
        renderChallenge(content);
    } else if (state.view === "account") {
        renderAccount(content);
    }
}

function renderHome(container) {
    const list = document.createElement("div");
    list.className = "challenge-list";

    state.challenges.forEach((challenge) => {
        const item = document.createElement("div");
        const p = state.progress[challenge.id];
        const status = p?.completed ? "✅" : p?.inProgress ? "🚧" : "";

        item.className = "challenge-item " + challenge.difficulty;
        item.innerHTML = `
            <div class="challenge-header">
                <span class="difficulty-badge ${challenge.difficulty}"></span>
                <span class="challenge-title">${challenge.title}</span>
                <span class="challenge-status">${status}</span>
            </div>
        `;
        item.onclick = () => {
            vscode.postMessage({ type: "getChallenge", id: challenge.id });
        };
        list.appendChild(item);
    });

    container.appendChild(list);
}

function renderChallenge(container) {
    if (!state.activeChallenge) return;
    const c = state.activeChallenge;
    const p = state.progress[c.id];

    const wrapper = document.createElement("div");
    wrapper.className = "challenge-view";

    wrapper.innerHTML = `
        <h2>${c.title} <span class="badge ${c.difficulty}">${
        c.difficulty
    }</span></h2>
        <p class="description">${c.description}</p>
        
        <div class="code-editor-container">
            <textarea id="code-input" spellcheck="false">${
                p?.code || c.starterCode
            }</textarea>
        </div>
        
        <div class="actions">
            <button id="run-btn">Run Code</button>
        </div>
        
        <div id="status-message"></div>
    `;

    container.appendChild(wrapper);

    // Add event listeners
    document.getElementById("run-btn").onclick = () => {
        const code = document.getElementById("code-input").value;
        vscode.postMessage({ type: "runCode", challengeId: c.id, code });
    };

    document.getElementById("code-input").oninput = (e) => {
        // Auto-save debounce could go here, or save on blur
        vscode.postMessage({
            type: "saveProgress",
            id: c.id,
            code: e.target.value,
        });
    };
}

function renderAccount(container) {
    const completed = Object.values(state.progress).filter(
        (p) => p.completed
    ).length;
    let score = 0;

    // Calculate score
    Object.keys(state.progress).forEach((id) => {
        if (state.progress[id].completed) {
            const challenge = state.challenges.find((c) => c.id === id);
            if (challenge) {
                score += getPoints(challenge.difficulty);
            }
        }
    });

    container.innerHTML = `
        <div class="account-view">
            <h2>User Stats</h2>
            <div class="stat-card">
                <h3>Completed</h3>
                <p>${completed} / ${state.challenges.length}</p>
            </div>
            <div class="stat-card">
                <h3>Total Score</h3>
                <p>${score}</p>
            </div>
        </div>
    `;
}

// Helpers
function navigate(view) {
    state.view = view;
    render();
}

// Make navigate global
window.navigate = navigate;

function getPoints(difficulty) {
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
