// ==UserScript==
// @name         Infinite Craft More Pins & Colored Tabs (Refactored)
// @version      1.1.1
// @namespace    https://github.com/ChessScholar
// @description  Create tabs to group items and color them for organization.
// @author       ChessScholar
// @match        https://neal.fun/infinite-craft/
// @icon         https://neal.fun/favicons/infinite-craft.png
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// @compatible   chrome
// @compatible   firefox
// @license      MIT
// @credits      adrianmgg for original "tweaks" script.
// @downloadURL https://update.greasyfork.org/scripts/522960/Infinite%20Craft%20More%20%20Colored%20Tabs.user.js
// @updateURL https://update.greasyfork.org/scripts/522960/Infinite%20Craft%20%20Colored%20Tabs.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // --- Utility Functions ---
    const createElement = (tagName, options = {}) => {
        const elem = document.createElement(tagName);
        Object.entries(options).forEach(([key, value]) => {
            if (key === 'style') Object.assign(elem.style, value);
            else if (key === 'attrs') Object.entries(value).forEach(([attr, val]) => elem.setAttribute(attr, val));
            else if (key === 'dataset') Object.entries(value).forEach(([dataKey, dataVal]) => elem.dataset[dataKey] = dataVal);
            else if (key === 'events') Object.entries(value).forEach(([event, handler]) => elem.addEventListener(event, handler));
            else if (key === 'classList') elem.classList.add(...value);
            else if (key === 'children') value.forEach(child => elem.appendChild(child));
            else if (key === 'parent') value.appendChild(elem);
            else if (key === 'insertBefore') value.insertBefore(elem, options.insertBefore);
            else elem[key] = value;
        });
        return elem;
    };

    class GMValue {
        constructor(key, defaultValue) {
            this.key = key;
            this.defaultValue = defaultValue;
        }
        async set(value) {
            await GM_setValue(this.key, value);
        }
        async get() {
            return await GM_getValue(this.key, this.defaultValue);
        }
    }

    const VAL_COMBOS = new GMValue('infinitecraft_observed_combos', {});
    const VAL_PINNED_SETS = new GMValue('infinitecraft_pinned_sets', {});

    const getICMain = () => unsafeWindow?.$nuxt?._route?.matched?.[0]?.instances?.default;

    const saveCraftingCombo = async (lhs, rhs, result) => {
        const combos = await VAL_COMBOS.get();
        const sortedPair = [lhs, rhs].sort();
        if (!combos[result]) combos[result] = [];
        if (!combos[result].some(pair => pair[0] === sortedPair[0] && pair[1] === sortedPair[1])) {
            combos[result].push(sortedPair);
            await VAL_COMBOS.set(combos);
            console.log(`Crafted ${lhs} + ${rhs} -> ${result}`);
        }
    };

    const getCraftingCombos = async () => await VAL_COMBOS.get();

    // --- UI Element Creation ---
    const createItemElement = (element, cssScopeDatasetKey) => createElement('div', {
        classList: ['item'],
        dataset: { [cssScopeDatasetKey]: '' },
        children: [
            createElement('span', {
                classList: ['item-emoji'],
                dataset: { [cssScopeDatasetKey]: '' },
                textContent: element.emoji,
                style: { pointerEvents: 'none' },
            }),
            document.createTextNode(` ${element.text} `),
        ],
    });

    const createLinkedItemElement = (element, cssScopeDatasetKey, scrollFn) => {
        const item = createItemElement(element, cssScopeDatasetKey);
        item.dataset.comboviewerElement = element.text;
        item.addEventListener('click', scrollFn);
        return item;
    };

    const createControlsButton = (label, handler, sideControls) => {
        createElement('div', {
            parent: sideControls,
            textContent: label,
            style: { cursor: 'pointer', color: '#040404' },
            events: { click: handler },
        });
    };

    const createPinnedTabElement = (setname, sets, loadPinnedSets, pinnedItemsContainer, colorWheelDialogs) => {
        const setContainer = createElement('div', {
            dataset: { pinnedSet: setname },
            classList: ['pinned-set'],
            style: {
                background: sets[setname].color || 'var(--sidebar-bg)',
                padding: '5px',
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                flexShrink: '0',
                maxWidth: '200px',
                overflow: 'hidden',
                cursor: 'grab'
            },
            children: [
                createElement('div', {
                    textContent: setname,
                    style: {
                        fontWeight: 'bold',
                        userSelect: 'none',
                        zIndex: '11',
                        flex: '1',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'center'
                    },
                    events: {
                        click: (e) => toggleSetVisibility(e, setContainer, setname, sets, pinnedItemsContainer)
                    }
                }),
                createElement('div', {
                    style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '5px' },
                    children: [
                        createElement('span', { textContent: 'x', style: { cursor: 'pointer', zIndex: '12', fontSize: '12px', marginRight: '5px' },
                            events: { click: (e) => deletePinnedSet(e, setname, loadPinnedSets) }
                        }),
                        createElement('span', { textContent: '\u{1F4DD}', style: { cursor: 'pointer', zIndex: '12', fontSize: '12px', marginRight: '5px' },
                            events: { click: (e) => renamePinnedSet(e, setname, loadPinnedSets) }
                        }),
                        createElement('span', { textContent: '\u{1F3A8}', style: { cursor: 'pointer', zIndex: '12', fontSize: '12px' },
                            events: { click: (e) => { e.stopPropagation(); colorWheelDialogs[setname].style.display = 'block'; colorWheelDialogs[setname].showModal(); } }
                        })
                    ]
                })
            ]
        });
        return setContainer;
    };

    const createSetItemContainer = (setname, sets) => createElement('div', {
        dataset: { setItems: setname },
        classList: ['set-items'],
        style: {
            display: 'none',
            flexWrap: 'wrap',
            background: sets[setname].color || 'var(--sidebar-bg)'
        }
    });

    // --- Helper Functions ---
    const nonBlockingChunked = (chunkSize, iteratorFn, timeout = 0) => new Promise(resolve => {
        const iterator = iteratorFn();
        (function processChunk() {
            for (let i = 0; i < chunkSize; i++) {
                const { done } = iterator.next();
                if (done) {
                    resolve();
                    return;
                }
            }
            setTimeout(processChunk, timeout);
        })();
    });

    const hsvToRgb = (h, s, v) => {
        const i = Math.floor(h / 60);
        const f = h / 60 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        let r, g, b;
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    // --- Pinned Set Management ---
    async function addPinnedElementToSet(element, setname, pinnedItemsContainer) {
        const sets = await VAL_PINNED_SETS.get();
        const setItemContainer = pinnedItemsContainer.querySelector(`[data-set-items="${CSS.escape(setname)}"]`);
        const elementExists = Array.from(setItemContainer.children).some(child => child.textContent.trim() === element.text);

        if (sets[setname] && !elementExists) {
            const elementElement = createItemElement(element, Object.keys(getICMain().$el.dataset)[0]);
            Object.assign(elementElement.style, { zIndex: '10', display: 'inline-block' });
            elementElement.addEventListener('mousedown', async (e) => {
                if (e.buttons === 4) { // Keep middle click removal
                    setItemContainer.removeChild(elementElement);
                    sets[setname].elements = sets[setname].elements.filter(e => e !== element.text);
                    await VAL_PINNED_SETS.set(sets);
                    return;
                }
                getICMain().selectElement(e, element);
            });
            setItemContainer.appendChild(elementElement);
            sets[setname].elements.push(element.text);
            await VAL_PINNED_SETS.set(sets);
        }
    }

    async function addPinnedElement(element, setnames, pinnedItemsContainer) {
        const sets = await VAL_PINNED_SETS.get();
        for (const setname of setnames) {
            if (sets[setname] && !sets[setname].elements.includes(element.text)) {
                await addPinnedElementToSet(element, setname, pinnedItemsContainer);
            }
        }
    }

    async function deletePinnedSet(event, setname, loadPinnedSets) {
        event.stopPropagation();
        if (confirm(`Are you sure you want to delete the set "${setname}"?`)) {
            const sets = await VAL_PINNED_SETS.get();
            delete sets[setname];
            await VAL_PINNED_SETS.set(sets);
            await loadPinnedSets();
        }
    }

    async function renamePinnedSet(event, oldSetname, loadPinnedSets) {
        event.stopPropagation();
        const newSetName = prompt("Enter new set name:", oldSetname);
        if (newSetName && newSetName !== oldSetname) {
            const sets = await VAL_PINNED_SETS.get();
            if (sets[newSetName]) {
                alert("A set with this name already exists.");
                return;
            }
            sets[newSetName] = sets[oldSetname];
            delete sets[oldSetname];
            await VAL_PINNED_SETS.set(sets);
            await loadPinnedSets();
        }
    }

    function toggleSetVisibility(event, setContainer, setname, sets, pinnedItemsContainer) {
        event.stopPropagation();
        const isSelected = setContainer.classList.contains('selected-set');
        setContainer.style.outline = isSelected ? 'none' : '2px solid darkgray';
        setContainer.classList.toggle('selected-set');
        const itemsContainer = pinnedItemsContainer.querySelector(`[data-set-items="${CSS.escape(setname)}"]`);
        if (itemsContainer) {
            itemsContainer.style.display = isSelected ? 'none' : 'block';
            itemsContainer.style.background = sets[setname].color;
        }
    }

    const createColorWheelDialog = (setname, setContainer, pinnedItemsContainer) => {
        const colorWheel = createElement('dialog', {
            style: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'none', zIndex: '100', border: '1px solid var(--border-color)', borderRadius: '50%', cursor: 'crosshair', padding: '0', overflow: 'hidden', background: 'transparent', color: 'unset' },
            parent: document.body
        });
        const canvas = createElement('canvas', { attrs: { width: 150, height: 150 }, parent: colorWheel });
        const ctx = canvas.getContext('2d');
        const radius = 75;
        const image = ctx.createImageData(2 * radius, 2 * radius);
        const data = image.data;

        for (let x = -radius; x < radius; x++) {
            for (let y = -radius; y < radius; y++) {
                const distSq = x * x + y * y;
                if (distSq > radius * radius) continue;
                const angle = Math.atan2(y, x) * 180 / Math.PI;
                const hue = angle < 0 ? angle + 360 : angle;
                const saturation = Math.sqrt(distSq) / radius;
                const [r, g, b] = hsvToRgb(hue, saturation, 1);
                const index = (x + radius + (y + radius) * (radius * 2)) * 4;
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = 255;
            }
        }
        ctx.putImageData(image, 0, 0);

        colorWheel.addEventListener('mousemove', (e) => {
            if (colorWheel.style.display === 'none') return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - radius;
            const y = e.clientY - rect.top - radius;
            if (x * x + y * y <= radius * radius) {
                const angle = Math.atan2(y, x) * 180 / Math.PI;
                const hue = angle < 0 ? angle + 360 : angle;
                const saturation = Math.sqrt(x * x + y * y) / radius;
                const [r, g, b] = hsvToRgb(hue, saturation, 1);
                setContainer.style.background = `rgb(${r}, ${g}, ${b})`;
                const setItemContainer = pinnedItemsContainer.querySelector(`[data-set-items="${CSS.escape(setname)}"]`);
                if (setItemContainer) setItemContainer.style.background = `rgb(${r}, ${g}, ${b})`;
            }
        });

        colorWheel.addEventListener('click', async (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - radius;
            const y = e.clientY - rect.top - radius;
            if (x * x + y * y <= radius * radius) {
                const angle = Math.atan2(y, x) * 180 / Math.PI;
                const hue = angle < 0 ? angle + 360 : angle;
                const saturation = Math.sqrt(x * x + y * y) / radius;
                const [r, g, b] = hsvToRgb(hue, saturation, 1);
                const color = `rgb(${r}, ${g}, ${b})`;
                const sets = await VAL_PINNED_SETS.get();
                sets[setname].color = color;
                await VAL_PINNED_SETS.set(sets);
                colorWheel.close();
            }
        });

        colorWheel.addEventListener('close', () => {
            colorWheel.style.display = 'none';
        });

        return colorWheel;
    };

    async function loadPinnedSets(pinnedTabsList, pinnedItemsContainer) {
        const sets = await VAL_PINNED_SETS.get();
        pinnedTabsList.replaceChildren();
        pinnedItemsContainer.replaceChildren();
        const colorWheelDialogs = {};

        // Buttons Row
        const buttonsContainer = createElement('div', { style: { display: 'flex', flexDirection: 'row', gap: '5px', marginBottom: '5px' } });
        buttonsContainer.append(
            createElement('button', { textContent: 'All', style: { fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', padding: '5px', borderRadius: '5px', border: '1px solid var(--border-color)', zIndex: '11' },
                events: { click: () => {
                    document.querySelectorAll('.pinned-set').forEach(set => {
                        if (!set.classList.contains('selected-set')) {
                            set.classList.add('selected-set');
                            const setname = set.dataset.pinnedSet;
                            const itemsContainer = pinnedItemsContainer.querySelector(`[data-set-items="${CSS.escape(setname)}"]`);
                            if (itemsContainer) {
                                itemsContainer.style.display = 'block';
                                itemsContainer.style.background = sets[setname].color;
                            }
                        }
                    });
                }}
            }),
            createElement('button', { textContent: 'None', style: { fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', padding: '5px', borderRadius: '5px', border: '1px solid var(--border-color)', zIndex: '11' },
                events: { click: () => {
                    document.querySelectorAll('.pinned-set.selected-set').forEach(set => {
                        set.classList.remove('selected-set');
                        const setname = set.dataset.pinnedSet;
                        const itemsContainer = pinnedItemsContainer.querySelector(`[data-set-items="${CSS.escape(setname)}"]`);
                        if (itemsContainer) {
                            itemsContainer.style.display = 'none';
                        }
                    });
                }}
            })
        );
        pinnedTabsList.appendChild(buttonsContainer);

        for (const setname in sets) {
            const setContainer = createPinnedTabElement(setname, sets, loadPinnedSets.bind(null, pinnedTabsList, pinnedItemsContainer), pinnedItemsContainer, colorWheelDialogs);
            pinnedTabsList.appendChild(setContainer);
            const setItemContainer = createSetItemContainer(setname, sets);
            pinnedItemsContainer.appendChild(setItemContainer);
            colorWheelDialogs[setname] = createColorWheelDialog(setname, setContainer, pinnedItemsContainer);

            setContainer.ondragstart = (event) => event.dataTransfer.setData('text/plain', setname);
            setContainer.ondragover = event => event.preventDefault();
            setContainer.ondrop = async (event) => {
                const sourceSetname = event.dataTransfer.getData('text/plain');
                if (sourceSetname && sourceSetname !== setname) {
                    const currentSets = await VAL_PINNED_SETS.get();
                    [currentSets[sourceSetname], currentSets[setname]] = [currentSets[setname], currentSets[sourceSetname]];
                    await VAL_PINNED_SETS.set(currentSets);
                    loadPinnedSets(pinnedTabsList, pinnedItemsContainer);
                }
            };
            sets[setname].elements.forEach(elementName => {
                const element = getICMain()._data.elements.find(e => e.text === elementName);
                if (element) addPinnedElementToSet(element, setname, pinnedItemsContainer);
            });
        }

        // Add New Set Button
        const addSetButton = createElement('div', { textContent: '+', style: { fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', padding: '5px', borderRadius: '5px', border: '1px solid var(--border-color)', marginLeft: '5px', zIndex: '11' },
            events: { click: () => {
                const setname = prompt("Enter new set name:");
                if (setname) {
                    VAL_PINNED_SETS.get().then(sets => {
                        if (sets[setname]) alert("A set with this name already exists.");
                        else { sets[setname] = { elements: [], color: 'var(--sidebar-bg)' }; VAL_PINNED_SETS.set(sets).then(() => loadPinnedSets(pinnedTabsList, pinnedItemsContainer)); }
                    });
                }
            }}
        });
        pinnedTabsList.appendChild(addSetButton);
    }

    function main() {
        const icMain = getICMain();
        const cssScopeDatasetKey = Object.keys(icMain.$el.dataset)[0];
        const _getCraftResponse = icMain.getCraftResponse;
        const _selectElement = icMain.selectElement;
        const _selectInstance = icMain.selectInstance;

        // Override game functions
        icMain.getCraftResponse = async function(lhs, rhs) {
            const resp = await _getCraftResponse.apply(this, arguments);
            await saveCraftingCombo(lhs.text, rhs.text, resp.result);
            return resp;
        };

        icMain.selectElement = function(mouseEvent, element) {
            if (mouseEvent.buttons === 4) {
                mouseEvent.preventDefault();
                mouseEvent.stopPropagation();
                const selectedSets = Array.from(document.querySelectorAll('.pinned-set.selected-set')).map(el => el.dataset.pinnedSet);
                if (selectedSets.length > 0) addPinnedElement(element, selectedSets, pinnedItemsContainer);
                else alert("No pinned set selected.");
                return;
            }
            return _selectElement.apply(this, arguments);
        };

        icMain.selectInstance = function(mouseEvent, instance) {
            if (mouseEvent.buttons === 4) {
                mouseEvent.preventDefault();
                mouseEvent.stopPropagation();
                const selectedSets = Array.from(document.querySelectorAll('.pinned-set.selected-set')).map(el => el.dataset.pinnedSet);
                if (selectedSets.length > 0) addPinnedElement({ text: instance.text, emoji: instance.emoji }, selectedSets, pinnedItemsContainer);
                else alert("No pinned set selected.");
                return;
            }
            return _selectInstance.apply(this, arguments);
        };

        // --- Recipes Dialog ---
        const recipesListContainer = createElement('div');
        const recipesDialog = createElement('dialog', {
            parent: document.querySelector('.container'),
            style: { background: 'var(--sidebar-bg)', margin: 'auto', color: 'unset' },
            children: [
                createElement('button', { textContent: 'x', events: { click: () => { recipesListContainer.replaceChildren(); recipesDialog.close(); } } }),
                recipesListContainer,
            ],
        });

        const openRecipesDialog = async (itemGenerator) => {
            recipesListContainer.replaceChildren();
            const scrollSection = (evt) => {
                const elementName = evt.target.dataset.comboviewerElement;
                document.querySelector(`[data-comboviewer-section="${CSS.escape(elementName)}"]`).scrollIntoView({ block: 'nearest' });
            };
            const container = createElement('div', { parent: recipesListContainer });
            recipesDialog.showModal();
            await nonBlockingChunked(512, function*() {
                for (const item of itemGenerator()) {
                    container.appendChild(item);
                    yield;
                }
            });
        };

        const sideControls = document.querySelector('.side-controls');
        createControlsButton('Recipes', async () => {
            const elementsByName = icMain._data.elements.reduce((acc, el) => {
                acc[el.text] = el;
                acc[el.text.toLowerCase()] = el;
                return acc;
            }, {});
            const getElementByName = (name) => elementsByName[name] || { emoji: "❌", text: `[Error: Element '${name}']` };
            const combos = await getCraftingCombos();

            openRecipesDialog(function*() {
                for (const result in combos) {
                    if (result === 'Nothing') continue;
                    yield createElement('div', { dataset: { comboviewerSection: result } });
                    const scrollFn = (evt) => {
                        const elementName = evt.target.dataset.comboviewerElement;
                        document.querySelector(`[data-comboviewer-section="${CSS.escape(elementName)}"]`).scrollIntoView({ block: 'nearest' });
                    };
                    for (const [lhs, rhs] of combos[result]) {
                        yield createElement('div', {
                            children: [
                                createLinkedItemElement(getElementByName(result), cssScopeDatasetKey, scrollFn),
                                document.createTextNode(' = '),
                                createLinkedItemElement(getElementByName(lhs), cssScopeDatasetKey, scrollFn),
                                document.createTextNode(' + '),
                                createLinkedItemElement(getElementByName(rhs), cssScopeDatasetKey, scrollFn),
                            ],
                        });
                    }
                }
            });
        }, sideControls);

        createControlsButton('Discoveries', () => {
            openRecipesDialog(function*() {
                for (const element of icMain._data.elements) {
                    if (element.discovered) yield createItemElement(element, cssScopeDatasetKey);
                }
            });
        }, sideControls);

        // --- Pinned Tabs UI ---
        const pinnedTabsContainer = createElement('div', { style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', position: 'sticky', top: '60px', background: 'var(--sidebar-bg)', width: 'calc(100% - 10px)', overflowX: 'auto', overflowY: 'hidden', borderBottom: '1px solid var(--border-color)', zIndex: '10', padding: '5px' } });
        const pinnedTabsList = createElement('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '5px' } });
        pinnedTabsContainer.appendChild(pinnedTabsList);
        const pinnedItemsContainer = createElement('div', { style: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', position: 'sticky', top: '120px', width: 'calc(100% - 10px)', overflowX: 'auto', overflowY: 'auto', borderBottom: '1px solid var(--border-color)', zIndex: '10', padding: '0px' } });
        const sidebar = document.querySelector('.container > .sidebar');
        sidebar.insertBefore(pinnedItemsContainer, sidebar.firstChild);
        sidebar.insertBefore(pinnedTabsContainer, sidebar.firstChild);

        loadPinnedSets(pinnedTabsList, pinnedItemsContainer);
    }

    let attempt = 0;
    function waitForGameReady() {
        if (getICMain()) main();
        else if (attempt++ < 100) setTimeout(waitForGameReady, 10);
        else console.warn('Infinite Craft Tweaks failed to load: `icMain` not found after', attempt, 'attempts');
    }
    waitForGameReady();
})();
