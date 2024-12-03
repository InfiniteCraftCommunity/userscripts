// ==UserScript==
//
// @name            Color proven Elements
// @namespace       GameRoMan
//
// @match           https://neal.fun/infinite-craft/*
//
// @version         1.2
// @author          GameRoMan
// @description     Colors elements that are proven to Base Eements in green color
//
// @downloadURL     https://gitlab.com/gameroman/infinite-craft/-/raw/main/base-elements/index.user.js
// @updateURL       https://gitlab.com/gameroman/infinite-craft/-/raw/main/base-elements/index.user.js
//
// ==/UserScript==


(function() {

	let mapElements={}
    async function load_data(location) {
        const response = await fetch(`https://glcdn.githack.com/gameroman/infinite-craft/-/raw/main/base-elements/${location}.json`, {cache: 'no-store'});
        return await response.json();
    }

    async function colorElements(green=null, red=null) {
        const green_color = "#00cc1f"; // Color for Proven Elements
        const red_color   = "#ff1c1c"; // Color for Disroven Elements

        let inv = setInterval(() => {
            if (document.querySelector(".container").__vue__._data.elements.length > 0) {
                clearInterval(inv);
				mapElements={};


                let items = Array.from(document.querySelectorAll(".item"));
                green
				.filter(elem=>{
			    let elemNode = document.querySelector(".container").__vue__._data.elements.find(x => x.text.toLowerCase() == elem.toLowerCase());
				return elemNode
				})
				.forEach((elem)=>{
			    mapElements[elem.toLowerCase()]={"color":green_color};

				let instancesGreen = document.querySelector(".container").__vue__._data.instances.filter(x => x.text.toLowerCase() == elem.toLowerCase() && x.elem);
                instancesGreen.forEach(x=> x.elem.style.color = green_color);

                let itemsGreen = items.filter(x => x.childNodes[1].data.trim().toLowerCase() == elem.trim().toLowerCase());
                itemsGreen.forEach(x => x.style.color = green_color);

			     });

                 red
				 .filter(elem=>{
				  let elemNode = document.querySelector(".container").__vue__._data.elements.find(x => x.text.toLowerCase() == elem.toLowerCase());
				  return elemNode
				  })
				  .forEach((elem)=>{
				  mapElements[elem.toLowerCase()]={"color":red_color};

				  let instancesRed = document.querySelector(".container").__vue__._data.instances.filter(x => x.text.toLowerCase() == elem.toLowerCase() && x.elem);
                  instancesRed.forEach((x) => { x.elem.style.color = red_color; });

				  let itemsRed = items.filter(x => x.childNodes[1].data.trim().toLowerCase() == elem.trim().toLowerCase());
                  itemsRed.forEach(x => x.style.color = red_color);
                    });


            }
        }, 300);
    }

    window.addEventListener("load", async () => {
        const proven = await load_data('proven');
        const disproven = await load_data('disproven');

        await colorElements(proven, disproven);

        const instanceObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
					Array.from(mutation.addedNodes)
					.filter(node=>node.id != "instance-0" && node.classList.contains("instance") && node.querySelector(".instance-emoji"))
					.forEach(node=>{
					  let instance = document.querySelector(".container").__vue__._data.instances.find(x => x.elem == node);
                      if (instance)
					  {
                       let elem = mapElements[instance.text.toLowerCase()];
                       if (elem && elem.color)
					   {
                        node.style.color = elem.color;
                       }
                     }
			})}}

            });

        instanceObserver.observe(document.getElementsByClassName("instances")[0], {
            childList: true,
            subtree: true,
        });
    })
})();
