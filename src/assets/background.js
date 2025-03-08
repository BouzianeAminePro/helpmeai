const ACTIONS = {
    LISTEN: 'LISTEN',
    RESPONSE: 'RESPONSE',
    COPY: 'COPY',
    OPEN_EXTENSION: 'OPEN_EXTENSION',
    GET_AUTH_TOKEN: 'GET_AUTH_TOKEN',
    SET_AUTH_TOKEN: 'SET_AUTH_TOKEN',
    LOGOUT: 'LOGOUT',
    NEXTAUTH_TOKEN: 'NEXTAUTH_TOKEN'
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
        case ACTIONS.OPEN_EXTENSION:
            if (request.token) {
                await chrome.storage.sync.set(
                    {
                        token: request?.token
                    }
                );
            } else {
                console.error("Login failed");
            }
            await chrome.action.openPopup();
            callback({ success: true });
            break;
        case ACTIONS.GET_AUTH_TOKEN:
            chrome.storage.sync.get(['authToken', 'tokenExpires', 'user'], (result) => {
                callback({
                    token: result.authToken || null,
                    expires: result.tokenExpires || null,
                    user: result.user || null
                });
            });
            break;
        case ACTIONS.SET_AUTH_TOKEN:
            chrome.storage.sync.set({
                authToken: request.token,
                tokenExpires: request.expires,
                user: request.user
            }, () => {
                callback({ success: true });
            });
            break;
        case ACTIONS.LOGOUT:
            chrome.storage.sync.remove(['authToken', 'tokenExpires', 'user'], () => {
                callback({ success: true });
            });
            break;
    }

    return request;
});
