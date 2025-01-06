// ==UserScript==
// @name         Infinite Craft More Pins & Colored Tabs
// @version      1.0.1
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
// ==/UserScript==
 
(function() {
    'use strict';
 
    const el = {
        setup(elem, options) {
            const { style, attrs, dataset, events, classList, children, parent, insertBefore, ...props } = options;
            Object.assign(elem.style, style);
            Object.entries(style?.vars || {}).forEach(([k, v]) => elem.style.setProperty(k, v));
            Object.entries(attrs || {}).forEach(([k, v]) => elem.setAttribute(k, v));
            Object.entries(dataset || {}).forEach(([k, v]) => elem.dataset[k] = v);
            Object.entries(events || {}).forEach(([k, v]) => elem.addEventListener(k, v));
            elem.classList.add(...(classList || []));
            Object.assign(elem, props);
            (children || []).forEach(c => elem.appendChild(c));
            if (parent) {
                if (insertBefore) parent.insertBefore(elem, insertBefore);
                else parent.appendChild(elem);
            }
            return elem;
        },
        create(tagName, options = {}) {
            return this.setup(document.createElement(tagName), options);
        },
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
 
    const icMain = () => unsafeWindow?.$nuxt?._route?.matched?.[0]?.instances?.default;
 
    async function saveCombo(lhs, rhs, result) {
        console.log(`Crafted ${lhs} + ${rhs} -> ${result}`);
        const data = await VAL_COMBOS.get();
        if (!(result in data)) data[result] = [];
        const sortedLhsRhs = [lhs, rhs].sort();
        if (!data[result].some(pair => pair[0] === sortedLhsRhs[0] && pair[1] === sortedLhsRhs[1])) {
            data[result].push(sortedLhsRhs);
            await VAL_COMBOS.set(data);
        }
    }
 
    async function getCombos() {
        const data = await VAL_COMBOS.get();
        return data;
    }
 
    function main() {
        const _getCraftResponse = icMain().getCraftResponse;
        const _selectElement = icMain().selectElement;
        const _selectInstance = icMain().selectInstance;
 
        icMain().getCraftResponse = async function(lhs, rhs) {
            const resp = await _getCraftResponse.apply(this, arguments);
            await saveCombo(lhs.text, rhs.text, resp.result);
            return resp;
        };
 
        document.documentElement.addEventListener('mousedown', e => {
            if (e.buttons === 1) {
                if (e.altKey && !e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    const elements = icMain()._data.elements;
                    const randomElement = elements[Math.floor(Math.random() * elements.length)];
                    _selectElement(e, randomElement);
                } else if (!e.altKey && e.shiftKey) {
                    e.preventDefault();
                    e.stopPropagation();
                    const instances = icMain()._data.instances;
                    const lastInstance = instances[instances.length - 1];
                    const lastInstanceElement = icMain()._data.elements.find(e => e.text === lastInstance.text);
                    _selectElement(e, lastInstanceElement);
                }
            }
        }, { capture: false });
 
        const cssScopeDatasetKey = Object.keys(icMain().$el.dataset)[0];
 
        function mkElementItem(element) {
            return el.create('div', {
                classList: ['item'],
                dataset: { [cssScopeDatasetKey]: '' },
                children: [
                    el.create('span', {
                        classList: ['item-emoji'],
                        dataset: { [cssScopeDatasetKey]: '' },
                        textContent: element.emoji,
                        style: { pointerEvents: 'none' },
                    }),
                    document.createTextNode(` ${element.text} `),
                ],
            });
        }
 
        async function nonBlockingChunked(chunkSize, genFn, timeout = 0) {
            return new Promise((resolve) => {
                const gen = genFn();
                (function doChunk() {
                    for (let i = 0; i < chunkSize; i++) {
                        const { done } = gen.next();
                        if (done) {
                            resolve();
                            return;
                        }
                    }
                    setTimeout(doChunk, timeout);
                })();
            });
        }
 
        const recipesListContainer = el.create('div');
 
        function clearRecipesDialog() {
            recipesListContainer.replaceChildren();
        }
 
        const recipesDialog = el.create('dialog', {
            parent: document.querySelector('.container'),
            children: [
                el.create('button', {
                    textContent: 'x',
                    events: { click: () => recipesDialog.close() },
                }),
                recipesListContainer,
            ],
            style: {
                background: 'var(--sidebar-bg)',
                margin: 'auto',
                color: 'unset',
            },
            events: { close: () => clearRecipesDialog() },
        });
 
        async function openRecipesDialog(childGenerator) {
            clearRecipesDialog();
            const container = el.create('div', { parent: recipesListContainer });
            recipesDialog.showModal();
            await nonBlockingChunked(512, function*() {
                for (const child of childGenerator()) {
                    container.appendChild(child);
                    yield;
                }
            });
        }
 
        function addControlsButton(label, handler) {
            el.create('div', {
                parent: document.querySelector('.side-controls'),
                textContent: label,
                style: {
                    cursor: 'pointer',
                    color: '#040404',
                },
                events: { click: handler },
            });
        }
 
        addControlsButton('Recipes', async () => {
            const byName = {};
            const byNameLower = {};
            icMain()._data.elements.forEach(element => {
                byName[element.text] = element;
                byNameLower[element.text.toLowerCase()] = element;
            });
 
            function getByName(name) {
                return byName[name] || byNameLower[name.toLowerCase()] || { emoji: "❌", text: `[Error: Element '${name}']` };
            }
 
            const combos = await getCombos();
 
            function listItemClick(evt) {
                const elementName = evt.target.dataset.comboviewerElement;
                document.querySelector(`[data-comboviewer-section="${CSS.escape(elementName)}"]`).scrollIntoView({ block: 'nearest' });
            }
 
            function mkLinkedElementItem(element) {
                return el.setup(mkElementItem(element), {
                    events: { click: listItemClick },
                    dataset: { comboviewerElement: element.text },
                });
            }
 
            openRecipesDialog(function*() {
                for (const comboResult in combos) {
                    if (comboResult === 'Nothing') continue;
                    yield el.create('div', { dataset: { comboviewerSection: comboResult } });
                    for (const [lhs, rhs] of combos[comboResult]) {
                        yield el.create('div', {
                            children: [
                                mkLinkedElementItem(getByName(comboResult)),
                                document.createTextNode(' = '),
                                mkLinkedElementItem(getByName(lhs)),
                                document.createTextNode(' + '),
                                mkLinkedElementItem(getByName(rhs)),
                            ],
                        });
                    }
                }
            });
        });
 
        addControlsButton('Discoveries', () => {
            openRecipesDialog(function*() {
                for (const element of icMain()._data.elements) {
                    if (element.discovered) {
                        yield mkElementItem(element);
                    }
                }
            });
        });
 
        const pinnedTabsContainer = el.create('div', {
            style: {
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                position: 'sticky',
                top: '0',
                background: 'var(--sidebar-bg)',
                width: 'calc(100% - 10px)',
                overflowX: 'auto',
                overflowY: 'hidden',
                borderBottom: '1px solid var(--border-color)',
                zIndex: '10',
                padding: '5px'
            },
        });
 
        const pinnedTabsList = el.create('div', {
            style: {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: '5px'
            }
        });
 
        pinnedTabsContainer.appendChild(pinnedTabsList);
 
        const pinnedItemsContainer = el.create('div', {
            style: {
                borderBottom: '1px solid var(--border-color)',
                zIndex: '9',
                padding: '5px',
                background: 'var(--sidebar-bg)',
            },
        });
 
        const sidebar = document.querySelector('.container > .sidebar');
        sidebar.insertBefore(pinnedItemsContainer, sidebar.firstChild);
        sidebar.insertBefore(pinnedTabsContainer, sidebar.firstChild);
 
        const newSetPrompt = el.create('dialog', {
            parent: document.body,
            style: {
                background: 'var(--sidebar-bg)',
                color: 'unset',
                position: 'absolute',
                top: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: '20',
                padding: '10px',
                textAlign: 'center',
                border: '1px solid var(--border-color)',
                borderRadius: '5px'
            },
            children: [
                el.create('div', { textContent: 'Enter new set name:' }),
                el.create('input', { attrs: { type: 'text' }, dataset: { newSetNameInput: '' } }),
                el.create('button', {
                    textContent: 'Create',
                    style: { marginTop: '5px' },
                    events: {
                        click: async () => {
                            const setname = newSetPrompt.querySelector('[data-new-set-name-input]').value;
                            if (setname) {
                                const sets = await VAL_PINNED_SETS.get();
                                if (sets[setname]) {
                                    alert("A set with this name already exists.");
                                    return;
                                }
                                sets[setname] = { elements: [], color: 'var(--sidebar-bg)' };
                                await VAL_PINNED_SETS.set(sets);
                                await loadPinnedSets();
                                pinnedTabsList.querySelector(`[data-pinned-set="${CSS.escape(setname)}"]`).click();
                            }
                            newSetPrompt.close();
                        }
                    }
                })
            ]
        });
 
        function addPinnedElementInternal(element, setname) {
            const setItemContainer = pinnedItemsContainer.querySelector(`[data-set-items="${setname}"]`);
            const elementExists = Array.from(setItemContainer.children).some(child => child.textContent.trim() === element.text);
 
            if (!elementExists) {
                const elementElement = mkElementItem(element);
 
                el.setup(elementElement, {
                    parent: setItemContainer,
                    style: { zIndex: '10', display: 'inline-block' },
                    events: {
                        mousedown: async (e) => {
                            if (e.buttons === 4 || (e.buttons === 1 && e.altKey && !e.shiftKey)) {
                                setItemContainer.removeChild(elementElement);
                                const sets = await VAL_PINNED_SETS.get();
                                sets[setname].elements = sets[setname].elements.filter(e => e !== element.text);
                                await VAL_PINNED_SETS.set(sets);
                                return;
                            }
                            icMain().selectElement(e, element);
                        },
                    },
                });
            }
        }
 
        async function addPinnedElement(element, setnames) {
            const sets = await VAL_PINNED_SETS.get();
            setnames.forEach(setname => {
                if (sets[setname] && !sets[setname].elements.includes(element.text)) {
                    addPinnedElementInternal(element, setname);
                    sets[setname].elements.push(element.text);
                }
            });
            await VAL_PINNED_SETS.set(sets);
        }
 
        icMain().selectElement = function(mouseEvent, element) {
            if (mouseEvent.buttons === 4 || (mouseEvent.buttons === 1 && mouseEvent.altKey && !mouseEvent.shiftKey)) {
                mouseEvent.preventDefault();
                mouseEvent.stopPropagation();
                const selectedSetNames = Array.from(pinnedTabsContainer.querySelectorAll('.selected-set'))
                    .map(set => set.dataset.pinnedSet);
                if (selectedSetNames.length > 0) {
                    addPinnedElement(element, selectedSetNames);
                } else {
                    alert("No pinned set selected.");
                }
 
                return;
            }
            return _selectElement.apply(this, arguments);
        };
 
        icMain().selectInstance = function(mouseEvent, instance) {
            if (mouseEvent.buttons === 4) {
                mouseEvent.preventDefault();
                mouseEvent.stopPropagation();
                const selectedSetNames = Array.from(pinnedTabsContainer.querySelectorAll('.selected-set'))
                    .map(set => set.dataset.pinnedSet);
                if (selectedSetNames.length > 0) {
                    addPinnedElement({ text: instance.text, emoji: instance.emoji }, selectedSetNames);
                } else {
                    alert("No pinned set selected.");
                }
                return;
            }
            return _selectInstance.apply(this, arguments);
        };
 
        function createColorWheel(setname, setContainer) {
            const colorWheel = el.create('dialog', {
                attrs: { width: '150', height: '150' },
                style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'none',
                    zIndex: '100',
                    border: '1px solid var(--border-color)',
                    borderRadius: '50%',
                    cursor: 'crosshair',
                    padding: '0',
                    overflow: 'hidden'
                },
                parent: document.body
            });
 
            const colorWheelCanvas = el.create('canvas', {
                attrs: { width: '150', height: '150' },
                parent: colorWheel
            })
 
            const colorWheelCtx = colorWheelCanvas.getContext('2d');
            const radius = 75;
            const image = colorWheelCtx.createImageData(2 * radius, 2 * radius);
            const data = image.data;
 
            for (let x = -radius; x < radius; x++) {
                for (let y = -radius; y < radius; y++) {
                    const distance = Math.sqrt(x * x + y * y);
                    if (distance > radius) continue;
 
                    const angle = Math.atan2(y, x) * 180 / Math.PI;
                    const hue = angle < 0 ? angle + 360 : angle;
                    const saturation = distance / radius;
                    const value = 1;
 
                    const [red, green, blue] = hsvToRgb(hue, saturation, value);
 
                    const index = (x + radius + (y + radius) * (radius * 2)) * 4;
                    data[index] = red;
                    data[index + 1] = green;
                    data[index + 2] = blue;
                    data[index + 3] = 255;
                }
            }
 
            colorWheelCtx.putImageData(image, 0, 0);
 
            colorWheel.addEventListener('mousemove', async (e) => {
                if (colorWheel.style.display === 'none') return;
                const rect = colorWheelCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left - radius;
                const y = e.clientY - rect.top - radius;
                const distance = Math.sqrt(x * x + y * y);
 
                if (distance <= radius) {
                    const angle = Math.atan2(y, x) * 180 / Math.PI;
                    const hue = angle < 0 ? angle + 360 : angle;
                    const saturation = distance / radius;
                    const value = 1;
 
                    const [red, green, blue] = hsvToRgb(hue, saturation, value);
                    const color = `rgb(${red}, ${green}, ${blue})`;
 
                    setContainer.style.background = color;
                    const setItemContainer = pinnedItemsContainer.querySelector(`[data-set-items="${setname}"]`);
                    if (setItemContainer) {
                        setItemContainer.style.background = color;
                    }
                }
            });
 
            colorWheel.addEventListener('click', async (e) => {
                const rect = colorWheelCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left - radius;
                const y = e.clientY - rect.top - radius;
                const distance = Math.sqrt(x * x + y * y);
 
                if (distance <= radius) {
                    const angle = Math.atan2(y, x) * 180 / Math.PI;
                    const hue = angle < 0 ? angle + 360 : angle;
                    const saturation = distance / radius;
                    const value = 1;
 
                    const [red, green, blue] = hsvToRgb(hue, saturation, value);
                    const color = `rgb(${red}, ${green}, ${blue})`;
 
                    const sets = await VAL_PINNED_SETS.get();
                    sets[setname].color = color;
                    setContainer.style.background = color;
                    await VAL_PINNED_SETS.set(sets);
                    colorWheel.close();
                    const setItemContainer = pinnedItemsContainer.querySelector(`[data-set-items="${setname}"]`);
                    if (setItemContainer) {
                        setItemContainer.style.background = color;
                    }
                }
            });
 
            colorWheel.addEventListener('close', () => {
                colorWheel.style.display = 'none';
            });
 
            return colorWheel;
        }
 
        function hsvToRgb(h, s, v) {
            let r, g, b;
            const i = Math.floor(h / 60);
            const f = h / 60 - i;
            const p = v * (1 - s);
            const q = v * (1 - f * s);
            const t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }
 
        function setDragEvents(element) {
            element.setAttribute('draggable', 'true');
            let draggedSetname = null;
 
            element.addEventListener('dragstart', (event) => {
                draggedSetname = event.target.dataset.pinnedSet;
                event.dataTransfer.setData('text', draggedSetname);
                event.dataTransfer.effectAllowed = 'move';
            });
 
            element.addEventListener('dragend', (event) => {
                draggedSetname = null;
            })
        }
 
        async function loadPinnedSets() {
            const sets = await VAL_PINNED_SETS.get();
            pinnedTabsList.replaceChildren();
            pinnedItemsContainer.replaceChildren();
 
            const buttonsContainer = el.create('div', {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '5px',
                  marginRight: '5px'
                }
              });
 
            const allButton = el.create('button', {
                textContent: 'All',
                style: {
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '5px',
                    borderRadius: '5px',
                    border: '1px solid var(--border-color)',
                    zIndex: '11'
                },
                events: {
                    click: () => {
                        const allSetContainers = pinnedTabsList.querySelectorAll('.pinned-set');
                        allSetContainers.forEach(setContainer => {
                            setContainer.style.outline = '2px solid darkgray';
                            setContainer.classList.add('selected-set');
                            const setname = setContainer.dataset.pinnedSet;
                            const itemsContainer = pinnedItemsContainer.querySelector(`[data-set-items="${setname}"]`);
                            if (itemsContainer) {
                                itemsContainer.style.display = 'block';
                                itemsContainer.style.background = sets[setname].color;
                            }
                        });
                    }
                }
            });
            buttonsContainer.appendChild(allButton);
 
            const noneButton = el.create('button', {
                textContent: 'None',
                style: {
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '5px',
                    borderRadius: '5px',
                    border: '1px solid var(--border-color)',
                    zIndex: '11'
                },
                events: {
                    click: () => {
                        const allSetContainers = pinnedTabsList.querySelectorAll('.pinned-set');
                        allSetContainers.forEach(setContainer => {
                            setContainer.style.outline = 'none';
                            setContainer.classList.remove('selected-set');
                            const setname = setContainer.dataset.pinnedSet;
                            const itemsContainer = pinnedItemsContainer.querySelector(`[data-set-items="${setname}"]`);
                            if (itemsContainer) {
                                itemsContainer.style.display = 'none';
                            }
                        });
                    }
                }
            });
            buttonsContainer.appendChild(noneButton);
            pinnedTabsList.appendChild(buttonsContainer);
 
            for (const setname in sets) {
                const setContainer = el.create('div', {
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
                        el.create('div', {
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
                                click: (e) => {
                                    e.stopPropagation();
                                    const wasSelected = setContainer.classList.contains('selected-set');
 
                                    if (!wasSelected) {
                                        setContainer.style.outline = '2px solid darkgray';
                                        setContainer.classList.add('selected-set');
                                        const itemsContainer = pinnedItemsContainer.querySelector(`[data-set-items="${setname}"]`);
                                        if (itemsContainer) {
                                            itemsContainer.style.display = 'block';
                                            itemsContainer.style.background = sets[setname].color;
                                        }
                                    } else {
                                        setContainer.style.outline = 'none';
                                        setContainer.classList.remove('selected-set');
                                        const itemsContainer = pinnedItemsContainer.querySelector(`[data-set-items="${setname}"]`);
                                        if (itemsContainer) itemsContainer.style.display = 'none';
                                    }
                                }
                            }
                        }),
                        el.create('div', {
                            style: {
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginTop: '5px'
                            },
                            children: [
                                el.create('span', {
                                    textContent: 'x',
                                    style: {
                                        cursor: 'pointer',
                                        zIndex: '12',
                                        fontSize: '12px',
                                        marginRight: '5px'
                                    },
                                    events: {
                                        click: async (e) => {
                                            e.stopPropagation();
                                            if (confirm(`Are you sure you want to delete the set "${setname}"?`)) {
                                                const sets = await VAL_PINNED_SETS.get();
                                                delete sets[setname];
                                                await VAL_PINNED_SETS.set(sets);
                                                await loadPinnedSets();
                                            }
                                        }
                                    }
                                }),
                                el.create('span', {
                                    textContent: '\u{1F4DD}',
                                    style: {
                                        cursor: 'pointer',
                                        zIndex: '12',
                                        fontSize: '12px',
                                        marginRight: '5px'
                                    },
                                    events: {
                                        click: async (e) => {
                                            e.stopPropagation();
                                            const newSetName = prompt("Enter new set name:", setname);
                                            if (newSetName) {
                                                const sets = await VAL_PINNED_SETS.get();
                                                if (sets[newSetName]) {
                                                    alert("A set with this name already exists.");
                                                    return;
                                                }
                                                sets[newSetName] = sets[setname];
                                                delete sets[setname];
                                                await VAL_PINNED_SETS.set(sets);
                                                await loadPinnedSets();
                                            }
                                        }
                                    }
                                }),
                                el.create('span', {
                                    textContent: '\u{1F3A8}',
                                    style: {
                                        cursor: 'pointer',
                                        zIndex: '12',
                                        fontSize: '12px'
                                    },
                                    events: {
                                        click: async (e) => {
                                            e.stopPropagation();
                                            colorWheel.style.display = 'block';
                                            colorWheel.showModal();
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                });
 
                const colorWheel = createColorWheel(setname, setContainer);
                pinnedTabsList.appendChild(setContainer);
                setDragEvents(setContainer);
 
                const setItemContainer = el.create('div', {
                    dataset: { setItems: setname },
                    classList: ['set-items'],
                    style: {
                        display: 'none',
                        flexWrap: 'wrap',
                        background: sets[setname].color || 'var(--sidebar-bg)'
                    }
                });
 
                pinnedItemsContainer.appendChild(setItemContainer);
 
                sets[setname].elements.forEach(async (elementName) => {
                    const element = icMain()._data.elements.find(e => e.text === elementName);
                    if (element) {
                        await addPinnedElementInternal(element, setname);
                    }
                });
            }
 
            const addSetButton = el.create('div', {
                textContent: '+',
                style: {
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '5px',
                    borderRadius: '5px',
                    border: '1px solid var(--border-color)',
                    marginLeft: '5px',
                    zIndex: '11'
                },
                events: {
                    click: () => {
                        newSetPrompt.querySelector('[data-new-set-name-input]').value = '';
                        newSetPrompt.showModal();
                    }
                }
            });
 
            pinnedTabsList.appendChild(addSetButton);
 
            let draggedIndex = -1;
            let targetIndex = -1;
 
            pinnedTabsList.addEventListener('dragstart', (event) => {
                const draggedSetname = event.target.dataset.pinnedSet;
                draggedIndex = Array.from(pinnedTabsList.children).indexOf(event.target);
            });
 
            pinnedTabsList.addEventListener('dragover', (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                const target = event.target.closest('.pinned-set');
                if (target) {
                    target.style.border = '2px dashed darkgray';
                }
            });
 
            pinnedTabsList.addEventListener('dragleave', (event) => {
                event.preventDefault();
                const target = event.target.closest('.pinned-set');
                if (target) {
                    target.style.border = '';
                }
            });
 
            pinnedTabsList.addEventListener('dragenter', (event) => {
                const target = event.target.closest('.pinned-set');
                if (target) {
                  targetIndex = Array.from(pinnedTabsList.children).indexOf(target);
                }
            });
 
            pinnedTabsList.addEventListener('drop', async (event) => {
                event.preventDefault();
                const draggedSetname = event.dataTransfer.getData('text');
                const target = event.target.closest('.pinned-set');
                const targetSetname = target ? target.dataset.pinnedSet : null;
 
                if (targetSetname && draggedSetname !== targetSetname) {
                  const sets = await VAL_PINNED_SETS.get();
                  const draggedSet = sets[draggedSetname];
 
                  delete sets[draggedSetname];
 
                  const newSets = {};
                  let i = 0;
                  for (const setname in sets) {
                    if (i === targetIndex) {
                      newSets[draggedSetname] = draggedSet;
                    }
                    newSets[setname] = sets[setname];
                    i++;
                  }
                  if (i === targetIndex) {
                    newSets[draggedSetname] = draggedSet;
                  }
 
                  await VAL_PINNED_SETS.set(newSets);
                  await loadPinnedSets();
                } else if (!targetSetname && draggedIndex !== pinnedTabsList.children.length - 1) {
                  const sets = await VAL_PINNED_SETS.get();
                  const draggedSet = sets[draggedSetname];
 
                  delete sets[draggedSetname];
                  sets[draggedSetname] = draggedSet;
 
                  await VAL_PINNED_SETS.set(sets);
                  await loadPinnedSets();
                }
 
                if (target) {
                  target.style.border = '';
                }
 
                draggedIndex = -1;
                targetIndex = -1;
            });
        }
 
        (async () => {
            await loadPinnedSets();
        })();
    }
 
    let attempt = 0;
    function waitForReady() {
        if (icMain()) main();
        else if (attempt++ < 100) setTimeout(waitForReady, 10);
        else console.warn('Infinite Craft Tweaks failed to load: `icMain` not found after', attempt, 'attempts');
    }
    waitForReady();
})();
