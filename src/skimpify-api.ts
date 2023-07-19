import { isActorTypeNPC } from "DmLib/Actor"
import {
  ForEachEquippedArmor,
  GetEquippedArmors,
  getPersistentChest,
} from "DmLib/Form"
import * as JDB from "JContainers/JDB"
import * as JFormDB from "JContainers/JFormDB"
import * as JFormMap from "JContainers/JFormMap"
import {
  Actor,
  Armor,
  Form,
  ObjectReference,
  printConsole,
} from "skyrimPlatform"

/**
 *     █████╗ ██████╗ ██╗
 *    ██╔══██╗██╔══██╗██║
 *    ███████║██████╔╝██║
 *    ██╔══██║██╔═══╝ ██║
 *    ██║  ██║██║     ██║
 *    ╚═╝  ╚═╝╚═╝     ╚═╝
 *
 *  Public functions, constants and types.
 *  Use them as you please.
 *
 *  This file should be inside "Data\Platform\Modules".
 */

export namespace SkimpifyFramework {
  /** Function to check if the player installed this framework.
   * @example
   *  if(SkimpifyFramework.IsInstalled()){
   *    // Do all your magic
   *  }
   */
  export const IsInstalled = () => DbHandle() !== 0
}

//  ;>========================================================
//  ;>===                  DEFINITIONS                   ===<;
//  ;>========================================================

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
 * @todo {@link GetChangeType} must be changed each time this enum changes.
 */
export const enum ChangeRel {
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
  kind: ChangeRel | null
}

/** All equipped armors with their modest/skimpy counterparts. */
export interface EquippedData {
  current: SkimpyData[]
  next: SkimpyData[]
}

/** Shortcut to `Armor | null | undefined`, because it gets tedious to write it
 * over and over.
 */
export type ArmorArg = Armor | null

/** Shortcut to `Actor | null | undefined`, because it gets tedious to write it
 * over and over.
 */
export type ActorArg = Actor | null

/** A function that takes an `Armor` and returns some of its {@link SkimpyData}. */
export type SkimpyFunc = (a: ArmorArg) => Armor | null

export type SkimpyDataFunc = (a: ArmorArg) => SkimpyData

// ;>========================================================
// ;>===                ARMOR FUNCTIONS                 ===<;
// ;>========================================================

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
  return GetChangeType(a, "prev")
}

/** Returns what kind of change an `Armor` has with its skimpier version.
 *
 * @param a `Armor` to see how it changes.
 * @returns The kind of change. `null` if there's no skimpier version.
 */
