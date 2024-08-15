// ==UserScript==
// @name        Search by position
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @author      -
// @description 8/15/2024, 4:32:48 PM
// ==/UserScript==
// ==UserScript==
// @name        Emoji search
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @author      -
// @description 8/14/2024, 8:19:36 PM
// ==/UserScript==
(function(){
    let complexFilter=null;
    let beforeFilter=null;
    let usePosition=false;
    let typeOfPosition=0;
    let percentage=0;
    let inputFocused=false;
  
        window.addEventListener('load', async () => {
  
  
  
      let parent=document.querySelector(".sidebar-header");
  
  
  
      let newDiv=document.createElement("div");
  
      let label=document.createElement("label");
      label.textContent="Search only at given position:"
      let checkbox=document.createElement("input");
      checkbox.type="checkbox";
      checkbox.addEventListener("change",()=>{
        usePosition=checkbox.checked;
        if(usePosition)
        {
  
  
          let chooseType=document.querySelector(".choose-position");
             if(chooseType==null)
                 {
                   chooseType=document.createElement("div");
                   chooseType.classList.add("choose-position");
                   let optionsDiv=document.createElement("div");
                   let selectedOption=document.createElement("p");
                    selectedOption.textContent="Choose an option";
                    selectedOption.addEventListener( "dblclick",()=>{
                    optionsDiv.hidden=false;
  
  
  
                     });
  
  
                   for(let option of [0,1,2])
                   {
                     let optionDiv=document.createElement("div");
                     let optionText=document.createElement("span");
                     optionText.textContent=option==0?"Starts with query":(option==1?"Ends with query":"First char from query at position");
  
                     optionDiv.append(optionText);
                     optionDiv.addEventListener("mouseover",()=>{
                         optionDiv.style.backgroundColor="gray";
  
                     });
                      optionDiv.addEventListener("mouseleave",()=>{
                         optionDiv.style.backgroundColor="var(--item-bg)";
  
                     });
  
  
  
                     optionDiv.addEventListener( "dblclick",()=>{
                        selectedOption.textContent=optionText.textContent;
                        if(option==2)
                           selectedOption.textContent+=" "+percentage.toString()+" %";
                        typeOfPosition=option;
                        optionsDiv.hidden=true;
                       inputFocused=false;
  
                     });
  
  
  
                     if(option==2)
                     {
                       let percentageOptionInput=document.createElement("input");
  
                       percentageOptionInput.type="number";
                       percentageOptionInput.placeholder="0->100"
                       percentageOptionInput.min=0;
                       percentageOptionInput.max=100;
                       optionDiv.append(percentageOptionInput);
                       let spanPer=document.querySelector("span");
                       spanPer.textContent="%";
                        optionDiv.append(spanPer);
  
  
  
  
  
                           window.addEventListener('keydown', (event) => {
  
                             if (inputFocused)
                               {
  
                                 percentageOptionInput.focus();
  
  
                                }});
                        percentageOptionInput.addEventListener("focus",()=>{
                          inputFocused=true;
  
  
  
  
                        })
  
                       percentageOptionInput.addEventListener("input",()=>{
  
                         percentage=Number(percentageOptionInput.value);
  
                       })
  
                     }
  
                    optionsDiv.appendChild(optionDiv);
  
                   }
  
                    chooseType.appendChild(selectedOption);
                    chooseType.appendChild(optionsDiv);
                     console.log(newDiv);
                    newDiv.appendChild(chooseType);
  
  
                 }
                  else
                   {
                    chooseType.children[0].textContent="Choose an option";
  
                   }
  
        }else
          {
            if(document.querySelector(".choose-position")!=null)
             {
                document.querySelector(".choose-position").parentNode.removeChild(document.querySelector(".choose-position"));
                inputFocused=false;
  
             }
  
          }
  
      });
      checkbox.style.width="15px";
      checkbox.style.height="15px";
      checkbox.style.borderColor="var(--border-color)";
      checkbox.style.opacity="1";
      checkbox.style.margin="3px";
  
      if(document.querySelector(".sidebar-search-filters")==null)
       { console.log("first");
        newDiv.appendChild(document.querySelector(".sidebar-search"));
        newDiv.classList.add("sidebar-search-filters");
        newDiv.style.width="100%";
        parent.insertBefore(newDiv,parent.firstChild)
       }else
       {newDiv=document.querySelector(".sidebar-search-filters");
         newDiv.style.width="100%";
       }
  
  
  
        newDiv.appendChild(document.createElement("br"));
        newDiv.appendChild(label);
        newDiv.appendChild(checkbox);
  
        if(complexFilter==null)
             complexFilter=  unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.searchResults.getter;
  
  
  
  
  
  
         unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._computedWatchers.searchResults.getter=
                 exportFunction(() => {
  
  
  
           let returnedByComplexFilter= unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements;
  
  
  
  
            let query= unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].searchQuery;
             // console.log("what filter returns",returnedByComplexFilter);
  
          // unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].searchQuery=query;
  
           let dummy=[...returnedByComplexFilter];
           if(usePosition)
            {
            switch(typeOfPosition)
           {
             case 0:{
  
  
              return   cloneInto(dummy.filter(x=>RegExp("^"+query).test(x.text)),unsafeWindow);
  
               } break;
             case 1:{
  
                   return   cloneInto(dummy.filter(x=>RegExp(query+"$").test(x.text)),unsafeWindow);
  
             } break;
             case 2:
               {
  
                 return  dummy.filter(x=> {return x.text[Math.round(Math.min((x.text.length-1)*(percentage/100),x.text.length-1))]==query[0]});
  
               }
  
  
  
  
              ;
  
  
  
  
  
             }
  
  
  
  
              // cloneInto(query,unsafeWindow);
  
            return cloneInto(dummy,unsafeWindow);
           }
           else
           return cloneInto(complexFilter.call(unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]),unsafeWindow);
  
  
  
  
  
           }, unsafeWindow);}, false);
  
  
  })();