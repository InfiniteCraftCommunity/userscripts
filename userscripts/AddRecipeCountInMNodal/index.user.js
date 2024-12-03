// ==UserScript==
// @name        Add recipe count to recipe modal
// @namespace   Add recipe count to recipe modal
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @author      Alexander_Andercou
// @description 6/22/2024, 5:43:28 PM
// ==/UserScript==

(function() {
    window.addEventListener('load', async () => {
        const target = document.querySelector(".modal");
        const dom_observer = new MutationObserver(function(mutation) {
            //console.log('recipe count function called');
            const recipeDivs = target.querySelectorAll(".recipe");
            //console.log(target, recipeDivs);
            const header = target.querySelector(".modal-header");
            header.style.color = "var(--text-color)";
            const recipeCounter = header.querySelector(".recipe-counter");
            //console.log(recipeCounter);
            const recipeText = (() => {
                switch (recipeDivs.length) {
                case 0:
                    return '';
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
            };
        });
        dom_observer.observe(target, { attributes: true, childList: true, characterData: true, attributeFilter: ['open'] });
        //console.log("modal:", target);
    }, false);
})();
