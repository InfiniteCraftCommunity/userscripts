// ==UserScript==
// @name            Regex Search
// @namespace       Violentmonkey Scripts
// @match           https://neal.fun/infinite-craft/*
// @grant           unsafeWindow
// @version         1.1.1
// @author          Alexander_Andercou, Mikarific
// @description     6/21/2024, 5:35:29 PM
// ==/UserScript==


(function () {
    let complexFilter = null;
    let beforeFilter = null;
    let useRegex = false;

    let isRegex = (str) => useRegex;

    window.addEventListener("helper-load", async () => {
        let parent = document.querySelector(".sidebar-header");

        let label = document.createElement("label");
        label.textContent = "Use only regex for search";
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.addEventListener("change", () => {
            useRegex = checkbox.checked;
            let sq = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].searchQuery;
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].searchQuery += "a";
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].searchQuery = sq;
            console.log("use regex");
        });
        checkbox.style.width = "15px";
        checkbox.style.height = "15px";
        checkbox.style.borderColor = "var(--border-color)";
        checkbox.style.opacity = "1";
        checkbox.style.margin = "3px";
        let newDiv = document.createElement("div");

        if (!document.querySelector(".sidebar-search-filters")) {
            newDiv.appendChild(document.querySelector(".sidebar-search"));
            newDiv.classList.add("sidebar-search-filters");
            parent.insertBefore(newDiv, parent.firstChild);
        } else newDiv = document.querySelector(".sidebar-search-filters");

        newDiv.appendChild(document.createElement("br"));
        newDiv.appendChild(label);
        newDiv.appendChild(checkbox);

        if (complexFilter == null) {
            complexFilter = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._computedWatchers.searchResults.getter;
        }

        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._computedWatchers.searchResults.getter = exportFunction(() => {
            let returnedByComplexFilter = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements;

            let query = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].searchQuery;

            let dummy = [...returnedByComplexFilter];
            if (useRegex) {
                var re = new RegExp(query);

                dummy = dummy.filter((e) => e.text.match(re));

                return cloneInto(dummy, unsafeWindow);
            } else return cloneInto(complexFilter.call(unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]), unsafeWindow);
        }, unsafeWindow);
    }, false);
})();
