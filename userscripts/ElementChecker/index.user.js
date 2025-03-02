// ==UserScript==
// @name        Element Checker
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @grant       GM.getValue
// @run-at      document-end
// @version     3.0
// @author      BrentBE and Chad
// @description Checks if specified elements exist in *current* savefile. Options: Any Caps, Emoji, Insert List | Also can check for elements with missing recipes.
// ==/UserScript==

window.addEventListener("load", () => {
    'use strict';

    const shadowCSS = `
    .popup {
        background-color: #18181b;
        color: #fff;
        border: 1px solid #525252;
        padding: 50px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        width: 750px;
        max-width: 750px;
        border-radius: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .popup textarea {
        width: 100%;
        height: 250px;
        font-size: 20px;
        margin-bottom: 20px;
        border-radius: 10px;
    }

    .popup.hidden {
        display: none;
    }

    .popup button {
        padding: 12px 24px;
        background-color: #18181b;
        color: white;
        border: 1px solid #525252;
        cursor: pointer;
        border-radius: 10px;
        transition: background-color 0.3s ease;
        font-size: 18px;
        flex: 1;
    }

    .popup button:hover {
        background-color: #3b82f6;
    }

    .popup .button-group {
        display: flex;
        gap: 10px;
        justify-content: space-between;
        width: 100%;
    }

    .popup .checkbox-group {
        display: flex;
        gap: 20px;
        justify-content: center;
        width: 100%;
        margin-top: 20px;
    }

    .popup label {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 18px;
        cursor: pointer;
    }

    .popup input[type="checkbox"]:checked {
        background-color: white;
        border: 2px solid #525252;
    }

    .popup .close-container {
        display: flex;
        width: 100%;
        justify-content: flex-end;
        margin-top: 20px;
    }
    `;

    let isPopupFocused = false;
    let searchBar = null;
    let emojiMode = false;
    let anyCaps = false;

    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('elementCheckerSettings')) || {};
        emojiMode = settings.emojiMode !== undefined ? settings.emojiMode : false;
        anyCaps = settings.anyCaps !== undefined ? settings.anyCaps : false;
    }

    function saveSettings() {
        const settings = { emojiMode, anyCaps };
        localStorage.setItem('elementCheckerSettings', JSON.stringify(settings));
    }

    function createPopup() {
        const popup = document.createElement("div");
        popup.id = "popup-element-checker";
        popup.classList.add("popup", "hidden");

        const style = document.createElement("style");
        style.textContent = shadowCSS;
        document.head.appendChild(style);

        const textarea = document.createElement("textarea");
        textarea.id = "popup-textarea";
        textarea.placeholder = "Enter elements (one per line)";

        textarea.addEventListener("focus", () => isPopupFocused = true);
        textarea.addEventListener("blur", () => isPopupFocused = false);

        const buttonGroup = document.createElement("div");
        buttonGroup.classList.add("button-group");

        const checkButton = document.createElement("button");
        checkButton.textContent = "Check";
        checkButton.addEventListener("click", () => {
            const inputElements = textarea.value.split("\n").map(e => e.replace(/\s+/g, ' '));

            const elementsMap = new Map();
            const vueInstance = document.querySelector(".container").__vue__;
            if (vueInstance && vueInstance.elements) {
                vueInstance.elements.forEach(x => {
                    const lower = x.text.toLowerCase();
                    if (!elementsMap.has(lower)) {
                        elementsMap.set(lower, []);
                    }
                    elementsMap.get(lower).push(x);
                });
            }

            const foundElements = new Set();
            const missingElements = new Set();

            inputElements.forEach(element => {
                const matchFunc = anyCaps
                    ? (text) => text.text.toLowerCase() === element.toLowerCase()
                    : (text) => text.text === element;

                const matched = [...elementsMap.values()].flat().filter(matchFunc);
                if (matched.length > 0) {
                    matched.forEach(item => {
                        const emojiPart = emojiMode ? (item.emoji ? `${item.emoji} ` : '') : '';
                        foundElements.add(emojiPart + item.text);
                    });
                } else {
                    missingElements.add(element);
                }
            });

            const foundText = foundElements.size
                ? Array.from(foundElements).join("\n")
                : '';

            const missingText = missingElements.size ? Array.from(missingElements).join("\n") : '';

            const fileContent = `Elements Found:\n${foundText}\n\nElements Missing:\n${missingText}`;

            const blob = new Blob([fileContent], { type: 'text/plain' });

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "elements_check_results.txt";

            link.click();
        });

        const insertListButton = document.createElement("button");
        insertListButton.textContent = "Insert List";
        insertListButton.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".txt";
            input.addEventListener("change", (event) => {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function (e) {
                    textarea.value = e.target.result;
                };
                reader.readAsText(file);
            });
            input.click();
        });

        const noRecipesButton = document.createElement("button");
        noRecipesButton.textContent = "No Recipes";
        noRecipesButton.addEventListener("click", async () => {
            console.log("Fetching elements and recipes...");

            const vueInstance = document.querySelector(".container").__vue__;
            if (!vueInstance || !vueInstance.elements) {
                console.log("Vue instance or elements missing");
                return;
            }

            let recipes = {};
            try {
                const save = await getSave().then(res => res.json());
                recipes = save.recipes || {};
            } catch (error) {
                console.error("Failed to fetch recipes:", error);
                return;
            }

            console.log("Elements and recipes fetched successfully.");

            const noRecipeElements = vueInstance.elements.filter(el => !recipes.hasOwnProperty(el.text));

            noRecipesButton.innerHTML = `No Recipes <br> (${noRecipeElements.length} found)`;
            noRecipesButton.style.whiteSpace = "normal";

            const fileContent = noRecipeElements.length
                ? noRecipeElements.map(el => el.text).join("\n")
                : "All elements have recipes.";

            const blob = new Blob([fileContent], { type: 'text/plain' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "no_recipes.txt";
            link.click();
        });

        function getSave() {
            return new Promise((resolve, reject) => {
                const handleClick = HTMLElement.prototype.click;
                HTMLElement.prototype.click = () => HTMLElement.prototype.click = handleClick;

                const bodyObserver = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        const anchor = [...mutation.addedNodes].find(n => n.download === "infinitecraft.json");
                        if (anchor) return fetch(anchor.href).then(resolve);
                    }
                });

                bodyObserver.observe(document.body, { childList: true, subtree: true });
                handleClick.call(document.querySelector(".setting[for=import-save] + .setting"));

                setTimeout(() => {
                    bodyObserver.disconnect();
                    reject("Timed out");
                }, 1500);
            });
        }


        buttonGroup.appendChild(insertListButton);
        buttonGroup.appendChild(checkButton);
        buttonGroup.appendChild(noRecipesButton);




        const checkboxGroup = document.createElement("div");
        checkboxGroup.classList.add("checkbox-group");

        const emojiLabel = document.createElement("label");
        const emojiCheckbox = document.createElement("input");
        emojiCheckbox.type = "checkbox";
        emojiCheckbox.checked = emojiMode;
        emojiCheckbox.addEventListener("change", () => {
            emojiMode = emojiCheckbox.checked;
            saveSettings();
        });

        emojiLabel.appendChild(emojiCheckbox);
        emojiLabel.append("Enable Emoji Mode");

        const anyCapsLabel = document.createElement("label");
        const anyCapsCheckbox = document.createElement("input");
        anyCapsCheckbox.type = "checkbox";
        anyCapsCheckbox.checked = anyCaps;
        anyCapsCheckbox.addEventListener("change", () => {
            anyCaps = anyCapsCheckbox.checked;
            saveSettings();
        });

        anyCapsLabel.appendChild(anyCapsCheckbox);
        anyCapsLabel.append("Enable Any Caps Mode");

        checkboxGroup.appendChild(emojiLabel);
        checkboxGroup.appendChild(anyCapsLabel);

        const closeContainer = document.createElement("div");
        closeContainer.classList.add("close-container");

        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.addEventListener("click", () => {
            popup.classList.add("hidden");
            if (searchBar) searchBar.focus();
        });

        closeContainer.appendChild(closeButton);

        popup.appendChild(textarea);
        popup.appendChild(buttonGroup);
        popup.appendChild(checkboxGroup);
        popup.appendChild(closeContainer);
        document.body.appendChild(popup);
    }

    function createButton() {
        const button = document.createElement("img");
        button.src = "/infinite-craft/search.svg";
        button.alt = "Element Checker";
        button.style.cursor = "pointer";
        button.style.width = "22px";
        button.style.height = "22px";
        button.style.filter = "invert(1) brightness(0.1)";

        button.addEventListener("click", () => {
            document.getElementById("popup-element-checker").classList.toggle("hidden");
        });

        setTimeout(() => {
            document.querySelector(".side-controls")?.append(button);
        }, 1100);
    }


    window.addEventListener("keydown", (event) => {
        if (document.getElementById("popup-element-checker") && !document.getElementById("popup-element-checker").classList.contains("hidden")) {
            event.stopPropagation();
        }
    }, true);

    loadSettings();
    createPopup();
    createButton();
});
