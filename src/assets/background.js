const ACTIONS = {
    LISTEN: 'LISTEN',
    RESPONSE: 'RESPONSE',
    COPY: 'COPY',
}

console.log("Background loaded!");

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        console.log("Extension installed");
    } else if (details.reason === "update") {
        console.log("Extension updated");
    }
});

chrome.runtime.onMessage.addListener(async (request, data, callback) => {
    console.log("Adding listeners!");
    switch (request?.action) {
        case ACTIONS.LISTEN:
            await chrome.storage.sync.set(
                {
                    value: request?.payload ?? ""
                }
            );
            await chrome.action.openPopup();
            callback({ success: true });
            break;
        case ACTIONS.RESPONSE:
            await chrome.storage.sync.set(
                {
                    response: request?.payload
                }
            );
            callback({ success: true });
            break;
        case ACTIONS.COPY:
            await chrome.storage.sync.set(
                {
                    copy: request?.payload
                }
            );
            callback({ success: true });
            break;
    }

    return request;
});
