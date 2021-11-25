import { FormLib } from "DmLib"
import * as JDB from "JContainers/JDB"
import * as JFormDB from "JContainers/JFormDB"
import { Actor, Armor } from "skyrimPlatform"

/***
 *     █████╗ ██████╗ ██╗
 *    ██╔══██╗██╔══██╗██║
 *    ███████║██████╔╝██║
 *    ██╔══██║██╔═══╝ ██║
 *    ██║  ██║██║     ██║
 *    ╚═╝  ╚═╝╚═╝     ╚═╝
 *
 *  Public functions, constants and types.
 *  Use them as you please.
 */

/** Type of armor changes there are.
 *
 * @remarks
 * Not all armor changes are the same.
 *
 * Some armors have damaged versions, others are more like nip/pussy slips
 * and yet others are armor variants with missing parts (but not damaged per se).
 *
 * This enum represents what kind of change relationship an `Armor` has with another one.
 *
 * @todo {@link GetChange} must be changed each time this enum changes.
 */
export const enum ChangeType {
  /** The `Armor` is basically the same, but moved/open to be revealing.
   *
   * An unbuttoned bra is a good candidate to be registered as this type.
   *
   * @remarks
   * This is the most subtle kind of change and one that can be done periodically with no
   * _muh immersion_ repercusions.
   *
   * You can use this for example, for nipslips while sneaking and then
   * getting back to normal after stopping sneaking around.
   */
  slip = "slip",
  /** The `Armor` has structural changes, like missing parts.
   *
   * This can be used to represent parts of the armor falling in the heat of
   * the battle. But wouldn't make too much sense to change and restore them quite fast.
   *
   * @remarks
   * This is the most common variant found on armors, that's why an improperly registered
   * type defaults to this value.
   */
  change = "change",
  /** The `Armor` has structural changes that makes it look damaged or worn out.
   *
   * This means it won't make sense to destroy and restore an armor when sneaking,
   * but will make total sense to break it while in combat or for some rape scene
   * I know you will use this for, you predictable bastard.
   *
   * @remarks
   * This kind of change shouldn't be automatically restored by your mod, otherwise it
   * will just look dumb.\
   * That's unless you add an armor repair mechanic, of course.
   */
  damage = "damage",
}

/** Used to package all needed data from a different `Armor` version. */
export interface SkimpyData {
  /** The `Armor` to change to. `null` if it doesn't exist. */
  armor: Armor | null
  /** What kind of "skimpification" the change entails. `null` if no change exist. */
  kind: ChangeType | null
}

/** Shortcut to `Armor | null | undefined`, because it gets tedious to write it
 * over and over.
 */
export type ArmorArg = Armor | null | undefined
export type ActorArg = Actor | null | undefined

/** Returns the closest _modest version_ of an `Armor`.
 *
 * @param a Armor to get the modest version from.
 * @returns An `Armor`, or `null | undefined` if the modest version doesn't exist.
 */
export function GetModest(a: ArmorArg) {
  return GetArmor(a, "prev")
}

/** Returns the closest _skimpy version_ of an `Armor`.
 *
 * @param a Armor to get the skimpy version from.
 * @returns An `Armor`, or `null | undefined` if the skimpy version doesn't exist.
 */
export function GetSkimpy(a: ArmorArg) {
  return GetArmor(a, "next")
}

/** Returns what kind of change an `Armor` has with its modest version.
 *
 * @param a `Armor` to see how it changes.
 * @returns The kind of change. `null` if there's no modest version.
 */
export function GetModestType(a: ArmorArg) {
  return GetChange(a, "prev")
}

/** Returns what kind of change an `Armor` has with its skimpier version.
 *
 * @param a `Armor` to see how it changes.
 * @returns The kind of change. `null` if there's no skimpier version.
 */
export function GetSkimpyType(a: ArmorArg) {
  return GetChange(a, "next")
}

/** Gets the {@link SkimpyData} for the modest version of an `Armor`.
 *
 * @param a The `Armor` to get the modest version from.
 * @returns The {@link SkimpyData} for the modest version of `a`.
 * The `armor` part of that data may be `null` if said armor doesn't exist.
 
 */
export function GetModestData(a: ArmorArg): SkimpyData {
  return { armor: GetModest(a), kind: GetModestType(a) }
}

/** Gets the {@link SkimpyData} for the skimpy version of an `Armor`.
 *
 * @param a The `Armor` to get the skimpy version from.
 * @returns The {@link SkimpyData} for the skimpy version of `a`.
 * The `armor` part of that data may be `null` if said armor doesn't exist.
 */
export function GetSkimpyData(a: ArmorArg): SkimpyData {
  return { armor: GetSkimpy(a), kind: GetSkimpyType(a) }
}

