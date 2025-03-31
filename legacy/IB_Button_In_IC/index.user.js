// ==UserScript==
// @name        Add IB button in IC recipe modal
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.xmlHttpRequest
// @version     1.0.1
// @author      -
// @description 10/30/2024, 10:23:35 PM
// ==/UserScript==

(function () {
    let validUrls = [];

    function validUrl(exists, element) {
        if (exists) {
            if (!validUrls.includes(element.text)) {
                validUrls.push(element.text);
                GM.setValue("IB-valid", JSON.stringify(validUrls));
            }

            let IBWrapper = document.createElement("div");
            let IBButton = document.createElement("button");
            IBButton.textContent = "Infinite Browser";
            IBWrapper.style.display = "flex";
            IBWrapper.style.justifyContent = "flex-end";
            IBButton.addEventListener("click", () => {
                window.open(`https://infinibrowser.wiki/item/${encodeURIComponent(element.text)}`, "_blank");
            });

            IBWrapper.appendChild(IBButton);
            document.querySelectorAll(".modal")[0].querySelector(".crafts-container").appendChild(IBWrapper);
        }
    }
    function urlExists(url, element, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                callback(xhr.status < 400, element);
            }
        };
        xhr.open("HEAD", url);
        xhr.send();
    }

    window.addEventListener(
        "load",
        async () => {
            validUrls = (await GM.getValue("IB-valid")) ? JSON.parse(await GM.getValue("IB-valid")) : [];
            const selectElement = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].selectElement;

            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].selectElement = exportFunction((e, element) => {
                element = element.wrappedJSObject === undefined ? element : element.wrappedJSObject;

                let returnValue = selectElement(e, element);
                if (e.button === 2) {
                    if (validUrls.includes(element.text)) validUrl(true, element);
                    else urlExists(`https://infinibrowser.wiki/api/item?id=${encodeURIComponent(element.text)}`, element, validUrl);
                }

                return returnValue;
            }, unsafeWindow);
        },
        false
    );
})();
