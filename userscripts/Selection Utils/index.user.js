// ==UserScript==
// @name        Infinite Craft Selection Utils
// @namespace   Catstone
// @match       https://neal.fun/infinite-craft/
// @grant			  GM_getValue
// @grant			  GM_setValue
// @version     1.2
// @author      Catstone
// @license     MIT
// @description Adds multiselect utilities for deleting, duplicating and moving!
// @downloadURL	https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Selection%20Utils/index.js
// @updateURL	  https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Selection%20Utils/index.js
// ==/UserScript==

(function() {
    'use strict';

    let startX, startY, endX, endY, isSelecting = false, isDragging = false;
    let mouseX, mouseY, mouseButton;
    let selectionBox = document.createElement('div');
    let colorPicker = document.createElement('input');
    let colorIndex = GM_getValue('colorIndex') || 0;
    let dragStartX, dragStartY;

    const customColor = GM_getValue('customColor') || '#000000';
    // Array of colors for selection box and selected Instances
    const colors = [
        { border: '1px solid #e74c3c', background: 'rgba(231, 76, 60, 0.3)', emoji: '🔴' },
        { border: '1px solid #e67e22', background: 'rgba(230, 126, 34, 0.3)', emoji: '🟠' },
        { border: '1px solid #f1c40f', background: 'rgba(241, 196, 15, 0.3)', emoji: '🟡' },
        { border: '1px solid #27ae60', background: 'rgba(39, 174, 96, 0.3)', emoji: '🟢' },
        { border: '1px solid #3498db', background: 'rgba(52, 152, 219, 0.3)', emoji: '🔵' },
        { border: '1px solid #9b59b6', background: 'rgba(155, 89, 182, 0.3)', emoji: '🟣' },
        { border: '1px solid #000000', background: 'rgba(0, 0, 0, 0.3)', emoji: '⚫' },
        { border: '1px solid #ecf0f1', background: 'rgba(236, 240, 241, 0.3)', emoji: '⚪' },
        { border: '1px solid #795548', background: 'rgba(121, 85, 72, 0.3)', emoji: '🟤' },
        { border: '1px solid ' + customColor, background: hexToRGBA(customColor, 0.3), emoji: '🌈' } // Custom Color
    ];


    // Call the function to add the button when the DOM is fully loaded
    window.addEventListener('load', init);


    function init() {
        // Add the Cycle Color button to the settings menu
        const settingsContent = document.querySelector(".settings-content");
        if (settingsContent == null) {
            console.log("This script requires Infinite Craft Helper to function!");
            return;
        }

        const sidebarDiv = document.querySelector('.sidebar');

        const cycleSelectionContainer = document.createElement('div');
        cycleSelectionContainer.classList.add('setting');
        const cycleSelectionText = document.createTextNode('Selection Color ');
        const cycleSelectionEmoji = document.createElement('span');
        cycleSelectionEmoji.textContent = colors[colorIndex].emoji;
        cycleSelectionContainer.appendChild(cycleSelectionText);
        cycleSelectionContainer.appendChild(cycleSelectionEmoji);
        settingsContent.appendChild(cycleSelectionContainer);

        cycleSelectionContainer.addEventListener('mousedown', function(e) {
            if (e.button === 0) cycleColor(1); // Left click
            else if (e.button === 2) cycleColor(-1); // Right Click
            else if (e.button === 1) { // Middle Click
                colorPicker.style.left = `${mouseX}px`;
                colorPicker.style.top = `${mouseY}px`;
                colorPicker.click();
            }
            cycleSelectionEmoji.textContent = colors[colorIndex].emoji;
        });

        // Create the Selection Box
        selectionBox.style.position = 'absolute';
        selectionBox.style.display = 'none';
        selectionBox.style.zIndex = '0';
        cycleColor(0);
        document.body.appendChild(selectionBox);

        // Create the Color Picker
        colorPicker.type = 'color';
        colorPicker.style.position = 'absolute';
        colorPicker.style.display = 'none';
        colorPicker.style.zIndex = '1000';
        colorPicker.value = customColor; // Set the initial color
        document.body.appendChild(colorPicker);

        colorPicker.addEventListener('input', () => {
            const color = colorPicker.value;
            GM_setValue('customColor', color);
            colors[colors.length - 1] = {
                border: `1px solid ${color}`,
                background: `${hexToRGBA(color, 0.3)}`,
                emoji: colors[colors.length - 1].emoji
            };
            cycleColor(0); // Update to custom color
        });


        // Patching duplicateInstance
        const originalDuplicateInstance = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].duplicateInstance;
        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].duplicateInstance = function duplicateSelection(originalInstance, leftOffset = 10, topOffset = -10) {
            const duplicatedInstance = originalDuplicateInstance.call(this, originalInstance, leftOffset, topOffset);
            if (originalInstance.utilsSelected) {
                getSelectedInstances().forEach(instance => {
                    if (instance != originalInstance && instance != duplicatedInstance) {
                        deselectInstance(instance);
                        const instanceCopy = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].duplicateInstance(instance, 0, 0);
                        selectInstance(instanceCopy);
                        isDragging = true;
                        dragStartX = mouseX, dragStartY = mouseY;
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
            if (mouseButton === 2) {
                if (instance.utilsSelected) {
                    deleteAllSelected();
                }
            }
            else if ((mouseButton === 0 || mouseButton === 1) && instance.utilsSelected) {
                isDragging = true;
                dragStartX = mouseX, dragStartY = mouseY;
            }
            return og;
        }
        console.log("Successfully patched .duplicateInstance and .selectInstance");
    }

    document.addEventListener('mousedown', function(e) {
        mouseButton = e.button;
        if (mouseButton === 2) { // Right mouse button
            if (mouseX < window.innerWidth - unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].sidebarSize) {
                startX = e.clientX;
                startY = e.clientY;
                isSelecting = true;

                // Initialize the selection box
                selectionBox.style.left = `${startX}px`;
                selectionBox.style.top = `${startY}px`;
                selectionBox.style.width = '0px';
                selectionBox.style.height = '0px';
                selectionBox.style.display = 'block';
            }
        }
    }, true);

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (isSelecting) {
            // Update selection box position and size
            let width = Math.abs(mouseX - startX);
            const sidebarLimit = window.innerWidth - unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].sidebarSize - 1;
            if (mouseX > sidebarLimit) width = sidebarLimit - startX;
            else if (mouseX < 0) width = startX;

            let height = Math.abs(mouseY - startY);
            const bottomLimit = window.innerHeight;
            if (mouseY > bottomLimit) height = bottomLimit - startY;
            else if (mouseY < 0) height = startY;

            selectionBox.style.width = `${width}px`;
            selectionBox.style.height = `${height}px`;
            if (mouseX < startX) {
                if (mouseX < 0) selectionBox.style.left = `${0}px`;
                else selectionBox.style.left = `${mouseX}px`;
            }
            else selectionBox.style.left = `${startX}px`;
            if (mouseY < startY) {
                if (mouseY < 0) selectionBox.style.top = `${0}px`;
                else selectionBox.style.top = `${mouseY}px`;
            }
            else selectionBox.style.top = `${startY}px`;

        } else if (isDragging) {
            const deltaX = mouseX - dragStartX;
            const deltaY = mouseY - dragStartY;
            dragStartX = mouseX, dragStartY = mouseY;


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
                const highestZIndex = Math.max(...onScreenInstances.map(instance => instance.zIndex));
                onScreenInstances.forEach((instance) => {
                    const {left, top, height, width} = instance;
                    if (isInstanceInSelectedArea(left, top, height, width) && !instance.utilsSelected) {
                        selectInstance(instance);
                        instance.elem.style.setProperty("z-index", highestZIndex + 1);
                    }
                });
            }
        }
        if (isDragging) {
            isDragging = false;
            if ((e.button === 1 || e.button === 0) // Left Click or Middle Click and beyond sidebar
                && mouseX > window.innerWidth - unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].sidebarSize) {
                deleteAllSelected();
            }
        }
    });

    function cycleColor(step) {
        colorIndex = (colorIndex + step + colors.length) % colors.length;
        GM_setValue('colorIndex', colorIndex);
        selectionBox.style.border = colors[colorIndex].border;
        selectionBox.style.backgroundColor = colors[colorIndex].background;
        if (colorIndex === colors.length - 1) {
            colorPicker.style.left = `${mouseX}px`;
            colorPicker.style.top = `${mouseY}px`;
            colorPicker.click();
        }
        getSelectedInstances().forEach(instance => {
            selectInstance(instance);
        });
    }

    function hexToRGBA(hex, alpha) {
        let r = 0, g = 0, b = 0;
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    function getAllInstances() {
        return unsafeWindow.$nuxt._route.matched[0].instances.default._data.instances.filter(x => !x.hide);
    }
    function getSelectedInstances() {
        return getAllInstances().filter(x => x.utilsSelected);
    }

    function isInstanceInSelectedArea(instanceLeft, instanceTop, instanceHeight, instanceWidth) {
        const selectionLeft = Math.min(startX, endX);
        const selectionRight = Math.max(startX, endX);
        const selectionTop = Math.min(startY, endY);
        const selectionBottom = Math.max(startY, endY);

        return !(instanceLeft + instanceWidth < selectionLeft || instanceLeft > selectionRight ||
                 instanceTop + instanceHeight < selectionTop || instanceTop > selectionBottom);
    }

    function selectInstance(instance, retryCount = 0) {
        setTimeout(() => {
            instance.utilsSelected = true;
            instance.elem.style.border = colors[colorIndex].border;
            instance.elem.style.background = colors[colorIndex].background;
        }, 0);
    }
    function deselectInstance(instance) {
        instance.utilsSelected = false;
        instance.elem.style.border = '';
        instance.elem.style.background = '';
    }

    function deleteInstance(instance) {
        const instances = unsafeWindow.$nuxt._route.matched[0].instances.default._data.instances;
        instances.splice(instances.indexOf(instance), 1); // Remove instance from instances array
    }

    function deselectAllInstances() {
        getSelectedInstances().forEach(instance => {
            deselectInstance(instance);
        });
    }
    function deleteAllSelected() {
        getSelectedInstances().forEach(instance => {
            deleteInstance(instance);
        });
    }
})();
