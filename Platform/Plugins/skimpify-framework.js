/* eslint-disable @typescript-eslint/adjacent-overload-signatures */
/* eslint-disable @typescript-eslint/no-namespace */
// Generated automatically. Do not edit.
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_2, context_2) {
    "use strict";
    var skyrimPlatform_1, TimeLib, MathLib, Combinators, FormLib, ArrayLib, MapLib, Misc, Hotkeys, DebugLib, AnimLib;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (skyrimPlatform_1_1) {
                skyrimPlatform_1 = skyrimPlatform_1_1;
            }
        ],
        execute: function () {
            /** Time related functions. */
            (function (TimeLib) {
                /** Ratio to convert Skyrim hours to human hours. */
                const gameHourRatio = 1.0 / 24.0;
                /** Current time in {@link SkyrimHours}. */
                TimeLib.Now = skyrimPlatform_1.Utility.getCurrentGameTime;
                /** Changes {@link SkyrimHours} to {@link HumanHours}.
                 *
                 * @param x Time in {@link SkyrimHours}.
                 * @returns Time in human readable hours.
                 *
                 * @example
                 * ToHumanHours(2.0)   // => 48. Two full days
                 * ToHumanHours(0.5)   // => 12. Half a day
                 */
                TimeLib.ToHumanHours = (x) => x / gameHourRatio;
                /** Converts a {@link SkyrimHours} to a `string` in {@link HumanHours}. */
                TimeLib.ToHumanHoursStr = (x) => TimeLib.ToHumanHours(x).toString();
                /** Converts a time in minutes to hours. */
                TimeLib.MinutesToHours = (x) => x / 60;
                /** Converts a time in hours to minutes. */
                TimeLib.HoursToMinutes = (x) => x * 60;
                /** Converts {@link HumanHours} to {@link SkyrimHours}.
                 *
                 * @param x Time in human readable hours.
                 * @returns Time in {@link SkyrimHours}.
                 *
                 * @example
                 * ToHumanHours(48)   // => 2.0. Two full days
                 * ToHumanHours(12)   // => 0.5. Half a day
                 */
                TimeLib.ToSkyrimHours = (x) => x * gameHourRatio;
                /** Returns in human hours how much time has passed between `Now` and some hour given
                 * in {@link SkyrimHours}.
                 * @param then {@link SkyrimHours}
                 * @returns Hour span in {@link HumanHours}
                 */
                TimeLib.HourSpan = (then) => TimeLib.ToHumanHours(TimeLib.Now() - then);
                /** Converts {@link HumanMinutes} to {@link SkyrimHours}.
                 * @param  {number} x Minutes to convert.
                 */
                TimeLib.MinutesToSkyrimHours = (x) => TimeLib.ToSkyrimHours(TimeLib.MinutesToHours(x));
                /** Converts {@link SkyrimHours} to {@link HumanMinutes}.
                 * @param  {number} x Minutes to convert.
                 */
                TimeLib.SkyrimHoursToHumanMinutes = (x) => TimeLib.HoursToMinutes(TimeLib.ToHumanHours(x));
            })(TimeLib || (TimeLib = {}));
            exports_2("TimeLib", TimeLib);
            /** Math related functions. */
            (function (MathLib) {
                /** Creates a linear function adjusted to two points.
                 *
                 * @param p1 Initial point.
                 * @param p2 Ending point.
                 * @returns A linear function that accepts an `x` argument.
                 *
                 * @example
                 * const f = LinCurve({ x: 24, y: 2 }, { x: 96, y: 16 })
                 * f(24) // => 2
                 * f(96) // => 16
                 * f(0)  // => -2.6666666666667
                 */
                function LinCurve(p1, p2) {
                    const x1 = p1.x;
                    const y1 = p1.y;
                    const m = (p2.y - y1) / (p2.x - x1);
                    return (x) => m * (x - x1) + y1;
                }
                MathLib.LinCurve = LinCurve;
                /** Creates an exponential function that adjusts a curve of some `shape` to two points.
                 *
                 * @remarks
                 * Some `shape` values, like `0`, may lead to linear functions instead of exponential ones.
                 * For those cases, this function returns a {@link LinCurve}.
                 *
                 * @param shape
                 * @param p1 Initial point.
                 * @param p2 Ending point.
                 * @returns An exponential function that accepets an `x` argument.
                 *
                 * @example
                 * const f = ExpCurve(-2.3, { x: 0, y: 3 }, { x: 1, y: 0.5 })
                 * f(0)       // => 3
                 * f(0.1)     // => 2.4290958125478785
                 * f(0.5)     // => 1.1012227076272225
                 * f(0.9)     // => 0.572039991172326
                 * f(1)       // => 0.5
                 */
                function ExpCurve(shape, p1, p2) {
                    const e = Math.exp;
                    const b = shape;
                    const ebx1 = e(b * p1.x);
                    const divisor = e(b * p2.x) - ebx1;
                    // Shape is actually a line, not an exponential curve.
                    if (divisor === 0)
                        return LinCurve(p1, p2);
                    const a = (p2.y - p1.y) / divisor;
                    const c = p1.y - a * ebx1;
                    return (x) => a * e(b * x) + c;
                }
                MathLib.ExpCurve = ExpCurve;
                /** Creates a spline function given a list of points.
                 *
                 * @remarks
                 * This function:
                 *  - Was adapted from https://www.developpez.net/forums/d331608-3/general-developpement/algorithme-mathematiques/contribuez/image-interpolation-spline-cubique/#post3513925
                 *  - Is not optimized for plotting charts. Will be slow when used in that context.
                 *  - Acts like Photoshop curves. I.e. if the first and/or last point isn't at
                 *    the edge of the valid range [`0`..`1`] it will consider outlier `y` values
                 *    to be a straight line from the edge `points`.
                 *
                 * @param points Points used to create the spline.
                 * `x` range ***MUST BE [`0`..`1`]***.
                 * `points` ***MUST BE*** ordered by x.
                 *
                 * @returns A function that accepts a `x` (ranging at [`0`..`1`]) and evaluates the
                 * spline value at that point.
                 */
                function CubicSpline(points) {
                    const n = points.length - 1;
                    // Avoid invalid number of points.
                    if (n == -1)
                        return (x) => 0;
                    if (n == 0)
                        return (x) => points[0].y;
                    const sd = SecondDerivative(points);
                    return (x) => {
                        // Start as a flat line
                        const p1 = points[0];
                        if (p1.x > 0 && x <= p1.x)
                            return p1.y;
                        // End as a flat line
                        const pn = points[n];
                        if (pn.x < 1 && x >= pn.x)
                            return pn.y;
                        // Make sure the last point is always returned
                        if (x === pn.x)
                            return pn.y;
                        for (let i = 0; i < n; i++) {
                            const cur = points[i];
                            const next = points[i + 1];
                            if (x >= cur.x && x < next.x) {
                                const t = (x - cur.x) / (next.x - cur.x);
                                const a = 1 - t;
                                const b = t;
                                const h = next.x - cur.x;
                                return (a * cur.y +
                                    b * next.y +
                                    ((h * h) / 6) *
                                        ((a * a * a - a) * sd[i] + (b * b * b - b) * sd[i + 1]));
                            }
                        }
                        // Should never return this. Used for debugging purposes.
                        return -999999;
                    };
                }
                MathLib.CubicSpline = CubicSpline;
                /** Helper function for {@link CubicSpline}. Calculates f'' for a list of points. */
                function SecondDerivative(p) {
                    const n = p.length;
                    // build the tridiagonal system
                    // (assume 0 boundary conditions: y2[0]=y2[-1]=0)
                    let matrix = Array.from({ length: n }, (_) => [0, 0, 0]);
                    let result = Array.from({ length: n }, (_) => 0);
                    matrix[0][1] = 1;
                    for (let i = 1; i < n - 1; i++) {
                        matrix[i][0] = (p[i].x - p[i - 1].x) / 6;
                        matrix[i][1] = (p[i + 1].x - p[i - 1].x) / 3;
                        matrix[i][2] = (p[i + 1].x - p[i].x) / 6;
                        result[i] =
                            (p[i + 1].y - p[i].y) / (p[i + 1].x - p[i].x) -
                                (p[i].y - p[i - 1].y) / (p[i].x - p[i - 1].x);
                    }
                    matrix[n - 1][1] = 1;
                    // solving pass1 (up->down)
                    for (let i = 1; i < n; i++) {
                        const k = matrix[i][0] / matrix[i - 1][1];
                        matrix[i][1] -= k * matrix[i - 1][2];
                        matrix[i][0] = 0;
                        result[i] -= k * result[i - 1];
                    }
                    // solving pass2 (down->up)
                    for (let i = n - 2; i >= 0; i--) {
                        const k = matrix[i][2] / matrix[i + 1][1];
                        matrix[i][1] -= k * matrix[i + 1][0];
                        matrix[i][2] = 0;
                        result[i] -= k * result[i + 1];
                    }
                    // return second derivative value for each point P
                    let y2 = new Array(n);
                    for (let i = 0; i < n; i++)
                        y2[i] = result[i] / matrix[i][1];
                    return y2;
                }
                /** Returns a function that ensures some value is at least `min`.
                 *
                 * @param min The minimum value a number can be.
                 * @returns A function that accepts a number `x` and returns `x` or `min`.
                 *
                 * @example
                 * const LowestHp = ForceMin(10)
                 * LowestHp(-1)     // => 10
                 * LowestHp(255)    // => 255
                 */
                MathLib.ForceMin = (min) => (x) => Math.max(min, x);
                /** Returns a function that ensures some value is at most `max`.
                 *
                 * @param max The maximum value a number can be.
                 * @returns A function that accepts a number `x` and returns `x` or `max`.
                 *
                 * @example
                 * let MaxSpeed = ForceMax(1.7)
                 * MaxSpeed(2)     // => 1.7
                 * MaxSpeed(1.7)   // => 1.7
                 * MaxSpeed(0.5)   // => 0.5
                 *
                 * MaxSpeed = ForceMax(1)
                 * MaxSpeed(1.1)   // => 1
                 */
                MathLib.ForceMax = (max) => (x) => Math.min(max, x);
                /** Returns a function that ensures some value is between the (inclusive) range [`min`..`max`].
                 *
                 * @param min The minimum value a number can be.
                 * @param max The maximum value a number can be.
                 * @returns A function that accepts a number `x` and makes sure it stays within `min` and `max`.
                 *
                 * @example
                 * const itemCount = 42
                 * let Take = ForceRange(0, itemCount)
                 * Take(-100)     // => 0
                 * Take(255)      // => 42
                 * Take(3)        // => 3
                 *
                 * // Redefine Take function to reflect new data
                 * Take = ForceRange(0, itemCount - Take(3))
                 */
                MathLib.ForceRange = (min, max) => (x) => MathLib.ForceMin(min)(MathLib.ForceMax(max)(x));
                /** Ensures some value is always positive.
                 *
                 * @param x A number.
                 * @returns `0` if `x` is negative, else `x`.
                 *
                 * @example
                 * ForcePositive(-100)     // => 0
                 * ForcePositive(255)      // => 255
                 * ForcePositive(0)        // => 0
                 */
                MathLib.ForcePositive = (x) => MathLib.ForceMin(0)(x);
                /** Ensures some value always stays within the (inclusive) range [`0`..`1`].
                 *
                 * @param x A number.
                 * @returns A number between [`0`..`1`].
                 *
                 * @example
                 * ForcePercent(-0.1)       // => 0
                 * ForcePercent(10)         // => 1
                 * ForcePercent(0.5)        // => 0.5
                 */
                MathLib.ForcePercent = (x) => MathLib.ForceRange(0, 1)(x);
            })(MathLib || (MathLib = {}));
            exports_2("MathLib", MathLib);
            /** Functional programming combinators.
             *
             * @remarks
             * Many of these may be arcane, but they are quite useful nonetheless.
             *
             * Some of them are used in this library and you aren't required to use any
             * of these, ever.\
             * But if you know when to use them, your code will be shorter and your intentions
             * clearer.
             *
             * Highly recommended reading:
             *
             * - https://tgdwyer.github.io/
             * - https://leanpub.com/javascriptallongesix/read#leanpub-auto-making-data-out-of-functions
             */
            (function (Combinators) {
                /** Returns whatever it's passed to it.
                 *
                 * @param x
                 * @returns x
                 *
                 * @remarks
                 * **This is NOT STUPID**. It's useful, for example, for feeding it to
                 * functions that may transform values, but we don't want to transform
                 * something in particular.
                 *
                 * It's not much useful by itself, but you will soon see its value
                 * when you start composing functions.
                 *
                 * @see {@link K} for other uses.
                 *
                 * @example
                 * const lower = (x: string) => x.toLowerCase()
                 * const upper = (x: string) => x.toUpperCase()
                 * const f = (x: string, g: (x: string) => string) => g(x)
                 *
                 * const x = f("LOWER", lower)
                 * const y = f("upper", upper)
                 * const z = f("sAmE", I)
                 */
                Combinators.I = (x) => x;
                /** Returns a function that accepts one parameter, but ignores it and returns whatever
                 * you originally defined it with.
                 *
                 * @param x
                 * @returns `function (y: any) => x`
                 *
                 * @remarks
                 * This can be used to make a function constant; that is, no matter what you
                 * pass to it, it will always returns the value you first defined it with.
                 * This is useful to plug constants into places that are expecting functions.
                 *
                 * If combined with {@link I} it can do useful things. `K(I)` will always
                 * return the second parameter you pass to it.
                 *
                 * Combined with {@link O} can be used to make one liners that ensure a calculated value
                 * is always returned.
                 *
                 * @see {@link O} for more uses.
                 *
                 * @example
                 * const first = K
                 * const second = k(I)
                 * first("primero")("segundo")    // => "primero"
                 * second("primero")("segundo")   // => "segundo"
                 *
                 * const msg = K("You are a moron")
                 * const validate = (x: number) => (typeof x !== "number" ? null : x.toString())
                 * const intToStr = O(validate, msg)
                 * intToStr(null)   // => "You are a moron"
                 * intToStr(32)     // => 32
                 *
                 * const guaranteedActorBase = O((a: Actor) => a.getLeveledActorBase(), K(Game.getPlayer()?.getBaseObject()))
                 * guaranteedActorBase(null)              // => player
                 * guaranteedActorBase(whiterunGuard)     // => Whiterun Guard
                 */
                Combinators.K = (x) => (y) => x;
                /** Creates a function that accepts one parameter `x`. Returns `f1(x)` if not `null`, else `f2(x)`.
                 *
                 * @param f1 First function to apply.
                 * @param f2 Second function to apply.
                 * @returns `f1(x)` if not `null`, else `f2(x)`.
                 */
                Combinators.O = (f1, f2) => (...args) => f1(...args) || f2(...args);
                /** Applies function `f` to `x` and returns `x`. Useful for chaining functions that return nothing.
                 *
                 * @param x
                 * @param f
                 * @returns x
                 */
                function Tap(x, f) {
                    f(x);
                    return x;
                }
                Combinators.Tap = Tap;
                /** Returns a value while executing a function.
                 *
                 * @see {@link DebugLib.Log.R} for a sample usage.
                 *
                 * @param f Function to execute.
                 * @param x Value to return.
                 * @returns `x`
                 */
                Combinators.Return = (f, x) => Tap(x, Combinators.K(f));
            })(Combinators || (Combinators = {}));
            exports_2("Combinators", Combinators);
            /** Functions related to `Forms`. */
            (function (FormLib) {
                /** Player FormId. */
                FormLib.playerId = 0x14;
                /** Gets the player as an `Actor`.
                 *
                 * @remarks
                 * `Game.getPlayer()` is guaranteed to get an `Actor` in Skyrim Platform, so it's
                 * ok to do `Game.getPlayer() as Actor`.
                 *
                 * This function is intended to be used as a callback when you are defining functions that
                 * need the player, but
                 * {@link https://github.com/skyrim-multiplayer/skymp/blob/main/docs/skyrim_platform/native.md#native-functions game functions are not available}
                 * when defining them.
                 */
                FormLib.Player = () => skyrimPlatform_1.Game.getPlayer();
                function PreserveForm(frm) {
                    if (!frm)
                        return () => null;
                    const id = frm.getFormID();
                    return () => skyrimPlatform_1.Game.getFormEx(id);
                }
                FormLib.PreserveForm = PreserveForm;
                function PreserveActor(a) {
                    const f = PreserveForm(a);
                    return () => skyrimPlatform_1.Actor.from(f());
                }
                FormLib.PreserveActor = PreserveActor;
                /** Does something to an `Actor` after some time has passed.
                 *
                 * @remarks
                 * This was made to hide the tediousness of having to retrieve and check
                 * for an `Actor` each time the `Utility.wait` function is used.
                 *
                 * @param a `Actor` to work on.
                 * @param time Time to wait (seconds).
                 * @param DoSomething What to do when the time has passed.
                 *
                 * @remarks
                 * The Actor `a` is guaranteed to exist at the time `DoSomething` is
                 * executed. If the function is not executed it means `a` is no longer
                 * available.
                 */
                function WaitActor(a, time, DoSomething) {
                    const actor = PreserveActor(a);
                    const f = async () => {
                        await skyrimPlatform_1.Utility.wait(time);
                        const act = actor();
                        if (!act)
                            return;
                        DoSomething(act);
                    };
                    f();
                }
                FormLib.WaitActor = WaitActor;
                function ForEachEquippedSlotMask(a, DoSomething) {
                    if (!a)
                        return;
                    for (let i = 1 /* Head */; i < 2147483648 /* FX01 */; i *= 2) {
                        DoSomething(i);
                    }
                }
                FormLib.ForEachEquippedSlotMask = ForEachEquippedSlotMask;
                /** Does something for each `Armor` an `Actor` has equipped.
                 *
                 * @param a Actor to check.
                 * @param DoSomething What to do when an equipped armor is found.
                 */
                function ForEachEquippedArmor(a, DoSomething) {
                    if (!a)
                        return;
                    for (let i = 1 /* Head */; i < 2147483648 /* FX01 */; i *= 2) {
                        const x = skyrimPlatform_1.Armor.from(a.getWornForm(i));
                        if (x)
                            DoSomething(x);
                    }
                }
                FormLib.ForEachEquippedArmor = ForEachEquippedArmor;
                /** Gets all armors an `Actor` is wearing.
                 *
                 * @param a Actor to check for.
                 * @param nonRepeated Some armors may occupy more than one bodyslot.
                 * When this value is `false`, those armors will be returned multiple times: once for each slot.
                 * @param playableOnly Return only playeable armors?
                 * @param namedOnly Return only named armors?
                 * @returns An array with all equipped armors.
                 *
                 * @remarks
                 * ***WARNING***. This function ***may*** be slow (not to Papyrus levels, of course) and
                 * it's recommended to be used with caution in real production code.
                 *
                 * However, it can be safely used sparingly.
                 */
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
                FormLib.GetEquippedArmors = GetEquippedArmors;
                /** Iterates over all items belonging to some `ObjectReference`, from last to first.
                 *
                 * @param o - The object reference to iterate over.
                 * @param f - Function applied to each item.
                 */
                function ForEachItemR(o, f) {
                    let i = o.getNumItems();
                    while (i > 0) {
                        i--;
                        f(o.getNthForm(i));
                    }
                }
                FormLib.ForEachItemR = ForEachItemR;
                /** Iterates over all keywords belonging to some `Form`, from last to first.
                 *
                 * @param o - The form to iterate over.
                 * @param f - Function applied to each keyword.
                 */
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
                FormLib.ForEachKeywordR = ForEachKeywordR;
                /** Iterates over all items belonging to some `Outfit`, from last to first.
                 *
                 * @param o - The outfit to iterate over.
                 * @param f - Function applied to each item.
                 */
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
                FormLib.ForEachOutfitItemR = ForEachOutfitItemR;
                /** Iterates over all armors belonging to some `ObjectReference`, from last to first.
                 *
                 * @param o - The object reference to iterate over.
                 * @param f - Function applied to each armor.
                 */
                function ForEachArmorR(o, f) {
                    ForEachItemR(o, (i) => {
                        const a = skyrimPlatform_1.Armor.from(i);
                        if (!a)
                            return;
                        f(a);
                    });
                }
                FormLib.ForEachArmorR = ForEachArmorR;
                /** Iterates over all forms of `formType` in some `cell`.
                 *
                 * @param cell Cell to search forms for.
                 * @param formType {@link FormType}
                 * @param f Function applied to each `Form`.
                 */
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
                FormLib.ForEachFormInCell = ForEachFormInCell;
                /** Gets the esp a form belongs to.
                 *
                 * @remarks
                 * This code was adapted from `GetFormIdentifier` in FileUtils.cpp
                 * in SKEE64 (RaceMenu dll); line 177.
                 *
                 * @param form Form to get the esp from.
                 * @returns Name and type of the esp file he form belongs to.
                 */
                function GetFormEsp(form) {
                    const nil = { name: "", type: 2 /* unknown */ };
                    if (!form)
                        return nil;
                    const formId = form.getFormID();
                    const modIndex = formId >>> 24;
                    if (modIndex == 0xfe) {
                        const lightIndex = (formId >>> 12) & 0xfff;
                        if (lightIndex < skyrimPlatform_1.Game.getLightModCount())
                            return { name: skyrimPlatform_1.Game.getLightModName(lightIndex), type: 1 /* esl */ };
                    }
                    else
                        return { name: skyrimPlatform_1.Game.getModName(modIndex), type: 0 /* esp */ };
                    return nil;
                }
                FormLib.GetFormEsp = GetFormEsp;
                /** Adapter to change a {@link FormEspInfo} to `undefined` if needed. */
                FormLib.FormEspInfoToUndef = (d) => d.type === 2 /* unknown */ ? { name: undefined, type: undefined } : d;
                /** Returns the relative `formId` of some `Form`.
                 *
                 * @param form The `Form` to get the relative `formId` from.
                 * @param modType Does the `Form` belong to an esp or esl file?
                 * @returns Fixed `formId`. `-1` if `form` or `modType` are invalid.
                 */
                function GetFixedFormId(form, modType) {
                    if (!form || modType === 2 /* unknown */)
                        return -1;
                    const id = form.getFormID();
                    return modType === 0 /* esp */ ? id & 0xffffff : id & 0xfff;
                }
                FormLib.GetFixedFormId = GetFixedFormId;
                /** Returns the esp file, type and fixed formId for a `Form`.
                 *
                 * @param form `Form` to get data from.
                 * @returns An object with all data.
                 */
                function GetFormEspAndId(form) {
                    const esp = GetFormEsp(form);
                    const id = GetFixedFormId(form, esp.type);
                    return { modName: esp.name, type: esp.type, fixedFormId: id };
                }
                FormLib.GetFormEspAndId = GetFormEspAndId;
                /** Returns a string that can be used as an unique `Form` identifier.
                 *
                 * @param form The `Form` to generate data for.
                 * @param format The function that will be used to give format to the result of this function.
                 * @returns A unique `string` identifier based on fixed formId and esp file data.
                 *
                 * @example
                 * const b = Game.getFormEx(0x03003012)
                 * const uId = GetFormUniqueId(b, (e, i) => `${e}|0x${i.toString(16)}`) // => "Hearthfires.esm|0x3012"
                 */
                function GetFormUniqueId(form, format) {
                    if (!form)
                        return "Undefined form";
                    const d = GetFormEspAndId(form);
                    return format(d.modName, d.fixedFormId, d.type);
                }
                FormLib.GetFormUniqueId = GetFormUniqueId;
                /** Creates a persistent chest hidden somewhere in Tamriel.
                 *
                 * @remarks
                 * This chest can be used as a permanent storage that never resets.
                 *
                 * Because of the way things are created in Skyrim, we need to get an object reference first.
                 *
                 * @returns The FormId of the recently created chest. `null` if no chest could be created.
                 */
                function CreatePersistentChest() {
                    // Spawn chest at player's location
                    const p = skyrimPlatform_1.Game.getPlayer();
                    const c = p.placeAtMe(skyrimPlatform_1.Game.getFormEx(0x70479), 1, true, false);
                    if (!c)
                        return null;
                    // Move the chest to Tamriel
                    const world = skyrimPlatform_1.WorldSpace.from(skyrimPlatform_1.Game.getFormEx(0x3c));
                    skyrimPlatform_1.TESModPlatform.moveRefrToPosition(c, null, world, 0, 0, -10000, 0, 0, 0);
                    return c.getFormID();
                }
                FormLib.CreatePersistentChest = CreatePersistentChest;
                /** Tries to get a persistent chest defined in some place and creates a new
                 * one if it doesn't exist.
                 *
                 * @param  {()=>Form|null|undefined} Getter Function that gets an already existing chest.
                 * @param  {(frm:Form|null|undefined)=>void} Setter Function that saves a newly created chest.
                 * @param  {(msg:string)=>void} Logger? Function to log an error if a new chest couldn't be created.
                 *
                 * @example
                 *   // This uses a JContainers database to know what chest is being created
                 *   const path = "some.JContainers.path"
                 *   const h = GetSomeJContainersHandle(path)
                 *   const someForm = Game.getFormEx(0x14)
                 *
                 *   const Getter = () => {
                 *     return JFormMap.getForm(h, someForm)
                 *   }
                 *   const Setter = (frm: Form | null | undefined) => {
                 *     JFormMap.setForm(h, someForm, frm)
                 *     SaveSomeJContainersHandle(h, path)
                 *   }
                 *
                 *   const chest = FormLib.GetPersistentChest(Getter, Setter, printConsole)
                 */
                function GetPersistentChest(Getter, Setter, Logger) {
                    let frm = Getter();
                    if (!frm) {
                        const newChest = FormLib.CreatePersistentChest();
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
                FormLib.GetPersistentChest = GetPersistentChest;
                /** Returns wether an `ObjectReference` is an alchemy lab.
                 * @param  {ObjectReference} furniture The furniture to check.
                 *
                 * @remarks
                 * This function is intended to be used with `on("furnitureEnter")`
                 * and `on("furnitureExit")` Skyrim Platform events.
                 */
                FormLib.IsAlchemyLab = (furniture) => ObjRefHasName(furniture, "alchemy");
                /** Tests if an object reference contains some name */
                const ObjRefHasName = (f, name) => { var _a; return (_a = f.getBaseObject()) === null || _a === void 0 ? void 0 : _a.getName().toLowerCase().includes(name); };
            })(FormLib || (FormLib = {}));
            exports_2("FormLib", FormLib);
            /** Functions related to arrays. */
            (function (ArrayLib) {
                /** Returns a random element from some array.
                 *
                 * @param arr Array to get the element from.
                 * @returns A random element.
                 */
                function RandomElement(arr) {
                    return arr[Math.floor(Math.random() * arr.length)];
                }
                ArrayLib.RandomElement = RandomElement;
            })(ArrayLib || (ArrayLib = {}));
            exports_2("ArrayLib", ArrayLib);
            /** Functions related to maps. */
            (function (MapLib) {
                /** Joins two maps, applying a function when keys collide.
                 *
                 * @param m1 First map.
                 * @param m2 Second map.
                 * @param OnExistingKey Function for solving collisions.
                 * @returns
                 */
                function JoinMaps(m1, m2, OnExistingKey) {
                    if (!m2)
                        return m1;
                    const o = new Map(m1);
                    m2.forEach((v2, k) => {
                        if (o.has(k))
                            o.set(k, OnExistingKey(o.get(k), v2, k));
                        else
                            o.set(k, v2);
                    });
                    return o;
                }
                MapLib.JoinMaps = JoinMaps;
            })(MapLib || (MapLib = {}));
            exports_2("MapLib", MapLib);
            /** Miscelaneous functions that don't belong to other categories. */
            (function (Misc) {
                /** Avoids a function to be executed many times at the same time.
                 *
                 * @param f The function to wrap.
                 * @returns A function that will be called only once when the engine
                 * tries to spam it.
                 *
                 * @remarks
                 * Sometimes the engine is so fast a function may be called many times
                 * in a row. For example, the `OnSleepStart` event may be fired 4 times
                 * in a row, thus executing a function those 4 times, even when it was
                 * intended to run only once.
                 *
                 * This function will make a function in that situation to be called
                 * only once, as expected.
                 *
                 * @warning
                 * Since this function is a "closure" it needs to be used outside loops
                 * and things that may redefine the inner variables inside it.
                 *
                 * If this function doesn't appear to work, try to use it outside the
                 * current execution block.
                 *
                 * @example
                 * let f = () => { printConsole("Only once") }
                 * f = AvoidRapidFire(f)
                 *
                 * // The engine is so fast this will actually work
                 * f()
                 * f()
                 * f()
                 */
                function AvoidRapidFire(f) {
                    let lastExecuted = 0;
                    return () => {
                        const t = TimeLib.Now();
                        if (lastExecuted === t)
                            return;
                        lastExecuted = t;
                        f();
                    };
                }
                Misc.AvoidRapidFire = AvoidRapidFire;
                /** Adapts a JContainers saving function so it can be used with {@link PreserveVar}.
                 *
                 * @param f Function to adapt.
                 * @returns A function that accepts a key and a value.
                 *
                 * @example
                 * const SaveFlt = JContainersToPreserving(JDB.solveFltSetter)
                 * const SaveInt = JContainersToPreserving(JDB.solveIntSetter)
                 */
                function JContainersToPreserving(f) {
                    return (k, v) => {
                        f(k, v, true);
                    };
                }
                Misc.JContainersToPreserving = JContainersToPreserving;
                /** Adapts a PapyrusUtil saving function so it can be used with {@link PreserveVar}.
                 *
                 * @param f Function to adapt.
                 * @param obj Object to save values on. Use `null` to save globally.
                 * @returns A function that accepts a key and a value.
                 *
                 * @example
                 * const SaveFlt = PapyrusUtilToPreserving(PapyrusUtil.SetFloatValue, null)
                 * const SaveInt = PapyrusUtilToPreserving(PapyrusUtil.SetIntValue, null)
                 */
                function PapyrusUtilToPreserving(f, obj) {
                    return (k, v) => {
                        f(obj, k, v);
                    };
                }
                Misc.PapyrusUtilToPreserving = PapyrusUtilToPreserving;
                /** Saves a variable to both storage and wherever the `Store` function saves it.
                 *
                 * @remarks
                 * The `storage` variable saves values across hot reloads, but not game sessions.
                 *
                 * At the time of creating this function, Skyrim Platform doesn't implement any
                 * way of saving variables to the SKSE co-save, so values aren't preserved across
                 * save game saves.
                 *
                 * This function lets us save variables using wrapped functions from either
                 * **JContainers** or **PapyursUtil**.
                 *
                 * @param Store A function that saves a variable somewhere.
                 * @param k `string` key to identify where the variable will be saved.
                 * @returns A fuction that saves a value and returns it.
                 *
                 * @example
                 * const SaveFlt = JContainersToPreserving(JDB.solveFltSetter)
                 * const SaveInt = JContainersToPreserving(JDB.solveIntSetter)
                 * const SFloat = PreserveVar(SaveFlt, "floatKey")
                 * const SInt = PreserveVar(SaveInt, "intKey")
                 *
                 * // Use SFloat each time we want to make sure a value won't get lost when reloading the game.
                 * let x = SFloat(10)   // => x === 10
                 * x = SFloat(53.78)    // => x === 53.78
                 */
                function PreserveVar(Store, k) {
                    return (x) => {
                        skyrimPlatform_1.storage[k] = x;
                        Store(k, x);
                        return x;
                    };
                }
                Misc.PreserveVar = PreserveVar;
                /** Returns a function that accepts a function `f` that gets executed each `seconds`.
                 *
                 * @remarks
                 * This is meant to be used as a substitute of sorts to the `OnUpdate` Papyrus event,
                 * but it doesn't check if the player has the game paused inside a menu; that's up to
                 * `f` to implement.
                 *
                 * @param seconds Seconds between checks.
                 * @returns A function that accepts a function `f`.
                 *
                 * @example
                 * const RTcalc = UpdateEach(3)
                 *
                 * on("update", () => {
                 *    RTcalc(() => { printConsole("Real time calculations") })
                 * }
                 */
                function UpdateEach(seconds) {
                    let lastUpdated = 0;
                    return (f) => {
                        const t = skyrimPlatform_1.Utility.getCurrentRealTime();
                        if (t - lastUpdated < seconds)
                            return;
                        lastUpdated = t;
                        f();
                    };
                }
                Misc.UpdateEach = UpdateEach;
            })(Misc || (Misc = {}));
            exports_2("Misc", Misc);
            /** Functions related to hotkeys. */
            (function (Hotkeys) {
                /** Was copied from skyrimPlatform.ts because definitions in there are exported as a `const enum`,
                 * thus making impossible to convert a string `DxScanCode` to number.
                 *
                 * With that setup it was impossible to make {@link FromSettings} to read scan codes as strings.
                 */
                let DxScanCode;
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
                })(DxScanCode = Hotkeys.DxScanCode || (Hotkeys.DxScanCode = {}));
                Hotkeys.DoNothing = () => { };
                Hotkeys.DoNothingOnHold = (_) => () => { };
                /** Creates a function that reads and logs a Hotkey at the same time.
                 *
                 * @param Log {@link DebugLib.Log.TappedFunction} used to log the hotkey.
                 * @param Get A function that gets a hotkey by name.
                 * @param appendStr Message to append before the hotkey name and data. `"Hotkey "` by default.
                 * @returns A function that accepts a key name and returns a {@link Hotkey}.
                 *
                 * @example
                 * const LH = DebugLib.Log.Tap(printConsole)
                 * const GetHotkey = GetAndLog(LH, FromValue)
                 *
                 * ListenTo(GetHotkey("hk1")) // => "Hotkey hk1: Shift Enter" is printed to console
                 */
                function GetAndLog(Log, Get, appendStr = "Hotkey ") {
                    const A = appendStr ? DebugLib.Log.AppendT(Log, appendStr) : Log;
                    return (k) => A(k, Get(k), ToString);
                }
                Hotkeys.GetAndLog = GetAndLog;
                /** Gets a hotkey from some configuration file.
                 *
                 * @remarks
                 * This function can read both numbers and strings defined in {@link DxScanCode}.
                 *
                 * @param pluginName Name of the plugin to get the value from.
                 * @param optionName Name of the variable that carries the value.
                 * @returns The hotkey. `DxScanCode.None` if invalid.
                 */
                Hotkeys.FromSettings = (pluginName, optionName) => FromValue(skyrimPlatform_1.settings[pluginName][optionName]);
                /** Reads a hotkey from a Json object inside some settings file.
                 * @example
                 * ```json
                 * // Settings file
                 * {
                 *   "hotkeys": {
                 *     "hk1": "Shift Enter"
                 *   }
                 * }
                 * ```
                 * ```ts
                 *
                 * // Typescript
                 * const hk = FromObject("plugin", "hotkeys", "hk1") // => Shift + Enter
                 * ```
                 * @param pluginName Name of the plugin to get the value from.
                 * @param objectName Name of the parent object of the wanted key.
                 * @param optionName Name of the variable that carries the value.
                 * @returns The hotkey. `DxScanCode.None` if invalid.
                 */
                Hotkeys.FromObject = (pluginName, objectName, optionName
                // @ts-ignore
                ) => FromValue(skyrimPlatform_1.settings[pluginName][objectName][optionName]);
                /** Extracts modifiers from a string hotkey. */
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
                    // Undefined if no modifiers were found
                    m = !m.alt && !m.ctrl && !m.shift ? undefined : m;
                    return { hk: s, modifiers: m };
                }
                /** Returns wether a Modifier is pressed. */
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
                    return () => skyrimPlatform_1.Input.isKeyPressed(l) || skyrimPlatform_1.Input.isKeyPressed(r);
                }
                /** Is `Shift` pressed? */
                Hotkeys.IsShiftPressed = IsModifierPressed("Shift");
                /** Is `Ctrl` pressed? */
                Hotkeys.IsCtrlPressed = IsModifierPressed("Ctrl");
                /** Is `Alt` pressed? */
                Hotkeys.IsAltPressed = IsModifierPressed("Alt");
                /** Converts either a `string` or `number` to a hotkey value.
                 * @remarks
                 * This function is best used in tandem with {@link ListenTo},
                 * so that function can execute hotkeys like `"Ctrl Enter"`.
                 */
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
                Hotkeys.FromValue = FromValue;
                /** Converts a {@link Hotkey} to string.
                 * @remarks Used for presenting info to players.
                 */
                function ToString(h) {
                    var _a, _b, _c;
                    const k = DxScanCode[h.hk];
                    const s = ((_a = h.modifiers) === null || _a === void 0 ? void 0 : _a.shift) ? "Shift + " : "";
                    const c = ((_b = h.modifiers) === null || _b === void 0 ? void 0 : _b.ctrl) ? "Ctrl + " : "";
                    const a = ((_c = h.modifiers) === null || _c === void 0 ? void 0 : _c.alt) ? "Alt + " : "";
                    return c + s + a + k;
                }
                Hotkeys.ToString = ToString;
                /** Used to contain the function that checks for modifiers.
                 * Made like this for optimization purposes.
                 */
                let Modifiers;
                (function (Modifiers) {
                    const S = Hotkeys.IsShiftPressed;
                    const A = Hotkeys.IsAltPressed;
                    const C = Hotkeys.IsCtrlPressed;
                    const T = (k, P, f) => {
                        const p = P();
                        if (k) {
                            if (!p)
                                return false; // Key isn't pressed, but should
                            return f(); // Check if next sequence is pressed
                        }
                        else {
                            if (p)
                                return false; // Key is pressed, but shouldn't
                            return f(); // Check if next sequence is pressed
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
                /** Listen to {@link Hotkey}. */
                Hotkeys.ListenTo = (hk, enable = true) => ListenToS(hk.hk, enable, hk.modifiers);
                /** "ListenTo - Simple". Listens for some Hotkey press / release / hold.
                 *
                 * @see {@link https://www.creationkit.com/index.php?title=Input_Script#DXScanCodes | DXScanCodes}
                 * for possible hotkey values.
                 *
                 * @remarks
                 * Use functions generated by this function ***only inside an `'update'` event***.
                 * But ***DON'T GENERATE functions INSIDE an `'update'` event***.
                 *
                 * This function is intended to be used for quick prototyping.\
                 * For "production" code, use {@link ListenTo}.
                 *
                 * @param hk The hotkey to listen for.
                 * @param enable If `false`, a blank function will be returned.\
                 * Use this argument when you need to listen to hotkeys only when you know some condition
                 * will be true. This will avoid wasting time doing checks that will never come true.
                 *
                 * @returns A function that accepts three callbacks:
                 * 1. OnKeyPress
                 * 1. OnKeyReleased
                 * 1. OnKeyHold - This one gets how many frames has the key being held
                 *
                 * @example
                 * const LogPress = () => { printConsole(`Key was pressed`) }
                 *
                 * const LogRelease = () => { printConsole(`Key was released`) }
                 *
                 * const LogHold: KeyHoldEvt = n => () => { printConsole(`Key has been held for ${n} frames.`) }
                 *
                 * const DoStuff = ListenTo(76)           // Listen to num5
                 * const OnlyCareForHold = ListenTo(77)   // Listen to num6
                 *
                 * const specialModeEnabled = settings["mod"]["specialMode"]
                 * const SpecialOperation = ListenTo(DxScanCode.F10, specialModeEnabled)
                 *
                 * on('update', () => {
                 *   DoStuff(LogPress, LogRelease, LogHold)
                 *   OnlyCareForHold(undefined, undefined, LogHold)
                 *
                 *   SpecialOperation(LogPress)
                 *
                 *   // Never generate functions inside an update event.
                 *   // The following code won't work.
                 *   const NonWorking = ListenTo(78)
                 *   NonWorking(LogPress, undefined, LogHold)
                 * })
                 */
                function ListenToS(hk, enable = true, modifiers) {
                    let old = false;
                    let frames = 0;
                    return enable && hk > DxScanCode.None
                        ? (OnPress = Hotkeys.DoNothing, OnRelease = Hotkeys.DoNothing, OnHold = Hotkeys.DoNothingOnHold) => {
                            if (modifiers && !Modifiers.Continue(modifiers))
                                return;
                            const p = skyrimPlatform_1.Input.isKeyPressed(hk);
                            if (old !== p) {
                                frames = 0;
                                if (p)
                                    skyrimPlatform_1.once("update", OnPress);
                                else
                                    skyrimPlatform_1.once("update", OnRelease);
                            }
                            else if (p) {
                                frames++;
                                skyrimPlatform_1.once("update", OnHold(frames));
                            }
                            old = p;
                        }
                        : (OnPress = Hotkeys.DoNothing, OnRelease = Hotkeys.DoNothing, OnHold = Hotkeys.DoNothingOnHold) => { };
                }
                Hotkeys.ListenToS = ListenToS;
                /** Not an useful function. Use it as a template. @see {@link ListenTo} */
                Hotkeys.LogPress = () => {
                    skyrimPlatform_1.printConsole(`Key was pressed`);
                };
                /** Not an useful function. Use it as a template. @see {@link ListenTo} */
                Hotkeys.LogRelease = () => {
                    skyrimPlatform_1.printConsole(`Key was released`);
                };
                /** Not an useful function. Use it as a template. @see {@link ListenTo} */
                Hotkeys.LogHold = (n) => () => {
                    skyrimPlatform_1.printConsole(`Key has been held for ${n} frames.`);
                };
            })(Hotkeys || (Hotkeys = {}));
            exports_2("Hotkeys", Hotkeys);
            /** Useful functions for debugging. */
            (function (DebugLib) {
                let Log;
                (function (Log) {
                    /** How much will the console be spammed.
                     * - optimization     Meant to only output the times functions take to execute. Used for bottleneck solving.
                     * - none       No spam.
                     * - error      Just errors and stuff like that.
                     * - info       Detailed info so players can know if things are going as expected, but not enough for actual debugging.
                     * - verbose    Info meant for developers. Use it for reporting errors or unexpected behavior.
                     */
                    let Level;
                    (function (Level) {
                        Level[Level["optimization"] = -1] = "optimization";
                        Level[Level["none"] = 0] = "none";
                        Level[Level["error"] = 1] = "error";
                        Level[Level["info"] = 2] = "info";
                        Level[Level["verbose"] = 3] = "verbose";
                    })(Level = Log.Level || (Log.Level = {}));
                    /** Gets the logging level from some configuration file.
                     *
                     * @param pluginName Name of the plugin to get the value from.
                     * @param optionName Name of the variable that carries the value.
                     * @returns The logging level from file. `verbose` if value was invalid.
                     */
                    function LevelFromSettings(pluginName, optionName) {
                        return LevelFromValue(skyrimPlatform_1.settings[pluginName][optionName]);
                    }
                    Log.LevelFromSettings = LevelFromSettings;
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
                    Log.LevelFromValue = LevelFromValue;
                    /** Returns a string in the form `"[Mod name]: Message"`.
                     * @see {@link FileFmt}.
                     *
                     * @remarks
                     * You can use this function as a guide on how a {@link LogFormat} function
                     * used for {@link CreateFunction} can be made.
                     *
                     * @example
                     * const LogI = CreateFunction(userLevel, Level.info, "my-mod", ConsoleFmt, FileFmt)
                     * const LogV = CreateFunction(userLevel, Level.verbose, "my-mod", ConsoleFmt, FileFmt)
                     *
                     * // Console output: "[my-mod]: This is important for the player."
                     * // File output: "[info] 4/5/2021 12:32:15 p.m.: This is important for the player."
                     * LogI("This is important for the player.")
                     *
                     * // Console output: "[my-mod]: This is useful for debugging."
                     * // File output: "[verbose] 4/5/2021 12:32:15 p.m.: This is useful for debugging."
                     * LogV("This is useful for debugging.")
                     */
                    Log.ConsoleFmt = (_, __, n, ___, msg) => `[${n}]: ${msg}`;
                    /** Returns a string in the form `"[logging level] date-time: Message"`.
                     * @see {@link ConsoleFmt}.
                     *
                     * @remarks
                     * You can use this function as a guide on how a {@link LogFormat} function
                     * used for {@link CreateFunction} can be made.
                     *
                     * Format for https://github.com/Scarfsail/AdvancedLogViewer :\
                     *    `[{Type}] {Date} {Time}: {Message}`
                     *
                     * @example
                     * const LogI = CreateFunction(userLevel, Level.info, "my-mod", ConsoleFmt, FileFmt)
                     * const LogV = CreateFunction(userLevel, Level.verbose, "my-mod", ConsoleFmt, FileFmt)
                     *
                     * // Console output: "[my-mod]: This is important for the player."
                     * // File output: "[info] 4/5/2021 12:32:15 p.m.: This is important for the player."
                     * LogI("This is important for the player.")
                     *
                     * // Console output: "[my-mod]: This is useful for debugging."
                     * // File output: "[verbose] 4/5/2021 12:32:15 p.m.: This is useful for debugging."
                     * LogV("This is useful for debugging.")
                     */
                    Log.FileFmt = (_, m, __, t, msg) => `[${Level[m]}] ${t.toLocaleString()}: ${msg}`;
                    /** Creates a logging function that appends some message before logging.
                     *
                     * @param f Function to wrap.
                     * @param append Message to append each time the result is called.
                     * @returns A {@link LoggingFunction}.
                     *
                     * @example
                     * const CMLL = Append(printConsole, "Kemonito: ")
                     * CMLL("Kicks")       // => "Kemonito: Kicks"
                     * CMLL("Flies!")      // => "Kemonito: Flies!"
                     * CMLL("Is love")     // => "Kemonito: Is love"
                     * CMLL("Is life")     // => "Kemonito: Is life"
                     */
                    function Append(f, append) {
                        return (msg) => f(append + msg);
                    }
                    Log.Append = Append;
                    /** Creates a logging function that appends some message before logging.
                     *
                     * @see {@link Append}
                     *
                     * @param f Function to wrap.
                     * @param append Message to append each time the result is called.
                     * @returns A {@link TappedFunction}.
                     */
                    function AppendT(f, append) {
                        return (msg, x, fmt) => f(append + msg, x, fmt);
                    }
                    Log.AppendT = AppendT;
                    /** Creates a function used for logging. Said function can log to either console or to some file.
                     *
                     * @see {@link FileFmt}, {@link ConsoleFmt}.
                     *
                     * @param currLogLvl The log level the user has selected. I.e. how much info they want to get.
                     * @param logAt At which level this function will log.
                     * @param modName Name of the mod. Will be used to output messages and to name the output file.
                     * Output file will be named `"Data\Platform\Plugins\modName-logs.txt"`.
                     * @param ConsoleFmt A function of type {@link LogFormat}. If `undefined`, nothing will be output to console.
                     * @param FileFmt A function of type {@link LogFormat}. If `undefined`, nothing will be output to file.
                     * @returns A function that logs a message as a string.
                     *
                     * @example
                     * // LogI will only log to file
                     * const LogI = CreateFunction(Level.info, Level.info, "my-mod", undefined, FileFmt)
                     *
                     * // LogV won't log anything because player only wants to log at most Level.info type messages
                     * const LogV = CreateFunction(Level.info, Level.verbose, "my-mod", ConsoleFmt, FileFmt)
                     */
                    function CreateFunction(currLogLvl, logAt, modName, ConsoleFmt, FileFmt) {
                        return function (msg) {
                            const canLog = currLogLvl >= logAt || (currLogLvl < 0 && currLogLvl === logAt);
                            if (!canLog)
                                return;
                            const t = new Date();
                            if (ConsoleFmt)
                                skyrimPlatform_1.printConsole(ConsoleFmt(currLogLvl, logAt, modName, t, msg));
                            if (FileFmt)
                                skyrimPlatform_1.writeLogs(modName, FileFmt(currLogLvl, logAt, modName, t, msg));
                        };
                    }
                    Log.CreateFunction = CreateFunction;
                    /** Creates all functions at all logging levels with their corresponding Tapped counterparts.
                     *
                     * @param mod Mod name. This will be saved for each line.
                     * @param logLvl Current logging level for the mod.
                     * @param Console Console format.
                     * @param File File format.
                     * @returns An object with all functions.
                     */
                    function CreateAll(mod, logLvl, Console, File) {
                        const CLF = (logAt) => CreateFunction(logLvl, logAt, mod, Console, File);
                        const O = CLF(Level.optimization);
                        const N = CLF(Level.none);
                        const E = CLF(Level.error);
                        const I = CLF(Level.info);
                        const V = CLF(Level.verbose);
                        return {
                            /** Log at special mode: optimization. */
                            Optimization: O,
                            /** Log at none level. Basically, ignore logging settings, except when using special modes. */
                            None: N,
                            /** Log at error level. */
                            Error: E,
                            /** Log at info level. */
                            Info: I,
                            /** Log at verbose level. */
                            Verbose: V,
                            /** Log at special mode: optimization. Return value. */
                            TapO: Tap(O),
                            /** Log at none level and return value. */
                            TapN: Tap(N),
                            /** Log at error level and return value. */
                            TapE: Tap(E),
                            /** Log at info level and return value. */
                            TapI: Tap(I),
                            /** Log at verbose level and return value. */
                            TapV: Tap(V),
                        };
                    }
                    Log.CreateAll = CreateAll;
                    /** Makes a logging function to log a value, then returns that value.
                     *
                     * @param f - The logging function.
                     * @returns A {@link TappedFunction}.
                     *
                     * @remarks
                     * This function is intended to be used to initialize variables while logging them,
                     * so logging looks cleaner and variables become self documenting in code and
                     * "debuggeable" at the same time.
                     *
                     * @example
                     * const IntToHex = (x: number) => x.toString(16)
                     * const LogAndInit = Tap(printConsole)
                     *
                     * // "Value for x: 3". Meanwhile: x === 3.
                     * const x = LogAndInit("Value for x", 3)
                     *
                     * // "Hex: ff". Meanwhile: ff === 255
                     * const ff = LogAndInit("Hex", 255, IntToHex)
                     *
                     * // Don't know what the next call will yield, but we can log it to console to see it!
                     * const form = LogAndInit("Found form", Game.getFormFromFile(0x3bba, "Skyrim.esm"))
                     */
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
                    Log.Tap = Tap;
                    const C = Combinators;
                    /** Returns `x` while executing a logging function. `R` means _[R]eturn_.
                     *
                     * @remarks
                     * This is useful for uncluttering logging calls when returning values from functions,
                     * but can be used to log variable assignments as well.
                     *
                     * At first this may look like it's doing the same as {@link Tap}, but this function provides much
                     * more flexibility at the cost of doing more writing.\
                     * Both functions are useful and can be used together for great flexibilty.
                     *
                     * @param f A function that takes any number of arguments and returns `void`.
                     * @param x The value to be returned.
                     * @returns `x`
                     *
                     * @example
                     * const Msg = (s: string) => { printConsole(`This is a ${s}`) }
                     * const x = R(Msg("number"), 2)       // => "This is a number"; x === 2
                     * const s = R(Msg("string"), "noob")  // => "This is a string"; s === "noob"
                     */
                    Log.R = C.Return;
                    /** Converts an integer to hexadecimal notation.
                     *
                     * @remarks
                     * This function has apparently absurd safeguards because it's intended to be used for logging.\
                     * If you want a straight forward conversion, just use `x.toString(16)`.
                     *
                     * @param x
                     * @returns string
                     */
                    function IntToHex(x) {
                        return !x || typeof x !== "number"
                            ? "IntToHex: Undefined value"
                            : x.toString(16);
                    }
                    Log.IntToHex = IntToHex;
                })(Log = DebugLib.Log || (DebugLib.Log = {}));
                /** @experimental
                 * Doesn't work right now. Maybe I need to use promises and whatnot.
                 *
                 * Measures the time it takes a function to execute and logs that.
                 *
                 * @remarks
                 * `Utility.getCurrentRealTime()` seems to be returning the same value for both
                 * times the function starts and ends.\
                 * I suspect this is because most functions in Skyrim Platform don't wait for the others to end.
                 *
                 * @param f - Function to measure.
                 * @param Log - Function used for logging the time. You can supply a logging level-aware function.
                 */
                function Benchmark(f, Log) {
                    return () => {
                        const t1 = skyrimPlatform_1.Utility.getCurrentRealTime();
                        Log(`${f.name} start time: ${t1}`);
                        const ff = new Promise((resolve, _) => {
                            f();
                            resolve(skyrimPlatform_1.Utility.getCurrentRealTime());
                        });
                        ff.then((t2) => {
                            Log(`${f.name} end time: ${t2}`);
                            Log(`Execution time for ${f.name}: ${t2 - t1}`);
                        });
                    };
                }
                DebugLib.Benchmark = Benchmark;
            })(DebugLib || (DebugLib = {}));
            exports_2("DebugLib", DebugLib);
            /** Animation helpers */
            (function (AnimLib) {
                /** Adds a hook to react to some animation event.
                 * @param  {string} animName Name of the animation to react to.
                 * @param  {()=>void} callback Function to call when animation is played.
                 * @param  {number | undefined} minFormId Minimum FormId of actors to react to.
                 * @param  {number | undefined} maxFormId Maximum FormId of actors to react to.
                 */
                function HookAnim(animName, callback, minFormId, maxFormId) {
                    skyrimPlatform_1.hooks.sendAnimationEvent.add({
                        enter(_) { },
                        leave(c) {
                            if (c.animationSucceeded)
                                skyrimPlatform_1.once("update", () => callback());
                        },
                    }, minFormId, maxFormId, animName);
                }
                AnimLib.HookAnim = HookAnim;
            })(AnimLib || (AnimLib = {}));
            exports_2("AnimLib", AnimLib);
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/src/debug", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib"], function (exports_3, context_3) {
    "use strict";
    var DmLib_1, L, fs, LogN, LogNT, LogI, LogIT, LogV, LogVT;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [
            function (DmLib_1_1) {
                DmLib_1 = DmLib_1_1;
            }
        ],
        execute: function () {
            L = DmLib_1.DebugLib.Log;
            fs = DmLib_1.DebugLib.Log.CreateAll("SkimpifyFramework", L.Level.info, L.ConsoleFmt, L.FileFmt);
            /** Log at `none` level. Basically, ignore logging settings, except when using special modes. */
            exports_3("LogN", LogN = fs.None);
            /** Log at `none` level and return value. */
            exports_3("LogNT", LogNT = fs.TapN);
            exports_3("LogI", LogI = fs.Info);
            exports_3("LogIT", LogIT = fs.TapI);
            /** Log at verbose level. */
            exports_3("LogV", LogV = fs.Verbose);
            /** Log at verbose level and return value. */
            exports_3("LogVT", LogVT = fs.TapV);
        }
    };
});
/*
This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JMap", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_4, context_4) {
    "use strict";
    var sp, sn, object, getInt, getFlt, getStr, getObj, getForm, setInt, setFlt, setStr, setObj, setForm, hasKey, valueType, allKeys, allKeysPArray, allValues, removeKey, count, clear, addPairs, nextKey, getNthKey;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (sp_1) {
                sp = sp_1;
            }
        ],
        execute: function () {
            /** Associative key-value container.
                Inherits JValue functionality */
            sn = sp.JMap;
            /** creates new container object. returns container's identifier (unique integer number). */
            exports_4("object", object = () => sn.object());
            /** Returns the value associated with the @key. If not, returns @default value */
            exports_4("getInt", getInt = (object, key, defaultVal = 0) => sn.getInt(object, key, defaultVal));
            exports_4("getFlt", getFlt = (object, key, defaultVal = 0.0) => sn.getFlt(object, key, defaultVal));
            exports_4("getStr", getStr = (object, key, defaultVal = "") => sn.getStr(object, key, defaultVal));
            exports_4("getObj", getObj = (object, key, defaultVal = 0) => sn.getObj(object, key, defaultVal));
            exports_4("getForm", getForm = (object, key, defaultVal = null) => sn.getForm(object, key, defaultVal));
            /** Inserts @key: @value pair. Replaces existing pair with the same @key */
            exports_4("setInt", setInt = (object, key, value) => sn.setInt(object, key, value));
            exports_4("setFlt", setFlt = (object, key, value) => sn.setFlt(object, key, value));
            exports_4("setStr", setStr = (object, key, value) => sn.setStr(object, key, value));
            exports_4("setObj", setObj = (object, key, container) => sn.setObj(object, key, container));
            exports_4("setForm", setForm = (object, key, value) => sn.setForm(object, key, value));
            /** Returns true, if the container has @key: value pair */
            exports_4("hasKey", hasKey = (object, key) => sn.hasKey(object, key));
            /** Returns type of the value associated with the @key.
                0 - no value, 1 - none, 2 - int, 3 - float, 4 - form, 5 - object, 6 - string */
            exports_4("valueType", valueType = (object, key) => sn.valueType(object, key));
            /** Returns a new array containing all keys */
            exports_4("allKeys", allKeys = (object) => sn.allKeys(object));
            exports_4("allKeysPArray", allKeysPArray = (object) => sn.allKeysPArray(object));
            /** Returns a new array containing all values */
            exports_4("allValues", allValues = (object) => sn.allValues(object));
            /** Removes the pair from the container where the key equals to the @key */
            exports_4("removeKey", removeKey = (object, key) => sn.removeKey(object, key));
            /** Returns count of pairs in the conainer */
            exports_4("count", count = (object) => sn.count(object));
            /** Removes all pairs from the container */
            exports_4("clear", clear = (object) => sn.clear(object));
            /** Inserts key-value pairs from the source container */
            exports_4("addPairs", addPairs = (object, source, overrideDuplicates) => sn.addPairs(object, source, overrideDuplicates));
            /** Simplifies iteration over container's contents.
                Accepts the @previousKey, returns the next key.
                If @previousKey == @endKey the function returns the first key.
                The function always returns so-called 'valid' keys (the ones != @endKey).
                The function returns @endKey ('invalid' key) only once to signal that iteration has reached its end.
                In most cases, if the map doesn't contain an invalid key ("" for JMap, None form-key for JFormMap)
                it's ok to omit the @endKey.
                
                Usage:
                
                    string key = JMap.nextKey(map, previousKey="", endKey="")
                    while key != ""
                      <retrieve values here>
                      key = JMap.nextKey(map, key, endKey="")
                    endwhile */
            exports_4("nextKey", nextKey = (object, previousKey = "", endKey = "") => sn.nextKey(object, previousKey, endKey));
            /** Retrieves N-th key. negative index accesses items from the end of container counting backwards.
                Worst complexity is O(n/2) */
            exports_4("getNthKey", getNthKey = (object, keyIndex) => sn.getNthKey(object, keyIndex));
        }
    };
});
/*
This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormMap", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_5, context_5) {
    "use strict";
    var sp, sn, object, getInt, getFlt, getStr, getObj, getForm, setInt, setFlt, setStr, setObj, setForm, hasKey, valueType, allKeys, allKeysPArray, allValues, removeKey, count, clear, addPairs, nextKey, getNthKey;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (sp_2) {
                sp = sp_2;
            }
        ],
        execute: function () {
            /** Associative key-value container.
                Inherits JValue functionality */
            sn = sp.JFormMap;
            /** creates new container object. returns container's identifier (unique integer number). */
            exports_5("object", object = () => sn.object());
            /** Returns the value associated with the @key. If not, returns @default value */
            exports_5("getInt", getInt = (object, key, defaultVal = 0) => sn.getInt(object, key, defaultVal));
            exports_5("getFlt", getFlt = (object, key, defaultVal = 0.0) => sn.getFlt(object, key, defaultVal));
            exports_5("getStr", getStr = (object, key, defaultVal = "") => sn.getStr(object, key, defaultVal));
            exports_5("getObj", getObj = (object, key, defaultVal = 0) => sn.getObj(object, key, defaultVal));
            exports_5("getForm", getForm = (object, key, defaultVal = null) => sn.getForm(object, key, defaultVal));
            /** Inserts @key: @value pair. Replaces existing pair with the same @key */
            exports_5("setInt", setInt = (object, key, value) => sn.setInt(object, key, value));
            exports_5("setFlt", setFlt = (object, key, value) => sn.setFlt(object, key, value));
            exports_5("setStr", setStr = (object, key, value) => sn.setStr(object, key, value));
            exports_5("setObj", setObj = (object, key, container) => sn.setObj(object, key, container));
            exports_5("setForm", setForm = (object, key, value) => sn.setForm(object, key, value));
            /** Returns true, if the container has @key: value pair */
            exports_5("hasKey", hasKey = (object, key) => sn.hasKey(object, key));
            /** Returns type of the value associated with the @key.
                0 - no value, 1 - none, 2 - int, 3 - float, 4 - form, 5 - object, 6 - string */
            exports_5("valueType", valueType = (object, key) => sn.valueType(object, key));
            /** Returns a new array containing all keys */
            exports_5("allKeys", allKeys = (object) => sn.allKeys(object));
            exports_5("allKeysPArray", allKeysPArray = (object) => sn.allKeysPArray(object));
            /** Returns a new array containing all values */
            exports_5("allValues", allValues = (object) => sn.allValues(object));
            /** Removes the pair from the container where the key equals to the @key */
            exports_5("removeKey", removeKey = (object, key) => sn.removeKey(object, key));
            /** Returns count of pairs in the conainer */
            exports_5("count", count = (object) => sn.count(object));
            /** Removes all pairs from the container */
            exports_5("clear", clear = (object) => sn.clear(object));
            /** Inserts key-value pairs from the source container */
            exports_5("addPairs", addPairs = (object, source, overrideDuplicates) => sn.addPairs(object, source, overrideDuplicates));
            /** Simplifies iteration over container's contents.
                Accepts the @previousKey, returns the next key.
                If @previousKey == @endKey the function returns the first key.
                The function always returns so-called 'valid' keys (the ones != @endKey).
                The function returns @endKey ('invalid' key) only once to signal that iteration has reached its end.
                In most cases, if the map doesn't contain an invalid key ("" for JMap, None form-key for JFormMap)
                it's ok to omit the @endKey.
                
                Usage:
                
                    string key = JMap.nextKey(map, previousKey="", endKey="")
                    while key != ""
                      <retrieve values here>
                      key = JMap.nextKey(map, key, endKey="")
                    endwhile */
            exports_5("nextKey", nextKey = (object, previousKey = null, endKey = null) => sn.nextKey(object, previousKey, endKey));
            /** Retrieves N-th key. negative index accesses items from the end of container counting backwards.
                Worst complexity is O(n/2) */
            exports_5("getNthKey", getNthKey = (object, keyIndex) => sn.getNthKey(object, keyIndex));
        }
    };
});
/*
This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JArray", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_6, context_6) {
    "use strict";
    var sp, sn, object, objectWithSize, objectWithInts, objectWithStrings, objectWithFloats, objectWithBooleans, objectWithForms, subArray, addFromArray, addFromFormList, getInt, getFlt, getStr, getObj, getForm, asIntArray, asFloatArray, asStringArray, asFormArray, findInt, findFlt, findStr, findObj, findForm, countInteger, countFloat, countString, countObject, countForm, setInt, setFlt, setStr, setObj, setForm, addInt, addFlt, addStr, addObj, addForm, count, clear, eraseIndex, eraseRange, eraseInteger, eraseFloat, eraseString, eraseObject, eraseForm, valueType, swapItems, sort, unique, reverse, writeToIntegerPArray, writeToFloatPArray, writeToFormPArray, writeToStringPArray;
    var __moduleName = context_6 && context_6.id;
    return {
        setters: [
            function (sp_3) {
                sp = sp_3;
            }
        ],
        execute: function () {
            /** Ordered collection of values (value is float, integer, string, form or another container).
                Inherits JValue functionality */
            sn = sp.JArray;
            /** creates new container object. returns container's identifier (unique integer number). */
            exports_6("object", object = () => sn.object());
            /** Creates a new array of given size, filled with empty (None) items */
            exports_6("objectWithSize", objectWithSize = (size) => sn.objectWithSize(size));
            /** Creates a new array that contains given values
                objectWithBooleans converts booleans into integers */
            exports_6("objectWithInts", objectWithInts = (values) => sn.objectWithInts(values));
            exports_6("objectWithStrings", objectWithStrings = (values) => sn.objectWithStrings(values));
            exports_6("objectWithFloats", objectWithFloats = (values) => sn.objectWithFloats(values));
            exports_6("objectWithBooleans", objectWithBooleans = (values) => sn.objectWithBooleans(values));
            exports_6("objectWithForms", objectWithForms = (values) => sn.objectWithForms(values));
            /** Creates a new array containing all the values from the source array in range [startIndex, endIndex) */
            exports_6("subArray", subArray = (object, startIndex, endIndex) => sn.subArray(object, startIndex, endIndex));
            /** Inserts the values from the source array into this array. If insertAtIndex is -1 (default behaviour) it appends to the end.
                negative index accesses items from the end of container counting backwards. */
            exports_6("addFromArray", addFromArray = (object, source, insertAtIndex = -1) => sn.addFromArray(object, source, insertAtIndex));
            exports_6("addFromFormList", addFromFormList = (object, source, insertAtIndex = -1) => sn.addFromFormList(object, source, insertAtIndex));
            /** Returns the item at the index of the array.
                negative index accesses items from the end of container counting backwards. */
            exports_6("getInt", getInt = (object, index, defaultVal = 0) => sn.getInt(object, index, defaultVal));
            exports_6("getFlt", getFlt = (object, index, defaultVal = 0.0) => sn.getFlt(object, index, defaultVal));
            exports_6("getStr", getStr = (object, index, defaultVal = "") => sn.getStr(object, index, defaultVal));
            exports_6("getObj", getObj = (object, index, defaultVal = 0) => sn.getObj(object, index, defaultVal));
            exports_6("getForm", getForm = (object, index, defaultVal = null) => sn.getForm(object, index, defaultVal));
            /** Copy all items to new native Papyrus array of dynamic size.
                Items not matching the requested type will have default
                values as the ones from the getInt/Flt/Str/Form functions. */
            exports_6("asIntArray", asIntArray = (object) => sn.asIntArray(object));
            exports_6("asFloatArray", asFloatArray = (object) => sn.asFloatArray(object));
            exports_6("asStringArray", asStringArray = (object) => sn.asStringArray(object));
            exports_6("asFormArray", asFormArray = (object) => sn.asFormArray(object));
            /** Returns the index of the first found value/container that equals to given the value/container (default behaviour if searchStartIndex is 0).
                If nothing was found it returns -1.
                @searchStartIndex - index of the array where to start search
                negative index accesses items from the end of container counting backwards. */
            exports_6("findInt", findInt = (object, value, searchStartIndex = 0) => sn.findInt(object, value, searchStartIndex));
            exports_6("findFlt", findFlt = (object, value, searchStartIndex = 0) => sn.findFlt(object, value, searchStartIndex));
            exports_6("findStr", findStr = (object, value, searchStartIndex = 0) => sn.findStr(object, value, searchStartIndex));
            exports_6("findObj", findObj = (object, container, searchStartIndex = 0) => sn.findObj(object, container, searchStartIndex));
            exports_6("findForm", findForm = (object, value, searchStartIndex = 0) => sn.findForm(object, value, searchStartIndex));
            /** Returns the number of times given value was found in a JArray. */
            exports_6("countInteger", countInteger = (object, value) => sn.countInteger(object, value));
            exports_6("countFloat", countFloat = (object, value) => sn.countFloat(object, value));
            exports_6("countString", countString = (object, value) => sn.countString(object, value));
            exports_6("countObject", countObject = (object, container) => sn.countObject(object, container));
            exports_6("countForm", countForm = (object, value) => sn.countForm(object, value));
            /** Replaces existing value at the @index of the array with the new @value.
                negative index accesses items from the end of container counting backwards. */
            exports_6("setInt", setInt = (object, index, value) => sn.setInt(object, index, value));
            exports_6("setFlt", setFlt = (object, index, value) => sn.setFlt(object, index, value));
            exports_6("setStr", setStr = (object, index, value) => sn.setStr(object, index, value));
            exports_6("setObj", setObj = (object, index, container) => sn.setObj(object, index, container));
            exports_6("setForm", setForm = (object, index, value) => sn.setForm(object, index, value));
            /** Appends the @value/@container to the end of the array.
                If @addToIndex >= 0 it inserts value at given index. negative index accesses items from the end of container counting backwards. */
            exports_6("addInt", addInt = (object, value, addToIndex = -1) => sn.addInt(object, value, addToIndex));
            exports_6("addFlt", addFlt = (object, value, addToIndex = -1) => sn.addFlt(object, value, addToIndex));
            exports_6("addStr", addStr = (object, value, addToIndex = -1) => sn.addStr(object, value, addToIndex));
            exports_6("addObj", addObj = (object, container, addToIndex = -1) => sn.addObj(object, container, addToIndex));
            exports_6("addForm", addForm = (object, value, addToIndex = -1) => sn.addForm(object, value, addToIndex));
            /** Returns count of the items in the array */
            exports_6("count", count = (object) => sn.count(object));
            /** Removes all the items from the array */
            exports_6("clear", clear = (object) => sn.clear(object));
            /** Erases the item at the index. negative index accesses items from the end of container counting backwards. */
            exports_6("eraseIndex", eraseIndex = (object, index) => sn.eraseIndex(object, index));
            /** Erases [first, last] index range of the items. negative index accesses items from the end of container counting backwards.
                For ex. with [1,-1] range it will erase everything except the first item */
            exports_6("eraseRange", eraseRange = (object, first, last) => sn.eraseRange(object, first, last));
            /** Erase all elements of given value. Returns the number of erased elements. */
            exports_6("eraseInteger", eraseInteger = (object, value) => sn.eraseInteger(object, value));
            exports_6("eraseFloat", eraseFloat = (object, value) => sn.eraseFloat(object, value));
            exports_6("eraseString", eraseString = (object, value) => sn.eraseString(object, value));
            exports_6("eraseObject", eraseObject = (object, container) => sn.eraseObject(object, container));
            exports_6("eraseForm", eraseForm = (object, value) => sn.eraseForm(object, value));
            /** Returns type of the value at the @index. negative index accesses items from the end of container counting backwards.
                0 - no value, 1 - none, 2 - int, 3 - float, 4 - form, 5 - object, 6 - string */
            exports_6("valueType", valueType = (object, index) => sn.valueType(object, index));
            /** Exchanges the items at @index1 and @index2. negative index accesses items from the end of container counting backwards. */
            exports_6("swapItems", swapItems = (object, index1, index2) => sn.swapItems(object, index1, index2));
            /** Sorts the items into ascending order (none < int < float < form < object < string). Returns the array itself */
            exports_6("sort", sort = (object) => sn.sort(object));
            /** Sorts the items, removes duplicates. Returns array itself. You can treat it as JSet now */
            exports_6("unique", unique = (object) => sn.unique(object));
            /** Reverse the order of elements. Returns the array itself. */
            exports_6("reverse", reverse = (object) => sn.reverse(object));
            /** Writes the array's items into the @targetArray array starting at @destIndex
                 @writeAtIdx -    [-1, 0] - writes all the items in reverse order
                   [0, -1] - writes all the items in straight order
                   [1, 3] - writes 3 items in straight order */
            exports_6("writeToIntegerPArray", writeToIntegerPArray = (object, targetArray, writeAtIdx = 0, stopWriteAtIdx = -1, readIdx = 0, defaultValRead = 0) => sn.writeToIntegerPArray(object, targetArray, writeAtIdx, stopWriteAtIdx, readIdx, defaultValRead));
            exports_6("writeToFloatPArray", writeToFloatPArray = (object, targetArray, writeAtIdx = 0, stopWriteAtIdx = -1, readIdx = 0, defaultValRead = 0.0) => sn.writeToFloatPArray(object, targetArray, writeAtIdx, stopWriteAtIdx, readIdx, defaultValRead));
            exports_6("writeToFormPArray", writeToFormPArray = (object, targetArray, writeAtIdx = 0, stopWriteAtIdx = -1, readIdx = 0, defaultValRead = null) => sn.writeToFormPArray(object, targetArray, writeAtIdx, stopWriteAtIdx, readIdx, defaultValRead));
            exports_6("writeToStringPArray", writeToStringPArray = (object, targetArray, writeAtIdx = 0, stopWriteAtIdx = -1, readIdx = 0, defaultValRead = "") => sn.writeToStringPArray(object, targetArray, writeAtIdx, stopWriteAtIdx, readIdx, defaultValRead));
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JTs", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JMap", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormMap", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JArray"], function (exports_7, context_7) {
    "use strict";
    var JMap, JFormMap, JArray, JMapL, JFormMapL, JArrayL;
    var __moduleName = context_7 && context_7.id;
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
            /** JMap related functions. */
            (function (JMapL) {
                /** Iterates over all JMap keys and executes a function `f` for each key.
                 *
                 * @param o Object handle for the JMap.
                 * @param f Function to execute for each key found.
                 * It accepts the `key` found and the object `o` as arguments.
                 *
                 * @example
                 * ForAllKeys(JValue.readFromFile(path), (armor, i) => {
                 *   const data = JMap.getObj(i, armor)
                 *   DoSomething(data)
                 * })
                 */
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
            exports_7("JMapL", JMapL);
            (function (JFormMapL) {
                /** Iterates over all JFormMap keys and executes a function `f` for each key.
                 *
                 * @param o Object handle for the JFormMap.
                 * @param f Function to execute for each key found.
                 * It accepts the `key` found and the object `o` as arguments.
                 *
                 * @example
                 * ForAllKeys(JValue.readFromFile(path), (armor, i) => {
                 *   const data = JFormMap.getObj(i, armor)
                 *   DoSomething(data)
                 * })
                 */
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
            exports_7("JFormMapL", JFormMapL);
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
            exports_7("JArrayL", JArrayL);
        }
    };
});
/*
Manual fixing notes:
  - All deprecated functions were manually removed.

==============================================
Typescript definitions for v3.9
==============================================

This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/PapyrusUtil/MiscUtil", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_8, context_8) {
    "use strict";
    var sp, sn, ScanCellObjects, ScanCellNPCs, ScanCellNPCsByFaction, ToggleFreeCamera, SetFreeCameraSpeed, SetFreeCameraState, FilesInFolder, FoldersInFolder, FileExists, ReadFromFile, WriteToFile, PrintConsole, GetRaceEditorID, GetActorRaceEditorID, SetMenus;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (sp_4) {
                sp = sp_4;
            }
        ],
        execute: function () {
            sn = sp.MiscUtil;
            /** Cell scanning functions */
            // Scans the current cell of the given CenterOn for an object of the given form type ID within radius and returns an array for all that
            // and (optionally) also has the given keyword if changed from default none. Setting radius higher than 0.0 will restrict the
            // search distance from around CenterOn, 0.0 will search entire cell the object is in.
            // NOTE: Keyword searches seem a little unpredictable so be sure to test if your usage of it works before using the results.
            exports_8("ScanCellObjects", ScanCellObjects = (formType, CenterOn, radius = 0.0, HasKeyword = null) => sn.ScanCellObjects(formType, CenterOn, radius, HasKeyword));
            // Scans the current cell of the given CenterOn for an actor within the given radius and returns an array for all actors that are
            // currently alive and (optionally) has the given keyword if changed from default none. Setting radius higher than 0.0 will restrict the
            // search distance from around CenterOn, 0.0 will search entire cell the object is in.
            // NOTE: Keyword searches seem a little unpredictable so be sure to test if your usage of it works before using the results.
            exports_8("ScanCellNPCs", ScanCellNPCs = (CenterOn, radius = 0.0, HasKeyword = null, IgnoreDead = true) => sn.ScanCellNPCs(CenterOn, radius, HasKeyword, IgnoreDead));
            // Same as ScanCellNPCs(), however it filters the return by a given faction and (optionally) their rank in that faction.
            exports_8("ScanCellNPCsByFaction", ScanCellNPCsByFaction = (FindFaction, CenterOn, radius = 0.0, minRank = 0, maxRank = 127, IgnoreDead = true) => sn.ScanCellNPCsByFaction(FindFaction, CenterOn, radius, minRank, maxRank, IgnoreDead));
            /** Camera functions - NOT CURRENT WORKING IN SKYRIM SPECIAL EDITION */
            // Toggle freefly camera.
            exports_8("ToggleFreeCamera", ToggleFreeCamera = (stopTime = false) => sn.ToggleFreeCamera(stopTime));
            // Set freefly cam speed.
            exports_8("SetFreeCameraSpeed", SetFreeCameraSpeed = (speed) => sn.SetFreeCameraSpeed(speed));
            // Set current freefly cam state & set the speed if enabling
            exports_8("SetFreeCameraState", SetFreeCameraState = (enable, speed = 10.0) => sn.SetFreeCameraState(enable, speed));
            /** File related functions */
            // Get an array of files in a given parent directory that have the given extension.
            // directory is relative to the root Skyrim folder (where skyrim.exe is) and is non-recursive.
            // directory = "." to get all files in root Skyrim folder
            // directory = "data/meshes" to get all files in the <root>/data/meshes folder
            // extension = ".nif" to get all .nif mesh files.
            // (default) extension="*" to get all files
            exports_8("FilesInFolder", FilesInFolder = (directory, extension = "*") => sn.FilesInFolder(directory, extension));
            // Get an array of folders in a given parent directory
            // Same rules and examples as above FilesInFolder apply to the directory rule here.
            exports_8("FoldersInFolder", FoldersInFolder = (directory) => sn.FoldersInFolder(directory));
            // Check if a given file exists relative to root Skyrim directory. Example: FileExists("data/meshes/example.nif")
            exports_8("FileExists", FileExists = (fileName) => sn.FileExists(fileName));
            // Read string from file. Do not read large files!
            exports_8("ReadFromFile", ReadFromFile = (fileName) => sn.ReadFromFile(fileName));
            // Write string to file.
            exports_8("WriteToFile", WriteToFile = (fileName, text, append = true, timestamp = false) => sn.WriteToFile(fileName, text, append, timestamp));
            /** Misc */
            // Print text to console.
            exports_8("PrintConsole", PrintConsole = (text) => sn.PrintConsole(text));
            // Get race's editor ID.
            exports_8("GetRaceEditorID", GetRaceEditorID = (raceForm) => sn.GetRaceEditorID(raceForm));
            // Get race's editor ID.
            exports_8("GetActorRaceEditorID", GetActorRaceEditorID = (actorRef) => sn.GetActorRaceEditorID(actorRef));
            // Set HUD on / off - NOT CURRENT WORKING IN SKYRIM SPECIAL EDITION
            exports_8("SetMenus", SetMenus = (enabled) => sn.SetMenus(enabled));
        }
    };
});
/*
Manual fixing notes:
    - Added boolean functions, which are wrappers of `int` ones.

This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JDB", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_9, context_9) {
    "use strict";
    var sp, sn, solveFlt, solveInt, solveBool, solveStr, solveObj, solveForm, solveFltSetter, solveIntSetter, solveBoolSetter, solveStrSetter, solveObjSetter, solveFormSetter, setObj, hasPath, allKeys, allValues, writeToFile, root;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (sp_5) {
                sp = sp_5;
            }
        ],
        execute: function () {
            /** Global entry point to store mod information. Main intent - replace global variables
                Manages keys and values associations (like JMap) */
            sn = sp.JDB;
            /** Attempts to retrieve the value associated with the @path.
                For ex. the following information associated with 'frosfall' key:
            
                "frostfall" : {
                    "exposureRate" : 0.5,
                    "arrayC" : ["stringValue", 1.5, 10, 1.14]
                }
            
                then JDB.solveFlt(".frostfall.exposureRate") will return 0.5 and
                JDB.solveObj(".frostfall.arrayC") will return the array containing ["stringValue", 1.5, 10, 1.14] values */
            exports_9("solveFlt", solveFlt = (path, defaultVal = 0.0) => sn.solveFlt(path, defaultVal));
            exports_9("solveInt", solveInt = (path, defaultVal = 0) => sn.solveInt(path, defaultVal));
            exports_9("solveBool", solveBool = (path, defaultVal = false) => sn.solveInt(path, defaultVal ? 1 : 0) === 1);
            exports_9("solveStr", solveStr = (path, defaultVal = "") => sn.solveStr(path, defaultVal));
            exports_9("solveObj", solveObj = (path, defaultVal = 0) => sn.solveObj(path, defaultVal));
            exports_9("solveForm", solveForm = (path, defaultVal = null) => sn.solveForm(path, defaultVal));
            /** Attempts to assign the @value. Returns false if no such path.
                If 'createMissingKeys=true' it creates any missing path elements: JDB.solveIntSetter(".frostfall.keyB", 10, true) creates {frostfall: {keyB: 10}} structure */
            exports_9("solveFltSetter", solveFltSetter = (path, value, createMissingKeys = false) => sn.solveFltSetter(path, value, createMissingKeys));
            exports_9("solveIntSetter", solveIntSetter = (path, value, createMissingKeys = false) => sn.solveIntSetter(path, value, createMissingKeys));
            exports_9("solveBoolSetter", solveBoolSetter = (path, value, createMissingKeys = false) => sn.solveIntSetter(path, value ? 1 : 0, createMissingKeys));
            exports_9("solveStrSetter", solveStrSetter = (path, value, createMissingKeys = false) => sn.solveStrSetter(path, value, createMissingKeys));
            exports_9("solveObjSetter", solveObjSetter = (path, value, createMissingKeys = false) => sn.solveObjSetter(path, value, createMissingKeys));
            exports_9("solveFormSetter", solveFormSetter = (path, value, createMissingKeys = false) => sn.solveFormSetter(path, value, createMissingKeys));
            /** Associates(and replaces previous association) container object with a string key.
                destroys association if object is zero
                for ex. JDB.setObj("frostfall", frostFallInformation) will associate 'frostall' key and frostFallInformation so you can access it later */
            exports_9("setObj", setObj = (key, object) => sn.setObj(key, object));
            /** Returns true, if JDB capable resolve given @path, i.e. if it able to execute solve* or solver*Setter functions successfully */
            exports_9("hasPath", hasPath = (path) => sn.hasPath(path));
            /** returns new array containing all JDB keys */
            exports_9("allKeys", allKeys = () => sn.allKeys());
            /** returns new array containing all containers associated with JDB */
            exports_9("allValues", allValues = () => sn.allValues());
            /** writes storage data into JSON file at given path */
            exports_9("writeToFile", writeToFile = (path) => sn.writeToFile(path));
            /** Returns underlying JDB's container - an instance of JMap.
                The object being owned (retained) internally, so you don't have to (but can) retain or release it. */
            exports_9("root", root = () => sn.root());
        }
    };
});
/*
Manual fixing notes:
    - Added boolean functions, which are wrappers of `int` ones.

This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormDB", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_10, context_10) {
    "use strict";
    var sp, sn, setEntry, makeEntry, findEntry, solveFlt, solveInt, solveBool, solveStr, solveObj, solveForm, solveFltSetter, solveIntSetter, solveBoolSetter, solveStrSetter, solveObjSetter, solveFormSetter, hasPath, allKeys, allValues, getInt, getFlt, getStr, getObj, getForm, setInt, setFlt, setStr, setObj, setForm;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (sp_6) {
                sp = sp_6;
            }
        ],
        execute: function () {
            /** Manages form related information (entry). */
            sn = sp.JFormDB;
            /** associates given form key and entry (container). set entry to zero to destroy association */
            exports_10("setEntry", setEntry = (storageName, fKey, entry) => sn.setEntry(storageName, fKey, entry));
            /** returns (or creates new if not found) JMap entry for given storage and form */
            exports_10("makeEntry", makeEntry = (storageName, fKey) => sn.makeEntry(storageName, fKey));
            /** search for entry for given storage and form */
            exports_10("findEntry", findEntry = (storageName, fKey) => sn.findEntry(storageName, fKey));
            /** attempts to get value associated with path. */
            exports_10("solveFlt", solveFlt = (fKey, path, defaultVal = 0.0) => sn.solveFlt(fKey, path, defaultVal));
            exports_10("solveInt", solveInt = (fKey, path, defaultVal = 0) => sn.solveInt(fKey, path, defaultVal));
            exports_10("solveBool", solveBool = (fKey, path, defaultVal = false) => sn.solveInt(fKey, path, defaultVal ? 1 : 0) === 1);
            exports_10("solveStr", solveStr = (fKey, path, defaultVal = "") => sn.solveStr(fKey, path, defaultVal));
            exports_10("solveObj", solveObj = (fKey, path, defaultVal = 0) => sn.solveObj(fKey, path, defaultVal));
            exports_10("solveForm", solveForm = (fKey, path, defaultVal = null) => sn.solveForm(fKey, path, defaultVal));
            /** Attempts to assign value. Returns false if no such path
                With 'createMissingKeys=true' it creates any missing path elements: JFormDB.solveIntSetter(formKey, ".frostfall.keyB", 10, true) creates {frostfall: {keyB: 10}} structure */
            exports_10("solveFltSetter", solveFltSetter = (fKey, path, value, createMissingKeys = false) => sn.solveFltSetter(fKey, path, value, createMissingKeys));
            exports_10("solveIntSetter", solveIntSetter = (fKey, path, value, createMissingKeys = false) => sn.solveIntSetter(fKey, path, value, createMissingKeys));
            exports_10("solveBoolSetter", solveBoolSetter = (fKey, path, value, createMissingKeys = false) => sn.solveIntSetter(fKey, path, value ? 1 : 0, createMissingKeys));
            exports_10("solveStrSetter", solveStrSetter = (fKey, path, value, createMissingKeys = false) => sn.solveStrSetter(fKey, path, value, createMissingKeys));
            exports_10("solveObjSetter", solveObjSetter = (fKey, path, value, createMissingKeys = false) => sn.solveObjSetter(fKey, path, value, createMissingKeys));
            exports_10("solveFormSetter", solveFormSetter = (fKey, path, value, createMissingKeys = false) => sn.solveFormSetter(fKey, path, value, createMissingKeys));
            /** returns true, if capable resolve given path, e.g. it able to execute solve* or solver*Setter functions successfully */
            exports_10("hasPath", hasPath = (fKey, path) => sn.hasPath(fKey, path));
            /** JMap-like interface functions:
            
                returns new array containing all keys */
            exports_10("allKeys", allKeys = (fKey, key) => sn.allKeys(fKey, key));
            /** returns new array containing all values */
            exports_10("allValues", allValues = (fKey, key) => sn.allValues(fKey, key));
            /** returns value associated with key */
            exports_10("getInt", getInt = (fKey, key) => sn.getInt(fKey, key));
            exports_10("getFlt", getFlt = (fKey, key) => sn.getFlt(fKey, key));
            exports_10("getStr", getStr = (fKey, key) => sn.getStr(fKey, key));
            exports_10("getObj", getObj = (fKey, key) => sn.getObj(fKey, key));
            exports_10("getForm", getForm = (fKey, key) => sn.getForm(fKey, key));
            /** creates key-value association. replaces existing value if any */
            exports_10("setInt", setInt = (fKey, key, value) => sn.setInt(fKey, key, value));
            exports_10("setFlt", setFlt = (fKey, key, value) => sn.setFlt(fKey, key, value));
            exports_10("setStr", setStr = (fKey, key, value) => sn.setStr(fKey, key, value));
            exports_10("setObj", setObj = (fKey, key, container) => sn.setObj(fKey, key, container));
            exports_10("setForm", setForm = (fKey, key, value) => sn.setForm(fKey, key, value));
        }
    };
});
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skimpify-api", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JDB", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormDB", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JFormMap", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_11, context_11) {
    "use strict";
    var DmLib_2, JDB, JFormDB, JFormMap, skyrimPlatform_2, SkimpifyFramework, GetAllSkimpy, GetAllModest, HasSlip, GetSlip, HasChange, GetChange, HasDamage, GetDamage, HasModest, IsSkimpy, HasSkimpy, IsModest, IsRegistered, IsNotRegistered, SwapToSlip, SwapToChange, SwapToDamage, defaultType, DbHandle, cfgDir, fwKey, chestPath, ArmorK, ChangeK, JcChangeK, ClearDB, SetRel, HasKey, ValidateChangeRel;
    var __moduleName = context_11 && context_11.id;
    // ;>========================================================
    // ;>===                ARMOR FUNCTIONS                 ===<;
    // ;>========================================================
    /** Returns the closest _modest version_ of an `Armor`.
     *
     * @param a Armor to get the modest version from.
     * @returns An `Armor`, or `null | undefined` if the modest version doesn't exist.
     */
    function GetModest(a) {
        return GetArmor(a, "prev");
    }
    exports_11("GetModest", GetModest);
    /** Returns the closest _skimpy version_ of an `Armor`.
     *
     * @param a Armor to get the skimpy version from.
     * @returns An `Armor`, or `null | undefined` if the skimpy version doesn't exist.
     */
    function GetSkimpy(a) {
        return GetArmor(a, "next");
    }
    exports_11("GetSkimpy", GetSkimpy);
    /** Returns what kind of change an `Armor` has with its modest version.
     *
     * @param a `Armor` to see how it changes.
     * @returns The kind of change. `null` if there's no modest version.
     */
    function GetModestType(a) {
        return GetChangeType(a, "prev");
    }
    exports_11("GetModestType", GetModestType);
    /** Returns what kind of change an `Armor` has with its skimpier version.
     *
     * @param a `Armor` to see how it changes.
     * @returns The kind of change. `null` if there's no skimpier version.
     */
    function GetSkimpyType(a) {
        return GetChangeType(a, "next");
    }
    exports_11("GetSkimpyType", GetSkimpyType);
    /** Gets the {@link SkimpyData} for the modest version of an `Armor`.
     *
     * @param a The `Armor` to get the modest version from.
     * @returns The {@link SkimpyData} for the modest version of `a`.
     * The `armor` part of that data may be `null` if said armor doesn't exist.
     
     */
    function GetModestData(a) {
        return { armor: GetModest(a), kind: GetModestType(a) };
    }
    exports_11("GetModestData", GetModestData);
    /** Gets the {@link SkimpyData} for the skimpy version of an `Armor`.
     *
     * @param a The `Armor` to get the skimpy version from.
     * @returns The {@link SkimpyData} for the skimpy version of `a`.
     * The `armor` part of that data may be `null` if said armor doesn't exist.
     */
    function GetSkimpyData(a) {
        return { armor: GetSkimpy(a), kind: GetSkimpyType(a) };
    }
    exports_11("GetSkimpyData", GetSkimpyData);
    /** Returns the most modest version of an armor.
     * @param  {Armor} a Armor to check.
     * @param  {boolean} getBroken Return the most modest version even if the current one is broken? Default = `false`.
     * @returns Armor
     */
    function GetMostModest(a, getBroken = false) {
        const p = GetModestData(a);
        if (!p.armor)
            return null;
        if (p.kind === "damage" /* damage */ && !getBroken)
            return null;
        const pp = GetMostModest(p.armor);
        return pp ? pp : p.armor;
    }
    exports_11("GetMostModest", GetMostModest);
    function RestoreMostModest(act, skimpyArmor) {
        if (!act || !skimpyArmor)
            return false;
        const to = GetMostModest(skimpyArmor);
        if (!to)
            return false;
        GoModest(act, skimpyArmor, to);
        return true;
    }
    exports_11("RestoreMostModest", RestoreMostModest);
    function RestoreAllMostModest(act) {
        DmLib_2.FormLib.ForEachEquippedArmor(act, (a) => {
            RestoreMostModest(act, a);
        });
    }
    exports_11("RestoreAllMostModest", RestoreAllMostModest);
    // ;>========================================================
    // ;>===             RELATIONSHIP FUNCTIONS             ===<;
    // ;>========================================================
    /** Adds a _Change Relationship_ between two armors.\
     * ***WARNING***: this relationship is saved to the game.
     *
     * @param modest More modest version of some armor.
     * @param skimpy More skimpy version of that armor.
     * @param change What kind of change this relationship entails.
     */
    function AddChangeRel(modest, skimpy, change = "change" /* change */) {
        if (!modest || !skimpy)
            return;
        SetRel(modest, skimpy, "next", change);
        SetRel(skimpy, modest, "prev", change);
    }
    exports_11("AddChangeRel", AddChangeRel);
    /** Clears all _Change Relationships_ of some armor.
     *
     * @param a Armor to clear relationship to.
     */
    function ClearChangeRel(a) {
        const C = (parent, child) => {
            if (!parent || !child)
                return;
            SetRel(parent, null, "next", "change" /* change */);
            SetRel(child, null, "prev", "change" /* change */);
        };
        C(GetModest(a), a);
        C(a, GetSkimpy(a));
    }
    exports_11("ClearChangeRel", ClearChangeRel);
    /** Gets an Armor given an internal key.
     * This isn't meant to be used by final users.
     *
     * @param a Armors.
     * @param key Key from where we want to retrieve the armor from.
     * @returns `Armor` or `null | undefined`.
     */
    function GetArmor(a, key) {
        if (!a)
            return null;
        const r = JFormDB.solveForm(a, ArmorK(key));
        if (!r)
            return null;
        return skyrimPlatform_2.Armor.from(r);
    }
    function GetChangeType(a, key) {
        if (!a)
            return null;
        const r = JFormDB.solveStr(a, ChangeK(key), defaultType).toLowerCase();
        return r === "slip" /* slip */
            ? "slip" /* slip */
            : r === "damage" /* damage */
                ? "damage" /* damage */
                : "change" /* change */;
    }
    function NextByType(a, t) {
        const aa = GetSkimpy(a);
        if (!aa)
            return null;
        if (GetSkimpyType(a) === t)
            return aa;
        return null;
    }
    /** @experimental From all equipped armors, returns all the ones that have
     * other versions.
     *
     * @remarks
     * ***WARNING***. This function ***may*** be slow (not to Papyrus levels, of course) and
     * it's recommended to be used with caution in real production code.
     *
     * However, it can be safely used sparingly.
     *
     * @param a Actor to check armors from.
     * @param Next Function that will get the other versions.
     * @param Curr Function that returns the opposite of `Next`.
     * @returns An array with all equipped armors that have another version and the
     * array with those versions.
     */
    function GetAll(a, Next, Curr) {
        const aa = DmLib_2.FormLib.GetEquippedArmors(a);
        const n = aa.map((v) => Next(v)).filter((v) => v.armor);
        const c = n.map((v) => Curr(v.armor));
        return { current: c, next: n };
    }
    exports_11("GetAll", GetAll);
    /** Gets a global chest for storing armors from an `Actor`.
     * @remarks
     * To avoid bloat, this function returns `null` on non-unique actors so
     * they never get a chest.
     */
    function GetChest(a) {
        var _a;
        if (!((_a = a.getLeveledActorBase()) === null || _a === void 0 ? void 0 : _a.isUnique()))
            return null;
        /** Gets the handle to the chests database */
        const GetChestDbHandle = () => {
            const r = JDB.solveObj(chestPath);
            return r !== 0 ? r : JFormMap.object();
        };
        /** Saves the chest database by handle */
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
        const Logger = (msg) => skyrimPlatform_2.printConsole(`***Error on Skimpify Framework***: ${msg}`);
        return skyrimPlatform_2.ObjectReference.from(DmLib_2.FormLib.GetPersistentChest(Getter, Setter, Logger));
    }
    /** Swaps an armor on an actor. This function preserves the original armor
     * (tempering, enchantments...) by storing it in a special global chest.
     */
    function GoSkimpy(a, from, to) {
        const chest = GetChest(a);
        // Remove all possible lingering armors to avoid bugs because of duplicate items.
        if (chest)
            chest.removeItem(from, chest.getItemCount(from), true, null);
        a.removeItem(from, 1, true, chest);
        a.equipItem(to, false, true);
    }
    /** Swaps an skimpy armor for its modest version that was saved on a global chest. */
    function GoModest(a, from, to) {
        const chest = GetChest(a);
        // Skimpy armor is discarded because tempering and enchantments from original
        // can't be transferred, anyway.
        a.removeItem(from, 1, true, null);
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
            function (DmLib_2_1) {
                DmLib_2 = DmLib_2_1;
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
            function (skyrimPlatform_2_1) {
                skyrimPlatform_2 = skyrimPlatform_2_1;
            }
        ],
        execute: function () {
            /**
             *     █████╗ ██████╗ ██╗
             *    ██╔══██╗██╔══██╗██║
             *    ███████║██████╔╝██║
             *    ██╔══██║██╔═══╝ ██║
             *    ██║  ██║██║     ██║
             *    ╚═╝  ╚═╝╚═╝     ╚═╝
             *
             *  Public functions, constants and types.
             *  Use them as you please.
             *
             *  This file should be inside "Data\Platform\Modules".
             */
            (function (SkimpifyFramework) {
                /** Function to check if the player installed this framework.
                 * @example
                 *  if(SkimpifyFramework.IsInstalled()){
                 *    // Do all your magic
                 *  }
                 */
                SkimpifyFramework.IsInstalled = () => DbHandle() !== 0;
            })(SkimpifyFramework || (SkimpifyFramework = {}));
            exports_11("SkimpifyFramework", SkimpifyFramework);
            /** @experimental From all equipped armors, returns all the ones that have
             * skimpier versions.
             *
             * @remarks
             * ***WARNING***. This function ***may*** be slow (not to Papyrus levels, of course) and
             * it's recommended to be used with caution in real production code.
             *
             * However, it can be safely used sparingly.
             *
             * @param a Actor to check armors from.
             * @returns An array with all equipped armors that have an skimpy version and the
             * array with those versions.
             */
            exports_11("GetAllSkimpy", GetAllSkimpy = (a) => GetAll(a, GetSkimpyData, GetModestData));
            /** @experimental From all equipped armors, returns all the ones that have
             * more modest versions.
             *
             * @remarks
             * ***WARNING***. This function ***may*** be slow (not to Papyrus levels, of course) and
             * it's recommended to be used with caution in real production code.
             *
             * However, it can be safely used sparingly.
             *
             * @param a Actor to check armors from.
             * @returns An array with all equipped armors that have a modest version and the
             * array with those versions.
             */
            exports_11("GetAllModest", GetAllModest = (a) => GetAll(a, GetModestData, GetSkimpyData));
            /** Does this armor have a slip version?
             * @param  {ArmorArg} a Armor to check.
             */
            exports_11("HasSlip", HasSlip = (a) => GetSkimpyType(a) === "slip" /* slip */);
            /** If the skimpy version of an `Armor` is a `slip`, returns it.
             *
             * @param a Armor to check.
             * @returns The slip `Armor`. `null` if `a` has no Skimpy version or if it isn't a `slip`.
             */
            exports_11("GetSlip", GetSlip = (a) => NextByType(a, "slip" /* slip */));
            /** Does this armor have a changed version?
             * @param  {ArmorArg} a Armor to check.
             */
            exports_11("HasChange", HasChange = (a) => GetSkimpyType(a) === "change" /* change */);
            /** If the skimpy version of an `Armor` is a `change`, returns it.
             *
             * @param a Armor to check.
             * @returns The changed `Armor`. `null` if `a` has no Skimpy version or if it isn't a `change`.
             */
            exports_11("GetChange", GetChange = (a) => NextByType(a, "change" /* change */));
            /** Does this armor have a damaged version?
             * @param  {ArmorArg} a Armor to check.
             */
            exports_11("HasDamage", HasDamage = (a) => GetSkimpyType(a) === "damage" /* damage */);
            /** If the skimpy version of an `Armor` is a `damage`, returns it.
             *
             * @param a Armor to check.
             * @returns The damaged `Armor`. `null` if `a` has no Skimpy version or if it isn't a `damage`.
             */
            exports_11("GetDamage", GetDamage = (a) => NextByType(a, "damage" /* damage */));
            /** Checks if an armor has a registered modest version of itself. */
            exports_11("HasModest", HasModest = (a) => HasKey(a, "prev"));
            /** Checks if an armor is a registered skimpy version of another. */
            exports_11("IsSkimpy", IsSkimpy = HasModest);
            /** Checks if an armor has a registered skimpy version of itself. */
            exports_11("HasSkimpy", HasSkimpy = (a) => HasKey(a, "next"));
            /** Checks if an armor is a registered modest version of another. */
            exports_11("IsModest", IsModest = HasSkimpy);
            /** Checks if an armor has any registered variant of itself. */
            exports_11("IsRegistered", IsRegistered = (a) => HasSkimpy(a) || HasModest(a));
            /** Checks if an armor has any registered variant of itself. */
            exports_11("IsNotRegistered", IsNotRegistered = (a) => !HasSkimpy(a) && !HasModest(a));
            /** Swaps an equipped armor from an `Actor` to its slip version. Returns wether
             * the operation could be done or not.
             *
             * **THIS FUNCTION IS THE PREFERRED WAY TO SWAP ARMORS ON ACTORS**.
             *
             * @param  {ActorArg} act `Actor` to work on.
             * @param  {ArmorArg} modestArmor Armor to swap from.
             *
             * @remarks
             * If the actor is unique, this preserves the modest version of the armor on a special
             * chest, so tempering and enchantments are not lost.\
             * On non unique actors, their original armors will simply be discarded.
             */
            exports_11("SwapToSlip", SwapToSlip = (act, modestArmor) => SwapToSkimpy(act, modestArmor, GetSlip));
            /** Swaps an equipped armor from an `Actor` to its changed version. Returns wether
             * the operation could be done or not.
             *
             * **THIS FUNCTION IS THE PREFERRED WAY TO SWAP ARMORS ON ACTORS**.
             *
             * @param  {ActorArg} act `Actor` to work on.
             * @param  {ArmorArg} modestArmor Armor to swap from.
             *
             * @remarks
             * If the actor is unique, this preserves the modest version of the armor on a special
             * chest, so tempering and enchantments are not lost.\
             * On non unique actors, their original armors will simply be discarded.
             */
            exports_11("SwapToChange", SwapToChange = (act, modestArmor) => SwapToSkimpy(act, modestArmor, GetChange));
            /** Swaps an equipped armor from an `Actor` to its damaged version. Returns wether
             * the operation could be done or not.
             *
             * **THIS FUNCTION IS THE PREFERRED WAY TO SWAP ARMORS ON ACTORS**.
             *
             * @param  {ActorArg} act `Actor` to work on.
             * @param  {ArmorArg} modestArmor Armor to swap from.
             *
             * @remarks
             * If the actor is unique, this preserves the modest version of the armor on a special
             * chest, so tempering and enchantments are not lost.\
             * On non unique actors, their original armors will simply be discarded.
             */
            exports_11("SwapToDamage", SwapToDamage = (act, modestArmor) => SwapToSkimpy(act, modestArmor, GetDamage));
            /** Default type to assume what an armor version is when it has no associated/valid type. */
            exports_11("defaultType", defaultType = "change" /* change */);
            /** Direct handle to the JContainers DB. Don't use this if you don't know what you are doing. */
            exports_11("DbHandle", DbHandle = () => JDB.solveObj(fwKey));
            /** Dir where armor configuration files are located. */
            exports_11("cfgDir", cfgDir = "data/SKSE/Plugins/Skimpify Framework/");
            /** Key used to save values added by this framework. */
            fwKey = ".Skimpify-Framework";
            /** Key to find chests. */
            chestPath = `${fwKey}.globalChests`;
            /** Key used to save armors. */
            ArmorK = (k) => `${fwKey}.${k}`;
            /** Key used to save armor change relationships. */
            ChangeK = (k) => `${ArmorK(k)}T`;
            /** Key used to read armor change relationships from JContainers. */
            exports_11("JcChangeK", JcChangeK = (k) => `${k}T`);
            exports_11("ClearDB", ClearDB = () => JDB.setObj(fwKey, 0));
            /** Sets a _Change Relationship_ between two armors. */
            exports_11("SetRel", SetRel = (a1, a2, r, c) => {
                JFormDB.solveFormSetter(a1, ArmorK(r), a2, true); // Save form
                JFormDB.solveStrSetter(a1, ChangeK(r), c, true); // Save change type
            });
            /** Checks if an armor has a registered variant. */
            HasKey = (a, r) => !a ? false : JFormDB.solveForm(a, ArmorK(r)) !== null;
            /** Ensures a string is a valid {@link ChangeRel}. Returns {@link defaultType} if string was invalid. */
            exports_11("ValidateChangeRel", ValidateChangeRel = (rel) => rel.toLowerCase() === "slip" /* slip */
                ? "slip" /* slip */
                : rel.toLowerCase() === "damage" /* damage */
                    ? "damage" /* damage */
                    : defaultType);
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/src/genJson", ["Skyrim SE/MO2/mods/Skimpify Framework-src/src/debug", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JTs", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/PapyrusUtil/MiscUtil", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skimpify-api", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_12, context_12) {
    "use strict";
    var debug_1, DmLib_3, JTs_1, MiscUtil_1, skimpify_api_1, skyrimPlatform_3, LogR, AddVal, ArmorUniqueId, GetUniqueId, AddKey, autoN, skimpyNames;
    var __moduleName = context_12 && context_12.id;
    /** Saves all registered armors to json files. */
    function SaveJson() {
        const m = new Map();
        JTs_1.JFormMapL.ForAllKeys(skimpify_api_1.DbHandle(), (k) => {
            var _a;
            const a = skyrimPlatform_3.Armor.from(k);
            if (!a)
                return;
            const n = skimpify_api_1.GetSkimpyData(a);
            if (!n.armor)
                return; // No need to write to file an armor with no children
            const curr = DmLib_3.FormLib.GetFormEspAndId(a);
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
    exports_12("SaveJson", SaveJson);
    function AutoGenArmors() {
        debug_1.LogN("\n");
        debug_1.LogN("=================================");
        debug_1.LogN("Generating armors for exporting");
        debug_1.LogN("=================================");
        autoN = 0;
        GenSkimpyGroupsByName(GetInventoryArmors());
        skyrimPlatform_3.Debug.messageBox(`Data for ${autoN} pairs of armors in inventory has been automatically generated.

  Now you can test in game if things are as you expected, then you can export them to json.`);
    }
    exports_12("AutoGenArmors", AutoGenArmors);
    function GetInventoryArmors() {
        debug_1.LogN("Armors in inventory:\n");
        const r = new Array();
        DmLib_3.FormLib.ForEachArmorR(skyrimPlatform_3.Game.getPlayer(), (a) => {
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
        const info = DmLib_3.FormLib.GetFormEspAndId(a);
        return {
            esp: info.modName,
            name: debug_1.LogNT("", a.getName()),
            id: info.fixedFormId,
            armor: a,
            uId: debug_1.LogNT("", GetUniqueId(info.modName, info.fixedFormId), L),
        };
    }
    function PreprocessName(n, search) {
        // LogI(`-------- ${search} ${n}`)
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
        // This assumes the armor list is alphabetically sorted
        while (armors.length > 1) {
            // Put the _tentative_ base armor in some array with its possible matches
            let matches = new Array();
            matches.push(armors[0]);
            // Take out all armors that share the same name as the base
            const n = armors[0].name;
            while (armors.length > 1 && armors[1].name.indexOf(n) >= 0) {
                // Put them in a new array
                matches.push(armors.splice(1, 1)[0]);
            }
            // Process matching items
            ProcessMatches(matches, output);
            // Delete the tentative base armor
            armors.shift();
            // Do the same for all elements in the list
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
        // Sorting by word length makes it easier to get correct matches
        m = m.sort((a, b) => a.name.length - b.name.length);
        m.forEach((a, i) => debug_1.LogV(`${a.name}${i === n - 1 ? "\n" : ""}`));
        /** If some element of the list contains some word, adds a relationship with
         * both the start of this list and that element.
         */
        const TestWord = (s, rel = "change" /* change */) => {
            let fIdx = 0;
            /** Checks if next items' name end with some particular word */
            const CheckFor = (s) => m.slice(1).some((a, i) => {
                // Find searched word after the end of the base
                const t = a.name.toLowerCase().indexOf(s, l) > -1;
                fIdx = t ? i + 1 : 0;
                return t;
            });
            if (!CheckFor(s))
                return false;
            debug_1.LogI(`*** ${m[fIdx].name} is a(n) "${s}" variant.\n`);
            MakeChild(m[0], m[fIdx], rel, output);
            const b = m.splice(fIdx, 1); // Move match to start of list
            m.splice(0, 1); // Delete first element
            // Process again the rest of the list
            ProcessMatches(b.concat(m), output);
            return true;
        };
        // Test for relationships with next elements. Give priority to items with names containing "slut"
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
        // Child is different to what was already registered. Return new relationship.
        if (armor && armor.getFormID() !== c.armor.getFormID())
            return LogR(L(), r);
        // Return old relationship if it exists. Otherwise, return new.
        return kind && kind !== skimpify_api_1.defaultType ? kind : r;
    }
    function MakeChild(parent, child, relationship, output, saveToMem = true) {
        // Test if Change Relationship already exists.
        const ch = ChangeExists(parent, child, relationship);
        // Add relationship
        parent.next = child.uId;
        parent.nextT = ch;
        child.prev = parent.uId;
        child.prevT = ch;
        // Add it to memory, so player can test changes right away
        if (saveToMem)
            skimpify_api_1.AddChangeRel(parent.armor, child.armor, ch);
        autoN++;
        debug_1.LogI(`${child.name} is now registered as a skimpy version of ${parent.name}. Change type: ${ch}.\n`);
    }
    function OutputMapToJSon(m) {
        /** Transforms an ArmorData[] to an object with armor unique ids as object properties. */
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
        skyrimPlatform_3.Debug.messageBox(`All data was saved to their respective Json files in "data/SKSE/Plugins/Skimpify Framework".`);
    }
    return {
        setters: [
            function (debug_1_1) {
                debug_1 = debug_1_1;
            },
            function (DmLib_3_1) {
                DmLib_3 = DmLib_3_1;
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
            function (skyrimPlatform_3_1) {
                skyrimPlatform_3 = skyrimPlatform_3_1;
            }
        ],
        execute: function () {
            LogR = DmLib_3.DebugLib.Log.R;
            AddVal = (esp, m, v) => {
                const k = esp;
                const a = m.get(k);
                a.push(v);
                m.set(k, a);
            };
            ArmorUniqueId = (a) => !a ? undefined : DmLib_3.FormLib.GetFormUniqueId(a, GetUniqueId);
            GetUniqueId = (esp, fixedFormId) => `${esp}|${fixedFormId.toString(16)}`;
            // Add keys to the json file they should be output to.
            AddKey = (k, output) => {
                if (!output.has(k))
                    output.set(k, []);
            };
            /** Number of automatically generated armors. */
            autoN = 0;
            skimpyNames = [
                { search: "slutty", rel: "change" /* change */ },
                { search: "slut", rel: "change" /* change */ },
                { search: "xtra", rel: "change" /* change */ },
                { search: "naked", rel: "change" /* change */ },
                { search: "nude", rel: "change" /* change */ },
                { search: "topless", rel: "change" /* change */ },
                { search: "sex", rel: "change" /* change */ },
                { search: "damaged", rel: "damage" /* damage */ },
                { search: "damage", rel: "damage" /* damage */ },
                { search: "broken", rel: "damage" /* damage */ },
                { search: "broke", rel: "damage" /* damage */ },
            ];
        }
    };
});
/*
This file was automatically generated by Papyrus-2-Typescript.exe
https://github.com/CarlosLeyvaAyala/Papyrus-2-Typescript

The program has no way to know the intention of the humans that made
the scripts, so it's always advisable to manually check all generated
files to make sure everything is declared as it should.

Take note the program assumes this script exists in some subfolder
to the folder where `skyrimPlatform.ts` is found, otherwise you'll get
"Cannot find module..." type of errors.

If you want to have this script in some other place, just change the
relative path of each `import`.
*/
System.register("SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JValue", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform"], function (exports_13, context_13) {
    "use strict";
    var sp, sn, enableAPILog, retain, release, releaseAndRetain, releaseObjectsWithTag, zeroLifetime, addToPool, cleanPool, shallowCopy, deepCopy, isExists, isArray, isMap, isFormMap, isIntegerMap, empty, count, clear, readFromFile, readFromDirectory, objectFromPrototype, writeToFile, solvedValueType, hasPath, solveFlt, solveInt, solveStr, solveObj, solveForm, solveFltSetter, solveIntSetter, solveStrSetter, solveObjSetter, solveFormSetter, evalLuaFlt, evalLuaInt, evalLuaStr, evalLuaObj, evalLuaForm;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (sp_7) {
                sp = sp_7;
            }
        ],
        execute: function () {
            /** Common functionality, shared by JArray, JMap, JFormMap, JIntMap */
            sn = sp.JValue;
            /** Most call entries made to JC will be logged. Heavy traffic, by default is disabled.
                Not thread safe for multiple users (though harmless). */
            exports_13("enableAPILog", enableAPILog = (arg0) => sn.enableAPILog(arg0));
            /** --- Lifetime management functionality.
                Read this https://github.com/ryobg/JContainers/wiki/Lifetime-Management before using any of lifetime management functions
                
                Retains and returns the object. */
            exports_13("retain", retain = (object, tag = "") => sn.retain(object, tag));
            /** Releases the object and returns zero, so you can release and nullify with one line of code: object = JValue.release(object) */
            exports_13("release", release = (object) => sn.release(object));
            /** Just a union of retain-release calls. Releases @previousObject, retains and returns @newObject. */
            exports_13("releaseAndRetain", releaseAndRetain = (previousObject, newObject, tag = "") => sn.releaseAndRetain(previousObject, newObject, tag));
            /** Releases all objects tagged with @tag.
                Internally invokes JValue.release on each object same amount of times it has been retained. */
            exports_13("releaseObjectsWithTag", releaseObjectsWithTag = (tag) => sn.releaseObjectsWithTag(tag));
            /** Minimizes the time JC temporarily owns the object, returns the object.
                By using this function you help JC to delete unused objects as soon as possible.
                Has zero effect if the object is being retained or if another object contains/references it. */
            exports_13("zeroLifetime", zeroLifetime = (object) => sn.zeroLifetime(object));
            /** Handly for temporary objects (objects with no owners) - the pool 'locationName' owns any amount of objects, preventing their destuction, extends lifetime.
                Do not forget to clean the pool later! Typical use:
                int jTempMap = JValue.addToPool(JMap.object(), "uniquePoolName")
                int jKeys = JValue.addToPool(JMap.allKeys(someJMap), "uniquePoolName")
                and anywhere later:
                JValue.cleanPool("uniquePoolName") */
            exports_13("addToPool", addToPool = (object, poolName) => sn.addToPool(object, poolName));
            exports_13("cleanPool", cleanPool = (poolName) => sn.cleanPool(poolName));
            /** --- Mics. functionality
                
                Returns shallow copy (won't copy child objects) */
            exports_13("shallowCopy", shallowCopy = (object) => sn.shallowCopy(object));
            /** Returns deep copy */
            exports_13("deepCopy", deepCopy = (object) => sn.deepCopy(object));
            /** Tests whether given object identifier is not the null object.
                Note that many other API functions already check that too. */
            exports_13("isExists", isExists = (object) => sn.isExists(object));
            /** Returns true if the object is map, array or formmap container */
            exports_13("isArray", isArray = (object) => sn.isArray(object));
            exports_13("isMap", isMap = (object) => sn.isMap(object));
            exports_13("isFormMap", isFormMap = (object) => sn.isFormMap(object));
            exports_13("isIntegerMap", isIntegerMap = (object) => sn.isIntegerMap(object));
            /** Returns true, if the container is empty */
            exports_13("empty", empty = (object) => sn.empty(object));
            /** Returns amount of items in the container */
            exports_13("count", count = (object) => sn.count(object));
            /** Removes all items from the container */
            exports_13("clear", clear = (object) => sn.clear(object));
            /** JSON serialization/deserialization:
                
                Creates and returns a new container object containing contents of JSON file */
            exports_13("readFromFile", readFromFile = (filePath) => sn.readFromFile(filePath));
            /** Parses JSON files in a directory (non recursive) and returns JMap containing {filename, container-object} pairs.
                Note: by default it does not filter files by extension and will try to parse everything */
            exports_13("readFromDirectory", readFromDirectory = (directoryPath, extension = "") => sn.readFromDirectory(directoryPath, extension));
            /** Creates a new container object using given JSON string-prototype */
            exports_13("objectFromPrototype", objectFromPrototype = (prototype) => sn.objectFromPrototype(prototype));
            /** Writes the object into JSON file */
            exports_13("writeToFile", writeToFile = (object, filePath) => sn.writeToFile(object, filePath));
            /** Returns type of resolved value. 0 - no value, 1 - none, 2 - int, 3 - float, 4 - form, 5 - object, 6 - string */
            exports_13("solvedValueType", solvedValueType = (object, path) => sn.solvedValueType(object, path));
            /** Path resolving:
                
                Returns true, if it's possible to resolve given path, i.e. if it's possible to retrieve the value at the path.
                For ex. JValue.hasPath(container, ".player.health") will test whether @container structure close to this one - {'player': {'health': health_value}} */
            exports_13("hasPath", hasPath = (object, path) => sn.hasPath(object, path));
            /** Attempts to retrieve value at given path. If fails, returns @default value */
            exports_13("solveFlt", solveFlt = (object, path, defaultVal = 0.0) => sn.solveFlt(object, path, defaultVal));
            exports_13("solveInt", solveInt = (object, path, defaultVal = 0) => sn.solveInt(object, path, defaultVal));
            exports_13("solveStr", solveStr = (object, path, defaultVal = "") => sn.solveStr(object, path, defaultVal));
            exports_13("solveObj", solveObj = (object, path, defaultVal = 0) => sn.solveObj(object, path, defaultVal));
            exports_13("solveForm", solveForm = (object, path, defaultVal = null) => sn.solveForm(object, path, defaultVal));
            /** Attempts to assign the value. If @createMissingKeys is False it may fail to assign - if no such path exist.
                With 'createMissingKeys=true' it creates any missing path element: solveIntSetter(map, ".keyA.keyB", 10, true) on empty JMap creates {keyA: {keyB: 10}} structure */
            exports_13("solveFltSetter", solveFltSetter = (object, path, value, createMissingKeys = false) => sn.solveFltSetter(object, path, value, createMissingKeys));
            exports_13("solveIntSetter", solveIntSetter = (object, path, value, createMissingKeys = false) => sn.solveIntSetter(object, path, value, createMissingKeys));
            exports_13("solveStrSetter", solveStrSetter = (object, path, value, createMissingKeys = false) => sn.solveStrSetter(object, path, value, createMissingKeys));
            exports_13("solveObjSetter", solveObjSetter = (object, path, value, createMissingKeys = false) => sn.solveObjSetter(object, path, value, createMissingKeys));
            exports_13("solveFormSetter", solveFormSetter = (object, path, value, createMissingKeys = false) => sn.solveFormSetter(object, path, value, createMissingKeys));
            /** Evaluates piece of lua code. Lua support is experimental */
            exports_13("evalLuaFlt", evalLuaFlt = (object, luaCode, defaultVal = 0.0) => sn.evalLuaFlt(object, luaCode, defaultVal));
            exports_13("evalLuaInt", evalLuaInt = (object, luaCode, defaultVal = 0) => sn.evalLuaInt(object, luaCode, defaultVal));
            exports_13("evalLuaStr", evalLuaStr = (object, luaCode, defaultVal = "") => sn.evalLuaStr(object, luaCode, defaultVal));
            exports_13("evalLuaObj", evalLuaObj = (object, luaCode, defaultVal = 0) => sn.evalLuaObj(object, luaCode, defaultVal));
            exports_13("evalLuaForm", evalLuaForm = (object, luaCode, defaultVal = null) => sn.evalLuaForm(object, luaCode, defaultVal));
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/src/entry", ["SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/DmLib", "Skyrim SE/MO2/mods/Skimpify Framework-src/src/genJson", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JDB", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JMap", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JTs", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/JContainers/JValue", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skimpify-api", "SteamLibrary/steamapps/common/Skyrim Special Edition/Data/Platform/Modules/skyrimPlatform", "Skyrim SE/MO2/mods/Skimpify Framework-src/src/debug"], function (exports_14, context_14) {
    "use strict";
    var DmLib_4, genJson_1, JDB, JMap, JTs_2, JValue, skimpify_api_2, skyrimPlatform_4, debug_2, invalid, initK, MarkInitialized, WasInitialized, storeK, MemOnly, SK, kIni, kMModest, SIni, SMModest, allowInit, mModest, n, develop, hk, FO, HK, Player, Armors, Load, Mark;
    var __moduleName = context_14 && context_14.id;
    function main() {
        skyrimPlatform_4.on("loadGame", () => {
            InitPlugin();
            allowInit = SIni(true);
        });
        skyrimPlatform_4.once("update", () => {
            if (allowInit || !WasInitialized())
                InitPlugin();
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
        skyrimPlatform_4.on("update", () => {
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
        skyrimPlatform_4.printConsole(`Skimpify Framework successfully initialized${i}.`);
    }
    exports_14("main", main);
    function RunTest() {
        // const p = FormLib.Player()
        // SwapToSlip(p, Armor.from(p.getWornForm(SlotMask.Body)))
        // FormLib.WaitActor(p, 4, (a) => {
        //   RestoreMostModest(a, Armor.from(a.getWornForm(SlotMask.Body)))
        // })
        Player.Reveal();
    }
    function Dump() {
        // ClearDB()
        const f = `${skimpify_api_2.cfgDir}dump/dump.json`;
        JValue.writeToFile(skimpify_api_2.DbHandle(), f);
        JDB.writeToFile(`${skimpify_api_2.cfgDir}dump/dump all.json`);
        skyrimPlatform_4.Debug.messageBox(`File was dumped to ${f}`);
    }
    return {
        setters: [
            function (DmLib_4_1) {
                DmLib_4 = DmLib_4_1;
            },
            function (genJson_1_1) {
                genJson_1 = genJson_1_1;
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
            function (skimpify_api_2_1) {
                skimpify_api_2 = skimpify_api_2_1;
            },
            function (skyrimPlatform_4_1) {
                skyrimPlatform_4 = skyrimPlatform_4_1;
            },
            function (debug_2_1) {
                debug_2 = debug_2_1;
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
            // Avoid values to be lost on game reloading
            SIni = DmLib_4.Misc.PreserveVar(MemOnly, kIni);
            SMModest = DmLib_4.Misc.PreserveVar(MemOnly, kMModest);
            allowInit = skyrimPlatform_4.storage[kIni] || false;
            mModest = skyrimPlatform_4.storage[kMModest];
            n = "skimpify-framework";
            develop = skyrimPlatform_4.settings[n]["developerMode"];
            hk = "devHotkeys";
            FO = (k) => DmLib_4.Hotkeys.FromObject(n, hk, k);
            /** Gets a hotkey from settings */
            HK = (k) => DmLib_4.Hotkeys.ListenTo(FO(k), develop);
            /**Functions made for playing */
            (function (Player) {
                const SkimpyAt = (a) => {
                    if (skimpify_api_2.HasSlip(a))
                        return "slip" /* slip */;
                    if (skimpify_api_2.HasChange(a))
                        return "change" /* change */;
                    return undefined;
                };
                const TrySkimpify = (slot) => {
                    const p = DmLib_4.FormLib.Player();
                    const a = skyrimPlatform_4.Armor.from(p.getWornForm(slot));
                    const t = SkimpyAt(a);
                    if (!t)
                        return false;
                    if (t === "slip" /* slip */)
                        skimpify_api_2.SwapToSlip(p, a);
                    if (t === "change" /* change */)
                        skimpify_api_2.SwapToChange(p, a);
                    // Armor.swa
                };
                /** Makes the player use revealing clothes. Gives preference to torso, then boots, skirts...*/
                function Reveal() {
                    if (TrySkimpify(4 /* Body */))
                        return;
                    if (TrySkimpify(524288 /* PelvisPrimary */))
                        return;
                    if (TrySkimpify(4194304 /* PelvisSecondary */))
                        return;
                    DmLib_4.FormLib.ForEachEquippedSlotMask(DmLib_4.FormLib.Player(), (slot) => TrySkimpify(slot));
                    // const all = FormLib.GetEquippedArmors(p)
                }
                Player.Reveal = Reveal;
            })(Player || (Player = {}));
            (function (Armors) {
                /** Unequips all armor on the player. */
                function UnequipAll() {
                    const pl = skyrimPlatform_4.Game.getPlayer();
                    // Don't use unequipAll() because it doesn't discriminate on what it will unequip
                    const aa = DmLib_4.FormLib.GetEquippedArmors(pl);
                    aa.forEach((a) => {
                        pl.unequipItem(a, false, true);
                    });
                }
                Armors.UnequipAll = UnequipAll;
                /** Swap an armor on an actor. */
                Armors.SwapArmor = (act, from, to) => {
                    act.unequipItem(from, false, true);
                    act.equipItem(to, false, true);
                };
                /** Changes all equipped armors to their skimpier counterparts. */
                Armors.AllSkimpy = () => ChangeAll(skimpify_api_2.GetAllSkimpy);
                /** Changes all equipped armors to their modest counterparts. */
                Armors.AllModest = () => ChangeAll(skimpify_api_2.GetAllModest);
                /** Swaps all armors the player is using for some variant. */
                function ChangeAll(f) {
                    const pl = skyrimPlatform_4.Game.getPlayer();
                    const aa = f(pl);
                    aa.current.forEach((a, i) => {
                        Armors.SwapArmor(pl, a.armor, aa.next[i].armor);
                        if (a.kind)
                            skyrimPlatform_4.Debug.notification(a.kind);
                    });
                }
                /** Deletes all armors in player inventory. */
                function Discard() {
                    const p = skyrimPlatform_4.Game.getPlayer();
                    DmLib_4.FormLib.ForEachArmorR(p, (a) => {
                        p.removeItem(a, p.getItemCount(a), true, null);
                    });
                    skyrimPlatform_4.Debug.messageBox(`All armors in the player inventory were deleted.`);
                }
                Armors.Discard = Discard;
            })(Armors || (Armors = {}));
            (function (Load) {
                function Armors() {
                    // Read from all files
                    const d = JValue.readFromDirectory(skimpify_api_2.cfgDir, ".json");
                    let n = 0;
                    // JValue.writeToFile(d, `${cfgDir}dump/dump load.json`)
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
                        skyrimPlatform_4.Debug.messageBox(m);
                    skyrimPlatform_4.printConsole(m);
                }
                Load.Armors = Armors;
                function SaveVariant(parent, data, rel) {
                    const n = StrToArmor(JMap.getStr(data, rel));
                    if (!n)
                        return; // Don't save inexisting variants
                    const c = JMap.getStr(data, skimpify_api_2.JcChangeK(rel));
                    const cT = skimpify_api_2.ValidateChangeRel(c);
                    skimpify_api_2.AddChangeRel(parent, n, cT);
                }
                function StrToArmor(s) {
                    if (!s)
                        return null;
                    const [esp, id] = s.split("|");
                    const f = skyrimPlatform_4.Game.getFormFromFile(parseInt(id, 16), esp);
                    return skyrimPlatform_4.Armor.from(f);
                }
            })(Load || (Load = {}));
            /** Functions for marking armors in manual mode. All of these only work on
             * armors the player is wearing.
             */
            (function (Mark) {
                /** Does an operation only if the player has equipped one armor.
                 *
                 * @param Continue What to do if only one piece of armor is equipped.
                 */
                function OnlyOneArmor(Continue) {
                    const aa = DmLib_4.FormLib.GetEquippedArmors(skyrimPlatform_4.Game.getPlayer());
                    aa.forEach((v) => debug_2.LogV(`${DmLib_4.DebugLib.Log.IntToHex(v.getFormID())}. Slot: ${v.getSlotMask()}. Name: ${v.getName()}`));
                    if (aa.length !== 1) {
                        skyrimPlatform_4.Debug.messageBox(`This functionality only works with just one piece of armor equipped.
        Equip only the piece you want to work on.`);
                        return;
                    }
                    Continue(aa[0]);
                }
                /** Manually adds a _Change Relationship_ between a marked piece of armor and the one the player is wearing.
                 *
                 * @param c What kind of _Change Relationship_ will be added between two armors.
                 */
                function Child(c) {
                    OnlyOneArmor((a) => {
                        const ShowInvalid = () => {
                            const m = `Can't create a Change Relationship because a modest version for this armor hasn't been set.

        Please mark one by using the "hkMarkModest" hotkey when having such armor equipped.`;
                            skyrimPlatform_4.Debug.messageBox(m);
                        };
                        if (mModest === invalid)
                            return ShowInvalid();
                        const p = skyrimPlatform_4.Armor.from(skyrimPlatform_4.Game.getFormEx(mModest));
                        if (!p)
                            return ShowInvalid();
                        skimpify_api_2.AddChangeRel(p, a, c);
                        const m = `"${a.getName()}" was added as a skimpier version of ${p.getName()} with Change Relationship "${c}"`;
                        skyrimPlatform_4.Debug.messageBox(m);
                        mModest = SMModest(invalid);
                    });
                }
                /** Marks a `slip` relationship between two armors. */
                Mark.Slip = () => Child("slip" /* slip */);
                /** Marks a `change` relationship between two armors. */
                Mark.Change = () => Child("change" /* change */);
                /** Marks a `damage` relationship between two armors. */
                Mark.Damage = () => Child("damage" /* damage */);
                /** Marks the armor the player is using as the modest version of another. */
                function Modest() {
                    OnlyOneArmor((a) => {
                        const m = `"${a.getName()}" was marked as a modest version of some armor.
      Mark another piece to create a Change Relationship.`;
                        skyrimPlatform_4.Debug.messageBox(m);
                        mModest = debug_2.LogVT("Manual mode. Modest armor id", SMModest(a.getFormID()), DmLib_4.DebugLib.Log.IntToHex);
                    });
                }
                Mark.Modest = Modest;
                /** Clears all _Change Relationships_ of the current weared armor. */
                function Clear() {
                    OnlyOneArmor((a) => {
                        skimpify_api_2.ClearChangeRel(a);
                        const m = `"${a.getName()}" was cleared from all its Change Relationships.`;
                        skyrimPlatform_4.Debug.messageBox(m);
                    });
                }
                Mark.Clear = Clear;
                /** Show info about the armor the player is currently wearing. */
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
                        skyrimPlatform_4.Debug.messageBox(m);
                    });
                }
                Mark.DebugOne = DebugOne;
            })(Mark || (Mark = {}));
        }
    };
});
System.register("Skyrim SE/MO2/mods/Skimpify Framework-src/index", ["Skyrim SE/MO2/mods/Skimpify Framework-src/src/entry"], function (exports_15, context_15) {
    "use strict";
    var entry;
    var __moduleName = context_15 && context_15.id;
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
