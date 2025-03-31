// ==UserScript==
// @name            Emoji Search
// @namespace       Violentmonkey Scripts
// @match           https://neal.fun/infinite-craft/*
// @grant           none
// @version         1.1.1
// @author          Alexander_Andercou, Mikarific
// @description     Search using emojis
// @downloadURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Emoji_Search/index.user.js
// @updateURL       https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Emoji_Search/index.user.js
// ==/UserScript==


(function () {
    let complexFilter = null;
    let beforeFilter = null;
    let useEmoji = false;

    window.addEventListener("load", async () => {
        let parent = document.querySelector(".sidebar-header");

        let newDiv = document.createElement("div");

        let label = document.createElement("label");
        label.textContent = "Use only emoji for search";
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.addEventListener("change", () => {
            useEmoji = checkbox.checked;
            let sq = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].searchQuery;
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].searchQuery += " ";
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].searchQuery = sq;
        });
        checkbox.style.width = "15px";
        checkbox.style.height = "15px";
        checkbox.style.borderColor = "var(--border-color)";
        checkbox.style.opacity = "1";
        checkbox.style.margin = "3px";

        if (document.querySelector(".sidebar-search-filters") == null) {
            console.log("first");
            newDiv.appendChild(document.querySelector(".sidebar-search"));
            newDiv.classList.add("sidebar-search-filters");
            parent.insertBefore(newDiv, parent.firstChild);
        } else newDiv = document.querySelector(".sidebar-search-filters");

        newDiv.appendChild(document.createElement("br"));
        newDiv.appendChild(label);
        newDiv.appendChild(checkbox);

        if (complexFilter == null) complexFilter = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._computedWatchers.searchResults.getter;

        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._computedWatchers.searchResults.getter = exportFunction(() => {
            let returnedByComplexFilter = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements;

            let query = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].searchQuery;

            let dummy = [...returnedByComplexFilter];

            if (useEmoji) {
                dummy = dummy.filter((e) => {
                    if (!e.emoji) e.emoji = "⬜";

                    return e.emoji.codePointAt(0) == query.codePointAt(0);
                });

                return cloneInto(dummy, unsafeWindow);
            } else return cloneInto(complexFilter.call(unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]), unsafeWindow);
        }, unsafeWindow);
    }, false);
})();
