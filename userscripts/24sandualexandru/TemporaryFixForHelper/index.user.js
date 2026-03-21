// ==UserScript==
// @name         Helper patch by Alex
// @namespace    http://tampermonkey.net/
// @version      2026-03-21
// @description  try to take over the world!
// @author       Alexander_sandu
// @match        https://neal.fun/infinite-craft/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neal.fun
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    //need a sleep method
    function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
       function injectItemsMoveLower() {
    const css = `
        .items-inner {
          top:20px !important;
        }
       .items-inner + div {
          top:20px !important;
        }
    `;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
}
     async function doStuffOnItem(node) {
       let itemNode=node.querySelector(".item");
       itemNode.addEventListener("contextmenu",async ()=>{
         let contextMenu=document.querySelector(".item-context-menu");
             if(contextMenu)
             { contextMenu.remove();
             }

       });

    }
       async function doStuffOnItemMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                console.log("ITEM CHECK",node)

                    if (node.classList && node.classList.contains("item-wrapper"))
                        doStuffOnItem(node);
                    }
                }
            }
        }
    
   window.addEventListener("load", async() => {

         injectItemsMoveLower();
        const itemObserver = new MutationObserver((mutations) => {


            doStuffOnItemMutation(mutations);


        });

        itemObserver.observe(document.querySelector(".items"), {
            childList: true,
            subtree: true,

        });

  if (unsafeWindow?.ICHelper?.recipeModalTabs) unsafeWindow.ICHelper.recipeModalTabs.set("hideItem", {
        	  renderBody: function(container, item) {
                let wrappers= Array.from(document.querySelectorAll(".item-wrapper"));
                let wrappersVues=wrappers.map(x=>x.__vue__);
                let myVueObject=wrappersVues.find(x=>x.element==item);
                myVueObject?.$emit("hideItem",item,!item.hide);
                let span=document.createElement("span");
                span.style.padding=" 20px 24px";
                span.textContent=`${item.emoji} ${item.text} was ${(item.hide)?"Hidden":"Unhidden"}`
                container.appendChild(span);
                //change text of button
                let footers= Array.from(document.querySelectorAll(".recipe-modal-footer-tab"));
                let myFooter=footers.find(x=>x.textContent.trim()=="Hide Item" || x.textContent.trim()=="Unhide Item");
                myFooter.textContent=`${(item.hide)?"Hidden":"Unhidden"}`
              },
        	  renderFooter: function(container, item) {

                container.appendChild(document.createTextNode((!item.hide)?"Hide Item":"Unhide Item"));
                 }


                })

   });

})();