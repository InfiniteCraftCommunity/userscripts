// ==UserScript==
// @name         Discoveries are blue
// @namespace    http://tampermonkey.net/
// @version      2026-03-21
// @description  try to take over the world!
// @author       You
// @match        https://neal.fun/infinite-craft/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neal.fun
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function injectDeadElementStyles() {
    const css = `
        .discovered-element {
            border-radius: 8px !important;;
            padding: 8px 12px !important;;
            color: var(--color,#fff);
            --color:#bbf;
            transition: box-shadow 0.25s ease, transform 0.25s ease;
        }

        .discovered-element:hover {
            box-shadow: 0 0 18px var(--color) !important;;
            transform: translateY(-2px) !important;
        }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}
    'use strict';
  
     async function doStuffOnItem(node) {
        node.classList.add("discovered-element");

    }
       async function doStuffOnItemMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {

                    if (node.classList && node.classList.contains("item-wrapper")) {
                        let itemNode=node.querySelector(".item-discovery");
                        if(itemNode)
                        doStuffOnItem(itemNode);
                    }
                }
            }
        }
    }
      async function doStuffOnInstancesMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {

                    if (node.id!="instance-0" && node.classList.contains("instance-discovery") && node.querySelector(".instance-emoji")) {

                        doStuffOnItem(node);
                    }
                }
            }
        }
    }
   window.addEventListener("load", async() => {
           injectDeadElementStyles() ;

        const itemObserver = new MutationObserver((mutations) => {


            doStuffOnItemMutation(mutations);


        });

        itemObserver.observe(document.querySelector(".items"), {
            childList: true,
            subtree: true,

        });

        var items = document.querySelectorAll(".item-discovery");
        for (let item of items)
           doStuffOnItem(item,true);

        const instanceObserver = new MutationObserver((mutations) => {


            doStuffOnInstancesMutation(mutations);


        });

       instanceObserver.observe(document.querySelector("#instances"), {
            childList: true,
            subtree: true,

        });

        var instances = document.querySelectorAll(".instance-discovery");
        for (let inst of instances)
           doStuffOnItem(inst,true);

   });

})();