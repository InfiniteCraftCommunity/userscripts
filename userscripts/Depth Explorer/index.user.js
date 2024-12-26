// ==UserScript==
// @name          New Depth Explorer
// @match         https://neal.fun/infinite-craft/*
// @version       1.0
// @author        Catstone
// @namespace     Catstone
// @grant         GM_getValue
// @grant         GM_setValue
// @description   Explores the deep depths of InfiniteCraft. Use `depthExplorer()` to start the bot. For all settings/commands, check the code itself!
// ==/UserScript==


(function() {
    'use strict';

    // Settings
    const combineTime = 400;  // ms

    const addElements = true;  // wether it adds element to the storage sidebar

    const stopAfterDepth = 6;

    // const lastDepthStartingPoint = 0 / 100  // requires stopAfterDepth (NOT IMPLEMENTED)

    const parallelBots = 10; // Number of concurrent workers (probably dont modify this)



    const baseElements = ["Plant", "Tree", "River", "Delta", "Paper", "Book", "Alphabet", "Word", "Sentence", "Phrase", "Quote", "Punctuation"].map(x => x.icCase());
             // gen 6 done ["Plant", "Tree", "River", "Delta", "Paper", "Book", "Alphabet", "Word", "Sentence", "Phrase", "Quote", "Punctuation"]
                        // ["Plant", "Tree", "River", "Delta", "Paper", "Book", "Alphabet", "Word", "Sentence", "Phrase", "Quote", "Punctuation", "Apostrophe", "Period", "Full Stop", "End", "Dust", "Clean", "Begin", "'"]
                        // ["Smoke", "Dust", "Planet", "Sun", "Sunflower", "Smoke Signal", "Message", "Letter", "A"]
                        // ["Plant", "Tree", "Ash", "Pencil", "Paper", "Book", "Homework", "Coffee", "A"]
                        // ["Smoke", "Cloud", "Lightning", "Sun", "Sunflower", "Smoke Signal", "Message", "Letter", "A"]

    const baseBaseElements = ["Fire", "Water", "Earth", "Wind"];

    const fullBaseSet = new Set([...baseBaseElements, ...baseElements]);

    const endElements = new Set(["Hashtag", "Punctuation", "Grammar", "Grammar", "Sentence", "Quote", "Phrase", "Period", "Comma", "Colon", "Semicolon", "Parenthesis", "Parentheses", "Slash", "Alphabetical", "Ampersand", "Abrreviation", "Not", "Quotation",
                                 "Hyphen", "Dash", "Addition", "Minus", "Plus", "Division", "Multiplication", "Factorial", "Exponentiation", "Exponent", "Power", "Plural", "Cross",
                                 "Human", "Cow", "Ocean", "King", "Palindrome"]);

    const depthLists = [ /* Depth */ new Set(["" /* Seed (starts empty) */ ])];
    const encounteredElements = new Map(); // { element: seeds }




    const recipesIng = GM_getValue('recipesIng', {});
    const recipesRes = new Map();
    const elementsSet = new Set();  // for adding elements to inventory

    const precomputedRecipesRes = new Map();  // optimization for printing all Lineages



    unsafeWindow.depthExplorer = function() {
        if (startTime === 0) {
            depthExplorer();
            return "New Depth Explorer started!!!! Wowies, i can't wait for the results!!!1";
        }
        return "Refresh the tab before starting the bot again. you've done this mistake before..."
    }
    unsafeWindow.depthExplorerClearNothings = function() {
        let count = 0;
        // Iterate through the object keys
        for (const key in recipesIng) {
            if (recipesIng[key] === "Nothing") {
                delete recipesIng[key]; // Remove the entry
                count++;
            }
        }
        return "Removed", count, "recipes with 'Nothing'";
    }
    unsafeWindow.depthExplorerTimeSinceStart = function(element) {
        return "Time since start: " + (Date.now() - startTime) / 1000 + "s";
    }
    unsafeWindow.depthExplorerLineage = function(element) {
        return encounteredElements.has(element)
            ? makeLineage(encounteredElements.get(element), element + " Lineage").join(" ")
            : "This Element has not been made...";
    }


    unsafeWindow.depthExplorerLineages = function() {
        if (encounteredElements.size === 0) return "start the bot before running this! You stoopid."

        let content = [];

        content.push(generateLineageFromResults(baseElements, false).map(recipe => `${recipe[0]} + ${recipe[1]} = ${recipe[2]}`).join('\n') + `  // ${baseElements.length}`);

        const genCounts = Array(depth + 1).fill(0);
        encounteredElements.forEach(seeds => genCounts[seeds[0].length - 1]++);
        let runningTotal = 0;
        content.push(genCounts.map((count, index) => {
            runningTotal += genCounts[index];
            return `Gen ${index + 1} - ${count} Elements -> ${runningTotal} Total Elements`;
        }).join('\n'));


        content.push(JSON.stringify(Object.fromEntries(
                                      Array.from(encounteredElements, ([element, seed]) => [element, seed[0].length])),
                                      null, 2));



        console.time("Generate Lineages File");
        for (const [result, recipes] of recipesRes.entries()) {
            precomputedRecipesRes.set(result, Array.from(recipes).map(x => x.split('=')));
        }

        content.push(Array.from(encounteredElements.entries())
            .map(([element, lineage]) => makeLineage(lineage, element).join(' '))
            .join('\n\n'));

        precomputedRecipesRes.clear();
        console.timeEnd("Generate Lineages File");

        const blob = new Blob([content.join('\n\n\n\n')], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${baseElements[baseElements.length - 1]} Seed - ${Math.floor(processedSeeds / totalSeeds * 100)}p gen ${depth + 1}.txt`;

        a.click();
        return "Downloaded all lineages.";
    };



    window.addEventListener('beforeunload', () => {
        GM_setValue('recipesIng', recipesIng);
        console.log("Saved Recipes");
    });
    setInterval(() => {
        GM_setValue('recipesIng', recipesIng);
        console.log("Saved Recipes");
    }, 5 * 60 * 1000);





    let processedSeeds = 0;
    let totalSeeds = 0;
    let depth = 0;
    let startTime = 0;



    async function depthExplorer() {
        const save = await getSave().then(x => x.json());
        for (const element of save.elements) {
            elementsSet.add(element.text);
        }

        startTime = Date.now();
        function printSeedProgress() {
            console.log(processedSeeds, "/", totalSeeds, "seeds processed -", Math.round(processedSeeds / totalSeeds * 100 * 100) / 100, "%");
        }
        const interval = setInterval(() => {
            printSeedProgress();
        }, 10 * 1000);  // 10 seconds

        // calculate depth1 ONCE  (set)
        const depth1 = await processCombinations(allCombinations([...fullBaseSet]));

        while (true) {
            depthLists[depth + 1] = new Set();
            processedSeeds = 0;
            totalSeeds = depthLists[depth].size;


            async function worker(seedGen) {
                for (let seed of seedGen) {
                    seed = seed === '' ? [] : seed.split('=');

                    const combElements = [...seed.map(x => x.icCase()), ...fullBaseSet];

                    let allResults = new Set(depth1);    // use prebcalculated depth1
                    // do all non base-base combinations as those are already in depth1
                    for (let i = 0; i < seed.length; i++) {
                        for (let j = 0; j < combElements.length; j++) {
                            const combination = [combElements[i], combElements[j]].sort();
                            const recExists = recipeExists(...combination);

                            const result = recExists ? recExists : await combine(...combination);

                            if (result !== "Nothing") allResults.add(result);
                        }
                    }


                    for (const result of allResults) {
                        if (seed.includes(result) || fullBaseSet.has(result)) continue;

                        if (encounteredElements.has(result)) {
                            if (encounteredElements.get(result)[0].length - 1 === depth) {
                                encounteredElements.get(result).push([...seed, result].sort());
                            }
                        }
                        else {
                            encounteredElements.set(result, [[...seed, result].sort()]);
                            console.log(depth + 1, "-", result);
                            if (encounteredElements.size % 100 === 0) printSeedProgress();

                            // await processCombinations(baseElements.map(item => [result, item]));
                            // await processCombinations([[result, "\"Alphabet Soup\""]]);

                            if (endElements.has(result) || result.length === 1 || (result.length === 3 && result[0] === result[result.length-1])) {
                                console.log(...makeLineage(encounteredElements.get(result), result + " Lineage"));
                            }
                        }

                        if (depth < stopAfterDepth - 1 && result.length <= 30) {
                            const newSeed = [...seed, result];

                            let countDepth1s = 0;
                            let nonDepth1 = false;
                            for (const res of newSeed) {
                                if (depth1.has(res)) countDepth1s++;
                                else nonDepth1 = true;
                            }

                            if (nonDepth1 || countDepth1s <= 2)
                                depthLists[depth + 1].add(newSeed.sort().join('='));
                        }
                    }
                    processedSeeds++;
                }
            }
            // parallize set iterator (3 fancy words)
            function* seedGenerator(set) {
                for (const item of set) {
                    yield item;
                }
            }

            const seedGen = seedGenerator(depthLists[depth]);
            const workers = Array(parallelBots).fill().map(() => worker(seedGen));
            await Promise.all(workers); // wait for all workers to finish


            console.log("Depth:", depth + 1, "completed!", "\nTime:", (Date.now() - startTime) / 1000, "s\nSeeds:", totalSeeds, "->", depthLists[depth].size, "\nElements:", encounteredElements.size, encounteredElements);
            if (depth > stopAfterDepth - 2) return "Done.";

            depth++;
        }
        clearInterval(interval);
    }





    function makeLineage(lineages, element) {
        // generate a valid lineage using just the results
        return [ lineages[0].length, `- ${element}:`,
            lineages.map(lineage => generateLineageFromResults(lineage).map(recipe => `\n${recipe[0]} + ${recipe[1]} = ${recipe[2]}`).join('')).join('\n ...') ];
    }


    function generateLineageFromResults(results, allowBaseElements=true) {
        const toUse = new Set(allowBaseElements ? [...fullBaseSet] : baseBaseElements);
        const toAdd = new Set([...results])
        let recipe = [];

        // required to make different cases work THIS WAS A PAIN TO CODE
        const correctCaseMap = new Map();

        while (toAdd.size > 0) {
            let addedSmth = false
            for (const result of toAdd) {
                const validRecipe = (precomputedRecipesRes.get(result) || Array.from(recipesRes.get(result)).map(x => x.split('=')))
                    .find(([first, second]) =>
                          toUse.has(first) &&
                          toUse.has(second) &&
                          (!correctCaseMap.has(first) || correctCaseMap.get(first) !== result) &&
                          (!correctCaseMap.has(second) || correctCaseMap.get(second) !== result));

                if (validRecipe) {
                    recipe.push([...validRecipe.map(x => correctCaseMap.has(x) ? correctCaseMap.get(x) : x), result]);
                    const icResult = result.icCase();
                    toUse.add(icResult);
                    correctCaseMap.set(icResult, result);
                    toAdd.delete(result);
                    addedSmth = true;
                }
            }
            if (!addedSmth) return [...recipe, ...["could", "not generate", "Lineage"]];
        }
        return recipe;
    }



    function allCombinations(array) {
        const combinations = [];
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j <= i; j++) {
                combinations.push([array[i], array[j]].sort());
            }
        }
        return combinations;
    }




    async function processCombinations(combinations) {
        const results = new Set();
        combinations = combinations.map(([first, second]) => [first.icCase(), second.icCase()].sort());

        for (const [first, second] of combinations) {
            let result = recipeExists(first, second);
            if (!result) {
                result = await combine(first, second);
            }
            if (result && result !== "Nothing") {
                results.add(result);
            }
        }

        return results;
    }




    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    let lastCombination = Date.now();

    async function combine(first, second) {

        const waitingDelay = Math.max(0, combineTime - (Date.now() - lastCombination));
        lastCombination = Date.now() + waitingDelay;
        await delay(waitingDelay);

        const failCount = 0;
        while (failCount < 3) {
            const recExists = recipeExists(first, second);
            if (recExists) {
                // console.log(`Combine: (logged) ${first} + ${second} = ${recExists}`)
                lastCombination -= combineTime;
                return recExists;
            }

            const response = await unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse({ text: first }, { text: second });
            if (response && response.result) {
                const result = response.result;

                recipesIng[`${first}=${second}`] = result;
                if (!recipesRes.has(result)) recipesRes.set(result, new Set());
                recipesRes.get(result).add(`${first}=${second}`);

                if (addElements) addElementToStorage(response);

                // console.log(`Combine: (request) ${first} + ${second} = ${response ? result : response}`)
                return result;
            }
            failCount++;
        }
    }


    function addElementToStorage(element) {
        if (!element || elementsSet.has(element.result)) return;
        elementsSet.add(element.result);

        unsafeWindow.$nuxt._route.matched[0].instances.default.elements.push(element);
        element.text = element.result;
        element.discovered = element.isNew;
        delete element.result;
        delete element.isNew;

        let craftData = JSON.parse(localStorage.getItem("infinite-craft-data"));
        craftData.elements.push(element);
        localStorage.setItem("infinite-craft-data", JSON.stringify(craftData));
    }


    function recipeExists(first, second) {
        // first and second have to already be icCased and sorted!
        // [first, second] = [first.icCase(), second.icCase()].sort();
        const result = recipesIng[`${first}=${second}`];

        if (result) {
            if (!recipesRes.has(result)) recipesRes.set(result, new Set());
            recipesRes.get(result).add(`${first}=${second}`);

            return result
        }
    }

    function getSave() {
        return new Promise((resolve, reject) => {
            const handleClick = HTMLElement.prototype.click;
            HTMLElement.prototype.click = () => HTMLElement.prototype.click = handleClick;
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (mutation.type === "childList") {
                        const anchor = Array.from(mutation.addedNodes).find(node => node.download === "infinitecraft.json");
                        if (anchor) return fetch(anchor.href).then(resolve);
                    }
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            handleClick.call(document.querySelector(".setting[for=import-save] + .setting"));
            setTimeout(() => {
                observer.disconnect();
                reject("Timed out");
            }, 1500);
        });
    }


    const icCasedLookup = new Map();  // optimization to store icCased Elements

    String.prototype.icCase = function () {
        if (icCasedLookup.has(this)) return icCasedLookup.get(this);

        let result = '';
        const len = this.length;

        for (let i = 0; i < len; i++) {
            const char = this[i];
            result += (i === 0 || this[i - 1] === ' ') ? char.toUpperCase() : char.toLowerCase()
        }

        icCasedLookup.set(this, result);
        return result;
    };
})();
