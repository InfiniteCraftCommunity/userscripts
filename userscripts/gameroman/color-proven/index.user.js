// ==UserScript==
// @namespace       rman.dev
// @author          GameRoMan
// @supportURL      https://rman.dev/discord
// @homepageURL     https://rman.dev/discord
// @license         MIT
// @downloadURL     https://userscripts.rman.dev/infinite-craft/color-proven/index.user.js
// @updateURL       https://userscripts.rman.dev/infinite-craft/color-proven/index.user.js
// @name            Color proven Elements
// @match           https://neal.fun/infinite-craft
// @version         1.3.3
// @description     Colors elements that are proven to Base Eements in green color
// ==/UserScript==

(function () {
  let mapElements = {};
  async function load_data(location) {
    const response = await fetch(
      `https://glcdn.githack.com/gameroman/infinite-craft/-/raw/main/base-elements/${location}.json`,
      { cache: "no-store" }
    );
    return await response.json();
  }
  const __VUE__ = document.querySelector(".container").__vue__;
  async function colorElements(green, red) {
    const green_color = "#00cc1f";
    const red_color = "#ff1c1c";
    const interval = setInterval(() => {
      if (
        document.querySelector(".container").__vue__._data.elements.length > 0
      ) {
        clearInterval(interval);
        mapElements = {};
        let items = Array.from(document.querySelectorAll(".item"));
        for (let elem of green) {
          mapElements[elem.toLowerCase()] = { color: green_color };
          let elemNode = __VUE__._data.elements.find(
            (x) => x.text.toLowerCase() == elem.toLowerCase()
          );
          if (elemNode) {
            elemNode.color = green_color;
            let instancesGreen = __VUE__._data.instances.filter(
              (x) => x.text.toLowerCase() == elem.toLowerCase()
            );
            instancesGreen.forEach((x) => {
              if (x.elem) x.elem.style.color = elemNode.color;
            });
            let itemsGreen = items.filter(
              (x) =>
                x.childNodes[1].data.trim().toLowerCase() ==
                elem.trim().toLowerCase()
            );
            itemsGreen.forEach((x) => (x.style.color = elemNode.color));
          }
        }
        for (let elem of red) {
          mapElements[elem.toLowerCase()] = { color: red_color };
          let elemNode = __VUE__._data.elements.find((x) => x.text == elem);
          if (elemNode) {
            elemNode.color = red_color;
            let instancesRed = __VUE__._data.instances.filter(
              (x) => x.text.toLowerCase() == elem.toLowerCase()
            );
            instancesRed.forEach((x) => {
              if (x.elem) x.elem.style.color = elemNode.color;
            });
            let itemsRed = items.filter(
              (x) =>
                x.childNodes[1].data.trim().toLowerCase() ==
                elem.trim().toLowerCase()
            );
            itemsRed.forEach((x) => (x.style.color = elemNode.color));
          }
        }
      }
    }, 300);
  }
  window.addEventListener("helper-load", async () => {
    const proven = await load_data("proven");
    const disproven = await load_data("disproven");
    await colorElements(proven, disproven);
    const instanceObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (
              node.id != "instance-0" &&
              node.classList.contains("instance") &&
              node.querySelector(".instance-emoji")
            ) {
              let instance = __VUE__._data.instances.find(
                (x) => x.elem == node
              );
              if (instance) {
                let elem = mapElements[instance.text.toLowerCase()];
                if (elem && elem.color) {
                  node.style.color = elem.color;
                }
              }
            } else {
            }
          }
        } else {
        }
      }
    });
    instanceObserver.observe(document.getElementsByClassName("instances")[0], {
      childList: true,
      subtree: true,
    });
  });
})();
