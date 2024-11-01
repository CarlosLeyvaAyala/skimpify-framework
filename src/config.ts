export interface Config {
    playerHotkeys: PlayerHotkeys;
    developerMode: boolean;
    unintrusiveMessages: boolean;
    devHotkeys: DevHotkeys;
    enchantments: Enchantments;
}

export interface DevHotkeys {
    loadJson: string;
    saveJson: string;
    autoGen: string;
    markClear: string;
    markModest: string;
    markSlip: string;
    markChange: string;
    markDamage: string;
    debugEquipped: string;
    dump: string;
    deleteAllArmors: string;
    allSkimpy: string;
    allModest: string;
    unequipAll1: string;
    unequipAll2: string;
    test: string;
}

export interface Enchantments {
    activate: boolean;
    levels: Levels;
}

export interface Levels {
    combat: { [key: string]: SkimpySpellLvl };
    speech: { [key: string]: SkimpySpellLvl };
}

export interface SkimpySpellLvl {
    description: string;
    keywords: string[];
}

export interface PlayerHotkeys {
    reveal: string;
    cover: string;
}

import { settings } from "skyrimPlatform"
const modName = "skimpify-framework"
//@ts-ignore
export const config: Config = settings[modName]