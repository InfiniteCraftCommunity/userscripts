// ==UserScript==
// @name        Utils Mod
// @namespace   Catstone
// @match       https://neal.fun/infinite-craft/
// @grant       GM.xmlHttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @version     1.3
// @author      Catstone
// @license     MIT
// @description Combines Infinite Craft Selection Utils, Tab Utils, Unicode Utils and more misc stuff!
// @downloadURL https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Utils_Mod/index.user.js
// @updateURL   https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Utils_Mod/index.user.js
// ==/UserScript==

(function() {
    'use strict';

    const closeIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNjAwIj48cGF0aCBkPSJNMzAwLjAwMDAyLDM0OS44MzIzM0w2MC4xMDc4Miw1ODkuNzIzMzJjLTYuNTQ2ODksNi41NDc2OS0xNC43NzY0Myw5Ljg5NzE4LTI0LjY4ODYsMTAuMDQ4NTEtOS45MTEzOCwuMTUyMS0xOC4yOTIyNC0zLjE5NzQtMjUuMTQyNTYtMTAuMDQ4NTFDMy40MjU1Nyw1ODIuODcyOTgsLjAwMDAyLDU3NC41Njc4LDAsNTY0LjgwNzc0Yy4wMDAwMi05Ljc2MDA3LDMuNDI1NTctMTguMDY1MjYsMTAuMjc2NjYtMjQuOTE1NTZsMjM5Ljg5MTAxLTIzOS44OTIyTDEwLjI3NjY4LDYwLjEwNzc4QzMuNzI4OTksNTMuNTYwOTIsLjM3OTUsNDUuMzMxMzYsLjIyODE3LDM1LjQxOTIyLC4wNzYwNywyNS41MDc4OCwzLjQyNTU3LDE3LjEyNywxMC4yNzY2OCwxMC4yNzY2NiwxNy4xMjcwMiwzLjQyNTUzLDI1LjQzMjIsMCwzNS4xOTIyNiwwczE4LjA2NTI2LDMuNDI1NTMsMjQuOTE1NTYsMTAuMjc2NjZsMjM5Ljg5MjIsMjM5Ljg5MDk3TDUzOS44OTIyMiwxMC4yNzY1OWM2LjU0Njg2LTYuNTQ3NzIsMTQuNzc2NDMtOS44OTcyLDI0LjY4ODU2LTEwLjA0ODUxLDkuOTExMzQtLjE1MjE3LDE4LjI5MjIyLDMuMTk3MzgsMjUuMTQyNTYsMTAuMDQ4NTEsNi44NTExMyw2Ljg1MDI3LDEwLjI3NjY2LDE1LjE1NTUyLDEwLjI3NjY2LDI0LjkxNTU2cy0zLjQyNTUzLDE4LjA2NTIyLTEwLjI3NjY2LDI0LjkxNTU2bC0yMzkuODkwOTcsMjM5Ljg5MjI3LDIzOS44OTEwNSwyMzkuODkyMmM2LjU0NzcyLDYuNTQ2ODksOS44OTcyLDE0Ljc3NjQzLDEwLjA0ODUxLDI0LjY4ODYsLjE1MjE3LDkuOTExMzgtMy4xOTczOCwxOC4yOTIyNC0xMC4wNDg1MSwyNS4xNDI1Ni02Ljg1MDI3LDYuODUxMS0xNS4xNTU1MiwxMC4yNzY2NC0yNC45MTU1NiwxMC4yNzY2Ni05Ljc2MDA0LS4wMDAwMi0xOC4wNjUyMi0zLjQyNTU3LTI0LjkxNTU2LTEwLjI3NjY2bC0yMzkuODkyMjctMjM5Ljg5MTAxWiIvPjwvc3ZnPg==';
    const css = document.createElement('style');
    css.textContent = `
.utils-settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    display: none;
}

.utils-settings-container {
	display: flex;
	flex-direction: column;
	gap: 28px;
	min-width: 30vw;
  padding: 10px;
}

.utils-setting-block {
	color: var(--text-color);
	display: flex;
	flex-direction: column;
	font-size: 16.4px;
  padding: 5px;
  min-height: 90px;
}

.utils-setting-block h1 {
	font-size: 20px;
	font-family: Roboto, sans-serif;
	line-height: 35px;
	color: var(--text-color);
	user-select: none;
	display: flex;
	justify-content: space-between;
}

.utils-settings-header {
	font-size: 20px;
	font-family: Roboto, sans-serif;
	color: var(--text-color);
	user-select: none;
	display: flex;
	justify-content: space-between;
	margin-bottom: -10px;
}

.utils-setting-block p {
	max-width: calc(100% - 5vw);
}

.utils-input-description {
  margin-bottom: 5px;
}

.utils-input-wrapper {
  margin-bottom: 10px;
}

.utils-setting-block label[for*="input"] {
	float: left;
	margin-right: 7px;
	margin-top: 5px;
}

.utils-setting-block {
  position: relative;
	background: transparent;
	border: 1px solid var(--border-color);
	border-radius: 5px;
	padding: 5px 7px;
	color: var(--text-color);
	outline: 0;
	font-size: 16.4px;
	width: calc(100% - 5vw);
  overflow: hidden;
}

.utils-input-description {
    margin-left: 30px;
    text-indent: 0px;
    font: caption;
}

.checkbox-container {
	position: relative;
	display: inline-block;
	width: 50px;
	height: 30px;
	cursor: pointer;
}

.checkbox-container input {
	opacity: 0;
	width: 0;
	height: 0;
}

.checkbox-slider {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: var(--border-color);
	transition: 0.4s;
	border-radius: 15px;
	z-index: -2;
}

.checkbox-slider:before {
	position: absolute;
	content: "";
	height: 22px;
	width: 22px;
	left: 4px;
	bottom: 4px;
	background-color: var(--background-color);
	transition: 0.4s;
	border-radius: 50%;
	z-index: -1;
}

.utils-color-input {
  outline: var(--custom-outline);
  border-width: 0;
  background-color: var(--custom-background);
  animation: var(--chroma-animation);
  padding-left: 59px;
  padding-top: 10px;
  width: 69px;
  height: 20px;
  margin: 5px;
}

.utils-number-input {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}

.utils-dropdown {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  padding: 5px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}


.utils-dropdown option {
  background-color: var(--background-color);
  color: var(--text-color);
}

.dark-mode .checkbox-slider:before {
	background-color: var(--text-color);
}

input:checked + .checkbox-slider {
	background-color: #70b565;
}

input:checked + .checkbox-slider:before {
	transform: translateX(19px);
}

.utils-setting-block:has(h1 > .checkbox-container > input[type="checkbox"]:not(:checked)) .utils-input-wrapper {
	margin-top: -33px;
  pointer-events: none;
	opacity: 0;
}

.label-toggle-container {
  align-items: center;
  display: flex;
}

.label-toggle-container label {
  margin-right: 10px;
}

.selectionbox {
  position: absolute;
  z-index: 6942069;
  outline: var(--custom-outline);
  background-color: var(--custom-background);
  animation: var(--chroma-animation);
}

@keyframes chromaCycleOutline {
  0%  { outline-color: rgb(255, 0,   0  ); } /* Red */
  10% { outline-color: rgb(255, 127, 0  ); } /* Orange */
  20% { outline-color: rgb(255, 255, 0  ); } /* Yellow */
  30% { outline-color: rgb(127, 255, 0  ); } /* Lime */
  40% { outline-color: rgb(0,   255, 0  ); } /* Green */
  50% { outline-color: rgb(0,   255, 255); } /* Aqua */
  60% { outline-color: rgb(0,   127, 255); } /* Light Blue */
  70% { outline-color: rgb(0,   0,   255); } /* Blue */
  80% { outline-color: rgb(127, 0,   255); } /* Purple */
  90% { outline-color: rgb(255, 0,   255); } /* Magenta */
  100%{ outline-color: rgb(255, 0,   127); } /* Pink */
}
@keyframes chromaCycleBackground {
  0%  { background-color: rgba(255, 0,   0,   0.3); } /* Red */
  10% { background-color: rgba(255, 127, 0,   0.3); } /* Orange */
  20% { background-color: rgba(255, 255, 0,   0.3); } /* Yellow */
  30% { background-color: rgba(127, 255, 0,   0.3); } /* Lime */
  40% { background-color: rgba(0,   255, 0,   0.3); } /* Green */
  50% { background-color: rgba(0,   255, 255, 0.3); } /* Aqua */
  60% { background-color: rgba(0,   127, 255, 0.3); } /* Light Blue */
  70% { background-color: rgba(0,   0,   255, 0.3); } /* Blue */
  80% { background-color: rgba(127, 0,   255, 0.3); } /* Purple */
  90% { background-color: rgba(255, 0,   255, 0.3); } /* Magenta */
  100%{ background-color: rgba(255, 0,   127, 0.3); } /* Pink */
}
@keyframes rotateBorder {
  100% { transform: rotate(360deg); }
}









#tabBar {
    position: absolute;
    top: 5px;
    display: flex;
    align-items: start;
    background-color: transparent;
    padding: 5px;
    scrollbar-color: #525252 #262626;
    white-space: nowrap;
    z-index: 69420;
    pointer-events: none;
}
.tabs {
    display: flex;
    align-items: center;
    overflow: auto;
    pointer-events: auto;
}
.tab, .addButton {
    user-select: none;
    display: flex;
    background-color: #333;
    color: #ccc;
    border: none;
    font-size: 15px;
    cursor: pointer;
    border-radius: 5px;
    padding: 10px;
    margin-left: 3px;
    margin-right: 3px;
    max-width: 200px;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: auto;
}
.tab.selected {
    background-color: #555;
    color: #fff;
}
.tab:not(.selected):hover, .addButton:hover {
    background-color: #444;
}
.tab.disabled{
    pointer-events: none;
}
@keyframes slideIn {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
#contextMenu {
    position: absolute;
    background-color: #333;
    color: #ccc;
    border: 1px solid #555;
    border-radius: 5px;
    padding: 5px;
    z-index: 1000;
}
.contextMenuOption {
    padding: 5px;
    cursor: pointer;
}
.contextMenuOption:hover {
    background-color: #444;
    color: #ddd;
}
.contextMenuOption.delete {
    color: red;
}




.unicode-container {
	max-width: 900px;
	margin-left: auto;
	margin-right: auto;
	padding: 9px;
	border: 0px;
	border-bottom: 1px;
	border-style: solid;
	border-color: var(--border-color);
}

.unicode-header {
    display: flex;
    align-items: center;
}

.unicode-title {
	margin: 4px;
	font-size: 15px;
	font-family: Roboto, sans-serif;
	color: var(--text-color);
	-webkit-user-select: none;
	-moz-user-select: none;
	user-select: none;
	pointer-events: none;
}

#unicode-checkbox {
    appearance: none; /* Remove default styling */
    width: 16px;
    height: 16px;
    margin-right: 10px;
    border: 2px solid var(--border-color);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    position: relative;
    background-color: #000; /* Background color when unchecked */
    transition: background-color 0.2s ease;
}
#unicode-checkbox:hover {
    background-color: #242424; /* Light background on hover */
}
#unicode-checkbox:checked {
    background-color: var(--border-color); /* Background color when checked */
}
#unicode-checkbox:checked::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0; /* Checkmark shape */
    transform: rotate(45deg); /* Rotate to form checkmark */
}


.subtitle {
    font-size: 14px;
    color: #fff;
    margin-top: 4px;
    font: caption;
}
`
document.head.appendChild(css);


    // Variables to store the init states
    let selectionUtilsInit = false;
    let tabUtilsInit = false;
    let unicodeInit = false;

    let chromaAnimation;

    const defaultSettings = {
        sel: {
            enabled: false,
            customColor: '#ff0000',
            borderStyle: 'solid',
            borderWidth: 3,
            chromaSpeed: 0
        },
        tabs: {
            enabled: false
        },
        uni: {
            search : false,
            maxShown: 250,
            sort: true,
            infoInRecipeModal: true,
        },
        misc: {
            copyHoveredElement: false,
            spawnUndiscovered: false
        }
    };

    function mergeSettings(saved, defaults) {
        for (let key in defaults) {
            if (defaults.hasOwnProperty(key)) {
                if (typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
                    saved[key] = mergeSettings(saved[key] || {}, defaults[key]);
                } else if (saved[key] === undefined) {
                    saved[key] = defaults[key];
                }
            }
        }
        return saved;
    }
    function saveSettings() {
        GM_setValue('settings', settings);
        document.documentElement.style.setProperty('--custom-outline', `${settings.sel.borderWidth}px ${settings.sel.borderStyle} ${settings.sel.customColor}`);
        document.documentElement.style.setProperty('--custom-background', hexToRgba(settings.sel.customColor, 0.3));

        const chromaSpeed = 10 / settings.sel.chromaSpeed;
        chromaAnimation = `chromaCycleOutline ${Math.abs(chromaSpeed)}s infinite linear${chromaSpeed < 0 ? ' reverse' : ''}, ` +
                          `chromaCycleBackground ${Math.abs(chromaSpeed)}s infinite linear${chromaSpeed < 0 ? ' reverse' : ''}` +
                          `${settings.sel.borderWidth >= 30 ? `, rotateBorder ${Math.abs(chromaSpeed)}s infinite linear${chromaSpeed < 0 ? ' reverse' : ''}` : ''}`
        document.documentElement.style.setProperty('--chroma-animation', chromaAnimation);
    }

    const handler = {
        set(target, property, value) {
            target[property] = value;
            saveSettings();  // Save settings whenever a property is set
            return true;
        },
        get(target, property) {
            if (typeof target[property] === 'object' && target[property] !== null) {
                return new Proxy(target[property], handler);  // Recursively apply the proxy to nested objects
            }
            return target[property];
        }
    };

    const mergedsettings = mergeSettings(GM_getValue('settings', {}), defaultSettings);
    const settings = new Proxy(mergedsettings, handler);






    function toggleSelectionUtils() {
        if (settings.sel.enabled) deselectAllInstances();
        else if (!selectionUtilsInit) initSelectionUtils();

        settings.sel.enabled = !settings.sel.enabled;
    }

    let externalSaveCurrentTab;
    function toggleTabUtils() {
        if (settings.tabs.enabled) {
            externalSaveCurrentTab();
            document.getElementById('tabBar').style.display = 'none'
        }
        else {
            if (!tabUtilsInit) initTabUtils();
            else document.getElementById('tabBar').style.display = 'flex';
        }

        settings.tabs.enabled = !settings.tabs.enabled;
        // location.reload();
    }

    let externalUpdateUnicodeSearch;
    let externalSearchUnicodeElements;
    function toggleUnicodeSearch() {
        if (settings.uni.search) {
            document.getElementById('unicode-checkbox').checked = false;
            document.querySelector('.unicode-container').style.display = 'none';
            externalUpdateUnicodeSearch([]);
        }
        else {
            if (!unicodeInit) initUnicodeSearch();
            document.querySelector('.unicode-container').style.display = 'block';
        }

        settings.uni.search = !settings.uni.search;
    }




    // Add buttons to toggle the modules
    function addToggleButtons() {
        const settingsContent = document.querySelector(".settings-content");
        if (settingsContent == null) {
            console.log("This script requires Infinite Craft Helper to function!");
            return;
        }

        const utilsSettingsContainer = document.createElement('div');
        utilsSettingsContainer.classList.add('setting');
        const utilsSettingsText = document.createTextNode('Utils Settings ');
        const utilsSettingsEmoji = document.createElement('span');
        utilsSettingsEmoji.textContent = '⚙️';
        utilsSettingsContainer.appendChild(utilsSettingsText);
        utilsSettingsContainer.appendChild(utilsSettingsEmoji);
        settingsContent.appendChild(utilsSettingsContainer);

        utilsSettingsContainer.addEventListener('click', function(e) {
            showUtilsSettingsMenu();
        });

        initUtilsSettingsMenu();
    };


    window.addEventListener('load', () => {
        addToggleButtons();
        if (settings.sel.enabled) initSelectionUtils();
        if (settings.tabs.enabled) initTabUtils();
        if (settings.uni.search) initUnicodeSearch();
    });





    const settingsModal = document.createElement('dialog');
    const settingsTitle = document.createElement('h1');
    const settingsContainer = document.createElement('div');
    let settingsEntries = [
        {
            name: "Selection Utils",
            description: "Enables Multi-selecting, Multi-copying and Multi-deleting using Right Click!",
            toggle: true,
            toggleState: () => settings.sel.enabled,
            toggleHandle: (elements) => toggleSelectionUtils(),
            inputs: [{
                label: "Color: ",
                type: "colorPicker",
                content: () => settings.sel.customColor,
                handle(elements) {
                    settings.sel.customColor = elements.value;
                }
            },
            {
                label: "Border Style: ",
                type: "dropdown",
                options: ["solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"],
                content: () => settings.sel.borderStyle,
                handle(value) {
                    settings.sel.borderStyle = value;
                }
            },
            {
                label: "Border Width: ",
                type: "number",
                content: () => settings.sel.borderWidth,
                handle(elements) {
                    settings.sel.borderWidth = Math.min(elements.value, 30);
                }
            },
            {
                label: "Chroma Speed: ",
                type: "number",
                content: () => settings.sel.chromaSpeed,
                handle(elements) {
                    settings.sel.chromaSpeed = Number(elements.value);
                }
            }]
        },
        {
            name: "Tab Utils",
            description: "saves all elements on screen into one Tab\n- Tabs save on reloading/closing Infinite Craft\n- Downloading/Uploading Tabs\n- Spawning entire Alphabets (right click the Add Button)",
            toggle: true,
            toggleState: () => settings.tabs.enabled,
            toggleHandle: (elements) => toggleTabUtils(),
        },
        {
            name: "Unicode Utils",
            description: "",
            inputs: [{
                label: "Unicode Search",
                description: "Enables searching in:\n- the Unicode Codepoint (e.g. U+0069)\n- the Unicode Name (e.g. LATIN CAPITAL LETTER A)",
                type: "toggle",
                content: () => settings.uni.search,
                handle(elements) {
                    toggleUnicodeSearch();
                }
            },
            {
                label: "Max Elements Displayed",
                type: "number",
                content: () => settings.uni.maxShown,
                handle(elements) {
                    settings.uni.maxShown = Number(elements.value);
                    externalSearchUnicodeElements();
                }
            },
            {
                label: "Sort Unicode Search",
                type: "toggle",
                content: () => settings.uni.sort,
                handle(elements) {
                    settings.uni.sort = !settings.uni.sort;
                    externalSearchUnicodeElements();
                }
            },
            {
                label: "Show Unicode Info in Recipe Menu",
                description: "e.g. U+0069 - LATIN SMALL LETTER I",
                type: "toggle",
                content: () => settings.uni.infoInRecipeModal,
                handle(elements) {
                    settings.uni.infoInRecipeModal = !settings.uni.infoInRecipeModal;
                }
            }]
        },
        {
            name: "Misc",
            description: "",
            inputs: [{
                label: "Copy Paste Elements: ",
                description: "Ctrl + C   to copy the text of a hovered Element\nCtrl + Shift + V   to paste Element(s)\nAlso works on Selections!\nYou can also paste in gigantic lists, for example all countries (just seperate each \"Word\" with a new line)",
                type: "toggle",
                content: () => settings.misc.copyHoveredElement,
                handle(elements) {
                    settings.misc.copyHoveredElement = !settings.misc.copyHoveredElement;
                }
            },
            {
                label: "Spawn not found Elements as Ghosts: ",
                description: "Works with Alphabet Spawning and Copy Paste Elements",
                type: "toggle",
                content: () => settings.misc.spawnUndiscovered,
                handle(elements) {
                    settings.misc.spawnUndiscovered = !settings.misc.spawnUndiscovered;
                }
            }]
        }
    ];

    function initUtilsSettingsMenu() {
    settingsModal.classList.add('modal');
    document.querySelector(".container").appendChild(settingsModal);

    const settingsHeader = document.createElement('div');
    settingsHeader.classList.add('modal-header');

    settingsTitle.classList.add('modal-title');
    settingsTitle.appendChild(document.createTextNode('Utils Settings'));
    settingsHeader.appendChild(settingsTitle);

    const closeButtonContainer = document.createElement('div');
    closeButtonContainer.classList.add('close-button-container');

    const closeButton = document.createElement('img');
    closeButton.src = closeIcon.trim();
    closeButton.classList.add('close-button');
    closeButtonContainer.appendChild(closeButton);

    closeButton.addEventListener('click', () => settingsModal.close());
    settingsHeader.appendChild(closeButtonContainer);

    settingsModal.appendChild(settingsHeader);

    settingsContainer.classList.add('utils-settings-container');
    settingsModal.appendChild(settingsContainer);

    settingsEntries.forEach(entry => {
        const block = document.createElement("div");
        block.classList.add("utils-setting-block");

        const name = document.createElement("h1");
        name.appendChild(document.createTextNode(entry.name));
        block.appendChild(name);

        if (entry.toggle) {
            const checkboxContainer = document.createElement("label");
            checkboxContainer.classList.add("checkbox-container");

            const toggleCheckbox = document.createElement("input");
            toggleCheckbox.classList.add("checkbox");
            toggleCheckbox.setAttribute("type", "checkbox");

            checkboxContainer.appendChild(toggleCheckbox);
            toggleCheckbox.checked = entry.toggleState();

            toggleCheckbox.addEventListener("change", function () {
                return entry.toggleHandle.call(this);
            });

            const slider = document.createElement("span");
            slider.classList.add("checkbox-slider");
            checkboxContainer.appendChild(slider);

            name.appendChild(checkboxContainer);
        }

        const description = document.createElement("p");
        description.classList.add("utils-input-description");
        description.innerHTML = entry.description.replaceAll("\n", "<br>");
        block.appendChild(description);

        // Handle inputs
        if (entry.inputs) {
            entry.inputs.forEach(input => {
                const inputWrapper = document.createElement("div");
                inputWrapper.classList.add("utils-input-wrapper");

                // Create label and toggle container
                const labelToggleContainer = document.createElement("div");
                labelToggleContainer.classList.add("label-toggle-container");

                const label = document.createElement("label");
                label.textContent = input.label;
                labelToggleContainer.appendChild(label);

                // Handle different input types
                if (input.type === "colorPicker") {
                    const colorInput = document.createElement("input");
                    colorInput.classList.add('utils-color-input');
                    colorInput.setAttribute("type", "color");
                    colorInput.value = input.content();
                    colorInput.addEventListener("input", function () {
                        input.handle(this);
                    });
                    labelToggleContainer.appendChild(colorInput);
                }

                if (input.type === "toggle") {
                    const toggleContainer = document.createElement("label");
                    toggleContainer.classList.add("checkbox-container");

                    const toggleCheckbox = document.createElement("input");
                    toggleCheckbox.classList.add("checkbox");
                    toggleCheckbox.setAttribute("type", "checkbox");
                    toggleContainer.appendChild(toggleCheckbox);

                    toggleCheckbox.checked = input.content();
                    toggleCheckbox.addEventListener("input", function () {
                        input.handle(this);
                    });

                    const toggleSlider = document.createElement("span");
                    toggleSlider.classList.add("checkbox-slider");
                    toggleContainer.appendChild(toggleSlider);
                    labelToggleContainer.appendChild(toggleContainer);
                }

                if (input.type === "number") {
                    const numberInput = document.createElement("input");
                    numberInput.classList.add('utils-number-input');
                    numberInput.setAttribute("type", "number");
                    numberInput.value = input.content();
                    numberInput.addEventListener("input", function () {
                        input.handle(this);
                    });
                    labelToggleContainer.appendChild(numberInput);
                }

                if (input.type === "dropdown") {
                    const dropdown = document.createElement("select");
                    dropdown.classList.add('utils-dropdown');
                    input.options.forEach(option => {
                        const optionElement = document.createElement("option");
                        optionElement.value = option;
                        optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                        if (option === input.content()) optionElement.selected = true;
                        dropdown.appendChild(optionElement);
                    });
                    dropdown.addEventListener("change", function () {
                        input.handle(this.value);
                    });
                    labelToggleContainer.appendChild(dropdown);
                }

                // Append label and toggle to inputWrapper
                inputWrapper.appendChild(labelToggleContainer);

                // Add description if it exists
                if (input.description) {
                    const subDescription = document.createElement("p");
                    subDescription.classList.add("utils-input-description");
                    subDescription.innerHTML = input.description.replaceAll("\n", "<br>");
                    inputWrapper.appendChild(subDescription);
                }

                block.appendChild(inputWrapper);
            });
        }

        settingsContainer.appendChild(block);
    });
}




function showUtilsSettingsMenu() {
    settingsModal.showModal();
}



















//            _______ _________ _____    _________   ______ _________ _____   ____   ____  _____
//           /  ___  |_   ___  |_   _|  |_   ___  |./ ___  |  _   _  |_   _|.'    \.|_   \|_   _|
//          |  (__ \_| | |_  \_| | |      | |_  \_| ./   \_|_/ | | \_| | | /  .--.  \ |   \ | |
//           '.___\-.  |  _|  _  | |   _  |  _|  _| |          | |     | | | |    | | | |\ \| |
//          |\\____) |_| |___/ |_| |__/ |_| |___/ | \.___.'\  _| |_   _| |_\  \--'  /_| |_\   |_
//          |_______.'_________|________|_________|\._____.' |_____| |_____|\.____.'|_____|\____|

    function initSelectionUtils() {
        let startX, startY, endX, endY, isSelecting = false, isDragging = false;
        let selectionBox = document.createElement('div');
        let dragStartX, dragStartY;


        // Call the function to add the button when the DOM is fully loaded
        selectionUtilsInit = true;
        init();


        function init() {

            const sidebarDiv = document.querySelector('.sidebar');

            // Create the Selection Box
            selectionBox.classList.add('selectionbox')
            selectionBox.style.display = 'none';
            document.querySelector('.container.dark-mode').insertBefore(selectionBox, document.querySelector('.instances'));
            saveSettings();


            // Patching duplicateInstance
            const originalDuplicateInstance = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].duplicateInstance;
            unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].duplicateInstance = function duplicateSelection(originalInstance, leftOffset = 10, topOffset = -10) {
                const duplicatedInstance = originalDuplicateInstance.call(this, originalInstance, leftOffset, topOffset);
                if (originalInstance.utilsSelected) {
                    getSelectedInstances().forEach(instance => {
                        if (instance != originalInstance && instance != duplicatedInstance && !instance.disabled) {
                            deselectInstance(instance);
                            const instanceCopy = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].duplicateInstance(instance, 0, 0);
                            selectInstance(instanceCopy);
                            isDragging = true;
                            dragStartX = mouseData.x, dragStartY = mouseData.y;
                        }
                    });
                    deselectInstance(originalInstance);
                    selectInstance(duplicatedInstance);
                }
                return duplicatedInstance;
            }
            // Patching selectInstance
            const originalSelectInstance = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].selectInstance;
            unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].selectInstance = function draggingOnSelectInstance(mouseEvent, instance) {
                const og = originalSelectInstance.call(this, mouseEvent, instance);
                if (mouseData.button === 2) {
                    if (instance.utilsSelected) deleteAllSelected();
                    isSelecting = false;
                    selectionBox.style.display = 'none';
                }
                else if ((mouseData.button === 0 || mouseData.button === 1) && instance.utilsSelected) {
                    isDragging = true;
                    dragStartX = mouseData.x, dragStartY = mouseData.y;
                }
                return og;
            }
        }

        document.addEventListener('mousedown', function(e) {
            mouseData.button = e.button;
            if (settings.sel.enabled && mouseData.button === 2 && // Right mouse button
                mouseData.x < window.innerWidth - document.getElementsByClassName('sidebar')[0].getBoundingClientRect().width) {
                startX = e.clientX;
                startY = e.clientY;
                isSelecting = true
                // Initialize the selection box
                selectionBox.style.left = `${startX}px`;
                selectionBox.style.top = `${startY}px`;
                selectionBox.style.width = '0px';
                selectionBox.style.height = '0px';
                selectionBox.style.display = 'block';
            }
        }, true);

        document.addEventListener('mousemove', function(e) {
            mouseData.x = e.clientX;
            mouseData.y = e.clientY;
            if (isSelecting) {
                // Update selection box position and size
                let width = Math.abs(mouseData.x - startX);
                const sidebarLimit = window.innerWidth - document.getElementsByClassName('sidebar')[0].getBoundingClientRect().width;
                if (mouseData.x > sidebarLimit) width = sidebarLimit - startX;
                else if (mouseData.x < 0) width = startX;

                let height = Math.abs(mouseData.y - startY);
                const bottomLimit = window.innerHeight;
                if (mouseData.y > bottomLimit) height = bottomLimit - startY;
                else if (mouseData.y < 0) height = startY;

                selectionBox.style.width = `${width}px`;
                selectionBox.style.height = `${height}px`;
                if (mouseData.x < startX) {
                    if (mouseData.x < 0) selectionBox.style.left = `${0}px`;
                    else selectionBox.style.left = `${mouseData.x}px`;
                }
                else selectionBox.style.left = `${startX}px`;
                if (mouseData.y < startY) {
                    if (mouseData.y < 0) selectionBox.style.top = `${0}px`;
                    else selectionBox.style.top = `${mouseData.y}px`;
                }
                else selectionBox.style.top = `${startY}px`;

            } else if (isDragging) {
                const deltaX = mouseData.x - dragStartX;
                const deltaY = mouseData.y - dragStartY;
                dragStartX = mouseData.x, dragStartY = mouseData.y;


                // Move all selected instances
                if (!e.ctrlKey) {
                    getSelectedInstances().forEach(instance => {
                        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstancePosition(
                            instance,
                            instance.left + deltaX,
                            instance.top  + deltaY);
                    });
                }
            }
        });

        document.addEventListener('mouseup', function(e) {
            if (e.button === 2 && isSelecting) { // Right Click
                isSelecting = false;
                endX = e.clientX;
                endY = e.clientY;
                selectionBox.style.display = 'none';

                // console.log(`Selected area from (${startX}, ${startY}) to (${endX}, ${endY})`);
                if (Math.abs(startX - endX) <= 20 && Math.abs(startY - endY) <= 20) deselectAllInstances();
                else {
                    const onScreenInstances = getAllInstances();
                    const newZIndex = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instanceId++;
                    onScreenInstances.forEach((instance) => {
                        const {left, top, height, width} = instance;
                        if (isInstanceInSelectedArea(left, top, height, width) && !instance.utilsSelected) {
                            selectInstance(instance);
                            instance.elem.style.setProperty("z-index", newZIndex);
                        }
                    });
                }
            }

            if (isDragging) {
                isDragging = false;
                if ((e.button === 1 || e.button === 0) // Left Click or Middle Click and beyond sidebar
                    && mouseData.x > window.innerWidth - document.getElementsByClassName('sidebar')[0].getBoundingClientRect().width) {
                    deleteAllSelected();
                }
            }
        });

        function isInstanceInSelectedArea(instanceLeft, instanceTop, instanceHeight, instanceWidth) {
            const selectionLeft = Math.min(startX, endX);
            const selectionRight = Math.max(startX, endX);
            const selectionTop = Math.min(startY, endY);
            const selectionBottom = Math.max(startY, endY);

            return !(instanceLeft + instanceWidth < selectionLeft || instanceLeft > selectionRight ||
                     instanceTop + instanceHeight < selectionTop || instanceTop > selectionBottom);
        }
    }

    function getSelectedInstances() {
        return getAllInstances().filter(x => x.utilsSelected);
    }

    function selectInstance(instance) {
        setTimeout(() => {
            instance.utilsSelected = true;
            instance.elem.style.animation = instance.elem.style.animation ? instance.elem.style.animation + ', ' + chromaAnimation : chromaAnimation;
            instance.elem.style.outline = 'var(--custom-outline)';
            instance.elem.style.background = 'var(--custom-background)';
            instance.elem.style.borderColor = 'transparent';
        }, 0);
    }
    function deselectInstance(instance) {
        instance.utilsSelected = false;
        instance.elem.style.animation = instance.elem.style.animation
            .split(',')
            .filter(anim =>
                !anim.includes('chromaCycleOutline') &&
                !anim.includes('chromaCycleBackground') &&
                !anim.includes('rotateBorder')
            )
            .join(', ');
        instance.elem.style.outline = '';
        instance.elem.style.background = '';
        instance.elem.style.borderColor = '';
    }

    function deselectAllInstances() {
        getSelectedInstances().forEach(instance => deselectInstance(instance));
    }
    function deleteAllSelected() {
        getSelectedInstances().forEach(instance => deleteInstance(instance));
    }

































