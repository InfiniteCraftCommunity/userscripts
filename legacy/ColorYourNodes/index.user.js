// ==UserScript==
// @name            Color Your Nodes
// @namespace       Color Your Nodes
// @match           https://neal.fun/infinite-craft/*
// @grant           none
// @version         1.0.1
// @author          Alexander_Andercou
// @description     Color Your Nodes
// @downloadURL     https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/ColorYourNodes/index.user.js
// @updateURL       https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/ColorYourNodes/index.user.js
// ==/UserScript==


(function () {
    LetterColors = {
        A: [0, 127, 255],
        B: [139, 69, 19],
        C: [220, 20, 60],
        D: [240, 225, 48],
        E: [80, 200, 120],
        F: [217, 2, 125],
        G: [0, 255, 0],
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

    function keyaction(k) {
        let keys = String.fromCharCode(k.charCode).toUpperCase();

        let node = document.querySelector(".mouseOver");
        if (node == null) return;
        
        const [r, g, b] = LetterColors[keys[0]];
        node.style.borderColor = `rgb(${r},${g},${b})`;
        node.style.borderImage = "";
    }

    function doStuffOnInstancesMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.id != "instance-0") {
                        node.addEventListener("mouseover", (e) => {
                            node.classList.add("mouseOver");
                        });

                        node.addEventListener("mouseout", (e) => {
                            if (node.classList.contains("mouseOver")) node.classList.remove("mouseOver");
                        });
                    }
                }
            }
        }
    }

    function initChooseColorForNode() {
        const instanceObserver = new MutationObserver((mutations) => {
            doStuffOnInstancesMutation(mutations);
        });

        instanceObserver.observe(document.getElementsByClassName("instances")[0], {
            childList: true,
            subtree: true,
        });

        document.addEventListener("keypress", (k) => keyaction(k));
    }

    window.addEventListener("load", async () => {
        initChooseColorForNode();
    }, false);
})();
