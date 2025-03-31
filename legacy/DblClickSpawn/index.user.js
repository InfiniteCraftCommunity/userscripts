// ==UserScript==
// @name        Double Click Spawn
// @namespace   Double Click Spawn
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @version     1.1
// @author      Margen67, Mikarific
// @description Creates the first search result on double click.
// ==/UserScript==

(function() {
  window.addEventListener("load", () => {
    const container = document.querySelector('.container');
    container.addEventListener('dblclick', (e) => {
      const vue = container.__vue__;
      if (vue.searchResults.length > 0 && e.target.classList[0] === "container") {
        vue.playInstanceSound();
        const resultElement = vue.searchResults[0];
        const data = {
          id: vue._data.instanceId++,
          text: resultElement.text,
          emoji: resultElement.emoji,
          discovered: resultElement.discovered,
          disabled: false,
          left: 0,
          top: 0,
          offsetX: 0.5,
          offsetY: 0.5,
        };
        vue._data.selectedInstance = cloneInto(data, unsafeWindow);
        vue._data.instances.push(vue._data.selectedInstance);
        vue.$nextTick(exportFunction(() => {
          const maxWidth = window.innerWidth - vue._data.sidebarSize - (resultElement.text.length * 10) - 150;
          const x = e.x > maxWidth ? maxWidth : e.x - (resultElement.text.length * 6) - 20;
          const y = e.y - 20;
          vue.setInstancePosition(vue._data.selectedInstance, x, y);
          vue.setInstanceZIndex(vue._data.selectedInstance, data.id);
          vue.calcInstanceSize(vue._data.selectedInstance);
        }, unsafeWindow));
      };
    });
  });
})();