//             _________      __      ______    _______
//            |  _   _  |    /  \    |_   _ \  /  ___  |
//            |_/ | | \_|   / /\ \     | |_) ||  (__ \_|
//                | |      / ____ \    |  __/. '.___\-.
//               _| |_   _/ /    \ \_ _| |__) |\\____) |
//              |_____| |____|  |____|_______/|_______.'

    function initTabUtils() {
        let currentTab = GM_getValue('currentTab', 0);
        const defaultData = [{elements: [], name: "Tab 1"}];
        if (GM_getValue('tabData') === undefined) {
            GM_setValue('tabData', defaultData);
        }

        const initIfElementsDataExists = () => {
            const elementsData = unsafeWindow.$nuxt?.$root?.$children[2]?.$children[0]?.$children[0]?._data?.elements;
            if (elementsData && elementsData.length > 0) {
                tabUtilsInit = true;
                externalSaveCurrentTab = saveCurrentTab;
                init();
                return true;
            }
        };
        // Initial check
        if (!initIfElementsDataExists()) {
            // Set up the observer only if the initial check fails
            const observer = new MutationObserver((mutations, obs) => {
                if (initIfElementsDataExists()) {
                    obs.disconnect();
                }
            });
            observer.observe(document, { childList: true, subtree: true });
        }

        function init() {
            const tabBar = document.createElement('div');
            tabBar.id = 'tabBar';

            const tabs = document.createElement('div');
            tabs.classList.add('tabs');
            tabBar.appendChild(tabs);

            const addButton = document.createElement('button');
            addButton.classList.add('addButton');
            addButton.textContent = '+';
            addButton.onclick = () => addTab(-1);
            addButton.oncontextmenu = (e) => {
                e.preventDefault();
                showContextMenu(e, 1);
            };
            tabBar.appendChild(addButton);

            document.querySelector('.container.dark-mode').appendChild(tabBar);
            positionTabBar();
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                const resizeObserver = new ResizeObserver(() => positionTabBar());
                resizeObserver.observe(sidebar);
            }
            try {
                refreshTabButtons();
                loadTab(currentTab);
            }
            catch (e) {
                console.error('Error loading tab data:', e);
                console.log(GM_getValue('tabData'));
                GM_setValue('currentTab', 0);
            }

            window.addEventListener('beforeunload', function() {
                saveCurrentTab();
            });
        }

        function positionTabBar() {
            const siteTitle = document.querySelector('.site-title');
            const sidebar = document.querySelector('.sidebar');
            if (siteTitle && sidebar) {
                const tabBar = document.getElementById('tabBar');
                tabBar.style.left = `${225}px`;
                tabBar.style.right = `${document.getElementsByClassName('sidebar')[0].getBoundingClientRect().width + 200}px`;
            }
        }

        function saveCurrentTab() {
            const elements = getAllInstances().map(instance => ({
                name: instance.text,
                x: instance.left,
                y: instance.top
            }));
            const tabData = GM_getValue('tabData');
            tabData[currentTab].elements = elements;
            GM_setValue('tabData', tabData);
        }

        function loadTab(index) {
            const tabData = GM_getValue('tabData');
            if (index >= tabData.length) index = 0;
            const tab = tabData[index];

            // Delete all except for selected
            if (getAllInstances().filter(x => x.utilsSelected).length > 0) {
                if (confirm('Do you want to copy the Selected Elements to the new Tab?')) {
                    getAllInstances().filter(x => !x.utilsSelected).forEach(instance => deleteInstance(instance));
                    getAllInstances().filter(x => x.utilsSelected).forEach(instance => unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstancePosition(instance, instance.left - 5, instance.top - 5));
                }
                else unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].clearInstances();
            }
            else unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].clearInstances();

            spawnElements(tab.elements);

            currentTab = index;
            GM_setValue('currentTab', currentTab);
        }

        function addTab(index = -1, data = null) {
            saveCurrentTab();
            const tabData = GM_getValue('tabData');
            const newTab = data || { elements: [], name: `Tab ${tabData.length + 1}` };
            let newIndex = index;
            if (index === -1 || index >= tabData.length) {
                tabData.push(newTab);
                newIndex = tabData.length - 1;
            } else {
                tabData.splice(index, 0, newTab);
            }

            GM_setValue('tabData', tabData);
            refreshTabButtons();
            switchTab(newIndex);

            const animatedTab = document.getElementById(`tab-${newIndex}`);
            animatedTab.style.animation = "slideIn 0.2s ease-out";
        }

        function duplicateTab(index) {
            saveCurrentTab();
            const tabData = GM_getValue('tabData');
            const newTab = JSON.parse(JSON.stringify(tabData[index]));
                addTab(index + 1, newTab);
        }

        function deleteTab(index) {
            const tabData = GM_getValue('tabData');
            if (tabData.length <= 1) {
                GM_setValue('tabData', defaultData);
                refreshTabButtons();
                unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].clearInstances();
            } else {
                tabData.splice(index, 1);
                if (currentTab > 0) currentTab--;
                GM_setValue('tabData', tabData);
                GM_setValue('currentTab', currentTab);
                loadTab(currentTab);

                const deletedTab = document.getElementById(`tab-${index}`);
                const sizer = document.createElement('div');
                sizer.classList.add('sizer');
                sizer.style.width = `${deletedTab.offsetWidth}px`;
                setTimeout(() => {
                    sizer.style.width = '0';
                    sizer.style.transition = 'width 0.2s ease-out';
                    sizer.addEventListener('transitionend', () => {
                        sizer.remove();
                    });
                }, 0);

                refreshTabButtons();
                const tabsContainer = document.querySelector('.tabs');
                const tabs = tabsContainer.querySelectorAll('.tab');
                tabsContainer.insertBefore(sizer, tabs[index]);
            }
        }

        function switchTab(index) {
            if (currentTab !== index) {
                saveCurrentTab();
                loadTab(index);
                document.querySelectorAll('.tab').forEach(button => button.classList.remove('selected'));
                document.getElementById(`tab-${index}`).classList.add('selected');
            }
        }

        function renameTab(index) {
            const tabData = GM_getValue('tabData');
            const newName = prompt('Enter new name for the tab:', tabData[index].name || `Tab ${index + 1}`);
            if (newName) {
                tabData[index].name = newName;
                GM_setValue('tabData', tabData);
                document.getElementById(`tab-${index}`).textContent = newName;
            }
        }

        function downloadTab(index) {
            saveCurrentTab();
            const tab = GM_getValue('tabData')[index];
            const blob = new Blob([JSON.stringify(tab)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ICTAB ${tab.name}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function uploadTab() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'application/json,text/plain';
            input.onchange = event => {
                const file = event.target.files[0];
                const reader = new FileReader();
                reader.onload = e => {
                    try {
                        if (file.type === 'application/json') {
                            const data = JSON.parse(e.target.result);

                            data.elements.forEach((element, index) => { // Check each element in the elements array
                                if (typeof element.name !== 'string' || typeof element.x !== 'number' || typeof element.y !== 'number') {
                                    throw new Error(`Invalid element at index ${index}: Must have "name" (string), "x" (number), and "y" (number) properties`);
                                }
                            });
                            addTab(-1, data); // Adding the uploaded tab at the end
                        }
                        else if (file.type === 'text/plain') {
                            const text = e.target.result;
                            const lines = text.split('\n');
                            const elements = [];
                            let colIndex = 0, rowIndex = 0;

                            lines.forEach(line => {
                                if (line.trim() === '') {
                                    colIndex++;
                                    rowIndex = 0;
                                } else {
                                    elements.push({
                                        name: line.trim(),
                                        x: 100 + colIndex * 100,
                                        y: 50 + rowIndex * 50
                                    });
                                    rowIndex++;
                                }
                            });

                            addTab(-1, {elements, name: `Tab ${GM_getValue('tabData').length + 1}`});
                        } else {
                            throw new Error('Unsupported file type');
                        }
                    } catch (error) {
                        alert(`Error uploading file: ${error.message}`);
                        console.error('Upload error:', error);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }

        function createTabButton(index, name) {
            const tabs = document.querySelector('.tabs');
            const tabButton = document.createElement('button');
            tabButton.id = `tab-${index}`;
            tabButton.classList.add('tab');
            if (currentTab === index) tabButton.classList.add('selected');

            tabButton.textContent = name || `Tab ${index + 1}`;
            tabButton.draggable = true;
            tabButton.addEventListener('dragstart', (e) => handleDragStart(e, index));
            tabButton.addEventListener('dragover', handleDragOver);
            tabButton.addEventListener('drop', (e) => handleDrop(e, index));
            tabButton.onmousedown = () => switchTab(index);
            tabButton.oncontextmenu = (e) => {
                e.preventDefault();
                showContextMenu(e, 0, index);
            };

            tabButton.addEventListener('animationend', () => {
                tabButton.style.animation = 'none';
            });

            const tabBar = document.getElementById('tabs');
            const referenceNode = document.getElementById(`tab-${index + 1}`) || tabs.querySelector('.addButton');
            tabs.insertBefore(tabButton, referenceNode);
        }

        function refreshTabButtons() {
            const tabs = document.querySelector('.tabs');
            const storedTabs = GM_getValue('tabData');
            tabs.querySelectorAll('.tab').forEach(tab => tabs.removeChild(tab));
            storedTabs.forEach((tab, index) => createTabButton(index, tab.name));

            tabs.querySelectorAll('.sizer').forEach(sizer => sizer.remove());
        }

        function showContextMenu(event, menu, index) {
            const existingMenu = document.getElementById('contextMenu');
            if (existingMenu) {
                document.body.removeChild(existingMenu);
            }

            const contextMenu = document.createElement('div');
            contextMenu.id = 'contextMenu';

            if (menu === 0) { // tab menu
                const renameOption = document.createElement('div');
                renameOption.classList.add('contextMenuOption');
                renameOption.textContent = 'Rename';
                renameOption.onclick = () => renameTab(index);
                contextMenu.appendChild(renameOption);

                const duplicateOption = document.createElement('div');
                duplicateOption.classList.add('contextMenuOption');
                duplicateOption.textContent = 'Duplicate';
                duplicateOption.onclick = () => duplicateTab(index);
                contextMenu.appendChild(duplicateOption);

                const downloadOption = document.createElement('div');
                downloadOption.classList.add('contextMenuOption');
                downloadOption.textContent = 'Download Tab';
                downloadOption.onclick = () => downloadTab(index);
                contextMenu.appendChild(downloadOption);

                const deleteOption = document.createElement('div');
                deleteOption.classList.add('contextMenuOption', 'delete');
                deleteOption.textContent = 'Delete';
                deleteOption.onclick = () => deleteTab(index);
                contextMenu.appendChild(deleteOption);
            }
            else if (menu === 1) { // add button menu
                const uploadOption = document.createElement('div');
                uploadOption.classList.add('contextMenuOption');
                uploadOption.textContent = 'Upload Tab';
                uploadOption.onclick = uploadTab;
                contextMenu.appendChild(uploadOption);

                const spawnAlphabetOption = document.createElement('div');
                spawnAlphabetOption.classList.add('contextMenuOption');
                spawnAlphabetOption.textContent = 'Spawn Alphabet';
                spawnAlphabetOption.onclick = () => promptAlphabets();
                contextMenu.appendChild(spawnAlphabetOption);
            }


            document.body.appendChild(contextMenu);
            contextMenu.style.left = `${event.pageX}px`;
            contextMenu.style.top = `${event.pageY}px`;

            document.addEventListener('click', () => {
                if (document.body.contains(contextMenu)) {
                    document.body.removeChild(contextMenu);
                }
            }, { once: true });
        }

        let draggedIndex = null;

        function handleDragStart(e, index) {
            draggedIndex = index;
            e.dataTransfer.effectAllowed = 'move';
            switchTab(index);
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }

        function handleDrop(e, index) {
            e.preventDefault();
            if (draggedIndex !== null && draggedIndex !== index) {
                const tabData = GM_getValue('tabData');
                const draggedTab = tabData.splice(draggedIndex, 1)[0];
                tabData.splice(index, 0, draggedTab);
                GM_setValue('tabData', tabData);
                currentTab = index;
                refreshTabButtons();
            }
            draggedIndex = null;
        }


        function getAllAlphabets() {
            const counters = {};
            JSON.parse(localStorage.getItem("infinite-craft-data")).elements.map(e => e.text.toLowerCase()).forEach(e => {
                const letters = e.match(/[a-zA-Z]/g);
                if (letters && letters.length === 1) (counters[e.replace(letters[0], 'x')] ||= new Set()).add(letters[0]);
                });
            const alphabets = Object.entries(counters)
                .map(([key, set]) => ({ alphabet: key, completeness: set.size }))
                .filter(e => e.completeness >= 3)
                .sort((a, b) => b.completeness - a.completeness);

            return alphabets;
        }

        function promptAlphabets() {
            const userInput = prompt("Enter Alphabet(s) separated by Double Spaces:\nFor Example: 'x   .x   _x   x!'\n\n- only spawns 'correctly' capitalized elements\n- use a capital X to not replace it\n- Type 'E' to spawn all your E's\n- Type 'all' to spawn all YOUR Alphabets!");
            if (!userInput) return [];
            if (userInput.toLowerCase() === "all") {
                const alphabets = getAllAlphabets();
                console.table(alphabets);
                addTab(-1, {elements: [], name: `All Alphabets (${alphabets.filter(a => a.completeness === 26).length}/${alphabets.length})`});
                spawnAlphabets(alphabets.map(e => e.alphabet), 'abcdefghijklmnopqrstuvwxyz'.split(''));
                return;
            }
            addTab(-1, {elements: [], name: userInput});
            if (/^[A-Z]$/.test(userInput)) {  // 1 Letter
                const alphabets = getAllAlphabets();
                spawnAlphabets(alphabets.map(e => e.alphabet), [userInput], true);
            }
            else spawnAlphabets(userInput.split(/  /), 'abcdefghijklmnopqrstuvwxyz'.split(''));
        }

        function spawnAlphabets(patterns, letters, flip = false) {
            const elements = [];

            patterns.forEach((pattern, rowIndex) => {
                letters.forEach((char, colIndex) => {
                    const newElement = {
                        name: icCasing(pattern.replace('x', char)),
                        x: flip ? (100 + colIndex * 100) : (100 + rowIndex * 100),
                        y: flip ? (50 + rowIndex * 50) : (50 + colIndex * 50)
                    };
                    elements.push(newElement);
                });
            });
            spawnElements(elements);
        }
    }
































//            _____  _____ ____  _____ _____   ______   ____   ________   _________      _______ _________      __      _______      ______ ____  ____
//           |_   _||_   _|_   \|_   _|_   _|./ ___  |.'    \.|_   ___ \.|_   ___  |    /  ___  |_   ___  |    /  \    |_   __ \   ./ ___  |_   ||   _|
//             | |    | |   |   \ | |   | | / ./   \_|  .--.  \ | |   \. \ | |_  \_|   |  (__ \_| | |_  \_|   / /\ \     | |__) | / ./   \_| | |__| |
//             | '    ' |   | |\ \| |   | | | |      | |    | | | |    | | |  _|  _     '.___\-.  |  _|  _   / ____ \    |  __ /  | |        |  __  |
//              \ \--' /   _| |_\   |_ _| |_\ \.___.'\  \--'  /_| |___.' /_| |___/ |   |\\____) |_| |___/ |_/ /    \ \_ _| |  \ \_\ \.___.'\_| |  | |_
//               \.__.'   |_____|\____|_____|\._____.'\.____.'|________.'|_________|   |_______.'_________|____|  |____|____| |___|\._____.'____||____|
//

    function initUnicodeSearch() {
        const unicodeMap = {};
        fetchUnicodeData();

        const unicodeContainer = document.createElement("div");
        const header = document.createElement('div');
        const unicodeTitle = document.createElement('div');
        const unicodeCheckbox = document.createElement('input');

        init();
        unicodeInit = true;
        externalUpdateUnicodeSearch = updateUnicodeSearch;
        externalSearchUnicodeElements = searchUnicodeElements;

        function init() {
            unicodeCheckbox.type = 'checkbox';
            unicodeCheckbox.id = 'unicode-checkbox';
            unicodeCheckbox.checked = unicodeCheckbox.checked;
            unicodeCheckbox.addEventListener('change', toggleUnicodeSearch);

            unicodeContainer.classList.add('unicode-container');

            header.classList.add('unicode-header');

            unicodeTitle.classList.add('unicode-title');
            unicodeTitle.appendChild(document.createTextNode('Unicode Search - 0'));

            header.appendChild(unicodeCheckbox);
            header.appendChild(unicodeTitle);
            unicodeContainer.appendChild(header);

            document.querySelector(".pinned").after(unicodeContainer);

            // Event listener on search
            const search = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].$refs.search;
            search.addEventListener("input", function(e) {
                searchUnicodeElements(e.target.value);
            });


            // MutationObserver on Recipe Modal Open
            const recipeModal = document.querySelector('.modal');

            function checkModalOpen() {
                if (settings.uni.infoInRecipeModal && recipeModal.hasAttribute('open')) {
                    const titleElement = recipeModal.querySelector('.modal-title');
                    const titleText = titleElement.childNodes[1].nodeValue.trim()

                    if (isSingleUnicodeCharacter(titleText)) {
                        // Remove any existing subtitle
                        let existingSubtitle = recipeModal.querySelector('.subtitle');
                        if (existingSubtitle) existingSubtitle.remove();

                        const codePoint = titleText.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
                        const unicodeName = unicodeMap[codePoint] || '';
                        const subtitle = document.createElement('div');
                        subtitle.textContent = `U+${codePoint.padStart(4, '0') || "no codepoint found"} - ${unicodeName || "no name found"}`;
                        subtitle.classList.add('subtitle');
                        titleElement.appendChild(subtitle);
                    }
                }
            }
            const observer = new MutationObserver(checkModalOpen);
            observer.observe(recipeModal, { attributes: true, subtree: true });

            // Patch getCraftResponse
            const getCraftResponse = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].getCraftResponse;
		        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].getCraftResponse = exportFunction((...args) => new window.Promise(async (resolve) => {
		        	  const response = await getCraftResponse(...args);
                if (unicodeCheckbox.checked && isSingleUnicodeCharacter(response.result)) setTimeout(() => searchUnicodeElements(), 0);
                return resolve(response);
            }));

            // Watch for changes in showDiscoveredOnly using $watch method
            unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].$watch('showDiscoveredOnly', function(newVal, oldVal) {
                searchUnicodeElements();
            });
        }

        const isSingleUnicodeCharacter = (char) => Array.from(char).length === 1;

        function toggleUnicodeSearch() {
            // Hide search results and disable search
            if (!unicodeCheckbox.checked) updateUnicodeSearch([]);
            // Search with current Searchquery
            else searchUnicodeElements();
        }

        function fetchUnicodeData() {
            GM.xmlHttpRequest({
                method: "GET",
                url: "https://unicode.org/Public/UNIDATA/UnicodeData.txt",
                onload: function(response) {
                    if (response.status === 200) {
                        const parsedData = parseUnicodeData(response.responseText);
                        Object.assign(unicodeMap, parsedData); // Populate the unicodeMap
                    } else {
                        console.error("Failed to load Unicode data:", response.status, response.statusText);
                    }
                },
                onerror: function(error) {
                    console.error("Error fetching Unicode data:", error);
                }
            });
        }

        function parseUnicodeData(unicodeText) {
            const unicodeMap = {};
            const lines = unicodeText.trim().split('\n');
            lines.forEach(line => {
                const fields = line.split(';');
                const codePoint = fields[0];
                const name = fields[1];
                if (codePoint && name) {
                    unicodeMap[codePoint] = name;
                }
            });
            return unicodeMap;
        }

        function updateUnicodeSearch(elements = []) {
            unicodeContainer.innerHTML = ""; // Clear container content
            unicodeContainer.appendChild(header);

            const sidebarUnicodeElements = fetchEmojiAndDiscovery(elements);
            unicodeTitle.textContent = "Unicode Search - " + sidebarUnicodeElements.length;

            for (const unicodeElement of sidebarUnicodeElements.slice(0, settings.uni.maxShown)) {
                const elementDiv = document.createElement('div');
                elementDiv.classList.add('item');
                if (unicodeElement.discovered) elementDiv.classList.add("item-discovered");
                const elementEmoji = document.createElement('span');
                elementEmoji.classList.add('item-emoji');
                elementEmoji.appendChild(document.createTextNode(unicodeElement.emoji ?? '⬜'));
                elementDiv.appendChild(elementEmoji);
                elementDiv.appendChild(document.createTextNode(` ${unicodeElement.text} `));
                elementDiv.addEventListener('mousedown', (e) => {
                    unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].selectElement(e, cloneInto(unicodeElement, unsafeWindow));
                });
                unicodeContainer.appendChild(elementDiv);
            }
        }

        function searchUnicodeElements(query = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].searchQuery) {
            if (!unicodeCheckbox.checked) return;
            const showDiscoveredOnly = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].showDiscoveredOnly;
            const filteredElements = Object.values(unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements)
                .filter(element => {
                    if (!isSingleUnicodeCharacter(element.text) || (showDiscoveredOnly && !element.discovered)) return false;

                    const codePoint = element.text.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
                    const name = unicodeMap[codePoint] || "";
                    return ("U+" + codePoint).includes(query.toUpperCase()) || name.includes(query.toUpperCase()); // Match code point or name
                })
                .map(el => el.text);
            if (settings.uni.sort) filteredElements.sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
            updateUnicodeSearch(filteredElements);
        }
    }
































































