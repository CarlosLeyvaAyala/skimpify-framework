import { DebugLib, FormLib, Hotkeys, Misc } from "DmLib"
import { AutoGenArmors } from "genJson"
import * as JDB from "JContainers/JDB"
import * as JFormDB from "JContainers/JFormDB"
import * as JMap from "JContainers/JMap"
import { JMapL } from "JContainers/JTs"
import * as JValue from "JContainers/JValue"
import {
  AddChangeRel,
  ChangeType,
  ClearChangeRel,
  defaultType,
  GetModest,
  GetSkimpy,
} from "skimpify-api"
import {
  Actor,
  Armor,
  Debug,
  DxScanCode,
  Game,
  hooks,
  on,
  once,
  printConsole,
  storage,
} from "skyrimPlatform"
import { LogVT } from "./debug"

const invalid = -1

const initK = ".DmPlugins.Skimpify.init"
const MarkInitialized = () => JDB.solveBoolSetter(initK, true, true)
const WasInitialized = () => JDB.solveBool(initK, false)

const storeK = "Skimpify-FW-"
const MemOnly = () => {}
const SK = (k: string) => `${storeK}${k}`
const kIni = SK("init")
const kMModest = SK("mmodest")

// Avoid values to be lost on game reloading
const SIni = Misc.PreserveVar<boolean>(MemOnly, kIni)
const SMModest = Misc.PreserveVar<number>(MemOnly, kMModest)

let allowInit = storage[kIni] as boolean | false
let mModest = storage[kMModest] as number | -1

export function main() {
  printConsole("Skimpify Framework successfully initialized.")

  on("loadGame", () => {
    InitPlugin()
    allowInit = SIni(true)
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

  const OnMarkClear = Hotkeys.ListenTo(DxScanCode.A)
  const OnMarkModest = Hotkeys.ListenTo(DxScanCode.S)
  const OnMarkSlip = Hotkeys.ListenTo(DxScanCode.D)
  const OnMarkChange = Hotkeys.ListenTo(DxScanCode.F)
  const OnMarkDamage = Hotkeys.ListenTo(DxScanCode.G)

  const L = Hotkeys.ListenTo(DxScanCode.RightControl)
  const OnGen = Hotkeys.ListenTo(DxScanCode.LeftControl)

  on("update", () => {
    OnMarkModest(Mark.Modest)
    OnMarkClear(Mark.Clear)
    OnMarkSlip(Mark.Slip)
    OnMarkChange(Mark.Change)
    OnMarkDamage(Mark.Damage)

    OnGen(AutoGenArmors)
    L(Test)
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

namespace Mark {
  function OnlyOneArmor(Continue: (a: Armor) => void) {
    const aa = FormLib.GetEquippedArmors(Game.getPlayer())
    if (aa.length > 1) {
      Debug.messageBox(
        `This functionality only works with just one piece of armor equipped.
        Equip only the piece you want to mark.`
      )
    }
    Continue(aa[0])
  }

  function Child(c: ChangeType) {
    OnlyOneArmor((a) => {
      const ShowInvalid = () => {
        const m = `Can't create relationship because a modest version for this armor hasn't been set.
        Please do that by using the "hkMarkModest" hotkey on such armor.`
      }

      if (mModest === invalid) return ShowInvalid()

      const p = Armor.from(Game.getFormEx(mModest))
      if (!p) return ShowInvalid()

      AddChangeRel(p, a, c)

      const m = `"${a.getName()}" was added as a skimpier version of ${p.getName()} with Change Relationship "${c}"`
      Debug.messageBox(m)
      mModest = SMModest(invalid)
    })
  }

  export const Slip = () => Child(ChangeType.slip)
  export const Change = () => Child(ChangeType.change)
  export const Damage = () => Child(ChangeType.damage)

  export function Modest() {
    OnlyOneArmor((a) => {
      const m = `"${a.getName()}" was marked as a modest version of some armor.
      Mark another piece to create a Change Relationship.`
      Debug.messageBox(m)

      mModest = LogVT(
        "Manual mode. Modest armor id",
        SMModest(a.getFormID()),
        DebugLib.Log.IntToHex
      )
    })
  }

  export function Clear() {
    OnlyOneArmor((a) => {
      ClearChangeRel(a)
      const m = `"${a.getName()}" was cleared from all its Change Relationships.`
      Debug.messageBox(m)
    })
  }
}
