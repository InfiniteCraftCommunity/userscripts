// ==UserScript==
// @name        Add recipe count to recipe modal
// @namespace   Add recipe count to recipe modal
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @author      -
// @description 6/22/2024, 5:43:28 PM
// ==/UserScript==
(function(){


  	window.addEventListener('load', async () => {



       let target=document.querySelector(".modal");

      var dom_observer = new MutationObserver(function(mutation) {
      console.log('function called');
      let header=target.querySelector(".modal-header");
      let recipeDivs=target.querySelectorAll(".recipe");

        console.log(target,recipeDivs);
        header.style.color="var(--text-color)";
        console.log(header.querySelector(".recipe-counter"));
         if(header.querySelector(".recipe-counter")==null)
        {
         let textNode=document.createElement("span");
         textNode.classList.add("recipe-counter");
         textNode.textContent=recipeDivs.length>1?`${recipeDivs.length} Recipes`:"";
         header.insertBefore(textNode,header.querySelector(".modal-title").nextSibling);

        }else
        {
        header.querySelector(".recipe-counter").textContent=recipeDivs.length>1?`${recipeDivs.length} Recipes`:"";

        }

          });

var config = { attributes: true, childList: true, characterData: true,
  attributeFilter: ['open']  };

dom_observer.observe(target, config);





        console.log("modal:",target);







        }, false);


})();