import { getKeywords } from "DmLib/Armor"
import { ForEachEquippedArmor, getFormFromUniqueId } from "DmLib/Form"
import { fst } from "DmLib/typescript/Array"
import { Actor } from "skyrimPlatform"
import { config, SkimpySpellLvl } from "src/config"

export type keyword =
  | "Skimpy_DontCare" // Used for checking if is showing
  | "Skimpy_ExposeAss_TightClothes"
  | "Skimpy_ExposeAss_Crack"
  | "Skimpy_ExposeAss_SeeThrough"
  | "Skimpy_ExposeAss_Bare"
  | "Skimpy_ExposeAss_TornClothes"
  | "Skimpy_ExposeBoobs_TightClothes"
  | "Skimpy_ExposeBoobs_NipSlip"
  | "Skimpy_ExposeBoobs_BreastCurtain"
  | "Skimpy_ExposeBoobs_TornClothes"
  | "Skimpy_ExposeBoobs_Bare"
  | "Skimpy_ExposeBoobs_SeeThrough"
  | "Skimpy_ExposePubis_Slip"
  | "Skimpy_ExposePubis_SeeThrough"
  | "Skimpy_ExposePubis_TornClothes"
  | "Skimpy_ExposePubis_Bare"
  | "Skimpy_ExposePubis_Curtain"
  | "Skimpy_CoverAss"
  | "Skimpy_CoverBoobs"
  | "Skimpy_CoverPubis"
  ///////////////////////////////////////////////////////////////
  // Old
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
const keywordIds = new Map<number, string>()
export const combatLevelKeywords = new Map<string, number>()
export const speechLevelKeywords = new Map<string, number>()

const assKeywords = new Set<keyword>([
  "Skimpy_ExposeAss_TightClothes",
  "Skimpy_ExposeAss_Crack",
  "Skimpy_ExposeAss_SeeThrough",
  "Skimpy_ExposeAss_TornClothes",
  "Skimpy_ExposeAss_Bare",
  "Skimpy_ExposeCombatAss_01",
  "Skimpy_ExposeCombatAss_02",
  "Skimpy_ExposeCombatAss_03",
  "Skimpy_ExposeSpeechAss_01",
  "Skimpy_ExposeSpeechAss_02",
  "Skimpy_ExposeSpeechAss_03",
  "Skimpy_ExposeSpeechAss_04",
  "Skimpy_CoverAss",
  "Skimpy_CoverCombatAss",
  "Skimpy_CoverSpeechAss",
])

const assKeywordsLevel = new Map<keyword, number>([
  ["Skimpy_CoverAss", 0],
  ["Skimpy_CoverCombatAss", 0],
  ["Skimpy_CoverSpeechAss", 0],
  ["Skimpy_ExposeAss_TightClothes", 10],
  ["Skimpy_ExposeAss_Crack", 20],
  ["Skimpy_ExposeAss_SeeThrough", 30],
  ["Skimpy_ExposeAss_TornClothes", 40],
  ["Skimpy_ExposeAss_Bare", 50],
  ["Skimpy_ExposeCombatAss_01", 10],
  ["Skimpy_ExposeCombatAss_02", 20],
  ["Skimpy_ExposeCombatAss_03", 30],
  ["Skimpy_ExposeSpeechAss_01", 10],
  ["Skimpy_ExposeSpeechAss_02", 20],
  ["Skimpy_ExposeSpeechAss_03", 30],
  ["Skimpy_ExposeSpeechAss_04", 40],
])

const boobsKeywords = new Set<keyword>([
  "Skimpy_ExposeBoobs_TightClothes",
  "Skimpy_ExposeBoobs_NipSlip",
  "Skimpy_ExposeBoobs_BreastCurtain",
  "Skimpy_ExposeBoobs_TornClothes",
  "Skimpy_ExposeBoobs_Bare",
  "Skimpy_ExposeBoobs_SeeThrough",
  "Skimpy_ExposeCombatBoobs_01",
  "Skimpy_ExposeCombatBoobs_02",
  "Skimpy_ExposeCombatBoobs_03",
  "Skimpy_ExposeSpeechBoobs_01",
  "Skimpy_ExposeSpeechBoobs_02",
  "Skimpy_ExposeSpeechBoobs_03",
  "Skimpy_ExposeSpeechBoobs_04",
  "Skimpy_CoverBoobs",
  "Skimpy_CoverCombatBoobs",
  "Skimpy_CoverSpeechBoobs",
])

