import { getFormFromUniqueId } from "DmLib/Form"
import { Game, Spell } from "skyrimPlatform"

export type spell =
  | "Skimpy_CombatSpellNC_01"
  | "Skimpy_CombatSpellNC_02"
  | "Skimpy_CombatSpellNC_03"
  | "Skimpy_SpeechSpellNC_01"
  | "Skimpy_SpeechSpellNC_02"
  | "Skimpy_SpeechSpellNC_03"
  | "Skimpy_SpeechSpellNC_04"
interface SpellMap {
  k: spell
  id: number | undefined
}
const spells = new Map<string, number>()

export function initSpells() {
  new Array<SpellMap>(
    {
      k: "Skimpy_CombatSpellNC_01",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xD99")?.getFormID(),
    },
    {
      k: "Skimpy_CombatSpellNC_02",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xD9A")?.getFormID(),
    },
    {
      k: "Skimpy_CombatSpellNC_03",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xD9B")?.getFormID(),
    },
    {
      k: "Skimpy_SpeechSpellNC_01",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xD9C")?.getFormID(),
    },
    {
      k: "Skimpy_SpeechSpellNC_02",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xD9D")?.getFormID(),
    },
    {
      k: "Skimpy_SpeechSpellNC_03",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xD9E")?.getFormID(),
    },
    {
      k: "Skimpy_SpeechSpellNC_04",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xD9F")?.getFormID(),
    }
  )
    .filter((v) => v.id)
    .iter((v) => {
      //   printConsole(`Adding spell: ${v.k}, ${v.id}`)
      spells.set(v.k, v.id ?? 0)
    })
}

export const getSpell = (spell: spell) =>
  Spell.from(Game.getFormEx(spells.get(spell) ?? 0))
