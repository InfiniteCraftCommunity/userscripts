// ==UserScript==
// @name         Collectable is  green
// @namespace    http://tampermonkey.net/
// @version      2026-03-21
// @description  try to take over the world!
// @author       You
// @match        https://neal.fun/infinite-craft/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neal.fun
// @grant        none
// ==/UserScript==

(async function() {
    'use strict';
           function sleep(ms = 0) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
          await   new Promise((r,e)=>
                          {while(document.querySelector(".container")==null)
                           sleep(300);
                           r();
                           })
    function injectDeadElementStyles() {
    const css = `
        .collection-element {
            border-radius: 8px !important;
            border: 3px solid var(--border-strong) !important;
            padding: 8px 12px !important;
            background: var(--green-main-soft) !important;
            color: var(--green-main,#fff);
          --green-main: #22c55e;
          --green-main-soft: #22c55e33; /* same green, 20% opacity */
          --border-strong: #4ade80;
            transition: box-shadow 0.25s ease, transform 0.25s ease;
        }

        .collection-element:hover {
            box-shadow: 0 0 18px var(--green-main-soft) !important;;
            transform: translateY(-2px) !important;
        }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}
    'use strict';

     async function doStuffOnItem(node,text="") {
         //search for text in reverseMap
         let reverseMap= document.querySelector(".container").__vue__._data.achievementTracker.reverseIndex.get(text.toLowerCase())
         if(reverseMap && reverseMap.length>0)
         {
           node.classList.add("collection-element");
         }

    }
       async function doStuffOnItemMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {

                    if (node.classList && node.classList.contains("item-wrapper")) {
                        let itemNode=node.querySelector(".item");
                        let text=node.__vue__.element.text;
                        doStuffOnItem(itemNode,text);
                    }
                }
            }
        }
    }
      async function doStuffOnInstancesMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {

                    if (node.id!="instance-0" && node.classList.contains("instance") && node.querySelector(".instance-emoji")) {
                        let text=node.querySelector(".instance-text").textContent;

                        doStuffOnItem(node,text);
                    }
                }
            }
        }
    }

           injectDeadElementStyles() ;
      // you have to wait for container


        const itemObserver = new MutationObserver((mutations) => {


            doStuffOnItemMutation(mutations);


        });

        itemObserver.observe(document.querySelector(".items"), {
            childList: true,
            subtree: true,

        });

        var items = document.querySelectorAll(".item");
        for (let item of items)
           doStuffOnItem(item,item.parentNode.__vue__.element.text);

        const instanceObserver = new MutationObserver((mutations) => {


            doStuffOnInstancesMutation(mutations);


        });

       instanceObserver.observe(document.querySelector("#instances"), {
            childList: true,
            subtree: true,

        });

        var instances = document.querySelectorAll(".instance");
        for (let inst of instances)
        {
           doStuffOnItem(inst,inst.querySelector(".instance-text").textContent);
        }



})();