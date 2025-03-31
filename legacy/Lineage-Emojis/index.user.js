
// ==UserScript==
//
// @name            IB Lineage Emoji Generator
// @namespace       gameroman.pages.dev
//
// @match           https://infinibrowser.wiki/tools/lineage-maker
//
// @grant           none
//
// @version         2.0
//
// @author          GameRoMan
// @author          ActiveTutorial
//
// @description     Adds option to add emojis automatically
//
// @downloadURL	    http://gameroman.pages.dev/userscripts/infinite-craft/users/gameroman/lineage-emojis/index.user.js
// @updateURL	    http://gameroman.pages.dev/userscripts/infinite-craft/users/gameroman/lineage-emojis/index.user.js
//
// @supportURL      https://discord.gg/YHEmKEcQjy
// @homepageURL     https://discord.gg/YHEmKEcQjy
//
// @license         MIT
//
// ==/UserScript==


(function() {
    'use strict';

    async function setEmojis() {
        [...document.getElementById('item_list').children].forEach(async (elemDiv) => {
            if (!elemDiv.firstChild.value) {
                const response = await fetch(`https://infinibrowser.wiki/api/item?id=${encodeURIComponent(elemDiv.textContent.trim())}`);
                const data = await response.json();
                elemDiv.firstChild.value = (data.emoji ?? '');
                elemDiv.firstChild.focus();
                window.scrollTo(0, 0);
            }
        });
    }

    function resetEmojis() {
        [...document.getElementById('item_list').children].forEach(elemDiv => {
            elemDiv.firstChild.value = '';
            elemDiv.firstChild.focus();
            window.scrollTo(0, 0);
        });
    }

    function createButtons() {
        const setEmojisButton = document.createElement("button");
        setEmojisButton.id = 'set-emojis';
        setEmojisButton.className = 'btn';
        setEmojisButton.textContent = 'Set Emojis';
        setEmojisButton.style.marginRight = '5px';
        setEmojisButton.addEventListener('click', setEmojis);

        const resetEmojisButton = document.createElement("button");
        resetEmojisButton.id = 'reset-emojis';
        resetEmojisButton.className = 'btn';
        resetEmojisButton.textContent = 'Reset Emojis';
        resetEmojisButton.addEventListener('click', resetEmojis);

        const buttonsElement = document.querySelector('body > main > div:nth-child(3)');
        buttonsElement.id = 'buttonsElement';
        buttonsElement.appendChild(setEmojisButton);
        buttonsElement.appendChild(resetEmojisButton);
    }

    window.addEventListener("load", createButtons());
})();
