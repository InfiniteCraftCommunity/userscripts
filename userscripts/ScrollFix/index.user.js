// ==UserScript==
// @name        Search Scrolling Fix
// @namespace   Search Scrolling Fix
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @version     1.1
// @author      Margen67, Mikarific
// @description Fixes the sidebar being scrolled to random places while searching.
// ==/UserScript==

window.addEventListener("load", () => {
  const elements = {
    sidebar: document.querySelector('.sidebar'),
    searchBar: document.querySelector('.sidebar-search')
  };
  elements.searchBar.addEventListener('input', () => {
    function scrollHack(scrollY) {
      elements.sidebar.scrollTo(0, scrollY);
      setTimeout(function (){
        elements.sidebar.scrollTo(0, scrollY);
      }, 250);
      setTimeout(function (){
        elements.sidebar.scrollTo(0, scrollY);
      }, 1000);
    };
    if (unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0]._data.searchQuery.trim().length === 0) {
      scrollHack(0);
    } else {
      let scrollY = 0;
      for (const element of ['.pinned', '.recent']) {
        if (document.querySelector(element)) {
          scrollY += document.querySelector(element).scrollHeight;
        };
      };
      scrollHack(scrollY);
    };
  });
});