export const GetAllSkimpy = (a: ActorArg) =>
  GetAll(a, GetSkimpyData, GetModestData)

export const GetAllModest = (a: ActorArg) =>
  GetAll(a, GetModestData, GetSkimpyData)

export interface AllData {
  current: SkimpyData[]
  next: SkimpyData[]
}

type SkimpyFunc = (a: ArmorArg) => SkimpyData

export function GetAll(
  a: ActorArg,
  Next: SkimpyFunc,
  Curr: SkimpyFunc
): AllData {
  const aa = FormLib.GetEquippedArmors(a)
  const n = aa.map((v) => Next(v)).filter((v) => v.armor)
  const c = n.map((v) => Curr(v.armor))
  return { current: c, next: n }
}

/** If the skimpy version of an `armor` is a slip, returns it.
 *
 * @param a Armor to check.
 * @returns The slip `Armor`. `null` if `a` has no Skimpy version or if it isn't a slip.
 */
export function GetSlip(a: ArmorArg) {
  return NextByType(a, ChangeType.slip)
}

/** Adds a change relationship between two armors.\
 * ***WARNING***: this relationship is saved to the game.
 *
 * @param modest More modest version of some armor.
 * @param skimpy More skimpy version of that armor.
 * @param change What kind of change this relationship entails.
 */
export function AddChangeRel(
  modest: ArmorArg,
  skimpy: ArmorArg,
  change: ChangeType = ChangeType.change
) {
  if (!modest || !skimpy) return
  SetRel(modest, skimpy, "next", change)
  SetRel(skimpy, modest, "prev", change)
}

/** Clears all _Change Relationships_ of some armor.
 *
 * @param a Armor to clear relationship to.
 */
export function ClearChangeRel(a: ArmorArg) {
  const C = (parent: ArmorArg, child: ArmorArg) => {
    if (!parent || !child) return
    SetRel(parent, null, "next", ChangeType.change)
    SetRel(child, null, "prev", ChangeType.change)
  }

  C(GetModest(a), a)
  C(a, GetSkimpy(a))
}

/***
 *    ██╗ ██████╗ ███╗   ██╗ ██████╗ ██████╗ ███████╗
 *    ██║██╔════╝ ████╗  ██║██╔═══██╗██╔══██╗██╔════╝
 *    ██║██║  ███╗██╔██╗ ██║██║   ██║██████╔╝█████╗
 *    ██║██║   ██║██║╚██╗██║██║   ██║██╔══██╗██╔══╝
 *    ██║╚██████╔╝██║ ╚████║╚██████╔╝██║  ██║███████╗
 *    ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝
 *
 *  All things down below are meant to be internally used by
 *  this script or the framework.
 *
 *  Ignore them, unless you want to learn about its inner
 *  workings or want to help on the crusade to make this
 *  framework accessible to Papyrus programmers.
 *  ... a crusade I won't take, by the way.
 */

/** Which kind of internal keys are valid. */
type RelType = "next" | "prev"

/** Default type to assume what an armor version is when it has no associated/valid type. */
export const defaultType = ChangeType.change

/** Direct handle to the JContainers DB. Don't touch this if you don't know what you are doing. */
export const DbHandle = () => JDB.solveObj(fwKey)

/** Key used to save values added by this framework. */
const fwKey = ".Skimpify-Framework"

/** Key used to save armors. */
const ArmorK = (k: RelType) => `${fwKey}.${k}`
/** Key used to save armor change relationships. */
const ChangeK = (k: RelType) => `${ArmorK(k)}T`

/** Gets an Armor given an internal key.
 * This isn't meant to be used by final users.
 *
 * @param a Armors.
 * @param key Key from where we want to retrieve the armor from.
 * @returns `Armor` or `null | undefined`.
 */
function GetArmor(a: ArmorArg, key: RelType) {
  if (!a) return null
  const r = JFormDB.solveForm(a, ArmorK(key))
  if (!r) return null
  return Armor.from(r)
}

function GetChange(a: ArmorArg, key: RelType) {
  if (!a) return null
  const r = JFormDB.solveStr(a, ChangeK(key), defaultType)
  return r === "slip"
    ? ChangeType.slip
    : r === "damage"
    ? ChangeType.damage
    : ChangeType.change
}

function NextByType(a: ArmorArg, t: ChangeType) {
  const aa = GetSkimpy(a)
  if (!aa) return null
  if (GetSkimpyType(a) === t) return aa
  return null
}

const SetRel = (a1: ArmorArg, a2: ArmorArg, r: RelType, c: ChangeType) => {
  JFormDB.solveFormSetter(a1, ArmorK(r), a2, true) // Save form
  JFormDB.solveStrSetter(a1, ChangeK(r), c, true) // Save change type
}
