// ==UserScript==
//
// @name            Alternative Lineages
// @namespace       roman.is-a.dev
//
// @match           https://infinibrowser.wiki/item*
//
// @version         3.0.0
// @author          GameRoMan
// @description     Adds alternative lineages to InfiniBrowser
//
// @downloadURL     https://roman.is-a.dev/userscripts/infinite-craft/users/gameroman/alt-lineages/index.user.js
// @updateURL       https://roman.is-a.dev/userscripts/infinite-craft/users/gameroman/alt-lineages/index.user.js
//
// @supportURL      https://roman.is-a.dev/discord
// @homepageURL     https://roman.is-a.dev/discord
//
// @license         MIT
//
// ==/UserScript==


(function() {
	const lineagesFile = 'both';
	// 'verified' - Verified lineages only
	// 'submitted' - User-submitted lineages only
	// 'both' - Both verified and user-submitted


	async function loadLineages(type) {
		const itemID = window.location.pathname.split('/')[2];

		return fetch(`https://ib.gameroman.workers.dev/alt-lineages/get?type=${type}&id=${itemID}`)
			.then(res => res.json())
			.catch(() => []);
	}


	async function submitLineage() {
		const statusText = document.getElementById('status-text');
		statusText.textContent = 'Loading...';
		statusText.style.color = '#777777';

		const input = document.getElementById('lineage-input').value;
		if (!input.startsWith('https://infinibrowser.wiki/item/01')) {
			document.getElementById('status-text').textContent = 'Invalid input';
			statusText.style.color = '#FFAAAA';
			return;
		}

		const lineageID = input.split('https://infinibrowser.wiki/item/')[1];
		if (lineageID.length != 26) {
			document.getElementById('status-text').textContent = 'Invalid input';
			statusText.style.color = '#FFAAAA';
			return;
		}

		document.getElementById('status-text').textContent = 'Processing...';
		statusText.style.color = '#777777';
		fetch(`https://ib.gameroman.workers.dev/alt-lineages/submit?id=${encodeURIComponent(lineageID)}`, {
			method: 'POST'
		})
			.then(response => response.json())
			.then(data => {
				if (data['OK']) {
					document.getElementById('status-text').textContent = 'Submitted successfully!';
					statusText.style.color = '#AAFFAA';
				} else {
					document.getElementById('status-text').textContent = 'Something when wrong!';
					statusText.style.color = '#FFAAAA';
				}
			})
			.catch((e) => {
				document.getElementById('status-text').textContent = 'Invalid input';
				statusText.style.color = '#FFAAAA';
			})
	}

	function closeModal() {
		document.getElementById('modal_wrapper').remove();
	}

	function openLineageModal() {
		const modalWrapper = document.createElement('div');
		modalWrapper.id = 'modal_wrapper';
		modalWrapper.className = 'modal_wrapper';
		modalWrapper.style = `
background: rgba(0,0,0,.5);
display: flex;
align-items: center;
justify-content: center;
position: fixed;
z-index: 42;
width: 100%;
height: 100%;
top: 0;
left: 0;
`;

		const modal = document.createElement('div');
		modal.id = 'modal';
		modal.className = 'modal';
		modal.style = `
padding: 1.5rem;
border-radius: 10px;
max-width: 75%;
max-height: 75vh;
min-width: 28vw!important;
overflow-y: auto;
background-color: #18181b;
border: 1px solid #525252;
display: grid;
grid-auto-rows: minmax(min-content,max-content);
gap: .5rem;
animation: .4s cubic-bezier(.175,.885,.32,1.275) show_modal;
`;

		const modalTop = document.createElement('div');
		modalTop.className = 'top';
		modalTop.style = `
display: flex;
align-items: center;
align-content: center;
width: 100%;
gap: 2rem;
`;

		const modalName = document.createElement('h2');
		modalName.textContent = 'Submit Alternative Lineage';
		modalName.style.margin = '0px';
		modalTop.appendChild(modalName);

		const closeButton = document.createElement('button');
		closeButton.className = 'close_modal';
		closeButton.addEventListener('click', closeModal);
		closeButton.style = `
padding: 0;
margin: 0 0 0 auto;
cursor: pointer;
background: 0 0;
outline: 0;
border: none;
opacity: .5;
transition: opacity .2s ease-in-out;
align-self: flex-start;
justify-self: flex-start;
`;

		const closeButtonImage = document.createElement('img');
		closeButtonImage.style.height = '2.5rem';
		closeButtonImage.style.width = '2.5rem';
		closeButtonImage.src = '/static/icon/button/close.svg';
		closeButtonImage.className = 'close_modal';
		closeButton.appendChild(closeButtonImage);

		modalTop.appendChild(closeButton);

		modal.appendChild(modalTop);

		const lineageInput = document.createElement('input');
		lineageInput.placeholder = "https://infinibrowser.wiki/item/01hsvze7xwghsx1hjrrbe7ea9r";
		lineageInput.id = 'lineage-input';
		lineageInput.style = `
resize: none;
font-size: 1rem;
font-family: "Roboto", sans-serif;
border: 1px solid #525252;
transform: translateY(2px);
border-radius: 4px;
padding: 0.5rem;
background: none;
color: #fff;
width: 475px;
`;

		modal.appendChild(lineageInput);

		const statusText = document.createElement('p');
		statusText.id = 'status-text';
		modal.appendChild(statusText);

		const submitButton = document.createElement('button');
		submitButton.textContent = 'Submit';
		submitButton.className = 'btn';
		submitButton.addEventListener('click', submitLineage);
		modal.appendChild(submitButton);

		modalWrapper.appendChild(modal);
		document.querySelector('body > main').appendChild(modalWrapper);
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

		const altLineagesSectionTopDiv = document.createElement('div');

		const altLineagesSectionCaption = document.createElement('h3');
		altLineagesSectionCaption.textContent = 'Alternative Lineages';
		altLineagesSectionCaption.style.display = 'inline';
		altLineagesSectionCaption.style.marginRight = '15px';
		altLineagesSectionTopDiv.appendChild(altLineagesSectionCaption);

		const altLineagesSubmitButton = document.createElement('button');
		altLineagesSubmitButton.className = 'btn';
		altLineagesSubmitButton.id = 'submit-alt-lineage';
		altLineagesSubmitButton.textContent = 'Submit Alt Lineage';
		altLineagesSubmitButton.style.display = 'inline';
		altLineagesSubmitButton.addEventListener('click', openLineageModal);
		altLineagesSectionTopDiv.appendChild(altLineagesSubmitButton);

		altLineagesSection.appendChild(altLineagesSectionTopDiv);

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


	window.addEventListener("load", async () => {
		if (!document.querySelector('div.nav')) return;
		if (window.location.pathname.startsWith("/item")) {
			const lineages = await loadLineages(lineagesFile);
			init(lineages);
		}
	});
})();
