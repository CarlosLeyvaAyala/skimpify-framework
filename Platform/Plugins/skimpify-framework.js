System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Form", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_2, context_2) {
    "use strict";
    var skyrimPlatform_1, IsAlchemyLab, ObjRefHasName, defaultUIdFmt;
    var __moduleName = context_2 && context_2.id;
    function GetItemType(item) {
        if (!item)
            return 0;
        if (skyrimPlatform_1.Weapon.from(item))
            return 1;
        if (skyrimPlatform_1.Ammo.from(item))
            return 2;
        if (skyrimPlatform_1.Armor.from(item))
            return 3;
        const asP = skyrimPlatform_1.Potion.from(item);
        if (asP) {
            if (asP.isPoison())
                return 5;
            if (asP.isFood())
                return 7;
            return 4;
        }
        if (skyrimPlatform_1.Ingredient.from(item))
            return 8;
        if (skyrimPlatform_1.Book.from(item))
            return 9;
        if (skyrimPlatform_1.Key.from(item))
            return 10;
        if (skyrimPlatform_1.SoulGem.from(item))
            return 12;
        if (skyrimPlatform_1.MiscObject.from(item))
            return 11;
        return 0;
    }
    exports_2("GetItemType", GetItemType);
    function ForEachSlotMask(a, DoSomething) {
        if (!a)
            return;
        for (let i = 1; i < 2147483648; i *= 2) {
            DoSomething(i);
        }
    }
    exports_2("ForEachSlotMask", ForEachSlotMask);
    function ForEachEquippedArmor(a, DoSomething) {
        if (!a)
            return;
        for (let i = 1; i < 2147483648; i *= 2) {
            const x = skyrimPlatform_1.Armor.from(a.getWornForm(i));
            if (x)
                DoSomething(x);
        }
    }
    exports_2("ForEachEquippedArmor", ForEachEquippedArmor);
    function GetEquippedArmors(a, nonRepeated = true, playableOnly = true, namedOnly = true) {
        if (!a)
            return [];
        const all = [];
        ForEachEquippedArmor(a, (x) => {
            const p = playableOnly ? (x.isPlayable() ? x : null) : x;
            const n = p && namedOnly ? (p.getName() !== "" ? p : null) : p;
            if (n)
                all.push(n);
        });
        const GetNonRepeated = () => {
            const uIds = [...new Set(all.map((a) => a.getFormID()))];
            return uIds.map((id) => skyrimPlatform_1.Armor.from(skyrimPlatform_1.Game.getFormEx(id)));
        };
        return nonRepeated ? GetNonRepeated() : all;
    }
    exports_2("GetEquippedArmors", GetEquippedArmors);
    function ForEachKeywordR(o, f) {
        if (!o)
            return;
        let i = o.getNumKeywords();
        while (i > 0) {
            i--;
            const k = skyrimPlatform_1.Keyword.from(o.getNthKeyword(i));
            if (k)
                f(k);
        }
    }
    exports_2("ForEachKeywordR", ForEachKeywordR);
    function ForEachOutfitItemR(o, f) {
        if (!o)
            return;
        let i = o.getNumParts();
        while (i > 0) {
            i--;
            const ii = o.getNthPart(i);
            if (ii)
                f(ii);
        }
    }
    exports_2("ForEachOutfitItemR", ForEachOutfitItemR);
    function ForEachFormInCell(cell, formType, f) {
        if (!cell)
            return;
        let i = cell.getNumRefs(formType);
        while (i > 0) {
            i--;
            const frm = cell.getNthRef(i, formType);
            if (frm)
                f(frm);
        }
    }
    exports_2("ForEachFormInCell", ForEachFormInCell);
    function preserveForm(frm) {
        if (!frm)
            return () => null;
        const id = frm.getFormID();
        return () => skyrimPlatform_1.Game.getFormEx(id);
    }
    exports_2("preserveForm", preserveForm);
    function preserveActor(a) {
        const f = preserveForm(a);
        return () => skyrimPlatform_1.Actor.from(f());
    }
    exports_2("preserveActor", preserveActor);
    function getEspAndId(form) {
        const esp = getFormEsp(form);
        const id = getFixedFormId(form, esp.type);
        return { modName: esp.name, type: esp.type, fixedFormId: id };
    }
    exports_2("getEspAndId", getEspAndId);
    function getFixedFormId(form, modType) {
        if (!form || modType === 2)
            return -1;
        const id = form.getFormID();
        return modType === 0 ? id & 0xffffff : id & 0xfff;
    }
    exports_2("getFixedFormId", getFixedFormId);
    function getUniqueId(form, format = defaultUIdFmt) {
        if (!form)
            return "Null form";
        const d = getEspAndId(form);
        return format(d.modName, d.fixedFormId, d.type);
    }
    exports_2("getUniqueId", getUniqueId);
    function getFormEsp(form) {
        const nil = { name: "", type: 2 };
        if (!form)
            return nil;
        const formId = form.getFormID();
        const modIndex = formId >>> 24;
        if (modIndex == 0xfe) {
            const lightIndex = (formId >>> 12) & 0xfff;
            if (lightIndex < skyrimPlatform_1.Game.getLightModCount())
                return { name: skyrimPlatform_1.Game.getLightModName(lightIndex), type: 1 };
        }
        else
            return { name: skyrimPlatform_1.Game.getModName(modIndex), type: 0 };
        return nil;
    }
    exports_2("getFormEsp", getFormEsp);
    function forEachArmorR(o, f) {
        forEachItem(o, (i) => {
            const a = skyrimPlatform_1.Armor.from(i);
            if (!a)
                return;
            f(a);
        });
    }
    exports_2("forEachArmorR", forEachArmorR);
    function forEachItemR(o, f) {
        let i = o.getNumItems();
        while (i > 0) {
            i--;
            f(o.getNthForm(i));
        }
    }
    exports_2("forEachItemR", forEachItemR);
    function forEachItem(o, f) {
        forEachItemR(o, (item) => {
            if (!item)
                return;
            f(item);
        });
    }
    exports_2("forEachItem", forEachItem);
    function forEachItemW(o, wait, f) {
        const A = async () => {
            let i = o.getNumItems();
            while (i > 0) {
                i--;
                const item = o.getNthForm(i);
                if (!item)
                    return;
                f(item);
                skyrimPlatform_1.Utility.wait(wait);
            }
        };
        A();
    }
    exports_2("forEachItemW", forEachItemW);
    function createPersistentChest() {
        const p = skyrimPlatform_1.Game.getPlayer();
        const c = p.placeAtMe(skyrimPlatform_1.Game.getFormEx(0x70479), 1, true, false);
        if (!c)
            return null;
        const world = skyrimPlatform_1.WorldSpace.from(skyrimPlatform_1.Game.getFormEx(0x3c));
        skyrimPlatform_1.TESModPlatform.moveRefrToPosition(c, null, world, 0, 0, -10000, 0, 0, 0);
        return c.getFormID();
    }
    exports_2("createPersistentChest", createPersistentChest);
    function getPersistentChest(Getter, Setter, Logger) {
        let frm = Getter();
        if (!frm) {
            const newChest = createPersistentChest();
            if (!newChest) {
                const msg = "Could not create a persistent chest in Tamriel. " +
                    "Are you using a mod that substantially changes the game?";
                if (Logger)
                    Logger(msg);
                else
                    skyrimPlatform_1.printConsole(msg);
                return null;
            }
            frm = skyrimPlatform_1.Game.getFormEx(newChest);
            Setter(frm);
        }
        return frm;
    }
    exports_2("getPersistentChest", getPersistentChest);
    function getFormFromUniqueId(uId, fmt = /(.*)\|(0[xX].*)/, espGroup = 1, formIdGroup = 2) {
        const m = uId.match(fmt);
        if (!m)
            return null;
        const esp = m[espGroup];
        const formId = Number(m[formIdGroup]);
        return skyrimPlatform_1.Game.getFormFromFile(formId, esp);
    }
    exports_2("getFormFromUniqueId", getFormFromUniqueId);
    function removeAllFromThisItem(o, itemToRemove, silent = true, otherContainer = null) {
        if (!o)
            return;
        o.removeItem(itemToRemove, o.getItemCount(itemToRemove), silent, otherContainer);
    }
    exports_2("removeAllFromThisItem", removeAllFromThisItem);
    return {
        setters: [
            function (skyrimPlatform_1_1) {
                skyrimPlatform_1 = skyrimPlatform_1_1;
            }
        ],
        execute: function () {
            exports_2("IsAlchemyLab", IsAlchemyLab = (furniture) => ObjRefHasName(furniture, "alchemy"));
            ObjRefHasName = (f, name) => { var _a; return (_a = f.getBaseObject()) === null || _a === void 0 ? void 0 : _a.getName().toLowerCase().includes(name); };
            exports_2("defaultUIdFmt", defaultUIdFmt = (espName, fixedFormId) => `${espName}|0x${fixedFormId.toString(16)}`);
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Actor", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Form"], function (exports_3, context_3) {
    "use strict";
    var skyrimPlatform_2, Form_1, playerId, Player, GetBaseName;
    var __moduleName = context_3 && context_3.id;
    function isPlayer(a) {
        if (!a)
            return false;
        return a.getFormID() === playerId;
    }
    exports_3("isPlayer", isPlayer);
    function getBaseName(a) {
        var _a;
        const u = "unknown";
        if (!a)
            return u;
        return ((_a = a.getLeveledActorBase()) === null || _a === void 0 ? void 0 : _a.getName()) || u;
    }
    exports_3("getBaseName", getBaseName);
    function isActorTypeNPC(a) {
        var _a;
        if (!a)
            return false;
        const ActorTypeNPC = skyrimPlatform_2.Keyword.from(skyrimPlatform_2.Game.getFormFromFile(0x13794, "Skyrim.esm"));
        return ((_a = a.getRace()) === null || _a === void 0 ? void 0 : _a.hasKeyword(ActorTypeNPC)) || false;
    }
    exports_3("isActorTypeNPC", isActorTypeNPC);
    function waitActor(a, time, DoSomething) {
        const actor = Form_1.preserveActor(a);
        const f = async () => {
            await skyrimPlatform_2.Utility.wait(time);
            const act = actor();
            if (!act)
                return;
            DoSomething(act);
        };
        f();
    }
    exports_3("waitActor", waitActor);
    function waitActorId(formId, time, DoSomething) {
        const f = async () => {
            await skyrimPlatform_2.Utility.wait(time);
            const act = skyrimPlatform_2.Actor.from(skyrimPlatform_2.Game.getFormEx(formId));
            if (!act)
                return;
            DoSomething(act);
        };
        f();
    }
    exports_3("waitActorId", waitActorId);
    function getHeadPartsB(b) {
        if (!b)
            return null;
        const r = new Array(b.getNumHeadParts());
        for (let i = 0; i < r.length; i++) {
            r[i] = b.getNthHeadPart(i);
        }
        return r;
    }
    exports_3("getHeadPartsB", getHeadPartsB);
    function getHeadParts(a) {
        if (!a)
            return null;
        return getHeadPartsB(skyrimPlatform_2.ActorBase.from(a.getBaseObject()));
    }
    exports_3("getHeadParts", getHeadParts);
    function isCurrentFollower(a) {
        var _a;
        const currentFollower = skyrimPlatform_2.Faction.from(skyrimPlatform_2.Game.getFormEx(0x5c84e));
        return (_a = a === null || a === void 0 ? void 0 : a.isInFaction(currentFollower)) !== null && _a !== void 0 ? _a : false;
    }
    exports_3("isCurrentFollower", isCurrentFollower);
    return {
        setters: [
            function (skyrimPlatform_2_1) {
                skyrimPlatform_2 = skyrimPlatform_2_1;
            },
            function (Form_1_1) {
                Form_1 = Form_1_1;
            }
        ],
        execute: function () {
            exports_3("playerId", playerId = 0x14);
            exports_3("Player", Player = () => skyrimPlatform_2.Game.getPlayer());
            exports_3("GetBaseName", GetBaseName = getBaseName);
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Combinators", [], function (exports_4, context_4) {
    "use strict";
    var I, K, O, Return;
    var __moduleName = context_4 && context_4.id;
    function Tap(x, f) {
        f(x);
        return x;
    }
    exports_4("Tap", Tap);
    return {
        setters: [],
        execute: function () {
            exports_4("I", I = (x) => x);
            exports_4("K", K = (x) => (y) => x);
            exports_4("O", O = (f1, f2) => (...args) => f1(...args) || f2(...args));
            exports_4("Return", Return = (f, x) => Tap(x, K(f)));
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Log", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Combinators"], function (exports_5, context_5) {
    "use strict";
    var skyrimPlatform_3, Level, ConsoleFmt, FileFmt, append, appendT, C, R;
    var __moduleName = context_5 && context_5.id;
    function LevelFromSettings(pluginName, optionName) {
        return LevelFromValue(skyrimPlatform_3.settings[pluginName][optionName]);
    }
    exports_5("LevelFromSettings", LevelFromSettings);
    function LevelFromValue(v) {
        const l = typeof v === "string"
            ? v.toLowerCase()
            : typeof v === "number"
                ? v
                : "verbose";
        let t = Level[l];
        if (typeof l === "number")
            t = Level[t];
        return t === undefined ? Level.verbose : t;
    }
    exports_5("LevelFromValue", LevelFromValue);
    function Append(f, append) {
        return (msg) => f(append + msg);
    }
    exports_5("Append", Append);
    function AppendT(f, append) {
        return (msg, x, fmt) => f(append + msg, x, fmt);
    }
    exports_5("AppendT", AppendT);
    function CreateFunction(currLogLvl, logAt, modName, ConsoleFmt, FileFmt) {
        return function (msg) {
            const canLog = currLogLvl >= logAt || (currLogLvl < 0 && currLogLvl === logAt);
            if (!canLog)
                return;
            const t = new Date();
            if (ConsoleFmt)
                skyrimPlatform_3.printConsole(ConsoleFmt(currLogLvl, logAt, modName, t, msg));
            if (FileFmt)
                skyrimPlatform_3.writeLogs(modName, FileFmt(currLogLvl, logAt, modName, t, msg));
        };
    }
    exports_5("CreateFunction", CreateFunction);
    function CreateAll(mod, logLvl, Console, File) {
        const CLF = (logAt) => CreateFunction(logLvl, logAt, mod, Console, File);
        const O = CLF(Level.optimization);
        const N = CLF(Level.none);
        const E = CLF(Level.error);
        const I = CLF(Level.info);
        const V = CLF(Level.verbose);
        return {
            Optimization: O,
            None: N,
            Error: E,
            Info: I,
            Verbose: V,
            TapO: Tap(O),
            TapN: Tap(N),
            TapE: Tap(E),
            TapI: Tap(I),
            TapV: Tap(V),
        };
    }
    exports_5("CreateAll", CreateAll);
    function Tap(f) {
        return function (msg, x, g) {
            if (g) {
                if (msg)
                    f(`${msg}: ${g(x)}`);
                else
                    f(g(x));
            }
            else {
                if (msg)
                    f(`${msg}: ${x}`);
                else
                    f(`${x}`);
            }
            return x;
        };
    }
    exports_5("Tap", Tap);
    function IntToHex(x) {
        return !x || typeof x !== "number"
            ? "IntToHex: Undefined value"
            : x.toString(16);
    }
    exports_5("IntToHex", IntToHex);
    return {
        setters: [
            function (skyrimPlatform_3_1) {
                skyrimPlatform_3 = skyrimPlatform_3_1;
            },
            function (C_1) {
                C = C_1;
            }
        ],
        execute: function () {
            (function (Level) {
                Level[Level["optimization"] = -1] = "optimization";
                Level[Level["none"] = 0] = "none";
                Level[Level["error"] = 1] = "error";
                Level[Level["info"] = 2] = "info";
                Level[Level["verbose"] = 3] = "verbose";
            })(Level || (Level = {}));
            exports_5("Level", Level);
            exports_5("ConsoleFmt", ConsoleFmt = (_, __, n, ___, msg) => `[${n}]: ${msg}`);
            exports_5("FileFmt", FileFmt = (_, m, __, t, msg) => `[${Level[m]}] ${t.toLocaleString()}: ${msg}`);
            exports_5("append", append = Append);
            exports_5("appendT", appendT = AppendT);
            exports_5("R", R = C.Return);
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Hotkeys", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Log"], function (exports_6, context_6) {
    "use strict";
    var skyrimPlatform_4, Log, DxScanCode, DoNothing, DoNothingOnHold, FromSettings, FromObject, IsShiftPressed, IsCtrlPressed, IsAltPressed, fromValue, Modifiers, ListenTo, LogPress, LogRelease, LogHold;
    var __moduleName = context_6 && context_6.id;
    function GetAndLog(log, Get, appendStr = "Hotkey ") {
        const A = appendStr ? Log.AppendT(log, appendStr) : log;
        return (k) => A(k, Get(k), ToString);
    }
    exports_6("GetAndLog", GetAndLog);
    function ExtractHkAndModifiers(s) {
        if (!s)
            return { hk: "None", modifiers: undefined };
        let m = {};
        const Find = (sub) => {
            if (s.indexOf(sub) > -1) {
                s = s.replace(sub, "").trim();
                return true;
            }
            else
                return false;
        };
        m.alt = Find("Alt");
        m.ctrl = Find("Ctrl");
        m.shift = Find("Shift");
        m = !m.alt && !m.ctrl && !m.shift ? undefined : m;
        return { hk: s, modifiers: m };
    }
    function IsModifierPressed(m) {
        const l = m === "Alt"
            ? DxScanCode.LeftAlt
            : m === "Ctrl"
                ? DxScanCode.LeftControl
                : DxScanCode.LeftShift;
        const r = m === "Alt"
            ? DxScanCode.RightAlt
            : m === "Ctrl"
                ? DxScanCode.RightControl
                : DxScanCode.RightShift;
        return () => skyrimPlatform_4.Input.isKeyPressed(l) || skyrimPlatform_4.Input.isKeyPressed(r);
    }
    function FromValue(l) {
        let t = undefined;
        let m = undefined;
        if (typeof l === "string") {
            const { hk, modifiers } = ExtractHkAndModifiers(l);
            t = DxScanCode[hk];
            m = modifiers;
        }
        else if (typeof l === "number")
            t = l;
        return t === undefined ? { hk: DxScanCode.None } : { hk: t, modifiers: m };
    }
    exports_6("FromValue", FromValue);
    function ToString(h) {
        var _a, _b, _c;
        const k = DxScanCode[h.hk];
        const s = ((_a = h.modifiers) === null || _a === void 0 ? void 0 : _a.shift) ? "Shift + " : "";
        const c = ((_b = h.modifiers) === null || _b === void 0 ? void 0 : _b.ctrl) ? "Ctrl + " : "";
        const a = ((_c = h.modifiers) === null || _c === void 0 ? void 0 : _c.alt) ? "Alt + " : "";
        return c + s + a + k;
    }
    exports_6("ToString", ToString);
    function ListenToS(hk, enable = true, modifiers) {
        let old = false;
        let frames = 0;
        return enable && hk > DxScanCode.None
            ? (OnPress = DoNothing, OnRelease = DoNothing, OnHold = DoNothingOnHold) => {
                if (modifiers && !Modifiers.Continue(modifiers))
                    return;
                const p = skyrimPlatform_4.Input.isKeyPressed(hk);
                if (old !== p) {
                    frames = 0;
                    if (p)
                        skyrimPlatform_4.once("update", OnPress);
                    else
                        skyrimPlatform_4.once("update", OnRelease);
                }
                else if (p) {
                    frames++;
                    skyrimPlatform_4.once("update", OnHold(frames));
                }
                old = p;
            }
            : (OnPress = DoNothing, OnRelease = DoNothing, OnHold = DoNothingOnHold) => { };
    }
    exports_6("ListenToS", ListenToS);
    return {
        setters: [
            function (skyrimPlatform_4_1) {
                skyrimPlatform_4 = skyrimPlatform_4_1;
            },
            function (Log_1) {
                Log = Log_1;
            }
        ],
        execute: function () {
            (function (DxScanCode) {
                DxScanCode[DxScanCode["None"] = 0] = "None";
                DxScanCode[DxScanCode["Escape"] = 1] = "Escape";
                DxScanCode[DxScanCode["N1"] = 2] = "N1";
                DxScanCode[DxScanCode["N2"] = 3] = "N2";
                DxScanCode[DxScanCode["N3"] = 4] = "N3";
                DxScanCode[DxScanCode["N4"] = 5] = "N4";
                DxScanCode[DxScanCode["N5"] = 6] = "N5";
                DxScanCode[DxScanCode["N6"] = 7] = "N6";
                DxScanCode[DxScanCode["N7"] = 8] = "N7";
                DxScanCode[DxScanCode["N8"] = 9] = "N8";
                DxScanCode[DxScanCode["N9"] = 10] = "N9";
                DxScanCode[DxScanCode["N0"] = 11] = "N0";
                DxScanCode[DxScanCode["Minus"] = 12] = "Minus";
                DxScanCode[DxScanCode["Equals"] = 13] = "Equals";
                DxScanCode[DxScanCode["Backspace"] = 14] = "Backspace";
                DxScanCode[DxScanCode["Tab"] = 15] = "Tab";
                DxScanCode[DxScanCode["Q"] = 16] = "Q";
                DxScanCode[DxScanCode["W"] = 17] = "W";
                DxScanCode[DxScanCode["E"] = 18] = "E";
                DxScanCode[DxScanCode["R"] = 19] = "R";
                DxScanCode[DxScanCode["T"] = 20] = "T";
                DxScanCode[DxScanCode["Y"] = 21] = "Y";
                DxScanCode[DxScanCode["U"] = 22] = "U";
                DxScanCode[DxScanCode["I"] = 23] = "I";
                DxScanCode[DxScanCode["O"] = 24] = "O";
                DxScanCode[DxScanCode["P"] = 25] = "P";
                DxScanCode[DxScanCode["LeftBracket"] = 26] = "LeftBracket";
                DxScanCode[DxScanCode["RightBracket"] = 27] = "RightBracket";
                DxScanCode[DxScanCode["Enter"] = 28] = "Enter";
                DxScanCode[DxScanCode["LeftControl"] = 29] = "LeftControl";
                DxScanCode[DxScanCode["A"] = 30] = "A";
                DxScanCode[DxScanCode["S"] = 31] = "S";
                DxScanCode[DxScanCode["D"] = 32] = "D";
                DxScanCode[DxScanCode["F"] = 33] = "F";
                DxScanCode[DxScanCode["G"] = 34] = "G";
                DxScanCode[DxScanCode["H"] = 35] = "H";
                DxScanCode[DxScanCode["J"] = 36] = "J";
                DxScanCode[DxScanCode["K"] = 37] = "K";
                DxScanCode[DxScanCode["L"] = 38] = "L";
                DxScanCode[DxScanCode["Semicolon"] = 39] = "Semicolon";
                DxScanCode[DxScanCode["Apostrophe"] = 40] = "Apostrophe";
                DxScanCode[DxScanCode["Console"] = 41] = "Console";
                DxScanCode[DxScanCode["LeftShift"] = 42] = "LeftShift";
                DxScanCode[DxScanCode["BackSlash"] = 43] = "BackSlash";
                DxScanCode[DxScanCode["Z"] = 44] = "Z";
                DxScanCode[DxScanCode["X"] = 45] = "X";
                DxScanCode[DxScanCode["C"] = 46] = "C";
                DxScanCode[DxScanCode["V"] = 47] = "V";
                DxScanCode[DxScanCode["B"] = 48] = "B";
                DxScanCode[DxScanCode["N"] = 49] = "N";
                DxScanCode[DxScanCode["M"] = 50] = "M";
                DxScanCode[DxScanCode["Comma"] = 51] = "Comma";
                DxScanCode[DxScanCode["Period"] = 52] = "Period";
                DxScanCode[DxScanCode["ForwardSlash"] = 53] = "ForwardSlash";
                DxScanCode[DxScanCode["RightShift"] = 54] = "RightShift";
                DxScanCode[DxScanCode["NumMult"] = 55] = "NumMult";
                DxScanCode[DxScanCode["LeftAlt"] = 56] = "LeftAlt";
                DxScanCode[DxScanCode["Spacebar"] = 57] = "Spacebar";
                DxScanCode[DxScanCode["CapsLock"] = 58] = "CapsLock";
                DxScanCode[DxScanCode["F1"] = 59] = "F1";
                DxScanCode[DxScanCode["F2"] = 60] = "F2";
                DxScanCode[DxScanCode["F3"] = 61] = "F3";
                DxScanCode[DxScanCode["F4"] = 62] = "F4";
                DxScanCode[DxScanCode["F5"] = 63] = "F5";
                DxScanCode[DxScanCode["F6"] = 64] = "F6";
                DxScanCode[DxScanCode["F7"] = 65] = "F7";
                DxScanCode[DxScanCode["F8"] = 66] = "F8";
                DxScanCode[DxScanCode["F9"] = 67] = "F9";
                DxScanCode[DxScanCode["F10"] = 68] = "F10";
                DxScanCode[DxScanCode["NumLock"] = 69] = "NumLock";
                DxScanCode[DxScanCode["ScrollLock"] = 70] = "ScrollLock";
                DxScanCode[DxScanCode["Num7"] = 71] = "Num7";
                DxScanCode[DxScanCode["Num8"] = 72] = "Num8";
                DxScanCode[DxScanCode["Num9"] = 73] = "Num9";
                DxScanCode[DxScanCode["NumMinus"] = 74] = "NumMinus";
                DxScanCode[DxScanCode["Num4"] = 75] = "Num4";
                DxScanCode[DxScanCode["Num5"] = 76] = "Num5";
                DxScanCode[DxScanCode["Num6"] = 77] = "Num6";
                DxScanCode[DxScanCode["NumPlus"] = 78] = "NumPlus";
                DxScanCode[DxScanCode["Num1"] = 79] = "Num1";
                DxScanCode[DxScanCode["Num2"] = 80] = "Num2";
                DxScanCode[DxScanCode["Num3"] = 81] = "Num3";
                DxScanCode[DxScanCode["Num0"] = 82] = "Num0";
                DxScanCode[DxScanCode["NumDot"] = 83] = "NumDot";
                DxScanCode[DxScanCode["F11"] = 87] = "F11";
                DxScanCode[DxScanCode["F12"] = 88] = "F12";
                DxScanCode[DxScanCode["NumEnter"] = 156] = "NumEnter";
                DxScanCode[DxScanCode["RightControl"] = 157] = "RightControl";
                DxScanCode[DxScanCode["NumSlash"] = 181] = "NumSlash";
                DxScanCode[DxScanCode["SysRqPtrScr"] = 183] = "SysRqPtrScr";
                DxScanCode[DxScanCode["RightAlt"] = 184] = "RightAlt";
                DxScanCode[DxScanCode["Pause"] = 197] = "Pause";
                DxScanCode[DxScanCode["Home"] = 199] = "Home";
                DxScanCode[DxScanCode["UpArrow"] = 200] = "UpArrow";
                DxScanCode[DxScanCode["PgUp"] = 201] = "PgUp";
                DxScanCode[DxScanCode["LeftArrow"] = 203] = "LeftArrow";
                DxScanCode[DxScanCode["RightArrow"] = 205] = "RightArrow";
                DxScanCode[DxScanCode["End"] = 207] = "End";
                DxScanCode[DxScanCode["DownArrow"] = 208] = "DownArrow";
                DxScanCode[DxScanCode["PgDown"] = 209] = "PgDown";
                DxScanCode[DxScanCode["Insert"] = 210] = "Insert";
                DxScanCode[DxScanCode["Delete"] = 211] = "Delete";
                DxScanCode[DxScanCode["LeftMouseButton"] = 256] = "LeftMouseButton";
                DxScanCode[DxScanCode["RightMouseButton"] = 257] = "RightMouseButton";
                DxScanCode[DxScanCode["MiddleMouseButton"] = 258] = "MiddleMouseButton";
                DxScanCode[DxScanCode["MouseButton3"] = 259] = "MouseButton3";
                DxScanCode[DxScanCode["MouseButton4"] = 260] = "MouseButton4";
                DxScanCode[DxScanCode["MouseButton5"] = 261] = "MouseButton5";
                DxScanCode[DxScanCode["MouseButton6"] = 262] = "MouseButton6";
                DxScanCode[DxScanCode["MouseButton7"] = 263] = "MouseButton7";
                DxScanCode[DxScanCode["MouseWheelUp"] = 264] = "MouseWheelUp";
                DxScanCode[DxScanCode["MouseWheelDown"] = 265] = "MouseWheelDown";
            })(DxScanCode || (DxScanCode = {}));
            exports_6("DxScanCode", DxScanCode);
            exports_6("DoNothing", DoNothing = () => { });
            exports_6("DoNothingOnHold", DoNothingOnHold = (_) => () => { });
            exports_6("FromSettings", FromSettings = (pluginName, optionName) => FromValue(skyrimPlatform_4.settings[pluginName][optionName]));
            exports_6("FromObject", FromObject = (pluginName, objectName, optionName) => FromValue(skyrimPlatform_4.settings[pluginName][objectName][optionName]));
            exports_6("IsShiftPressed", IsShiftPressed = IsModifierPressed("Shift"));
            exports_6("IsCtrlPressed", IsCtrlPressed = IsModifierPressed("Ctrl"));
            exports_6("IsAltPressed", IsAltPressed = IsModifierPressed("Alt"));
            exports_6("fromValue", fromValue = FromValue);
            (function (Modifiers) {
                const S = IsShiftPressed;
                const A = IsAltPressed;
                const C = IsCtrlPressed;
                const T = (k, P, f) => {
                    const p = P();
                    if (k) {
                        if (!p)
                            return false;
                        return f();
                    }
                    else {
                        if (p)
                            return false;
                        return f();
                    }
                };
                function Continue(m) {
                    const TC = () => T(m.ctrl, C, () => true);
                    const TAC = () => T(m.alt, A, TC);
                    const TSAC = () => T(m.shift, S, TAC);
                    return TSAC();
                }
                Modifiers.Continue = Continue;
            })(Modifiers || (Modifiers = {}));
            exports_6("ListenTo", ListenTo = (hk, enable = true) => ListenToS(hk.hk, enable, hk.modifiers));
            exports_6("LogPress", LogPress = () => {
                skyrimPlatform_4.printConsole(`Key was pressed`);
            });
            exports_6("LogRelease", LogRelease = () => {
                skyrimPlatform_4.printConsole(`Key was released`);
            });
            exports_6("LogHold", LogHold = (n) => () => {
                skyrimPlatform_4.printConsole(`Key has been held for ${n} frames.`);
            });
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Time", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_7, context_7) {
    "use strict";
    var skyrimPlatform_5, gameHourRatio, Now, ToHumanHours, toHumanHours, ToHumanHoursStr, MinutesToHours, HoursToMinutes, ToSkyrimHours, toSkyrimHours, HourSpan, hourSpan, MinutesToSkyrimHours, SkyrimHoursToHumanMinutes;
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [
            function (skyrimPlatform_5_1) {
                skyrimPlatform_5 = skyrimPlatform_5_1;
            }
        ],
        execute: function () {
            gameHourRatio = 1.0 / 24.0;
            exports_7("Now", Now = skyrimPlatform_5.Utility.getCurrentGameTime);
            exports_7("ToHumanHours", ToHumanHours = (x) => x / gameHourRatio);
            exports_7("toHumanHours", toHumanHours = ToHumanHours);
            exports_7("ToHumanHoursStr", ToHumanHoursStr = (x) => ToHumanHours(x).toString());
            exports_7("MinutesToHours", MinutesToHours = (x) => x / 60);
            exports_7("HoursToMinutes", HoursToMinutes = (x) => x * 60);
            exports_7("ToSkyrimHours", ToSkyrimHours = (x) => x * gameHourRatio);
            exports_7("toSkyrimHours", toSkyrimHours = ToSkyrimHours);
            exports_7("HourSpan", HourSpan = (then) => ToHumanHours(Now() - then));
            exports_7("hourSpan", hourSpan = HourSpan);
            exports_7("MinutesToSkyrimHours", MinutesToSkyrimHours = (x) => ToSkyrimHours(MinutesToHours(x)));
            exports_7("SkyrimHoursToHumanMinutes", SkyrimHoursToHumanMinutes = (x) => HoursToMinutes(ToHumanHours(x)));
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Error", [], function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    function isErrorWithMessage(error) {
        return (typeof error === "object" &&
            error !== null &&
            "message" in error &&
            typeof error.message === "string");
    }
    function toErrorWithMessage(maybeError) {
        if (isErrorWithMessage(maybeError))
            return maybeError;
        try {
            return new Error(JSON.stringify(maybeError));
        }
        catch (_a) {
            return new Error(String(maybeError));
        }
    }
    function getErrorMsg(error) {
        return toErrorWithMessage(error).message;
    }
    exports_8("getErrorMsg", getErrorMsg);
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Misc", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Time", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Error"], function (exports_9, context_9) {
    "use strict";
    var skyrimPlatform_6, Time, Error_1, preserveVar, updateEach, guid;
    var __moduleName = context_9 && context_9.id;
    function AvoidRapidFire(f) {
        let lastExecuted = 0;
        return () => {
            const t = Time.Now();
            if (lastExecuted === t)
                return;
            lastExecuted = t;
            f();
        };
    }
    exports_9("AvoidRapidFire", AvoidRapidFire);
    function JContainersToPreserving(f) {
        return (k, v) => {
            f(k, v, true);
        };
    }
    exports_9("JContainersToPreserving", JContainersToPreserving);
    function PapyrusUtilToPreserving(f, obj) {
        return (k, v) => {
            f(obj, k, v);
        };
    }
    exports_9("PapyrusUtilToPreserving", PapyrusUtilToPreserving);
    function PreserveVar(Store, k) {
        return (x) => {
            skyrimPlatform_6.storage[k] = x;
            Store(k, x);
            return x;
        };
    }
    exports_9("PreserveVar", PreserveVar);
    function UpdateEach(seconds) {
        let lastUpdated = 0;
        return (f) => {
            const t = skyrimPlatform_6.Utility.getCurrentRealTime();
            if (t - lastUpdated < seconds)
                return;
            lastUpdated = t;
            f();
        };
    }
    exports_9("UpdateEach", UpdateEach);
    function uuidV4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
    exports_9("uuidV4", uuidV4);
    function wait(time, DoSomething) {
        const F = async () => {
            await skyrimPlatform_6.Utility.wait(time);
            DoSomething();
        };
        F();
    }
    exports_9("wait", wait);
    function tryE(DoSomething, Logger) {
        try {
            DoSomething();
        }
        catch (error) {
            Logger(Error_1.getErrorMsg(error));
        }
    }
    exports_9("tryE", tryE);
    return {
        setters: [
            function (skyrimPlatform_6_1) {
                skyrimPlatform_6 = skyrimPlatform_6_1;
            },
            function (Time_1) {
                Time = Time_1;
            },
            function (Error_1_1) {
                Error_1 = Error_1_1;
            }
        ],
        execute: function () {
            exports_9("preserveVar", preserveVar = PreserveVar);
            exports_9("updateEach", updateEach = UpdateEach);
            exports_9("guid", guid = uuidV4);
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/typescript/Array", [], function (exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    function RandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    exports_10("RandomElement", RandomElement);
    return {
        setters: [],
        execute: function () {
            Array.prototype.iter = function (action) {
                for (const item of this)
                    action(item);
                return this;
            };
            Array.prototype.singleOrNull = function () {
                return this.length < 1 ? null : this[0];
            };
            Array.prototype.singleOrDefault = function (defaultValue) {
                var _a;
                return (_a = this.singleOrNull) !== null && _a !== void 0 ? _a : defaultValue;
            };
            Array.prototype.randomElement = function () {
                return this[Math.floor(Math.random() * this.length)];
            };
            Array.prototype.maxBy = function (compare) {
                let max = this[0];
                for (let i = 1; i < this.length; i++) {
                    const t = this[i];
                    const c = compare(max, t);
                    max = c >= 0 ? max : t;
                }
                return max;
            };
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JDB", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_11, context_11) {
    "use strict";
    var sp, sn, solveFlt, solveInt, solveStr, solveBool, solveObj, solveForm, solveFltSetter, solveIntSetter, solveBoolSetter, solveStrSetter, solveObjSetter, solveFormSetter, setObj, hasPath, allKeys, allValues, writeToFile, root;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (sp_1) {
                sp = sp_1;
            }
        ],
        execute: function () {
            sn = sp.JDB;
            exports_11("solveFlt", solveFlt = (path, defaultVal = 0.0) => sn.solveFlt(path, defaultVal));
            exports_11("solveInt", solveInt = (path, defaultVal = 0) => sn.solveInt(path, defaultVal));
            exports_11("solveStr", solveStr = (path, defaultVal = "") => sn.solveStr(path, defaultVal));
            exports_11("solveBool", solveBool = (path, defaultVal = false) => sn.solveInt(path, defaultVal ? 1 : 0) === 1);
            exports_11("solveObj", solveObj = (path, defaultVal = 0) => sn.solveObj(path, defaultVal));
            exports_11("solveForm", solveForm = (path, defaultVal = null) => sn.solveForm(path, defaultVal));
            exports_11("solveFltSetter", solveFltSetter = (path, value, createMissingKeys = false) => sn.solveFltSetter(path, value, createMissingKeys));
            exports_11("solveIntSetter", solveIntSetter = (path, value, createMissingKeys = false) => sn.solveIntSetter(path, value, createMissingKeys));
            exports_11("solveBoolSetter", solveBoolSetter = (path, value, createMissingKeys = false) => sn.solveIntSetter(path, value ? 1 : 0, createMissingKeys));
            exports_11("solveStrSetter", solveStrSetter = (path, value, createMissingKeys = false) => sn.solveStrSetter(path, value, createMissingKeys));
            exports_11("solveObjSetter", solveObjSetter = (path, value, createMissingKeys = false) => sn.solveObjSetter(path, value, createMissingKeys));
            exports_11("solveFormSetter", solveFormSetter = (path, value, createMissingKeys = false) => sn.solveFormSetter(path, value, createMissingKeys));
            exports_11("setObj", setObj = (key, object) => sn.setObj(key, object));
            exports_11("hasPath", hasPath = (path) => sn.hasPath(path));
            exports_11("allKeys", allKeys = () => sn.allKeys());
            exports_11("allValues", allValues = () => sn.allValues());
            exports_11("writeToFile", writeToFile = (path) => sn.writeToFile(path));
            exports_11("root", root = () => sn.root());
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JMap", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_12, context_12) {
    "use strict";
    var sp, sn, object, getInt, getFlt, getStr, getObj, getForm, setInt, setFlt, setStr, setObj, setForm, hasKey, valueType, allKeys, allKeysPArray, allValues, removeKey, count, clear, addPairs, nextKey, getNthKey;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (sp_2) {
                sp = sp_2;
            }
        ],
        execute: function () {
            sn = sp.JMap;
            exports_12("object", object = () => sn.object());
            exports_12("getInt", getInt = (object, key, defaultVal = 0) => sn.getInt(object, key, defaultVal));
            exports_12("getFlt", getFlt = (object, key, defaultVal = 0.0) => sn.getFlt(object, key, defaultVal));
            exports_12("getStr", getStr = (object, key, defaultVal = "") => sn.getStr(object, key, defaultVal));
            exports_12("getObj", getObj = (object, key, defaultVal = 0) => sn.getObj(object, key, defaultVal));
            exports_12("getForm", getForm = (object, key, defaultVal = null) => sn.getForm(object, key, defaultVal));
            exports_12("setInt", setInt = (object, key, value) => sn.setInt(object, key, value));
            exports_12("setFlt", setFlt = (object, key, value) => sn.setFlt(object, key, value));
            exports_12("setStr", setStr = (object, key, value) => sn.setStr(object, key, value));
            exports_12("setObj", setObj = (object, key, container) => sn.setObj(object, key, container));
            exports_12("setForm", setForm = (object, key, value) => sn.setForm(object, key, value));
            exports_12("hasKey", hasKey = (object, key) => sn.hasKey(object, key));
            exports_12("valueType", valueType = (object, key) => sn.valueType(object, key));
            exports_12("allKeys", allKeys = (object) => sn.allKeys(object));
            exports_12("allKeysPArray", allKeysPArray = (object) => sn.allKeysPArray(object));
            exports_12("allValues", allValues = (object) => sn.allValues(object));
            exports_12("removeKey", removeKey = (object, key) => sn.removeKey(object, key));
            exports_12("count", count = (object) => sn.count(object));
            exports_12("clear", clear = (object) => sn.clear(object));
            exports_12("addPairs", addPairs = (object, source, overrideDuplicates) => sn.addPairs(object, source, overrideDuplicates));
            exports_12("nextKey", nextKey = (object, previousKey = "", endKey = "") => sn.nextKey(object, previousKey, endKey));
            exports_12("getNthKey", getNthKey = (object, keyIndex) => sn.getNthKey(object, keyIndex));
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormMap", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_13, context_13) {
    "use strict";
    var sp, sn, object, getInt, getFlt, getStr, getObj, getForm, setInt, setFlt, setStr, setObj, setForm, hasKey, valueType, allKeys, allKeysPArray, allValues, removeKey, count, clear, addPairs, nextKey, getNthKey;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (sp_3) {
                sp = sp_3;
            }
        ],
        execute: function () {
            sn = sp.JFormMap;
            exports_13("object", object = () => sn.object());
            exports_13("getInt", getInt = (object, key, defaultVal = 0) => sn.getInt(object, key, defaultVal));
            exports_13("getFlt", getFlt = (object, key, defaultVal = 0.0) => sn.getFlt(object, key, defaultVal));
            exports_13("getStr", getStr = (object, key, defaultVal = "") => sn.getStr(object, key, defaultVal));
            exports_13("getObj", getObj = (object, key, defaultVal = 0) => sn.getObj(object, key, defaultVal));
            exports_13("getForm", getForm = (object, key, defaultVal = null) => sn.getForm(object, key, defaultVal));
            exports_13("setInt", setInt = (object, key, value) => sn.setInt(object, key, value));
            exports_13("setFlt", setFlt = (object, key, value) => sn.setFlt(object, key, value));
            exports_13("setStr", setStr = (object, key, value) => sn.setStr(object, key, value));
            exports_13("setObj", setObj = (object, key, container) => sn.setObj(object, key, container));
            exports_13("setForm", setForm = (object, key, value) => sn.setForm(object, key, value));
            exports_13("hasKey", hasKey = (object, key) => sn.hasKey(object, key));
            exports_13("valueType", valueType = (object, key) => sn.valueType(object, key));
            exports_13("allKeys", allKeys = (object) => sn.allKeys(object));
            exports_13("allKeysPArray", allKeysPArray = (object) => sn.allKeysPArray(object));
            exports_13("allValues", allValues = (object) => sn.allValues(object));
            exports_13("removeKey", removeKey = (object, key) => sn.removeKey(object, key));
            exports_13("count", count = (object) => sn.count(object));
            exports_13("clear", clear = (object) => sn.clear(object));
            exports_13("addPairs", addPairs = (object, source, overrideDuplicates) => sn.addPairs(object, source, overrideDuplicates));
            exports_13("nextKey", nextKey = (object, previousKey = null, endKey = null) => sn.nextKey(object, previousKey, endKey));
            exports_13("getNthKey", getNthKey = (object, keyIndex) => sn.getNthKey(object, keyIndex));
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JArray", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_14, context_14) {
    "use strict";
    var sp, sn, object, objectWithSize, objectWithInts, objectWithStrings, objectWithFloats, objectWithBooleans, objectWithForms, subArray, addFromArray, addFromFormList, getInt, getFlt, getStr, getObj, getForm, asIntArray, asFloatArray, asStringArray, asFormArray, findInt, findFlt, findStr, findObj, findForm, countInteger, countFloat, countString, countObject, countForm, setInt, setFlt, setStr, setObj, setForm, addInt, addFlt, addStr, addObj, addForm, count, clear, eraseIndex, eraseRange, eraseInteger, eraseFloat, eraseString, eraseObject, eraseForm, valueType, swapItems, sort, unique, reverse, writeToIntegerPArray, writeToFloatPArray, writeToFormPArray, writeToStringPArray;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (sp_4) {
                sp = sp_4;
            }
        ],
        execute: function () {
            sn = sp.JArray;
            exports_14("object", object = () => sn.object());
            exports_14("objectWithSize", objectWithSize = (size) => sn.objectWithSize(size));
            exports_14("objectWithInts", objectWithInts = (values) => sn.objectWithInts(values));
            exports_14("objectWithStrings", objectWithStrings = (values) => sn.objectWithStrings(values));
            exports_14("objectWithFloats", objectWithFloats = (values) => sn.objectWithFloats(values));
            exports_14("objectWithBooleans", objectWithBooleans = (values) => sn.objectWithBooleans(values));
            exports_14("objectWithForms", objectWithForms = (values) => sn.objectWithForms(values));
            exports_14("subArray", subArray = (object, startIndex, endIndex) => sn.subArray(object, startIndex, endIndex));
            exports_14("addFromArray", addFromArray = (object, source, insertAtIndex = -1) => sn.addFromArray(object, source, insertAtIndex));
            exports_14("addFromFormList", addFromFormList = (object, source, insertAtIndex = -1) => sn.addFromFormList(object, source, insertAtIndex));
            exports_14("getInt", getInt = (object, index, defaultVal = 0) => sn.getInt(object, index, defaultVal));
            exports_14("getFlt", getFlt = (object, index, defaultVal = 0.0) => sn.getFlt(object, index, defaultVal));
            exports_14("getStr", getStr = (object, index, defaultVal = "") => sn.getStr(object, index, defaultVal));
            exports_14("getObj", getObj = (object, index, defaultVal = 0) => sn.getObj(object, index, defaultVal));
            exports_14("getForm", getForm = (object, index, defaultVal = null) => sn.getForm(object, index, defaultVal));
            exports_14("asIntArray", asIntArray = (object) => sn.asIntArray(object));
            exports_14("asFloatArray", asFloatArray = (object) => sn.asFloatArray(object));
            exports_14("asStringArray", asStringArray = (object) => sn.asStringArray(object));
            exports_14("asFormArray", asFormArray = (object) => sn.asFormArray(object));
            exports_14("findInt", findInt = (object, value, searchStartIndex = 0) => sn.findInt(object, value, searchStartIndex));
            exports_14("findFlt", findFlt = (object, value, searchStartIndex = 0) => sn.findFlt(object, value, searchStartIndex));
            exports_14("findStr", findStr = (object, value, searchStartIndex = 0) => sn.findStr(object, value, searchStartIndex));
            exports_14("findObj", findObj = (object, container, searchStartIndex = 0) => sn.findObj(object, container, searchStartIndex));
            exports_14("findForm", findForm = (object, value, searchStartIndex = 0) => sn.findForm(object, value, searchStartIndex));
            exports_14("countInteger", countInteger = (object, value) => sn.countInteger(object, value));
            exports_14("countFloat", countFloat = (object, value) => sn.countFloat(object, value));
            exports_14("countString", countString = (object, value) => sn.countString(object, value));
            exports_14("countObject", countObject = (object, container) => sn.countObject(object, container));
            exports_14("countForm", countForm = (object, value) => sn.countForm(object, value));
            exports_14("setInt", setInt = (object, index, value) => sn.setInt(object, index, value));
            exports_14("setFlt", setFlt = (object, index, value) => sn.setFlt(object, index, value));
            exports_14("setStr", setStr = (object, index, value) => sn.setStr(object, index, value));
            exports_14("setObj", setObj = (object, index, container) => sn.setObj(object, index, container));
            exports_14("setForm", setForm = (object, index, value) => sn.setForm(object, index, value));
            exports_14("addInt", addInt = (object, value, addToIndex = -1) => sn.addInt(object, value, addToIndex));
            exports_14("addFlt", addFlt = (object, value, addToIndex = -1) => sn.addFlt(object, value, addToIndex));
            exports_14("addStr", addStr = (object, value, addToIndex = -1) => sn.addStr(object, value, addToIndex));
            exports_14("addObj", addObj = (object, container, addToIndex = -1) => sn.addObj(object, container, addToIndex));
            exports_14("addForm", addForm = (object, value, addToIndex = -1) => sn.addForm(object, value, addToIndex));
            exports_14("count", count = (object) => sn.count(object));
            exports_14("clear", clear = (object) => sn.clear(object));
            exports_14("eraseIndex", eraseIndex = (object, index) => sn.eraseIndex(object, index));
            exports_14("eraseRange", eraseRange = (object, first, last) => sn.eraseRange(object, first, last));
            exports_14("eraseInteger", eraseInteger = (object, value) => sn.eraseInteger(object, value));
            exports_14("eraseFloat", eraseFloat = (object, value) => sn.eraseFloat(object, value));
            exports_14("eraseString", eraseString = (object, value) => sn.eraseString(object, value));
            exports_14("eraseObject", eraseObject = (object, container) => sn.eraseObject(object, container));
            exports_14("eraseForm", eraseForm = (object, value) => sn.eraseForm(object, value));
            exports_14("valueType", valueType = (object, index) => sn.valueType(object, index));
            exports_14("swapItems", swapItems = (object, index1, index2) => sn.swapItems(object, index1, index2));
            exports_14("sort", sort = (object) => sn.sort(object));
            exports_14("unique", unique = (object) => sn.unique(object));
            exports_14("reverse", reverse = (object) => sn.reverse(object));
            exports_14("writeToIntegerPArray", writeToIntegerPArray = (object, targetArray, writeAtIdx = 0, stopWriteAtIdx = -1, readIdx = 0, defaultValRead = 0) => sn.writeToIntegerPArray(object, targetArray, writeAtIdx, stopWriteAtIdx, readIdx, defaultValRead));
            exports_14("writeToFloatPArray", writeToFloatPArray = (object, targetArray, writeAtIdx = 0, stopWriteAtIdx = -1, readIdx = 0, defaultValRead = 0.0) => sn.writeToFloatPArray(object, targetArray, writeAtIdx, stopWriteAtIdx, readIdx, defaultValRead));
            exports_14("writeToFormPArray", writeToFormPArray = (object, targetArray, writeAtIdx = 0, stopWriteAtIdx = -1, readIdx = 0, defaultValRead = null) => sn.writeToFormPArray(object, targetArray, writeAtIdx, stopWriteAtIdx, readIdx, defaultValRead));
            exports_14("writeToStringPArray", writeToStringPArray = (object, targetArray, writeAtIdx = 0, stopWriteAtIdx = -1, readIdx = 0, defaultValRead = "") => sn.writeToStringPArray(object, targetArray, writeAtIdx, stopWriteAtIdx, readIdx, defaultValRead));
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JTs", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JMap", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormMap", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JArray"], function (exports_15, context_15) {
    "use strict";
    var JMap, JFormMap, JArray, JMapL, JFormMapL, JArrayL;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (JMap_1) {
                JMap = JMap_1;
            },
            function (JFormMap_1) {
                JFormMap = JFormMap_1;
            },
            function (JArray_1) {
                JArray = JArray_1;
            }
        ],
        execute: function () {
            (function (JMapL) {
                function ForAllKeys(o, f) {
                    if (o === 0)
                        return;
                    let k = JMap.nextKey(o);
                    while (k !== "") {
                        f(k, o);
                        k = JMap.nextKey(o, k);
                    }
                }
                JMapL.ForAllKeys = ForAllKeys;
                function FilterForms(o, Predicate) {
                    const r = JMap.object();
                    ForAllKeys(o, (k) => {
                        const frm = JMap.getForm(o, k);
                        if (Predicate(frm, o))
                            JMap.setForm(r, k, frm);
                    });
                    return r;
                }
                JMapL.FilterForms = FilterForms;
            })(JMapL || (JMapL = {}));
            exports_15("JMapL", JMapL);
            (function (JFormMapL) {
                function ForAllKeys(o, f) {
                    if (o === 0)
                        return;
                    let k = JFormMap.nextKey(o);
                    while (k) {
                        f(k, o);
                        k = JFormMap.nextKey(o, k);
                    }
                }
                JFormMapL.ForAllKeys = ForAllKeys;
            })(JFormMapL || (JFormMapL = {}));
            exports_15("JFormMapL", JFormMapL);
            (function (JArrayL) {
                function ForAllItems(o, f) {
                    if (o === 0)
                        return;
                    let i = JArray.count(o);
                    while (i > 0) {
                        i--;
                        f(i, o);
                    }
                }
                JArrayL.ForAllItems = ForAllItems;
            })(JArrayL || (JArrayL = {}));
            exports_15("JArrayL", JArrayL);
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JValue", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_16, context_16) {
    "use strict";
    var sp, sn, enableAPILog, retain, release, releaseAndRetain, releaseObjectsWithTag, zeroLifetime, addToPool, cleanPool, shallowCopy, deepCopy, isExists, isArray, isMap, isFormMap, isIntegerMap, empty, count, clear, readFromFile, readFromDirectory, objectFromPrototype, writeToFile, solvedValueType, hasPath, solveFlt, solveInt, solveStr, solveObj, solveForm, solveFltSetter, solveIntSetter, solveStrSetter, solveObjSetter, solveFormSetter, evalLuaFlt, evalLuaInt, evalLuaStr, evalLuaObj, evalLuaForm;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [
            function (sp_5) {
                sp = sp_5;
            }
        ],
        execute: function () {
            sn = sp.JValue;
            exports_16("enableAPILog", enableAPILog = (arg0) => sn.enableAPILog(arg0));
            exports_16("retain", retain = (object, tag = "") => sn.retain(object, tag));
            exports_16("release", release = (object) => sn.release(object));
            exports_16("releaseAndRetain", releaseAndRetain = (previousObject, newObject, tag = "") => sn.releaseAndRetain(previousObject, newObject, tag));
            exports_16("releaseObjectsWithTag", releaseObjectsWithTag = (tag) => sn.releaseObjectsWithTag(tag));
            exports_16("zeroLifetime", zeroLifetime = (object) => sn.zeroLifetime(object));
            exports_16("addToPool", addToPool = (object, poolName) => sn.addToPool(object, poolName));
            exports_16("cleanPool", cleanPool = (poolName) => sn.cleanPool(poolName));
            exports_16("shallowCopy", shallowCopy = (object) => sn.shallowCopy(object));
            exports_16("deepCopy", deepCopy = (object) => sn.deepCopy(object));
            exports_16("isExists", isExists = (object) => sn.isExists(object));
            exports_16("isArray", isArray = (object) => sn.isArray(object));
            exports_16("isMap", isMap = (object) => sn.isMap(object));
            exports_16("isFormMap", isFormMap = (object) => sn.isFormMap(object));
            exports_16("isIntegerMap", isIntegerMap = (object) => sn.isIntegerMap(object));
            exports_16("empty", empty = (object) => sn.empty(object));
            exports_16("count", count = (object) => sn.count(object));
            exports_16("clear", clear = (object) => sn.clear(object));
            exports_16("readFromFile", readFromFile = (filePath) => sn.readFromFile(filePath));
            exports_16("readFromDirectory", readFromDirectory = (directoryPath, extension = "") => sn.readFromDirectory(directoryPath, extension));
            exports_16("objectFromPrototype", objectFromPrototype = (prototype) => sn.objectFromPrototype(prototype));
            exports_16("writeToFile", writeToFile = (object, filePath) => sn.writeToFile(object, filePath));
            exports_16("solvedValueType", solvedValueType = (object, path) => sn.solvedValueType(object, path));
            exports_16("hasPath", hasPath = (object, path) => sn.hasPath(object, path));
            exports_16("solveFlt", solveFlt = (object, path, defaultVal = 0.0) => sn.solveFlt(object, path, defaultVal));
            exports_16("solveInt", solveInt = (object, path, defaultVal = 0) => sn.solveInt(object, path, defaultVal));
            exports_16("solveStr", solveStr = (object, path, defaultVal = "") => sn.solveStr(object, path, defaultVal));
            exports_16("solveObj", solveObj = (object, path, defaultVal = 0) => sn.solveObj(object, path, defaultVal));
            exports_16("solveForm", solveForm = (object, path, defaultVal = null) => sn.solveForm(object, path, defaultVal));
            exports_16("solveFltSetter", solveFltSetter = (object, path, value, createMissingKeys = false) => sn.solveFltSetter(object, path, value, createMissingKeys));
            exports_16("solveIntSetter", solveIntSetter = (object, path, value, createMissingKeys = false) => sn.solveIntSetter(object, path, value, createMissingKeys));
            exports_16("solveStrSetter", solveStrSetter = (object, path, value, createMissingKeys = false) => sn.solveStrSetter(object, path, value, createMissingKeys));
            exports_16("solveObjSetter", solveObjSetter = (object, path, value, createMissingKeys = false) => sn.solveObjSetter(object, path, value, createMissingKeys));
            exports_16("solveFormSetter", solveFormSetter = (object, path, value, createMissingKeys = false) => sn.solveFormSetter(object, path, value, createMissingKeys));
            exports_16("evalLuaFlt", evalLuaFlt = (object, luaCode, defaultVal = 0.0) => sn.evalLuaFlt(object, luaCode, defaultVal));
            exports_16("evalLuaInt", evalLuaInt = (object, luaCode, defaultVal = 0) => sn.evalLuaInt(object, luaCode, defaultVal));
            exports_16("evalLuaStr", evalLuaStr = (object, luaCode, defaultVal = "") => sn.evalLuaStr(object, luaCode, defaultVal));
            exports_16("evalLuaObj", evalLuaObj = (object, luaCode, defaultVal = 0) => sn.evalLuaObj(object, luaCode, defaultVal));
            exports_16("evalLuaForm", evalLuaForm = (object, luaCode, defaultVal = null) => sn.evalLuaForm(object, luaCode, defaultVal));
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/PapyrusUtil/MiscUtil", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_17, context_17) {
    "use strict";
    var sp, sn, ScanCellObjects, ScanCellNPCs, ScanCellNPCsByFaction, ToggleFreeCamera, SetFreeCameraSpeed, SetFreeCameraState, FilesInFolder, FoldersInFolder, FileExists, ReadFromFile, WriteToFile, PrintConsole, GetRaceEditorID, GetActorRaceEditorID, SetMenus;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [
            function (sp_6) {
                sp = sp_6;
            }
        ],
        execute: function () {
            sn = sp.MiscUtil;
            exports_17("ScanCellObjects", ScanCellObjects = (formType, CenterOn, radius = 0.0, HasKeyword = null) => sn.ScanCellObjects(formType, CenterOn, radius, HasKeyword));
            exports_17("ScanCellNPCs", ScanCellNPCs = (CenterOn, radius = 0.0, HasKeyword = null, IgnoreDead = true) => sn.ScanCellNPCs(CenterOn, radius, HasKeyword, IgnoreDead));
            exports_17("ScanCellNPCsByFaction", ScanCellNPCsByFaction = (FindFaction, CenterOn, radius = 0.0, minRank = 0, maxRank = 127, IgnoreDead = true) => sn.ScanCellNPCsByFaction(FindFaction, CenterOn, radius, minRank, maxRank, IgnoreDead));
            exports_17("ToggleFreeCamera", ToggleFreeCamera = (stopTime = false) => sn.ToggleFreeCamera(stopTime));
            exports_17("SetFreeCameraSpeed", SetFreeCameraSpeed = (speed) => sn.SetFreeCameraSpeed(speed));
            exports_17("SetFreeCameraState", SetFreeCameraState = (enable, speed = 10.0) => sn.SetFreeCameraState(enable, speed));
            exports_17("FilesInFolder", FilesInFolder = (directory, extension = "*") => sn.FilesInFolder(directory, extension));
            exports_17("FoldersInFolder", FoldersInFolder = (directory) => sn.FoldersInFolder(directory));
            exports_17("FileExists", FileExists = (fileName) => sn.FileExists(fileName));
            exports_17("ReadFromFile", ReadFromFile = (fileName) => sn.ReadFromFile(fileName));
            exports_17("WriteToFile", WriteToFile = (fileName, text, append = true, timestamp = false) => sn.WriteToFile(fileName, text, append, timestamp));
            exports_17("PrintConsole", PrintConsole = (text) => sn.PrintConsole(text));
            exports_17("GetRaceEditorID", GetRaceEditorID = (raceForm) => sn.GetRaceEditorID(raceForm));
            exports_17("GetActorRaceEditorID", GetActorRaceEditorID = (actorRef) => sn.GetActorRaceEditorID(actorRef));
            exports_17("SetMenus", SetMenus = (enabled) => sn.SetMenus(enabled));
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormDB", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_18, context_18) {
    "use strict";
    var sp, sn, setEntry, makeEntry, findEntry, solveFlt, solveInt, solveStr, solveObj, solveForm, solveFltSetter, solveIntSetter, solveStrSetter, solveObjSetter, solveFormSetter, hasPath, allKeys, allValues, getInt, getFlt, getStr, getObj, getForm, setInt, setFlt, setStr, setObj, setForm;
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [
            function (sp_7) {
                sp = sp_7;
            }
        ],
        execute: function () {
            sn = sp.JFormDB;
            exports_18("setEntry", setEntry = (storageName, fKey, entry) => sn.setEntry(storageName, fKey, entry));
            exports_18("makeEntry", makeEntry = (storageName, fKey) => sn.makeEntry(storageName, fKey));
            exports_18("findEntry", findEntry = (storageName, fKey) => sn.findEntry(storageName, fKey));
            exports_18("solveFlt", solveFlt = (fKey, path, defaultVal = 0.0) => sn.solveFlt(fKey, path, defaultVal));
            exports_18("solveInt", solveInt = (fKey, path, defaultVal = 0) => sn.solveInt(fKey, path, defaultVal));
            exports_18("solveStr", solveStr = (fKey, path, defaultVal = "") => sn.solveStr(fKey, path, defaultVal));
            exports_18("solveObj", solveObj = (fKey, path, defaultVal = 0) => sn.solveObj(fKey, path, defaultVal));
            exports_18("solveForm", solveForm = (fKey, path, defaultVal = null) => sn.solveForm(fKey, path, defaultVal));
            exports_18("solveFltSetter", solveFltSetter = (fKey, path, value, createMissingKeys = false) => sn.solveFltSetter(fKey, path, value, createMissingKeys));
            exports_18("solveIntSetter", solveIntSetter = (fKey, path, value, createMissingKeys = false) => sn.solveIntSetter(fKey, path, value, createMissingKeys));
            exports_18("solveStrSetter", solveStrSetter = (fKey, path, value, createMissingKeys = false) => sn.solveStrSetter(fKey, path, value, createMissingKeys));
            exports_18("solveObjSetter", solveObjSetter = (fKey, path, value, createMissingKeys = false) => sn.solveObjSetter(fKey, path, value, createMissingKeys));
            exports_18("solveFormSetter", solveFormSetter = (fKey, path, value, createMissingKeys = false) => sn.solveFormSetter(fKey, path, value, createMissingKeys));
            exports_18("hasPath", hasPath = (fKey, path) => sn.hasPath(fKey, path));
            exports_18("allKeys", allKeys = (fKey, key) => sn.allKeys(fKey, key));
            exports_18("allValues", allValues = (fKey, key) => sn.allValues(fKey, key));
            exports_18("getInt", getInt = (fKey, key) => sn.getInt(fKey, key));
            exports_18("getFlt", getFlt = (fKey, key) => sn.getFlt(fKey, key));
            exports_18("getStr", getStr = (fKey, key) => sn.getStr(fKey, key));
            exports_18("getObj", getObj = (fKey, key) => sn.getObj(fKey, key));
            exports_18("getForm", getForm = (fKey, key) => sn.getForm(fKey, key));
            exports_18("setInt", setInt = (fKey, key, value) => sn.setInt(fKey, key, value));
            exports_18("setFlt", setFlt = (fKey, key, value) => sn.setFlt(fKey, key, value));
            exports_18("setStr", setStr = (fKey, key, value) => sn.setStr(fKey, key, value));
            exports_18("setObj", setObj = (fKey, key, container) => sn.setObj(fKey, key, container));
            exports_18("setForm", setForm = (fKey, key, value) => sn.setForm(fKey, key, value));
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skimpify-api", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Actor", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Form", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JDB", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormDB", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormMap", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_19, context_19) {
    "use strict";
    var Actor_1, Form_2, JDB, JFormDB, JFormMap, skyrimPlatform_7, SkimpifyFramework, GetAllSkimpy, GetAllModest, HasSlip, GetSlip, HasChange, GetChange, HasDamage, GetDamage, HasModest, IsSkimpy, HasSkimpy, IsModest, IsRegistered, IsNotRegistered, SwapToSlip, SwapToChange, SwapToDamage, CanUseArmor, defaultType, DbHandle, cfgDir, fwKey, chestPath, ArmorK, ChangeK, JcChangeK, ClearDB, SetRel, HasKey, ValidateChangeRel;
    var __moduleName = context_19 && context_19.id;
    function GetModest(a) {
        return GetArmor(a, "prev");
    }
    exports_19("GetModest", GetModest);
    function GetSkimpy(a) {
        return GetArmor(a, "next");
    }
    exports_19("GetSkimpy", GetSkimpy);
    function GetModestType(a) {
        return GetChangeType(a, "prev");
    }
    exports_19("GetModestType", GetModestType);
    function GetSkimpyType(a) {
        return GetChangeType(a, "next");
    }
    exports_19("GetSkimpyType", GetSkimpyType);
    function GetModestData(a) {
        return { armor: GetModest(a), kind: GetModestType(a) };
    }
    exports_19("GetModestData", GetModestData);
    function GetSkimpyData(a) {
        return { armor: GetSkimpy(a), kind: GetSkimpyType(a) };
    }
    exports_19("GetSkimpyData", GetSkimpyData);
    function GetMostModest(a, getBroken = false) {
        const p = GetModestData(a);
        if (!p.armor)
            return null;
        if (p.kind === "damage" && !getBroken)
            return null;
        const pp = GetMostModest(p.armor);
        return pp ? pp : p.armor;
    }
    exports_19("GetMostModest", GetMostModest);
    function RestoreMostModest(act, skimpyArmor) {
        if (!act || !skimpyArmor)
            return false;
        const to = GetMostModest(skimpyArmor);
        if (!to)
            return false;
        GoModest(act, skimpyArmor, to);
        return true;
    }
    exports_19("RestoreMostModest", RestoreMostModest);
    function RestoreAllMostModest(act) {
        Form_2.ForEachEquippedArmor(act, (a) => {
            RestoreMostModest(act, a);
        });
    }
    exports_19("RestoreAllMostModest", RestoreAllMostModest);
    function HasSkimpyArmorEquipped(a) {
        const armors = Form_2.GetEquippedArmors(a);
        return armors.some((armor) => HasModest(armor));
    }
    exports_19("HasSkimpyArmorEquipped", HasSkimpyArmorEquipped);
    function AddChangeRel(modest, skimpy, change = "change") {
        if (!modest || !skimpy)
            return;
        SetRel(modest, skimpy, "next", change);
        SetRel(skimpy, modest, "prev", change);
    }
    exports_19("AddChangeRel", AddChangeRel);
    function ClearChangeRel(a) {
        const C = (parent, child) => {
            if (!parent || !child)
                return;
            SetRel(parent, null, "next", "change");
            SetRel(child, null, "prev", "change");
        };
        C(GetModest(a), a);
        C(a, GetSkimpy(a));
    }
    exports_19("ClearChangeRel", ClearChangeRel);
    function GetArmor(a, key) {
        if (!a)
            return null;
        const r = JFormDB.solveForm(a, ArmorK(key));
        if (!r)
            return null;
        return skyrimPlatform_7.Armor.from(r);
    }
    function GetChangeType(a, key) {
        if (!a)
            return null;
        const r = JFormDB.solveStr(a, ChangeK(key), defaultType).toLowerCase();
        return r === "slip"
            ? "slip"
            : r === "damage"
                ? "damage"
                : "change";
    }
    function NextByType(a, t) {
        const aa = GetSkimpy(a);
        if (!aa)
            return null;
        if (GetSkimpyType(a) === t)
            return aa;
        return null;
    }
    function GetAll(a, Next, Curr) {
        const aa = Form_2.GetEquippedArmors(a);
        const n = aa.map((v) => Next(v)).filter((v) => v.armor);
        const c = n.map((v) => Curr(v.armor));
        return { current: c, next: n };
    }
    exports_19("GetAll", GetAll);
    function GetChest(a) {
        const l = a.getLeveledActorBase();
        if (!l || !l.isUnique())
            return null;
        const GetChestDbHandle = () => {
            const r = JDB.solveObj(chestPath);
            return r !== 0 ? r : JFormMap.object();
        };
        const SaveChestDbHandle = (h) => {
            JDB.solveObjSetter(chestPath, h, true);
        };
        const h = GetChestDbHandle();
        const Getter = () => {
            return JFormMap.getForm(h, a);
        };
        const Setter = (frm) => {
            JFormMap.setForm(h, a, frm);
            SaveChestDbHandle(h);
        };
        const Logger = (msg) => skyrimPlatform_7.printConsole(`***Error on Skimpify Framework***: ${msg}`);
        return skyrimPlatform_7.ObjectReference.from(Form_2.getPersistentChest(Getter, Setter, Logger));
    }
    exports_19("GetChest", GetChest);
    function GoSkimpy(a, from, to) {
        const chest = GetChest(a);
        if (chest)
            chest.removeItem(from, chest.getItemCount(from), true, null);
        a.removeItem(from, 1, true, chest);
        a.equipItem(to, false, true);
    }
    function GoModest(a, from, to) {
        const chest = GetChest(a);
        a.removeItem(from, 1, true, chest);
        if (chest)
            chest.removeItem(to, 1, true, a);
        a.equipItem(to, false, true);
    }
    function SwapToSkimpy(act, a, f) {
        if (!act || !a)
            return false;
        const to = f(a);
        if (!to)
            return false;
        GoSkimpy(act, a, to);
        return true;
    }
    return {
        setters: [
            function (Actor_1_1) {
                Actor_1 = Actor_1_1;
            },
            function (Form_2_1) {
                Form_2 = Form_2_1;
            },
            function (JDB_1) {
                JDB = JDB_1;
            },
            function (JFormDB_1) {
                JFormDB = JFormDB_1;
            },
            function (JFormMap_2) {
                JFormMap = JFormMap_2;
            },
            function (skyrimPlatform_7_1) {
                skyrimPlatform_7 = skyrimPlatform_7_1;
            }
        ],
        execute: function () {
            (function (SkimpifyFramework) {
                SkimpifyFramework.IsInstalled = () => DbHandle() !== 0;
            })(SkimpifyFramework || (SkimpifyFramework = {}));
            exports_19("SkimpifyFramework", SkimpifyFramework);
            exports_19("GetAllSkimpy", GetAllSkimpy = (a) => GetAll(a, GetSkimpyData, GetModestData));
            exports_19("GetAllModest", GetAllModest = (a) => GetAll(a, GetModestData, GetSkimpyData));
            exports_19("HasSlip", HasSlip = (a) => GetSkimpyType(a) === "slip");
            exports_19("GetSlip", GetSlip = (a) => NextByType(a, "slip"));
            exports_19("HasChange", HasChange = (a) => GetSkimpyType(a) === "change");
            exports_19("GetChange", GetChange = (a) => NextByType(a, "change"));
            exports_19("HasDamage", HasDamage = (a) => GetSkimpyType(a) === "damage");
            exports_19("GetDamage", GetDamage = (a) => NextByType(a, "damage"));
            exports_19("HasModest", HasModest = (a) => HasKey(a, "prev"));
            exports_19("IsSkimpy", IsSkimpy = HasModest);
            exports_19("HasSkimpy", HasSkimpy = (a) => HasKey(a, "next"));
            exports_19("IsModest", IsModest = HasSkimpy);
            exports_19("IsRegistered", IsRegistered = (a) => HasSkimpy(a) || HasModest(a));
            exports_19("IsNotRegistered", IsNotRegistered = (a) => !HasSkimpy(a) && !HasModest(a));
            exports_19("SwapToSlip", SwapToSlip = (act, modestArmor) => SwapToSkimpy(act, modestArmor, GetSlip));
            exports_19("SwapToChange", SwapToChange = (act, modestArmor) => SwapToSkimpy(act, modestArmor, GetChange));
            exports_19("SwapToDamage", SwapToDamage = (act, modestArmor) => SwapToSkimpy(act, modestArmor, GetDamage));
            exports_19("CanUseArmor", CanUseArmor = (act) => Actor_1.isActorTypeNPC(act));
            exports_19("defaultType", defaultType = "change");
            exports_19("DbHandle", DbHandle = () => JDB.solveObj(fwKey));
            exports_19("cfgDir", cfgDir = "data/SKSE/Plugins/Skimpify Framework/");
            fwKey = ".Skimpify-Framework";
            chestPath = `${fwKey}-globalChests`;
            ArmorK = (k) => `${fwKey}.${k}`;
            ChangeK = (k) => `${ArmorK(k)}T`;
            exports_19("JcChangeK", JcChangeK = (k) => `${k}T`);
            exports_19("ClearDB", ClearDB = () => JDB.setObj(fwKey, 0));
            exports_19("SetRel", SetRel = (a1, a2, r, c) => {
                JFormDB.solveFormSetter(a1, ArmorK(r), a2, true);
                JFormDB.solveStrSetter(a1, ChangeK(r), c, true);
            });
            HasKey = (a, r) => !a ? false : JFormDB.solveForm(a, ArmorK(r)) !== null;
            exports_19("ValidateChangeRel", ValidateChangeRel = (rel) => rel.toLowerCase() === "slip"
                ? "slip"
                : rel.toLowerCase() === "damage"
                    ? "damage"
                    : defaultType);
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/src/debug", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Log"], function (exports_20, context_20) {
    "use strict";
    var Log, L, fs, LogN, LogNT, LogI, LogIT, LogV, LogVT;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (Log_2) {
                Log = Log_2;
            }
        ],
        execute: function () {
            L = Log;
            fs = Log.CreateAll("SkimpifyFramework", L.Level.info, L.ConsoleFmt, L.FileFmt);
            exports_20("LogN", LogN = fs.None);
            exports_20("LogNT", LogNT = fs.TapN);
            exports_20("LogI", LogI = fs.Info);
            exports_20("LogIT", LogIT = fs.TapI);
            exports_20("LogV", LogV = fs.Verbose);
            exports_20("LogVT", LogVT = fs.TapV);
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/src/genJson", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Form", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Log", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JTs", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/PapyrusUtil/MiscUtil", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skimpify-api", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform", "Skyrim SE/MO2/mods/Skimpify Framework-src/src/debug"], function (exports_21, context_21) {
    "use strict";
    var Form_3, Log, JTs_1, MiscUtil_1, skimpify_api_1, skyrimPlatform_8, debug_1, LogR, AddVal, ArmorUniqueId, GetUniqueId, AddKey, autoN, skimpyNames;
    var __moduleName = context_21 && context_21.id;
    function SaveJson() {
        const m = new Map();
        JTs_1.JFormMapL.ForAllKeys(skimpify_api_1.DbHandle(), (k) => {
            var _a;
            const a = skyrimPlatform_8.Armor.from(k);
            if (!a)
                return;
            const n = skimpify_api_1.GetSkimpyData(a);
            if (!n.armor)
                return;
            const curr = Form_3.getEspAndId(a);
            AddKey(curr.modName, m);
            AddVal(curr.modName, m, {
                uId: GetUniqueId(curr.modName, curr.fixedFormId),
                data: {
                    name: a.getName(),
                    next: ArmorUniqueId(n.armor),
                    nextN: (_a = n.armor) === null || _a === void 0 ? void 0 : _a.getName(),
                    nextT: n.armor ? n.kind : undefined,
                },
            });
        });
        OutputMapToJSon(m);
    }
    exports_21("SaveJson", SaveJson);
    function AutoGenArmors() {
        debug_1.LogN("\n");
        debug_1.LogN("=================================");
        debug_1.LogN("Generating armors for exporting");
        debug_1.LogN("=================================");
        autoN = 0;
        GenSkimpyGroupsByName(GetInventoryArmors());
        skyrimPlatform_8.Debug.messageBox(`Data for ${autoN} pairs of armors in inventory has been automatically generated.

  Now you can test in game if things are as you expected, then you can export them to json.`);
    }
    exports_21("AutoGenArmors", AutoGenArmors);
    function GetInventoryArmors() {
        debug_1.LogN("Armors in inventory:\n");
        const r = new Array();
        Form_3.forEachArmorR(skyrimPlatform_8.Game.getPlayer(), (a) => {
            const d = ArmorToData(a);
            if (d)
                r.push(d);
        });
        const rr = r.map((v) => {
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
            };
        });
        return rr.sort((a, b) => a.name.localeCompare(b.name));
    }
    function ArmorToData(a) {
        const L = (uID) => `${uID}\n`;
        if (!a.isPlayable() || a.getName() === "")
            return null;
        const info = Form_3.getEspAndId(a);
        return {
            esp: info.modName,
            name: debug_1.LogNT("", a.getName()),
            id: info.fixedFormId,
            armor: a,
            uId: debug_1.LogNT("", GetUniqueId(info.modName, info.fixedFormId), L),
        };
    }
    function PreprocessName(n, search) {
        const i = n.indexOf(search);
        if (i < 0)
            return n;
        const s = new RegExp(`\\s*${search}`);
        const m = n.match(s);
        if (!m)
            return n;
        const m0 = m[0];
        const mx = n.split(s).join("") + m0;
        debug_1.LogV(`Armor name was rearranged because it may be a variant`);
        debug_1.LogV(`Original: ${n}`);
        debug_1.LogV(`Rearranged: ${mx}\n`);
        return mx;
    }
    function FindPreprocessed(n) {
        const o = n.toLowerCase();
        for (const e of skimpyNames) {
            const nn = PreprocessName(o, e.search);
            if (nn !== o)
                return nn;
        }
        return debug_1.LogVT("Armor name didn't need preprocess\n", o);
    }
    function GenSkimpyGroupsByName(armors) {
        let output = new Map();
        while (armors.length > 1) {
            let matches = new Array();
            matches.push(armors[0]);
            const n = armors[0].name;
            while (armors.length > 1 && armors[1].name.indexOf(n) >= 0) {
                matches.push(armors.splice(1, 1)[0]);
            }
            ProcessMatches(matches, output);
            armors.shift();
        }
        return output;
    }
    function ProcessMatches(m, output) {
        const n = m.length;
        if (n < 2)
            return;
        debug_1.LogI("These armors seem to be variants");
        debug_1.LogI("=================================");
        const l = debug_1.LogVT("Base name length", m[0].name.length);
        m = m.sort((a, b) => a.name.length - b.name.length);
        m.forEach((a, i) => debug_1.LogV(`${a.name}${i === n - 1 ? "\n" : ""}`));
        const TestWord = (s, rel = "change") => {
            let fIdx = 0;
            const CheckFor = (s) => m.slice(1).some((a, i) => {
                const t = a.name.toLowerCase().indexOf(s, l) > -1;
                fIdx = t ? i + 1 : 0;
                return t;
            });
            if (!CheckFor(s))
                return false;
            debug_1.LogI(`*** ${m[fIdx].name} is a(n) "${s}" variant.\n`);
            MakeChild(m[0], m[fIdx], rel, output);
            const b = m.splice(fIdx, 1);
            m.splice(0, 1);
            ProcessMatches(b.concat(m), output);
            return true;
        };
        for (const e of skimpyNames)
            if (TestWord(e.search, e.rel))
                return;
        debug_1.LogI(`--- No relationship found between elements in this list.`);
        debug_1.LogI("Did this framework's author forget to check for some particular word?\n");
    }
    function ChangeExists(p, c, r) {
        const { armor, kind } = skimpify_api_1.GetSkimpyData(p.armor);
        const L = () => {
            debug_1.LogI(`-- Relationship changed from ${p.name} -> ${armor === null || armor === void 0 ? void 0 : armor.getName()}. To ${p.name} -> ${c.name}`);
        };
        if (armor && armor.getFormID() !== c.armor.getFormID())
            return LogR(L(), r);
        return kind && kind !== skimpify_api_1.defaultType ? kind : r;
    }
    function MakeChild(parent, child, relationship, output, saveToMem = true) {
        const ch = ChangeExists(parent, child, relationship);
        parent.next = child.uId;
        parent.nextT = ch;
        child.prev = parent.uId;
        child.prevT = ch;
        if (saveToMem)
            skimpify_api_1.AddChangeRel(parent.armor, child.armor, ch);
        autoN++;
        debug_1.LogI(`${child.name} is now registered as a skimpy version of ${parent.name}. Change type: ${ch}.\n`);
    }
    function OutputMapToJSon(m) {
        const Transform = (x) => {
            const o = x.map((v) => {
                return {
                    name: v.data.name,
                    next: v.data.next,
                    nextN: v.data.nextN,
                    nextT: v.data.nextT,
                    prev: v.data.prev,
                    prevN: v.data.prevN,
                    prevT: v.data.prevT,
                };
            });
            const oo = {};
            for (const i in o)
                oo[x[i].uId] = o[i];
            return JSON.stringify(oo, undefined, 2);
        };
        for (const e of m.entries()) {
            const f = `${skimpify_api_1.cfgDir}${e[0]}.json`;
            MiscUtil_1.WriteToFile(f, Transform(e[1]), false, false);
        }
        skyrimPlatform_8.Debug.messageBox(`All data was saved to their respective Json files in "data/SKSE/Plugins/Skimpify Framework".`);
    }
    return {
        setters: [
            function (Form_3_1) {
                Form_3 = Form_3_1;
            },
            function (Log_3) {
                Log = Log_3;
            },
            function (JTs_1_1) {
                JTs_1 = JTs_1_1;
            },
            function (MiscUtil_1_1) {
                MiscUtil_1 = MiscUtil_1_1;
            },
            function (skimpify_api_1_1) {
                skimpify_api_1 = skimpify_api_1_1;
            },
            function (skyrimPlatform_8_1) {
                skyrimPlatform_8 = skyrimPlatform_8_1;
            },
            function (debug_1_1) {
                debug_1 = debug_1_1;
            }
        ],
        execute: function () {
            LogR = Log.R;
            AddVal = (esp, m, v) => {
                const k = esp;
                const a = m.get(k);
                a.push(v);
                m.set(k, a);
            };
            ArmorUniqueId = (a) => !a ? undefined : Form_3.getUniqueId(a, GetUniqueId);
            GetUniqueId = (esp, fixedFormId) => `${esp}|${fixedFormId.toString(16)}`;
            AddKey = (k, output) => {
                if (!output.has(k))
                    output.set(k, []);
            };
            autoN = 0;
            skimpyNames = [
                { search: "slutty", rel: "change" },
                { search: "slut", rel: "change" },
                { search: "xtra", rel: "change" },
                { search: "naked", rel: "change" },
                { search: "nude", rel: "change" },
                { search: "topless", rel: "change" },
                { search: "sex", rel: "change" },
                { search: "damaged", rel: "damage" },
                { search: "damage", rel: "damage" },
                { search: "broken", rel: "damage" },
                { search: "broke", rel: "damage" },
            ];
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/src/spells/types/keywords", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Form", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_22, context_22) {
    "use strict";
    var Form_4, skyrimPlatform_9, keywords, getKeyword;
    var __moduleName = context_22 && context_22.id;
    function initKeywords() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
        new Array({
            k: "Skimpy_CoverSpeechAss",
            id: (_a = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x82F")) === null || _a === void 0 ? void 0 : _a.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechAss_04",
            id: (_b = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x82E")) === null || _b === void 0 ? void 0 : _b.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechAss_03",
            id: (_c = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x82D")) === null || _c === void 0 ? void 0 : _c.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechAss_02",
            id: (_d = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x82C")) === null || _d === void 0 ? void 0 : _d.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechAss_01",
            id: (_e = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x82B")) === null || _e === void 0 ? void 0 : _e.getFormID(),
        }, {
            k: "Skimpy_CoverSpeechPubis",
            id: (_f = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x82A")) === null || _f === void 0 ? void 0 : _f.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechPubis_04",
            id: (_g = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x829")) === null || _g === void 0 ? void 0 : _g.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechPubis_03",
            id: (_h = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x828")) === null || _h === void 0 ? void 0 : _h.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechPubis_02",
            id: (_j = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x827")) === null || _j === void 0 ? void 0 : _j.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechPubis_01",
            id: (_k = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x826")) === null || _k === void 0 ? void 0 : _k.getFormID(),
        }, {
            k: "Skimpy_CoverSpeechBoobs",
            id: (_l = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x825")) === null || _l === void 0 ? void 0 : _l.getFormID(),
        }, {
            k: "Skimpy_CoverCombatAss",
            id: (_m = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x824")) === null || _m === void 0 ? void 0 : _m.getFormID(),
        }, {
            k: "Skimpy_ExposeCombatAss_03",
            id: (_o = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x823")) === null || _o === void 0 ? void 0 : _o.getFormID(),
        }, {
            k: "Skimpy_ExposeCombatAss_02",
            id: (_p = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x822")) === null || _p === void 0 ? void 0 : _p.getFormID(),
        }, {
            k: "Skimpy_ExposeCombatAss_01",
            id: (_q = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x821")) === null || _q === void 0 ? void 0 : _q.getFormID(),
        }, {
            k: "Skimpy_CoverCombatPubis",
            id: (_r = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x820")) === null || _r === void 0 ? void 0 : _r.getFormID(),
        }, {
            k: "Skimpy_ExposeCombatPubis_03",
            id: (_s = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x81F")) === null || _s === void 0 ? void 0 : _s.getFormID(),
        }, {
            k: "Skimpy_ExposeCombatPubis_02",
            id: (_t = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x81E")) === null || _t === void 0 ? void 0 : _t.getFormID(),
        }, {
            k: "Skimpy_ExposeCombatPubis_01",
            id: (_u = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x81D")) === null || _u === void 0 ? void 0 : _u.getFormID(),
        }, {
            k: "Skimpy_CoverCombatBoobs",
            id: (_v = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x81C")) === null || _v === void 0 ? void 0 : _v.getFormID(),
        }, {
            k: "Skimpy_ExposeCombatBoobs_03",
            id: (_w = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x813")) === null || _w === void 0 ? void 0 : _w.getFormID(),
        }, {
            k: "Skimpy_ExposeCombatBoobs_02",
            id: (_x = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x812")) === null || _x === void 0 ? void 0 : _x.getFormID(),
        }, {
            k: "Skimpy_ExposeCombatBoobs_01",
            id: (_y = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x811")) === null || _y === void 0 ? void 0 : _y.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechBoobs_04",
            id: (_z = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x810")) === null || _z === void 0 ? void 0 : _z.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechBoobs_03",
            id: (_0 = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x80F")) === null || _0 === void 0 ? void 0 : _0.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechBoobs_02",
            id: (_1 = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x80E")) === null || _1 === void 0 ? void 0 : _1.getFormID(),
        }, {
            k: "Skimpy_ExposeSpeechBoobs_01",
            id: (_2 = Form_4.getFormFromUniqueId("Skimpify Enchantments.esp|0x804")) === null || _2 === void 0 ? void 0 : _2.getFormID(),
        })
            .filter((v) => v.id)
            .iter((v) => {
            var _a;
            keywords.set(v.k, (_a = v.id) !== null && _a !== void 0 ? _a : 0);
        });
    }
    exports_22("initKeywords", initKeywords);
    function keywordCount(a, keyword) {
        const k = getKeyword(keyword);
        if (!k)
            return 0;
        let count = 0;
        Form_4.ForEachEquippedArmor(a, (armor) => {
            count += armor.hasKeyword(k) ? 1 : 0;
        });
        return count;
    }
    exports_22("keywordCount", keywordCount);
    return {
        setters: [
            function (Form_4_1) {
                Form_4 = Form_4_1;
            },
            function (skyrimPlatform_9_1) {
                skyrimPlatform_9 = skyrimPlatform_9_1;
            }
        ],
        execute: function () {
            keywords = new Map();
            exports_22("getKeyword", getKeyword = (keyword) => { var _a; return skyrimPlatform_9.Keyword.from(skyrimPlatform_9.Game.getFormEx((_a = keywords.get(keyword)) !== null && _a !== void 0 ? _a : 0)); });
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/src/spells/types/spells", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Form", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_23, context_23) {
    "use strict";
    var Form_5, skyrimPlatform_10, spells, getSpell;
    var __moduleName = context_23 && context_23.id;
    function initSpells() {
        var _a, _b, _c, _d, _e, _f, _g;
        new Array({
            k: "Skimpy_CombatSpellNC_01",
            id: (_a = Form_5.getFormFromUniqueId("Skimpify Enchantments.esp|0xD99")) === null || _a === void 0 ? void 0 : _a.getFormID(),
        }, {
            k: "Skimpy_CombatSpellNC_02",
            id: (_b = Form_5.getFormFromUniqueId("Skimpify Enchantments.esp|0xD9A")) === null || _b === void 0 ? void 0 : _b.getFormID(),
        }, {
            k: "Skimpy_CombatSpellNC_03",
            id: (_c = Form_5.getFormFromUniqueId("Skimpify Enchantments.esp|0xD9B")) === null || _c === void 0 ? void 0 : _c.getFormID(),
        }, {
            k: "Skimpy_SpeechSpellNC_01",
            id: (_d = Form_5.getFormFromUniqueId("Skimpify Enchantments.esp|0xD9C")) === null || _d === void 0 ? void 0 : _d.getFormID(),
        }, {
            k: "Skimpy_SpeechSpellNC_02",
            id: (_e = Form_5.getFormFromUniqueId("Skimpify Enchantments.esp|0xD9D")) === null || _e === void 0 ? void 0 : _e.getFormID(),
        }, {
            k: "Skimpy_SpeechSpellNC_03",
            id: (_f = Form_5.getFormFromUniqueId("Skimpify Enchantments.esp|0xD9E")) === null || _f === void 0 ? void 0 : _f.getFormID(),
        }, {
            k: "Skimpy_SpeechSpellNC_04",
            id: (_g = Form_5.getFormFromUniqueId("Skimpify Enchantments.esp|0xD9F")) === null || _g === void 0 ? void 0 : _g.getFormID(),
        })
            .filter((v) => v.id)
            .iter((v) => {
            var _a;
            spells.set(v.k, (_a = v.id) !== null && _a !== void 0 ? _a : 0);
        });
    }
    exports_23("initSpells", initSpells);
    return {
        setters: [
            function (Form_5_1) {
                Form_5 = Form_5_1;
            },
            function (skyrimPlatform_10_1) {
                skyrimPlatform_10 = skyrimPlatform_10_1;
            }
        ],
        execute: function () {
            spells = new Map();
            exports_23("getSpell", getSpell = (spell) => { var _a; return skyrimPlatform_10.Spell.from(skyrimPlatform_10.Game.getFormEx((_a = spells.get(spell)) !== null && _a !== void 0 ? _a : 0)); });
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/src/spells/functions", ["Skyrim SE/MO2/mods/Skimpify Framework-src/src/spells/types/keywords", "Skyrim SE/MO2/mods/Skimpify Framework-src/src/spells/types/spells"], function (exports_24, context_24) {
    "use strict";
    var keywords_1, spells_1, getCombatShowingLvl, isShowingCombatBoobs, isShowingCombatAss, isShowingCombatPubis, getSpeechShowingLvl, isShowingSpeechBoobs, isShowingSpeechAss, isShowingSpeechPubis;
    var __moduleName = context_24 && context_24.id;
    function init() {
        keywords_1.initKeywords();
        spells_1.initSpells();
    }
    exports_24("init", init);
    function setSkimpySpells(a) {
        setCombatSpell(a);
        setSpeechSpell(a);
    }
    exports_24("setSkimpySpells", setSkimpySpells);
    function setCombatSpell(a) {
        const lvl = getCombatShowingLvl(a);
        const sp1 = spells_1.getSpell("Skimpy_CombatSpellNC_01");
        const sp2 = spells_1.getSpell("Skimpy_CombatSpellNC_02");
        const sp3 = spells_1.getSpell("Skimpy_CombatSpellNC_03");
        switch (lvl.lvl) {
            case 0:
                a.removeSpell(sp1);
                a.removeSpell(sp2);
                a.removeSpell(sp3);
                break;
            case 1:
                a.removeSpell(sp2);
                a.removeSpell(sp3);
                a.addSpell(sp1, false);
                break;
            case 2:
                a.removeSpell(sp1);
                a.removeSpell(sp3);
                a.addSpell(sp2, false);
                break;
            case 3:
                a.removeSpell(sp1);
                a.removeSpell(sp2);
                a.addSpell(sp3, false);
                break;
        }
    }
    function setSpeechSpell(a) {
        const lvl = getSpeechShowingLvl(a);
        const sp1 = spells_1.getSpell("Skimpy_SpeechSpellNC_01");
        const sp2 = spells_1.getSpell("Skimpy_SpeechSpellNC_02");
        const sp3 = spells_1.getSpell("Skimpy_SpeechSpellNC_03");
        const sp4 = spells_1.getSpell("Skimpy_SpeechSpellNC_04");
        switch (lvl.lvl) {
            case 0:
                a.removeSpell(sp1);
                a.removeSpell(sp2);
                a.removeSpell(sp3);
                a.removeSpell(sp4);
                break;
            case 1:
                a.removeSpell(sp2);
                a.removeSpell(sp3);
                a.removeSpell(sp4);
                a.addSpell(sp1, false);
                break;
            case 2:
                a.removeSpell(sp1);
                a.removeSpell(sp3);
                a.removeSpell(sp4);
                a.addSpell(sp2, false);
                break;
            case 3:
                a.removeSpell(sp1);
                a.removeSpell(sp2);
                a.removeSpell(sp4);
                a.addSpell(sp3, false);
                break;
            case 4:
                a.removeSpell(sp1);
                a.removeSpell(sp2);
                a.removeSpell(sp3);
                a.addSpell(sp4, false);
                break;
        }
    }
    function isShowing(a, l4, l3, l2, l1, cover) {
        if (keywords_1.keywordCount(a, cover) > 0)
            return { key: cover, lvl: 0 };
        return keywords_1.keywordCount(a, l4) > 0
            ? { key: l4, lvl: 4 }
            : keywords_1.keywordCount(a, l3) > 0
                ? { key: l3, lvl: 3 }
                : keywords_1.keywordCount(a, l2) > 0
                    ? { key: l2, lvl: 2 }
                    : keywords_1.keywordCount(a, l1) > 0
                        ? { key: l1, lvl: 1 }
                        : { key: cover, lvl: 0 };
    }
    return {
        setters: [
            function (keywords_1_1) {
                keywords_1 = keywords_1_1;
            },
            function (spells_1_1) {
                spells_1 = spells_1_1;
            }
        ],
        execute: function () {
            getCombatShowingLvl = (a) => new Array(isShowingCombatBoobs(a), isShowingCombatAss(a), isShowingCombatPubis(a)).maxBy((a, b) => a.lvl - b.lvl);
            isShowingCombatBoobs = (a) => isShowing(a, "Skimpy_DontCare", "Skimpy_ExposeCombatBoobs_03", "Skimpy_ExposeCombatBoobs_02", "Skimpy_ExposeCombatBoobs_01", "Skimpy_CoverCombatBoobs");
            isShowingCombatAss = (a) => isShowing(a, "Skimpy_DontCare", "Skimpy_ExposeCombatAss_03", "Skimpy_ExposeCombatAss_02", "Skimpy_ExposeCombatAss_01", "Skimpy_CoverCombatAss");
            isShowingCombatPubis = (a) => isShowing(a, "Skimpy_DontCare", "Skimpy_ExposeCombatPubis_03", "Skimpy_ExposeCombatPubis_02", "Skimpy_ExposeCombatPubis_01", "Skimpy_CoverCombatPubis");
            getSpeechShowingLvl = (a) => new Array(isShowingSpeechBoobs(a), isShowingSpeechAss(a), isShowingSpeechPubis(a)).maxBy((a, b) => a.lvl - b.lvl);
            isShowingSpeechBoobs = (a) => isShowing(a, "Skimpy_ExposeSpeechBoobs_04", "Skimpy_ExposeSpeechBoobs_03", "Skimpy_ExposeSpeechBoobs_02", "Skimpy_ExposeSpeechBoobs_01", "Skimpy_CoverSpeechBoobs");
            isShowingSpeechAss = (a) => isShowing(a, "Skimpy_ExposeSpeechAss_04", "Skimpy_ExposeSpeechAss_03", "Skimpy_ExposeSpeechAss_02", "Skimpy_ExposeSpeechAss_01", "Skimpy_CoverSpeechAss");
            isShowingSpeechPubis = (a) => isShowing(a, "Skimpy_ExposeSpeechPubis_04", "Skimpy_ExposeSpeechPubis_03", "Skimpy_ExposeSpeechPubis_02", "Skimpy_ExposeSpeechPubis_01", "Skimpy_CoverSpeechPubis");
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/src/entry", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Actor", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Form", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Hotkeys", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Log", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/Misc", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib/typescript/Array", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JDB", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JMap", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JTs", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JValue", "Skyrim SE/MO2/mods/Skimpify Framework-src/src/genJson", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skimpify-api", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform", "Skyrim SE/MO2/mods/Skimpify Framework-src/src/debug", "Skyrim SE/MO2/mods/Skimpify Framework-src/src/spells/functions"], function (exports_25, context_25) {
    "use strict";
    var Actor_2, Form_6, Hk, Log, Misc_1, JDB, JMap, JTs_2, JValue, genJson_1, skimpify_api_2, skyrimPlatform_11, debug_2, functions_1, invalid, initK, MarkInitialized, WasInitialized, storeK, MemOnly, SK, kIni, kMModest, SIni, SMModest, allowInit, mModest, n, develop, unintrusiveMessages, usingSkimpifyEnchantments, hk, FO, HK, ShowMessage, PlayerF, Armors, Load, Mark;
    var __moduleName = context_25 && context_25.id;
    function main() {
        skyrimPlatform_11.on("loadGame", () => {
            InitPlugin();
            allowInit = SIni(true);
        });
        skyrimPlatform_11.once("update", () => {
            if (allowInit || !WasInitialized())
                InitPlugin();
            if (usingSkimpifyEnchantments) {
                functions_1.init();
                functions_1.setSkimpySpells(Actor_2.Player());
                skyrimPlatform_11.on("equip", (e) => {
                    if (e.actor.getFormID() !== Actor_2.playerId)
                        return;
                    const a = skyrimPlatform_11.Actor.from(e.actor);
                    if (!a)
                        return;
                    functions_1.setSkimpySpells(a);
                });
            }
        });
        function InitPlugin() {
            Load.Armors();
            MarkInitialized();
        }
        const OnLoadJson = HK("loadJson");
        const OnSaveJson = HK("saveJson");
        const OnAutoGen = HK("autoGen");
        const OnMarkClear = HK("markClear");
        const OnMarkModest = HK("markModest");
        const OnMarkSlip = HK("markSlip");
        const OnMarkChange = HK("markChange");
        const OnMarkDamage = HK("markDamage");
        const OnDebugEquipped = HK("debugEquipped");
        const OnDump = HK("dump");
        const OnDiscardArmors = HK("deleteAllArmors");
        const OnAllSkimpy = HK("allSkimpy");
        const OnAllModest = HK("allModest");
        const OnUnequipAll = HK("unequipAll1");
        const OnUnequipAll2 = HK("unequipAll2");
        const OnTest = HK("test");
        skyrimPlatform_11.on("update", () => {
            OnLoadJson(Load.Armors);
            OnSaveJson(genJson_1.SaveJson);
            OnAutoGen(genJson_1.AutoGenArmors);
            OnMarkModest(Mark.Modest);
            OnMarkClear(Mark.Clear);
            OnMarkSlip(Mark.Slip);
            OnMarkChange(Mark.Change);
            OnMarkDamage(Mark.Damage);
            OnDebugEquipped(Mark.DebugOne);
            OnDump(Dump);
            OnDiscardArmors(Armors.Discard);
            OnAllSkimpy(Armors.AllSkimpy);
            OnAllModest(Armors.AllModest);
            OnUnequipAll(Armors.UnequipAll);
            OnUnequipAll2(Armors.UnequipAll);
            OnTest(RunTest);
        });
        const i = develop ? " in DEVELOPER MODE" : "";
        skyrimPlatform_11.printConsole(`Skimpify Framework successfully initialized${i}.`);
    }
    exports_25("main", main);
    function RunTest() {
        PlayerF.Reveal();
    }
    function Dump() {
        const f = `${skimpify_api_2.cfgDir}dump/dump.json`;
        JValue.writeToFile(skimpify_api_2.DbHandle(), f);
        JDB.writeToFile(`${skimpify_api_2.cfgDir}dump/dump all.json`);
        ShowMessage(`File was dumped to ${f}`);
    }
    return {
        setters: [
            function (Actor_2_1) {
                Actor_2 = Actor_2_1;
            },
            function (Form_6_1) {
                Form_6 = Form_6_1;
            },
            function (Hk_1) {
                Hk = Hk_1;
            },
            function (Log_4) {
                Log = Log_4;
            },
            function (Misc_1_1) {
                Misc_1 = Misc_1_1;
            },
            function (_1) {
            },
            function (JDB_2) {
                JDB = JDB_2;
            },
            function (JMap_2) {
                JMap = JMap_2;
            },
            function (JTs_2_1) {
                JTs_2 = JTs_2_1;
            },
            function (JValue_1) {
                JValue = JValue_1;
            },
            function (genJson_1_1) {
                genJson_1 = genJson_1_1;
            },
            function (skimpify_api_2_1) {
                skimpify_api_2 = skimpify_api_2_1;
            },
            function (skyrimPlatform_11_1) {
                skyrimPlatform_11 = skyrimPlatform_11_1;
            },
            function (debug_2_1) {
                debug_2 = debug_2_1;
            },
            function (functions_1_1) {
                functions_1 = functions_1_1;
            }
        ],
        execute: function () {
            invalid = -1;
            initK = ".DmPlugins.Skimpify.init";
            MarkInitialized = () => JDB.solveBoolSetter(initK, true, true);
            WasInitialized = () => JDB.solveBool(initK, false);
            storeK = "Skimpify-FW-";
            MemOnly = () => { };
            SK = (k) => `${storeK}${k}`;
            kIni = SK("init");
            kMModest = SK("mmodest");
            SIni = Misc_1.preserveVar(MemOnly, kIni);
            SMModest = Misc_1.preserveVar(MemOnly, kMModest);
            allowInit = skyrimPlatform_11.storage[kIni] || false;
            mModest = skyrimPlatform_11.storage[kMModest];
            n = "skimpify-framework";
            develop = skyrimPlatform_11.settings[n]["developerMode"];
            unintrusiveMessages = skyrimPlatform_11.settings[n]["unintrusiveMessages"];
            usingSkimpifyEnchantments = skyrimPlatform_11.settings[n]["usingSkimpifyEnchantments"];
            hk = "devHotkeys";
            FO = (k) => Hk.FromObject(n, hk, k);
            HK = (k) => Hk.ListenTo(FO(k), develop);
            ShowMessage = unintrusiveMessages ? skyrimPlatform_11.Debug.notification : skyrimPlatform_11.Debug.messageBox;
            (function (PlayerF) {
                const SkimpyAt = (a) => {
                    if (skimpify_api_2.HasSlip(a))
                        return "slip";
                    if (skimpify_api_2.HasChange(a))
                        return "change";
                    return undefined;
                };
                const TrySkimpify = (slot) => {
                    const p = Actor_2.Player();
                    const a = skyrimPlatform_11.Armor.from(p.getWornForm(slot));
                    const t = SkimpyAt(a);
                    if (!t)
                        return false;
                    if (t === "slip")
                        skimpify_api_2.SwapToSlip(p, a);
                    if (t === "change")
                        skimpify_api_2.SwapToChange(p, a);
                };
                function Reveal() {
                    if (TrySkimpify(4))
                        return;
                    if (TrySkimpify(524288))
                        return;
                    if (TrySkimpify(4194304))
                        return;
                    Form_6.ForEachSlotMask(Actor_2.Player(), (slot) => TrySkimpify(slot));
                }
                PlayerF.Reveal = Reveal;
            })(PlayerF || (PlayerF = {}));
            (function (Armors) {
                function UnequipAll() {
                    const pl = skyrimPlatform_11.Game.getPlayer();
                    const aa = Form_6.GetEquippedArmors(pl);
                    aa.forEach((a) => {
                        pl.unequipItem(a, false, true);
                    });
                }
                Armors.UnequipAll = UnequipAll;
                Armors.SwapArmor = (act, from, to) => {
                    act.unequipItem(from, false, true);
                    act.equipItem(to, false, true);
                };
                Armors.AllSkimpy = () => ChangeAll(skimpify_api_2.GetAllSkimpy);
                Armors.AllModest = () => ChangeAll(skimpify_api_2.GetAllModest);
                function ChangeAll(f) {
                    const pl = skyrimPlatform_11.Game.getPlayer();
                    const aa = f(pl);
                    aa.current.forEach((a, i) => {
                        Armors.SwapArmor(pl, a.armor, aa.next[i].armor);
                        if (a.kind)
                            skyrimPlatform_11.Debug.notification(a.kind);
                    });
                }
                function Discard() {
                    const p = skyrimPlatform_11.Game.getPlayer();
                    Form_6.forEachArmorR(p, (a) => {
                        p.removeItem(a, p.getItemCount(a), true, null);
                    });
                    ShowMessage(`All armors in the player inventory were deleted.`);
                }
                Armors.Discard = Discard;
            })(Armors || (Armors = {}));
            (function (Load) {
                function Armors() {
                    const d = JValue.readFromDirectory(skimpify_api_2.cfgDir, ".json");
                    let n = 0;
                    JTs_2.JMapL.ForAllKeys(d, (k) => {
                        const fileO = JMap.getObj(d, k);
                        JTs_2.JMapL.ForAllKeys(fileO, (armor, i) => {
                            const a = StrToArmor(armor);
                            if (!a)
                                return;
                            n++;
                            const data = JMap.getObj(i, armor);
                            SaveVariant(a, data, "next");
                        });
                    });
                    const f = JMap.count(d);
                    const m = `File loading completed.
    ${n} armors were read from ${f} files.`;
                    if (develop)
                        ShowMessage(m);
                    skyrimPlatform_11.printConsole(m);
                }
                Load.Armors = Armors;
                function SaveVariant(parent, data, rel) {
                    const n = StrToArmor(JMap.getStr(data, rel));
                    if (!n)
                        return;
                    const c = JMap.getStr(data, skimpify_api_2.JcChangeK(rel));
                    const cT = skimpify_api_2.ValidateChangeRel(c);
                    skimpify_api_2.AddChangeRel(parent, n, cT);
                }
                function StrToArmor(s) {
                    if (!s)
                        return null;
                    const [esp, id] = s.split("|");
                    const f = skyrimPlatform_11.Game.getFormFromFile(parseInt(id, 16), esp);
                    return skyrimPlatform_11.Armor.from(f);
                }
            })(Load || (Load = {}));
            (function (Mark) {
                function OnlyOneArmor(Continue) {
                    const aa = Form_6.GetEquippedArmors(skyrimPlatform_11.Game.getPlayer());
                    aa.forEach((v) => debug_2.LogV(`${Log.IntToHex(v.getFormID())}. Slot: ${v.getSlotMask()}. Name: ${v.getName()}`));
                    if (aa.length !== 1) {
                        ShowMessage(`This functionality only works with just one piece of armor equipped.
        Equip only the piece you want to work on.`);
                        return;
                    }
                    Continue(aa[0]);
                }
                function Child(c) {
                    OnlyOneArmor((a) => {
                        const ShowInvalid = () => {
                            const m = `Can't create a Change Relationship because a modest version for this armor hasn't been set.

        Please mark one by using the "hkMarkModest" hotkey when having such armor equipped.`;
                            ShowMessage(m);
                        };
                        if (mModest === invalid)
                            return ShowInvalid();
                        const p = skyrimPlatform_11.Armor.from(skyrimPlatform_11.Game.getFormEx(mModest));
                        if (!p)
                            return ShowInvalid();
                        skimpify_api_2.AddChangeRel(p, a, c);
                        const m = `"${a.getName()}" was added as a skimpier version of ${p.getName()} with Change Relationship "${c}"`;
                        ShowMessage(m);
                        mModest = SMModest(invalid);
                    });
                }
                Mark.Slip = () => Child("slip");
                Mark.Change = () => Child("change");
                Mark.Damage = () => Child("damage");
                function Modest() {
                    OnlyOneArmor((a) => {
                        const m = `"${a.getName()}" was marked as a modest version of some armor.
      Mark another piece to create a Change Relationship.`;
                        ShowMessage(m);
                        mModest = debug_2.LogVT("Manual mode. Modest armor id", SMModest(a.getFormID()), Log.IntToHex);
                    });
                }
                Mark.Modest = Modest;
                function Clear() {
                    OnlyOneArmor((a) => {
                        skimpify_api_2.ClearChangeRel(a);
                        const m = `"${a.getName()}" was cleared from all its Change Relationships.`;
                        ShowMessage(m);
                    });
                }
                Mark.Clear = Clear;
                function DebugOne() {
                    OnlyOneArmor((a) => {
                        const M = (d, r) => {
                            var _a;
                            return `Its ${r} version is "${(_a = d.armor) === null || _a === void 0 ? void 0 : _a.getName()}". 
        Change Relationship type: "${d.kind}".`;
                        };
                        const p = skimpify_api_2.GetModestData(a);
                        const pm = p.armor ? M(p, "modest") : "";
                        const c = skimpify_api_2.GetSkimpyData(a);
                        const cm = c.armor ? M(c, "skimpy") : "";
                        const am = (pm + (pm && cm ? "\n" : "") + cm).trim();
                        const fm = am
                            ? am
                            : "This has no recognized variant. If it should, consider to manually create a Change Relationship.";
                        const m = `Armor: ${a.getName()}.
      
      ${fm}`;
                        debug_2.LogV(m);
                        ShowMessage(m);
                    });
                }
                Mark.DebugOne = DebugOne;
            })(Mark || (Mark = {}));
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/index", ["Skyrim SE/MO2/mods/Skimpify Framework-src/src/entry"], function (exports_26, context_26) {
    "use strict";
    var entry;
    var __moduleName = context_26 && context_26.id;
    return {
        setters: [
            function (entry_1) {
                entry = entry_1;
            }
        ],
        execute: function () {
            entry.main();
        }
    };
});
