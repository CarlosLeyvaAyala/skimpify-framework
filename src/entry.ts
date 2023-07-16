import * as Log from "DmLib/Log"
import * as Hk from "DmLib/Hotkeys"
import { preserveVar } from "DmLib/Misc"
import { Player } from "DmLib/Actor"
import { ForEachSlotMask, GetEquippedArmors, forEachArmorR } from "DmLib/Form"
import { AutoGenArmors, SaveJson } from "genJson"
import * as JDB from "JContainers/JDB"
import * as JMap from "JContainers/JMap"
import { JMapL } from "JContainers/JTs"
import * as JValue from "JContainers/JValue"
import {
  ActorArg,
  AddChangeRel,
  cfgDir,
  ChangeRel,
  ClearChangeRel,
  DbHandle,
  EquippedData,
  GetAllModest,
  GetAllSkimpy,
  GetModestData,
  GetSkimpyData,
  HasChange,
  HasSlip,
  JcChangeK,
  RelType,
  SkimpyData,
  SwapToChange,
  SwapToSlip,
  ValidateChangeRel,
} from "skimpify-api"
import {
  Actor,
  Armor,
  Debug,
  Game,
  on,
  once,
  printConsole,
  settings,
  SlotMask,
  storage,
} from "skyrimPlatform"
import { LogV, LogVT } from "./debug"

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
const SIni = preserveVar<boolean>(MemOnly, kIni)
const SMModest = preserveVar<number>(MemOnly, kMModest)

let allowInit = (storage[kIni] as boolean) || false
let mModest = storage[kMModest] as number | -1

const n = "skimpify-framework"
const develop = settings[n]["developerMode"] as boolean
const unintrusiveMessages = settings[n]["unintrusiveMessages"] as boolean

const hk = "devHotkeys"
const FO = (k: string) => Hk.FromObject(n, hk, k)
/** Gets a hotkey from settings */
const HK = (k: string) => Hk.ListenTo(FO(k), develop)

const ShowMessage = unintrusiveMessages ? Debug.notification : Debug.messageBox

export function main() {
  on("loadGame", () => {
    InitPlugin()
    allowInit = SIni(true)
  })

  once("update", () => {
    if (allowInit || !WasInitialized()) InitPlugin()
  })

  function InitPlugin() {
    Load.Armors()
    MarkInitialized()
  }

  const OnLoadJson = HK("loadJson")
  const OnSaveJson = HK("saveJson")
  const OnAutoGen = HK("autoGen")

  const OnMarkClear = HK("markClear")
  const OnMarkModest = HK("markModest")
  const OnMarkSlip = HK("markSlip")
  const OnMarkChange = HK("markChange")
  const OnMarkDamage = HK("markDamage")
  const OnDebugEquipped = HK("debugEquipped")

  const OnDump = HK("dump")
  const OnDiscardArmors = HK("deleteAllArmors")

  const OnAllSkimpy = HK("allSkimpy")
  const OnAllModest = HK("allModest")
  const OnUnequipAll = HK("unequipAll1")
  const OnUnequipAll2 = HK("unequipAll2")
  const OnTest = HK("test")

  on("update", () => {
    OnLoadJson(Load.Armors)
    OnSaveJson(SaveJson)
    OnAutoGen(AutoGenArmors)

    OnMarkModest(Mark.Modest)
    OnMarkClear(Mark.Clear)
    OnMarkSlip(Mark.Slip)
    OnMarkChange(Mark.Change)
    OnMarkDamage(Mark.Damage)
    OnDebugEquipped(Mark.DebugOne)

    OnDump(Dump)
    OnDiscardArmors(Armors.Discard)

    OnAllSkimpy(Armors.AllSkimpy)
    OnAllModest(Armors.AllModest)
    OnUnequipAll(Armors.UnequipAll)
    OnUnequipAll2(Armors.UnequipAll)

    OnTest(RunTest)
  })

  const i = develop ? " in DEVELOPER MODE" : ""
  printConsole(`Skimpify Framework successfully initialized${i}.`)
  printConsole("*".repeat(200))
  printConsole("*".repeat(200))
  printConsole("*".repeat(200))
}

