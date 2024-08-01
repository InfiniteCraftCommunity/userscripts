// ==UserScript==
// @name        Double Click Spawn
// @namespace   Double Click Spawn
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @version     1.0
// @author      Margen67
// @description Creates the first search result on double click.
// ==/UserScript==

window.addEventListener("load", () => {
  document.querySelector('.container').addEventListener('dblclick', (e) => {
    if (unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].searchResults.length > 0
      && e.target.classList[0] === "container") {
      unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].playInstanceSound();
      const resultElement = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].searchResults[0];
      const data = {
        id: unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instanceId++,
        text: resultElement.text,
        emoji: resultElement.emoji,
        discovered: resultElement.discovered,
        disabled: false,
        left: 0,
        top: 0,
        offsetX: 0.5,
        offsetY: 0.5,
      };
      unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.selectedInstance = cloneInto(data, unsafeWindow);
      unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instances.push(unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.selectedInstance);
      unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].$nextTick(exportFunction(() => {
        const maxWidth = window.innerWidth - unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.sidebarSize - (resultElement.text.length * 10) - 150;
        const x = e.x > maxWidth ? maxWidth : e.x - (resultElement.text.length * 6) - 20;
        const y = e.y - 20;
        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstancePosition(unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.selectedInstance, x, y);
        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstanceZIndex(unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.selectedInstance, data.id);
        unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].calcInstanceSize(unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.selectedInstance);
      }, unsafeWindow));
    };
  });
});
