// ==UserScript==
//
// @name                Adjust InfiniBrowser Lineages
// @namespace           zptr.cc
//
// @match               https://neal.fun/infinite-craft/*
// @match               https://infinibrowser.zptr.cc/*
// @match               https://infinibrowser.wiki/*
// @match               https://infini.wiki/*
//
// @grant               unsafeWindow
// @grant               GM.getValue
// @grant               GM.setValue
//
// @run-at              document-end
//
// @version             0.4.1
// @author              zeroptr
//
// @downloadURL         https://raw.githubusercontent.com/InfiniteCraftCommunity/userscripts/master/userscripts/AdjustInfiniBrowserLineages/index.user.js
//
// @description         Adjust lineages on InfiniBrowser, removing steps for elements that you already have on Infinite Craft. Also removes the "The recipe for this element is too big".
//
// ==/UserScript==


window.addEventListener("load", () => {
    // console.log('Running...');
    if (window.location.host == "neal.fun") {
        $initInfiniteCraft();
    } else if (window.location.pathname.startsWith("/item")) {
        $initIBItemView();
    } else if (window.location.pathname == "/" || window.location.pathname.startsWith("/search")) {
        $initIBSearch();
    }
});


/** Adjust a lineage on InfiniBrowser */
async function adjustLineage(stepSelector, fixStepNumbers) {
    document.querySelectorAll(".youalreadyhavethiselement").forEach((x) => x.remove());

    const steps = document.querySelectorAll(stepSelector);
    if (!steps.length) return;

    const elements = new Set((await GM.getValue("elements", "")).split("\x01"));
    const element = document.getElementById("item_id").textContent;

    if (elements.has(element.toLowerCase())) {
        const span = document.createElement("span");
        span.textContent = "You already have this element";
        span.classList.add("youalreadyhavethiselement");

        document.querySelector(".recipes").before(span);
        return;
    }

    const unusedSteps = new Map();
    let removedSteps = 0;

    // remove steps for elements that the player already has
    steps.forEach((x) => {
        const items = x.querySelectorAll(".item");
        const result = items[2].childNodes[1].textContent;

        if (elements.has(result.toLowerCase())) {
            // hide the step instead of removing it
            // so that the 'copy lineage' button work properly
            x.style.display = "none";
            removedSteps++;
        } else {
            unusedSteps.set(result, x);
            unusedSteps.delete(items[0].childNodes[1].textContent);
            unusedSteps.delete(items[1].childNodes[1].textContent);
        }
    });

    // remove unused steps
    unusedSteps.delete(element);
    unusedSteps.forEach((step) => {
        step.style.display = "none";
        removedSteps++;
    });

    if (fixStepNumbers) {
        // fix step numbers
        let n = 0;
        document.querySelectorAll(stepSelector).forEach((x) => {
            if (x.style.display != "none") {
                x.querySelector("span").textContent = `${++n}.`;
            }
        });
    }

    let prevLength = 0;
    for (let i = 0; i < 10; i++) {
        const leftSteps = [...steps].filter((step) => (step.style.display !== 'none'));
        // console.log(leftSteps);
        finalAdjustment(leftSteps);

        // Check if the length of leftSteps changed
        if (leftSteps.length === prevLength) {
            // console.log(leftSteps.length, prevLength);
            break;
        }

        prevLength = leftSteps.length;
    }
}


function finalAdjustment(leftSteps) {
    const usedElements = [
        ...leftSteps.map((step) => (step.children[step.children.length - 3].childNodes[1].textContent)),
        ...leftSteps.map((step) => (step.children[step.children.length - 2].childNodes[1].textContent)),
    ]

    leftSteps.slice(0, leftSteps.length - 1).forEach((step) => {
        const result = step.children[step.children.length - 1].childNodes[1].textContent;
        if (!usedElements.includes(result)) {
            step.style.display = 'none';
        }
    });
}


/** Initialize on InfiniBrowser at /item */
function $initIBItemView() {
    const recipeTree = document.getElementById("recipe_tree");
    if (document.getElementById("lineage_loader")) {
        const observer = new MutationObserver((e) => {
            if (e[0].removedNodes) {
                setTimeout(() => adjustLineage("#recipe_tree li", true));
                observer.disconnect();
            }
        });

        observer.observe(recipeTree, { childList: true });
    } else {
        // console.log('Adjusting...')
        adjustLineage("#recipe_tree li", true);
    }
}

/** Initialize on InfiniBrowser at /search */
function $initIBSearch() {
    if (!document.getElementById("recipes")) return;

    new MutationObserver(() => {
        adjustLineage("#recipes li", false);
    }).observe(
        document.getElementById("recipes"),
        { childList: true }
    );

    const $originalFetch = unsafeWindow.fetch;
    unsafeWindow.fetch = (url, ...args) => {
        if (typeof url == "string" && url.startsWith("/api/recipe")) {
            return $originalFetch.apply(unsafeWindow, [
                url.replace(/&max_steps=\d+$/, ""),
                ...args
            ]);
        } else {
            return $originalFetch.apply(unsafeWindow, arguments);
        }
    }
}

/** Initialize on Infinite Craft */
function $initInfiniteCraft() {
    const setItem = unsafeWindow.Storage.prototype.setItem;
    unsafeWindow.Storage.prototype.setItem = function (key, value) {
        if (key == "infinite-craft-data") {
            GM.setValue(
                "elements",
                JSON.parse(value).elements
                    .map((x) => x.text.toLowerCase())
                    .join("\x01")
            );
        }

        setItem.apply(this, arguments);
    }

    unsafeWindow.localStorage.setItem(
        "infinite-craft-data",
        unsafeWindow.localStorage.getItem("infinite-craft-data")
    );
}
