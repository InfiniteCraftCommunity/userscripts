// ==UserScript==
// @name          Lineage Generator
// @namespace     Catstone
// @match         https://neal.fun/infinite-craft/*
// @grant         GM_setValue
// @grant         GM_getValue
// @version       2.4
// @author        Catstone
// @license       MIT
// @description   Generates pretty damn good lineages ingame!
// @downloadURL   https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/catstone/Lineage%20Generator/index.user.js
// @updateURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/catstone/Lineage%20Generator/index.user.js
// ==/UserScript==




(function() {
    'use strict';

    const o = {
        baseElementsString: ["Water", "Fire", "Wind", "Earth"],
        baseElementsId: null,  // gets updated in `reloadGameData`

        recipesIngIC: new Map(),// "Waterid=Waterid" => "Lakeid"
        recipesResIC: [],       // "Lakeid" => ["Waterid", "Waterid"]
        recipesUsesIC: [],      // "Waterid" => ["Waterid", "Lakeid"]
        elementHeur: [],        // "Lakeid" => 1

        icCasedLookup: [],
        elementIdToText: [],           // 1 => "Fire"
        elementTextToId: new Map(),    // "Fire" => 1
        icTextToCanonicalId: new Map(),// "Abc" => "ABC_id" (because the person doesn't have "Abc" in their save)
    };

    unsafeWindow.lineage = {
        refresh: reloadGameData,
        make: consoleMakeLineage,
        vars: o,
        icCaseText, canonilizeId,
        verify: verifyLineage, missing: alertOnMissingRecipes,
        toArray: textLineageToArray, toString: textArrayLineageToString,
        idLineageToText, idToMostlyNealCase,
        internal: {
            findBestRecipeHeur, generateElementHeuristics, generateLineage,
            removeUnnecessary, correctlyCapsAndOrderLineage,
        }
    };

    const alphabet = [
      ["Water", "Earth", "Plant"], ["Earth", "Plant", "Tree"], ["Water", "Tree", "River"], ["Earth", "River", "Delta"],
      ["Tree", "River", "Paper"], ["Paper", "Paper", "Book"], ["Book", "Delta", "Alphabet"]
    ];
    const punc = [
      ...alphabet, ["Alphabet", "Alphabet", "Word"], ["Word", "Word", "Sentence"], ["Wind", "Sentence", "Phrase"],
      ["Book", "Phrase", "Quote"], ["Alphabet", "Quote", "Punctuation"]
    ];
    const alphabetSoup = [
      ...punc, ["Punctuation", "Quote", "Apostrophe"], ["Apostrophe", "Quote", "Quotation Mark"],
      ["Fire", "Alphabet", "Alphabet Soup"], ["Alphabet Soup", "Quotation Mark", "\"Alphabet Soup\""]
    ];
    const rip = [
      ...alphabetSoup, ["Word", "Wind", "Whisper"], ["Earth", "Whisper", "Grave"], ["\"Alphabet Soup\"", "Grave", "\"R.I.P.\""]
    ];
    const defaultPresets = [
        { name: "Alphabet", goals: ["Alphabet"], required: alphabet },
        { name: "Punctuation", goals: ["Punctuation", "Quote", "Alphabet"], required: punc },
        { name: "\"Alphabet Soup\"", goals: ["\"Alphabet Soup\"", "Punctuation", "Quote", "Alphabet"], required: alphabetSoup },
        { name: "\"R.I.P\"", goals: ["\"R.I.P.\"", "\"Alphabet Soup\"", "Punctuation", "Quote", "Alphabet"], required: rip },
    ];



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
                    console.log("finished", unsafeWindow.IC.getItems());
                    reloadGameData();
                }
            }, 10)
        }

        // add helper recipeModal stuff
        if (unsafeWindow?.ICHelper?.recipeModalTabs) unsafeWindow.ICHelper.recipeModalTabs.set("lineages", {
        	renderBody: helperRenderBody,
        	renderFooter: helperRenderFooter
        });
        else alert('Lineage Generator\nThe newest version of Helper is required to display lineages ingame!');

        // listen for crafts
        const craft = v_container.craft;
        v_container.craft = async function() {
            const response = await craft.apply(this, arguments);
            setTimeout(() => {
                if (!response || !response.instance) return;
                addElement(response.instance.text, response.instance.id);
                const icF = canonilizeId(arguments[0].itemId);
                const icS = canonilizeId(arguments[1].itemId);
                const icR = canonilizeId(response.instance.id);
                if (icF === icR || icS === icR) return;
                if (icF === undefined || icS === undefined || icR === undefined) return console.log("could not add recipe?", icF, icR, icS);
                addRecipe(icF, icS, icR, response.instance.id);
                // console.log("added:", o.elementIdToText[icF], o.elementIdToText[icS], o.elementIdToText[response.instance.id]);

                const newHeurForR = (o.elementHeur[icF] ?? Infinity) + (o.elementHeur[icS] ?? Infinity) + 1;
                if ((o.elementHeur[icR] ?? Infinity) > newHeurForR) {
                    o.elementHeur[icR] = newHeurForR;
                    generateElementHeuristics([icR]);
                }
            });
            return response;
        }

        // this event listener was added before helpers listener, so it also registers stuff earlier MUhaHAHAHAHA
        unsafeWindow.addEventListener('contextmenu', (e) => {
            if (!e.target || !e.target.closest) return;
            const goalItem = e.target.closest('.lineage-goals-container .lineage-goal');
            if (goalItem) {
                e.preventDefault();
                e.stopImmediatePropagation();
                goalItem.dispatchEvent(new Event('remove-goal'));
            }
        }, true);
    });



    function reloadGameData() {
        o.recipesIngIC = new Map();
        o.recipesResIC = [];
        o.recipesUsesIC = [];
        o.elementHeur = [];
        o.icCasedLookup = [];
        o.elementIdToText = [];
        o.elementTextToId = new Map();
        o.icTextToCanonicalId = new Map();

        console.time('Load Data');
        const ICItems = unsafeWindow.IC.getItems();
        for (const element of ICItems) {
            addElement(element.text, element.id);
        }
        o.baseElementsId = o.baseElementsString.map(x => o.icTextToCanonicalId.get(x));
        const cacheRecipes = [];

        for (const element of ICItems) {
            const recipes = element.recipes;
            if (!recipes) continue;
            const R = canonilizeId(element.id);

            const amazingIng = new Set();
            for (let i = 0; i < recipes.length; i++) {
                const F = canonilizeId(recipes[i][0]);
                const S = canonilizeId(recipes[i][1]);
                cacheRecipes[i*2] = F;
                cacheRecipes[i*2 + 1] = S;
                if (F === R || S === R) continue;
                if (F === S || o.baseElementsId.includes(S)) amazingIng.add(F);
                if (F === S || o.baseElementsId.includes(F)) amazingIng.add(S);
            }
            const fulfilled = new Set();
            for (let i = 0; i < recipes.length; i++) {
                const F = canonilizeId(recipes[i][0]);
                const S = canonilizeId(recipes[i][1]);
                if (F === R || S === R) continue;
                const freeF = F === S || o.baseElementsId.includes(S);
                const freeS = F === S || o.baseElementsId.includes(F);

                if (amazingIng.has(F) && (!freeF || fulfilled.has(F))
                 || amazingIng.has(S) && (!freeS || fulfilled.has(S))) continue;

                if (freeF) fulfilled.add(F);
                if (freeS) fulfilled.add(S);

                addRecipe(F, S, R, element.id);
            }
        }
        console.timeEnd('Load Data');

        console.time('Generate Heuristics');
        for (const baseElement of o.baseElementsId) o.elementHeur[baseElement] = 0;
        generateElementHeuristics(o.baseElementsId);
        console.timeEnd('Generate Heuristics');

        console.log('Variables generated: (window.lineage.vars)', o);
    }

    function addElement(text, id) {
        o.elementIdToText[id] = text;
        o.elementTextToId.set(text, id);
        const canonicalText = icCaseText(text);
        if (!o.icTextToCanonicalId.has(canonicalText)) {
            o.icTextToCanonicalId.set(canonicalText, id);
        }
    }

    function addRecipe(F, S, R, r) {
        const sortedFS = S > F ? [F, S] : [S, F];
        const combString = sortedFS.join('=');
        if (o.recipesIngIC.get(combString) === r) return;
        o.recipesIngIC.set(combString, r);

        pushToArrayArray(o.recipesResIC, R, sortedFS);
        pushToArrayArray(o.recipesUsesIC, F, [S, R]);
        if (F !== S) pushToArrayArray(o.recipesUsesIC, S, [F, R]);
    }
    function pushToArrayArray(arr, key, value) {
        let entry = arr[key];
        if (!entry) arr[key] = [value];
        else entry.push(value);
    }
    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }



    function icCaseText(inputText) {
        if (!inputText) return undefined;

        let resultText = '';
        const len = inputText.length;
        for (let i = 0; i < len; i++) {
            resultText += (i === 0 || inputText[i - 1] === ' ') ? inputText[i].toUpperCase() : inputText[i].toLowerCase()
        }
        return resultText;
    }
    function canonilizeId(inputId) {
        if (typeof inputId !== "number") return;

        const mapOutput = o.icCasedLookup[inputId];
        if (mapOutput !== undefined) return mapOutput;

        const inputText = o.elementIdToText[inputId];
        const icText = icCaseText(inputText);
        const canonicalId = o.icTextToCanonicalId.get(icText);

        o.icCasedLookup[inputId] = canonicalId;
        return canonicalId;
    }





    function isLineageBetter(bestLineage, lineage) {
        return !bestLineage
            || lineage.lineage.length < bestLineage.lineage.length  && lineage.missingElements.length <= bestLineage.missingElements.length
            || lineage.lineage.length === bestLineage.lineage.length && lineage.missingElements.length < bestLineage.missingElements.length;
    }
    async function* generateLineageMultipleMethods(goals) {
        async function generateWithSettings(order, recalc) {
            console.time(order);
            const result = await generateLineage(goals, order, recalc);
            const methodName = (order ? `${icCaseText(order)} Recalc` : 'Simple');
            const groupName = [`%c${methodName}:`, 'background:green; color:white', `${result.lineage.length}-step`];
            console.groupCollapsed(...groupName);
            console.log(idLineageToText(result.lineage, goals));
            console.timeEnd(order);
            console.groupEnd();
            return { ...result, methodName };
        }

        yield await generateWithSettings();
        for (const orderName of ['left', 'right', 'min', 'max', 'rand']) {
            yield await generateWithSettings(orderName, true);
        }
    }


    function generateElementHeuristics(startElements, heurMap=o.elementHeur, pq=new PriorityQueue(), pause=Infinity, end=Infinity) {
        for (const startElement of startElements) {
            const heur = heurMap[startElement];
            if (heur === undefined) throw new Error(`${startElement} does not have a heur.`);
            pq.push([heur, startElement]);
        }

        while (pq.peek()?.[0] < pause) {
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

            if (fh < bestMax
            || (fh === bestMax && sh < bestMin)
            /* || (fh === bestMax && sh === bestMin && Math.random() > 0.5)*/ ) {
                bestMax = fh;
                bestMin = sh;
                bestRecipe = recipe;
            }
        }
        return bestRecipe;
    }





    async function generateLineage(goals, order, recalc=false) {
        const elementQueue = [...goals];
        const crafted = new Set();
        const visitedLastPath = new Map();  // for invalid lineages with infinite loops
        const heurMap = [...o.elementHeur];
        const pq = new PriorityQueue();
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

            if (order === 'right'
            || order === 'min' && heurMap[bestRecipe[0]] > heurMap[bestRecipe[1]]
            || order === 'max' && heurMap[bestRecipe[0]] < heurMap[bestRecipe[1]]
            || order === 'rand' && Math.round(Math.random())) {
                bestRecipe = [bestRecipe[1], bestRecipe[0]];
            }

            let neededIng;
            for (const ing of bestRecipe) {
                if (!o.baseElementsId.includes(ing) && !crafted.has(ing)) {
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
                    // tiny sleep to let the ui update
                    await sleep(0);

                    const nextHeurInQueue = heurMap[elementQueue.at(-1)] ?? Infinity;
                    const worst = elementQueue.reduce((best, el) => {
                        const heur = heurMap[el];
                        return heur > best.heur ? { element: el, heur } : best;
                    }, { element: undefined, heur: -Infinity });
                    generateElementHeuristics([element], heurMap, pq, nextHeurInQueue, worst.heur);
                }
            }
        }
        let initialLineage = removeUnnecessary(lineage, goals);
        // if (recalc) for await (const lineage of findShortcuts(initialLineage, goals)) {
        //     initialLineage = lineage;
        // }
        return correctlyCapsAndOrderLineage(initialLineage, goals);
    }



    function removeUnnecessary(lineage, goals) {
        const { resultIngMap, usedMap } = getRerouteMaps(lineage);

        for (const [,, r] of lineage) {
            if (goals.includes(r)) continue;
            // try to remove `r` from the lineage.
            const { unreachable, changes, goalRevivalsNeeded } = getUnreachableWithReroutes(r, goals, resultIngMap, usedMap);
            if (!goalRevivalsNeeded) applyRerouteChanges(changes, resultIngMap, usedMap, unreachable);
        }
        return convertResultIngMapToLineage(resultIngMap)
    }


    async function* findShortcuts(lineage, goals) {
        let bestLineage = removeUnnecessary(lineage, goals);
        let improved = true;

        while (improved) {
            improved = false;
            const testedElements = new Set();
            let { resultIngMap, usedMap } = getRerouteMaps(bestLineage);

            for (const [,, r] of bestLineage) {
                const { unreachable, changes } = getUnreachableWithReroutes(r, goals, resultIngMap, usedMap);
                let resultIngMap = new Map(resultIngMap);
                applyRerouteChanges(changes, resultIngMap);
                const reroutedLineage = convertResultIngMapToLineage(resultIngMap);

                // try to find a new recipe for r, that adds exactly 1 extra element.
                for (const [r1, r2] of o.recipesResIC[r] ?? []) {
                    const hasR1 = resultIngMap.has(r1);
                    const [addElement, combineWith] = hasR1 ? [r2, r1] : [r1, r2];
                    if ((r1 === r2 ? hasR1 : hasR1 === resultIngMap.has(r2))  // need exactly 1 ingredient that it doesn't have yet
                     || testedElements.has(addElement) || unreachable.has(combineWith)) continue;

                    for (const [add1, add2] of o.recipesResIC[addElement] ?? []) {
                        if (!resultIngMap.has(add1) || !resultIngMap.has(add2)
                         || unreachable.has(add1) || unreachable.has(add2)) continue;

                        const optimized = removeUnnecessary([...reroutedLineage, [add1, add2, addElement]], [...goals, addElement]);
                        testedElements.add(addElement);

                        if (optimized.length < bestLineage.length) {
                            bestLineage = optimized;
                            improved = true;
                            // console.log(beforeLength, " -> ", bestLineage.length, `(${((performance.now() - startTime) / 1000).toFixed(3)} s)`);
                            yield bestLineage;
                        }
                        break;
                    }
                    if (improved) break;
                }
                if (improved) break;
                await sleep(0);
            }
        }

        return bestLineage;
    }


    function convertResultIngMapToLineage(resultIngMap) {
        return [...resultIngMap.entries()].filter(([, x]) => x !== undefined).map(([result, ings]) => [ings[0], ings[1], result]);
    }
    function getRerouteMaps(lineage) {
        const resultIngMap = new Map(lineage.map(recipe => [recipe[2], [recipe[0], recipe[1]]]));
        for (const base of o.baseElementsId) if (!resultIngMap.has(base)) resultIngMap.set(base);
        const usedMap = new Map(lineage.map(recipe => [recipe[2], new Set()]));
        for (const [f, s, r] of lineage) {
            if (!o.baseElementsId.includes(f)) usedMap.get(f)?.add(r);
            if (!o.baseElementsId.includes(s)) usedMap.get(s)?.add(r);
        }
        return { resultIngMap, usedMap };
    }
    function getUnreachableWithReroutes(r, goals, resultIngMap, usedMap) {
        let goalRevivalsNeeded = 0;
        const unreachable = new Map([[r, Infinity]]);
        for (const [d] of unreachable) {
            if (goals.includes(d)) goalRevivalsNeeded++;
            for (const use of usedMap.get(d)) {
                unreachable.set(use, (unreachable.get(use) || 0) + 1);
            }
        }

        const changes = [];
        let changed = true;

        while (unreachable.size > 1 && changed && goalRevivalsNeeded) {
            changed = false;
            for (const [deadElement] of unreachable) {
                if (deadElement === r) continue;
                let replacementRecipe;
                for (const [newF, newS] of o.recipesResIC[deadElement]) {
                    if (resultIngMap.has(newF) && !unreachable.has(newF) && resultIngMap.has(newS) && !unreachable.has(newS)) {
                        replacementRecipe = [newF, newS];
                        break;
                    }
                }
                if (replacementRecipe) {
                    changes.push([deadElement, replacementRecipe]);
                    changed = true;

                    const reviveQueue = [deadElement];
                    for (const elem of reviveQueue) {
                        unreachable.delete(elem);
                        if (goals.includes(elem) && !--goalRevivalsNeeded) break;
                        for (const use of usedMap.get(elem)) {
                            const count = unreachable.get(use) - 1;
                            if (count === 0) reviveQueue.push(use);
                            else if (count) unreachable.set(use, count);
                        }
                    }
                    if (!goalRevivalsNeeded) break;
                }
            }
        }
        return { unreachable, changes, goalRevivalsNeeded };
    }

    function applyRerouteChanges(changes, resultIngMap, usedMap, unreachable=[]) {
        for (const [d] of unreachable) switchRecipeRU(d);
        for (const [newR, newIngs] of changes) switchRecipeRU(newR, newIngs);

        function switchRecipeRU(result, newRecipe) {
            const originalRecipe = resultIngMap.get(result);
            if (originalRecipe) for (const x of originalRecipe) if (!o.baseElementsId.includes(x)) usedMap?.get(x)?.delete(result);

            if (!newRecipe) resultIngMap.delete(result);
            else {
                resultIngMap.set(result, newRecipe);
                for (const x of newRecipe) if (!o.baseElementsId.includes(x)) usedMap?.get(x).add(result);
            }
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
                if (!o.baseElementsId.includes(ing) && !crafted.has(ing)) {
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
        const goalId = canonilizeId(o.elementTextToId.get(item.text))
        if (goalId === undefined) {
            container.appendChild(document.createTextNode(`${item.text} is not in your save...`));
            return container;
        }

        let goals = [goalId];
        let bestLineage;
        let startTime;
        let generator;

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
                processNewGoalElements([addGoalInput.value], event.ctrlKey);
            }
        });

        // --- Dropdown Menu ---
        const dropdownContainer = document.createElement("div");
        dropdownContainer.classList.add("lineage-dropdown");

        const dropdownMenuBtn = document.createElement("button");
        dropdownMenuBtn.classList.add("lineage-action-button");
        dropdownMenuBtn.textContent = "☰";
        // Close dropdown when clicking outside
        document.addEventListener("click", () => dropdownContent.classList.remove("show"));
        dropdownMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            renderMainMenu();
            dropdownContent.classList.toggle("show");
        });

        const dropdownContent = document.createElement("div");
        dropdownContent.classList.add("lineage-dropdown-content");

        // Option 1: Copy Goals
        const optCopy = document.createElement("div");
        optCopy.classList.add("lineage-dropdown-item");
        optCopy.textContent = "Copy Goals";
        optCopy.addEventListener("click", () => navigator.clipboard.writeText(goals.toReversed().map(goalId => idToMostlyNealCase(goalId).text).join('\n'))
            .catch(err => alert('Failed to copy goals.')));

        // Option 2: Paste Goals
        const optPaste = document.createElement("div");
        optPaste.classList.add("lineage-dropdown-item");
        optPaste.textContent = "Paste Goals";
        optPaste.addEventListener("click", async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) processNewGoalElements(text.split('\n'));
            } catch (err) {
                alert('Failed to read clipboard text. Please ensure clipboard permissions are granted.');
            }
        });


        // Option 3: Add Random Goal
        const optRandom = document.createElement("div");
        optRandom.classList.add("lineage-dropdown-item");
        optRandom.textContent = "Add random goal";
        optRandom.addEventListener("click", () => {
            const items = unsafeWindow.IC.getItems();
            if (items.length > 0) {
                const randomItem = items[Math.floor(Math.random() * items.length)];
                processNewGoalElements([randomItem.text]);
            }
        });

        // Option 4: Add Worst Element
        const optWorstElement = document.createElement("div");
        optWorstElement.classList.add("lineage-dropdown-item");
        optWorstElement.textContent = "Add worst element";
        optWorstElement.addEventListener("click", () => {
            const maxHeurId = o.elementHeur.reduce((m, n, i) => n > (o.elementHeur[m] ?? -Infinity) ? i : m, -1);
            if (maxHeurId !== undefined) processNewGoalElements([o.elementIdToText[maxHeurId]]);
        });

        // Option 5: Add Best Seed
        const optBestSeed = document.createElement("div");
        optBestSeed.classList.add("lineage-dropdown-item");
        optBestSeed.textContent = "Add best seed";
        optBestSeed.addEventListener("click", () => {
            alertOnMissingRecipes(defaultPresets[1].required, true);
            processNewGoalElements(defaultPresets[1].goals, true);
        });

        // Option 6: Seed Presets
        const optPresets = document.createElement("div");
        optPresets.classList.add("lineage-dropdown-item");
        optPresets.textContent = "Other Seeds...";
        optPresets.style.borderTop = "1px solid var(--border-color, #333)";
        optPresets.addEventListener("click", (e) => {
            e.stopPropagation();
            renderPresetsMenu();
        });

        function renderMainMenu() {
            dropdownContent.innerHTML = '';
            dropdownContent.append(optCopy, optPaste, optRandom, optWorstElement, optBestSeed, optPresets);
        }

        function renderPresetsMenu() {
            dropdownContent.innerHTML = '';

            // Back button
            const backBtn = document.createElement("div");
            backBtn.classList.add("lineage-dropdown-item");
            backBtn.textContent = "↩";
            backBtn.style.borderBottom = "1px solid var(--border-color, #333)";
            backBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                renderMainMenu();
            });
            dropdownContent.append(backBtn);


            const userPresets = JSON.parse(GM_getValue("lineage_seed_presets", "[]"));
            defaultPresets.forEach(p => addPreset(p));
            userPresets.forEach((p, i) => addPreset(p, i));

            function addPreset(p, deleteIndex) {
                const wrapper = document.createElement("div");
                wrapper.classList.add("lineage-dropdown-item");
                wrapper.style.padding = "0";
                wrapper.addEventListener("click", () => {
                    if (p.required) alertOnMissingRecipes(p.required, true);
                    processNewGoalElements(p.goals, true);
                    dropdownContent.classList.remove("show");
                    renderMainMenu();
                });

                const presetItem = document.createElement("div");
                presetItem.classList.add("lineage-dropdown-item");
                presetItem.textContent = p.name;
                wrapper.append(presetItem);

                if (deleteIndex) {
                    const deleteButton = document.createElement("button");
                    deleteButton.classList.add("lineage-action-button");
                    deleteButton.textContent = "✖";
                    deleteButton.style.color = "crimson";
                    deleteButton.addEventListener("click", (e) => {
                        e.stopPropagation();
                        if (confirm(`You actually want to delete '${p.name}'??!`)) {
                            userPresets.splice(deleteIndex, 1);
                            GM_setValue("lineage_seed_presets", JSON.stringify(userPresets));
                            renderPresetsMenu();
                        }
                    });
                    wrapper.append(deleteButton);
                }

                dropdownContent.append(wrapper);
            }

            // + Current Goals button
            const addCurrentBtn = document.createElement("div");
            addCurrentBtn.classList.add("lineage-dropdown-item");
            addCurrentBtn.style.borderTop = "1px solid var(--border-color, #333)";
            addCurrentBtn.style.color = "cyan";
            addCurrentBtn.textContent = "+ Add current goals";
            addCurrentBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (goals.length === 0) return alert("No goals to save :((");
                const name = prompt("Enter a name for this preset:") || idToMostlyNealCase(goals[0]).text;
                const currentGoalsText = goals.map(id => idToMostlyNealCase(id).text);
                userPresets.push({ name: name, goals: currentGoalsText });
                GM_setValue("lineage_seed_presets", JSON.stringify(userPresets));
                renderPresetsMenu();
            });

            dropdownContent.append(addCurrentBtn);
        }
        dropdownContainer.append(dropdownMenuBtn, dropdownContent);
        goalsContainerContainerDiv.append(goalsContainerDiv, addGoalInput, dropdownContainer);


        const lineageHeaderDiv = document.createElement("div");
        lineageHeaderDiv.classList.add("lineage-header");

        const lineageTitle = document.createTextNode('');

        const copyLineageButton = document.createElement("button");
        copyLineageButton.classList.add("lineage-action-button");
        copyLineageButton.textContent = "Copy";
        let copyResetTimeout;
        copyLineageButton.addEventListener('click', () => {
            navigator.clipboard.writeText(idLineageToText(bestLineage.lineage, goals)).then(() => {
                copyLineageButton.style.borderColor = 'lime';
                clearTimeout(copyResetTimeout);
                copyResetTimeout = setTimeout(() => {  // revert to original
                    copyLineageButton.style.borderColor = '';
                }, 500);
            }).catch(err => alert('Failed to copy lineage.'));
        });

        const optimiseButton = document.createElement("button");
        optimiseButton.classList.add("lineage-action-button");
        optimiseButton.textContent = "Optimise";
        optimiseButton.addEventListener('click', async () => {
            optimiseButton.style.pointerEvents = 'none';
            optimiseButton.style.transition = 'none';
            optimiseButton.style.borderColor = 'cyan';

            startTime = performance.now();
            let goalsSnapshot = [...goals];
            let optimizeTries = 0;

            optimiseButton.textContent = `Optimising... (${optimizeTries++}/5)`;
            for await (const lineage of generator) {
                if (!container.checkVisibility() || goals.join('\n') != goalsSnapshot.join('\n')) return
                optimiseButton.textContent = `Optimising... (${optimizeTries++}/5)`;
                if (isLineageBetter(bestLineage, lineage)) {
                    bestLineage = lineage;
                    drawLineage();
                    resetShortcutsButton();
                }
                updateHeaderStatText();
            }

            optimiseButton.textContent = 'Optimised';
            optimiseButton.style.opacity = '0.2';
            optimiseButton.style.transition = '';
            optimiseButton.style.borderColor = '';
        });

        const findShortcuts = document.createElement("button");
        findShortcuts.classList.add("lineage-action-button");
        findShortcuts.textContent = "Find Shortcuts";
        findShortcuts.addEventListener('click', async () => {
            findShortcuts.style.pointerEvents = 'none';
            findShortcuts.style.borderColor = 'purple';
            findShortcuts.textContent = "Find Shortcuts...";
            startTime = performance.now();
            const startLen = bestLineage.lineage.length;
            const canonicalLineage = bestLineage.lineage.map(recipe => recipe.map(x => canonilizeId(x)));
            let goalsSnapshot = [...goals];

            for await (const optimizedRaw of findShortcuts(canonicalLineage, goals)) {
                if (!container.checkVisibility() || goals.join('\n') != goalsSnapshot.join('\n')) return
                const formatted = correctlyCapsAndOrderLineage(optimizedRaw, goals);
                bestLineage = { ...bestLineage, ...formatted };

                drawLineage();
                updateHeaderStatText();
                findShortcuts.textContent = `Find Shortcuts... (-${startLen - bestLineage.lineage.length})`;
            }

            findShortcuts.textContent = `Find Shortcuts (-${startLen - bestLineage.lineage.length})`;
            findShortcuts.style.pointerEvents = 'none';
            findShortcuts.style.opacity = '0.2';
            findShortcuts.style.borderColor = '';
        });

        lineageHeaderDiv.append(lineageTitle, optimiseButton, findShortcuts, copyLineageButton);


        const lineageBodyDiv = document.createElement("div");
        lineageBodyDiv.classList.add("lineage-body");
        container.append(goalsContainerContainerDiv, lineageHeaderDiv, lineageBodyDiv);

        drawGoalsAndInitLineage();


        function processNewGoalElements(newGoals, toBottom) {
            let update = false;
            for (const newGoal of newGoals) {
                const icGoalText = icCaseText(newGoal.trim());
                const newItemId = o.icTextToCanonicalId.get(icGoalText);
                if (newItemId !== undefined && !goals.includes(newItemId)) {
                    addGoalInput.value = '';
                    if (toBottom) goals.push(newItemId);
                    else goals.unshift(newItemId);
                    update = true;
                }
            }
            if (update) {
                drawGoalsAndInitLineage();
            }
        }

        function drawGoalsAndInitLineage() {
            goalsContainerDiv.innerHTML = '';
            resetOptimiseButton();
            resetShortcutsButton();
            initializeLineage();

            for (let i = goals.length - 1; i >= 0; i--) {
                const goalId = goals[i];
                const goalElement = unsafeWindow.ICHelper.createItemElement(idToMostlyNealCase(goalId));
                goalElement.classList.add('lineage-goal');

                goalElement.dataset.goalId = goalId; // Store goalId for easy access
                goalElement.dataset.index = i;   // Store original index
                goalElement.addEventListener('remove-goal', (e) => {
                    goals.splice(e.target.dataset.index, 1);
                    drawGoalsAndInitLineage();
                });

                // prevent helper behaviour
                goalElement.addEventListener('mousedown', (e) => e.stopImmediatePropagation(), true);

                goalElement.draggable = true;
                goalElement.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', goalId);
                    e.dataTransfer.setData('sourceIndex', i);
                    e.target.classList.add('dragging');
                    setTimeout(() => e.target.style.visibility = 'hidden', 0);
                });
                goalElement.addEventListener('dragend', (e) => {
                    e.target.classList.remove('dragging');
                    e.target.style.visibility = 'visible';
                });
                goalElement.addEventListener('dragover', (e) => {
                    e.preventDefault(); // Necessary to allow dropping
                    e.dataTransfer.dropEffect = 'move';
                });
                goalElement.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const draggedGoalId = e.dataTransfer.getData('text/plain');
                    const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'), 10);
                    const targetIndex = i;

                    if (sourceIndex !== targetIndex) {
                        // Reorder the `goals` array
                        const [movedItem] = goals.splice(sourceIndex, 1);
                        goals.splice(targetIndex, 0, movedItem);
                        drawGoalsAndInitLineage();
                    }
                });

                goalsContainerDiv.append(goalElement);
            }
            addGoalInput.placeholder = `Add goal... (${goals.length})`;
        }

        async function initializeLineage() {
            startTime = performance.now();
            generator = generateLineageMultipleMethods(goals);
            bestLineage = (await generator.next()).value;
            updateHeaderStatText();
            drawLineage();
        }

        function resetOptimiseButton() {
            optimiseButton.textContent = 'Optimise';
            optimiseButton.style.opacity = '';
            optimiseButton.style.pointerEvents = '';
            optimiseButton.style.borderColor = '';
        }
        function resetShortcutsButton() {
            findShortcuts.textContent = 'Find Shortcuts';
            findShortcuts.style.opacity = '';
            findShortcuts.style.pointerEvents = '';
            findShortcuts.style.borderColor = '';

        }


        function drawLineage() {
            lineageBodyDiv.innerHTML = '';

            if (bestLineage.missingElements.length > 0) {
                const missingContainerContainerDiv = document.createElement("div");
                missingContainerContainerDiv.classList.add("lineage-missing-container-container");
                const missingContaierDiv = document.createElement("div");
                missingContaierDiv.classList.add("lineage-missing-container");
                for (const missingElement of bestLineage.missingElements) {
                    const missingItemElement = unsafeWindow.ICHelper.createItemElement(idToMostlyNealCase(missingElement));
                    missingItemElement.classList.add('lineage-missing');
                    missingContaierDiv.append(missingItemElement);
                }
                missingContainerContainerDiv.append(document.createTextNode("Missing:"), missingContaierDiv)
                lineageBodyDiv.append(missingContainerContainerDiv);
            }

            bestLineage.lineage.forEach((r, step) => {
                const recipe = document.createElement("div");
                recipe.classList.add("recipe");
                const [first, second, result] = r.map(x => ICHelper.getItemFromId(x));
                if (!first || !second || !result) return console.warn("Invalid recipe for " + r.map(x => o.elementIdToText[x]), r);
                const stepNumberSpan = document.createElement("span");
                stepNumberSpan.classList.add("recipe-step-number");
                stepNumberSpan.textContent = `${step + 1}.`;

                const firstItemElement = unsafeWindow.ICHelper.createItemElement(first);
                const secondItemElement = unsafeWindow.ICHelper.createItemElement(second);
                const resultItemElement = unsafeWindow.ICHelper.createItemElement(result);
                if (bestLineage.missingElements.includes(canonilizeId(first.id))) firstItemElement.classList.add('lineage-missing');
                if (bestLineage.missingElements.includes(canonilizeId(second.id))) secondItemElement.classList.add('lineage-missing');
                if (bestLineage.missingElements.includes(canonilizeId(result.id))) resultItemElement.classList.add('lineage-missing');
                else if (goals.includes(canonilizeId(result.id))) resultItemElement.classList.add('lineage-goal');

                recipe.append(stepNumberSpan, firstItemElement, document.createTextNode("+"), secondItemElement, document.createTextNode("→"), resultItemElement);
                lineageBodyDiv.append(recipe);
            });
        }
        function getPresets() {
            return JSON.parse(GM_getValue("lineage_seed_presets", JSON.stringify(defaultPresets)));
        }
        function updateHeaderStatText() {
            lineageTitle.textContent = `${bestLineage.methodName} - ${bestLineage.lineage.length} Steps (${((performance.now() - startTime) / 1000).toFixed(3)} s)`;
        }
	    return container;
    }



    function idToMostlyNealCase(itemId) {
        const text = o.elementIdToText[itemId];
        const icText = icCaseText(text);
        const id = o.elementTextToId.get(icText) ?? canonilizeId(itemId);
        return ICHelper.getItemFromId(id);
    }


    function textLineageToArray(input) {
        if (Array.isArray(input)) return input
        return input.split('\n').filter(Boolean).map(line => {
            const [fs, r] = line.split(/ \/\/| ::/)[0].split(' = ').map(x => x.trim());
            const [f, s] = [fs.slice(0, fs.indexOf(' + ')), fs.slice(fs.indexOf(' + ') + 3)].map(x => x.trim());
            return [f, s, r];
        });
    }

    function textArrayLineageToString(input) {
        if (typeof input === 'string') return input

        // Handle both 3D arrays (alt lineages) and 2D arrays (single lineage)
        const is3D = Array.isArray(input[0]) && Array.isArray(input[0][0]);
        return (is3D ? input : [input]).map(lineage =>
            lineage.map(x => `${[x[0], x[1]].sort()[0]} + ${[x[0], x[1]].sort()[1]} = ${x[2]}`).join('\n')
        ).join('\n\n')
    }

    function idLineageToText(lineage, goals) {
        return lineage.map((recipe, i) => {
            const [first, second] = [o.elementIdToText[recipe[0]], o.elementIdToText[recipe[1]]].sort();
            const result = o.elementIdToText[recipe[2]];
            return `${first} + ${second} = ${result}` + (goals.includes(canonilizeId(recipe[2])) ? `  // ${i + 1}` : '');
        }).join('\n');
    }

    function alertOnMissingRecipes(input, alertPopup) {
        let missing = new Set();
        for (const [first, second, res] of textLineageToArray(input)) {
            const id1 = o.icTextToCanonicalId.get(icCaseText(first));
            const id2 = o.icTextToCanonicalId.get(icCaseText(second));
            const idRes = o.icTextToCanonicalId.get(icCaseText(res));

            if (id1 === undefined || id2 === undefined || idRes === undefined) {
                missing.add(`${first} + ${second} = ${res}`);
                continue;
            }
            // skip recipes like `X + Y = y`, because they aren't stored in this script...
            if (id1 === idRes || id2 === idRes) continue;

            function checkRecipe(f, s) {
                const sortedFS = f > s ? [s, f] : [f, s];
                return canonilizeId(o.recipesIngIC.get(sortedFS.join('='))) === idRes;
            }

            if (!checkRecipe(id1, id2)
            && [id1, ...o.baseElementsId].every(x => !checkRecipe(id1, x))
            && [id2, ...o.baseElementsId].every(x => !checkRecipe(id2, x))) {
                missing.add(`${first} + ${second} = ${res}`);
            }
        }
        if (alertPopup) {
            if (missing.size) alert("You are missing:\n\n" + [...missing].join("\n"));
        }
        else {
            console.log('%cMissing:', 'background: orange; color: white', missing.size > 0 ? `\n`+[...missing].join`\n` : "No missing recipes, yay!")
            return [...missing];
        }
    }

    async function verifyLineage(input, delayMs=30) {
        alertOnMissingRecipes(input);

        let owned = new Set(o.baseElementsString),
            ownedIC = new Set([...owned].map(x => icCaseText(x))),
            err = [],
            promises = [];

        textLineageToArray(input).forEach(([f, s, r], i) => {
            [f, s].forEach(x => {
                if (!ownedIC.has(icCaseText(x))) err.push(`${x} was never crafted...`);
                else if (!owned.has(x)) err.push(`${x} was crafted in different caps...`);
            });
            if (owned.has(r)) err.push(`${r} was already crafted...`);
            else if (ownedIC.has(icCaseText(r))) err.push(`${r} was already crafted in different caps...`);
            owned.add(r), ownedIC.add(icCaseText(r));

            if (delayMs) promises.push((async () => {
                await sleep(i * delayMs);
                try {
                    const [ef, es, er] = [icCaseText(f), icCaseText(s), r].map(encodeURIComponent);
                    if (!await fetch(`https://neal.fun/api/infinite-craft/check?first=${ef}&second=${es}&result=${er}`)
                        .then(x => x.json()).then(x => x.valid)) err.push(`Invalid recipe: ${f} + ${s} = ${r}`);
                } catch (error) {
                    err.push(`Error checking recipe (${f} + ${s} = ${r}): ${error}`);
                }
            })());
        });
        Promise.all(promises).then(() => console.log('%cVerify:', 'background: purple; color: white', err.length > 0 ? err.join`\n` : "No Errors, yay!"));
        return err;
    }

    async function consoleMakeLineage(...goals) {
        goals = goals.toReversed().map(goal => {
            const goalId = o.icTextToCanonicalId.get(icCaseText(goal));
            if (goalId === undefined) throw new Error(`${goal} is not in your save...`);
            return goalId;
        });

        let best = null;
        for await (const lineage of generateLineageMultipleMethods(goals)) {
            if (isLineageBetter(best, lineage)) best = lineage;
        }
        return best;
    }








