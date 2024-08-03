// ==UserScript==
// @name       RecipeCount sort
// @namespace   Violentmonkey Scripts4
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @version     1.0
// @author      Alexander_Andercou
// @description 5/23/2024, 7:54:23 PM
// ==/UserScript==
(function () {
  let save = null;
  function getSave() {
    return new Promise((resolve, reject) => {
      const handleClick = HTMLElement.prototype.click;
      HTMLElement.prototype.click = () => { HTMLElement.prototype.click = handleClick }
      const bodyObserver = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
          if (mutation.type !== "childList") continue;
          const anchor = Array.from(mutation.addedNodes).find((node) => node.download === "infinitecraft.json");
          if (anchor) return fetch(anchor.href).then(resolve);
        }
      });
      bodyObserver.observe(document.body, { childList: true, subtree: true });
      handleClick.call(document.querySelector(".setting[for=import-save] + .setting"));
      setTimeout(() => {
        bodyObserver.disconnect();
        reject("Timed out")
      }, 1500);
    });
  }



  window.addEventListener('load', async () => {


    console.log("Welcome to hijack sorting by recipe count");

    let new_svg = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8cGF0aCBkPSJNMTkwLjM4NiAxMTBDMTg2Ljg3NSAxMjEuMjI1IDE4My4yMzkgMTMyLjQxMiAxNzkuODY0IDE0My42NzZDMTc5LjA0NiAxNDYuMzk3IDE0Ny45MjYgMjc2LjA0IDEzNC44ODUgMjk1LjcxNSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utb3BhY2l0eT0iMC45IiBzdHJva2Utd2lkdGg9IjE2IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4NCjxwYXRoIGQ9Ik0yNjUuMSAxMjIuODA4QzI0MC40NDcgMTcxLjE4OSAyMjIuMjc2IDI2OC4zMDIgMjE2LjAwMyAzMDIuMTE5IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjkiIHN0cm9rZS13aWR0aD0iMTYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPg0KPHBhdGggZD0iTTI4NC4zMTEgMjMxLjY3NUMyMjQuMjkxIDIzNy4xMSAxNjUuMzUzIDI0MC4yMTQgMTA1IDI0MC4yMTQiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuOSIgc3Ryb2tlLXdpZHRoPSIxNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8cGF0aCBkPSJNMjk0Ljk4NCAxNjMuMzY2QzI0Ni4yNjkgMTY3LjE5OSAxMzQuODk1IDE2OS4wMTEgMTI0LjIxMiAxNjkuNzciIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuOSIgc3Ryb2tlLXdpZHRoPSIxNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+DQo8L3N2Zz4=`;
    unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].sorts.push("recip");
    let elementals = null;
    const complex_filter = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.sortedElements.getter;



    unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.sortedElements.getter =
      exportFunction(() => {


        if (unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.sortBy === "recip") {


          let elements2 = [...complex_filter.call(this)];
          console.log("elem:", elements2);


          if (save != null) {
            console.log(save);
            let elem3 = elements2.sort((a, b) => {
              if (!(a.text in save["recipes"]))
                return -1;
              if (!(b.text in save["recipes"]))
                return 1;
              return save["recipes"][a.text].length - save["recipes"][b.text].length;
            })

            console.log("elems after sort", elem3);
            return elem3;

          }
          console.log("elems after sort are null", elements2);


          return elements2;



        }
        else {


          let elements2 = [...complex_filter.call(this)];
          console.log("By:", unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.sortBy);
          console.log("elem normal:", elements2);
          return elements2;


        }


      }, unsafeWindow);

    const sortButtonObserver = new MutationObserver((mutations) => {
      console.log("mutation:", unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.sortBy);

      if (unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.sortBy === "recip") {
        let img = document.querySelector(".sidebar-sort > img");

        if (img.src.trim() == "https://neal.fun/infinite-craft/recip.svg") {

          img.src = new_svg;
          img.style.filter = "invert(1)";
          //img.style.filter="none";

        }
      } else {
        let img = document.querySelector(".sidebar-sort > img");

        img.style.filter = "invert(1)";

      }


    });

    let img = document.querySelector(".sidebar-sort > img");
    console.log(img, img.textContent)
    var config = { characterData: false, attributes: true, childList: false, subtree: false };
    sortButtonObserver.observe(img, config);


    let parent = document.querySelector(".settings-content");
    let button = document.createElement("div");
    button.appendChild(document.createTextNode("Fetch savefile for sorting"));
    button.addEventListener("click", async () => {
      save = await getSave().then(x => x.json());

      alert("Save file fetched")



    });
    parent.appendChild(button);




    // console.log(unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]);

    console.log(img);


  }, false);












})();