const boobsKeywordsLevel = new Map<keyword, number>([
  ["Skimpy_CoverBoobs", 0],
  ["Skimpy_CoverCombatBoobs", 0],
  ["Skimpy_CoverSpeechBoobs", 0],
  ["Skimpy_ExposeBoobs_TightClothes", 10],
  ["Skimpy_ExposeBoobs_SeeThrough", 20],
  ["Skimpy_ExposeBoobs_NipSlip", 30],
  ["Skimpy_ExposeBoobs_BreastCurtain", 40],
  ["Skimpy_ExposeBoobs_TornClothes", 50],
  ["Skimpy_ExposeBoobs_Bare", 60],
  ["Skimpy_ExposeCombatBoobs_01", 10],
  ["Skimpy_ExposeCombatBoobs_02", 20],
  ["Skimpy_ExposeCombatBoobs_03", 30],
  ["Skimpy_ExposeSpeechBoobs_01", 10],
  ["Skimpy_ExposeSpeechBoobs_02", 20],
  ["Skimpy_ExposeSpeechBoobs_03", 30],
  ["Skimpy_ExposeSpeechBoobs_04", 40],
])

const pubisKeywords = new Set<keyword>([
  "Skimpy_ExposePubis_Slip",
  "Skimpy_ExposePubis_SeeThrough",
  "Skimpy_ExposePubis_TornClothes",
  "Skimpy_ExposePubis_Bare",
  "Skimpy_ExposePubis_Curtain",
  "Skimpy_ExposeCombatPubis_01",
  "Skimpy_ExposeCombatPubis_02",
  "Skimpy_ExposeCombatPubis_03",
  "Skimpy_ExposeSpeechPubis_01",
  "Skimpy_ExposeSpeechPubis_02",
  "Skimpy_ExposeSpeechPubis_03",
  "Skimpy_ExposeSpeechPubis_04",
  "Skimpy_CoverPubis",
  "Skimpy_CoverCombatPubis",
  "Skimpy_CoverSpeechPubis",
])

const pubisKeywordsLevel = new Map<keyword, number>([
  ["Skimpy_CoverPubis", 0],
  ["Skimpy_CoverCombatPubis", 0],
  ["Skimpy_CoverSpeechPubis", 0],
  ["Skimpy_ExposePubis_SeeThrough", 10],
  ["Skimpy_ExposePubis_Curtain", 20],
  ["Skimpy_ExposePubis_Slip", 30],
  ["Skimpy_ExposePubis_TornClothes", 40],
  ["Skimpy_ExposePubis_Bare", 50],
  ["Skimpy_ExposeCombatPubis_01", 10],
  ["Skimpy_ExposeCombatPubis_02", 20],
  ["Skimpy_ExposeCombatPubis_03", 30],
  ["Skimpy_ExposeSpeechPubis_01", 10],
  ["Skimpy_ExposeSpeechPubis_02", 20],
  ["Skimpy_ExposeSpeechPubis_03", 30],
  ["Skimpy_ExposeSpeechPubis_04", 40],
])

interface KeywordLevel {
  combat: number | undefined
  speech: number | undefined
}

