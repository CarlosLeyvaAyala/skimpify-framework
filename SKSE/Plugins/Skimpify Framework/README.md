#  Help on configuration files

Before you can use this framework, armors need to be registered into it.

Registering armors is automatically done on game reload.\
When that happens, this framework will search for all json files in your `Data\SKSE\Plugins\Skimpify Framework` folder and then load the contents of those files into the game.

Registering armors is needed because... well, duh... how do you expect this framework to know when an armor is meant to represent a nipslip? By using Pokemon Magic?

## Quick summary

When it comes to these files, hopefully _It Just Works_&#8482; when you add them to `Data\SKSE\Plugins\Skimpify Framework`; but if that isn't the case, remember this:

- Configuration files depend on esp version.
- Configuration files will be incompatible with your esp if FormIds were somehow changed. Armor names are irrelevant for these files, so **that will never be an issue**.
- If any file is incompatible with your current setup, register armors for that mod again.

# About this page
Here you will definitions made by myself (and hopefully, definitions made by other people, like you) so you can just start to use any mod that requires the _Skimpify Framework_.

Most of these are for mods I can't really remember where I downloaded them from, so if you find out the framework "isn't working" the most likely culprit is one of these files, since **they are dependant on the version of the mod you are using**.

Some of these armor setups are a matter of personal opinion (like boots and gauntlets getting damaged in [[COCO] Shadow Assassin [SE].esp][CocoAssassin]), but you are free to setup your own changes if you like, by [redefining how armors are changed](#registering-incompatible-armors).

# When problems arise...
If things don't seem to work, before blaming this or any mod that uses this framework, **first make sure to test armors while in developer mode**.\
[Read the manual][] to learn about that.

If you are in a hurry, [read here](#incompatibilities) to learn about file configuration incompatibilities.

# File contents

All these files are in json format, so **you can read and manually modify them** with whatever text editor you like.

Inside these files, armors are referred to by using the mod esp file name and its FormID in hexadecimal notation.

```json
"[SunJeong] Ninirim Collection.esp|11ed3c": {
  "name": "Red Nose Upper Slutty",
  "next": "[SunJeong] Ninirim Collection.esp|123e40",
  "nextN": "Red Nose Just Bones",
  "nextT": "change",
  "prev": "[SunJeong] Ninirim Collection.esp|119c2d",
  "prevN": "Red Nose Upper",
  "prevT": "slip"
}
```

The entry above says:

  > _Red Nose Upper Slutty_ belongs to `[SunJeong] Ninirim Collection.esp`, with a relative FormId of `11ed3c`.
  >
  > Its skimpy (`next`) version is bla bla bla... and their _Change Relationship_ (`nexT`) is `change` ([read the manual][] to understand this.)
  >
  > Its modest (`prev`) version is bla bla bla...and their _Change Relationship_ is `slip`.

If you follow this structure, you can manually add or modify entries by directly changing a json file contents.

It's sometimes actually faster to manually edit _Change Relationships_ in a text editor than in game.

## Names are discarded

All name fields (`"name"`, `"nextN"` and `"prevN"`) are there so we humans know which armor an entry refers to when we make manual changes.

The framework doesn't need those and they're discarded, so there's no problem if you use patches that rename your armors (if you carefully look at some files, you may have noticed some of my armors were renamed, in fact).

# Incompatibilities
This framework only cares about esp filenames and FormIDs to determine which armor is which.\
This means, **it won't care how an armor is named or how it looks, but if FormIDs are changed in some way, a configuration file won't work** (or work only partially).

In case a compatibility problem arises, **the solution is as simple as registering the armors again**, either manually or trying to use the (quite imperfect) automatic way.\
[Read the manual][] to learn how to register armors.

Anyway, these are the kind of situations that cause incompatibilities.

- **Plugin changed from esp to esl**. Since FormIDs may have been changed, this may result in partial or total incompatibility.
- **Different plugin versions**. You should usually expect partial incompatibility.\
  If the armor author added more entries to the esp file, expect those not to work if you are using an old configuration file for that mod.

## Registering incompatible armors

This topic is too big to cover it here (you know the drill: [read the manual][]), so here's an overview:

- Enable _developer mode_ in `Data\Platform\Plugins\skimpify-framework-settings.txt`.
- Either:
  - Register armors one by one using provided hotkeys.
  - Try your luck and use _automatic mode_ to let the framework try to guess which armors to register.
- Use hotkeys to test and confirm everything is as expected.
- Export your settings to json.
- Give a quick glance at each of the generated files to see if things are as expected.\
  If they aren't you can manually change those files.

Those were the steps used for generating each of these files you see here.

This seems like too much work, but that's only true for certain mods.\
Most mods can be configured in less than 2 minutes.

Big mods that contain a great assortment of variants of armors (which may take up to an hour to properly setup), like [`[SunJeong] Ninirim Collection.esp`][Ninirim] are quite rare... and I hope I did a flawless job on that, so you don't have to suffer to set it up as I did.

Well, I'm exagerating.\
Registering them was easy, but making sure they worked as expected was the time consuming step.

[read the manual]: ../../../Help/help.pdf
[Ninirim]: %5BSunJeong%5D%20Ninirim%20Collection.esp.json
[CocoAssassin]: %5BCOCO%5D%20Shadow%20Assassin%20%5BSE%5D.esp.json
