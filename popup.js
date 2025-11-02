let currentIndex = 0;
let totalMatches = 0;
let currentXPath = "";
let currentTabId = null;

// API Configuration
const DEFAULT_API_ENDPOINT = "http://localhost:5055";
let apiEndpoint = DEFAULT_API_ENDPOINT;

// DOM Elements
const ta = document.getElementById("code");
const pre = document.getElementById("highlight");
const outputEl = document.getElementById("output");
const countEl = document.getElementById("matchCount");
const navButtons = document.querySelector(".nav-buttons");
const runBtn = document.getElementById("run");
const apiEndpointInput = document.getElementById("apiEndpoint");
const saveSettingsBtn = document.getElementById("saveSettings");
const resetSettingsBtn = document.getElementById("resetSettings");
const settingsSection = document.querySelector(".settings-section");

// Validation state
let validationTimeout = null;

// Load API endpoint from storage
async function loadApiEndpoint() {
    const result = await chrome.storage.local.get("apiEndpoint");
    apiEndpoint = result.apiEndpoint || DEFAULT_API_ENDPOINT;
    apiEndpointInput.value = apiEndpoint;
}

// Save API endpoint to storage
async function saveApiEndpoint(endpoint) {
    apiEndpoint = endpoint;
    await chrome.storage.local.set({ apiEndpoint: endpoint });
}

// Initialize
loadApiEndpoint();

// Helper: send message to background
function bg(action, data = {}) {
    return new Promise(resolve => {
        chrome.runtime.sendMessage({ action, ...data }, resolve);
    });
}

// Real-time validation with debounce
async function validateSnippet(snippet) {
    // Reset to blue if empty
    if (!snippet.trim()) {
        runBtn.classList.remove("valid", "error");
        return;
    }

    const encoded = encodeURIComponent(snippet);
    const url = `${apiEndpoint}/execute?expression=${encoded}`;

    try {
        const res = await fetch(url);
        const text = await res.text();

        // Check if response contains error indicators
        // API may return 200 OK but with error message in body
        const isError = !res.ok ||
                       text.toLowerCase().includes("error") ||
                       text.toLowerCase().includes("invalid") ||
                       text.toLowerCase().includes("unexpected") ||
                       text.trim().length === 0;

        if (isError) {
            // Error - turn red
            runBtn.classList.remove("valid");
            runBtn.classList.add("error");
        } else {
            // Success - turn green
            runBtn.classList.remove("error");
            runBtn.classList.add("valid");
        }
    } catch (err) {
        // Network or other error - turn red
        runBtn.classList.remove("valid");
        runBtn.classList.add("error");
    }
}

// Syntax Highlighting Functions
function esc(s) {
    return s
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function highlight(src) {
    let text = src;

    text = text.replace(/\.(\s*[a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
        return `.§DOTSTART§${name}§DOTEND§`;
    });

    text = text.replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, "§STRSTART§$1§STREND§");
    text = text.replace(/\b\d+(\.\d+)?\b/g, "§NUMSTART§$&§NUMEND§");
    text = text.replace(/([\[\]\(\)\{\}])/g, "§BRSTART§$1§BREND§");
    text = text.replace(/\$[a-zA-Z_][a-zA-Z0-9_]*/g, "§DOLLARSTART§$&§DOLLAREND§");
    text = text.replace(/\bby[a-zA-Z_][a-zA-Z0-9_]*/g, "§BYSTART§$&§BYEND§");
    text = text.replace(/\bwith[a-zA-Z_][a-zA-Z0-9_]*/g, "§WITHSTART§$&§WITHEND§");

    text = esc(text);

    return text
        .replaceAll("§DOTSTART§", '<span class="tok-prop">')
        .replaceAll("§DOTEND§", "</span>")
        .replaceAll("§STRSTART§", '<span class="tok-str">')
        .replaceAll("§STREND§", "</span>")
        .replaceAll("§NUMSTART§", '<span class="tok-num">')
        .replaceAll("§NUMEND§", "</span>")
        .replaceAll("§BRSTART§", '<span class="tok-br">')
        .replaceAll("§BREND§", "</span>")
        .replaceAll("§DOLLARSTART§", '<span class="tok-dollar">')
        .replaceAll("§DOLLAREND§", "</span>")
        .replaceAll("§BYSTART§", '<span class="tok-by">')
        .replaceAll("§BYEND§", "</span>")
        .replaceAll("§WITHSTART§", '<span class="tok-with">')
        .replaceAll("§WITHEND§", "</span>");
}

function render() {
    const text = ta.value.replaceAll("\r\n", "\n");
    pre.innerHTML = highlight(text) + (text.endsWith("\n") ? " " : "");
    syncScroll();
}

function syncScroll() {
    pre.scrollTop = ta.scrollTop;
    pre.scrollLeft = ta.scrollLeft;
}

function handleTab(e) {
    if (e.key === "Tab") {
        e.preventDefault();
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        ta.setRangeText("  ", start, end, "end");
        render();
    }
}

ta.addEventListener("input", () => {
    render();
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";

    clearTimeout(validationTimeout);
    validationTimeout = setTimeout(() => {
        validateSnippet(ta.value);
    }, 100);
});
ta.addEventListener("scroll", syncScroll);
ta.addEventListener("keydown", handleTab);

document.addEventListener("DOMContentLoaded", async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs[0]) return;

    currentTabId = tabs[0].id;

    const state = await bg("getState", { tabId: currentTabId });
    if (state) {
        ta.value = state.snippet || "";
        render();
        outputEl.innerText = state.xpath || "";
        totalMatches = state.totalMatches || 0;
        currentIndex = state.currentIndex || 0;
        currentXPath = state.xpath || "";

        if (state.snippet) {
            validateSnippet(state.snippet);
        }

        if (totalMatches > 0) {
            outputEl.classList.add("visible");
            navButtons.parentElement.classList.add("visible");
            countEl.innerText = `${currentIndex + 1} of ${totalMatches}`;
            chrome.tabs.sendMessage(currentTabId, { action: "highlightOne", index: currentIndex });
        } else if (state.xpath) {
            outputEl.classList.add("visible");
            countEl.innerText = "0 of 0";
        } else {
            outputEl.classList.remove("visible");
            navButtons.parentElement.classList.remove("visible");
            countEl.innerText = "0 of 0";
        }
    } else {
        ta.value = "";
        render();
        countEl.innerText = "0 of 0";
    }
});

