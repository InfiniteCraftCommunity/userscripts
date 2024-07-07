// ==UserScript==
// @name	More Elements
// @namespace	nat.is-a.dev
// @match	https://neal.fun/infinite-craft/*
// @grant	GM.getValue
// @grant	GM.setValue
// @grant	unsafeWindow
// @run-at	document-end
// @version	1.0
// @author	Natasquare
// @description	Store elements in GM storage instead of localStorage, allowing bigger save files to be used. Optional encoding functions can be supplied.
// ==/UserScript==

function encodeElements(elements) {
	let encodedElements = "",
		encodedEmojis = "";

	for (const element of elements) {
		encodedElements += (element.discovered ? "\x02" : "\x01") + element.text
		encodedEmojis += "\x01" + (element.emoji ?? "");
	}

	return encodedElements + "\x01\x0d" + encodedEmojis;
}

function decodeElements(raw) {
	if (raw === "\x01\x0d") return [];
	const [encodedElements, encodedEmojis] = raw.split("\x01\x0d\x01");
	const emojis = encodedEmojis.split("\x01");
	const out = [];
	for (let i = 0, length = encodedElements.length; i < length;) {
		const element = {
			discovered: encodedElements[i++] === "\x02",
			text: encodedElements[i++],
			emoji: emojis[out.length] || undefined
		}
		while (i < length && encodedElements[i] !== "\x01" && encodedElements[i] !== "\x02")
			element.text += encodedElements[i++];
		out.push(element);
	}
	return out;
}

(function() {
	unsafeWindow._getItem = unsafeWindow.Storage.prototype.getItem;
	unsafeWindow._setItem = unsafeWindow.Storage.prototype.setItem;
	unsafeWindow._removeItem = unsafeWindow.Storage.prototype.removeItem;

	async function init() {
		const rawElements = await GM.getValue("elements");
		let newElements = JSON.parse((await GM.getValue("newElements")) ?? "[]"),
			elements = rawElements ? decodeElements(rawElements) : [];

		let elementSet = new Set();
		for (let i = elements.length; i--;)
			elementSet.add(elements[i].text);

		function moveToElements(array) {
			if (elements.length === 0) {
				elements = array;
				return;
			}

			for (let i = array.length; i--;) {
				const element = array[i];
				if (!elementSet.has(element.text)) {
					elements.push(element);
					elementSet.add(element.text);
				}
			}
		}

		const icData = JSON.parse(unsafeWindow._getItem.call(localStorage, "infinite-craft-data"));
		if (icData.elements.length > 0) {
			moveToElements(icData.elements);
			unsafeWindow._setItem.call(localStorage, "infinite-craft-data", JSON.stringify({
				...icData,
				elements: []
			}));
		}

		moveToElements(newElements);
		await GM.setValue("newElements", "[]");
		newElements = [];

		unsafeWindow.Storage.prototype.getItem = exportFunction(function(...args) {
			const item = unsafeWindow._getItem.apply(this, args);
			if (args[0] !== "infinite-craft-data") return item;
			return JSON.stringify({
				...JSON.parse(item),
				elements
			});
		}, unsafeWindow);

		unsafeWindow.Storage.prototype.setItem = exportFunction(function(...args) {
			if (args[0] !== "infinite-craft-data") return unsafeWindow._setItem.apply(this, args);

			const newSave = JSON.parse(args[1]);
			let hasRemoved = false;

			const currentElements = [...elementSet],
				newElementSet = new Set();
			for (let i = newSave.elements.length; i--;)
				newElementSet.add(newSave.elements[i].text);
			for (let i = currentElements.length; i--;) {
				const text = currentElements[i];
				if (!newElementSet.has(text)) {
					hasRemoved = true;
					break;
				}
			}

			if (hasRemoved || newElementSet.size - elementSet.size > 1e3) {
				elements = newSave.elements;
				newElements = [];
				elementSet = newElementSet;
				GM.setValue("elements", encodeElements(elements));
				GM.setValue("newElements", "[]");
			} else {
				for (let i = newSave.elements.length; i--;) {
					const element = newSave.elements[i];
					if (!elementSet.has(element.text)) {
						newElements.push(element);
						elementSet.add(element.text);
					}
				}
				GM.setValue("newElements", JSON.stringify(newElements));
			}

			return unsafeWindow._setItem.call(localStorage, "infinite-craft-data", JSON.stringify({
				...newSave,
				elements: []
			}));
		}, unsafeWindow);

		unsafeWindow.Storage.prototype.removeItem = exportFunction(function(...args) {
			if (args[0] === "infinite-craft-data") {
				GM.setValue("elements", encodeElements([]));
				GM.setValue("newElements", "[]");
			}
			unsafeWindow._removeItem.apply(this, args);
		}, unsafeWindow);

		setTimeout(() => unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements = JSON.parse(JSON.stringify(elements)), 200);
		await GM.setValue("elements", encodeElements(elements));
	}

	window.addEventListener("load", init, false);
})()