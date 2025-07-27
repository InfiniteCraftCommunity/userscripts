// ==UserScript==
// @name        IB Smart filters
// @namespace   Violentmonkey Scripts
// @match       https://infinibrowser.wiki/collection/*
// @match       https://neal.fun/infinite-craft/*
// @grant         GM.getValue
// @grant         GM.setValue
// @require       https://infinibrowser.wiki/static/lib/savefile.js?v=5
// @version     1.1
// @author      -
// @description 7/26/2025, 2:58:58 AM
// ==/UserScript==
(function(){

  let filters={
    "created":false,
    "not-created":false,
    "goals":false,
  };

  let useIC=true;
  let items=[];
  let countElements=0;

let uploadImageSrc="data:image/png;base64,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"
let filename="";

function $initInfiniteCraft() {
  const API = document.querySelector(".container").__vue__;

  let elementCount = 0;
  const storeElements = () => {
    elementCount = API.items.length;
    GM.setValue(
      "elements",
      API.items.map((x) => x.text.toLowerCase()).join("\x00")
    );
   GM.setValue("modified",true);
  };

  const craftApi = API.craftApi;
  API.craftApi = async function (a,b) {
    const result = await craftApi.apply(this, [a, b]);
    setTimeout(() => {
      if (elementCount != API.items.length) {
        storeElements();
      }
    });

    return result;
  };

  const switchSave = API.switchSave;
  API.switchSave = async function () {
    const res = await switchSave.apply(this, arguments);
    setTimeout(storeElements, 16);
    return res;
  }

  const addAPI = API.addAPI;
  API.addAPI = function () {
    setTimeout(storeElements, 16);

    API.addAPI = addAPI;
    return addAPI.apply(this, arguments);
  }
  storeElements();
}


window.addEventListener("load",()=>{

  if (window.location.host == "neal.fun") {
    if(useIC)
    $initInfiniteCraft();
  } else
  {

  let keys=Object.keys(filters);
  let itemsKeys=[]
  async function applyFiltersOnElement(element)
  {
    let text=element.childNodes[1].textContent.toLowerCase();
      let hide=true
    let usedFilter=false;

      if(useIC)
        {

          if(itemsKeys.length<=0)
            {
              items= new Set((await GM.getValue("elements", "")).split("\x00"));
              itemsKeys=Object.keys(items);
            }

        }
       let usefulKeys=keys.filter(x=>filters[x])

     if(items)
      for(let key of usefulKeys)
        {
          switch(key)
            {
              case "created":{
                         usedFilter=true;

                    if(items.has(text))
                       {
                         hide=false
                       }

              } break;
              case "not-created":{

                      usedFilter=true;
                       //  console.log("use non-created")
                          if((!items.has(text)) && !(element.classList.contains("goal")))
                       {
                         hide=false;
                         // console.log("not created")
                       }



              } break;
              case "goals":{

                        usedFilter=true;
                       if(element.classList.contains("goal"))
                        {
                               hide=false;
                        }
                        };
                break;

            }
        }
      if(usedFilter && hide )
        {
          element.style.display="none";

        }else
         {
            element.style.display="block";
            countElements++;
            updateSearchBar(countElements);
          }



  }



  async function applyFiltersOnAll()
  {
    let elements=Array.from(document.querySelectorAll("#infiniscroll .item"));
    countElements=0;
    for(let element of elements)
    {
      applyFiltersOnElement(element);

    }
  }
   function observingMethod()
  {
      const recipeTree = document.getElementById("infiniscroll");

    const observer = new MutationObserver((e) => {
    for (const mutation of e) {
                    if (mutation.addedNodes.length > 0) {
                        for (const node of mutation.addedNodes) {


                   if( node.classList.contains("item"))
                        {
                         applyFiltersOnElement(node);

             }}}}}
      );

    observer.observe(recipeTree, { childList: true });
    setInterval(async ()=>{
     let modified=await GM.getValue("modified");
    console.log("MODIFIED:",modified)
     if(modified)
       {  GM.setValue("modified",false);
          if(useIC)
            { items={};
              itemsKeys=[]
              applyFiltersOnAll();
            }
       }

   },1000)



  }
    function updateSearchBar(numbers)
    {
      let searchBar=document.querySelector("#search_input");
      searchBar.placeholder="Search from "+numbers+" elements...";
    }




      function createFilterUI(filter)
  {
     let divFilter=document.querySelector(".filter_"+filter);
     if(divFilter==null)
     {  divFilter=document.createElement("span");
        divFilter.classList.add("filter_"+filter);
       /* divFilter.style.cssText=`display: inline-flex;
        align-items: center;
        background-color: #2c2c2c;
        color: #f1f1f1;
        border-radius: 20px;
        padding: 6px 12px;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        transition: background-color 0.3s ease;`
        */

        divFilter.textContent=filter=="created"?"Items you do have":filter=="not-created"?"Items you don't have":filter=="goals"?"Desired Elements":"No known filter";
        document.querySelector("#active_filters").appendChild(divFilter);
        divFilter.addEventListener("click",()=>{
        divFilter.parentNode.removeChild(divFilter);
        filters[filter]=false;
          setTimeout( ()=>applyFiltersOnAll());

                                   })
     }
  }
    function createExztraButton()
{
let button=document.createElement("button");
  button.classList.add("filter");
  button.textContent="+";
  document.querySelectorAll(".filters")[2].appendChild(button);
  button.addEventListener("click",()=>{
  let n=_("div.smart_filter");
    n.append(_("span","Use IC for Smart filters"));
    n.append(_("input","Use IC for Smart filters",{
      type:"radio",
      name:"source_filters",
      checked:useIC,
      onchange(e)
     {
           if(e.target.checked) {
            useIC=true
           let uploadFileDiv=document.querySelector(".upload-savefile-filters");

           if(uploadFileDiv)
             e.target.parentNode.removeChild(uploadFileDiv)
           }


     }

    }));
     n.append(_("br",""));
     n.append(_("span","Use savefile for Smart filters"));
    async function onClickUploadButton()
    {
            let uploadInput=document.createElement("input");
                   uploadInput.type="file";
                   uploadInput.style.display="none";
                   document.querySelector("body").appendChild(uploadInput);
                   uploadInput.addEventListener("change",async (e)=>{
                   let uploadP=document.querySelector(".savefile_name");
                     uploadP.textContent=uploadInput.files[0].name;
                     filename=uploadInput.files[0].name;

                      const t =new Uint8Array(await uploadInput.files[0].arrayBuffer()); // Modern way

                     let r = await ICF.SaveFile.decode(t, {
                        generateReverseRecipeMap: !1
                       })

                     if(r && r.elements)
                       {
                          let textOfItems=r.elements.map(x=>x.text.toLowerCase());

                          items=new Set(textOfItems.slice());
                          itemsKeys=Objecr.keys(items);
                          console.log("RRRR:",items);
                          setTimeout(()=>applyFiltersOnAll());
                       }






                   })
                   uploadInput.click();

    }

    function onChangeFileInput(e)
    {
             if(e.target.checked) {
           let uploadFileDiv=document.querySelector(".upload-savefile-filters");
           if(uploadFileDiv==null)
             {
               useIC=false;
               uploadFileDiv=document.createElement("div");
               uploadFileDiv.classList.add("upload-savefile-filters");
               let uploadButton=document.createElement("img");

                 uploadButton.src=uploadImageSrc;
                 uploadButton.style.width="100px";
                 uploadButton.style.height="100px";
                 uploadFileDiv.appendChild(uploadButton);
               let uploadP=document.createElement("p");
                uploadP.classList.add("savefile_name");
                uploadFileDiv.appendChild(document.createElement("br"));
                uploadFileDiv.appendChild(uploadP);

                 e.target.parentNode.appendChild(uploadFileDiv)
                 uploadButton.addEventListener("click",()=>{
                  onClickUploadButton();

                 })
             }

           }


    }


     n.append(_("input","Use IC for Smart filters",{
      type:"radio",
      name:"source_filters",
      checked:!useIC,
      onchange(e)
     {
       onChangeFileInput(e);

     }

    }));
    n.append(_("br",""));
    n.append(_("span","Created filter"));
    n.append(_("input","",{
      onchange(e)
      {
        console.log("Created filter",e.target.checked);
        filters["created"]=e.target.checked;



        if(filters["created"])
          {  let filter=document.querySelector(".filter_"+"created");
             if(filter==null)
               {
                   createFilterUI("created");
                   setTimeout( ()=>applyFiltersOnAll());
               }
             else
               {
                  setTimeout( async ()=>applyFiltersOnAll());
               }
          }else
            {  console.log("Try remove filter");
              let filter=document.querySelector(".filter_"+"created");
               if(filter)
                 { console.log("Remove filter:",filter);
                    filter.parentNode.removeChild(filter);
                    setTimeout( ()=>applyFiltersOnAll());
                 }
            }
      },
       type:"checkbox",
       checked: filters["created"]
    }));
    n.append(_("br",""));
    n.append(_("span","Not created filter"));
    n.append(_("input","",{
      onchange(e)
      {
        console.log("Created filter",e.target.checked);
        filters["not-created"]=e.target.checked;
        if(filters["not-created"])
          {  let filter=document.querySelector(".filter_"+"not-created");
             if(filter==null)
               {
                   createFilterUI("not-created");
                   setTimeout( ()=>applyFiltersOnAll());
               }
             else
               {
                  setTimeout( ()=>applyFiltersOnAll());
               }
          }else
            {  console.log("Try remove filter");
              let filter=document.querySelector(".filter_"+"not-created");
               if(filter)
                 { console.log("Remove filter:",filter);
                    filter.parentNode.removeChild(filter);
                    setTimeout( ()=>applyFiltersOnAll());
                 }
            }
      },
       type:"checkbox",
       checked: filters["not-created"]
    }));
    n.append(_("br",""));
    n.append(_("span","Goals filter"));
    n.append(_("input","",{
      onchange(e)
      {
        console.log("Created filter",e.target.checked);
        filters["goals"]=e.target.checked;
        if(filters["goals"])
          {  let filter=document.querySelector(".filter_"+"goals");
             if(filter==null)
               {
                   createFilterUI("goals");
                   setTimeout( ()=>applyFiltersOnAll());
               }
             else
               {
                  setTimeout( ()=>applyFiltersOnAll());
               }
          }else
            {  console.log("Try remove filter");
              let filter=document.querySelector(".filter_"+"goals");
               if(filter)
                 { console.log("Remove filter:",filter);
                    filter.parentNode.removeChild(filter);
                    setTimeout( ()=>{
                      applyFiltersOnAll()

                    });
                 }
            }
      },
       type:"checkbox",
       checked: filters["goals"]
    }));
    n.append(_("br",""));
    if(!useIC)
    {
       n.append(_("div.upload-savefile-filters","",

                 _("img","",{

                  src:uploadImageSrc,
                  style:'width: 100px ;height: 100px',
                 onclick(e)
                  {
                   onClickUploadButton();
                  }


                  },
                 ),
                 _("p.savefile_name",filename)
                  )


                 );



    }





     IBUtil.showModal("Smart Filters",n);

  })


}

     //filters["goals"]=true;
    createExztraButton()
     applyFiltersOnAll()
     observingMethod();
     console.log("IBUTIL",ICF);
  }

  })





})()