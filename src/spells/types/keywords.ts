import { Player } from "DmLib/Actor"
import { ForEachEquippedArmor, getFormFromUniqueId } from "DmLib/Form"
import { Actor, Game, Keyword, Spell, printConsole } from "skyrimPlatform"

export type keyword =
  | "Skimpy_DontCare" // Used for checking if is showing
  | "Skimpy_CoverCombatAss"
  | "Skimpy_CoverCombatBoobs"
  | "Skimpy_CoverCombatPubis"
  | "Skimpy_CoverSpeechAss"
  | "Skimpy_CoverSpeechBoobs"
  | "Skimpy_CoverSpeechPubis"
  | "Skimpy_ExposeCombatAss_01"
  | "Skimpy_ExposeCombatAss_02"
  | "Skimpy_ExposeCombatAss_03"
  | "Skimpy_ExposeCombatBoobs_01"
  | "Skimpy_ExposeCombatBoobs_02"
  | "Skimpy_ExposeCombatBoobs_03"
  | "Skimpy_ExposeCombatPubis_01"
  | "Skimpy_ExposeCombatPubis_02"
  | "Skimpy_ExposeCombatPubis_03"
  | "Skimpy_ExposeSpeechAss_01"
  | "Skimpy_ExposeSpeechAss_02"
  | "Skimpy_ExposeSpeechAss_03"
  | "Skimpy_ExposeSpeechAss_04"
  | "Skimpy_ExposeSpeechBoobs_01"
  | "Skimpy_ExposeSpeechBoobs_02"
  | "Skimpy_ExposeSpeechBoobs_03"
  | "Skimpy_ExposeSpeechBoobs_04"
  | "Skimpy_ExposeSpeechPubis_01"
  | "Skimpy_ExposeSpeechPubis_02"
  | "Skimpy_ExposeSpeechPubis_03"
  | "Skimpy_ExposeSpeechPubis_04"

interface KeywordMap {
  k: keyword
  id: number | undefined
}

const keywords = new Map<string, number>()

export function initKeywords() {
  new Array<KeywordMap>(
    {
      k: "Skimpy_CoverSpeechAss",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x82F")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechAss_04",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x82E")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechAss_03",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x82D")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechAss_02",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x82C")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechAss_01",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x82B")?.getFormID(),
    },
    {
      k: "Skimpy_CoverSpeechPubis",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x82A")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechPubis_04",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x829")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechPubis_03",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x828")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechPubis_02",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x827")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechPubis_01",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x826")?.getFormID(),
    },
    {
      k: "Skimpy_CoverSpeechBoobs",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x825")?.getFormID(),
    },
    {
      k: "Skimpy_CoverCombatAss",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x824")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeCombatAss_03",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x823")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeCombatAss_02",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x822")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeCombatAss_01",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x821")?.getFormID(),
    },
    {
      k: "Skimpy_CoverCombatPubis",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x820")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeCombatPubis_03",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x81F")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeCombatPubis_02",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x81E")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeCombatPubis_01",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x81D")?.getFormID(),
    },
    {
      k: "Skimpy_CoverCombatBoobs",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x81C")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeCombatBoobs_03",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x813")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeCombatBoobs_02",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x812")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeCombatBoobs_01",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x811")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechBoobs_04",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x810")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechBoobs_03",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x80F")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechBoobs_02",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x80E")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeSpeechBoobs_01",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0x804")?.getFormID(),
    }
  )
    .filter((v) => v.id)
    .iter((v) => {
      printConsole(`Adding keyword: ${v.k}, ${v.id}`)
      keywords.set(v.k, v.id ?? 0)
    })
}

export const getKeyword = (keyword: keyword) =>
  Keyword.from(Game.getFormEx(keywords.get(keyword) ?? 0))

export function keywordCount(a: Actor | null, keyword: keyword) {
  const k = getKeyword(keyword)
  if (!k) return 0

  let count = 0
  ForEachEquippedArmor(a, (armor) => {
    count += armor.hasKeyword(k) ? 1 : 0
  })
  return count
}