document.getElementById("run").addEventListener("click", async () => {
    const snippet = ta.value.trim();
    if (!snippet) return alert("Enter an XPathy expression");

    const encoded = encodeURIComponent(snippet);
    const url = `${apiEndpoint}/execute?expression=${encoded}`;

    try {
        const res = await fetch(url);
        const xpath = await res.text();
        currentXPath = xpath;
        outputEl.innerText = xpath;

        outputEl.classList.add("visible");

        chrome.tabs.sendMessage(currentTabId, { xpath, action: "evaluate" }, async response => {
            if (response && response.count > 0) {
                totalMatches = response.count;
                currentIndex = 0;
                countEl.innerText = `${currentIndex + 1} of ${totalMatches}`;

                navButtons.parentElement.classList.add("visible");

                chrome.tabs.sendMessage(currentTabId, { action: "highlightOne", index: currentIndex });
            } else {
                totalMatches = 0;
                currentIndex = 0;
                countEl.innerText = "0 of 0";

                navButtons.parentElement.classList.remove("visible");
            }

            await bg("saveState", {
                tabId: currentTabId,
                state: { snippet, xpath, totalMatches, currentIndex }
            });
        });
    } catch (err) {
        outputEl.innerText = "❌ Error: " + err.message + " - Please check API endpoint below";
        outputEl.classList.add("visible");
        settingsSection.classList.add("visible");
    }
});

document.getElementById("next").addEventListener("click", () => navigate(1));
document.getElementById("prev").addEventListener("click", () => navigate(-1));

async function navigate(step) {
    if (totalMatches === 0) return;
    currentIndex = (currentIndex + step + totalMatches) % totalMatches;

    countEl.innerText = `${currentIndex + 1} of ${totalMatches}`;
    chrome.tabs.sendMessage(currentTabId, { action: "highlightOne", index: currentIndex });

    await bg("saveState", {
        tabId: currentTabId,
        state: { snippet: ta.value, xpath: currentXPath, totalMatches, currentIndex }
    });
}

// Settings button handlers
saveSettingsBtn.addEventListener("click", async () => {
    const endpoint = apiEndpointInput.value.trim();
    if (!endpoint) {
        alert("Please enter a valid API endpoint");
        return;
    }

    // Remove trailing slash if present
    const cleanEndpoint = endpoint.replace(/\/$/, "");
    await saveApiEndpoint(cleanEndpoint);
    apiEndpointInput.value = cleanEndpoint;

    // Show feedback
    saveSettingsBtn.textContent = "✓ Saved";
    setTimeout(() => {
        saveSettingsBtn.textContent = "Save";
        settingsSection.classList.remove("visible");
    }, 1500);
});

resetSettingsBtn.addEventListener("click", async () => {
    await saveApiEndpoint(DEFAULT_API_ENDPOINT);
    apiEndpointInput.value = DEFAULT_API_ENDPOINT;

    // Show feedback
    resetSettingsBtn.textContent = "✓ Reset";
    setTimeout(() => {
        resetSettingsBtn.textContent = "Reset";
        settingsSection.classList.remove("visible");
    }, 1500);
});

