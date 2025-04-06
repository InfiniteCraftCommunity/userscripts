// ==UserScript==
// @name          Adjust InfiniBrowser Lineages
// @namespace     zptr.cc
// @match         https://neal.fun/infinite-craft/*
// @match         https://infinibrowser.wiki/*
// @grant         unsafeWindow
// @grant         GM.getValue
// @grant         GM.setValue
// @run-at        document-end
// @version       0.4.1
// @author        zeroptr
// @downloadURL   https://raw.githubusercontent.com/InfiniteCraftCommunity/userscripts/master/userscripts/AdjustInfiniBrowserLineages/index.user.js
// @description   Adjust lineages on InfiniBrowser, removing steps for elements that you already have in the game.
// ==/UserScript==

window.addEventListener("load", () => {
  if (window.location.host == "neal.fun") {
    $initInfiniteCraft();
  } else if (window.location.pathname.startsWith("/item")) {
    $initIBItemView();
  } else if (window.location.pathname == "/") {
    $initIBSearch();
  }
});

function setFooter(...content) {
  document.querySelectorAll(".aib_footer").forEach((x) => x.remove());
  if (!content.length) return;

  const list = document.querySelector(".recipes");
  const footer = document.createElement("div");

  footer.classList.add("aib_footer");
  footer.style.color = "#aaa";
  footer.append(...content);

  list.parentElement.insertBefore(footer, list);
}

/** Adjust a lineage on InfiniBrowser */
async function adjustLineage(stepSelector) {
  setFooter();

  const stepList = document.querySelectorAll(stepSelector);
  const steps = new Set(stepList);

  if (!steps.size) return;

  const elements = new Set((await GM.getValue("elements", "")).split("\x00"));

  const resultStep = stepList[stepList.length - 1];
  const result = resultStep.children[3].getAttribute("data-id");

  if (elements.has(result.toLowerCase())) {
    setFooter("You already have this element");
    return;
  }

  let removedSteps = 0;

  for (const step of steps) {
    const result = step.children[3].getAttribute("data-id");
    if (elements.has(result.toLowerCase())) {
      // hide the step instead of removing it
      // so that the "copy lineage" button works properly
      step.style.display = "none";
      steps.delete(step);
      removedSteps++;
    }
  }

  if (!removedSteps) return;

  while (true) {
    const unused = new Map();
    for (const step of steps) {
      unused.delete(step.children[1].getAttribute("data-id"));
      unused.delete(step.children[2].getAttribute("data-id"));
      
      if (step != resultStep) {
        unused.set(step.children[3].getAttribute("data-id"), step);
      }
    }
    
    if (!unused.size) break;
    console.log(unused);
    for (const step of unused.values()) {
      step.style.display = "none";
      steps.delete(step);
      removedSteps++;
    }
  }

  // fix step numbers
  let n = 0;
  for (const step of steps) {
    step.children[0].textContent = `${++n}.`;
  }

  // add a footer
  const btn = document.createElement("a");
  btn.textContent = "Show original";
  btn.onclick = () => {
    setFooter();

    let n = 0;
    for (const step of stepList) {
      step.style.display = null;
      step.children[0].textContent = `${++n}.`;
    }
  };

  setFooter(`Removed ${removedSteps} steps. `, btn);
}

/** Initialize on InfiniBrowser at /item */
function $initIBItemView() {
  const recipeTree = document.getElementById("recipe_tree");
  if (document.getElementById("lineage_loader")) {
    const observer = new MutationObserver((e) => {
      if (e[0].removedNodes) {
        setTimeout(() => adjustLineage("#recipe_tree li"));
        observer.disconnect();
      }
    });

    observer.observe(recipeTree, { childList: true });
  } else {
    adjustLineage("#recipe_tree li");
  }
}

/** Initialize on InfiniBrowser at /search */
function $initIBSearch() {
  if (!document.getElementById("recipes")) return;
  if (document.getElementById("item_descr")) item_descr.remove();

  new MutationObserver(() => {
    adjustLineage("#recipes li");
  }).observe(
    document.getElementById("recipes"),
    { childList: true }
  );
}

/** Initialize on Infinite Craft */
function $initInfiniteCraft() {
  const API = document.querySelector(".container").__vue__;

  let elementCount = 0;
  const storeElements = () => {
    elementCount = API.items.length;
    GM.setValue(
      "elements",
      API.items.map((x) => x.text.toLowerCase()).join("\x00")
    );
  };

  const craftApi = API.craftApi;
  API.craftApi = async function () {
    const result = await craftApi.apply(this, arguments);
    setTimeout(() => {
      if (elementCount != API.items.length) {
        storeElements();
      }
    });

    return result;
  };

  const switchSave = API.switchSave;
  API.switchSave = async function () {
    const res = await switchSave.apply(this, arguments);
    setTimeout(storeElements, 16);
    return res;
  }

  const addAPI = API.addAPI;
  API.addAPI = function () {
    setTimeout(storeElements, 16);

    API.addAPI = addAPI;
    return addAPI.apply(this, arguments);
  }
}
