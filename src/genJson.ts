import { LogI, LogN, LogNT, LogV, LogVT } from "debug"
import { DebugLib, FormLib } from "DmLib"
import { WriteToFile } from "PapyrusUtil/MiscUtil"
import { GetSkimpyData, ChangeType, AddChangeRel } from "skimpify-api"
import { Actor, Armor, Game } from "skyrimPlatform"

const LogR = DebugLib.Log.R

interface ArmorData {
  name: string
  esp: string
  id: number
  armor: Armor
  uId: string
  next?: string
  nextT?: ChangeType
  prev?: string
  prevT?: ChangeType
}

interface OutputData {
  name: string
  next?: string
  nextT?: ChangeType
  prev?: string
  prevT?: ChangeType
}

export function AutoGenArmors() {
  LogN("\n")
  LogN("=================================")
  LogN("Generating armors for exporting")
  LogN("=================================")
  const o = GenSkimpyGroupsByName(GetInventoryArmors())
  RawDataToJson(o)
}

function GetInventoryArmors() {
  LogN("Armors in inventory:\n")
  const L = (uID: string) => `${uID}\n`
  const r: ArmorData[] = new Array()

  FormLib.ForEachArmorR(Game.getPlayer() as Actor, (a) => {
    const info = FormLib.GetFormEspAndId(a)
    if (a.isPlayable())
      r.push({
        esp: info.modName,
        name: LogNT("", a.getName()),
        id: info.fixedFormId,
        armor: a,
        uId: LogNT("", `${info.modName}|${info.fixedFormId.toString(16)}`, L),
      })
  })
  return r.sort((a, b) => a.name.localeCompare(b.name))
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
    ProcessMatches(matches, output, matches[0].name.length)

    // Delete the tentative base armor
    armors.shift()
    // Do the same for all elements in the list
  }
  return output
}

function ProcessMatches(
  m: ArmorData[],
  output: RawMap,
  baseNameLength: number
) {
  const n = m.length
  if (n < 2) return

  LogI("These armors seem to be variants")
  LogI("=================================")
  m.forEach((a, i) => LogV(`${a.name}${i === n - 1 ? "\n" : ""}`))

  /** If some element of the list contains some word, adds a relationship with
   * both the start of this list and that element.
   */
  const TestWord = (s: string, rel: ChangeType = ChangeType.change) => {
    const l = baseNameLength
    let fIdx = 0

    /** Checks if next items' name end with some particular word */
    const CheckFor = (s: string) =>
      m.slice(1).some((a, i) => {
        const t = a.name.toLowerCase().indexOf(s, l) > -1
        fIdx = t ? i + 1 : 0
        return t
      })

    if (!CheckFor(s)) return false
    LogI(`*** ${m[fIdx].name} is a(n) ${s} variant\n`)

    MakeChild(m[0], m[fIdx], rel, output)

    const b = m.splice(fIdx, 1) // Move match to start of list
    m.splice(0, 1) // Delete first element

    // Process again the rest of the list
    ProcessMatches(b.concat(m), output, l)
    return true
  }

  // Test for relationships with next elements. Give priority to items with names containing "slut"
  if (TestWord("slut")) return
  if (TestWord("xtra")) return
  if (TestWord("damage", ChangeType.damage)) return
  if (TestWord("naked")) return
  if (TestWord("nude")) return

  LogI(`--- No relationship found between elements in this list.`)
  LogI(
    "Did this framework's author forget to check for some particular word?\n"
  )
}

type RawMap = Map<string, ArmorData[]>

function ChangeExists(p: ArmorData, c: ArmorData, r: ChangeType) {
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
  return kind ? kind : r
}

function MakeChild(
  parent: ArmorData,
  child: ArmorData,
  relationship: ChangeType,
  output: RawMap
) {
  // Test if change relationship already exists.
  const change = ChangeExists(parent, child, relationship)

  // Add keys to the json file they should be output to.
  const AddKey = (k: string) => {
    if (!output.has(k))
      output.set(LogVT("Adding key to file output map", k), [])
  }
  AddKey(parent.esp)
  AddKey(child.esp)

  // Add relationship
  parent.next = child.uId
  parent.nextT = change
  child.prev = parent.uId
  child.prevT = change
  // Add it to memory, so player can test changes right away
  AddChangeRel(parent.armor, child.armor, change)
  LogI(
    `${child.name} is now registered as a skimpy version of ${parent.name}. Change type: ${change}.\n`
  )

  // Add values. These will be the ones to be exported to json.
  const AddVal = (d: ArmorData) => {
    const k = d.esp
    const a = output.get(k) as ArmorData[]
    const has = a.some((v) => v.uId === d.uId)
    if (!has) a.push(d)
    output.set(k, a)
  }
  AddVal(parent)
  AddVal(child)
}

function RawDataToJson(d: RawMap) {
  /** Helper object to be able to easily save to json. */
  interface ArmorI {
    [key: string]: OutputData
  }

  /** Transforms an ArmorData[] to an object with armor unique ids as object properties. */
  const Transform = (x: ArmorData[]) => {
    const o: OutputData[] = x.map((v) => {
      return {
        name: v.name,
        next: v.next,
        nextT: v.nextT,
        prev: v.prev,
        prevT: v.prevT,
      }
    })

    const oo: ArmorI = {}
    for (const i in o) oo[x[i].uId] = o[i]

    return JSON.stringify(oo, undefined, 2)
  }

  for (const e of d.entries()) {
    const f = `data/SKSE/Plugins/Skimpify Framework/${e[0]}.json`
    WriteToFile(f, Transform(e[1]), false, false)
  }
}
