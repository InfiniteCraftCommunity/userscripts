// ==UserScript==
// @name        ULTIMATE reviver (WOW)
// @match       https://neal.fun/infinite-craft/
// @author      Catstone
// @namespace   Catstone
// @version     2.2
// @description Kit can literally make anything, apart from some stuff. Open the Console (Ctrl + Shift + I) and type revive(`words`) in there. Seperate multiple elements by new lines. To modify tools used, check out the settings at the top of the code.
// ==/UserScript==



(function() {
    'use strict';



    // Settings
    const spacingChars = [' ', '-'];  // the bot splits the line into chunks so its easier to revive: "A Cat Loves-Food" -> "A", "Cat", "Loves", "Food"

    const parallelBots = 15;          // more bots = less combining downtime, also means less understanding of what da hell is going on

    const combineTime = 400;          // 400ms

    const addFailedSpellingsToElements = true;  // Cheats Failed Spellings in


    const spellingTools = {
        word: (x) =>  [
            `${x}`, `"${x}"`, `'${x}'`
        ],

        letter2: (x) =>  [
            `${x}`, `"${x}"`, `'${x}'`,
            `String.append('${x}')`, `String.append('${x}');`, `String.append("${x}")`, `String.append("${x}");`,
            `Append '${x}'`, `Append "${x}"`, `Append('${x}')`, `Append("${x}")`, `-${x}`, `‘${x}’`, `.${x}`
        ],

        letter1: (x) => [
          ...spellingTools.letter2(x),  // Everything from 2 letter stuff should also work for 1 letter stuff
          `The '${x}'`, `Mr. '${x}'`   // idk what to add here
        ],
    }

    const quickTools = {
        removeMr: [
            "Remove The Mr.", "Remove The Mr", "Remove Mr.", "Remove Mr",
            "Removes The Mr.", "Removes The Mr", "Removes Mr.", "Removes Mr",
            "Subtract The Mr.", "Subtract The Mr", "Subtract Mr.", "Subtract Mr",
            "Delete The Mr.", "Delete The Mr", "Delete Mr.", "Delete Mr"
        ],
        removeAbcd: [
            "Delete Abcd", "Delete The Abcd", "Delete Abcd.", "Delete The Abcd.",
            "Remove Abcd", "Remove The Abcd",
            "Without Abcd", "Without The Abcd",
		        "\"remove Abcd\"", "Mr. Delete The Abcd"
        ],
        removeHi: [
            "Remove Hi", "Remove The Hi", "Remove The Word Hi",
            "Delete Hi", "Delete The Hi", "Delete The Word Hi",
            "Without Hi", "Without The Hi", "Without The Word Hi",
            "\"remove The Hi\"", "\"delete The Hi\"", "\"remove Hi\"",
            "Remove The \"hi\"", "Delete The “hi”", "Delete First Word",
            "Remove First Word"
        ],
        removeThe: [
            "Remove The The", "Delete The The", "Remove The The The", "Delete First Word",
		        "Remove First Word", "\"remove The The\"", "\"delete The The\"",
		        "Without The The", "Remove The", "Delete The", "Without The", "Delete The With Spacing"
        ],
        removeQuote: [
            "Delete The Quotation Mark", "Delete The Quotation Marks", "Remove The Quotation Mark", "Remove The Quotation Marks"
        ],
        removeHyphens: [
            "Replace Hyphen With Spacing", "Delete The Hyphen", "Remove The Hyphen",
		        "Delete The Hyphens", "Remove The Hyphens", "With Spacing", "With Spaces",
		        "Remove Hyphen", "Delete Hyphen", "Without Hyphen", "Without Hyphens",
		        "Without The Hyphen", "Subtract The Hyphen", "Without The Hyphens",
		        "Replace Hyphen With Empty", "Replace Hyphen With Spaces", "Replace Hyphen With Nothing"
        ],
        prependHashtag: [
            "Prepend Hashtag :3", "Pweaseprependhashtag", "Prepend Hashtag <3", "Prepend Hashtag :)", "Prepend Hashtag",
			      "Pweaseprependhashtagorelse", "#pweaseprependhashtag", "Prepend Hashtag :) :<3", "Write A Hashtag In Front", "Hashtag The Hashtag", "Put This In Hashtag"
        ],
        removeHashtag: [
            "Unplural", "Unpluralize", "Delete The Hyphen", "Remove The Hyphen", "Delete The Hashtag", "Capitalize"
        ],
        prependMr: [
            "Prepend Mr.", "Prepends Mr.", "Prepend Mr", "Prepend The Mr.", "Prepend The Mr", "Mr. &", "Mr. .", "Mr. _", "Mr. '", "Mr.mr."
        ],
        quote: [
            "\"quotation Mark\"", "\"quotation Marks\"", "\"prepend Quotation Mark\"", "\"prepend Quotation Marks\"",
            "\"[/inst]\"", "\"[/st]\"", "\"[/nst]\"",
        ],
        appendSpace: [
            "Append Space", "U+0020", "Append U+0020", ...spellingTools.letter1(' '), "Append The Space", "Append The U+0020", "U++0020", "Prepend Space", "Prepend U+0020"
        ],

    }

    const spellTechs = [              // every single spellTech the bot uses is listed here.
	    {
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
          aliveLength: 2,
          disabled: false,


      }, {
          tech: '"hi Mr. "',
          deSpell: (line) => [
              { start: `"hi Mr. ${line}"`,
               tools: [...quickTools.removeMr, "Remove The Hi Mr", "Remove The Hi Mr.", "Delete The Hi Mr.", "Remove The Hi Mrs.", '"delete The Hi Mr. "'] },

              { start: `"hi Mr. ${line}"`, goal: `Mr. ${line}`,
               tools: [...quickTools.removeHi] },

              { start: `Mr. ${line}`,
                tools: [...quickTools.removeMr] }
          ],
          disabled: false,

    	}, {
          tech: '"hi "',
          deSpell: (line) => [...quickTools.removeHi],
          disabled: false,


      }, {
          tech: '"abcd"',
          deSpell: (line) => [...quickTools.removeAbcd],
          disabled: false,


      }, {
          tech: '""',
          deSpell: (line) => [...quickTools.removeHyphens],
          modifyLine: (line) => line.replace(/ /g, '-'),
          aliveLength: 2,
          disabled: false,


      }, {
          tech: '"the-"',
          deSpell: [...quickTools.removeThe],
          modifyLine: (line) => line.replace(/ /g, '-'),
          disabled: false,
      }
    ];
















    const recipesIng = [];
    let recipesRes = [];
    let emojiMap = [];

    unsafeWindow.revive = async function (input) {
        const words = input.split('\n').filter(Boolean).map(x => x.trim())
        console.log("Revive called with words:", words);

        await runReviveWords(words);
        console.log(words.map(word => `Spelled: ${word}${makeLineage(word)}`).join('\n\n'));
        console.log("Revived Words:\n" + words.reduce((acc, line) => resultExists(line) ? acc + line + "\n" : acc, ""));
    }


    async function runReviveWords(lines) {
        const queue = [...lines];
        const promises = [];

        async function worker() {
            while (queue.length > 0) await tryToReviveWord(queue.shift());
        }

        for (let i = 0; i < parallelBots; i++) promises.push(worker());

        await Promise.all(promises);
    }


    async function tryToReviveWord(line) {
        console.log("starting to revive word:", line)

        const quoteChars = ['""', "''", "``", "“”"];

        // Check if line is quoted with any of the characters in quoteChars
        for (const quote of quoteChars) {
            if (line.startsWith(quote[0]) && line.endsWith(quote[1])) {
                await splitWordChunkRevive({ tech: quote }, line.slice(1, -1))
                finishedSpelling(line, line)
                return;
            }
        }


        for (let j = 0; j < spellTechs.length; j++) {
            let spellTech = spellTechs[j];
            if (spellTech.disabled) continue;

            console.log("reviving:", line, "using", spellTech)

            if (line.length > 30 - spellTech.tech.length) return;
            if (finishedSpelling(line)) return;

            const modifiedLine = spellTech.modifyLine ? spellTech.modifyLine(line) : line;

            if (!resultExists(spellTech.tech.splice(-1, modifiedLine)))
                await splitWordChunkRevive(spellTech, modifiedLine, line)


            if (!resultExists(line) && resultExists(spellTech.tech.splice(-1, modifiedLine))) {
                let currentElement = spellTech.tech.splice(-1, modifiedLine);
                let deSpellSteps = spellTech.deSpell(line);

                // If no advanced stuff with start and goal
                if (!deSpellSteps[0].tools) {
                    await tryCombine([currentElement], deSpellSteps, [line]);
                }
                else {
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
                                  word,
                                  ...spellingTools.letter2(word.slice(i, i + 2)),   // "st"
                                  ...spellingTools.word(word),                      // "catstone"
                                  ...spellingTools.word(word.slice(i)),             // "stone"
                                  ...spellingTools.letter1(char),                   // "s"
                                  ...spellingTools.word(word.slice(0, i + 1)),      // "cats"
                                  ...spellingTools.word(word.slice(0, i + 2)),      // "catst"
                                  `String.append('${word.slice(i - 1, i + 1)}')`, `String.append('${word.slice(i - 1, i + 1)}');`,   // "ts" (pretty much only for String.append(' A'))
                                  `String.append("${word.slice(i - 1, i + 1)}")`, `String.append("${word.slice(i - 1, i + 1)}");`,   // "ts"
                                  ...spellingTools.word(word.slice(0, -1)),         // "catston"
                                  ...spellingTools.word(word.slice(0, -1)),         // "ston"
                                 ],
                                 fastMode ? currentGoalUntilGoal : [currentGoal, goal]);
            }
            if (resultExists(goal) || resultExists(realLine)) return true;
            if (resultExists(currentGoal)) lastSpelling = currentGoal;
        }

        // if it failed, try again but this time HARDER
        if (fastMode) {
            if (!resultExists(`"${word}"`))
                await tryCombine([word], [...quickTools.quote], [`"${word}"`])
            if (word[0] === " " && !resultExists(start.splice(-1, " ")))
                await tryCombine([start], [...quickTools.appendSpace], [start.splice(-1, " ")])
            return trySpellingQuotes(start, word, aliveLength, realLine, false);
        }
        else failedToSpell(start.splice(-1, word), lastSpelling);
    }





    async function tryCombine(inputs1, inputs2, expected) {
        console.log("\nTrying", inputs1, "+", inputs2, "=", expected)
        for (const input1 of inputs1) {
            for (const input2 of inputs2) {
                const response = await combine(input1.icCase(), input2.icCase());
                if (expected.some(exp => response.result === exp.icCase())) return response;
            }
        }
        return false;
    }



    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    let lastCombination = Date.now();

    async function combine(first, second) {
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

        const response = await unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse({ text: first }, { text: second });
        const [sortedFirst, sortedSecond] = [first.icCase(), second.icCase()].sort();

        recipesIng[`${sortedFirst}  ${sortedSecond}`] = response.result;
        if (!recipesRes[response.result]) recipesRes[response.result] = [];
        recipesRes[response.result].push([sortedFirst, sortedSecond]);

        if (!emojiMap[response.result]) emojiMap[response.result] = response;

        // console.log(`Combine: (request) ${first} + ${second} = ${response ? response.result : response}`)
        return response;
    }


    function finishedSpelling(element, lastSpelling) {
        if (!element) return;
        element = element.icCase()

        if (resultExists(element)) {
            console.log(`Finished spelling: ${element}${makeLineage(element)}`)
            addElementToStorage(element);
            return true;
        }
        else if (lastSpelling) failedToSpell(element, lastSpelling.icCase());
    }

    function failedToSpell(element, lastSpelling) {
        console.log("Failed to spell:", element, makeLineage(lastSpelling));
        if (addFailedSpellingsToElements) addElementToStorage(lastSpelling);
    }


    function makeLineage(element, visited=[]) {
        if (!element) return "";
        element = element.icCase()
        if (recipesRes[element]) {
            visited.push(element)
            const ings = recipesRes[element][0].map(x => x.icCase())
            if (ings && (ings[0] !== element && ings[1] !== element) && (!visited.includes(ings[0]) && !visited.includes(ings[1])))
                return makeLineage(ings[0], visited) +
                       makeLineage(ings[1], visited) +
                       `\n${ings[0]} + ${ings[1]} = ${element}`
        }
        return "";
    }

    function addElementToStorage(elementText) {
        if (!elementText || !emojiMap[elementText] || window.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.some(elem => elem.text === elementText)) return;
        const element = emojiMap[elementText];


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
        const [sortedFirst, sortedSecond] = [first.icCase(), second.icCase()].sort();
        return recipesIng[`${sortedFirst}  ${sortedSecond}`] || undefined;
    }

    function resultExists(result) {
        if (result) return recipesRes[result.icCase()];
    }

    String.prototype.icCase = function () {
        return this.split('').map((char, index, arr) =>
            index === 0 || arr[index - 1] === ' ' ? char.toUpperCase() : char.toLowerCase()
        ).join('');
    };

    String.prototype.splice = function(start, newSubStr, delCount = 0) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
})();