export function GetSkimpyType(a: ArmorArg) {
  return GetChangeType(a, "next")
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

/** @experimental From all equipped armors, returns all the ones that have
 * skimpier versions.
 *
 * @remarks
 * ***WARNING***. This function ***may*** be slow (not to Papyrus levels, of course) and
 * it's recommended to be used with caution in real production code.
 *
 * However, it can be safely used sparingly.
 *
 * @param a Actor to check armors from.
 * @returns An array with all equipped armors that have an skimpy version and the
 * array with those versions.
 */
export const GetAllSkimpy = (a: ActorArg) =>
  GetAll(a, GetSkimpyData, GetModestData)

/** @experimental From all equipped armors, returns all the ones that have
 * more modest versions.
 *
 * @remarks
 * ***WARNING***. This function ***may*** be slow (not to Papyrus levels, of course) and
 * it's recommended to be used with caution in real production code.
 *
 * However, it can be safely used sparingly.
 *
 * @param a Actor to check armors from.
 * @returns An array with all equipped armors that have a modest version and the
 * array with those versions.
 */
export const GetAllModest = (a: ActorArg) =>
  GetAll(a, GetModestData, GetSkimpyData)

/** Returns the most modest version of an armor.
 * @param  {Armor} a Armor to check.
 * @param  {boolean} getBroken Return the most modest version even if the current one is broken? Default = `false`.
 * @returns Armor
 */
export function GetMostModest(
  a: Armor,
  getBroken: boolean = false
): Armor | null {
  const p = GetModestData(a)

  if (!p.armor) return null
  if (p.kind === ChangeRel.damage && !getBroken) return null

  const pp = GetMostModest(p.armor)
  return pp ? pp : p.armor
}

/** Does this armor have a slip version?
 * @param  {ArmorArg} a Armor to check.
 */
export const HasSlip = (a: ArmorArg) => GetSkimpyType(a) === ChangeRel.slip

/** If the skimpy version of an `Armor` is a `slip`, returns it.
 *
 * @param a Armor to check.
 * @returns The slip `Armor`. `null` if `a` has no Skimpy version or if it isn't a `slip`.
 */
export const GetSlip = (a: ArmorArg) => NextByType(a, ChangeRel.slip)

/** Does this armor have a changed version?
 * @param  {ArmorArg} a Armor to check.
 */
export const HasChange = (a: ArmorArg) => GetSkimpyType(a) === ChangeRel.change

/** If the skimpy version of an `Armor` is a `change`, returns it.
 *
 * @param a Armor to check.
 * @returns The changed `Armor`. `null` if `a` has no Skimpy version or if it isn't a `change`.
 */
export const GetChange = (a: ArmorArg) => NextByType(a, ChangeRel.change)

/** Does this armor have a damaged version?
 * @param  {ArmorArg} a Armor to check.
 */
export const HasDamage = (a: ArmorArg) => GetSkimpyType(a) === ChangeRel.damage

/** If the skimpy version of an `Armor` is a `damage`, returns it.
 *
 * @param a Armor to check.
 * @returns The damaged `Armor`. `null` if `a` has no Skimpy version or if it isn't a `damage`.
 */
export const GetDamage = (a: ArmorArg) => NextByType(a, ChangeRel.damage)

/** Checks if an armor has a registered modest version of itself. */
export const HasModest = (a: ArmorArg) => HasKey(a, "prev")

/** Checks if an armor is a registered skimpy version of another. */
export const IsSkimpy = HasModest

/** Checks if an armor has a registered skimpy version of itself. */
export const HasSkimpy = (a: ArmorArg) => HasKey(a, "next")

/** Checks if an armor is a registered modest version of another. */
export const IsModest = HasSkimpy

/** Checks if an armor has any registered variant of itself. */
export const IsRegistered = (a: ArmorArg) => HasSkimpy(a) || HasModest(a)

/** Checks if an armor has any registered variant of itself. */
export const IsNotRegistered = (a: ArmorArg) => !HasSkimpy(a) && !HasModest(a)

/** Swaps an equipped armor from an `Actor` to its slip version. Returns wether
 * the operation could be done or not.
 *
 * **THIS FUNCTION IS THE PREFERRED WAY TO SWAP ARMORS ON ACTORS**.
 *
 * @param  {ActorArg} act `Actor` to work on.
 * @param  {ArmorArg} modestArmor Armor to swap from.
 *
 * @remarks
 * If the actor is unique, this preserves the modest version of the armor on a special
 * chest, so tempering and enchantments are not lost.\
 * On non unique actors, their original armors will simply be discarded.
 */
export const SwapToSlip = (act: ActorArg, modestArmor: ArmorArg) =>
  SwapToSkimpy(act, modestArmor, GetSlip)

/** Swaps an equipped armor from an `Actor` to its changed version. Returns wether
 * the operation could be done or not.
 *
 * **THIS FUNCTION IS THE PREFERRED WAY TO SWAP ARMORS ON ACTORS**.
 *
 * @param  {ActorArg} act `Actor` to work on.
 * @param  {ArmorArg} modestArmor Armor to swap from.
 *
 * @remarks
 * If the actor is unique, this preserves the modest version of the armor on a special
 * chest, so tempering and enchantments are not lost.\
 * On non unique actors, their original armors will simply be discarded.
 */
export const SwapToChange = (act: ActorArg, modestArmor: ArmorArg) =>
  SwapToSkimpy(act, modestArmor, GetChange)

/** Swaps an equipped armor from an `Actor` to its damaged version. Returns wether
 * the operation could be done or not.
 *
 * **THIS FUNCTION IS THE PREFERRED WAY TO SWAP ARMORS ON ACTORS**.
 *
 * @param  {ActorArg} act `Actor` to work on.
 * @param  {ArmorArg} modestArmor Armor to swap from.
 *
 * @remarks
 * If the actor is unique, this preserves the modest version of the armor on a special
 * chest, so tempering and enchantments are not lost.\
 * On non unique actors, their original armors will simply be discarded.
 */
export const SwapToDamage = (act: ActorArg, modestArmor: ArmorArg) =>
  SwapToSkimpy(act, modestArmor, GetDamage)

/** Swaps an armor with its most modest version.
 *
 * @param act Actor to swap armor on.
 * @param skimpyArmor Armor to try to swap.
 * @returns Wheter the armor could be swapped.
 */
export function RestoreMostModest(act: ActorArg, skimpyArmor: ArmorArg) {
  if (!act || !skimpyArmor) return false
  const to = GetMostModest(skimpyArmor)
  if (!to) return false
  GoModest(act, skimpyArmor, to)
  return true
}

/** Restores all equipped armors on an Actor to their most modest versions.
 *
 * @param act
 */
export function RestoreAllMostModest(act: Actor) {
  ForEachEquippedArmor(act, (a) => {
    RestoreMostModest(act, a)
  })
}

/** Tells wether an `Actor` can even equip armors.\
 * Use this to check if your mod should try to change armors on an `Actor`.
 * @param  {Actor} act Actor to check.
 *
 * @remarks
 * It currently works by checking if the Actor's Race has the `ActorTypeNPC`
 * keyword.
 *
 * Checking for this will inmediatly discard animals and creatures in most cases.
 */
export const CanUseArmor = (act: ActorArg) => isActorTypeNPC(act)

/** Checks if an `Actor` has equipped ANY skimpy armor.
 *
 * @param a The `Actor` to check.
 * @returns `boolean`
 */
export function HasSkimpyArmorEquipped(a: Actor | null) {
  const armors = GetEquippedArmors(a)
  return armors.some((armor) => HasModest(armor))
}

// ;>========================================================
// ;>===             RELATIONSHIP FUNCTIONS             ===<;
// ;>========================================================

/** Adds a _Change Relationship_ between two armors.\
 * ***WARNING***: this relationship is saved to the game.
 *
 * @param modest More modest version of some armor.
 * @param skimpy More skimpy version of that armor.
 * @param change What kind of change this relationship entails.
 */
export function AddChangeRel(
  modest: ArmorArg,
  skimpy: ArmorArg,
  change: ChangeRel = ChangeRel.change
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
    SetRel(parent, null, "next", ChangeRel.change)
    SetRel(child, null, "prev", ChangeRel.change)
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
export type RelType = "next" | "prev"

/** Default type to assume what an armor version is when it has no associated/valid type. */
export const defaultType = ChangeRel.change

/** Direct handle to the JContainers DB. Don't use this if you don't know what you are doing. */
export const DbHandle = () => JDB.solveObj(fwKey)

/** Dir where armor configuration files are located. */
export const cfgDir = "data/SKSE/Plugins/Skimpify Framework/"

/** Key used to save values added by this framework. */
const fwKey = ".Skimpify-Framework"
/** Key to find chests. */
const chestPath = `${fwKey}.globalChests`

/** Key used to save armors. */
const ArmorK = (k: RelType) => `${fwKey}.${k}`
/** Key used to save armor change relationships. */
const ChangeK = (k: RelType) => `${ArmorK(k)}T`
/** Key used to read armor change relationships from JContainers. */
export const JcChangeK = (k: RelType) => `${k}T`

export const ClearDB = () => JDB.setObj(fwKey, 0)

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

function GetChangeType(a: ArmorArg, key: RelType) {
  if (!a) return null
  const r = JFormDB.solveStr(a, ChangeK(key), defaultType).toLowerCase()
  return r === ChangeRel.slip
    ? ChangeRel.slip
    : r === ChangeRel.damage
    ? ChangeRel.damage
    : ChangeRel.change
}

function NextByType(a: ArmorArg, t: ChangeRel) {
  const aa = GetSkimpy(a)
  if (!aa) return null
  if (GetSkimpyType(a) === t) return aa
  return null
}

/** Sets a _Change Relationship_ between two armors. */
export const SetRel = (
  a1: ArmorArg,
  a2: ArmorArg,
  r: RelType,
  c: ChangeRel
) => {
  JFormDB.solveFormSetter(a1, ArmorK(r), a2, true) // Save form
  JFormDB.solveStrSetter(a1, ChangeK(r), c, true) // Save change type
}

/** @experimental From all equipped armors, returns all the ones that have
 * other versions.
 *
 * @remarks
 * ***WARNING***. This function ***may*** be slow (not to Papyrus levels, of course) and
 * it's recommended to be used with caution in real production code.
 *
 * However, it can be safely used sparingly.
 *
 * @param a Actor to check armors from.
 * @param Next Function that will get the other versions.
 * @param Curr Function that returns the opposite of `Next`.
 * @returns An array with all equipped armors that have another version and the
 * array with those versions.
 */
export function GetAll(
  a: ActorArg,
  Next: SkimpyDataFunc,
  Curr: SkimpyDataFunc
): EquippedData {
  const aa = GetEquippedArmors(a)
  const n = aa.map((v) => Next(v)).filter((v) => v.armor)
  const c = n.map((v) => Curr(v.armor))
  return { current: c, next: n }
}

/** Checks if an armor has a registered variant. */
const HasKey = (a: ArmorArg, r: RelType) =>
  !a ? false : JFormDB.solveForm(a, ArmorK(r)) !== null

/** Ensures a string is a valid {@link ChangeRel}. Returns {@link defaultType} if string was invalid. */
export const ValidateChangeRel = (rel: string) =>
  rel.toLowerCase() === ChangeRel.slip
    ? ChangeRel.slip
    : rel.toLowerCase() === ChangeRel.damage
    ? ChangeRel.damage
    : defaultType

/** Gets a global chest for storing armors from an `Actor`.
 * @remarks
 * To avoid bloat, this function returns `null` on non-unique actors so
 * they never get a chest.
 */
function GetChest(a: Actor) {
  if (!a.getLeveledActorBase()?.isUnique()) return null

  /** Gets the handle to the chests database */
  const GetChestDbHandle = () => {
    const r = JDB.solveObj(chestPath)
    return r !== 0 ? r : JFormMap.object()
  }
  /** Saves the chest database by handle */
  const SaveChestDbHandle = (h: number) => {
    JDB.solveObjSetter(chestPath, h, true)
  }

  const h = GetChestDbHandle()
  const Getter = () => {
    return JFormMap.getForm(h, a)
  }
  const Setter = (frm: Form | null) => {
    JFormMap.setForm(h, a, frm)
    SaveChestDbHandle(h)
  }
  const Logger = (msg: string) =>
    printConsole(`***Error on Skimpify Framework***: ${msg}`)

  return ObjectReference.from(getPersistentChest(Getter, Setter, Logger))
}

/** Swaps an armor on an actor. This function preserves the original armor
 * (tempering, enchantments...) by storing it in a special global chest.
 */
function GoSkimpy(a: Actor, from: Armor, to: Armor) {
  const chest = GetChest(a)

  // Remove all possible lingering armors to avoid bugs because of duplicate items.
  if (chest) chest.removeItem(from, chest.getItemCount(from), true, null)

  a.removeItem(from, 1, true, chest)
  a.equipItem(to, false, true)
}

/** Swaps an skimpy armor for its modest version that was saved on a global chest. */
function GoModest(a: Actor, from: Armor, to: Armor) {
  const chest = GetChest(a)

  a.removeItem(from, 1, true, chest)
  if (chest) chest.removeItem(to, 1, true, a)
  a.equipItem(to, false, true)
}

function SwapToSkimpy(act: ActorArg, a: ArmorArg, f: SkimpyFunc) {
  if (!act || !a) return false
  const to = f(a)
  if (!to) return false
  GoSkimpy(act, a, to)
  return true
}
