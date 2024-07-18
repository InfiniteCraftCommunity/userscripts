// ==UserScript==
// @name        Infinite Craft Tab Utils
// @namespace   Catstone
// @match       https://neal.fun/infinite-craft/
// @grant       GM_getValue
// @grant       GM_setValue
// @version     1.3
// @author      Catstone
// @license     MIT
// @description Adds tab functionality to Infinite Craft!
// ==/UserScript==

(function() {
    'use strict';


    let currentTab = GM_getValue('currentTab', 0);
    const defaultData = [{elements: [], name: "Tab 1"}];
    if (GM_getValue('tabData') === undefined) {
        GM_setValue('tabData', defaultData);
    }
    const style = document.createElement('style');
    style.textContent = `
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
        }
        .tabs {
            display: flex;
            align-items: center;
            overflow: auto;
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
            margin-right: 6px;
            max-width: 150px;
            flex-shrink: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
    `;

    window.addEventListener('load', () => {
      document.head.appendChild(style);
        const observer = new MutationObserver((mutations, obs) => {
            const elementsData = unsafeWindow.$nuxt?.$root?.$children[2]?.$children[0]?.$children[0]?._data?.elements;
            if (elementsData && elementsData.length > 0) {
                obs.disconnect();
                init();
            }
        });
        observer.observe(document, {childList: true, subtree: true});
    });

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
            tabBar.style.left = `${229}px`;
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
        const tab = tabData[index];

        if (index >= tabData.length) index = 0;

        // Clear existing instances
        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].clearInstances();

        // Create a lookup map for elements
        const elementsMap = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.reduce((map, elem) => {
            map[elem.text] = elem;
            return map;
        }, {});

        // Spawn elements from the tab using the lookup map
        tab.elements.forEach(savedElem => {
            const elem = elementsMap[savedElem.name];
            if (elem) spawnElement(elem, savedElem.x, savedElem.y);
        });

        // Update current tab and save
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
            visualSelectTab(index);
        }
    }

    function visualSelectTab(index) {
        document.querySelectorAll('.tab').forEach(button => button.classList.remove('selected'));
        document.getElementById(`tab-${index}`).classList.add('selected');
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
        input.accept = 'application/json';
        input.onchange = event => {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = e => {
                const data = JSON.parse(e.target.result);
                addTab(-1, data); // Adding the uploaded tab at the end
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
        else if (menu === 1) {
            const uploadOption = document.createElement('div');
            uploadOption.classList.add('contextMenuOption');
            uploadOption.textContent = 'Upload Tab';
            uploadOption.onclick = uploadTab;
            contextMenu.appendChild(uploadOption);
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

    function getAllInstances() {
        return unsafeWindow.$nuxt._route.matched[0].instances.default._data.instances.filter(x => !x.hide);
    }

    function deleteAllInstances() {
        getAllInstances().forEach(instance => {
            const index = unsafeWindow.$nuxt._route.matched[0].instances.default._data.instances.indexOf(instance);
            unsafeWindow.$nuxt._route.matched[0].instances.default._data.instances.splice(index, 1);
        });
    }

     function spawnElement(element, x, y) {
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
            }, unsafeWindow)
        );
    }
})();