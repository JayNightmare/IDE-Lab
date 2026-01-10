const vscode = acquireVsCodeApi();

// State
let state = {
    view: "home", // 'home' | 'challenge' | 'account' | 'error'
    challenges: [],
    progress: {},
    activeChallenge: null,
    errorMessage: "",
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
            state.view = "home"; // Reset to home on success if we were in error
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
        case "error":
            state.errorMessage = message.message;
            state.view = "error";
            render();
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

    // Create buttons safely with event listeners
    const homeBtn = document.createElement("button");
    homeBtn.textContent = "Home";
    homeBtn.onclick = () => navigate("home");

    const accountBtn = document.createElement("button");
    accountBtn.textContent = "Account";
    accountBtn.onclick = () => navigate("account");

    nav.appendChild(homeBtn);
    nav.appendChild(accountBtn);
    app.appendChild(nav);

    const content = document.createElement("main");
    app.appendChild(content);

    if (state.view === "home") {
        renderHome(content);
    } else if (state.view === "challenge") {
        renderChallenge(content);
    } else if (state.view === "account") {
        renderAccount(content);
    } else if (state.view === "error") {
        renderError(content);
    }
}

function renderError(container) {
    container.innerHTML = `
        <div class="error-view">
            <h3>⚠️ Error</h3>
            <p>${state.errorMessage}</p>
            <button id="refresh-btn" class="primary-btn">Refresh</button>
        </div>
    `;

    document.getElementById("refresh-btn").onclick = () => {
        vscode.postMessage({ type: "refresh" });
        // Optional: Show loading state here
        const btn = document.getElementById("refresh-btn");
        if (btn) {
            btn.textContent = "Loading...";
            btn.disabled = true;
        }
    };
}

function renderHome(container) {
    if (state.challenges.length === 0) {
        container.innerHTML = "<p>No challenges available.</p>";
        return;
    }

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

    const wrapper = document.createElement("div");
    wrapper.className = "challenge-view";

    // Description only view
    wrapper.innerHTML = `
        <h2>
            ${c.title} 
            <span class="badge ${c.difficulty}">${c.difficulty}</span>
            <span class="language-badge">JavaScript</span>
        </h2>
        <p class="description">${c.description}</p>
        
        <div class="actions">
            <button id="open-editor-btn" class="primary-btn">Open Editor</button>
        </div>
    `;

    container.appendChild(wrapper);

    // Open Editor Button
    document.getElementById("open-editor-btn").onclick = () => {
        vscode.postMessage({ type: "openEditor", id: c.id });
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
