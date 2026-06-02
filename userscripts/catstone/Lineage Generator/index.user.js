// ==UserScript==
// @name          Lineage Generator
// @namespace     Catstone
// @match         https://neal.fun/infinite-craft/*
// @grant         GM_setValue
// @grant         GM_getValue
// @version       2.2
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
        refresh: reloadGameData,
        make: consoleMakeLineage,
        vars: o,
        icCaseText, icCaseId,
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
        else alert('Lineage Generator\nThe newest version of Helper is required to display lineages ingame!');

        // listen for crafts
        const craft = v_container.craft;
        v_container.craft = async function() {
            const response = await craft.apply(this, arguments);
            setTimeout(() => {
                if (!response || !response.instance) return;
                addElement(response.instance.text, response.instance.id);

                const newRecipe = [icCaseId(arguments[0].itemId), icCaseId(arguments[1].itemId), icCaseId(response.instance.id)];
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
        o.nonExistentIcCaseId = 0;
        o.icCasedLookup = [];
        o.elementIdToText = [];
        o.elementTextToId = new Map();

        console.time('Load Data');
        const ICItems = unsafeWindow.IC.getItems();
        for (const element of ICItems) {
            addElement(element.text, element.id);
        }
        o.baseElementsId = o.baseElementsString.map(x => o.elementTextToId.get(x));
        o.nonExistentIcCaseId = ICItems.length + 20000;

        for (const element of ICItems) {
            for (const [fID, sID] of element?.recipes ?? []) {
                addRecipe(fID, sID, element.id, false);
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
    }

    function addRecipe(f, s, r) {
        if (!Number.isInteger(f) || !Number.isInteger(s) || !Number.isInteger(r)) return;
        const F = icCaseId(f);
        const S = icCaseId(s);
        const R = icCaseId(r);
        if (F === R || S === R) return;

        const sortedFS = S > F ? [F, S] : [S, F];
        const combString = sortedFS.join('=');
        o.recipesIngIC.set(combString, r);

        pushToArrayArray(o.recipesResIC, R, sortedFS);
        pushToArrayArray(o.recipesUsesIC, F, [S, R]);
        if (F !== S) pushToArrayArray(o.recipesUsesIC, S, [F, R]);
    }
    function pushToArrayArray(arr, key, value) {
        let a = arr[key];
        if (!a) arr[key] = [value];
        else a.push(value);
    };
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
    function icCaseId(inputId) {
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
    }






    async function* generateLineageMultipleMethods(goals) {
        const lineageGenerators = {
            'Simple':         async () => await generateLineage(goals),
            'Normal Recalc':  async () => await generateLineage(goals, 1),
            'Reverse Recalc': async () => await generateLineage(goals, 2),
            'Min Recalc':     async () => await generateLineage(goals, 3),
            'Max Recalc':     async () => await generateLineage(goals, 4),
            'Random Recalc':  async () => await generateLineage(goals, 5),
        };

        // Now iterate through the generators and run them
        for (const [methodName, generateFunc] of Object.entries(lineageGenerators)) {
            console.time(methodName);
            const { lineage, missingElements } = await generateFunc();

            const groupName = [`%c${methodName}:`, 'background:green; color:white', `${lineage.length}-step`];
            console.groupCollapsed(...groupName);
            console.log(idLineageToText(lineage, goals));
            console.timeEnd(methodName);
            console.groupEnd();

            yield { lineage, methodName, missingElements };
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





    async function generateLineage(goals, recalc=false, depth=0) {
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

            if (recalc === 2) bestRecipe = [bestRecipe[1], bestRecipe[0]];
            else if (recalc === 3 && heurMap[bestRecipe[0]] > heurMap[bestRecipe[1]]) bestRecipe = [bestRecipe[1], bestRecipe[0]];
            else if (recalc === 4 && heurMap[bestRecipe[0]] < heurMap[bestRecipe[1]]) bestRecipe = [bestRecipe[1], bestRecipe[0]];
            else if (recalc === 5 && Math.round(Math.random())) bestRecipe = [bestRecipe[1], bestRecipe[0]];

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

                    const nextHeurInQueue = heurMap[elementQueue.at(-1)];
                    const worst = elementQueue.reduce((best, el) => {
                        const heur = heurMap[el];
                        return heur > best.heur ? { element: el, heur } : best;
                    }, { element: undefined, heur: -Infinity });
                    generateElementHeuristics([element], heurMap, pq, nextHeurInQueue, worst.heur);
                }
            }
        }
        return correctlyCapsAndOrderLineage(removeUnnecessary(lineage, goals), goals);
    }



    function removeUnnecessary(lineage, goals) {
        const resultIngMap = new Map(lineage.map(recipe => [recipe[2], [recipe[0], recipe[1]]]));
        const usedMap = new Map(lineage.map(recipe => [recipe[2], new Set()]));
        for (const [f, s, r] of lineage) {
            if (!o.baseElementsId.includes(f)) usedMap.get(f)?.add(r);
            if (!o.baseElementsId.includes(s)) usedMap.get(s)?.add(r);
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
                    (o.baseElementsId.includes(newF) || (resultIngMap.has(newF) && !blacklist.has(newF)))
                 && (o.baseElementsId.includes(newS) || (resultIngMap.has(newS) && !blacklist.has(newS)))
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
        for (const x of originalRecipe) if (!o.baseElementsId.includes(x)) usedMap.get(x)?.delete(result);

        if (!newRecipe) resultIngMap.delete(result);
        else {
            resultIngMap.set(result, newRecipe);
            for (const x of newRecipe) if (!o.baseElementsId.includes(x)) usedMap.get(x).add(result);
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
        const goalId = icCaseId(o.elementTextToId.get(item.text))
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
        optCopy.addEventListener("click", () => {
            navigator.clipboard.writeText(goals.map(goalId => idToMostlyNealCase(goalId).text).join('\n')).then(() => {
                optCopy.style.color = 'gold';
                setTimeout(() => optCopy.style.color = '', 500);
            }).catch(err => alert('Failed to copy goals.'));
        });

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
            const maxHeurItem = idToMostlyNealCase(maxHeurId);
            if (maxHeurItem) processNewGoalElements([maxHeurItem.text]);
        });

        // Option 5: Add Best Seed
        const optBestSeed = document.createElement("div");
        optBestSeed.classList.add("lineage-dropdown-item");
        optBestSeed.textContent = "Add best seed";
        optBestSeed.addEventListener("click", () => {
            alertOnMissingRecipes(defaultPresets[1].required, true);
            processNewGoalElements(defaultPresets[1].goals);
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
                    processNewGoalElements(p.goals);
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
            navigator.clipboard.writeText(idLineageToText(lineage, goals)).then(() => {
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
            let methodIndex = 0;
            optimiseButton.textContent = `Optimising... (${methodIndex++}/5)`;
            let goalsSnapshot = [...goals];

            for await (const { lineage: newLineage, methodName: newMethodName, missingElements: newMissingElements } of generator) {
                if (!container.checkVisibility() || goals.join('\n') != goalsSnapshot.join('\n')) return

                if (newLineage.length < lineage.length || (newLineage.length === lineage.length && newMissingElements.length < missingElements.length)) {
                    lineage = newLineage;
                    methodName = newMethodName;
                    missingElements = newMissingElements;
                    drawLineage();
                }
                optimiseButton.textContent = `Optimising... (${methodIndex++}/5)`;
                updateHeaderStatText();
            }
            optimiseButton.textContent = 'Optimised';
            optimiseButton.style.opacity = '0.2';
            optimiseButton.style.transition = '';
            optimiseButton.style.borderColor = '';
        });

        lineageHeaderDiv.append(lineageTitle, optimiseButton, copyLineageButton);


        const lineageBodyDiv = document.createElement("div");
        lineageBodyDiv.classList.add("lineage-body");
        container.append(goalsContainerContainerDiv, lineageHeaderDiv, lineageBodyDiv);

        drawGoalsAndInitLineage();


        function processNewGoalElements(newGoals) {
            let update = false;
            for (const newGoal of newGoals) {
                const icGoalText = icCaseText(newGoal.trim());
                const newItemId = o.elementTextToId.get(icGoalText);
                if (newItemId !== undefined && !goals.includes(newItemId)) {
                    addGoalInput.value = '';
                    goals.push(newItemId);
                    update = true;
                }
            }
            if (update) {
                drawGoalsAndInitLineage();
            }
        }

        function drawGoalsAndInitLineage() {
            goalsContainerDiv.innerHTML = '';
            optimiseButton.style.borderColor = '';
            initializeLineage();

            goals.forEach((goalId, index) => {
                const goalItem = idToMostlyNealCase(goalId);
                const goalElement = unsafeWindow.ICHelper.createItemElement(goalItem);
                goalElement.classList.add('lineage-goal');

                goalElement.dataset.goalId = goalId; // Store goalId for easy access
                goalElement.dataset.index = index;   // Store original index
                goalElement.addEventListener('remove-goal', (e) => {
                    goals.splice(e.target.dataset.index, 1);
                    drawGoalsAndInitLineage();
                });

                // prevent helper behaviour
                goalElement.addEventListener('mousedown', (e) => e.stopImmediatePropagation(), true);

                goalElement.draggable = true;
                goalElement.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', goalId);
                    e.dataTransfer.setData('sourceIndex', index);
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
                    const targetIndex = index;

                    if (sourceIndex !== targetIndex) {
                        // Reorder the `goals` array
                        const [movedItem] = goals.splice(sourceIndex, 1); // Remove item from old position
                        goals.splice(targetIndex, 0, movedItem);      // Insert item at new position
                        drawGoalsAndInitLineage();
                    }
                });

                goalsContainerDiv.append(goalElement);
            });
            addGoalInput.placeholder = `Add goal... (${goals.length})`;
        }

        async function initializeLineage() {
            startTime = performance.now();
            generator = generateLineageMultipleMethods(goals);
            const result = (await generator.next()).value;
            lineage = result.lineage;
            methodName = result.methodName;
            missingElements = result.missingElements;
            updateHeaderStatText();
            drawLineage();
            optimiseButton.textContent = 'Optimise';
            optimiseButton.style.opacity = '';
            optimiseButton.style.pointerEvents = '';
        }


        function drawLineage() {
            lineageBodyDiv.innerHTML = '';

            if (missingElements.length > 0) {
                const missingContainerContainerDiv = document.createElement("div");
                missingContainerContainerDiv.classList.add("lineage-missing-container-container");
                const missingContaierDiv = document.createElement("div");
                missingContaierDiv.classList.add("lineage-missing-container");
                for (const missingElement of missingElements) {
                    const missingItem = idToMostlyNealCase(missingElement);
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
                    if (missingElements.includes(icCaseId(first.id))) firstItemElement.classList.add('lineage-missing');
                    if (missingElements.includes(icCaseId(second.id))) secondItemElement.classList.add('lineage-missing');
                    if (missingElements.includes(icCaseId(result.id))) resultItemElement.classList.add('lineage-missing');
                    else if (goals.includes(icCaseId(result.id))) resultItemElement.classList.add('lineage-goal');

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
        function getPresets() {
            return JSON.parse(GM_getValue("lineage_seed_presets", JSON.stringify(defaultPresets)));
        }
        function updateHeaderStatText() {
            lineageTitle.textContent = `${methodName} - ${lineage.length} Steps (${((performance.now() - startTime) / 1000).toFixed(3)} s)`;
        }
	    return container;
    }



    function idToMostlyNealCase(itemId) {
        let item = unsafeWindow.ICHelper.idMap.get(itemId);
        if (item) return item;
        // example: it is `End Of Sentence` but the user only has `End of Sentence`...
        const itemLowerText = o.elementIdToText[itemId].toLowerCase();
        return unsafeWindow.IC.getItems().find(x => x.text.toLowerCase() === itemLowerText);
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
            return `${first} + ${second} = ${result}` + (goals.includes(icCaseId(recipe[2])) ? `  // ${i + 1}` : '');
        }).join('\n');
    }

    function alertOnMissingRecipes(input, alertPopup) {
        let missing = new Set();
        for (const [first, second, res] of textLineageToArray(input)) {
            const id1 = o.elementTextToId.get(icCaseText(first));
            const id2 = o.elementTextToId.get(icCaseText(second));
            const idRes = o.elementTextToId.get(icCaseText(res));

            const sortedFS = id2 > id1 ? [id1, id2] : [id2, id1];
            if (icCaseId(o.recipesIngIC.get(sortedFS.join('='))) !== idRes) {
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
                    if (!await fetch(`https://neal.fun/api/infinite-craft/check?first=${encodeURIComponent(icCaseText(f))}&second=${encodeURIComponent(icCaseText(s))}&result=${encodeURIComponent(r)}`)
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
        goals = goals.map(goal => {
            const goalId = o.elementTextToId.get(icCaseText(goal));
            if (goalId === undefined) throw new Error(`${goal} is not in your save...`);
            return goalId;
        });

        let bestResult = null;
        for await (const lineage of generateLineageMultipleMethods(goals)) {
            if (!bestResult || lineage.lineage.length < bestResult.lineage.length) {
                bestResult = lineage;
            }
        }
        return bestResult
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