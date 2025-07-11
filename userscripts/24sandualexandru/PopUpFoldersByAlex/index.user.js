// ==UserScript==
// @name        Pop Up folders by Alex
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.5
// @author      -
// @description 7/2/2025, 10:33:18 PM
// ==/UserScript==
window.addEventListener("load", async () => {
  let folders = ["alphabets", "diverse"];
  let foldersSize=200;
  let folderSizes={"alphabets":200,"diverse":100};
	let currentFolder = null;
	let mode = 0;
	let folderDiv = null;
	let previousmode = null;
	const NoneMode = 0;
	let hidden = 1;
	let dropMenu = null;
	let ThemeButton = null;
	let selectedPrompt = null;
	let foldersData = {};
	let ParentSource = null;
	let openFolder = true;
  var openedFolders=0;
 	let parentF = document.querySelector(".container");
  let currentFolderName="diverse";
  let openFolders=[];
  let folderImageUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAABH9SURBVHic7d1tsFx1fcDx3//s3gdIomZSEFCEGALSPCjVF63t1Am2Vh2pIkHtdGxpdcaOVp1prbZvOrxoZ2x9qA+dtuJo1c50Ol5iAGmjomF8fGGZAklQkyBaC4pVqpAAyc3d/fcFCQTIw02yu2fv/X0+L5K5u+ee/b3a871n/3tOBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwMJW2nzxevvlZ851mkuaGhfVKBdFiYtKjTNrxJKIWB6P/D/Z5owMzJ6ImIuIB0uNn9SIH0dT7y21ubNG3Nlv+rsmHl6xo7zgmgNtDwqQwUgDoN5y2em9yanfrCUubSI21Ii1o56BsTYbEdsi6n9GNF/u9OduLs/d/L9tDwWwGA394Fvr1c3cjh2/Xkr9/ajliohYNuzXZNGoJWJ7v9Tramk2T66Zua3tgQAWi6EFQP3eVdP9B/f+Ya3xjohYOazXIY8asbuJ8smm3/tkee5n7m57HoCFbOABUG+57PT+1NSba8SfRMTZg94/REQvIj5Xm/L+iTUzW9seBmAhGmgAzG3b+Moo8cGIOG+Q+4WjKRG31Sjv7qxdM1PK1f225wFYKAYSAPXW153f6859OCJeMYj9wYkqEdtrrX/ZWbfp+lKitj0PwLg75QCY23bFq6KUj8cjX9uDtn2z35S3Tq6Z+WbbgwCMs5MOgLr7ZVO9h5e8L0q8ZZADwQD0osY/dSZn/6I854Y9bQ8DMI5OKgDqty9f0Zvr3hhRf3nQA8EA/Xet9Y0T6zd9se1BAMbNCQdA3f66c+fiwOdLlIuHMRAMWK0RH+5OP/jOsnrL/raHARgXJxQAddsVz+mV+EJEOXdYA8GQ3NKp9bVl/aa72h4EYBzMOwDq9ted24sDX3fwZwH7eY3ymol1Mze1PQhA25r5bFS/ffmKuTjweQd/Frinlahbets3vrXtQQDadtwAqLtfNtWb697oM38WiU6N+NCBHRvfXasbUQF5HTcAeg8veZ/V/iw2pca7ejs2/kOtV8/rLBjAYnPMN7+5O67c6Hv+LGJ/1Ltj+8ecCQAyOuob38HL+94WEU8d4TwweqX+fXftJusCgFSOegbg4LX9HfxZ/Gr54wPbr/irtscAGKUjngE4eH3/zaMeBtpUanlTZ/3MNW3PATAKTwqAestlp/empr4VbulLPrO1lpdMrJ/5ctuDAAzbkz4C6E9NvyUc/MlpspT6mbrtime3PQjAsD3uDMDBO/zdFSXOaWsgaFuJcnuzf98Lyws++1DbswAMy+POAPT3L3mDgz/Z1ajP7U1PfrTtOQCG6dEzALVe3fR27LgzIla2OA+Mjea+H0a5/ydtjwEsXLMR5cGI+rOI2BsRP46ouyKa70TUndGUW8tlu37a1nCPBsCBHa/eUGqzta1BYPzUaO79fpSHHmh7EGBx6kfE9ihla0TdGssOfLFs+P6+Ub34owEwt33jxyPiD0b1wrAg9HrRuWdXxNxs25MAi9/9EfXT0TSfilfs+nopUYf5YiUion7jytN6y+qPwoV/4EnK7L5o7tkdUfttjwLksTtq+duYnfhUec0dQ/kLpImI6C2tLwkHfziiOjkd/TOe2fYYQC6ro9SPxtTsd+t1q99Wbz5/etAv0ERE1BKXDnrHsJjUpcujPvWMtscA8nlmlPhgPDCxo16/6qWD3HFz8J8Ng9wpLEb9FWdHPf0pbY8B5LQqotlSr1t9bf3shc8YxA5Lvf3yM3tN5944xp0BgYN6c9G5Z7dFgUCb7osSV5Xf3n3jqeykmes0l4SDP8xPpxv9s1ZGlKPeSBNg2FZEjRvq9Re8t37k+RMnu5OmqXHRIKeCxc6iQGAMlIjyp3HWAzfVzec/7WR20NQoAgBOkEWBwJh4UTQTX6ubLjjhv0qaiHLhMCaCxa6/4pyo00vbHgNgTXTLV+rmC1adyC81JeKsYU0Ei13/6edHdCfbHgNgZTTlprrp4rPn+wtNjbpsmBPBotbpWBQIjIuV0Zn7Qr3xWcvns3ETEQIAToFFgcDYKLE2elOb5/PtgCYifIgJp8iiQGCMvCjOeuCvj7dRExE+wIQBcKVAYIy8o95wwSuPtYEPLmFgSvTPeJZFgcA4KFHLx4512WABAINkUSAwPlZEP/7uaE96l4IBsygQGB/1ynrdhS8/0jMCAIbAokBgbJT6gfofF0w98WEBAENiUSAwJlbHbPPGJz4oAGBoLAoExkSp76qfXvO4NyMBAMNkUSAwHs6N6f2vP/wB70owZBYFAmOhxjtrjXLoRwEAI2BRINC+cmFcv+pXDv0kAGBEHlkU6NYbQItK8+jHAAIARqZE/4zzLAoEWlRee+grgQIARsmiQKBVdXnMNZdGCAAYOYsCgVbVuiFCAEArLAoEWlPKpRERZW77xtr2LJBTjebe70V5aE/bgwC59GP/5BnOAEBrLAoEWtHE9NzzBAC0yaJAoA21d5F3HWiZRYHA6BUBAOPAokBgtAQAjA1XCgRGp54lAGBsWBQIjMwyAQDjxKJAYDSe4l0GxoxFgcAICAAYRxYFAkM2JQBgTFkUCAyTAICxZVEgMDwCAMaZRYHAkHhXgTFnUSAwDAIAFgCLAoFBEwCwQFgUCAySAIAFo0T/zPOiTk63PQiwCAgAWEiaTvTPfrZvBgCnTADAQtOZiN45qyImptqeBFjABAAsRN3J6J1zQdTp09ueBFigBAAsVJ1u9M9ZHf3lT4+I0vY0wAIjAGCBq8vPiv45q6JOndb2KMACIgBgEajTSx45G3DGs6wNAOal2/YAwICUEnXZ8ugtWx5l394oD9wX5aE9Ef1e25MBY0gAwCJUp5dGnV4aERFl396IfQ9FmX04YnZflH7vkSjo91ueEmiTAIBFrk4vjZheGrXtQYCxYg0AACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQkAAAgIQEAAAkJAAAICEBAAAJCQAASEgAAEBCAgAAEhIAAJCQAACAhAQAACQkAAAgIQEAAAkJAABISAAAQEICAAASEgAAkJAAAICEBAAAJCQAACAhAQAACQkAAEhIAABAQgIAABISAACQUBMRs20PAQCM1P4mIva2PQUAMFJ7mojY0/YUAMBI7WlKFAEAAImUiD1Njbi37UEAgNGpEfc2EXVX24MAACO1sylRd7Y9BQAwOqXUnU2/hAAAgET6/djZdGeb/4qI2vYwAMBI9LsT/Vub8kszPykRO9qeBgAYvlLj9nLx5vuaiIh+1K1tDwQADF+/xNaIg/cCKE0jAAAggVLrYwHQuT9uioj7W50IABi2+zt7m5sjDp0BeOHMwxGxqdWRAIDhqvHpg8f8x24HXCP+pb2JAIBhq/WxY/2jAdBdu/YrEXFXKxMBAMN2Z3f9tV879MOjAVDK1f0S5b3tzAQADFOp5T2lPHbdn+bwJ5vpvR+PGj8c/VgAwBDd3Zy295OHP/C4ACirt+wvJd4/2pkAgGEqUd9TVm/Zf/hjzRM3avbv/8co9fsjmwoAGKL63Wbpsmue+OiTAqC84LMPRb+8eTRDAQDD1by9rPzEvic9eqRNu+uv3RI1bhj+UADAEG3urpv59yM9ccQAiIjodMpbI+LnQxsJABimn3Wi+/ajPXnUAChrZn4QEa8PtwoGgIWmRpQ3lHX/9j9H2+CoARAR0V137Y014sODnwsAGJZa4wPddTObj7XNMQMgIqI7/eA7I+IbA5sKABieEl/tdsqfH2+z4wZAWb1lf2d/eXmJcvtgJgMAhqHUuKNTyqvKmpnZ4247353W2658Rq9Tvx4R553SdADAMNzdacqvHlzDd1zHPQNwSHnezD2dfvmtiJjXjgGAkflBp9d58XwP/hEncAbgkPqtV5/d7zWfqxHrT/R3AYDBqhHf6kb3pcda8X8k8z4DcEj5xc/8qGnKhrAwEADaVeKr3Tr5ayd68I84iQCIiChrZv6v89OfvqiW+JtwnQAAGLVaIz7UKeU3yvp//dnJ7OCEPwJ4orltG18ZJf45Ipaf6r4AgON6IGq8sbv+2plT2clJnQE4XHf9tdd3Ov1L3DsAAIZucye6a0/14B8xgDMAh5vbvvEVEfGhiFg5yP0CQHJ3RZS3He3GPidjoAEQEVG/ceVp/afUN9Ua74iIZwx6/wCQyN0lynubpUs+cqRb+p6KgQfAIXX3y6b6Dy+5qpb6ZxFl1bBeBwAWoTtLLe9pOvGJ+VzV72QMLQAON7vtyueXUn+vRPxuRKwYxWsCwAJzf0S9odb4VHfdpi+VMtxv2Y0kAA6p37tqurf3wRfXWl/clNhw8GJCp7wQEQAWoH6pcXu/qTeXfnyps2zZ1kGf5j+WkQbAE9Wdv/MLc7NzlzSlf2GNeE7UclGJcmaNuiwinhYRSyNiss0ZAeAkzUbE3oj4eYmyp0b9cZS6q0R8p9+Pnd2J/q3l4s33tT0kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAQvX/S8JD560WF9UAAAAASUVORK5CYII="
function moveToFront(arr, element) {
  const index = arr.indexOf(element);
  if (index > -1) {
    arr.splice(index, 1);         // Remove the element
    arr.unshift(element);         // Add it to the front
  }
  return arr;
}

 	function confirmPrompt(doStuff, extraPrompt = "") {
		let parent = document.querySelector(".container");

		let dialog = document.createElement("dialog");
		let label = document.createElement("label");

		let saveButton = document.createElement("button");
		let closeButton = document.createElement("button");
		label.textContent = "Confirm or cancel " + extraPrompt;
		closeButton.textContent = "Close without saving";
		saveButton.textContent = "Confirm";

		saveButton.style.float = "right";
		closeButton.style.float = "left";
		saveButton.addEventListener("click", function () {
			dialog.close();
      doStuff();
		});

		closeButton.addEventListener("click", function () {
			dialog.close();
		});
		dialog.appendChild(label);
		dialog.appendChild(document.createElement("br"));
		dialog.appendChild(document.createElement("br"));

		dialog.appendChild(saveButton);
		dialog.appendChild(closeButton);

		dialog.style.position = "absolute";
		dialog.style.top = "33%";
		dialog.style.left = "25%";
		dialog.style.background = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--background-color").trim();
		dialog.style.color = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();

		parent.appendChild(dialog);
		dialog.showModal();
	}

	function initTheAlphabeth() {
		let alphabetData = {
			a: [
				{
					emoji: "🅰️",
					text: '"a"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(0, 127, 255) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 46; height: 43px; width: 80px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(0, 127, 255); border-width: 2px; --shadow-rgb: rgb(0,127,255);",
				},
				{
					emoji: "🅱️",
					text: '"b"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(139, 69, 19) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 54; height: 43px; width: 81px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(139, 69, 19); border-width: 2px; --shadow-rgb: rgb(139,69,19);",
				},
				{
					emoji: "🇨",
					text: '"c"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(220, 20, 60) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 62; height: 43px; width: 61px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(220, 20, 60); border-width: 2px; --shadow-rgb: rgb(220,20,60);",
				},
				{
					emoji: "🇩",
					text: '"d"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(240, 225, 48) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 66; height: 43px; width: 64px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(240, 225, 48); border-width: 2px; --shadow-rgb: rgb(240,225,48);",
				},
				{
					emoji: "🇪",
					text: '"e"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(80, 200, 120) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 74; height: 43px; width: 60px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(80, 200, 120); border-width: 2px; --shadow-rgb: rgb(80,200,120);",
				},
				{
					emoji: "🇫",
					text: '"f"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(217, 2, 125) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 78; height: 43px; width: 57px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(217, 2, 125); border-width: 2px; --shadow-rgb: rgb(217,2,125);",
				},
				{
					emoji: "🇬",
					text: '"g"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(128, 128, 128) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 82; height: 43px; width: 63px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(128, 128, 128); border-width: 2px; --shadow-rgb: rgb(128,128,128);",
				},
				{
					emoji: "🤔",
					text: '"h"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(223, 115, 255) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 90; height: 43px; width: 81px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(223, 115, 255); border-width: 2px; --shadow-rgb: rgb(223,115,255);",
				},
				{
					emoji: "👁️",
					text: '"i"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(75, 0, 130) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 95; height: 43px; width: 75px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(75, 0, 130); border-width: 2px; --shadow-rgb: rgb(75,0,130);",
				},
				{
					emoji: "🇯",
					text: '"j"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(0, 168, 107) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 99; height: 43px; width: 53px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(0, 168, 107); border-width: 2px; --shadow-rgb: rgb(0,168,107);",
				},
				{
					emoji: "👍",
					text: '"k"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(195, 176, 145) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 103; height: 43px; width: 78px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(195, 176, 145); border-width: 2px; --shadow-rgb: rgb(195,176,145);",
				},
				{
					emoji: "👍",
					text: '"l"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(220, 208, 255) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 107; height: 43px; width: 73px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(220, 208, 255); border-width: 2px; --shadow-rgb: rgb(220,208,255);",
				},
				{
					emoji: "🆖",
					text: '"n"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(0, 0, 128) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 111; height: 43px; width: 80px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(0, 0, 128); border-width: 2px; --shadow-rgb: rgb(0,0,128);",
				},
				{
					emoji: "🇲",
					text: '"m"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(255, 0, 144) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 112; height: 43px; width: 72px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(255, 0, 144); border-width: 2px; --shadow-rgb: rgb(255,0,144);",
				},
				{
					emoji: "👌",
					text: '"o"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(255, 165, 0) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 116; height: 43px; width: 73px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(255, 165, 0); border-width: 2px; --shadow-rgb: rgb(255,165,0);",
				},
				{
					emoji: "🅿️",
					text: '"p"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(160, 32, 240) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 120; height: 43px; width: 81px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(160, 32, 240); border-width: 2px; --shadow-rgb: rgb(160,32,240);",
				},
				{
					emoji: "❓",
					text: '"q"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(81, 65, 79) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 124; height: 43px; width: 72px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(81, 65, 79); border-width: 2px; --shadow-rgb: rgb(81,65,79);",
				},
				{
					emoji: "🤔",
					text: '"r"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(255, 0, 0) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 128; height: 43px; width: 78px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(255, 0, 0); border-width: 2px; --shadow-rgb: rgb(255,0,0);",
				},
				{
					emoji: "🐍",
					text: '"s"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(250, 128, 114) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 132; height: 43px; width: 78px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(250, 128, 114); border-width: 2px; --shadow-rgb: rgb(250,128,114);",
				},
				{
					emoji: "🕒",
					text: '"t"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(0, 128, 128) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 140; height: 43px; width: 77px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(0, 128, 128); border-width: 2px; --shadow-rgb: rgb(0,128,128);",
				},
				{
					emoji: "👍",
					text: '"u"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(4, 55, 242) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 145; height: 43px; width: 78px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(4, 55, 242); border-width: 2px; --shadow-rgb: rgb(4,55,242);",
				},
				{
					emoji: "❌",
					text: '"x"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(241, 180, 47) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 149; height: 43px; width: 80px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(241, 180, 47); border-width: 2px; --shadow-rgb: rgb(241,180,47);",
				},
				{
					emoji: "🤔",
					text: '"y"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(255, 255, 0) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 153; height: 43px; width: 80px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(255, 255, 0); border-width: 2px; --shadow-rgb: rgb(255,255,0);",
				},
				{
					emoji: "🤔",
					text: '"z"',
					span: true,
					spanCss: "color: color-mix(in srgb, rgb(0, 20, 168) 40%, rgb(255, 255, 255));",
					style:
						"translate: 0px; z-index: 157; height: 43px; width: 80px; border-radius: 10px; animation: auto ease 0s 1 normal none running none; transition: none 0s ease 0s; box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb,var(--shadow-rgb),  transparent 70%),\n			 inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%); border-color: rgb(0, 20, 168); border-width: 2px; --shadow-rgb: rgb(0,20,168);",
				},
			],
		};
		let alpbabethFolder = alphabetData["a"];
		console.log("alphanumerics:", alpbabethFolder);
		console.log("folderStruct", foldersData);
    	if (folders.includes("diverse"))
        if (!("diverse" in foldersData)) foldersData["diverse"] = [];
		if (folders.includes("alphabets")) {
			if (!("alphabets" in foldersData)) foldersData["alphabets"] = [];

			for (let elm of alpbabethFolder) {
				console.log("elm", elm);
				console.log(
					"filterd:",
					foldersData["alphabets"].filter((item) => item.text == elm.text)
				);
				if (foldersData["alphabets"].filter((item) => item.text == elm.text).length == 0) {
					console.log("this is true");
					foldersData["alphabets"].push(elm);
				}
			}
			localStorage.setItem("folderStructure", JSON.stringify(foldersData));
			// buildFolder();
		}

	}

	function getElementToSave(cloneElement, discovered = false) {
		let text = "";
		let spanCss = "";

		let span = false;

		text = cloneElement.childNodes[1]?.textContent?.trim();

		if (cloneElement.querySelector(".addspan")) {
			span = true;
			spanCss = cloneElement.querySelector(".addspan").style.cssText;
      text="";
      var spans=Array.from(cloneElement.childNodes);
       spans=spans.slice(1);
      for(let span of spans)
       {
         text+=span.textContent;
       }

		}

		console.log("text is:", text);

		let elementToSave = {
			emoji: cloneElement.childNodes[0]?.textContent?.trim(),
			text: text,
			discovered: discovered,
			span: span,
			spanCss: spanCss,
			style: cloneElement.style.cssText,
		};
		return elementToSave;
	}

	function AtIntersection(element1, element2, parentElement) {
		console.log("intersection happends");

		const rect1 = element1.getBoundingClientRect();
		const rect2 = element2.getBoundingClientRect();
    const rect3= parentElement.getBoundingClientRect();
		console.log("atinter el1", element1);

		if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y)
    if (rect1.x < rect3.x + rect3.width && rect1.x + rect1.width > rect3.x && rect1.y < rect3.y + rect3.height && rect1.y + rect1.height > rect3.y)
    {
			let cloneElement = element1.cloneNode(true);
      	let discovered = false;

			if (cloneElement.classList.contains("instance-discovery")) {
				discovered = true;
			}


     let	elementToSave = getElementToSave(cloneElement, discovered);
     let  item=elementToItemSimple(elementToSave);

      var added=false;
			if  (currentFolderName in foldersData) {
     	var found=foldersData[ currentFolderName].find(x=>x.text==elementToSave.text)
      if(found==null)
        {
          			foldersData[ currentFolderName].push(elementToSave);
                added=true;
        }
			} else {
				foldersData[currentFolderName] = [];
				foldersData[currentFolderName].push(elementToSave);
        added=true;
			}
         if(added){
			localStorage.setItem("folderStructure", JSON.stringify(foldersData));

			 item.addEventListener("mousedown",async (e) => {
				let element = getElementToSave(cloneElement, discovered);
				console.log("element:", element);

				console.log(e);

				if (e.shiftKey) {
					foldersData[currentFolderName] = foldersData[currentFolderName].filter((item2) => item2.text != element.text);
					localStorage.setItem("folderStructure", JSON.stringify(foldersData));
					updateAndShowDialog();
				} else {
					console.log("hello405", element);
          const randoms = getRandomPositionXY(0, 800,(document.querySelector("#sidebar").getBoundingClientRect().left/2-150),400,100,500);



            let source=IC.getItems().find(x=>x.text==element.text);
					var inst=await IC.createInstance({
						"text": element.text,
						"emoji": element.emoji,
            "itemID":source.id,
            "discovery":element.discovered,
						"x": randoms[0],
						"y": randoms[1]
					})

          inst.element.style.zIndex="2";

				}
			});


			element2.appendChild(item);
         }
		}
	}
function elementToItemSimple(element)
  {
    	let item = document.createElement("div");

		item.classList.add("item");
    if(element.discovered)
     {
       	item.classList.add("item-discovery");
     }


		const itemEmoji = document.createElement("span");
		itemEmoji.classList.add("item-emoji");
		itemEmoji.appendChild(document.createTextNode(element.emoji ?? "⬜"));

		item.appendChild(itemEmoji);
		//item.style.cssText = element.style;

		if (element.span == false) {
			item.appendChild(document.createTextNode(` ${element.text} `));
		} else {
			let text = "";
			for (const char of element.text) {
				if (char >= "A" && char <= "Z") {
					text += char;
				} else {
					if (char == '"') {
						if (text != "") {
							item.appendChild(document.createTextNode(text));
							text = "";
						}

						let spn = document.createElement("span");
						spn.classList.add("addspan");
						spn.textContent = '"';
						spn.style.cssText = element.spanCss;
						item.appendChild(spn);
					} else {
						text += char;
					}
				}
			}
			if (text != "") {
				item.appendChild(document.createTextNode(text));
				text = "";
			}
		}
		item.style.display = "inline-block";

		return item;

  }
	function elementToItem(element, folderName = null, folderInstance = null) {
		let item = document.createElement("div");
   if(element.discovered)
     {
       	item.classList.add("item-discovery");
     }

		item.classList.add("item");
		const itemEmoji = document.createElement("span");
		itemEmoji.classList.add("item-emoji");
		itemEmoji.appendChild(document.createTextNode(element.emoji ?? "⬜"));

		item.appendChild(itemEmoji);
		//item.style.cssText = element.style;

		if (element.span == false) {
			item.appendChild(document.createTextNode(` ${element.text} `));
		} else {
			let text = "";
			for (const char of element.text) {
				if (char >= "A" && char <= "Z") {
					text += char;
				} else {
					if (char == '"') {
						if (text != "") {
							item.appendChild(document.createTextNode(text));
							text = "";
						}

						let spn = document.createElement("span");
						spn.classList.add("addspan");
						spn.textContent = '"';
						spn.style.cssText = element.spanCss;
						item.appendChild(spn);
					} else {
						text += char;
					}
				}
			}
			if (text != "") {
				item.appendChild(document.createTextNode(text));
				text = "";
			}
		}
		item.style.display = "inline-block";
		item.addEventListener("mousedown", (e) => {
			console.log(e);
			if (folderName == null) folderName = folders[mode];
			if (!e.shiftKey) {
				console.log("hello458", element);

				const randoms=getRandomPositionXY(0, 800,(document.querySelector("#sidebar").getBoundingClientRect().left/2-150),400,100,500);
         let source=IC.getItems().find(x=>x.text==element.text);
				IC.createInstance({
					"text": element.text,
					"emoji": element.emoji,
          "itemId":source.id,
          "discovery":element.discovered,
					"x": randoms[0],
					"y": randoms[1],
				})
			} else {
				foldersData[folderName] = foldersData[folderName].filter((item) => item.text != element.text);
				localStorage.setItem("folderStructure", JSON.stringify(foldersData));
	    	updateAndShowDialog();


			}
		});
		return item;
	}


	function getRandomPosition(min, max,bl=-1,bw=-1) {

    let value= Math.floor(Math.random() * (max - min + 1)) + min;
     if(bl!=-1 && bw!=-1)
     {

       while(value>=bl && value<=bl+bw)
             value= Math.floor(Math.random() * (max - min + 1)) + min;

     }

		return value;
	}
  	function getRandomPositionXY(min, max,bl=-1,bw=-1,bt=-1,bh=-1) {

    let valueX= Math.floor(Math.random() * (max - min + 1)) + min;
    let valueY= Math.floor(Math.random() * (max - min + 1)) + min;
     if(bl!=-1 || bw!=-1 || bt!=-1 || bh!=-1)
     {

       while(valueX>bl && valueX<bl+bw && valueY>bt && valueY<bt+bh)
         {
             valueX= Math.floor(Math.random() * (max - min + 1)) + min;
             valueY= Math.floor(Math.random() * (max - min + 1)) + min;
         }
     }

		return [valueX,valueY];
	}
	function initFolders() {
		if (localStorage.getItem("foldersNames") != null) {
			folders = JSON.parse(localStorage.getItem("foldersNames"));
      openFolders=folders.slice();
		}else
      {
        folders=["diverse","alphabets"];
        openFolders=folders.slice();
        localStorage.setItem("foldersNames",JSON.stringify(folders));
      }
if (localStorage.getItem("foldersContainerSize") != null) {
			foldersSize = JSON.parse(localStorage.getItem("foldersContainerSize"));
		}
		if (localStorage.getItem("folderStructure") != null) {
			foldersData = JSON.parse(localStorage.getItem("folderStructure"));
			console.log(foldersData);
		} else {
			foldersData = {"diverse":[],"alphabets":[]};
		}
if (localStorage.getItem("folderSizes") != null) {
			folderSizes = JSON.parse(localStorage.getItem("folderSizes"));
		}
		const instanceObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				console.log("mutation:", mutation);
				if (mutation.addedNodes.length > 0) {
					for (const node of mutation.addedNodes) {
						if (node.id != "instance-0" && !node.classList.contains("background-instance")) {
							node.addEventListener("mouseup", (event) => {
								console.log(event.clientX, event.clientY);
								for (let folder of document.querySelectorAll(".folderContent")) AtIntersection(node, folder);
							});
						}
					}
				}
			}
		});
	const instanceObserver2 = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				console.log("mutation:", mutation);
				if (mutation.addedNodes.length > 0) {
					for (const node of mutation.addedNodes) {
						if (node.id != "instance-0" && !node.classList.contains("background-instance")) {
							node.addEventListener("mouseup", (event) => {
								console.log(event.clientX, event.clientY);
								for (let folder of document.querySelectorAll(".folderContent")) AtIntersection(node, folder,document.querySelector(".popupFolders"));
							});
						}
					}
				}
			}
		});

		instanceObserver.observe(document.getElementById("instances"), {
			childList: true,
			subtree: true,
		});
		instanceObserver2.observe(document.getElementById("instances-top"), {
			childList: true,
			subtree: true,
		});

	}
  function updateAndShowDialog()
  {  console.log("init folders");
     let mockDialog=document.querySelector(".popupFolders");
      if(mockDialog==null)
      {
        mockDialog=document.createElement("div");
        mockDialog.classList.add("popupFolders");
        mockDialog.style.position="absolute";
        mockDialog.style.top=(100).toString()+"px";
        mockDialog.style.left=(document.querySelector("#sidebar").getBoundingClientRect().left/2-150).toString()+"px";
        mockDialog.style.borderColor="white";
       // mockDialog.style.zIndex="1";
        mockDialog.style.width="520px";
        mockDialog.style.height="450px";
        mockDialog.style.overflowY="hidden";
        mockDialog.style.border="solid 3px var(--border-color)";
        mockDialog.style.transition="background-color 1000ms linear";
        mockDialog.style.backgroundColor="black";
        mockDialog.style.resize="both";
         document.querySelector(".container").appendChild(mockDialog);
        mockDialog.style.zIndex="11";
      }
       mockDialog.innerHTML="";

          let folderTitlesBar=document.createElement("div");
          let actionsBar=document.createElement("div");
          let content=document.createElement("div");
          content.classList.add("folderContent");

          mockDialog.appendChild(folderTitlesBar);
          mockDialog.appendChild(actionsBar);
          mockDialog.appendChild(content);

          mockDialog.style.resize="both";
          content.style.width="500px";
          mockDialog.style.display="flex";
          mockDialog.style.flexDirection="column";
          content.style.overflowY="auto";
          content.style.flex="1";
         mockDialog.addEventListener('wheel', (e) => {
          console.log("wheel")
          content.scrollTop = e.deltaY;
         });


	    //    content.style.resize="both";
      for (let el of foldersData[currentFolderName]) {
				let item = elementToItem(el, currentFolderName, content);
				content.appendChild(item);
			}
    //add rest of buttons:
   		let cleanP = document.createElement("span");
			let deleteFolderP = document.createElement("span");
			let closeWindow = document.createElement("span");
      let randomButton=document.createElement("span");

      actionsBar.appendChild(cleanP);
      actionsBar.appendChild(deleteFolderP);
      actionsBar.appendChild(closeWindow );
      actionsBar.appendChild(randomButton);
      actionsBar.style.height="30px";
      actionsBar.style.backgroundColor="var(--border-color)";



			closeWindow.style.float = "left";
			closeWindow.style.fontSize = "x-large";
			closeWindow.textContent = "❌";
			closeWindow.style.marginLeft = "10px";
			closeWindow.addEventListener("mouseover", function () {
				console.log("over maximize");
				closeWindow.style.textShadow = "red 2px 0 20px";
				closeWindow.style.backgroundColor = "red";
			});
			closeWindow.addEventListener("mouseout", function () {
				closeWindow.style.textShadow = "";
				closeWindow.style.backgroundColor = "transparent";
			});

			closeWindow.addEventListener("click", function () {

      openFolders= openFolders.slice(0, openFolders.indexOf(currentFolderName)).concat(openFolders.slice(openFolders.indexOf(currentFolderName) + 1));
      currentFolderName=openFolders[0];
      updateAndShowDialog();

			});


      randomButton.style.float = "left";
      randomButton.style.fontSize = "x-large";
		  randomButton.textContent = "❔";
      randomButton.style.marginLeft = "10px";
      randomButton.addEventListener("mouseover", function () {
				console.log("over random");
			  randomButton.style.textShadow = "red 2px 0 20px";
				randomButton.style.backgroundColor = "red";
			});
			randomButton.addEventListener("mouseout", function () {
				randomButton.style.textShadow = "";
				randomButton.style.backgroundColor = "transparent";
			});
	  randomButton.addEventListener("click", function () {
      if(foldersData[currentFolderName]!=null && foldersData[currentFolderName].length>0)
        {
      var element=foldersData[currentFolderName][Math.floor(Math.random() *  foldersData[currentFolderName].length)];
       let source=IC.getItems().find(x=>x.text==element.text);
					const randoms = getRandomPositionXY(0, 800,(document.querySelector("#sidebar").getBoundingClientRect().left/2-150),400,100,500);
					IC.createInstance({
						"text": element.text,
						"emoji": element.emoji,
            "itemId":source.id,
						"x": randoms[0],
						"y": randoms[1]
					})
        }
			});


			cleanP.style.float = "right";
			deleteFolderP.style.float = "right";
			cleanP.style.fontSize = "x-large";
			deleteFolderP.style.fontSize = "x-large";
			cleanP.textContent = "🧹 ";
			deleteFolderP.textContent = "🗑️";

			cleanP.addEventListener("mouseover", function () {
				cleanP.style.textShadow = "red 1px 0 20px";
			});

			deleteFolderP.addEventListener("mouseover", function () {
				deleteFolderP.style.textShadow = "red 1px 0 20px";
			});
			cleanP.addEventListener("mouseout", function () {
				// cleanP.style.color="transparent";
				cleanP.style.textShadow = "";
			});

			deleteFolderP.addEventListener("mouseout", function () {
				// cleanP.style.color="transparent";
				deleteFolderP.style.textShadow = "";
			});

			cleanP.addEventListener("click", function () {
				confirmPrompt(function () {

					foldersData[currentFolderName] = [];

					localStorage.setItem("folderStructure", JSON.stringify(foldersData));

				  updateAndShowDialog();
				}, "Deleting  all content");
			});
			deleteFolderP.addEventListener("click", function () {
				confirmPrompt(function () {

        if(folders.length>1)
          {

	        delete foldersData[currentFolderName];
					folders = folders.slice(0, folders.indexOf(currentFolderName)).concat(folders.slice(folders.indexOf(currentFolderName) + 1));
          if(openFolders.includes(currentFolderName))
            {
              	openFolders=openFolders.slice(0, openFolders.indexOf(currentFolderName)).concat(openFolders.slice(openFolders.indexOf(currentFolderName) + 1));
            }
				    currentFolderName=openFolders[0]!=null?openFolders[0]:folders[0];


					localStorage.setItem("folderStructure", JSON.stringify(foldersData));
					localStorage.setItem("foldersNames", JSON.stringify(folders));
          updateAndShowDialog();
          }
				}, "Deleting folder");

			});

    //Deal with folder titles
     folderTitlesBar.style.backgroundColor="var(--border-color)";
     folderTitlesBar.style.height="25px";
    let index=0;
    for(let folder of openFolders)
    {
      index++;
      if(index>3)
         break;

      let titleSpan=document.createElement("span");
      if(folder==currentFolderName)
       {
         titleSpan.style.opacity="1";
       }else
         titleSpan.style.opacity=".5";


      titleSpan.addEventListener("click",()=>{
        console.log("CLICK:",folder)
        currentFolderName=folder;
        updateAndShowDialog();


      });
      titleSpan.textContent=folder;
       let spacer=document.createElement("span");
      spacer.textContent=" / ";
       folderTitlesBar.appendChild(titleSpan);

       folderTitlesBar.appendChild(spacer);
    }
   var addSpan=document.createElement("span")
   addSpan.textContent="➕";
    addSpan.style.float="right";
    var moreSpan=document.createElement("span")
     moreSpan.textContent= "...";
  // moreSpan.style.float="right";
    var closeSpan=document.createElement("span")
    closeSpan.textContent= "❌";
   closeSpan.style.float="right";

    closeSpan.addEventListener("click",()=>{
        parentF.removeChild(mockDialog);

    })
	 moreSpan.addEventListener("mouseover", function () {
				moreSpan.style.textShadow = "white 1px 0 20px";
        moreSpan.style.backgroundColor = "white";
			});

  addSpan.addEventListener("mouseover", function () {
				addSpan.style.textShadow = "green 1px 0 20px";
        addSpan.style.backgroundColor = "green";

			});

   moreSpan.addEventListener("mouseout", function () {
				 moreSpan.style.backgroundColor = "transparent";
				 moreSpan.style.textShadow = "";
			});
   addSpan.addEventListener("mouseout", function () {
				// cleanP.style.color="transparent";
				 addSpan.style.backgroundColor = "transparent";
         addSpan.style.textShadow = "";
			});


   addSpan.addEventListener("click", function () {
			let parent = document.querySelector(".container");

			let dialog = document.createElement("dialog");
			let label = document.createElement("label");
			let input = document.createElement("input");
			let saveButton = document.createElement("button");
			let closeButton = document.createElement("button");
			label.textContent = "Choose a folder name unused";
			closeButton.textContent = "Close without saving";
			saveButton.textContent = "Save";

			saveButton.addEventListener("click", function () {
				let name = input.value;
				if (!folders.includes(name))
        {
        folders.push(name);
        openFolders.push(name);

        }

				localStorage.setItem("foldersNames", JSON.stringify(folders));
        foldersData[name]=[];
        localStorage.setItem("folderStructure", JSON.stringify(foldersData));
		    updateAndShowDialog();
				dialog.close();
			});

			closeButton.addEventListener("click", function () {

				dialog.close();
			});
			dialog.appendChild(label);
			dialog.appendChild(document.createElement("br"));
			dialog.appendChild(document.createElement("br"));
			dialog.appendChild(input);
			dialog.appendChild(document.createElement("br"));
			dialog.appendChild(document.createElement("br"));
			dialog.appendChild(saveButton);
			dialog.appendChild(document.createElement("br"));
			dialog.appendChild(closeButton);
			dialog.style.position = "absolute";
			dialog.style.top = "33%";
			dialog.style.left = "25%";
			dialog.style.background = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--background-color").trim();
			dialog.style.color = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();

			parent.appendChild(dialog);
			dialog.showModal();
		});
  closeSpan.addEventListener("mouseover", function () {
				closeSpan.style.textShadow = "red 1px 0 20px";
        closeSpan.style.backgroundColor = "red";

			});

   closeSpan.addEventListener("mouseout", function () {
				 closeSpan.style.backgroundColor = "transparent";
				 closeSpan.style.textShadow = "";
			});
  moreSpan.addEventListener("click",()=>{
    content.innerHTML="";
    for(let folder of folders)
    {
      let folderDiv=document.createElement("div");
      content.appendChild(folderDiv);
      folderDiv.style.opacity=".5";
      folderDiv.style.display="flex";
      folderDiv.style.justifyContent="center"
      folderDiv.style.alignItems="center";


      folderDiv.addEventListener("mouseover", function () {
			folderDiv.style.opacity="1";


			});

     folderDiv.addEventListener("mouseout", function () {
				 folderDiv.style.opacity=".5";
			});


      folderDiv.appendChild(document.createTextNode(folder));




      folderDiv.addEventListener("click",()=>{
        currentFolderName=folder;
        if(!openFolders.includes(folder))
         {
           openFolders.unshift(folder);
         }
         else
           {
              openFolders=moveToFront(openFolders,folder);
           }
         updateAndShowDialog();
      })
    }



  })


   folderTitlesBar.appendChild(moreSpan);
   folderTitlesBar.appendChild(closeSpan);
   folderTitlesBar.appendChild(addSpan);
   let isDragging = false;
    let offsetX, offsetY;
    folderTitlesBar.addEventListener('mousedown', (e) => {
   const grandchild = e.target.closest('span');

  // Only drag if a child is targeted, but not a grandchild
  if (!grandchild) {
    isDragging = true;
    offsetX = e.clientX - mockDialog.offsetLeft;
    offsetY = e.clientY - mockDialog.offsetTop;

     folderTitlesBar.style.cursor = 'grabbing'; // Optional visual cue
  }
});
   actionsBar.addEventListener('mousedown', (e) => {
   const grandchild = e.target.closest('span');

  // Only drag if a child is targeted, but not a grandchild
  if (!grandchild) {
    isDragging = true;
    offsetX = e.clientX - mockDialog.offsetLeft;
    offsetY = e.clientY - mockDialog.offsetTop;

      actionsBar.style.cursor = 'grabbing'; // Optional visual cue
  }
});
document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    mockDialog.style.left = `${e.clientX - offsetX}px`;
    mockDialog.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  folderTitlesBar.style.cursor = 'default';
});
window.addEventListener('wheel', (e) => {
  // Only scroll the div if it's visible and not already hovered
  if (!content.matches(':hover')) {
   content.scrollTop += e.deltaY;
    e.preventDefault(); // Optional: prevent page scroll
  }
}, { passive: false });
 content.style.scrollbarWidth="none";





  }

initFolders();
initTheAlphabeth();
  let FoldersImage=document.createElement("img");
  FoldersImage.src=folderImageUrl;
  FoldersImage.style.position="absolute";
   FoldersImage.style.height="50px";
   FoldersImage.style.width="50px";
   FoldersImage.style.bottom="5px";
   FoldersImage.style.left="100px";
  parentF.appendChild(FoldersImage);



FoldersImage.addEventListener("click",(k)=>{

     updateAndShowDialog();

});

FoldersImage.addEventListener("dblclick",(k)=>{

   confirmPrompt(()=>{
     document.querySelector(".popupFolders").parentNode.removeChild( document.querySelector(".popupFolders"));
   },"Close the folders popup")

});




});