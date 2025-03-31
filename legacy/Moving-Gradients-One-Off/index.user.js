// ==UserScript==
// @name        Chroatic One off
// @namespace   Violentmonkey Scripts
// @match       https://neal.fun/infinite-craft/*
// @grant       none
// @version     1.0.1
// @author      Alexander_Andercou
// @description 7/11/2024, 10:00:45 PM
// ==/UserScript==


(function () {
    var EMOJIS = {};

    function emojiToUni(emoji) {
        return emoji.codePointAt(0);
    }
    
    function getAvgHex(color, total) {
        return Math.round(color / total)
            .toString(16)
            .padStart(2, 0);
    }

    function calculatedAverageAndMaxFreqColor(emoji) {
        let totalPixels = 0;
        const colors = {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0,
        };
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.font = "30px Arial";
        ctx.fillStyle = window.getComputedStyle(document.querySelector(".container")).getPropertyValue("--text-color").trim();
        ctx.fillText(emoji, 0, 28);
        var colors2 = [];
        var freq = [];
        const { data: imageData } = ctx.getImageData(0, 0, 30, 30);

        for (let i = 0; i < imageData.length; i += 4) {
            let [r, g, b, a] = imageData.slice(i, i + 4);
            if (a > 50) {
                let JColors = JSON.stringify(colors2);
                let JColor = JSON.stringify([r, g, b]);

                if (JColors.indexOf(JColor) > -1) {
                    let index = 0;
                    for (let [rc, gc, bc] of colors2) {
                        if (r == rc && g == gc && b == bc) break;
                        index += 1;
                    }

                    freq[index] += 1;
                } else {
                    if (r != 0 || g != 0 || b != 0) {
                        colors2.push([r, g, b]);
                        freq.push(1);
                    }
                }

                totalPixels += 1;
                colors.red += r;
                colors.green += g;
                colors.blue += b;
                colors.alpha += a;
            }
        }
        const r = getAvgHex(colors.red, totalPixels);
        const g = getAvgHex(colors.green, totalPixels);
        const b = getAvgHex(colors.blue, totalPixels);
        const indexOfLargestValue = freq.reduce((maxIndex, currentValue, currentIndex, array) => (currentValue > array[maxIndex] ? currentIndex : maxIndex), 0);
        const secondColor = colors2[indexOfLargestValue];

        return ["#" + r + g + b, "rgb(" + secondColor[0].toString() + "," + secondColor[1].toString() + "," + secondColor[2].toString() + ")"];
    }
    
    function getEmojiColors(emoji) {
        var code = emojiToUni(emoji);
        if (!(code in EMOJIS)) {
            EMOJIS[code] = ["", ""];

            EMOJIS[code] = calculatedAverageAndMaxFreqColor(emoji);

            localStorage.setItem("emojiColors", JSON.stringify(EMOJIS));
            return EMOJIS[code];
        } else {
            return EMOJIS[code];
        }
    }

    function doStuffOnInstancesMutation(mutations) {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.id != "instance-0" && !node.classList.contains("background-instance")) {
                        const emojiSpan = node.querySelector(".instance-emoji");
                        const emoji = emojiSpan.textContent;
                        const avg = getEmojiColors(emoji)[0];
                        node.style.setProperty("--avgColor", avg);
                        node.style.setProperty("--maxFreq", getEmojiColors(emoji)[1]);
                        node.style.setProperty("--shadow-rgb", avg);

                        let text_div = node.querySelector(".instance-discovered-text");
                        if (text_div) {
                            text_div.style.setProperty("--main-color", "color-mix( in srgb," + avg + ",#fff 60%)");
                            text_div.style.setProperty("--second-color", avg);
                            let discovery_img = text_div.querySelector(".instance-discovered-emoji");
                            if (discovery_img)
                                discovery_img.src =
                                    `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"
             width="10px" height="10px"><path fill="%23` +
                                    avg.substring(1) +
                                    `" d="M49.306 26.548l-11.24-3.613-3.613-11.241C34.319
             11.28 33.935 11 33.5 11s-.819.28-.952.694l-3.613 11.241-11.24 3.613C17.28 26.681 17 27.065 17
             27.5s.28.819.694.952l11.24 3.613 3.613 11.241C32.681 43.72 33.065 44 33.5 44s.819-.28.952-.694l3.613-11.241
             11.24-3.613C49.72 28.319 50 27.935 50 27.5S49.72 26.681 49.306 26.548zM1.684 13.949l7.776 2.592 2.592 7.776C12.188 24.725
             12.569 25 13 25s.813-.275.948-.684l2.592-7.776 7.776-2.592C24.725 13.813 25 13.431 25 13s-.275-.813-.684-.949L16.54
             9.459l-2.592-7.776C13.813 1.275 13.431 1 13 1s-.813.275-.948.684L9.46 9.459l-7.776 2.592C1.275 12.188 1 12.569
             1 13S1.275 13.813 1.684 13.949zM17.316 39.05l-5.526-1.842-1.842-5.524C9.813 31.276 9.431 31 9 31s-.813.275-.948.684L6.21
             37.208.685 39.05c-.408.136-.684.518-.684.949s.275.813.684.949l5.526 1.842 1.841 5.524C8.188 48.721 8.569 48.997 9
             48.997s.813-.275.948-.684l1.842-5.524 5.526-1.842C17.725 40.811 18 40.429 18 39.999S17.725 39.186 17.316 39.05z"/></svg>`;
                        }
                    }
                }
            }
        }
    }

    function initColors() {
        EMOJIS = {};
        console.log("init colors");

        if (localStorage.getItem("emojiColors") != null) {
            EMOJIS = JSON.parse(localStorage.getItem("emojiColors"));
        }

        const instanceObserver = new MutationObserver((mutations) => {
            doStuffOnInstancesMutation(mutations);
        });

        instanceObserver.observe(document.getElementsByClassName("instances")[0], {
            childList: true,
            subtree: true,
        });
    }

    function injectCSS() {
        let css = `
        :root {
              --mouse-x: 0px;
              --avgColor:rgb(0,255,255);
              --maxFreq:rgb(0,255,255);
              }

        .instance {

            --bg-angle     : -60deg;
            --backgroundImg: none;
            --x-offset     : 0px;
            --y-offset     : 0px;
            --radius       : 20px;
            --spread       : 6.4px;
            --hue: 0;
            --hsl-color: var(--hue), 100%, 50%;
            --shadow-rgb   : rgb(0, 255, 255);
            --opacity      : 40%;
            animation: spin 3.5s  infinite cubic-bezier(0.4,0,0.2,1) running;
            border-image  : linear-gradient(var(--bg-angle) ,var(--avgColor),var(--maxFreq),var(--avgColor),var(--maxFreq)) 2 !important;
            border-color:transparent !important;
            border-radius: 0px !important;
            border-width:3px !important;
            box-shadow   : 0 0 var(--radius) color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity )),
            inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent 70%) ;
            display: block;

             }
        .invisible
        {
          display:none;


        }

        .instance-discovered {
            --img-content:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23FFAC33' d='M34.347 16.893l-8.899-3.294-3.323-10.891c-.128-.42-.517-.708-.956-.708-.439 0-.828.288-.956.708l-3.322 10.891-8.9 3.294c-.393.146-.653.519-.653.938 0 .418.26.793.653.938l8.895 3.293 3.324 11.223c.126.424.516.715.959.715.442 0 .833-.291.959-.716l3.324-11.223 8.896-3.293c.391-.144.652-.518.652-.937 0-.418-.261-.792-.653-.938z'/%3E%3Cpath fill='%23FFCC4D' d='M14.347 27.894l-2.314-.856-.9-3.3c-.118-.436-.513-.738-.964-.738-.451 0-.846.302-.965.737l-.9 3.3-2.313.856c-.393.145-.653.52-.653.938 0 .418.26.793.653.938l2.301.853.907 3.622c.112.444.511.756.97.756.459 0 .858-.312.97-.757l.907-3.622 2.301-.853c.393-.144.653-.519.653-.937 0-.418-.26-.793-.653-.937zM10.009 6.231l-2.364-.875-.876-2.365c-.145-.393-.519-.653-.938-.653-.418 0-.792.26-.938.653l-.875 2.365-2.365.875c-.393.146-.653.52-.653.938 0 .418.26.793.653.938l2.365.875.875 2.365c.146.393.52.653.938.653.418 0 .792-.26.938-.653l.875-2.365 2.365-.875c.393-.146.653-.52.653-.938 0-.418-.26-.792-.653-.938z'/%3E%3C/svg%3E");
            --x-offset        : 0px;
            --y-offset        : 0px;
            --radius          : 20px;
            --spread          : 4px;
            --shadow-rgb      : rgb( 0, 255, 255);
            --opacity         : 50%;
            border-width      : 2px;
            -webkit-box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity)),
             inset 0 0 20px  color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity)) ;
            -moz-box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread)  color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity)),
             inset 0 0 20px color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity));

            ;
            box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity)),
            inset 0 0 20px color-mix(in srgb, var(--shadow-rgb), transparent var(--opacity));

        }

         .instance-discovered::after {
            content: var(--img-content);
            width  : 30px;
            height : 30px;

            position : absolute;
            top      : 0;
            left     : 0;
            transform: translate(-50%, -50%);
              }



        .instance-discovered-text{

        --main-color  : rgb(45,255,196);
        --second-color: #167fc6;

        -webkit-animation      : background-pan 3s linear infinite !important;
        animation              : background-pan 3s linear infinite !important;
        background             : linear-gradient( to right,  var(--main-color), var(--second-color),var(--main-color) ) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        -moz-background-clip   : text;
        -moz-text-fill-color   : transparent;
        -moz-animation         : background-pan 3s linear infinite !important;
        white-space            : nowrap !important;
        z-index                : 200;
        font-weight            : bold !important;
        font-size              : 16px !important;
        width                  : 200px !important;
        background-size        : 200% !important;

        }

       .instance-discovered-emoji {
             filter: none !important;

        ;}
             .noneStyle
           {

          box-shadow        : none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow   : none !important;

           }

        .item-discovered {
            --x-offset  : 0px;
            --y-offset  : 0px;
            --radius    : 5px;
            --spread    : 4px;
            --shadow-rgb: 255, 240, 31;
            --opacity   : 0.2;
            border-width: 1px !important;

            -webkit-box-shadow: var(--x-offset) var(--y-offset) var(--radius) var(--spread) rgba(var(--shadow-rgb), var(--opacity));
            -moz-box-shadow   : var(--x-offset) var(--y-offset) var(--radius) var(--spread) rgba(var(--shadow-rgb), var(--opacity));
            box-shadow        : var(--x-offset) var(--y-offset) var(--radius) var(--spread) rgba(var(--shadow-rgb), var(--opacity));
            border-color      : rgba(var(--shadow-rgb), 0.4) !important;
        }



          .theme_settings_cont
              {

              background : var(--background-color);
              border     : 1px solid var(--border-color);
              color      : var(--text-color);
              font-family: Roboto, sans-serif;
              font-size  : 15.4px;
              }

             .theme:hover
             {
               background:gray;

             }
         .theme_settings_opt {
            overflow-y: scroll;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none;  /* Internet Explorer 10+ */}
         .theme_settings_opt::-webkit-scrollbar { /* WebKit */
            width: 0;
            height: 0;}




           @keyframes spin {
                0% { --bg-angle: 0.00deg; }1% { --bg-angle: 3.60deg; }2% { --bg-angle: 7.20deg; }  3% { --bg-angle: 10.80deg; }
                4% { --bg-angle: 14.40deg; } 5% { --bg-angle: 18.00deg; } 6% { --bg-angle: 21.60deg; } 7% { --bg-angle: 25.20deg; }
                8% { --bg-angle: 28.80deg; }  9% { --bg-angle: 32.40deg; } 10% { --bg-angle: 36.00deg; } 11% { --bg-angle: 39.60deg; }
                12% { --bg-angle: 43.20deg; } 13% { --bg-angle: 46.80deg; } 14% { --bg-angle: 50.40deg; }
                15% { --bg-angle: 54.00deg; } 16% { --bg-angle: 57.60deg; } 17% { --bg-angle: 61.20deg; }
                18% { --bg-angle: 64.80deg; } 19% { --bg-angle: 68.40deg; } 20% { --bg-angle: 72.00deg; }
                21% { --bg-angle: 75.60deg; } 22% { --bg-angle: 79.20deg; } 23% { --bg-angle: 82.80deg; }
                24% { --bg-angle: 86.40deg; } 25% { --bg-angle: 90.00deg; } 26% { --bg-angle: 93.60deg; }
                27% { --bg-angle: 97.20deg; } 28% { --bg-angle: 100.80deg; } 29% { --bg-angle: 104.40deg; }
                30% { --bg-angle: 108.00deg; } 31% { --bg-angle: 111.60deg; } 32% { --bg-angle: 115.20deg; }
                33% { --bg-angle: 118.80deg; } 34% { --bg-angle: 122.40deg; } 35% { --bg-angle: 126.00deg; }
                36% { --bg-angle: 129.60deg; } 37% { --bg-angle: 133.20deg; } 38% { --bg-angle: 136.80deg; }
                39% { --bg-angle: 140.40deg; } 40% { --bg-angle: 144.00deg; } 41% { --bg-angle: 147.60deg; }
                42% { --bg-angle: 151.20deg; } 43% { --bg-angle: 154.80deg; } 44% { --bg-angle: 158.40deg; }
                45% { --bg-angle: 162.00deg; } 46% { --bg-angle: 165.60deg; } 47% { --bg-angle: 169.20deg; }
                48% { --bg-angle: 172.80deg; } 49% { --bg-angle: 176.40deg; } 50% { --bg-angle: 180.00deg; }
                51% { --bg-angle: 183.60deg; } 52% { --bg-angle: 187.20deg; } 53% { --bg-angle: 190.80deg; }
                54% { --bg-angle: 194.40deg; } 55% { --bg-angle: 198.00deg; } 56% { --bg-angle: 201.60deg; }
                57% { --bg-angle: 205.20deg; } 58% { --bg-angle: 208.80deg; }59% { --bg-angle: 212.40deg; }
                60% { --bg-angle: 216.00deg; } 61% { --bg-angle: 219.60deg; } 62% { --bg-angle: 223.20deg; }
                63% { --bg-angle: 226.80deg; } 64% { --bg-angle: 230.40deg; } 65% { --bg-angle: 234.00deg; }
                66% { --bg-angle: 237.60deg; } 67% { --bg-angle: 241.20deg; } 68% { --bg-angle: 244.80deg; }
                69% { --bg-angle: 248.40deg; } 70% { --bg-angle: 252.00deg; } 71% { --bg-angle: 255.60deg; }
                72% { --bg-angle: 259.20deg; } 73% { --bg-angle: 262.80deg; } 74% { --bg-angle: 266.40deg; }
                75% { --bg-angle: 270.00deg; } 76% { --bg-angle: 273.60deg; } 77% { --bg-angle: 277.20deg; }
                78% { --bg-angle: 280.80deg; } 79% { --bg-angle: 284.40deg; } 80% { --bg-angle: 288.00deg; }
                81% { --bg-angle: 291.60deg; } 82% { --bg-angle: 295.20deg; } 83% { --bg-angle: 298.80deg; }
                84% { --bg-angle: 302.40deg; } 85% { --bg-angle: 306.00deg; } 86% { --bg-angle: 309.60deg; }
                87% { --bg-angle: 313.20deg; } 88% { --bg-angle: 316.80deg; } 89% { --bg-angle: 320.40deg; }
                90% { --bg-angle: 324.00deg; } 91% { --bg-angle: 327.60deg; } 92% { --bg-angle: 331.20deg; }
                93% { --bg-angle: 334.80deg; } 94% { --bg-angle: 338.40deg; } 95% { --bg-angle: 342.00deg; }
                96% { --bg-angle: 345.60deg; } 97% { --bg-angle: 349.20deg; } 98% { --bg-angle: 352.80deg; }
                99% { --bg-angle: 356.40deg; }
        }



          @keyframes change-colors{0%{--hue:0}1%{--hue:3.6}2%{--hue:7.2}3%{--hue:10.8}4%{--hue:14.4}5%{--hue:18}6%{--hue:21.6}7%{--hue:25.2}8%{--hue:28.8}
          9%{--hue:32.4}10%{--hue:36}11%{--hue:39.6}12%{--hue:43.2}13%{--hue:46.8}14%{--hue:50.4}15%{--hue:54}16%{--hue:57.6}17%{--hue:61.2}18%{--hue:64.8}
          19%{--hue:68.4}20%{--hue:72}21%{--hue:75.6}22%{--hue:79.2}23%{--hue:82.8}24%{--hue:86.4}25%{--hue:90}26%{--hue:93.6}27%{--hue:97.2}28%{--hue:100.8}
          29%{--hue:104.4}30%{--hue:108}31%{--hue:111.6}32%{--hue:115.2}33%{--hue:118.8}34%{--hue:122.4}35%{--hue:126}36%{--hue:129.6}37%{--hue:133.2}38%{--hue:136.8}
          39%{--hue:140.4}40%{--hue:144}41%{--hue:147.6}42%{--hue:151.2}43%{--hue:154.8}44%{--hue:158.4}45%{--hue:162}46%{--hue:165.6}47%{--hue:169.2}48%{--hue:172.8}
          49%{--hue:176.4}50%{--hue:180}51%{--hue:183.6}52%{--hue:187.2}53%{--hue:190.8}54%{--hue:194.4}55%{--hue:198}56%{--hue:201.6}57%{--hue:205.2}
          58%{--hue:208.8}59%{--hue:212.4}60%{--hue:216}61%{--hue:219.6}62%{--hue:223.2}63%{--hue:226.8}64%{--hue:230.4}65%{--hue:234}66%{--hue:237.6}
          67%{--hue:241.2}68%{--hue:244.8}69%{--hue:248.4}70%{--hue:252}71%{--hue:255.6}72%{--hue:259.2}73%{--hue:262.8}74%{--hue:266.4}75%{--hue:270}
          76%{--hue:273.6}77%{--hue:277.2}78%{--hue:280.8}79%{--hue:284.4}80%{--hue:288}81%{--hue:291.6}82%{--hue:295.2}83%{--hue:298.8}84%{--hue:302.4}
          85%{--hue:306}86%{--hue:309.6}87%{--hue:313.2}88%{--hue:316.8}89%{--hue:320.4}90%{--hue:324}91%{--hue:327.6}92%{--hue:331.2}93%{--hue:334.8}
          94%{--hue:338.4}95%{--hue:342}96%{--hue:345.6}97%{--hue:349.2}98%{--hue:352.8}99%{--hue:356.4}100%{--hue:360}}

         .switch
         {
           background-color: gray;
           border-radius: 30px;
           position: relative;
           display: inline-block;
           width: 60px;
           height: 34px;
           -webkit-transition: .4s;
           transition: .4s;
         }
        input[type=checkbox]
         {
             opacity: 0;
             width: 0;
             height: 0;
         }
         .ball
         {
         height:34px;
         width:30px;
         content:'';
         border-radius:50%;
         background-color:var(--text-color);
         position:absolute;
         margin-left:1px;
         -webkit-transition: .4s;
         transition: .4s;
         };

        `;

        let style = document.createElement("style");
        style.appendChild(document.createTextNode(css.trim()));
        document.getElementsByTagName("head")[0].appendChild(style);
    }

    window.addEventListener("load", async () => {
        console.log("Welcome to themes");
        injectCSS();
        initColors();
    });
})();
