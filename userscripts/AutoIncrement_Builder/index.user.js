// ==UserScript==
// @name            AutoIncrement Builder
// @namespace       AutoIncrement Builder
// @match           https://neal.fun/infinite-craft/*
// @grant           unsafeWindow
// @version         1.1.1
// @author          Alexander_Andercou
// @author          Mikarific
// @description     A builder tool that can apply a given tool multiple times
// @downloadURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/AutoIncrement_Builder/index.user.js
// @updateURL       https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/AutoIncrement_Builder/index.user.js
// ==/UserScript==


(function () {
    let inFocus = null;
    let saveCrafts = false;
    let crafted = [];

    async function mockCraft(a, b) {
        if (!saveCrafts) {
            setTimeout(() => {
                for (let craftid of crafted) {
                    let instanceToDelete = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances.findIndex((x) => x.id == craftid);
                    unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances.splice(instanceToDelete, 1);
                }
            }, 200);
        }

        let response = await unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse(a, b);
        if (response.result == "Nothing") {
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].errorSound.play();
            return null;
        }

        let center = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCenterOfCraft(a, b);
        let id = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].instanceId++;
        crafted.push(id);
        let newInstance = {
            id: id,
            text: response.result,
            emoji: response.emoji,
            disabled: !1,
            zIndex: id,
            discovered: response.isNew,
        };
        let existingElement = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((x) => x.text.toLowerCase() == newInstance.text.toLowerCase());
        if (existingElement != null) {
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].playInstanceSound();
        } else {
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.push({
                text: newInstance.text,
                emoji: newInstance.emoji,
                discovered: newInstance.isNew,
            });

            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].saveItems();
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].$nextTick(function () {
                unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].setPinwheelCoords(center);
            });
            newInstance.isNew = true;
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].discoverySound.play();
            let l = [0.9, 1];
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].rewardSound.rate(l[Math.floor(Math.random() * l.length)]);
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].rewardSound.play();
        }
        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances.push(newInstance);

        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].$nextTick(function () {
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].calcInstanceSize(newInstance),
                unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].setInstancePosition(newInstance, center.x - newInstance.width / 2, center.y - newInstance.height / 2),
                unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].setInstanceZIndex(newInstance, id);
        });

        return response.result;
    }

    function sleep(ms = 0) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function getSave() {
        return new Promise((resolve, reject) => {
            const handleClick = HTMLElement.prototype.click;
            HTMLElement.prototype.click = () => {
                HTMLElement.prototype.click = handleClick;
            };
            const bodyObserver = new MutationObserver((mutations, observer) => {
                for (const mutation of mutations) {
                    if (mutation.type !== "childList") continue;
                    const anchor = Array.from(mutation.addedNodes).find((node) => node.download === "infinitecraft.json");
                    if (anchor) return fetch(anchor.href).then(resolve);
                }
            });
            bodyObserver.observe(document.body, { childList: true, subtree: true });
            handleClick.call(document.querySelector(".setting[for=import-save] + .setting"));
            setTimeout(() => {
                bodyObserver.disconnect();
                reject("Timed out");
            }, 1500);
        });
    }

    function elementToItem(element, modal = null, array1ToRemove = null, array2ToRemove = null) {
        let item = document.createElement("div");

        item.classList.add("item");
        const itemEmoji = document.createElement("span");
        itemEmoji.classList.add("item-emoji");
        itemEmoji.appendChild(document.createTextNode(element.emoji ?? "⬜"));

        item.appendChild(itemEmoji);
        item.appendChild(document.createTextNode(` ${element.text} `));
        item.style.display = "inline-block";

        item.addEventListener("mousedown", (e) => {
            if (e.which == 3) {
                if (modal) modal.removeChild(item);

                if (array1ToRemove) {
                    console.log("deletes:", array1ToRemove);
                    leftSide = leftSide.filter((x) => x.text != element.text);
                    searchCountSpanLeft.textContent = leftSide.length.toString() + " elements";
                    console.log("deleted:", array1ToRemove, leftSide);
                }

                if (array2ToRemove) {
                    rightSide = rightSide.filter((x) => x.text != element.text);
                    searchCountSpanRight.textContent = rightSide.length.toString() + " elements";
                    console.log("deleted:", array2ToRemove, rightSide);
                }
            }
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].playInstanceSound();
        });
        return item;
    }

    function AtIntersection(element1, element2, callback, array1 = null, array2 = null) {
        // console.log("intersection happends");
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();

        if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y) {
            if (element1.classList.contains("instance")) {
                console.log("element1:", element1);
                let instance = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances.find((x) => (x.elem != null ? x.elem.id == element1.id : false));

                if (instance) {
                    unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.instances.filter((x) => x.id != instance.id);

                    element2.appendChild(elementToItem(instance, element2, array1, array2));

                    callback(instance);
                }
            }
        }
    }

    let fileString = "";
    async function buildAutoIncrement(base, tool, regex) {
        fileString = "";
        let found = [];
        console.log("start building:", base, tool, regex);
        let baseElement = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((x) => x.text == base);
        let toolElement = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((x) => x.text == tool);

        if (baseElement == null || toolElement == null) {
            console.log("You don't own the base element or the tool");
            return;
        }
        console.log("start building:", baseElement, toolElement);

        let inputElement = baseElement;
        let regexValue = RegExp(regex, "u");
        console.log("rev:", regexValue);

        const getCraftResponse = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse;
        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse = exportFunction(
            (...args) =>
                new window.Promise(async (resolve) => {
                    const response = await getCraftResponse(...args);

                    fileString += args[0].text + " + " + args[1].text + " = " + response.result + "\n";
                    resolve(response);
                }),
            unsafeWindow
        );

        let resultText = "";
        let left = document.querySelector(".sidebar").getBoundingClientRect().left / 2;
        do {
            resultText = await mockCraft(
                { emoji: inputElement.emoji, text: inputElement.text, top: window.innerHeight / 2, left: left, height: 41, width: 100 },
                { emoji: toolElement.emoji, text: toolElement.text, top: window.innerHeight / 2, left: left, height: 41, width: 100 }
            );

            if (!resultText) break;
            if (found.includes(resultText)) break;

            found.push(resultText);

            inputElement = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.elements.find((x) => x.text == resultText);
            await sleep(500);
        } while (inputElement && resultText.match(regexValue));

        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse = getCraftResponse;
        {
            const link = document.createElement("a");

            // Create a blog object with the file content which you want to add to the file
            const file = new Blob([fileString], { type: "text/plain" });

            // Add file content in the object URL
            link.href = URL.createObjectURL(file);

            // Add file name
            link.download = "resultAutoIncrement.txt";

            // Add click event to <a> tag to save file.
            link.click();
            URL.revokeObjectURL(link.href);
        }
    }

    let regexBaseText = "";
    let baseInput = "";
    let toolInput = "";
    
    async function makeStartModal() {
        let setInput = false;
        let setTool = false;
        crafted = [];

        window.addEventListener("keydown", (event) => {
            if (inFocus) {
                console.log("focus", inFocus);
                inFocus.focus();
                // inFocus.value += event.key;
            }
        });

        let modal = document.createElement("dialog");
        modal.style.position = "absolute";
        modal.style.top = (150).toString() + "px";
        modal.style.left = (document.querySelector(".sidebar").getBoundingClientRect().left / 2 - 150).toString() + "px";
        let startButton = document.createElement("button");
        startButton.textContent = "Start building";
        startButton.addEventListener("click", () => {
            modal.close();
            if (baseInput != "" && toolInput != "" && regexBaseText != "") buildAutoIncrement(baseInput, toolInput, regexBaseText);
        });

        let regexInput = document.createElement("input");
        regexInput.addEventListener("change", () => {
            regexBaseText = regexInput.value;
        });

        let toolDiv = document.createElement("div");
        let inputDiv = document.createElement("div");
        inputDiv.style.float = "left";
        toolDiv.style.float = "right";
        inputDiv.style.height = "100px";
        inputDiv.style.minWidth = "200px";
        toolDiv.style.minWidth = "200px";
        toolDiv.style.height = "100px";
        inputDiv.style.border = "solid 3px var(--border-color)";
        toolDiv.style.border = "solid 3px var(--border-color)";

        let inputTitle = document.createElement("p");
        inputTitle.textContent = "Base element";

        let toolTitle = document.createElement("p");
        toolTitle.textContent = "Tool";
        let regexTitle = document.createElement("p");
        regexTitle.textContent = "Regex condition";
        toolDiv.appendChild(toolTitle);
        inputDiv.appendChild(inputTitle);

        regexInput.addEventListener("focus", () => {
            inFocus = regexInput;
        });
        
        regexInput.addEventListener("mouseout", () => {
            inFocus = null;
        });

        modal.appendChild(toolDiv);
        modal.appendChild(inputDiv);
        modal.appendChild(document.createElement("br"));
        modal.appendChild(document.createElement("br"));
        modal.appendChild(regexTitle);
        modal.appendChild(regexInput);
        modal.appendChild(document.createElement("br"));
        modal.appendChild(document.createElement("br"));
        modal.appendChild(startButton);

        // Add observers on instances
        let instancesObserver = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                for (let node of mutation.addedNodes) {
                    node.addEventListener("mouseup", (event) => {
                        if (setInput == false) {
                            AtIntersection(node, inputDiv, (elm) => {
                                if (setInput == false) {
                                    setInput = true;
                                    baseInput = elm.text;
                                }
                            });
                        }
                        if (setTool == false) {
                            AtIntersection(node, toolDiv, (elm) => {
                                if (setTool == false) {
                                    setTool = true;
                                    toolInput = elm.text;
                                }
                            });
                        }
                    });
                }
            }
        });

        instancesObserver.observe(document.querySelector(".instances"), {
            childList: true,
            subtree: true,
            attributeOldValue: true,
        });

        document.querySelector(".container").appendChild(modal);
        modal.show();
    }

    let imgsrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAGmVYSWZNTQAqAAAACAABARIAAwAAAAEAAAAAAAAAALW3flMAAAABc1JHQgCuzhzpAAAABHNCSVQICAgIfAhkiAAAAtFJREFUeJzt3LGuVFUYhuFvedDEEihsKCxsSUzsrfAm5BpsKKgsjB2xpSTR6CXYaCy4AxESCjoLGkLoTeSwrEhOSM4HMjt775N5nmTaf/3Nmz2TrNkJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMBbjK0XYF1zzqtJ7m+9xzlOk/wxxri99SKvXdp6AVb3YZLrWy9xjpdJnmy9xFkfbL0A7JlAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKB4mgvK845byW5duCYx0l+HGO8WmAlduhoA0nydZIvDpzxa5Kfk1ykQE6T/L3wzI+TXE7y0cJzN3fMgRylMcbzOednC4+9keSH7Pca/XsTyBEaY5wuOW/OeZGeoP+LH+lQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQ7OrNinPOr5J8kmSscNyVBWZcS3JzzrnomwrP8XCM8WiFczhjV4EkuZ3kyyQnK5y1xNPz8yT3FpjzLr5PIpCV7S2QkzOfi2BkvV3XeKryBr9BoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCASKvd3mvZPkp6xzc/W7JJ8eOONBkrtJ1vg/yF8rnMEbdhXIGOP3tc6ac36TwwN5muSXMca/C6zEDvmKBYVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoBAIFAKBQiBQCAQKgUAhECgEAoVAoNjVq0dX9luSJwfO+DPJqwV2YaeONpAxxrdb78D++YoFhUCgEAgUAoFCIFAIBAqBQCEQKAQChUCgEAgUAoHiaC8rsqh/kjxLcvnAOS+TvDh8HQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAFf0H2kM9toyYv18AAAAASUVORK5CYII=";
    let csstext = "width: 42px;cursor: pointer;opacity: .8;-webkit-user-select: none;-moz-user-select: none;user-select: none;filter:invert(1) !important";
    
    window.addEventListener("load", async () => {
        let img = document.createElement("img");
        img.src = imgsrc;
        img.style.cssText = csstext;
        img.addEventListener("click", makeStartModal);

        document.querySelector(".side-controls").appendChild(img);
    }, false);
})();
