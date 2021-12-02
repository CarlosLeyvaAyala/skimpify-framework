import { LogI, LogN, LogNT, LogV, LogVT } from "debug"
import { DebugLib, FormLib } from "DmLib"
import { JFormMapL } from "JContainers/JTs"
import { WriteToFile } from "PapyrusUtil/MiscUtil"
import {
  AddChangeRel,
  cfgDir,
  ChangeRel,
  DbHandle,
  defaultType,
  GetModestData,
  GetSkimpyData,
} from "skimpify-api"
import { Actor, Armor, Debug, Game } from "skyrimPlatform"

const LogR = DebugLib.Log.R

interface OutputObject {
  uId: string
  data: OutputData
}

/** Data used for pouring armor data to Json files. */
interface OutputData {
  name: string
  next?: string
  nextN?: string
  nextT?: ChangeRel | null
  prev?: string
  prevN?: string
  prevT?: ChangeRel | null
}

interface ArmorData {
  name: string
  esp: string
  id: number
  armor: Armor
  uId: string
  next?: string
  nextT?: ChangeRel
  prev?: string
  prevT?: ChangeRel
}

/** Filename where an Armor was defined. */
type EspFileName = string

/** Key = Filename where an Armor was defined. Values: List of all armors for some file. */
type RawMap = Map<EspFileName, ArmorData[]>

/** Map used to write armors to Json files that will be used by players. */
type OutputMap = Map<EspFileName, OutputObject[]>

/** Saves all registered armors to json files. */
export function SaveJson() {
  const m: OutputMap = new Map()

  JFormMapL.ForAllKeys(DbHandle(), (k) => {
    const a = Armor.from(k)
    if (!a) return

    const n = GetSkimpyData(a)
    if (!n.armor) return // No need to write to file an armor with no children

    const curr = FormLib.GetFormEspAndId(a)

    AddKey(curr.modName, m)
    AddVal(curr.modName, m, {
      uId: GetUniqueId(curr.modName, curr.fixedFormId),
      data: {
        name: a.getName(),
        next: ArmorUniqueId(n.armor),
        nextN: n.armor?.getName(),
        nextT: n.armor ? n.kind : undefined,
      },
    })
  })
  OutputMapToJSon(m)
}

const AddVal = (esp: string, m: OutputMap, v: OutputObject) => {
  const k = esp
  const a = m.get(k) as OutputObject[]
  a.push(v)
  m.set(k, a)
}

const ArmorUniqueId = (a: Armor | null) =>
  !a ? undefined : FormLib.GetFormUniqueId(a, GetUniqueId)

const GetUniqueId = (esp: string, fixedFormId: number) =>
  `${esp}|${fixedFormId.toString(16)}`

// Add keys to the json file they should be output to.
const AddKey = (k: EspFileName, output: OutputMap | RawMap) => {
  if (!output.has(k)) output.set(k, [])
}

/** Number of automatically generated armors. */
let autoN = 0

export function AutoGenArmors() {
  LogN("\n")
  LogN("=================================")
  LogN("Generating armors for exporting")
  LogN("=================================")

  autoN = 0
  GenSkimpyGroupsByName(GetInventoryArmors())
  Debug.messageBox(`Data for ${autoN} pairs of armors in inventory has been automatically generated.

  Now you can test in game if things are as you expected, then you can export them to json.`)
}

function GetInventoryArmors(): ArmorData[] {
  LogN("Armors in inventory:\n")
  const r: ArmorData[] = new Array()

  FormLib.ForEachArmorR(Game.getPlayer() as Actor, (a) => {
    const d = ArmorToData(a)
    if (d) r.push(d)
  })

  const rr: ArmorData[] = r.map((v) => {
    return {
      uId: v.uId,
      id: v.id,
      name: FindPreprocessed(v.name),
      armor: v.armor,
      esp: v.esp,
      next: v.next,
      nextT: v.nextT,
      prev: v.prev,
      prevT: v.prevT,
    }
  })

  return rr.sort((a, b) => a.name.localeCompare(b.name))
}

function ArmorToData(a: Armor): ArmorData | null {
  const L = (uID: string) => `${uID}\n`

  if (!a.isPlayable() || a.getName() === "") return null
  const info = FormLib.GetFormEspAndId(a)

  return {
    esp: info.modName,
    name: LogNT("", a.getName()),
    id: info.fixedFormId,
    armor: a,
    uId: LogNT("", GetUniqueId(info.modName, info.fixedFormId), L),
  }
}

interface AutoSearchPair {
  search: string
  rel: ChangeRel
}

const skimpyNames: AutoSearchPair[] = [
  { search: "slutty", rel: ChangeRel.change },
  { search: "slut", rel: ChangeRel.change },
  { search: "xtra", rel: ChangeRel.change },
  { search: "naked", rel: ChangeRel.change },
  { search: "nude", rel: ChangeRel.change },
  { search: "topless", rel: ChangeRel.change },
  { search: "sex", rel: ChangeRel.change },
  { search: "damaged", rel: ChangeRel.damage },
  { search: "damage", rel: ChangeRel.damage },
  { search: "broken", rel: ChangeRel.damage },
  { search: "broke", rel: ChangeRel.damage },
]

