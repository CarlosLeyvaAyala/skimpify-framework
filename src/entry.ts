import { Hotkeys } from "DmLib"
import { SaveArmors } from "genJson"
import * as JDB from "JContainers/JDB"
import * as JFormDB from "JContainers/JFormDB"
import * as JMap from "JContainers/JMap"
import { JMapL } from "JContainers/JTs"
import * as JValue from "JContainers/JValue"
import { defaultType, GetModest, GetSkimpy } from "skimpify-api"
import {
  Actor,
  Armor,
  DxScanCode,
  Game,
  hooks,
  on,
  once,
  printConsole,
  storage,
} from "skyrimPlatform"

const initK = ".DmPlugins.Skimpify.init"
const MarkInitialized = () => JDB.solveBoolSetter(initK, true, true)
const WasInitialized = () => JDB.solveBool(initK, false)

export function main() {
  printConsole("Skimpify Framework successfully initialized.")
  let allowInit = storage["Skimpify-FW.init"] as boolean | false

  on("loadGame", () => {
    InitPlugin()
    allowInit = true
    storage["Skimpify-FW.init"] = true
  })

  once("update", () => {
    if (allowInit || !WasInitialized()) InitPlugin()
  })

  function InitPlugin() {
    LoadArmors()
    MarkInitialized()
  }

  const Test = () => {
    const pl = Game.getPlayer() as Actor
    const e = pl.getWornForm(4)
    if (!e) return

    const Swap = (a: Armor) => {
      pl.unequipItem(e, false, true)
      pl.equipItem(a, false, true)
    }
    const a = Armor.from(e)
    const s = GetSkimpy(a)
    if (s) {
      Swap(s)
      return
    }

    const m = GetModest(a)
    if (m) Swap(m)
  }

  hooks.sendAnimationEvent.add(
    {
      enter(ctx) {},
      leave(ctx) {
        if (ctx.animationSucceeded) once("update", () => Test())
      },
    },
    0x14,
    0x14,
    "SneakStart"
  )
  hooks.sendAnimationEvent.add(
    {
      enter(ctx) {},
      leave(ctx) {
        if (ctx.animationSucceeded) once("update", () => Test())
      },
    },
    0x14,
    0x14,
    "SneakStop"
  )

  const L = Hotkeys.ListenTo(DxScanCode.RightControl)
  const OnGen = Hotkeys.ListenTo(DxScanCode.LeftControl)
  on("update", () => {
    L(Test)
    OnGen(SaveArmors)
  })
}

function LoadArmors() {
  // Read from file
  const p = "data/SKSE/Plugins/Skimpify Framework/armors.json"

  // Save to disk
  JMapL.ForAllKeys(JValue.readFromFile(p), (armor, i) => {
    const a = StrToArmor(armor)
    if (!a) return
    const data = JMap.getObj(i, armor)
    SaveChild(a, data, "next")
    SaveChild(a, data, "prev")
  })
}

function SaveChild(parent: Armor, data: number, rel: string) {
  const n = StrToArmor(JMap.getStr(data, rel))
  if (!n) return // Don't save inexisting children
  const relT = `${rel}T`
  const rt = JMap.getStr(data, relT)
  const t = rt ? rt : defaultType // Assume it's default type

  const k = ".Skimpify-Framework" // Save key
  JFormDB.solveFormSetter(parent, `${k}.${rel}`, n, true) // Save form
  JFormDB.solveStrSetter(parent, `${k}.${relT}`, t, true) // Save form type
}

function StrToArmor(s: string) {
  if (!s) return null
  const [esp, id] = s.split("|")
  const f = Game.getFormFromFile(parseInt(id, 16), esp)
  return Armor.from(f)
}
