// ==UserScript==
// @name		Helper: Not-so-budget Edition
// @namespace	nat.is-a.dev
// @match		https://neal.fun/infinite-craft/*
// @grant		GM.addStyle
// @grant		unsafeWindow
// @run-at		document-start
// @version		1.1.2
// @author		Natasquare
// @description	Adds various QoL features to Infinite Craft - a port of Mikarific's Infinite Craft Helper.
// @updateURL	https://raw.githubusercontent.com/InfiniteCraftCommunity/userscripts/master/userscripts/natasquare/helper/index.user.js
// ==/UserScript==

/*
┌────────────────────────────────────────────────────────────────────────────┐
│   it's recommended to read through these options before using the script   │
└────────────────────────────────────────────────────────────────────────────┘
*/

const settings = {
	// search
	searchDebounceDelay: 200,	// basically waits for you to finish inputting before searching, set to 0 to disable
	searchRelevancy: true,		// will override other sorting modes if searching

	// recipes
	recipeLookup: true,			// if you can't wait until neal actually implements it
	recipeLogging: true,		// log the raw result of recipes in console

	// misc
	randomButton: 2,			// 0 - disable	1 - classic algorithm	2 - better random button
	elementPinning: true,		// alt + left click to pin elements on side bar
	removeDeps: false,			// removes some reactivity of vue for performance (MAY BREAK THINGS)
	oldMouseControls: true,		// middle click to duplicate, ctrl + left click to pan
	disableParticles: true,		// honestly they don't affect performance as much now
	variation: true				// allows you to obtain an element in multiple casings, yay
}

