// ==UserScript==
//
// @name            Color proven Elements
// @namespace       GameRoMan
//
// @match           https://neal.fun/infinite-craft/*
//
// @version         1.3.1
// @author          GameRoMan
// @description     Colors elements that are proven to Base Eements in green color
//
// @downloadURL     https://gitlab.com/gameroman/infinite-craft/-/raw/main/base-elements/index.user.js
// @updateURL       https://gitlab.com/gameroman/infinite-craft/-/raw/main/base-elements/index.user.js
//
// @supportURL      https://discord.gg/YHEmKEcQjy
// @homepageURL     https://discord.gg/YHEmKEcQjy
//
// @license         MIT
//
// ==/UserScript==


(function() {
    let mapElements = {};

    async function load_data(location) {
        const response = await fetch(`https://glcdn.githack.com/gameroman/infinite-craft/-/raw/main/base-elements/${location}.json`, {cache: 'no-store'});
        return await response.json();
    }

    async function colorElements(green=null, red=null) {
        const green_color = "#00cc1f";  // Color for Proven Elements
        const red_color   = "#ff1c1c";  // Color for Disroven Elements

        let inv = setInterval(() => {
            if (document.querySelector(".container").__vue__._data.elements.length > 0) {
                clearInterval(inv);

				mapElements = {};

                let items = Array.from(document.querySelectorAll(".item"));

                for (let elem of green) {
					mapElements[elem.toLowerCase()] = {"color": green_color};

                    let elemNode = document.querySelector(".container").__vue__._data.elements.find(x => x.text.toLowerCase() == elem.toLowerCase());
                    if (elemNode) {
                        elemNode.color = green_color;
                        let instancesGreen = document.querySelector(".container").__vue__._data.instances.filter(x => x.text.toLowerCase() == elem.toLowerCase());
                        instancesGreen.forEach((x) => {
                            if (x.elem) x.elem.style.color = elemNode.color;
                        });
                        let itemsGreen = items.filter(x => x.childNodes[1].data.trim().toLowerCase() == elem.trim().toLowerCase());
                        itemsGreen.forEach(x => x.style.color = elemNode.color);

                    }
                }

                for (let elem of red) {
					mapElements[elem.toLowerCase()] = {"color": red_color};

                    let elemNode = document.querySelector(".container").__vue__._data.elements.find(x => x.text == elem);
                    if (elemNode) {
                        elemNode.color = red_color;
                        let instancesRed = document.querySelector(".container").__vue__._data.instances.filter(x => x.text.toLowerCase() == elem.toLowerCase());
                        instancesRed.forEach((x) => {
                            if (x.elem) x.elem.style.color = elemNode.color;
                        });
                        let itemsRed = items.filter(x => x.childNodes[1].data.trim().toLowerCase() == elem.trim().toLowerCase());
                        itemsRed.forEach(x => x.style.color = elemNode.color);
                    }
                }
            }
        }, 300);
    }

    window.addEventListener("helper-load", async () => {
        const proven = await load_data('proven');
        const disproven = await load_data('disproven');

        await colorElements(proven, disproven);

        const instanceObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.id != "instance-0" && node.classList.contains("instance") && node.querySelector(".instance-emoji")) {
                            let instance = document.querySelector(".container").__vue__._data.instances.find(x => x.elem == node);
                            if (instance) {
                                let elem = mapElements[instance.text.toLowerCase()];
                                if (elem && elem.color)  {
                                    node.style.color = elem.color;
                                }
                            }
                        }
                    }
                }
            }
        });

        instanceObserver.observe(document.getElementsByClassName("instances")[0], {
            childList: true,
            subtree: true,
        });
    })
})();
