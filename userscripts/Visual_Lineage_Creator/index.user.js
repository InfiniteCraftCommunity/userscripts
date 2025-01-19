// ==UserScript==
// @name            Lineage Creator
// @namespace       Violentmonkey Scripts
// @match           https://neal.fun/infinite-craft/*
// @require         https://cdn.jsdelivr.net/npm/html2canvas@1.0.0-rc.5/dist/html2canvas.min.js
// @grant           none
// @version         1.1.1
// @author          Alexander_Andercou, Mikarific
// @description     A visual tree auto builder from IC savefile
// ==/UserScript==

const delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
};

(function () {
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
            handleClick.call(document.getElementById("import-savefile-button"));
            setTimeout(() => {
                bodyObserver.disconnect();
                reject("Timed out");
            }, 1500);
        });
    }

    let linePoints = [];
    let lineColor = "#fff";
    let base = ["Water", "Wind", "Fire", "Earth"];
    let batch = [];
    
    function deleteInstance(t) {
        console.log("DELETE");

        // based on id determine indexI,indexJ;
        try {
            let nodeid = t;
            console.log("nodeid:", nodeid);
            console.log("linePoints:", linePoints);

            console.log(Tree);
            let [ii, ij] = Tree.indexes((x) => x.id == nodeid);
            console.log("indexes now:", ii, ij);

            linePoints = linePoints.filter((x) => {
                return (x[4] != ii || x[5] != ij) && (x[6] != ii || x[7] != ij);
            });
            console.log("after line points:", linePoints);

            translateLines(0, 0);
        } catch (e) {
            console.log(e);
        }
    }

    function makeLine(x1, y1, x2, y2, otherCanvas = null) {
        let myCanvas = canvas;
        if (otherCanvas != null) myCanvas = otherCanvas;

        const ctx = myCanvas.getContext("2d");

        // Define a new path
        ctx.beginPath();
        // Set a start-point
        ctx.moveTo(x1, y1);

        // Set an end-point
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = lineColor;
        // Stroke it (Do the Drawing)
        ctx.stroke();
    }
    
    function translateLines(distance, distanceY = 0, otherCanvas = null) {
        let myCanvas = canvas;
        if (otherCanvas != null) myCanvas = otherCanvas;

        const ctx = myCanvas.getContext("2d");
        if (!otherCanvas) ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let line of linePoints) {
            line[0] += distance;
            line[1] += distanceY;
            line[2] += distance;
            line[3] += distanceY;
            makeLine(line[0], line[1], line[2], line[3], otherCanvas);
        }
    }

    let repeatingRecipes = true;
    let maximumGenerations = 10;
    let progressiveVerticalGap = false;
    let initialVerticalGap = 100;
    let spacing = 20;
    let distance = 55;
    let canvas = null;
    let Tree = null;
    
    function computeDistnaces(initial, variance, fathers, tree) {
        let distanceFactor = initial;
        for (let i = 0; i < tree.length; i++) {
            for (let j = 0; j < tree[i].length; j++) {
                console.log(i, j, tree[i][j]);
                if (fathers[[i, j]] != undefined) {
                    let indexChildren = -1;
                    for (let children of fathers[[i, j]]) {
                        indexChildren++;
                        tree[children[0]][children[1]].x = tree[i][j].x + (indexChildren % 2 == 0 ? -distanceFactor : distanceFactor);
                    }
                }
            }
            //if(i<2)
            // distanceFactor=distanceFactor/2;
        }
    }
    
    let lastAvailableX = {};

    function spawnElement(element, x, y, id, callback, textColor = null) {
        console.log("spawning", element);
        if (lastAvailableX[y]) {
            x = Math.max(lastAvailableX[y], x);
        }

        const data = {
            id: id,
            text: element.text,
            emoji: element.emoji,
            discovered: element.discovered,
            disabled: false,
            left: 0,
            top: 0,
            offsetX: 0.5,
            offsetY: 0.5,
        };
        const instance = cloneInto(data, unsafeWindow);
        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances.push(instance);

        console.log("before spawning:", instance.text, lastAvailableX, lastAvailableX[y], y, x);

        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].$nextTick(
            exportFunction(() => {
                unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].setInstancePosition(instance, x, y);
                unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].setInstanceZIndex(instance, 0);

                let interval = setInterval(() => {
                    if (document.querySelector("#instance-" + id)) {
                        console.log("it was spawned", id, lastAvailableX, lastAvailableX[y]);
                        let instanceDiv = document.querySelector("#instance-" + id);
                        console.log("inst=", instanceDiv.textContent);

                        let size = instanceDiv.offsetWidth;
                        if (textColor) instanceDiv.style.color = textColor;

                        if (lastAvailableX[y]) x = Math.max(lastAvailableX[y], x - size / 2);
                        else x = x - size / 2;
                        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].setInstancePosition(instance, x, y);

                        if (lastAvailableX[y]) lastAvailableX[y] = Math.max(x + size + spacing, lastAvailableX[y]);
                        else lastAvailableX[y] = x + size + spacing;
                        callback(y, x, size, instanceDiv);

                        clearInterval(interval);
                    }
                }, 10);
            }, unsafeWindow)
        );
    }

    let indexI = 0;
    let indexJ = 0;

    function makeOneScreenshot(goToNext = null) {
        let initialCanvas = document.createElement("canvas");
        initialCanvas.width = window.innerWidth;
        initialCanvas.height = window.innerHeight;
        translateLines(0, 0, initialCanvas);

        let copy = document.querySelector(".container");
        let keepBack = copy.style.backgroundColor;

        copy.style.backgroundColor = "transparent";
        document.querySelector(".sidebar").setAttribute("data-html2canvas-ignore", "true");

        console.log("here I am once again");
        console.log(
            html2canvas(copy, { canvas: initialCanvas, backgroundColor: null }).then((canvas) => {
                copy.style.backgroundColor = keepBack;
                if (goToNext == null) adjustingAllInstances(1);
                else if (goToNext < 3) adjustingAllInstances(goToNext + 1);

                console.log("in canvas");
                canvas.style.position = "absolute";
                canvas.style.top = "0px";
                canvas.style.left = "0px";

                var pngUrl = canvas.toDataURL();
                const link = document.createElement("a");
                link.href = pngUrl;
                link.download = batch[0] + (goToNext != null ? goToNext.toString() : "0") + ".png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                if (goToNext == 3) {
                    if (batch != null && batch.length > 0) batch.shift();
                    if (batch.length > 0) {
                        document.querySelector(".clear").click();
                        startingModal();
                        makeVisualLineage(batch[0]);
                    }
                }
            })
        );
    }

    function adjustingAllInstances(marginElement = null) {
        console.log("adjusting");
        let allInstances = document.querySelectorAll(".instance");
        console.log("instances:", allInstances);
        //find target node
        let centerX = document.querySelector(".items").getBoundingClientRect().left / 2;

        let maxy = 0;
        let root = null;
        let minx = document.querySelector(".items").getBoundingClientRect().left;
        let maxx = null;
        let rootx = null;
        let leftmostNode = null;
        let leftest = null;
        let rightest = null;
        for (let instance of allInstances) {
            if (instance.id == "instance-0") continue;

            if (instance.getBoundingClientRect().top > maxy) {
                maxy = instance.getBoundingClientRect().top;
                rootx = instance.getBoundingClientRect().left;
                root = instance;
            }

            if (instance.getBoundingClientRect().left < minx) {
                minx = instance.getBoundingClientRect().left;
                leftest = instance;
            }
            if (maxx == null || instance.getBoundingClientRect().right > maxx) {
                maxx = instance.getBoundingClientRect().right;
                rightest = instance;
            }
        }

        console.log("after first", root, rootx, centerX, minx, leftest);

        if (rootx > centerX && marginElement == null) {
            let distanceTomove = rootx - centerX;
            let distanceY = 0;

            distanceY = window.innerHeight - 50 - maxy;

            for (const instance of unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances) {
                if (!instance.elem) continue;

                const translate = instance.elem.style
                    .getPropertyValue("translate")
                    .split(" ")
                    .map((x) => parseInt(x));

                if (translate.length === 1) translate.push(0);

                translate[0] -= distanceTomove;
                translate[1] -= distanceY;
                instance.elem.style.translate = translate.map((x) => x + "px").join(" ");
                instance.top -= distanceY;
                instance.left -= distanceTomove;
            }

            translateLines(-distanceTomove, -distanceY);
        } else {
            let distanceTomove =
                marginElement == 1
                    ? minx < 0
                        ? minx
                        : 0
                    : marginElement == 2
                    ? maxx > document.querySelector(".sidebar").getBoundingClientRect().left
                        ? maxx - document.querySelector(".sidebar").getBoundingClientRect().left
                        : 0
                    : rootx - centerX;

            let distanceY = 0;

            for (const instance of unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances) {
                if (!instance.elem) continue;

                const translate = instance.elem.style
                    .getPropertyValue("translate")
                    .split(" ")
                    .map((x) => parseInt(x));

                if (translate.length === 1) translate.push(0);

                translate[0] -= distanceTomove;
                translate[1] -= distanceY;
                instance.elem.style.translate = translate.map((x) => x + "px").join(" ");
                instance.top -= distanceY;
                instance.left -= distanceTomove;
            }

            translateLines(-distanceTomove, -distanceY);
        }

        makeOneScreenshot(marginElement);
    }

    function nextSpawn(tree, fathers, y_start) {
        console.log("before_method", y_start);
        return (y_method, x, size, htmlElm) => {
            if (indexI < 0) {
                //adjust all the instances so that target gets to be visible
                adjustingAllInstances();
                return;
            }

            if (indexJ != -1) {
                console.log("IJ:", indexI, indexJ);
                tree[indexI][indexJ].x = x;
                tree[indexI][indexJ].size = size;
                tree[indexI][indexJ].id = htmlElm.id;

                let children = fathers[[indexI, indexJ]];
                if (children) {
                    var lineChildren = [];
                    for (let child of children) {
                        makeLine(tree[child[0]][child[1]].x + tree[child[0]][child[1]].size / 2, tree[child[0]][child[1]].y + 20, tree[indexI][indexJ].x + tree[indexI][indexJ].size / 2, tree[indexI][indexJ].y + 20);
                        linePoints.push([
                            tree[child[0]][child[1]].x + tree[child[0]][child[1]].size / 2,
                            tree[child[0]][child[1]].y + 20,
                            tree[indexI][indexJ].x + tree[indexI][indexJ].size / 2,
                            tree[indexI][indexJ].y + 20,
                            indexI,
                            indexJ,
                            child[0],
                            child[1],
                            htmlElm.id,
                        ]);
                        lineChildren.push(linePoints[linePoints.length - 1]);
                    }
                }

                let node = [indexI, indexJ];
                console.log("NODE:", node);
                let instanceObserver = new MutationObserver((mutations) => {
                    for (let mutation of mutations) {
                        console.log("mutation in position", mutation);
                        const translate = mutation.target.style
                            .getPropertyValue("translate")
                            .split(" ")
                            .map((x) => parseInt(x));
                        if (translate.length === 1) translate.push(0);

                        if (lineChildren)
                            for (let lc of lineChildren) {
                                lc[2] = translate[0] + mutation.target.offsetWidth / 2;
                                lc[3] = translate[1] + 20;
                            }
                        //theoretically you must search whose child you are identify the nodes and then update the relevant linePoints;
                        //search in fathers
                        for (let [key, value] of Object.entries(fathers)) {
                            let itsChild = false;
                            for (let elm of value) {
                                if (elm[0] == node[0] && elm[1] == node[1]) {
                                    itsChild = true;
                                    break;
                                }
                            }
                            if (itsChild) {
                                //console.log("node:",node,"is son of",key,key[0],"and",key[2]);
                                // console.log("linepoints",linePoints);
                                let yourLinePoints = linePoints.filter((x) => {
                                    return x[4] == key[0] && x[5] == key[2] && x[6] == node[0] && x[7] == node[1];
                                });
                                //console.log("your line poits",yourLinePoints);
                                yourLinePoints.forEach((x) => {
                                    x[0] = translate[0] + mutation.target.offsetWidth / 2;
                                    x[1] = translate[1] + 20;
                                });
                            }
                        }

                        //you are node

                        translateLines(0, 0);
                    }
                });

                instanceObserver.observe(htmlElm, {
                    childList: false,
                    subtree: false,
                    attributeFilter: ["style"],
                    attributeOldValue: true,
                });
            }

            indexJ++;

            let y_newStart = y_method;

            if (indexJ > tree[indexI].length - 1) {
                console.log(y_start);
                console.log("move to next_line");
                indexJ = 0;
                indexI--;
                if (indexI < 0) {
                    adjustingAllInstances();
                    return;
                }

                for (let j = 0; j < tree[indexI].length; j++) {
                    let parent = tree[indexI][j];
                    let children = fathers[[indexI, j]];
                    let sum = 0;
                    let count = 0;
                    if (children) {
                        for (let child of children) {
                            count++;
                            console.log("view of dependencies:", indexI, j, child, child[0], child[1]);
                            sum += tree[child[0]][child[1]].x + size / 2;
                        }
                        if (count > 0) tree[indexI][j].x = Math.ceil(sum / count);
                    }
                }

                if (!progressiveVerticalGap) y_newStart += initialVerticalGap + distance;
                else {
                    y_newStart += distance + initialVerticalGap / Math.pow(2, indexI);
                }

                console.log("new:", y_newStart);
            }

            console.log("indexes:", indexI, indexJ, "y:", y_start);
            console.log("limits:", tree.length, tree[indexI].length, "y:", y_start);

            console.log("did not returned");
            let node = tree[indexI][indexJ];
            node["y"] = y_newStart;

            let trueNode = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((x) => x.text == node.text);
            let id = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instanceId++;

            return spawnElement(trueNode, node.x, y_newStart, id, nextSpawn(tree, fathers, y_newStart));
        };
    }

    function fallbackBuilder(finalWord, AllRecipes, finished) {
        let tree = [[{ text: finalWord }]];
        let baseRecipes = AllRecipes[finalWord];
        let nrGen = 0;
        let stack = [];
        let expandedInTree = [];
        if (baseRecipes) {
            let choosenRecipe = baseRecipes[0];
            let generation = [
                { child: finalWord, text: choosenRecipe[0].text, recipe: choosenRecipe[0] },
                { child: finalWord, text: choosenRecipe[1].text, recipe: choosenRecipe[1] },
            ];

            tree.push(generation);

            nrGen++;
            do {
                nrGen++;
                if (nrGen >= maximumGenerations) break;
                let newGeneration = [];

                for (let ancestor of generation) {
                    if (base.includes(ancestor.text)) continue;
                    if (repeatingRecipes || (!repeatingRecipes && !expandedInTree.includes(ancestor.text))) {
                        expandedInTree.push(ancestor.text);
                        let recipes = AllRecipes[ancestor.text];
                        if (recipes) {
                            let findAProperRecipe = recipes.filter((x) => finished.includes(x[0].text) && finished.includes(x[1].text));
                            if (findAProperRecipe && findAProperRecipe.length > 0) {
                                choosenRecipe = findAProperRecipe[0];
                            } else {
                                let findAImProperRecipe = recipes.filter((x) => finished.includes(x[0].text) || finished.includes(x[1].text));
                                if (findAImProperRecipe && findAImProperRecipe.length > 0) {
                                    choosenRecipe = findAImProperRecipe[0];
                                } else choosenRecipe = recipes[0];
                            }

                            newGeneration.push({ child: ancestor.text, text: choosenRecipe[0].text, recipe: choosenRecipe[0] });
                            newGeneration.push({ child: ancestor.text, text: choosenRecipe[1].text, recipe: choosenRecipe[1] });
                        }
                    }
                }
                generation = newGeneration;
                if (newGeneration.length == 0) break;

                tree.push(newGeneration);
            } while (1);
        }

        return tree;
    }

    async function makeLineageRaw(finalWord, saveFileObj) {
        saveFileObj["save"] = await getSave().then((x) => x.json());

        let saveFile = saveFileObj["save"];
        let elements = saveFile["elements"];
        let AllRecipes = saveFile["recipes"];
        let stackRecipes = [];

        let nodeWithRecipe = [];
        let finished = [...base];
        let visited = [finalWord];

        let StackElements = [finalWord];

        let recipesInLineage = [];
        let unseriousNodes = [];
        let finalRecipes = [];

        let pool = [];
        let partitonedRecipes = [];
        //Part1 partition all the recipes and elements given by root , add all the recipes in the partitioned recipes and all the elements in pool
        while (StackElements.length > 0) {
            //console.log("stack");
            let node = StackElements.pop();

            if (!pool.includes(node)) {
                pool.push(node);

                let recipes = AllRecipes[node];

                //find all elemenmts without recipes early;
                if (recipes == null || recipes.length == 0) {
                    if (!finished.includes(node)) finished.push(node);
                    unseriousNodes.push(node);

                    pool = pool.filter((x) => x != node);
                    continue;
                }

                for (let recipe of recipes) {
                    if (!pool.includes(recipe[0].text)) StackElements.push(recipe[0].text);

                    if (!pool.includes(recipe[1].text)) StackElements.push(recipe[1].text);
                }
            }
        }
        let earlyFinish = false;
        let oneElementFinished = true;

        console.log("before finishing base elements:", [...finished]);
        console.log("pool:", [...pool]);

        //&& oneElementFinished

        while (!finished.includes(finalWord) && pool.length > 0 && oneElementFinished) {
            console.log("pool", [...pool]);
            console.log("finished", [...finished]);
            oneElementFinished = false;

            // console.log("Ah");
            if (earlyFinish) break;
            for (let name of pool) {
                if (finished.includes(finalWord)) {
                    earlyFinish = true;
                    break;
                }

                if (finished.includes(name)) {
                    // pool=pool.filter(x=>x!=name);
                    continue;
                }

                let oneHasFinished = false;
                recipes = AllRecipes[name];
                let hasSeriousParent = false;
                let potentialRecipe = {};
                //first pass to see if you can find recipe where elements are base or have parents
                for (let recipe of recipes) {
                    if (finished.includes(recipe[0].text) && finished.includes(recipe[1].text)) {
                        oneHasFinished = true;
                        potentialRecipe = recipe;
                        oneElementFinished = true;

                        if (!unseriousNodes.includes(recipe[0].text) && !unseriousNodes.includes(recipe[1].text)) {
                            hasSeriousParent = true;
                            break;
                        }
                    }
                }

                if (oneHasFinished) {
                    if (!finished.includes(name)) {
                        console.log("has finished:", name, potentialRecipe);
                        finished.push(name);
                        finalRecipes.push({ child: name, recipe: potentialRecipe });

                        if (!hasSeriousParent) unseriousNodes.push(name);

                        //pool=pool.filter(x=>x!=name);
                    }
                }
            }
        }
        finalRecipes.sort((a, b) => a.child.localeCompare(b.child));
        console.log("finished:", finished, finalRecipes);
        //build the tree ground up
        let tree = [];
        let firstRecipe = finalRecipes.find((x) => x.child == finalWord);

        console.log(firstRecipe);

        if (firstRecipe) {
            let genNr = 0;
            tree.push([{ text: finalWord }]);
            let generation = [
                { child: finalWord, text: firstRecipe["recipe"][0].text, recipe: firstRecipe["recipe"][0] },
                { child: finalWord, text: firstRecipe["recipe"][1].text, recipe: firstRecipe["recipe"][1] },
            ];
            tree.push(generation);
            genNr++;

            let stop = false;
            do {
                genNr++;

                if (genNr >= maximumGenerations) {
                    stop = true;
                    break;
                }

                console.log("new generation");
                let newGeneration = [];
                let expandedInTree = [];

                for (let ancestor of generation) {
                    //expand only if
                    if (repeatingRecipes || (!repeatingRecipes && !expandedInTree.includes(ancestor.text))) {
                        let NowRecipe = finalRecipes.find((x) => x.child == ancestor.text);

                        if (NowRecipe != null) {
                            expandedInTree.push(ancestor.text);
                            newGeneration.push({ child: ancestor.text, text: NowRecipe["recipe"][0].text, recipe: NowRecipe["recipe"][0] });

                            newGeneration.push({ child: ancestor.text, text: NowRecipe["recipe"][1].text, recipe: NowRecipe["recipe"][1] });
                        }
                    }
                }
                console.log("newnewGeneration:", newGeneration, newGeneration.length);
                generation = newGeneration;

                if (newGeneration.length == 0) {
                    stop = true;
                    break;
                }

                tree.push(newGeneration);
            } while (!stop);

            console.log("Tree:", tree);
        } else {
            tree = fallbackBuilder(finalWord, AllRecipes, finished, pool);
        }

        let genNr = 0;
        let fathers = {};
        for (let generation of tree) {
            genNr++;
            if (genNr > tree.length - 1) break;
            let nextGen = tree[genNr];
            let nr_in_Gen = 0;
            let indexNextGen = 0;
            console.log("next gen:", nextGen);
            for (let node of generation) {
                console.log("node text:", node.text);
                nr_in_Gen++;

                let nrChildren = 0;

                fathers[[genNr - 1, nr_in_Gen - 1]] = [];

                while (indexNextGen < nextGen.length && nextGen[indexNextGen].child == node.text && nrChildren < 2) {
                    fathers[[genNr - 1, nr_in_Gen - 1]].push([genNr, indexNextGen]);
                    indexNextGen++;
                    nrChildren++;
                }
            }
        }
        console.log("fathers:", fathers);

        return [tree, fathers];
    }

    async function descendantsTree(target, saveFileObj) {
        saveFileObj["save"] = await getSave().then((x) => x.json());

        let saveFile = saveFileObj["save"];

        //need to build an inverse recipe object ,go trough all recipes and build for each element the direct descendants list
        let descendants = {};

        let AllRecipes = saveFile["recipes"];
        for (let key in AllRecipes) {
            let recipes = AllRecipes[key];
            for (let recipe of recipes) {
                let p1 = recipe[0];
                let p2 = recipe[1];
                if (descendants[p1.text] == null) descendants[p1.text] = [];

                if (descendants[p2.text] == null) descendants[p2.text] = [];

                if (!descendants[p1.text].includes(key)) descendants[p1.text].push(key);

                if (!descendants[p2.text].includes(key)) descendants[p2.text].push(key);
            }
        }

        let tree = [];
        tree.push([{ text: target, child: target }]);

        let generation = descendants[target].map((x) => {
            return { parent: target, child: x };
        });
        let nrGen = 1;
        console.log("generation:", generation);
        tree.push(generation);
        do {
            nrGen++;
            if (nrGen > maximumGenerations) break;
            let newGeneration = [];

            console.log("generation", nrGen, generation.length);
            let in_gen = 0;
            for (let descendant of generation) {
                in_gen++;
                console.log("the descendant", nrGen, in_gen, generation.length, descendant);
                if (descendant["child"] != null && descendants[descendant["child"]] != null) {
                    //all the kids of a descendant
                    // console.log("des:",descendants[descendant["child"]])
                    let myDescendants = [...descendants[descendant["child"]]];
                    //console.log("mydesc:",myDescendants);

                    for (let myDescendant of myDescendants) {
                        if (newGeneration.find((x) => x["parent"] == descendant["child"] && x["child"] == myDescendant) == null) newGeneration.push({ parent: descendant["child"], child: myDescendant });
                    }
                }
            }
            console.log("new generation:", newGeneration);
            if (newGeneration.length == 0) break;

            tree.push(newGeneration);
            generation = newGeneration;
        } while (1);
        console.log(tree);
        let connectdom = {};
        for (let i = 0; i < tree.length - 1; i++) {
            let indexInGeneration = 0;
            console.log("line=", tree[i]);
            for (let j = 0; j < tree[i].length; j++) {
                console.log("trr ij:", tree[i][j]);
                connectdom[[i, j]] = [];
                if (indexInGeneration < tree[i + 1].length)
                    while (tree[i + 1][indexInGeneration]["parent"] == tree[i][j]["child"]) {
                        connectdom[[i, j]].push([i + 1, indexInGeneration]);
                        indexInGeneration++;
                        if (indexInGeneration >= tree[i + 1].length) break;
                        console.log(indexInGeneration, tree[i + 1][indexInGeneration]);
                    }
            }
        }
        //map tree to elements from the inventory
        tree.forEach((x) =>
            x.forEach((y) => {
                (y["text"] = y["child"]), (y["child"] = saveFile["elements"].find((z) => z.text == y["child"]));
                y["parent"] = saveFile["elements"].find((z) => z.text == y["parent"]);
            })
        );
        console.log(tree);

        console.log(connectdom);
        return [tree, connectdom];
    }
    
    let direction = "a";
    
    async function makeVisualLineage(finalWord) {
        try {
            document.querySelector(".choose-target-lineage").style.backgroundColor = "green";
            document.querySelector(".choose-target-lineage").style.borderColor = "pink";
        } catch (e) {}
        await delay(3000);

        let settings = null;

        if (localStorage.getItem("vizualizer-settings")) settings = JSON.parse(localStorage.getItem("vizualizer-settings"));
        if (settings == null)
            settings = {
                spacing: spacing,
                initialVerticalGap: initialVerticalGap,
                maximumGenerations: maximumGenerations,
                lineColor: lineColor,
                repeatingRecipes: repeatingRecipes,
                progressiveVerticalGap: progressiveVerticalGap,
            };

        spacing = Number(settings["spacing"]);
        initialVerticalGap = Number(settings["initialVerticalGap"]);
        maximumGenerations = Number(settings["maximumGenerations"]);
        lineColor = settings["lineColor"];
        repeatingRecipes = settings["repeatingRecipes"];
        progressiveVerticalGap = settings["progressiveVerticalGap"];
        console.log("settings:", spacing, initialVerticalGap, maximumGenerations, lineColor, repeatingRecipes, progressiveVerticalGap);

        lastAvailableX = {};
        let savefile = { save: "hello" };
        let [tree, fathers] = direction == "a" ? await makeLineageRaw(finalWord, savefile) : await descendantsTree(finalWord, savefile);

        try {
            document.querySelector(".choose-target-lineage").style.backgroundColor = "#6B492B";
            document.querySelector(".choose-target-lineage").style.borderColor = "green";
        } catch (e) {}
        await delay(2000);

        console.log(savefile);
        console.log(tree);
        let bottom = window.innerHeight - 50;
        let leftmost = document.querySelector(".items").getBoundingClientRect().left;
        let root = tree[0][0];
        console.log(root);
        let trueRoot = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((x) => x.text == root.text);
        console.log(trueRoot);
        let genNr = 0;
        let x_start = leftmost / 2;
        let y_start = bottom;
        // spawnElement(trueRoot,x_start,y_start);
        tree[0][0].x = x_start;
        tree[0][0].y = y_start;
        console.log(tree[0][0]);

        console.log("tree before spawning:", tree);
        //find dependencies before actually fixing them on the board

        console.log(fathers);
        computeDistnaces(initialVerticalGap, 60, fathers, tree);

        console.log(tree);
        let nr_gen;

        let nrNode = 0;
        let earlyBreak = false;
        indexI = tree.length - 1;
        indexJ = -1;

        if (!progressiveVerticalGap) y_start = y_start - (distance + initialVerticalGap) * tree.length;
        else {
            //compute starting point by simulation
            let currentGap = initialVerticalGap;
            console.log("first gap:", currentGap);
            for (let i = 0; i < Math.max(tree.length, maximumGenerations); i++) {
                y_start = y_start - (distance + currentGap);
                currentGap = currentGap / 2;
            }
        }
        console.log("y_start:", y_start);

        Tree = {
            data: tree,

            find: (cond) => {
                let array = this.data.find((x) => x.find((y) => cond(y)));
                return array.find((y) => cond(y));
            },
            indexes: function (cond) {
                console.log(this);
                for (let i = 0; i < this.data.length; i++) {
                    for (let j = 0; j < this.data[i].length; j++) if (cond(this.data[i][j])) return [i, j];
                }
                return [-1, -1];
            },
        };
        //remove the selection Box before drawing the tree

        try {
            document.querySelector(".container").removeChild(document.querySelector(".choose-target-lineage"));
        } catch (e) {}

        nextSpawn(tree, fathers, y_start, initialVerticalGap + distance)(y_start);
    }

    unsafeWindow.RawLineageMaker = makeVisualLineage;

    function makeModalWithSetting() {
        let settings = null;
        if (localStorage.getItem("vizualizer-settings")) settings = JSON.parse(localStorage.getItem("vizualizer-settings"));
        if (settings == null)
            settings = {
                spacing: spacing,
                initialVerticalGap: initialVerticalGap,
                maximumGenerations: maximumGenerations,
                lineColor: lineColor,
                repeatingRecipes: repeatingRecipes,
                progressiveVerticalGap: progressiveVerticalGap,
            };

        if (document.querySelector(".lineage-settings")) {
            document.querySelector(".container").removeChild(document.querySelector(".lineage-settings"));
        }

        {
            //declaring inputs
            let settingsModal = document.createElement("dialog");
            settingsModal.style.position = "absolute";
            settingsModal.style.top = ((window.innerHeight - 50) / 2).toString() + "px";
            settingsModal.style.left = ((3 * document.querySelector(".items").getBoundingClientRect().left) / 8).toString() + "px";
            settingsModal.style.backgroundColor = "var(--background-color)";
            settingsModal.style.color = "var(--text-color)";
            settingsModal.classList.add("lineage-settings");

            let MinimalHorizontalGap = document.createElement("input");
            MinimalHorizontalGap.type = "number";
            MinimalHorizontalGap.classList.add("vizualizer-seeting-1");
            MinimalHorizontalGap.value = settings["spacing"];
            let VerticalGap = document.createElement("input");
            VerticalGap.type = "number";
            VerticalGap.classList.add("vizualizer-seeting-2");
            VerticalGap.value = settings["initialVerticalGap"];
            let MaximumGenerationsInPast = document.createElement("input");
            MaximumGenerationsInPast.type = "number";
            MaximumGenerationsInPast.value = settings["maximumGenerations"];
            MaximumGenerationsInPast.classList.add("vizualizer-seeting-3");
            let RepeatingRecipes = document.createElement("input");
            RepeatingRecipes.type = "checkbox";
            RepeatingRecipes.checked = settings["repeatingRecipes"];
            RepeatingRecipes.classList.add("vizualizer-seeting-4");
            RepeatingRecipes.style.display = "inline-block";
            RepeatingRecipes.style.width = RepeatingRecipes.style.height = "20px";
            RepeatingRecipes.style.opacity = "1";
            let ProgresiveVerticalGap = document.createElement("input");
            ProgresiveVerticalGap.type = "checkbox";
            ProgresiveVerticalGap.style.display = "inline-block";
            ProgresiveVerticalGap.checked = settings["progressiveVerticalGap"];
            ProgresiveVerticalGap.classList.add("vizualizer-seeting-5");
            ProgresiveVerticalGap.style.width = ProgresiveVerticalGap.style.height = "20px";
            ProgresiveVerticalGap.style.opacity = "1";
            let LinesColor = document.createElement("input");
            LinesColor.type = "color";
            LinesColor.classList.add("vizualizer-seeting-6");
            LinesColor.value = settings["lineColor"];
            let previousColor = settings["lineColor"];

            LinesColor.addEventListener("input", () => {
                lineColor = LinesColor.value;
                translateLines(0, 0);
            });

            let ButtonDiv = document.createElement("div");
            let ButtonText = document.createTextNode("Settings for Lineage Creator");

            ButtonDiv.appendChild(ButtonText);
            ButtonDiv.classList.add("setting");
            ButtonDiv.addEventListener("click", () => {
                settingsModal.showModal();
            });
            document.querySelector(".settings-content").appendChild(ButtonDiv);

            //labels
            let label1 = document.createElement("label");
            label1.textContent = "Set the Minimal Horizontal Gap in px between elements:";
            let label2 = document.createElement("label");
            label2.textContent = "Set the Vertical Gap in px between elements:";
            let label3 = document.createElement("label");
            label3.textContent = "Set the Maximum nr. of generations to display:";
            let label4 = document.createElement("label");
            label4.textContent = "Allow or not repeating elements with recipes:";
            let label5 = document.createElement("label");
            label5.textContent = "Use decreasing vertical gap:";
            let label6 = document.createElement("label");
            label6.textContent = "Choose connecting line color:";
            //append jobs
            settingsModal.appendChild(label1);
            settingsModal.appendChild(MinimalHorizontalGap);
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(label2);
            settingsModal.appendChild(VerticalGap);
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(label5);
            settingsModal.appendChild(ProgresiveVerticalGap);
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(label3);
            settingsModal.appendChild(MaximumGenerationsInPast);
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(label4);
            settingsModal.appendChild(RepeatingRecipes);
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(label5);
            settingsModal.appendChild(ProgresiveVerticalGap);
            document.querySelector(".container").appendChild(settingsModal);
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(label6);
            settingsModal.appendChild(LinesColor);
            settingsModal.appendChild(document.createElement("br"));
            settingsModal.appendChild(document.createElement("br"));

            let saveButton = document.createElement("button");
            saveButton.classList.add("save-lineage-creator");
            saveButton.textContent = "Save changes";
            let closeButton = document.createElement("button");
            closeButton.textContent = " Cancel without saving";

            settingsModal.appendChild(saveButton);
            settingsModal.appendChild(closeButton);
            saveButton.addEventListener("click", () => {
                spacing = MinimalHorizontalGap.value;
                initialVerticalGap = VerticalGap.value;
                maximumGenerations = MaximumGenerationsInPast.value;
                lineColor = LinesColor.value;
                repeatingRecipes = RepeatingRecipes.checked;
                progressiveVerticalGap = ProgresiveVerticalGap.checked;

                settings = {
                    spacing: MinimalHorizontalGap.value,
                    initialVerticalGap: VerticalGap.value,
                    maximumGenerations: MaximumGenerationsInPast.value,
                    lineColor: LinesColor.value,
                    repeatingRecipes: RepeatingRecipes.checked,
                    progressiveVerticalGap: ProgresiveVerticalGap.checked,
                };

                localStorage.setItem("vizualizer-settings", JSON.stringify(settings));

                settingsModal.close();
            });
            closeButton.addEventListener("click", () => {
                lineColor = previousColor;
                translateLines(0, 0);

                settingsModal.close();
            });
        }
    }

    function elementToItem(element, modal) {
        let item = document.createElement("div");

        item.classList.add("item");
        const itemEmoji = document.createElement("span");
        itemEmoji.classList.add("item-emoji");
        itemEmoji.appendChild(document.createTextNode(element.emoji ?? "⬜"));

        item.appendChild(itemEmoji);
        item.appendChild(document.createTextNode(` ${element.text} `));
        item.style.display = "inline-block";
        item.addEventListener("mousedown", (e) => {
            //                if(modal)
            //                  {
            //                          let instances=unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances;
            //                          console.log(instances[instances.length-1])
            //                        let waitForInstance=  setInterval(()=>{
            //                                if(instances[instances.length-1].elem)
            //                                  {
            //                                          modal.appendChild(instances[instances.length-1].elem);
            //                                          clearInterval( waitForInstance);

            //                                  }

            //                          },

            //                          200)

            //                  }

            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].playInstanceSound();
        });
        return item;
    }

    function redrawBase(basisDiv) {
        basisDiv.innerHTML = "";
        for (let baseElm of base) {
            let elm = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((x) => x.text == baseElm);

            let item = elementToItem(elm);
            item.addEventListener("click", () => {
                base = base.filter((x) => x != elm.text);

                redrawBase(basisDiv);
            });

            console.log(elm);
            basisDiv.appendChild(item);
        }
    }

    let saveBase = [];
    
    function makeSetBasisModal() {
        let settingsModal = document.createElement("dialog");
        settingsModal.style.position = "absolute";
        settingsModal.style.top = ((window.innerHeight - 50) / 2).toString() + " px";
        settingsModal.style.left = ((3 * document.querySelector(".items").getBoundingClientRect().left) / 8).toString() + "px";
        settingsModal.style.backgroundColor = "var(--background-color)";
        settingsModal.style.color = "var(--text-color)";
        settingsModal.style.resize = "both";
        settingsModal.classList.add("bases-settings");
        settingsModal.style.width = (document.querySelector(".sidebar").getBoundingClientRect().left / 2).toString() + "px";
        settingsModal.style.height = window.innerHeight.toString() + "px";
        settingsModal.style.overflow = "hidden";
        let inventoryDiv = document.createElement("div");
        inventoryDiv.style.float = "left";
        inventoryDiv.style.width = "50%";
        inventoryDiv.style.height = "100%";
        inventoryDiv.style.overflowY = "scroll";

        let basisDiv = document.createElement("div");
        basisDiv.style.position = "sticky";
        basisDiv.style.borderColor = "white";
        basisDiv.style.float = "left";
        basisDiv.style.width = "50%";
        basisDiv.style.height = "100%";
        let searchDiv = document.createElement("div");
        let searchBar = document.createElement("input");
        searchBar.style.width = "50%";
        searchBar.style.height = "50px";
        searchBar.style.fontSize = "32px";

        let searchButton = document.createElement("button");
        searchDiv.appendChild(searchBar);
        searchDiv.appendChild(searchButton);
        searchButton.addEventListener("click", () => {
            inventoryDiv.innerHTML = "";

            console.log("value to filter from ", searchBar.value);
            let filtered = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.filter((x) => {
                let regex = "^" + searchBar.value + "*";

                if (searchBar.value.trim() == "") return true;

                return x.text.match(RegExp(regex)) != null && x.text.match(RegExp(regex)) == searchBar.value;
            });

            for (let element of filtered) {
                let item = elementToItem(element, settingsModal);
                inventoryDiv.appendChild(item);
                item.addEventListener("click", () => {
                    if (!base.includes(element.text)) {
                        base.push(element.text);

                        redrawBase(basisDiv);
                    }
                });
            }
        });

        searchButton.textContent = "🔍";

        searchButton.style.fontSize = "34px";

        inventoryDiv.style.borderColor = "white";
        for (let element of unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements) {
            let item = elementToItem(element, settingsModal);
            inventoryDiv.appendChild(item);
            item.addEventListener("click", () => {
                if (!base.includes(element.text)) {
                    base.push(element.text);
                    redrawBase(basisDiv);
                }
            });
        }

        redrawBase(basisDiv);

        let closeButton = document.createElement("button");
        closeButton.addEventListener("click", () => {
            base = saveBase;

            redrawBase(basisDiv);
            settingsModal.close();
        });
        closeButton.style.fontSize = "30px";
        closeButton.textContent = "❌";
        closeButton.style.float = "right";
        let saveButton = document.createElement("button");
        saveButton.addEventListener("click", () => {
            settingsModal.close();
        });
        saveButton.style.fontSize = "30px";
        saveButton.textContent = "💾";
        saveButton.style.float = "right";

        searchDiv.appendChild(saveButton);
        searchDiv.appendChild(closeButton);

        let Inventorytitle = document.createElement("span");
        Inventorytitle.textContent = "Inventory";
        Inventorytitle.style.fontSize = "32px";
        Inventorytitle.style.position = "absolute";
        Inventorytitle.style.left = "20%";
        let Basistitle = document.createElement("span");
        Basistitle.textContent = "Base elements";
        Basistitle.style.fontSize = "32px";
        Basistitle.style.position = "absolute";
        settingsModal.style.position = "relative";
        Basistitle.style.left = "66%";
        settingsModal.appendChild(searchDiv);
        settingsModal.appendChild(document.createElement("br"));
        settingsModal.appendChild(Inventorytitle);
        settingsModal.appendChild(Basistitle);

        settingsModal.appendChild(document.createElement("br"));
        settingsModal.appendChild(document.createElement("br"));
        settingsModal.appendChild(document.createElement("br"));
        settingsModal.appendChild(document.createElement("br"));
        settingsModal.appendChild(inventoryDiv);
        settingsModal.appendChild(basisDiv);
        document.querySelector(".container").appendChild(settingsModal);
        let ButtonDiv = document.createElement("div");
        let ButtonText = document.createElement("span");

        ButtonText.textContent = "Settings for Lineage Creator Basis";
        ButtonText.style.float = "left";
        ButtonDiv.appendChild(ButtonText);

        ButtonDiv.classList.add("setting");
        ButtonDiv.style.justifyContent = "flex-start";
        ButtonDiv.style.width = "50%";
        document.querySelector(".lineage-settings").insertBefore(ButtonDiv, document.querySelector(".save-lineage-creator"));

        ButtonDiv.addEventListener("click", () => {
            saveBase = [...base];
            settingsModal.showModal();
        });
    }

    function startingModal() {
        if (document.querySelector(".choose-target-lineage") != null) return;
        else {
            set = false;
            let startingDiv = document.createElement("div");
            startingDiv.classList.add("choose-target-lineage");
            startingDiv.style.position = "absolute";
            startingDiv.style.height = startingDiv.style.width = "300px";
            startingDiv.style.top = (window.innerHeight / 2 - 150).toString() + "px";
            startingDiv.style.left = (document.querySelector(".sidebar").getBoundingClientRect().left / 2 - 150).toString() + "px";
            startingDiv.style.borderColor = "white";
            startingDiv.style.zIndex = "1";
            startingDiv.style.border = "solid 3px var(--border-color)";
            startingDiv.style.transition = "background-color 1000ms linear";
            startingDiv.style.backgroundColor = "black";

            document.querySelector(".container").appendChild(startingDiv);

            let fileInput = document.createElement("input");
            fileInput.style.position = "absolute";
            fileInput.style.bottom = "0";
            fileInput.type = "file";
            fileInput.addEventListener("change", () => {
                var file = fileInput.files[0];

                if (file) {
                    var reader = new FileReader();
                    reader.readAsText(file, "UTF-8");
                    reader.onload = function (evt) {
                        let text = evt.target.result;
                        var lines = text.split("\n");

                        for (var line of lines) {
                            console.log(line);
                            batch.push(line.trim());
                        }
                        console.log("batch:", batch);
                        makeVisualLineage(batch[0]);
                    };
                }
            });
            startingDiv.appendChild(fileInput);
        }
    }
    
    let set = false;
    
    function AtIntersection(element1, element2) {
        console.log("intersection happends");
        if (element2 && !set) {
            const rect1 = element1.getBoundingClientRect();
            const rect2 = element2.getBoundingClientRect();

            if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
                if (element1.classList.contains("instance")) {
                    let instance = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances.find((x) => x.elem.id == element1.id);
                    let clone = element1.cloneNode(true);
                    let left = rect2.x + rect2.width / 2 - rect1.width / 2;
                    let top = rect2.y + rect2.height / 2 - rect1.height;
                    clone.style.translate = left + "px " + top + "px";
                    element2.appendChild(clone);
                    element2.style.borderStyle = "dotted";
                    element2.style.borderColor = "green";

                    unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].setInstancePosition(instance, rect1.x, rect2.y - 100);

                    set = true;
                    makeVisualLineage(instance.text);
                }
            }
        }
    }

    window.addEventListener("helper-load", () => {
        let treeImage = "data:image/png;base64,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";
        let img = document.createElement("img");
        img.src = treeImage;
        img.classList.add("random");
        img.addEventListener("click", startingModal);

        document.querySelector(".side-controls").append(img);

        const fn = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].clearInstances;
        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].clearInstances = () => {
            const context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            linePoints = [];
            lastAvailableX = [];
            fn();
        };

        let instancesObserver = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (mutation.removedNodes)
                    //  console.log("removedNodes:",mutation.removedNodes);
                    for (let node of mutation.removedNodes) {
                        if (!document.querySelector("#" + node.id)) deleteInstance(node.id);
                    }
                //  console.log("removedNodes:",mutation.removedNodes);
                for (let node of mutation.addedNodes) {
                    node.addEventListener("mouseup", (event) => {
                        console.log(event.clientX, event.clientY);

                        AtIntersection(node, document.querySelector(".choose-target-lineage"));
                    });
                }
                //translateLines(0,0);
            }
        });
        //|| node.className=="item instance instance-selected"

        instancesObserver.observe(document.querySelector(".instances"), {
            childList: true,
            subtree: true,
            attributeOldValue: true,
        });

        let container = document.querySelector(".container");
        let mouseData = {
            x: 0,
            y: 0,
            down: false,
        };
        container.addEventListener("mousedown", function (e) {
            if (e.ctrlKey) {
                mouseData.down = true;
                mouseData.x = e.pageX;
                mouseData.y = e.pageY;
            }
        });
        container.addEventListener("mouseup", function () {
            mouseData.down = false;
        });
        container.addEventListener("mousemove", function (e) {
            if (e.which === 1 && mouseData.down) {
                mouseData.deltaX = mouseData.x - e.pageX;
                mouseData.deltaY = mouseData.y - e.pageY;
                mouseData.x = e.pageX;
                mouseData.y = e.pageY;
                translateLines(-mouseData.deltaX, -mouseData.deltaY);
            }
        });

        canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.zIndex = "-5";
        canvas.style.position = "relative";
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        document.querySelector(".container").appendChild(canvas);
        makeModalWithSetting();

        let WaitForElements = setInterval(function () {
            console.log(unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data);

            if (unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.length > 0) {
                makeSetBasisModal();
                clearInterval(WaitForElements);
            }
        }, 200);
    }, false);
})();
