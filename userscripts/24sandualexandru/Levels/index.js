// ==UserScript==
// @name        Levels by Alex
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       GM.setValue
// @grant       GM.getValue
// @grant       GM.xmlHttpRequest
// @version     1.0.2
// @author      -
// @description 5/27/2025, 9:37:09 PM
// @require  https://www.unpkg.com/csv-parse@4.15.4/lib/browser/index.js
// ==/UserScript==
(async function()
{ let sheetApi="https://docs.google.com/spreadsheets/d/1iTUL4yuJsVAOA5wplbBb27CK_FY1lCie5wX9CH3geVk"+"/export?format=csv";
  let justData=[];

const colorPalette = [
            "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF", "#33FFA1", "#FFC733", "#33C7FF", "#C733FF",
            "#E74C3C", "#2ECC71", "#3498DB", "#F1C40F", "#9B59B6", "#1ABC9C", "#D35400", "#FF4500", "#C0392B",
            "#FF6F61", "#FFB6C1", "#FFD700", "#16A085", "#27AE60", "#2980B9", "#8E44AD", "#6A5ACD", "#F39C12",
            "#E67E22", "#FFE4B5", "#F5FFFA", "#8D6E63", "#FFA726", "#66BB6A", "#42A5F5", "#AB47BC", "#26A69A",
            "#D4E157", "#FFEE58", "#FFCA28", "#FF7043", "#FF69B4", "#5C6BC0", "#8E24AA", "#4DB6AC", "#FF8A65",
            "#9CCC65", "#7E57C2", "#EC407A", "#80CBC4", "#EF5350", "#5C6BC0", "#4DB6AC", "#64B5F6", "#FF1493",
            "#A5D6A7", "#66BB6A", "#FFEB3B", "#8D6E63", "#FFD600", "#8A2BE2", "#E65100", "#BF360C", "#F44336",
            "#FF5722", "#FF4500", "#00BCD4", "#673AB7", "#3F51B5", "#2196F3", "#FF9800", "#009688", "#FFC107",
            "#CDDC39", "#00E676", "#1DE9B6", "#D500F9", "#2962FF", "#6200EA", "#C51162", "#AA00FF", "#FF1744",
            "#F57C00", "#00C853", "#2E7D32", "#DCE775", "#C0CA33", "#FF8C00", "#DD2C00", "#B22222", "#800000",
            "#FF4500", "#DAA520", "#FFA07A", "#FF8C00", "#BDB76B"
];
 function requestSheet()
 {
    return new Promise((resolve) => {
    GM.xmlHttpRequest({
      method: "GET",
      url: sheetApi,
      headers: {
        "Origin": "https://infinibrowser.zptr.cc/"
      },
      onload(response) {
        console.log(response.responseText);
        parse(response.responseText,{},function(err, records)
              {


                 justData=records.map(x=>x[1])
                 justData.splice(0,3);



               resolve();
      }
    );
  }
    });

 });

}

function computeScoreTillNextLevel(score)
 {  if(score<=0)
      return 100000;

   if(score<100000)
    {
      return 100000-score;

    }else
    {
      var intermediate=score-100000;

    }

 }



function computeProgress(score)
 {

   return score/(score+computeScoreTillNextLevel(score))*100;

 }




 function updateProgressBar(level,score,color)
 {


    var levelDiv=document.querySelector(".progressLevelDiv");
     if(levelDiv==null)
       {
         levelDiv=document.createElement("div");
         levelDiv.classList.add("progressLevelDiv");
         document.querySelector(".container").appendChild(levelDiv);
         levelDiv.style.position="absolute";
         levelDiv.style.left="10px";
         levelDiv.style.top= "50px";

       }


    var progress= computeProgress(score);


     levelDiv.innerHTML="";
     var levelSpan=document.createElement("span");
     var progressBarBackground=document.createElement("div");
     var progressBarProgress=document.createElement("div");

     progressBarProgress.style.backgroundColor=color;
     var scoreSpan=document.createElement("span");
   levelSpan.textContent = "L" + level;
scoreSpan.textContent = score+"/"+(score+computeScoreTillNextLevel(score));

// Apply styles to levelDiv for layout
levelDiv.style.display = "flex";
levelDiv.style.alignItems = "center";  // Centers vertically
levelDiv.style.justifyContent = "space-between";  // Spreads elements
levelDiv.style.padding = "5px";  // Optional for spacing

// Style the progress bar background
progressBarBackground.style.position = "relative";  // Container
progressBarBackground.style.width = "300px";
progressBarBackground.style.height = "50px";
progressBarBackground.style.backgroundColor = "#ccc";
progressBarBackground.style.flex = "1";  // Makes it expand

// Style the progress bar foreground (overlay)
progressBarProgress.style.position = "absolute";
progressBarProgress.style.top = "0";
progressBarProgress.style.left = "0";
progressBarProgress.style.width = progress + "%"; // Dynamic fill
progressBarProgress.style.height = "100%";
progressBarProgress.style.backgroundColor = color;
progressBarProgress.style.zIndex = "2"; // Ensures it stays on top

// Append elements in order
progressBarBackground.appendChild(progressBarProgress);
levelDiv.appendChild(levelSpan);
levelDiv.appendChild(progressBarBackground);
levelDiv.appendChild(scoreSpan);
 }



 async function computeLevel(score)
  {
     var level=1;
     var savedLevel=await GM.getValue("savedLevel");


     if(score==null)
    {
      GM.setValue("levelScore",0)
      score=0;
    }
  else{

    if(score-100000<0)
     {
       level=1;
     }
    else
    {
      level=1+(score-100000)%10000;
    }

     return level;
  }





  }



window.addEventListener("load",async ()=>{



  var v_container = document.querySelector(".container").__vue__;
  const craftApi = v_container.craftApi;

    var score= await GM.getValue("levelScore");
    if(score==null)
      { score=0;
        GM.setValue("levelScore",0);
      }
   await requestSheet();
   console.log(justData);


	v_container.craftApi = async function(a, b) {
		const result = await craftApi.apply(this, [a, b]);

    if(result && result.text!="Nothing")
	 {  var foundItem=v_container.items.find(x=>x.text==result.text)
     if(foundItem==null)
     {


       if(justData.includes(result.text))
         {

            score+=1000;
         }else
        {

            score+=5;

        }

        if(result.discovery)
         {

            score+=10;
         }


     }else
    {    var leftItem=v_container.items.find(x=>x.text==a);
         var rightItem=v_container.items.find(x=>x.text==b)
            if(foundItem.recipes)
           {
         var foundRecipe=foundItem.recipes.find(r=>(r[0]==leftItem.id && r[1]==rightItem.id)||(r[1]==leftItem.id && r[0]==rightItem.id))
         if(foundRecipe==null)
         {

           score+=1;
         }
           }
    }
     GM.setValue("levelScore",score);

     var level=await computeLevel(score);
     var color=await GM.getValue("levelColor");
      if(color==null)
       {
         color=colorPalette[Math.floor(Math.random() * colorPalette.length)];
         GM.setValue("levelColor",color);
       }
     updateProgressBar(level,score,color);

   }
		return result;
	};

    var level=await computeLevel(score);
     var color=await GM.getValue("levelColor");
      if(color==null)
       {
         color=colorPalette[Math.floor(Math.random() * colorPalette.length)];
         GM.setValue("levelColor",color);
       }
   updateProgressBar(level,score,color);



});




})();
