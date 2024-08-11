// ==UserScript==
// @name        Lineage Creator
// @namespace   Violentmonkey Scripts
// @match        https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @author      -
// @description 8/7/2024, 2:00:08 PM
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
    
    
    
    let linePoints=[];
    let lineColor="#fff"
    
    
    function deleteInstance(t)
      {
              console.log("DELETE");
    
               //based on id determine indexI,indexJ;
             try{
               let nodeid=t;
               console.log("nodeid:",nodeid);
               console.log("linePoints:",linePoints);
    
                console.log(Tree);
                let [ii,ij]= Tree.indexes(x=>x.id==nodeid);
                 console.log("indexes now:",ii,ij);
    
               linePoints=linePoints.filter(x=>{return (x[4]!=ii || x[5]!=ij) && (x[6]!=ii || x[7]!=ij)
    
    
    
                                               });
               console.log("after line points:",linePoints);
    
    
               translateLines(0,0);
    
    
    
               }
               catch(e)
                 { console.log(e);
    
                 }
    
      }
    
    
    
    function makeLine(x1,y1,x2,y2)
    {
     const ctx = canvas.getContext("2d");
    
    // Define a new path
    ctx.beginPath();
    // Set a start-point
    ctx.moveTo(x1, y1);
    
    // Set an end-point
    ctx.lineTo(x2, y2);
    ctx.strokeStyle =lineColor;
    // Stroke it (Do the Drawing)
    ctx.stroke();
    
    
    
    
    }
    function  translateLines(distance,distanceY=0)
      {
    
    
    
    
         const ctx = canvas.getContext("2d");
         ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(let line of linePoints)
          {
            line[0]+=distance;
            line[1]+=distanceY;
            line[2]+=distance;
            line[3]+=distanceY;
             makeLine(line[0],line[1],line[2],line[3]);
    
    
          }
    
    
      }
    
    
    
    
    
    
    
    let repeatingRecipes=true;
    let maximumGenerations=10;
    let progressiveVerticalGap=false;
    let initialVerticalGap=100;
    let spacing=20;
    let distance=55;
    let canvas=null;
    let Tree=null;
     function computeDistnaces(initial,variance,fathers,tree)
    {
    
        let distanceFactor=initial;
    for(let i=0;i<tree.length;i++)
      {
      for(let j=0;j<tree[i].length;j++)
      {   console.log(i,j,tree[i][j])
        if(fathers[[i,j]]!=undefined)
          {
            let indexChildren=-1;
            for(let children of fathers[[i,j]])
            { indexChildren++;
              tree[children[0]][children[1]].x=(tree[i][j].x+(indexChildren==0?-distanceFactor:distanceFactor));
    
    
            }
    
    
          }
    
      }
        //if(i<2)
      // distanceFactor=distanceFactor/2;
    
      }
    
    
    
    }
    let lastAvailableX={};
    
       function spawnElement(element, x, y,id,callback,textColor=null) {
           console.log("spawning",element)
           if(lastAvailableX[y])
             {
                x=Math.max(lastAvailableX[y],x);
             }
    
            const data = {
                id:id,
                text: element.text,
                emoji: element.emoji,
                discovered: element.discovered,
                disabled: false,
                left: 0,
                top: 0,
                offsetX: 0.5,
                offsetY: 0.5,
            };
            const instance = cloneInto(data, unsafeWindow);
            unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instances.push(instance);
    
    
           console.log("before spawning:",instance.text,lastAvailableX,lastAvailableX[y],y,x);
    
            unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].$nextTick(
                exportFunction(() => {
                    unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstancePosition(
                        instance,
                        x,
                        y
                    );
                    unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstanceZIndex(instance, 0);
    
              let interval=  setInterval(
                  ()=>{
    
    
                       if(document.querySelector("#instance-"+id))
                         {
    
                           console.log("it was spawned",id,lastAvailableX,lastAvailableX[y])
                            let instanceDiv=document.querySelector("#instance-"+id)
                            console.log("inst=",instanceDiv.textContent)
    
    
    
    
                            let size=instanceDiv.offsetWidth;
                          if(textColor)
                           instanceDiv.style.color=textColor;
    
    
                          if(lastAvailableX[y])
                            x=Math.max(lastAvailableX[y],x-size/2);
                           else
                            x=x-size/2;
                           unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].setInstancePosition(
                             instance,
                              x,
                              y
                              );
    
    
    
    
    
    
                          if(lastAvailableX[y])
                            lastAvailableX[y]=Math.max(x+size+spacing,lastAvailableX[y]);
                          else
                             lastAvailableX[y]=x+size+spacing;
                            callback(y,x,size,instanceDiv);
    
                          clearInterval(interval);
    
                         }
    
    
                  },10);
    
    
    
    
    
    
                }, unsafeWindow)
            );
        }
    
    let indexI=0;
    let indexJ=0;
    
    
    
      function adjustingAllInstances(){
        console.log("adjusting");
         let allInstances=document.querySelectorAll(".instance");
         console.log("instances:",allInstances)
                     //find target node
                     let centerX=document.querySelector(".items").getBoundingClientRect().left/2;
    
                     let maxy=0;
                     let root=null;
                     let minx=document.querySelector(".items").getBoundingClientRect().left;
                     let rootx=null;
                     let leftmostNode=null;
                     let leftest=null;
                     for(let instance of allInstances)
                       {
                         if(instance.id=="instance-0")
                           continue;
    
                         if(instance.getBoundingClientRect().top>maxy)
                         {
    
    
                           maxy=instance.getBoundingClientRect().top;
                           rootx=instance.getBoundingClientRect().left;
                           root=instance;
                         }
    
                         if(instance.getBoundingClientRect().left<minx)
                         {
                           minx=instance.getBoundingClientRect().left;
                           leftest=instance;
                         }
    
    
                       }
    
    
                console.log("after first",root,rootx,centerX,minx,leftest);
    
                        if(rootx>centerX)
                          {
    
    
                            let distanceTomove=rootx-centerX;
                             let distanceY=0;
    
                                 distanceY=(window.innerHeight-50)-maxy;
    
                                   for (const instance of unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instances) {
                                             if (!instance.elem) continue;
    
                                            const translate = instance.elem.style.getPropertyValue("translate").split(" ").map((x) => parseInt(x));
    
    
                                 if (translate.length === 1) translate.push(0);
    
                                        translate[0] -= distanceTomove;
                                        translate[1] -=distanceY;
                                        instance.elem.style.translate = translate.map((x) => x + "px").join(" ");
                                         instance.top -=  distanceY;
                                      instance.left -=  distanceTomove ;
    
                                       }
    
    
    
    
    
                              translateLines(-distanceTomove,-distanceY);
    
    
    
    
    
    
                          }
    
      }
    
    
    
    
    
    
    
    
    
    function nextSpawn(tree,fathers,y_start)
      {
            console.log("before_method",y_start);
          return (y_method,x,size,htmlElm)=>{
    
    
                 if(indexI<0)
                   {
                     //adjust all the instances so that target gets to be visible
                      adjustingAllInstances();
                      return;
                   }
    
    
    
                    if(indexJ!=-1)
                      {  console.log("IJ:",indexI,indexJ);
                        tree[indexI][indexJ].x=x;
                        tree[indexI][indexJ].size=size;
                        tree[indexI][indexJ].id=htmlElm.id;
    
                      let children=fathers[[indexI,indexJ]];
                       if(children)
                       {
                         var lineChildren=[]
                      for(let child of children)
                      {
                          makeLine( tree[child[0]][child[1]].x+tree[child[0]][child[1]].size/2,
                                    tree[child[0]][child[1]].y+20,
                                    tree[indexI][indexJ].x+tree[indexI][indexJ].size/2,
                                    tree[indexI][indexJ].y+20
                                  );
                          linePoints.push([tree[child[0]][child[1]].x+tree[child[0]][child[1]].size/2,
                                         tree[child[0]][child[1]].y+20,
                                         tree[indexI][indexJ].x+tree[indexI][indexJ].size/2,
                                         tree[indexI][indexJ].y+20,
                                         indexI,indexJ,child[0],child[1],
                                         htmlElm.id
                                        ])
                            lineChildren.push(linePoints[linePoints.length-1])
    
                       }
                       }
    
                          let node=[indexI,indexJ];
                          console.log("NODE:",node);
                          let instanceObserver=new MutationObserver((mutations) => {
    
                            for(let mutation of mutations){
                           console.log("mutation in position",mutation)
                            const translate =mutation.target.style.getPropertyValue("translate").split(" ").map((x) => parseInt(x));
                                  if (translate.length === 1) translate.push(0);
    
                              if(lineChildren)
                            for(let lc of lineChildren)
                              {
                                 lc[2]=translate[0] +mutation.target.offsetWidth/2;
                                lc[3]=translate[1]+20;
                               }
                              //theoretically you must search whose child you are identify the nodes and then update the relevant linePoints;
                              //search in fathers
                              for( let [key,value] of Object.entries(fathers))
                                  {
    
                                    let itsChild=false;
                                    for(let elm of value)
                                      {
                                         if(elm[0]==node[0] && elm[1]==node[1])
                                           {
                                              itsChild=true;
                                              break;
                                           }
    
                                      }
                                     if(itsChild)
                                      { //console.log("node:",node,"is son of",key,key[0],"and",key[2]);
                                       // console.log("linepoints",linePoints);
                                        let yourLinePoints=linePoints.filter(x=>{return x[4]==key[0] && x[5]==key[2] && x[6]==node[0] && x[7]==node[1]});
                                          //console.log("your line poits",yourLinePoints);
                                        yourLinePoints.forEach(x=>
                                                               {x[0]=translate[0] +mutation.target.offsetWidth/2;
                                                                x[1]=translate[1]+20;
    
                                                               })
                                      }
    
                                  }
    
                                  //you are node
    
    
    
    
    
                            translateLines(0,0);
    
                           }})
    
    
    
                         instanceObserver.observe(htmlElm,{
    
                        childList        : false,
                        subtree          : false,
                        attributeFilter  : ["style"],
                        attributeOldValue: true,
    
                        })
    
    
    
                      }
    
    
                    indexJ++;
    
    
                  let y_newStart=y_method;
    
                if(indexJ>tree[indexI].length-1)
               {
                console.log(y_start);
                console.log("move to next_line")
                indexJ=0;
                indexI--;
                 if(indexI<0)
                   {
    
                     adjustingAllInstances();
                     return;
                   }
    
    
    
    
    
    
    
                for(let j=0;j<tree[indexI].length;j++)
                   {
                      let parent=tree[indexI][j];
                      let children=fathers[[indexI,j]];
                      let sum=0;
                     let count=0;
                     if(children)
                       {
                      for(let child of children)
                      { count++;
                          console.log("view of dependencies:",indexI,j,child,child[0],child[1])
                        sum+=tree[child[0]][child[1]].x+size/2;
                      }
                     if(count>0)
                      tree[indexI][j].x=Math.ceil(sum/count);
                       }
    
    
    
                   }
    
    
                if(!progressiveVerticalGap)
                y_newStart+=initialVerticalGap+distance;
                 else
                   {
                      y_newStart+=distance+(initialVerticalGap/Math.pow(2,indexI));
    
                   }
    
    
                console.log("new:",y_newStart);
              }
    
    
    
              console.log("indexes:",indexI,indexJ,"y:",y_start);
             console.log("limits:",tree.length,tree[indexI].length,"y:",y_start);
    
              console.log("did not returned");
        let node=tree[indexI][indexJ];
         node["y"]=y_newStart;
    
    
         let trueNode= unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.find(x=>x.text==node.text);
        let id=  unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.instanceId++;
    
    
          return spawnElement(trueNode,node.x,y_newStart,id,nextSpawn(tree,fathers,y_newStart));
    
          }
    
    
    
       ;}
    
    
    function fallbackBuilder(finalWord,AllRecipes,finished)
    {
    let tree=[[{text:finalWord}]];
    let baseRecipes=AllRecipes[finalWord];
    let nrGen=0;
    let stack=[];
    let expandedInTree=[];
      if(baseRecipes)
        {
    
           let choosenRecipe=baseRecipes[0];
              let  generation=[{"child":finalWord,"text": choosenRecipe[0].text,"recipe":choosenRecipe[0]},
                               {"child":finalWord,"text": choosenRecipe[1].text,"recipe":choosenRecipe[1]}
    
                              ];
    
    
    
                tree.push(generation);
    
                nrGen++;
            do{
                  nrGen++;
                  if(nrGen>=maximumGenerations)
                    break;
              let newGeneration=[];
    
               for(let ancestor of generation)
             {
                if(["Water","Wind","Earth","Fire"].includes(ancestor.text))
                  continue;
                 if(repeatingRecipes || (!repeatingRecipes && !expandedInTree.includes(ancestor.text))){
                   expandedInTree.push(ancestor.text)
                 let recipes= AllRecipes[ancestor.text];
                  if(recipes)
                    {
                      let findAProperRecipe=recipes.filter(x=>finished.includes(x[0].text) &&  finished.includes(x[1].text));
                      if(findAProperRecipe && findAProperRecipe.length>0)
                       {
                         choosenRecipe=findAProperRecipe[0];
                       }
                         else
                         {
                            let findAImProperRecipe=recipes.filter(x=>finished.includes(x[0].text) ||  finished.includes(x[1].text));
                           if(findAImProperRecipe && findAImProperRecipe.length>0)
                          {
                             choosenRecipe=findAImProperRecipe[0];
                          }else
                           choosenRecipe=recipes[0];
                         }
    
                        newGeneration.push({"child":ancestor.text,"text": choosenRecipe[0].text,"recipe":choosenRecipe[0]})
                        newGeneration.push({"child":ancestor.text,"text": choosenRecipe[1].text,"recipe":choosenRecipe[1]})
    
                    }
                 }
             }
             generation=newGeneration;
              if(newGeneration.length==0)
                   break;
    
                 tree.push(newGeneration);
            }while(1);
    
        }
    
    
    
    
    
    return tree;
    
    }
    
    
    
    async function makeLineageRaw(finalWord,saveFileObj)
    {  saveFileObj["save"]=await getSave().then(x=>x.json());
    
      let saveFile=saveFileObj["save"];
      let elements=saveFile["elements"];
      let AllRecipes=saveFile["recipes"];
      let stackRecipes=[];
      let base=["Water","Wind","Fire","Earth"]
      let nodeWithRecipe=[];
      let finished=["Water","Fire","Earth","Wind"]
      let visited=[finalWord];
    
      let StackElements=[finalWord];
    
      let recipesInLineage=[];
      let unseriousNodes=[];
      let finalRecipes=[];
    
    
       let pool=[];
       let partitonedRecipes=[]
      //Part1 partition all the recipes and elements given by root , add all the recipes in the partitioned recipes and all the elements in pool
      while(StackElements.length>0)
        { //console.log("stack");
           let node=StackElements.pop();
    
          if(!pool.includes(node))
            {
              pool.push(node);
    
            let recipes=AllRecipes[node];
    
              //find all elemenmts without recipes early;
              if(recipes==null || recipes.length==0)
               {
                 if(!finished.includes(node))
                 finished.push(node);
                 unseriousNodes.push(node);
    
                 pool=pool.filter(x=>x!=node);
                 continue;
               }
    
    
           for(let recipe of recipes)
              {
               if(!pool.includes(recipe[0].text))
                  StackElements.push(recipe[0].text)
    
                if(!pool.includes(recipe[1].text))
                    StackElements.push(recipe[1].text);
              }
            }
    
    
        }
      let earlyFinish=false;
      let oneElementFinished=true
    
      console.log("before finishing base elements:",[...finished]);
      console.log("pool:",[...pool]);
    
    //&& oneElementFinished
    
      while(!finished.includes(finalWord) && pool.length>0 && oneElementFinished)
      {  console.log("pool",[...pool]);
         console.log("finished",[...finished]);
         oneElementFinished=false;
    
        // console.log("Ah");
        if(earlyFinish)
           break;
        for(let name of pool)
        {
    
          if(finished.includes(finalWord))
            {  earlyFinish=true;
               break;
            }
    
          if(finished.includes(name))
            {
              // pool=pool.filter(x=>x!=name);
              continue;
            }
    
    
           let oneHasFinished=false;
            recipes=AllRecipes[name];
           let hasSeriousParent=false;
           let potentialRecipe={};
          //first pass to see if you can find recipe where elements are base or have parents
            for(let recipe of recipes)
          {
             if(finished.includes(recipe[0].text) &&  finished.includes(recipe[1].text)   )
               {
                 oneHasFinished=true;
                 potentialRecipe=recipe;
                 oneElementFinished=true;
    
              if(!(unseriousNodes.includes(recipe[0].text)) &&   (!unseriousNodes.includes(recipe[1].text)))
                {
                    hasSeriousParent=true;
                    break;
                }
    
               }
    
    
    
          }
    
          if(oneHasFinished )
          { if(!(finished.includes(name)))
            {
    
              console.log("has finished:",name,potentialRecipe)
             finished.push(name);
             finalRecipes.push({"child":name,"recipe":potentialRecipe});
    
    
    
             if(!hasSeriousParent)
               unseriousNodes.push(name);
    
             //pool=pool.filter(x=>x!=name);
            }
    
           }
    
        }
    
      }
      finalRecipes.sort((a,b)=>a.child.localeCompare(b.child));
      console.log("finished:",finished,finalRecipes);
      //build the tree ground up
     let tree=[];
     let firstRecipe=finalRecipes.find(x=>x.child==finalWord);
    
      console.log(firstRecipe);
    
     if(firstRecipe)
     {
    
    
    let genNr=0;
    tree.push([{text:finalWord}])
      let generation=[{child:finalWord,text:firstRecipe["recipe"][0].text,recipe:firstRecipe["recipe"][0]},
                      {child:finalWord,text:firstRecipe["recipe"][1].text,recipe:firstRecipe["recipe"][1]}
    
    
                      ];
        tree.push(generation)
        genNr++;
    
    
    
      let stop=false;
      do{
        genNr++;
    
        if(genNr>=maximumGenerations)
          {  stop=true;
             break;
          }
    
    
        console.log("new generation")
       let newGeneration=[]
       let expandedInTree=[];
    
       for(let ancestor of generation)
         {
           //expand only if
           if(repeatingRecipes || (!repeatingRecipes && !expandedInTree.includes(ancestor.text)))
              {
            let NowRecipe=finalRecipes.find(x=>x.child==ancestor.text);
    
           if(NowRecipe!=null){
                 expandedInTree.push(ancestor.text);
                 newGeneration.push({child:ancestor.text,text:NowRecipe["recipe"][0].text,recipe:NowRecipe["recipe"][0]});
    
    
                 newGeneration.push({child:ancestor.text,text:NowRecipe["recipe"][1].text,recipe:NowRecipe["recipe"][1]});
    
             }
             }
         }
       console.log("newnewGeneration:",newGeneration,newGeneration.length);
        generation=newGeneration;
    
    
    
         if(newGeneration.length==0)
           {
             stop=true;
             break;
    
           }
    
    
       tree.push(newGeneration);
      }while(!stop);
    
    
      console.log("Tree:",tree);
    
    
      return tree
       ;}else
         {
    
           return fallbackBuilder(finalWord,AllRecipes,finished,pool);
    
         }
    
    
    
    
    
    }
    
    
    
    async function makeVisualLineage(finalWord)
    {
    
         let settings=null;
       if(localStorage.getItem("vizualizer-settings"))
        settings=JSON.parse(localStorage.getItem("vizualizer-settings"));
        if(settings==null)
        settings={
                    spacing:spacing,
                    initialVerticalGap:initialVerticalGap,
                    maximumGenerations:maximumGenerations,
                    lineColor:lineColor,
                    repeatingRecipes:repeatingRecipes,
                    progressiveVerticalGap:progressiveVerticalGap,
    
    
    
    
        };
    
                    spacing=Number(settings["spacing"]);
                    initialVerticalGap=Number(settings["initialVerticalGap"]);
                    maximumGenerations=Number(settings["maximumGenerations"]);
                    lineColor=settings["lineColor"];
                    repeatingRecipes=settings["repeatingRecipes"];
                    progressiveVerticalGap=settings["progressiveVerticalGap"];
    console.log("settings:",spacing,initialVerticalGap,maximumGenerations, lineColor,repeatingRecipes,progressiveVerticalGap)
    
    
      lastAvailableX={};
     let savefile={save:"hello"}
     let tree=await makeLineageRaw(finalWord,savefile)
     console.log(savefile);
      console.log(tree);
    let bottom=window.innerHeight-50;
    let leftmost=document.querySelector(".items").getBoundingClientRect().left;
    let root=tree[0][0];
      console.log(root);
    let trueRoot= unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.find(x=>x.text==root.text)
    console.log(trueRoot);
      let genNr=0;
      let x_start=leftmost/2;
      let y_start=bottom;
       // spawnElement(trueRoot,x_start,y_start);
       tree[0][0].x=x_start;
       tree[0][0].y=y_start;
    
      let previousGeneration=[];
    //father stucture
    let  fathers={ }
    console.log("tree before spawning:",tree);
    //find dependencies before actually fixing them on the board
    for(let generation of tree)
      {
        genNr++;
        if(genNr>tree.length-1)
          break;
         let nextGen=tree[genNr];
        let nr_in_Gen=0;
      let indexNextGen=0;
         console.log("next gen:",nextGen)
        for(let node of generation)
          {
             console.log("node text:",node.text)
             nr_in_Gen++;
    
             let nrChildren=0;
    
              fathers[[genNr-1,nr_in_Gen-1]]=[];
    
              while(indexNextGen<nextGen.length && nextGen[indexNextGen].child==node.text && nrChildren<2 )
                {
                  fathers[[genNr-1,nr_in_Gen-1]].push([genNr,indexNextGen]);
                  indexNextGen++;
                  nrChildren++;
    
                }
    
          }
    
      }
     console.log(fathers);
    computeDistnaces(initialVerticalGap,60,fathers,tree);
    
    console.log(tree);
     let nr_gen;
    
     let nrNode=0;
     let earlyBreak=false;
     indexI=tree.length-1;
     indexJ=-1;
    
     if(!progressiveVerticalGap)
     y_start=y_start-(distance+initialVerticalGap)*tree.length;
     else
    {
      //compute starting point by simulation
       let currentGap=initialVerticalGap;
      console.log("first gap:",currentGap);
      for(let i=0;i<Math.max(tree.length,maximumGenerations);i++)
        {
          y_start=y_start-(distance+currentGap);
          currentGap=currentGap/2;
        }
    
    
    
    }
    console.log("y_start:",y_start);
    
    Tree={
      data:tree,
    
      find: (cond)=>
      {
       let array= this.data.find(x=>x.find(y=>cond(y)))
        return array.find(y=>cond(y));
    
      },
      indexes:function(cond)
      { console.log(this);
        for(let i=0;i<this.data.length;i++)
          {
            for(let j=0;j<this.data[i].length;j++)
              if(cond(this.data[i][j]))
                return [i,j]
          }
        return [-1,-1]
       }
    
    
    
    };
     nextSpawn(tree,fathers,y_start,initialVerticalGap+distance)(y_start);
    }
    
    
    
    
    
      unsafeWindow.RawLineageMaker=makeVisualLineage;
    
    
     function makeModalWithSetting()
      {
    
       let settings=null;
       if(localStorage.getItem("vizualizer-settings"))
       settings=JSON.parse(localStorage.getItem("vizualizer-settings"));
        if(settings==null)
        settings={
                    spacing:spacing,
                    initialVerticalGap:initialVerticalGap,
                    maximumGenerations:maximumGenerations,
                    lineColor:lineColor,
                    repeatingRecipes:repeatingRecipes,
                    progressiveVerticalGap:progressiveVerticalGap,
    
    
    
    
        };
    
    
    
       if(document.querySelector(".lineage-settings"))
         {
          document.querySelector(".container").removeChild(document.querySelector(".lineage-settings"))
    
    
         }
    
    
           {
             //declaring inputs
            let settingsModal=document.createElement("dialog");
              settingsModal.style.position="absolute";
              settingsModal.style.top=((window.innerHeight-50)/2).toString()+"px";
              settingsModal.style.left=(3*document.querySelector(".items").getBoundingClientRect().left/8).toString()+"px";
              settingsModal.style.backgroundColor="var(--background-color)";
              settingsModal.style.color="var(--text-color)";
              settingsModal.classList.add("lineage-settings");
    
            let  MinimalHorizontalGap=document.createElement("input");
                MinimalHorizontalGap.type="number";
                MinimalHorizontalGap.classList.add("vizualizer-seeting-1");
               MinimalHorizontalGap.value=settings["spacing"];
            let  VerticalGap=document.createElement("input");
                VerticalGap.type="number";
                VerticalGap.classList.add("vizualizer-seeting-2")
                 VerticalGap.value=settings["initialVerticalGap"];
            let  MaximumGenerationsInPast=document.createElement("input");
                 MaximumGenerationsInPast.type="number";
                 MaximumGenerationsInPast.value=settings["maximumGenerations"]
                 MaximumGenerationsInPast.classList.add("vizualizer-seeting-3")
            let  RepeatingRecipes=document.createElement("input");
                 RepeatingRecipes.type="checkbox";
                 RepeatingRecipes.checked=settings["repeatingRecipes"];
                 RepeatingRecipes.classList.add("vizualizer-seeting-4")
                 RepeatingRecipes.style.display="inline-block";
                 RepeatingRecipes.style.width=RepeatingRecipes.style.height="20px";
                 RepeatingRecipes.style.opacity="1";
            let  ProgresiveVerticalGap=document.createElement("input");
                 ProgresiveVerticalGap.type="checkbox";
                 ProgresiveVerticalGap.style.display="inline-block";
                 ProgresiveVerticalGap.checked=settings["progressiveVerticalGap"];
                 ProgresiveVerticalGap.classList.add("vizualizer-seeting-5");
                 ProgresiveVerticalGap.style.width= ProgresiveVerticalGap.style.height="20px";
                 ProgresiveVerticalGap.style.opacity="1";
           let  LinesColor=document.createElement("input");
                 LinesColor.type="color";
                 LinesColor.classList.add("vizualizer-seeting-6")
                 LinesColor.value=settings["lineColor"];
                 let previousColor=settings["lineColor"];
    
                 LinesColor.addEventListener("input",()=>{
                 lineColor=LinesColor.value;
                 translateLines(0,0);
    
                 })
    
            let ButtonDiv=document.createElement("div");
            let ButtonText=document.createTextNode("Settings for Lineage Creator");
    
             ButtonDiv.appendChild(ButtonText);
             ButtonDiv.classList.add("setting");
             ButtonDiv.addEventListener("click",()=>{
                settingsModal.showModal();
    
    
             }
             )
            document.querySelector(".settings-content").appendChild(ButtonDiv);
    
    
    
            //labels
             let label1=document.createElement("label");
             label1.textContent="Set the Minimal Horizontal Gap in px between elements:";
             let label2=document.createElement("label");
              label2.textContent="Set the Vertical Gap in px between elements:";
             let label3=document.createElement("label");
              label3.textContent="Set the Maximum nr. of generations to display:";
             let label4=document.createElement("label");
              label4.textContent="Allow or not repeating elements with recipes:";
             let label5=document.createElement("label");
              label5.textContent="Use decreasing vertical gap:";
           let label6=document.createElement("label");
              label6.textContent="Choose connecting line color:";
             //append jobs
             settingsModal.appendChild(label1);
             settingsModal.appendChild(MinimalHorizontalGap);
             settingsModal.appendChild(document.createElement("br"));
             settingsModal.appendChild(document.createElement("br"));
                   settingsModal.appendChild(label2);
             settingsModal.appendChild(VerticalGap);
             settingsModal.appendChild(document.createElement("br"));
             settingsModal.appendChild(document.createElement("br"));
                settingsModal.appendChild(label5);
             settingsModal.appendChild(ProgresiveVerticalGap);
             settingsModal.appendChild(document.createElement("br"));
             settingsModal.appendChild(document.createElement("br"));
                   settingsModal.appendChild(label3);
             settingsModal.appendChild(MaximumGenerationsInPast);
             settingsModal.appendChild(document.createElement("br"));
             settingsModal.appendChild(document.createElement("br"));
                   settingsModal.appendChild(label4);
             settingsModal.appendChild(RepeatingRecipes);
             settingsModal.appendChild(document.createElement("br"));
             settingsModal.appendChild(document.createElement("br"));
                   settingsModal.appendChild(label5);
             settingsModal.appendChild(ProgresiveVerticalGap);
             document.querySelector(".container").appendChild(settingsModal);
             settingsModal.appendChild(document.createElement("br"));
             settingsModal.appendChild(document.createElement("br"));
             settingsModal.appendChild(label6);
             settingsModal.appendChild(LinesColor);
             settingsModal.appendChild(document.createElement("br"));
             settingsModal.appendChild(document.createElement("br"));
    
    
            let saveButton=document.createElement("button");
             saveButton.textContent="Save changes";
            let closeButton=document.createElement("button");
                closeButton.textContent=" Cancel without saving";
    
               settingsModal.appendChild(saveButton);
               settingsModal.appendChild(closeButton);
               saveButton.addEventListener("click",()=>{
                    spacing=MinimalHorizontalGap.value;
                    initialVerticalGap=VerticalGap.value;
                    maximumGenerations=MaximumGenerationsInPast.value;
                    lineColor=LinesColor.value;
                    repeatingRecipes=RepeatingRecipes.checked;
                    progressiveVerticalGap=ProgresiveVerticalGap.checked;
    
                    settings={
                    spacing:MinimalHorizontalGap.value,
                    initialVerticalGap:VerticalGap.value,
                    maximumGenerations:MaximumGenerationsInPast.value,
                    lineColor:LinesColor.value,
                    repeatingRecipes:RepeatingRecipes.checked,
                    progressiveVerticalGap:ProgresiveVerticalGap.checked,
                    }
    
                    localStorage.setItem("vizualizer-settings",JSON.stringify(settings));
    
    
    
                 settingsModal.close();})
               closeButton.addEventListener("click",()=>{
    
                 lineColor=previousColor;
                 translateLines(0,0);
    
    
                 settingsModal.close()})
    
    
    
           }
    
    
    
      }
    
    
    
    window.addEventListener("load",()=>{
    
    
    
       const fn = unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].clearInstances;
      unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].clearInstances= () => {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        linePoints=[];
        lastAvailableX=[];
        fn();
      }
    
      let instancesObserver=new MutationObserver((mutations) => {
    
                            for(let mutation of mutations){
    
                            if(mutation.removedNodes)
                                console.log("removedNodes:",mutation.removedNodes);
                              for(let node of mutation.removedNodes)
                              {
                                    if(!document.querySelector("#"+node.id))
                                        deleteInstance(node.id);
                              }
    
                            //translateLines(0,0);
    
                           }})
    //|| node.className=="item instance instance-selected"
    
    
                         instancesObserver.observe(document.querySelector(".instances"),{
    
                        childList        : true,
                        subtree          : true,
                        attributeOldValue: true,
    
                        })
    
    
    
    
    
    
    
    
    
    
    
    let container=document.querySelector(".container");
    let mouseData={
      x:0,
      y:0,
      down:false
    
    }
        container.addEventListener("mousedown", function(e) {
                if (e.ctrlKey) {
                    mouseData.down = true;
                    mouseData.x = e.pageX;
                    mouseData.y = e.pageY;
                }
            });
            container.addEventListener("mouseup", function() {
                mouseData.down = false;
            })
            container.addEventListener("mousemove", function(e) {
                if (e.which === 1 && mouseData.down) {
                    mouseData.deltaX = mouseData.x - e.pageX;
                    mouseData.deltaY = mouseData.y - e.pageY;
                    mouseData.x = e.pageX;
                    mouseData.y = e.pageY;
                     translateLines(-mouseData.deltaX,-mouseData.deltaY);
                }
            });
    
    
        canvas=document.createElement("canvas");
        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;
        canvas.style.zIndex="-5";
        canvas.style.position="relative"
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        document.querySelector(".container").appendChild(canvas);
        makeModalWithSetting();
    
    
    },false)
    
    
    
    
    
    
    
    })()
    