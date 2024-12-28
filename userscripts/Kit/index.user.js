// ==UserScript==
//
// @name            ULTIMATE reviver (KIT)
//
// @match           https://neal.fun/infinite-craft/
//
// @author          Catstone, patched by GameRoMan
// @namespace       Catstone
//
// @version         2.4.0.4
// @description     Kit can literally make anything, apart from some stuff. Open the Console (Ctrl + Shift + I) and type revive(`words`) in there. Seperate multiple elements by new lines. To modify tools used, check out the settings at the top of the code.
//
// ==/UserScript==


(function() {
    'use strict';


    // Settings
    const spacingChars = [' ', '-'];  // the bot splits the line into chunks so its easier to revive: "A Cat Loves-Food" -> "A", "Cat", "Loves", "Food"

    const parallelBots = 26;          // more bots = less combining downtime, also means less understanding of what da hell is going on

    const combineTime = 400;          // 400ms

    const addFailedSpellingsToElements = true;  // Cheats Failed Spellings in


    function generateToolCombinations(...arrays) {
        // Helper to recursively combine arrays
        const recursion = (i, prefix) => {
            if (i === arrays.length) return [prefix.trim()]; // Base case: return the final string
    		return arrays[i].flatMap(option => recursion(i + 1, option ? `${prefix} ${option}` : prefix))
        };

        return recursion(0, ""); // Start combining from the first group
    }


    const spellingTools = {
        word: (x) =>  [
            `${x}`, `"${x}"`, `'${x}'`
        ],

        letter2: (x) =>  [
            `'${x}'`, `"${x}"`, `${x}`, `“${x}”`, `‘${x}’`,
            `String.append('${x}')`, `String.append('${x}');`, `String.append("${x}")`, `String.append("${x}");`,
            `Mr. String.append('${x}')`, `Mr. String.append('${x}');`, `Mr. String.append("${x}")`, `Mr. String.append("${x}");`,

            `String.format('${x}')`, `String.format('${x}');`, `String.format("${x}")`, `String.format("${x}");`,
            `Mr. String.format('${x}')`, `Mr. String.format('${x}');`, `Mr. String.format("${x}")`, `Mr. String.format("${x}");`,

            `Append '${x}'`, `Append "${x}"`, `Append('${x}')`, `Append("${x}")`, `Append ${x}`,
            `-${x}`, `.${x}`,
            `Seq.append('${x}')`, `String.append(\`${x}\`)`, `String.append(${x})`,

        ],

        letter1: (x) => [
          ...spellingTools.letter2(x),  // Everything from 2 letter stuff should also work for 1 letter stuff
          `U+${x.toLowerCase().charCodeAt(0).toString(16).padStart(4, '0')}`, `Append U+${x.toLowerCase().charCodeAt(0).toString(16).padStart(4, '0')}`,
          `U+${x.toUpperCase().charCodeAt(0).toString(16).padStart(4, '0')}`, `Append U+${x.toUpperCase().charCodeAt(0).toString(16).padStart(4, '0')}`,
          `The '${x}'`, `Mr. '${x}'`,
        ],
    };


    const quickTools = {
        removeHi: [
            ...generateToolCombinations(["Delete", "Remove", "Without"], ["The", null], ["Word", null], ["Hi"]),

            '"remove The Hi"', '"delete The Hi"', '"remove Hi"',
            'Remove The "hi"', "Delete The “hi”",
            "Delete First Word", "Remove First Word"
        ],
        removeMr: [
            ...generateToolCombinations(["Delete", "Remove", "Removes", "Subtract"], ["The", null], ["Mr.", "Mr", "Mister"])
        ],
        removeHiMr: [
            ...generateToolCombinations(["Delete", "Remove"], ["The", null], ["Hi Mr.", "Hi Mr", "Hi Mrs."]),

            '"delete The Hi Mr. "',
        ],
        removeAbcd: [
            ...generateToolCombinations(["Delete", "Remove", "Without"], ["The", null], ["Abcd", "Abcd.", "'abcd'"]),

		    '"remove Abcd"', "Mr. Delete The Abcd"
        ],
        removeThe: [
            ...generateToolCombinations(["Remove", "Delete", "Without"], ["The The", "The", "The The The"]),

            "Delete First Word", "Remove First Word",
            '"remove The The"', '"delete The The"',
            "Delete The With Spacing"
        ],
        removeQuote: [
            ...generateToolCombinations(["Delete", "Remove", "Without"], ["The", null], ["Quotation Mark", "Quotation Marks"]),
        ],
        removeHyphens: [
            ...generateToolCombinations(["Delete", "Remove", "Without"], ["The", null], ["Hyphen", "Hyphens"]),
            ...generateToolCombinations(["Replace Hyphen With"], ["Empty", "Spaces", "Spacing", "Nothing"]),

            "With Spacing", "With Spaces",

            "Subtract The Hyphen",
        ],
        prependHashtag: [
            "Prepend Hashtag", "Prepend The Hashtag",
            "Prepend Hashtag :3", "Prepend Hashtag <3", "Prepend Hashtag :)", "Prepend Hashtag :) :<3",

            "Pweaseprependhashtag", "Pweaseprependhashtagorelse", "#pweaseprependhashtag",
            "Write A Hashtag In Front",
            "Hashtag The Hashtag", "Put This In Hashtag"
        ],
        removeHashtag: [
            "Unplural", "Unpluralize",
            "Delete The Hashtag", "Remove The Hashtag",
            "Delete The Hyphen", "Remove The Hyphen",
            "Capitalize"
        ],
        prependMr: [
            ...generateToolCombinations(["Prepend", "Prepends"], ["The", null], ["Mr", "Mr."]),

            "Mr. &", "Mr. .", "Mr. _", "Mr. '", "Mr.mr."
        ],
        quote: [
            "Put This In Quotation Marks", "Put Them In Quotation Marks",
            '"put This In Quotation Marks"',
            '"quotation Mark"', '"quotation Marks"', '"prepend Quotation Mark"', '"prepend Quotation Marks"',
            '"[/inst]"', '"[/st]"', '"[/nst]"',
        ],
        appendSpace: [
            "U+0020",

            ...generateToolCombinations(["Append"], ["The", null], ["Space", "U+0020"]),

            ...spellingTools.letter1(' '),

            "U++0020", "Prepend Space", "Prepend U+0020"
        ],
    };


    const charAliases = {
        " ": [
            "Append Space", // and other space append tools
        ],
        "-": [
            "Append Hyphen" // and other hyphen append tools
        ],
    };



    // every single spellTech the bot uses is listed here.

    const spellTechs = [
	    {
          tech: '"hi "',
          deSpell: (line) => [...quickTools.removeHi],
          disabled: false,

        }, {
          tech: '"hi Mr. "',
          deSpell: (line) => [
              { start: `"hi Mr. ${line}"`,
               tools: [...quickTools.removeMr, ...quickTools.removeHiMr] },

              { start: `"hi Mr. ${line}"`,
               goal: `Mr. ${line}`,
               tools: [...quickTools.removeHi] },

              { start: `Mr. ${line}`,
                tools: [...quickTools.removeMr] }
          ],
          disabled: false,

        }, {
          tech: '""',
          deSpell: (line) => [
		      { start: `"${line}"`,
               tools: [...quickTools.removeQuote, line[0], line.slice(0, 2), line.slice(0, 3), line.slice(0, 4), line.split(" ")[0] ] },

              { start: `"${line}"`, goal: `#${line}`,
               tools: [...quickTools.prependHashtag] },

              { start: `#${line}`,
               tools: [...quickTools.removeHashtag, line[0], line.slice(0, 2), line.slice(0, 3), line.slice(0, 4), line.split(" ")[0] ] },

              { start: `#${line}`, goal: `Mr. ${line}`,
               tools: [...quickTools.prependMr] },

              { start: `Mr. ${line}`,
               tools: [...quickTools.removeMr] }
          ],
          aliveLength: 3,
          disabled: false,

        }, {
          tech: '"abcd"',
          deSpell: (line) => [...quickTools.removeAbcd],
          disabled: true,

        }, {
          tech: '""',
          deSpell: (line) => [...quickTools.removeHyphens],
          modifyLine: (line) => line.replace(/ /g, '-'),
          aliveLength: 2,
          disabled: true,

        }, {
          tech: '"the-"',
          deSpell: (line) => [...quickTools.removeThe],
          modifyLine: (line) => line.replace(/ /g, '-'),
          disabled: true,
        }
    ];

    unsafeWindow.convert = function (input) {
        return input.split('\n').map(x => x.split('\t')).filter(x => x[1] === 'No').map(x => x[0]).join('\n');
    }


    const recipesIng = new Map();
    const recipesRes = new Map();
    const emojiMap = new Map();
    let elementStorageSet;

    window.addEventListener('load', () => {
        unsafeWindow.document.querySelector('.container').__vue__.elements.forEach(item => {
            emojiMap.set(item.text, {
                "result": item.text,
                "emoji": item.emoji,
                "isNew": item.discovered
            });
        });


        console.log(emojiMap.size);
        unsafeWindow.emojiMap = emojiMap;
    });


    window.addEventListener('load', () => {
        elementStorageSet = new Set(document.querySelector(".container").__vue__.elements.map(x => x.text));
        unsafeWindow.elementStorageSet = elementStorageSet;
    });


    unsafeWindow.revive = async function (input) {
        const words = input.split('\n').filter(Boolean).map(x => x.trim())
        console.log("Revive called with words:", words);

        const start = Date.now();

        await runReviveWords(words);
        console.log(words.map(word => `Spelled: ${word}${makeLineage(word)}`).join('\n\n'));

        const finish = Date.now();

        const success = words.reduce((acc, line) => resultExists(line) ? acc + line + "\n" : acc, "");
        const fail = words.reduce((acc, line) => !resultExists(line) ? acc + line + "\n" : acc, "");

        console.log(`✅ Successfully Revived Words:\n${success}`);
        console.log(`❌ Failed to Revive Words:\n${fail}`);
    }


    async function runReviveWords(lines) {
        const queue = [...lines];
        const promises = [];

        async function worker() {
            while (queue.length > 0) await tryToReviveWord(queue.shift());
        }

        for (let i = 0; i < parallelBots; i++) {
            promises.push(worker());
        }

        await Promise.all(promises);
    }


    async function tryToReviveWord(line) {
        console.log("starting to revive word:", line);

        const quoteChars = ['""', "''", "``", "“”"];

        // Check if line is quoted with any of the characters in quoteChars
        for (const quote of quoteChars) {
            if (line.startsWith(quote[0]) && line.endsWith(quote[1])) {
                await splitWordChunkRevive({ tech: quote }, line.slice(1, -1));
                finishedSpelling(line, line);
                return;
            }
        }


        for (let j = 0; j < spellTechs.length; j++) {
            let spellTech = spellTechs[j];
            if (spellTech.disabled || line.length > 30 - spellTech.tech.length) continue;

            console.log("Reviving:", line, "using", spellTech)

            if (finishedSpelling(line)) return;

            const modifiedLine = spellTech.modifyLine ? spellTech.modifyLine(line) : line;

            if (!resultExists(spellTech.tech.splice(-1, modifiedLine))) {
                await splitWordChunkRevive(spellTech, modifiedLine, line)
            }


            if (!resultExists(line) && resultExists(spellTech.tech.splice(-1, modifiedLine))) {
                let currentElement = spellTech.tech.splice(-1, modifiedLine);
                let deSpellSteps = spellTech.deSpell(line);

                // If no advanced stuff with start and goal
                if (!deSpellSteps[0].tools) {
                    await tryCombine([currentElement], deSpellSteps, [line]);
                } else {
                    for (let k = 0; k < deSpellSteps.length; k++) {
                        const deSpellStep = deSpellSteps[k];
                        const start = deSpellStep.start ? deSpellStep.start : currentElement;
                        const goal = deSpellStep.goal ? deSpellStep.goal : line;

                        console.log("Attempting deSpell:", deSpellStep, "for", start, "->", goal);

                        if (resultExists(start) && !resultExists(goal)) {
                            await tryCombine([start], deSpellStep.tools, [goal, line]);
                        }
                        if (finishedSpelling(line)) return;
                    }
                }
            }

            if (finishedSpelling(line, spellTech.tech.splice(-1, modifiedLine))) return;
        }
    }


    async function splitWordChunkRevive(spellTech, line, realLine) {
        let start = 0;  // Tracks the starting position of each word
        for (let i = 0; i <= line.length; i++) {
            if (resultExists(spellTech.tech.slice(-1, line)) || resultExists(line) || resultExists(realLine)) return;

            if (spacingChars.includes(line[i]) || i === line.length) {
                const word = line.slice(start, i);
                const spacingChar = line[start - 1] || "";
                const currentElement = spellTech.tech.splice(-1, line.slice(0, start - spacingChar.length));
                const currentGoal = spellTech.tech.splice(-1, line.slice(0, i));

                // if result exists or currentElement <= spellTech + aliveLength
                if (!resultExists(currentGoal) && (resultExists(currentElement) || currentElement.length <= spellTech.tech.length + (spellTech.aliveLength ? spellTech.aliveLength : 1))) {
                    await trySpellingQuotes(currentElement, spacingChar+word, spellTech.tech.length + 1, realLine);
                }
                start = i + 1;
            }
        }
    }



    async function trySpellingQuotes(start, word, aliveLength, realLine, fastMode = true) {
        const goal = start.splice(-1, word);
        if (resultExists(goal) || resultExists(realLine)) return true;
        let lastSpelling = "";
        console.log("Try Spelling:", start, "and", word, "->", goal);

        for (let i = 0; i < word.length; i++) {
            const char = word.charAt(i);
            const currentSpelling = start.splice(-1, word.slice(0, i));
            const currentGoal = start.splice(-1, word.slice(0, i+1));

            if (!resultExists(goal) && (resultExists(currentSpelling) || currentSpelling.length <= aliveLength)) {
                // generate this: ["C", "Ca", "Cat"]
                const currentGoalUntilGoal = [currentGoal];
                for (const char of word.slice(i+1)) {
                    const lastStep = currentGoalUntilGoal[currentGoalUntilGoal.length - 1];
                    currentGoalUntilGoal.push(lastStep.splice(-1, char));
                }

                // If a result for an even later item already exists skip until there step by step
                let skipOuter = false;
                if (fastMode) for (const x of currentGoalUntilGoal) {
                    if (resultExists(x)) {
                      skipOuter = true;
                      break;
                    }
                }

                if (skipOuter) continue;
                await tryCombine([currentSpelling],
                     [
                      // only do the first 3 in each 'category'
                      word,
                      ...(charAliases[char] || []),

                      ...spellingTools.letter2(word.slice(i, i + 2)).slice(0, 3),   // "st"
                      ...spellingTools.word(word).slice(1, 3),                      // "catstone"
                      ...spellingTools.word(word.slice(i)).slice(0, 3),             // "stone"
                      ...spellingTools.letter1(char).slice(0, 3),                   // "s"
                      ...spellingTools.word(word.slice(0, i + 1)).slice(0, 3),      // "cats"
                      ...spellingTools.word(word.slice(0, i + 2)).slice(0, 3),      // "catst"
                      `String.append('${word.slice(i - 1, i + 1)}')`, `String.append('${word.slice(i - 1, i + 1)}');`,   // "ts" (pretty much only for String.append(' A'))
                      `String.append("${word.slice(i - 1, i + 1)}")`, `String.append("${word.slice(i - 1, i + 1)}");`,   // "ts"
                      ...spellingTools.word(word.slice(0, -1)).slice(0, 3),         // "catston"
                      ...spellingTools.word(word.slice(0, -1)).slice(0, 3),         // "ston"

                      // Again, but this time do EVERYTHING
                      ...spellingTools.letter2(word.slice(i, i + 2)).slice(3),      // "st"
                      ...spellingTools.word(word).slice(3),                         // "catstone"
                      ...spellingTools.word(word.slice(i)).slice(3),                // "stone"
                      ...spellingTools.letter1(char).slice(3),                      // "s"
                      ...spellingTools.word(word.slice(0, i + 1)).slice(3),         // "cats"
                      ...spellingTools.word(word.slice(0, i + 2)).slice(3),         // "catst"
                      ...spellingTools.word(word.slice(0, -1)).slice(3),            // "catston"
                      ...spellingTools.word(word.slice(0, -1)).slice(3),            // "ston"
                     ],
                     fastMode ? currentGoalUntilGoal : [currentGoal, goal]
                );
            }
            if (resultExists(goal) || resultExists(realLine)) return true;
            if (resultExists(currentGoal)) lastSpelling = currentGoal;
        }

        // if it failed, try again but this time HARDER
        if (fastMode) {
            if (!resultExists(`"${word}"`)) {
                await tryCombine([word], [...quickTools.quote], [`"${word}"`]);
            }
            return trySpellingQuotes(start, word, aliveLength, realLine, false);
        } else {
            failedToSpell(start.splice(-1, word), lastSpelling);
        }
    }


    async function tryCombine(inputs1, inputs2, expected) {
        console.log("\nTrying", inputs1, "+", inputs2, "=", expected);
        for (const input1 of inputs1) {
            for (const input2 of inputs2) {
                const response = await combine(input1.nealCase(), input2.nealCase());
                if (
                    response &&
                    expected.some(exp => response.result === exp.nealCase)
                ) {
                    return response;
                }
            }
        }
        return false;
    }


    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    let lastCombination = Date.now();

    async function combine(first, second) {
        first = first.trim();
        second = second.trim();

        if (!first || !second) return; // Return if any of the ele is an empty string

        if (recipeExists(first, second)) {
            // console.log(`Combine: (logged) ${first} + ${second} = ${recipeExists(first, second)}`)
            return { result: recipeExists(first, second) }
        }

        const waitingDelay = Math.max(0, combineTime - (Date.now() - lastCombination));
        lastCombination = Date.now() + waitingDelay;
        await delay(waitingDelay);

        if (recipeExists(first, second)) {
            // console.log(`Combine: (logged) ${first} + ${second} = ${recipeExists(first, second)}`)
            lastCombination -= combineTime;
            return { result: recipeExists(first, second) }
        }

        // console.log(first, first.nealCase(), emojiMap.get(first.nealCase()));
        // console.log(second, second.nealCase(), emojiMap.get(second.nealCase()));

        const response = await unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse(
            (emojiMap.get(first.nealCase())
             ? { text: first.nealCase(), emoji: emojiMap.get(first.nealCase()).emoji }
             : { text: first.nealCase() }
            ),

            (emojiMap.get(second.nealCase())
             ? { text: second.nealCase(), emoji: emojiMap.get(second.nealCase()).emoji }
             : { text: second.nealCase() }
            )
        );

        const [sortedFirst, sortedSecond] = [first.nealCase(), second.nealCase()].sort();

        recipesIng.set(`${sortedFirst}  ${sortedSecond}`, response.result);
        if (!recipesRes.get(response.result)) {
            recipesRes.set(response.result, []);
        }
        recipesRes.get(response.result).push([sortedFirst, sortedSecond]);

         if (!emojiMap.has(response.result)) emojiMap.set(response.result, response);

        addElementToStorage(first);
        addElementToStorage(second);
        addElementToStorage(response.result);

        // console.log(`Combine: (request) ${first} + ${second} = ${response ? response.result : response}`)
        return response;
    }


    function finishedSpelling(element, lastSpelling) {
        if (!element) return;
        element = element.nealCase();

        if (resultExists(element)) {
            console.log(`Finished spelling: ${element}${makeLineage(element)}`)
            addElementToStorage(element);
            return true;
        } else if (lastSpelling) {
            failedToSpell(element, lastSpelling.nealCase());
        }
    }

    function failedToSpell(element, lastSpelling) {
        console.log("Failed to spell:", element, makeLineage(lastSpelling));
        if (addFailedSpellingsToElements) addElementToStorage(lastSpelling);
    }


    function makeLineage(element, visited=[]) {
        if (!element) return "";
        element = element.nealCase();
        if (recipesRes.get(element)) {
            visited.push(element);
            const ings = recipesRes.get(element)[0].map(x => x.nealCase());
            if (ings &&
                (ings[0] !== element && ings[1] !== element) &&
                (!visited.includes(ings[0]) && !visited.includes(ings[1]))
            ) {
                return makeLineage(ings[0], visited) +
                       makeLineage(ings[1], visited) +
                       `\n${ings[0]} + ${ings[1]} = ${element}`
            }
        }
        return "";
    }


    function addElementToStorage(elementText) {
        if (!elementText ||
            !emojiMap.has(elementText) ||
            elementStorageSet.has(elementText) ||
            (unsafeWindow.$nuxt._route.matched[0].instances.default.elements.filter(e => e.text === elementText).length !== 0)
        ) {
            return;
        }

        // console.log(`Added  ${elementText}  to elements`);

        elementStorageSet.add(elementText);
        const element = emojiMap.get(elementText);

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
        const [sortedFirst, sortedSecond] = [first.nealCase(), second.nealCase()].sort();
        return recipesIng.get(`${sortedFirst}  ${sortedSecond}`);
    }


    function resultExists(result) {
        if (result) return recipesRes.get(result.nealCase());
    }


    const nealCasedLookup = new Map();

    String.prototype.nealCase = function () {
        if (nealCasedLookup.has(this)) {
            return nealCasedLookup.get(this);
        }

        let result = '';
        for (let i = 0; i < this.length; i++) {
            const char = this[i];
            result += (i === 0 || this[i - 1] === ' ') ? char.toUpperCase() : char.toLowerCase();
        }

        nealCasedLookup.set(this, result);
        return result;
    };


    String.prototype.splice = function(start, newSubStr, delCount = 0) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
})();