const closeIconSrc = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNjAwIj48cGF0aCBkPSJNMzAwLjAwMDAyLDM0OS44MzIzM0w2MC4xMDc4Miw1ODkuNzIzMzJjLTYuNTQ2ODksNi41NDc2OS0xNC43NzY0Myw5Ljg5NzE4LTI0LjY4ODYsMTAuMDQ4NTEtOS45MTEzOCwuMTUyMS0xOC4yOTIyNC0zLjE5NzQtMjUuMTQyNTYtMTAuMDQ4NTFDMy40MjU1Nyw1ODIuODcyOTgsLjAwMDAyLDU3NC41Njc4LDAsNTY0LjgwNzc0Yy4wMDAwMi05Ljc2MDA3LDMuNDI1NTctMTguMDY1MjYsMTAuMjc2NjYtMjQuOTE1NTZsMjM5Ljg5MTAxLTIzOS44OTIyTDEwLjI3NjY4LDYwLjEwNzc4QzMuNzI4OTksNTMuNTYwOTIsLjM3OTUsNDUuMzMxMzYsLjIyODE3LDM1LjQxOTIyLC4wNzYwNywyNS41MDc4OCwzLjQyNTU3LDE3LjEyNywxMC4yNzY2OCwxMC4yNzY2NiwxNy4xMjcwMiwzLjQyNTUzLDI1LjQzMjIsMCwzNS4xOTIyNiwwczE4LjA2NTI2LDMuNDI1NTMsMjQuOTE1NTYsMTAuMjc2NjZsMjM5Ljg5MjIsMjM5Ljg5MDk3TDUzOS44OTIyMiwxMC4yNzY1OWM2LjU0Njg2LTYuNTQ3NzIsMTQuNzc2NDMtOS44OTcyLDI0LjY4ODU2LTEwLjA0ODUxLDkuOTExMzQtLjE1MjE3LDE4LjI5MjIyLDMuMTk3MzgsMjUuMTQyNTYsMTAuMDQ4NTEsNi44NTExMyw2Ljg1MDI3LDEwLjI3NjY2LDE1LjE1NTUyLDEwLjI3NjY2LDI0LjkxNTU2cy0zLjQyNTUzLDE4LjA2NTIyLTEwLjI3NjY2LDI0LjkxNTU2bC0yMzkuODkwOTcsMjM5Ljg5MjI3LDIzOS44OTEwNSwyMzkuODkyMmM2LjU0NzcyLDYuNTQ2ODksOS44OTcyLDE0Ljc3NjQzLDEwLjA0ODUxLDI0LjY4ODYsLjE1MjE3LDkuOTExMzgtMy4xOTczOCwxOC4yOTIyNC0xMC4wNDg1MSwyNS4xNDI1Ni02Ljg1MDI3LDYuODUxMS0xNS4xNTU1MiwxMC4yNzY2NC0yNC45MTU1NiwxMC4yNzY2Ni05Ljc2MDA0LS4wMDAwMi0xOC4wNjUyMi0zLjQyNTU3LTI0LjkxNTU2LTEwLjI3NjY2bC0yMzkuODkyMjctMjM5Ljg5MTAxWiIvPjwvc3ZnPg==",
	randomIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNjAwIj48cGF0aCBkPSJNNjAuNTc2NTcsNjAwYy0xNy4yNTkzOCwwLTMxLjY3MDMyLTUuNzgxMjUtNDMuMjMyODItMTcuMzQzNzVTMCw1NTYuNjgyODEsMCw1MzkuNDIzNDN2LTEwOC4xNzM0M2MwLTUuMzM2MjQsMS43OTA5NC05Ljc5NTMxLDUuMzcyODItMTMuMzc3MiwzLjU4MTI2LTMuNTgxODksOC4wNDAzLTUuMzcyOCwxMy4zNzcxOC01LjM3MjgsNS4zMzYyNSwwLDkuNzk1MywxLjc5MDkxLDEzLjM3NzE4LDUuMzcyOCwzLjU4MTg3LDMuNTgxODYsNS4zNzI4Miw4LjA0MDkzLDUuMzcyODIsMTMuMzc3MnYxMDguMTczNDVjMCw1Ljc2ODc0LDIuNDAzNzYsMTEuMDU3MTgsNy4yMTEyNSwxNS44NjUzMiw0LjgwODEyLDQuODA3NDgsMTAuMDk2NTYsNy4yMTEyNCwxNS44NjUzMiw3LjIxMTI0aDEwOC4xNzM0M2M1LjMzNjI0LDAsOS43OTUzMSwxLjc5MDk0LDEzLjM3NzIsNS4zNzI4MiwzLjU4MTg5LDMuNTgxODksNS4zNzI4LDguMDQwOTMsNS4zNzI4LDEzLjM3NzE4LDAsNS4zMzY4OC0xLjc5MDkxLDkuNzk1OTMtNS4zNzI4LDEzLjM3NzE4LTMuNTgxODksMy41ODE4Ny04LjA0MDk2LDUuMzcyODItMTMuMzc3Miw1LjM3MjgySDYwLjU3NjU3Wm00NzguODQ2ODgsMGgtMTA4LjE3MzQ1Yy01LjMzNjI3LDAtOS43OTUyOC0xLjc5MDk0LTEzLjM3NzE3LTUuMzcyODItMy41ODE4OS0zLjU4MTI2LTUuMzcyODMtOC4wNDAzLTUuMzcyODMtMTMuMzc3MTgsMC01LjMzNjI1LDEuNzkwOTQtOS43OTUzLDUuMzcyODMtMTMuMzc3MTgsMy41ODE4OS0zLjU4MTg3LDguMDQwOTYtNS4zNzI4MiwxMy4zNzcxNy01LjM3MjgyaDEwOC4xNzM0NWM1Ljc2ODc0LDAsMTEuMDU3MjItMi40MDM3NiwxNS44NjUyOS03LjIxMTI1LDQuODA3NTUtNC44MDgxMiw3LjIxMTI3LTEwLjA5NjU2LDcuMjExMjctMTUuODY1MzJ2LTEwOC4xNzM0M2MwLTUuMzM2MjQsMS43OTA5NC05Ljc5NTMxLDUuMzcyODMtMTMuMzc3MiwzLjU4MTg5LTMuNTgxODksOC4wNDA5Ni01LjM3MjgsMTMuMzc3MTctNS4zNzI4LDUuMzM2ODksMCw5Ljc5NTkxLDEuNzkwOTEsMTMuMzc3MTcsNS4zNzI4LDMuNTgxODksMy41ODE4OSw1LjM3MjgzLDguMDQwOTYsNS4zNzI4MywxMy4zNzcydjEwOC4xNzM0NWMwLDE3LjI1OTM2LTUuNzgxMjcsMzEuNjcwMzEtMTcuMzQzNzUsNDMuMjMyOC0xMS41NjI0OCwxMS41NjI1LTI1Ljk3MzQ1LDE3LjM0Mzc1LTQzLjIzMjgsMTcuMzQzNzVaTTAsNjAuNTc2NTVDMCw0My4zMTcyLDUuNzgxMjUsMjguOTA2MjMsMTcuMzQzNzUsMTcuMzQzNzUsMjguOTA2MjUsNS43ODEyNyw0My4zMTcxOSwwLDYwLjU3NjU3LDBoMTA4LjE3MzQzYzUuMzM2MjQsMCw5Ljc5NTMxLDEuNzkwOTQsMTMuMzc3Miw1LjM3MjgzLDMuNTgxODksMy41ODEyNiw1LjM3MjgsOC4wNDAyOCw1LjM3MjgsMTMuMzc3MTcsMCw1LjMzNjMyLTEuNzkwOTEsOS43OTUyOC01LjM3MjgsMTMuMzc3MTctMy41ODE4NiwzLjU4MTgzLTguMDQwOTMsNS4zNzI4My0xMy4zNzcyLDUuMzcyODNINjAuNTc2NTdjLTUuNzY4NzUsMC0xMS4wNTcxOCwyLjQwMzcyLTE1Ljg2NTMyLDcuMjExMjctNC44MDc0OSw0LjgwODA2LTcuMjExMjUsMTAuMDk2NTUtNy4yMTEyNSwxNS44NjUyOXYxMDguMTczNDVjMCw1LjMzNjI3LTEuNzkwOTQsOS43OTUyOC01LjM3MjgyLDEzLjM3NzE3LTMuNTgxODksMy41ODE4My04LjA0MDkzLDUuMzcyNzctMTMuMzc3MTgsNS4zNzI4My01LjMzNjg4LDAtOS43OTU5My0xLjc5MDk0LTEzLjM3NzE4LTUuMzcyODMtMy41ODE4Ny0zLjU4MTg5LTUuMzcyODItOC4wNDA5LTUuMzcyODItMTMuMzc3MTdWNjAuNTc2NTVabTYwMCwwdjEwOC4xNzM0NWMwLDUuMzM2MjctMS43OTA5NCw5Ljc5NTI4LTUuMzcyODMsMTMuMzc3MTctMy41ODEyNiwzLjU4MTg5LTguMDQwMjgsNS4zNzI4My0xMy4zNzcxNyw1LjM3MjgzLTUuMzM2MzIsMC05Ljc5NTI4LTEuNzkwOTQtMTMuMzc3MTctNS4zNzI4My0zLjU4MTgzLTMuNTgxODktNS4zNzI4My04LjA0MDk2LTUuMzcyODMtMTMuMzc3MTdWNjAuNTc2NTVjMC01Ljc2ODc0LTIuNDAzNzItMTEuMDU3MjItNy4yMTEyNy0xNS44NjUyOS00LjgwODA2LTQuODA3NTUtMTAuMDk2NTUtNy4yMTEyNy0xNS44NjUyOS03LjIxMTI3aC0xMDguMTczNDVjLTUuMzM2MjcsMC05Ljc5NTI4LTEuNzkwOTQtMTMuMzc3MTctNS4zNzI4My0zLjU4MTgzLTMuNTgxODktNS4zNzI3Ny04LjA0MDk2LTUuMzcyODMtMTMuMzc3MTcsMC01LjMzNjg5LDEuNzkwOTQtOS43OTU5MSw1LjM3MjgzLTEzLjM3NzE3LDMuNTgxODktMy41ODE4OSw4LjA0MDktNS4zNzI4MywxMy4zNzcxNy01LjM3MjgzaDEwOC4xNzM0NWMxNy4yNTkzNSwwLDMxLjY3MDMyLDUuNzgxMjcsNDMuMjMyOCwxNy4zNDM3NXMxNy4zNDM3NSwyNS45NzM0NSwxNy4zNDM3NSw0My4yMzI4Wk0zMDEuNDQxODcsNDk1LjQzMzEzYzguMzE3NTEsMCwxNS4zMjUwMS0yLjg0ODc1LDIxLjAyMjUxLTguNTQ2MjUsNS42OTY5LTUuNjk2ODcsOC41NDUzMy0xMi43MDQwNiw4LjU0NTMzLTIxLjAyMTU3cy0yLjg0ODQzLTE1LjMyNDctOC41NDUzLTIxLjAyMTU3Yy01LjY5NzUzLTUuNjk2ODctMTIuNzA1LTguNTQ1My0yMS4wMjI1MS04LjU0NTMtOC4zMTY5MSwwLTE1LjMyNDA3LDIuODQ4NDMtMjEuMDIxNTcsOC41NDUzLTUuNjk2OSw1LjY5Njg3LTguNTQ1MzMsMTIuNzA0MDYtOC41NDUzMywyMS4wMjE1N3MyLjg0ODQzLDE1LjMyNDcsOC41NDUzLDIxLjAyMTU3YzUuNjk3NDcsNS42OTc1LDEyLjcwNDY5LDguNTQ2MjUsMjEuMDIxNTcsOC41NDYyNVptMC0zNTUuOTYyMTVjMTkuMTM0OTgsMCwzNS42Mzc1LDYuMDgxODUsNDkuNTA3NTEsMTguMjQ1NiwxMy44NzAwMSwxMi4xNjMxMiwyMC44MDUwMiwyNy40OTk2OSwyMC44MDUwMiw0Ni4wMDk3MSwwLDEzLjQxMzE2LTMuOTMwMywyNS42MjQ2OS0xMS43OTA5NiwzNi42MzQ3MS03Ljg2MDAzLDExLjAwOTM5LTE2Ljg2MjE4LDIwLjk2MTIzLTI3LjAwNjU3LDI5Ljg1NTYzLTE2LjI1MDAxLDE0Ljg1NTYtMjguMzUzNDUsMjguNjg5NjgtMzYuMzEwMyw0MS41MDIyLTcuOTU2ODgsMTIuODEyNDktMTIuNTYwMjksMjYuODM5MDYtMTMuODEwMyw0Mi4wNzk3LS42MjQ5OSw0LjkwMzc0LC44MTc0OCw5LjA3NDM5LDQuMzI3NSwxMi41MTE4OCwzLjUwOTM5LDMuNDM3NTIsNy43ODgxMSw1LjE1NjI1LDEyLjgzNjI0LDUuMTU2MjUsNC45MDM3NiwwLDkuMTQ2NTgtMS42ODI4LDEyLjcyODQzLTUuMDQ4NDUsMy41ODE4OS0zLjM2NTAyLDUuNzU3NTItNy41NzE1NSw2LjUyNjg4LTEyLjYxOTY5LDEuNzMwNjMtMTAuNjI1MDEsNS40ODA2My0yMC4xMjAzMiwxMS4yNS0yOC40ODU5NSw1Ljc2ODc0LTguMzY1NjMsMTQuODMxMi0xOC43MjYyNSwyNy4xODc1LTMxLjA4MTg3LDE4Ljk4OTk4LTE4Ljk5MDYxLDMyLjA3ODctMzQuOTY0MDgsMzkuMjY2MjItNDcuOTIwMzMsNy4xODc1Mi0xMi45NTY4OSwxMC43ODEyNS0yNy4zNjgxNCwxMC43ODEyNS00My4yMzM3OCwwLTI4Ljk0MTg4LTkuNzgzNzMtNTIuNTk1NjctMjkuMzUxMjMtNzAuOTYxMjctMTkuNTY2ODgtMTguMzY1NjUtNDQuNzM1MDEtMjcuNTQ4NDUtNzUuNTA0MzctMjcuNTQ4NDUtMjEuMjk4MTEsMC00MC43ODEyNSw0LjgxOTY4LTU4LjQ0OTM4LDE0LjQ1OTA0LTE3LjY2ODc2LDkuNjM5MzYtMzEuODE1NjEsMjMuNjQxODMtNDIuNDQwNjEsNDIuMDA3NDgtMi4zMDc1LDQuMTM1MDQtMi41ODM3Niw4LjU0NjI4LS44Mjg3NSwxMy4yMzM3OHM1LjAxMjIsNy44NzI1MSw5Ljc3MTU3LDkuNTU1MDJjNC4yNzg3NSwxLjY4MjUxLDguODM0MDcsMS44MDI4NSwxMy42NjU5MywuMzYwOTUsNC44MzE4Ny0xLjQ0MjQ3LDguNzg2MjMtNC4xNTkwNywxMS44NjMxMi04LjE0OTY4LDguMzE3NTEtMTAuNjczMTYsMTcuODQ4NzUtMTkuNDM1MDQsMjguNTkzNzUtMjYuMjg1NjUsMTAuNzQ0OTctNi44NTEyMywyMi44NzIxNi0xMC4yNzY4NSwzNi4zODE1Ny0xMC4yNzY4NVoiLz48L3N2Zz4=";

