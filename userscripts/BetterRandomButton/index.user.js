// ==UserScript==
// @name        Better Random Button
// @namespace   zptr.cc
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @run-at      document-end
// @version     0.1
// @author      zeroptr
// @downloadURL https://raw.githubusercontent.com/InfiniteCraftCommunity/userscripts/master/userscripts/BetterRandomButton/index.user.js
// @description A better Random Element button. Works with searching. You can Shift+Click on the button to quickly combine two random elements!
// ==/UserScript==

window.addEventListener("load", () => {
  const img = document.querySelector(".side-controls img.random");

  if (!img) {
    const img = document.querySelector(".side-controls img").cloneNode();

    img.addEventListener("click", randomElementButton, true);
    img.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNjAwIj48cGF0aCBkPSJNNjAuNTc2NTcsNjAwYy0xNy4yNTkzOCwwLTMxLjY3MDMyLTUuNzgxMjUtNDMuMjMyODItMTcuMzQzNzVTMCw1NTYuNjgyODEsMCw1MzkuNDIzNDN2LTEwOC4xNzM0M2MwLTUuMzM2MjQsMS43OTA5NC05Ljc5NTMxLDUuMzcyODItMTMuMzc3MiwzLjU4MTI2LTMuNTgxODksOC4wNDAzLTUuMzcyOCwxMy4zNzcxOC01LjM3MjgsNS4zMzYyNSwwLDkuNzk1MywxLjc5MDkxLDEzLjM3NzE4LDUuMzcyOCwzLjU4MTg3LDMuNTgxODYsNS4zNzI4Miw4LjA0MDkzLDUuMzcyODIsMTMuMzc3MnYxMDguMTczNDVjMCw1Ljc2ODc0LDIuNDAzNzYsMTEuMDU3MTgsNy4yMTEyNSwxNS44NjUzMiw0LjgwODEyLDQuODA3NDgsMTAuMDk2NTYsNy4yMTEyNCwxNS44NjUzMiw3LjIxMTI0aDEwOC4xNzM0M2M1LjMzNjI0LDAsOS43OTUzMSwxLjc5MDk0LDEzLjM3NzIsNS4zNzI4MiwzLjU4MTg5LDMuNTgxODksNS4zNzI4LDguMDQwOTMsNS4zNzI4LDEzLjM3NzE4LDAsNS4zMzY4OC0xLjc5MDkxLDkuNzk1OTMtNS4zNzI4LDEzLjM3NzE4LTMuNTgxODksMy41ODE4Ny04LjA0MDk2LDUuMzcyODItMTMuMzc3Miw1LjM3MjgySDYwLjU3NjU3Wm00NzguODQ2ODgsMGgtMTA4LjE3MzQ1Yy01LjMzNjI3LDAtOS43OTUyOC0xLjc5MDk0LTEzLjM3NzE3LTUuMzcyODItMy41ODE4OS0zLjU4MTI2LTUuMzcyODMtOC4wNDAzLTUuMzcyODMtMTMuMzc3MTgsMC01LjMzNjI1LDEuNzkwOTQtOS43OTUzLDUuMzcyODMtMTMuMzc3MTgsMy41ODE4OS0zLjU4MTg3LDguMDQwOTYtNS4zNzI4MiwxMy4zNzcxNy01LjM3MjgyaDEwOC4xNzM0NWM1Ljc2ODc0LDAsMTEuMDU3MjItMi40MDM3NiwxNS44NjUyOS03LjIxMTI1LDQuODA3NTUtNC44MDgxMiw3LjIxMTI3LTEwLjA5NjU2LDcuMjExMjctMTUuODY1MzJ2LTEwOC4xNzM0M2MwLTUuMzM2MjQsMS43OTA5NC05Ljc5NTMxLDUuMzcyODMtMTMuMzc3MiwzLjU4MTg5LTMuNTgxODksOC4wNDA5Ni01LjM3MjgsMTMuMzc3MTctNS4zNzI4LDUuMzM2ODksMCw5Ljc5NTkxLDEuNzkwOTEsMTMuMzc3MTcsNS4zNzI4LDMuNTgxODksMy41ODE4OSw1LjM3MjgzLDguMDQwOTYsNS4zNzI4MywxMy4zNzcydjEwOC4xNzM0NWMwLDE3LjI1OTM2LTUuNzgxMjcsMzEuNjcwMzEtMTcuMzQzNzUsNDMuMjMyOC0xMS41NjI0OCwxMS41NjI1LTI1Ljk3MzQ1LDE3LjM0Mzc1LTQzLjIzMjgsMTcuMzQzNzVaTTAsNjAuNTc2NTVDMCw0My4zMTcyLDUuNzgxMjUsMjguOTA2MjMsMTcuMzQzNzUsMTcuMzQzNzUsMjguOTA2MjUsNS43ODEyNyw0My4zMTcxOSwwLDYwLjU3NjU3LDBoMTA4LjE3MzQzYzUuMzM2MjQsMCw5Ljc5NTMxLDEuNzkwOTQsMTMuMzc3Miw1LjM3MjgzLDMuNTgxODksMy41ODEyNiw1LjM3MjgsOC4wNDAyOCw1LjM3MjgsMTMuMzc3MTcsMCw1LjMzNjMyLTEuNzkwOTEsOS43OTUyOC01LjM3MjgsMTMuMzc3MTctMy41ODE4NiwzLjU4MTgzLTguMDQwOTMsNS4zNzI4My0xMy4zNzcyLDUuMzcyODNINjAuNTc2NTdjLTUuNzY4NzUsMC0xMS4wNTcxOCwyLjQwMzcyLTE1Ljg2NTMyLDcuMjExMjctNC44MDc0OSw0LjgwODA2LTcuMjExMjUsMTAuMDk2NTUtNy4yMTEyNSwxNS44NjUyOXYxMDguMTczNDVjMCw1LjMzNjI3LTEuNzkwOTQsOS43OTUyOC01LjM3MjgyLDEzLjM3NzE3LTMuNTgxODksMy41ODE4My04LjA0MDkzLDUuMzcyNzctMTMuMzc3MTgsNS4zNzI4My01LjMzNjg4LDAtOS43OTU5My0xLjc5MDk0LTEzLjM3NzE4LTUuMzcyODMtMy41ODE4Ny0zLjU4MTg5LTUuMzcyODItOC4wNDA5LTUuMzcyODItMTMuMzc3MTdWNjAuNTc2NTVabTYwMCwwdjEwOC4xNzM0NWMwLDUuMzM2MjctMS43OTA5NCw5Ljc5NTI4LTUuMzcyODMsMTMuMzc3MTctMy41ODEyNiwzLjU4MTg5LTguMDQwMjgsNS4zNzI4My0xMy4zNzcxNyw1LjM3MjgzLTUuMzM2MzIsMC05Ljc5NTI4LTEuNzkwOTQtMTMuMzc3MTctNS4zNzI4My0zLjU4MTgzLTMuNTgxODktNS4zNzI4My04LjA0MDk2LTUuMzcyODMtMTMuMzc3MTdWNjAuNTc2NTVjMC01Ljc2ODc0LTIuNDAzNzItMTEuMDU3MjItNy4yMTEyNy0xNS44NjUyOS00LjgwODA2LTQuODA3NTUtMTAuMDk2NTUtNy4yMTEyNy0xNS44NjUyOS03LjIxMTI3aC0xMDguMTczNDVjLTUuMzM2MjcsMC05Ljc5NTI4LTEuNzkwOTQtMTMuMzc3MTctNS4zNzI4My0zLjU4MTgzLTMuNTgxODktNS4zNzI3Ny04LjA0MDk2LTUuMzcyODMtMTMuMzc3MTcsMC01LjMzNjg5LDEuNzkwOTQtOS43OTU5MSw1LjM3MjgzLTEzLjM3NzE3LDMuNTgxODktMy41ODE4OSw4LjA0MDktNS4zNzI4MywxMy4zNzcxNy01LjM3MjgzaDEwOC4xNzM0NWMxNy4yNTkzNSwwLDMxLjY3MDMyLDUuNzgxMjcsNDMuMjMyOCwxNy4zNDM3NXMxNy4zNDM3NSwyNS45NzM0NSwxNy4zNDM3NSw0My4yMzI4Wk0zMDEuNDQxODcsNDk1LjQzMzEzYzguMzE3NTEsMCwxNS4zMjUwMS0yLjg0ODc1LDIxLjAyMjUxLTguNTQ2MjUsNS42OTY5LTUuNjk2ODcsOC41NDUzMy0xMi43MDQwNiw4LjU0NTMzLTIxLjAyMTU3cy0yLjg0ODQzLTE1LjMyNDctOC41NDUzLTIxLjAyMTU3Yy01LjY5NzUzLTUuNjk2ODctMTIuNzA1LTguNTQ1My0yMS4wMjI1MS04LjU0NTMtOC4zMTY5MSwwLTE1LjMyNDA3LDIuODQ4NDMtMjEuMDIxNTcsOC41NDUzLTUuNjk2OSw1LjY5Njg3LTguNTQ1MzMsMTIuNzA0MDYtOC41NDUzMywyMS4wMjE1N3MyLjg0ODQzLDE1LjMyNDcsOC41NDUzLDIxLjAyMTU3YzUuNjk3NDcsNS42OTc1LDEyLjcwNDY5LDguNTQ2MjUsMjEuMDIxNTcsOC41NDYyNVptMC0zNTUuOTYyMTVjMTkuMTM0OTgsMCwzNS42Mzc1LDYuMDgxODUsNDkuNTA3NTEsMTguMjQ1NiwxMy44NzAwMSwxMi4xNjMxMiwyMC44MDUwMiwyNy40OTk2OSwyMC44MDUwMiw0Ni4wMDk3MSwwLDEzLjQxMzE2LTMuOTMwMywyNS42MjQ2OS0xMS43OTA5NiwzNi42MzQ3MS03Ljg2MDAzLDExLjAwOTM5LTE2Ljg2MjE4LDIwLjk2MTIzLTI3LjAwNjU3LDI5Ljg1NTYzLTE2LjI1MDAxLDE0Ljg1NTYtMjguMzUzNDUsMjguNjg5NjgtMzYuMzEwMyw0MS41MDIyLTcuOTU2ODgsMTIuODEyNDktMTIuNTYwMjksMjYuODM5MDYtMTMuODEwMyw0Mi4wNzk3LS42MjQ5OSw0LjkwMzc0LC44MTc0OCw5LjA3NDM5LDQuMzI3NSwxMi41MTE4OCwzLjUwOTM5LDMuNDM3NTIsNy43ODgxMSw1LjE1NjI1LDEyLjgzNjI0LDUuMTU2MjUsNC45MDM3NiwwLDkuMTQ2NTgtMS42ODI4LDEyLjcyODQzLTUuMDQ4NDUsMy41ODE4OS0zLjM2NTAyLDUuNzU3NTItNy41NzE1NSw2LjUyNjg4LTEyLjYxOTY5LDEuNzMwNjMtMTAuNjI1MDEsNS40ODA2My0yMC4xMjAzMiwxMS4yNS0yOC40ODU5NSw1Ljc2ODc0LTguMzY1NjMsMTQuODMxMi0xOC43MjYyNSwyNy4xODc1LTMxLjA4MTg3LDE4Ljk4OTk4LTE4Ljk5MDYxLDMyLjA3ODctMzQuOTY0MDgsMzkuMjY2MjItNDcuOTIwMzMsNy4xODc1Mi0xMi45NTY4OSwxMC43ODEyNS0yNy4zNjgxNCwxMC43ODEyNS00My4yMzM3OCwwLTI4Ljk0MTg4LTkuNzgzNzMtNTIuNTk1NjctMjkuMzUxMjMtNzAuOTYxMjctMTkuNTY2ODgtMTguMzY1NjUtNDQuNzM1MDEtMjcuNTQ4NDUtNzUuNTA0MzctMjcuNTQ4NDUtMjEuMjk4MTEsMC00MC43ODEyNSw0LjgxOTY4LTU4LjQ0OTM4LDE0LjQ1OTA0LTE3LjY2ODc2LDkuNjM5MzYtMzEuODE1NjEsMjMuNjQxODMtNDIuNDQwNjEsNDIuMDA3NDgtMi4zMDc1LDQuMTM1MDQtMi41ODM3Niw4LjU0NjI4LS44Mjg3NSwxMy4yMzM3OHM1LjAxMjIsNy44NzI1MSw5Ljc3MTU3LDkuNTU1MDJjNC4yNzg3NSwxLjY4MjUxLDguODM0MDcsMS44MDI4NSwxMy42NjU5MywuMzYwOTUsNC44MzE4Ny0xLjQ0MjQ3LDguNzg2MjMtNC4xNTkwNywxMS44NjMxMi04LjE0OTY4LDguMzE3NTEtMTAuNjczMTYsMTcuODQ4NzUtMTkuNDM1MDQsMjguNTkzNzUtMjYuMjg1NjUsMTAuNzQ0OTctNi44NTEyMywyMi44NzIxNi0xMC4yNzY4NSwzNi4zODE1Ny0xMC4yNzY4NVoiLz48L3N2Zz4=";

    document.querySelector(".side-controls").append(img);
  } else {
    const clone = img.cloneNode();
    clone.addEventListener("click", randomElementButton, true);
    img.replaceWith(clone);
  }
});