function RunTest() {
  // const p = FormLib.Player()
  // SwapToSlip(p, Armor.from(p.getWornForm(SlotMask.Body)))
  // FormLib.WaitActor(p, 4, (a) => {
  //   RestoreMostModest(a, Armor.from(a.getWornForm(SlotMask.Body)))
  // })
  PlayerF.Reveal()
}

function Dump() {
  // ClearDB()

  const f = `${cfgDir}dump/dump.json`
  JValue.writeToFile(DbHandle(), f)
  JDB.writeToFile(`${cfgDir}dump/dump all.json`)

  ShowMessage(`File was dumped to ${f}`)
}

/**Functions made for playing */
namespace PlayerF {
  const SkimpyAt = (a: Armor | null) => {
    if (HasSlip(a)) return ChangeRel.slip
    if (HasChange(a)) return ChangeRel.change

    return undefined
  }
  const TrySkimpify = (slot: SlotMask) => {
    const p = Player()
    const a = Armor.from(p.getWornForm(slot))
    const t = SkimpyAt(a)
    if (!t) return false
    if (t === ChangeRel.slip) SwapToSlip(p, a)
    if (t === ChangeRel.change) SwapToChange(p, a)
    // Armor.swa
  }
  /** Makes the player use revealing clothes. Gives preference to torso, then boots, skirts...*/
  export function Reveal() {
    if (TrySkimpify(SlotMask.Body)) return
    if (TrySkimpify(SlotMask.PelvisPrimary)) return
    if (TrySkimpify(SlotMask.PelvisSecondary)) return
    ForEachSlotMask(Player(), (slot) => TrySkimpify(slot))
    // const all = FormLib.GetEquippedArmors(p)
  }
}

namespace Armors {
  /** Unequips all armor on the player. */
  export function UnequipAll() {
    const pl = Game.getPlayer() as Actor
    // Don't use unequipAll() because it doesn't discriminate on what it will unequip
    const aa = GetEquippedArmors(pl)
    aa.forEach((a) => {
      pl.unequipItem(a, false, true)
    })
  }

  /** Swap an armor on an actor. */
  export const SwapArmor = (act: Actor, from: Armor, to: Armor) => {
    act.unequipItem(from, false, true)
    act.equipItem(to, false, true)
  }

  /** Changes all equipped armors to their skimpier counterparts. */
  export const AllSkimpy = () => ChangeAll(GetAllSkimpy)
  /** Changes all equipped armors to their modest counterparts. */
  export const AllModest = () => ChangeAll(GetAllModest)

  /** Swaps all armors the player is using for some variant. */
  function ChangeAll(f: (a: ActorArg) => EquippedData) {
    const pl = Game.getPlayer() as Actor
    const aa = f(pl)

    aa.current.forEach((a, i) => {
      SwapArmor(pl, a.armor as Armor, aa.next[i].armor as Armor)
      if (a.kind) Debug.notification(a.kind)
    })
  }

  /** Deletes all armors in player inventory. */
  export function Discard() {
    const p = Game.getPlayer() as Actor
    forEachArmorR(p, (a) => {
      p.removeItem(a, p.getItemCount(a), true, null)
    })
    ShowMessage(`All armors in the player inventory were deleted.`)
  }
}

namespace Load {
  export function Armors() {
    // Read from all files
    const d = JValue.readFromDirectory(cfgDir, ".json")
    let n = 0
    // JValue.writeToFile(d, `${cfgDir}dump/dump load.json`)

    JMapL.ForAllKeys(d, (k) => {
      const fileO = JMap.getObj(d, k)

      JMapL.ForAllKeys(fileO, (armor, i) => {
        const a = StrToArmor(armor)
        if (!a) return
        n++
        const data = JMap.getObj(i, armor)
        SaveVariant(a, data, "next")
      })
    })

    const f = JMap.count(d)
    const m = `File loading completed.
    ${n} armors were read from ${f} files.`

    if (develop) ShowMessage(m)
    printConsole(m)
  }

