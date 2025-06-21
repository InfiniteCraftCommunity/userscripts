// ==UserScript==
// @name        InfiniBinICBot
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @match       https://infinibrowser.wiki/*
// @grant       unsafeWindow
// @grant       GM.getValue
// @grant       GM.setValue
// @run-at      document-end
// @require     https://unpkg.com/wanakana
// @require     https://raw.githubusercontent.com/surferseo/intl-segmenter-polyfill/master/dist/bundled.js
// @version     1.0
// @author      -
// @description 5/1/2025, 3:41:07 AM
// ==/UserScript==
window.addEventListener("load", async () => {
    function sleep(ms = 0) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
  	function getRandomPosition(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}


    if (window.location.host == "neal.fun") {
        setInterval(async function () {
            //do lineage when state is start
            const v_container = document.querySelector(".container").__vue__;
            let currentState = await GM.getValue("state");
            if (currentState == "start") {
                GM.setValue("state", "progress");
                let recipeRaw = await GM.getValue("recipeIB");
                console.log("recipe raw", recipeRaw);
                let recipes = JSON.parse(recipeRaw);
                var instancesCreated=[];
                for (let recipe of recipes) {
                    let elm = v_container.items.find((x)=>x.text==recipe[0]);
                    let elm1 =v_container.items.find((x)=>x.text==recipe[1]);
                    try {
                        console.log("this ones:", elm, elm1);

                       var result=await v_container.craftApi(recipe[0],recipe[1]);
                      console.log("Result:"+result.text+" "+result.emoji);

                    //  IC.removeInstances(instancesCreated);

                      instancesCreated=[];
                 var randomX = getRandomPosition(400, 800);
				         var randomY = getRandomPosition(300, 600);
     	     var instEl1=await IC.createInstance({
						"text": elm.text,
						"emoji": elm.emoji,
            "itemId":elm.id,
						"x": randomX,
						"y": randomY,
					  })
            var instEl2=await IC.createInstance({
						"text": elm1.text,
						"emoji": elm1.emoji,
            "itemId":elm1.id,
						"x": randomX+100,
						"y": randomY,
					  })

           var inst=await IC.craft(
            instEl1,
            instEl2
           );
                      /*
	        randomX = getRandomPosition(400, 800);
					randomY = getRandomPosition(300, 600);
     	     var inst=await IC.createInstance({
						"text": result.text,
						"emoji": result.emoji,
						"x": randomX,
						"y": randomY,
					  })
            */
           instancesCreated.push(inst);
           console.log(instancesCreated);

                    } catch (err) {
                        console.log(err);
                    }

                    await sleep(500);
                }
            }
        }, 20000);
    } else if (window.location.pathname.startsWith("/item")) {
        GM.setValue("state", "init");

        let stepsRefined = [];

        let stepsRaw = document.querySelector(".recipes").querySelectorAll("li");

        let Wait = setInterval(async function () {
            if (stepsRaw) {
                stepsRaw = document.querySelector(".recipes").querySelectorAll("li");
                clearInterval(Wait);
                stepsRaw=Array.from(stepsRaw);
                stepsRaw=stepsRaw.filter(x=>x.style.display!="none");
                for (let stepRaw of stepsRaw) {
                    let itemsRaw = stepRaw.querySelectorAll(".item");
                    let step = [];
                    for (let item of itemsRaw) {
                        let itemText = item.childNodes[1].textContent;
                        step.push(itemText);
                    }

                    stepsRefined.push(step);
                }

                let textRecipe = JSON.stringify(stepsRefined);
                console.log(textRecipe);
                GM.setValue("recipeIB", textRecipe);
                GM.setValue("state", "start");
            }
        }, 2000);
    } else if (window.location.pathname.startsWith("/search")) {
    }
});
