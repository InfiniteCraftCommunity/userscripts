// ==UserScript==
// @name       AIVOICE
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       unsafeWindow
// @grant       GM.xmlHttpRequest
// @version     1.0
// @author      -
// @description 6/13/2025, 7:40:56 PM
// ==/UserScript==

(function()
{
  window.addEventListener("load",()=>{
    const v_container = document.querySelector(".container").__vue__;
  	const craftApi = v_container.craftApi;
     function makeAudio(src)
{
  let audio=document.createElement("audio");


  audio.src=src;
  audio.volume=.4;
  audio.type="audio/mpeg";
  console.log(audio);
  document.body.appendChild(audio);
  audio.play();

}

  v_container.craftApi = async function(a, b) {
    [a, b] = [a, b].sort();
		const result = await craftApi.apply(this, [a, b]);

   if(result && result.text)
     {
    var replaceSpecialCharacters= (str)=>{
    const charMap = {
        "\uFFF9": "Interlinear Annotation Anchor",
        "\uFFFA": "Interlinear Annotation Separator",
        "\uFFFB": "Interlinear Annotation Terminator",
        "\uFFFC": "Object Replacement Character",
        "\uFFFD": "Replacement Character",
        "\uFFFE": "Noncharacter",
        "\uFFFF": "Noncharacter",
        "\u0001": "Start of Heading",
        "\u0002": "Start of Text",
        "\u0003": "End of text",
        "\u0004": "End of transmission",
        "\u0005": "Enquiry",
        "\u0006": "Acknowledge",
        "\u0007": "Bell",
        "\u0008": "Backspace",
        "\u0009": "Horizontal tab",
        "\u000A": "Line feed",
        "\u000B": "Vertical tab",
        "\u000C": "Form feed",
        "\u000D": "Carriage return",
        "\u000E": "Shift Out",
        "\u000F": "Shift In",
        "\u0010": "Data Link Escape",
        "\u0011": "Device Control 1",
        "\u0012": "Device Control 2",
        "\u0013": "Device Control 3",
        "\u0014": "Device Control 4",
        "\u0015": "Negative acknowledge",
        "\u0016": "Synchronous Idle",
        "\u0017": "End of Transmission Block",
        "\u0018": "Cancel",
        "\u0019": "End of Medium",
        "\u001A": "Substitute",
        "\u001B": "Escape",
        "\u001C": "File Separator",
        "\u001D": "Group Separator",
        "\u001E": "Record Separator",
        "\u001F": "Unit Separator",
        "\u200C": "Zero Width Non-Joiner",
        "\u200D": "Zero Width Joiner",
        "\uFE00": "Variation Selector 1",
        "\uFE01": "Variation Selector 2",
        "\uFE02": "Variation Selector 3",
        "\uFE03": "Variation Selector 4",
        "\uFE04": "Variation Selector 5",
        "\uFE05": "Variation Selector 6",
        "\uFE06": "Variation Selector 7",
        "\uFE07": "Variation Selector 8",
        "\uFE08": "Variation Selector 9",
        "\uFE09": "Variation Selector 10",
        "\uFE0A": "Variation Selector 11",
        "\uFE0B": "Variation Selector 12",
        "\uFE0C": "Variation Selector 13",
        "\uFE0D": "Variation Selector 14",
        "\uFE0E": "Variation Selector 15",
        "\uFE0F": "Variation Selector 16"

    };
 const replacers = {
        "{FFF9}": "Interlinear Annotation Anchor",
        "{FFFA}": "Interlinear Annotation Separator",
        "{FFFB}": "Interlinear Annotation Terminator",
        "{FFFC}": "Object Replacement Character",
        "{FFFD}": "Replacement Character",
        "{FFFE}": "Noncharacter",
        "{FFFF}": "Noncharacter",
        "{0001}": "Start of Heading",
        "{0002}": "Start of Text",
        "{0003}": "End of text",
        "{0004}": "End of transmission",
        "{0005}": "Enquiry",
        "{0006}": "Acknowledge",
        "{0007}": "Bell",
        "{0008}": "Backspace",
        "{0009}": "Horizontal tab",
        "{000A}": "Line feed",
        "{000B}": "Vertical tab",
        "{000C}": "Form feed",
        "{000D}": "Carriage return",
        "{000E}": "Shift Out",
        "{000F}": "Shift In",
        "{0010}": "Data Link Escape",
        "{0011}": "Device Control 1",
        "{0012}": "Device Control 2",
        "{0013}": "Device Control 3",
        "{0014}": "Device Control 4",
        "{0015}": "Negative acknowledge",
        "{0016}": "Synchronous Idle",
        "{0017}": "End of Transmission Block",
        "{0018}": "Cancel",
        "{0019}": "End of Medium",
        "{001A}": "Substitute",
        "{001B}": "Escape",
        "{001C}": "File Separator",
        "{001D}": "Group Separator",
        "{001E}": "Record Separator",
        "{001F}": "Unit Separator",
        "Seq.":"Sequence",
        "{200C}": "Zero Width Non Joiner",
        "{200D}": "Zero Width Joiner",
        "{FE00}": "Variation Selector 1",
        "{FE01}": "Variation Selector 2",
        "{FE02}": "Variation Selector 3",
        "{FE03}": "Variation Selector 4",
        "{FE04}": "Variation Selector 5",
        "{FE05}": "Variation Selector 6",
        "{FE06}": "Variation Selector 7",
        "{FE07}": "Variation Selector 8",
        "{FE08}": "Variation Selector 9",
        "{FE09}": "Variation Selector 10",
        "{FE0A}": "Variation Selector 11",
        "{FE0B}": "Variation Selector 12",
        "{FE0C}": "Variation Selector 13",
        "{FE0D}": "Variation Selector 14",
        "{FE0E}": "Variation Selector 15",
        "{FE0F}": "Variation Selector 16"

    };
    str=str.replace(/[\u0001-\u200D\uFE00-\uFFFF]/g, match => charMap[match] || match);

    str=str.toLowerCase();
    var entries=Object.entries(replacers);
    for(let entry of entries)
      {

        str=str.replace(entry[0].toLowerCase(),entry[1]);

      }


return str;
}
    var cleanedText= replaceSpecialCharacters(result.text)
    var text=encodeURIComponent(cleanedText);
    GM.xmlHttpRequest({
      method: "GET",
      url: `https://translate.google.com/translate_tts?ie=UTF-8&q=${text}&tl=en&client=tw-ob&ttsspeed=1`,
      responseType: "blob",
      headers: {
        "Origin": "https://neal.fun"
      },
      onload(response) {
        const blob = response.response;
        const objectUrl = URL.createObjectURL(blob);
        makeAudio(objectUrl);

      }}
    );
  }
    		return result;
  };

console.log(v_container.craftApi);



	})})();





