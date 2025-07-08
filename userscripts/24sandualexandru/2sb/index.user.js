// ==UserScript==
// @name        Two sides builder
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @version     2
// @author      Alexander_Andercou, Mikarific
// @description 8/26/2024, 6:56:31 PM
// ==/UserScript==

(function(){
  let leftSide=[]
  let rightSide=[]
  let imngsrc="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhLS0gQ3JlYXRlZCB3aXRoIElua3NjYXBlIChodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy8pIC0tPgoKPHN2ZwogICB3aWR0aD0iMTkwLjY1MzMxbW0iCiAgIGhlaWdodD0iMjEyLjA0MjUxbW0iCiAgIHZpZXdCb3g9IjAgMCAxOTAuNjUzMzEgMjEyLjA0MjUxIgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmcxIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIxLjQuMiAoZjQzMjdmNCwgMjAyNS0wNS0xMykiCiAgIHNvZGlwb2RpOmRvY25hbWU9IjJTQi5zdmciCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIGlkPSJuYW1lZHZpZXcxIgogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzAwMDAwMCIKICAgICBib3JkZXJvcGFjaXR5PSIwLjI1IgogICAgIGlua3NjYXBlOnNob3dwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgaW5rc2NhcGU6cGFnZWNoZWNrZXJib2FyZD0iMCIKICAgICBpbmtzY2FwZTpkZXNrY29sb3I9IiNkMWQxZDEiCiAgICAgaW5rc2NhcGU6ZG9jdW1lbnQtdW5pdHM9Im1tIgogICAgIGlua3NjYXBlOnpvb209IjAuNSIKICAgICBpbmtzY2FwZTpjeD0iMzQ5IgogICAgIGlua3NjYXBlOmN5PSI2NTUiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxOTIwIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9Ijk5MSIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iLTkiCiAgICAgaW5rc2NhcGU6d2luZG93LXk9Ii05IgogICAgIGlua3NjYXBlOndpbmRvdy1tYXhpbWl6ZWQ9IjEiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ibGF5ZXIxIiAvPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMxIiAvPgogIDxnCiAgICAgaW5rc2NhcGU6bGFiZWw9IkxheWVyIDEiCiAgICAgaW5rc2NhcGU6Z3JvdXBtb2RlPSJsYXllciIKICAgICBpZD0ibGF5ZXIxIgogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMC4yMTYwNDEsMS43MjAzOTMyKSI+CiAgICA8ZwogICAgICAgaWQ9Imc4Ij4KICAgICAgPHJlY3QKICAgICAgICAgc3R5bGU9ImZpbGw6bm9uZTtmaWxsLW9wYWNpdHk6MTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6MTA7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGlkPSJyZWN0MSIKICAgICAgICAgd2lkdGg9IjE0NSIKICAgICAgICAgaGVpZ2h0PSIxNDUiCiAgICAgICAgIHg9IjMzLjA0MjY5IgogICAgICAgICB5PSI2MC4zMjIxMjEiIC8+CiAgICAgIDxyZWN0CiAgICAgICAgIHN0eWxlPSJmaWxsOm5vbmU7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjg7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGlkPSJyZWN0MiIKICAgICAgICAgd2lkdGg9IjE4LjgyNjY0OSIKICAgICAgICAgaGVpZ2h0PSI0My40MTY1NjEiCiAgICAgICAgIHg9IjE0LjIxNjA0MSIKICAgICAgICAgeT0iMTExLjExMzgzIiAvPgogICAgICA8cmVjdAogICAgICAgICBzdHlsZT0iZmlsbDpub25lO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDo4O3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBpZD0icmVjdDItOCIKICAgICAgICAgd2lkdGg9IjE4LjgyNjY0OSIKICAgICAgICAgaGVpZ2h0PSI0My40MTY1NjEiCiAgICAgICAgIHg9IjE3OC4wNDI2OSIKICAgICAgICAgeT0iMTExLjExMzg0IiAvPgogICAgICA8cmVjdAogICAgICAgICBzdHlsZT0iZmlsbDpub25lO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDo3LjU2MzgyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBpZD0icmVjdDMiCiAgICAgICAgIHdpZHRoPSI4Mi4yNzQ0NjciCiAgICAgICAgIGhlaWdodD0iMjcuMzMxMzg3IgogICAgICAgICB4PSI2NC40MDU0NTciCiAgICAgICAgIHk9IjE1Mi4wNjE5IiAvPgogICAgICA8cmVjdAogICAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDo4Ljg3MTtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgICAgaWQ9InJlY3Q3IgogICAgICAgICB3aWR0aD0iOS4yOTY3MDkxIgogICAgICAgICBoZWlnaHQ9IjI1IgogICAgICAgICB4PSI4Ni42NDU0OTMiCiAgICAgICAgIHk9IjE1NC4zOTMzIiAvPgogICAgICA8cmVjdAogICAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDo4Ljg3MTtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgICAgaWQ9InJlY3Q3LTIiCiAgICAgICAgIHdpZHRoPSI5LjI5NjcwOTEiCiAgICAgICAgIGhlaWdodD0iMjUiCiAgICAgICAgIHg9IjExNS4yNTU2MiIKICAgICAgICAgeT0iMTU0LjM5MzMiIC8+CiAgICAgIDxjaXJjbGUKICAgICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6OC4wOTY4MjtzdHJva2UtZGFzaGFycmF5Om5vbmU7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgICAgaWQ9InBhdGg3IgogICAgICAgICBjeD0iNzYuMDIwNDE2IgogICAgICAgICBjeT0iMTAyLjE5MTUiCiAgICAgICAgIHI9IjE2LjQ1NTIwOCIgLz4KICAgICAgPGNpcmNsZQogICAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDo4LjA5NjgyO3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBpZD0icGF0aDctMiIKICAgICAgICAgY3g9IjEzNS4wNjQ5NCIKICAgICAgICAgY3k9IjEwMi4xOTE1IgogICAgICAgICByPSIxNi40NTUyMDgiIC8+CiAgICAgIDxyZWN0CiAgICAgICAgIHN0eWxlPSJmaWxsOiMwMDAwMDA7ZmlsbC1vcGFjaXR5OjE7c3Ryb2tlOm5vbmU7c3Ryb2tlLXdpZHRoOjcuNTE1NjM7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGlkPSJyZWN0OCIKICAgICAgICAgd2lkdGg9IjEwLjAwMDAxNCIKICAgICAgICAgaGVpZ2h0PSI3NS4wMDAxMDciCiAgICAgICAgIHg9IjQxLjMyMTg3NyIKICAgICAgICAgeT0iMzQuNjI0MzQ4IgogICAgICAgICB0cmFuc2Zvcm09InJvdGF0ZSgtMzUuNTk3OTg1KSIKICAgICAgICAgaW5rc2NhcGU6dHJhbnNmb3JtLWNlbnRlci14PSI0Ny40Nzg0MTgiCiAgICAgICAgIGlua3NjYXBlOnRyYW5zZm9ybS1jZW50ZXIteT0iMTAuOTMyMjQ1IiAvPgogICAgICA8cmVjdAogICAgICAgICBzdHlsZT0iZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDo3LjUxNTYzO3N0cm9rZS1kYXNoYXJyYXk6bm9uZTtzdHJva2Utb3BhY2l0eToxIgogICAgICAgICBpZD0icmVjdDgtMSIKICAgICAgICAgd2lkdGg9IjEwLjAwMDAxNCIKICAgICAgICAgaGVpZ2h0PSI3NS4wMDAxMDciCiAgICAgICAgIHg9Ii0xMzAuMzE2MTMiCiAgICAgICAgIHk9Ii04OC4yNDcyNjkiCiAgICAgICAgIHRyYW5zZm9ybT0ibWF0cml4KC0wLjgxMzEyMTIzLC0wLjU4MjA5NDM3LC0wLjU4MjA5NDM3LDAuODEzMTIxMjMsMCwwKSIKICAgICAgICAgaW5rc2NhcGU6dHJhbnNmb3JtLWNlbnRlci14PSItNDcuNDc4NDE0IgogICAgICAgICBpbmtzY2FwZTp0cmFuc2Zvcm0tY2VudGVyLXk9IjEwLjkzMjIzOSIgLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo="
  let csstext="width: 22px;height:32px;margin-bottom:5px; cursor: pointer;opacity: .8;-webkit-user-select: none;-moz-user-select: none;user-select: none;"
  let useRegex=false;
  let caseSensitive=true;
  let unique=false;
  let crafted=[];
  let running=0;
  let stopProcesses=false;
  let fileString=""
  let xOffset = 0;
  let yOffset = 0;
  let initialX;
  let initialY;

  function triggerEvent( elem ) {

  const event = new MouseEvent('contextmenu', {
  // bubbles: true,
  // cancelable: true, // choose what you need
  // view: window,
  });

  elem.dispatchEvent(event);
  }


  function sleep(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
   function getSave() {

     var items=IC.getItems();
     var save={"recipes":{}};
     for(let item of items)
       {
         var recipes=item.recipes;
          if(recipes)
            {save["recipes"][item.text]=[];
                for(let recipe of recipes)
                  if(items[recipe[0]] && items[recipe[1]])
                   save["recipes"][item.text].push([items[recipe[0]],items[recipe[1]]]);
            }


       }

    return save;

  }



    function AtIntersection(element1, element2,callback,array1=null,array2=null) {
         // console.log("intersection happends");
          const rect1 = element1.getBoundingClientRect();
          const rect2 = element2.getBoundingClientRect();

          if (
              rect1.x < rect2.x + rect2.width &&
              rect1.x + rect1.width > rect2.x &&
              rect1.y < rect2.y + rect2.height &&
              rect1.y + rect1.height > rect2.y) {

            if(element1.classList.contains("instance"))
              {

                 console.log("element1:",element1);
                let instances=IC.getInstances();
                let instance=IC.getInstances().find(x=>x.element!=null?x.element==element1:false);

                IC.removeInstances([instance]);

                element2.appendChild(elementToItem(instance,element2,array1,array2));

                callback(instance)
                ;}

            if(element1.classList.contains("item"))
             {

               var text=element1.getAttribute("data-item-text");


             }




              }

          }

   function elementToItem(element,modal=null,array1ToRemove=null,array2ToRemove=null) {

          let item = document.createElement("div");

          item.classList.add('item');
          const itemEmoji = document.createElement('span');
          itemEmoji.classList.add('item-emoji');
          itemEmoji.appendChild(document.createTextNode(element.emoji ?? '⬜'));




          item.appendChild(itemEmoji);
          item.appendChild(document.createTextNode(` ${element.text} `));
          item.style.display="inline-block";





          item.addEventListener('mousedown', (e) => {
                  if(e.which==3)
                    {

                           modal.removeChild(item);
                      console.log("deletes:",array1ToRemove)
                         if(array1ToRemove){
                           leftSide=leftSide.filter(x=>x.text!=element.text);
                           searchCountSpanLeft.textContent=leftSide.length.toString()+" elements";
                            console.log("deleted:",array1ToRemove,leftSide);
                         }



                        if(array2ToRemove)
                          {  rightSide=rightSide.filter(x=>x.text!=element.text);
                             searchCountSpanRight.textContent=rightSide.length.toString()+" elements";
                             console.log("deleted:",array2ToRemove,rightSide);
                          }



                   }

          });
          return item;

      }




  let searchCountSpanLeft=null,searchCountSpanRight=null;

  function addBulk(target,side="left")
    {

        var v_sidebar = document.querySelector("#sidebar").__vue__;
       let query=v_sidebar.searchQuery;
      if(query && query.trim()!="")
        {
            console.log("query:",query)





       let simplefilter=null;
          if(!useRegex)
           {console.log("NOT regex");
            if(!caseSensitive)
            simplefilter=IC.getItems().filter(x=>x.text.toLowerCase().includes(query));
             else
            simplefilter=IC.getItems().filter(x=>x.text.includes(query));


           }
          else{

           console.log("Use regex for search");
           var re = new RegExp(query,"u");

            if(!caseSensitive)
             re = new RegExp(query,"ui");

            simplefilter=IC.getItems().filter(e=>e.text.match(re));

          }
          if(unique)
          {
            let newSimple=[]
            simplefilter.forEach(x=>{
              if(newSimple.find(y=>(x.text.toLowerCase())==(y.text.toLowerCase()))==null)
                {
                  newSimple.push(x);
                }




            });
            console.log("ns",newSimple)
          simplefilter=newSimple;



          }






       console.log("qr:",simplefilter);
        let count=simplefilter.length;






      for(let elm of simplefilter)
        {
        if(side=="left"){
            leftSide.push(elm);
             target.appendChild(elementToItem(elm,target,leftSide,null))
             searchCountSpanLeft.textContent=count.toString()+" elements"
        }

         if(side=="right"){
          rightSide.push(elm);
          target.appendChild(elementToItem(elm,target,null,rightSide));
          searchCountSpanRight.textContent=count.toString()+" elements"
         }
        if(side=="both")
          {
            leftSide.push(elm);
            rightSide.push(elm);
              target.appendChild(elementToItem(elm,target,leftSide,rightSide))
          }




        }



           if(side=="left"){
             searchCountSpanRight.textContent=leftSide.length.toString()+" elements"

           }
           if(side=="right"){
             searchCountSpanRight.textContent=rightSide.length.toString()+" elements"

           }

        }


    }
  function isInsideRecipes(text1,text2,recips)
  {


  for(let recip of recips)
    {
         for(let r of recip[1])
         {   if(r && r.length>=2)
             if((r[0].text==text1 && r[1].text==text2) || (r[1].text==text1 && r[0].text==text2) )
               return recip[0];
         }


    }

    return false;

  }

  let saveCrafts=false;

    async function mockCraft(a,b)
    { if(!saveCrafts){
      setTimeout(()=>{
      for(let craftid of crafted)
      {
       let instanceToDelete=IC.getInstances().find(x=>x.text==craftid);
        console.log(instanceToDelete);
     if(instanceToDelete!=null)
      IC.removeInstances([instanceToDelete]);

      }},300);
      }
       let elm =IC.getItems().find((x)=>x.text==a.text);
       let elm1 =IC.getItems().find((x)=>x.text==b.text);


     	     var instEl1=await IC.createInstance({
						"text": elm.text,
						"emoji": elm.emoji,
            "itemId":elm.id,
						"x": a.left,
						"y": a.top
					  })
            var instEl2=await IC.createInstance({
						"text": elm1.text,
						"emoji": elm1.emoji,
            "itemId":elm1.id,
						"x": b.left,
						"y": b.top
					  })

           var inst=await IC.craft(
            instEl1,
            instEl2
           );
     var containerVue=document.querySelector(".container").__vue__;
        let response=await containerVue.craftApi(a.text,b.text);
      if(response==null || response.text==null || response.text=="Nothing"){
         IC.removeInstances([instEl1,instEl2]);
          return;

      }
       fileString+=a.text+" + "+b.text+" = "+response.text+"\n";
       crafted.push(response.text);
    }




  function makeProgressionBar(parent)
    { let wrapperDiv=document.createElement("div");
      let barDiv=document.createElement("div");
      let doneDiv=document.createElement("div");
      let infoText=document.createElement("p");
      barDiv.style.margin="auto";
      barDiv.style.width="90%";
      barDiv.style.backgroundColor="gray";
      barDiv.style.height="30px";

      doneDiv.style.width="0%"
      doneDiv.style.height="100%";
      doneDiv.style.backgroundColor="#67ff67";

      wrapperDiv.style.display="flex";
      wrapperDiv.style.justifyContent="center";
      wrapperDiv.style.flexDirection="column";
     // wrapperDiv.style.alignItems="center";

      barDiv.appendChild(doneDiv);
      wrapperDiv.appendChild(barDiv);
      wrapperDiv.appendChild(document.createElement("br"));
      wrapperDiv.appendChild(infoText);
      infoText.style.textAlign="center";
      wrapperDiv.marginTop="5px";
      wrapperDiv.marginBotom="15px";
      parent.appendChild(wrapperDiv);
      return [doneDiv,infoText,wrapperDiv];


    }
  function updateProgressionBar(bar,info,procent,current,total)
  {
   bar.style.width=Math.ceil(procent).toString()+"%";
   info.textContent=procent.toFixed(3)+"%"+" ("+current.toString()+" / "+total.toString()+")";
  }



   async  function makeTwoSidedDiv(initial=null){
        leftSide=[];
        rightSide=[];
        crafted=[];
        useRegex=false;
        caseSensitive=true;
        unique=false;
        saveCrafts=false;

        let startingDiv=document.createElement("div");

      if(document.querySelector(".two-sided"))
        document.querySelector(".two-sided").parentNode.removeChild(document.querySelector(".two-sided"));

    startingDiv.classList.add("two-sided")
    startingDiv.style.position="absolute";
   // startingDiv.style.cursor="move"
    //startingDiv.style.height= startingDiv.style.width="300px";
    startingDiv.style.top=(100).toString()+"px";
    startingDiv.style.left=(document.querySelector("#sidebar").getBoundingClientRect().left/2-150).toString()+"px";
    startingDiv.style.borderColor="white";
    startingDiv.style.zIndex="1";
      startingDiv.style.width="500px";
      startingDiv.style.minHeight="400px";


     let caseingUseDiv=document.createElement("div")
     let caseingUseInput=document.createElement("input")
    caseingUseInput.style.width= caseingUseInput.style.height="20px";
    caseingUseInput.type="checkbox";
     let caseingUseSpan=document.createElement("span")
      caseingUseSpan.textContent="Case";
     let caseingUseSpan2=document.createElement("span")
      caseingUseSpan2.textContent="insensitive";



      caseingUseInput.style.opacity="1";

      caseingUseInput.addEventListener("change",()=>{
      caseSensitive=!(caseingUseInput.checked);


       })
  caseingUseDiv.style.border="2px white solid";
  caseingUseDiv.appendChild(caseingUseSpan);
  caseingUseDiv.appendChild(caseingUseInput);
  caseingUseDiv.appendChild(caseingUseSpan2);
  caseingUseDiv.style.float="right";
  caseingUseDiv.style.width="75px";
  caseingUseDiv.style.height="50px";
  caseingUseDiv.style.zIndex="2";
  caseingUseDiv.style.position="relative";



     let uniqueDiv=document.createElement("div")
     let uniqueInput=document.createElement("input")
     uniqueInput.style.width= uniqueInput.style.height="20px";
     uniqueInput.type="checkbox";
     let uniqueSpan=document.createElement("span")
      uniqueSpan.textContent="Unique";
      uniqueInput.style.opacity="1";

      uniqueInput.addEventListener("change",()=>{
      unique=(uniqueInput.checked);


       });

  uniqueDiv.style.border="2px white solid";
  uniqueDiv.appendChild(uniqueSpan);
  uniqueDiv.appendChild(uniqueInput);
  uniqueDiv.style.float="right";
  uniqueDiv.style.width="75px";
  uniqueDiv.style.height="50px";
  uniqueDiv.style.zIndex="2";
  uniqueDiv.style.position="relative";



  let saveCraftsDiv=document.createElement("div")
    saveCraftsDiv.style.border="2px white solid";
     let saveCraftsInput=document.createElement("input")
     saveCraftsInput.style.width= saveCraftsInput.style.height="20px";
      saveCraftsInput.type="checkbox";
     let saveCraftsSpan=document.createElement("span")
      saveCraftsSpan.textContent="Save crafts on board";
      saveCraftsInput.style.opacity="1";

      saveCraftsInput.addEventListener("change",()=>{
      saveCrafts=saveCraftsInput.checked;


       })
  saveCraftsDiv.appendChild(saveCraftsSpan);
  saveCraftsDiv.appendChild(saveCraftsInput);
  saveCraftsDiv.style.float="right";
  saveCraftsDiv.style.width="100px";
  saveCraftsDiv.style.height="50px";
  saveCraftsDiv.style.zIndex="2";
  saveCraftsDiv.style.position="relative";




    let regexUseDiv=document.createElement("div")
    regexUseDiv.style.border="2px white solid";
     let regexInput=document.createElement("input")
     regexInput.style.width= regexInput.style.height="20px";
      regexInput.type="checkbox";
     let regexSpan=document.createElement("span")
      regexSpan.textContent="Regex";
      regexInput.style.opacity="1";

      regexInput.addEventListener("change",()=>{
      useRegex=regexInput.checked;


       })
  regexUseDiv.appendChild(regexSpan);
  regexUseDiv.appendChild(regexInput);
  regexUseDiv.appendChild(regexSpan);
  regexUseDiv.appendChild(regexInput);
  regexUseDiv.style.float="right";
  regexUseDiv.style.width="50px";
  regexUseDiv.style.height="50px";
  regexUseDiv.style.zIndex="2";
  regexUseDiv.style.position="relative";


      let combineButton=document.createElement("img");


     combineButton.src="data:image/png;base64,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"
     combineButton.style.float="right";
     combineButton.style.width=combineButton.style.height="50px";
     combineButton.style.position="relative";
     combineButton.style.zIndex="2";
     combineButton.style.borderRadius="100%";







     combineButton.addEventListener("click",async ()=>{

          running+=1;

            let bardata=null;
              if(initial)
                {
                   bardata=makeProgressionBar(initial)

                }






             if(document.querySelector(".two-sided"))
               document.querySelector(".two-sided").parentNode.removeChild(document.querySelector(".two-sided"));

         fileString="";
           console.log(leftSide,rightSide)

             let saveFile=getSave();
             let recips=Object.entries(saveFile["recipes"])


           let doneOne=false
           let index=0;
           let left=document.querySelector("#sidebar").getBoundingClientRect().left/2;
           let combinations=[];
           let rinst=null;
           let inst=null;
          let key=false;
          for(let inst2 of leftSide)
          for(let rinst2 of rightSide)
            combinations.push([inst2,rinst2]);
          console.log("combinations",combinations);


     for(let combination of combinations){

       if(stopProcesses)
         {
           console.log("Builder forcefully stopped");


             break;

         }



        index++;
       if(bardata)
         {  //console.log("WE HAVE BAR")
            updateProgressionBar(bardata[0],bardata[1],(index/combinations.length)*100,index,combinations.length);

         }

        rinst=combination[1];
        inst=combination[0];

        if(combinations.slice(0,index-1).find(x=>(x[0]==inst.text && x[1]==rinst.text) || (x[1]==inst.text && x[0]==rinst.text) )!=null)
          {  console.log("bypass as done already");
               continue;

          }


                   key=isInsideRecipes(inst.text,rinst.text,recips)
                   if(key!=false)
                     {    console.log("already has:",inst.text," ",rinst.text)
                            fileString+="Already had: "+inst.text+" + "+rinst.text+" = "+key+"\n";
                            doneOne=true;
                      console.log("number of combinations done from total: "+index+" / "+combinations.length)
                        continue;

                     }
                     console.log("combines:",inst.text," ",rinst.text)
                 doneOne=true;



                await mockCraft({emoji:inst.emoji,text:inst.text,top:window.innerHeight/2,left:left,height:41,width:100},
                                                                                     {emoji:rinst.emoji,text:rinst.text,top:window.innerHeight/2,left:left+100,height:41,width:100});

                console.log("number of combinations done from total: "+index+" / "+combinations.length)
                await sleep(500);


         };





        running-=running>0?1:0;
        if(bardata && initial)
             {
               initial.removeChild(bardata[2]);
             }

             if(doneOne){
              const link = document.createElement("a");

  // Create a blog object with the file content which you want to add to the file
               const file = new Blob([fileString], { type: 'text/plain' });

  // Add file content in the object URL
                link.href = URL.createObjectURL(file);

  // Add file name
                 link.download = "result.txt";

  // Add click event to <a> tag to save file.
                link.click();
                URL.revokeObjectURL(link.href);
             }




       })

   let closeButton=document.createElement("button");
       closeButton.textContent="❌";
       closeButton.style.float="right";
       closeButton.style.width=closeButton.style.height="50px";
       closeButton.style.position="relative";
       closeButton.style.zIndex="2";
       closeButton.style.borderRadius="100%";
       closeButton.addEventListener("click",()=>{
               if(document.querySelector(".two-sided"))
               document.querySelector(".two-sided").parentNode.removeChild(document.querySelector(".two-sided"));
              leftSide=[];
              rightSide=[];


       })
   closeButton.addEventListener("mouseover",()=>{
     closeButton.style.backgroundColor="red";

   })
   closeButton.addEventListener("mouseleave",()=>{
     closeButton.style.backgroundColor="#6B6B6B";

   })






     let titleDiv=document.createElement("div");
      titleDiv.style.height="50px";
      titleDiv.style.position="relative";





       let headerDiv=document.createElement("div");
      headerDiv.style.height="70px";
      headerDiv.style.position="relative";




     let leftText=document.createElement("span");
      leftText.textContent="Left Side";
      leftText.style.left="20%";
      leftText.style.position="absolute"
      let rightText=document.createElement("span");
      rightText.textContent="Right Side";
      rightText.style.left="66%";
      rightText.style.position="absolute"








      titleDiv.appendChild(leftText);
      titleDiv.appendChild(rightText);

    startingDiv.style.resize="both";
    startingDiv.style.border="solid 3px var(--border-color)";
    startingDiv.style.transition="background-color 1000ms linear";
    startingDiv.style.backgroundColor="black";
    document.querySelector(".container").appendChild(startingDiv);
    startingDiv.style.resize="both";
    let leftDiv=document.createElement("div");
       leftDiv.style.overflowY="auto";







    let rightDiv=document.createElement("div");
         rightDiv.style.overflowY="auto";



     let ActionsDiv= document.createElement("div");
     ActionsDiv.style.height="50px";
     ActionsDiv.style.position="relative";
     let leftPlus=document.createElement("button");
     leftPlus.textContent="➕"
     leftPlus.addEventListener("click",()=>addBulk(leftDiv,"left"))
     leftPlus.style.borderRadius="100%";
     leftPlus.style.border="2px solid white";
        let rightPlus=document.createElement("button");
     rightPlus.textContent="➕"
     rightPlus.addEventListener("click",()=>addBulk(rightDiv,"right"))
     rightPlus.style.borderRadius="100%";
     rightPlus.style.border="2px solid white";


        let leftPlusFile=document.createElement("button");
     leftPlusFile.textContent="📄"
     leftPlusFile.addEventListener("click",()=>
                               {

         let uploadFile=document.createElement("input")
          uploadFile.type="file";
          document.documentElement.appendChild(uploadFile);
          uploadFile.addEventListener("change",(event)=>{
                                       var fileReader=new FileReader();

                                     fileReader.onload=function(){
                                     fileReader.result;
                                       let lines=fileReader.result.split('\n')
                                       for(let line of lines)
                                         {

                                            let elem=IC.getItems().find(x=>x.text==line.trim())
                                            if(elem){

                                                leftSide.push(elem);
                                                leftDiv.appendChild(elementToItem(elem,leftDiv,leftSide,null));

                                            }

                                         }



                                                }

                                      fileReader.readAsText(event.target.files[0]);
                                       document.documentElement.removeChild(uploadFile);


                                      })



           uploadFile.click();



     });
     leftPlusFile.style.borderRadius="100%";
     leftPlusFile.style.border="2px solid white";
     leftPlusFile.style.width="50px"
        let rightPlusFile=document.createElement("button");
     rightPlusFile.textContent="📄"
     rightPlusFile.style.width="50px"
     rightPlusFile.addEventListener("click",()=>
                               {

         let uploadFile=document.createElement("input")
          uploadFile.type="file";
          document.documentElement.appendChild(uploadFile);
          uploadFile.addEventListener("change",(event)=>{
                                       var fileReader=new FileReader();

                                     fileReader.onload=function(){
                                     fileReader.result;
                                       let lines=fileReader.result.split('\n')
                                       for(let line of lines)
                                         {

                                            let elem=IC.getItems().find(x=>x.text==line.trim())
                                            if(elem){

                                                rightSide.push(elem);
                                                rightDiv.appendChild(elementToItem(elem,rightDiv,null,rightSide));

                                            }

                                         }


                                         document.documentElement.removeChild(uploadFile);
                                                }

                                      fileReader.readAsText(event.target.files[0]);



                                      })



           uploadFile.click();



     });




     rightPlusFile.style.borderRadius="100%";
     rightPlusFile.style.border="2px solid white";
     let leftExportButton=document.createElement("button")
     let rightExportButton=document.createElement("button")
     leftExportButton.textContent="⏫️";
     rightExportButton.textContent="⏫️";
     leftExportButton.style.width="50px"
     rightExportButton.style.width="50px"
      leftExportButton.style.borderRadius="100%"
     rightExportButton.style.borderRadius="100%"
     leftExportButton.addEventListener("click",()=>{
      let fileString=""
       leftSide.forEach(el=>{

         fileString+=el.text+"\n";

       });
                const link = document.createElement("a");
                const file = new Blob([fileString], { type: 'text/plain' });
                link.href = URL.createObjectURL(file);
                link.download = "leftSide.txt";
                link.click();
                URL.revokeObjectURL(link.href);



     })

   rightExportButton.addEventListener("click",()=>{
      let fileString=""
       rightSide.forEach(el=>{

         fileString+=el.text+"\n";

       });
                const link = document.createElement("a");
                const file = new Blob([fileString], { type: 'text/plain' });
                link.href = URL.createObjectURL(file);
                link.download = "rightSide.txt";
                link.click();
                URL.revokeObjectURL(link.href);



     })






     ActionsDiv.style.display="flex";
     ActionsDiv.style.justifyContent="space-between";


     searchCountSpanLeft=document.createElement("span");
     searchCountSpanRight=document.createElement("span");
     searchCountSpanLeft.textContent="";
     searchCountSpanRight.textContent="";



     ActionsDiv.appendChild(leftPlus);
     ActionsDiv.appendChild(leftPlusFile);
     ActionsDiv.appendChild(leftExportButton);
     ActionsDiv.appendChild(searchCountSpanLeft);
     ActionsDiv.appendChild(searchCountSpanRight);
     ActionsDiv.appendChild(rightExportButton);
     ActionsDiv.appendChild(rightPlusFile);
     ActionsDiv.appendChild(rightPlus);









     rightPlus.style.width=rightPlus.style.height= leftPlus.style.width=leftPlus.style.height="50px";

    leftDiv.style.float="left";
    leftDiv.style.scrollbarWidth="none";
    rightDiv.style.scrollbarWidth="none";

    leftDiv.style.width="50%";
    leftDiv.style.height="400px";
    leftDiv.style.minHeight="100%";
    leftDiv.style.border="solid 3px var(--border-color)";
    leftDiv.style.borderTop="none";
    leftDiv.style.borderLeft="none";
    rightDiv.style.float="right";




    rightDiv.style.width="50%";
    rightDiv.style.height="400px";
    rightDiv.style.border="solid 3px var(--border-color)";
    rightDiv.style.borderTop="none";
    rightDiv.style.borderRight="none";
    rightDiv.style.minHeight="100%";



       let bothPlus=document.createElement("button");
      bothPlus.textContent="2➕"
      bothPlus.addEventListener("click",()=>{addBulk(leftDiv,"left");addBulk(rightDiv,"right");})
      bothPlus.style.borderRadius="100%";
      bothPlus.style.border="2px solid white";
      bothPlus.style.float="right";
      bothPlus.style.width=  bothPlus.style.height="50px";
      bothPlus.style.position="relative";
      bothPlus.style.zIndex="2";



    startingDiv.appendChild(closeButton);
    startingDiv.appendChild(combineButton);
    startingDiv.appendChild(bothPlus);
    startingDiv.appendChild(regexUseDiv);
    startingDiv.appendChild(caseingUseDiv);
    startingDiv.appendChild(uniqueDiv);
    startingDiv.appendChild(saveCraftsDiv);
    startingDiv.appendChild(headerDiv);
    startingDiv.appendChild(titleDiv);
    startingDiv.appendChild(ActionsDiv);
    startingDiv.appendChild(leftDiv);
    startingDiv.appendChild(rightDiv);






  console.log("fine before observer")

    let instancesObserver=new MutationObserver( (mutations) => {

                          for(let mutation of mutations){

      //  console.log("removedNodes:",mutation.removedNodes);
                            for(let node of mutation.addedNodes)
                            {
                              node.addEventListener("mouseup", (event) => {

                                  console.log(event.clientX, event.clientY);

                                      AtIntersection(node,leftDiv,(elm)=>{
                                         console.log("leftside",elm);
                                         leftSide.push(elm);
                                        searchCountSpanLeft.textContent=leftSide.length.toString()+" elements";

                                      },leftSide,null);
                                      AtIntersection(node,rightDiv,(elm)=>{
                                            console.log("rightside",elm);
                                           rightSide.push(elm);
                                             searchCountSpanRight.textContent=rightSide.length.toString()+" elements";

                                      },null,rightSide);

                              });
                            }


                         }})


                       instancesObserver.observe(document.querySelector("#instances"),{

                      childList        : true,
                      subtree          : true,
                      attributeOldValue: true,

                      })
    let instancesObserver2=new MutationObserver( (mutations) => {

                          for(let mutation of mutations){

      //  console.log("removedNodes:",mutation.removedNodes);
                            for(let node of mutation.addedNodes)
                            {
                              node.addEventListener("mouseup", (event) => {

                                  console.log(event.clientX, event.clientY);

                                      AtIntersection(node,leftDiv,(elm)=>{
                                         console.log("leftside",elm);
                                         leftSide.push(elm);
                                        searchCountSpanLeft.textContent=leftSide.length.toString()+" elements";

                                      },leftSide,null);
                                      AtIntersection(node,rightDiv,(elm)=>{
                                            console.log("rightside",elm);
                                           rightSide.push(elm);
                                             searchCountSpanRight.textContent=rightSide.length.toString()+" elements";

                                      },null,rightSide);

                              });
                            }


                         }})


                       instancesObserver2.observe(document.querySelector("#instances-top"),{

                      childList        : true,
                      subtree          : true,
                      attributeOldValue: true,

                      })
  console.log("fine after observer")











    }

  let onPopUp=false;
  let currentX=null;
  let currentY=null;
  function initialModal()
    {

       let chooseToStartStopMenu=document.querySelector(".initial-choice-builder");
      if(chooseToStartStopMenu==null)
      {
         document.addEventListener("mousedown",(e)=>{
           let x=e.clientX;
           let y=e.clientY;
           initialX = x - xOffset;
           initialY = y - yOffset;
           e.target==chooseToStartStopMenu?onPopUp=true:onPopUp=false;
           chooseToStartStopMenu.style.cursor="move";

         });
         document.addEventListener("mousemove",(e)=>{
           let x=e.clientX;
           let y=e.clientY;
           if(onPopUp)
           {
            currentX = x - initialX;
            currentY = y - initialY;

             xOffset = currentX;
             yOffset = currentY;
             chooseToStartStopMenu.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`


           }
         });
           document.addEventListener("mouseup",(e)=>{
           let x=e.clientX;
           let y=e.clientY;
              chooseToStartStopMenu.style.cursor="default";
           if(onPopUp)
           {

           onPopUp=false;

           }
         });



        chooseToStartStopMenu=document.createElement("dialog");
       chooseToStartStopMenu.classList.add("initial-choice-builder");
       chooseToStartStopMenu.style.position="absolute";

       chooseToStartStopMenu.style.top="20%";
       chooseToStartStopMenu.style.width="300px";
       chooseToStartStopMenu.style.padding="0px";
          chooseToStartStopMenu.style.left=(document.querySelector("#sidebar").getBoundingClientRect().left/2).toString()+"px";
          chooseToStartStopMenu.style.transform="translate(-50%, -50%)";

          let closebutton=document.createElement("div");
          closebutton.appendChild(document.createTextNode("❌"));


         closebutton.addEventListener("click",()=>{
         chooseToStartStopMenu.close();
       })
     let stopDiv=document.createElement("div");
          stopDiv.addEventListener("click",()=>{
            stopProcesses=true;
            chooseToStartStopMenu.close();
          });

         let buttonDiv=document.createElement("div");
          buttonDiv.appendChild(closebutton);
          closebutton.style.float="right";

          buttonDiv.style.width="100%"   ;

          let stopButtonText=document.createElement("p");
          stopButtonText.textContent="Stop all builders";

          stopButtonText.style.textAlign="center";
          stopDiv.appendChild(stopButtonText);

          stopDiv.style.display="flex";
          stopDiv.style.justifyContent="center";
          stopDiv.style.alignItems="center";


          stopDiv.style.width="99%"
          stopDiv.style.marginBottom="5px";
          stopDiv.style.height="50px";
          stopDiv.style.border="2px solid red" ;
          stopDiv.addEventListener("mouseover",()=>{
           stopButtonText.style.color="red";
         });
         stopDiv.addEventListener("mouseout",()=>{
           stopButtonText.style.color="var(--text-color)";
         });
         stopDiv.style.borderRadius="10px";

          let startDiv=document.createElement("div");
            startDiv.addEventListener("click",()=>{
            stopProcesses=false;
            chooseToStartStopMenu.close();
            makeTwoSidedDiv(chooseToStartStopMenu);
          });
          let startButtonText=document.createElement("p");
          startButtonText.textContent="Start a new builder";
          startButtonText.style.textAlign="center";
          startDiv.style.borderRadius="10px";
          startDiv.appendChild(startButtonText);
          startDiv.style.height="50px";
          startDiv.style.border="2px solid green";
          startDiv.style.display="flex";
          startDiv.style.justifyContent="center";
          startDiv.style.alignItems="center";
          startDiv.style.marginBottom="50px";






          startDiv.addEventListener("mouseover",()=>{
           startButtonText.style.color="green";
         })
         startDiv.addEventListener("mouseout",()=>{
           startButtonText.style.color="var(--text-color)";
         })

          chooseToStartStopMenu.appendChild(buttonDiv);
          chooseToStartStopMenu.appendChild(document.createElement("br"));
          chooseToStartStopMenu.appendChild(stopDiv);
          chooseToStartStopMenu.appendChild(startDiv);
          document.querySelector(".container").appendChild(chooseToStartStopMenu);
      }



      if(running<=0)
      {  stopProcesses=false;
         makeTwoSidedDiv(chooseToStartStopMenu);

      }else
        { console.log("no problem here");
          chooseToStartStopMenu.showModal();
        }




    }

    window.addEventListener("load",async ()=>{
   let img=document.createElement("img");

      img.src=imngsrc;
      img.style.cssText=csstext;
      img.classList.add("random");
      img.setAttribute("data-v-1748f434","");
      img.addEventListener("click",async ()=>{
              initialModal();

                                 })

    document.querySelector(".side-controls").appendChild(img);




    },false);









  })()
