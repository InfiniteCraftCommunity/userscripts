# Utils Mod | [Install](https://github.com/InfiniteCraftCommunity/userscripts/raw/master/userscripts/catstone/Lineage%20Generator/index.user.js)

This script generates pretty good lineages directly ingame! (just like infinibrowsers Analyzer does)  
> [!WARNING]
> Requires the newest version of Helper Script to display lineages ingame.  
> Without Helper you can still use the generator in the console by typing ``lineage(`element1`, `element2`, ...)`` 

> [!WARNING]
> This script adds a tiny delay at the game startup. My save with 100k elements and 250k recipes needs ~500ms.

## Features

*   **Displays Lineages In-Game:** Right-click an element and select the "Lineages" tab (requires ICHelper) to see how to craft it starting from Base Elements.
    *   At first it generates a "Simple" lineage. (usually takes around 5ms)
    *   Pressing `Optimise` tries to find an even better lineage. (usually takes around 1 second)
*   **Multi-Target:** Multiple Targets.
*   **Missing Elements:** If an element cannot be made inside your savefile, it will be marked as missing.
*   **Case Variations:** Can use `"hi " + Example = "hi Example"` even if your save only has `"hi " + ExAmPle = "hi Example"`.


# Fun Screenshots
![image](https://github.com/user-attachments/assets/5e04bc4c-da44-43a9-b167-db5f6d7ba0fc)  

adding extra elements guides the generator into a better lineage.  
![image](https://github.com/user-attachments/assets/917adcd9-013b-4983-b3f7-8695a071527d)
![image](https://github.com/user-attachments/assets/09616e3a-c0d4-45b8-9b38-aba2e0ebda3a)  

using very little information you can even match top notch lineages.  
![image](https://github.com/user-attachments/assets/df82283f-3cdc-45a6-9c99-d316c2b311a4)
![image](https://github.com/user-attachments/assets/f6e5b7f4-1469-4ea9-89dd-003d51dcf854)  

Missing Elements!  
![image](https://github.com/user-attachments/assets/637d8fb6-4782-4142-a7b5-ce016d6d24bf)  

Wind only lineage:
1. Open console `Ctrl + Shift + I`
2. type `lineage.vars.baseElementsString = ["Wind"]`
3. type `lineage.vars.refresh()`  
![image](https://github.com/user-attachments/assets/28439326-21c0-4667-b214-020a5f2ac611)  



### by [Catstone](https://github.com/RedCatstone)
