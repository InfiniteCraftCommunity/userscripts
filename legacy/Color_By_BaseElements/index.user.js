// ==UserScript==
// @name            Color By Base Elements
// @namespace       Violentmonkey Scripts
// @match           https://neal.fun/infinite-craft/*
// @grant           none
// @version         1.1.1
// @author          Alexander_Andercou
// @author          Mikarific
// @description     A simple instance border theme based on the proximity to the base elements: Fire, Water, Wind, Earth
// @downloadURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Color_By_BaseElements/index.user.js
// @updateURL       https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Color_By_BaseElements/index.user.js
// ==/UserScript==

(function () {
    let baseColor = [
        [255, 0, 0, 0],
        [0, 255, 0, 0],
        [0, 0, 255, 0],
        [255, 255, 255, 1],
    ];
    
    let Table = { Fire: [1, 0, 0, 0], Earth: [0, 1, 0, 0], Water: [0, 0, 1, 0], Wind: [0, 0, 0, 1] };

    function getSave() {
        return new Promise((resolve, reject) => {
            const handleClick = HTMLElement.prototype.click;
            HTMLElement.prototype.click = () => {
                HTMLElement.prototype.click = handleClick;
            };
            const bodyObserver = new MutationObserver((mutations, observer) => {
                for (const mutation of mutations) {
                    if (mutation.type !== "childList") continue;
                    const anchor = Array.from(mutation.addedNodes).find((node) => node.download === "infinitecraft.json");
                    if (anchor) return fetch(anchor.href).then(resolve);
                }
            });
            bodyObserver.observe(document.body, { childList: true, subtree: true });
            handleClick.call(document.querySelector(".setting[for=import-save] + .setting"));
            setTimeout(() => {
                bodyObserver.disconnect();
                reject("Timed out");
            }, 1500);
        });
    }

    async function generateColors() {
        Table = { Fire: [1, 0, 0, 0], Earth: [0, 1, 0, 0], Water: [0, 0, 1, 0], Wind: [0, 0, 0, 1] };
        let save = await getSave().then((x) => x.json());
        let elements = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements;
        // for each element build to baseElements and
        // do this while no more update
        let update = false;
        do {
            update = false;
            for (let element of elements) {
                if (Table[element.text] == null) {
                    let recipes = save["recipes"][element.text];

                    if (recipes == null) {
                        Table[element.text] = [0, 0, 0, 0];
                        update = true;
                        continue;
                    }

                    for (let recipe of recipes) {
                        let father = recipe[0].text;
                        let mother = recipe[1].text;
                        let minimalCost = null;
                        if (Table[mother] != null && Table[father] != null) {
                            let costOfRecipe = (Table[mother][0] + Table[father][0] + Table[mother][1] + Table[father][1] + Table[mother][2] + Table[father][2] + Table[mother][3] + Table[father][3]) / 2;
                            if (minimalCost == null || costOfRecipe < minimalCost) {
                                minimalCost = costOfRecipe;

                                Table[element.text] = [Table[mother][0] + Table[father][0], Table[mother][1] + Table[father][1], Table[mother][2] + Table[father][2], Table[mother][3] + Table[father][3]];
                                update = true;
                            }
                        }
                    }
                }
            }
        } while (update);
    }
  
    window.addEventListener("load", async () => {
        await generateColors();
        console.log("Table:", Table);
        const instanceObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    for (const node of mutation.addedNodes) {
                        if (node.id != "instance-0" && node.classList.contains("instance") && node.querySelector(".instance-emoji")) {
                            if (node.childNodes) {
                                let text = node.childNodes[1].textContent.trim();
                                console.log("The nodes tet:", text, Table[text]);
                                if (Table[text]) {
                                    let sum = Table[text][0] + Table[text][1] + Table[text][2] + Table[text][3];
                                    if (sum == 0) sum = 1;
                                    let normalisedCost = [Table[text][0] / sum, Table[text][1] / sum, Table[text][2] / sum, Table[text][3] / sum];
                                    console.log("normalisedCost", normalisedCost);

                                    let colorValues = [
                                        Math.round(normalisedCost[0] * baseColor[0][0] + normalisedCost[1] * baseColor[1][0] + normalisedCost[2] * baseColor[2][0] + normalisedCost[3] * baseColor[3][0]),
                                        Math.round(normalisedCost[0] * baseColor[0][1] + normalisedCost[1] * baseColor[1][1] + normalisedCost[2] * baseColor[2][1] + normalisedCost[3] * baseColor[3][1]),
                                        Math.round(normalisedCost[0] * baseColor[0][2] + normalisedCost[1] * baseColor[1][2] + normalisedCost[2] * baseColor[2][2] + normalisedCost[3] * baseColor[3][2]),
                                        1 - 0.9 * normalisedCost[3],
                                    ];
                                    console.log("colors:", colorValues);
                                    node.style.borderColor = "rgba(" + colorValues[0] + "," + colorValues[1] + "," + colorValues[2] + "," + colorValues[3] + ")";
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
    }, false);
})();
