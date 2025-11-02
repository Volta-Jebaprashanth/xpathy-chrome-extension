let matchedElements = [];

// Keep last matchedElements available when popup reopens
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "evaluate" && request.xpath) {
        matchedElements = [];
        document.querySelectorAll(".xpathy-highlight").forEach(el => el.remove());
        try {
            const result = document.evaluate(request.xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            for (let i = 0; i < result.snapshotLength; i++) {
                matchedElements.push(result.snapshotItem(i));
            }
            sendResponse({ count: matchedElements.length });
        } catch (e) {
            sendResponse({ count: 0 });
        }
        return true;
    }

    if (request.action === "highlightOne") {
        highlightSingle(request.index);
    }
});


function highlightSingle(index) {
    // Remove old highlight
    document.querySelectorAll(".xpathy-highlight").forEach(el => el.remove());

    if (index < 0 || index >= matchedElements.length) return;

    const el = matchedElements[index];
    if (el) {
        const rect = el.getBoundingClientRect();
        const overlay = document.createElement("div");
        overlay.className = "xpathy-highlight";
        Object.assign(overlay.style, {
            position: "fixed",
            top: rect.top + window.scrollY + "px",
            left: rect.left + window.scrollX + "px",
            width: rect.width + "px",
            height: rect.height + "px",
            border: "3px solid #ff2b2b",
            backgroundColor: "rgba(255, 0, 0, 0.1)",
            zIndex: 999999,
            pointerEvents: "none",
            transition: "all 0.2s ease"
        });
        document.body.appendChild(overlay);

        // Smooth scroll to element
        el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}
