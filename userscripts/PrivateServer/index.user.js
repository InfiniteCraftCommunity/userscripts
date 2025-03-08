// ==UserScript==
// @name       infcraftps
// @namespace  <@1225068050923917404>
// @version    1.0.3
// @author     @errorplex on Discord
// @match      https://neal.fun/infinite-craft/
// @grant      GM.getValue
// @grant      GM.setValue
// @grant      unsafeWindow
// ==/UserScript==

(function () {
  "use strict";

  var _GM = /* @__PURE__ */ (() => (typeof GM != "undefined" ? GM : void 0))();
  var _unsafeWindow = /* @__PURE__ */ (() =>
    typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
  const nothing = {
    result: "Nothing",
    emoji: "",
    isNew: false,
  };
  function init$1() {
    _unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse =
      exportFunction(
        (...args) =>
          new Promise(async (resolve) => {
            const recipe = [args[0], args[1]].sort((a, b) =>
              a.text.localeCompare(b.text)
            );
            const controller = new AbortController();
            let url;
            try {
              const urlInput =
                (await _GM.getValue("ps-url")) ||
                "https://neal.fun/api/infinite-craft/pair?first={first}&second={second}";
              if (!/.*:\/\/.*={first}.*={second}/.test(urlInput)) {
                throw new Error("Invalid URL");
              }
              url = urlInput
                .replace("{first}", encodeURIComponent(recipe[0].text))
                .replace("{second}", encodeURIComponent(recipe[1].text));
              setTimeout(() => controller.abort(), 12e3);
              const result = await (
                await fetch(url, {
                  signal: controller.signal,
                  headers: {
                    "ngrok-skip-browser-warning": "true",
                  },
                })
              ).json();
              return resolve(result);
            } catch (err) {
              console.error(err);
              resolve(nothing);
            }
          })
      );
  }
  const serverIcon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2em' height='2em' viewBox='0 0 24 24'%3E%3C!-- Icon from Material Symbols Light by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --%3E%3Cpath fill='currentColor' d='M4.616 20q-.691 0-1.153-.462T3 18.384V5.616q0-.691.463-1.153T4.615 4h4.577q.69 0 1.153.463t.463 1.153v12.769q0 .69-.463 1.153T9.192 20zm10.192 0q-.69 0-1.153-.462t-.463-1.153V5.615q0-.69.463-1.152T14.808 4h4.577q.69 0 1.152.463T21 5.616v12.769q0 .69-.463 1.153T19.385 20zM4.616 19h4.576q.27 0 .443-.173t.173-.442V5.615q0-.269-.174-.442Q9.462 5 9.192 5H4.616q-.27 0-.443.173T4 5.616v12.769q0 .269.173.442t.443.173m10.192 0h4.577q.269 0 .442-.173t.173-.442V5.615q0-.269-.173-.442T19.385 5h-4.577q-.27 0-.443.173t-.173.443v12.769q0 .269.173.442t.443.173m-6.423-5.115q0-.214-.144-.357q-.143-.144-.356-.144h-2q-.214 0-.357.144q-.143.143-.143.357q0 .213.143.356q.143.144.357.144h2q.213 0 .356-.144t.144-.356m10.23 0q0-.214-.143-.357q-.143-.144-.356-.144h-2.02q-.213 0-.347.144q-.133.143-.133.357q0 .213.143.356t.357.144h2q.213 0 .356-.144q.144-.143.144-.356M8.385 11.077q0-.213-.144-.357t-.356-.143h-2q-.214 0-.357.143q-.143.144-.143.357t.143.357t.357.143h2q.213 0 .356-.143t.144-.357m10.23 0q0-.213-.143-.357q-.143-.143-.356-.143h-2.02q-.213 0-.347.143q-.133.144-.133.357t.143.357t.357.143h2q.213 0 .356-.143q.144-.143.144-.357M8.385 8.25q0-.213-.144-.357t-.356-.143h-2q-.214 0-.357.143q-.143.144-.143.357t.143.357t.357.143h2q.213 0 .356-.143t.144-.357m10.23 0q0-.213-.143-.357q-.143-.143-.356-.143h-2.02q-.213 0-.347.143q-.133.144-.133.357t.143.357t.357.143h2q.213 0 .356-.143q.144-.143.144-.357M4.616 19H4h5.808zm10.192 0h-.616H20z'/%3E%3C/svg%3E`;
  const closeIcon =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNjAwIj48cGF0aCBkPSJNMzAwLjAwMDAyLDM0OS44MzIzM0w2MC4xMDc4Miw1ODkuNzIzMzJjLTYuNTQ2ODksNi41NDc2OS0xNC43NzY0Myw5Ljg5NzE4LTI0LjY4ODYsMTAuMDQ4NTEtOS45MTEzOCwuMTUyMS0xOC4yOTIyNC0zLjE5NzQtMjUuMTQyNTYtMTAuMDQ4NTFDMy40MjU1Nyw1ODIuODcyOTgsLjAwMDAyLDU3NC41Njc4LDAsNTY0LjgwNzc0Yy4wMDAwMi05Ljc2MDA3LDMuNDI1NTctMTguMDY1MjYsMTAuMjc2NjYtMjQuOTE1NTZsMjM5Ljg5MTAxLTIzOS44OTIyTDEwLjI3NjY4LDYwLjEwNzc4QzMuNzI4OTksNTMuNTYwOTIsLjM3OTUsNDUuMzMxMzYsLjIyODE3LDM1LjQxOTIyLC4wNzYwNywyNS41MDc4OCwzLjQyNTU3LDE3LjEyNywxMC4yNzY2OCwxMC4yNzY2NiwxNy4xMjcwMiwzLjQyNTUzLDI1LjQzMjIsMCwzNS4xOTIyNiwwczE4LjA2NTI2LDMuNDI1NTMsMjQuOTE1NTYsMTAuMjc2NjZsMjM5Ljg5MjIsMjM5Ljg5MDk3TDUzOS44OTIyMiwxMC4yNzY1OWM2LjU0Njg2LTYuNTQ3NzIsMTQuNzc2NDMtOS44OTcyLDI0LjY4ODU2LTEwLjA0ODUxLDkuOTExMzQtLjE1MjE3LDE4LjI5MjIyLDMuMTk3MzgsMjUuMTQyNTYsMTAuMDQ4NTEsNi44NTExMyw2Ljg1MDI3LDEwLjI3NjY2LDE1LjE1NTUyLDEwLjI3NjY2LDI0LjkxNTU2cy0zLjQyNTUzLDE4LjA2NTIyLTEwLjI3NjY2LDI0LjkxNTU2bC0yMzkuODkwOTcsMjM5Ljg5MjI3LDIzOS44OTEwNSwyMzkuODkyMmM2LjU0NzcyLDYuNTQ2ODksOS44OTcyLDE0Ljc3NjQzLDEwLjA0ODUxLDI0LjY4ODYsLjE1MjE3LDkuOTExMzgtMy4xOTczOCwxOC4yOTIyNC0xMC4wNDg1MSwyNS4xNDI1Ni02Ljg1MDI3LDYuODUxMS0xNS4xNTU1MiwxMC4yNzY2NC0yNC45MTU1NiwxMC4yNzY2Ni05Ljc2MDA0LS4wMDAwMi0xOC4wNjUyMi0zLjQyNTU3LTI0LjkxNTU2LTEwLjI3NjY2bC0yMzkuODkyMjctMjM5Ljg5MTAxWiIvPjwvc3ZnPg==";
  let _modal;
  async function initServerModal() {
    var _a;
    const modal = document.createElement("dialog");
    modal.classList.add("modal");
    const header = document.createElement("div");
    header.classList.add("modal-header");
    const title = document.createElement("h1");
    title.classList.add("modal-title");
    title.appendChild(document.createTextNode("Private Server"));
    header.appendChild(title);
    const closeButtonContainer = document.createElement("div");
    closeButtonContainer.classList.add("close-button-container");
    const closeButton = document.createElement("img");
    closeButton.src = closeIcon;
    closeButton.classList.add("close-button");
    closeButtonContainer.appendChild(closeButton);
    closeButtonContainer.addEventListener("click", () => {
      modal.close();
    });
    header.appendChild(closeButtonContainer);
    const input = document.createElement("input");
    input.placeholder =
      "https://neal.fun/api/infinite-craft/pair?first={first}&second={second}";
    input.value = (await _GM.getValue("ps-url")) || "";
    input.addEventListener("change", async () => {
      await _GM.setValue("ps-url", input.value);
    });
    modal.appendChild(header);
    modal.appendChild(input);
    (_a = document.querySelector(".container")) == null
      ? void 0
      : _a.append(modal);
    _modal = modal;
  }
  async function init() {
    var _a;
    await initServerModal();
    const serverButton = document.createElement("img");
    serverButton.src = serverIcon;
    serverButton.classList.add("private-server");
    (_a = document.querySelector(".side-controls")) == null
      ? void 0
      : _a.prepend(serverButton);
    serverButton.addEventListener("click", () => {
      _modal.showModal();
    });
  }
  window.addEventListener("load", async () => {
    await init();
    init$1();
    console.log("Private Server loaded.");
  });
})();
