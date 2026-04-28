# PHASE 4 — slab layout constants

## Scope

Constants verified against wrapper sources (without binary probing):
- HEADER_LEN, CONFIG_LEN, ENGINE_OFF, RISK_BUF_OFF, GEN_TABLE_OFF, SLAB_LEN.

## Wrapper-side definitions (both v12.17 and v12.19)

```
HEADER_LEN = size_of::<SlabHeader>()
CONFIG_LEN = size_of::<MarketConfig>()
ENGINE_OFF = align_up(HEADER_LEN + CONFIG_LEN, ENGINE_ALIGN)  // ENGINE_ALIGN = 16 native, 8 SBF
ENGINE_LEN = size_of::<RiskEngine>()
RISK_BUF_OFF = ENGINE_OFF + ENGINE_LEN
GEN_TABLE_OFF = RISK_BUF_OFF + RISK_BUF_LEN
SLAB_LEN = GEN_TABLE_OFF + GEN_TABLE_LEN
```

This means SLAB_LEN is `size_of::<>()` driven and depends on the engine
struct contents at compile time. Cannot verify exact byte sizes without
either compiling the wrapper or reading the struct definitions field-by-
field.

## SDK constants per slab.ts

`src/solana/slab.ts` enumerates per-version constants:

| version | ENGINE_OFF (native) | ENGINE_OFF (SBF) | ACCOUNT_SIZE (native) | ACCOUNT_SIZE (SBF) | RISK_BUF_LEN |
|:---|---:|---:|---:|---:|---:|
| V12_17 | 592 | 584 | 368 | 352 | 160 |
| V12_19 | NOT PRESENT | NOT PRESENT | NOT PRESENT | NOT PRESENT | n/a |

The SDK has no V12_19 layout constants. Per audit-2026-04-27/v12.19-diff.md
the v12.19 wrapper shifted vault offset 600 → 616 (engine struct grew by
16 bytes), so V12_19_ENGINE_OFF should be V12_17_ENGINE_OFF + 16 = 608
(native) / 600 (SBF). NOT modeled in SDK.

## Severity

`detectSlabLayout` (src/solana/slab.ts:1841) does not return v12.19 layouts.
A consumer reading a v12.19 slab account would get one of:
- `null` (if dataLen doesn't match any v12.17 size).
- a stale V12_17 layout (if a v12.19 size happens to collide with a v12.17
  size — unlikely but not verified).

Either result causes parser drift downstream.

**Status:** **LAYOUT_DRIFT_BLOCKING for v12.19 read paths.** SDK consumers
who try to read a v12.19 slab today get null or wrong fields. v12.17 reads
are unaffected.

## Vault offset (closeout report claim: 600 → 616 in v12.19)

Wrapper v12.17 vault offset within engine: not directly visible without
compiling. Closeout report at audit-2026-04-27/v12.19-diff.md cites 600.

Wrapper v12.19 vault offset: per closeout commit message
`tests(conservation): vault offset 600 -> 616 (v12.19 engine layout +16)`
the offset moved.

SDK reads vault via `state.getVaultAddr` or via parseEngine fields. Without
exhaustively walking parseEngine, the v12.19 offset shift is structurally
unmodeled. Same severity as the missing layout above.

## SDK SLAB_LEN constants (V12_17 only)

`V12_17_SIZES` map at src/solana/slab.ts (around L800 region) maps tier sizes
to maxAccounts. The audit-2026-04-27 STAGE I noted that the closeout report
referenced "1_525_720 (v12.19)" vs "1_484_728 (v12.17 default)". SDK only
enumerates v12.17 sizes, so detectSlabLayout never matches v12.19 slabs.

## Verdict

| layout | sdk coverage | drift |
|:---|:---|:---|
| V12_17 native | constants present | not exhaustively verified field-by-field; structurally plausible |
| V12_17 SBF | constants present | same |
| V12_19 native | **MISSING** | LAYOUT_DRIFT_BLOCKING |
| V12_19 SBF | **MISSING** | LAYOUT_DRIFT_BLOCKING |

The v12.19 layout gap is consistent with audit-2026-04-27/STAGE_II_FINAL.md
which explicitly defers layout-level v12.19 detection to a follow-up
release. So this is a known-deferred gap, but for verification purposes it
is still a LAYOUT_DRIFT_BLOCKING issue today.