//             ____    ____ _____  _______   ______
//            |_   \  /   _|_   _|/  ___  |./ ___  |
//              |   \/   |   | | |  (__ \_| ./   \_|
//              | |\  /| |   | |  '.___\-.| |
//             _| |_\/_| |_ _| |_|\\____) | \.___.'\
//            |_____||_____|_____|_______.'\._____.'


    // Copy Elements On Hover
    let ctrlCHandled = false;
    let ctrlShiftVHandled = false;
    document.addEventListener('keydown', function(e) {
        if (settings.misc.copyHoveredElement && e.ctrlKey && e.key.toLowerCase() === 'c' && !ctrlCHandled) {
            const hoveredElement = document.elementFromPoint(mouseData.x, mouseData.y);

            if (hoveredElement.classList.contains('item')) {
                let copyText;

                if (hoveredElement.classList.contains('instance')) {
                    getAllInstances().forEach(instance => {
                        if (instance.elem === hoveredElement && instance.utilsSelected) {
                            copyText = generateClipboardText(getSelectedInstances())
                        }
                    });
                }

                if (!copyText) {
                    copyText = hoveredElement.childNodes[1].nodeValue.trim();
                }
                navigator.clipboard.writeText(copyText);
                console.log('Copied to clipboard:\n', copyText);
            }
            ctrlCHandled = true;
        }


        if (settings.misc.copyHoveredElement && e.ctrlKey && e.shiftKey && e.key === 'V' && !ctrlShiftVHandled && mouseData.x < window.innerWidth - document.getElementsByClassName('sidebar')[0].getBoundingClientRect().width) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const elements = parsePastedText(text);
                spawnElements(elements);
            }).catch(err => {
                console.error('Failed to read clipboard contents:', err);
            });
            ctrlShiftVHandled = true;
        }
    });
    document.addEventListener('keyup', function(e) {
        // Reset the flags when keys are released
        if (e.key.toLowerCase() === 'c' && e.ctrlKey) {
            ctrlCHandled = false;
        }
        if (e.key === 'V' && e.ctrlKey && e.shiftKey) {
            ctrlShiftVHandled = false;
        }
    });

    function generateClipboardText(elements) {
        return elements.map(element => {
            const xOffset = (element.left - mouseData.x).toFixed(2);
            const yOffset = (element.top - mouseData.y).toFixed(2);
            return `${element.text}  ${xOffset} ${yOffset}`;
        }).join('\n');
    }

    function parsePastedText(text) {
        let coordLessCounter = 0;
        return text.trim().split('\n').map(line => {
            const parts = line.split('  '); // Double space separator
            if (parts.length < 1) return null; // Skip malformed lines

            let xSkips = Math.floor(coordLessCounter / 25);
            let xOffset = -25 + (xSkips * 200), yOffset = -25 + ((coordLessCounter - (xSkips * 25)) * 50);
            if (parts.length >= 2) {
                [xOffset, yOffset] = parts[1].split(' ').map(Number);
            }
            else coordLessCounter += 1;
            return {
                name: parts[0].trim(),
                x: mouseData.x + xOffset || mouseData.x,
                y: mouseData.y + yOffset || mouseData.y
            };
        }).filter(Boolean);
    }























