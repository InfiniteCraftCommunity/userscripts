// ==UserScript==
// @name            Find useful tools
// @namespace       find-useful-tools
// @match           https://neal.fun/infinite-craft/*
// @grant           none
// @require         https://unpkg.com/wanakana
// @version         1.1.1
// @author          Alexander_Andercou, Mikarific
// @description     Discover all the useful tools you have in your savefile in IC
// @downloadURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Find_Useful_Tools_In_SaveFile/index.user.js
// @updateURL       https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Find_Useful_Tools_In_SaveFile/index.user.js
// ==/UserScript==


(function () {
    let keywords = ["chromatic", "delete", "remove", "append", "parenthesis", "parentheses", "prepend", "hashtag", "aprepend", "space", "#"];
    let regexes = [
        "^[^a-zA-Z0-9][a-zA-Z][^a-zA-Z0-9]{0,1}$",
        "^string.append([^a-zA-Z0-9][a-zA-Z0-9][^a-zA-Z0-9])$",
        "^mr",
        "^u[+]+[a-zA-Z0-9]+$",
        "^u[+][a-zA-Z0-9]{4}$",
        "^[^a-zA-Z]{0,1}the",
        "^withs",
        "^withouts",
        "^dr[^a-zA-Z0-9]",
        "^add+",
    ];
    
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

    function elementToItem(element, modal = null) {
        let item = document.createElement("div");

        item.classList.add("item");
        const itemEmoji = document.createElement("span");
        itemEmoji.classList.add("item-emoji");
        itemEmoji.appendChild(document.createTextNode(element.emoji ?? "⬜"));

        item.appendChild(itemEmoji);
        item.appendChild(document.createTextNode(` ${element.text} `));
        item.style.display = "inline-block";
        item.addEventListener("mousedown", (e) => {
            unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].selectElement(e, element);
        });
        return item;
    }
    
    async function countUsefulTools() {
        let modal = document.createElement("dialog");
        modal.classList.add("tools-useful");

        if (document.querySelector(".tools-useful")) document.querySelector(".container").removeChild(document.querySelector(".tools-useful"));

        let firstDiv = document.createElement("div");
        firstDiv.style.display = "flex";
        firstDiv.style.justifyContent = "space-between";

        let countSpan = document.createElement("span");
        let tools = document.createElement("p");

        let json1 = await getSave().then((x) => x.json());

        let elements = json1["elements"];
        let usefulCount = 0;
        let useful = [];
      
        for (let elem of elements) {
            let lowElm = elem["text"].toLowerCase();
            let notUseful = true;
            let hashtagTool = false;
            
            for (let key of keywords) {
                if (lowElm.includes(key)) {
                    notUseful = false;
                    if (key == "#") hashtagTool = true;

                    break;
                }
            }

            if (notUseful) {
                for (let regex of regexes) {
                    let p = new RegExp(regex);
                    if (lowElm.match(p)) {
                        notUseful = false;
                        break;
                    }
                }
            }

            if (notUseful) if (wanakana.isKana(lowElm) || wanakana.isHiragana(lowElm) || wanakana.isKatakana(lowElm) || wanakana.isKanji(lowElm)) notUseful = false;

            if (elem["text"].length >= 30) {
                notUseful = true;
            }
          
            if (!notUseful) {
                if (!hashtagTool) usefulCount += 1;
                else usefulCount += 0.5;

                useful.push(elem["text"]);
            }
        }

        useful.sort((a, b) => a.localeCompare(b));
        countSpan.textContent = "You have :" + usefulCount.toString() + " useful tools";
        tools.textContent = useful.toString();
        let closeButton = document.createElement("button");
        closeButton.textContent = "❌";
        closeButton.addEventListener("click", () => modal.close());

        firstDiv.appendChild(countSpan);
        firstDiv.appendChild(closeButton);
        modal.appendChild(firstDiv);

        useful.forEach((x, i) => {
            let pDiv = document.createElement("div");
            let p = document.createElement("p");
            p.textContent = x;

            let found = elements.find((y) => y.text == x);
            if (found) {
                let index = document.createElement("span");
                index.textContent = (i + 1).toString() + ".";
                pDiv.appendChild(index);
                pDiv.appendChild(elementToItem(found));
            }

            modal.appendChild(pDiv);
        });

        document.querySelector(".container").appendChild(modal);
        modal.showModal();

        console.log(usefulCount);
        console.log(useful);
    }

    let imgsrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+8AAAPvCAYAAACyev8lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAMm1JREFUeNrs3T9wG9md4PEeewIXksNUvXyhbLOBMmeCMjsaKrMjgaEjSdk5GincSFJ2E4nK1pGo6G4jQdllgjNng8m8VV1lToLaje7eE5pjSqJEEMSfX3d/PlUoaL3rq6sfJaC/fK9fVxUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4XxlBABAV6SUxvntKL/u5Ncwv8r/fJZf8/xa5Nfb/Dqt6/rMtAAQ7wAA+432SX77Pr8ma/yfl3B/nl/PRDwA4h0AYD/h/jS/Pdzgv7rIr3s54OemCIB4BwDYXbi/yG/TG/w/cdYE/Mw0ARDvAADxwv1iwN+1Ag+AeAcAiBnu5xb5dds98ABE9WsjAAB6Hu5FOZn+v5fL5cyEAYjIyjsA0PdwP3dW1/U3pgxARFbeAQDhvvKbwWDw1+Vy+TfTBiCaXxkBACDcf3HHtAEQ7wAAccO9GJs4AOIdACBuuAOAeAcAEO4AIN4BAOEOAOIdAKDj4X7mJwCAeAcAiBvuxVs/BQDEOwBA3HAvTv0kABDvAABxw31e1/XCTwMA8Q4AEDPci5d+GgCIdwCAuOFe2DIPgHgHAAgc7rbMAyDeAQACh3thyzwA4h0AIHC4F7bMAyDeAQACh7st8wCIdwCAwOFevPbTAUC8AwDCPW64F7bMAxDeV0YAAPQ43Bd1Xd/yUwIgOivvAEBfw72w6g6AeAcAhHvw/296RBwArWDbPADQ13C3ZR6A1rDyDgD0MdwLW+YBEO8AgHAPzpZ5AFrDtnkAoI/hbss8AK1i5R0A6Fu4F7bMAyDeAQDhHtxrPzkA2sS2eQCgb+F+Vtf1N356ALSJlXcAoE/hXtgyD4B4BwCEe3C2zAPQOrbNAwB9Cndb5gFoJSvvAEBfwr2wZR4A8Q4ACPfgbJkHoJVsmwcA+hLutswD0FpW3gGAPoR7Ycs8AOIdABDuwdkyD0Br2TYPAPQh3Ku6rl33ANBaVt4BgM6He2XLPADiHQAQ7uHZMg+AeAcAhHtwVt4BEO8AgHCPHO51XZ/5CQMg3gEA4R6XLfMAiHcAQLgHZ8s8AOIdABDukcPdlnkAxDsAINxjs2UeAPEOAAj34GyZB0C8AwDCPbCZLfMAiHcAQLjHZss8AOIdABDuwdkyD4B4BwCEe2Dzuq4XfvIAiHcAQLjH9dJPHgDxDgAI99hsmQdAvAMAwj0wW+YBEO8AgHAPzpZ5AMQ7ACDcg7NlHgDxDgAI98BsmQdAvAMAwj241/4mACDeAQDhHpst8wB00ldGAADCvSMWdV3fMgYAusjKOwAI966w6g6AeAcAhHtwHhEHQGfZNg8Awr0LbJkHoNOsvAOAcO8CW+YBEO8AgHAPzpZ5ADrNtnkAEO5tZ8s8AJ1n5R0AhHvb2TIPgHgHAIR7cK+NAICus20eAIR7m53Vdf2NMQDQdVbeAUC4t5kt8wCIdwBAuAdnyzwAvWDbPAAI97ayZR6A3vjaCGCvF+Sj/HaUX3fya2gi4c3z622OA9tyEe4x+bfpO5LDfkf+tfw7zN+TZ8YBu2flHfZzQTLJb9/n18Q0WqlclDzPr2cuUBDuodzzy7VO/L0fN9+RR6bhOxIQ73DIi5Kn+e2hSXTCoomFuVEg3A8fDLbMd+Lv/eMm3OlGxJfvyJlRwG44sA52d0EyzK93wr1TRvn1plklAuF+WFbcu/H3Xrh3x7D5jvRZBuIdWudVfom87l6c+Nki3A/LKfP+3hPTi/zzdQsE7IBt87Cbi5LHldWErlvk12339yFgDiP/23MN096/9yXsXplEp5Xvxlu+I2G7rLzD9i9KRvntgUl0Xvk5uyUC4X4Ytsy39+992b30wiQ6r/ycnxoDiHeI7kHlETe9+Vk3F6Ig3PfLlvn2mvqO7M/PulnQAMQ7hL4woR/KBaj7+hDu+2flvb3uG0Gv+I4E8Q5hL8rHlRWFvrljBAj3/Ya7+2hb+/e/fD867LNfvjMCEO8QlYuS/hkZAcJ9r2yZ9x2JnzmId0DIcW0TI0C475Ut89AediOCeAcA4d7HcLdlHgDxDgAI99hsmQdAvAMAwj04W+YBEO8AgHAPbGbLPADiHQAQ7rHZMg+AeAcAhHtwtswDIN4BAOEe2Lyu64UxACDeAQDhHtdLIwBAvAMAwj02W+YBEO9GAADCPTBb5gFAvAOAcA/OlnkAEO8AINyDs2UeAMQ7AAj3wGyZBwDxDgDCPbjXRgAA4h0AhHtstswDgHgHAOEe2KKu67kxAIB4BwDhHpdVdwAQ7wAg3IPziDgAEO8AINwDs2UeAMQ7AAj34GyZBwDxDgDCPThb5gFAvAOAcA/MlnkAEO8AINyDs2UeAMQ7AAj34F4bAQCIdwAQ7nGd1XU9MwYAEO8AINzjsmUeAMQ7AAj34GyZBwDxDgDCPbCyZd7KOwCIdwAQ7oEJdwAQ7wAg3IOzZR4AxDsAwl24B2bLPACIdwCEu3APTrgDgHgHQLgL9+BsmQcA8Q6AcCcyW+YBQLwDINyJTbgDgHgHQLgTnC3zACDeARDuBGflHQDEOwDCncjhXtf1mTEAgHgHQLgTly3zACDeARDuBGfLPACIdwCEO5HD3ZZ5ABDvAAh3YrNlHgDEOwDCneBsmQcA8Q6AcCewmS3zACDeARDuxGbLPACIdwCEO8HZMg8A4h0A4U5g87quF8YAAOIdAOFOXC+NAADEOwDCndhsmQcA8Q6AcCewcsL8Uf65TvJraBwAsL6vjQAA4c6elGB/euFnXN5m+bXIr5/ya17+XNf13KgAQLwDINyJY3LJz79qgr683larFfsS9HPPhwdAvAOAcCeOUfOaXBL2s8pqPQDiHQCEO6FNLvm7U1VW6yHi5/rYL9dAvAMg3OGiUWW1HqJxOCWIdwCEO6xtcsnfu6qyWg+AeAcA4U54o8pqPQDiHQCEO601ueTvbFVZrQdAvAMg3CG8UXX1an0J+1kO+oVxASDeARDuEMt50E+bv+sn+e2JiAfgpn5lBAAId9iZ8nf9x/z3/qFRACDeARDuENvT5u8/AIh3AIQ7BDbN/w6eGgMA4h0A4Q6xPcz/Ho6MAQDxDoBwh9isvgMg3gEQ7hDcKP/b8O8CAPEOgHCH4O4bAQDiHQDhDrFNjAAA8Q6AcIf4/1YEPADiHQDhDgAg3gFAuAMAiHcAhDsAAOIdAOEOh7IwAgDEOwD7CPfHwh02clbXtXgHQLwDsPNwH+W3ByYBGzk1AgDEOwD78H1+DY0BNvLcCAAQ7wDsw5ERwEZO6rqeGwMA4h2AnUopTSqr7rCJs/x6ZAwAiHcA9mFiBLBRuN+t6/rMKAAQ7wAAccPddnkAxDsAgHAHQLwDACDcARDvALQmSADhDoB4ByCwmRGAcAdAvAMQWBMkC5MA4Q6AeAcgtpdGAMIdAPEOQGzPKve+g3AHQLwDEFcOlBIqxyYBwh0A8Q5A7IA/zW8nJoFwF+4AiHcAYgd8WX1/ZhIIdwAQ7wDEDvhH+e1e5R54hDsAiHdogTtGQI8Dvmyhv5VfTyqPkUO4A8BWfW0EAGwx4EvQPC6vlNI4v5fXqPlff5tfw+bPowv/OQh3ABDvABwo5EvYXBk3OfKHTeSfm1z4s+BHuAOAeAcgQOSXGJpd+I9mgh/hDgDiHQDBL/gR7gCIdwAQ/Ah3ABDvABA5+H+8EPYIdwC4MY+KA4DtOhLuwh0AxDsAxHbfCIQ7AIh3AAgqpTSqPrwvHuEOfeczEcQ7AITzvREIdwAQ7wAQVHNQ3ZFJCHcAEO8AEJeD6oQ7AIh3AAjugREIdwAQ7wAQVEppkt/GJiHcAUC8A0BcHg8n3AFAvANAVM1BdVOTEO4AIN4BIK6HRiDcAUC8A0BstswLdwAQ7wAQVUqpPB5uZBLCHQDEOwDE5fFwwh0AxDsARJVSGuW3iUkIdwAQ7wAQl1V34Q4A4h0AovJ4OOEOAOIdAOIrB9UNjUG4A8C+fG0EsFWPXNBDL9gyL9y5vvLzuGsMvbMwAtiOr4wAANaXUhrnt3cmIdwBYJ9smweA67HqLtwBYO+svAPAmpqD6v5hEsIdAPbNyjsArG9qBMIdAMQ7AMRmy7xwBwDxDgBRpZTK4+FGJiHcAUC8A0Bc941AuAPAoTiwDgCukFIa5bcfTUK4A8ChWHkHgKu51124A8BBWXkHgCuklMrj4YYmIdwB4FCsvAPAl8N9KtyFOwCIdwCIzZZ54Q4A4h0AokopjfPb2CSEOwCIdwCIy6q7cAeAEBxYBwCXSCmV+9zL4+Hc7y7cAeDgrLwDwOWmwl24A4B4B4DYbJkX7gAg3gEgqpTSJL+NTEK4A4B4B4C4rLoLdwAIxYF1AHBBSmlUrQ6qQ7gDQBhW3gHgQ1MjEO4AEI2VdwC4IKX0j8op88IdAIKx8g4A/wz3qXAX7gAQ0ddGAFu98H+T3yYm0S85Puxi6o77RiDc2dl3ZPl+fGMSvTPL/9bvGgPcnJV3AKh+OahuYhLCHQDEOwDE9b0RCHcAEO8AEFRKqdznfmQSwh0AxDv0w8gIoJVKuDuoTrgDgHgH8Q4EZsu8cAcA8Q4AUTUnYI9MQrgDgHgHgLg8Hk64A4B4B4ComsfDTU1CuAOAeAeAuIS7cAcA8Q4AwdkyL9wBQLwDQFQppWnloDrhDgDiHQBCs+ou3AFAvANAVM1BdROTEO7Azo2NAMQ7AGzqgREId2AvhkYA4h0Ari2lVC4kpyYh3AFAvANAXEeVlSDhDgDiHQBCs2VeuAOAeAeAqFJKk8rhScIdAMQ7AITm8XDCHQDEOwBE5aA64Q4A4h0A4ntoBMIdAMQ7AMRmy7xwBwDxDgBRpZTK4+FGJiHcAUC8A0BcHg8n3AFAvANAVCmlUX6bmIRwBwDxDgBxWXUX7gAg3gEguKkRCHcAEO8AEFRKqYT70CSEOwCIdwCIy5Z54Q4A4h0AokopjfPb2CSEOwCIdwCIy6q7cAcA8Q4AUaWUyn3uU5MQ7gAg3gEgLuEu3AFAvANAcLbMC3cgiOYMEkC8A8AHF4lH+W1kEsIdCMMjO0G8A8An7huBcAcA8Q4AQaWURvntyCSEOwCIdwCIa2oEwh0AxDsAxOagOuEOAOIdAKJKKU0rhyIJdwAQ7wAQmoPqhDsAiHcAiKp5hvDEJIQ7AIh34Kp4EA5wOO51F+4AIN4BIKqUUrnPve+PhxPuACDeASC0adXvg+qEOwCIdwAIr89b5oU7AIh3AIitOWtiJNwBAPEOAHH1ddVduAOAeAeA+FJKo6qfB9UJdwAQ7wDQGlPhDgCIdwCI7b5wBwDEOwAElVKaVv06qE64A4B4B4DW6dOqu3AHAMQ7AO3SHFQ3Ee4ArTEyAhDvAPTP98IdQLyDeAeAoFJKw6ofj4cT7gCAeAegtUq4D4U7ACDeASCurm+ZF+4AgHgHoL1SSpOq2/dNCncAQLwD0HpdfjyccAcAxDsA7dY8Hm4q3AEA8Q4AcQl3AEC8A0BwXdwyL9wBAPEOQDeklMrj4UbCHQAQ7wAQ1wPhDgCIdwAIqjmobiLcAQDxDgBxdWnVXbgDAOIdgG5JKQ2r7pwyL9wBAPEOQCeVg+qGwh0AQLwDEFcXtswLdwBAvAPQTSmlSX4bC3cAAPEOQFz3hTsAgHgHIKgOHFQn3AEA8Q5A5wl3gG75H0YA4h2A7mnrQXXCHeByYyMA8Q5Ah6SUyuPhRsIdAEC8AxBXGw+qE+4AgHiHFhkaAWwupTTKb0fCHQBAvMMuuZ8LbqZt97oLdwBAvAPQO1PhDgAg3gEIKqVUwr0tt54IdwBAvAPQS23ZMi/cAQDxDkD/pJTKeRFtODNCuAMA4h2A3mrDqrtwBwDEOwD9lFIq97lPhTsAgHgHIC7hDgAg3gEILvKWeeEOAIh3APotpTTJbyPhDgAg3gGIK+qqu3AHAMQ7AKSURvntSLgDAIh3AOKaCncAAPEOQGzRtswLdwBAvAPAuZTSNL8NhTsAgHgHIK77wh0AQLwDEFRKaZzfJsIdAEC8AxBXlHvdhTvA/kyMAMQ7AC2RUir3uUd4PJxwBwDEOwB8xrQ6/EF1wh0AEO8A8AWH3jIv3AEA8Q4An9McVDcS7gAA4h2AuA55r7twBwDEOwCs4VvhDgAg3gGI7RAH1Ql3AEC8A0Bgwh0AEO8AINwBAMQ7AN3yVrgDAIh3AGLbR0wLdwBAvAPApnJQnzZxLdwBAMQ7AIE9F+4AAOIdgNieVdtffRfuAIB4B4BtyYFdQvtYuAMAiHcAYgf86ZYCXrgDAOIdAHYY8Cc3DHjhDgCIdwDYU8Dfzq/ZNf+r5b93S7gDAH3ztREAcKCALwF+N6U0ye/38+sov4aX/J8u8qtst3+e/zsLkwMAxDsA7D/iZ9VqBf44h/wov48u/K/nzUF3AADiHQCChPyiWq20AwBwgXveAQAAQLxDb3xrBAAAgHiH2IZGAADwqeZwUkC8AwAAgHgHAAAAxDsAAAAg3gEAAEC8AwAAAOIdAAAAxDsAAAAg3gEAAADxDgAAAOIdAAAAEO8AAACAeAcAAADxDgAAAIh3AAAAEO8AAACAeAcAAADEOwAAAIh3AAAAQLwDAACAeAcAAADEOwAAACDeAQAAQLwDAAAA4h0AAAAQ7wAAACDeAQAAAPEOAAAA4h0AAOBmxkYA4h0AAIhtaAQg3gEAAEC8AwAAAOIdAAAAEO8AAAAg3gEAAADxDgAAAOIdAAAAEO8AAACAeAcAAADxDgAAAIh3AAAAQLwDAACAeAcAAADEOwAAAIh3AAAAQLwDAAAA4h0AAADEOwAAACDeAQAAQLwDAAAA4h0AAAAQ7wAAACDeAQAAAPEOAAAAiHcAAAAQ7wAAAIB4h1gmRgAAAIh3AAAAEO8AAACAeAcAAADEOwAAAIh3AAAAQLwDAAAA4h0AAADEOwAAACDeAQAAQLwDAAAA4h0AAAAQ7wAAACDeAQAAAPEOAAAA4h0AAGAXvjUCEO8AAEBsQyMA8Q4AAADiHQAAABDvAAAAgHgHAAAA8Q4AAACIdwAAABDvAAAAgHgHAAAAxDsAAACIdwAAAEC8AwAAAOIdAAAAxDsAAAAg3gEAAEC8AwAAAOIdAAAAEO8AAAAg3gEAAADxDgAAAOIdAAAAEO8AAACAeAcAAADxDgAAAIh3AAAAQLwDAACAeAcAAADEOwAAAIh3AAAAQLwDAAAA4h0AAADEOwAAACDeAQAAQLwDAAAA4h0AAAAQ7wAAACDeAQAAAPEOAAAAiHcAAAAQ7wAAAIB4BwAAAPEOAAAAiHcAAABAvAMAAIB4BwAAAMQ7AAAAiHcAANipiREAiHcAAAAQ7wAAAIB4BwAAAMQ7AAAAiHcAAABAvAMAAIB4BzazMIJ+SikNTQEAAPEO4p3YxkYAcKU7RtBrb40AxDsAAACIdwAAAEC8AwDQbc4HARDvAAc1MgKAKzkfBEC8A4h3AADEO3C1uREAwKc8UhNAvEMkPxsBAFzKlnlmRgDiHeDQPLsYAADxDgBAq1l5BxDvEMaZEfSWezkBfE4CiHdoCQfW9ZcVJYAv+xcj6L2FEYB4BwAgtpER9Ftd1+IdxDvA4aWUrL4DiHcA8Q4tYNt8v7mfE0C8A4h3iK6uawfWuTAF4CN2JlF5xjuIdwDxDhCenUkA4h3CWRhBbzlJGeByEyMAEO8g3oliZAQAl/LLTd4aAYh3gCjc0wlwuZERAIh3iMaJ8/3lnk6Ay02MAEC8QzQ/G0F/pZRcoAJ8+Lk4MgUqp82DeIeAPC6u31ykAnzILUUA4h1Csm1evAMg3vnQwghAvANE8q0RAHzgjhFQ17V4B/EO4b6cZqbQa1aYAHwu8iG3FIJ4BwhnZAQAK81hdZ7EgVsKQbyDLylCXqxOTAHgPZ+HAOIdQrM9rN9sEQVYcQ4IxVsjAPEOUVl577d/MQKA9yZGACDeIbKfjaDXrLwDvZdSGvo8pDEzAhDvEJWV936bGAGAz0J+4XZCEO/gS4qYHFoH4PnurNR1bVEDxDuE/ZKamULv2SoK9N3ECKgsaIB4B19WBGfFCegt97tzgVV3EO/gy4rQXLQCfXZkBDQWRgDiHXxZEdkopTQyBqCn7D7i3E9GAOIdfFkR3cQIgJ6y8s65mRGAeAdfVkRn5QnonZRSuW1oaBI0nAEE4h3CWxhB702MAOih+0bAOY+JA/EObfiyEu+47x3oI1vmOSfcQbyDLy1aY2IEQF80W+ZHJkFjYQQg3kG80xbfGQHQI7bMc9FfjQDEO7SFE+eZGAHQI7bMc5FFDBDv0BozI+i9YUpJwAOdZ8s8l1gYAYh38KVFm9g6D/SBLfN8wEnzIN6hTV9aJd493xTbSAGfdfTNzAhAvEPb+K0zHhkHdFpze5DPOS5aGAGId2ibt0ZAZUUK6DZb5vmYk+ZBvEPrWHnHhS3QWSmlYeUXlLj+AfEOvrzoiLGt80BHlXAfGgMX1XU9MwUQ79C2L69F5dA6/nmBC9A1D4yAj1i4APEOvsRoNVvngU5pnu0+Nglc94B4h65waB2FrfNA11h15zIOqwPxDq3lN9C40AU6pTmobmoSuO4B8Q6+xOgi970DXfHQCLiMw+pAvEObv8QW+W1hEmSjlJKAB7rATiIuI9xBvEPrWX3n3HdGALRZSmlaeTwcrndAvENHObSOc9PmXlGAtvreCHC9A+IdumpmBFwMeCMA2qhZdR+ZBJ9h5R3EO7RbXdfly+zMJGi4VxRoq/tGwGcsmnN+APEOree30ZwrB9dNjAFok+Zzy2cXnzMzAhDv0BXuA+Miq+9A27jXHdc5IN6hF2ZGwAVHKaWRMQBtYNUd1zkg3qE36rr2pcbHrGIBPq/ogjP3u4N4h64R8Fx05LFxQHTNCfMTk+ALTo0AxDt0jfvBuKiE+0NjAIKz6o7rGxDv0Dt+M83HHlh9B6LyXHfWNDMCEO/QKZ73ziVKuE+NAQgY7uXz6alJcAXPdwfxDp01MwI+4rFxQETlth47g3BdA+Ideuu1EfCRUbM1FSCE5lGW7nVnHe53B/EOnTUzAi7hIhmI5IURsCbn+YB4h25q7gtbmAQfKavvj40BOLT8WXRUeTQc65nn6xpn+YB4h07zW2ou4+R54NDh7pA6rsOtgCDeofPcH8ZlPPcdOLTyGTQyBtZkMQL26CsjgMNIKf0/U+ASZfvhLdsQgQN8L43z2zuTYN3vq/xd9Y0xwP5YeYfD8dtqLmPLKnAoDqnDdQyId+AS7hPjc6bNChjAXjQHZvrc4TrcAgjiHXpjZgR8gdV3YF/hXqLd4yq5LivvIN6hH5pHxs1Ngs+YNI9rAtg12+W5rpmzWUC8Q9+8NAK+4KlHxwG7ZLs8G3LrH4h36J2ZEfAFo8pWVmB34W67PJuyZR4OwKPi4PAXTz9WnqnLl92u69otFsA2v3vKrp53vn/YwDx/J902Btg/K+9weH57zVXcjwrs4nNFuLMJt/yBeAdfgvAZ4+a+VIAby58n0/zmQEw2NTMCOAzb5iHGhZSt81ylnOp7u3lKAcCm3zflPvc3+eUwTDaxyN9Dt4wBDsPKO8Rg6zxXKRfats8DNwn38jnySrjjegXEO7A5W+dZx8T2eeAG3OeO6xVoMdvmIQhb57kGp88D1/2OeVx5LBw3Y8s8HJiVd4jDVjTW9aLZ/gqwTrgfCXe2wKo7iHfAlyLXNHYhDqwZ7uXzwnkZbMOJEcBh2TYPsS6y3jVhBuu4V9e1HRvA575Tyg6d8r0yMg1uaJ6/b24bAxyWlXeIxeo711G2z7soBz4X7m+EO65PQLwDu2EVlet4/9gn978Dl3ha2cmF6xMQ78Bu1HW9yG8zk+Aaxs1FOsB7KaVyj/vUJNhWuDfXJ4B4Bz5iaxrXNc0X6y7UgRLuD4U7W/baCEC8A5crW9POjIFrKve/T4wBeh3uJdrtxGGbzipb5kG8A5er69oXJZt65QA76HW4eyQc23baXJcA4h34DFvn2YQD7EC4g+sR6CjPeYe4F2M/Vh7xw2ZmdV3fNQboxXdFObSyPBLOL+3YtkX+LrllDBCHlXeI67kRsKFJc9o0INzBdQiId2DHToyAGygn0Du4CoQ7uA4B8Q7skoPr2IKHHiEHnQz3I+HOjjmoDsQ7cE22rHFTLwQ8dCrcy7/nV8KdHXNQHQTkwDqIf6Hm4Dq24biu6xNjgNaHu/Ms2DUH1UFQVt4hPqvvbIMVeBDu4LoDWszKO8S/YCtbI/9hEmxBuX/xbl3Xc6OAVn0PlMMnH5oEe/KN+90hJivvEFzzBXpiEmxB+UXQm+awK6Ad4f5CuLNHJ8IdxDtwM7awsc2Af2ULPYSP9mF+vct/9G+VfXJQHYh34Caabc4zk2CL3AMPccN9VK0eBTc2DfZonq83XGuAeAe2wG/DEfDQ/XAvwf5OuHMAdvlBcA6sg3Zd1HlsHLvwqK7rZ8YAB/+Mn1ZOlOcwzvL3wDfGALFZeYd2sfrOLjxtDsUCDhfuL4Q7B2TVHVrAyju06+KuHDZWVt+HpsEOnObXsZOGYe+f6+5v59A8Hg5awMo7tEjzxXpqEuxIeYTcmyYmgN2H+6Ra/UJWuHNIHg8H4h3YkSdGwA6ViPixOTQL2F24P65WK+5+WYbrCmAtvzYCaJflcnk2GAxGlZUaduc3+fWH/PfsP/Pft7lxwFajfZj/bf3vyvPbieG0rusfjAHawco7tJOD69i1shpYHiX31Chga+Febk0p2+QnpkEQDqqDFnFgHbT3IvCNC0D2ZJZf99wTCRt/Xpdfhn2fXw9Ng0if7flz/a4xQHtYeYf2co8a+zKpVvfBT4wCrh3u5d/NO+FOQFbdQbwD+1DX9axarYjCPrx/nFVzyBawXriXfy9ll9TINAhmka8jPL0GWsaBddBig8Gg3PpyZBLs0ST/vSuvt+XwROOAS6O9/Bt5lf/4B9MgqEcOJIX2cc87tP8isRx+NDIJ9qyE+7GVG/jg89i97bRBWXW/ZQzQPrbNQ/u5951DKJHyKsfKqyZYoO/hXnZBubcd1w3Azlh5h25cNFp955CswtPnz9/y2VseqegWJtrAqju0mJV36Aa/ReeQrMLT13B/XK1W24U7rheAnbPyDt25iLT6TgRlFf5RXdcnRkGHP29LrD/1mUvLWHWHlrPyDt3ht+lEUFbeX+S4edNsJ4YuRfu4/N3Of3wl3HGdAOyblXfo1oWl1XciXiw+q+vaY+Vo82dr+Vwtp8hPTYOWsuoOHeA579Ahg8Hg58q9l8Qyya8/lL+bnilMC6N9mP/u/s9qtdI+NhFazHPdoQOsvEP3LjbfNMEE0czy60ld1zOjIHq0V6tHvj2oVreCQJtZdQfxDgS96Czh/sYkCKw8Uq4carcwCkQ77NyxQ0RBvANxL0CtvtMG5WLyiYhHtMPOzPJn7F1jAPEOxL0QLeFu9R0RD1/+rBxVq0PoRDtdddetSiDegfgXpS8qJyMj4uFz0e70eLrOqjuId6BFF6c/mgQiHn75XJw00T4xDXrgdv4cdcI8iHegJReqT6vVfZzQRrPK6fTc/HOwbIefVqut8SMToSdO8mfnsTGAeAfaddFaVt/dy0mbLUrE59dpvhg9Mw7W/PwbN8F+5DOQnimfk7ftXgLxDrTvAvZxtdomCl24ID3Jr+cuSvnM5935Kvv9/BqbCD1Vdiw9NgYQ70A7L2jL6vvIJOiQWX69rKzGs/qMO2qC/cg06LnyeXjL5yKId6DdF7avTIKOXqieVqvVeAcz9etzzbZ4+NRx/iw8MQYQ70C7L3TLc98nJkGHLZqQfynkOx3s5yvsIxOBD8zzZ99tYwDxDnTjovedSdCjkD/fVi/k2/3ZVUL9jmCHK931dA4Q70B3LoI9Oo6+hrwV+fZ8Tg2bUP+uWu0WsiUerlZ+UXnPGEC8A926KPboOPrs/B75t5XD7iJ9Nk0uxLpT4uH6n2seDQfiHejgRXJZeX9qEvBeWYmflZjPF76nxrHXWC+vO5WzOOCmPBoOxDvQ4Qvncu+71S341KwJ+rIyP7Myv5XPm2HzeSPWYfsW+XPqljGAeAe6ezHt8DpY88K4Cfq/VquTnGdGcuXny6SJ9W+bUB+ZCuyMQ+pAvAM9uMB2eB1sZt68fmrCftHHe02bXwKOLoT6WKjDXjmkDsQ70JMLb4fXwXaVkC/b7Msq/aJ5zdu89b4J9PNt7+X9zoX/GTic8rlyy609IN6B/gR8eRzTK5OAnZs3F9sl6H/66D+r9h35F6K8GFX/XDG/07xf/N8D8TzKnxnPjAHEO9CvgH9TOUAKopld8YuAny/5z7/9QnCLceiO8su+28YA4h3oX7yPqtXhdS7sASC+8kz3uTFA//zaCKDflsvl2WAw+O/8x9+ZBgCEVp7p/u/GAP1k5R14z7PfASC0RbVadXdIHfTUr4wAaBwbAQDE/Z4W7tBvts0D7y2Xy78PBoOyG2diGgAQyrMc7j8YA/SbbfPAB2yfB4BQFpXt8kBl2zzwKdvnASDQ97JwBwrb5oEP2D4PAGHYLg/8wrZ54FK2zwPAQS0q2+WBC2ybBz7H9nkAOOD3sHAHLrJtHrhUs33+5/zH35kGAOyV7fLAJ2ybB74opfSmcv87AOzLPIf7bWMAPmbbPHCVsn3etj0A2N/3LoB4B66nruuFCwkA2ItH+Xt3bgzAZdzzDlxpuVz+bTAYjCqnzwPArsxyuP/JGIDPsfIOrOtRtXpsDQCwXeX2tHvGAIh34Maax9W4sACA7fNYOOBKts0Da2seH1eeUjExDQDYivJYuOfGAFzFo+KAa/P4OADYCo+FA9Zm2zywibJ93vY+ANic29EA8Q7slvvfAeDGjpvHsQKsxT3vwEaWy+XC/e8AsBH3uQPX5p534EZSSq/y25FJAMBa3OcObMS2eeCmjivPfweAdbjtDBDvwGG4/x0A1nbPfe6AeAcOGfDzarUCDwBc7kn+vpwZA7ApB9YBW7FcLueDwWCU/zg2DQD4wGkO9z8ZA3ATDqwDtiql9E7AA8Avyu60u81tZgAbs20e2La71epAHgDou/J9eCzcAfEOhNNcoNw1CQB4H+5zYwDEOxA14B1gB0DfPcrfh6fGAGyLA+uAnWgOsBvmP/7WNADomZMc7n82BkC8A20J+P/IAV8Or/tX0wCgJ8rusz/m78D/Mgpgm2ybB3btuLmQAYCuW1ROlgd2xKPigJ1LKY3yW3mE3NA0AOiosybc/cIa2Akr78DO5QuZReURcgB0m5PlgZ1yzzuwF8vl8u+DweA/8x+PTAOADob7vxsDIN6BrgR8OYH+JwEPQIc8y+H+b8YAiHegiwE/yn8cmwYALVceCfcnYwDEO9DVgH8t4AFouXkO998bA7AvDqwDDiJf8HiEHACtDfdqdRArgHgHeuGugAegZc4fCecJKoB4B/qhufApAb8wDQCEO4B4B2IH/L3KM+ABaEe42zEGHMRXRgBEkFIqh9e9ya+haQAQ0G3hDhySlXcghOaCqGyhtwIPQDTHwh04NCvvQCgppUm1WoEHgCjhfmIMwKF5zjsQynK5XAwGg5/yH49MAwDhDiDegbgBPxfwAAh3APEOCHgAEO6AeAcQ8AC00JMc7s+MARDvAAIegJhOcrg/MgZAvAMIeADihvuxMQDiHUDAAyDcAcQ7IOAB4Joe5XD/szEA4h1AwAMQUzlV/n8ZAyDeAQQ8AHHD/cQYAPEOIOABEO4AW/GVEQBtllKa5LdX+TU0DQCEOyDeAeIG/Di/vRHwAHzBWbU6nE64A+IdQMADEDTc7+ZwnxsF0Fa/MgKgC5oLsrv55cIMAOEOdI6Vd6BTUkpl5b2swI9NA6D3Fvl1T7gD4h1AwAMQ0/sdWTncz4wCEO8AsSP+RX6bmgRA78yq1Yq7cAc6w3Pegc5aLpevB4PBqLICD9AnJzna7+XvgP8yCqBLHFgHdFq+gDvOb8cmAdALz5rPfYDOsW0e6IWU0lF+K9voPUoOoJuOPcMdEO8A3Qh4z4IH6J5yX3u5v31mFECX2TYP9EbzqKBblWfBA3TF+Ynywh3oPAfWAb1SDjAaDAZ/yX/81+YFQLvDfWEUgHgH6GjA59dfcsSX7fO/NRGA1iknyv/eifKAeAfoR8T/Rw74n/IfJ/n1GxMBaIVyMN0TYwD6xoF1QO81B9m9yq+RaQCE5WA6QLwDCPhUttCXk+jHpgEQzrwJ94VRAH1l2zxA9ct98D+4Dx4gnJP8+mMO978bBSDeATiPePfBA8TxKEf7nx1MB2DbPMCl3AcPcFDl/vbyGLi5UQCs/MoIAD7VXDDezq9T0wDYq1l+3RLuAB+ybR7gMy48D/7n/D/+zkQAdu5JjvZj2+QBPmXbPMAabKMH2CmPgQO4gm3zAGuwjR5gZ0qw3xLuAF9m2zzAmmyjB9g62+QB1mTbPMAGmm30L/JrbBoA17aoVtvkHUoHsCYr7wAbWC6Xfx8MBn+pVs+C/62JAKyt3H70+xzuC6MAWJ+Vd4AbSikdVatV+KFpAHxWOZTuOEe7s0MAxDvAwQJ+2AT8kWkAfGLWhPvCKAA2Y9s8wBZ8dJhd2Ub/G1MBeO9RjvY/5c/IM6MA2JyVd4AtSymNqtUq/MQ0gB4rh9EdO5QOYDusvANsWVldyq+XVuGBHiuPgPtjOdzTKAC2w8o7wA5ZhQd6xmo7wI5YeQfYIavwQE+U+9n/zWo7wO5YeQfYE6vwQEfNKifJA4h3gA5GvOfCA11QVtvLve3PjAJg92ybB9iz5XL5t8Fg8EO12kL/WxMBWug0v+7mcJ8ZBcB+WHkHOKCU0iS/Pc2vsWkALbCoVlvkRTvAnll5Bzig5XK5yK8fBoPBV03AO9AOiOj8QLp75XPLOAD2z8o7QBDNgXZlFf7INIBAyhb5Rw6kAxDvAHwY8ZPKVnrg8Eqs2yIPIN4BuCLiH+a37yun0gP7VbbIP8/R/tgoAOJwzztAUMvl8v86lR7Ys5P8+n0O9/9jFACxWHkHaIHmfvjybPiJaQA7MKtW97XPjQJAvANw84gv8e5+eGBbFpX72gHEOwA7i/hptboffmQawIbR/iRH+4lRAIh3AHYf8Y/z24PKoXbAet4fRpdfz3K4nxkHgHgHYH8BX8L9oYgHRDuAeAdAxAPt9KxabZEX7QDiHYBAET+qVvfDT00Deu2kifaFUQCIdwBEPCDaARDvAGwh4kvA204P3VW2xJ+KdgDxDkD7I9498dDNaHcQHYB4B6DDEX+/8px4EO0AiHcAwof8tFrdFy/ioR0W1Wpr/IlRAIh3APoX8ZMm4iemASHN8ut5jvZTowAQ7wCI+HG1uid+ahoQwkkT7XOjABDvAPBxxLsvHg5nkV8vK/ezAyDeAbhGyE+biJ+YBuzUrES7+9kBEO8A3CTiR9U/t9R71BxsR1lZL7H+3PPZARDvAGw75EvAW42Hzc0qq+wAiHcA9hTxo2q1Gn9UuTcerrLIr3JavFV2AMQ7AAcL+RLw31VOqoePneTXa495g//P3r3dJgyDARj1CGxQb9BsQDbojB2hG6QbhA1gA0Yoht/CRapUWgUSOEeyEtQ3qy+ffAkg3gGYU8SX8/Al5G2r55mVUP8oTzfGAyDeAZh7yOcm5DszwoMr32J/j2Dfmg4AxDsAQh4EOwDiHQCEPAh2AMQ7AHwP+XU8YY7qGfZBsAMg3gF49pBfXYT8yqxwJ/uLYHfpHADiHQB+iPkuIr58gs72eqY2pvMN8aPpAEC8A8D1Id+uyveHkc0K/7Q9jCFZXQdAvAPAZDGfI+Lf4mmLPb+N9c/k7DoA4h0A7hLzZVt9GVbmEesAiHcAWEjM5ybmuwh6HlsN9THZBg+AeAeAxQZ9HyH/Gk+X4C3XGOMY6y6YA0C8A8BzBP1LskI/R/sm1DdCHQDxDgDUoM/pdGa+j6jPov4mhnQ6p76r786pA4B4B4C/Rn1ZoS+326/jT8L+ukAvq+mbCPUyRufTAUC8A8Atwn6Vzmfoa8zXuK/R/+jGCPMa5zXW0yHOB/8lACDeAWApkd83P9v3cole+636Lt332/XbGO3vXbzXc+jHd2fQAUC8AwDn8M9pmhV829YBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACYyJcAAwAs3Eyr8V1nlQAAAABJRU5ErkJggg==";
    let csstext = "width: 30px;cursor: pointer;opacity: .8;-webkit-user-select: none;-moz-user-select: none;user-select: none;";

    window.addEventListener("load", () => {
        let img = document.createElement("img");
        img.src = imgsrc;
        img.style.cssText = csstext;
        img.addEventListener("click", countUsefulTools);
        document.querySelector(".side-controls").appendChild(img);
    });
})();
