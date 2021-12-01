# Skimpify Framework
Skyrim Platform plugin. Makes it possible to change to skimpier armors and back.

# Overview

We all love armors with skimpy or damaged variants, but there's no other way to really use them but to go to your items menu and then equip them manually to simulate things happening while playing... until now.

This framework enables modders to make mods that automatically swap to those variants, so the player can concentrate on what really matters: playing.

This framework is the result of an idea that have been floating around my mind for many years: having [wardrobe malfunctions][Wardrobe Malfunction] and broken armors while playing.

But that wasn't really feasible because of Papyrus' hilarious slowness and sorry clunkiness.
It's just now that [Skyrim Platform][] exists that this idea was finally able to come true.

# Usage

Put `skimpify-framework.js` in the `Data\Platform\Plugins` folder.

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


[Skyrim Platform]: https://www.nexusmods.com/skyrimspecialedition/mods/54909
[Wardrobe Malfunction]: https://github.com/CarlosLeyvaAyala/wardrobe-malfunction
[Help]: Help/help.pdf
