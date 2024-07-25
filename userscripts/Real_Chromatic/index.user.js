// ==UserScript==
// @name        Real Chromatic Theme Script
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @author      Dude
// @description 7/10/2024, 2:28:31 PM
// ==/UserScript==

function injectCSS(){

    let css=`
    .container.dark-mode {
      background-color: red;
      animation-name: example;
      animation-duration: 4s;
      animation-iteration-count: infinite;
    }

    @keyframes example {
      14%   {background-color: red;}
      28%   {background-color: orange;}
      42%  {background-color: yellow;}
      57%   {background-color: green;}
      71%  {background-color: blue;}
      86%   {background-color: purple;}
      100%  {background-color: red;}
    }
    `;

     let style = document.createElement('style');
     style.appendChild(document.createTextNode(css.trim()));
     document.getElementsByTagName('head')[0].appendChild(style);



}
window.addEventListener('load', async () => {
injectCSS();
});