const css = `
/* put search bar on top */
#sidebar,
.sidebar-controls {
	display: flex;
	flex-direction: column;
}

.sidebar-inner {
	order: 1;
}

.sidebar-controls {
	order: 0;
	z-index: 1;
	top: 0;
	bottom: unset !important;
	margin-top: 0px !important;
}

.sidebar-controls::before {
	display: none;
}

.sidebar-controls::after {
	content: "";
	position: absolute;
	left: 0;
	right: 0;
	bottom: -30px;
	height: 80px;
	background: linear-gradient(0deg, hsla(0, 0%, 100%, 0), #fff 60%);
	z-index: -1;
	pointer-events: none;
}

.dark-mode .sidebar-controls::after {
	background: linear-gradient(0deg, hsla(0, 0%, 100%, 0), rgba(24, 24, 27, .9) 60%);
}

.sidebar-sorting {
	order: 1;
	margin: unset !important;
}

.sorting-item {
	transform: translateY(0) !important;
	border-radius: 0 !important;
	border-bottom-right-radius: 10px !important;
	border-bottom-left-radius: 10px !important;
	border-bottom: 1px solid var(--border-color) !important;
	border-top: none !important;
	height: 31px !important; /* for whatever reasons 32px leaves a 1px gap at the bottom, ruined my day */
}

.sorting-item:hover {
	transform: translateY(0) !important;
}

.sort-name {
	border-top-left-radius: 0 !important;
	border-bottom-left-radius: 10px;
}

.sort-direction {
	border-top-right-radius: 0 !important;
	border-bottom-right-radius: 10px;
}

.sort-dropdown {
	top: 100% !important;
	transform: translate(-50%, 6px) !important;
	background: var(--background-color) !important;
	min-width: max-content !important;
	box-shadow: 0 -10px 20px 15px rgba(255, 255, 255, .06) !important;
}

.dark-mode .sort-dropdown {
	box-shadow: 0 -10px 20px 15px rgba(24, 24, 27, .06) !important;
}

.sort-dropdown-option {
	background: unset !important;
	padding: 9px 13px !important;
}

.sort-dropdown-option:hover {
	background: rgba(0, 0, 0, 0.06) !important;
}

.dark-mode .sort-dropdown-option:hover {
	background: rgba(255, 255, 255, 0.05) !important;
}

.sidebar-search {
	order: 0;
}

.sidebar-input {
	border: none !important;
	border-bottom: 1px solid var(--border-color) !important;
}

.resize-handle {
	margin-top: unset !important;
	position: absolute !important;
}

/* less dark dark theme */
.container.dark-mode {
	--border-color: #525252 !important;
	--item-bg: #18181b !important;
	--instance-bg: linear-gradient(180deg, #22252b, #18181b 80%) !important;
	--instance-bg-hover: linear-gradient(180deg, #3d4249, #18181b 80%) !important;
	--instance-border: #525252 !important;
	--instance-border-hover: #a3a3a3 !important;
	--sidebar-bg: #18181b !important;
	--background-color: #18181b !important;
	--discoveries-bg-active: #423a24 !important;
	--text-color: #fff !important;
}

.dark-mode {
	scrollbar-color: #525252 #262626 !important;
}

/* sync stuff to css var */
.save,
.modal {
	border: 1px solid var(--border-color) !important;
}

.dark-mode .menu {
	background: var(--sidebar-bg) !important;
}

.dark-mode .save:hover {
	background: var(--instance-bg) !important;
}

.dark-mode .save-selected,
.dark-mode .save-selected:hover {
	background: var(--instance-bg-hover) !important;
	border: 1px solid var(--instance-border-hover) !important;
}

.dark-mode .save-selected,
.dark-mode .save-selected .save-name-input {
	color: var(--text-color) !important;
}

.dark-mode .save .save-action-icon,
.dark-mode .save .save-icon {
	filter: invert(1) !important;
}

/* recipe modal stuff */
.recipe-modal {
	display: none;
	place-self: center;
	border-radius: 5px;
	border: 1px solid var(--border-color);
	padding: 0;
	background-color: var(--background-color);
	transition: 0.2s ease-in-out opacity;
}

.recipe-modal[open] {
	display: grid;
}

.recipe-modal.hidden {
	opacity: 0;
}

.recipe-modal-header {
	display: grid;
	grid-template-columns: 1fr auto;
	gap: 12px;
	position: sticky;
	top: 0;
	z-index: 1;
	background-color: var(--background-color);
	padding: 20px 24px;
	padding-bottom: 12px;
	align-items: center;
}

.recipe-modal-header h1,
.recipe-modal-header .item-emoji {
	font-size: 24px;
}

.recipe-modal-header .recipe-modal-close-button img {
	width: 16px;
	height: 16px;
}

.dark-mode .recipe-modal-header .recipe-modal-close-button img {
	filter: invert(1);
}

.recipe-modal-header .recipe-modal-close-button {
	display: grid;
	place-content: center;
	aspect-ratio: 1/1;
	background-color: var(--background-color);
	border: 1px solid var(--border-color);
	border-radius: 5px;
	padding: 8px;
	cursor: pointer;
}

.recipe-modal-header .recipe-modal-close-button:hover {
	background-color: color-mix(in oklab, var(--background-color), var(--text-color) 5%);
}

.recipe-modal-body .recipe-modal-body-inner[data-tab-id=recipes],
.recipe-modal-body .recipe-modal-body-inner[data-tab-id=usages] {
	display: grid;
	gap: 8px;
	overflow: auto;
	padding: 12px 24px;
}

.recipe-modal-body .recipe-modal-body-inner[data-tab-id=recipes] .recipe,
.recipe-modal-body .recipe-modal-body-inner[data-tab-id=usages] .recipe {
	display: flex;
	gap: 6px;
	align-items: center;
}

.recipe-modal-footer {
	color: var(--border-color);
	position: sticky;
	bottom: 0;
	z-index: 1;
	background-color: var(--background-color);
	padding: 20px 24px;
	padding-top: 12px;
	align-items: center;
}

.recipe-modal-footer .recipe-modal-footer-tab {
	color: color-mix(in oklab, var(--text-color) 70%, var(--background-color));
	text-decoration-line: underline;
	text-decoration-style: dotted;
	transition: color .2s;
}

.recipe-modal-footer .recipe-modal-footer-tab:hover {
	color: var(--text-color);
	cursor: pointer;
}

.recipe-modal-footer .recipe-modal-footer-tab.active {
	color: var(--text-color);
	text-decoration-line: none;
}

.item {
	cursor: pointer;
	padding: 8px 8px 7px;
	border-radius: 5px;
	font-size: 15.4px;
	-webkit-user-select: none;
	-moz-user-select: none;
	user-select: none;
	border: 1px solid var(--border-color);
	transition: background .15s linear;
	background: var(--item-bg);
	line-height: 1em;
	contain: layout style;
	text-overflow: ellipsis;
	overflow-x: hidden;
	white-space: nowrap
}

.item-emoji {
	font-size: 15.4px;
	pointer-events: none
}

.item:hover {
	background: var(--instance-bg-hover);
	border: 1px solid var(--instance-border-hover)
}

/* damn i hate doing this so much */
.item-wrapper {
	contain: layout style;
	display: inline-block;
	margin: 4px;
	max-width: calc(100% - 5px);
	position: relative;
}
.sidebar-sorting {
	background: var(--sidebar-bg);
}
.items-pinned {
	line-height: .5em;
	max-width: 900px;
	background-color: var(--sidebar-bg);
	position: relative;
	border-bottom: 1px solid var(--border-color);
	flex-shrink: 0; /* exorcism. i spent an hour debugging the container shrinking thinking it was js */
	max-height: 75%; /* surely nobody needs more than this right? */
}
.items-pinned-inner {
	padding: 9px;
	overflow: hidden auto;
}
.items-pinned:not(:has(.item)) {
	display: none;
}
.items-pinned .resize-handle-vertical {
	height: 3px;
	width: 100%;
	left: 0;
	top: 100%;
	position: sticky;
	cursor: ns-resize;
	z-index: 1;
}
.items-pinned .resize-handle-vertical:hover {
	background: rgba(0, 0, 0, .06);
}
.dark-mode .items-pinned .resize-handle-vertical:hover {
	background: hsla(0, 0%, 100%, .15);
}
.items {
	min-height: unset !important;
}
@media screen and (min-width:1150px) {
	.item {
		padding: 9px 10px 8px;
	}
	.item, .item-emoji {
		font-size: 16.4px;
	}
}
@media screen and (max-width: 1150px) {
	.item {
		max-width: 267px;
	}
}
@media screen and (max-width:800px) {
	.item {
		line-height: 32px;
		min-height: 32px;
		padding: 1px 9px 0;
		width: auto;
	}
}

/* fix overflow mess */
.sidebar {
	overflow: hidden;
}
.sidebar-inner {
	height: 100%;
	display: flex;
	flex-direction: column;
}
.sidebar-inner .items {
	position: relative;
	height: 100%;
	margin: unset !important;
	overflow: auto;
	padding: 0 !important;
}
.sidebar-inner .items > div {
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0px;
	left: 0px;
	padding: 9px;
}
.sidebar-inner .items > .bottom-spacer,
.sidebar-inner .items > .instruction {
	display: none;
}

.random {
	width: 22px;
	cursor: pointer;
}
.random:hover {
	transform: scale(1.05);
}`

const exported = {};
exported.settings = settings;

