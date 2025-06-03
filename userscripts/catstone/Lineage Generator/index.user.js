// ==UserScript==
// @name          Lineage Generator
// @namespace     Catstone
// @match         https://neal.fun/infinite-craft/*
// @version       2.0
// @author        Catstone
// @license       MIT
// @description   Generates pretty good lineages ingame!
// @downloadURL   https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/catstone/Lineage%20Generator/index.user.js
// @updateURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/catstone/Lineage%20Generator/index.user.js
// ==/UserScript==




(function() {
    'use strict';

    const o = {
        baseElementsString: ["Water", "Fire", "Wind", "Earth"],   // these get mapped to IDs later in the code.
        baseElements: undefined,  // ids

        recipesIngIC: new Map(),// "Water=Water" => "Lake"
        recipesResIC: [],       // "Lake" => ["Water", "Water"]
        recipesUsesIC: [],      // "Water" => ["Water", "Lake"]
        elementHeur: [],        // "Lake" => 1

        nonExistentIcCaseId: 0,
        icCasedLookup: [],
        elementIdToText: [],    // 1 => "Fire"
        elementTextToId: new Map(),  // "Fire" => 1
    };

    unsafeWindow.lineage = {
        vars: o,
    };



    unsafeWindow.addEventListener('load', () => {
        const v_container = document.querySelector(".container").__vue__;
        const addAPI = v_container.addAPI;
        v_container.addAPI = function() {
            // elements loaded!!!
            setTimeout(reloadGameData, 0);
            v_container.addAPI = addAPI;
            return addAPI.apply(this, arguments);
        }

        const switchSave = v_container.switchSave;
        v_container.switchSave = function() {
            loadDataAfterFinishLoading();
            return switchSave.apply(this, arguments);
        }

        const uploadSave = v_container.uploadSave;
        v_container.uploadSave = function() {
            loadDataAfterFinishLoading();
            return uploadSave.apply(this, arguments);
        }


        function loadDataAfterFinishLoading() {
            const intervalId = setInterval(() => {
                if (!v_container.isLoading) {
                    clearInterval(intervalId);
                    console.log("finished", IC.getItems());
                    reloadGameData();
                }
            }, 10)
        }


        // add helper recipeModal stuff
        if (unsafeWindow?.ICHelper?.recipeModalTabs) unsafeWindow.ICHelper.recipeModalTabs.set("lineages", {
        	  renderBody: helperRenderBody,
        	  renderFooter: helperRenderFooter
        });
        else alert('the newest version of Helper is required to display lineages ingame!');

        // listen for crafts
        const craft = v_container.craft;
        v_container.craft = async function() {
            const response = await craft.apply(this, arguments);
            setTimeout(() => {
                if (!response || !response.instance) return;
                addElement(response.instance.text, response.instance.id);

                const newRecipe = [arguments[0].itemId, arguments[1].itemId, response.instance.id];
                const newHeurForR = (o.elementHeur[newRecipe[0]] ?? Infinity) + (o.elementHeur[newRecipe[1]] ?? Infinity) + 1;
                if ((o.elementHeur[newRecipe[2]] ?? Infinity) > newHeurForR) {
                    o.elementHeur[newRecipe[2]] = newHeurForR;
                    // Now, propagate this change:
                    generateElementHeuristics([newRecipe[2]]);
                }
                addRecipe(...newRecipe);
            });
            return response;
        }
    });



    function reloadGameData() {
        o.recipesIngIC = new Map();
        o.recipesResIC = [];
        o.recipesUsesIC = [];
        o.elementHeur = [];
        o.nonExistentIcCaseId = 0;
        o.icCasedLookup = [];
        o.elementIdToText = [];
        o.elementTextToId = new Map();

        console.time('Load Data');
        const ICItems = unsafeWindow.IC.getItems();
        for (const element of ICItems) {
            addElement(element.text, element.id);
        }
        o.baseElements = o.baseElementsString.map(x => o.elementTextToId.get(x));
        o.nonExistentIcCaseId = ICItems.length + 20000;

        for (const element of ICItems) {
            for (const [fID, sID] of element?.recipes ?? []) {
                addRecipe(fID, sID, element.id, false);
            }
        }
        console.timeEnd('Load Data');

        console.time('Generate Heuristics');
        for (const baseElement of o.baseElements) o.elementHeur[baseElement] = 0;
        generateElementHeuristics(o.baseElements);
        console.timeEnd('Generate Heuristics');

        console.log('Variables generated: (window.lineage.vars)', o);
    }

    function addElement(text, id) {
        o.elementIdToText[id] = text;
        o.elementTextToId.set(text, id);
    }

    function addRecipe(f, s, r) {
        if (!Number.isInteger(f) || !Number.isInteger(s) || !Number.isInteger(r)) return;
        const F = icCase(f);
        const S = icCase(s);
        const R = icCase(r);
        if (F === R || S === R) return;

        const sortedFS = S > F ? [F, S] : [S, F];
        const combString = sortedFS.join('=');
        o.recipesIngIC.set(combString, r);

        pushToArrayArray(o.recipesResIC, R, sortedFS);
        pushToArrayArray(o.recipesUsesIC, F, [S, R]);
        if (F !== S) pushToArrayArray(o.recipesUsesIC, S, [F, R]);
    }


    const pushToArrayArray = (arr, key, value) => {
        let a = arr[key];
        if (!a) arr[key] = [value];
        else a.push(value);
    };





    function icCaseText(inputText) {
        let resultText = '';
        const len = inputText.length;
        for (let i = 0; i < len; i++) {
            resultText += (i === 0 || inputText[i - 1] === ' ') ? inputText[i].toUpperCase() : inputText[i].toLowerCase()
        }
        return resultText;
    }


    function icCase(inputId) {
        const mapOutput = o.icCasedLookup[inputId];
        if (mapOutput !== undefined) return mapOutput;

        const inputText = o.elementIdToText[inputId];
        const resultText = icCaseText(inputText);

        let resultId = o.elementTextToId.get(resultText);
        if (resultId === undefined) {
            // example: it is `End Of Sentence` but the user only has `End of Sentence`...
            resultId = o.nonExistentIcCaseId++;
            addElement(resultText, resultId);
        }
        o.icCasedLookup[inputId] = resultId;
        return resultId;
    };







    unsafeWindow.lineage = async function (...goals) {
        goals = goals.map(goal => {
            const goalId = o.elementTextToId.get(icCaseText(goal));
            if (goalId === undefined) throw new Error(`${goal} is not in your save...`);
            return goalId;
        });
        for (const _ of generateLineageMultipleMethods(goals)) {}
    };
    unsafeWindow.lineage['vars'] = o;




    function* generateLineageMultipleMethods(goals) {
        const lineageGenerators = {
            'Simple':         () => generateLineage(goals),
            'Normal Recalc':  () => generateLineage(goals, 1),
            'Reverse Recalc': () => generateLineage(goals, 2),
            'Min Recalc':     () => generateLineage(goals, 3),
            'Max Recalc':     () => generateLineage(goals, 4),
            'Random Recalc':  () => generateLineage(goals, 5),
        };

        // Now iterate through the generators and run them
        for (const [methodName, generateFunc] of Object.entries(lineageGenerators)) {
            console.time(methodName);
            const { lineage, missingElements } = generateFunc();

            const groupName = [`%c${methodName}:`, 'background:green; color:white', `${lineage.length}-step`];
            console.groupCollapsed(...groupName);
            console.log(lineageToText(lineage, goals));
            console.timeEnd(methodName);
            console.groupEnd();

            yield { lineage, methodName, missingElements };
        }
    }






    function lineageToText(lineage, goals) {
        return lineage.map((recipe, i) => {
            const [first, second] = [o.elementIdToText[recipe[0]], o.elementIdToText[recipe[1]]].sort();
            const result = o.elementIdToText[recipe[2]];
            return `${first} + ${second} = ${result}` + (goals.includes(icCase(recipe[2])) ? `  // ${i + 1}` : '');
        }).join('\n');
    }










    function generateElementHeuristics(startElements, heurMap=o.elementHeur, end=Infinity) {
        const pq = new PriorityQueue((a, b) => b[0] > a[0]);

        for (const startElement of startElements) {
            const heur = heurMap[startElement];
            if (heur === undefined) throw new Error(`${startElement} does not have a heur.`);
            pq.push([heur, startElement]);
        }

        while (!pq.isEmpty()) {
            const [elementHeur, element] = pq.pop();
            if ((heurMap[element] ?? Infinity) < elementHeur) continue;

            for (const [other, result] of (o.recipesUsesIC[element] ?? [])) {

                const otherHeur = element === other ? 0 : heurMap[other];
                if (otherHeur === undefined) continue;

                const newHeur = elementHeur + otherHeur + 1;
                if (newHeur > end) continue;

                const resultHeur = heurMap[result] ?? Infinity;
                if (resultHeur > newHeur) {
                    heurMap[result] = newHeur;
                    pq.push([newHeur, result]);
                }
            }
        }
    }




    function findBestRecipeHeur(recipesArr, heurMap=o.elementHeur) {
        let bestMax = Infinity, bestMin = Infinity, bestRecipe = recipesArr[0];

        for (const recipe of recipesArr) {
            const [f, s] = recipe;
            let fh = heurMap[f] ?? Infinity;
            let sh = f === s ? 0 : (heurMap[s] ?? Infinity);

            if (fh < sh) [fh, sh] = [sh, fh];

            if (fh < bestMax  ||  (fh === bestMax && sh < bestMin)) {
                bestMax = fh;
                bestMin = sh;
                bestRecipe = recipe;
            }
        }
        return bestRecipe;
    }





    function generateLineage(goals, recalc=false, depth=0) {
        const elementQueue = [...goals];
        const crafted = new Set();
        const visitedLastPath = new Map();  // for invalid lineages with infinite loops
        const heurMap = [...o.elementHeur];
        const lineage = [];

        while (elementQueue.length > 0) {
            const element = elementQueue.pop();
            if (crafted.has(element)) continue;

            const elementRecipesArr = o.recipesResIC[element];
            if (elementRecipesArr === undefined) {
                // no recipe found, add as missing
                crafted.add(element);
                continue;
            }
            let bestRecipe = findBestRecipeHeur(elementRecipesArr, heurMap);

            if (recalc === 2) bestRecipe = [bestRecipe[1], bestRecipe[0]];
            else if (recalc === 3 && heurMap[bestRecipe[0]] > heurMap[bestRecipe[1]]) bestRecipe = [bestRecipe[1], bestRecipe[0]];
            else if (recalc === 4 && heurMap[bestRecipe[0]] < heurMap[bestRecipe[1]]) bestRecipe = [bestRecipe[1], bestRecipe[0]];
            else if (recalc === 5 && Math.round(Math.random())) bestRecipe = [bestRecipe[1], bestRecipe[0]];

            let neededIng;
            for (const ing of bestRecipe) {
                if (!o.baseElements.includes(ing) && !crafted.has(ing)) {
                    neededIng = ing;
                    break;
                }
            }

            if (neededIng !== undefined) {
                // still missing stuff to craft element...
                if (visitedLastPath.get(element) === neededIng) {
                    // infinite loop, add as missing
                    crafted.add(neededIng);
                    continue;
                }
                elementQueue.push(element, neededIng);
                visitedLastPath.set(element, neededIng);
            }
            else {
                // can add element!
                lineage.push([...bestRecipe, element]);
                crafted.add(element);
                heurMap[element] = 0;

                if (recalc && elementQueue.length > 0) {
                    const worst = elementQueue.reduce((best, el) => {
                        const heur = heurMap[el];
                        return heur > best.heur ? { element: el, heur } : best;
                    }, { element: undefined, heur: -Infinity });
                    generateElementHeuristics([element], heurMap, worst.heur);
                }
            }
        }
        return correctlyCapsAndOrderLineage(removeUnnecessary(lineage, goals), goals);
    }




    function removeUnnecessary(lineage, goals) {
        const resultIngMap = new Map(lineage.map(recipe => [recipe[2], [recipe[0], recipe[1]]]));
        const usedMap = new Map(lineage.map(recipe => [recipe[2], new Set()]));
        for (const [f, s, r] of lineage) {
            if (!o.baseElements.includes(f)) usedMap.get(f)?.add(r);
            if (!o.baseElements.includes(s)) usedMap.get(s)?.add(r);
        }

        for (let i = lineage.length - 1; i >= 0; i--) {
            const [f, s, r] = lineage[i];
            if (goals.includes(r)) continue;
            // try to remove recipe step by rerouting other recipes

            const blacklist = getBlacklistRU(r, usedMap);
            const changes = [];

            let removeable = true;
            for (const use of usedMap.get(r)) {
                const replacementRecipe = o.recipesResIC[use].find(([newF, newS]) =>
                    (o.baseElements.includes(newF) || (resultIngMap.has(newF) && !blacklist.has(newF)))
                 && (o.baseElements.includes(newS) || (resultIngMap.has(newS) && !blacklist.has(newS)))
                );
                if (replacementRecipe) changes.push([use, replacementRecipe]);
                else {
                    removeable = false;
                    break;
                }
            }
            if (removeable) {
                // we can remove r!!
                switchRecipeRU(r, undefined, resultIngMap, usedMap);
                for (const [changeR, changeIngs] of changes) {
                    switchRecipeRU(changeR, changeIngs, resultIngMap, usedMap);
                }
            }
        }

        return [...resultIngMap.entries()].map(([result, ings]) => [ings[0], ings[1], result]);
    }






    function getBlacklistRU(element, usedMap) {
        const blacklist = new Set([element]);
        for (const blackElement of blacklist) {
            for (const use of usedMap.get(blackElement)) {
                blacklist.add(use);
            }
        }
        return blacklist;
    }
    function switchRecipeRU(result, newRecipe, resultIngMap, usedMap) {
        const originalRecipe = resultIngMap.get(result);
        for (const x of originalRecipe) if (!o.baseElements.includes(x)) usedMap.get(x)?.delete(result);

        if (!newRecipe) resultIngMap.delete(result);
        else {
            resultIngMap.set(result, newRecipe);
            for (const x of newRecipe) if (!o.baseElements.includes(x)) usedMap.get(x).add(result);
        }
    }








    function correctlyCapsAndOrderLineage(lineage, goals) {
        const resultIngMap = new Map(lineage.map(recipe => [recipe[2], [recipe[0], recipe[1]]]));
        const elementQueue = [...goals];
        const crafted = new Set();
        const capsMap = new Map();
        const missingElements = [];
        const newLineage = [];

        while (elementQueue.length > 0) {
            const element = elementQueue.pop();
            if (crafted.has(element)) continue;

            const recipe = resultIngMap.get(element);
            if (recipe === undefined) {
                crafted.add(element);
                missingElements.push(element);
                continue;
            }
            let neededIngs = [];
            for (const ing of recipe) {
                if (!o.baseElements.includes(ing) && !crafted.has(ing)) {
                    neededIngs.push(ing);
                }
            }
            if (neededIngs.length === 0) {
                crafted.add(element);

                const actualResult = o.recipesIngIC.get([recipe[0], recipe[1]].sort((a, b) => a - b).join('='));
                capsMap.set(element, actualResult);
                const newRecipe = [recipe[0], recipe[1], element].map(x => capsMap.get(x) ?? x);
                if (o.elementIdToText[newRecipe[0]] > o.elementIdToText[newRecipe[1]]) {
                    [newRecipe[0], newRecipe[1]] = [newRecipe[1], newRecipe[0]];
                }
                newLineage.push(newRecipe);
            }
            else elementQueue.push(element, ...neededIngs);
        }
        return { lineage: newLineage, missingElements };
    }








    function helperRenderFooter(container, item) {
        container.appendChild(document.createTextNode(`Lineage`));
    }

    async function helperRenderBody(container, item) {
        const goalId = icCase(o.elementTextToId.get(item.text))
        if (goalId === undefined) {
            container.appendChild(document.createTextNode(`${item.text} is not in your save...`));
            return container;
        }

        let goals = [goalId];
        let startTime, generator, lineage, methodName, missingElements;


        const goalsContainerContainerDiv = document.createElement("div");
        goalsContainerContainerDiv.classList.add("lineage-goals-container-container");
        const goalsContainerDiv = document.createElement("div");
        goalsContainerDiv.classList.add("lineage-goals-container");
        const addGoalInput = document.createElement("input");
        addGoalInput.type = "text";
        addGoalInput.classList.add("lineage-goals-input");
        addGoalInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                processNewGoalElements([addGoalInput.value]);
            }
        });
        addGoalInput.addEventListener('paste', (event) => {
            const clipboardText = (event.clipboardData || unsafeWindow.clipboardData).getData('text');
            if (clipboardText) {
                processNewGoalElements(clipboardText.split('\n'));
                event.preventDefault();
            }
        });
        goalsContainerContainerDiv.append(goalsContainerDiv, addGoalInput);


        const lineageHeaderDiv = document.createElement("div");
        lineageHeaderDiv.classList.add("lineage-header");

        const lineageTitle = document.createTextNode('');

        const copyButton = document.createElement("button");
        copyButton.type = "button";
        copyButton.classList.add("lineage-action-button");
        copyButton.textContent = "Copy";
        let copyResetTimeout;
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(lineageToText(lineage, goals)).then(() => {
                copyButton.style.borderColor = 'lime';
                clearTimeout(copyResetTimeout);
                copyResetTimeout = setTimeout(() => {  // revert to original
                    copyButton.style.borderColor = '';
                }, 500);
            }).catch(err => alert('Failed to copy lineage.'));
        });

        const optimiseButton = document.createElement("button");
        optimiseButton.type = "button";
        optimiseButton.classList.add("lineage-action-button");
        optimiseButton.textContent = "Optimise";
        optimiseButton.addEventListener('click', async () => {
            optimiseButton.style.pointerEvents = 'none';
            optimiseButton.style.transition = 'none';
            optimiseButton.style.borderColor = 'cyan';

            startTime = performance.now();
            let methodIndex = 0;
            optimiseButton.textContent = `Optimising... (${methodIndex++}/5)`;
            // small delay to let the UI update
            await new Promise(resolve => setTimeout(resolve, 0));

            for (const { lineage: newLineage, methodName: newMethodName, missingElements: newMissingElements } of generator) {
                if (newLineage.length < lineage.length || (newLineage.length === lineage.length && newMissingElements.length < missingElements.length)) {
                    lineage = newLineage;
                    methodName = newMethodName;
                    missingElements = newMissingElements;
                    drawLineage();
                }
                optimiseButton.textContent = `Optimising... (${methodIndex++}/5)`;
                updateHeaderStatText();
                await new Promise(resolve => setTimeout(resolve, 0));
                if (!document.querySelector('.recipe-modal').open) return;
            }
            optimiseButton.textContent = 'Optimised';
            optimiseButton.style.opacity = '0.2';
            optimiseButton.style.transition = '';
            optimiseButton.style.borderColor = '';
        });

        lineageHeaderDiv.append(lineageTitle, optimiseButton, copyButton);


        const lineageBodyDiv = document.createElement("div");
        lineageBodyDiv.classList.add("lineage-body");
        container.append(goalsContainerContainerDiv, lineageHeaderDiv, lineageBodyDiv);

        drawGoals();
        initializeLineage();


        function processNewGoalElements(newGoals) {
            let update = false;
            for (const newGoal of newGoals) {
                const icGoalText = icCaseText(newGoal.trim());
                const newItemId = o.elementTextToId.get(icGoalText);
                if (newItemId !== undefined && !goals.includes(newItemId)) {
                    goals.push(newItemId);
                    update = true;
                }
            }
            if (update) {
                addGoalInput.value = '';
                drawGoals();
                initializeLineage();
            }
        }

        function drawGoals() {
            goalsContainerDiv.innerHTML = '';
            goals.forEach((goalId, index) => {
                const goalItem = getElementCaps(goalId);
                const goalItemElement = unsafeWindow.ICHelper.createItemElement(goalItem);
                goalItemElement.classList.add('lineage-goal');

                goalItemElement.dataset.goalId = goalId; // Store goalId for easy access
                goalItemElement.dataset.index = index;   // Store original index
                goalItemElement.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopImmediatePropagation();

                    goals.splice(e.target.dataset.index, 1);
                    drawGoals();
                    initializeLineage();
                }, true);

                // prevent helper behaviour
                goalItemElement.addEventListener('mousedown', (e) => e.stopImmediatePropagation(), true);

                goalItemElement.draggable = true;
                goalItemElement.addEventListener('dragstart', (event) => {
                    event.dataTransfer.setData('text/plain', goalId);
                    event.dataTransfer.setData('sourceIndex', index);
                    event.target.classList.add('dragging');
                    setTimeout(() => event.target.style.visibility = 'hidden', 0);
                });

                goalItemElement.addEventListener('dragend', (event) => {
                    event.target.classList.remove('dragging');
                    event.target.style.visibility = 'visible';
                    document.querySelectorAll('.lineage-goal-item.drag-over').forEach(el => el.classList.remove('drag-over'));
                });

                // --- Handle as a drop target (for reordering) ---
                goalItemElement.addEventListener('dragover', (event) => {
                    event.preventDefault(); // Necessary to allow dropping
                    event.dataTransfer.dropEffect = 'move';
                    // Add visual feedback for where it would drop
                    const draggingElementIndex = parseInt(event.dataTransfer.getData('sourceIndex'), 10);
                    if (index !== draggingElementIndex) { // Don't highlight if dragging over itself
                        event.target.classList.add('drag-over');
                    }
                });

                goalItemElement.addEventListener('dragleave', (event) => {
                    event.target.classList.remove('drag-over');
                });

                goalItemElement.addEventListener('drop', (event) => {
                    event.preventDefault();
                    event.target.classList.remove('drag-over');
                    const draggedGoalId = event.dataTransfer.getData('text/plain');
                    const sourceIndex = parseInt(event.dataTransfer.getData('sourceIndex'), 10);
                    const targetIndex = index;

                    if (sourceIndex !== targetIndex) {
                        // Reorder the `goals` array
                        const [movedItem] = goals.splice(sourceIndex, 1); // Remove item from old position
                        goals.splice(targetIndex, 0, movedItem);      // Insert item at new position
                        drawGoals();
                        initializeLineage();
                    }
                });

                goalsContainerDiv.append(goalItemElement);
            });
            addGoalInput.placeholder = `Add goal... (${goals.length})`;
        }

        function initializeLineage() {
            startTime = performance.now();
            generator = generateLineageMultipleMethods(goals);
            const result = (generator.next()).value;
            lineage = result.lineage;
            methodName = result.methodName;
            missingElements = result.missingElements;
            updateHeaderStatText();
            drawLineage();
            optimiseButton.textContent = 'Optimise';
            optimiseButton.style.opacity = '';
            optimiseButton.style.pointerEvents = '';
        }


        function getElementCaps(itemId) {
            let item = unsafeWindow.ICHelper.idMap.get(itemId);
            if (item) return item;
            // example: it is `End Of Sentence` but the user only has `End of Sentence`...
            const itemLowerText = o.elementIdToText[itemId].toLowerCase();
            return unsafeWindow.IC.getItems().find(x => x.text.toLowerCase() === itemLowerText);
        }


        function drawLineage() {
            lineageBodyDiv.innerHTML = '';

            if (missingElements.length > 0) {
                const missingContainerContainerDiv = document.createElement("div");
                missingContainerContainerDiv.classList.add("lineage-missing-container-container");
                const missingContaierDiv = document.createElement("div");
                missingContaierDiv.classList.add("lineage-missing-container");
                for (const missingElement of missingElements) {
                    const missingItem = getElementCaps(missingElement);
                    const missingItemElement = unsafeWindow.ICHelper.createItemElement(missingItem);
                    missingItemElement.classList.add('lineage-missing');
                    missingContaierDiv.append(missingItemElement);
                }
                missingContainerContainerDiv.append(document.createTextNode("Missing:"), missingContaierDiv)
                lineageBodyDiv.append(missingContainerContainerDiv);
            }

            lineage.forEach((r, step) => {
                const recipe = document.createElement("div");
	              recipe.classList.add("recipe");
	              const [first, second, result] = r.map(x => unsafeWindow.ICHelper.idMap.get(x));
	              if (!first || !second || !result) console.warn("Invalid recipe for " + r.map(x => o.elementIdToText[x]), r);
                else {
                    const stepNumberSpan = document.createElement("span");
                    stepNumberSpan.classList.add("recipe-step-number");
                    stepNumberSpan.textContent = `${step + 1}.`;

                    const firstItemElement = unsafeWindow.ICHelper.createItemElement(first);
                    const secondItemElement = unsafeWindow.ICHelper.createItemElement(second);
                    const resultItemElement = unsafeWindow.ICHelper.createItemElement(result);
                    if (missingElements.includes(icCase(first.id))) firstItemElement.classList.add('lineage-missing');
                    if (missingElements.includes(icCase(second.id))) secondItemElement.classList.add('lineage-missing');
                    if (missingElements.includes(icCase(result.id))) resultItemElement.classList.add('lineage-missing');
                    else if (goals.includes(icCase(result.id))) resultItemElement.classList.add('lineage-goal');

	                  recipe.append(
	                  	  stepNumberSpan,
	                  	  firstItemElement,
	                  	  document.createTextNode("+"),
	                  	  secondItemElement,
	                  	  document.createTextNode("→"),
	                  	  resultItemElement
	                  );
	                  lineageBodyDiv.append(recipe);
                }
            });
        }
        function updateHeaderStatText() {
            lineageTitle.textContent = `${methodName} - ${lineage.length} Steps (${((performance.now() - startTime) / 1000).toFixed(3)} s)`;
        }
	      return container;
    }









