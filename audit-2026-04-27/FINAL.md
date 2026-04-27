# SDK audit 2026-04-27 — FINAL

Three stages complete. SDK at `2.0.0-rc.0` on branch `sync/v12.19-sdk`.

## Verdict

GO across all three stages. 832 PASS / 31 SKIPPED. Zero lint errors.
Both build entries emitted (dist/index.js, dist/vanilla.js).

## State at session end

| repo | head | status |
|:---|:---|:---|
| sdk | `sync/v12.19-sdk` | 2.0.0-rc.0 (tag), beta.39-presync (tag), beta.38 (on `main` via `d1f908a`) |
| wrapper | `d760fc4` | unchanged this session |
| engine | `c32bc0b` | unchanged this session |

## Three stages summary

### STAGE I → 1.0.0-beta.38 on `main`

Coverage and correctness audit on v12.17.7 line.

- Added `IX_TAG.UpdateAuthority = 83` and `encodeUpdateAuthority` (G-2).
- Added 4 missing per-account encoders: `encodeReclaimEmptyAccount`,
  `encodeSettleAccount`, `encodeDepositFeeCredits`,
  `encodeConvertReleasedPnl` (G-3).
- Added 6 ACCOUNTS_ specs (G-3 + G-4).
- Added 27 byte-level parity tests + coverage gate.
- Updated `specs/wrapper-tags.json` and parity-fixtures sdkMap with tag 83.
- Documented v12.17 vs v12.19 UpdateConfig wire-format split (G-1 deferred).

Tests: 782 → 809 PASS. Final report: `STAGE_I_FINAL.md`.

### STAGE II → 1.0.0-beta.39-presync on `sync/v12.19-sdk`

v12.19 forward-port + v12.20 prep.

- Branch policy: cut on `sync/v12.19-sdk` because PR #88 + #271 still
  OPEN MERGEABLE. Tag `beta.39-presync`. NPM publish blocked.
- Added `WrapperTarget` type.
- `encodeUpdateConfig` accepts `target: 'v12.19'` to append
  `tvlInsuranceCapMult: u16` (33 → 35 bytes).
- `encodeInitMarket` accepts `target: 'v12.19'` to drop
  `maxInsuranceFloor + minOraclePriceCap + minInitialDeposit`
  (344 → 304 bytes).
- PERC-628 shared vault encoders (tags 59-63) un-throw under
  `target: 'v12.19'`. Default still throws.
- Added 17 v12.19 byte-parity tests.
- Wrote `v12.19-diff.md` (full wire-format and layout diff) and
  `v12.20-design-notes.md` (migration plan for c175ec4 / f04720e /
  5229c1c).

Tests: 809 → 826 PASS. Final report: `STAGE_II_FINAL.md`.

### STAGE III → 2.0.0-rc.0 on `sync/v12.19-sdk`

Two-flavor package split.

- New `@percolatorct/sdk/vanilla` subpath with the 27-instruction
  v12.17.7 surface. Bundle 28 KB vs full SDK 265 KB.
- Decision: option (2) single-repo multi-entry. Rationale at
  `STAGE_III_DECISION.md`.
- `src/vanilla.ts` re-exports the documented vanilla subset.
- `package.json` `exports` field maps `./vanilla` to dist/vanilla.{d.ts,js}.
- `tsup.config.ts` emits both entry points.
- `test/vanilla.test.ts` enforces export-set invariant: 6 tests asserting
  every documented symbol is present and no fork-extended symbol leaks.
- Wrote `vanilla-subset.md` and `VANILLA.md`.
- Major version bump per SemVer for new public subpath.

Tests: 826 → 832 PASS. Final report: `STAGE_III_FINAL.md`.

## Tags

| tag | sha | branch |
|:---|:---|:---|
| `beta.39-presync` | (commit on sync/v12.19-sdk) | sync/v12.19-sdk |
| `v2.0.0-rc.0` | (commit on sync/v12.19-sdk) | sync/v12.19-sdk |

beta.38 lives on `main` (`d1f908a`), tagged implicitly via the version
field. beta.39-presync and 2.0.0-rc.0 both live on `sync/v12.19-sdk`
because the v12.19 wrapper merge has not landed yet.

## Cumulative test counts

| stage | PASS | SKIPPED | new tests |
|:---|---:|---:|---:|
| baseline (beta.37) | 782 | 31 | — |
| STAGE I (beta.38) | 809 | 31 | +27 (v12.17 parity) |
| STAGE II (beta.39-presync) | 826 | 31 | +17 (v12.19 parity) |
| STAGE III (2.0.0-rc.0) | 832 | 31 | +6 (vanilla surface) |

## Wrapper findings logged

`audit-2026-04-27/wrapper-findings.md`:
- W-1: wrapper `src/bin/sdk_parity_fixtures.rs` omits tag 83 UpdateAuthority.
  Cannot push wrapper from this session per brief. Logged for next sync.

## Deferred to v12.20

`audit-2026-04-27/v12.20-design-notes.md` covers the three upstream
wrapper commits not landed this session:
- `c175ec4` — deposits-only insurance mode.
- `f04720e` — init oracle hardening.
- `5229c1c` — Pyth discriminator + matcher tail cap.

Each has a documented SDK migration plan.

## Action items for the next session

1. When PR #88 + #271 merge to main on the wrapper repo: rebase
   `sync/v12.19-sdk` onto `main`, drop `-presync` from beta.39 tag,
   publish 2.0.0-rc.0 to npm.
2. Pick up W-1 by adding `("UpdateAuthority", TAG_UPDATE_AUTHORITY)` to
   wrapper `src/bin/sdk_parity_fixtures.rs`.
3. When the v12.20 sync window opens: follow the resume checklist in
   `v12.20-design-notes.md`. Bump SDK to beta.40 (or 2.0.0-rc.1).

## Files changed across all three stages

```
M  package.json                               version bump 1.0.0-beta.37 -> 2.0.0-rc.0
M  README.md                                  current values + two-flavors + wrapper-versions
M  CHANGELOG.md                               beta.38, beta.39-presync, 2.0.0-rc.0 entries
M  src/abi/instructions.ts                    +5 encoders, +UpdateAuthority IX_TAG, +WrapperTarget,
                                              v12.19 target branches in UpdateConfig + InitMarket
                                              + PERC-628 (5)
M  src/abi/accounts.ts                        +6 ACCOUNTS_ specs
A  src/vanilla.ts                             vanilla subpath entry
M  specs/wrapper-tags.json                    +UpdateAuthority entry
M  test/parity-fixtures.test.ts               +UpdateAuthority sdkMap entry
A  test/parity/v12.17-encoder-bytes.parity.test.ts   27 v12.17 parity tests
A  test/parity/v12.19-encoder-bytes.parity.test.ts   17 v12.19 parity tests
A  test/vanilla.test.ts                       6 vanilla surface tests
A  fixtures/parity/v12.17-encoder-bytes.json  fixture map
M  vitest.config.ts                           register 3 new test files
M  tsup.config.ts                             dual-entry build
M  package.json exports                       ./vanilla subpath
A  VANILLA.md                                 vanilla subset docs
A  audit-2026-04-27/...                       18 audit artifacts (this directory)
```

## End

Three stages run end-to-end. All exit conditions met. STOP.
