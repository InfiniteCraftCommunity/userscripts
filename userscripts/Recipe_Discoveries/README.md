# IC Recipe Discoveries 🧪

![Icon](https://i.imgur.com/WlkWOkU.png)

## 📜 Description
This **Userscript** adds a feature to [Infinite Craft](https://neal.fun/infinite-craft/) that checks if you were the **first to discover a recipe**.  
- No **GUI implementation yet**: The script adds properties to the response JSON but does not display them in the game interface.  

## 🚀 Features
- **Detect first recipe discoveries**: Adds a `recipeNew` property to the crafting response JSON to indicate whether the recipe is a new discovery.  
- Provides information about whether a crafting attempt resulted in "Nothing" with the `actuallyNothing` property.  
- Uses the backend API to verify recipes before and after crafting.  

## 📝 Usage
- The script runs automatically and modifies the crafting response behind the scenes.  
- The `recipeNew` and `actuallyNothing` properties are only accessible through the console or debugging tools.  

## ⚠️ Notes
- There is **no GUI implementation** yet.  
- To see the new properties, inspect the crafting response JSON using your browser's developer tools.  
- This feature is experimental and works by intercepting and augmenting the existing crafting logic.

## 📋 License
This Userscript is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.  

## 👨‍💻 Author
Created by [@activetutorial](https://discord.com/) on Discord.
