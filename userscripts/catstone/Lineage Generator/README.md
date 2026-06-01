# Lineage Generator | [Install](https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/catstone/Lineage%20Generator/index.user.js)

This script generates pretty good lineages directly ingame! (just like infinibrowsers Analyzer does)  
> [!WARNING]
> Requires the newest version of Helper Script to display lineages ingame.  
> Without Helper you can still use the generator in the console by typing ``lineage.make(`element1`, `element2`, ...)``

> [!WARNING]
> This script adds a teeny tiny delay at the game startup. My save with 100k elements and 250k dense recipes needs ~500ms.

## Features
*   **Displays Lineages In-Game:** Open the icHelper recipe modal, by right-clicking an element and select the "Lineages" tab to see how to craft it starting from Base Elements.
    *   It will then generates a "Simple" lineage. (~takes 5ms)
    *   Pressing `Optimise` tries to find an even better lineage. (~takes a couple seconds)
*   **Multi-Target:** Multiple Targets. WOW!
*   **Missing Elements:** If an element cannot be made inside your savefile, it will be marked as missing.
*   **Case Variations:** Can use `"hi " + Example = "hi Example"` even if your save only has `"hi " + ExAmPle = "hi Example"`.


# Fun Screenshots
![image](https://github.com/user-attachments/assets/5e04bc4c-da44-43a9-b167-db5f6d7ba0fc)  

## adding extra elements can guide the generator into a better lineage:  
![image](https://github.com/user-attachments/assets/917adcd9-013b-4983-b3f7-8695a071527d)
![image](https://github.com/user-attachments/assets/09616e3a-c0d4-45b8-9b38-aba2e0ebda3a)  

## using very little information you can even match top notch lineages:  
![image](https://github.com/user-attachments/assets/df82283f-3cdc-45a6-9c99-d316c2b311a4)
![image](https://github.com/user-attachments/assets/f6e5b7f4-1469-4ea9-89dd-003d51dcf854)  

## Missing Elements:  (vv this savefile is completely broken vv)  
![image](https://github.com/user-attachments/assets/637d8fb6-4782-4142-a7b5-ce016d6d24bf)  

## Wind only lineage:  
1. Open console `Ctrl + Shift + I`
2. type `lineage.vars.baseElementsString = ["Wind"]`
3. type `lineage.vars.refresh()`  
![image](https://github.com/user-attachments/assets/28439326-21c0-4667-b214-020a5f2ac611)  

## Checking Lineages:
1. Open console `Ctrl + Shift + I`
- ``lineage.missing(`...`)`` checks which recipes from the lineage are missing in your save.
- ``lineage.verify(`...`)`` will request neals api/check/ to verify if recipes are valid. There should be no rate-limit on this api, but just to be sure there is a 50ms timeout in this code. (this function also displays lineage.missing stuff for convenience)  
![image](https://github.com/user-attachments/assets/b4a975c1-e443-4949-a850-1ca750005977)

### by [Catstone](https://github.com/RedCatstone)
