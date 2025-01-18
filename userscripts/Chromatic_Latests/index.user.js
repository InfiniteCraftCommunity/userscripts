// ==UserScript==
// @name            Chromatic Latests
// @namespace       Violentmonkey Scripts
// @match           https://neal.fun/infinite-craft/*
// @grant           none
// @run-at	        document-end
// @require 	    https://unpkg.com/wanakana
// @require         https://raw.githubusercontent.com/surferseo/intl-segmenter-polyfill/master/dist/bundled.js
// @version         1.0.1
// @author          Alexander_Andercou
// @description     Chromatic Themes Changing Colors and Sparkles v300+
// @downloadURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Chromatic_Latests/index.user.js
// @updateURL       https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/Chromatic_Latests/index.user.js
// ==/UserScript==


(function () {
    var EMOJIS = {};

    let modes = [
        "None",
        "Emoji simple",
        "Emoji gradient",
        "Emoji blend",
        "One color",
        "Saved Color",
        "Reset Colors",
        "Test",
        "Soup Alphabet",
        "Moving Gradients",
        "Changing colors",
        "Adjust animation speed",
        "FD's settings",
        "Change Background Theme",
    ];
    let mode = 1;
    let fdText = true,
        fdSparkle = true;
    let previousmode = null;
    const NoneMode = 0;
    const EmojiGradientSimpleMode = 2,
        EmojiMovingGradientMode = 9,
        SettingMode = (x) => {
            return x == 11 || x == 12;
        },
        SettingFDMode = 12,
        ChangingBackground = 13;
    const ChooseOneColorMode = 4,
        SavedColorMode = 5,
        ChangingColorsMode = 10;
    let hidden = 1;
    let dropMenu = null;
    let animationSpeed = 3.5;
    let ThemeButton = null;
    let selectedPrompt = null;
    let oneColor = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--border-color").trim();
    let sparkleCss = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23FFAC33' d='M34.347 16.893l-8.899-3.294-3.323-10.891c-.128-.42-.517-.708-.956-.708-.439 0-.828.288-.956.708l-3.322 10.891-8.9 3.294c-.393.146-.653.519-.653.938 0 .418.26.793.653.938l8.895 3.293 3.324 11.223c.126.424.516.715.959.715.442 0 .833-.291.959-.716l3.324-11.223 8.896-3.293c.391-.144.652-.518.652-.937 0-.418-.261-.792-.653-.938z'/%3E%3Cpath fill='%23FFCC4D' d='M14.347 27.894l-2.314-.856-.9-3.3c-.118-.436-.513-.738-.964-.738-.451 0-.846.302-.965.737l-.9 3.3-2.313.856c-.393.145-.653.52-.653.938 0 .418.26.793.653.938l2.301.853.907 3.622c.112.444.511.756.97.756.459 0 .858-.312.97-.757l.907-3.622 2.301-.853c.393-.144.653-.519.653-.937 0-.418-.26-.793-.653-.937zM10.009 6.231l-2.364-.875-.876-2.365c-.145-.393-.519-.653-.938-.653-.418 0-.792.26-.938.653l-.875 2.365-2.365.875c-.393.146-.653.52-.653.938 0 .418.26.793.653.938l2.365.875.875 2.365c.146.393.52.653.938.653.418 0 .792-.26.938-.653l.875-2.365 2.365-.875c.393-.146.653-.52.653-.938 0-.418-.26-.792-.653-.938z'/%3E%3C/svg%3E")`;

    LetterColors = {
        A: [0, 127, 255],
        B: [139, 69, 19],
        C: [220, 20, 60],
        D: [240, 225, 48],
        E: [80, 200, 120],
        F: [217, 2, 125],
        G: [128, 128, 128],
        H: [223, 115, 255],
        I: [75, 0, 130],
        J: [0, 168, 107],
        K: [195, 176, 145],
        L: [220, 208, 255],
        M: [255, 0, 144],
        N: [0, 0, 128],
        O: [255, 165, 0],
        P: [160, 32, 240],
        Q: [81, 65, 79],
        R: [255, 0, 0],
        S: [250, 128, 114],
        T: [0, 128, 128],
        U: [4, 55, 242],
        V: [127, 0, 255],
        W: [255, 255, 255],
        X: [241, 180, 47],
        Y: [255, 255, 0],
        Z: [0, 20, 168],
    };

    LetterColorsLight = {
        A: [0, 127, 255],
        B: [139, 69, 19],
        C: [220, 20, 60],
        D: [240, 225, 48],
        E: [80, 200, 120],
        F: [217, 2, 125],
        G: [128, 128, 128],
        H: [223, 115, 255],
        I: [75, 0, 130],
        J: [0, 168, 107],
        K: [195, 176, 145],
        L: [220, 208, 255],
        M: [255, 0, 144],
        N: [0, 0, 128],
        O: [255, 165, 0],
        P: [160, 32, 240],
        Q: [81, 65, 79],
        R: [255, 0, 0],
        S: [250, 128, 114],
        T: [0, 128, 128],
        U: [4, 55, 242],
        V: [127, 0, 255],
        W: [200, 200, 200],
        X: [241, 180, 47],
        Y: [255, 255, 0],
        Z: [0, 20, 168],
    };

    function getAvgHex(color, total) {
        return Math.round(color / total)
            .toString(16)
            .padStart(2, 0);
    }

    function uniToEmoji(uni) {
        return String.fromCodePoint(uni);
    }
    function emojiToUni(emoji) {
        return emoji.codePointAt(0);
    }

    function calculatedAverageColor(emoji) {
        let totalPixels = 0;
        const colors = {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0,
        };
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.font = "30px Arial";
        ctx.fillStyle = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();
        ctx.fillText(emoji, 0, 28);

        const { data: imageData } = ctx.getImageData(0, 0, 30, 30);
        for (let i = 0; i < imageData.length; i += 4) {
            let [r, g, b, a] = imageData.slice(i, i + 4);
            if (a > 50) {
                totalPixels += 1;
                colors.red += r;
                colors.green += g;
                colors.blue += b;
                colors.alpha += a;
            }
        }
        const r = getAvgHex(colors.red, totalPixels);
        const g = getAvgHex(colors.green, totalPixels);
        const b = getAvgHex(colors.blue, totalPixels);

        return "#" + r + g + b;
    }
    function calculatedAverageAndMaxFreqColor(emoji) {
        let totalPixels = 0;
        const colors = {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0,
        };
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.font = "30px Arial";
        ctx.fillStyle = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();
        ctx.fillText(emoji, 0, 28);
        var colors2 = [];
        var freq = [];
        const { data: imageData } = ctx.getImageData(0, 0, 30, 30);

        for (let i = 0; i < imageData.length; i += 4) {
            let [r, g, b, a] = imageData.slice(i, i + 4);
            if (a > 50) {
                let JColors = JSON.stringify(colors2);
                let JColor = JSON.stringify([r, g, b]);

                if (JColors.indexOf(JColor) > -1) {
                    let index = 0;
                    for (let [rc, gc, bc] of colors2) {
                        if (r == rc && g == gc && b == bc) break;
                        index += 1;
                    }

                    freq[index] += 1;
                } else {
                    if (r != 0 || g != 0 || b != 0) {
                        colors2.push([r, g, b]);
                        freq.push(1);
                    }
                }

                totalPixels += 1;
                colors.red += r;
                colors.green += g;
                colors.blue += b;
                colors.alpha += a;
            }
        }
        const r = getAvgHex(colors.red, totalPixels);
        const g = getAvgHex(colors.green, totalPixels);
        const b = getAvgHex(colors.blue, totalPixels);
        const indexOfLargestValue = freq.reduce((maxIndex, currentValue, currentIndex, array) => (currentValue > array[maxIndex] ? currentIndex : maxIndex), 0);
        const secondColor = colors2[indexOfLargestValue];

        return ["#" + r + g + b, "rgb(" + secondColor[0].toString() + "," + secondColor[1].toString() + "," + secondColor[2].toString() + ")"];
    }

    function getEmojiColors(emoji) {
        var code = emojiToUni(emoji);
        if (!(code in EMOJIS)) {
            EMOJIS[code] = ["", ""];

            if (mode == EmojiGradientSimpleMode || mode == EmojiMovingGradientMode) {
                EMOJIS[code] = calculatedAverageAndMaxFreqColor(emoji);
            } else {
                EMOJIS[code][0] = calculatedAverageColor(emoji);
            }

            localStorage.setItem("emojiColors", JSON.stringify(EMOJIS));
        } else {
            if ((mode == EmojiGradientSimpleMode || mode == EmojiMovingGradientMode) && EMOJIS[code][1] == "") {
                EMOJIS[code] = calculatedAverageAndMaxFreqColor(emoji);
                localStorage.setItem("emojiColors", JSON.stringify(EMOJIS));
            }
        }

        // console.log("code of emiji:",EMOJIS[code]);
        return EMOJIS[code];
    }

    function applyOnOneElement(node) {
        const emojiSpan = node.querySelector(".instance-emoji");
        const emoji = emojiSpan.textContent;
        let colors = getEmojiColors(emoji);
        let emojiAverageColor = colors[0];

        if (node.classList.contains("instance-discovered")) {
            try {
                let text_div = node.querySelector(".instance-discovered-text");
                let discovery_img = text_div.querySelector(".instance-discovered-emoji");

                if (fdSparkle) {
                    node.style.setProperty("--img-content", sparkleCss);
                } else {
                    node.style.setProperty("--img-content", "none");
                }

                if (fdText) {
                    if (text_div.classList.contains("invisible")) text_div.classList.remove("invisible");

                    discovery_img.src =
                        `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"
             width="10px" height="10px"><path fill="%23` +
                        emojiAverageColor.substring(1) +
                        `" d="M49.306 26.548l-11.24-3.613-3.613-11.241C34.319
             11.28 33.935 11 33.5 11s-.819.28-.952.694l-3.613 11.241-11.24 3.613C17.28 26.681 17 27.065 17
             27.5s.28.819.694.952l11.24 3.613 3.613 11.241C32.681 43.72 33.065 44 33.5 44s.819-.28.952-.694l3.613-11.241
             11.24-3.613C49.72 28.319 50 27.935 50 27.5S49.72 26.681 49.306 26.548zM1.684 13.949l7.776 2.592 2.592 7.776C12.188 24.725
             12.569 25 13 25s.813-.275.948-.684l2.592-7.776 7.776-2.592C24.725 13.813 25 13.431 25 13s-.275-.813-.684-.949L16.54
             9.459l-2.592-7.776C13.813 1.275 13.431 1 13 1s-.813.275-.948.684L9.46 9.459l-7.776 2.592C1.275 12.188 1 12.569
             1 13S1.275 13.813 1.684 13.949zM17.316 39.05l-5.526-1.842-1.842-5.524C9.813 31.276 9.431 31 9 31s-.813.275-.948.684L6.21
             37.208.685 39.05c-.408.136-.684.518-.684.949s.275.813.684.949l5.526 1.842 1.841 5.524C8.188 48.721 8.569 48.997 9
             48.997s.813-.275.948-.684l1.842-5.524 5.526-1.842C17.725 40.811 18 40.429 18 39.999S17.725 39.186 17.316 39.05z"/></svg>`;
                    text_div.style.setProperty("--second-color", emojiAverageColor);
                    text_div.style.setProperty("--main-color", "color-mix( in srgb," + emojiAverageColor + ",#fff 60%)");
                } else {
                    if (!text_div.classList.contains("invisible")) text_div.classList.add("invisible");
                }
            } catch (err) {
                console.log(err);
            }
        }

        if (node.querySelector(".addspan")) {
            for (const spn of node.querySelectorAll(".addspan")) {
                spn.style.color = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();
            }
        }

        if (node.classList.contains("noneStyle")) {
            node.classList.remove("noneStyle");
        }

        node.style.borderRadius = "10px";
        node.style.animation = "none";
        node.style.transition = "none";

        if (mode != ChangingColorsMode) {
            node.style.boxShadow = `var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),
             inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%)`;
        }

        switch (mode) {
            case 0:
                {
                    let defaultBorderColor = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--border-color").trim();
                    node.style.borderColor = defaultBorderColor;
                    node.style.borderImage = "";
                    node.style.backgroundImage = "";
                    node.style.borderWidth = "2px";
                    node.style.borderRadius = "5px";
                    node.style.setProperty("--shadow-rgb", "transparent");

                    if (!node.classList.contains("noneStyle")) {
                        node.classList.add("noneStyle");
                    }
                }

                break;
            case 1:
                {
                    node.style.borderImage = "";
                    node.style.backgroundImage = "";
                    node.style.borderColor = emojiAverageColor;
                    node.style.borderWidth = "2px";
                    node.style.setProperty("--shadow-rgb", emojiAverageColor);
                }

                break;

            case 2:
                {
                    node.style.borderImage = "linear-gradient(to right ," + colors[0] + "," + colors[1] + ") 2 ";
                    node.style.borderWidth = "3px";
                    node.style.borderColor = "transparent";
                    node.style.borderRadius = "0px";
                    node.style.setProperty("--shadow-rgb", emojiAverageColor);
                }
                break;
            case 3:
                {
                    let defaultBorderColor = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--border-color").trim();
                    const styletouse = "color-mix( in srgb, " + emojiAverageColor + " 50% , " + defaultBorderColor + " 50% )";
                    node.style.borderColor = styletouse;
                    node.style.setProperty("--shadow-rgb", styletouse);
                    node.style.borderImage = "";
                    node.style.backgroundImage = "";
                    node.style.borderWidth = "3px";
                }
                break;

            case 4:
                {
                    node.style.borderImage = "";
                    node.style.backgroundImage = "";
                    node.style.borderColor = oneColor;
                    node.style.borderWidth = "2px";
                    node.style.setProperty("--shadow-rgb", oneColor);
                }
                break;
            case 5:
                {
                    node.style.backgroundImage = "";
                    node.style.borderImage = "";
                    node.style.borderColor = oneColor;
                    node.style.borderWidth = "2px";
                    node.style.setProperty("--shadow-rgb", oneColor);
                }
                break;
            case 6:
                {
                    mode = NoneMode;
                    localStorage.removeItem("emojiColors");
                    EMOJIS = {};
                    switchTheStyle();
                }
                break;
            case 7:
                {
                    console.log("TEST THEME");
                }
                break;
            case 8:
                {
                    node.style.borderImage = "";

                    let spanCont = node.querySelector(".instance-emoji").innerHTML;
                    let emojiSpan = node.querySelector(".instance-emoji");
                    let discovered = node.querySelector(".instance-discovered-text");
                    let parentText = node.textContent;
                    let instance_text_div = parentText.replace(spanCont, "");

                    if (discovered) {
                        instance_text_div = instance_text_div.replace(discovered.textContent, "");
                    }

                    instance_text_div = instance_text_div.trim();
                    let saveText = instance_text_div;
                    instance_text_div = instance_text_div.trim().toUpperCase();
                    console.log("text:", instance_text_div);
                    let startColor = [0, 0, 0];
                    let nrChars = 0;
                    console.log("start word");

                    let alphabeth = false;
                    for (const char of instance_text_div) {
                        if (char >= "A" && char <= "Z") {
                            nrChars += 1;
                            console.log(char);
                            console.log("in base:", LetterColors[char]);

                            if (document.querySelector(".container").classList.contains("dark-mode")) {
                                startColor[0] = startColor[0] + LetterColors[char][0];
                                startColor[1] = startColor[1] + LetterColors[char][1];
                                startColor[2] = startColor[2] + LetterColors[char][2];
                            } else {
                                startColor[0] = startColor[0] + LetterColorsLight[char][0];
                                startColor[1] = startColor[1] + LetterColorsLight[char][1];
                                startColor[2] = startColor[2] + LetterColorsLight[char][2];
                            }
                        } else if (char != "(" && char != ")" && char != "," && char != " " && char != "#" && char != "*") {
                            alphabeth = true;
                        }
                    }

                    const r = Math.round(startColor[0] / nrChars);
                    const g = Math.round(startColor[1] / nrChars);
                    const b = Math.round(startColor[2] / nrChars);
                    const averageLetterColor = "rgb(" + r.toString() + "," + g.toString() + "," + b.toString() + ")";

                    console.log("AverageColorLetters:", averageLetterColor);
                    node.style.borderImage = "";
                    node.style.backgroundImage = "";

                    if (alphabeth) {
                        node.style.borderColor = averageLetterColor;
                        node.style.borderWidth = "2px";
                        node.style.setProperty("--shadow-rgb", averageLetterColor);
                        let defaultTextColor = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();
                        let quotesColor = "color-mix(in srgb," + averageLetterColor + ", " + defaultTextColor + " 60%" + ")";

                        if (!node.querySelector(".addspan")) {
                            let saveAgainText = saveText;

                            node.replaceChildren();
                            node.appendChild(emojiSpan);
                            let text = "";
                            for (let c of saveText) {
                                if (c != '"') text = text + c;
                                else {
                                    let nspan = document.createElement("span");
                                    nspan.classList.add("addspan");
                                    nspan.style.color = quotesColor;
                                    nspan.textContent = '"';
                                    node.appendChild(document.createTextNode(text));
                                    node.appendChild(nspan);
                                    text = "";
                                }
                            }
                            if (text != "") node.appendChild(document.createTextNode(text));
                            if (discovered) node.appendChild(discovered);
                        } else {
                            for (const spn of node.querySelectorAll(".addspan")) {
                                spn.style.color = quotesColor;
                            }
                        }
                    } else {
                        node.style.borderColor = emojiAverageColor;
                        node.style.borderWidth = "2px";
                        node.style.setProperty("--shadow-rgb", emojiAverageColor);
                    }
                }
                break;
            case 9:
                {
                    node.style.setProperty("--bg-angle", "-60deg");

                    if (node.classList.contains("instance-discovered")) {
                        node.style.borderImage = "linear-gradient(var(--bg-angle)," + "rgb(255, 244, 43)," + "rgb( 139, 128, 0)," + "rgb(255, 244, 43)," + "rgb( 139, 128, 0)) 2";
                        node.style.setProperty("--shadow-rgb", "rgb(255, 244, 43)");
                    } else {
                        node.style.borderImage = "linear-gradient(var(--bg-angle)," + emojiAverageColor + "," + colors[1] + "," + emojiAverageColor + "," + colors[1] + ") 2";
                        node.style.setProperty("--shadow-rgb", emojiAverageColor);
                    }

                    console.log("speed in node:", animationSpeed.toString());
                    node.style.animation = "spin " + animationSpeed.toString() + "s  infinite cubic-bezier(0.4,0,0.2,1) running";

                    node.style.borderWidth = "4px";
                    node.style.borderColor = "transparent";
                    node.style.borderRadius = "0px";
                }
                break;
            case 10:
                {
                    console.log("speed in node:", animationSpeed.toString());
                    ("");
                    node.style.animation = "change-colors " + animationSpeed.toString() + "s  infinite  linear running";
                    node.style.borderWidth = "4px";
                    node.style.borderImage = "";
                    node.style.backgroundImage = "";
                    node.style.borderColor = "hsla(var(--hsl-color))";
                    node.style.boxShadow = "var(--x-offset) var(--y-offset) var(--radius) var(--spread) hsla(var(--hsl-color), var(--opacity))";
                }
                break;
            case 11:
                {
                    let parent = document.querySelector(".container");
                    let dialog = document.createElement("dialog");
                    let label = document.createElement("label");
                    let label2 = document.createElement("label");
                    let closeButton = document.createElement("button");
                    closeButton.appendChild(document.createTextNode("Close"));
                    closeButton.addEventListener("click", function () {
                        dialog.close();
                    });

                    label.innerText = "Choose animation speed in seconds";

                    let slider = document.createElement("input");

                    slider.type = "range";
                    slider.min = "0.5";
                    slider.max = "10";
                    slider.step = "0.1";
                    slider.value = "4";

                    slider.addEventListener("change", function (e) {
                        animationSpeed = this.value;
                        label2.innerText = "The chosen value right now is:" + animationSpeed.toString() + "s";

                        localStorage.setItem("animationSpeed", animationSpeed.toString());

                        mode = previousmode;
                        switchTheStyle();
                        console.log("speed:", this.value);
                    });

                    dialog.appendChild(label);
                    dialog.appendChild(document.createElement("br"));
                    dialog.appendChild(document.createElement("br"));
                    dialog.appendChild(label2);
                    dialog.appendChild(document.createElement("br"));
                    dialog.appendChild(document.createElement("br"));
                    dialog.appendChild(slider);

                    dialog.appendChild(closeButton);
                    dialog.appendChild(document.createElement("br"));
                    dialog.appendChild(document.createElement("br"));

                    dialog.style.position = "absolute";
                    dialog.style.top = "33%";
                    dialog.style.left = "25%";
                    dialog.style.background = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--background-color").trim();
                    dialog.style.color = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();

                    mode = previousmode;
                    switchTheStyle();
                    parent.appendChild(dialog);
                    dialog.showModal();
                }
                break;
            case 12:
                {
                }
                break;
            case 13: {
            }

            default:
                break;
        }
    }
    
    function applyStyleOnAllElements() {
        let instances = document.getElementsByClassName("instance");
        for (const node of instances) {
            if (node.querySelector(".instance-emoji")) applyOnOneElement(node);
        }
    }

    function switchTheStyle() {
        selectedPrompt.textContent = modes[mode];
        localStorage.setItem("mode_theme", mode.toString());

        if (mode == ChooseOneColorMode) {
            try {
                let listOfColorButtons = document.querySelectorAll("input[type=color]");
                for (let cb of listOfColorButtons) {
                    ThemeButton.removeChild(cb);
                }
            } catch (error) {}

            var ua = navigator.userAgent.toLowerCase();
            var isAndroid = ua.indexOf("android") > -1;
            var isMobile = ua.indexOf("android") > -1;
            var isWebOs = ua.indexOf("webos") > -1;
            var isIphone = ua.indexOf("iphone") > -1;
            var isIpad = ua.indexOf("ipad") > -1;
            var isLinux = ua.indexOf("linux") > -1;

            if (isAndroid || isMobile || isLinux || isWebOs || isIphone || isIpad) {
                let parent = document.querySelector(".container");
                let diag = document.createElement("dialog");

                let lr = document.createElement("label");
                lr.innerText = "R (0-255)";
                lr.style.color = "red";
                let lg = document.createElement("label");
                lg.innerText = "G (0-255)";
                lg.style.color = "green";
                let lb = document.createElement("label");
                lb.innerText = "B (0-255)";
                lb.style.color = "blue";
                let Previews = document.createElement("label");
                Previews.innerText = "Preview color";
                let previewDiv = document.createElement("div");
                previewDiv.style.width = "100px";
                previewDiv.style.height = "100px";

                let ri = document.createElement("input");
                ri.type = "number";
                ri.min = "0";
                ri.max = "255";
                ri.value = "0";
                let gi = document.createElement("input");
                gi.type = "number";
                gi.min = "0";
                gi.max = "255";
                gi.value = "0";
                let bi = document.createElement("input");
                bi.type = "number";
                bi.min = "0";
                bi.max = "255";
                bi.value = "0";
                let rgb2Hex = (s) => s.match(/[0-9]+/g).reduce((a, b) => a + (b | 256).toString(16).slice(1), "#");
                previewDiv.style.background = "rgb(" + ri.value + "," + gi.value + "," + bi.value + ")";

                ri.addEventListener("input", function (event) {
                    // console.log("ri:",ri.value,"something");

                    if (ri.value == "") {
                        ri.value = 0;
                    }

                    if (ri.value < 0) ri.value = 0;

                    if (ri.value > 255) ri.value = 255;

                    previewDiv.style.background = "rgb(" + ri.value + "," + gi.value + "," + bi.value + ")";
                    localStorage.setItem("saved_color", rgb2Hex("rgb(" + ri.value + "," + gi.value + "," + bi.value + ")"));
                    oneColor = rgb2Hex("rgb(" + ri.value + "," + gi.value + "," + bi.value + ")");
                    console.log("oneColor:", oneColor);
                    applyStyleOnAllElements();
                });
                gi.addEventListener("input", function (event) {
                    console.log("gi:", gi.value, "something");

                    if (gi.value == "") {
                        gi.value = 0;
                    }

                    if (gi.value < 0) gi.value = 0;

                    if (gi.value > 255) gi.value = 255;

                    previewDiv.style.background = "rgb(" + ri.value + "," + gi.value + "," + bi.value + ")";
                    localStorage.setItem("saved_color", rgb2Hex("rgb(" + ri.value + "," + gi.value + "," + bi.value + ")"));
                    oneColor = rgb2Hex("rgb(" + ri.value + "," + gi.value + "," + bi.value + ")");
                    console.log("oneColor:", oneColor);
                    applyStyleOnAllElements();
                });

                bi.addEventListener("input", function (event) {
                    console.log("bi:", bi.value, "something");
                    if (bi.value == "") {
                        bi.value = 0;
                    }

                    if (bi.value < 0) bi.value = 0;

                    if (bi.value > 255) bi.value = 255;

                    previewDiv.style.background = "rgb(" + ri.value + "," + gi.value + "," + bi.value + ")";
                    localStorage.setItem("saved_color", rgb2Hex("rgb(" + ri.value + "," + gi.value + "," + bi.value + ")"));
                    oneColor = rgb2Hex("rgb(" + ri.value + "," + gi.value + "," + bi.value + ")");
                    console.log("oneColor:", oneColor);
                    applyStyleOnAllElements();
                });

                let closeButton = document.createElement("button");
                closeButton.appendChild(document.createTextNode("Close"));
                closeButton.addEventListener("click", function () {
                    diag.close();
                });
                let inputDiv = document.createElement("div");
                let previewsDiv = document.createElement("div");
                let mainLogic = document.createElement("div");
                inputDiv.appendChild(lr);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.appendChild(ri);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.appendChild(lg);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.appendChild(gi);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.appendChild(lb);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.appendChild(bi);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.style.float = "left";
                inputDiv.style.margin = "10px";
                mainLogic.appendChild(inputDiv);

                previewsDiv.appendChild(Previews);
                previewsDiv.appendChild(document.createElement("br"));
                previewsDiv.appendChild(previewDiv);
                previewsDiv.appendChild(document.createElement("br"));
                previewsDiv.style.float = "right";
                mainLogic.appendChild(previewsDiv);
                diag.appendChild(mainLogic);

                diag.appendChild(closeButton);
                diag.style.position = "absolute";
                diag.style.top = "33%";
                diag.style.left = "25%";
                diag.style.background = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--background-color").trim();
                diag.style.color = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();
                parent.appendChild(diag);
                diag.showModal();
            } else {
                let input = document.createElement("input");
                input.setAttribute("type", "color");
                ThemeButton.appendChild(input);

                input.addEventListener("click", function (event) {
                    event.stopPropagation();
                });

                input.addEventListener("input", function (event) {
                    oneColor = event.target.value;
                    localStorage.setItem("saved_color", oneColor.toString());
                    applyStyleOnAllElements();
                });

                console.log("themeThemeButton", ThemeButton, input, ThemeButton.appendChild(input));

                // hidden=0;
                input.click();
            }
        } else if (mode == SettingFDMode) {
            console.log("fd setting");
            let parent = document.querySelector(".container");
            let dialog = document.createElement("dialog");
            let label = document.createElement("label");
            let label2 = document.createElement("label");
            let label3 = document.createElement("label");
            let styleLabel = document.createElement("label");
            let styleLabelSparkle = document.createElement("label");
            let movingBall = document.createElement("div");
            let movingBallSparkle = document.createElement("div");

            label.innerText = "Choose if you want Fd text";
            label2.innerText = "Fd text ";
            label3.innerText = "Fd sparkles";
            let check = document.createElement("input");

            check.type = "checkbox";
            check.checked = fdText;
            check.id = "checkText";
            styleLabel.htmlFor = "checkText";
            styleLabel.classList.add("switch");
            movingBall.classList.add("ball");
            styleLabel.appendChild(movingBall);
            let checkSparkle = document.createElement("input");

            checkSparkle.type = "checkbox";
            checkSparkle.checked = fdSparkle;
            if (check.checked) {
                fdText = true;
                movingBall.style.left = "29px";
                styleLabel.style.backgroundColor = "blue";
            } else {
                movingBall.style.left = "1px";
                styleLabel.style.backgroundColor = "gray";

                fdText = false;
            }

            check.addEventListener(
                "change",
                function (e) {
                    console.log("check state:", check.checked);
                    if (check.checked) {
                        fdText = true;
                        movingBall.style.left = "29px";
                        styleLabel.style.backgroundColor = "blue";
                        console.log("true state:", check.checked, movingBall, styleLabel);
                    } else {
                        movingBall.style.left = "1px";
                        styleLabel.style.backgroundColor = "gray";

                        fdText = false;
                        console.log("false state:", check.checked, movingBall, styleLabel);
                    }

                    mode = previousmode;
                    switchTheStyle();
                    localStorage.setItem("FDtext", fdText.toString());
                }.bind(movingBall, styleLabel)
            );
            checkSparkle.id = "checkSparkle";

            if (checkSparkle.checked) {
                movingBallSparkle.style.left = "29px";
                fdSparkle = true;
                styleLabelSparkle.style.backgroundColor = "blue";
            } else {
                movingBallSparkle.style.left = "1px";
                styleLabelSparkle.style.backgroundColor = "gray";
                fdSparkle = false;
            }

            checkSparkle.addEventListener(
                "change",
                function (e) {
                    console.log("check state:", check.checked);
                    if (checkSparkle.checked) {
                        console.log("true state:", check.checked, movingBallSparkle, styleLabelSparkle);
                        movingBallSparkle.style.left = "29px";
                        fdSparkle = true;
                        styleLabelSparkle.style.backgroundColor = "blue";
                    } else {
                        console.log("false state:", check.checked, movingBallSparkle, styleLabelSparkle);
                        movingBallSparkle.style.left = "1px";
                        styleLabelSparkle.style.backgroundColor = "gray";
                        fdSparkle = false;
                    }
                    localStorage.setItem("FDsparkle", fdText.toString());
                    mode = previousmode;
                    switchTheStyle();
                }.bind(movingBallSparkle, styleLabelSparkle)
            );

            movingBallSparkle.classList.add("ball");
            styleLabelSparkle.appendChild(movingBallSparkle);
            styleLabelSparkle.htmlFor = "checkSparkle";
            styleLabelSparkle.classList.add("switch");

            dialog.appendChild(label);
            dialog.appendChild(document.createElement("br"));
            dialog.appendChild(document.createElement("br"));
            dialog.appendChild(label2);
            dialog.appendChild(check);
            dialog.appendChild(styleLabel);
            dialog.appendChild(document.createElement("br"));
            dialog.appendChild(document.createElement("br"));
            dialog.appendChild(label3);
            dialog.appendChild(checkSparkle);
            dialog.appendChild(styleLabelSparkle);
            dialog.appendChild(document.createElement("br"));
            dialog.appendChild(document.createElement("br"));

            let closeButton = document.createElement("button");
            closeButton.appendChild(document.createTextNode("Close"));
            closeButton.addEventListener("click", function () {
                dialog.close();
                checkSparkle.remove();
                check.remove();
            });

            dialog.appendChild(closeButton);

            dialog.style.position = "absolute";
            dialog.style.top = "33%";
            dialog.style.left = "25%";
            dialog.style.background = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--background-color").trim();
            dialog.style.color = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();

            if (mode != previousmode) mode = previousmode;
            else mode = NoneMode;

            switchTheStyle();
            parent.appendChild(dialog);
            dialog.showModal();
        } else if (mode == ChangingBackground) {
            try {
                let listOfColorButtons = document.querySelectorAll("input[type=color]");
                for (let cb of listOfColorButtons) {
                    ThemeButton.removeChild(cb);
                }
            } catch (error) {}

            var ua = navigator.userAgent.toLowerCase();
            var isAndroid = ua.indexOf("android") > -1;
            var isMobile = ua.indexOf("android") > -1;
            var isWebOs = ua.indexOf("webos") > -1;
            var isIphone = ua.indexOf("iphone") > -1;
            var isIpad = ua.indexOf("ipad") > -1;
            var isLinux = ua.indexOf("linux") > -1;

            {
                let parent = document.querySelector(".container");
                let diag = document.createElement("dialog");

                let lr = document.createElement("label");
                lr.innerText = "R (0-255)";
                lr.style.color = "red";
                let lg = document.createElement("label");
                lg.innerText = "G (0-255)";
                lg.style.color = "green";
                let lb = document.createElement("label");
                lb.innerText = "B (0-255)";
                lb.style.color = "blue";
                let Previews = document.createElement("label");
                Previews.innerText = "Preview color";
                let previewDiv = document.createElement("div");
                previewDiv.style.width = "100px";
                previewDiv.style.height = "100px";

                let ri = document.createElement("input");
                ri.type = "number";
                ri.min = "0";
                ri.max = "255";
                ri.value = "0";
                let gi = document.createElement("input");
                gi.type = "number";
                gi.min = "0";
                gi.max = "255";
                gi.value = "0";
                let bi = document.createElement("input");
                bi.type = "number";
                bi.min = "0";
                bi.max = "255";
                bi.value = "0";
                let rgb2Hex = (s) => s.match(/[0-9]+/g).reduce((a, b) => a + (b | 256).toString(16).slice(1), "#");
                previewDiv.style.background = "rgb(" + ri.value + "," + gi.value + "," + bi.value + ")";

                ri.addEventListener("input", function (event) {
                    // console.log("ri:",ri.value,"something");

                    if (ri.value == "") {
                        ri.value = 0;
                    }

                    if (ri.value < 0) ri.value = 0;

                    if (ri.value > 255) ri.value = 255;

                    previewDiv.style.background = "rgb(" + ri.value + "," + gi.value + "," + bi.value + ")";

                    let backColor = rgb2Hex("rgb(" + ri.value + "," + gi.value + "," + bi.value + ")");
                    let container = document.querySelector(".container");
                    if (container.classList.contains("dark-mode")) {
                        container.classList.remove("dark-mode");
                    }
                    let oppositeColor = rgb2Hex("rgb(" + (255 - ri.value).toString() + "," + (255 - gi.value).toString() + "," + (255 - bi.value).toString() + ")");
                    container.style.setProperty("--text-color", oppositeColor);

                    container.style.setProperty("--background-color", backColor);
                    container.style.setProperty("--instance-bg", backColor);
                    container.style.setProperty("--item-bg", backColor);
                    container.style.setProperty("--instance-bg-hover", "color-mix(" + backColor + ",#fff 70%)");
                    container.style.setProperty("--item-bg-hover", "color-mix(" + backColor + ",#fff 70%)");
                    container.style.setProperty("--sidebar-bg", "color-mix(" + backColor + ",#fff 40%)");
                    try {
                        document.querySelector(".ICPP_viewFavouritesBtn").style.background = backColor;
                    } catch (error) {}
                });
                gi.addEventListener("input", function (event) {
                    console.log("gi:", gi.value, "something");

                    if (gi.value == "") {
                        gi.value = 0;
                    }

                    if (gi.value < 0) gi.value = 0;

                    if (gi.value > 255) gi.value = 255;

                    previewDiv.style.background = "rgb(" + ri.value + "," + gi.value + "," + bi.value + ")";

                    let backColor = rgb2Hex("rgb(" + ri.value + "," + gi.value + "," + bi.value + ")");
                    let container = document.querySelector(".container");
                    if (container.classList.contains("dark-mode")) {
                        container.classList.remove("dark-mode");
                    }
                    let oppositeColor = rgb2Hex("rgb(" + (255 - ri.value).toString() + "," + (255 - gi.value).toString() + "," + (255 - bi.value).toString() + ")");
                    container.style.setProperty("--text-color", oppositeColor);

                    container.style.setProperty("--background-color", backColor);
                    container.style.setProperty("--instance-bg", backColor);
                    container.style.setProperty("--item-bg", backColor);
                    container.style.setProperty("--instance-bg-hover", "color-mix(" + backColor + ",#fff 70%)");
                    container.style.setProperty("--item-bg-hover", "color-mix(" + backColor + ",#fff 70%)");
                    container.style.setProperty("--sidebar-bg", "color-mix(" + backColor + ",#fff 40%)");
                    try {
                        document.querySelector(".ICPP_viewFavouritesBtn").style.background = backColor;
                    } catch (error) {}
                });

                bi.addEventListener("input", function (event) {
                    console.log("bi:", bi.value, "something");
                    if (bi.value == "") {
                        bi.value = 0;
                    }

                    if (bi.value < 0) bi.value = 0;

                    if (bi.value > 255) bi.value = 255;

                    previewDiv.style.background = "rgb(" + ri.value + "," + gi.value + "," + bi.value + ")";
                    let backColor = rgb2Hex("rgb(" + ri.value + "," + gi.value + "," + bi.value + ")");

                    let container = document.querySelector(".container");
                    if (container.classList.contains("dark-mode")) {
                        container.classList.remove("dark-mode");
                    }
                    let oppositeColor = rgb2Hex("rgb(" + (255 - ri.value).toString() + "," + (255 - gi.value).toString() + "," + (255 - bi.value).toString() + ")");
                    container.style.setProperty("--text-color", oppositeColor);

                    container.style.setProperty("--background-color", backColor);
                    container.style.setProperty("--instance-bg", backColor);
                    container.style.setProperty("--item-bg", backColor);
                    container.style.setProperty("--instance-bg-hover", "color-mix(" + backColor + ",#fff 70%)");
                    container.style.setProperty("--item-bg-hover", "color-mix(" + backColor + ",#fff 70%)");
                    container.style.setProperty("--sidebar-bg", "color-mix(" + backColor + ",#fff 40%)");
                    try {
                        document.querySelector(".ICPP_viewFavouritesBtn").style.background = backColor;
                    } catch (error) {}
                });

                let closeButton = document.createElement("button");
                closeButton.appendChild(document.createTextNode("Close"));
                closeButton.addEventListener("click", function () {
                    mode = previousmode;
                    diag.close();
                });
                let inputDiv = document.createElement("div");
                let previewsDiv = document.createElement("div");
                let mainLogic = document.createElement("div");
                inputDiv.appendChild(lr);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.appendChild(ri);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.appendChild(lg);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.appendChild(gi);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.appendChild(lb);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.appendChild(bi);
                inputDiv.appendChild(document.createElement("br"));
                inputDiv.style.float = "left";
                inputDiv.style.margin = "10px";
                mainLogic.appendChild(inputDiv);

                previewsDiv.appendChild(Previews);
                previewsDiv.appendChild(document.createElement("br"));
                previewsDiv.appendChild(previewDiv);
                previewsDiv.appendChild(document.createElement("br"));
                previewsDiv.style.float = "right";
                mainLogic.appendChild(previewsDiv);
                diag.appendChild(mainLogic);

                diag.appendChild(closeButton);
                diag.style.position = "absolute";
                diag.style.top = "33%";
                diag.style.left = "25%";
                diag.style.background = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--background-color").trim();
                diag.style.color = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();
                parent.appendChild(diag);
                diag.showModal();
            }
        } else {
            applyStyleOnAllElements();
            try {
                if (mode != SavedColorMode) {
                    let listOfColorButtons = document.querySelectorAll("input[type=color]");
                    let listOfColorButtonsMobile = document.querySelectorAll("dialog");

                    for (let cb of listOfColorButtons) {
                        ThemeButton.removeChild(cb);
                    }

                    for (let cb of listOfColorButtonsMobile) {
                        ThemeButton.removeChild(cb);
                    }
                } else {
                    let listOfColorButtons = document.querySelectorAll("input[type=color]");
                    if (listOfColorButtons.length === 0) {
                        let input = document.createElement("input");
                        input.setAttribute("type", "color");
                        input.defaultValue = oneColor;
                        input.disabled = true;
                        ThemeButton.appendChild(input);
                    }

                    for (let cb of listOfColorButtons) {
                        cb.disabled = true;
                    }
                }
            } catch (error) {}
        }
    }

    function doStuffOnInstancesMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.id != "instance-0" && node.classList.contains("instance") && node.querySelector(".instance-emoji")) {
                        let instanceWidth = node.offsetWidth;
                        let instanceHeight = node.offsetHeight;
                        node.style.height = instanceHeight.toString() + "px";
                        node.style.width = instanceWidth.toString() + "px";

                        applyOnOneElement(node);
                    }
                }
            }
        }
    }

    function initColors() {
        EMOJIS = {};
        console.log("init colors");
        if (localStorage.getItem("mode_theme") != null) {
            try {
                mode = parseInt(localStorage.getItem("mode_theme"));
            } catch (error) {
                mode = NoneMode;
            }
            previousmode = mode;

            if (mode == ChooseOneColorMode || mode == SavedColorMode) {
                mode = SavedColorMode;
                oneColor = localStorage.getItem("saved_color");
            }
        } else {
            mode = NoneMode;
        }

        if (SettingMode(mode)) mode = NoneMode;

        console.log("mode:", mode);

        if (localStorage.getItem("emojiColors") != null) {
            EMOJIS = JSON.parse(localStorage.getItem("emojiColors"));
        }

        if (localStorage.getItem("FDsparkle") != null) {
            fdSparkle = JSON.parse(localStorage.getItem("FDsparkle"));
        }

        if (localStorage.getItem("FDtext") != null) {
            fdText = JSON.parse(localStorage.getItem("FDtext"));
        }

        if (localStorage.getItem("animationSpeed") != null) {
            animationSpeed = JSON.parse(localStorage.getItem("animationSpeed"));
        }

        const instanceObserver = new MutationObserver((mutations) => {
            doStuffOnInstancesMutation(mutations);
        });

        instanceObserver.observe(document.getElementsByClassName("instances")[0], {
            childList: true,
            subtree: true,
        });

        const LightModeObserver = new MutationObserver((mutations) => {
            switchTheStyle();
        });
        LightModeObserver.observe(document.getElementsByClassName("container")[0], {
            childList: false,
            subtree: false,
            attributeFilter: ["class"],
            attributeOldValue: true,
        });
    }

    function injectCSS() {
        let css = `
.instance  {
    --bg-angle     : -60deg;
    --backgroundImg: none;
    --x-offset     : 0px;
    --y-offset     : 0px;
    --radius       : 20px;
    --spread       : 6.4px;
    --hue: 0;
    --hsl-color: var(--hue), 100%, 50%;
    --shadow-rgb   : 0, 255, 255;
    --opacity      : 30%;
    --myColor: rgb(0,255,255);
    border-color:var(--myColor);
    border-radius: 10px;
    box-shadow   : 0 0 var(--radius) color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity )),
    inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%) ;
    display: block;
}
.invisible
{
    display:none;
}
.instance-discovered  {
    --img-content:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23FFAC33' d='M34.347 16.893l-8.899-3.294-3.323-10.891c-.128-.42-.517-.708-.956-.708-.439 0-.828.288-.956.708l-3.322 10.891-8.9 3.294c-.393.146-.653.519-.653.938 0 .418.26.793.653.938l8.895 3.293 3.324 11.223c.126.424.516.715.959.715.442 0 .833-.291.959-.716l3.324-11.223 8.896-3.293c.391-.144.652-.518.652-.937 0-.418-.261-.792-.653-.938z'/%3E%3Cpath fill='%23FFCC4D' d='M14.347 27.894l-2.314-.856-.9-3.3c-.118-.436-.513-.738-.964-.738-.451 0-.846.302-.965.737l-.9 3.3-2.313.856c-.393.145-.653.52-.653.938 0 .418.26.793.653.938l2.301.853.907 3.622c.112.444.511.756.97.756.459 0 .858-.312.97-.757l.907-3.622 2.301-.853c.393-.144.653-.519.653-.937 0-.418-.26-.793-.653-.937zM10.009 6.231l-2.364-.875-.876-2.365c-.145-.393-.519-.653-.938-.653-.418 0-.792.26-.938.653l-.875 2.365-2.365.875c-.393.146-.653.52-.653.938 0 .418.26.793.653.938l2.365.875.875 2.365c.146.393.52.653.938.653.418 0 .792-.26.938-.653l.875-2.365 2.365-.875c.393-.146.653-.52.653-.938 0-.418-.26-.792-.653-.938z'/%3E%3C/svg%3E");
    --x-offset        : 0px;
    --y-offset        : 0px;
    --radius          : 20px;
    --spread          : 4px;
    --shadow-rgb      : rgb( 0, 255, 255);
    --opacity         : 50%;
    border-width      : 2px;
    -webkit-box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity)),
    inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity)) ;
    -moz-box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread)  color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity)),
    inset 0 0 20px color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity));
    ;
    box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity)),
    inset 0 0 20px color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity));
}
.instance-discovered::after  {
    content: var(--img-content);
    width  : 30px;
    height : 30px;
    position : absolute;
    top      : 0;
    left     : 0;
    transform: translate(-50%, -50%);
}
.instance-discovered-text {
    --main-color  : rgb(45,255,196);
    --second-color: #167fc6;
    -webkit-animation      : background-pan 3s linear infinite !important;
    animation              : background-pan 3s linear infinite !important;
    background             : linear-gradient( to right,  var(--main-color), var(--second-color),var(--main-color) ) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    -moz-background-clip   : text;
    -moz-text-fill-color   : transparent;
    -moz-animation         : background-pan 3s linear infinite !important;
    white-space            : nowrap !important;
    z-index                : 200;
    font-weight            : bold !important;
    font-size              : 16px !important;
    width                  : 200px !important;
    background-size        : 200% !important;
}
.instance-discovered-emoji  {
    filter: none !important;
    ;
}
.noneStyle
{
    box-shadow        : none !important;
    -webkit-box-shadow: none !important;
    -moz-box-shadow   : none !important;
}
.item-discovered  {
    --x-offset  : 0px;
    --y-offset  : 0px;
    --radius    : 5px;
    --spread    : 4px;
    --shadow-rgb: 255, 240, 31;
    --opacity   : 0.2;
    border-width: 1px !important;
    -webkit-box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) rgba(var(--shadow-rgb), var(--opacity));
    -moz-box-shadow   : var(--x-offset) var(--y-offset) var(--radius) var(--spread) rgba(var(--shadow-rgb), var(--opacity));
    box-shadow        : var(--x-offset) var(--y-offset) var(--radius) var(--spread) rgba(var(--shadow-rgb), var(--opacity));
    border-color      : rgba(var(--shadow-rgb), 0.4) !important;
}
.theme_settings_cont
{
    background : var(--background-color);
    border     : 1px solid var(--border-color);
    color      : var(--text-color);
    font-family: Roboto, sans-serif;
    font-size  : 15.4px;
}
.theme:hover
{
    background:gray;
}
.theme_settings_opt  {
    overflow-y: scroll;
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;
    /* Internet Explorer 10+ */
}
.theme_settings_opt::-webkit-scrollbar  {
    /* WebKit */
    width: 0;
    height: 0;
}
@keyframes spin  {
    0%  {
        --bg-angle: 0.00deg;
    }
    1%  {
        --bg-angle: 3.60deg;
    }
    2%  {
        --bg-angle: 7.20deg;
    }
    3%  {
        --bg-angle: 10.80deg;
    }
    4%  {
        --bg-angle: 14.40deg;
    }
    5%  {
        --bg-angle: 18.00deg;
    }
    6%  {
        --bg-angle: 21.60deg;
    }
    7%  {
        --bg-angle: 25.20deg;
    }
    8%  {
        --bg-angle: 28.80deg;
    }
    9%  {
        --bg-angle: 32.40deg;
    }
    10%  {
        --bg-angle: 36.00deg;
    }
    11%  {
        --bg-angle: 39.60deg;
    }
    12%  {
        --bg-angle: 43.20deg;
    }
    13%  {
        --bg-angle: 46.80deg;
    }
    14%  {
        --bg-angle: 50.40deg;
    }
    15%  {
        --bg-angle: 54.00deg;
    }
    16%  {
        --bg-angle: 57.60deg;
    }
    17%  {
        --bg-angle: 61.20deg;
    }
    18%  {
        --bg-angle: 64.80deg;
    }
    19%  {
        --bg-angle: 68.40deg;
    }
    20%  {
        --bg-angle: 72.00deg;
    }
    21%  {
        --bg-angle: 75.60deg;
    }
    22%  {
        --bg-angle: 79.20deg;
    }
    23%  {
        --bg-angle: 82.80deg;
    }
    24%  {
        --bg-angle: 86.40deg;
    }
    25%  {
        --bg-angle: 90.00deg;
    }
    26%  {
        --bg-angle: 93.60deg;
    }
    27%  {
        --bg-angle: 97.20deg;
    }
    28%  {
        --bg-angle: 100.80deg;
    }
    29%  {
        --bg-angle: 104.40deg;
    }
    30%  {
        --bg-angle: 108.00deg;
    }
    31%  {
        --bg-angle: 111.60deg;
    }
    32%  {
        --bg-angle: 115.20deg;
    }
    33%  {
        --bg-angle: 118.80deg;
    }
    34%  {
        --bg-angle: 122.40deg;
    }
    35%  {
        --bg-angle: 126.00deg;
    }
    36%  {
        --bg-angle: 129.60deg;
    }
    37%  {
        --bg-angle: 133.20deg;
    }
    38%  {
        --bg-angle: 136.80deg;
    }
    39%  {
        --bg-angle: 140.40deg;
    }
    40%  {
        --bg-angle: 144.00deg;
    }
    41%  {
        --bg-angle: 147.60deg;
    }
    42%  {
        --bg-angle: 151.20deg;
    }
    43%  {
        --bg-angle: 154.80deg;
    }
    44%  {
        --bg-angle: 158.40deg;
    }
    45%  {
        --bg-angle: 162.00deg;
    }
    46%  {
        --bg-angle: 165.60deg;
    }
    47%  {
        --bg-angle: 169.20deg;
    }
    48%  {
        --bg-angle: 172.80deg;
    }
    49%  {
        --bg-angle: 176.40deg;
    }
    50%  {
        --bg-angle: 180.00deg;
    }
    51%  {
        --bg-angle: 183.60deg;
    }
    52%  {
        --bg-angle: 187.20deg;
    }
    53%  {
        --bg-angle: 190.80deg;
    }
    54%  {
        --bg-angle: 194.40deg;
    }
    55%  {
        --bg-angle: 198.00deg;
    }
    56%  {
        --bg-angle: 201.60deg;
    }
    57%  {
        --bg-angle: 205.20deg;
    }
    58%  {
        --bg-angle: 208.80deg;
    }
    59%  {
        --bg-angle: 212.40deg;
    }
    60%  {
        --bg-angle: 216.00deg;
    }
    61%  {
        --bg-angle: 219.60deg;
    }
    62%  {
        --bg-angle: 223.20deg;
    }
    63%  {
        --bg-angle: 226.80deg;
    }
    64%  {
        --bg-angle: 230.40deg;
    }
    65%  {
        --bg-angle: 234.00deg;
    }
    66%  {
        --bg-angle: 237.60deg;
    }
    67%  {
        --bg-angle: 241.20deg;
    }
    68%  {
        --bg-angle: 244.80deg;
    }
    69%  {
        --bg-angle: 248.40deg;
    }
    70%  {
        --bg-angle: 252.00deg;
    }
    71%  {
        --bg-angle: 255.60deg;
    }
    72%  {
        --bg-angle: 259.20deg;
    }
    73%  {
        --bg-angle: 262.80deg;
    }
    74%  {
        --bg-angle: 266.40deg;
    }
    75%  {
        --bg-angle: 270.00deg;
    }
    76%  {
        --bg-angle: 273.60deg;
    }
    77%  {
        --bg-angle: 277.20deg;
    }
    78%  {
        --bg-angle: 280.80deg;
    }
    79%  {
        --bg-angle: 284.40deg;
    }
    80%  {
        --bg-angle: 288.00deg;
    }
    81%  {
        --bg-angle: 291.60deg;
    }
    82%  {
        --bg-angle: 295.20deg;
    }
    83%  {
        --bg-angle: 298.80deg;
    }
    84%  {
        --bg-angle: 302.40deg;
    }
    85%  {
        --bg-angle: 306.00deg;
    }
    86%  {
        --bg-angle: 309.60deg;
    }
    87%  {
        --bg-angle: 313.20deg;
    }
    88%  {
        --bg-angle: 316.80deg;
    }
    89%  {
        --bg-angle: 320.40deg;
    }
    90%  {
        --bg-angle: 324.00deg;
    }
    91%  {
        --bg-angle: 327.60deg;
    }
    92%  {
        --bg-angle: 331.20deg;
    }
    93%  {
        --bg-angle: 334.80deg;
    }
    94%  {
        --bg-angle: 338.40deg;
    }
    95%  {
        --bg-angle: 342.00deg;
    }
    96%  {
        --bg-angle: 345.60deg;
    }
    97%  {
        --bg-angle: 349.20deg;
    }
    98%  {
        --bg-angle: 352.80deg;
    }
    99%  {
        --bg-angle: 356.40deg;
    }
}
@keyframes change-colors {
    0% {
        --hue:0
    }
    1% {
        --hue:3.6
    }
    2% {
        --hue:7.2
    }
    3% {
        --hue:10.8
    }
    4% {
        --hue:14.4
    }
    5% {
        --hue:18
    }
    6% {
        --hue:21.6
    }
    7% {
        --hue:25.2
    }
    8% {
        --hue:28.8
    }
    9% {
        --hue:32.4
    }
    10% {
        --hue:36
    }
    11% {
        --hue:39.6
    }
    12% {
        --hue:43.2
    }
    13% {
        --hue:46.8
    }
    14% {
        --hue:50.4
    }
    15% {
        --hue:54
    }
    16% {
        --hue:57.6
    }
    17% {
        --hue:61.2
    }
    18% {
        --hue:64.8
    }
    19% {
        --hue:68.4
    }
    20% {
        --hue:72
    }
    21% {
        --hue:75.6
    }
    22% {
        --hue:79.2
    }
    23% {
        --hue:82.8
    }
    24% {
        --hue:86.4
    }
    25% {
        --hue:90
    }
    26% {
        --hue:93.6
    }
    27% {
        --hue:97.2
    }
    28% {
        --hue:100.8
    }
    29% {
        --hue:104.4
    }
    30% {
        --hue:108
    }
    31% {
        --hue:111.6
    }
    32% {
        --hue:115.2
    }
    33% {
        --hue:118.8
    }
    34% {
        --hue:122.4
    }
    35% {
        --hue:126
    }
    36% {
        --hue:129.6
    }
    37% {
        --hue:133.2
    }
    38% {
        --hue:136.8
    }
    39% {
        --hue:140.4
    }
    40% {
        --hue:144
    }
    41% {
        --hue:147.6
    }
    42% {
        --hue:151.2
    }
    43% {
        --hue:154.8
    }
    44% {
        --hue:158.4
    }
    45% {
        --hue:162
    }
    46% {
        --hue:165.6
    }
    47% {
        --hue:169.2
    }
    48% {
        --hue:172.8
    }
    49% {
        --hue:176.4
    }
    50% {
        --hue:180
    }
    51% {
        --hue:183.6
    }
    52% {
        --hue:187.2
    }
    53% {
        --hue:190.8
    }
    54% {
        --hue:194.4
    }
    55% {
        --hue:198
    }
    56% {
        --hue:201.6
    }
    57% {
        --hue:205.2
    }
    58% {
        --hue:208.8
    }
    59% {
        --hue:212.4
    }
    60% {
        --hue:216
    }
    61% {
        --hue:219.6
    }
    62% {
        --hue:223.2
    }
    63% {
        --hue:226.8
    }
    64% {
        --hue:230.4
    }
    65% {
        --hue:234
    }
    66% {
        --hue:237.6
    }
    67% {
        --hue:241.2
    }
    68% {
        --hue:244.8
    }
    69% {
        --hue:248.4
    }
    70% {
        --hue:252
    }
    71% {
        --hue:255.6
    }
    72% {
        --hue:259.2
    }
    73% {
        --hue:262.8
    }
    74% {
        --hue:266.4
    }
    75% {
        --hue:270
    }
    76% {
        --hue:273.6
    }
    77% {
        --hue:277.2
    }
    78% {
        --hue:280.8
    }
    79% {
        --hue:284.4
    }
    80% {
        --hue:288
    }
    81% {
        --hue:291.6
    }
    82% {
        --hue:295.2
    }
    83% {
        --hue:298.8
    }
    84% {
        --hue:302.4
    }
    85% {
        --hue:306
    }
    86% {
        --hue:309.6
    }
    87% {
        --hue:313.2
    }
    88% {
        --hue:316.8
    }
    89% {
        --hue:320.4
    }
    90% {
        --hue:324
    }
    91% {
        --hue:327.6
    }
    92% {
        --hue:331.2
    }
    93% {
        --hue:334.8
    }
    94% {
        --hue:338.4
    }
    95% {
        --hue:342
    }
    96% {
        --hue:345.6
    }
    97% {
        --hue:349.2
    }
    98% {
        --hue:352.8
    }
    99% {
        --hue:356.4
    }
    100% {
        --hue:360
    }
}
.switch
{
    background-color: gray;
    border-radius: 30px;
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
    -webkit-transition: .4s;
    transition: .4s;
}
input[type=checkbox]
{
    opacity: 0;
    width: 0;
    height: 0;
}
.ball
{
    height:34px;
    width:30px;
    content:'';
    border-radius:50%;
    background-color:var(--text-color);
    position:absolute;
    margin-left:1px;
    -webkit-transition: .4s;
    transition: .4s;
};
        `;

        let style = document.createElement("style");
        style.appendChild(document.createTextNode(css.trim()));
        document.getElementsByTagName("head")[0].appendChild(style);
    }

    function set_up_color_settings_button() {
        let settings = document.querySelector(".settings-content");
        let theme_settings_container = document.createElement("div");
        ThemeButton = theme_settings_container;
        console.log("seetings", settings);

        if (settings == null) {
            settings = document.querySelector(".container");
            theme_settings_container.style.position = "absolute";
            theme_settings_container.style.left = "20px";
            theme_settings_container.style.top = "100px";
            theme_settings_container.style.width = "500px";
            theme_settings_container.style.height = "50px";

            theme_settings_container.classList.add("theme_settings_cont");
        } else {
            theme_settings_container.classList.add("setting");
        }

        theme_settings_container.appendChild(document.createTextNode("Theme Settings 🎨"));
        let optionsdiv = document.createElement("div");
        let selectedP = document.createElement("p");
        selectedP.textContent = modes[mode];
        selectedPrompt = selectedP;
        optionsdiv.classList.add("theme_settings_opt");
        let dropdown = optionsdiv;

        optionsdiv.style.height = "100px";

        optionsdiv.style.overflowY = "scroll";
        dropdown.id = "dropdown_theme";

        let index = 0;

        for (let m of modes) {
            let option = document.createElement("p");
            option.classList.add("theme");
            option.addEventListener(
                "click",
                function (event, index, optionsdiv) {
                    console.log("event:", event);
                    console.log("index:", index);
                    console.log("opt:", optionsdiv);

                    optionsdiv.stopPropagation();
                    console.log("index:", event);

                    previousmode = mode;
                    mode = event;
                    selectedP.textContent = modes[mode];
                    option.style.whiteSpace = "nowrap";
                    option.style.overflow = "hidden";

                    console.log("optdiv:", optionsdiv);
                    console.log("fatherButton:", ThemeButton);

                    switchTheStyle();
                }.bind(event, index, optionsdiv)
            );

            option.textContent = m;
            option.style.whiteSpace = "nowrap";
            option.style.overflow = "hidden";
            // option.style.textOverflow = "ellipsis";

            optionsdiv.appendChild(option);
            index = index + 1;
        }

        dropMenu = optionsdiv;
        let selectionDiv = document.createElement("div");

        selectedP.addEventListener(
            "click",
            function () {
                selectionDiv.appendChild(optionsdiv);
                hidden = 1;
            },
            false
        );

        selectionDiv.appendChild(selectedP);
        selectionDiv.appendChild(document.createElement("hr"));

        theme_settings_container.addEventListener(
            "click",
            function () {
                console.log("hidden here:", hidden);

                if (hidden == 1) {
                    if (!theme_settings_container.contains(selectionDiv)) theme_settings_container.appendChild(selectionDiv);

                    hidden = 0;
                } else {
                    if (selectionDiv.contains(optionsdiv)) selectionDiv.removeChild(optionsdiv);

                    if (theme_settings_container.contains(selectionDiv)) theme_settings_container.removeChild(selectionDiv);
                    hidden = 1;
                }
            },
            false
        );

        settings.appendChild(theme_settings_container);
        switchTheStyle();
    }

    window.addEventListener("load", async () => {
        injectCSS();
        initColors();
        set_up_color_settings_button();
    }, false);
})();