function initSearchDebounce({ v_sidebar }) {
	const oldInput = v_sidebar.$refs.search;
	v_sidebar.$refs.search = oldInput.cloneNode(true);
	oldInput.parentNode.replaceChild(v_sidebar.$refs.search, oldInput);
	v_sidebar.$refs.search.addEventListener("input", debounce(function(e) {
		if (!e.target.composing) v_sidebar.searchQuery = e.target.value;
	}, settings.searchDebounceDelay));
	v_sidebar.$refs.search.parentNode.querySelector(".sidebar-input-close")?.addEventListener("click", function(e) {
		v_sidebar.$refs.search.value = "";
	});

	window.addEventListener("keydown", function(e) {
		if (e.key === "Escape") {
			v_sidebar.searchQuery = "";
			v_sidebar.$refs.search.value = "";
		} else if (document.activeElement?.nodeName !== "INPUT")
			v_sidebar.$refs.search.focus();
	});

	const oldFiltered = v_sidebar._computedWatchers.filteredElements.getter;
	v_sidebar._computedWatchers.filteredElements.getter = function() {
		const filtered = oldFiltered.apply(this);
		v_sidebar.$refs.search.placeholder = `Search ${this.items?.length > 1 ? `(${filtered.length.toLocaleString()}) ` : ""}items...`;
		return filtered;
	}
}

function initSearchRelevancy({ v_sidebar }) {
	const oldSorted = v_sidebar._computedWatchers.sortedElements.getter;
	v_sidebar._computedWatchers.sortedElements.getter = function() {
		return this.searchQuery ? this.items : oldSorted.apply(this);
	}

	let lastQuery, lastResults, lastElementCount;
	v_sidebar._computedWatchers.searchResults.getter = function() {
		if (!this.searchQuery) return [];

		// using items length is ok 99% of the time
		if (this.searchQuery === lastQuery && this.items.length === lastElementCount)
			return lastResults.slice(0, this.limit);

		lastQuery = this.searchQuery;
		lastElementCount = this.items.length;

		const lowerQuery = this.searchQuery.toLowerCase(),
			elements = this.filteredElements,
			results = [];

		for (let i = elements.length; i--;) {
			const e = elements[i];
			if (e.text.toLowerCase().indexOf(lowerQuery) > -1)
				results.push(e);
		}

		lastResults = matchSorter(results, this.searchQuery, {
			keys: ["text"],
			baseSort: (a, b) => a.rankedValue < b.rankedValue ? -1 : 1
		});

		return lastResults.slice(0, this.limit);
	}
}

function createItemElement(item, wrap = false) {
	const itemDiv = document.createElement("div");
	itemDiv.setAttribute("data-item-emoji", item.emoji);
	itemDiv.setAttribute("data-item-text", item.text);
	itemDiv.setAttribute("data-item-id", item.id);
	if (item.discovery) itemDiv.setAttribute("data-item-discovery", "");
	itemDiv.setAttribute("data-item", "");
	itemDiv.classList.add("item");

	const emoji = document.createElement("span");
	emoji.classList.add("item-emoji");
	emoji.appendChild(document.createTextNode(item.emoji ?? "⬜"));

	itemDiv.append(emoji, document.createTextNode(` ${item.text} `));

	if (wrap) {
		const wrapper = document.createElement("div");
		wrapper.classList.add("item-wrapper");
		wrapper.appendChild(itemDiv);
		return wrapper;
	}

	return itemDiv;
}
exported.createItemElement = createItemElement;

const idMap = new Map(),
	idReverseMap = new Map(),
	usageMap = new Map();

exported.idMap = idMap;
exported.idReverseMap = idReverseMap;
exported.usageMap = usageMap;

let lastRefresh = -1;
function refreshIdMapping() {
	// throttling, helps when multiple failing getItem/getId calls happen
	if (Date.now() - lastRefresh < 200) return;
	for (const item of unsafeWindow.IC.getItems()) {
		idMap.set(item.id, item);
		idReverseMap.set(item.text, item.id);
	}
	lastRefresh = Date.now();
}
exported.refreshIdMapping = refreshIdMapping;

function getItemFromId(id, skipRefresh = false) {
	if (idMap.has(id) || skipRefresh) return idMap.get(id) ?? null;
	refreshIdMapping();
	return idMap.get(id) ?? null;
}
exported.getItemFromId = getItemFromId;

function getIdFromText(text, skipRefresh = false) {
	if (idReverseMap.has(text) || skipRefresh) return idReverseMap.get(text);
	refreshIdMapping();
	return idReverseMap.get(text) ?? null;
}
exported.getIdFromText = getIdFromText;

// now that i think about it why am i using a map anyway?
// eh surely this will be useful for someone else...
function addUsage(recipe, result) {
	const [first, second] = recipe;
	if (!usageMap.has(first)) usageMap.set(first, new Map([[second, result]]));
	else usageMap.get(first).set(second, result);
	if (!usageMap.has(second)) usageMap.set(second, new Map([[first, result]]));
	else usageMap.get(second).set(first, result);
}
exported.addUsage = addUsage;

const recipeModalTabs = new Map();
exported.recipeModalTabs = recipeModalTabs;

function renderRecipeBody(container, item) {
	if (!item.recipes || item.recipes.length < 1)
		container.appendChild(document.createTextNode("No recipes recorded for this element."));
	else for (const r of item.recipes) {
		const recipe = document.createElement("div");
		recipe.classList.add("recipe");
		// no need to worry about refreshing since that's done when opening modal already
		const [itemA, itemB] = r.map(id => idMap.get(id));
		if (!itemA || !itemB) {
			console.warn("Invalid recipe for " + item.text, r);
			continue;
		}
		recipe.append(
			createItemElement(itemA),
			document.createTextNode("+"),
			createItemElement(itemB)
		);
		container.appendChild(recipe);
	}
	return container;
}

function renderRecipeFooter(container, item) {
	const recipeCount = item.recipes?.length;
	container.appendChild(document.createTextNode(`${(recipeCount || "No").toLocaleString()} recipe${recipeCount === 1 ? "" : "s"}`));
}

recipeModalTabs.set("recipes", {
	renderBody: renderRecipeBody,
	renderFooter: renderRecipeFooter
});

function renderUsageBody(container, item) {
	const usages = usageMap.get(item.id);
	if (!usages)
		// i know this should be unreachable because of the condition but just in case
		container.appendChild(document.createTextNode("No usage recorded for this element."));
	else for (const r of usages) {
		const recipe = document.createElement("div");
		recipe.classList.add("recipe");
		const [itemA, itemB] = r.map(id => idMap.get(id));
		if (!itemA || !itemB) {
			console.warn("invalid usage recorded for " + item.text, r);
			continue;
		}
		recipe.append(
			createItemElement(itemA),
			document.createTextNode("→"),
			createItemElement(itemB)
		);
		container.appendChild(recipe);
	}
	return container;
}

function renderUsageFooter(container, item) {
	const usageCount = usageMap.get(item.id)?.size,
		message = usageCount ?
			`${usageCount.toLocaleString()} use${usageCount === 1 ? "" : "s"}` :
			"Unused"; // unreachable but eh
	container.appendChild(document.createTextNode(message));
}

recipeModalTabs.set("usages", {
	condition: (item) => usageMap.has(item.id),
	renderBody: renderUsageBody,
	renderFooter: renderUsageFooter
});

