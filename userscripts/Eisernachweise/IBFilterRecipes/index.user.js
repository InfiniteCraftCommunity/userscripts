// ==UserScript==
// @name         IB Filter Recipes
// @namespace    eisern.userscripts
// @version      1.2.0
// @match        https://infinibrowser.wiki/item*
// @run-at       document-end
// @author       Eisern
// @grant        GM_addStyle
// @description  Filter items in the recipes section of InfiniBrowser
// ==/UserScript==

(function() {
  "use strict";

  const settings = {
    // General
    stickyToolbar: false,       // Keep toolbar visible while scrolling.
    globalToolbar: false,       // Toolbar visible in all sections.

    // Filters
    ignoreCase: false,
  };

  const RECIPE_SECTION = document.getElementById("recipe_section");
  const RECIPES = document.getElementById("recipes");
  const MAIN = document.querySelector("main");
  const NAV = document.querySelector(".nav");

  const filtered = new Set();

  let ignoreCase = settings.ignoreCase;
  let stickyToolbar = settings.stickyToolbar;
  let globalToolbar = settings.globalToolbar;

  let filterContainer;
  let filterInput;
  let filterList;
  let caseButton;
  let toolbar;
  let counter;
  let input;

  const css = `
    .toolbar {
      display: grid;
      width: max-content;
    }

    .filter-container {
      display: grid;
    }

    .nav {
      width: fit-content;
    }

    .input {
      display: flex;
      align-items: center;
      height: 3em;
      padding: .8em .6em .8em 1em;
      background: #18181b;
      border: 1px solid #525252;
      border-radius: 5px;
      grid-row: 1;
    }

    #filter-input {
      flex-grow: 1;
      font-family: inherit;
      font-size: 1.1rem;
      background: 0 0;
      border: none;
      color: #ccc;
    }

    .filter-list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding: 7px 0px 8px;
      gap: .3em;
    }

    .filter-list .item {
      border: 1px solid #2b5ca7;
      font-size: 0.9em;
      padding: 6px;
      margin: 0;
    }

    #close-icon {
      filter: brightness(.9);
      cursor: pointer;
      width: 1.8rem;
    }

    #az-icon {
      filter: brightness(3);
      cursor: pointer;
      width: 3em;
      grid-row: 1;
      padding-left: .5em;
      padding-top: .25em;
    }

    .count {
      color: #999;
      font-size: 0.9em;
      margin-left: auto;
      padding: .9em 1.4rem .3em .9em;
    }

    .sticky {
      top: 1em;
      z-index: 1;
      padding: 1em;
      position: sticky;
      background: #18181b;
      border-radius: 10px;
      border: 1px solid #525252;
      overflow-y: auto;
      max-height: 27vh;
      scrollbar-width: thin;
      scrollbar-color: #333 transparent;
      box-shadow: 8px 8px 12px rgba(0, 0, 0, 0.2);
    }

    .separator {
      border-top: 1px solid #444;
    }

    .hidden {
      display: none !important;
    }

    .active {
      filter: brightness(6) !important;
    }
  `;


  // === Helpers ===
  const refreshFiltered = () => {
    if (filtered.size > 0) {
      filtered.clear();
    }

    if (filterList.children.length === 0) return;
    filterList.querySelectorAll(".item").forEach(e => filtered.add(e.dataset.id))
  };

  const getData = async (id) => {
    const response = await fetch("https://infinibrowser.wiki/api/item/?id="
        + encodeURIComponent(id)
    );

    return response.json();
  };

  const createItem = (input) => {
    const emoji = input.emoji;
    const text = input.text;

    // Main
    const item = document.createElement("div");
    item.dataset.emoji = emoji;
    item.className = "item";
    item.dataset.id = text;

    // Emoji
    const span = document.createElement("span");
    const img = document.createElement("img");
    img.draggable = false;
    img.className = "emoji";
    img.alt = emoji;

    const codepoint = emoji.codePointAt(0).toString(16);
    img.src = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${codepoint}.png`;

    span.append(img);

    // Assemble
    item.append(span, text);

    return item;
  };


  // === Event Listeners ===
  const removeItem = e => {
    const item = e.target.closest(".filter-list .item");
    if (!item) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    item.remove();
  };

  const clearAll = e => {
    if (e.button !== 0) return;
    const listLength = filterList.children.length > 1;

    const btn = e.target.closest("#close-icon");
    if (!btn) return;

    filterInput.value = "";
    while (filterList.children.length > 1){
      filterList.firstChild.remove()
    }
  };

  const handleRightClick = e => {
    if (e.button !== 2) return;
    e.preventDefault();

    // Recipe section
    let item = e.target.closest(".recipes .item");
    if (item && e.type === "mousedown" && !filtered.has(item.dataset.id)) {
      counter.before(item.cloneNode(true));
      return;
    }

    // Filter list
    item = e.target.closest(".filter-list .item");
    if (!item) return;

    if (e.type === "pointerdown") {
      item.remove();
      e.stopImmediatePropagation();
    }
  };

  const handleInput = async (input) => {
    filterInput.value = "";
    input = input.trim();
    if (!input) return;

    if (filtered.has(input)) return;

    let item;
    const items = [...document.querySelectorAll(".recipes .item")]

    item = items.find(i => i.dataset.id === input)
    if (item) {
        counter.before(item.cloneNode(true));
        return;
    }

    const data = await getData(input);
    if (!data) return console.warn("Failed to get item data.");
    if (data.code === 404) return;

    item = createItem(data);
    if (!item) return console.warn("Failed to create item, item is:", item);

    counter.before(item);
  };

  const toggleCasing = e => {
    if (e.button !== 0) return;

    const btn = e.target.closest("#az-icon");
    if (!btn) return;

    ignoreCase = !ignoreCase;
    console.log("Ignore case:", ignoreCase)

    toggleVisibility(caseButton, "active", ignoreCase);
    toggleItemVisibility();
    displayCount();
  }

  const toggleVisibility = (element, className, condition) => {
    if (!element) return;

    element.classList.toggle(className, condition);
  };

  const toggleItemVisibility = () => {
    const lis = document.querySelectorAll(".recipes > li");

    const condition = (li) => ignoreCase
      ? [...li.querySelectorAll(".item")]
          .some(item => [...filtered].some(
            e => e.toLowerCase() === item.dataset.id.toLowerCase()))
      : [...li.querySelectorAll(".item")]
          .some(item => filtered.has(item.dataset.id));

    lis.forEach(li => li.classList.toggle("hidden", condition(li)));
  };

  const displayCount = () => {
    const count = document.querySelectorAll(
      ".recipes > li[class='hidden']").length;

    counter.textContent = `${count} hidden`;
  };


  // === Init ===
  window.addEventListener("load", () => {
    GM_addStyle(css);

    if (window.location.pathname.startsWith("/item")) {
      initIBItemView();
    }
  });

  function initUI() {
    toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    filterContainer = document.createElement("div");
    filterContainer.className = "filter-container";

    // Input
    input = document.createElement("div");
    input.className = "input";

    filterInput = document.createElement("input");
    filterInput.id = "filter-input";
    filterInput.type = "text";
    filterInput.maxLength = 255;
    filterInput.autocomplete = "off";
    filterInput.placeholder = "Filter items...";
    filterInput.addEventListener("keydown", e => {
      if (e.key === "Enter") handleInput(e.target.value)
    });

    const clearButton = document.createElement("img");
    clearButton.id = "close-icon";
    clearButton.src = "/static/icon/button/close.svg";
    clearButton.draggable = "false";

    caseButton = document.createElement("img");
    caseButton.id = "az-icon";
    caseButton.src = "https://upload.wikimedia.org/wikipedia/commons/a/ae/Fluent_Emoji_high_contrast_1f524.svg";
    caseButton.draggable = "false";

    input.append(filterInput, clearButton);

    // Filtered list
    filterList = document.createElement("div");
    filterList.className = "filter-list";
    filterList.classList.add("hidden");

    counter = document.createElement("div");
    counter.className = "count";

    filterList.append(counter);

    // Assemble
    filterContainer.append(input, filterList, caseButton)
    toolbar.append(filterContainer)

    // Add to DOM
    MAIN.prepend(toolbar)

    // CSS tweak
    filterContainer.style.maxWidth = `${NAV.offsetWidth}px`;
  }

  function initIBItemView() {
    if (!RECIPES) return;

    initUI();
    toggleVisibility(caseButton, "active", ignoreCase);
    toggleVisibility(toolbar, "sticky", stickyToolbar)
    toggleVisibility(toolbar, "hidden", !globalToolbar);

    // Observers
    const sectionObserver = new MutationObserver(() => {
      if (globalToolbar) {
        sectionObserver.disconnect();
        return;
      }

      toggleVisibility(
        toolbar, "hidden",
        RECIPE_SECTION.style.display === "none"
      );
    });

    sectionObserver.observe(RECIPE_SECTION, {
      attributes: true,
      attributeFilter: ["style"]
    });

    const itemObserver = new MutationObserver((e) => {
      refreshFiltered();
      toggleItemVisibility();
      displayCount();

      const shouldHideList = filterList.children.length <= 1;
      toggleVisibility(filterList, "hidden", shouldHideList);
      document.querySelectorAll(".navbtn")
        .forEach(btn => toggleVisibility(
          btn, "separator", !shouldHideList
        ));

    });

    itemObserver.observe(RECIPES, {
      childList: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    const list = document.querySelector(".filter-list")
    if (list) {
      itemObserver.observe(list, {
        childList: true,
        attributes: true,
        attributeFilter: ["class"]
      });
    }

    // Event Listeners
    toolbar.addEventListener("pointerdown", handleRightClick, true);
    RECIPES.addEventListener("mousedown", handleRightClick, true);
    MAIN.addEventListener("contextmenu", handleRightClick, true);

    MAIN.addEventListener("pointerdown", removeItem, true);
    toolbar.addEventListener("click", toggleCasing, true);
    input.addEventListener("click", clearAll, true);
  }
})();




