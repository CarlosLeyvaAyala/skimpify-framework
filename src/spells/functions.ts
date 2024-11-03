import { Actor } from "skyrimPlatform"
import {
  combatLevelKeywords,
  getAllArmorKeywords,
  getMostCoveredKeywords,
  initKeywords,
  speechLevelKeywords,
} from "./types/keywords"
import { getSpell, initSpells } from "./types/spells"

export function init() {
  initKeywords()
  initSpells()
}

/** Returns skimpy level.
 * @returns `0`        - No skimpy level is applied
 * @returns `1 .. n`   - Level
 */
const getSkimpyLvl = (armorKeywords: string[], levels: Map<string, number>) =>
  armorKeywords
    .map(k => levels.get(k) ?? 0)
    .sort()
    .reverse()[0] ?? 0

/** Adds the spells that will be activated when skimpy clothes are equipped */
export function setSkimpySpells(a: Actor) {
  const skKeys = getMostCoveredKeywords(getAllArmorKeywords(a))
  const combatKeys = getSkimpyLvl(skKeys, combatLevelKeywords)
  const speechKeys = getSkimpyLvl(skKeys, speechLevelKeywords)

  setCombatSpell(a, combatKeys)
  setSpeechSpell(a, speechKeys)
  // printConsole("==================")
  // skKeys.iter(printConsole)
}

//////////////////////////////////////////////////////////
function setCombatSpell(a: Actor, lvl: number) {
  const sp1 = getSpell("Skimpy_CombatSpellNC_01")
  const sp2 = getSpell("Skimpy_CombatSpellNC_02")
  const sp3 = getSpell("Skimpy_CombatSpellNC_03")

  switch (lvl) {
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
    default:
      // Either no skimpy armor or view is blocked
      a.removeSpell(sp1)
      a.removeSpell(sp2)
      a.removeSpell(sp3)
      break
  }
}

//////////////////////////////////////////////////////////
function setSpeechSpell(a: Actor, lvl: number) {
  const sp1 = getSpell("Skimpy_SpeechSpellNC_01")
  const sp2 = getSpell("Skimpy_SpeechSpellNC_02")
  const sp3 = getSpell("Skimpy_SpeechSpellNC_03")
  const sp4 = getSpell("Skimpy_SpeechSpellNC_04")

  switch (lvl) {
    case 1:
      a.removeSpell(sp2)
      a.removeSpell(sp3)
      a.removeSpell(sp4)
      a.addSpell(sp1, false)
      break
    case 2:
      a.removeSpell(sp1)
      a.removeSpell(sp3)
      a.removeSpell(sp4)
      a.addSpell(sp2, false)
      break
    case 3:
      a.removeSpell(sp1)
      a.removeSpell(sp2)
      a.removeSpell(sp4)
      a.addSpell(sp3, false)
      break
    case 4:
      a.removeSpell(sp1)
      a.removeSpell(sp2)
      a.removeSpell(sp3)
      a.addSpell(sp4, false)
      break
    default:
      // Either no skimpy armor or view is blocked
      a.removeSpell(sp1)
      a.removeSpell(sp2)
      a.removeSpell(sp3)
      a.removeSpell(sp4)
      break
  }
}
