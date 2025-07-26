// ==UserScript==
// @name        Display parent elements on keybind
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @run-at		 document-start
// @author      -
// @description 7/26/2025, 10:36:13 PM
// ==/UserScript==
(function()
{
  window.addEventListener("load",()=>{
let lastCrafts=[];
let keybind="";
    if(localStorage.getItem("display-parents-keybind"))
     {
       keybind=localStorage.getItem("display-parents-keybind");

     }


    const API = document.querySelector(".container").__vue__;

   const craftApi = API.craftApi;
  API.craftApi = async function (a,b) {
    const result = await craftApi.apply(this, [a, b]);
     lastCrafts.push([a,b,result]);
    //console.log("Crafts:",lastCrafts)
    return result;
  };
let mouseX = 0;
let mouseY = 0;
 document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

   function formatKeyEvent(e) {
        let shift = e.shiftKey ? 'Shift' : '';
        let meta = e.metaKey ? 'Meta' : '';
        let ctrl = e.ctrlKey ? 'Ctrl' : '';
        let alt = e.altKey ? 'Alt' : '';

        let arr = [ctrl,alt,shift,meta,(['Control','Shift','Alt','Meta'].some(sub => e.code.startsWith(sub)) ? '' : e.code)];

        return arr.filter((word) => word.length > 0).join(' + ');
    }
	function set_up_settings() {

		let menu = document.querySelector(".menu");
		menu.addEventListener("click", () => {
			let interval = setInterval(
				() => {

					let settings = document.querySelector(".modal-tabs");
					if (settings == null)
						return;

					clearInterval(interval);

					let modal1 = document.querySelector(".modal");
					modal1.style.maxWidth = "650px";
					let displayParents_container = document.createElement("div");

					if (settings == null) {


						settings = document.querySelector(".container");
						displayParents_container.style.position = 'absolute';
						displayParents_container.style.left = '20px';
						displayParents_container.style.top = '100px';
						displayParents_container.style.width = '50px';
						displayParents_container.style.height = '50px';

						displayParents_container.classList.add('display_parents_settings_cont');



					}
					else {
						displayParents_container.classList.add('setting');
						displayParents_container.classList.add("modal-tab-wrapper");
						displayParents_container.setAttribute("data-v-885fff84", "");
						displayParents_container.classList.add('display_parents_settings_cont');
						ParentSource = settings;
					}



					var title = document.createElement("div");


					title.classList.add("modal-tab");
					title.setAttribute("data-v-885fff84", "");
					var textSpacer = document.createElement("div");
					var textDiv = document.createElement("div");
					textDiv.classList.add("modal-tab-text");
					textDiv.textContent = "Display parents";
					textDiv.setAttribute("data-v-885fff84", "");
					textSpacer.textContent = "/";
					textSpacer.classList.add('spacer');
					textSpacer.setAttribute("data-v-885fff84", "");
					displayParents_container.appendChild(textSpacer);
					title.appendChild(textDiv);

					displayParents_container.appendChild(title);
					settings.appendChild(displayParents_container);
					var parentElement = document.querySelector(".modal");


					title.addEventListener("click", () => {

						while (parentElement.children[1].children.length > 1)
							parentElement.children[1].removeChild(parentElement.children[1].lastChild);
						if (parentElement.children[1].lastChild && parentElement.children[1].lastChild.style) {
							parentElement.children[1].lastChild.style.display = "none";
						} else
							if (parentElement.children[1].lastChild) {
								parentElement.children[1].children[0].style.display = "none";
							}

						title.classList.add("modal-tab-selected");

						var titleTabs = document.querySelector(".modal-tabs");
            var content = document.querySelector(".display-parents-setting-content");
            if (content == null) {

			          content = document.createElement("div");
			          content.setAttribute("data-v-885fff84", "");
			          content.classList.add("about");

			          content.classList.add("display-parents-setting-content");
			          parentElement.appendChild(content);

		          }else
                {
                   content.innerHTML = "";
                }

						for (var tab of titleTabs.children) {

							if (tab.querySelector(".modal-tab").querySelector(".modal-tab-text").textContent != title.textContent) {
								tab.querySelector(".modal-tab").addEventListener("click", () => {

									title.classList.remove("modal-tab-selected");
									if (parentElement.contains(content)) {
										parentElement.removeChild(content);
									}
								})
							}}



            //add input and text
          let text= document.createElement("p");
            text.textContent="Keybind"
          let input= document.createElement("input");
             input.value=keybind;
             input.readOnly=true;
             input.addEventListener("keydown",(e)=>{
              let val=   formatKeyEvent(e)
              console.log("VAL:"+val);
               input.value=val;
               keybind=val;
               localStorage.setItem("display-parents-keybind",val);
             });
          content.appendChild(text);
          content.appendChild(input);



					});
				}, 1);
		});

	}


    function doStuffOnInstancesMutation(mutations) {
        for (const mutation of mutations) {
                    if (mutation.addedNodes.length > 0) {
                        for (const node of mutation.addedNodes) {


                              if(node.id!="instance-0" && node.classList.contains("instance") && node.querySelector(".instance-emoji"))
                                {
                                 let instance=IC.getInstances().find(x=>x.element==node)

                                  let parentOne=null;
                                   let parentTwo=null;


                                    let findResponsibleCraft=lastCrafts.findLast(x=>x[2] && x[2].text==instance.text);
                                        if(findResponsibleCraft)
                                   {
                                     parentOne=IC.getItems().find(x=>x.text==findResponsibleCraft[0])
                                     parentTwo=IC.getItems().find(x=>x.text==findResponsibleCraft[1])
                                   }
                                  else
                                    { console.log("Not crafted");
                                      let item=IC.getItems().find(x=>x.text==instance.text) ;
                                      let recipes=item?.recipes;
                                      let recipe=recipes[0];
                                     console.log("RECIPE:",recipe);
                                     if(recipe)
                                       {
                                        parentOne=IC.getItems()[recipe[0]]
                                        parentTwo=IC.getItems()[recipe[1]]
                                       }
                                    }
                                     window.addEventListener("keydown",async (e)=>{
                                        let formattedKeyEvent = formatKeyEvent(e);
                                        console.log("KEY:"+formattedKeyEvent)
                                       if(formattedKeyEvent==keybind)
                                        {

                                          console.log("keybounded");


                                         if(IC.getInstances().find(x=>x==instance)==null)
                                            return;

                                          let  rect=node.getBoundingClientRect();

                                           const isInside =
                                            mouseX >= rect.left &&
                                            mouseX <= rect.right &&
                                            mouseY >= rect.top &&
                                            mouseY <= rect.bottom;
                                            if(!isInside)
                                              return;


                                          		const randoms =[rect.left,rect.top-25]


                                              let left=await IC.createInstance({
					                                    	"text": parentOne.text,
					                                    	"emoji": parentOne.emoji,
                                                  "itemId":parentOne.id,
                                                   "discovery":parentOne.discovery,
						                                        "x": node.getBoundingClientRect().left-25,
					                                        	"y": randoms[1]
				                                           	})



				                                        	let right=await IC.createInstance({
					                                      	"text": parentTwo.text,
					                                      	"emoji": parentTwo.emoji,
                                                  "itemId":parentTwo.id,
					                                        "x": node.getBoundingClientRect().right+25,
				                                        	"y": randoms[1]
				                                          	})


                                           }

                                        })

                                    console.log("Instance:",instance);

                                }
                        }
                    }
                }
            }


          const instanceObserver = new MutationObserver((mutations) => {
                    doStuffOnInstancesMutation(mutations);
              });

                instanceObserver.observe(document.getElementById("instances"), {
                    childList: true,
                    subtree  : true,

                });
             set_up_settings();

})



})()