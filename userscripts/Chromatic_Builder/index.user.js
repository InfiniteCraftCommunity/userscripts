// ==UserScript==
// @name        Chromatic Builder
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0
// @author      -
// @description 7/31/2024, 10:29:11 PM
// ==/UserScript==
(function()
{


  let cache={}

  function checkInInventory(element)
  {
     if(cache[element]!=null)
        return true;



     return unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.find((e) => e.text == element);

  }





  async function buildUsingChromatic(foo,bar)
  {


     unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.find((e) => e.text == foo) && unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.forEach(
     e=>{
       cache[e.text]=e;
     }


     );
     let visited=[];



    if(checkInInventory(foo) && checkInInventory(bar))
      {
    let stage=foo;
    let step=0;
    let indexInStep=0;
    let toCombineText=[["\"the\"","\"the \"", "\"the Chromatic\"","\"the Chromatic \"","\"the Achromatic\"","\"the Achromatic \"","\"the Monochromatic\"","\"the Monochromatic \""],
    ["nothing","U+0020", "U++0020","U+++0020","Append U+0020"," Prepend U+0020","Append Space","Prepend Space","Delete First Word",
     " Delete The First Word","Remove First Word","Remove The First Word","Delete Chromatic","Delete Achromatic","Delete Monochromatic","Remove Chromatic","Remove Achromatic"],
    [bar],
    ["Delete First Word", " Delete The First Word","Remove First Word","Remove The First Word","Delete Chromatic","Delete Achromatic","Delete Monochromatic","Remove Chromatic","Remove Achromatic",
     "U+0020", "U++0020","U+++0020","Append U+0020"," Prepend U+0020","Inverse","Reverse","Backward","Backwards",
    "Delete The The","Remove The The","Without The The","Delete The Word The","Remove The Word The","Without The Word The","U+0020", "U++0020","U+++0020","Append U+0020"," Prepend U+0020",bar,"the "+bar],
    ["Delete The The","Remove The The","Without The The","Delete The Word The","Remove The Word The","Without The Word The","Inverse","Reverse","Backward","Backwards"],
    ["Inverse","Reverse","Backward","Backwards"]


                      ];






      let expectedResults=[

                         ["\"the "+foo+"\"", "\"the Chromatic "+foo+"\"","\"the Achromatic "+foo+"\"","\"the Monochromatic "+foo+"\""],

                         ["\"the "+foo+"\"","\"the "+foo+" \"","\"the Chromatic "+foo+" \"","\"the Achromatic "+foo+" \"","\"the Monochromatic "+foo+" \"",
                         "\"the "+foo+"\"", "\"the Chromatic "+foo+"\"","\"the Achromatic "+foo+"\"","\"the Monochromatic "+foo+"\""],

                         ["\"the "+foo+" "+bar+"\"","\"the Chromatic "+foo+" "+bar+"\"","\"the Achromatic "+foo+" "+bar+"\"","\"the Monochromatic "+foo+" "+bar+"\"",
                         "\"the "+foo+" "+bar.toLowerCase()+"\"","\"the Chromatic "+foo+" "+bar.toLowerCase()+"\"","\"the Achromatic "+foo+" "+bar.toLowerCase()+"\"","\"the Monochromatic "+foo+" "+bar.toLowerCase()+"\"",
                         "\"the "+bar+" "+foo+"\"","\"the Chromatic "+bar+" "+foo+"\"","\"the Achromatic "+bar+" "+foo+"\"","\"the Monochromatic "+bar+" "+foo+"\"",
                         "\"the "+bar+" "+foo.toLowerCase()+"\"","\"the Chromatic "+bar+" "+foo.toLowerCase()+"\"","\"the Achromatic "+bar+" "+foo.toLowerCase()+"\"","\"the Monochromatic "+bar+" "+foo.toLowerCase()+"\"",
                          ],
                         [foo+" "+bar,bar+" "+foo,"\"the "+foo+" "+bar+"\"","\"Chromatic "+foo+" "+bar+"\"","\"Achromatic "+foo+" "+bar+"\"","\"Monochromatic "+foo+" "+bar+"\"",
                         foo+" "+bar.toLowerCase(),"\"the "+foo+" "+bar.toLowerCase()+"\"","\"Chromatic "+foo+" "+bar.toLowerCase()+"\"","\"Achromatic "+foo+" "+bar.toLowerCase()+"\"","\"Monochromatic "+foo+" "+bar.toLowerCase()+"\"",
                         "\"the "+bar+" "+foo+"\"","\"the Chromatic "+bar+" "+foo+"\"","\"the Achromatic "+bar+" "+foo+"\"","\"the Monochromatic "+bar+" "+foo+"\"",
                         "\"the "+bar+" "+foo.toLowerCase()+"\"","\"the Chromatic "+bar+" "+foo.toLowerCase()+"\"","\"the Achromatic "+bar+" "+foo.toLowerCase()+"\"","\"the Monochromatic "+bar+" "+foo.toLowerCase()+"\"",
                         bar+" "+foo,bar+" "+foo.toLowerCase()
                         ],
                           [bar+" "+foo,foo+" "+bar ,bar+" "+foo.toLowerCase()],[foo+" "+bar]


                        ];
    let recursiveStep=[0,0,0,0,0,0];
    let recursiveStage=[stage,"","","","",""];


        //prestep get all elementnts derived from bar to use in step 3
        for(let element of toCombineText[0])
          {

               let response2= await unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].getCraftResponse({text:bar}, { text:element});
                 if(response2.result!="Nothing" && !toCombineText[2].includes(response2))
               {
                 toCombineText[2].push(response2.result);
                 if(!checkInInventory(response2.result))
                    unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.push( {text: response2.result,
                                    emoji: response2.emoji,
                                    disabled: !1,
                                    discovered: response2.isNew});

               }


          }

  console.log("tools step 3",toCombineText[2])

    while(step<6 )
    {
      console.log(step);
      if(step<0)
        break;

      if(indexInStep<toCombineText[step].length)
      {

         let response=stage;

      console.log("step","instep",step,indexInStep);
        if(foo+" "+bar==stage)
              break;




    if(toCombineText[step][indexInStep]!="nothing" &&

      checkInInventory(toCombineText[step][indexInStep])
      )
      {  console.log("verified:",visited)
         if(visited.find(x=>{ return x.first==stage && x.second==toCombineText[step][indexInStep]}))
            {
              indexInStep+=1;
              console.log("recipe already checked");
              continue;


            }



         visited.push({first:stage,second:toCombineText[step][indexInStep]});

           response= await unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].getCraftResponse({text:stage}, { text:toCombineText[step][indexInStep] });



      }


     else
    {


      response={};
      response.result=stage;
    }




        console.log("response:",response.result);
      //  console.log(step,expectedResults[step])
     if(expectedResults[step].includes(response.result))
       {



         if(
             toCombineText[step][indexInStep]!="nothing" &&
             response.result!="Nothing" &&
             !checkInInventory(response.result) &&
              checkInInventory(toCombineText[step][indexInStep]))
           {

                    unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.push( {text: response.result,
                                    emoji: response.emoji,
                                    disabled: !1,
                                    discovered: response.isNew});

           }




         recursiveStage[step]=stage;
          console.log("success");

         if(foo+" "+bar==stage || foo+" "+bar==response.result)
          break;

         recursiveStep[step]=indexInStep;

         step++;
         stage=response.result;
         indexInStep=0;
          console.log("stage:",stage);
         continue;
       }else
         {
             if(foo+" "+bar==stage)
              break;



           console.log("fail at step",step,".",indexInStep);
           if(indexInStep<toCombineText[step].length-1)
             {
               indexInStep++;

             }

               else
                 {
                   console.log("fail hole step",step);
                   step--;
                   indexInStep= recursiveStep[step]+1;
                   stage=recursiveStage[step];
                   recursiveStep[step]+=1;

                 }

         }
      }else
        {
                   console.log("fail hole step",step);
                   step--;
                   indexInStep= recursiveStep[step]+1;
                   stage=recursiveStage[step];
                   recursiveStep[step]+=1;
       }

    }
      }
  }

  unsafeWindow.ChromaticBuilder=buildUsingChromatic;





})()