function pickRandomElement(list) {
  const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];

  if (list.length < 255) {
    const filtered = list.filter((x) => !x.hidden && x.text.length < 30);
    return choice(filtered) || choice(list);
  } else {
    for (let tries = 0; tries < 69; tries++) {
      const element = choice(list);
      if (!element.hidden && element.text.length < 30)
        return element;
    }

    return choice(list);
  }
}

function placeInstance(element) {
  const IC = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0];
  const instance = {
    id: IC.instanceId++,
    ...element,
    disabled: false,
    left: 0, top: 0,
    offsetX: 0.5, offsety: 0.5
  }

  IC.selectedInstance = instance;
  IC.instances.push(instance);

  IC.$nextTick(() => {
    const position = Math.random() * Math.PI * 2;
    const radius = 80;

    IC.setInstancePosition(instance, 0, 0);
    IC.setInstancePosition(
      instance,
      radius * Math.cos(position) + (window.innerWidth - IC.sidebarSize) / 2 - instance.elem.offsetWidth / 2,
      radius * Math.sin(position) + window.innerHeight / 2 - instance.elem.offsetHeight / 2
    );

    IC.setInstanceZIndex(instance, instance.id);
    IC.calcInstanceSize(instance);
  });

  return instance;
}

let lastQuickCraftAt = 0;

function randomElementButton(e) {
  const IC = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0];
  const elements =
    IC.searchResults.length ? IC.searchResults
    : IC.filteredElements.length ? IC.filteredElements
    : IC.elements;

  e.stopImmediatePropagation();
  e.stopPropagation();
  e.preventDefault();

  if (e.shiftKey) {
    if (lastQuickCraftAt + 300 > Date.now()) return;
    lastQuickCraftAt = Date.now();

    const a = placeInstance(pickRandomElement(elements));
    const b = placeInstance(pickRandomElement(elements));

    IC.playInstanceSound();
    IC.$nextTick(() => {
      IC.setInstancePosition(
        b,
        a.left + a.elem.offsetWidth / 2 - b.elem.offsetWidth / 2,
        a.top + b.elem.offsetHeight
      );

      IC.craft(a, b);
    });
  } else {
    IC.playInstanceSound();
    placeInstance(pickRandomElement(elements));
  }
}
