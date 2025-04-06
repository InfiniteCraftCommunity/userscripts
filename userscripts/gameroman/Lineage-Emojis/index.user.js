// ==UserScript==
//
// @name            Lineage Emojis
// @namespace       roman.is-a.dev
//
// @match           https://infinibrowser.wiki/tools/lineage-maker
//
// @version         2.1
// @author          GameRoMan
// @description     Add emojis automatically to your lineages on InfiniBrowser
//
// @downloadURL     https://roman.is-a.dev/userscripts/infinite-craft/users/gameroman/lineage-emojis/index.user.js
// @updateURL       https://roman.is-a.dev/userscripts/infinite-craft/users/gameroman/lineage-emojis/index.user.js
//
// @supportURL      https://roman.is-a.dev/discord
// @homepageURL     https://roman.is-a.dev/discord
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

		const buttonsElement = document.getElementById('share').parentElement;
		buttonsElement.id = 'buttonsElement';
		buttonsElement.appendChild(setEmojisButton);
		buttonsElement.appendChild(resetEmojisButton);
	}

	window.addEventListener("load", createButtons);
})();
