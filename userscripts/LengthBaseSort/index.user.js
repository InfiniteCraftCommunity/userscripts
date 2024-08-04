// ==UserScript==
// @name       Length sort
// @namespace   Violentmonkey Scripts4
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @version     1.0
// @author      Alexander_Andercou
// @description 5/23/2024, 7:54:23 PM
// ==/UserScript==
(function () {
  window.addEventListener('load', async () => {
    console.log("Welcome to hijack sorting length");
    let new_svg = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgNjQgNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTS43IDYxLjhDLS41IDYzLS4xIDY0IDEuNiA2NGg1OS4zYzEuNyAwIDMuMS0xLjQgMy4xLTMuMVYxLjZjMC0xLjctMS0yLjEtMi4yLS45em00OS4xLTE1YzAgMS43LTEuNCAzLjEtMy4xIDMuMWgtMTFjLTEuNyAwLTIuMS0xLS45LTIuMmwxMi44LTEyLjhjMS4yLTEuMiAyLjItLjggMi4yLjl6IiBmaWxsPSIjZmZjZTMxIi8+PHBhdGggZD0iTTIuNCA2MS4zaDFWNjRoLTF6bTIuOSAwaDFWNjRoLTF6bTMgMGgxVjY0aC0xem0zLTIuM2gxdjVoLTF6bTMuMSAyLjNoMVY2NGgtMXptMyAwaDFWNjRoLTF6bTMgMGgxVjY0aC0xem0zLTIuM2gxdjVoLTF6bTMuMSAyLjNoMVY2NGgtMXptMyAwaDFWNjRoLTF6bTMgMGgxVjY0aC0xem0yLjktMi4zaDF2NWgtMXptMy4yIDIuM2gxVjY0aC0xem0yLjkgMGgxVjY0aC0xem0zIDBoMVY2NGgtMXptMy0yLjNoMXY1aC0xem0zLjEgMi4zaDFWNjRoLTF6bTMgMGgxVjY0aC0xem0zIDBoMVY2NGgtMXptMy0yLjNoMXY1aC0xeiIgZmlsbD0iIzg5NjY0YyIvPjwvc3ZnPg==';
    unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].sorts.push("length");
    let elementals = null;
    const complex_filter = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.sortedElements.getter;
    unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.sortedElements.getter =
      exportFunction(() => {
        if (unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.sortBy === "length") {
          let img = document.querySelector(".sidebar-sort > img");
          img.style.filter = "none";
          img.style.filter = "invert(0)";
          let elements2 = [...complex_filter.call(this)];
          // console.log("elem:",elements2);
          return elements2.sort((a, b) => a.text.length.toString().localeCompare(b.text.length.toString(), undefined, { 'numeric': true }));
        } else {
          let elements2 = [...complex_filter.call(this)];
          console.log("By:", unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.sortBy);
          return elements2;
        }
      }, unsafeWindow);
    const sortButtonObserver = new MutationObserver((mutations) => {
      if (unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.sortBy === "length") {
        let img = document.querySelector(".sidebar-sort > img");
        console.log("mutation:", unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.sortBy);
        if (img.src.trim() == "https://neal.fun/infinite-craft/length.svg") {
          img.src = new_svg;
          img.style.filter = "invert(0)";
        }
        img.style.filter = "none";
        img.style.filter = "invert(0)";
      } else {
        let img = document.querySelector(".sidebar-sort > img");
        img.style.filter = "invert(1)";
      }
    });
    let img = document.querySelector(".sidebar-sort > img");
    console.log(img, img.textContent)
    var config = { characterData: false, attributes: true, childList: false, subtree: false, attributeFilter: ['src'] };
    sortButtonObserver.observe(img, config);
    console.log(img);
  }, false);
})();