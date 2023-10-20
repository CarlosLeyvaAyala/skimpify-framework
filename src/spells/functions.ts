import { Actor } from "skyrimPlatform"
import { initKeywords, keyword, keywordCount } from "./types/keywords"
import { getSpell, initSpells } from "./types/spells"

export function init() {
  initKeywords()
  initSpells()
}

/** Adds the spells that will be activated when skimpy clothes are equipped */
export function setSkimpySpells(a: Actor) {
  //   const spells = new Array(
  //     getFormFromUniqueId("Skimpify Enchantments.esp|0x81A"),
  //     getFormFromUniqueId("Skimpify Enchantments.esp|0x819"),
  //     getFormFromUniqueId("Skimpify Enchantments.esp|0x818"),
  //     getFormFromUniqueId("Skimpify Enchantments.esp|0x817"),
  //     getFormFromUniqueId("Skimpify Enchantments.esp|0x816"),
  //     getFormFromUniqueId("Skimpify Enchantments.esp|0x815"),
  //     getFormFromUniqueId("Skimpify Enchantments.esp|0x814")
  //   )
  //   spells.iter((s) => p.removeSpell(Spell.from(s)))
  setCombatSpell(a)
}

function setCombatSpell(a: Actor) {
  const lvl = getCombatShowingLvl(a)
  const sp1 = getSpell("Skimpy_CombatSpellNC_01")
  const sp2 = getSpell("Skimpy_CombatSpellNC_02")
  const sp3 = getSpell("Skimpy_CombatSpellNC_03")

  switch (lvl.lvl) {
    case 0:
      a.removeSpell(sp1)
      a.removeSpell(sp2)
      a.removeSpell(sp3)
      break
    case 1:
      a.removeSpell(sp2)
      a.removeSpell(sp3)
      a.addSpell(sp1, false)
      break
    case 2:
      a.removeSpell(sp1)
      a.removeSpell(sp3)
      a.addSpell(sp2, false)
      break
    case 3:
      a.removeSpell(sp1)
      a.removeSpell(sp2)
      a.addSpell(sp3, false)
      break
  }
}

const getCombatShowingLvl = (a: Actor) =>
  new Array(
    isShowingCombatBoobs(a),
    isShowingCombatAss(a),
    isShowingCombatPubis(a)
  ).maxBy((a, b) => a.lvl - b.lvl)

const isShowingCombatBoobs = (a: Actor) =>
  isShowing(
    a,
    "Skimpy_DontCare",
    "Skimpy_ExposeCombatBoobs_03",
    "Skimpy_ExposeCombatBoobs_02",
    "Skimpy_ExposeCombatBoobs_01",
    "Skimpy_CoverCombatBoobs"
  )

const isShowingCombatAss = (a: Actor) =>
  isShowing(
    a,
    "Skimpy_DontCare",
    "Skimpy_ExposeCombatAss_03",
    "Skimpy_ExposeCombatAss_02",
    "Skimpy_ExposeCombatAss_01",
    "Skimpy_CoverCombatAss"
  )

const isShowingCombatPubis = (a: Actor) =>
  isShowing(
    a,
    "Skimpy_DontCare",
    "Skimpy_ExposeCombatPubis_03",
    "Skimpy_ExposeCombatPubis_02",
    "Skimpy_ExposeCombatPubis_01",
    "Skimpy_CoverCombatPubis"
  )

function isShowing(
  a: Actor,
  l4: keyword,
  l3: keyword,
  l2: keyword,
  l1: keyword,
  cover: keyword
) {
  if (keywordCount(a, cover) > 0) return { key: cover, lvl: 0 }

  return keywordCount(a, l4) > 0
    ? { key: l4, lvl: 4 }
    : keywordCount(a, l3) > 0
    ? { key: l3, lvl: 3 }
    : keywordCount(a, l2) > 0
    ? { key: l2, lvl: 2 }
    : keywordCount(a, l1) > 0
    ? { key: l1, lvl: 1 }
    : { key: cover, lvl: 0 }
}
