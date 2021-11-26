import { DebugLib, FormLib, Hotkeys, Misc } from "DmLib"
import { AutoGenArmors, SaveJson } from "genJson"
import * as JDB from "JContainers/JDB"
import * as JFormDB from "JContainers/JFormDB"
import * as JMap from "JContainers/JMap"
import { JMapL } from "JContainers/JTs"
import * as JValue from "JContainers/JValue"
import {
  ActorArg,
  AddChangeRel,
  ChangeType,
  ClearChangeRel,
  defaultType,
  EquippedData,
  GetAllModest,
  GetAllSkimpy,
  GetModestData,
  GetSkimpyData,
  SkimpyData,
} from "skimpify-api"
import {
  Actor,
  Armor,
  Debug,
  DxScanCode,
  Game,
  Input,
  on,
  printConsole,
  settings,
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
const SIni = Misc.PreserveVar<boolean>(MemOnly, kIni)
const SMModest = Misc.PreserveVar<number>(MemOnly, kMModest)

let allowInit = storage[kIni] as boolean | false
let mModest = storage[kMModest] as number | -1

export function main() {
  const n = "skimpify-framework"
  const develop = settings[n]["developerMode"] as boolean

  // on("loadGame", () => {
  //   InitPlugin()
  //   allowInit = SIni(true)
  // })

  // once("update", () => {
  //   if (allowInit || !WasInitialized()) InitPlugin()
  // })

  function InitPlugin() {
    LoadArmors()
    // MarkInitialized()
  }

  const OnMarkClear = Hotkeys.ListenTo(DxScanCode.A, develop)
  const OnMarkModest = Hotkeys.ListenTo(DxScanCode.S, develop)
  const OnMarkSlip = Hotkeys.ListenTo(DxScanCode.D, develop)
  const OnMarkChange = Hotkeys.ListenTo(DxScanCode.F, develop)
  const OnMarkDamage = Hotkeys.ListenTo(DxScanCode.G, develop)
  const OnDebugEquipped = Hotkeys.ListenTo(DxScanCode.Z, develop)

  const OnAllSkimpy = Hotkeys.ListenTo(DxScanCode.RightArrow, develop)
  const OnAllModest = Hotkeys.ListenTo(DxScanCode.LeftArrow, develop)
  const OnUnequipAll = Hotkeys.ListenTo(DxScanCode.DownArrow, develop)
  const OnUnequipAll2 = Hotkeys.ListenTo(DxScanCode.UpArrow, develop)

  const OnSaveJson = Hotkeys.ListenTo(DxScanCode.Q, develop)
  const OnGen = Hotkeys.ListenTo(DxScanCode.LeftControl, develop)

  on("update", () => {
    if (
      develop &&
      (Input.isKeyPressed(DxScanCode.LeftShift) ||
        Input.isKeyPressed(DxScanCode.RightShift))
    ) {
      OnMarkModest(Mark.Modest)
      OnMarkClear(Mark.Clear)
      OnMarkSlip(Mark.Slip)
      OnMarkChange(Mark.Change)
      OnMarkDamage(Mark.Damage)
      OnDebugEquipped(Mark.DebugOne)

      OnSaveJson(SaveJson)
      OnGen(AutoGenArmors)
    }

    OnAllSkimpy(AllSkimpy)
    OnAllModest(AllModest)
    OnUnequipAll(UnequipAll)
    OnUnequipAll2(UnequipAll)
  })

  const i = develop ? " in DEVELOPER MODE" : ""
  printConsole(`Skimpify Framework successfully initialized${i}.`)
}

/** Uequips all armor on the player. */
function UnequipAll() {
  const pl = Game.getPlayer() as Actor
  // Don't use unequipAll() because it doesn't discriminate on what it will unequip
  const aa = FormLib.GetEquippedArmors(pl)
  aa.forEach((a) => {
    pl.unequipItem(a, false, true)
  })
}

/** Swap an armor on an actor. */
const SwapArmor = (act: Actor, from: Armor, to: Armor) => {
  act.unequipItem(from, false, true)
  act.equipItem(to, false, true)
}

/** Changes all equipped armors to their skimpier counterparts. */
const AllSkimpy = () => ChangeAll(GetAllSkimpy)
/** Changes all equipped armors to their modest counterparts. */
const AllModest = () => ChangeAll(GetAllModest)

/** Swaps all armors the player is using for some variant. */
function ChangeAll(f: (a: ActorArg) => EquippedData) {
  const pl = Game.getPlayer() as Actor
  const aa = f(pl)

  aa.current.forEach((a, i) => {
    SwapArmor(pl, a.armor as Armor, aa.next[i].armor as Armor)
    Debug.notification(a.kind as string)
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

/** Functions for marking armors in manual mode. All of these only work on
 * armors the player is wearing.
 */
namespace Mark {
  /** Does an operation only if the player has equipped one armor.
   *
   * @param Continue What to do if only one piece of armor is equipped.
   */
  function OnlyOneArmor(Continue: (a: Armor) => void) {
    const aa = FormLib.GetEquippedArmors(Game.getPlayer())
    aa.forEach((v) =>
      LogV(
        `${DebugLib.Log.IntToHex(
          v.getFormID()
        )}. Slot: ${v.getSlotMask()}. Name: ${v.getName()}`
      )
    )

    if (aa.length !== 1) {
      Debug.messageBox(
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
  function Child(c: ChangeType) {
    OnlyOneArmor((a) => {
      const ShowInvalid = () => {
        const m = `Can't create a Change Relationship because a modest version for this armor hasn't been set.

        Please mark one by using the "hkMarkModest" hotkey when having such armor equipped.`
        Debug.messageBox(m)
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

  /** Marks a `slip` relationship between two armors. */
  export const Slip = () => Child(ChangeType.slip)
  /** Marks a `change` relationship between two armors. */
  export const Change = () => Child(ChangeType.change)
  /** Marks a `damage` relationship between two armors. */
  export const Damage = () => Child(ChangeType.damage)

  /** Marks the armor the player is using as the modest version of another. */
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

  /** Clears all _Change Relationships_ of the current weared armor. */
  export function Clear() {
    OnlyOneArmor((a) => {
      ClearChangeRel(a)
      const m = `"${a.getName()}" was cleared from all its Change Relationships.`
      Debug.messageBox(m)
    })
  }

  /** Show info about the armor the player is currently wearing. */
  export function DebugOne() {
    OnlyOneArmor((a) => {
      const M = (d: SkimpyData, r: string) =>
        `Its ${r} version is "${d.armor?.getName()}". With a "${
          d.kind
        }" type of Change Relationship.`

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
      Debug.messageBox(m)
    })
  }
}