// PriorityQueue (from stackoverflow)
const pqTop = 0;
const pqParent = i => ((i + 1) >>> 1) - 1;
const pqLeft = i => (i << 1) + 1;
const pqRight = i => (i + 1) << 1;

class PriorityQueue {
  constructor(comparator = (a, b) => a > b) {
    this._heap = [];
    this._comparator = comparator;
  }
  size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size() == 0;
  }
  peek() {
    return this._heap[pqTop];
  }
  push(...values) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > pqTop) {
      this._swap(pqTop, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value) {
    const replacedValue = this.peek();
    this._heap[pqTop] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > pqTop && this._greater(node, pqParent(node))) {
      this._swap(node, pqParent(node));
      node = pqParent(node);
    }
  }
  _siftDown() {
    let node = pqTop;
    while (
      (pqLeft(node) < this.size() && this._greater(pqLeft(node), node)) ||
      (pqRight(node) < this.size() && this._greater(pqRight(node), node))
    ) {
      let maxChild = (pqRight(node) < this.size() && this._greater(pqRight(node), pqLeft(node))) ? pqRight(node) : pqLeft(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}


const css = `
.recipe-modal-body .recipe-modal-body-inner[data-tab-id=lineages] {
	display: grid;
	padding: 12px 0px 12px 24px;
  overflow: hidden;
  grid-template-rows: auto 1fr;
}

.lineage-goals-container-container {
  display: flex;
  margin-bottom: 5px;
}
.lineage-goals-container {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: auto;
  max-width: 70vw;
}
.lineage-goals-container .item {
  overflow: visible;
}
.lineage-goals-container .item .dragging {
    opacity: 0.5;
}
.lineage-goals-container .item .drag-over {
    outline: 10px dashed var(--accent-color, cyan);
    outline-offset: -2px;
    background-color: color-mix(in oklab, var(--item-background-color, #333), var(--accent-color, cyan) 10%);
}

.lineage-goals-input {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  color: var(--text-color);
  border-radius: 4px;
  font-size: 0.9em;
  margin: 8px;
}


.lineage-missing-container-container {
  display: flex;
  flex-direction: column;
  background-color: brown;
  border-radius: 5px;
  padding: 5px;
}
.lineage-missing-container {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: auto;
  max-width: 70vw;
}
.lineage-missing-container .item {
  overflow: visible;
}



.recipe-modal-body-inner .lineage-body {
  display: grid;
	gap: 8px;
	overflow: auto;
	padding-top: 12px;
	padding-right: 12px;
	padding-bottom: 12px;
  max-height: 70vh;
  position: relative;
  /* fade effect ;p */
  -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 20px,
      black calc(100% - 20px),
      transparent 100%
  );
  mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 20px,
      black calc(100% - 20px),
      transparent 100%
  );
}
.recipe-modal-body-inner .lineage-body .recipe {
	display: flex;
	gap: 6px;
	align-items: center;
}
.recipe-step-number {
  display: inline-block;
  min-width: 3.5ch;
  text-align: right;
}
.recipe-modal-body-inner .item.lineage-goal {
  border-color: gold; !important
}
.recipe-modal-body-inner .item.lineage-missing {
  border-color: crimson; !important
}




.lineage-header {
    display: flex;
    align-items: center;
    color: var(--text-color);
}

.lineage-action-button {
    display: grid;
    place-content: center;
    background-color: transparent;
    border: 3px solid var(--border-color);
    border-radius: 5px;
    padding: 5px;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    margin-left: 8px;
}

.lineage-action-button:hover {
    background-color: color-mix(in oklab, var(--background-color), var(--text-color) 5%);
    border-color: color-mix(in oklab, var(--border-color), var(--text-color) 30%);
}

.lineage-action-button:active {
    background-color: color-mix(in oklab, var(--background-color), var(--text-color) 50%);
}
`;

const styleElement = document.createElement("style");
styleElement.type = "text/css"; // Good practice, though often inferred
styleElement.textContent = css.trim(); // Or innerText
document.head.appendChild(styleElement);

})();
