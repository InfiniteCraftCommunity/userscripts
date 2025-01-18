// ==UserScript==
// @name            Lineage Visualizer Choose Your Own Story
// @namespace       Violentmonkey Scripts
// @match           https://neal.fun/infinite-craft/*
// @grant           none
// @version         1.1.1
// @author          Alexander_Andercou, Mikarific
// @description     A visual tree builder from IC savefile using your own recipes
// ==/UserScript==

(function () {
    const delay = (delayInms) => {
        return new Promise((resolve) => setTimeout(resolve, delayInms));
    };

    let Recipes = null;
    let binaryTree = [];
    let tree = [];
    let connectionBoard = {};

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

    function addToTree(element, index, child) {
        binaryTree.push({ text: element, index: index, child: child });
        tree = [];
        connectionBoard = {};
        binaryTree = binaryTree.sort((a, b) => a.index - b.index);

        let binaryTreeCopy = [...binaryTree];

        console.log("BT:", binaryTreeCopy);

        let nrGen = -1;
        let generation = [binaryTreeCopy[0]];
        //rebuild tree to be drawned as before also build connectom
        tree.push(generation);

        do {
            nrGen++;
            let newGeneration = [];
            let j = -1;
            let addedIndex = 0;
            for (let el of generation) {
                j++;

                let indexp1 = 2 * el.index;
                let indexp2 = 2 * el.index + 1;

                console.log("indexes ps:", indexp1, indexp2);

                let p1 = binaryTreeCopy.find((x) => {
                    console.log(x, x.index);
                    return indexp1 == x.index;
                });
                let p2 = binaryTreeCopy.find((x) => {
                    console.log(x, x.index);
                    return indexp2 == x.index;
                });
                console.log("data:", el, p1, p2);

                if (p1 != null) {
                    newGeneration.push(p1);
                    binaryTreeCopy = binaryTreeCopy.filter((x) => x != p1);
                    connectionBoard[[nrGen, j]] == null ? (connectionBoard[[nrGen, j]] = [[nrGen + 1, addedIndex]]) : connectionBoard[[nrGen, j]].push([nrGen + 1, addedIndex]);
                    addedIndex++;
                }

                if (p2 != null) {
                    binaryTreeCopy = binaryTreeCopy.filter((x) => x != p2);
                    newGeneration.push(p2);
                    connectionBoard[[nrGen, j]] == null ? (connectionBoard[[nrGen, j]] = [[nrGen + 1, addedIndex]]) : connectionBoard[[nrGen, j]].push([nrGen + 1, addedIndex]);
                    addedIndex++;
                }
            }
            if (newGeneration.length > 0) {
                tree.push(newGeneration);
                generation = newGeneration;
            } else break;
        } while (binaryTreeCopy.length > 0);
    }

    function makeRecipeModal(elementText, index) {
        let myRecipes = Recipes[elementText];
        let dialog = document.createElement("dialog");
        dialog.style.backgroundColor = "var(--background-color)";
        dialog.style.color = "var(--text-color)";
        let cancelButton = document.createElement("button");
        cancelButton.addEventListener("click", () => {
            dialog.close();
        });
        cancelButton.textContent = "❌";
        cancelButton.style.float = "right";
        cancelButton.style.backgroundColor = "white";
        cancelButton.style.position = "sticky";
        cancelButton.style.top = "0";
        cancelButton.addEventListener("mouseover", () => {
            cancelButton.style.backgroundColor = "red";
        });
        cancelButton.addEventListener("mouseleave", () => {
            cancelButton.style.backgroundColor = "white";
        });
        dialog.appendChild(cancelButton);

        document.querySelector(".container").appendChild(dialog);
        for (let recipe of myRecipes) {
            let RecipeDiv = document.createElement("div");
            let createFirstElementDiv = document.createElement("div");
            let plusText = document.createTextNode("  +  ");
            let createSecondElementDiv = document.createElement("div");

            let firstElement = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((x) => x.text == recipe[0].text);
            let secondElement = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((x) => x.text == recipe[1].text);

            let emojiSpan1 = document.createElement("span");
            emojiSpan1.textContent = firstElement.emoji;
            let emojiSpan2 = document.createElement("span");
            emojiSpan2.textContent = secondElement.emoji;

            let textNode1 = document.createTextNode(firstElement.text);
            let textNode2 = document.createTextNode(secondElement.text);
            let textNodeCount = document.createTextNode(myRecipes.indexOf(recipe).toString() + ". ");
            RecipeDiv.style.backgroundColor = "var(--background-color)";

            createFirstElementDiv.appendChild(emojiSpan1);
            createFirstElementDiv.appendChild(textNode1);
            createSecondElementDiv.appendChild(emojiSpan2);
            createSecondElementDiv.appendChild(textNode2);
            createFirstElementDiv.style.display = "inline";
            createSecondElementDiv.style.display = "inline";

            RecipeDiv.appendChild(textNodeCount);
            RecipeDiv.appendChild(createFirstElementDiv);
            RecipeDiv.appendChild(plusText);
            RecipeDiv.appendChild(createSecondElementDiv);
            dialog.appendChild(RecipeDiv);
            RecipeDiv.addEventListener("click", () => {
                addToTree(firstElement.text, 2 * index, elementText);
                addToTree(secondElement.text, 2 * index + 1, elementText);
                dialog.close();
                console.log("Tree:", tree, connectionBoard);

                document.querySelector(".container").removeChild(dialog);
                document.querySelector(".clear").click();
                let waitClear = setInterval(() => {
                    if (document.querySelectorAll(".instance").length <= 1) {
                        drawTree();
                        clearInterval(waitClear);
                    }
                }, 1);
            });
            let beforeHover = RecipeDiv.style.backgroundColor;
            RecipeDiv.addEventListener("mouseover", () => {
                RecipeDiv.style.backgroundColor = "gray";
            });
            RecipeDiv.addEventListener("mouseleave", () => {
                RecipeDiv.style.backgroundColor = beforeHover;
            });
        }
        dialog.showModal();
    }

    let linePoints = [];
    let lineColor = "#fff";
    let base = ["Water", "Wind", "Fire", "Earth"];
    let batch = [];
    function deleteInstance(t) {
        console.log("DELETE");

        //based on id determine indexI,indexJ;
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
        console.log("MAKE LINE", x1, y1, x2, y2, lineColor);
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

    function spawnElement(element, x, y, id, index, callback, textColor = null) {
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
                        instanceDiv.addEventListener("click", (e) => {
                            if (e.which == 1) {
                                //display a modal with recipes , choose a recipe spawn the elements
                                makeRecipeModal(element.text, index);
                            }
                        });

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
        }

        //makeOneScreenshot(marginElement);
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
                        console.log("CHILDREN:", child);
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

                console.log("LINE POINTS:", linePoints);
                console.log(tree);
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

            return spawnElement(trueNode, node.x, y_newStart, id, node.index, nextSpawn(tree, fathers, y_newStart));
        };
    }

    function drawTree() {
        let fathers = connectionBoard;
        lastAvailableX = {};
        linePoints = [];

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
        savefile = await getSave().then((x) => x.json());
        Recipes = savefile["recipes"];
        binaryTree.push({ text: finalWord, index: 1 });

        try {
            document.querySelector(".choose-target-lineage").style.backgroundColor = "#6B492B";
            document.querySelector(".choose-target-lineage").style.borderColor = "green";
        } catch (e) {}
        await delay(2000);

        //drawTree();
        let bottom = window.innerHeight - 50;
        let leftmost = document.querySelector(".items").getBoundingClientRect().left;
        let x_start = leftmost / 2;
        let y_start = bottom - 50;
        let trueRoot = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((x) => x.text == finalWord);

        try {
            document.querySelector(".choose-target-lineage").parentNode.removeChild(document.querySelector(".choose-target-lineage"));
        } catch (e) {}

        let id = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instanceId++;

        spawnElement(trueRoot, x_start, y_start, id, 1, () => {});
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

    window.addEventListener("load", () => {
        let treeImage = "data:image/png;base64,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
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
        canvas.classList.add("Lines-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.zIndex = "-5";
        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
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
