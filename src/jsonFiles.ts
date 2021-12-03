import { WriteToFile } from "PapyrusUtil/MiscUtil"
import {
  cfgDir,
  ChangeRel,
  DbHandle,
  GetModestData,
  GetSkimpyData,
} from "skimpify-api"
import { JFormMapL } from "JContainers/JTs"
import { DebugLib, FormLib } from "DmLib"
import { Actor, Armor, Debug, Game, printConsole } from "skyrimPlatform"

/** Base structure for armor settings. */
interface JsonBase {
  armors: JsonArmor[]
}

/** Structure for a single piece of armor. */
interface JsonArmor {
  /** Unique identifier for an armor. Format: `esp|id`. */
  id: string
  /** Name of the armor. Will be discarded by this framework. */
  name: string
  /** _Change Relationship_ ***with parent armor***. */
  rel?: ChangeRel | undefined
  /** Child for this armor. */
  next?: JsonArmor | undefined
}

const naked: JsonArmor = {
  id: "[SunJeong] Ninirim Collection.esp|123e40",
  name: "Red Nose Just Bones",
  rel: ChangeRel.change,
}

const slut: JsonArmor = {
  id: "[SunJeong] Ninirim Collection.esp|11ed3c",
  name: "Red Nose Upper Slutty",
  rel: ChangeRel.slip,
  next: naked,
}

const base: JsonArmor = {
  id: "[SunJeong] Ninirim Collection.esp|119c2d",
  name: "Red Nose Upper",
  next: slut,
}

const bb: JsonBase = {
  armors: [base],
}

const js = JSON.stringify(bb, undefined, 2)

/** Exports all armors to Json files. */

export namespace Export {
  export function AllJson() {
    let aa: JsonArmor[] = []
    JFormMapL.ForAllKeys(DbHandle(), (k) => {
      const a = Armor.from(k)
      if (!a) return

      const c = GetSkimpyData(a)
      const p = GetModestData(a)

      const curr = FormLib.GetFormEspAndId(a)
      const next = FormLib.GetFormEspAndId(c.armor)

      aa.push({
        id: GetUniqueId(curr.modName, curr.fixedFormId),
        name: a.getName(),
        rel: p.armor ? (p.kind ? p.kind : undefined) : undefined,
        next: c.armor
          ? {
              id: GetUniqueId(next.modName, next.fixedFormId),
              name: c.armor.getName(),
            }
          : undefined,
      })
    })

    let endChain = aa.filter((v) => !v.next)
    let parents = aa.filter((v) => v.next)

    endChain.forEach((v) =>
      printConsole(`${v.id}  ${v.rel} ${v.next ? v.next.name : "no child"}`)
    )

    const f = `${cfgDir}dump/test save.json`
    WriteToFile(f, JSON.stringify(aa, undefined, 2), false, false)
  }
}

const GetUniqueId = (esp: string, fixedFormId: number) =>
  `${esp}|${fixedFormId.toString(16)}`
