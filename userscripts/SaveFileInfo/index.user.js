// ==UserScript==
//
// @name          Save File Info
// @namespace     zptr.cc
// @match         https://neal.fun/infinite-craft/*
// @grantv        unsafeWindow
// @run-at        document-end
// @version       0.1
// @author        zeroptr
// @downloadURL   https://raw.githubusercontent.com/InfiniteCraftCommunity/userscripts/master/userscripts/SaveFileInfo/index.user.js
// @updateURL     https://raw.githubusercontent.com/InfiniteCraftCommunity/userscripts/master/userscripts/SaveFileInfo/index.user.js
// @description   Adds a button that displays some useful information about your savefile
//
// ==/UserScript==


window.addEventListener("load", async () => {
	const button = document.querySelector(".side-controls img").cloneNode();

	button.src = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMzYwIDYwMGg4MHYtMjQwaC04MHYyNDB6bTQwLTMyMGMxMS4zMzMgMCAyMC44MzMtMy44MzMgMjguNS0xMS41czExLjUtMTcuMTY3IDExLjUtMjguNS0zLjgzMy0yMC44MzMtMTEuNS0yOC41LTE3LjE2Ny0xMS41LTI4LjUtMTEuNS0yMC44MzMgMy44MzMtMjguNSAxMS41LTExLjUgMTcuMTY3LTExLjUgMjguNSAzLjgzMyAyMC44MzMgMTEuNSAyOC41IDE3LjE2NyAxMS41IDI4LjUgMTEuNXptMCA1MjBjLTU1LjMzMyAwLTEwNy4zMy0xMC41LTE1Ni0zMS41cy05MS00OS41LTEyNy04NS41LTY0LjUtNzguMzMzLTg1LjUtMTI3LTMxLjUtMTAwLjY3LTMxLjUtMTU2IDEwLjUtMTA3LjMzIDMxLjUtMTU2IDQ5LjUtOTEgODUuNS0xMjcgNzguMzMzLTY0LjUgMTI3LTg1LjUgMTAwLjY3LTMxLjUgMTU2LTMxLjUgMTA3LjMzIDEwLjUgMTU2IDMxLjUgOTEgNDkuNSAxMjcgODUuNSA2NC41IDc4LjMzMyA4NS41IDEyNyAzMS41IDEwMC42NyAzMS41IDE1Ni0xMC41IDEwNy4zMy0zMS41IDE1Ni00OS41IDkxLTg1LjUgMTI3LTc4LjMzMyA2NC41LTEyNyA4NS41LTEwMC42NyAzMS41LTE1NiAzMS41em0wLTgwYzg5LjMzMyAwIDE2NS0zMSAyMjctOTNzOTMtMTM3LjY3IDkzLTIyNy0zMS0xNjUtOTMtMjI3LTEzNy42Ny05My0yMjctOTMtMTY1IDMxLTIyNyA5My05MyAxMzcuNjctOTMgMjI3IDMxIDE2NSA5MyAyMjcgMTM3LjY3IDkzIDIyNyA5M3oiLz48L3N2Zz4=";
	button.addEventListener("click", openSaveFileInfo);

	// for some reason the button sometimes gets added before ICH's buttons
	// which ruins muscle memory because the order is always random
	setTimeout(() => document.querySelector(".side-controls").append(button), 1);

	$injectStyle(".modal{margin:auto;max-width:75%;max-height:75%;padding-top:0px;border:1px solid var(--border-color);background-color:var(--background-color);font-family:Roboto,sans-serif;border-radius:5px;outline:none!important}.modal::backdrop{background-color:rgba(0,0,0,.5)}.modal-header{position:sticky;top:0;display:flex;gap:1rem;padding-top:16px;padding-bottom:16px;justify-content:space-between;align-items:center;align-content:center;background-color:var(--background-color)user-select:none}.modal-title{font-size:20px;line-height:35px;color:var(--text-color)}.modal-text{font-size:15px;color:var(--text-color);user-select:none;pointer-events:unset!important;text-align:left!important}");
	$injectStyle(`
		#savefile_info .modal-text > div {
			display: grid;
			grid-template-columns: 1fr 1.25fr;
			user-select: text !important;
			gap: 1ch;
		}

		#savefile_info .modal-text > div span:first-child,
		.progressbar-container span {
			opacity: .5;
		}

		.progressbar-container {
			grid-template-columns: 1fr max-content !important;
			align-content: center;
			align-items: center;
			margin-top: 8px;
		}

		.progressbar {
			display: block;
			position: relative;
			background-color: #444;
			border-radius: 255px;
			height: 1.5ch;
		}

		.progressbar::before {
			content: "";
			position: absolute;
			top: 0; left: 0;
			border-radius: 255px;
			display: inline-block;
			background-color: #9af;
			width: var(--progress);
			min-width: 1.5ch;
			height: 100%;
		}
	`);
});

function $injectStyle(style) {
	const element = document.createElement("style");
	element.textContent = style;
	document.head.append(element);
}

const prettyBytes = (b,u=["",..."kMGTY"].find(_=>b<1e3||(b/=1e3)&0))=>b.toFixed(2)+u+"B";
const countByPredicate = (a,f)=>a.reduce((p,c)=>p+!!f(c),0);

