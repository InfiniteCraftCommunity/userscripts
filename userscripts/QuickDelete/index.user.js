// ==UserScript==
// @name        Quick Delete
// @namespace   Quick Delete
// @match       https://neal.fun/infinite-craft/*
// @version     1.1
// @author      Margen67, Mikarific
// @description Quickly delete elements by holding CTRL+RMB and hovering over them.
// ==/UserScript==

(function() {
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
                const vue = document.querySelector(".container").__vue__;
                vue._data.instances = vue._data.instances.filter(isMatch);
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
})();
