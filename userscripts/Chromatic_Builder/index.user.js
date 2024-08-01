/ ==UserScript==
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
  async function buildUsingChromatic(foo,bar)
  {

    if( unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.find((e) => e.text == foo) && unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.find((e) => e.text == bar))
      {
    let stage=foo;
    let step=0;
    let indexInStep=0;

    let toCombineText=[["\"the\"","\"the \"", "\"the Chromatic\"","\"the Chromatic \"","\"the Achromatic\"","\"the Achromatic \"","\"the Monochromatic\"","\"the Monochromatic \""],
    ["nothing","U+0020", "U++0020","U+++0020","Append U+0020"," Prepend U+0020","Append Space","Prepend Space"],
    [bar],
    ["Delete First Word", " Delete The First Word","Remove First Word","Remove The First Word","Delete Chromatic","Delete Achromatic","Delete Monochromatic","Remove Chromatic","Remove Achromatic",
    "Delete The The","Remove The The","Without The The","Delete The Word The","Remove The Word The","Without The Word The"],
    ["Delete The The","Remove The The","Without The The","Delete The Word The","Remove The Word The","Without The Word The"]



                      ];
    let expectedResults=[

                         ["\"the "+foo+"\"", "\"the Chromatic "+foo+"\"","\"the Achromatic "+foo+"\"","\"the Monochromatic "+foo+"\""],
                         ["\the "+foo+"\"","\the "+foo+" \"","\"the Chromatic "+foo+" \"","\"the Achromatic "+foo+" \"","\"the Monochromatic "+foo+" \"",
                         "\"the "+foo+"\"", "\"the Chromatic "+foo+"\"","\"the Achromatic "+foo+"\"","\"the Monochromatic "+foo+"\""],
                         ["\the "+foo+" "+bar+"\"","\"the Chromatic "+foo+" "+bar+"\"","\"the Achromatic "+foo+" "+bar+"\"","\"the Monochromatic "+foo+" "+bar+"\""],
                         [foo+" "+bar,"\"the "+foo+" "+bar+"\"","\"Chromatic "+foo+" "+bar+"\"","\"Achromatic "+foo+" "+bar+"\"","\"Monochromatic "+foo+" "+bar+"\""],[foo+" "+bar]


                        ];
    let recursiveStep=[0,0,0,0,0,0];
    let recursiveStage=stage;

    while(step<5 )
    {
      console.log(step);
      if(step<0)
        break;

      if(indexInStep<toCombineText[step].length)
      {

    let response=stage;


    if(toCombineText[step][indexInStep]!="nothing" &&
      unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0]._data.elements.find((e) => e.text == toCombineText[step][indexInStep])
      )


    response= await unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].getCraftResponse({text:stage}, { text:toCombineText[step][indexInStep] });
     else
    {
      response={};
      response.result=stage;
    }




        console.log("response:",response.result);
     if(expectedResults[step].includes(response.result))
       {
          await unsafeWindow.$nuxt.$root.$children[2].$children[0].$children[0].craft({text:stage}, { text:toCombineText[step][indexInStep] });



         recursiveStage=stage;
          console.log("success");
         stage=response.result;

         if(foo+" "+bar==stage)
          break;

         recursiveStep[step]=indexInStep;

         step++;
         stage=response.result;
         indexInStep=0;
          console.log("stage:",stage)
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
                   recursiveStep[step]+=1;
                   stage=recursiveStage;
                 }

         }
      }else
        {
                   console.log("fail hole step",step);
                   step--;
                   indexInStep= recursiveStep[step]+1;
       }

    }
      }
  }

  unsafeWindow.ChromaticBuilder=buildUsingChromatic;





})()