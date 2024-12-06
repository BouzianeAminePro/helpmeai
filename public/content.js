const ACTIONS = {
    LISTEN: 'LISTEN',
    COPY: 'COPY',
};

const BTN_ID = "action-helpmeai";

console.log("Content loaded!");

const isColorCloseToBlack = (color) => {
    const rgb = color.match(/\d+/g).map(Number);
    return rgb[0] < 50 && rgb[1] < 50 && rgb[2] < 50; // Close to black
};

const isColorCloseToWhite = (color) => {
    const rgb = color.match(/\d+/g).map(Number);
    return rgb[0] > 200 && rgb[1] > 200 && rgb[2] > 200; // Close to white
};

document.addEventListener("focusin", (event) => {
    const target = event.target;

    // Check if the target is a contenteditable, a textbox, an input, or a textarea
    if (!(target.isContentEditable || target.getAttribute("role") === "textbox" || target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

    // Prevent adding the button multiple times
    let button = document.querySelector(`#${BTN_ID}`)

    if (document.querySelector(`#${BTN_ID}`)) {
        // Apply dark mode filter and check parent background color
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const parentBgColor = getComputedStyle(target).backgroundColor;
        button.style.filter = (darkModeQuery.matches || isColorCloseToBlack(parentBgColor)) ? "invert(.4)" : (isColorCloseToWhite(parentBgColor) ? "invert(.7)" : button.style.filter);
        return;
    }

    // Create the button
    button = document.createElement("button");
    button.id = BTN_ID;
    button.style.position = "absolute";
    button.style.width = "40px";
    button.style.height = "40px";
    button.style.background = "none";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.zIndex = 1000;

    // Add an image to the button
    const image = document.createElement('img');
    image.src = chrome.runtime.getURL('images/logo.png');
    image.alt = 'Action';
    image.style.width = '40px';
    image.style.height = '40px';

    // Apply dark mode filter and check parent background color
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const parentBgColor = getComputedStyle(target).backgroundColor;

    button.style.filter = (darkModeQuery.matches || isColorCloseToBlack(parentBgColor)) ? "invert(.4)" : (isColorCloseToWhite(parentBgColor) ? "invert(.7)" : button.style.filter);

    button.appendChild(image);

    // Add click event listener to the button
    button.addEventListener('click', (ev) => {
        ev.preventDefault();
        chrome.runtime.sendMessage({
            action: ACTIONS.LISTEN,
            payload: target.value ?? target.textContent,
        });
    });

    const rect = target.getBoundingClientRect();
    button.style.top = `${rect.top + window.scrollY}px`;
    button.style.left = `${rect.right + 10 + window.scrollX}px`;

    document.body.appendChild(button);

    chrome.storage.sync.onChanged.addListener((result) => {
        if (!result?.copy?.newValue) return;
        target.innerText = result.copy.newValue
        chrome.runtime.sendMessage({ action: ACTIONS.COPY, payload: undefined });
    });

    const handleClickOutside = (event) => {
        if (!target.contains(event.target) && !button.contains(event.target)) {
            button.remove();
            document.removeEventListener("mousedown", handleClickOutside);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);
});