function initLevels() {
  function addLevel(
    map: Map<string, number>,
    lvl: number,
    cfg: SkimpySpellLvl
  ) {
    cfg.keywords.iter(k => map.set(k, lvl))
  }

  for (let i = 0; i <= 3; i++)
    addLevel(combatLevelKeywords, i, config.enchantments.levels.combat[i])

  for (let i = 0; i <= 4; i++)
    addLevel(speechLevelKeywords, i, config.enchantments.levels.speech[i])

  // function setKeywordLevels(
  //   keywords: Set<keyword>,
  //   destination: Map<string, KeywordLevel>
  // ) {
  //   const c = combatLevelKeywords.filter((_, k) => keywords.has(k as keyword))
  //   const s = speechLevelKeywords.filter((_, k) => keywords.has(k as keyword))

  //   const j: [string, KeywordLevel][] = keywords
  //     .toArray()
  //     .map(k => [k, { combat: c.get(k), speech: s.get(k) }])
  //   j.iter(([k, o]) => destination.set(k, o))

  //   printConsole("=========== Full level =============")
  //   destination
  //     .toArray()
  //     .iter(([k, o]) =>
  //       printConsole(`${k}, combat: ${o.combat}, speech: ${o.speech}`)
  //     )
  // }
  // setKeywordLevels(assKeywords, assKeywordsLevel)
  // setKeywordLevels(boobsKeywords, boobsKeywordsLevel)
  // setKeywordLevels(pubisKeywords, pubisKeywordsLevel)
}

export function initKeywords() {
  initLevels()

  new Array<KeywordMap>(
    {
      k: "Skimpy_ExposeAss_TightClothes",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDA5")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeAss_Crack",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDA6")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeAss_SeeThrough",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDA7")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeAss_Bare",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDA8")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeAss_TornClothes",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDA9")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeBoobs_TightClothes",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDAA")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeBoobs_NipSlip",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDAB")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeBoobs_BreastCurtain",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDAC")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeBoobs_TornClothes",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDAD")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeBoobs_Bare",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDAE")?.getFormID(),
    },
    {
      k: "Skimpy_ExposeBoobs_SeeThrough",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDAF")?.getFormID(),
    },
    {
      k: "Skimpy_ExposePubis_Slip",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDB0")?.getFormID(),
    },
    {
      k: "Skimpy_ExposePubis_SeeThrough",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDB1")?.getFormID(),
    },
    {
      k: "Skimpy_ExposePubis_TornClothes",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDB2")?.getFormID(),
    },
    {
      k: "Skimpy_ExposePubis_Bare",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDB3")?.getFormID(),
    },
    {
      k: "Skimpy_ExposePubis_Curtain",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDB4")?.getFormID(),
    },
    {
      k: "Skimpy_CoverAss",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDB5")?.getFormID(),
    },
    {
      k: "Skimpy_CoverBoobs",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDB6")?.getFormID(),
    },
    {
      k: "Skimpy_CoverPubis",
      id: getFormFromUniqueId("Skimpify Enchantments.esp|0xDB7")?.getFormID(),
    },
    ////////////////////////////////////////////////////////////////////
    // Old
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
    .filter(v => v.id)
    .iter(v => {
      // printConsole(`Adding keyword: ${v.k}, ${v.id?.toString(16)}`)
      keywords.set(v.k, v.id!)
      keywordIds.set(v.id!, v.k)
    })
}

/** Gets all the skimpy keywords on all equipped armors. */
export function getAllArmorKeywords(a: Actor | null) {
  const allArmorKeys = new Set<number>()

  ForEachEquippedArmor(a, armor => {
    getKeywords(armor).iter(k => allArmorKeys.add(k))
  })

  const r: string[] = []
  for (let [id, k] of keywordIds) if (allArmorKeys.has(id)) r.push(k)
  return r
}

export function getMostCoveredKeywords(keywords: string[]) {
  function mostCovered(
    keywords: Set<string>,
    coverLevels: Map<keyword, number>
  ) {
    const selectMostCovered = () => {
      const a: [string, number][] = []
      keywords.forEach(k => {
        const v = coverLevels.get(k as keyword)
        if (v === undefined) return
        a.push([k, v])
      })

      return fst(a.minBy(([_, a], [__, b]) => a - b)!)
    }

    return keywords.size > 1
      ? [selectMostCovered()]
      : keywords.size === 0
      ? []
      : keywords.toArray()
  }

  const k = new Set(keywords)
  const ass = k.intersection(assKeywords)
  const boobs = k.intersection(boobsKeywords)
  const pubis = k.intersection(pubisKeywords)

  const a = mostCovered(ass, assKeywordsLevel)
  const b = mostCovered(boobs, boobsKeywordsLevel)
  const p = mostCovered(pubis, pubisKeywordsLevel)
  return [...a, ...b, ...p]
}
