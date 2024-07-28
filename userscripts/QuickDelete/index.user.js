// ==UserScript==
// @name        Quick Delete
// @namespace   Quick Delete
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @version     1.0
// @author      Margen67
// @description Quickly delete elements by holding CTRL+Right Click and hovering over them.
// ==/UserScript==

window.addEventListener("load", () => {
  function setRightClickOnMutations(mutations) {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          node.addEventListener('mouseover', (e) => {
            if (e.ctrlKey && e.buttons === 2) {
              function isMatch(instance) {
                if (instance.elem) {
                  return instance.elem.id !== e.target.id;
                } else {
                  return false;
                };
              };
              unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instances =
                unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instances.filter(isMatch);
            };
          });
        };
      };
    };
  };
  const instanceObserver = new MutationObserver((mutations) => {
    setRightClickOnMutations(mutations);
  });
  const instances = document.querySelector('.instances');
  instanceObserver.observe(instances, { childList: true, subtree: true });
});