// Priority Queue - https://stackoverflow.com/a/42919752
const pqTop = 0;
const pqParent = i => ((i + 1) >>> 1) - 1;
const pqLeft = i => (i << 1) + 1;
const pqRight = i => (i + 1) << 1;

class PriorityQueue {
  constructor(comparator = (a, b) => b[0] > a[0]) { this._heap = []; this._comparator = comparator; }
  size() { return this._heap.length; }
  isEmpty() { return this.size() == 0; }
  peek() { return this._heap[pqTop]; }
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
  _greater(i, j) { return this._comparator(this._heap[i], this._heap[j]); }
  _swap(i, j) { [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]]; }
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
  align-items: center;
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

.lineage-goals-input {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  background-color: var(--background-color);
  color: var(--text-color);
  border-radius: 4px;
  font-size: 0.9em;
  margin: 8px;
  margin-right: 0px;
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

.lineage-dropdown {
  position: relative;
  display: inline-block;
}
.lineage-dropdown-content {
  display: none;
  position: absolute;
  right: 0;
  background-color: var(--background-color, #1f1f1f);
  min-width: 196px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.5);
  z-index: 1000;
  border: 1px solid var(--border-color, #333);
  border-radius: 5px;
}
.lineage-dropdown-content.show {
  display: block;
}
.lineage-dropdown-item {
  color: var(--text-color, #fff);
  padding: 10px 14px;
  cursor: pointer;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lineage-dropdown-item:hover {
  background-color: color-mix(in oklab, var(--background-color), var(--text-color) 15%);
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
  margin-left: 4px;
  margin-right: 4px;
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
styleElement.textContent = css.trim();
document.head.appendChild(styleElement);
})();