function openSaveFileInfo() {
	if (document.getElementById("savefile_info"))
		document.getElementById("savefile_info").remove();

	const dialog = document.createElement("dialog");
	const header = document.createElement("div");
	const content = document.createElement("div");

	dialog.classList.add("modal");
	header.classList.add("modal-header");
	content.classList.add("modal-text");

	header.innerHTML = `
		<h1 class="modal-title">Save File Info</h1>
			<div onclick="savefile_info.remove()" class="close-button-container">
			<img class="close-button" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNjAwIj48cGF0aCBkPSJNMzAwLjAwMDAyLDM0OS44MzIzM0w2MC4xMDc4Miw1ODkuNzIzMzJjLTYuNTQ2ODksNi41NDc2OS0xNC43NzY0Myw5Ljg5NzE4LTI0LjY4ODYsMTAuMDQ4NTEtOS45MTEzOCwuMTUyMS0xOC4yOTIyNC0zLjE5NzQtMjUuMTQyNTYtMTAuMDQ4NTFDMy40MjU1Nyw1ODIuODcyOTgsLjAwMDAyLDU3NC41Njc4LDAsNTY0LjgwNzc0Yy4wMDAwMi05Ljc2MDA3LDMuNDI1NTctMTguMDY1MjYsMTAuMjc2NjYtMjQuOTE1NTZsMjM5Ljg5MTAxLTIzOS44OTIyTDEwLjI3NjY4LDYwLjEwNzc4QzMuNzI4OTksNTMuNTYwOTIsLjM3OTUsNDUuMzMxMzYsLjIyODE3LDM1LjQxOTIyLC4wNzYwNywyNS41MDc4OCwzLjQyNTU3LDE3LjEyNywxMC4yNzY2OCwxMC4yNzY2NiwxNy4xMjcwMiwzLjQyNTUzLDI1LjQzMjIsMCwzNS4xOTIyNiwwczE4LjA2NTI2LDMuNDI1NTMsMjQuOTE1NTYsMTAuMjc2NjZsMjM5Ljg5MjIsMjM5Ljg5MDk3TDUzOS44OTIyMiwxMC4yNzY1OWM2LjU0Njg2LTYuNTQ3NzIsMTQuNzc2NDMtOS44OTcyLDI0LjY4ODU2LTEwLjA0ODUxLDkuOTExMzQtLjE1MjE3LDE4LjI5MjIyLDMuMTk3MzgsMjUuMTQyNTYsMTAuMDQ4NTEsNi44NTExMyw2Ljg1MDI3LDEwLjI3NjY2LDE1LjE1NTUyLDEwLjI3NjY2LDI0LjkxNTU2cy0zLjQyNTUzLDE4LjA2NTIyLTEwLjI3NjY2LDI0LjkxNTU2bC0yMzkuODkwOTcsMjM5Ljg5MjI3LDIzOS44OTEwNSwyMzkuODkyMmM2LjU0NzcyLDYuNTQ2ODksOS44OTcyLDE0Ljc3NjQzLDEwLjA0ODUxLDI0LjY4ODYsLjE1MjE3LDkuOTExMzgtMy4xOTczOCwxOC4yOTIyNC0xMC4wNDg1MSwyNS4xNDI1Ni02Ljg1MDI3LDYuODUxMS0xNS4xNTU1MiwxMC4yNzY2NC0yNC45MTU1NiwxMC4yNzY2Ni05Ljc2MDA0LS4wMDAwMi0xOC4wNjUyMi0zLjQyNTU3LTI0LjkxNTU2LTEwLjI3NjY2bC0yMzkuODkyMjctMjM5Ljg5MTAxWiIvPjwvc3ZnPg==">
		</div>
	`;

	content.textContent = "Loading...";

	dialog.id = "savefile_info";
	dialog.append(header, content);

	document.querySelector(".container").append(dialog);
	dialog.showModal();

	Promise.resolve().then(() => {
		loadStats(content);
	});
}

/** Approximates the savefile size stored in gm_abuse */
function getGMAbuseSaveFileSize(elements) {
	let size = 0;
	for (const element of elements)
		size += 2 + element.text.length + (element.emoji || "").length;
	return size + 2;
}

function loadStats(content) {
	const intl = new Intl.NumberFormat();
	const raw = localStorage.getItem("infinite-craft-data");
	const data = JSON.parse(raw);

	content.innerHTML = "";
	const addCol = (label, value) => {
		const div = document.createElement("div");
		const labelSpan = document.createElement("span");
		const valueSpan = document.createElement("span");

		labelSpan.textContent = label;
		valueSpan.textContent = value;

		div.append(labelSpan, valueSpan);
		content.append(div);
	}

	addCol("Elements", intl.format(data.elements.length));
	addCol("First Discoveries", intl.format(countByPredicate(data.elements, (x) => x.discovered)));
	addCol("Hidden Elements", intl.format(countByPredicate(data.elements, (x) => x.hidden)));

	const uniqEmojis = new Set(data.elements.map((x) => x.emoji)).size;
	addCol("Unique Emojis", `${intl.format(uniqEmojis)} (${intl.format(data.elements.length - uniqEmojis)} duplicated)`);

	const gmAbuseInstalled = unsafeWindow._getItem && unsafeWindow._setItem && unsafeWindow._removeItem;
	if (gmAbuseInstalled) {
		addCol("Size", prettyBytes(getGMAbuseSaveFileSize(data.elements)) + " (using gm_abuse)");
	} else {
		const saveFileSize = new TextEncoder().encode(raw).length;
		const maxSaveFileSize = 5_242_880;

		const progressContainer = document.createElement("div");
		const percentSpan = document.createElement("span");
		const progressbar = document.createElement("div");
		const percent = saveFileSize / maxSaveFileSize;

		progressbar.classList.add("progressbar");
		progressContainer.classList.add("progressbar-container");

		progressbar.style.setProperty("--progress", percent * 100 + "%");
		percentSpan.textContent = (percent * 100).toFixed(2) + "%";

		progressContainer.append(progressbar, percentSpan);

		addCol("Size", `${prettyBytes(saveFileSize)} out of ${prettyBytes(maxSaveFileSize)}`);
		content.append(progressContainer);
	}
}
