// ==UserScript==
// @name          ULTIMATE reviver (KIT)
// @match         https://neal.fun/infinite-craft/
// @author        Catstone
// @namespace     Catstone
// @downloadURL   https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Kit/index.user.js
// @version       3.5
// @description   Kit can literally make anything, apart from some stuff. Open the Console (Ctrl + Shift + I) and type revive(`words`) in there. Seperate multiple elements by new lines. To modify tools used, check out the settings at the top of the code.
// ==/UserScript==
debugger;

(function () {
    'use strict';

    // Settings
    const set = {
        legitMode: true, // if you toggle this off, it will use tools that are NOT in your save. BE CAREFUL. (will also add everything it gets to the save)

        spacingChars: new Set([' ', '-']), // the bot splits the line into chunks so its easier to revive: "A Cat Loves-Food" -> "A", "Cat", "Loves", "Food"

        parallelBots: 15, // more bots means less combining downtime, also means less understanding of what da hell is going on
        combineTime: 500, // milliseconds

        addSuccessfulSpellingsToElements: true, // Adds Successful spellings to sidebar
        addFailedSpellingsToElements: true, // Adds Failed Spellings to sidebar
        addEverythingToElements: false,  // can be changed to true or false to add everything to sidebar

        canMoveBackLetter: true,  // if it fails it goes back 1 letter first

        deadcheckAndSkip: false,  // first deadchecks an element... if its alive, it gets skipped
        deadcheckElements: ['?', '??', '???'],

        logMessages: 2,  // 0 -> Off, 1 -> starting to revive and despell messages, 2 -> trying to combine messages, 3 -> debug info
    }
    // can also be modified ingame using `revive.settings.example = true`, but this will reset on refresh






    const Window = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

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
          quote, splice(quote, -1, ' '), splice(quote, -1, 'quotation Mark'), splice(quote, -1, 'quotation Marks'), splice(quote, -1, 'put This In Quotation Marks'), splice(quote, -1, 'put Them In Quotation Marks'),
          splice(quote, 'prepend Quotation Mark'), splice(quote, 'prepend Quotation Marks'), splice(quote, 'prepend Quote'),
          splice(quote, 'prepend Quotation'), splice(quote, '[/inst]'), splice(quote, '[/st]'), splice(quote, '[/nst]'),
          ..."abcdefghijklmnopqrstuvwxyz!\"#$%&'()*+,-./0123456789".split('').flatMap(x => splice(quote, -1, x)), `Append(${quote})`,
        ],
        addParentheses: (parent) => [
          parent, splice(parent, -1, 'prepend Left Parenthesis'), splice(parent, -1, 'prepend Left Parentheses'), splice(parent, -1, 'prepend Opening Parenthesis'), splice(parent, -1, 'prepend Opening Parentheses'),
          ...generateToolCombinations(["Prepend"], ["Left", "Opening", null], ["Parenthesis", "Parentheses", "Bracket", "Braces"]), "Prepend " + splice(parent, -1, 'parenthesis'),
          "Prepend " + splice(parent, -1, 'parentheses'), "Append " + splice(parent, -1, 'parenthesis'), "Append " + splice(parent, -1, 'parentheses'), splice(parent, -1, ' '),splice(parent, -1, 'parenthesis'),
          splice(parent, -1, 'put This In Parenthesis'), splice(parent, -1, 'put This In Parentheses'),
        ]

    }

    // every single spellTech the bot uses is listed here.
    const spellTechs = [
      {     // convertable quote stuff
          trigger: (elem) => elem.startsWith('“') && elem.endsWith('”'),
          tech: '""',
          deSpell: (line) => [...tools.quirkyQuote('“”')],
          modifyElement: (elem) => elem.slice(1, -1),
          stopAfter: true,
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('“') && elem.endsWith('”'),
          tech: '"a"',
          modifyElement: (elem) => elem.slice(1, -1),
          stopAfter: false,
          disabled: false,
          deSpell: (line) => [
              {
                  start: `"a${line}"`,
                  goal: `"${line}"`,
                  tools: [...tools.removeFirstCharacter, ...tools.removeChar("a")]
              },
              {
                  start: `"${line}"`,
                  tools: tools.quirkyQuote('“”'),
              },
          ],
      }, {
          trigger: (elem) => elem.startsWith('❝') && elem.endsWith('❞'),
          tech: '""',
          deSpell: (line) => [{
                    start: `"${line}"`,
                    tools: [...tools.quirkyQuote('❝❞')]
                }, {
                    start: `"${line}"`,
                    goal: `“${line}”`,
                    tools: tools.quirkyQuote('“”'),
                }, {
                    start: `“${line}”`,
                    tools: [...tools.quirkyQuote('❝❞')]
                },],
          modifyElement: (elem) => elem.slice(1, -1),
          stopAfter: true,
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('‘') && elem.endsWith('’'),
          tech: "''",
          deSpell: (line) => [...tools.quirkyQuote('‘’')],
          modifyElement: (elem) => elem.slice(1, -1),
          stopAfter: true,
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('「') && elem.endsWith('」'),
          tech: '""',
          deSpell: (line) => [...tools.quirkyQuote('「」')],
          modifyElement: (elem) => elem.slice(1, -1),
          stopAfter: false,
          disabled: false,



      }, {  // normal quote stuff!!
          trigger: (elem) => elem.startsWith('"') && elem.endsWith('"'),
          tech: '""',
          deSpell: (line) => [],
          modifyElement: (elem) => elem.slice(1, -1),
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('"') && elem.endsWith('"'),
          tech: '"0"',
          deSpell: (line) => [...tools.removeFirstCharacter, ...tools.removeChar('0')],
          modifyElement: (elem) => elem.slice(1, -1),
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('"') && elem.endsWith('"'),
          tech: '"a"',
          deSpell: (line) => [...tools.removeFirstCharacter, ...tools.removeChar('a')],
          modifyElement: (elem) => elem.slice(1, -1),
          disabled: false,
      },  {
          trigger: (elem) => elem.startsWith('"') && elem.endsWith('"'),
          tech: '"b"',
          deSpell: (line) => [...tools.removeFirstCharacter, ...tools.removeChar('b')],
          modifyElement: (elem) => elem.slice(1, -1),
          disabled: false,
      },  {
          trigger: (elem) => elem.startsWith('"') && elem.endsWith('"'),
          tech: '"c"',
          deSpell: (line) => [...tools.removeFirstCharacter, ...tools.removeChar('c')],
          modifyElement: (elem) => elem.slice(1, -1),
          disabled: false,
      },  {
          trigger: (elem) => elem.startsWith('"') && elem.endsWith('"'),
          tech: '"d"',
          deSpell: (line) => [...tools.removeFirstCharacter, ...tools.removeChar('d')],
          modifyElement: (elem) => elem.slice(1, -1),
          stopAfter: true,
          disabled: false,



      }, {  // fancy quotes
          trigger: (elem) => elem.startsWith("'") && elem.endsWith("'"),
          tech: "''",
          deSpell: (line) => [],
          modifyElement: (elem) => elem.slice(1, -1),
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith("`") && elem.endsWith("`"),
          tech: "``",
          deSpell: (line) => [],
          modifyElement: (elem) => elem.slice(1, -1),
          disabled: false,


      }, {  // parentheses!!1!
          trigger: (elem) => elem.startsWith('(') && elem.endsWith(')'),
          tech: '""',
          deSpell: (line) => [...tools.addParentheses('()')],
          modifyElement: (elem) => elem.slice(1, -1),
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('[') && elem.endsWith(']'),
          tech: '""',
          deSpell: (line) => [...tools.addParentheses('[]')],
          modifyElement: (elem) => elem.slice(1, -1),
          disabled: false,
      }, {
          trigger: (elem) => elem.startsWith('{') && elem.endsWith('}'),
          tech: '""',
          deSpell: (line) => [...tools.addParentheses('{}')],
          modifyElement: (elem) => elem.slice(1, -1),
          disabled: false,




      },  {   // #element
          trigger: (elem) => elem.startsWith('#'),
          tech: '""',
          deSpell: () => [...tools.prependHashtag],
          modifyElement: (elem) => elem.slice(1),
          disabled: false,
      },  {   // @element
          trigger: (elem) => elem.startsWith('@'),
          tech: '""',
          deSpell: (elem) => [...tools.prependAt, "@"+elem.slice(0, 1), "@"+elem.slice(0, 2)],
          modifyElement: (elem) => elem.slice(1),
          disabled: false,
      },  {   // Mr. Element
          trigger: (elem) => elem.startsWith('Mr. '),
          tech: '"hi Mr. "',
          deSpell: (elem) => [...tools.removeHi],
          modifyElement: (elem) => elem.slice(4),
          disabled: false,
    	}, {
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












      },  {   // completely normal spelling
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
            tech: '"hi-"',
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
          tech: '"the-"',
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







    const o = {
        recipesIng: new Map(),
        recipesResPerElement: new Map(), // gets cleared
        elementLineageMap: new Map(),

        lastCombination: Date.now(),
        currentRequests: new Map(),  // no duplicate requests

        failedSpellingsMap: new Map(), // gets cleared
        aliveSet: new Set(),
        emojiMap: new Map(),
        elementStorageMap: new Map(),    // stores every element with true, also stores icCase of every element with false
        processedElementsList: [],

        icCasedLookup: new Map(),  // optimization to store icCased Elements
    }




    if (set.legitMode) set.addEverythingToElements = true;


    window.addEventListener('load', () => {
        if (set.addFailedSpellingsToElements || set.addSuccessfulSpellingsToElements || set.addEverythingToElements) {
            o.elementStorageMap = new Map(document.querySelector(".container").__vue__.elements.map(x => [x.text, true]));
            for (const element of o.elementStorageMap.keys()) {
                const elementIC = icCase(element);
                if (!o.elementStorageMap.has(elementIC)) o.elementStorageMap.set(icCase(element), false);
            }
        }

        Window.revive = async function (input) {
            const elems = input.split('\n').filter(Boolean).map(x => icCase(x.trim()));
            console.log("Revive called with words:", elems);
            console.time();

            await reviveElements(elems);

            console.timeEnd();
            Window.revive.progress();
        }

        Window.revive['progress'] = function () {
            makeGroupMessage('Lineages', 'purple', o.processedElementsList.filter(x => isAlive(x) && o.elementLineageMap.has(x)), list => list.map(x => `Revived: ${x}${o.elementLineageMap.get(x)}`).join('\n\n'));
            makeGroupMessage('Successfully Revived Elements', 'green', o.processedElementsList.filter(x => isAlive(x) && o.elementLineageMap.get(x)), list => list.join('\n'));
            makeGroupMessage('Failed to Revived Elements', 'red', o.processedElementsList.filter(x => !isAlive(x)), list => list.join('\n'));
            makeGroupMessage('Deadchecked And Alive', 'gray', o.processedElementsList.filter(x => isAlive(x) && !o.elementLineageMap.get(x)), list => list.join('\n'));
        }


        Window.revive['variables'] = o;  // expose all structures
        Window.revive['settings'] = set;  // expose all settings
    });

    const makeGroupMessage = (name, color, list, listToMessage) => {
        if (list.length > 0) {
            console.group(`%c${name} (${list.length})`, `background: ${color}; color: white`);
            if (list.length > 0) console.log(listToMessage(list));
            console.groupEnd();
        }
    }





    async function reviveElements(elements) {
        // parallelizing stuff (very gamer)
        const queue = [...elements];
        let processedElements = 0;

        const interval = setInterval(() => {
            console.log(processedElements, "/", elements.length, "elements processed -", Math.round(processedElements / elements.length * 100 * 100) / 100, "%");
        }, 30 * 1000);  // 30 seconds


        async function worker() {
            while (queue.length > 0) {
                const elem = queue.shift();
                if (!o.processedElementsList.includes(elem)) {
                    if (!set.deadcheckAndSkip || !await deadcheck(elem)) {
                        o.recipesResPerElement.set(elem, new Map());
                        o.failedSpellingsMap.set(elem, new Set());

                        await reviveElement(elem);

                        o.elementLineageMap.set(elem, makeLineage(elem));
                        o.recipesResPerElement.delete(elem);
                        o.failedSpellingsMap.delete(elem);
                    }
                    processedElements++;
                    o.processedElementsList.push(elem);
                }
            }
        }

        const workers = Array(set.parallelBots).fill().map(() => worker());
        await Promise.all(workers);
        clearInterval(interval);
    }



    async function reviveElement(element) {
        if (set.logMessages >= 1) console.log("starting to revive element:", element);

        for (const spellTech of spellTechs) {
            const modifiedElement = spellTech.modifyElement ? spellTech.modifyElement(element) : element;

            if (spellTech.disabled
                || (spellTech.trigger && !spellTech.trigger(icCase(element)))
                || modifiedElement.length + spellTech.tech.length > 30) continue;

            // defaults
            spellTech.spliceNum ??= -1;
            spellTech.aliveLength ??= 2;


            await chunkRevive(spellTech, modifiedElement, element);
            await deSpell(spellTech, modifiedElement, element);

            if (finishedSpelling(element)) return;
            if (spellTech.stopAfter) break;
        }
        failedToSpell(element);
    }



    async function chunkRevive(spellTech, element, realElement) {
        const goal = splice(spellTech.tech, spellTech.spliceNum, element);

        const alives = Array(element.length).fill(false);
        let movedBack = false;

        for (let i = 0; i < element.length; i++) {

            const char = element[i]; // Current character

            const currentWordStart = element.slice(0, i+1).split``.findLastIndex(x => set.spacingChars.has(x)) + 1;  // -1 works in my favour
	          let currentWordEnd = element.slice(i+1).split``.findIndex(x => set.spacingChars.has(x));
	          currentWordEnd = currentWordEnd === -1 ? element.length : (i + currentWordEnd + 1)

            const word = element.slice(currentWordStart, currentWordEnd);   // current word
            const startWord = element.slice(currentWordStart, i);           // already spelled part of the word
            const finishWord = element.slice(i, currentWordEnd);            // Remaining part of the word
            const next2Chars = char + (element[i+1] || "");
            const lastChar = element[i-1] || "";
            const currentSpelling = splice(spellTech.tech, spellTech.spliceNum, element.slice(0, i));


            if (set.logMessages >= 3) console.log({spellTech: spellTech, element: element, realElement: realElement},
                                      {i: i, word: word, goal: goal, alives: alives, startWord: startWord, finishWord: finishWord, char: char, next2Chars: next2Chars, lastChar: lastChar, currentSpelling: currentSpelling})

            if (i === 0 || i < spellTech.aliveLength || isAlive(currentSpelling)) {
                alives[i] = true;
                const checkAlive = alives[i+1];
                if (await tryCombine(
                  [currentSpelling],
                  [
                    // only do the first 3 in each 'category'
                    word,                                                           // spelling "catstone" and KIT already spelled "cat"
                    ...(set.spacingChars.has(lastChar) ? spellTools.letter2(lastChar + char).slice(0, 3) : []),
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
                    ...(set.spacingChars.has(lastChar) ? spellTools.letter2(lastChar + char).slice(3) : []),
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
                  [...(allStrings(currentSpelling, spellTech.spliceNum, element.slice(i)).filter((x, index) => ((alives[i+1]) ? index : true))) /* <- filters first element out if next one was already visited */, realElement],
                  realElement
                )) {
                    // successfull spelling cycle
                    movedBack = false;
                }
            }
            if (isAlive(realElement) || isAlive(goal)) return;


            if (set.canMoveBackLetter && i === element.length - 1) {
                if (movedBack) break;
                else {
                    movedBack = true;
                    i = alives.findLastIndex(x => x) - 2; // 1 before last alive
                    if (i < -1) break;
                }
            }
        }
        // if this point was reached, it failed.
        const lastExistingSpelling = splice(spellTech.tech, spellTech.spliceNum, element.slice(0, alives.findLastIndex(x => x) - 1));
        addFailedSpelling(realElement, lastExistingSpelling);
    }


    async function deSpell(spellTech, element, realElement) {
        let deSpellSteps = spellTech.deSpell(element);

        const currentElement = splice(spellTech.tech, spellTech.spliceNum, element);

        // if there is no fancy deSpellStep stuff make it fancy
        if (!deSpellSteps[0] || !deSpellSteps[0].tools) deSpellSteps = [{ tools: deSpellSteps }];

        for (const deSpellStep of deSpellSteps) {
            const start = deSpellStep.start ? deSpellStep.start : currentElement;
            const goal = deSpellStep.goal;  // can be undefined

            if (isAlive(start)) {
                if (set.logMessages >= 1) console.log("Attempting deSpell for", start, "->", goal);
                await tryCombine([start], deSpellStep.tools, [...(goal ? goal : []), realElement], realElement);
                addFailedSpelling(realElement, start);
            }
            if (isAlive(realElement)) return;
        }
    }



    function finishedSpelling(element) {
        if (isAlive(element)) {
            element = icCase(element);
            console.log(`Finished spelling: ${element}${makeLineage(element)}`)
            if (set.addSuccessfulSpellingsToElements) addElementToStorage(element);
            return true;
        }
    }

    function addFailedSpelling(element, failedSpelling) {
        element = icCase(element);
        o.failedSpellingsMap.get(element).add(failedSpelling);
    }

    function failedToSpell(element) {
        element = icCase(element);
        let failedSpellings = o.failedSpellingsMap.get(element);
        if (failedSpellings.size > 0) {
            failedSpellings = [...failedSpellings].map(icCase);
            console.log(`Failed to spell ${element} with all kinds of tools... I guess i'm not powerful enough :(\nThese were the failed spellings:\n${failedSpellings.join('\n')}`);
            if (set.addFailedSpellingsToElements) failedSpellings.forEach(addElementToStorage);
        }
    }



    function makeLineage(element, recursion={ recipeMap: o.recipesResPerElement.get(element), visited: new Set() }) {
        element = icCase(element);
        const recipe = recursion.recipeMap.get(element);
        if (recipe) {
            recursion.visited.add(element);
            const [first, second] = recipe.map(icCase);
            if (first && second && first !== element && second !== element && !recursion.visited.has(first) && !recursion.visited.has(second)) {
                const prevLineage = makeLineage(first, recursion) + makeLineage(second, recursion);
                if (set.addEverythingToElements) addElementToStorage(element);
                return prevLineage + `\n${first} + ${second} = ${element}`;
            }
        }
        return "";
    }



    async function deadcheck(element) {
        for (const deadcheckElement of set.deadcheckElements) {
            if (await combine(element, deadcheckElement) !== 'Nothing') return true;
        }
    }


    async function tryCombine(inputs1, inputs2, expected, element) {
        if (expected.some(isAlive)) return true;
        expected = expected.map(icCase);
        inputs1 = inputs1.map(icCase).filter(x => x !== element).filter(x => !set.legitMode || o.elementStorageMap.has(x));
        inputs2 = inputs2.map(icCase).filter(x => x !== element).filter(x => !set.legitMode || o.elementStorageMap.has(x));
        if (inputs1.length === 0 || inputs2.length === 0) return false;

        if (set.logMessages >= 2) console.log("\nTrying", inputs1, "+", inputs2, "=", expected);
        for (const input1 of inputs1) {
            for (const input2 of inputs2) {
                const response = await combine(input1, input2);

                const x = o.recipesResPerElement.get(element);
                if (!x.get(response)) x.set(response, [input1, input2]);

                if (response && expected.some(exp => response === exp)) {
                    return response;
                }
            }
        }
        return false;
    }


    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function combine(first, second) {
        // console.log("combine", first, "+", second);
        if (!first || !second || first.length > 30 || second.length > 30) return;

        [first, second] = [first.trim(), second.trim()].sort();
        const combString = `${first}=${second}`;

        const recExists = o.recipesIng.get(combString);
        if (recExists) return recExists;

        // if recipe is already requested
        const requestExists = o.currentRequests.get(combString);
        if (requestExists) return requestExists;


        const promise = (async () => {
            const waitingDelay = Math.max(0, set.combineTime - (Date.now() - o.lastCombination));
            o.lastCombination = Date.now() + waitingDelay;
            await delay(waitingDelay);

            const response = await Window.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse({ text: first }, { text: second });
            const result = response?.result ?? 'Nothing';

            o.recipesIng.set(combString, result);

            if (result !== "Nothing") {
                o.emojiMap.set(result, response);
                o.aliveSet.add(result);
                o.aliveSet.add(first);
                o.aliveSet.add(second);
            }

            return result;
        })();

        o.currentRequests.set(combString, promise);
        const result = await promise;
        o.currentRequests.delete(combString);
        return result;
    }


    function addElementToStorage(elementText) {
        if (set.logMessages >= 3) console.log("adding to storage:", elementText, o.emojiMap.has(elementText));
        if (!elementText || !o.emojiMap.has(elementText) || o.elementStorageMap.get(elementText) === true) return;
        o.elementStorageMap.set(elementText, true);
        const elementTextIC = icCase(elementText);
        if (!o.elementStorageMap.has(elementTextIC)) o.elementStorageMap.set(elementTextIC, false);

        const element = o.emojiMap.get(elementText);

        Window.$nuxt._route.matched[0].instances.default.elements.push(element);
        Object.defineProperty(element, 'text', Object.getOwnPropertyDescriptor(element, 'result'));
        delete element.result;

        Object.defineProperty(element, 'discovered', Object.getOwnPropertyDescriptor(element, 'isNew'));
        delete element.isNew;

        let craftData = JSON.parse(localStorage.getItem("infinite-craft-data"));
        craftData.elements.push(element);
        localStorage.setItem("infinite-craft-data", JSON.stringify(craftData));
    }


    const isAlive = (element) => o.aliveSet.has(icCase(element));


    function icCase(input) {
        if (o.icCasedLookup.has(input)) return o.icCasedLookup.get(input);

        let result = '';
        const len = input.length;

        for (let i = 0; i < len; i++) {
            const char = input[i];
            result += (i === 0 || input[i - 1] === ' ') ? char.toUpperCase() : char.toLowerCase()
        }

        o.icCasedLookup.set(input, result);
        return result;
    };

    // splice("abcde", 2, '69')  -> "ab69cde"
    const splice = (str, i, newSubStr, delCount=0) => str.slice(0, i) + newSubStr + str.slice(i + Math.abs(delCount));

    // allStrings("abcde", 4, "420")    -> ["abcd4e", "abcd42e", "abcd420e"]
    const allStrings = (string, i, insertedStr) => Array.from(insertedStr, (_, index) => splice(string, i, insertedStr.slice(0, index + 1)));
})();
