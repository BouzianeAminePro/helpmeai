console.log("Background loaded!");

const ACTIONS = {
    LISTEN: 'LISTEN',
    RESPONSE: 'RESPONSE',
    COPY: 'COPY',
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed!");
    chrome.runtime.onMessage.addListener(async (request) => {
        console.log("Adding listeners!");
        switch (request?.action) {
            case ACTIONS.LISTEN:
                await chrome.storage.sync.set(
                    {
                        value: request?.payload ?? ""
                    }
                );
                await chrome.action.openPopup();
                break;
            case ACTIONS.RESPONSE:
                await chrome.storage.sync.set(
                    {
                        response: request?.payload
                    }
                );
                break;
            case ACTIONS.COPY:
                await chrome.storage.sync.set(
                    {
                        copy: request?.payload
                    }
                );
                break;
        }

        return request;
    });
});