function PreprocessName(n: string, search: string) {
  // LogI(`-------- ${search} ${n}`)
  const i = n.indexOf(search)
  if (i < 0) return n
  const s = new RegExp(`\\s*${search}`)
  const m = n.match(s)
  if (!m) return n
  const m0 = m[0]

  const mx = n.split(s).join("") + m0

  LogV(`Armor name was rearranged because it may be a variant`)
  LogV(`Original: ${n}`)
  LogV(`Rearranged: ${mx}\n`)
  return mx
}

function FindPreprocessed(n: string) {
  const o = n.toLowerCase()

  for (const e of skimpyNames) {
    const nn = PreprocessName(o, e.search)
    if (nn !== o) return nn
  }
  return LogVT("Armor name didn't need preprocess\n", o)
}

function GenSkimpyGroupsByName(armors: ArmorData[]) {
  let output: RawMap = new Map()
  // This assumes the armor list is alphabetically sorted
  while (armors.length > 1) {
    // Put the _tentative_ base armor in some array with its possible matches
    let matches: ArmorData[] = new Array()
    matches.push(armors[0])

    // Take out all armors that share the same name as the base
    const n = armors[0].name
    while (armors.length > 1 && armors[1].name.indexOf(n) >= 0) {
      // Put them in a new array
      matches.push(armors.splice(1, 1)[0])
    }

    // Process matching items
    ProcessMatches(matches, output)

    // Delete the tentative base armor
    armors.shift()
    // Do the same for all elements in the list
  }
  return output
}

function ProcessMatches(m: ArmorData[], output: RawMap) {
  const n = m.length
  if (n < 2) return

  LogI("These armors seem to be variants")
  LogI("=================================")
  const l = LogVT("Base name length", m[0].name.length)

  // Sorting by word length makes it easier to get correct matches
  m = m.sort((a, b) => a.name.length - b.name.length)
  m.forEach((a, i) => LogV(`${a.name}${i === n - 1 ? "\n" : ""}`))

  /** If some element of the list contains some word, adds a relationship with
   * both the start of this list and that element.
   */
  const TestWord = (s: string, rel: ChangeRel = ChangeRel.change) => {
    let fIdx = 0

    /** Checks if next items' name end with some particular word */
    const CheckFor = (s: string) =>
      m.slice(1).some((a, i) => {
        // Find searched word after the end of the base
        const t = a.name.toLowerCase().indexOf(s, l) > -1
        fIdx = t ? i + 1 : 0
        return t
      })

    if (!CheckFor(s)) return false
    LogI(`*** ${m[fIdx].name} is a(n) "${s}" variant.\n`)

    MakeChild(m[0], m[fIdx], rel, output)

    const b = m.splice(fIdx, 1) // Move match to start of list
    m.splice(0, 1) // Delete first element

    // Process again the rest of the list
    ProcessMatches(b.concat(m), output)
    return true
  }

  // Test for relationships with next elements. Give priority to items with names containing "slut"
  for (const e of skimpyNames) if (TestWord(e.search, e.rel)) return

  LogI(`--- No relationship found between elements in this list.`)
  LogI(
    "Did this framework's author forget to check for some particular word?\n"
  )
}

function ChangeExists(p: ArmorData, c: ArmorData, r: ChangeRel) {
  const { armor, kind } = GetSkimpyData(p.armor)
  const L = () => {
    LogI(
      `-- Relationship changed from ${p.name} -> ${armor?.getName()}. To ${
        p.name
      } -> ${c.name}`
    )
  }
  // Child is different to what was already registered. Return new relationship.
  if (armor && armor.getFormID() !== c.armor.getFormID()) return LogR(L(), r)
  // Return old relationship if it exists. Otherwise, return new.
  return kind && kind !== defaultType ? kind : r
}

function MakeChild(
  parent: ArmorData,
  child: ArmorData,
  relationship: ChangeRel,
  output: RawMap,
  saveToMem: boolean = true
) {
  // Test if Change Relationship already exists.
  const ch = ChangeExists(parent, child, relationship)

  // Add relationship
  parent.next = child.uId
  parent.nextT = ch
  child.prev = parent.uId
  child.prevT = ch

  // Add it to memory, so player can test changes right away
  if (saveToMem) AddChangeRel(parent.armor, child.armor, ch)
  autoN++

  LogI(
    `${child.name} is now registered as a skimpy version of ${parent.name}. Change type: ${ch}.\n`
  )
}

function OutputMapToJSon(m: OutputMap) {
  /** Helper object to be able to easily save to json. */
  interface ArmorI {
    [key: string]: OutputData
  }
  /** Transforms an ArmorData[] to an object with armor unique ids as object properties. */
  const Transform = (x: OutputObject[]) => {
    const o: OutputData[] = x.map((v) => {
      return {
        name: v.data.name,
        next: v.data.next,
        nextN: v.data.nextN,
        nextT: v.data.nextT,
        prev: v.data.prev,
        prevN: v.data.prevN,
        prevT: v.data.prevT,
      }
    })

    const oo: ArmorI = {}
    for (const i in o) oo[x[i].uId] = o[i]

    return JSON.stringify(oo, undefined, 2)
  }
  for (const e of m.entries()) {
    const f = `${cfgDir}${e[0]}.json`
    WriteToFile(f, Transform(e[1]), false, false)
  }

  Debug.messageBox(
    `All data was saved to their respective Json files in "data/SKSE/Plugins/Skimpify Framework".`
  )
}
