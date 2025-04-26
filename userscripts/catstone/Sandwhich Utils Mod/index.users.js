// ==UserScript==
// @name          Sandwhich Utils Mod
// @namespace     Catstone
// @match         https://neal.fun/infinite-craft/*
// @grant         GM_getValue
// @grant         GM_setValue
// @grant         GM_addStyle
// @grant         GM.xmlHttpRequest
// @version       2.0
// @author        Catstone
// @license       MIT
// @description   22.4.2025, 17:49:47
// ==/UserScript==




(function () {
    'use strict';

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


    let saveTimeout;
    function saveSettings() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            GM_setValue('sandwhich_settings', settings);
            // console.log("SandwhichMod: Settings saved.");
        }, 500);
    }

    // --- Reactive Proxy ---
    const createReactiveProxy = (target, onChange) => {
        if (typeof target !== 'object' || target === null) return target;
        const handler = {
            set(obj, prop, value) {
                if (obj[prop] !== value) {
                    const success = Reflect.set(obj, prop, value);
                    if (success) onChange();
                    return success;
                }
                return true;
            },
            get(obj, prop, receiver) {
                const value = Reflect.get(obj, prop, receiver);
                if (typeof value === 'object' && value !== null) {
                    return createReactiveProxy(value, onChange);
                }
                return value;
            },
            deleteProperty(obj, prop) {
                 if (prop in obj) {
                    const success = Reflect.deleteProperty(obj, prop);
                    if (success) onChange();
                    return success;
                 }
                 return true;
             }
        };
        return new Proxy(target, handler);
    };


    const defaultSettings = {
        selection: {
            enabled: false,
            customColor: '#ff00ff',
            borderStyle: 'ridge',
            borderWidth: 5,
            chromaSpeed: 0,
            scale: 50,
        },
        tabs: {
            enabled: false,
            customColor: '#cccccc',
            animationSpeed: 10,
        },
        spawn: {
            copy: false,
            paste: false,
            columnSplit: 100,
            columnDistance: 200,
            rowDistance: 50,
            ghosts: false,
            fromSelected: false,
        },
        unicode: {
            searchEnabled: false,
            searchCheckbox: false,
            searchDebounceDelay: 200,
            searchAmount: 15,
            searchCompact: false,
            searchMultiCharacter: false,
            infoInRecipeModal: true,
        },
    };
    const settings = createReactiveProxy(
        mergeSettings(GM_getValue('sandwhich_settings', {}), defaultSettings),
        saveSettings
    );
    saveSettings(); // Initial save














