// ==UserScript==
// @name        Tooltips
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @author      -
// @description 4/30/2025, 8:10:05 PM
// @require	https://unpkg.com/wanakana
// ==/UserScript==
(function () {
    const isNumeric = (string) => /^[+-]?\d+(\.\d+)?$/.test(string);
    function getFlagEmoji(countryCode) {
        let codePoints = countryCode
            .toUpperCase()
            .split("")
            .map((char) => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    }
  const invisibleRanges = [9,32,160,173,847,1564,4447,4448,6068,6069,[6155,6158],[8192,8207],[8234,8239],8287,[8288,8303],10240,12288,12644,[65024,65039],65279,65440,65532,78844,119129,[119155,119162],917505,[917536,917631],[917760,917999]];
	function checkCodepoint(codepoint) {
		if (codepoint < 0 || codepoint > 0x10FFFF) return false;
		for (const range of invisibleRanges) {
			if (isNaN(range) && range[0] <= codepoint && codepoint <= range[1]) return false;
			else if (range === codepoint) return false;
		}
		return true;
	}

    async function make_A_call(text) {
        let url = "https://translate.googleapis.com/translate_a/single?";
        url += "client=" + "gtx" + "&";
        url += "sl=" + "auto" + "&";
        url += "tl=" + "en" + "&";
        url += "dt=" + "t" + "&";
        url += "q=" + text;

        const options = {
            method: "GET",
        };

        try {

            const response = await fetch(url, options);
            const result = await response.json();
            console.log(result);

            if (result[2].trim().toLowerCase() != "en" && result[0][0][0].trim() != text.trim())
                return result[2].toUpperCase() + " " + result[0][0][0];

            return "";
        } catch (error) {
            console.error(error);
        }
    }
    let tooltipHandlers = [{
        id: "romaji",
        name: "Romaji",
        priority: 1,
        description: "Translates kana into romaji whenever possible.",
        enabled: false,
        condition: (e) => wanakana.toRomaji(e.text) !== e.text,
        handle(e, tooltips) {
            tooltips.push(`🇯🇵 ${wanakana.toRomaji(element.text)}`);
        }
    }
        , {
        id: "charcode",
        name: "Charcode",
        priority: 0,
        description: "Displays the UTF-16 code of the character.",
        enabled: false,
        condition: (e) => [...e.text].length === 1,
        handle(element, tooltips) {
            tooltips.push(`🔡 U+${element.text.codePointAt().toString(16).toUpperCase().padStart(4, "0")}`);
        }
    }, {
        id: "curly",
        name: "Curly",
        priority: 2,
        description: "Shows whether the element includes curly quotation marks.",
        enabled: false,
        condition: (e) => e.text.includes("“") || e.text.includes("”"),
        handle(element, tooltips) {
            tooltips.push("Curly quoted")
        }
    },
    {
        id: "quotes",
        name: "Quote",
        priority: 2,
        description: "Shows whether the element includes curly quotation marks.",
        enabled: false,
        condition: (e) => e.text.includes("\"") || e.text.includes("\'"),
        handle(element, tooltips) {
            tooltips.push("\" Quoted")
        }
    },
    {
        id: "fromcharcode",
        name: "Fromcharcode",
        priority: 0,
        description: "Turns UTF-6 codes to their actual character.",
        enabled: false,
        condition: (e) => /[Uu]\+[0-9a-fA-F]+/.test(e.text),
        handle(element, tooltips) {
            let res = element.text,
                replaced = false;
            const matches = res.match(/[Uu]\+[0-9a-fA-F]+/g) ?? [];
            for (const match of matches) {
                const codepoint = parseInt(match.slice(2), 16);
                if (checkCodepoint(codepoint)) {
                    res = res.replace(match, String.fromCodePoint(codepoint));
                    replaced = true;
                }
            }
            if (!replaced) return;
            tooltips.push(`🔢 ${res}`)
        }
    },
    {
        id: "translateToEnglish",
        name: "TranslateToEnglish",
        priority: 0,
        description: "Translates foreign languages to english.",
        enabled: false,
        condition: (e) => (!isNumeric(e.text) && !/[+]/.test(e.text)),
        async handle(element, tooltips) {

            var translated = await make_A_call(element.text);
            if (translated != "")
                tooltips.push(`🔄 ${translated}`)
        }
    }
    ]



    async function doStuffOnNode(node) {
        console.log(node);
        let instanceWidth = node.offsetWidth;
        let instanceHeight = node.offsetHeight;
        node.style.height = instanceHeight.toString() + "px";
        node.style.width = instanceWidth.toString() + "px";

        if (node.querySelector(".tooltip") == null) {//make child and place it above elment
            let tooltip = document.createElement("div");
            tooltip.classList.add("tooltip");
            var text = node.querySelector(".instance-text").textContent;
            var height = 0;
            console.log("TEXT:" + text)
            for (const t of tooltipHandlers) {

                if (t.condition({ "text": text })) {
                    const tooltips = [];
                    await t.handle({ "text": text }, tooltips);
                    if (tooltips.length > 0) {
                        let tooltipDiv = document.createElement("div");
                        tooltipDiv.textContent = tooltips[0];
                        tooltipDiv.style.fontSize="19px";
                        tooltip.appendChild(tooltipDiv);
                        height += 1;
                    }

                }
            }

            height = (height-1) *10+ 60;
            tooltip.style.position = "relative";
            tooltip.style.top = "-" + height.toString() + "px";
            tooltip.style.left = "-50%";
            tooltip.style.transform = "translateX(-50%)";
            node.appendChild(tooltip);
        }

    }





    async function doStuffOnInstancesMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {


                    if (node.id != "instance-0" && node.classList.contains("instance") && node.querySelector(".instance-emoji")) {

                        doStuffOnNode(node);
                    }
                }
            }
        }
    }

    window.addEventListener("load", () => {

        const instanceObserver = new MutationObserver((mutations) => {


            doStuffOnInstancesMutation(mutations);


        });

        instanceObserver.observe(document.getElementById("instances"), {
            childList: true,
            subtree: true,

        });

        // do at startup om all instances
        var instances = document.querySelectorAll(".instance");
        for (var inst of instances)
            doStuffOnNode(inst);



    })

})()