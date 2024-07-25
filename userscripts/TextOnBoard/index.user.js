// ==UserScript==
// @name        Text On Board
// @namespace   zptr.cc
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @run-at      document-end
// @version     0.1
// @author      zeroptr
// @downloadURL https://raw.githubusercontent.com/InfiniteCraftCommunity/userscripts/master/userscripts/TextOnBoard/index.user.js
// @description Allows you to write text messages on the board
// ==/UserScript==

let IC;
let container;

let _btn;
let _inputX, _inputY;
let _focusedInput;
let _placeTextPlaceholder;
let _textTool = false;

const $ = {};

window.addEventListener("load", () => {
  IC = $nuxt.$root.$children[2].$children[0].$children[0];
  container = document.querySelector(".container");

  // compatibility
  unsafeWindow.userscript$TextOnBoard = $;

  init$button();
  init$clearBoard();
  init$textTool();
});

function init$button() {
  const button = document.querySelector(".side-controls img").cloneNode();

  injectCSS(`
    @keyframes _text-tool-anim {
      0%, 100% { transform: translateY(0px) }
      33% { transform: translateY(2px) }
      66% { transform: translateY(-2px) }
    }
  `);

  button.src = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTggMTgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTEyLjc4OCAxNy41aC0xMC40ODFjLTAuNTA1MTcgMC0wLjkzMjc1LTAuMTc1LTEuMjgyOC0wLjUyNXMtMC41MjUtMC43Nzc2LTAuNTI1LTEuMjgyN3YtMTMuMzg1YzAtMC41MDUxNyAwLjE3NS0wLjkzMjc1IDAuNTI1LTEuMjgyOHMwLjc3NzU4LTAuNTI1IDEuMjgyOC0wLjUyNWgxMy4zODVjMC41MDUxIDAgMC45MzI3IDAuMTc1IDEuMjgyNyAwLjUyNXMwLjUyNSAwLjc3NzU4IDAuNTI1IDEuMjgyOHYxMC40ODFsLTQuNzExNSA0LjcxMTV6bS0wLjc4ODUtMS41di0yYzAtMC41NSAwLjE5NTgtMS4wMjA4IDAuNTg3NS0xLjQxMjVzMC44NjI1LTAuNTg3NSAxLjQxMjUtMC41ODc1aDJ2LTkuNjkyMmMwLTAuMDc3LTAuMDMyMS0wLjE0NzUtMC4wOTYyLTAuMjExNS0wLjA2NC0wLjA2NDE3LTAuMTM0NS0wLjA5NjI1LTAuMjExNS0wLjA5NjI1aC0xMy4zODVjLTAuMDc3IDAtMC4xNDc1IDAuMDMyMDgtMC4yMTE1IDAuMDk2MjUtMC4wNjQxNyAwLjA2NC0wLjA5NjI1IDAuMTM0NS0wLjA5NjI1IDAuMjExNXYxMy4zODVjMCAwLjA3NyAwLjAzMjA4IDAuMTQ3NSAwLjA5NjI1IDAuMjExNSAwLjA2NCAwLjA2NDEgMC4xMzQ1IDAuMDk2MiAwLjIxMTUgMC4wOTYyaDkuNjkyMnptLTMuNzUtMy4yNWgxLjV2LTZoM3YtMS41aC03LjV2MS41aDN2NnoiLz48L3N2Zz4=";
  button.draggable = false;

  button.style.opacity = 0.7;
  button.onclick = (e) => {
    _textTool ? $.disableTextTool() : $.enableTextTool(e.x, e.y);
  };

  _btn = button;
  document.querySelector(".side-controls").prepend(button);
}

function init$clearBoard() {
  const fn = IC.clearInstances;
  IC.clearInstances = () => {
    document.querySelectorAll("input.board_text").forEach((x) => x.remove());
    fn();
  }
}

$.disableTextTool = () => {
  if (_placeTextPlaceholder) _placeTextPlaceholder.remove();
  document.activeElement.blur();
  
  container.classList.remove("text_tool_active");
  container.style.cursor = null;
  _btn.style = null;
  _btn.style.opacity = 0.7;
  _focusedInput = false;
  _textTool = false;
}

$.enableTextTool = (x, y) => {
  container.classList.add("text_tool_active");
  container.style.cursor = "cell";
  _btn.style.animation = "3s _text-tool-anim linear infinite";
  _btn.style.opacity = 1;
  _btn.style.scale = 1.4;
  _focusedInput = false;
  _textTool = true;
  $.createTextInput(x, y);
}