const mods = {
//            _______ _________ _____    _________   ______ _________ _____   ____   ____  _____
//           /  ___  |_   ___  |_   _|  |_   ___  |./ ___  |  _   _  |_   _|.'    \.|_   \|_   _|
//          |  (__ \_| | |_  \_| | |      | |_  \_| ./   \_|_/ | | \_| | | /  .--.  \ |   \ | |
//           '.___\-.  |  _|  _  | |   _  |  _|  _| |          | |     | | | |    | | | |\ \| |
//          |\\____) |_| |___/ |_| |__/ |_| |___/ | \.___.'\  _| |_   _| |_\  \--'  /_| |_\   |_
//          |_______.'_________|________|_________|\._____.' |_____| |_____|\.____.'|_____|\____|
  selection: {

      init: function () {
          if (settings.selection.enabled) this.enable();
      },

      enable: function () {
          settings.selection.enabled = true;
          document.querySelector('#select-box').classList.add('sandwhich-select-box');
          document.body.classList.add('sandwhich-sel-active');    // flag to style elements
          this.update();
      },
      disable: function () {
          settings.selection.enabled = false;
          document.querySelector('#select-box').classList.remove('sandwhich-select-box');
          document.body.classList.remove('sandwhich-sel-active');
      },
      update: function () {
         document.documentElement.style.setProperty('--sandwhich-sel-border', `${settings.selection.borderWidth}px ${settings.selection.borderStyle} ${settings.selection.customColor}`);
         document.documentElement.style.setProperty('--sandwhich-sel-background', `hsl(from ${settings.selection.customColor} h s l / 0.3)`);
         document.documentElement.style.setProperty('--sandwhich-sel-scale', `${settings.selection.scale}%`);

         const chromaSpeed = 10 / settings.selection.chromaSpeed;
         document.documentElement.style.setProperty(
           '--sandwhich-sel-chroma-animation',
             `sandwhich-chromaCycleBorder ${Math.abs(chromaSpeed)}s infinite linear${chromaSpeed < 0 ? ' reverse' : ''}, `
             + `sandwhich-chromaCycleBackground ${Math.abs(chromaSpeed)}s infinite linear${chromaSpeed < 0 ? ' reverse' : ''}`
             + `${settings.selection.borderWidth >= 30 ? `, sandwhich-rotateBorder ${Math.abs(chromaSpeed)}s infinite linear${chromaSpeed < 0 ? ' reverse' : ''}` : ''}`
         );
      },
  },























//              ___           ___         ___           ___           ___                    ___                                                 ___
//             /  /\         /  /\       /  /\         /__/\         /__/\                  /__/\          ___       ___                        /  /\
//            /  /:/_       /  /::\     /  /::\       _\_ \:\        \  \:\                 \  \:\        /  /\     /  /\                      /  /:/_
//           /  /:/ /\     /  /:/\:\   /  /:/\:\     /__/\ \:\        \  \:\                 \  \:\      /  /:/    /  /:/      ___     ___    /  /:/ /\
//          /  /:/ /::\   /  /:/~/:/  /  /:/~/::\   _\_ \:\ \:\   _____\__\:\            ___  \  \:\    /  /:/    /__/::\     /__/\   /  /\  /  /:/ /::\
//         /__/:/ /:/\:\ /__/:/ /:/  /__/:/ /:/\:\ /__/\ \:\ \:\ /__/::::::::\          /__/\  \__\:\  /  /::\    \__\/\:\__  \  \:\ /  /:/ /__/:/ /:/\:\
//         \  \:\/:/~/:/ \  \:\/:/   \  \:\/:/__\/ \  \:\ \:\/:/ \  \:\~~\~~\/          \  \:\ /  /:/ /__/:/\:\      \  \:\/\  \  \:\  /:/  \  \:\/:/~/:/
//          \  \::/ /:/   \  \::/     \  \::/       \  \:\ \::/   \  \:\  ~~~            \  \:\  /:/  \__\/  \:\      \__\::/   \  \:\/:/    \  \::/ /:/
//           \__\/ /:/     \  \:\      \  \:\        \  \:\/:/     \  \:\                 \  \:\/:/        \  \:\     /__/:/     \  \::/      \__\/ /:/
//             /__/:/       \  \:\      \  \:\        \  \::/       \  \:\                 \  \::/          \__\/     \__\/       \__\/         /__/:/
//             \__\/         \__\/       \__\/         \__\/         \__\/                  \__\/                                               \__\/
  spawn: {
      mouseData: { x: null, y: null },
      ghostElements: new Set(),
      ghostInitialized: false,


      init: function () {
          document.addEventListener('mousemove', function(e) {
              mods.spawn.mouseData.x = e.clientX;
              mods.spawn.mouseData.y = e.clientY;
          });

          let ctrlCHandled = false;
          let ctrlVHandled = false;
          document.addEventListener('keydown', function(e) {
              if (settings.spawn.paste && e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'V' && !ctrlVHandled) {
                  navigator.clipboard.readText().then(text => mods.spawn.handleClipboardPaste(text));
                  ctrlVHandled = true;
                  e.preventDefault();
              }
              if (settings.spawn.copy && e.ctrlKey && e.key.toUpperCase() === 'C' && !ctrlCHandled) {
                  const hoveredElement = document.elementFromPoint(mods.spawn.mouseData.x, mods.spawn.mouseData.y);

                  let copyText;
                  if (hoveredElement.matches('.item')) {
                      copyText = hoveredElement.childNodes[1].textContent.trim();
                  }
                  else if (hoveredElement.matches('.instance')) {
                      const selectedInstances = unsafeWindow.IC.getInstances().filter(x => x.element.classList.contains('instance-selected'));
                      if (selectedInstances.length <= 1) copyText = hoveredElement.childNodes[1].textContent.trim();
                      else {
                          let { x, y } = unsafeWindow.IC.screenToWorld(mods.spawn.mouseData.x, mods.spawn.mouseData.y);
                          copyText = selectedInstances.map(element => `${element.text}  ${(element.x - x).toFixed(2)} ${(element.y - y).toFixed(2)}`).join('\n');
                      }
                  }
                  navigator.clipboard.writeText(copyText);
                  console.log(`copied to clipboard: "${copyText}"`);
                  ctrlCHandled = true;
                  e.preventDefault();
              }

              if (settings.spawn.fromSelected && e.ctrlKey && e.key.toUpperCase() === 'B') {
                  mods.spawn.handleSpawnFromSelected();
                  e.preventDefault();
              }
          });

          document.addEventListener('keyup', function(e) {
              if (e.key.toUpperCase() === 'C') ctrlCHandled = false;
              if (e.key.toUpperCase() === 'V') ctrlVHandled = false;
          });
      },


      spawnInstance: function (element, x, y) {
          const item = document.querySelector('.container').__vue__.items.find(x => x.text === element);
          if (item) {
              IC.createInstance({ text: item.text, itemId: item.id, emoji: item.emoji, discovery: item.discovery, x, y, animate: true });
          }
          else if (settings.spawn.ghosts) {
              // Spawn as ghost!
              const ghostElement = IC.createInstance({  text: element, itemId: -1, emoji: '', x, y });
              ghostElement.disabled = true;
              ghostElement.element.style.opacity = '0.2';

              const onlyAllowRightClick = (event) => {
                  if (event.button !== 2) {
                      event.stopPropagation();
                      event.preventDefault();
                  }
              };
              // Attach the listener to the ghost element
              ghostElement.element.addEventListener('mousedown', onlyAllowRightClick, { capture: true });

              this.ghostElements.add(element);
              if (!this.ghostInitialized) this.ghostInit()
          }
      },


      ghostInit: function () {
          this.ghostInitialized = true;

          const modsSpawn = this;

          const v_container = document.querySelector('.container').__vue__;
          const craftApi = v_container.craftApi;
          v_container.craftApi = async function (...args) {
              let response = await craftApi(...args);

              if (response && modsSpawn.ghostElements.has(response.text)) {
                  modsSpawn.ghostElements.delete(response.text);
                  let updateInstances = unsafeWindow.IC.getInstances().filter(x => x.disabled === true && x.itemId === -1 && x.text === response.text);
                  if (updateInstances.length > 0) setTimeout(() => {
                      unsafeWindow.IC.removeInstances(updateInstances);
                      for (const instance of updateInstances) {
                          const { x, y } = unsafeWindow.IC.worldToScreen(instance.x, instance.y);
                          modsSpawn.spawnInstance(response.text, x, y);
                      }
                  }, 0);

              }

              return response;
          }
      },


      handleClipboardPaste: function (lineage) {
          let coordLessCounter = 0;

          let actualColumnDist = settings.spawn.columnDistance * unsafeWindow.IC.getZoom();
          let actualRowDist = settings.spawn.rowDistance * unsafeWindow.IC.getZoom();

          for (const line of lineage.split`\n`.filter(Boolean)) {
              let column = Math.floor(coordLessCounter / settings.spawn.columnSplit) * actualColumnDist;
              let row = (coordLessCounter % settings.spawn.columnSplit) * actualRowDist;

              // check if last part is '  number number'
              const lastIndex = line.lastIndexOf("  ");
              if (lastIndex !== -1) {
                  const part2 = line.slice(lastIndex + 2);
                  const [x, y] = part2.split(' ', 2).map(Number);
                  if (!isNaN(x) && !isNaN(y)) {
                      const part1 = line.slice(0, lastIndex);
                      this.spawnInstance(part1,  this.mouseData.x + x,  this.mouseData.y + y)
                      continue;
                  }
              }
              coordLessCounter++;

              if (line.includes(' = ') || line.includes(' => ') || line.includes(' -> ')) {
                  const [ings, r] = line.split(/ \/\/| ::/)[0].split(/ = | => | -> /, 2).map(x => x.trim());
                  const plusIndex = ings.indexOf(' + ');
                  const [f, s] = [ings.slice(0, plusIndex), ings.slice(plusIndex + 3)].map(x => x.trim());

                  // lineages split 3.5 further
                  column *= 3.5;

                  [f, s, r].forEach((element, i) => {
                      this.spawnInstance(element,   this.mouseData.x + column + (i * actualColumnDist),   this.mouseData.y + row);
                  });
                  continue;
              }

              this.spawnInstance(line,  this.mouseData.x + column,  this.mouseData.y + row);
          }
      },




      handleSpawnFromSelected: function () {
          const selectedInstances = unsafeWindow.IC.getInstances().filter(x => x.element.classList.contains('instance-selected'));
          if (selectedInstances.length >= 2) {
              alert(`More than 1 Element is selected: ${selectedInstances.length}`);
              return;
          }

          const selectedInstance = selectedInstances[0];
          if (selectedInstance) {
              if (/[a-zA-Z]/.test(selectedInstance.text)) {
                  const { x, y } = unsafeWindow.IC.worldToScreen(selectedInstance.x, selectedInstance.y);
                  if (this.handleSpawnAlphabet(selectedInstance.text, x, y)) {
                      // successfully spawned alphabet
                      unsafeWindow.IC.removeInstances([selectedInstance]);
                  }
              }
              else if (Array.from(selectedInstance.text).length === 1) {
                  const { x, y } = unsafeWindow.IC.worldToScreen(selectedInstance.x, selectedInstance.y);
                  if (this.handleSpawnUnicode(selectedInstance.text, x, y)) {
                      // successfully spawned unicodes
                      unsafeWindow.IC.removeInstances([selectedInstance]);
                  }
              }
          }
          else {
              // no selectedInstance, let user decide
              let input = prompt(`You didn't have anything selected, so here is a generic menu.\nSelect one:\n a - Spawn Alphabet(s)\n u - Spawn Unicode(s)`);
              if (input?.toLowerCase() === 'a') {
                  let promptAlphabets = prompt(`Generic Alphabet Spawn:`
                                               + `\n - Enter Alphabets separated by Double Spaces (e.g. 'X   .x   _x   X!)`
                                               + `\nOR\n - Enter ALL to spawn ALL of your alphabets (might lag)`
                                              );
                  if (promptAlphabets.toUpperCase() === 'ALL') promptAlphabets = this.getAllAlphabets(5).join('  ');
                  promptAlphabets.split('  ').forEach((x, i) => this.handleSpawnAlphabet(x,  this.mouseData.x + i*settings.spawn.columnDistance/2,  this.mouseData.y))
              }
              if (input?.toLowerCase() === 'u') {
                  let promptCodepoint = prompt(`Generice Unicode Spawn:\n - Enter a Unicode Codepoint or a Unicode Character! (e.g. U+0069 or 0069 or i)`) ?? '';
                  const maybeNum = parseInt(promptCodepoint.replace(/^[Uu]\+/, ''), 16);
                  if (!isNaN(maybeNum)) {
                      promptCodepoint = String.fromCodePoint(maybeNum);
                  }
                  if (Array.from(promptCodepoint).length === 1) this.handleSpawnUnicode(promptCodepoint,  this.mouseData.x,  this.mouseData.y);
                  else if (promptCodepoint !== '') alert(`${promptCodepoint} is not valid :(`)
              }
          }
      },

      handleSpawnAlphabet: function (text, x, y) {
          const choices = [...text].reduce((map, char, index) => {
              if (/[a-zA-Z]/.test(char)) map.push([char, index]);
              return map;
          }, []);

          const positionsMessage = choices.map((item, i) => ` ${i + 1} - ${item[0]}`).join('\n');
          const choiceIndex = choices.length === 1 ? 0 : Number(prompt(`Alphabet Spawn: ${text}\nWhich letter do you want to cycle?\n${positionsMessage}`)) - 1;
          const choice = choices[choiceIndex];

          if (choice) {
              const [char, index] = choice;
              const lower = char === char.toLowerCase();

              const alphabet = 'abcdefghijklmnopqrstuvwxyz';
              for (let i = 0; i < alphabet.length; i++) {
                  let letter = lower ? alphabet[i] : alphabet[i].toUpperCase();

                  const newElement = text.slice(0, index) + letter + text.slice(index + 1);
                  this.spawnInstance(newElement,  x,  y + i*settings.spawn.rowDistance);
              }
              return true;
          }
          else if (choiceIndex != -1) alert(`${choiceIndex + 1} was not one of the options :(`);
      },

      getAllAlphabets: function (minCount) {
          return Object.entries(IC.getItems().reduce((total, x) => {
              const letters = x.text.match(/[a-zA-Z]/g)
              if (letters?.length === 1) {
                  const key = x.text.replace(letters[0], letters[0] === letters[0].toLowerCase() ? 'x' : 'X');
                  total[key] = (total[key] || 0) + 1;
              }
              return total;
          }, {}))
              .filter(([key, value]) => value >= minCount)
              .sort((a, b) => b[1] - a[1])
              .map(([key]) => key)
      },

      handleSpawnUnicode: function (text, x, y, rows) {
          if (!rows) rows = Number(prompt(`Unicode Spawn: ${text}  U+${text.codePointAt(0).toString(16).padStart(4, '0')}\nHow many rows after this element should it spawn?`));
          if (!rows) return;

          const codepoint = text.codePointAt(0);
          const baseCode = codepoint & 0xFFFF0;

          for (let row = 0; row < rows; row++) {
              for (let step = 0; step < 16; step++) {
                  const charCode = baseCode + step + (row * 16);

                  this.spawnInstance(String.fromCodePoint(charCode),  x + (step * settings.spawn.columnDistance/2),  y + (row * settings.spawn.rowDistance));
              }
          }

          return true;
      },


  },






















//             _________      __      ______    _______
//            |  _   _  |    /  \    |_   _ \  /  ___  |
//            |_/ | | \_|   / /\ \     | |_) ||  (__ \_|
//                | |      / ____ \    |  __/. '.___\-.
//               _| |_   _/ /    \ \_ _| |__) |\\____) |
//              |_____| |____|  |____|_______/|_______.'
  tabs: {
      tabData: null,
      defaultTabData: { currTab: 0, tabs: [{ elements: [], name: 'Tab 1' }] },
      draggedTabIndex: null,

      cleanupResizeObserver: null,


      init: function () {
          if (settings.tabs.enabled) this.enable();
      },



      enable: function () {
          const infiniteCraftContainer = document.querySelector('.container.infinite-craft.dark-mode');

          const container = document.createElement('div');
          container.id = 'sandwhich-tab-container';
          infiniteCraftContainer.appendChild(container);

          const list = document.createElement('div');
          list.id = 'sandwhich-tab-list';
          container.appendChild(list);

          const addButton = document.createElement('button');
          addButton.className = 'sandwhich-tab-add-button';
          addButton.textContent = '+';
          addButton.title = 'Add New Tab';
          addButton.onclick = () => mods.tabs.addTab();
          addButton.oncontextmenu = (e) => {
              e.preventDefault();
              mods.tabs.showContextMenu(e, [
                  ['Upload Tab', () => mods.tabs.uploadTab()],
              ]);
          }
          container.appendChild(addButton);

          const sidebar = document.querySelector('#sidebar');

          const positionTabBar = function () {
              container.style.left = `200px`;
              container.style.right = `${sidebar.getBoundingClientRect().width + 150}px`;
          }

          this.cleanupResizeObserver = new ResizeObserver(() => positionTabBar());
          this.cleanupResizeObserver.observe(sidebar);
          positionTabBar();

          const contextMenuElement = document.createElement('div');
          contextMenuElement.id = 'sandwhich-tab-contextmenu';
          contextMenuElement.style.display = 'none';   // Start hidden
          infiniteCraftContainer.appendChild(contextMenuElement);


          this.tabData = GM_getValue('tabData', this.defaultTabData);
          this.refreshVisualTabButtons();

          this.updateColors();
          settings.tabs.enabled = true;
      },



      disable: function () {
          const container = document.getElementById('sandwhich-tab-container');
          if (container) container.remove();

          const contextMenu = document.getElementById('sandwhich-tab-contextmenu');
          if (contextMenu) contextMenu.remove();

          if (this.cleanupResizeObserver) {
              this.cleanupResizeObserver.disconnect();
              this.cleanupResizeObserver = null;
          }

          settings.tabs.enabled = false;
      },




      updateColors: function () {
          document.documentElement.style.setProperty('--sandwhich-tab-color', settings.tabs.customColor);
      },


      updateCurrentTabElements: function () {
          const elements = unsafeWindow.IC.getInstances().map(instance => {
              const { x, y } = unsafeWindow.IC.worldToScreen(instance.x, instance.y);
              return [instance.text, x, y];
          });
          this.tabData.tabs[this.tabData.currTab].elements = elements;
      },

      saveTabData: function () {
          GM_setValue('tabData', this.tabData)
      },


      addTab: function (index, data) {
          this.updateCurrentTabElements();
          const newTab = data ?? { elements: [], name: `Tab ${this.tabData.tabs.length + 1}` }
          let newIndex = index;
          if (index === undefined || index >= this.tabData.tabs.length) {
              // normal add new tab at the end
              this.tabData.tabs.push(newTab);
              newIndex = this.tabData.tabs.length - 1;
          }
          else {
              // splice tab in
              this.tabData.tabs.splice(index, 0, newTab);
          }

          this.refreshVisualTabButtons();
          this.switchTab(newIndex);

          const animatedTab = this.getVisualTabFromId(newIndex);
          animatedTab.style.animation = `slideIn ${settings.tabs.animationSpeed / 50}s ease-out`;
      },


      loadTab: function (index) {
          if (index >= this.tabData.tabs.length) index = 0;
          const tab = this.tabData.tabs[index];

          unsafeWindow.IC.clearInstances();

          for (const [text, x, y] of tab.elements) {
              mods.spawn.spawnInstance(text, x, y);
          }

          this.tabData.currTab = index;
      },

      switchTab: function (index) {
          if (this.tabData.currTab == index) return;

          this.updateCurrentTabElements();
          this.loadTab(index);
          document.querySelectorAll('.sandwhich-tab').forEach(button => button.classList.remove('active'));
          this.getVisualTabFromId(index).classList.add('active');

          this.saveTabData();
      },


      deleteTab: function (index) {
          unsafeWindow.IC.clearInstances();

          if (this.tabData.tabs.length <= 1) {
              this.tabData.tabs = this.defaultTabData;
              this.refreshVisualTabButtons();
          }
          else {
              this.tabData.tabs.splice(index, 1);
              if (this.tabData.currTab > 0) this.tabData.currTab--;
              this.loadTab(this.tabData.currTab);

              const deletedTabWidth = this.getVisualTabFromId(index).offsetWidth;
              this.refreshVisualTabButtons();

              const sizer = document.createElement('div');
              sizer.className = 'sandwhich-tab-sizer';
              sizer.style.width = `${deletedTabWidth}px`;
              setTimeout(() => {
                  sizer.style.width = '0';
                  sizer.style.transition = `width ${settings.tabs.animationSpeed / 50}s ease-out`;
                  sizer.addEventListener('transitionend', () => {
                      sizer.remove();
                  });
              }, 0);

              const tabList = document.querySelector('#sandwhich-tab-list');
              tabList.insertBefore(sizer, this.getVisualTabFromId(index) ?? tabList.querySelector('.addButton'));
          }

          this.saveTabData();
      },


      duplicateTab: function (index) {
          this.updateCurrentTabElements();
          const toDuplicateTab = this.tabData.tabs[index];
          this.addTab(index + 1, { elements: toDuplicateTab.elements.slice(), name: toDuplicateTab.name });   // .slice() -> cloning

          this.saveTabData();
      },




      renameTab: function (index) {
          const newName = prompt(`Enter a new name! (${this.tabData.tabs[index].name})`);
          if (newName) {
              this.tabData.tabs[index].name = newName;
              this.getVisualTabFromId(index).textContent = newName;
          }
          this.saveTabData();
      },



      downloadTab: function (index) {
          this.updateCurrentTabElements();

          const tab = this.tabData.tabs[index];
          const blob = new Blob([JSON.stringify(tab, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ICTAB ${tab.name}.json`;
          a.click();
          URL.revokeObjectURL(url);
          a.remove();
      },


      uploadTab: function () {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json,application/json';
          input.style.display = 'none';

          input.addEventListener('change', (event) => {
              const file = event.target.files?.[0];
              if (!file) {
                  alert("No file selected.");
                  document.body.removeChild(input);
                  return;
              }
              const reader = new FileReader();
              reader.onload = (e) => {
                  try {
                      const tab = JSON.parse(e.target.result);
                      // Success!
                      mods.tabs.addTab(undefined, tab)

                  } catch (error) {
                      onError(`Error parsing JSON file: ${error.message}`);
                  } finally {
                      document.body.removeChild(input); // Clean up input after processing
                  }
              };
              reader.onerror = () => {
                  alert(`Error reading file: ${reader.error}`);
                  document.body.removeChild(input);
              };
              reader.readAsText(file);
          });
          document.body.appendChild(input);
          input.click();
      },


      getVisualTabFromId: (index) => document.querySelector(`.sandwhich-tab[data-tab-id="${index}"]`),


      createVisualTabButton: function (index, name) {
          const tabList = document.querySelector('#sandwhich-tab-list');
          const tabButton = document.createElement('button');
          tabButton.className = 'sandwhich-tab';
          tabButton.dataset.tabId = index;
          if (this.tabData.currTab === index) tabButton.classList.add('active');

          tabButton.textContent = name || `Tab ${index + 1}`;
          tabButton.draggable = true;


          tabButton.addEventListener('dragstart', (e) => {
              mods.tabs.draggedTabIndex = index;
          });
          tabButton.addEventListener('dragover', (e) => {
              e.preventDefault();
              const targetTab = event.target.closest('.sandwhich-tab');
              if (targetTab && parseInt(targetTab.dataset.tabId, 10) !== mods.tabs.draggedTabIndex) {
                  targetTab.classList.add('drag-over');
              }
          });
          tabButton.addEventListener('dragleave', (e) => {
              const targetTab = event.target.closest('.sandwhich-tab');
              if (targetTab) targetTab.classList.remove('drag-over');
          });
          tabButton.addEventListener('drop', (e) => {
              event.preventDefault();
              const draggedTab = mods.tabs.tabData.tabs.splice(mods.tabs.draggedTabIndex, 1)[0]
              mods.tabs.tabData.tabs.splice(index, 0, draggedTab);
              mods.tabs.tabData.currTab = index;

              mods.tabs.refreshVisualTabButtons();
              mods.tabs.saveTabData();
          });


          tabButton.onmousedown = () => mods.tabs.switchTab(index);
          tabButton.oncontextmenu = (e) => {
              e.preventDefault();
              mods.tabs.showContextMenu(e, [
                  ['Rename', () => mods.tabs.renameTab(index)],
                  ['Duplicate', () => mods.tabs.duplicateTab(index)],
                  ['Download', () => mods.tabs.downloadTab(index)],
                  ['Delete', () => mods.tabs.deleteTab(index)],
              ]);
          };

          tabButton.addEventListener('animationend', () => {
              tabButton.style.animation = 'none';
          });

          const referenceNode = this.getVisualTabFromId(index + 1) ?? tabList.querySelector('.addButton');
          tabList.insertBefore(tabButton, referenceNode);
      },


      refreshVisualTabButtons: function () {
          const tabList = document.querySelector('#sandwhich-tab-list');
          // clear all children
          tabList.innerHTML = '';
          this.tabData.tabs.forEach((tab, index) => mods.tabs.createVisualTabButton(index, tab.name));
      },


      showContextMenu: function(event, options) {
          const contextMenu = document.querySelector("#sandwhich-tab-contextmenu");
          contextMenu.innerHTML = '';

          for (const [name, func] of options) {
              const contextmenuOption = document.createElement('div');
              contextmenuOption.className = 'sandwhich-tab-contextmenu-option ' + name.toLowerCase();
              contextmenuOption.textContent = name;
              contextmenuOption.onclick = () => { func(); contextMenu.style.display = 'none'; };
              contextMenu.appendChild(contextmenuOption);
          }

          contextMenu.style.left = `${event.pageX}px`;
          contextMenu.style.top = `${event.pageY}px`;
          contextMenu.style.display = 'block';

          document.addEventListener('click', (clickEvent) => contextMenu.style.display = 'none', { once: true, capture: true });
      },
  },




























//            _____  _____ ____  _____ _____   ______   ____   ________   _________      _______ _________      __      _______      ______ ____  ____
//           |_   _||_   _|_   \|_   _|_   _|./ ___  |.'    \.|_   ___ \.|_   ___  |    /  ___  |_   ___  |    /  \    |_   __ \   ./ ___  |_   ||   _|
//             | |    | |   |   \ | |   | | / ./   \_|  .--.  \ | |   \. \ | |_  \_|   |  (__ \_| | |_  \_|   / /\ \     | |__) | / ./   \_| | |__| |
//             | '    ' |   | |\ \| |   | | | |      | |    | | | |    | | |  _|  _     '.___\-.  |  _|  _   / ____ \    |  __ /  | |        |  __  |
//              \ \--' /   _| |_\   |_ _| |_\ \.___.'\  \--'  /_| |___.' /_| |___/ |   |\\____) |_| |___/ |_/ /    \ \_ _| |  \ \_\ \.___.'\_| |  | |_
//               \.__.'   |_____|\____|_____|\._____.'\.____.'|________.'|_________|   |_______.'_________|____|  |____|____| |___|\._____.'____||____|
  unicode: {
      unicodeData: null,
      unicodeElements: null,
      segmenter: null,
      recipeModalObserver: null,
      itemScopedDataAttribute: null,
      searchDiscoveries: false,
      nealSortFunctions: {
          time: function(a, b) { return a.id - b.id },
          // modified for unicode
          name: function(a, b) { return a.text.codePointAt(0) - b.text.codePointAt(0) || a.text.localeCompare(b.text) },
          // fixed
          emoji: function(a, b) { return (a?.emoji ?? '').localeCompare(b?.emoji ?? '') },
          new: function(a, b) { return b.id - a.id },
          length: function(a, b) { return a.text.length - b.text.length },
          random: function() { return Math.random() - .5 }
      },
      categoryMap: {
          'Cc': 'Other, Control',
          'Cf': 'Other, Format',
          'Cn': 'Other, Not Assigned', // (no characters in the file have this property)
          'Co': 'Other, Private Use',
          'Cs': 'Other, Surrogate',
          'LC': 'Letter, Cased',
          'Ll': 'Letter, Lowercase',
          'Lm': 'Letter, Modifier',
          'Lo': 'Letter, Other',
          'Lt': 'Letter, Titlecase',
          'Lu': 'Letter, Uppercase',
          'Mc': 'Mark, Spacing Combining',
          'Me': 'Mark, Enclosing',
          'Mn': 'Mark, Nonspacing',
          'Nd': 'Number, Decimal Digit',
          'Nl': 'Number, Letter',
          'No': 'Number, Other',
          'Pc': 'Punctuation, Connector',
          'Pd': 'Punctuation, Dash',
          'Pe': 'Punctuation, Close',
          'Pf': 'Punctuation, Final quote', // (may behave like Ps or Pe depending on usage)
          'Pi': 'Punctuation, Initial quote', // (may behave like Ps or Pe depending on usage)
          'Po': 'Punctuation, Other',
          'Ps': 'Punctuation, Open',
          'Sc': 'Symbol, Currency',
          'Sk': 'Symbol, Modifier',
          'Sm': 'Symbol, Math',
          'So': 'Symbol, Other',
          'Zl': 'Separator, Line',
          'Zp': 'Separator, Paragraph',
          'Zs': 'Separator, Space',
      },


      init: function () {
          if (typeof Intl === 'object' && Intl.Segmenter) {
              this.segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
          }


          if (settings.unicode.infoInRecipeModal) this.startRecipeModalObserver();

          if (settings.unicode.searchEnabled) this.enableSearch();


          document.querySelector('.sort-direction').addEventListener('click', () => {
              this.unicodeElements.reverse();
              this.performSearch();
          });

          document.querySelector('.sidebar-discoveries').addEventListener('click', () => {
              this.searchDiscoveries = !this.searchDiscoveries;
              this.performSearch();
          });

          const v_sidebar = document.querySelector('#sidebar').__vue__;
          const modsUnicode = this;
          const changeSort = v_sidebar.changeSort;
          v_sidebar.changeSort = function (...args) {
              setTimeout(() => {
                  modsUnicode.updateUnicodeElementsSort();
                  modsUnicode.performSearch();
              }, 0);
              return changeSort(...args);
          }

          const v_container = document.querySelector('.container').__vue__;
          const craftApi = v_container.craftApi;
          v_container.craftApi = async function (...args) {
              let response = await craftApi(...args);

              if (response && modsUnicode.unicodeElements && modsUnicode.isUnicode(response.text) && !modsUnicode.unicodeElements.find(({ text }) => text === response.text)) {
                  modsUnicode.unicodeElements.push(response);
                  modsUnicode.updateUnicodeElementsSort();
                  modsUnicode.performSearch();
              }

              return response;
          }

      },




      enableCheckbox: function () {
          this.updateUnicodeElements();
          document.querySelector('.sidebar-input').addEventListener('input', this.updateSearch);
      },
      disableCheckbox: function () {
          document.querySelector('.sandwhich-unicode-items-inner').innerHTML = '';
          document.querySelector('.sidebar-input').removeEventListener('input', this.updateSearch);
          document.querySelector('.sandwhich-unicode-header-label').textContent = `Unicode Search`;
          this.unicodeElements = null;
      },



      enableSearch: function () {
          const modsUnicode = this;

          const unicodeContainer = document.createElement("div");
	        unicodeContainer.className = 'sandwhich-unicode-items';
	        const itemContainer = document.createElement("div");
	        itemContainer.className = 'sandwhich-unicode-items-inner';


          const header = document.createElement("div");
          header.className = 'sandwhich-unicode-header';

          const checkbox = document.createElement("input");
          checkbox.className = 'sandwhich-unicode-checkbox';
          checkbox.type = 'checkbox';
          checkbox.checked = settings.unicode.searchCheckbox;


          checkbox.addEventListener('change', (e) => {
              settings.unicode.searchCheckbox = e.target.checked;
              if (e.target.checked) modsUnicode.enableCheckbox();
              else modsUnicode.disableCheckbox();
          });

          const label = document.createElement("label");
          label.htmlFor = checkbox.id;
          label.textContent = "Unicode Search";
          label.className = 'sandwhich-unicode-header-label';


          header.appendChild(checkbox);
          header.appendChild(label);

          unicodeContainer.appendChild(header);
          unicodeContainer.appendChild(itemContainer);

          document.querySelector('.items').before(unicodeContainer);


          this.fetchUnicodeData();
          if (unsafeWindow.IC) this.enableCheckbox();
          else {
              const v_container = document.querySelector(".container").__vue__;
              const addAPI = v_container.addAPI;
              v_container.addAPI = function() {

                  // elements loaded!!!
                  setTimeout(() => {
                      if (settings.unicode.searchEnabled && settings.unicode.searchCheckbox) modsUnicode.enableCheckbox();
                  }, 0);

                  v_container.addAPI = addAPI;
                  return addAPI.apply(this, arguments);
              }
          }
          settings.unicode.searchEnabled = true;
      },


      disableSearch: function () {
          document.querySelector('.sandwhich-unicode-items').remove();

          settings.unicode.searchEnabled = false;
      },




      startRecipeModalObserver: function() {
          if (this.recipeModalObserver) return;
          const modsUnicode = this;

          const modalElement = document.querySelector("dialog.recipe-modal");
          if (!modalElement) {
              console.error("Helper not installed, can't add a subtitle to the recipe modal...");
              return;
          }
          const header = document.querySelector('.recipe-modal-header');

          const subtitleElement = document.createElement('a');
          subtitleElement.className = 'recipe-modal-subtitle';
          subtitleElement.addEventListener("click", () => {
              if (subtitleElement.classList.contains('sandwhich-unicode-info-expanded')) return;

              const itemText = modalElement.querySelector('.recipe-modal-title').childNodes[1].textContent.trim();
              subtitleElement.innerHTML = Array.from(itemText)
                  .map(char => {
                      const codepoint = char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
                      const unicodeName = mods.unicode.unicodeData[codepoint]?.[0] ?? 'no name found...';
                      const unicodeCategory = mods.unicode.categoryMap[mods.unicode.unicodeData[codepoint]?.[1]] ?? 'no category found...';
                      return `U+${codepoint} - ${unicodeName} - ${unicodeCategory}`;
                  })
                  .join('<br>');
              subtitleElement.classList.add('sandwhich-unicode-info-expanded');
          });
          header.appendChild(subtitleElement);


          this.rightClickUpListener = function (e) {
              if (e.button === 2) {
                  subtitleElement.textContent = 'Show Unicode Info';
                  subtitleElement.classList.remove('sandwhich-unicode-info-expanded');
              }
          }

          document.addEventListener('mouseup', this.rightClickUpListener);
          this.fetchUnicodeData();
      },


      stopRecipeModalObserver: function() {
          document.querySelector('.recipe-modal-subtitle').remove();
          document.removeEventListener('mouseup', this.rightClickUpListener)
      },




      fetchUnicodeData: function () {
          if (this.unicodeData) return;

          GM.xmlHttpRequest({
              method: "GET",
              url: "https://unicode.org/Public/UNIDATA/UnicodeData.txt",
              onload: function(response) {
                  if (response.status === 200) mods.unicode.unicodeData = mods.unicode.parseUnicodeData(response.responseText);
                  else console.error("Failed to load Unicode data:", response.status, response.statusText);
              },
              onerror: function(error) {
                  console.error("Error fetching Unicode data:", error);
              }
          });
      },

      parseUnicodeData: function (unicodeText) {
          return unicodeText.trim().split('\n').reduce((acc, line) => {
              const [codePoint, name, category] = line.split(';', 3);
              acc[codePoint] = [name, category];
              return acc;
          }, {});
      },


      isUnicode: function (text) {
          if (!settings.unicode.searchMultiCharacter || !this.segmenter) {
              const utf16Length = text.length;

              // guaranteed to be one code point
              return utf16Length === 1
              // If UTF-16 length is 2, check if it's a surrogate pair (one code point)
                 || (utf16Length === 2 && Array.from(text).length === 1)
              // If length > 2, it cannot be a single code point
          }
          // [ -~] any ascii character -> if it has 2 or more ascii character its not going to appear 1 long.
          else return !/[ -~].*[ -~]/.test(text) && Array.from(this.segmenter.segment(text)).length === 1;

      },

      updateUnicodeElements: function () {
          if (!settings.unicode.searchCheckbox) return;

          console.time('updateUnicodeElements');
          this.unicodeElements = unsafeWindow.IC.getItems()
              .filter(({ text }) => this.isUnicode(text));
          this.updateUnicodeElementsSort();
          this.performSearch();
          console.timeEnd('updateUnicodeElements');
      },


      updateUnicodeElementsSort: function () {
          const v_sidebar = document.querySelector('#sidebar').__vue__;
          const sortBy = v_sidebar.sortBy?.name;
          const sortFunction = this.nealSortFunctions[sortBy];
          if (sortFunction && sortBy !== 'time') {
              this.unicodeElements = this.unicodeElements.sort(sortFunction);
          }
          else if (sortBy !== "time") console.log('could not find sortFunction', sortBy);
      },




      findItemScopedDataAttribute: function () {
          if (!mods.unicode.itemScopedDataAttribute) {
              const sampleItem = document.querySelector('.item');
              if (!sampleItem) console.warn("SandwichMod: No '.item' element found to determine scoped attribute.");

              for (const attr of sampleItem.attributes) {
                  if (attr.name.startsWith('data-v-')) {
                      mods.unicode.itemScopedDataAttribute = attr.name;
                      break;
                  }
              }
          }
          return mods.unicode.itemScopedDataAttribute;
      },

      createItemElement: function (item, wrap = false) {
      	  const itemDiv = document.createElement("div");
          itemDiv.setAttribute(mods.unicode.findItemScopedDataAttribute(), '');
      	  itemDiv.setAttribute("data-item-emoji", item.emoji);
      	  itemDiv.setAttribute("data-item-text", item.text);
      	  itemDiv.setAttribute("data-item-id", item.id);
      	  itemDiv.setAttribute("data-item", "");
      	  itemDiv.classList.add("item");
          if (item.discovery) {
      	      itemDiv.setAttribute("data-item-discovery", "");
              itemDiv.classList.add('item-discovery');
          }

      	  const emoji = document.createElement("span");
      	  emoji.classList.add("item-emoji");
      	  emoji.appendChild(document.createTextNode(item.emoji ?? "⬜"));

      	  itemDiv.append(emoji, document.createTextNode(` ${item.text} `));

      	  if (wrap) {
      	  	  const wrapper = document.createElement("div");
      	  	  wrapper.classList.add("item-wrapper");
      	  	  wrapper.appendChild(itemDiv);
      	  	  return wrapper;
      	  }

      	  return itemDiv;
      },



      updateSearch: function () {
          clearTimeout(this.updateSearchTimeoutId);

          this.updateSearchTimeoutId = setTimeout(mods.unicode.performSearch, settings.unicode.searchDebounceDelay);
      },


      performSearch: function (amount=settings.unicode.searchAmount) {
          if (!settings.unicode.searchCheckbox) return;

          console.time('performSearch');
          const searchQuery = document.querySelector('#sidebar').__vue__.searchQuery;
          const upperSearchQuery = searchQuery.toUpperCase();
          const itemsContainer = document.querySelector('.sandwhich-unicode-items-inner');
          itemsContainer.innerHTML = '';


          const fragment = document.createDocumentFragment();
          let added = 0;

          for (const element of mods.unicode.unicodeElements) {
              let isMatch = false;

              if (mods.unicode.searchDiscoveries && !element.discovery) continue;

              const elementText = element.text;
              if (elementText.toUpperCase() === upperSearchQuery) isMatch = true;

              else {
                  const codepoint = elementText.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
                  if (codepoint.includes(upperSearchQuery)) isMatch = true;

                  else {
                      const unicodeEntry = mods.unicode.unicodeData[codepoint] ?? [];   // [name, category]
                      if (
                          unicodeEntry[0]?.includes(upperSearchQuery)
                          || mods.unicode.categoryMap[unicodeEntry[1]]?.toUpperCase()?.includes(upperSearchQuery)
                      ) isMatch = true;
                  }
              }

              if (isMatch && added++ < amount) {
                  fragment.appendChild(mods.unicode.createItemElement(element, !settings.unicode.searchCompact));
              }
          }

          itemsContainer.appendChild(fragment);
          document.querySelector('.sandwhich-unicode-header-label').textContent = `Unicode Search - ${added}`;

          if (added > amount) {
              const showAll = document.createElement('a');
              showAll.className = 'sandwhich-unicode-showall';
              showAll.textContent = 'Show All';
              showAll.addEventListener('click', () => mods.unicode.performSearch(Infinity));
              itemsContainer.appendChild(showAll);
          }

          console.timeEnd('performSearch');
      },
  },
}

// expose everything to window
unsafeWindow.sandwhichModStuff = mods;






// --- Init Mods ---
unsafeWindow.addEventListener('load', () => {
    for (const [name, mod] of Object.entries(mods)) {
        mod.init();
    }
});


















    const settingsEntries = [
{
  name: "Selection Utils",
  description: "Style the Selection Box!",
  toggle: true,
  toggleState: () => settings.selection.enabled,
  toggleHandle: (elements) => elements.checked ? mods.selection.enable() : mods.selection.disable(),
  inputs: [
    {
      label: "Color: ",
      type: "colorPicker",
      content: () => settings.selection.customColor,
      handle(elements) {
          settings.selection.customColor = elements.value;
          mods.selection.update();
      }
    },
    {
      label: "Border Style: ",
      type: "dropdown",
      options: ["solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"],
      content: () => settings.selection.borderStyle,
      handle(value) {
          settings.selection.borderStyle = value;
          mods.selection.update();
      }
    },
    {
      label: "Border Width: ",
      type: "number",
      content: () => settings.selection.borderWidth,
      handle(elements) {
          settings.selection.borderWidth = Math.min(elements.value, 30);
          mods.selection.update();
      }
    },
    {
      label: "Chroma Speed: ",
      type: "number",
      content: () => settings.selection.chromaSpeed,
      handle(elements) {
          settings.selection.chromaSpeed = Number(elements.value);
          mods.selection.update();
      }
    },
    {
      label: "Scale: ",
      type: "number",
      content: () => settings.selection.scale,
      handle(elements) {
          settings.selection.scale = Number(elements.value);
          mods.selection.update();
      }
    },
  ]
},
{
  name: "Tab Utils",
  description: "Saves all elements on screen into one Tab.\nTabs save on reloading/reopening Infinite Craft!",
  toggle: true,
  toggleState: () => settings.tabs.enabled,
  toggleHandle: (elements) => elements.checked ? mods.tabs.enable() : mods.tabs.disable(),
  inputs: [
    {
      label: "Color: ",
      type: "colorPicker",
      content: () => settings.tabs.customColor,
      handle(elements) {
          settings.tabs.customColor = elements.value;
          mods.tabs.updateColors();
      }
    },
  ]
},
{
  name: "Spawn Utils",
  description: "A bunch of helpful element spawning things!",
  inputs: [
    {
      label: "Copy Element(s) - Ctrl + C: ",
      description: "copies the element you are hovering over (works with selections)",
      type: "toggle",
      content: () => settings.spawn.copy,
      handle(elements) {
          settings.spawn.copy = elements.checked;
      }
    },
    {
      label: "Paste Element(s)/Lineages - Ctrl + Shift + V: ",
      type: "toggle",
      content: () => settings.spawn.paste,
      handle(elements) {
          settings.spawn.paste = elements.checked;
      }
    },
    {
      label: "Spawn non-crafted Elements as Ghosts: ",
      description: "Ghost Elements can't be moved or combined.\nThey turn into real elements once they're crafted!",
      type: "toggle",
      content: () => settings.spawn.ghosts,
      handle(elements) {
          settings.spawn.ghosts = elements.checked;
      }
    },
    {
      label: "Spawn from Selected - Ctrl + B: ",
      description: "Spawns entire alphabets/unicode rows from the selected element.",
      type: "toggle",
      content: () => settings.spawn.fromSelected,
      handle(elements) {
          settings.spawn.fromSelected = elements.checked;
      }
    },
  ]
},
{
  name: "Unicode Search",
  description: "Enables searching in:\n- the Unicode Codepoint (e.g. U+0069)\n- the Unicode Name (e.g. LATIN CAPITAL LETTER A)",
  toggle: true,
  toggleState: () => settings.unicode.searchEnabled,
  toggleHandle: (elements) => elements.checked ? mods.unicode.enableSearch() : mods.unicode.disableSearch(),
  inputs: [
    {
      label: "Search Elements Amount:",
      type: "number",
      content: () => settings.unicode.searchAmount,
      handle(elements) {
          settings.unicode.searchAmount = Number(elements.value);
          mods.unicode.performSearch();
      }
    },
    {
      label: "Search Debounce Delay (in ms):",
      type: "number",
      content: () => settings.unicode.searchDebounceDelay,
      handle(elements) {
          settings.unicode.searchDebounceDelay = Number(elements.value);
      }
    },
    {
      label: "Search Compact Mode:",
      type: "toggle",
      content: () => settings.unicode.searchCompact,
      handle(elements) {
          settings.unicode.searchCompact = elements.checked;
          mods.unicode.performSearch();
      }
    },
    {
      label: "Allow Multi-character Stuff:",
      type: "toggle",
      content: () => settings.unicode.searchMultiCharacter,
      handle(elements) {
          settings.unicode.searchMultiCharacter = elements.checked;
          mods.unicode.updateUnicodeElements();
      }
    },
  ]
},
{
  name: "Unicode Utils",
  description: "",
  inputs: [
    {
      label: "Show Unicode Info in Recipe Menu:",
      description: "e.g. U+0069 - LATIN SMALL LETTER I\nRequires the Helper Script",
      type: "toggle",
      content: () => settings.unicode.infoInRecipeModal,
      handle(elements) {
          settings.unicode.infoInRecipeModal = elements.checked;
          elements.checked ? mods.unicode.startRecipeModalObserver() : mods.unicode.stopRecipeModalObserver();
      }
    },
  ]
},
    ];


    function addSandwhichButtonToModal(modal) {
        if (modal.querySelector('.sandwhich-settings-trigger-button')) return; // Prevent duplicates

        const button = document.createElement('div');
        button.textContent = '🥪 Sandwhich Settings';
        button.className = 'sandwhich-settings-trigger-button';

        button.addEventListener('click', (event) => {
            event.stopPropagation();
            // console.log("SandwhichMod: Sandwhich Settings button clicked inside modal.");

            modal.innerHTML = '';
            modal.classList.add('sandwhich-settings'); // Use class to toggle CSS
            renderSettingsUI(modal);
        });

        modal.appendChild(button);
        // console.log("SandwhichMod: Added settings trigger button to modal.");
    }


    // --- Observe for Modal Appearance (Define Observer - keep the existing one) ---
    const modalObserver = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    // Check if the added node *is* the modal or *contains* the modal
                    if (node.nodeType === Node.ELEMENT_NODE) {
                         // The modal itself might be added, or it might be inside another added container
                        const modal = node.matches('.modal') ? node : node.querySelector('.modal');
                        if (modal) {
                            addSandwhichButtonToModal(modal);
                        }
                    }
                });
            }
        }
    });
    modalObserver.observe(document.body, {
        childList: true,
        subtree: true
    });



    // --- Settings UI Rendering ---
    function renderSettingsUI(container) {
        container.innerHTML = ''; // Clear previous content
        container.classList.add('sandwhich-settings-container'); // Add a class for styling

        // Add a title
        const title = document.createElement('h2');
        title.textContent = '🥪 Sandwhich Utils Mod Settings';
        title.style.textAlign = 'center';
        title.style.marginTop = '0';
        title.style.marginBottom = '20px'; // Add some space below title
        container.appendChild(title);


        settingsEntries.forEach(entry => {
            const section = document.createElement('div');
            section.className = 'sandwhich-setting-section';

            const header = document.createElement('div');
            header.className = 'sandwhich-setting-header';

            const name = document.createElement('h3');
            name.textContent = entry.name;
            header.appendChild(name);

            let inputsContainer = null;

            // Main toggle for the section (if applicable)
            if (entry.toggle) {
                const toggleLabel = document.createElement('label');
                toggleLabel.className = 'sandwhich-toggle-switch';
                const toggleInput = document.createElement('input');
                toggleInput.type = 'checkbox';
                toggleInput.checked = entry.toggleState();
                toggleInput.addEventListener('change', (e) => {
                    entry.toggleHandle(e.target); // Pass the checkbox element
                    if (inputsContainer) { // Check if inputs container exists
                        if (e.target.checked) inputsContainer.classList.remove('sandwhich-inputs-collapsed');
                        else inputsContainer.classList.add('sandwhich-inputs-collapsed');
                    }
                });
                const slider = document.createElement('span');
                slider.className = 'sandwhich-slider';

                toggleLabel.appendChild(toggleInput);
                toggleLabel.appendChild(slider);
                header.appendChild(toggleLabel);
            }

            section.appendChild(header);


            if (entry.description) {
                const description = document.createElement('p');
                description.className = 'sandwhich-setting-description';
                description.innerHTML = entry.description.replace(/\n/g, '<br>'); // Preserve line breaks
                section.appendChild(description);
            }

            // Inputs for the section
            if (entry.inputs && entry.inputs.length > 0) {
                inputsContainer = document.createElement('div');
                inputsContainer.className = 'sandwhich-inputs-container';

                entry.inputs.forEach(inputDef => {
                    const inputRow = document.createElement('div');
                    inputRow.className = 'sandwhich-input-row';

                    const label = document.createElement('label');
                    label.textContent = inputDef.label || '';
                    inputRow.appendChild(label);

                    let inputElement;

                    switch (inputDef.type) {
                        case 'toggle':
                            const toggleLabel = document.createElement('label');
		                    toggleLabel.className = 'sandwhich-toggle-switch small'; // smaller toggle
		                    inputElement = document.createElement('input');
		                    inputElement.type = 'checkbox';
		                    inputElement.checked = inputDef.content(); // Get initial state
		                    inputElement.addEventListener('change', (e) => {
		                        // Assume handle modifies the proxied 'settings' object
		                        inputDef.handle(e.target);
		                    });
		                    const slider = document.createElement('span');
		                    slider.className = 'sandwhich-slider';
                            toggleLabel.appendChild(inputElement);
                            toggleLabel.appendChild(slider);
                            inputRow.appendChild(toggleLabel); // Add the whole switch not just the input
                            break; // Break here, inputElement is handled inside the label

                        case 'colorPicker':
                            inputElement = document.createElement('input');
                            inputElement.type = 'color';
                            inputElement.value = inputDef.content(); // Get initial color
                            inputElement.addEventListener('input', (e) => {
                                // Assume handle modifies the proxied 'settings' object
                                inputDef.handle(e.target); // Pass the input element
                            });
                             inputRow.appendChild(inputElement);
                            break;

                        case 'dropdown':
                            inputElement = document.createElement('select');
                            const currentValue = inputDef.content();
                            inputDef.options.forEach(optionValue => {
                                const option = document.createElement('option');
                                option.value = optionValue;
                                option.textContent = optionValue;
                                if (optionValue === currentValue) {
                                    option.selected = true;
                                }
                                inputElement.appendChild(option);
                            });
                            inputElement.addEventListener('change', (e) => {
                                // Assume handle modifies the proxied 'settings' object
                                inputDef.handle(e.target.value); // Pass the selected value
                            });
                             inputRow.appendChild(inputElement);
                            break;

                        case 'number':
                            inputElement = document.createElement('input');
                            inputElement.type = 'number';
                            inputElement.value = inputDef.content(); // Get initial number
                            inputElement.addEventListener('input', (e) => {
                                // Assume handle modifies the proxied 'settings' object
                                inputDef.handle(e.target); // Pass the input element
                            });
                             inputRow.appendChild(inputElement);
                            break;

                        default:
                            console.warn(`SandwhichMod: Unknown input type "${inputDef.type}"`);
                            const span = document.createElement('span');
                            span.textContent = ` [Unsupported type: ${inputDef.type}]`;
                            inputRow.appendChild(span);
                    }

                    // Add description for the specific input if present
                     if (inputDef.description) {
                         const inputDesc = document.createElement('p');
                         inputDesc.className = 'sandwhich-input-description';
                         inputDesc.innerHTML = inputDef.description.replace(/\n/g, '<br>');
                         inputRow.appendChild(inputDesc); // Append description within the row
                     }

                    inputsContainer.appendChild(inputRow);
                });
                section.appendChild(inputsContainer);
            }

            container.appendChild(section);
        });
    }





GM_addStyle(`
.sandwhich-settings-trigger-button {
    position: absolute; /* Position relative to the nearest positioned ancestor (the modal, if styled correctly) */
    bottom: -50px;
    right: 0px;
    padding: 10px 15px;
    background-color: #f0e68c; /* Khaki-like color */
    color: #333;
    border: 1px solid #ccc;
    border-radius: 5px;
    border-width: 2px;
    cursor: pointer;
    box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
    font-size: 14px;
    font-weight: bold;
    user-select: none;
}
.sandwhich-settings-trigger-button:hover {
    background-color: #e8db7f; /* Slightly lighter */
    border-color: #b8ae6b;  /* Slightly darker */
}


.sandwhich-settings-container {
    height: 90%;
    overflow-y: auto;
    animation: none !important;
}
.sandwhich-setting-section {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
}
.sandwhich-setting-section:last-child {
    border-bottom: none;
}


.sandwhich-setting-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}
.sandwhich-setting-header h3 {
    margin: 0;
    font-size: 1.1em;
    color: #fff614;
}
.sandwhich-setting-description {
    font-size: 0.9em;
    color: #a7a7a7;
    margin-bottom: 15px;
    line-height: 1.2;
}
.sandwhich-inputs-container {
    margin-top: 10px;
    padding-left: 15px; /* Indent inputs slightly */

    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out,
                padding-top 0.3s ease-in-out, padding-bottom 0.3s ease-in-out,
                margin-top 0.3s ease-in-out;
    overflow: hidden;
}
.sandwhich-inputs-container.sandwhich-inputs-collapsed {
    /* --- Styles for the collapsed state --- */
    max-height: 0;
    opacity: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    /* Optional: Add border-top to visually separate when collapsed */
    /* border-top: 1px solid #444; */
    /* margin-top: 5px; */ /* Add space before border if using */
}
.sandwhich-input-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap; /* Allow wrapping on small screens */
}
 .sandwhich-input-row label:first-child {
    margin-right: 10px;
    font-weight: bold;
    min-width: 200px; /* Align input elements */
    flex-shrink: 0;
}
.sandwhich-input-row input[type="color"],
.sandwhich-input-row input[type="number"],
.sandwhich-input-row select {
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin-right: 10px;
}
.sandwhich-input-row input[type="number"] {
   width: 60px; /* Specific width for numbers */
}
.sandwich-input-row input[type="color"] {
    min-width: 40px; /* Ensure color picker is usable */
    height: 30px;
    padding: 2px;
}
.sandwhich-input-description {
    font-size: 0.85em;
    color: #777;
    margin: 5px 0 0 20px; /* Align with inputs */
    flex-basis: 100%; /* Ensure it takes full width */
    line-height: 1.3;
}

/* Toggle Switch Styles */
.sandwhich-toggle-switch {
    position: relative;
    display: inline-block;
    width: 50px; /* Width of the switch */
    height: 24px; /* Height of the switch */
    margin-left: 10px;
}
.sandwhich-toggle-switch.small { /* Smaller version for input rows */
     width: 40px;
     height: 20px;
}
.sandwhich-toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}
.sandwhich-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px; /* Rounded corners */
}
.sandwhich-toggle-switch.small .sandwhich-slider {
     border-radius: 20px;
}
.sandwhich-slider:before {
    position: absolute;
    content: "";
    height: 18px; /* Size of the circle */
    width: 18px; /* Size of the circle */
    left: 3px; /* Position from left */
    bottom: 3px; /* Position from bottom */
    background-color: white;
    transition: .4s;
    border-radius: 50%; /* Make it a circle */
}
.sandwhich-toggle-switch.small .sandwhich-slider:before {
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
}

input:checked + .sandwhich-slider {
    background-color: #2196F3; /* Color when ON */
}
input:checked + .sandwhich-slider:before {
    transform: translateX(26px); /* Move circle to the right */
}
.sandwhich-toggle-switch.small input:checked + .sandwhich-slider:before {
    transform: translateX(20px); /* Move circle for small switch */
}




#select-box.sandwhich-select-box {
  /* disable neals default styles */
  border-color: transparent !important;
  background-color: transparent !important;
}

/* pseudo-element */
#select-box.sandwhich-select-box::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border: var(--sandwhich-sel-border);
  background-color: var(--sandwhich-sel-background);
  animation: var(--sandwhich-sel-chroma-animation);
}


