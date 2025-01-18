// ==UserScript==
// @name            Chromatic Builder
// @namespace       Violentmonkey Scripts
// @match           https://neal.fun/infinite-craft/*
// @grant           none
// @version         1.1.1
// @author          Alexander_Andercou
// @author          Mikarific
// @description     Chromatic Builder, a tool to combine elements using "the Chromatic " method
// @downloadURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Chromatic_Builder/index.user.js
// @updateURL       https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Chromatic_Builder/index.user.js
// ==/UserScript==


(function () {
    let cache = {};

    function checkInInventory(element) {
        if (cache[element] != null) return cache[element];

        return unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((e) => e.text == element);
    }

    async function buildUsingChromatic(foo, bar) {
        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((e) => e.text == foo) &&
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.forEach((e) => {
                cache[e.text] = e;
            });
        
        let visited = [];

        if (checkInInventory(foo) && checkInInventory(bar)) {
            let fooElement = checkInInventory(foo);
            let barElement = checkInInventory(bar);

            let stage = foo;
            let step = 0;
            let indexInStep = 0;
            let toCombineText = [
                ['"the"', '"the "', '"the Chromatic"', '"the Chromatic "', '"the Achromatic"', '"the Achromatic "', '"the Monochromatic"', '"the Monochromatic "', "Append The The"],
                [
                    "nothing",
                    "U+0020",
                    "U++0020",
                    "U+++0020",
                    "Append U+0020",
                    " Prepend U+0020",
                    "Append Space",
                    "Prepend Space",
                    "Delete First Word",
                    " Delete The First Word",
                    "Remove First Word",
                    "Remove The First Word",
                    "Delete The Quotation Mark",
                    "Delete The Quotation Marks",
                    "Remove The Quotation Mark",
                    "Remove The Quotation Marks",
                    "Delete Chromatic",
                    "Delete Achromatic",
                    "Delete Monochromatic",
                    "Remove Chromatic",
                    "Remove Achromatic",
                ][("nothing", "U+0020", "U++0020", "U+++0020", "Append U+0020", " Prepend U+0020", "Append Space", "Prepend Space")],
                [bar],
                [
                    "Delete First Word",
                    " Delete The First Word",
                    "Remove First Word",
                    "Remove The First Word",
                    "Delete Chromatic",
                    "Delete Achromatic",
                    "Delete Monochromatic",
                    "Remove Chromatic",
                    "Remove Achromatic",
                    "U+0020",
                    "U++0020",
                    "U+++0020",
                    "Append U+0020",
                    " Prepend U+0020",
                    "Inverse",
                    "Reverse",
                    "Backward",
                    "Backwards",
                    "Delete The Quotation Mark",
                    "Delete The Quotation Marks",
                    "Remove The Quotation Mark",
                    "Remove The Quotation Marks",
                    "Delete The The",
                    "Remove The The",
                    "Without The The",
                    "Delete The Word The",
                    "Remove The Word The",
                    "Without The Word The",
                    "U+0020",
                    "U++0020",
                    "U+++0020",
                    "Append U+0020",
                    " Prepend U+0020",
                    bar,
                    "the " + bar,
                ],
                ["Delete The The", "Remove The The", "Without The The", "Delete The Word The", "Remove The Word The", "Without The Word The", "Inverse", "Reverse", "Backward", "Backwards"],
                ["Inverse", "Reverse", "Backward", "Backwards"],
            ];

            let expectedResults = [
                ['"the ' + foo + '"', '"the Chromatic ' + foo + '"', '"the Achromatic ' + foo + '"', '"the Monochromatic ' + foo + '"'],

                [
                    '"the ' + foo + '"',
                    '"the ' + foo + ' "',
                    '"the Chromatic ' + foo + ' "',
                    '"the Achromatic ' + foo + ' "',
                    '"the Monochromatic ' + foo + ' "',
                    '"the ' + foo + '"',
                    '"the Chromatic ' + foo + '"',
                    '"the Achromatic ' + foo + '"',
                    '"the Monochromatic ' + foo + '"',
                    "The " + foo,
                    "The Chromatic " + foo,
                    "The Achromatic " + foo,
                ],

                [
                    '"the ' + foo + '"',
                    '"the ' + foo + ' "',
                    '"the Chromatic ' + foo + ' "',
                    '"the Achromatic ' + foo + ' "',
                    '"the Monochromatic ' + foo + ' "',
                    '"the ' + foo + '"',
                    '"the Chromatic ' + foo + '"',
                    '"the Achromatic ' + foo + '"',
                    '"the Monochromatic ' + foo + '"',
                    "The " + foo,
                    "The Chromatic " + foo,
                    "The Achromatic " + foo,
                ],

                [
                    '"the ' + foo + " " + bar + '"',
                    '"the Chromatic ' + foo + " " + bar + '"',
                    '"the Achromatic ' + foo + " " + bar + '"',
                    '"the Monochromatic ' + foo + " " + bar + '"',
                    '"the ' + foo + " " + bar.toLowerCase() + '"',
                    '"the Chromatic ' + foo + " " + bar.toLowerCase() + '"',
                    '"the Achromatic ' + foo + " " + bar.toLowerCase() + '"',
                    '"the Monochromatic ' + foo + " " + bar.toLowerCase() + '"',
                    '"the ' + bar + " " + foo + '"',
                    '"the Chromatic ' + bar + " " + foo + '"',
                    '"the Achromatic ' + bar + " " + foo + '"',
                    '"the Monochromatic ' + bar + " " + foo + '"',
                    '"the ' + bar + " " + foo.toLowerCase() + '"',
                    '"the Chromatic ' + bar + " " + foo.toLowerCase() + '"',
                    '"the Achromatic ' + bar + " " + foo.toLowerCase() + '"',
                    '"the Monochromatic ' + bar + " " + foo.toLowerCase() + '"',
                    "The " + foo + " " + bar,
                    "The Chromatic " + foo + " " + bar,
                ],
                [
                    foo + " " + bar,
                    bar + " " + foo,
                    '"the ' + foo + " " + bar + '"',
                    '"Chromatic ' + foo + " " + bar + '"',
                    '"Achromatic ' + foo + " " + bar + '"',
                    '"Monochromatic ' + foo + " " + bar + '"',
                    foo + " " + bar.toLowerCase(),
                    '"the ' + foo + " " + bar.toLowerCase() + '"',
                    '"Chromatic ' + foo + " " + bar.toLowerCase() + '"',
                    '"Achromatic ' + foo + " " + bar.toLowerCase() + '"',
                    '"Monochromatic ' + foo + " " + bar.toLowerCase() + '"',
                    '"the ' + bar + " " + foo + '"',
                    '"the Chromatic ' + bar + " " + foo + '"',
                    '"the Achromatic ' + bar + " " + foo + '"',
                    '"the Monochromatic ' + bar + " " + foo + '"',
                    '"the ' + bar + " " + foo.toLowerCase() + '"',
                    '"the Chromatic ' + bar + " " + foo.toLowerCase() + '"',
                    '"the Achromatic ' + bar + " " + foo.toLowerCase() + '"',
                    '"the Monochromatic ' + bar + " " + foo.toLowerCase() + '"',
                    bar + " " + foo,
                    bar + " " + foo.toLowerCase(),
                    "The " + foo + " " + bar,
                ],
                [bar + " " + foo, foo + " " + bar, bar + " " + foo.toLowerCase()],
                [foo + " " + bar],
            ];
            
            let recursiveStep = [0, 0, 0, 0, 0, 0];
            let recursiveStage = [stage, "", "", "", "", ""];
            let visitedB = [];
            let visitedC = [];

            console.log("prestep");

            let expectedResultsSecond = [
                ['"the ' + bar + '"', '"the Chromatic ' + bar + '"', '"the Achromatic ' + bar + '"', '"the Monochromatic ' + bar + '"'],

                [
                    '"the ' + bar + '"',
                    '"the ' + bar + ' "',
                    '"the Chromatic ' + bar + ' "',
                    '"the Achromatic ' + bar + ' "',
                    '"the Monochromatic ' + bar + ' "',
                    '"the ' + bar + '"',
                    '"the Chromatic ' + bar + '"',
                    '"the Achromatic ' + bar + '"',
                    '"the Monochromatic ' + bar + '"',
                    "The " + bar,
                    "The Chromatic " + bar,
                    "The Achromatic " + bar,
                ],

                [
                    '"the ' + bar + '"',
                    '"the ' + bar + ' "',
                    '"the Chromatic ' + bar + ' "',
                    '"the Achromatic ' + bar + ' "',
                    '"the Monochromatic ' + bar + ' "',
                    '"the ' + bar + '"',
                    '"the Chromatic ' + bar + '"',
                    '"the Achromatic ' + bar + '"',
                    '"the Monochromatic ' + bar + '"',
                    "The " + bar,
                    "The Chromatic " + bar,
                    "The Achromatic " + bar,
                ],
            ];

            // prestep get all elementnts derived from bar to use in step 3
            for (let element of toCombineText[0]) {
                if (!visitedC.find((x) => x[0] == bar && x[1] == element)) {
                }
                visitedC.push([bar, element]);
                let response2 = await unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse({ text: bar, emoji: barElement.emoji }, { text: element, emoji: checkInInventory(element)?.emoji });

                let isFine = expectedResultsSecond[0].includes(response2.result);

                if (response2.result != "Nothing" && isFine) {
                    if (!toCombineText[3].includes(response2.result)) {
                        console.log("[passed by first]");
                        toCombineText[3].push(response2.result);
                        if (checkInInventory(response2.result) == undefined)
                            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.push({ text: response2.result, emoji: response2.emoji, disabled: !1, discovered: response2.isNew });
                    }

                    for (let element2 of toCombineText[1]) {
                        if (!visitedB.find((x) => x[0] == response2.result && x[1] == element2) && !visitedC.find((x) => x[0] == response2.result && x[1] == element2)) {
                            visitedB.push([response2.result, element2]);

                            let response3 = { result: response2.result, emoji: response2.emoji };

                            if (element2 != "nothing")
                                response3 = await unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse(
                                    { text: response2.result, emoji: response2.emoji },
                                    { text: element2, emoji: checkInInventory(element2)?.emoji }
                                );

                            isFine = expectedResultsSecond[1].includes(response3.result);

                            if (response3.result != "Nothing" && !toCombineText[3].includes(response3.result) && isFine) {
                                console.log("[passed by second]");

                                toCombineText[3].push(response3.result);
                                if (checkInInventory(response3.result) == undefined)
                                    unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.push({ text: response3.result, emoji: response3.emoji, disabled: !1, discovered: response3.isNew });

                                for (let element3 of toCombineText[2]) {
                                    if (!visitedB.find((x) => x[0] == response3.result && x[1] == element3) && !visitedC.find((x) => x[0] == response3.result && x[1] == element3)) {
                                        visitedB.push([response3.result, element3]);

                                        let response4 = { result: response3.result, emoji: response3.emoji };

                                        if (element3 != "nothing")
                                            response4 = await unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse(
                                                { text: response3.result, emoji: response3.emoji },
                                                { text: element3, emoji: checkInInventory(element3)?.emoji }
                                            );

                                        isFine = expectedResultsSecond[2].includes(response4.result);

                                        if (response4.result != "Nothing" && !toCombineText[2].includes(response4.result) && isFine) {
                                            console.log("[passed by second]");

                                            toCombineText[3].push(response4.result);
                                            if (checkInInventory(response4.result) == undefined)
                                                unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.push({ text: response4.result, emoji: response4.emoji, disabled: !1, discovered: response4.isNew });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            console.log("tools step 3", toCombineText[2]);

            while (step < 7) {
                console.log(step);
                if (step < 0) break;

                if (indexInStep < toCombineText[step].length) {
                    let response = stage;

                    console.log("step", "instep", step, indexInStep);
                    if (foo + " " + bar == stage) break;

                    if (toCombineText[step][indexInStep] != "nothing" && checkInInventory(toCombineText[step][indexInStep])) {
                        console.log("verified:", visited);
                        if (
                            visited.find((x) => {
                                return x.first == stage && x.second == toCombineText[step][indexInStep];
                            })
                        ) {
                            indexInStep += 1;
                            console.log("recipe already checked");
                            continue;
                        }

                        visited.push({ first: stage, second: toCombineText[step][indexInStep] });

                        response = await unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse(
                            { text: stage, emoji: checkInInventory(stage)?.emoji },
                            { text: toCombineText[step][indexInStep], emoji: checkInInventory(stage)?.emoji }
                        );
                    } else {
                        response = {};
                        response.result = stage;
                    }

                    console.log("response:", response.result);
                    //  console.log(step,expectedResults[step])
                    if (expectedResults[step].includes(response.result)) {
                        if (toCombineText[step][indexInStep] != "nothing" && response.result != "Nothing" && !checkInInventory(response.result) && checkInInventory(toCombineText[step][indexInStep])) {
                            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.push({ text: response.result, emoji: response.emoji, disabled: !1, discovered: response.isNew });

                            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].saveItems();
                        }

                        recursiveStage[step] = stage;
                        console.log("success");

                        if (foo + " " + bar == stage || foo + " " + bar == response.result) break;

                        recursiveStep[step] = indexInStep;

                        step++;
                        stage = response.result;
                        indexInStep = 0;
                        console.log("stage:", stage);
                        continue;
                    } else {
                        if (foo + " " + bar == stage) break;

                        console.log("fail at step", step, ".", indexInStep);
                        if (indexInStep < toCombineText[step].length - 1) {
                            indexInStep++;
                        } else {
                            console.log("fail hole step", step);
                            step--;
                            indexInStep = recursiveStep[step] + 1;
                            stage = recursiveStage[step];
                            recursiveStep[step] += 1;
                        }
                    }
                } else {
                    console.log("fail hole step", step);
                    step--;
                    indexInStep = recursiveStep[step] + 1;
                    stage = recursiveStage[step];
                    recursiveStep[step] += 1;
                }
            }
        }
    }

    unsafeWindow.ChromaticBuilder = buildUsingChromatic;
})();