//              ______   _________ ____  _____ _________ _______         __      _____        _________ _____  _____ ____  _____   ______ _________ _____   ____   ____  _____  _______
//            .' ___  | |_   ___  |_   \|_   _|_   ___  |_   __ \       /  \    |_   _|      |_   ___  |_   _||_   _|_   \|_   _|./ ___  |  _   _  |_   _|.'    \.|_   \|_   _|/  ___  |
//           / .'   \_|   | |_  \_| |   \ | |   | |_  \_| | |__) |     / /\ \     | |          | |_  \_| | |    | |   |   \ | | / ./   \_|_/ | | \_| | | /  .--.  \ |   \ | | |  (__ \_|
//           | |    ____  |  _|  _  | |\ \| |   |  _|  _  |  __ /     / ____ \    | |   _      |  _|     | '    ' |   | |\ \| | | |          | |     | | | |    | | | |\ \| |  '.___\-.
//           \ \.___]  _|_| |___/ |_| |_\   |_ _| |___/ |_| |  \ \_ _/ /    \ \_ _| |__/ |    _| |_       \ \--' /   _| |_\   |_\ \.___.'\  _| |_   _| |_\  \--'  /_| |_\   |_|\\____) |
//            \._____.' |_________|_____|\____|_________|____| |___|____|  |____|________|   |_____|       \.__.'   |_____|\____|\._____.' |_____| |_____|\.____.'|_____|\____|_______.'



    const mouseData = {
	  	  down: false,
        button: 0,
	  	  x: null,
	  	  y: null,
	  	  deltaX: null,
	  	  deltaY: null
	  }


    function getAllInstances() {
        return unsafeWindow.$nuxt._route.matched[0].instances.default._data.instances.filter(x => !x.hide);
    }

    function deleteInstance(instance) {
        const instances = unsafeWindow.$nuxt._route.matched[0].instances.default._data.instances;
        const index = instances.indexOf(instance);
        if (index >= 0) instances.splice(instances.indexOf(instance), 1); // Remove instance from instances array
        else warn("Tried to delete an instance that does not exist:", instance);
    }

    function deleteAllInstances() {
        getAllInstances().forEach(instance => deleteInstance(instance));
    }

    function fetchEmojiAndDiscovery(texts) {
        const elementsMap = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.reduce((map, elem) => {
            map[elem.text] = elem;
            return map;
        }, {});

        return texts.map(text => elementsMap[text] ? elementsMap[text] : false);
    }

    function spawnElements(elements) {
        const fetchedDataMap = fetchEmojiAndDiscovery(elements.map(e => e.name))
            .reduce((map, item) => {
                map[item.text] = item;
                return map;
            }, {});

        elements.forEach(savedElem => {
            const data = fetchedDataMap[savedElem.name];
            if (data) spawnElement(data, savedElem.x, savedElem.y);
            else if (settings.misc.spawnUndiscovered && savedElem.name.length <= 320) spawnElement({text: savedElem.name, emoji: "​"}, savedElem.x, savedElem.y, true);
        });
    }

    function spawnElement(element, x = 0, y = 0, disabled = false) {
        const data = {
            id: unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instanceId++,
            text: element.text,
            emoji: element.emoji,
            discovered: element.discovered,
            disabled: false,
            left: 0,
            top: 0,
            offsetX: 0.5,
            offsetY: 0.5,
        };
        const instance = cloneInto(data, unsafeWindow);
        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instances.push(instance);
        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].$nextTick(
            exportFunction(() => {
                unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstancePosition(
                    instance,
                    x,
                    y
                );
                unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstanceZIndex(instance, 0);
                unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].calcInstanceSize(instance);
                if (disabled) { // Ghost Elements, SPOOKYY!!!
                    instance.disabled = disabled;
                    instance.elem.style.animation = 'none';
                    instance.elem.style.border = 'none'
                    instance.elem.style.color = 'rgba(255, 255, 255, 0.3)'
                }
            }, unsafeWindow)
        );
    }

    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function icCasing(str) {
        return str.split('').map((char, index, arr) => {
            if (index === 0 || arr[index - 1] === ' ') {
                return char.toUpperCase();
            } else {
                return char.toLowerCase();
            }
        }).join('');
    }
})();