body.sandwhich-sel-active .instance-selected {
  border: transparent !important;
  background-color: transparent !important;

  scale: var(--sandwhich-sel-scale);
}

/* pseudo-element for selected instances when mod is active */
body.sandwhich-sel-active .instance-selected::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;

  border: var(--sandwhich-sel-border);
  background-color: var(--sandwhich-sel-background);
  animation: var(--sandwhich-sel-chroma-animation);
  border-radius: inherit;
}


@keyframes sandwhich-chromaCycleBorder {
  0%  { border-color: rgb(255, 0,   0  ); } /* Red */
  10% { border-color: rgb(255, 127, 0  ); } /* Orange */
  20% { border-color: rgb(255, 255, 0  ); } /* Yellow */
  30% { border-color: rgb(127, 255, 0  ); } /* Lime */
  40% { border-color: rgb(0,   255, 0  ); } /* Green */
  50% { border-color: rgb(0,   255, 255); } /* Aqua */
  60% { border-color: rgb(0,   127, 255); } /* Light Blue */
  70% { border-color: rgb(0,   0,   255); } /* Blue */
  80% { border-color: rgb(127, 0,   255); } /* Purple */
  90% { border-color: rgb(255, 0,   255); } /* Magenta */
  100%{ border-color: rgb(255, 0,   127); } /* Pink */
}
@keyframes sandwhich-chromaCycleBackground {
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
@keyframes sandwhich-rotateBorder {
  100% { transform: rotate(360deg); }
}



#sandwhich-tab-container {
    position: absolute;
    top: 5px;
    display: flex;
    align-items: start;
    padding: 5px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 100;
}
#sandwhich-tab-list {
    display: flex;
    align-items: center;
    overflow: auto;
    pointer-events: auto;
}
.sandwhich-tab, .sandwhich-tab-add-button {
    user-select: none;
    display: flex;
    background-color: color-mix(in srgb, var(--sandwhich-tab-color) 25%, #000 75%);
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
.sandwhich-tab.active {
    background-color: color-mix(in srgb, var(--sandwhich-tab-color) 60%, #000 40%);
    color: #fff;
}
.sandwhich-tab:not(.active):hover, .sandwhich-tab-add-button:hover {
    background-color: color-mix(in srgb, var(--sandwhich-tab-color) 40%, #000 60%);
}
.sandwhich-tab.drag-over {
    box-shadow: inset 0 0 0 2px #77aaff;
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
#sandwhich-tab-contextmenu {
    position: absolute;
    background-color: #333;
    color: #ccc;
    border: 1px solid #555;
    border-radius: 5px;
    padding: 5px;
    z-index: 1000;
}
.sandwhich-tab-contextmenu-option {
    padding: 5px;
    cursor: pointer;
}
.sandwhich-tab-contextmenu-option:hover {
    background-color: #444;
    color: #ddd;
}
.sandwhich-tab-contextmenu-option.delete {
    color: indianred;
}





.recipe-modal-subtitle:not(.sandwhich-unicode-info-expanded) {
    opacity: 0.7;
	  cursor: pointer;
	  text-decoration: underline dotted;
    user-select: none;
}
.recipe-modal-subtitle.sandwhich-unicode-info-expanded {
    font: caption;
    user-select: text;
}
.recipe-modal-subtitle:hover {
	  opacity: 1;
}

.sandwhich-unicode-items {
	line-height: .5em;
	background-color: var(--sidebar-bg);
	position: relative;
	border-bottom: 1px solid var(--border-color);
	flex-shrink: 0;
}
.sandwhich-unicode-header {
  display: flex;
  align-items: center;
  padding: 10px 10px 0px 10px;
}
.sandwhich-unicode-checkbox {
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
.sandwhich-unicode-checkbox:checked {
    border-color: #FFBF00;
}
.sandwhich-unicode-checkbox:checked::after {
    content: '';
    display: block;
    position: absolute;
    /* Position the checkmark */
    top: 2px;
    left: 5px;
    width: 4px;
    height: 8px;

    /* Create the checkmark shape using borders */
    border: solid #FFBF00;
    border-width: 0 2px 2px 0;

    transform: rotate(45deg);
}




.sandwhich-unicode-header-label {

}
.sandwhich-unicode-items-inner {
	  padding: 9px;
	  display: flex;
    flex-wrap: wrap;
}
.sandwhich-unicode-showall {
    opacity: 0.7;
	  cursor: pointer;
	  text-decoration: underline dotted;
    user-select: none;
    align-self: center;
    padding: 10px;
    padding-left: 20px;
    padding-right: 20px;
}
.sandwhich-unicode-showall:hover {
	  opacity: 1;
}
`);



})();
