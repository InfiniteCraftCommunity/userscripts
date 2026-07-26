// ==UserScript==
// @name         IB Show Invis Chars
// @namespace    eisern.userscripts
// @version      1.6.2
// @match        https://infinibrowser.wiki/*
// @run-at       document-end
// @author       Eisern
// @grant        GM_addStyle
// @description  Shows invis chars on InfiniBrowser
// ==/UserScript==

//sample: https://infinibrowser.wiki/item/%22%E3%80%80%E3%80%80%E3%80%80%22

(function() {
  "use strict";

  const setting = {
      // General
      hoverMode: true,           // Disable to replace item text directly inline (no tooltip)
      showOver30: true,          // Shows char count when element is over 30 chars

      // Encoding
      mergeRepeats: false,       // Converts {0}{0} to {0}×2
      encodeHeaders: true,       // Disable this to keep original header/title
      encodeEmojis: false,       // Enable to split emojis into component code points
      encodeAsTofu: false,       // Enable to display invis chars as tofu:▯ with unicode value (replace mode only)
                                 // This requires downloading and installing the font 'Unicode BMP Fallback SIL' from:
                                 // https://scripts.sil.org/cms/sites/nrsi/download/unicodebmpfallback_61/UnicodeBMPFallback-6.1.zip
  };

  const mode = {
    hover: setting.hoverMode && !setting.encodeAsTofu,
    tofu: setting.encodeAsTofu,
    splitEmoji: setting.encodeEmojis,
  };

  const eyeSVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' d='M0 0h24v24H0z'/%3E%3Cg fill='none' stroke='%23cbcbcb' stroke-linecap='round' stroke-linejoin='round' stroke-width='2'%3E%3Cpath d='M2.062 12.348a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 19.876 0a1 1 0 0 1 0 .696a10.75 10.75 0 0 1-19.876 0'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3C/g%3E%3C/svg%3E";

  const css = `
    .inv_container {
      margin-right: 0 !important;
      user-select: text !important;
    }

    .inv_container :is(
      .container,
      .original-text,
      .ib-codepoint
    ) {
      margin-right: inherit;
      user-select: inherit;
    }

    .ib-original-text {
      margin-right: 0 !important;
      user-select: text !important;
    }

    .ib-codepoint {
      color: grey;
      font-size: smaller;
    }

    .char_count {
      color: grey;
      font-size: x-large;
      display: block;
    }

    .hidden {
      display: none;
    }

    ${mode.tofu && `
      .ib-codepoint {
        font-family: "Unicode BMP Fallback SIL", Roboto;
        font-size: inherit;
        font-weight: 1;
        color: grey;
      }
    `}

    ${mode.hover && `
      .inv_container::before {
        content: "";
        width: 20px;
        height: 20px;
        position: absolute;
        background-color: #696969;
        mask: url("${eyeSVG}") center / contain no-repeat;
        top: 0;
        right: 0;
        transform: translate(50%, -50%);
      }

      .inv_container::after {
        content: attr(data-tooltip);
        visibility: hidden;
        border:1px solid #525252;
        border-radius: 3px;
        position: absolute;
        bottom: 30%;
        bottom: var(--after-bottom);
        left: 50%;
        transform: translate(-50%, -50%);
        background:#18181b;
        color: #6e6e6e;
        padding: 0.7em;
        box-shadow: 0px 10px 8px rgba(0, 0, 0, .4);
      }

      .item {
        position: relative;
        overflow: visible;
        --after-bottom: 50%;
      }

      .items .item {
        --after-bottom: 60%;
      }

      .item:hover .inv_container::after {
          visibility: visible;
      }
    `}
  `;

  //v Adapted from Infinite Craft Tooltips by errorplex v//
  function expandCodepoints(codepoints) {
      const result = [];
      for (const entry of codepoints) {
        if (Array.isArray(entry)) {
          for (let i = entry[0]; i <= entry[1]; i++) {
            result.push(i);
          }
        } else {
          result.push(entry);
        }
      }
      return result;
  }

  const codepoints = new Set(expandCodepoints([
      [0x0000, 0x001F],
      0x007F,
      [0x0080, 0x009F],

      0x00A0,
      0x1680,
      [0x2000, 0x200A],
      0x202F,
      0x205F,
      0x3000,

      0x00AD,
      0x034F,
      0x061C,
      0x115F, 0x1160,
      0x17B4, 0x17B5,
      0x180B, 0x180C, 0x180D, 0x180E,
      [0x200B, 0x200F],
      [0x2028, 0x2029],
      [0x202A, 0x202E],
      [0x2060, 0x206F],
      0x2800,
      0x3164,
      [0xFE00, 0xFE0F],
      0xFEFF,

      [0xE0000, 0xE0FFF]
  ]));

  const encodeCodepoint = (text) => {
      let result = "";

      for (const char of text) {
        const codepoint = char.codePointAt(0);

        if (codepoints.has(codepoint)) {
          result += `{${codepoint.toString(16)}}`;
        } else {
          result += char;
        }
      }
      return result;
  };
  //^ Adapted from Infinite Craft Tooltips by errorplex ^//

  const splitByEmoji = (text) => {
      const emojiRgx = /\p{RGI_Emoji}|\p{Emoji}\uFE0F/gv;

      let result = [];
      let last = 0;

      const matches = text.matchAll(emojiRgx);
      for (const m of matches) {
        const i = m.index;

        if (i > last) result.push({
          type: "text", value: text.slice(last, i)
        });

        result.push({ type: "emoji", value: m[0]});

        last = i + m[0].length;
      }

      if (last < text.length) result.push({
        type: "text", value: text.slice(last)
      });
      return result;
  };

  const splitByInvis = (text) => {
    const result = [];

    let part = "";
    let lastIsInvis = false;

    const emit = () => {
        result.push({
          type: lastIsInvis ? "invis" : "text",
          value: part
        })
        part = "";
    }

    for (const char of text) {
      const codepoint = char.codePointAt(0);
      const isInvis = codepoints.has(codepoint);

      if (isInvis !== lastIsInvis && part) {
        emit()
      }
      part += char;
      lastIsInvis = isInvis;
    }
    emit()

    return result;
  }

  const encodeTofus = (text) => {
    const result = [];

    if (!mode.splitEmoji) {
      for (const part of splitByEmoji(text)) {
        result.push(
          ...(part.type === "emoji" ? [part] : splitByInvis(part.value))
        );
      }
    }
    else result.push(...splitByInvis(text));
    return result.filter(e => e.type === "invis").length ? result : false;
  };

  const processText = (text) => {
      let result = "";

      if (mode.tofu) {
        return encodeTofus(text)
      }
      if (mode.splitEmoji) {
        result = encodeCodepoint(text);
      } else {
        for (const part of splitByEmoji(text)) {
          result += (part.type === "emoji")
            ? part.value
            : encodeCodepoint(part.value);
        }
      }
      return (result === text) ? false : result;
  };

  const addCharCount = (item, html, count) => {
      if (!setting.showOver30 || count <= 30) return
      item.innerHTML = html +
        `<span class="char_count"> 📏Characters: ${count}</span>`;
  };

  const splitEncoded = (text) => {
      return text.match(/({[^}]+})\1*|[^{}]+/g) ?? [];
  }

  const mergeRepeats = (text) =>
      text.replace(/({[^}]+})(?:\1)+/g, (m, g1) => {
        const count = m.split(/({[^}]+})/g)
          .filter(Boolean).length;
        return g1 + "×" + count;
      }).split(/({[^}]+}×?\d*)/g);

  const partitionText = (text) => {
      if (Array.isArray(text)) return text;

      if (setting.mergeRepeats) return mergeRepeats(text);

      return splitEncoded(text);
  }

  const styleCodepoint = (text) => {
      const invContainer = document.createElement("span");
      invContainer.className = "inv_container";

      const container = document.createElement("span");
      container.className = "container";

      const parts = partitionText(text)

      for (const part of parts) {
        if (!part) continue;

        const isInvis = mode.tofu
          ? part.type === "invis"
          : part.startsWith("{") && /}×?\d*$/.test(part);

        const inner = document.createElement("span");
        inner.textContent = part.value ?? part;

        inner.className = isInvis
          ? "ib-codepoint"
          : "original-text";

        container.appendChild(inner);

        if (mode.hover)
          container.classList.toggle("hidden");

        invContainer.dataset.tooltip = parts.map(
          part => part.value ?? part
        ).join("");

        invContainer.appendChild(container);
      }
      return invContainer;
  };

  const processItems = (selector, header, h2s = []) => {
      const items = [header];

      for (const h2 of h2s) items.push(h2.querySelector("span") ?? h2);

      items.push(...document.querySelectorAll(selector));

      for (const item of items) {
          if (item.dataset.processed === "1") continue;

          item.dataset.processed = "1";

          const originalNode = item.lastChild;
          const text = originalNode?.textContent;
          if (!text) continue;

          const count = [...text].length;
          const isHeader = (item.id === "item_id");
          const newText = processText(text);
          if (!newText) {
            isHeader && addCharCount(item, text, count);
            continue;
          }

          if (isHeader && !setting.encodeHeaders) {
            addCharCount(item, text, count);
            continue;
          }

          isHeader && addCharCount(item, item.innerHTML, count);

          // Hide original text
          const wrap = document.createElement("span");
          wrap.className = "ib-original-text";
          wrap.textContent = text;
          !mode.hover && wrap.classList.toggle("hidden");
          item.replaceChild(wrap, originalNode);

          // Display new text
          item.appendChild(styleCodepoint(newText));

          // Show H2s in Hover Mode
          const isH2 = item.parentNode.tagName === "H2";

          if (mode.hover && isH2) {
            item.firstChild.classList.toggle("hidden");
            item.querySelector(".container").classList.toggle("hidden");
          }
      }
  }

  const toggleVisibility = (a, b) => {
      a.classList.toggle("hidden")
      b.classList.toggle("hidden")
  };

  function initUI(inv, text) {
      if (!setting.encodeHeaders) return;
      const cont = inv.firstChild

      const btn = document.createElement("button");
      btn.className = "toggle_header";
      btn.addEventListener("click", (e) => {
        toggleVisibility(cont, text);
        e.currentTarget.blur();
      });

      const img = document.createElement("img");
      img.alt = "Toggle header";
      img.src = eyeSVG;

      btn.appendChild(img);
      document.querySelector(".copy_recipe")?.after(btn);
  }

  //v Adapted from Adjust InfiniBrowser Lineages by zptr v//
  window.addEventListener("load", () => {
      GM_addStyle(css);

      if (window.location.pathname.startsWith("/item")) {
        initIBItemView();
      } else if (window.location.pathname == "/") {
        initIBSearch();
      }
  });

  function initIBSearch() {
      if (!document.getElementById("recipes")) return;

      const recipes = document.getElementById("recipes")
      const list = document.getElementById("item_list")

      const header = document.getElementById("item_id")
      const selectors = [
        "#recipes .item",
        "#item_list .item",
      ];

      const run = () => selectors.forEach((s) => processItems(s, header));

      const observer = new MutationObserver(() => {
        run();
        delete header.dataset.processed;
      });

      [recipes, list].forEach((e) => e &&
        observer.observe(e, { childList: true }));
  }

  function initIBItemView() {
      const lineage = document.getElementById("recipe_tree");
      const recipes = document.getElementById("recipes")
      const uses = document.getElementById("used_with")

      const header = document.getElementById("item_id")
      const h2s = document.getElementsByTagName("h2");
      const selectors = [
        "#recipe_tree li .item",
        "#recipes li .item",
        "#used_with li .item",
      ];

      const run = () => selectors.forEach((s) => processItems(s, header, h2s));

      if (document.getElementById("lineage_loader")) {
        const itemObserver = new MutationObserver((e) => {
          if (e[0].removedNodes) {
            run();
          }
        });

      [lineage, recipes, uses].forEach((e) =>
          e && itemObserver.observe(e, { childList: true }));
      } else {
        run();
      }

      if (header) {
        const invObserver = new MutationObserver((e) => {
          const inv = header.querySelector(".inv_container")
          const text = header.querySelector(".ib-original-text");

          if (inv) {
            initUI(inv, text);
            invObserver.disconnect();
          }
        });

      invObserver.observe(header, { childList: true });
      }
  }
//^ Adapted from Adjust InfiniBrowser Lineages by zptr ^//
})();



