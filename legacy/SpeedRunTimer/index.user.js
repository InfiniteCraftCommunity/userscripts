// ==UserScript==
// @name            Speed running timer
// @namespace       Violentmonkey Scripts
// @match           https://neal.fun/infinite-craft/*
// @grant           GM.setValue
// @grant           GM.getValue
// @grant           unsafeWindow
// @version         1.0.1
// @author          -
// @description     11/1/2024, 8:02:37 PM
// ==/UserScript==


(function () {
    window.addEventListener("load", async () => {
        let infocus = null;
        let timeStart = null;
        let currentTime = null;
        const selectElement = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].selectElement;
        GM.setValue("goal-speedrun", "Lava");

        let timerDiv = document.createElement("div");
        timerDiv.classList.add("timer-speedrun");
        timerDiv.innerHTML = "";
        timerDiv.style.position = "absolute";
        timerDiv.style.top = "50px";

        let state = await GM.getValue("speed-state");

        if (state == "start") {
            let inputGoal = document.createElement("input");

            timerDiv.appendChild(document.createTextNode("Choose Speedrun goals "));
            timerDiv.appendChild(inputGoal);
            inputGoal.addEventListener("input", () => {
                GM.setValue("goal-speedrun", inputGoal.value);
            });

            inputGoal.addEventListener("click", () => {
                infocus = inputGoal;
            });
        } else if (state == "continue") {
            timeStart = new Date();

            let hourSpan = document.createElement("span");
            hourSpan.classList.add("set-hour");

            let minuteSpan = document.createElement("span");
            minuteSpan.classList.add("set-minute");
            let secondSpan = document.createElement("span");
            secondSpan.classList.add("set-second");

            hourSpan.textContent = "00";
            minuteSpan.textContent = "00";
            secondSpan.textContent = "00";
            timerDiv.innerHTML = "";

            timerDiv.appendChild(document.createTextNode("Speedrun timer "));
            timerDiv.appendChild(hourSpan);
            timerDiv.appendChild(document.createTextNode(":"));
            timerDiv.appendChild(minuteSpan);
            timerDiv.appendChild(document.createTextNode(":"));
            timerDiv.appendChild(secondSpan);
        }

        window.addEventListener("keydown", (e) => {
            if (e.key == "Enter") infocus = null;
            if (infocus) {
                infocus.focus();
            }
        });
        
        document.querySelector(".container").appendChild(timerDiv);

        // start timer when item selected
        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].selectElement = exportFunction(async (e, element) => {
            element = element.wrappedJSObject === undefined ? element : element.wrappedJSObject;

            let returnValue = selectElement(e, element);
            let state = await GM.getValue("speed-state");
            if (state == "start") {
                GM.setValue("speed-state", "continue");
                timeStart = new Date();

                let hourSpan = document.createElement("span");
                hourSpan.classList.add("set-hour");

                let minuteSpan = document.createElement("span");
                minuteSpan.classList.add("set-minute");
                let secondSpan = document.createElement("span");
                secondSpan.classList.add("set-second");

                hourSpan.textContent = "00";
                minuteSpan.textContent = "00";
                secondSpan.textContent = "00";
                timerDiv.innerHTML = "";

                timerDiv.appendChild(document.createTextNode("Speedrun timer "));
                timerDiv.appendChild(hourSpan);
                timerDiv.appendChild(document.createTextNode(":"));
                timerDiv.appendChild(minuteSpan);
                timerDiv.appendChild(document.createTextNode(":"));
                timerDiv.appendChild(secondSpan);
            }
        });
        
        // background timer updater one a sec
        let bkgW = setInterval(async () => {
            let state = await GM.getValue("speed-state");
            if (state == "continue") {
                currentTime = new Date();
                let difference = currentTime - timeStart;
                let sec = Math.floor(difference / 1000) % 60;
                let minutes = Math.floor(difference / 60000) % 60;
                let hours = Math.floor(difference / 3600000);
                document.querySelector(".set-second").textContent = sec.toString();
                document.querySelector(".set-minute").textContent = minutes.toString();
                document.querySelector(".set-hour").textContent = hours.toString();
            }
        }, 1000);

        document.querySelector(".reset").style.zIndex = "1000";

        document.querySelector(".reset").addEventListener("click", () => {
            GM.setValue("speed-state", "start");
            let inputGoal = document.createElement("input");
            timerDiv.innerHTML = "";
            timerDiv.appendChild(document.createTextNode("Choose Speedrun goal "));
            timerDiv.appendChild(inputGoal);
            inputGoal.addEventListener("input", () => {
                GM.setValue("goal-speedrun", inputGoal.value);
                inputGoal.addEventListener("click", () => {
                    infocus = inputGoal;
                });
            });

            return returnValue;
        }, unsafeWindow);

        const getCraftResponse = unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse;

        unsafeWindow.$nuxt.$root.$children[1].$children[0].$children[0].getCraftResponse = exportFunction((...args) => {
            new window.Promise(async (resolve) => {
                const response = await getCraftResponse(...args);

                let state = await GM.getValue("speed-state");

                if (state == "continue") {
                    if (response.result == (await GM.getValue("goal-speedrun"))) {
                        GM.setValue("speed-state", "done");
                        document.querySelector(".timer-speedrun").replaceChildren(document.createTextNode("Speedruning done"));
                    }
                }

                resolve(response);
            })
        }, unsafeWindow);
    }, false);
})();
