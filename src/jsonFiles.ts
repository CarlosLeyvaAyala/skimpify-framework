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
    return
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

    parents.forEach((p) => {
      endChain.forEach((c, i) => {
        if (c.id !== p.next?.id) return
        endChain.splice(i, 1)
        p.next = c
      })
    })

    let pars = parents.filter((p) => {
      for (const c of parents) if (c.id === p.next?.id) return true
      return false
    })

    let childs = parents.filter((p) => {
      for (const c of pars) if (c.id === p.id) return false
      return true
    })

    WriteToFile(
      `${cfgDir}dump/test parents.json`,
      JSON.stringify(childs, undefined, 2),
      false,
      false
    )

    WriteToFile(
      `${cfgDir}dump/test childs.json`,
      JSON.stringify(pars, undefined, 2),
      false,
      false
    )

    pars.forEach((p) => {
      childs.forEach((c, i) => {
        if (c.id !== p.next?.id) return
        printConsole("+++", c.name)
        childs.splice(i, 1)
        p.next = c
      })
    })

    WriteToFile(
      `${cfgDir}dump/test pars.json`,
      JSON.stringify(pars, undefined, 2),
      false,
      false
    )

    const f = `${cfgDir}dump/test save.json`
    WriteToFile(f, JSON.stringify(parents, undefined, 2), false, false)
  }
}

const GetUniqueId = (esp: string, fixedFormId: number) =>
  `${esp}|${fixedFormId.toString(16)}`
