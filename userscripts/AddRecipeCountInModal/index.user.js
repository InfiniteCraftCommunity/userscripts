// ==UserScript==
// @name            Add recipe count to recipe modal
// @namespace       Add recipe count to recipe modal
// @match           https://neal.fun/infinite-craft/*
// @grant           none
// @version         1.1
// @author          Alexander_Andercou
// @description     Add recipe count to recipe modal
// @downloadURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/AddRecipeCountInModal/index.user.js
// @updateURL       https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/AddRecipeCountInModal/index.user.js
// ==/UserScript==


(function () {
    window.addEventListener("helper-load", async () => {
        const target = document.querySelector(".modal");
        const dom_observer = new MutationObserver(function (mutation) {
            const recipeDivs = target.querySelectorAll(".recipe");
            const header = target.querySelector(".modal-header");
            header.style.color = "var(--text-color)";
            const recipeCounter = header.querySelector(".recipe-counter");
            const recipeText = (() => {
                switch (recipeDivs.length) {
                    case 0:
                        return "";
                    case 1:
                        return `${recipeDivs.length} Recipe`;
                    default:
                        return `${recipeDivs.length} Recipes`;
                }
            })();
            if (recipeCounter == null) {
                const textNode = document.createElement("span");
                textNode.classList.add("recipe-counter");
                textNode.textContent = recipeText;
                header.insertBefore(textNode, header.querySelector(".modal-title").nextSibling);
            } else {
                recipeCounter.textContent = recipeText;
            }
        });
        dom_observer.observe(target, { attributes: true, childList: true, characterData: true, attributeFilter: ["open"] });
    }, false);
})();
