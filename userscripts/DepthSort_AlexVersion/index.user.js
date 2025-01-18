// ==UserScript==
// @name            Depth Sort
// @namespace       Violentmonkey Scripts
// @match           https://neal.fun/infinite-craft/*
// @grant           none
// @version         1.1.1
// @author          Alexander_Andercou, Mikarific
// @description     Depth Sort
// @downloadURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/DepthSort_AlexVersion/index.user.js
// @updateURL       https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/DepthSort_AlexVersion/index.user.js
// ==/UserScript==


(function () {
    let save = null;
    let base = ["Water", "Fire", "Earth", "Wind"];
    let visited = {};
    let seen = [];
    let bad = [];
    window.logs = "";

    console.log = (...anything) => {
        for (let an of anything) {
            window.logs += JSON.stringify(an);
        }
        window.logs += "\n";
    };

    function computeDepth(elemIn) {
        let elemStack = [];
        let recipeIdStack = [];
        let depthStack = [];
        elemStack.push(elemIn.text); // elements in recursion
        recipeIdStack.push(0); // next recipe to try for the corresponding element
        depthStack.push(0); // 0 for no children tried for current recipeId, otherwise length to left element of recipe

        let closed = new Set();

        if (base.includes(elemIn.text)) {
            return 1;
        }

        for (const key of base) {
            visited[key] = 1;
            closed.add(key);
        }

        while (elemStack.length > 0) {
            let stackLen = elemStack.length;
            const elem = elemStack[stackLen - 1];
            const recipeId = recipeIdStack[stackLen - 1];

            const isClosed = closed.has(elem);
            let goneThroughAllRecipes = false;

            if (!isClosed) {
                if (!(elem in visited)) {
                    visited[elem] = -1;
                }
                const isInSave = elem in save["recipes"];
                if (!isInSave || save["recipes"][elem].length === 0) {
                    // element has no recipe
                    elemStack.pop();
                    recipeIdStack.pop();
                    depthStack.pop();
                    stackLen -= 1;
                    if (stackLen === 0) {
                        return -1;
                    }

                    depthStack[stackLen - 1] = -1; // invalidates the current parent recipe
                    closed.add(elem);
                    continue;
                }
                if (recipeId >= save["recipes"][elem].length) {
                    goneThroughAllRecipes = true;
                }
            }

            if (isClosed || goneThroughAllRecipes) {
                // parent recipe has been gone through
                elemStack.pop();
                recipeIdStack.pop();
                depthStack.pop();
                stackLen -= 1;

                if (goneThroughAllRecipes) {
                    closed.add(elem);
                }

                const leftDepth = depthStack[stackLen - 1]; // this cannot be -1
                const rightDepth = visited[elem];
                if (leftDepth === 0) {
                    // is left (first) ingredient of the recipe
                    depthStack[stackLen - 1] = rightDepth;
                    continue;
                } else if (rightDepth === -1) {
                    depthStack[stackLen - 1] = -1;
                    continue;
                }

                const parentDepth = Math.max(leftDepth, rightDepth) + 1;
                const parentElem = elemStack[stackLen - 1];

                // visited[parentElem] always is an entry with a value
                const visitedParent = visited[parentElem];
                if (visitedParent === -1) {
                    visited[parentElem] = parentDepth;
                } else {
                    // parentDepth is always > 0, visitedParent too
                    visited[parentElem] = Math.min(visitedParent, parentDepth);
                }
                recipeIdStack[stackLen - 1] += 1;
                depthStack[stackLen - 1] = 0;
                continue;
            }

            const recipe = save["recipes"][elem][recipeId];
            if (recipe[0].text === elem || recipe[1].text === elem) {
                // directly recursive recipe
                recipeIdStack[stackLen - 1] += 1;
                continue;
            } else if ((recipe[0].text in visited && !closed.has(recipe[0].text)) || (recipe[1].text in visited && !closed.has(recipe[1].text))) {
                recipeIdStack[stackLen - 1] += 1;
                continue;
            }
            elemStack.push(recipe[depth === 0 ? 0 : 1].text);
            recipeIdStack.push(0);
            depthStack.push(0);
        }

        return visited[elemIn.text];
    }

    function computeDepth2(elemIn) {
        let elemStack = [];
        let recipeIdStack = [];
        let depthStack = [];

        elemStack.push(elemIn.text); // elements in recursion
        recipeIdStack.push(0); // next recipe to try for the corresponding element
        depthStack.push(0); // 0 for no children tried for current recipeId, otherwise length to left element of recipe

        let closed = new Set();

        for (const key of base) {
            visited[key] = 1;
            closed.add(key);
        }
        if (base.includes(elemIn.text)) {
            return 1;
        }

        if (elemIn.text in visited && visited[elemIn.text] != -Infinity && visited[elemIn.text] !== Infinity) {
            return visited[elemIn.text];
        }

        visited[elemIn.text] = -Infinity;
        console.log("First enter:", elemIn);

        checkIAndJ: while (elemStack.length > 0) {
            console.log("continue loop while");
            let stackLen = elemStack.length;
            const elem = elemStack[stackLen - 1];
            const recipeId = recipeIdStack[stackLen - 1];
            const depth = depthStack[stackLen - 1];
            const isInSave = elem in save["recipes"];
            const isClosed = closed.has(elem);
            let goneThroughAllRecipes = false;
            console.log("Elem in enter:", elem);
            if (!isInSave) {
                visited[elem] = Infinity;
                closed.add(elem);
                elemStack.pop();
                recipeIdStack.pop();
                continue checkIAndJ;
            }

            if (recipeIdStack[stackLen - 1] >= save["recipes"][elem].length) {
                console.log("no more recipes");
                if (visited[elem] >= Infinity || visited[elem] <= -Infinity) visited[elem] = Infinity;
                closed.add(elem);
                elemStack.pop();
                recipeIdStack.pop();
                continue checkIAndJ;
            }
            const recipe = save["recipes"][elem][recipeId];

            if (recipe[0].text === elem || recipe[1].text === elem) {
                // directly recursive recipe
                recipeIdStack[stackLen - 1] += 1;
                continue checkIAndJ;
            }
            console.log("Parents:", recipe[0].text, recipe[1].text, visited[recipe[0].text], visited[recipe[1].text], recipeId, save["recipes"][elem].length, elem);

            if (visited[recipe[0].text] <= -Infinity || visited[recipe[1].text] <= -Infinity || visited[recipe[0].text] >= Infinity || visited[recipe[1].text] >= Infinity) {
                recipeIdStack[stackLen - 1] += 1;
                continue checkIAndJ;
            }

            console.log("Parents  closed:", recipe[0].text, recipe[1].text);

            if (recipe[0].text in visited && recipe[1].text in visited) {
                console.log("Good Parents :", recipe[0].text, recipe[1].text);
                if (visited[elem] == undefined || visited[elem] <= -Infinity) visited[elem] = Math.max(visited[recipe[0].text], visited[recipe[1].text]) + 1;
                else visited[elem] = Math.min(visited[elem], Math.max(visited[recipe[0].text], visited[recipe[1].text]) + 1);

                recipeIdStack[stackLen - 1] += 1;
                continue checkIAndJ;
            }

            if (!(recipe[1].text in visited)) {
                console.log("Add in stack:", recipe[1].text);
                visited[recipe[1].text] = -Infinity;
                elemStack.push(recipe[1].text);
                recipeIdStack.push(0);
                depthStack.push(0);
            }
            if (!(recipe[0].text in visited)) {
                console.log("Add in stack:", recipe[0].text);
                visited[recipe[0].text] = -Infinity;
                elemStack.push(recipe[0].text);
                recipeIdStack.push(0);
                depthStack.push(0);
            }
        }

        return visited[elemIn.text];
    }
    
    function computeDepth3(elemIn) {
        let elemStack = [];
        let recipeIdStack = [];
        let depthStack = [];

        elemStack.push(elemIn.text); // elements in recursion
        recipeIdStack.push(0); // next recipe to try for the corresponding element
        depthStack.push(0); // 0 for no children tried for current recipeId, otherwise length to left element of recipe

        let closed = new Set();

        for (const key of base) {
            visited[key] = [1, -Infinity];
            closed.add(key);
        }
        if (base.includes(elemIn.text)) {
            return 1;
        }

        if (elemIn.text in visited && visited[elemIn.text][0] != -Infinity) {
            return visited[elemIn.text][0] != -Infinity ? visited[elemIn.text][0] : visited[elemIn.text][1];
        }

        visited[elemIn.text] = [-Infinity, -Infinity];
        console.log("First enter:", elemIn);

        checkIAndJ: while (elemStack.length > 0) {
            console.log("continue loop while");
            let stackLen = elemStack.length;
            const elem = elemStack[stackLen - 1];
            const recipeId = recipeIdStack[stackLen - 1];
            const depth = depthStack[stackLen - 1];
            const isInSave = elem in save["recipes"];
            const isClosed = closed.has(elem);
            let goneThroughAllRecipes = false;
            console.log("Elem in enter:", elem);
            if (base.includes(elem)) {
                elemStack.pop();
                recipeIdStack.pop();
                continue checkIAndJ;
            }

            if (!isInSave) {
                visited[elem] = [-Infinity, 1];
                bad.push(elem);
                closed.add(elem);
                elemStack.pop();
                recipeIdStack.pop();
                continue checkIAndJ;
            }

            if (recipeIdStack[stackLen - 1] >= save["recipes"][elem].length) {
                console.log("no more recipes");
                if (visited[elem][1] <= -Infinity && visited[elem][0] <= -Infinity) {
                    visited[elem] = [-Infinity, 1];
                    bad.push(elem);
                }

                closed.add(elem);
                elemStack.pop();
                recipeIdStack.pop();
                continue checkIAndJ;
            }
            const recipe = save["recipes"][elem][recipeId];

            if (recipe[0].text === elem || recipe[1].text === elem) {
                // directly recursive recipe
                recipeIdStack[stackLen - 1] += 1;
                continue checkIAndJ;
            }
            console.log("Parents:", recipe[0].text, recipe[1].text, visited[recipe[0].text], visited[recipe[1].text], recipeId, save["recipes"][elem].length, " for result:", elem);

            if (recipe[0].text in visited && recipe[1].text in visited) {
                if ((visited[recipe[0].text][0] <= -Infinity && visited[recipe[0].text][1] <= -Infinity) || (visited[recipe[1].text][0] <= -Infinity && visited[recipe[1].text][1] <= -Infinity)) {
                    recipeIdStack[stackLen - 1] += 1;
                    continue checkIAndJ;
                }

                console.log("Parents  closed:", recipe[0].text, recipe[1].text, "for result:", elem);

                console.log("Good Parents :", recipe[0].text, recipe[1].text);
                let val1 = 0,
                    val2 = 0;
                val1 = bad.includes(recipe[0].text) ? 1 : visited[recipe[0].text][0] > -Infinity ? visited[recipe[0].text][0] : visited[recipe[0].text][1];
                val2 = bad.includes(recipe[1].text) ? 1 : visited[recipe[1].text][0] > -Infinity ? visited[recipe[1].text][0] : visited[recipe[1].text][1];
                if (bad.includes(recipe[0].text) || bad.includes(recipe[1].text)) {
                    if (visited[elem] == undefined || visited[elem][1] <= -Infinity) visited[elem][1] = Math.max(val1, val2) + 1;
                    else visited[elem][1] = Math.min(visited[elem][1], Math.max(val1, val2) + 1);

                    console.log("bad parents");
                } else if (visited[recipe[0].text][0] <= -Infinity || visited[recipe[1].text][0] <= -Infinity) {
                    console.log("medium parents");
                    if (visited[elem] == undefined || visited[elem][1] <= -Infinity) visited[elem][1] = Math.max(val1, val2) + 1;
                    else visited[elem][1] = Math.min(visited[elem][1], Math.max(val1, val2) + 1);
                }
                //pure ones set the good side from the good side
                else {
                    console.log("pure parents");
                    if (visited[elem] == undefined || visited[elem][0] <= -Infinity) visited[elem][0] = Math.max(visited[recipe[0].text][0], visited[recipe[1].text][0]) + 1;
                    else visited[elem][0] = Math.min(visited[elem][0], Math.max(visited[recipe[0].text][0], visited[recipe[1].text][0]) + 1);
                }

                recipeIdStack[stackLen - 1] += 1;
                continue checkIAndJ;
            }

            if (!(recipe[1].text in visited)) {
                console.log("Add in stack:", recipe[1].text);
                visited[recipe[1].text] = [-Infinity, -Infinity];

                elemStack.push(recipe[1].text);
                recipeIdStack.push(0);
                depthStack.push(0);
            }
            if (!(recipe[0].text in visited)) {
                console.log("Add in stack:", recipe[0].text);
                visited[recipe[0].text] = [-Infinity, -Infinity];
                elemStack.push(recipe[0].text);
                recipeIdStack.push(0);
                depthStack.push(0);
            }
        }

        return visited[elemIn.text][0] != -Infinity ? visited[elemIn.text][0] : visited[elemIn.text][1];
    }
    
    function computeDepths(elements) {
        seen = [];
        visited = {};
        let countInfinities = 0;
        let previous = -1;
        let tempDepths = null;
        tempDepths = elements;
        let triesIfPrevious = 4;

        do {
            previous = countInfinities;
            countInfinities = 0;
            if (previous == 0) triesIfPrevious--;
            tempDepths = tempDepths.map((elem) => {
                elem.depth = computeDepth3(elem);
                console.log("computed", elem.text, elem.depth);
                if (visited[elem.text][0] <= -Infinity) countInfinities++;
                return elem;
            });
            console.log("infinities:", countInfinities, previous);
        } while ((previous == 0 && triesIfPrevious > 0) || countInfinities < previous);

        console.log("visited", visited);
        window.visited = visited;
        window.depths = {};

        tempDepths = tempDepths.map((elem) => {
            if (!base.includes(elem)) elem.depth = Infinity;
            return elem;
        });

        tempDepths.forEach((elem) => {
            window.depths[elem.text] = elem.depth;
        });

        return tempDepths;
    }

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

    window.addEventListener("load", async () => {
        console.log("Welcome to hijack sorting by depth");

        let new_svg = `data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjE1IiB2aWV3Qm94PSIwIDAgMTUgMTUiIHdpZHRoPSIxNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtLjUgMHYxNC41aDE0di0xNC41bS0xNCA0LjVoMnYxaDJ2M2gydjNoMXYzLTJoMnYtMmgydi0zaDF2LTJoMiIgc3Ryb2tlPSIjMDAwIi8+PC9zdmc+`;
        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].sorts.push("depth");
        let elementals = null;
        const complex_filter = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._computedWatchers.sortedElements.getter;

        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._computedWatchers.sortedElements.getter = exportFunction(() => {
            if (unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.sortBy === "depth") {
                let elements2 = [...complex_filter.call(this)];
                console.log("elem:", elements2);

                if (save != null) {
                    console.log(save);
                    elements2 = computeDepths(elements2);

                    let elem3 = elements2.sort((a, b) => {
                        return a.depth - b.depth;
                    });

                    console.log("elems after sort", elem3);
                    return elem3;
                }
                console.log("elems after sort are null", elements2);

                return elements2;
            } else {
                let elements2 = [...complex_filter.call(this)];
                console.log("By:", unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.sortBy);
                console.log("elem normal:", elements2);
                return elements2;
            }
        }, unsafeWindow);

        const sortButtonObserver = new MutationObserver((mutations) => {
            console.log("mutation:", unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.sortBy);

            if (unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.sortBy === "depth") {
                let img = document.querySelector(".sidebar-sort > img");

                if (img.src.trim() == "https://neal.fun/infinite-craft/depth.svg") {
                    img.src = new_svg;
                    img.style.filter = "invert(1)";
                    //img.style.filter="none";
                }
            } else {
                let img = document.querySelector(".sidebar-sort > img");

                img.style.filter = "invert(1)";
            }
        });

        let img = document.querySelector(".sidebar-sort > img");
        console.log(img, img.textContent);
        var config = { characterData: false, attributes: true, childList: false, subtree: false };
        sortButtonObserver.observe(img, config);

        let parent = document.querySelector(".settings-content");
        let button = document.createElement("div");
        button.appendChild(document.createTextNode("Fetch savefile for depths"));
        button.addEventListener("click", async () => {
            save = await getSave().then((x) => x.json());

            alert("Save file fetched");
        });
        parent.appendChild(button);

        // console.log(unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]);

        console.log(img);
    }, false);
})();
