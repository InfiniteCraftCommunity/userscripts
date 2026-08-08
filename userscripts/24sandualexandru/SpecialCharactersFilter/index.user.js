// ==UserScript==
// @name         Regex Special Character Search
// @namespace    http://tampermonkey.net/
// @version      2026-03-23
// @description  Search items by selecting special characters extracted from item texts on demand, with scrollable modal and sticky header
// @author       You
// @match        https://neal.fun/infinite-craft/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neal.fun
// @grant        none
// ==/UserScript==

(async function () {
    "use strict";

    function sleep(ms = 0) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Wait for Vue to load
    await new Promise((r) => {
        const check = () => {
            if (document.querySelector(".container") &&
                document.querySelector("#sidebar") &&
                document.querySelector("#sidebar").__vue__) r();
            else setTimeout(check, 300);
        };
        check();
    });

    let v_sidebar = document.querySelector("#sidebar").__vue__;
    const oldFiltered = v_sidebar._computedWatchers.filteredElements.getter;

    // -------------------------------------------------------
    // Filtering logic
    // -------------------------------------------------------
    function applyRegexSearch() {
        const spans = [...document.querySelectorAll("span")]
            .filter(s => s.textContent.trim() === "Regex search");

        const label = spans.find(s => {
            const prev = s.previousElementSibling;
            return prev && prev.tagName === "INPUT" && prev.type === "checkbox";
        });

        if (label) {
            const checkbox = label.previousElementSibling;

            if (checkbox && checkbox.tagName === "INPUT" && checkbox.type === "checkbox") {
                checkbox.checked = false;
                checkbox.click();
            }
        }

        v_sidebar._computedWatchers.filteredElements.getter = function () {
            let query = v_sidebar.searchQuery;
            v_sidebar.searchQuery = "";
            let filtered = oldFiltered.apply(this);
            const regex = new RegExp(query, "i");
            return filtered.filter(x => regex.test(x.text));
        };
    }

    // -------------------------------------------------------
    // Lazy modal creation
    // -------------------------------------------------------
    let modalCreated = false;

    function createModal() {

        let modal = document.querySelector("#regex-modal");
        if (modal) {
            modal.innerHTML = "";
        } else {
            modal = document.createElement("div");
            document.body.appendChild(modal);
        }

        // Extract special characters dynamically
        let items = document.querySelector(".container").__vue__._data.items;
        let allText = items.map(i => i.text).join("");
        let specialChars = [...new Set(allText.replace(/[A-Za-z0-9 ]/g, ""))];
        specialChars.sort();

        // Modal wrapper
        modal.id = "regex-modal";
        modal.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 99999;
        `;

        // Modal box (scrollable)
        const modalBox = document.createElement("div");
        modalBox.style.cssText = `
            background: #1e1e1e;
            padding: 0;
            border-radius: 10px;
            width: 340px;
            max-height: 50vh;
            color: white;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;

        modal.appendChild(modalBox);

        // -------------------------------------------------------
        // NEW: Close modal when clicking outside modalBox
        // -------------------------------------------------------
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });

        // Sticky header
        const header = document.createElement("div");
        header.style.cssText = `
            position: sticky;
            top: 0;
            background: #222;
            padding: 12px;
            border-bottom: 1px solid #444;
            z-index: 2;
        `;
        header.innerHTML = `
            <div style="font-size:18px; margin-bottom:8px;">Selected: <span id="selected-chars"></span></div>
            <button id="regex-search-btn" style="
                width:100%; padding:10px; border:none; border-radius:6px;
                background:#4caf50; color:white; font-weight:bold; cursor:pointer;
            ">Search</button>
        `;
        modalBox.appendChild(header);

        const selectedDisplay = header.querySelector("#selected-chars");

        // Scrollable content
        const scrollArea = document.createElement("div");
        scrollArea.style.cssText = `
            overflow-y: auto;
            padding: 12px;
            flex: 1;
        `;

        scrollArea.addEventListener("wheel", e => e.stopPropagation(), { passive: true });

        modalBox.appendChild(scrollArea);

        // Character list container
        const charList = document.createElement("div");
        charList.style.cssText = `
            display:flex; flex-wrap:wrap; gap:6px;
        `;
        scrollArea.appendChild(charList);

        // Build character buttons dynamically
        specialChars.forEach(ch => {
            const btn = document.createElement("button");
            btn.textContent = ch;
            btn.style.cssText = `
                width:32px; height:32px; border-radius:6px;
                background:#333; color:white; border:1px solid #555;
                cursor:pointer; font-size:16px;
            `;
            btn.dataset.selected = "false";

            btn.onclick = () => {
                if (btn.dataset.selected === "false") {
                    btn.style.background = "#4caf50";
                    btn.dataset.selected = "true";
                } else {
                    btn.style.background = "#333";
                    btn.dataset.selected = "false";
                }

                let selected = [...charList.children]
                    .filter(b => b.dataset.selected === "true")
                    .map(b => b.textContent)
                    .join(" ");

                selectedDisplay.textContent = selected;
            };

            charList.appendChild(btn);
        });

        // Search button
        header.querySelector("#regex-search-btn").onclick = () => {
            const selected = [...charList.children]
                .filter(btn => btn.dataset.selected === "true")
                .map(btn => btn.textContent);

            if (selected.length === 0) {
                modal.style.display = "none";
                return;
            }

            const regex = new RegExp("[" + selected.join("") + "]", "i");

            applyRegexSearch();
            v_sidebar.searchQuery = "";
            document.querySelector(".sidebar-input").value = regex.source;
            v_sidebar.searchQuery = regex.source;

            modal.style.display = "none";
        };

        createModal.modal = modal;
    }

    // -------------------------------------------------------
    // Sidebar button
    // -------------------------------------------------------
    const bar = document.querySelector(".sidebar-sorting");
    const btn = document.createElement("button");
    const fakeDiv = document.createElement("div");
    btn.textContent = "Special Character Search";
    btn.style.cssText = `
        margin-left:10px;
        padding:6px 12px;
        background:#4caf50;
        color:white;
        border:none;
        border-radius:6px;
        cursor:pointer;
        font-weight:bold;
    `;

    btn.onclick = () => {
        createModal();
        createModal.modal.style.display = "flex";
    };

    if (bar.children.length % 3 == 2) {
        bar.appendChild(fakeDiv);
        bar.appendChild(btn);
    } else if (bar.children.length % 3 == 0) {
        const fakeDiv2 = document.createElement("div");
        bar.appendChild(btn);
        bar.appendChild(fakeDiv);
        bar.appendChild(fakeDiv2);
    } else {
        bar.appendChild(btn);
        bar.appendChild(fakeDiv);
    }
})();