function initRecipeLookup({ v_container, v_sidebar }) {
	window.addEventListener("ic-load", function() {
		for (const item of v_container.items) {
			// for initializing the id mapping
			idMap.set(item.id, item);
			idReverseMap.set(item.text, item.id);
			if (!item.recipes || item.recipes.length < 1) continue;
			for (const recipe of item.recipes) addUsage(recipe, item.id);
		}
		exported.usageMap = usageMap;
	});

	const modal = document.createElement("dialog");
	modal.classList.add("recipe-modal");
	const modalTitle = document.createElement("h1");
	modalTitle.classList.add("recipe-modal-title");
	const closeButton = document.createElement("button");
	closeButton.classList.add("recipe-modal-close-button");
	const closeIcon = document.createElement("img");
	closeIcon.src = closeIconSrc
	closeButton.appendChild(closeIcon);
	const modalHeader = document.createElement("div");
	modalHeader.classList.add("recipe-modal-header");
	modalHeader.append(modalTitle, closeButton);
	const modalBody = document.createElement("div");
	modalBody.classList.add("recipe-modal-body");
	const modalFooter = document.createElement("div");
	modalFooter.classList.add("recipe-modal-footer");
	modal.append(modalHeader, modalBody, modalFooter);
	v_container.$el.appendChild(modal);

	["wheel", "scroll"].forEach((x) => modal.addEventListener(x, (e) => e.stopImmediatePropagation(), true));

	let renderCache = {},
		currentItemId = null;

	function openRecipeModal(itemId, reload = true, tabId) {
		if (isNaN(itemId)) throw new Error("itemId must be a number");
		currentItemId = itemId = Number(itemId);

		const item = getItemFromId(itemId);

		if (!item) throw new Error("could not find item with id " + itemId);

		if (!reload) {
			if (!recipeModalTabs.has(tabId)) throw new Error(`tab with id ${tabId} does not exist`);

			let found = false;
			for (const tabFooter of modalFooter.querySelectorAll(".recipe-modal-footer-tab")) {
				const id = tabFooter.getAttribute("data-tab-id");
				if (id === tabId) {
					tabFooter.classList.add("active");
					found = true;
				} else tabFooter.classList.remove("active");
			}

			if (!found) throw new Error(`tab with id ${tabId} is not available to switch to`);

			modalBody.innerHTML = "";

			if (renderCache[tabId]) return modalBody.appendChild(renderCache[tabId]);

			const tabContainer = document.createElement("div");
			tabContainer.classList.add("recipe-modal-body-inner");
			tabContainer.setAttribute("data-tab-id", tabId);
			recipeModalTabs.get(tabId).renderBody(tabContainer, item);
			renderCache[tabId] = tabContainer;

			modalBody.appendChild(tabContainer);

			return;
		}

		const itemEmoji = document.createElement("span");
		itemEmoji.classList.add("item-emoji");
		itemEmoji.appendChild(document.createTextNode(item.emoji ?? "⬜"));
		modalTitle.innerHTML = "";
		modalTitle.append(itemEmoji, document.createTextNode(` ${item.text} `));

		refreshIdMapping();

		const okTabIds = new Set();

		for (const [id, tab] of recipeModalTabs)
			if (
				typeof tab.condition !== "function" ||
				tab.condition(item)
			) okTabIds.add(id);

		if (okTabIds.size < 1) {
			// shouldn't be possible with default configuration since recipe tab is always on but eh just to be sure
			modalBody.innerHTML = "";
			modalBody.appendChild(document.createTextNode("Nothing to see here, maybe try another item?"));
			return;
		}

		if (!okTabIds.has(tabId)) tabId = okTabIds.values().next().value;

		renderCache = {};

		const tabContainer = document.createElement("div");
		tabContainer.classList.add("recipe-modal-body-inner");
		tabContainer.setAttribute("data-tab-id", tabId);
		recipeModalTabs.get(tabId).renderBody(tabContainer, item);
		renderCache[tabId] = tabContainer;

		modalBody.innerHTML = "";
		modalBody.appendChild(tabContainer);

		modalFooter.innerHTML = "";

		let first = true;
		for (const id of okTabIds) {
			if (first) first = false;
			else modalFooter.appendChild(document.createTextNode(" · "));

			const tabFooter = document.createElement("span");
			tabFooter.classList.add("recipe-modal-footer-tab");
			if (id === tabId) tabFooter.classList.add("active");
			tabFooter.setAttribute("data-tab-id", id);
			recipeModalTabs.get(id).renderFooter(tabFooter, item);
			modalFooter.appendChild(tabFooter);
		}

		modal.showModal();
	}
	exported.openRecipeModal = openRecipeModal;

	function closeRecipeModal() {
		currentItemId = null;
		renderCache = {};
		modal.close();
		modalBody.innerHTML = "";
	}

	closeButton.addEventListener("click", closeRecipeModal);

	[v_sidebar.$el, modal].forEach((x) => x.addEventListener("contextmenu", function(e) {
		const item = traverseUntil(e.target, ".item");
		if (item) {
			e.preventDefault();
			openRecipeModal(item.getAttribute("data-item-id"));
		}
	}));

	let hidden = false;
	modal.addEventListener("mousedown", function(e) {
		if (e.target === e.currentTarget) {
			// apparently this is also true when clicking on the scrollbar
			// so a bound check is ineviatable
			const rect = modal.getBoundingClientRect();
			if (e.clientX < rect.left ||
				e.clientX > rect.right ||
				e.clientY < rect.top ||
				e.clientY > rect.bottom) closeRecipeModal()
		}
		if (e.button === 2) return;
		const item = traverseUntil(e.target, ".item");
		if (!item) return;
		modal.classList.add("hidden");
		hidden = true;
	});
	document.addEventListener("mouseup", function() {
		if (!hidden) return;
		modal.classList.remove("hidden");
		hidden = false;
	});

	modalFooter.addEventListener("click", function(e) {
		if (currentItemId === null) return;
		const tabFooter = traverseUntil(e.target, ".recipe-modal-footer-tab[data-tab-id]");
		if (!tabFooter || tabFooter.classList.contains("active")) return;
		const tabId = tabFooter.getAttribute("data-tab-id");
		if (!recipeModalTabs.has(tabId)) return;
		openRecipeModal(currentItemId, false, tabId);
	});
}

function initCraftEvents() {
	window.addEventListener("ic-craftapi", function(e) {
		const { a, b, result } = e.detail;
		if (!result) return;
		if (settings.recipeLogging) console.log(`${a} + ${b} = ${result.text}`);
		if (settings.recipeLookup) {
			// at this point the result might not be in the item list yet
			// so we queue this for when the call stack is empty (when stuff finishes)
			// not sure if this is the best way to do it though
			setTimeout(() => {
				const aid = getIdFromText(a),
					bid = getIdFromText(b),
					rid = getIdFromText(result.text);
				// careful, id can be 0
				if (aid !== null && bid !== null && rid !== null)
					addUsage([aid, bid], rid);
			});
		}
	});
}

function initPinnedContainer({ v_container, v_sidebar }) {
	const pinnedContainerContainer = document.createElement("div");
	pinnedContainerContainer.classList.add("items-pinned");
	const pinnedContainer = document.createElement("div");
	pinnedContainer.classList.add("items-pinned-inner");
	pinnedContainerContainer.appendChild(pinnedContainer);
	const resizeHandle = document.createElement("div")
	resizeHandle.classList.add("resize-handle-vertical");

	const saveContainerHeight = debounce(function(v) {
		return localStorage.setItem("pinned-container-height", v);
	}, 50);

	const savedHeight = localStorage.getItem("pinned-container-height");
	if (savedHeight)
		pinnedContainer.style.height = savedHeight + "px";

	let resizing = false,
		startY = 0,
		startHeight = 0;
	function handleResize(e) {
		if (!resizing) return;
		const newHeight = startHeight + e.clientY - startY;
		saveContainerHeight(newHeight);
		pinnedContainer.style.height = newHeight + "px";
	}
	resizeHandle.addEventListener("mousedown", function(e) {
		resizing = true;
		startY = e.clientY;
		startHeight = pinnedContainer.offsetHeight;
		document.addEventListener("mousemove", handleResize);
		document.addEventListener("mouseup", function() {
			resizing = false;
			document.removeEventListener("mousemove", handleResize);
		});
	});

	pinnedContainerContainer.appendChild(resizeHandle);

	const pinnedIds = new Set();

	function pinElements(elements, updateStorage = true) {
		if (!Array.isArray(elements)) elements = [elements];

		const es = [],
			newElements = [];
		for (const e of elements) {
			if (pinnedIds.has(e.id)) continue;
			pinnedIds.add(e.id);
			if (updateStorage) newElements.push(e);
			es.push(createItemElement(e, true));
		}
		pinnedContainer.append(...es);

		if (updateStorage) {
			const d = JSON.parse(localStorage.getItem("pinned-elements") ?? "{}"),
				pinnedElements = d[v_container.currSave] ?? [];
			pinnedElements.push(...newElements);
			d[v_container.currSave] = pinnedElements;
			localStorage.setItem("pinned-elements", JSON.stringify(d));
		}
	}
	exported.pinElements = pinElements;

	function unpinElements(elements, updateStorage = true) {
		if (!Array.isArray(elements)) elements = [elements];

		const removed = new Set();

		for (const e of elements) {
			if (!pinnedIds.has(e.id)) continue;
			const d = pinnedContainer.querySelector(`.item[data-item-id="${e.id}"]`)?.parentNode;
			if (!d) continue;
			pinnedIds.delete(e.id);
			if (updateStorage) removed.add(e.id);
			d.remove();
		}

		if (updateStorage) {
			const d = JSON.parse(localStorage.getItem("pinned-elements") ?? "{}"),
				pinnedElements = d[v_container.currSave] ?? [];
			d[v_container.currSave] = pinnedElements.filter((e) => !removed.has(e.id))
			localStorage.setItem("pinned-elements", JSON.stringify(d));
		}
	}
	exported.unpinElements = unpinElements;

	// note: does not update storage
	function resetPinnedElements() {
		pinnedIds.clear();
		pinnedContainer.innerHTML = "";
	}
	exported.resetPinnedElements = resetPinnedElements;

	function loadPinnedElements(saveId) {
		const pinnedElements = JSON.parse(localStorage.getItem("pinned-elements") ?? "[]"),
			curPinnedElements = pinnedElements[saveId];
		if (curPinnedElements?.length > 0)
			pinElements(curPinnedElements, false);
	}
	exported.loadPinnedElements = loadPinnedElements;

	loadPinnedElements(v_container.currSave);

	const itemsContainer = v_sidebar.$el.querySelector(".items");
	itemsContainer.before(pinnedContainerContainer);

	pinnedContainer.addEventListener("mousedown", function(e) {
		if (e.altKey && e.button === 0) {
			const item = traverseUntil(e.target, ".item");
			if (!item) return;
			e.preventDefault();
			e.stopImmediatePropagation();
			unpinElements({
				id: item.getAttribute("data-item-id"),
				text: item.getAttribute("data-item-text"),
				emoji: item.getAttribute("data-item-emoji"),
				discovery: item.getAttribute("data-item-discovery") !== null
			});
		}
	});

	itemsContainer.addEventListener("mousedown", function(e) {
		if (e.altKey && e.button === 0) {
			const item = traverseUntil(e.target, ".item");
			if (!item) return;
			e.preventDefault();
			e.stopImmediatePropagation();
			pinElements({
				id: item.getAttribute("data-item-id"),
				text: item.getAttribute("data-item-text"),
				emoji: item.getAttribute("data-item-emoji"),
				discovery: item.getAttribute("data-item-discovery") !== null
			});
		}
	});

	window.addEventListener("ic-switchsave", function(e) {
		resetPinnedElements();
		loadPinnedElements(e.detail.newId);
	})
}

