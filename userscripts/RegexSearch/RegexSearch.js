// ==UserScript==
// @name        Regex Search
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @version     1.0
// @author      -
// @description 6/21/2024, 5:35:29 PM
// ==/UserScript==
(function () {
  let complexFilter = null;
  let beforeFilter = null;
  let useRegex = false;






  let isRegex = str => useRegex;

  window.addEventListener('load', async () => {



    let parent = document.querySelector(".sidebar-header");



    let newDiv = document.createElement("div");

    let label = document.createElement("label");
    label.textContent = "Use only regex for search"
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
      useRegex = checkbox.checked;
      let sq = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].searchQuery;
      unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].searchQuery += "a";
      unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].searchQuery = sq;

    });
    checkbox.style.width = "15px";
    checkbox.style.height = "15px";
    checkbox.style.borderColor = "var(--border-color)";
    checkbox.style.opacity = "1";
    checkbox.style.margin = "3px";



    newDiv.appendChild(document.querySelector(".sidebar-search"));
    newDiv.appendChild(document.createElement("br"));
    newDiv.appendChild(label);
    newDiv.appendChild(checkbox);

    parent.insertBefore(newDiv, parent.firstChild)
    if (complexFilter == null)
      complexFilter = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.searchResults.getter;


    if (beforeFilter == null) {
      complexFilter = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.sortedElements.getter;
      cloneInto(complexFilter, unsafeWindow);
    }













    unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.searchResults.getter =
      exportFunction(() => {

        console.log("this happends");


        console.log(unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.sortedElements.getter);


        let returnedByComplexFilter = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements;




        let query = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].searchQuery;
        console.log("what filter returns", returnedByComplexFilter);



        let dummy = [...returnedByComplexFilter];
        if (isRegex(query)) {

          var re = new RegExp(query);

          dummy = dummy.filter(e => e.text.match(re));


          return cloneInto(dummy, unsafeWindow);
        }
        else
          return complexFilter();





      }, unsafeWindow);
  }, false);


})();