$.finalizeTextInput = (input) => {
  if (!input.value) {
    input.remove();
    IC.deleteSound.play();
  }
}

$.createTextInput = (x, y) => {
  const text = document.createElement("input");
  
  text.classList.add("item", "instance", "board_text", "placeholder");
  text.style.zIndex = 0;
  text.type = "text";
  text.value = "Add text";
  text.tabIndex = -1;
  text.maxLength = 128;
  
  text.addEventListener("focus", () => {
    if (_placeTextPlaceholder && _placeTextPlaceholder != text && _placeTextPlaceholder.classList.contains("placeholder")) {
      _placeTextPlaceholder.remove();
      _placeTextPlaceholder = null;
      _focusedInput = text;

      const pos = text.style.translate.split(" ").map((x) => parseInt(x));
      _inputX = pos[0];
      _inputY = pos[1];
    } else if (_focusedInput != text) {
      $.disableTextTool();
      document.activeElement.blur();
    }
  });

  text.addEventListener("blur", () => $.finalizeTextInput(text));
  text.addEventListener("input", () => $.adjustTextInputWidth(text));
  
  text.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
  }, true);

  _placeTextPlaceholder = text;
  document.querySelector(".instances > div").append(text);
  $.adjustTextInputWidth(text);
  $.positionTextInput(text, x, y);

  return text;
}

$.positionTextInput = (input, x, y) => {
  const f = (n) => Math.floor(n / 8) * 8;

  _inputX = f(x);
  _inputY = f(y);

  input.style.translate = `${f(x)}px ${f(y)}px`;
}

$.adjustTextInputWidth = (input) => {
  // What the actual fuck
  const span = document.createElement("span");
  
  span.style.opacity = 0;
  span.style.display = "fixed";
  span.style.left = span.style.top = "-999%";
  span.style.whiteSpace = "pre";
  
  container.append(span);

  span.textContent = input.value;
  input.style.width = span.getBoundingClientRect().width + 10 + "px";
  
  span.remove();
}

$.placeTextInput = (input, text="Text") => {
  _placeTextPlaceholder = null;
  _focusedInput = input;
  
  input.style.zIndex = 3;
  input.classList.remove("placeholder");
  input.value = text;
  input.focus();
  input.select();
  input.setSelectionRange(0, input.value.length);
  
  // Pannable board compatibility
  // Let's hope nothing breaks!
  IC.instances.push({ elem: input });

  IC.playInstanceSound();
  $.adjustTextInputWidth(input);
}

function init$textTool() {
  injectCSS(`
    .text_tool_active .items-inner { pointer-events: none }
    .text_tool_active .item.instance { pointer-events: none }

    .board_text {
      position: absolute;
      font-family: inherit;
      font-size: inherit;
      pointer-events: none;
      background: var(--background-color) !important;
      color: var(--text-color) !important;
      border-radius: 4px !important;
      padding: 4px !important;
      outline: 0 !important;
      border: 0 !important;
      margin: 0 !important;
    }

    .text_tool_active .board_text {
      pointer-events: unset !important;
      border: 1px dashed var(--instance-border) !important;
      opacity: 1;
    }

    .board_text.placeholder {
      opacity: 0.5 !important;
      pointer-events: none !important;
    }

    .board_text:focus,
    .board_text:hover {
      border-style: solid !important;
      border-color: var(--instance-border-hover) !important;
    }
  `);

  const isMouseEventOnBoard = (e) => (
    e.target == container
    && e.y < window.innerHeight - 32
    && e.x < window.innerWidth - IC.sidebarSize
  );

  container.addEventListener("mousemove", (e) => {
    if (_placeTextPlaceholder && isMouseEventOnBoard(e)) {
      $.positionTextInput(_placeTextPlaceholder, e.x, e.y);
    }
  })

  container.addEventListener("click", (e) => {
    if (_placeTextPlaceholder && isMouseEventOnBoard(e)) {
      $.placeTextInput(_placeTextPlaceholder);
    } else if (e.target == container && _textTool && _focusedInput) {
      $.disableTextTool();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (_textTool) {
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (e.key == "Enter" && e.shiftKey && _focusedInput) {
        $.placeTextInput($.createTextInput(_inputX, _inputY + _focusedInput.offsetHeight * 1.5), "");
      } else if (e.key == "Escape" || e.key == "Enter") {
        $.disableTextTool();
      }
    }
  }, true);
}

function injectCSS(css) {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
}
