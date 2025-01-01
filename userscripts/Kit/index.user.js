// ==UserScript==
// @name        ULTIMATE reviver (KIT)
// @match       https://neal.fun/infinite-craft/
// @author      Catstone
// @namespace   Catstone
// @version     2.5
// @description Kit can literally make anything, apart from some stuff. Open the Console (Ctrl + Shift + I) and type revive(`words`) in there. Seperate multiple elements by new lines. To modify tools used, check out the settings at the top of the code.
// ==/UserScript==



(function() {
    'use strict';



    // Settings
    const spacingChars = new Set([' ', '-']);  // the bot splits the line into chunks so its easier to revive: "A Cat Loves-Food" -> "A", "Cat", "Loves", "Food"

    const parallelBots = 15;          // more bots = less combining downtime, also means less understanding of what da hell is going on

    const combineTime = 400;          // 400ms


    const addSuccessfulSpellingsToElements = true;  // Adds Successful spellings to sidebar
    const addFailedSpellingsToElements = true;      // Adds Failed Spellings to sidebar

    const logMessages = true;         // wether it logs what its doing


    const Window = unsafeWindow || window;    // change this to window if you are on mobile i guess






    // (["Delete", "Remove"], ["The", null], ["Mr."]) -> ["Delete The Mr.", "Delete Mr.", "Remove The Mr.", "Remove Mr." ]
    function generateToolCombinations(...arrays) {
        // Helper to recursively combine arrays
        const recursion = (i, prefix) => {
            if (i === arrays.length) return [prefix.trim()]; // Base case: return the final string
    		return arrays[i].flatMap(option => recursion(i + 1, option ? `${prefix} ${option}` : prefix))
        };
        return recursion(0, ""); // Start combining from the first group
    }

    const spellTools = {
        word: (x) =>  x !== ''
        ? [
            `${x}`, `"${x}"`, `'${x}'`
        ] : [],

        letter2: (x) =>  x !== ''
        ? [
            `${x}`, `"${x}"`, `'${x}'`,
            `String.append('${x}')`, `String.append('${x}');`, `String.append("${x}")`, `String.append("${x}");`,
            `Append '${x}'`, `Append "${x}"`, `Append('${x}')`, `Append("${x}")`, `-${x}`, `‘${x}’`, `.${x}`,
            `Seq.append('${x}')`, `String.append(\`${x}\`)`, `Append ${x}`, `String.append(${x})`,
            `Mr. String.append('${x}')`, `Mr. String.append('${x}');`, `Mr. String.append("${x}")`, `Mr. String.append("${x}");`,
            `Append ${x}`, `-${x}`, `.${x}`, `String.format('${x}')`, `String.format('${x}');`, `String.format("${x}")`, `String.format("${x}");`,
            `Mr. String.format('${x}')`, `Mr. String.format('${x}');`, `Mr. String.format("${x}")`, `Mr. String.format("${x}");`,
        ] : [],

        letter1: (x) => x !== ''
        ? [
          ...spellTools.letter2(x),  // Everything from 2 letter stuff should also work for 1 letter stuff
          `U+${x.toLowerCase().charCodeAt(0).toString(16).padStart(4, '0')}`, `Append U+${x.toLowerCase().charCodeAt(0).toString(16).padStart(4, '0')}`,
          `U+${x.toUpperCase().charCodeAt(0).toString(16).padStart(4, '0')}`, `Append U+${x.toUpperCase().charCodeAt(0).toString(16).padStart(4, '0')}`,
          `The '${x}'`, `Mr. '${x}'`,
        ] : [],
    }

    const tools = {
        removeMr: [
            ...generateToolCombinations(["Remove", "Removes", "Subtract", "Delete", "Without"], ["The", null], ["Mr.", "Mr", "Mister"]),
            // -> [ "Delete The Mr.", "Delete The Mr", "Delete The Mister", "Delete Mr.", "Delete Mr", "Delete Mister", "Remove The Mr.", "Remove The Mr", "Remove The Mister", "Remove Mr.", … ]
            '"remove Mr."', '"remove The Mr."', '"removes Mr."', '"removes The Mr."',
        ],
        removeAbcd: [
            ...generateToolCombinations(["Delete", "Remove", "Without"], ["The", null], ["Abcd", "Abcd.", "'abcd'"]),
		        '"remove Abcd"', "Mr. Delete The Abcd",
        ],
        removeHi: [
            ...generateToolCombinations(["Delete", "Remove", "Without", "Deletes"], ["The", null], ["Word", null], ["Hi", "'hi'"]),
            '"remove The Hi"', '"delete The Hi"', '"remove Hi"',
            'Remove The "hi"', "Delete The “hi”", "Delete First Word",
            "Remove First Word",
        ],
        removeHiMr: [
            ...generateToolCombinations(["Delete", "Remove"], ["The", null], ["Hi Mr.", "Hi Mr", "Hi Mrs.", "Hi Mr."]),
            '"delete The Hi Mr. "',
        ],
        removeThe: [
            "Remove The The", "Delete The The", "Remove The The The", "Delete First Word",
		        "Remove First Word", "\"remove The The\"", "\"delete The The\"",
		        "Without The The", "Remove The", "Delete The", "Without The", "Delete The With Spacing"
        ],
        removeQuote: [
            ...generateToolCombinations(["Delete", "Remove", "Without"], ["The", null], ["Quotation Mark", "Quotation Marks"]),
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
            "\"[/inst]\"", "\"[/st]\"", "\"[/nst]\"", "Put This In Quotation Marks", "Put Them In Quotation Marks",
            '"put This In Quotation Marks"',
        ],
        customAppendCharacterTools: {
            " ": ["Append Space", "U+0020", "Append U+0020", "Append The Space", "Append The U+0020", "U++0020", "Prepend Space", "Prepend U+0020"],
            "-": ["Append Hyphen", "Append-hyphen", "Add Hyphen", "Insert Dash"],
        },
        customAppendCharacter(char) {
            // Return tools for the specific character or an empty array if not found
            return this.customAppendCharacterTools[char] || [];
        },
        quirkyQuote: (quote) => [
            quote, quote.splice(-1, ' '), quote.splice(-1, 'quotation Mark'), quote.splice(-1, 'quotation Marks'), quote.splice(-1, 'put This In Quotation Marks'), quote.splice(-1, 'put Them In Quotation Marks'),
            quote.splice(-1, '[/inst]'), quote.splice(-1, '[/st]'),
            ..."abcdefghijklmnopqrstuvwxyz!\"#$%&'()*+,-./0123456789".split('').flatMap(x => quote.splice(-1, x))
        ],
        addParentheses: (parent) => [
            parent, parent.splice(-1, 'prepend Left Parenthesis'), parent.splice(-1, 'prepend Left Parentheses'), parent.splice(-1, 'prepend Opening Parenthesis'), parent.splice(-1, 'prepend Opening Parentheses'),
            ...generateToolCombinations(["Prepend"], ["Left", "Opening", null], ["Parenthesis", "Parentheses", "Bracket", "Braces"]),
            "Prepend " + parent.splice(-1, 'parenthesis'), "Prepend " + parent.splice(-1, 'parentheses'), "Append " + parent.splice(-1, 'parenthesis'), "Append " + parent.splice(-1, 'parentheses'),
            parent.splice(-1, ' '), parent.splice(-1, 'parenthesis'), parent.splice(-1, 'parentheses'), parent.splice(-1, 'put This In Parenthesis'), parent.splice(-1, 'put This In Parentheses'),
        ]

    }
    // console.log(tools)


    // every single spellTech the bot uses is listed here.
    const spellTechs = [
	    {
          tech: '"hi Mr. "',
          deSpell: (line) => [
              { start: `"hi Mr. ${line}"`,
               tools: [...tools.removeMr, ...tools.removeHiMr] },

              { start: `"hi Mr. ${line}"`, goal: `Mr. ${line}`,
               tools: [...tools.removeHi] },

              { start: `Mr. ${line}`,
                tools: [...tools.removeMr] }
          ],
          disabled: false,

    	}, {
          tech: '"hi "',
          deSpell: (line) => [...tools.removeHi],
          disabled: false,


      }, {
          tech: '"abcd"',
          deSpell: (line) => [...tools.removeAbcd],
          disabled: false,


      }, {
          tech: '""',
          deSpell: (line) => [
		          { start: `"${line}"`,
               tools: [...tools.removeQuote, line[0], line.slice(0, 2), line.slice(0, 3), line.slice(0, 4), line.split(" ")[0] ] },

              { start: `"${line}"`, goal: `#${line}`,
               tools: [...tools.prependHashtag] },

              { start: `#${line}`,
               tools: [...tools.removeHashtag, line[0], line.slice(0, 2), line.slice(0, 3), line.slice(0, 4), line.split(" ")[0] ] },

              { start: `#${line}`, goal: `Mr. ${line}`,
               tools: [...tools.prependMr] },

              { start: `Mr. ${line}`,
               tools: [...tools.removeMr] }
          ],
          aliveLength: 2,
          disabled: false,


      }, {
          tech: '""',
          deSpell: (line) => [...tools.removeHyphens],
          modifyElement: (line) => line.replace(/ /g, '-'),
          aliveLength: 2,
          disabled: false,


      }, {
          tech: '"the-"',
          deSpell: (line) => [...tools.removeThe],
          modifyElement: (line) => line.replace(/ /g, '-'),
          disabled: false,
      }
    ];





    const customReviveRules = [
      {
        code: async (element) => {
            const quotes = ['""', "''", '``'];
            const convertableQuotes = ['“”', '❝❞', '‘’'];
            const parentheses = ['()', '[]', '{}'];

            for (const quote of [...quotes, ...convertableQuotes, ...parentheses]) {
                if (!element.startsWith(quote[0]) || !element.endsWith(quote[1])) continue;

                const strippedElement = element.slice(1, -1);

                if ([...convertableQuotes, ...parentheses].includes(quote)) {
                    await chunkRevive({ tech: '""' }, strippedElement, element);
                    if (convertableQuotes.includes(quote)) {
                        await deSpell({ tech: '""', deSpell: (line) => [...tools.quirkyQuote(quote)] }, strippedElement, element);
                    }
                    else if (parentheses.includes(quote)) {
                        await deSpell({ tech: '""', deSpell: (line) => [...tools.addParentheses(quote)] }, strippedElement, element);
                    }
                }

                await chunkRevive({ tech: quote }, strippedElement, element);

                return { stopAfter: true };
            }
        },
        disabled: false,

      }, {
        code: async (element) => {

        },
        disabled: false,
      },
    ];















    const recipesIng = {};
    const recipesRes = new Map();
    // const aliveSet = new Set();   // elements from results or ingredients of recipes (not implementing because zombies mess this up sometimes :(( )
    const emojiMap = new Map();
    const failedSpellingsMap = new Map();
    let elementStorageSet = new Set();
    window.addEventListener('load', () => {
        if (addFailedSpellingsToElements || addSuccessfulSpellingsToElements) elementStorageSet = new Set(document.querySelector(".container").__vue__.elements.map(x => x.text));

        Window.revive = async function (input) {
            const elems = input.split('\n').filter(Boolean).map(x => x.trim())
            console.log("Revive called with words:", elems);

            await reviveElements(elems);

            console.log("Revived (lineages)\n" + elems.filter(x => resultExists(x)).map(x => `Revived: ${x}${makeLineage(x)}`).join('\n\n'));

            console.log(`Successfully Revived Elements:\n${elems.filter(x => resultExists(x)).join('\n')}`);
            console.log(`Failed to Revive Elements:\n${elems.filter(x => !resultExists(x)).join('\n')}`);
        }
    });





    async function reviveElements(elements) {
        // parallelizing stuff (very gamer)
        const queue = [...elements];

        async function worker() {
            while (queue.length > 0) await reviveElement(queue.shift());
        }

        const workers = Array(parallelBots).fill(worker());
        await Promise.all(workers);
    }



    async function reviveElement(element) {
        if (logMessages) console.log("starting to revive element:", element);

        for (const customRule of customReviveRules) {
            const returnValue = await customRule.code(element);

            if (returnValue) {
                if (finishedSpelling(element)) return;

                if (returnValue.stopAfter) {
                    failedToSpell(element);
                    return;
                }
            }
        }


        for (const spellTech of spellTechs) {
            if (spellTech.disabled || element.length > 30 - spellTech.tech.length) continue;

            const modifiedElement = spellTech.modifyElement ? spellTech.modifyElement(element) : element;

            await chunkRevive(spellTech, modifiedElement, element);
            await deSpell(spellTech, modifiedElement, element);

            if (finishedSpelling(element)) return;
        }
        failedToSpell(element);
    }



    function finishedSpelling(element) {
        if (resultExists(element)) {
            element = element.icCase();
            console.log(`Finished spelling: ${element}${makeLineage(element)}`)
            if (addSuccessfulSpellingsToElements) addElementToStorage(element);
            return true;
        }
    }

    function addFailedSpelling(element, failedSpelling) {
        element = element.icCase();
        if (!failedSpellingsMap.has(element)) failedSpellingsMap.set(element, [])
        failedSpellingsMap.get(element).push(failedSpelling);
    }

    function failedToSpell(element) {
        element = element.icCase();
        if (failedSpellingsMap.has(element)) {
            const failedSpellings = failedSpellingsMap.get(element).map(x => x.icCase());
            console.log(`Failed to spell ${element} with all kinds of tools... I guess i'm not powerful enough :(\nThese were the failed spellings:\n${failedSpellings.join('\n')}`);
            if (addFailedSpellingsToElements) failedSpellings.forEach(x => addElementToStorage(x));
        }
    }



    async function chunkRevive(spellTech, element, realElement) {
        const goal = spellTech.tech.splice(-1, element);
        let currentWordStart = 0;
        let currentWordEnd = 0;

        let lastExistingSpelling = spellTech.tech;


        for (let i = 0; i < element.length; i++) {

            const char = element[i]; // Current character
            if (spacingChars.has(char) || i === 0) {
                currentWordStart = i + (i !== 0);
                currentWordEnd = i + 1 + (element+" ").slice(i + 1).split('').findIndex(x => spacingChars.has(x));
            }

            const word = element.slice(currentWordStart, currentWordEnd);   // current word
            const startWord = element.slice(currentWordStart, i);           // already spelled part of the word
            const finishWord = element.slice(i, currentWordEnd);            // Remaining part of the word
            const next2Chars = char + (element[i+1] || "");
            const lastChar = element[i-1] || "";
            const currentSpelling = spellTech.tech.splice(-1, element.slice(0, i));

            // console.log({spellTech: spellTech, element: element, realElement: realElement},
            //             {word: word, goal: goal, lastExistingSpelling: lastExistingSpelling, startWord: startWord, finishWord: finishWord, char: char, next2Chars: next2Chars, lastChar: lastChar, currentSpelling: currentSpelling})

            if (currentSpelling === spellTech.tech || resultExists(currentSpelling)) {
                await tryCombine(
                  [currentSpelling],
                  [
                    // only do the first 3 in each 'category'
                    word,                                                           // spelling "catstone" and KIT already spelled "cat"
                    ...(lastChar === " " ? spellTools.letter2(" " + char).slice(0, 3) : []),
                    ...tools.customAppendCharacter(char).slice(0, 3),               // "s"
                    ...spellTools.letter2(next2Chars).slice(0, 3),                  // "st"
                    ...spellTools.word(word).slice(1, 3),                           // "catstone"
                    ...spellTools.word(element.slice(0, currentWordEnd)).slice(0, 3),// "i am catstone"
                    ...spellTools.word(finishWord).slice(0, 3),                     // "stone"
                    ...spellTools.letter1(char).slice(0, 3),                        // "s"
                    ...spellTools.word(startWord + char).slice(0, 3),               // "cats"
                    ...spellTools.word(startWord + next2Chars).slice(0, 3),         // "catst"
                    ...spellTools.word(word.slice(0, -1)).slice(0, 3),              // "catston"
                    ...spellTools.word(finishWord.slice(0, -1)).slice(0, 3),        // "ston"

                    // Again, but this time do EVERYTHING
                    ...(lastChar === " " ? spellTools.letter2(" " + char).slice(3) : []),
                    ...tools.customAppendCharacter(char).slice(3),                  // "s"
                    ...spellTools.letter2(next2Chars).slice(3),                     // "st"
                    ...spellTools.word(word).slice(3),                              // "catstone"
                    ...spellTools.word(element.slice(0, currentWordEnd)).slice(3),  // "i am catstone"
                    ...spellTools.word(finishWord).slice(3),                        // "stone"
                    ...spellTools.letter1(char).slice(3),                           // "s"
                    ...spellTools.word(startWord + char).slice(3),                  // "cats"
                    ...spellTools.word(startWord + next2Chars).slice(3),            // "catst"
                    ...spellTools.word(word.slice(0, -1)).slice(3),                 // "catston"
                    ...spellTools.word(finishWord.slice(0, -1)).slice(3),           // "ston"
                  ],
                  [...allStringsFromAUntilB(currentSpelling.slice(1, -1), goal.slice(1, -1)).slice(1).map(x => spellTech.tech[0] + x + spellTech.tech[spellTech.tech.length - 1]), realElement]
                );
            }
            if (resultExists(realElement) || resultExists(goal)) return;
            if (resultExists(currentSpelling)) lastExistingSpelling = currentSpelling;
        }
        // if this point was reached, it failed.
        addFailedSpelling(realElement, lastExistingSpelling);
    }


    async function deSpell(spellTech, element, realElement) {
        const deSpellSteps = spellTech.deSpell(element);

        const currentElement = spellTech.tech.splice(-1, element);

        if (!deSpellSteps[0].tools) {
            // if there is no fancy deSpellStep stuff
            await tryCombine([currentElement], deSpellSteps, [realElement]);
            if (resultExists(realElement)) return;
        }
        else {
            for (const deSpellStep of deSpellSteps) {
                const start = deSpellStep.start ? deSpellStep.start : currentElement;
                const goal = deSpellStep.goal ? deSpellStep.goal : undefined;

                if (logMessages) console.log("Attempting deSpell:", deSpellStep, "for", start, "->", goal);

                if (resultExists(start)) await tryCombine([start], deSpellStep.tools, [goal, realElement].filter(Boolean));
                if (resultExists(realElement)) return;
            }
        }
        // if this point was reached, it failed.
        addFailedSpelling(realElement, currentElement);
    }





    function finishedSpelling(element, failedLastSpelling) {
        if (!element) return;
        element = element.icCase();

        if (resultExists(element)) {
            console.log(`Finished spelling: ${element}${makeLineage(element)}`)
            if (addSuccessfulSpellingsToElements) addElementToStorage(element);
            return true;
        }
        else if (failedLastSpelling) {
            failedLastSpelling = failedLastSpelling.icCase()
            console.log("Failed to spell:", element, makeLineage(failedLastSpelling));
            if (addFailedSpellingsToElements) addElementToStorage(failedLastSpelling);
        }
    }



    function makeLineage(element, visited=new Set()) {
        element = element.icCase();
        if (recipesRes.has(element)) {
            visited.add(element);
            const [first, second] = recipesRes.get(element)[0].map(x => x.icCase());
            if (first && second && (first !== element && second !== element) && (!visited.has(first) && !visited.has(second))) {
                return (makeLineage(first, visited) +
                        makeLineage(second, visited) +
                        `\n${first} + ${second} = ${element}`);
            }
        }
        return "";
    }


    async function tryCombine(inputs1, inputs2, expected) {
        for (let i = 0; i < expected.length; i++) {
            if (resultExists(expected[i])) return true;
            expected[i] = expected[i].icCase();
        }
        inputs1 = inputs1.map(x => x.icCase());
        inputs2 = inputs2.map(x => x.icCase());

        if (logMessages) console.log("\nTrying", inputs1, "+", inputs2, "=", expected)
        for (const input1 of inputs1) {
            for (const input2 of inputs2) {
                const response = await combine(input1, input2);
                if (response && expected.some(exp => response === exp)) return response;
            }
        }
        return false;
    }


    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    let lastCombination = Date.now();

    async function combine(first, second) {
        // console.log("combine", first, "+", second);
        if (!first || !second) return;
        [first, second] = [first.trim(), second.trim()].sort();

        let recExists = recipeExists(first, second);
        if (recExists) return recExists;

        const waitingDelay = Math.max(0, combineTime - (Date.now() - lastCombination));
        lastCombination = Date.now() + waitingDelay;
        await delay(waitingDelay);

        const failCount = 0;
        while (failCount < 3) {
            recExists = recipeExists(first, second);
            if (recExists) return recExists;

            const response = await Window.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse({ text: first }, { text: second });
            const result = response?.result;

            if (result) {
                recipesIng[`${first}=${second}`] = result;
                if (!recipesRes.has(result)) recipesRes.set(result, []);
                recipesRes.get(result).push([first, second]);

                if (result !== "Nothing") {
                    emojiMap.set(result, response);
                }

                return result;
            }
            failCount++;
        }
    }


    function addElementToStorage(elementText) {
        console.log("adding to storage:", elementText, emojiMap.has(elementText))
        if (!elementText || !emojiMap.has(elementText) || elementStorageSet.has(elementText)) return;
        elementStorageSet.add(elementText);

        const element = emojiMap.get(elementText);

        Window.$nuxt._route.matched[0].instances.default.elements.push(element);
        Object.defineProperty(element, 'text', Object.getOwnPropertyDescriptor(element, 'result'));
        delete element.result;

        Object.defineProperty(element, 'discovered', Object.getOwnPropertyDescriptor(element, 'isNew'));
        delete element.isNew;

        let craftData = JSON.parse(localStorage.getItem("infinite-craft-data"));
        craftData.elements.push(element);
        localStorage.setItem("infinite-craft-data", JSON.stringify(craftData));
    }


    function recipeExists(first, second) {
        // first and second have to already be in icCase() and Sorted
        return recipesIng[`${first}=${second}`] || undefined;
    }

    function resultExists(result, ret=false) {
        return ret ? recipesRes.get(result.icCase()) : recipesRes.has(result.icCase());
    }


    function allStringsFromAUntilB(a, b) {
        const aUntilB = [a];
        for (let i = 0; i < b.length - a.length; i++) {
            aUntilB.push(aUntilB[i] + b[a.length + i])
        }
        return aUntilB;
    }


    const icCasedLookup = new Map();  // optimization to store icCased Elements
    String.prototype.icCase = function () {
        if (icCasedLookup.has(this)) return icCasedLookup.get(this);

        let result = '';
        for (let i = 0; i < this.length; i++) {
            const char = this[i];
            result += (i === 0 || this[i - 1] === ' ') ? char.toUpperCase() : char.toLowerCase()
        }

        icCasedLookup.set(this, result);
        return result;
    };


    String.prototype.splice = function(start, newSubStr, delCount = 0) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
})();
