const ACTIONS = {
    LISTEN: 'LISTEN',
    COPY: 'COPY',
    RESPONSE: 'RESPONSE',
};

const BTN_ID = "action-helpmeai";

console.log("Content loaded!");

const isColorCloseToBlack = (color) => {
    const rgb = color.match(/\d+/g).map(Number);
    return rgb[0] < 50 && rgb[1] < 50 && rgb[2] < 50;
};

document.addEventListener("focusin", (event) => {
    const target = event.target;

    if (!(
        target.isContentEditable ||
        target.getAttribute("role") === "textbox" ||
        target.getAttribute("role") === "input" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
    )) {
        return;
    }

    const colorScheme = getComputedStyle(target.parentElement).colorScheme;

    let button = document.querySelector(`#${BTN_ID}`)

    if (button) {
        const img = button.querySelector('img');
        if (img) {
            img.style.filter = colorScheme === "dark" ? "invert(1)" : "invert(0)";
        }
        return;
    }

    button = document.createElement("button");
    button.id = BTN_ID;
    button.style.position = "absolute";
    button.style.width = "40px";
    button.style.height = "40px";
    button.style.background = "none";
    button.style.border = "none";
    button.style.cursor = "pointer";
    button.style.zIndex = 1000;

    const image = document.createElement('img');
    image.src = chrome.runtime.getURL('images/logo.png');
    image.alt = 'Action';
    image.style.width = '40px';
    image.style.height = '40px';
    image.style.filter = colorScheme === "dark" ? "invert(1)" : "invert(0)";

    button.appendChild(image);

    target.addEventListener("mouseup", saveSelection);
    target.addEventListener("keyup", saveSelection);

    function saveSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            savedRange = selection.getRangeAt(0);
        }
    }

    // Restore the saved selection
    function restoreSelection() {
        if (savedRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedRange);
        }
    }

    button.addEventListener('click', (ev) => {
        ev.preventDefault();
        restoreSelection();
        const selectedText = window.getSelection()?.toString();
        chrome.runtime.sendMessage({ action: ACTIONS.RESPONSE, payload: "" });
        chrome.runtime.sendMessage({
            action: ACTIONS.LISTEN,
            payload: !!selectedText?.length ? selectedText : target.value ?? target.textContent,
        });
    });

    const rect = target.getBoundingClientRect();
    button.style.top = `${rect.top + window.scrollY - 40}px`;
    button.style.left = `${rect.right + 5 + window.scrollX}px`;

    document.body.appendChild(button);

    chrome.storage.sync.onChanged.addListener((result) => {
        if (!result?.copy?.newValue) return result;
        target.innerText = result.copy.newValue
        target.value = result.copy.newValue
        chrome.runtime.sendMessage({ action: ACTIONS.COPY });
    });

    const handleClickOutside = (event) => {
        if (!target.contains(event.target) && !button.contains(event.target)) {
            button.remove();
            document.removeEventListener("mousedown", handleClickOutside);
        }
    };

    document.addEventListener("mousedown", handleClickOutside);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const img = button.querySelector('img');
        if (img) {
            img.style.filter = colorScheme === "dark" ? "invert(1)" : "invert(0)";
        }
    });
});
