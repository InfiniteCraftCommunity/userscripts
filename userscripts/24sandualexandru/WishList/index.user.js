// ==UserScript==
// @name        WishList
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @author      -
// @description 5/20/2025, 4:48:55 PM
// ==/UserScript==
(function()
{  var addIcon="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBVcGxvYWRlZCB0bzogU1ZHIFJlcG8sIHd3dy5zdmdyZXBvLmNvbSwgR2VuZXJhdG9yOiBTVkcgUmVwbyBNaXhlciBUb29scyAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIGZpbGw9IiMwMDAwMDAiIHZlcnNpb249IjEuMSIgaWQ9IkNhcGFfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgDQoJIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDQ1LjQwMiA0NS40MDIiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPHBhdGggZD0iTTQxLjI2NywxOC41NTdIMjYuODMyVjQuMTM0QzI2LjgzMiwxLjg1MSwyNC45OSwwLDIyLjcwNywwYy0yLjI4MywwLTQuMTI0LDEuODUxLTQuMTI0LDQuMTM1djE0LjQzMkg0LjE0MQ0KCQljLTIuMjgzLDAtNC4xMzksMS44NTEtNC4xMzgsNC4xMzVjLTAuMDAxLDEuMTQxLDAuNDYsMi4xODcsMS4yMDcsMi45MzRjMC43NDgsMC43NDksMS43OCwxLjIyMiwyLjkyLDEuMjIyaDE0LjQ1M1Y0MS4yNw0KCQljMCwxLjE0MiwwLjQ1MywyLjE3NiwxLjIwMSwyLjkyMmMwLjc0OCwwLjc0OCwxLjc3NywxLjIxMSwyLjkxOSwxLjIxMWMyLjI4MiwwLDQuMTI5LTEuODUxLDQuMTI5LTQuMTMzVjI2Ljg1N2gxNC40MzUNCgkJYzIuMjgzLDAsNC4xMzQtMS44NjcsNC4xMzMtNC4xNUM0NS4zOTksMjAuNDI1LDQzLjU0OCwxOC41NTcsNDEuMjY3LDE4LjU1N3oiLz4NCjwvZz4NCjwvc3ZnPg=="
   var wishIcon="data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjIuODggMTA3LjMiPjx0aXRsZT53aXNobGlzdDwvdGl0bGU+PHBhdGggZD0iTTY1LjU4LDkwLjgybDEwLjQ5LDkuOTFMNjUuNTgsOTAuODJabS0yLjUyLDUuNzZhMy4wNiwzLjA2LDAsMCwxLDAsNi4xMkg3LjEyYTcuMDksNy4wOSwwLDAsMS01LTIuMWgwYTcuMSw3LjEsMCwwLDEtMi4wOS01VjcuMTJhNy4wNiw3LjA2LDAsMCwxLDIuMS01aDBBNy4xLDcuMSwwLDAsMSw3LjEyLDBIOTEuNjNhNy4xLDcuMSwwLDAsMSw1LDIuMDlsLjIxLjIzYTcuMTYsNy4xNiwwLDAsMSwxLjg4LDQuOFY0OWEzLjA2LDMuMDYsMCwwLDEtNi4xMiwwVjcuMTJhMSwxLDAsMCwwLS4yMi0uNjJsLS4wOC0uMDhhMSwxLDAsMCwwLS43LS4zSDcuMTJhMSwxLDAsMCwwLS43LjNoMGExLDEsMCwwLDAtLjI5LjdWOTUuNThhMSwxLDAsMCwwLC4zLjdoMGExLDEsMCwwLDAsLjcuMjlaTTk1LjQ0LDY3LjQyYzMuNTQtMy43LDYtNi44OSwxMS41LTcuNTIsMTAuMjQtMS4xNywxOS42NSw5LjMyLDE0LjQ3LDE5LjY0LTEuNDcsMi45NC00LjQ3LDYuNDQtNy43OCw5Ljg3QzExMCw5My4xOCwxMDYsOTYuODcsMTAzLjE0LDk5LjY3bC03LjY5LDcuNjMtNi4zNi02LjEyQzgxLjQ0LDkzLjgyLDY5LDg0LjU0LDY4LjU1LDczLjA2Yy0uMjgtOCw2LjA3LTEzLjIsMTMuMzctMTMuMTEsNi41My4wOSw5LjI5LDMuMzMsMTMuNTIsNy40N1ptLTcxLjY2LDBBMy42MiwzLjYyLDAsMSwxLDIwLjE2LDcxYTMuNjIsMy42MiwwLDAsMSwzLjYyLTMuNjJabTE0LjcxLDcuMjdhMy4xNSwzLjE1LDAsMCwxLDAtNi4xOWgxMS44YTMuMTUsMy4xNSwwLDAsMSwwLDYuMTlaTTIzLjc4LDQ2YTMuNjIsMy42MiwwLDEsMS0zLjYyLDMuNjFBMy42MiwzLjYyLDAsMCwxLDIzLjc4LDQ2Wm0xNC43MSw2Ljk0YTMuMSwzLjEsMCwwLDEsMC02LjExSDYyLjU4YTMuMSwzLjEsMCwwLDEsMCw2LjExWk0yMy43OCwyNC42YTMuNjIsMy42MiwwLDEsMS0zLjYyLDMuNjIsMy42MiwzLjYyLDAsMCwxLDMuNjItMy42MlptMTQuNzEsNi42NWEyLjg0LDIuODQsMCwwLDEtMi41Ny0zLjA1LDIuODUsMi44NSwwLDAsMSwyLjU3LTMuMDZINzIuMzhBMi44NSwyLjg1LDAsMCwxLDc1LDI4LjJhMi44NCwyLjg0LDAsMCwxLTIuNTcsMy4wNVoiLz48L3N2Zz4=";

var listOfElements=["Wish"]
   var doneElements=[]


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
			doStuff();
			dialog.close();
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










   function updateList()
  {
    let listModal=document.querySelector(".wish-modal");
    if(listModal==null)
      {
         listModal=document.createElement("dialog");
         listModal.classList.add("wish-modal");
         document.querySelector(".container").appendChild(listModal);
      }
       listModal.close();
       listModal.innerHTML="";
       listModal.style.width="300px";
       listModal.style.height="500px";

       listModal.style.position="absolute";
       listModal.style.float="left";
       listModal.style.left="50%";
       listModal.style.top="50%";
       listModal.style.transform="translate(-50%, -50%)";
       listModal.style.overflowY="auto";
       var addButton=document.createElement("img");
       addButton.style.width="20px";
       addButton.style.height="20px";
       addButton.src=addIcon;
       addButton.style.filter="invert(1)";
       addButton.addEventListener("click",()=>{
        var input=document.createElement("input");
         input.addEventListener('keydown',(e)=>{
           if(e.key=='Enter')
           {
               listOfElements.push(input.value);
               localStorage.setItem("wishList",JSON.stringify(listOfElements));
               listModal.removeChild(input);

               var itemDiv=document.createElement("div");
                itemDiv.style.width="100%";
               var textNode=document.createTextNode(input.value);

               itemDiv.appendChild(textNode);
               listModal.appendChild(itemDiv);
               updateList();
           }


         })

          listModal.appendChild(input);

      });

    listModal.appendChild(addButton);

    for(let item of listOfElements){
       var itemDiv=document.createElement("div");
       var textNode=document.createTextNode(item);
          if(doneElements.includes(item))
        {

        var checkNode=document.createTextNode('✔️');
         itemDiv.appendChild(checkNode);

        }
        itemDiv.style.display = "flex";
        itemDiv.style.justifyContent = "space-between";
        itemDiv.style.alignItems = "center";
       itemDiv.appendChild(textNode);
        let closeButton=document.createElement("span");
         closeButton.textContent="❌";
         closeButton.style.marginLeft = "auto";
         closeButton.style.fontSize = "x-large";

			 closeButton.addEventListener("mouseover", function () {
				console.log("over maximize");
				 closeButton.style.textShadow = "red 2px 0 20px";
				 closeButton.style.backgroundColor = "red";
			});
			 closeButton.addEventListener("mouseout", function () {
				 closeButton.style.textShadow = "";
				 closeButton.style.backgroundColor = "transparent";
			});

			 closeButton.addEventListener("click", function () {
       confirmPrompt(()=>
                 {
            const index = listOfElements.indexOf( item );
           if (index > -1) {
              listOfElements.splice(index, 1); // Removes the first 2
               localStorage.setItem("wishList",JSON.stringify(listOfElements));

                updateList();

           }
           });


			});







         itemDiv.appendChild(closeButton);


      listModal.appendChild(itemDiv);
    }
    listModal.addEventListener("mousedown", function(e) {
		if (e.target === e.currentTarget) return listModal.close();
		if (e.button === 2) return;

    });

  listModal.showModal();

  }




  window.addEventListener("load",()=>{

    listOfElements= JSON.parse(localStorage.getItem("wishList"));
    doneElements=JSON.parse(localStorage.getItem("doneList"));
    if(listOfElements==null || listOfElements.length==0)
    {
      listOfElements=["Wish"];
      localStorage.setItem("wishList",JSON.stringify(listOfElements))

    }
      if (doneElements==null)
    {
       doneElements=[];
      localStorage.setItem("doneList",JSON.stringify( doneElements))

    }





    var v_container = document.querySelector(".container").__vue__;
    	const craftApi = v_container.craftApi;
    var imageWishList=document.createElement("img");

    imageWishList.src=wishIcon;
    imageWishList.style.marginTop="2px";
    imageWishList.style.width="22px";
    imageWishList.style.height="32px";
    imageWishList.setAttribute("data-v-1748f434","");
    imageWishList.classList.add("random")
    imageWishList.style.cursor="pointer";

    imageWishList.addEventListener("click",()=>{

      updateList();
    })
    var sideControls= document.querySelector(".side-controls");
   sideControls.insertBefore(imageWishList, sideControls.firstChild);




	v_container.craftApi = async function(a, b) {
		const result = await craftApi.apply(this, [a, b]);

    if(result && listOfElements.includes(result.text ))
	 {
     doneElements.push(result.text);
     localStorage.setItem("doneList",JSON.stringify(doneElements));
     updateList();
   }
		return result;
	}



  })



})()