function traverseUntil(element, selector) {
	let result = element;
	while (true) {
		if (result?.matches(selector)) return result;
		if (!result?.parentElement) return null;
		result = result.parentElement;
	}
}

function interceptMouseEvent(e, type, options = {}) {
	e.preventDefault();
	e.stopImmediatePropagation();

	const syntheticEvent = new MouseEvent(type, {
		bubbles: true,
		cancelable: true,
		clientX: e.clientX,
		clientY: e.clientY,
		screenX: e.screenX,
		screenY: e.screenY,
		button: e.button,
		shiftKey: e.shiftKey,
		ctrlKey: e.ctrlKey,
		...options
	});

	syntheticEvent.synthetic = true;

	e.target.dispatchEvent(syntheticEvent);
}

function initOldMouseControls() {
	let isCtrlDragging = false;

	window.addEventListener("mousedown", (e) => {
		if (e.synthetic) return;

		if (e.button === 1 && traverseUntil(e.target, ".instance, .item")) {
			interceptMouseEvent(e, "mousedown", { button: 0, shiftKey: true });
		} else if (e.button === 0 && e.ctrlKey) {
			isCtrlDragging = true;
			interceptMouseEvent(e, "mousedown", { button: 1 });
		}
	}, true);

	window.addEventListener("mouseup", (e) => {
		if (!isCtrlDragging) return;
		isCtrlDragging = false;
		interceptMouseEvent(e, "mouseup", { button: 1 });
	}, true);
}

function initSidebarUpdates({ v_sidebar }) {
	const items = v_sidebar.$el.querySelector(".items");
	Object.defineProperty(v_sidebar.$el, "scrollTop", {
		get() {
			return items.scrollTop;
		},
		set(value) {
			items.scrollTop = value;
		},
		configurable: true
	});
	items.addEventListener("scroll", function(e) {
		const scrollPercentage = (items.scrollTop + items.clientHeight) / items.scrollHeight;
		if (scrollPercentage > .8727) v_sidebar.limit += 300;
	});

	const oldFilteredElementsCut = v_sidebar._computedWatchers.filteredElementsCut.getter;
	v_sidebar._computedWatchers.filteredElementsCut.getter = function(...a) {
		if (this.searchQuery) return [];
		return oldFilteredElementsCut.apply(this, a);
	}

	// fix for sort by emoji (neal where are you)
	const oldSortedELements = v_sidebar._computedWatchers.sortedElements.getter;
	v_sidebar._computedWatchers.sortedElements.getter = function(...a) {
		if (this.sortBy.name === "emoji") {
			const sortFn = this.sortBy.asc ?
				(a, b) => (b.emoji ?? "⬜").localeCompare(a.emoji ?? "⬜") :
				(a, b) => (a.emoji ?? "⬜").localeCompare(b.emoji ?? "⬜");
			return this.items.toSorted(sortFn);
		}
		return oldSortedELements.apply(this, a);
	}
}

function choose(a) {
	return a[Math.floor(Math.random() * a.length)]
}

function getRandomCirclePos(center, radius) {
	const angle = Math.random() * Math.PI * 2,
		r = Math.sqrt(Math.random()) * radius
	return {
		x: center.x + Math.cos(angle) * r,
		y: center.y + Math.sin(angle) * r
	}
}

function initRandomButton({ v_container, v_sidebar }) {
	const sideControls = v_container.$el.querySelector(".side-controls"),
		randomButton = document.createElement("img");
	randomButton.classList.add("random", "tool-icon");
	randomButton.src = randomIcon;
	sideControls.appendChild(randomButton);

	function chooseRandomElement() {
		let _f;
		const items = (_f = v_sidebar.searchResults).length > 0 ? _f :
			(_f = v_sidebar.filteredElements).length > 0 ? _f :
				v_sidebar.items;
		if (items.length < 1) return null;
		if (settings.randomButton === 1) return choose(items);
		if (items.length < 32768) {
			const filtered = items.filter((x) => !x.hide && x.text.length < 31);
			return choose(filtered.length > 0 ? filtered : items);
		} else {
			for (let i = 100; i--;) {
				const choice = choose(items);
				if (!choice.hide && choice.text.length < 31)
					return choice;
			}
			return choose(items);
		}
	}

	let instanceSound,
		localRate = 0.9;
	function spawnRandomInstance() {
		const element = chooseRandomElement();
		if (!element) return;
		unsafeWindow.IC.createInstance({
			text: element.text,
			emoji: element.emoji ?? "⬜",
			itemId: element.id,
			discovery: element.discovery,
			animate: true,
			...getRandomCirclePos({
				x: (window.innerWidth - v_sidebar.sidebarWidth) / 2,
				y: window.innerHeight / 2
			}, (window.innerWidth - v_sidebar.sidebarWidth) / 6)
		});
		if (instanceSound ??= unsafeWindow.Howler._howls.find((x) => x._src.endsWith("instance.mp3"))) {
			localRate += 0.1;
			if (localRate > 1.3) localRate = 0.9
			instanceSound.rate(localRate);
			instanceSound.play();
		}
	}

	randomButton.addEventListener("click", function() {
		spawnRandomInstance();
	});
}

function initEvents({ v_container }) {
	const switchSave = v_container.switchSave;
	v_container.switchSave = function(id) {
		dispatchEvent(new CustomEvent("ic-switchsave", { detail: { currentId: v_container.currSave, newId: id } }));
		return switchSave.apply(this, [id]);
	}

	const craftApi = v_container.craftApi;
	v_container.craftApi = async function(a, b) {
		[a, b] = [a, b].sort();
		const result = await craftApi.apply(this, [a, b]);
		dispatchEvent(new CustomEvent("ic-craftapi", { detail: { a, b, result} }));
		return result;
	}

	const addAPI = v_container.addAPI;
	v_container.addAPI = function() {
		dispatchEvent(new CustomEvent("ic-load"));
		v_container.addAPI = addAPI;
		return addAPI.apply(this, arguments);
	}
}

function init() {
	GM.addStyle(css);

	const v_container = document.querySelector(".container").__vue__,
		v_sidebar = document.querySelector("#sidebar").__vue__,
		v = { v_container, v_sidebar };

	initSidebarUpdates(v);

	if (settings.searchDebounceDelay > 0) initSearchDebounce(v);
	if (settings.searchRelevancy) initSearchRelevancy(v);

	if (settings.recipeLookup) initRecipeLookup(v);
	initCraftEvents(v);

	if (settings.removeDeps) {
		const addDep = v_sidebar._computedWatchers.sortedElements.addDep;
		["sortedElements", "filteredElements", "searchResults"].forEach((k) => v_sidebar._computedWatchers[k].addDep = function(...a) {
			// if (a[0].subs[0]?.value !== undefined) return addDep.apply(this, a);
			if (this.newDepIds.size < 65) return addDep.apply(this, a);
		});
	}
	if (settings.randomButton > 0) initRandomButton(v);
	if (settings.elementPinning) initPinnedContainer(v);
	if (settings.oldMouseControls) initOldMouseControls(v);
	if (settings.disableParticles) {
		const r = window.requestAnimationFrame;
		window.requestAnimationFrame = () => window.requestAnimationFrame = r;
		v_container.$refs.particles.style.display = "none";
	}
	if (settings.variation) {
		const toLowerCase = String.prototype.toLowerCase,
			find = Array.prototype.find;
		Array.prototype.find = function(f) {
			if (this !== v_container.items || !/function\((\w+?)\){return \1\.text\.toLowerCase\(\)===\w+?\.text\.toLowerCase\(\)}/.test(f.toString()))
				return find.apply(this, [f]);
			String.prototype.toLowerCase = String.prototype.toString;
			const result = find.apply(this, [f]);
			String.prototype.toLowerCase = toLowerCase;
			return result;
		}
	}

	initEvents(v);

	unsafeWindow.ICHelper = exported;
}

