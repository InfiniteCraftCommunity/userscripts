// ==UserScript==
// @name         Infinite Craft Location Files
// @namespace    stargazingponies.com
// @version      1.0.1
// @description  Saves and loads element location to files. Requires Infinite Craft Helper.
// @author       StarGazingHomies
// @match        https://neal.fun/infinite-craft/
// @grant		 unsafeWindow
// @run-at		 document-end
// @noframes
// @sandbox		 raw
// ==/UserScript==

(function() {
    'use strict';

    const no_upload_file_button = `
    #import-location-save {
        display: none;
    }
    `;

    // Large portions of this code copied shamelessly from Infinite Craft Helper by Mikarific
    // https://github.com/Mikarific/InfiniteCraftHelper
    const uploadIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NzMuNjgzODcgNjAwIj48cGF0aCBkPSJNMjEzLjE1ODQ1LDM2MS41NzY3NXYxMTYuMzU4NDVjMCw2LjcyMDAxLDIuMjY3MTIsMTIuMzQ3NCw2LjgwMTMzLDE2Ljg4MjE1LDQuNTM0MjMsNC41MzQyMywxMC4xNjE1OCw2LjgwMTM0LDE2Ljg4MjE1LDYuODAxMzRzMTIuMzQ3OTItMi4yNjcxLDE2Ljg4MjE1LTYuODAxMzRjNC41MzQyMS00LjUzNDc1LDYuODAxMzMtMTAuMTYyMTQsNi44MDEzMy0xNi44ODIxNXYtMTE2LjM1ODQ1bDQxLjc4MzAyLDQxLjc4Mjk5YzIuMzQ3OSwyLjM0NzksNC45ODk0OSw0LjEwODk3LDcuOTI0NzgsNS4yODMxNiwyLjkzNTI4LDEuMTc0MjIsNS44NzAyOCwxLjY4MDI2LDguODA1MDMsMS41MTgxNywyLjkzNTI4LS4xNjIxMiw1Ljg0MDMxLS44MzAwMiw4LjcxNTAyLTIuMDAzNjgsMi44NzQyMy0xLjE3NDE5LDUuNDg1MjgtMi45MzU1Myw3LjgzMzE4LTUuMjgzOTYsNC41NzUyOS00Ljg5ODQ1LDYuOTQzNzEtMTAuNDQ0NzUsNy4xMDUyOC0xNi42Mzg5OCwuMTYyMS02LjE5NDIzLTIuMjA2MzMtMTEuNzQwNTYtNy4xMDUyOC0xNi42Mzg5OGwtNzguNzY1MTktNzguNzY1MjFjLTIuOTU1MjgtMi45NTU3OS02LjA3MjY0LTUuMDQwODEtOS4zNTIxNC02LjI1NTAyLTMuMjc4OTctMS4yMTQ3NC02LjgyMTM1LTEuODIyMTUtMTAuNjI3MTMtMS44MjIxMi0zLjgwNTc4LS4wMDAwMi03LjM0ODE5LC42MDczOC0xMC42MjcxMywxLjgyMjEyLTMuMjc5NDUsMS4yMTQyMS02LjM5Njg1LDMuMjk5MjMtOS4zNTIxNCw2LjI1NTAybC03OC43NjUxOSw3OC43NjUxOWMtNC42OTYzMSw0LjY5NTc4LTcuMDE0MjMsMTAuMTkxNi02Ljk1MzcxLDE2LjQ4NzQxLC4wNjA1Miw2LjI5NTI4LDIuNTQwMjgsMTEuODkyMTMsNy40MzkyMywxNi43OTA1Nyw0Ljg5ODQ1LDQuNTc1MjYsMTAuNDQ0NzUsNi45NDM2OSwxNi42Mzg5OCw3LjEwNTI4LDYuMTk0MjMsLjE2MjEyLDExLjc0MDgzLTIuMjA2MzEsMTYuNjM5NzgtNy4xMDUyOGw0MS4yOTY2NS00MS4yOTY2OFpNNTcuMDg1NDEsNTk5Ljk5OTk5Yy0xNS45NTE2MSwwLTI5LjQ1Mzc1LTUuNTI2MzMtNDAuNTA2NDItMTYuNTc4OTlDNS41MjYzNCw1NzIuMzY4MzQsLjAwMDAxLDU1OC44NjYyLDAsNTQyLjkxNDU5VjU3LjA4NTRjLjAwMDAxLTE1Ljk1MTU2LDUuNTI2MzQtMjkuNDUzNzUsMTYuNTc4OTktNDAuNTA2NDFDMjcuNjMxNjYsNS41MjYzMyw0MS4xMzM4LDAsNTcuMDg1NDEsMGgyMjcuMTg2NjRjNy42MTEwOSwwLDE0LjkyODcyLDEuNDc3OTEsMjEuOTUyOTYsNC40MzM3Miw3LjAyNDIzLDIuOTU1MjgsMTMuMTI3NjgsNy4wMjM5NCwxOC4zMTAzMSwxMi4yMDYwOGwxMzIuNTA4NzYsMTMyLjUwODc2YzUuMTgyMTQsNS4xODI2Miw5LjI1MDgsMTEuMjg2MDcsMTIuMjA2MDgsMTguMzEwMzEsMi45NTU4MSw3LjAyNDIzLDQuNDMzNzIsMTQuMzQxODcsNC40MzM3MiwyMS45NTI5NnYzNTMuNTAyNzdjMCwxNS45NTE2Mi01LjUyNjMzLDI5LjQ1Mzc2LTE2LjU3ODk5LDQwLjUwNjQyLTExLjA1MjY2LDExLjA1MjY1LTI0LjU1NDg0LDE2LjU3ODk4LTQwLjUwNjQxLDE2LjU3ODk5SDU3LjA4NTQxWk0yODQuMjExMjQsMTYwLjkyOTkzVjQ3LjM2Nzc3SDU3LjA4NTQxYy0yLjQyOTQ4LDAtNC42NTY1OCwxLjAxMjA5LTYuNjgxMzMsMy4wMzYzMy0yLjAyNDIsMi4wMjQ3Mi0zLjAzNjMyLDQuMjUxODYtMy4wMzYzMiw2LjY4MTM0djQ4NS44MjkxN2MwLDIuNDI5NDgsMS4wMTIxMiw0LjY1NjU5LDMuMDM2MzIsNi42ODEzMywyLjAyNDc1LDIuMDI0MjEsNC4yNTE4NSwzLjAzNjMyLDYuNjgxMzMsMy4wMzYzMkg0MTYuNTk4NDNjMi40Mjk0OCwwLDQuNjU2NjMtMS4wMTIxMSw2LjY4MTM0LTMuMDM2MzIsMi4wMjQyNC0yLjAyNDc0LDMuMDM2MzMtNC4yNTE4NSwzLjAzNjMzLTYuNjgxMzNWMTg5LjQ3MjYzaC0xMTMuNTYyMTFjLTguMTM3MzcsMC0xNC45Mjg3Mi0yLjcyMjg4LTIwLjM3NDAxLTguMTY4NjktNS40NDU4MS01LjQ0NTI4LTguMTY4NjktMTIuMjM2NjMtOC4xNjg3NC0yMC4zNzQwMVpNNDcuMzY3NzUsNDcuMzY3Nzd2MFoiLz48L3N2Zz4=';
    const downloadIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1OTkuOTk5OTIgNjAwIj48cGF0aCBkPSJNMjk5Ljk5OTk4LDQzNi40NjE0NWMtNC44MjA2NiwuMDAwMDMtOS4zMDc2OC0uNzY5MzUtMTMuNDYxMDQtMi4zMDgwMi00LjE1NDAxLTEuNTM4LTguMTAyNjYtNC4xNzkwMy0xMS44NDYwNS03LjkyMzAzbC0xMjQuMzg0NDEtMTI0LjM4MzRjLTUuOTQ4NjktNS45NDg2OS04Ljg4NDM3LTEyLjkxMDA1LTguODA3MDQtMjAuODg0MDcsLjA3NjY2LTcuOTc0MDMsMy4wMTIzNC0xNS4wNjM2OCw4LjgwNzA0LTIxLjI2OTA4LDYuMjA1MzQtNi4yMDQ2NywxMy4zMzMzOS05LjQwOTcsMjEuMzg0MDctOS42MTUwMiw4LjA1MTMzLS4yMDUzMiwxNS4xNzk3MSwyLjc5NDY5LDIxLjM4NTA4LDkuMDAwMDNsNzYuOTIzMjYsNzYuOTIzMjZWMzAuMDAwMWMwLTguNTEyNzIsMi44NzE2OC0xNS42NDA2OCw4LjYxNTAyLTIxLjM4NDA0LDUuNzQzMzctNS43NDQwNCwxMi44NzEzNS04LjYxNjA2LDIxLjM4NDA3LTguNjE2MDZzMTUuNjQwNzEsMi44NzIwMiwyMS4zODQwNyw4LjYxNjA2YzUuNzQzMzQsNS43NDMzNyw4LjYxNTAyLDEyLjg3MTMyLDguNjE1MDIsMjEuMzg0MDRWMzM2LjAwMjExbDc2LjkyMzI2LTc2LjkyMzI2YzUuOTQ4NjktNS45NDg2OSwxMy4wMTI2OC04Ljg4NDY3LDIxLjE5MjA5LTguODA4MDEsOC4xNzkzNSwuMDc3MzMsMTUuMzcxNjksMy4yMTgzMywyMS41NzcxLDkuNDIzLDUuNzk0Nyw2LjIwNTQsOC43OTQ0LDEzLjIzMTAzLDguOTk5MDUsMjEuMDc3MDYsLjIwNTMyLDcuODQ2MDMtMi43OTQzOCwxNC44NzEzOS04Ljk5OTA1LDIxLjA3NjA2bC0xMjQuMzg0NDQsMTI0LjM4MzQ2Yy0zLjc0MzMzLDMuNzQ0LTcuNjkyMDQsNi4zODUtMTEuODQ2MDUsNy45MjMwMy00LjE1MzM2LDEuNTM4NjctOC42NDAzOCwyLjMwODAyLTEzLjQ2MTA0LDIuMzA3OTlabS0yMjcuNjkxNzQsMTYzLjUzODUzYy0yMC4yMDUzOS0uMDAwMDItMzcuMzA4MTEtNy4wMDAwNC01MS4zMDgxNy0yMS4wMDAwN0M3LjAwMDA0LDU2NC45OTk4NSwuMDAwMDIsNTQ3Ljg5NzE0LDAsNTI3LjY5MTc1di03OC40NjEyN2MuMDAwMDItOC41MTI2OSwyLjg3Mi0xNS42NDA3MSw4LjYxNjAzLTIxLjM4NDA3LDUuNzQzMzctNS43NDMzNCwxMi44NzEzOC04LjYxNTAyLDIxLjM4NDA3LTguNjE1MDJzMTUuNjQwNzIsMi44NzE2OCwyMS4zODQwNyw4LjYxNTAyYzUuNzQzMzUsNS43NDMzNyw4LjYxNTAyLDEyLjg3MTM4LDguNjE1MDIsMjEuMzg0MXY3OC40NjEyNmMwLDMuMDc3MzYsMS4yODIsNS44OTgzNSwzLjg0NjAxLDguNDYzMDMsMi41NjQ2OCwyLjU2NCw1LjM4NTY3LDMuODQ2MDEsOC40NjMwMywzLjg0NjAxaDQ1NS4zODM0OGMzLjA3NzM0LDAsNS44OTg0LTEuMjgyLDguNDYzMDQtMy44NDYwMSwyLjU2NDAzLTIuNTY0NjgsMy44NDYwMi01LjM4NTY3LDMuODQ2MDItOC40NjMwM3YtNzguNDYxMjZjMC04LjUxMjcyLDIuODcxNjUtMTUuNjQwNzEsOC42MTUwMi0yMS4zODQwNyw1Ljc0MzM3LTUuNzQzMzQsMTIuODcxMzgtOC42MTQ5OSwyMS4zODQwNC04LjYxNTAyLDguNTEyNzIsLjAwMDAzLDE1LjY0MDc0LDIuODcxNjgsMjEuMzg0MDQsOC42MTUwMiw1Ljc0NDA0LDUuNzQzMzcsOC42MTYwNiwxMi44NzEzNSw4LjYxNjA2LDIxLjM4NDA3djc4LjQ2MTI2YzAsMjAuMjA1NC03LjAwMDAyLDM3LjMwODEyLTIxLjAwMDA3LDUxLjMwODE3LTE0LjAwMDA1LDE0LjAwMDA1LTMxLjEwMjc2LDIxLjAwMDA3LTUxLjMwODE1LDIxLjAwMDA3bC00NTUuMzgzNDctLjAwMDAyWiIvPjwvc3ZnPg==';


    function init() {
        // Get helper's settings container
	    const settingsContent = document.querySelector(".settings-content");
        if (settingsContent == null) {
            console.log("This location script requires Infinite Craft Helper to function!");
            return
        }

        // Basically copied from Helper's Import Save File function
	    const locationUploadContainer = document.createElement('label');
	    locationUploadContainer.setAttribute('for', 'import-location-save');
	    locationUploadContainer.classList.add('setting');

	    const locationUploadInput = document.createElement('input');
	    locationUploadInput.type = 'file';
	    locationUploadInput.id = 'import-location-save';
        locationUploadContainer.appendChild(locationUploadInput);

	    const locationUploadText = document.createTextNode('Import Location File');
	    locationUploadContainer.appendChild(locationUploadText);

        // Image
	    const locationUploadImage = document.createElement('img');
	    locationUploadImage.src = uploadIcon.trim();
	    locationUploadContainer.appendChild(locationUploadImage);

        settingsContent.appendChild(locationUploadContainer);

	    //const locationUploadImage = document.createElement('img');
        locationUploadInput.addEventListener('change', async () => {
	        const file = locationUploadInput.files !== null ? locationUploadInput.files[0] : null;
	        if (file === null || file.type !== 'application/json') return;
	        const fileContents = JSON.parse(await file.text());
	        if (!Object.keys(fileContents).includes('locations')) return;
            spawnElements(fileContents.locations);
        })

	    const locationDownloadContainer = document.createElement('div');
	    locationDownloadContainer.classList.add('setting');
	    const locationDownloadText = document.createTextNode('Export Location File');
	    locationDownloadContainer.appendChild(locationDownloadText);

	    const locationDownloadImage = document.createElement('img');
	    locationDownloadImage.src = downloadIcon.trim();
	    locationDownloadContainer.appendChild(locationDownloadImage);
	    settingsContent.appendChild(locationDownloadContainer);

	    locationDownloadContainer.addEventListener('click', (e) => {
	        const locationData = {};
            locationData.locations = getElements();
            console.log(locationData.locations);

	        const downloadLink = document.createElement('a');
	        downloadLink.download = 'infinitecraft_locations.json';
	        downloadLink.href = URL.createObjectURL(new Blob([JSON.stringify(locationData, null, '\t')], {
	            type: 'application/json',
	        }));
	        downloadLink.dataset.downloadurl = ['application/json', downloadLink.download, downloadLink.href].join(':');
	        downloadLink.style.display = 'none';
	        document.body.appendChild(downloadLink);
	        downloadLink.click();
	        document.body.removeChild(downloadLink);
	        setTimeout(function () {
	            URL.revokeObjectURL(downloadLink.href);
	        }, 1500);
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
        // unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.selectedInstance
        const instance = cloneInto(data, unsafeWindow);
        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instances.push(instance);
        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].$nextTick(
            exportFunction(() => {
                unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstancePosition(
                    instance,
                    x,
                    y);
                unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstanceZIndex(instance, data.id);
                unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].calcInstanceSize(instance);
            }, unsafeWindow)
        );
    }

    // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
    function ciEquals(a, b) {
    return typeof a === 'string' && typeof b === 'string'
        ? a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0
        : a === b;
    }

    function spawnElements(locations) {
        var element_dict = {};
        for (const e of unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements) {
            element_dict[e.text.toLowerCase()] = e;
        }
        for (const location of locations) {
            if (location[0].toLowerCase() in element_dict) {
                const e = element_dict[location[0].toLowerCase()];
                spawnElement(e, location[1], location[2]);
            }
        }
    }

    function getElements() {
        return unsafeWindow.$nuxt._route.matched[0].instances.default._data.instances.filter((x) => !x.hide).map((x) => [x.text, x.left, x.top])
    }

    window.addEventListener("load", () => {
        // Add to styles to get rid of the ugly upload image button
        const styles = document.createElement('style');
        styles.appendChild(document.createTextNode(no_upload_file_button.trim()));
        document.getElementsByTagName('head')[0].appendChild(styles);

        init();
    })
})();