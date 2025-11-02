// Listen for popup requests and state updates
// Service workers are ephemeral - they shut down after ~30s of inactivity
// We must read from chrome.storage.local on EVERY access, not just on startup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // Make async operations work with sendResponse
    (async () => {
        switch (msg.action) {
            case "saveState": {
                const tabId = msg.tabId;
                if (!tabId) {
                    console.error("No tabId provided for saveState");
                    return;
                }

                // Load current state from storage
                const data = await chrome.storage.local.get("tabStates");
                const tabStates = data.tabStates || {};

                // Update and save
                tabStates[tabId] = { ...msg.state };
                await chrome.storage.local.set({ tabStates });
                sendResponse({ success: true });
                break;
            }

            case "getState": {
                const requestedTabId = msg.tabId;
                if (!requestedTabId) {
                    sendResponse(null);
                    return;
                }

                // Always load fresh from storage (service worker may have restarted)
                const data = await chrome.storage.local.get("tabStates");
                const tabStates = data.tabStates || {};

                // Return state for specific tab, or empty state if none exists
                const state = tabStates[requestedTabId] || {
                    snippet: "",
                    xpath: "",
                    totalMatches: 0,
                    currentIndex: 0
                };
                sendResponse(state);
                break;
            }

            case "clearState": {
                const clearTabId = msg.tabId;
                if (clearTabId) {
                    // Load current state from storage
                    const data = await chrome.storage.local.get("tabStates");
                    const tabStates = data.tabStates || {};

                    // Delete and save
                    delete tabStates[clearTabId];
                    await chrome.storage.local.set({ tabStates });
                }
                sendResponse({ success: true });
                break;
            }

            default:
                break;
        }
    })();

    // Return true to indicate we'll send response asynchronously
    return true;
});

// Clean up state when tabs are closed to prevent memory bloat
chrome.tabs.onRemoved.addListener(async (tabId) => {
    const data = await chrome.storage.local.get("tabStates");
    const tabStates = data.tabStates || {};

    if (tabStates[tabId]) {
        delete tabStates[tabId];
        await chrome.storage.local.set({ tabStates });
    }
});
