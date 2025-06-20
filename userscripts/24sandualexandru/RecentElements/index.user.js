// ==UserScript==
// @name        Recent Elements
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @author      -
// @description 6/14/2025, 1:04:57 AM
// ==/UserScript==
(function(){

  var recentSize=10;
  var recentData=[];
  var recentHeight=400;
 function buildRecentDiv()
   {
     var parentDiv=	document.getElementsByClassName("sidebar-inner")[0];
     var recentDiv = document.querySelector(".recent-div");
     var wrapper = document.createElement("div");



     if(recentDiv==null)
       {
         recentDiv=document.createElement("div");
         recentDiv.classList.add("recent-div");
         recentDiv.style.height=recentHeight+"px";
         recentDiv.style.overflowY="auto";
         wrapper.appendChild(recentDiv);
         var resizeBar=document.createElement("div");
         resizeBar.style.width="100%";
         resizeBar.style.height="3px";
         resizeBar.style.backgroundColor="var(--border-color)";
         resizeBar.style.cursor="ns-resize";
         let resizing = false;
         let startY=0;
         let startHeight = wrapper.offsetHeight;
     resizeBar.addEventListener("mousedown",(e)=>{
       resizing = true;
		   startY = e.clientY;
		   startHeight = recentDiv.offsetHeight;
   function handleResize(e) {
		if (!resizing) return;
		const newHeight = startHeight + e.clientY - startY;
    recentHeight=newHeight;
    localStorage.setItem("recentHeight",JSON.stringify(recentHeight));
		recentDiv.style.height=newHeight+"px";

	}
		document.addEventListener("mousemove", handleResize);
		document.addEventListener("mouseup", function() {
			resizing = false;
			document.removeEventListener("mousemove", handleResize);
		});
    });



         wrapper.appendChild(resizeBar);

         parentDiv.insertBefore(wrapper, document.getElementsByClassName("items")[0]);

       }else
         {
            recentDiv.innerHTML="";
         }

      for(var recent of recentData)
      {

        recentDiv.appendChild(elementToItem(recent));

      }


   }

	function elementToItem(item,wrap=true)
{
		const itemDiv = document.createElement("div");
	itemDiv.setAttribute("data-item-emoji", item.emoji);
	itemDiv.setAttribute("data-item-text", item.text);
	itemDiv.setAttribute("data-item-id", item.id);
	if (item.discovery) itemDiv.setAttribute("data-item-discovery", "");
	itemDiv.setAttribute("data-item", "");
	itemDiv.classList.add("item");

	const emoji = document.createElement("span");
	emoji.classList.add("item-emoji");
	emoji.appendChild(document.createTextNode(item.emoji ?? "⬜"));

	itemDiv.append(emoji, document.createTextNode(` ${item.text} `));

	if (wrap) {
		const wrapper = document.createElement("div");
		wrapper.classList.add("item-wrapper");
		wrapper.appendChild(itemDiv);
    wrapper.addEventListener("click", function(e) {
			console.log(e);

			if (e.shiftKey) {

				recentData=recentData.filter(x=>x.text!=item.text)
				localStorage.setItem("recentStructure", JSON.stringify(recentData));
				buildRecentDiv();
			}
		});
    return 	wrapper;

     }

		return itemDiv;
	}
function trimArray(arr, targetSize) {
    while (arr.length > targetSize) {
        arr.splice(arr.length-1, 1); // Removes the first element
    }
  return arr;
}

window.addEventListener("load",()=>{
    const v_container = document.querySelector(".container").__vue__;
  	const craftApi = v_container.craftApi;
    if(localStorage.getItem("recentHeight"))
    {
      recentHeight=JSON.parse(localStorage.getItem("recentHeight"));

    }



   v_container.craftApi = async function(a, b) {
    [a, b] = [a, b].sort();
		const result = await craftApi.apply(this, [a, b]);

   if(result && result.text)
     {
          if(recentData.find(x=>x.text==result.text)==null){
           var item= IC.getItems().find(x=>x.text==result.text);
             if(item )
              {
                recentData.unshift({"text":result.text,"emoji":result.emoji,"id":item.id});

              }else
               {
                recentData.unshift({"text":result.text,"emoji":result.emoji,"id":IC.getItems().length});
               }
          }
       if(recentData.length>recentSize)
        {
          trimArray(recentData,recentSize);
        }
        localStorage.setItem("recentStructure",JSON.stringify(recentData));
        buildRecentDiv();

     }
        return result;
     }
   recentData = localStorage.getItem("recentStructure");

  if(recentData==null)
    recentData=[];
    else
    recentData=JSON.parse(localStorage.getItem("recentStructure"));
   buildRecentDiv();

})

;


})();