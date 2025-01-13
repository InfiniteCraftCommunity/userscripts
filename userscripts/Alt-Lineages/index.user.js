// ==UserScript==
//
// @name            Alternative Lineages
// @namespace       gameroman.pages.dev
//
// @match           https://infinibrowser.wiki/item*
//
// @grant           none
//
// @version         1.0
// @author          GameRoMan
// @description     Adds alternative lineages to InfiniBrowser
//
// @downloadURL		http://gameroman.pages.dev/userscripts/infinite-craft/users/gameroman/alt-lineages/index.user.js
// @updateURL		http://gameroman.pages.dev/userscripts/infinite-craft/users/gameroman/alt-lineages/index.user.js
//
// @supportURL      https://discord.gg/YHEmKEcQjy
// @homepageURL     https://discord.gg/YHEmKEcQjy
//
// @license         MIT
//
// ==/UserScript==


(function() {
    async function loadLineages() {
        const element = (window.location.search)
                        ? (window.location.href.split('=')[1])
                        : (window.location.href.split('/')[4]);

        return fetch('https://gl.githack.com/gameroman/infinibrowser/-/raw/main/lineages/verified.json')
            .then(res => res.json())
            .then(data => data[element] ?? [])
    }

    function init(lineages) {
        const altLineagesButton = document.createElement('button');
        altLineagesButton.className = 'navbtn';
        altLineagesButton.dataset.id = 'alternative_lineages_section';
        altLineagesButton.textContent = `Alternative Lineages (${lineages.length})`;
        document.querySelector('div.nav').appendChild(altLineagesButton);

        const altLineagesSection = document.createElement('section');
        altLineagesSection.id = 'alternative_lineages_section';
        altLineagesSection.style.display = 'none';

        const altLineagesSectionCaption = document.createElement('h3');
        altLineagesSectionCaption.textContent = 'Alternative Lineages';
        altLineagesSection.appendChild(altLineagesSectionCaption);

        if (lineages.length) {
            const altLineagesDiv = document.createElement('div');

            for (let lineage of lineages) {
                let lineageDiv = document.createElement('div');
                lineageDiv.className = 'item';
                lineageDiv.textContent = `${lineage.steps} steps`;

                lineageDiv.addEventListener('click', () => {
                    const newTab = window.open(lineage.lineage, '_blank');

                    if (newTab) {
                        newTab.focus();
                    }
                });

                altLineagesDiv.appendChild(lineageDiv);
            }
            altLineagesSection.appendChild(altLineagesDiv);
        } else {
            const noAltLineagesSpan = document.createElement('span');
            noAltLineagesSpan.className = 'noaltlineages';
            noAltLineagesSpan.textContent = 'No alternative lineages';
            altLineagesSection.appendChild(noAltLineagesSpan);
        }

        document.querySelector('body > main').appendChild(altLineagesSection);
    }

    let req = loadLineages();

    window.addEventListener("load", async () => {
        if (window.location.pathname.startsWith("/item")) {
            const lineages = await req;
            init(lineages);
        }
    });
})();
