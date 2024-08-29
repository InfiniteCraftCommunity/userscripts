// ==UserScript==
// @name        Rankings
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @grant       GM.xmlHttpRequest
// @version     1.0
// @author      -
// @require  https://www.unpkg.com/csv-parse@4.15.4/lib/browser/index.js
// @description 8/27/2024, 12:24:30 PM
// ==/UserScript==
(function(){


  function getSave() {
     return new Promise((resolve, reject) => {
         const handleClick = HTMLElement.prototype.click;
         HTMLElement.prototype.click = () => {HTMLElement.prototype.click = handleClick}
         const bodyObserver = new MutationObserver((mutations, observer) => {
             for (const mutation of mutations) {
                 if (mutation.type !== "childList") continue;
                 const anchor = Array.from(mutation.addedNodes).find((node) => node.download === "infinitecraft.json");
                 if (anchor) return fetch(anchor.href).then(resolve);
             }
         });
         bodyObserver.observe(document.body, { childList: true, subtree: true });
         handleClick.call(document.querySelector(".setting[for=import-save] + .setting"));
         setTimeout(() => {
             bodyObserver.disconnect();
             reject("Timed out")
         }, 1500);
     });
 }
 
 
 
 
 
 
 
 
   let useCounts={}
   function computeUsageCount(source)
   {  useCounts={}
      let elements=source["elements"]
       for(let recipes in source["recipes"]){
 
 
        let recipeList=source["recipes"][recipes]
        for(let recipe of recipeList){
          let first=recipe[0]["text"]
          let  second=recipe[1]["text"]
 
       if (!(first in useCounts))
        useCounts[first]=1
       else
        useCounts[first]=useCounts[first]+1
       if (! (second in useCounts))
        useCounts[second]=1
       else
        useCounts[second]=useCounts[second]+1
 
 
      }
 
   }
    console.log("usecounts:",useCounts)
   }
 
   function augmentElements(source,elements)
   {
     for(let elem of elements)
     {
       elem.recipeCount=source["recipes"][elem.text]==null?0:source["recipes"][elem.text].length;
       elem.usage=useCounts[elem.text]!=null?useCounts[elem.text]:0;
       elem.length=elem.text.length;
 
     }
     return elements;
 
   }
 let direction=[0,0,0,0]
 function makeRawRanking(augmentedElements)
 {
 
   let lengthRank=[...augmentedElements]
   let recipeRank=[...augmentedElements]
   let usageRank=[...augmentedElements]
 
    if(direction[0]==0)
    lengthRank=lengthRank.sort((a,b)=>b.length-a.length);
    else
    lengthRank=lengthRank.sort((a,b)=>a.length-b.length);
 
 
    if(direction[1]==0)
    recipeRank= recipeRank.sort((a,b)=>b.recipeCount-a.recipeCount);
   else
    recipeRank= recipeRank.sort((a,b)=>a.recipeCount-b.recipeCount);
 
   if(direction[2]==0)
    usageRank= usageRank.sort((a,b)=>b.usage-a.usage);
   else
    usageRank= usageRank.sort((a,b)=>a.usage-b.usage);
   return [lengthRank,recipeRank,usageRank]
 }
 
 function changeDirection(index,fatherImg,callback=null)
 {
   if(callback)
   direction[index]=direction[index]==0?1:0;
   console.log("change direction",direction[index]);
   if(direction[index]==1)
   fatherImg.src="data:image/png;base64,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";
   else
   fatherImg.src="data:image/png;base64,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AEAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAQAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAEAAAAAAAAQAAAAAQAAAAAAABAAAAABAAAAAAAAEAAAAAEAAAAAAAAQAAAAAEAFcAAAAA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AgAAxj8gAAAiAABg/AMCACACAADGPyAAACIAAGD8AwIAIAIAAMY/IAAAIgAAYPwDAgCIACIAABj/gAAAiAAAgPEPCACACAAAGP+AAACIAACA8Q8IAIAIAAAY/4AAAIgAAIDxDwgAgAgAABj/gAAAiAAAgPEPCACACAAAxj8gAACIAABg/AMCACACAADGPyAAACIAAGD8AwIAIAIAAMY/IAAAIgAAYPwDAgAgAgAAxj8gAAAiAAAY/wACACACAIDxDwgAACIAABj/gAAAIAIAgPEPCACACCACAIDxDwgAgAgAABj/gAAAiAAAgPEPCACACAAAxr/xDwgAgAgAAMY/gAAAiAAAYPwDCACACAAAxj8gAACIAABg/AMCAIAIAADGPyAAAIgAAGD8AwIAIAIAAMY/IAAAIgAAGP8AAgAgAgCA8Q8gAAAiAAAY/wACACACAIDxDwgAACIAABj/gAAAIAIAgPEPCAAAIgAAGP+AAAAgAgBg/AMIAAAiAADGP4AAAIgAAGD8AwgAgAgAAMY/gAAAiAAAYPwDAgCACAAAxj8gAACIAABg/AMCAIAIAADGPyAAAIgAABj/AAIAgAgAgPEPIAAAiAAAGP8AAgAgAgCA8Q8gAAAiAAAY/wACACACAIDxDwgAACIAABj/gAAAIAIAYPwDCAAAIgAAxj+AAAAgAgBg/AMIAAAiAADGP4AAACACAGD8AwgAACIAAMY/gAAAiAAAYPwDAgCACACA8Q8gAACIAAAY/wACAIAIAIDxDyAAAIgAABj/AAIAgAgAgPEPIAAAiAAAGP8AAgCACACA8Q8gAACIAAAY/4AAACACiAAAxj+AAAAgAgBg/AMIAAAiAADGP4AAACACAGD8AwgAACIAAMY/gAAAIAIAYPwDCAAAIgAAxj+AAAAgAgAY/wAIAAAiAIDxDyAAACACABj/AAIAgAgAgPEPIAAAiAAAGP8AAgCACACA8Q8gAACIAAAY/wACAIAIAGD8uwYAAQBABAAw/gEQAABEAADjH0AAAEAEADD+AQQAAEQAAOMfQAAAEAFEAADjH0AAABABADD+AQQAABEAAOMfQAAAEAEAjH8ABAAAEQDA+AdAAAAQAQCMfwABAAARAMD4BxAAABABAIx/AAEAABEAwPgHEAAAEAEAjH8AAQBABAAw/gEQAABEAADjHwABAEAEADD+ARAAAEQA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";
 
 
 
 
 
 
 
   fatherImg.style.cssText="width: 30px;cursor: pointer;opacity: .8;-webkit-user-select: none;-moz-user-select: none;user-select: none;";
   fatherImg.style.filter="invert(1)";
 
 if(callback)
   callback();
 
 }
 
 
 
 
  function elementToItem(element,modal=null) {
 
         let item = document.createElement("div");
 
         item.classList.add('item');
         const itemEmoji = document.createElement('span');
         itemEmoji.classList.add('item-emoji');
         itemEmoji.appendChild(document.createTextNode(element.emoji ?? '⬜'));
 
 
 
 
         item.appendChild(itemEmoji);
         item.appendChild(document.createTextNode(` ${element.text} `));
         item.style.display="inline-block";
         item.addEventListener('mousedown', (e) => {
 
                unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].selectElement(e, element) ;
                unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].playInstanceSound();
 
         });
         return item;
 
     }
 
 
 
 
 
 
 
 
 
 
 
 let pages=[0,0,0,0]
 
 
 function buildPagination(pageNr,totalLenght,index,sourceDiv,callback)
   {
 
     let totalPages=Math.ceil(totalLenght/1000);
     sourceDiv.innerHTML="";
 
 
 
     sourceDiv.style.display="flex";
     sourceDiv.style.justifyContent="flex-end";
     //build anchors
     //build three before
 
     if(pageNr-3>0)
     {
 
 
     for(let i=0;i<Math.min(3,pageNr-3);i++)
     {
       let anchor=document.createElement("a");
       anchor.textContent=(i+1).toString();
       anchor.style.marginLeft= anchor.style.marginRight="10px";
       anchor.style.color="white";
       anchor.addEventListener("click",()=>{
 
         pages[index]=i;
         callback();
       })
 
       sourceDiv.appendChild(anchor);
     }
 
        let dots=document.createElement("span");
         dots.textContent="...";
         sourceDiv.appendChild(dots);
 
     }
 
 
 
 
     for(let i=Math.max(0,pageNr-3);i<pageNr;i++)
     {
       let anchor=document.createElement("a");
       anchor.textContent=(i+1).toString();
       anchor.style.marginLeft= anchor.style.marginRight="10px";
       anchor.style.color="white";
       anchor.addEventListener("click",()=>{
 
         pages[index]=i;
         callback();
       })
       sourceDiv.appendChild(anchor);
     }
 
 
     let anchor=document.createElement("a");
       anchor.textContent=(pageNr+1).toString();
       anchor.style.marginLeft= anchor.style.marginRight="20px";
       anchor.addEventListener("click",()=>{
 
         pages[index]=pageNr;
         callback();
 
       })
      sourceDiv.appendChild(anchor);
 
     //3 after the element
      for(let i=pageNr+1;i<Math.min(pageNr+3,totalPages);i++)
     {
       let anchor=document.createElement("a");
       anchor.textContent=(i+1).toString();
       anchor.style.marginLeft= anchor.style.marginRight="10px";
       anchor.style.color="white";
       anchor.addEventListener("click",()=>{
 
         pages[index]=i;
         callback();
       })
         sourceDiv.appendChild(anchor);
     }
 
 
 //build last 3 pages
 
     if(pageNr<totalPages-3)
       {
         //add a doted span
         let dots=document.createElement("span");
         dots.textContent="...";
         sourceDiv.appendChild(dots);
   for(let i=Math.max(totalPages-3,pageNr+3);i<totalPages;i++)
     {
       let anchor=document.createElement("a");
       anchor.textContent=(i+1).toString();
       anchor.style.marginLeft= anchor.style.marginRight="10px";
       anchor.style.color="white";
       anchor.addEventListener("click",()=>{
 
         pages[index]=i;
         callback();
       })
         sourceDiv.appendChild(anchor);
     }
 
       }
 
 
 
   }
 
 
 
 let userRank=[]
 let spreadsheetApi='https://docs.google.com/spreadsheets/d/1cipGRAqCAkwp2xfhPDxPo-57xJHlFbwUOS7EUrlmmeg/export?format=csv';
 function fetchUsersRanks() {
   return new Promise((resolve) => {
     GM.xmlHttpRequest({
       method: "GET",
       url: spreadsheetApi,
       headers: {
         "Origin": "https://infinibrowser.zptr.cc/"
       },
       onload(response) {
                 parse(response.responseText,{},function(err, records)
               {
 
                    records=records.splice(1);
                    userRank=records.map(x=>[x[0],Number(x[7].replaceAll(".",""))]);
                    userRank=userRank.sort((a,b)=>b[1]-a[1])
 
               resolve(userRank);
                console.log(userRank)
 
              });
 
 
 
 
       }
 
 
     });
   });
 }
 
 
 
 
 async function makeModalForRankings(){
 
   if(document.querySelector(".rank-modal"))
   document.querySelector(".rank-modal").parentNode.removeChild(document.querySelector(".rank-modal"))
   let source=await getSave().then(x=>x.json())
   computeUsageCount(source);
   let augmentedElements=augmentElements(source,unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements)
   let rankings=makeRawRanking(augmentedElements)
 
 
 
   let rankModal=document.createElement("dialog");
   rankModal.style.position="absolute"
   rankModal.style.left=(document.querySelector(".sidebar").getBoundingClientRect().left/2).toString()+"px"
 
   rankModal.style.width="500px"
   rankModal.style.height="800px";
 
   rankModal.style.overflowY="scroll";
   rankModal.style.scrollbarWidth="none";
   rankModal.classList.add("rank-modal");
   let actionBar=document.createElement("div");
   actionBar.style.justifyContent="flex-end";
   actionBar.style.display="flex";
   actionBar.style.position="sticky"
   actionBar.style.top="0";
   let closeButton=document.createElement("button");
   closeButton.textContent="❌";
 
   closeButton.addEventListener("click",()=>{rankModal.close()})
 
 
 
    actionBar.appendChild(closeButton);
 
 
   let summaryDiv=document.createElement("div");
   let rankDiv=document.createElement("div");
   let paginationDiv=document.createElement("div");
   let directionDiv=document.createElement("div");
   let directionImg=document.createElement("img");
   directionDiv.appendChild(directionImg);
 
 
   let tabBar=document.createElement("div");
   tabBar.style.justifyContent="flex-end";
   tabBar.style.display="flex";
 
   let previousColor=null;
   let tabLabelLength=document.createElement("div");
   let tabLabelRecipes=document.createElement("div");
   let tabLabelUsage=document.createElement("div");
   let tabLabelUsers=document.createElement("div");
 
   tabLabelUsers.appendChild(document.createTextNode("Users"));
   tabLabelUsers.style.marginLeft="20px";
   tabLabelUsers.addEventListener("click",async ()=>{
 
     if(previousColor==null)
   previousColor=tabLabelUsers.style.backgroundColor;
   tabLabelLength.style.backgroundColor=previousColor;
   tabLabelUsers.style.backgroundColor="gray";
   tabLabelRecipes.style.backgroundColor=previousColor;
   tabLabelUsage.style.backgroundColor=previousColor;
   summaryDiv.innerHTML="";
   rankDiv.innerHTML="";
   paginationDiv.innerHTML="";
   directionDiv.innerHTML="";
 
 
       let ranks=await fetchUsersRanks();
         console.log("ranks",ranks)
      let index=0;
     rankDiv.appendChild(document.createElement("br"));
     rankDiv.appendChild(document.createElement("br"));
 
      for(let rank of ranks)
        {
 
          console.log("rank:",rank)
           index=index+1;
         let elDiv=document.createElement("div");
         let rankIndex=document.createElement("span");
 
         rankIndex.textContent=index.toString()+". ";
         elDiv.appendChild(rankIndex)
         elDiv.appendChild(document.createTextNode(rank[0]));
         let rankCount=document.createElement("span");
         rankCount.textContent="    "+rank[1].toString()
         elDiv.appendChild(rankCount)
         if(index==1)
          {rankCount.style.color="gold";
         let goldMedal=document.createElement("span");
         goldMedal.textContent="   "+"🥇🏆"
         elDiv.appendChild(goldMedal)
 
 
          }else
             if(index==2)
          {rankCount.style.color="silver";
         let goldMedal=document.createElement("span");
         goldMedal.textContent="   "+"🥈"
         elDiv.appendChild(goldMedal)
 
 
          }else
                 if(index==3)
          { rankCount.style.color="#ce8946";
         let goldMedal=document.createElement("span");
         goldMedal.textContent="   "+"🥉"
         elDiv.appendChild(goldMedal)
 
 
          }else
            {
              rankCount.style.color="cyan"
 
            }
 
 
         rankDiv.appendChild(elDiv)
         rankDiv.appendChild(document.createElement("br"));
         rankDiv.appendChild(document.createElement("br"));
 
        }
 
   })
 
 
 
 
 
 
 
 
 
 
 
 
 
 
   tabLabelLength.appendChild(document.createTextNode("Length"));
   tabLabelLength.style.display="inline-block"
   tabLabelLength.style.marginLeft="20px";
   rankDiv.style.height="500px";
   rankDiv.style.overflowY="scroll";
   rankDiv.style.scrollbarWidth="none";
 
 
   tabLabelLength.addEventListener("click",()=>{
 
  if(previousColor==null)
   previousColor=tabLabelLength.style.backgroundColor;
   tabLabelLength.style.backgroundColor="gray";
   tabLabelRecipes.style.backgroundColor=previousColor;
   tabLabelUsage.style.backgroundColor=previousColor;
   tabLabelUsers.style.backgroundColor=previousColor;
     rankDiv.innerHTML="";
 
 
     let lengthRank=rankings[0];
 
 
 
     let directionImg=document.createElement("img");
       changeDirection(0,directionImg);
 
 
      directionDiv.innerHTML="";
      directionImg.addEventListener("click",()=>{
          changeDirection(0,directionImg,()=>{
 
         rankings=makeRawRanking(augmentedElements);
         tabLabelLength.click();
          });
      })
       directionDiv.appendChild(directionImg);
 
 
 
 
 
     summaryDiv.innerHTML="";
     let index=0;
     let dindex=0;
     let max=0;
     let min=320;
     let sum=0;
     for(let rank of lengthRank)
     {
       index=index+1;
 
         max=Math.max(max,rank.length);
         min=Math.min(min,rank.length);
         sum+=rank.length;
 
     }
 
     let page=lengthRank.slice(pages[0]*1000,(pages[0]+1)*1000);
     let pindex=0;
           for(let rank of page)
       {
        pindex++;
        let elDiv=document.createElement("div");
        let dindex=1000*pages[0]+pindex;
         let rankIndex=document.createElement("span");
         rankIndex.textContent=dindex.toString()+". ";
         elDiv.appendChild(rankIndex)
         elDiv.appendChild(elementToItem(rank));
         let rankCount=document.createElement("span");
 
 
         rankCount.textContent="   "+rank.length.toString()+" characters"
         elDiv.appendChild(rankCount)
 
 
 
         rankDiv.appendChild(elDiv)
         rankDiv.appendChild(document.createElement("br"));
         rankDiv.appendChild(document.createElement("br"));
      }
 
 
 
 
 
 
 
 
   let paragraph1=document.createElement("p");
     paragraph1.textContent="The average length:"+sum/index + " characters";
   let paragraph2=document.createElement("p");
     paragraph2.textContent="The longest: "+max +" characters";
 
   let paragraph3=document.createElement("p");
   paragraph3.textContent="The shortest:"+ min +" characters"
   summaryDiv.innerHTML="";
   summaryDiv.appendChild(paragraph3);
   summaryDiv.appendChild(paragraph1);
   summaryDiv.appendChild(paragraph2);
  buildPagination(pages[0],lengthRank.length,0,paginationDiv,()=>{
 
    tabLabelLength.click();
 
 
  })
 
 
   });
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
   tabLabelRecipes.appendChild(document.createTextNode("Recipes"));
   tabLabelRecipes.style.display="inline-block"
   tabLabelRecipes.style.marginLeft="20px";
 
   tabLabelRecipes.addEventListener("click",()=>{
 
    if(previousColor==null)
   previousColor= tabLabelRecipes.style.backgroundColor;
   tabLabelRecipes.style.backgroundColor="gray";
   tabLabelLength.style.backgroundColor=previousColor;
   tabLabelUsage.style.backgroundColor=previousColor;
   tabLabelUsers.style.backgroundColor=previousColor;
     rankDiv.innerHTML="";
 
 
        let directionImg=document.createElement("img");
          directionDiv.innerHTML="";
          changeDirection(1,directionImg);
          directionImg.addEventListener("click",()=>{
          changeDirection(1,directionImg,()=>{
 
         rankings=makeRawRanking(augmentedElements);
         tabLabelRecipes.click();
          });
      })
       directionDiv.appendChild(directionImg);
 
 
 
 
 
 
 
 
     let lengthRank=rankings[1];
     let index=0;
     let recipelessCount=0;
     let numberRecipes=0;
     for(let rank of lengthRank)
     {
       if(rank.recipeCount==0)
       recipelessCount++;
       numberRecipes+=rank.recipeCount;
       index=index+1;
     }
 
 
      let page=lengthRank.slice(pages[1]*1000,(pages[1]+1)*1000);
     let pindex=0;
         for(let rank of page)
     {
       pindex++;
       index=pindex+1000*pages[1];
 
       let elDiv=document.createElement("div");
 
         let rankIndex=document.createElement("span");
         rankIndex.textContent=index.toString()+". ";
         elDiv.appendChild(rankIndex)
         elDiv.appendChild(elementToItem(rank));
         let rankCount=document.createElement("span");
         rankCount.textContent="   "+rank.recipeCount.toString()+" recipes"
         elDiv.appendChild(rankCount)
 
 
 
         rankDiv.appendChild(elDiv)
         rankDiv.appendChild(document.createElement("br"));
         rankDiv.appendChild(document.createElement("br"));
     }
 
 
 
 
 
   let paragraph1=document.createElement("p");
     paragraph1.textContent="Nr. recipes:"+numberRecipes
   let paragraph2=document.createElement("p");
     paragraph2.textContent="Nr. Recipeless:"+recipelessCount;
 
   let paragraph3=document.createElement("p");
   paragraph3.textContent="Nr. elements:"+ lengthRank.length;
   summaryDiv.innerHTML="";
   summaryDiv.appendChild(paragraph3);
   summaryDiv.appendChild(paragraph1);
   summaryDiv.appendChild(paragraph2);
      buildPagination(pages[1],lengthRank.length,1,paginationDiv,()=>{
 
       tabLabelRecipes.click();
 
 
      })
 
   });
 
 
 
 
 
    tabLabelUsage.style.display="inline-block"
   tabLabelUsage.appendChild(document.createTextNode("Usages"));
   tabLabelUsage.style.marginLeft="20px";
 
   tabBar.appendChild(tabLabelUsers);
   tabBar.appendChild(tabLabelLength);
   tabBar.appendChild(tabLabelRecipes);
   tabBar.appendChild(tabLabelUsage);
 
   rankModal.appendChild(actionBar);
   rankModal.appendChild(tabBar);
   rankModal.appendChild(summaryDiv);
   rankModal.appendChild(directionDiv);
   rankModal.appendChild(rankDiv);
   rankModal.appendChild(document.createElement("br"));
   rankModal.appendChild(document.createElement("br"));
   rankModal.appendChild(paginationDiv);
  document.querySelector(".container").appendChild(rankModal)
 
 
 
 
 
   tabLabelUsage.addEventListener("click",()=>{
   console.log("clicked")
   if(previousColor==null)
   previousColor= tabLabelUsage.style.backgroundColor;
   tabLabelRecipes.style.backgroundColor=previousColor;
   tabLabelLength.style.backgroundColor=previousColor;
   tabLabelUsage.style.backgroundColor="gray";
   tabLabelUsers.style.backgroundColor=previousColor;
     rankDiv.innerHTML="";
 
     let lengthRank=rankings[2];
     let index=0;
     let uselessCount=0;
     let usageCount=0;
 
     let directionImg=document.createElement("img");
          directionDiv.innerHTML="";
          changeDirection(2,directionImg);
          directionImg.addEventListener("click",()=>{
          changeDirection(2,directionImg,()=>{
             console.log("usage");
           rankings=makeRawRanking(augmentedElements);
           tabLabelUsage.click();
          });
      })
       directionDiv.appendChild(directionImg);
 
     for(let rank of lengthRank)
     {
 
       if(rank.usage==0)
         uselessCount++;
       index=index+1;
       usageCount+=rank.usage;
     }
 
      let page=lengthRank.slice(pages[2]*1000,(pages[2]+1)*1000);
 
     let pindex=0;
         for(let rank of page)
     {
       let elDiv=document.createElement("div");
         pindex++;
         index=pages[2]*1000+pindex;
         let rankIndex=document.createElement("span");
         rankIndex.textContent=index.toString()+". ";
         elDiv.appendChild(rankIndex)
         elDiv.appendChild(elementToItem(rank));
         let rankCount=document.createElement("span");
         rankCount.textContent="   "+rank.usage.toString()+" usages"
         elDiv.appendChild(rankCount)
 
 
 
         rankDiv.appendChild(elDiv)
         rankDiv.appendChild(document.createElement("br"));
         rankDiv.appendChild(document.createElement("br"));
     }
 
 
   let paragraph1=document.createElement("p");
     paragraph1.textContent="Nr. usages:"+usageCount
   let paragraph2=document.createElement("p");
     paragraph2.textContent="Nr. Useless:"+uselessCount;
 
   let paragraph3=document.createElement("p");
   paragraph3.textContent="Nr. elements:"+ lengthRank.length;
 
   summaryDiv.innerHTML="";
 
   summaryDiv.appendChild(paragraph3);
   summaryDiv.appendChild(paragraph1);
   summaryDiv.appendChild(paragraph2);
         buildPagination(pages[2],lengthRank.length,2,paginationDiv,()=>{
 
         tabLabelUsage.click();
 
 
       })
 
   });
 
 
 
 
  rankModal.showModal();
 
 
 
 
 }
 
 let imgsrc="data:image/png;base64,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"
 let csstext="width: 30px;cursor: pointer;opacity: .8;-webkit-user-select: none;-moz-user-select: none;user-select: none;";
 
 
 
   window.addEventListener("load",async ()=>{
 
 
 
 
 
 
       let img=document.createElement("img");
       img.src=imgsrc;
     img.style.cssText=csstext;
     img.addEventListener("click",makeModalForRankings);
     document.querySelector(".side-controls").appendChild(img);
 
 
   })
 
 
 
 
 })()