// ==UserScript==
// @name          ULTIMATE reviver (KIT)
// @match         https://neal.fun/infinite-craft/
// @author        Catstone
// @namespace     Catstone
// @downloadURL   https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Kit/index.user.js
// @version       3.2
// @description   Kit can literally make anything, apart from some stuff. Open the Console (Ctrl + Shift + I) and type revive(`words`) in there. Seperate multiple elements by new lines. To modify tools used, check out the settings at the top of the code.
// ==/UserScript==

(function () {
    'use strict';

    // Settings
    const spacingChars = new Set([' ', '-']); // the bot splits the line into chunks so its easier to revive: "A Cat Loves-Food" -> "A", "Cat", "Loves", "Food"
    const parallelBots = 15; // more bots = less combining downtime, also means less understanding of what da hell is going on
    const combineTime = 400; // 400ms
    const addSuccessfulSpellingsToElements = true; // Adds Successful spellings to sidebar
    const addFailedSpellingsToElements = true; // Adds Failed Spellings to sidebar
    const logMessages = true; // wether it logs what its doing
    const Window = unsafeWindow || window; // change this to window if you are on mobile i guess

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
            '"remove Mr."', '"remove The Mr."', '"removes Mr."', '"removes The Mr."', "Remove Mr. Without Correction",
        ],
        removeAbcd: [
          ...generateToolCombinations(["Delete", "Remove", "Without"], ["The", null], ["Abcd", "Abcd.", "'abcd'"]),
          '"remove Abcd"', "Mr. Delete The Abcd",],
        removeHi: [
          ...generateToolCombinations(["Delete", "Remove", "Without", "Deletes"], ["The", null], ["Word", null], ["Hi", "'hi'"]),
          '"remove The Hi"', '"delete The Hi"', '"remove Hi"', 'Remove The "hi"', "Delete The “hi”", "Delete First Word", "Remove First Word",
        ],
        removeHiMr: [
          ...generateToolCombinations(["Delete", "Remove"], ["The", null], ["Hi Mr.", "Hi Mr", "Hi Mrs.", "Hi Mr."]),
          '"delete The Hi Mr. "',
        ],
        removeThe: [
          ...generateToolCombinations(["Remove", "Delete", "Without"], ["The The", "The", "The The The"]),
          "Delete First Word", "Remove First Word", '"remove The The"', '"delete The The"', "Delete The With Spacing",
        ],
        removeQuote: [
          ...generateToolCombinations(["Delete", "Remove", "Without"], ["The", null], ["Quotation Mark", "Quotation Marks"]),
        ],
        removeHyphens: [
          ...generateToolCombinations(["Delete", "Remove", "Without"], ["The", null], ["Hyphen", "Hyphens"]),
          ...generateToolCombinations(["Replace Hyphen With"], ["Empty", "Spaces", "Spacing", "Nothing"]),
          "With Spacing", "With Spaces", "Subtract The Hyphen",
        ],
        removeFirstCharacter: [
          ...generateToolCombinations(["Delete", "Remove", "Without"], [null, "The"], ["First"], ["Character", "Letter", "Characters", "Letters", "Deleter"]),
        ],
        removeChar: (char) => [
            ...generateToolCombinations(["Delete", "Remove", "Without"], ["The", null], [null, "Letter", "Character"], [char, `"${char}"`, `'${char}'`]),
            `String.remove(${char})`, `String.remove("${char}")`, `String.remove('${char}')`, `Seq.remove(${char})`, `Seq.remove("${char}")`, `Seq.remove('${char}')`,
        ],
        removeHashtag: [
          "Unplural", "Unpluralize", "Delete The Hyphen", "Remove The Hyphen", "Delete The Hashtag", "Remove The Hashtag", "Capitalize",
        ],
        prependHashtag: [
          "Prepend Hashtag :3", "Pweaseprependhashtag", "Prepend Hashtag <3", "Prepend Hashtag :)", "Prepend Hashtag", "Pweaseprependhashtagorelse", "#pweaseprependhashtag",
          "Prepend Hashtag :) :<3", "Write A Hashtag In Front", "Hashtag The Hashtag", "Put This In Hashtag",
        ],
        prependMr: [
          ...generateToolCombinations(["Prepend", "Prepends"], ["The", null], ["Mr", "Mr."]),
          "Mr. &", "Mr. .", "Mr. _", "Mr. '", "Mr.mr."
        ],
        prependAt: [
          "@convert.to.twitter.handle", "@word", "String.prepend('@')", 'String.prepend("@")', "String.prepend('@');", 'String.prepend("@");',
          "@element", "@water", "@fire", "@earth", "@wind",
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
          quote.splice(-1, 'prepend Quotation Mark'), quote.splice(-1, 'prepend Quotation Marks'), quote.splice(-1, 'prepend Quote'),
          quote.splice(-1, 'prepend Quotation'), quote.splice(-1, '[/inst]'), quote.splice(-1, '[/st]'), quote.splice(-1, '[/nst]'),
          ..."abcdefghijklmnopqrstuvwxyz!\"#$%&'()*+,-./0123456789".split('').flatMap(x => quote.splice(-1, x)), `Append(${quote})`,
        ],
        addParentheses: (parent) => [
          parent, parent.splice(-1, 'prepend Left Parenthesis'), parent.splice(-1, 'prepend Left Parentheses'), parent.splice(-1, 'prepend Opening Parenthesis'), parent.splice(-1, 'prepend Opening Parentheses'),
          ...generateToolCombinations(["Prepend"], ["Left", "Opening", null], ["Parenthesis", "Parentheses", "Bracket", "Braces"]), "Prepend " + parent.splice(-1, 'parenthesis'),
          "Prepend " + parent.splice(-1, 'parentheses'), "Append " + parent.splice(-1, 'parenthesis'), "Append " + parent.splice(-1, 'parentheses'), parent.splice(-1, ' '), parent.splice(-1, 'parenthesis'),
          parent.splice(-1, 'put This In Parenthesis'), parent.splice(-1, 'put This In Parentheses'),
        ]

    }

    // every single spellTech the bot uses is listed here.
    const spellTechs = [
      {
            trigger: (elem) => elem.startsWith('#'),   // element starts with
            tech: '""',
            deSpell: () => [...tools.prependHashtag],
            modifyElement: (elem) => elem.slice(1),
            disabled: false,
      },


      { // convertable quote stuff
          trigger: (elem) => elem.startsWith('“') && elem.endsWith('”'),
          tech: '""',
          deSpell: (line) => [...tools.quirkyQuote('“”')],
          stopAfter: true,
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('❝') && elem.endsWith('❞'),
          tech: '""',
          deSpell: (line) => [...tools.quirkyQuote('❝❞')],
          stopAfter: true,
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('‘') && elem.endsWith('’'),
          tech: '""',
          deSpell: (line) => [...tools.quirkyQuote('‘’')],
          stopAfter: true,
          disabled: false,


      }, {  // normal quote stuff!!
          trigger: (elem) => elem.startsWith('"') && elem.endsWith('"'),
          tech: '""',
          deSpell: (line) => [],
          stopAfter: true,
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith("'") && elem.endsWith("'"),
          tech: "''",
          deSpell: (line) => [],
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith("`") && elem.endsWith("`"),
          tech: "``",
          deSpell: (line) => [],
          disabled: false,


      }, {  // parentheses!!1!
          trigger: (elem) => elem.startsWith('(') && elem.endsWith(')'),
          tech: '""',
          deSpell: (line) => [...tools.addParentheses('()')],
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('[') && elem.endsWith(']'),
          tech: '""',
          deSpell: (line) => [...tools.addParentheses('[]')],
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('{') && elem.endsWith('}'),
          tech: '""',
          deSpell: (line) => [...tools.addParentheses('{}')],
          disabled: false,
      },




      {   // #element
          trigger: (elem) => elem.startsWith('#'),
          tech: '""',
          deSpell: () => [...tools.prependHashtag],
          modifyElement: (elem) => elem.slice(1),
          disabled: false,
      },
      {   // @element
          trigger: (elem) => elem.startsWith('@'),
          tech: '""',
          deSpell: (elem) => [...tools.prependAt, "@"+elem.slice(0, 1), "@"+elem.slice(0, 2)],
          modifyElement: (elem) => elem.slice(1),
          disabled: false,
      },
      {   // Mr. Element
          trigger: (elem) => elem.startsWith('Mr. '),
          tech: '""',
          deSpell: (elem) => [
              { start: `"${elem}"`,
               tools: [...tools.prependMr] },

              { start: `"${elem}"`, goal: `#${elem}`,
               tools: [...tools.prependHashtag] },
              { start: `#${elem}`,
               tools: [...tools.prependMr] },
          ],
          modifyElement: (elem) => elem.slice(4),
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('Mr. '),
          tech: '"hi Mr. "',
          deSpell: (elem) => [...tools.removeHi],
          modifyElement: (elem) => elem.slice(4),
          disabled: false,
    	},





      {
          tech: '"hi Mr. "',
          deSpell: (elem) => [
              { start: `"hi Mr. ${elem}"`,
               tools: [...tools.removeMr, ...tools.removeHiMr] },

              { start: `"hi Mr. ${elem}"`, goal: `Mr. ${elem}`,
               tools: [...tools.removeHi] },

              { start: `Mr. ${elem}`,
                tools: [...tools.removeMr] }
          ],
          disabled: false,

    	}, {
          tech: '"hi "',
          deSpell: (elem) => [...tools.removeHi],
          disabled: false,

      }, {
          tech: '"abcd"',
          deSpell: (elem) => [
		          { start: `"abcd${elem}"`,
               tools: [...tools.removeAbcd ] },

              // too many steps... :(
              // { start: `"abcd${elem}"`, goal: `"bcd${elem}"`,
              //  tools: [...tools.removeFirstCharacter, ...tools.removeChar('a')] },
              // { start: `"bcd${elem}"`, goal: `"cd${elem}"`,
              //  tools: [...tools.removeFirstCharacter, ...tools.removeChar('b')] },
              // { start: `"cd${elem}"`, goal: `"d${elem}"`,
              //  tools: [...tools.removeFirstCharacter, ...tools.removeChar('c')] },
              // { start: `"d${elem}"`, goal: `"${elem}"`,
              //  tools: [...tools.removeFirstCharacter, ...tools.removeChar('d')] },
          ],
          disabled: false,

      }, {
          tech: '"the "',
          deSpell: (elem) => [...tools.removeThe],
          disabled: false,

      }, {
          tech: '"a"',
          deSpell: (elem) => [...tools.removeChar('a'), ...tools.removeFirstCharacter],
          disabled: false,

      }, {
          tech: '"0"',
          deSpell: (elem) => [...tools.removeChar('0'), ...tools.removeFirstCharacter],
          disabled: false,

      }, {
          tech: '""',
          deSpell: (elem) => [
		          { start: `"${elem}"`,
               tools: [...tools.removeQuote, elem[0], elem.slice(0, 2), elem.slice(0, 3), elem.slice(0, 4), elem.split(" ")[0] ] },

              { start: `${elem}`, goal: `Mr. ${elem}`,
               tools: [...tools.prependMr] },

              { start: `"${elem}"`, goal: `#${elem}`,
               tools: [...tools.prependHashtag] },
              { start: `#${elem}`,
               tools: [...tools.removeHashtag, elem[0], elem.slice(0, 2), elem.slice(0, 3), elem.slice(0, 4), elem.split(" ")[0] ] },
              { start: `#${elem}`, goal: `Mr. ${elem}`,
               tools: [...tools.prependMr] },

              { start: `Mr. ${elem}`,
               tools: [...tools.removeMr] }
          ],
          disabled: false,

      }, {
          trigger: (elem) => elem.indexOf('-') === -1,   // element doesn't have Hyphens
          tech: '""',
          deSpell: (elem) => [...tools.removeHyphens],
          modifyElement: (elem) => elem.replace(/ /g, '-'),
          disabled: false,


      }
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
            console.time();

            await reviveElements(elems);

            const groupLineages = ['%cLineages', 'background: purple; color: white']
            const lineageMessage = elems.filter(x => resultExists(x)).map(x => `Revived: ${x}${makeLineage(x)}`).join('\n\n');
            console.group(...groupLineages);
            if (lineageMessage) console.log(lineageMessage);
            console.groupEnd(...groupLineages);

            const groupSuccess = ['%cSuccessfully Revived Elements:', 'background: green; color: white'];
            const successMessage = elems.filter(x => resultExists(x)).join('\n');
            console.group(...groupSuccess);
            if (successMessage) console.log(successMessage);
            console.groupEnd(...groupSuccess);

            const groupFailed = ['%cFailed to Revive Elements:', 'background: red; color: white'];
            const failedMessage = elems.filter(x => !resultExists(x)).join('\n');
            console.group(...groupFailed);
            if (failedMessage) console.log(failedMessage);
            console.groupEnd(...groupFailed);

            console.timeEnd();
        }
    });





    async function reviveElements(elements) {
        // parallelizing stuff (very gamer)
        const queue = [...elements];
        let processedElements = 0;

        const interval = setInterval(() => {
            console.log(processedElements, "/", elements.length, "elements processed -", Math.round(processedElements / elements.length * 100 * 100) / 100, "%");
        }, 30 * 1000);  // 30 seconds


        async function worker() {
            while (queue.length > 0) {
                await reviveElement(queue.shift());
                processedElements++;
            }
        }

        const workers = Array(parallelBots).fill().map(() => worker());
        await Promise.all(workers);
        clearInterval(interval);
    }



    async function reviveElement(element) {
        if (logMessages) console.log("starting to revive element:", element);

        for (const spellTech of spellTechs) {
            if (spellTech.disabled
                || (spellTech.trigger && !spellTech.trigger(icCase(element)))
                || element.length > 30 - spellTech.tech.length) continue;

            const modifiedElement = spellTech.modifyElement ? spellTech.modifyElement(element) : element;

            await chunkRevive(spellTech, modifiedElement, element);
            await deSpell(spellTech, modifiedElement, element);

            if (finishedSpelling(element)) return;
            if (spellTech.stopAfter) {
                failedToSpell(element);
                return;
            }
        }
        failedToSpell(element);
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

            if (i === 0 || i < 2 || resultExists(currentSpelling)) {
                await tryCombine(
                  [currentSpelling],
                  [
                    // only do the first 3 in each 'category'
                    word,                                                           // spelling "catstone" and KIT already spelled "cat"
                    ...(spacingChars.has(lastChar) ? spellTools.letter2(lastChar + char).slice(0, 3) : []),
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
                    ...(spacingChars.has(lastChar) ? spellTools.letter2(lastChar + char).slice(3) : []),
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
        let deSpellSteps = spellTech.deSpell(element);

        const currentElement = spellTech.tech.splice(-1, element);

        // if there is no fancy deSpellStep stuff make it fancy
        if (!deSpellSteps[0] || !deSpellSteps[0].tools) deSpellSteps = [{ tools: deSpellSteps }];

        for (const deSpellStep of deSpellSteps) {
            const start = deSpellStep.start ? deSpellStep.start : currentElement;
            const goal = deSpellStep.goal ? deSpellStep.goal : undefined;

            if (resultExists(start)) {
                if (logMessages) console.log("Attempting deSpell:", deSpellStep, "for", start, "->", goal);
                await tryCombine([start], deSpellStep.tools, [goal, realElement].filter(Boolean));
                addFailedSpelling(realElement, start);
            }
            if (resultExists(realElement)) return;
        }
    }



    function finishedSpelling(element) {
        if (resultExists(element)) {
            element = icCase(element);
            console.log(`Finished spelling: ${element}${makeLineage(element)}`)
            if (addSuccessfulSpellingsToElements) addElementToStorage(element);
            return true;
        }
    }

    function addFailedSpelling(element, failedSpelling) {
        element = icCase(element);
        if (!failedSpellingsMap.has(element)) failedSpellingsMap.set(element, [])
        failedSpellingsMap.get(element).push(failedSpelling);
    }

    function failedToSpell(element) {
        element = icCase(element);
        if (failedSpellingsMap.has(element)) {
            const failedSpellings = [...new Set(failedSpellingsMap.get(element).map(x => icCase(x)))];
            console.log(`Failed to spell ${element} with all kinds of tools... I guess i'm not powerful enough :(\nThese were the failed spellings:\n${failedSpellings.join('\n')}`);
            if (addFailedSpellingsToElements) failedSpellings.forEach(x => addElementToStorage(x));
        }
    }



    function makeLineage(element, visited=new Set()) {
        element = icCase(element);
        if (recipesRes.has(element)) {
            visited.add(element);
            const [first, second] = recipesRes.get(element)[0].map(x => icCase(x));
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
            expected[i] = icCase(expected[i]);
        }
        inputs1 = inputs1.map(x => icCase(x));
        inputs2 = inputs2.map(x => icCase(x));

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
    const currentRequests = new Map();  // no duplicate requests

    async function combine(first, second) {
        // console.log("combine", first, "+", second);
        if (!first || !second) return;
        if (first.length > 30 || second.length > 30) return;
        [first, second] = [first.trim(), second.trim()].sort();

        const combString = `${first}=${second}`;

        let recExists = recipeExists(first, second);
        if (recExists) return recExists;

        // if recipe is already requested
        if (currentRequests.has(combString)) {
            return currentRequests.get(combString);
        }

        const promise = (async () => {

            const waitingDelay = Math.max(0, combineTime - (Date.now() - lastCombination));
            lastCombination = Date.now() + waitingDelay;
            await delay(waitingDelay);

            recExists = recipeExists(first, second);
            if (recExists) return recExists;

            const response = await Window.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse({ text: first }, { text: second });
            const result = response?.result;

            if (result) {
                recipesIng[combString] = result;
                if (!recipesRes.has(result)) recipesRes.set(result, []);
                recipesRes.get(result).push([first, second]);

                if (result !== "Nothing") {
                    emojiMap.set(result, response);
                }

                return result;
            }
        })();

        currentRequests.set(combString, promise);
        const result = await promise;
        currentRequests.delete(combString);
        return result;
    }


    function addElementToStorage(elementText) {
        if (logMessages) console.log("adding to storage:", elementText, emojiMap.has(elementText))
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
        return ret ? recipesRes.get(icCase(result)) : recipesRes.has(icCase(result));
    }


    function allStringsFromAUntilB(a, b) {
        const aUntilB = [a];
        for (let i = 0; i < b.length - a.length; i++) {
            aUntilB.push(aUntilB[i] + b[a.length + i])
        }
        return aUntilB;
    }


    const icCasedLookup = new Map();  // optimization to store icCased Elements
    function icCase(input) {
        if (icCasedLookup.has(input)) return icCasedLookup.get(input);

        let result = '';
        const len = input.length;

        for (let i = 0; i < len; i++) {
            const char = input[i];
            result += (i === 0 || input[i - 1] === ' ') ? char.toUpperCase() : char.toLowerCase()
        }

        icCasedLookup.set(input, result);
        return result;
    };


    String.prototype.splice = function(start, newSubStr, delCount = 0) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
})();