  function SaveVariant(parent: Armor, data: number, rel: RelType) {
    const n = StrToArmor(JMap.getStr(data, rel))
    if (!n) return // Don't save inexisting variants

    const c = JMap.getStr(data, JcChangeK(rel))
    const cT = ValidateChangeRel(c)

    AddChangeRel(parent, n, cT)
  }

  function StrToArmor(s: string) {
    if (!s) return null
    const [esp, id] = s.split("|")
    const f = Game.getFormFromFile(parseInt(id, 16), esp)
    return Armor.from(f)
  }
}

/** Functions for marking armors in manual mode. All of these only work on
 * armors the player is wearing.
 */
namespace Mark {
  /** Does an operation only if the player has equipped one armor.
   *
   * @param Continue What to do if only one piece of armor is equipped.
   */
  function OnlyOneArmor(Continue: (a: Armor) => void) {
    const aa = GetEquippedArmors(Game.getPlayer())
    aa.forEach((v) =>
      LogV(
        `${Log.IntToHex(
          v.getFormID()
        )}. Slot: ${v.getSlotMask()}. Name: ${v.getName()}`
      )
    )

    if (aa.length !== 1) {
      ShowMessage(
        `This functionality only works with just one piece of armor equipped.
        Equip only the piece you want to work on.`
      )
      return
    }
    Continue(aa[0])
  }

  /** Manually adds a _Change Relationship_ between a marked piece of armor and the one the player is wearing.
   *
   * @param c What kind of _Change Relationship_ will be added between two armors.
   */
  function Child(c: ChangeRel) {
    OnlyOneArmor((a) => {
      const ShowInvalid = () => {
        const m = `Can't create a Change Relationship because a modest version for this armor hasn't been set.

        Please mark one by using the "hkMarkModest" hotkey when having such armor equipped.`
        ShowMessage(m)
      }

      if (mModest === invalid) return ShowInvalid()

      const p = Armor.from(Game.getFormEx(mModest))
      if (!p) return ShowInvalid()

      AddChangeRel(p, a, c)

      const m = `"${a.getName()}" was added as a skimpier version of ${p.getName()} with Change Relationship "${c}"`
      ShowMessage(m)
      mModest = SMModest(invalid)
    })
  }

  /** Marks a `slip` relationship between two armors. */
  export const Slip = () => Child(ChangeRel.slip)
  /** Marks a `change` relationship between two armors. */
  export const Change = () => Child(ChangeRel.change)
  /** Marks a `damage` relationship between two armors. */
  export const Damage = () => Child(ChangeRel.damage)

  /** Marks the armor the player is using as the modest version of another. */
  export function Modest() {
    OnlyOneArmor((a) => {
      const m = `"${a.getName()}" was marked as a modest version of some armor.
      Mark another piece to create a Change Relationship.`
      ShowMessage(m)

      mModest = LogVT(
        "Manual mode. Modest armor id",
        SMModest(a.getFormID()),
        Log.IntToHex
      )
    })
  }

  /** Clears all _Change Relationships_ of the current weared armor. */
  export function Clear() {
    OnlyOneArmor((a) => {
      ClearChangeRel(a)
      const m = `"${a.getName()}" was cleared from all its Change Relationships.`
      ShowMessage(m)
    })
  }

  /** Show info about the armor the player is currently wearing. */
  export function DebugOne() {
    OnlyOneArmor((a) => {
      const M = (d: SkimpyData, r: string) =>
        `Its ${r} version is "${d.armor?.getName()}". 
        Change Relationship type: "${d.kind}".`

      const p = GetModestData(a)
      const pm = p.armor ? M(p, "modest") : ""

      const c = GetSkimpyData(a)
      const cm = c.armor ? M(c, "skimpy") : ""

      const am = (pm + (pm && cm ? "\n" : "") + cm).trim()
      const fm = am
        ? am
        : "This has no recognized variant. If it should, consider to manually create a Change Relationship."

      const m = `Armor: ${a.getName()}.
      
      ${fm}`
      LogV(m)
      ShowMessage(m)
    })
  }
}
