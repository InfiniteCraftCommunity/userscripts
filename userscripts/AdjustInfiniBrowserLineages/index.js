// ==UserScript==
// @name        Adjust InfiniBrowser Lineages
// @namespace   zptr.cc
// @match       https://neal.fun/infinite-craft/*
// @match       https://infinibrowser.zptr.cc/*
// @match       https://infinibrowser.wiki/*
// @match       https://infini.wiki/*
// @grant       unsafeWindow
// @grant       GM.getValue
// @grant       GM.setValue
// @run-at      document-end
// @version     0.1
// @author      zeroptr
// @description Adjust lineages on InfiniBrowser, removing steps for elements that you already have on Infinite Craft
// ==/UserScript==

window.addEventListener("load", () => {
  if (window.location.host == "neal.fun") {
    $initInfiniteCraft();
  } else if (window.location.pathname.startsWith("/item/")) {
    $initIBItemView();
  } else if (window.location.pathname.startsWith("/search")) {
    $initIBSearch();
  }
});

/** Adjust a lineage on InfiniBrowser */
async function adjustLineage(stepSelector, fixStepNumbers) {
  const elements = new Set((await GM.getValue("elements", "")).split("\x01"));
  const element = document.getElementById("item_id").textContent;

  if (elements.has(element.toLowerCase())) {
    document.querySelector(stepSelector).before("You already have this element");
    return;
  }

  console.log("Patching lineage for", element);

  const unusedSteps = new Map();
  let removedSteps = 0;

  // remove steps for elements that the player already has
  document.querySelectorAll(stepSelector).forEach((x) => {
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

  console.log("Removed", removedSteps, "steps");
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
    adjustLineage("#recipe_tree li", true);
  }
}

/** Initialize on InfiniBrowser at /search */
function $initIBSearch() {
  new MutationObserver((e) => {
    if (
      e.length && e[0].addedNodes.length
      && e[0].addedNodes[0].tagName == "LI"
    ) {
      adjustLineage("#recipes li", false);
    }
  }).observe(
    document.getElementById("recipes"),
    { childList: true }
  );
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
}