window.addEventListener("load", init);

function debounce(fn, delay) {
	const context = this;
	let timeout = null;
	return function() {
		const args = arguments;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			timeout = null;
			fn.apply(context, args)
		}, delay);
	}
}

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Marin Atanasov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const characterMap = { À: 'A', Á: 'A', Â: 'A', Ã: 'A', Ä: 'A', Å: 'A', Ấ: 'A', Ắ: 'A', Ẳ: 'A', Ẵ: 'A', Ặ: 'A', Æ: 'AE', Ầ: 'A', Ằ: 'A', Ȃ: 'A', Ả: 'A', Ạ: 'A', Ẩ: 'A', Ẫ: 'A', Ậ: 'A', Ç: 'C', Ḉ: 'C', È: 'E', É: 'E', Ê: 'E', Ë: 'E', Ế: 'E', Ḗ: 'E', Ề: 'E', Ḕ: 'E', Ḝ: 'E', Ȇ: 'E', Ẻ: 'E', Ẽ: 'E', Ẹ: 'E', Ể: 'E', Ễ: 'E', Ệ: 'E', Ì: 'I', Í: 'I', Î: 'I', Ï: 'I', Ḯ: 'I', Ȋ: 'I', Ỉ: 'I', Ị: 'I', Ð: 'D', Ñ: 'N', Ò: 'O', Ó: 'O', Ô: 'O', Õ: 'O', Ö: 'O', Ø: 'O', Ố: 'O', Ṍ: 'O', Ṓ: 'O', Ȏ: 'O', Ỏ: 'O', Ọ: 'O', Ổ: 'O', Ỗ: 'O', Ộ: 'O', Ờ: 'O', Ở: 'O', Ỡ: 'O', Ớ: 'O', Ợ: 'O', Ù: 'U', Ú: 'U', Û: 'U', Ü: 'U', Ủ: 'U', Ụ: 'U', Ử: 'U', Ữ: 'U', Ự: 'U', Ý: 'Y', à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a', ấ: 'a', ắ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a', æ: 'ae', ầ: 'a', ằ: 'a', ȃ: 'a', ả: 'a', ạ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a', ç: 'c', ḉ: 'c', è: 'e', é: 'e', ê: 'e', ë: 'e', ế: 'e', ḗ: 'e', ề: 'e', ḕ: 'e', ḝ: 'e', ȇ: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e', ể: 'e', ễ: 'e', ệ: 'e', ì: 'i', í: 'i', î: 'i', ï: 'i', ḯ: 'i', ȋ: 'i', ỉ: 'i', ị: 'i', ð: 'd', ñ: 'n', ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o', ø: 'o', ố: 'o', ṍ: 'o', ṓ: 'o', ȏ: 'o', ỏ: 'o', ọ: 'o', ổ: 'o', ỗ: 'o', ộ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ớ: 'o', ợ: 'o', ù: 'u', ú: 'u', û: 'u', ü: 'u', ủ: 'u', ụ: 'u', ử: 'u', ữ: 'u', ự: 'u', ý: 'y', ÿ: 'y', Ā: 'A', ā: 'a', Ă: 'A', ă: 'a', Ą: 'A', ą: 'a', Ć: 'C', ć: 'c', Ĉ: 'C', ĉ: 'c', Ċ: 'C', ċ: 'c', Č: 'C', č: 'c', C̆: 'C', c̆: 'c', Ď: 'D', ď: 'd', Đ: 'D', đ: 'd', Ē: 'E', ē: 'e', Ĕ: 'E', ĕ: 'e', Ė: 'E', ė: 'e', Ę: 'E', ę: 'e', Ě: 'E', ě: 'e', Ĝ: 'G', Ǵ: 'G', ĝ: 'g', ǵ: 'g', Ğ: 'G', ğ: 'g', Ġ: 'G', ġ: 'g', Ģ: 'G', ģ: 'g', Ĥ: 'H', ĥ: 'h', Ħ: 'H', ħ: 'h', Ḫ: 'H', ḫ: 'h', Ĩ: 'I', ĩ: 'i', Ī: 'I', ī: 'i', Ĭ: 'I', ĭ: 'i', Į: 'I', į: 'i', İ: 'I', ı: 'i', Ĳ: 'IJ', ĳ: 'ij', Ĵ: 'J', ĵ: 'j', Ķ: 'K', ķ: 'k', Ḱ: 'K', ḱ: 'k', K̆: 'K', k̆: 'k', Ĺ: 'L', ĺ: 'l', Ļ: 'L', ļ: 'l', Ľ: 'L', ľ: 'l', Ŀ: 'L', ŀ: 'l', Ł: 'l', ł: 'l', Ḿ: 'M', ḿ: 'm', M̆: 'M', m̆: 'm', Ń: 'N', ń: 'n', Ņ: 'N', ņ: 'n', Ň: 'N', ň: 'n', ŉ: 'n', N̆: 'N', n̆: 'n', Ō: 'O', ō: 'o', Ŏ: 'O', ŏ: 'o', Ő: 'O', ő: 'o', Œ: 'OE', œ: 'oe', P̆: 'P', p̆: 'p', Ŕ: 'R', ŕ: 'r', Ŗ: 'R', ŗ: 'r', Ř: 'R', ř: 'r', R̆: 'R', r̆: 'r', Ȓ: 'R', ȓ: 'r', Ś: 'S', ś: 's', Ŝ: 'S', ŝ: 's', Ş: 'S', Ș: 'S', ș: 's', ş: 's', Š: 'S', š: 's', Ţ: 'T', ţ: 't', ț: 't', Ț: 'T', Ť: 'T', ť: 't', Ŧ: 'T', ŧ: 't', T̆: 'T', t̆: 't', Ũ: 'U', ũ: 'u', Ū: 'U', ū: 'u', Ŭ: 'U', ŭ: 'u', Ů: 'U', ů: 'u', Ű: 'U', ű: 'u', Ų: 'U', ų: 'u', Ȗ: 'U', ȗ: 'u', V̆: 'V', v̆: 'v', Ŵ: 'W', ŵ: 'w', Ẃ: 'W', ẃ: 'w', X̆: 'X', x̆: 'x', Ŷ: 'Y', ŷ: 'y', Ÿ: 'Y', Y̆: 'Y', y̆: 'y', Ź: 'Z', ź: 'z', Ż: 'Z', ż: 'z', Ž: 'Z', ž: 'z', ſ: 's', ƒ: 'f', Ơ: 'O', ơ: 'o', Ư: 'U', ư: 'u', Ǎ: 'A', ǎ: 'a', Ǐ: 'I', ǐ: 'i', Ǒ: 'O', ǒ: 'o', Ǔ: 'U', ǔ: 'u', Ǖ: 'U', ǖ: 'u', Ǘ: 'U', ǘ: 'u', Ǚ: 'U', ǚ: 'u', Ǜ: 'U', ǜ: 'u', Ứ: 'U', ứ: 'u', Ṹ: 'U', ṹ: 'u', Ǻ: 'A', ǻ: 'a', Ǽ: 'AE', ǽ: 'ae', Ǿ: 'O', ǿ: 'o', Þ: 'TH', þ: 'th', Ṕ: 'P', ṕ: 'p', Ṥ: 'S', ṥ: 's', X́: 'X', x́: 'x', Ѓ: 'Г', ѓ: 'г', Ќ: 'К', ќ: 'к', A̋: 'A', a̋: 'a', E̋: 'E', e̋: 'e', I̋: 'I', i̋: 'i', Ǹ: 'N', ǹ: 'n', Ồ: 'O', ồ: 'o', Ṑ: 'O', ṑ: 'o', Ừ: 'U', ừ: 'u', Ẁ: 'W', ẁ: 'w', Ỳ: 'Y', ỳ: 'y', Ȁ: 'A', ȁ: 'a', Ȅ: 'E', ȅ: 'e', Ȉ: 'I', ȉ: 'i', Ȍ: 'O', ȍ: 'o', Ȑ: 'R', ȑ: 'r', Ȕ: 'U', ȕ: 'u', B̌: 'B', b̌: 'b', Č̣: 'C', č̣: 'c', Ê̌: 'E', ê̌: 'e', F̌: 'F', f̌: 'f', Ǧ: 'G', ǧ: 'g', Ȟ: 'H', ȟ: 'h', J̌: 'J', ǰ: 'j', Ǩ: 'K', ǩ: 'k', M̌: 'M', m̌: 'm', P̌: 'P', p̌: 'p', Q̌: 'Q', q̌: 'q', Ř̩: 'R', ř̩: 'r', Ṧ: 'S', ṧ: 's', V̌: 'V', v̌: 'v', W̌: 'W', w̌: 'w', X̌: 'X', x̌: 'x', Y̌: 'Y', y̌: 'y', A̧: 'A', a̧: 'a', B̧: 'B', b̧: 'b', Ḑ: 'D', ḑ: 'd', Ȩ: 'E', ȩ: 'e', Ɛ̧: 'E', ɛ̧: 'e', Ḩ: 'H', ḩ: 'h', I̧: 'I', i̧: 'i', Ɨ̧: 'I', ɨ̧: 'i', M̧: 'M', m̧: 'm', O̧: 'O', o̧: 'o', Q̧: 'Q', q̧: 'q', U̧: 'U', u̧: 'u', X̧: 'X', x̧: 'x', Z̧: 'Z', z̧: 'z', й: 'и', Й: 'И', ё: 'е', Ё: 'Е' };
const removeAccentsRegex = new RegExp(Object.keys(characterMap).join('|'), 'g');
function removeAccents(string) {
	return string.replace(removeAccentsRegex, (char) => {
		return characterMap[char];
	});
}
const rankings = {
	CASE_SENSITIVE_EQUAL: 7,
	EQUAL: 6,
	STARTS_WITH: 5,
	WORD_STARTS_WITH: 4,
	CONTAINS: 3,
	ACRONYM: 2,
	MATCHES: 1,
	NO_MATCH: 0,
};
const defaultBaseSortFn = (a, b) => String(a.rankedValue).localeCompare(String(b.rankedValue));
function matchSorter(items, value, options = {}) {
	const { keys, threshold = rankings.MATCHES, baseSort = defaultBaseSortFn, sorter = (matchedItems) => matchedItems.sort((a, b) => sortRankedValues(a, b, baseSort)), } = options;
	const matchedItems = items.reduce(reduceItemsToRanked, []);
	const sorted = sorter(matchedItems).map(({ item }) => item);
	return sorted;
	function reduceItemsToRanked(matches, item, index) {
		const rankingInfo = getHighestRanking(item, keys, value, options);
		const { rank, keyThreshold = threshold } = rankingInfo;
		if (rank >= keyThreshold) {
			matches.push({ ...rankingInfo, item, index });
		}
		return matches;
	}
}
matchSorter.rankings = rankings;
function getHighestRanking(item, keys, value, options) {
	if (!keys) {
		const stringItem = item;
		return {
			rankedValue: stringItem,
			rank: getMatchRanking(stringItem, value, options),
			keyIndex: -1,
			keyThreshold: options.threshold,
		};
	}
	const valuesToRank = getAllValuesToRank(item, keys);
	return valuesToRank.reduce(({ rank, rankedValue, keyIndex, keyThreshold }, { itemValue, attributes }, i) => {
		let newRank = getMatchRanking(itemValue, value, options);
		let newRankedValue = rankedValue;
		const { minRanking, maxRanking, threshold } = attributes;
		if (newRank < minRanking && newRank >= rankings.MATCHES) {
			newRank = minRanking;
		}
		else if (newRank > maxRanking) {
			newRank = maxRanking;
		}
		if (newRank > rank) {
			rank = newRank;
			keyIndex = i;
			keyThreshold = threshold;
			newRankedValue = itemValue;
		}
		return { rankedValue: newRankedValue, rank, keyIndex, keyThreshold };
	}, {
		rankedValue: item,
		rank: rankings.NO_MATCH,
		keyIndex: -1,
		keyThreshold: options.threshold,
	});
}
function getMatchRanking(testString, stringToRank, options) {
	testString = prepareValueForComparison(testString, options);
	stringToRank = prepareValueForComparison(stringToRank, options);
	if (stringToRank.length > testString.length) {
		return rankings.NO_MATCH;
	}
	if (testString === stringToRank) {
		return rankings.CASE_SENSITIVE_EQUAL;
	}
	testString = testString.toLowerCase();
	stringToRank = stringToRank.toLowerCase();
	if (testString === stringToRank) {
		return rankings.EQUAL;
	}
	if (testString.startsWith(stringToRank)) {
		return rankings.STARTS_WITH;
	}
	if (testString.includes(` ${stringToRank}`)) {
		return rankings.WORD_STARTS_WITH;
	}
	if (testString.includes(stringToRank)) {
		return rankings.CONTAINS;
	}
	else if (stringToRank.length === 1) {
		return rankings.NO_MATCH;
	}
	if (getAcronym(testString).includes(stringToRank)) {
		return rankings.ACRONYM;
	}
	return getClosenessRanking(testString, stringToRank);
}
function getAcronym(string) {
	let acronym = '';
	const wordsInString = string.split(' ');
	for (const wordInString of wordsInString) {
		const splitByHyphenWords = wordInString.split('-');
		for (const splitByHyphenWord of splitByHyphenWords) {
			acronym += splitByHyphenWord.substr(0, 1);
		}
	}
	return acronym;
}
function getClosenessRanking(testString, stringToRank) {
	let matchingInOrderCharCount = 0;
	let charNumber = 0;
	function findMatchingCharacter(matchChar, string, index) {
		for (let j = index, J = string.length; j < J; j++) {
			const stringChar = string[j];
			if (stringChar === matchChar) {
				matchingInOrderCharCount += 1;
				return j + 1;
			}
		}
		return -1;
	}
	function getRanking(spread) {
		const spreadPercentage = 1 / spread;
		const inOrderPercentage = matchingInOrderCharCount / stringToRank.length;
		const ranking = rankings.MATCHES + inOrderPercentage * spreadPercentage;
		return ranking;
	}
	const firstIndex = findMatchingCharacter(stringToRank[0], testString, 0);
	if (firstIndex < 0) {
		return rankings.NO_MATCH;
	}
	charNumber = firstIndex;
	for (let i = 1, I = stringToRank.length; i < I; i++) {
		const matchChar = stringToRank[i];
		charNumber = findMatchingCharacter(matchChar, testString, charNumber);
		const found = charNumber > -1;
		if (!found) {
			return rankings.NO_MATCH;
		}
	}
	const spread = charNumber - firstIndex;
	return getRanking(spread);
}
function sortRankedValues(a, b, baseSort) {
	const aFirst = -1;
	const bFirst = 1;
	const { rank: aRank, keyIndex: aKeyIndex } = a;
	const { rank: bRank, keyIndex: bKeyIndex } = b;
	const same = aRank === bRank;
	if (same) {
		if (aKeyIndex === bKeyIndex) {
			return baseSort(a, b);
		}
		else {
			return aKeyIndex < bKeyIndex ? aFirst : bFirst;
		}
	}
	else {
		return aRank > bRank ? aFirst : bFirst;
	}
}
function prepareValueForComparison(value, { keepDiacritics }) {
	value = `${value}`;
	if (!keepDiacritics) {
		value = removeAccents(value);
	}
	return value;
}
function getItemValues(item, key) {
	if (typeof key === 'object') {
		key = key.key;
	}
	let value;
	if (typeof key === 'function') {
		value = key(item);
	}
	else if (item == null) {
		value = null;
	}
	else if (Object.hasOwn(item, key)) {
		value = item[key];
	}
	else if (key.includes('.')) {
		return getNestedValues(key, item);
	}
	else {
		value = null;
	}
	if (value == null) {
		return [];
	}
	if (Array.isArray(value)) {
		return value;
	}
	return [String(value)];
}
function getNestedValues(path, item) {
	const keys = path.split('.');
	let values = [item];
	for (let i = 0, I = keys.length; i < I; i++) {
		const nestedKey = keys[i];
		let nestedValues = [];
		for (let j = 0, J = values.length; j < J; j++) {
			const nestedItem = values[j];
			if (nestedItem == null)
				continue;
			if (Object.hasOwn(nestedItem, nestedKey)) {
				const nestedValue = nestedItem[nestedKey];
				if (nestedValue != null) {
					nestedValues.push(nestedValue);
				}
			}
			else if (nestedKey === '*') {
				nestedValues = nestedValues.concat(nestedItem);
			}
		}
		values = nestedValues;
	}
	if (Array.isArray(values[0])) {
		const result = [];
		return result.concat(...values);
	}
	return values;
}
function getAllValuesToRank(item, keys) {
	const allValues = [];
	for (let j = 0, J = keys.length; j < J; j++) {
		const key = keys[j];
		const attributes = getKeyAttributes(key);
		const itemValues = getItemValues(item, key);
		for (let i = 0, I = itemValues.length; i < I; i++) {
			allValues.push({
				itemValue: itemValues[i],
				attributes,
			});
		}
	}
	return allValues;
}
const defaultKeyAttributes = {
	maxRanking: Infinity,
	minRanking: -Infinity,
};
function getKeyAttributes(key) {
	if (typeof key === 'string') {
		return defaultKeyAttributes;
	}
	return { ...defaultKeyAttributes, ...key };
}
