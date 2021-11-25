import { DebugLib } from "DmLib"

const L = DebugLib.Log
const fs = DebugLib.Log.CreateAll(
  "Skimpify Framework",
  L.Level.verbose,
  L.ConsoleFmt
  // L.FileFmt
)

/** Log at `none` level. Basically, ignore logging settings, except when using special modes. */
export const LogN = fs.None
/** Log at `none` level and return value. */
export const LogNT = fs.TapN

export const LogI = fs.Info
export const LogIT = fs.TapI

/** Log at verbose level. */
export const LogV = fs.Verbose
/** Log at verbose level and return value. */
export const LogVT = fs.TapV
