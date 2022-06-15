# Skimpify Framework

Skyrim Platform plugin. Makes it possible to change to skimpier armors and back.

# Overview

We all love armors with skimpy or damaged variants, but there's no way to really use them but to go to your items menu and then equip them manually to simulate things happening while playing... until now.

This framework enables modders to make mods that automatically swap to those variants, so the player can concentrate on what really matters: playing.

This framework is the result of an idea that have been floating around my mind for many years: having [wardrobe malfunctions][Wardrobe Malfunction] and broken armors while playing.

But that wasn't really feasible because of Papyrus' hilarious slowness and sorry clunkiness.
It's just now that [Skyrim Platform][] exists that this idea was finally able to come true.

# Requirements

- [Skyrim Platform][]
- [JContainers SE][]

# Usage for both modders and users

Put `skimpify-framework.js` and its settings file in the `Data\Platform\Plugins` folder.

You can find both [here][Compiled]. This framework is functional, but has not had an official release yet.

You most likely came here because some other mod uses this framework to work or has some kind of integration with it.

If you are a mod user, you only really care about installing the framework and some [armor definitions][ArmorDefs].\
Those are the only files you need to install to make your already installed mod to work.

If you are a mod user who wants to add new armor definitions to your game, [read the help file here][Help] (if so, it would be nice if you share them with all of us here).

You also need some mod that actually uses this framework.\
Here's a list of known mods:

- [Wardrobe Malfunction][]
- [Easy Containers][] (has hotkeys that makes easier dealing when registering armors for this framework)

# Usage for modders

`skimpify-api.ts` goes next to `skyrimPlatform.ts`, in the `Data\Platform\Modules` folder.

To actually use it, include the API in your project with something like:

```ts
import * as Skimpify from "skimpify-api"

// Then use functions
const skimpyVersion = Skimpify.GetSkimpy(armor)
let modestArmors[] = Skimpify.GetAllModest(player)
const nipSlip = Skimpify.GetSlip(armor)
```

Right now there's not a list of API functions and what they do, but they all are documented with TsDoc inside `skimpify-api.ts`, so you can get hints if you are using Visual Studio Code (you can also read them with any text editor of course).

**You should also [read the documentation][Help]** so you can understand what this framework is capable of and how to use it.


[ArmorDefs]: https://github.com/CarlosLeyvaAyala/skimpify-framework/tree/main/SKSE/Plugins/Skimpify%20Framework
[Compiled]: Platform/Plugins
[Easy Containers]: https://github.com/CarlosLeyvaAyala/Easy-Containers
[Help]: Help/help.pdf
[JContainers SE]: https://www.nexusmods.com/skyrimspecialedition/mods/16495
[Skyrim Platform]: https://www.nexusmods.com/skyrimspecialedition/mods/54909
[Wardrobe Malfunction]: https://github.com/CarlosLeyvaAyala/wardrobe-malfunction