# STAGE I — final report

Coverage and correctness audit on the v12.17.7 deployed line. Cut 1.0.0-beta.38.

## Verdict

GO. Wrapper baseline `d760fc4` (h-new-1-resolved). SDK at `1.0.0-beta.38` on `main`.

## Target decision recap

Stage scope: v12.17.7 deployed mainnet line. Wrapper at d760fc4 used as
source-of-truth for handler signatures and decode positions. v12.19-only
divergences logged for STAGE II.

## Before / after

| metric | before | after |
|:---|---:|---:|
| version | 1.0.0-beta.37 | 1.0.0-beta.38 |
| pnpm test PASS | 782 | 809 |
| pnpm test SKIPPED | 31 | 31 |
| pnpm test files | 24 | 25 |
| pnpm lint | clean | clean |
| pnpm build | clean | clean |
| IX_TAG entries | 73 | 74 (+UpdateAuthority) |
| Encoders for v12.17 reachable set | 22 of 27 | 27 of 27 |
| ACCOUNTS_ specs covering v12.17 reachable | 21 of 27 | 27 of 27 |
| Per-instruction parity tests | 0 | 27 |

## Fixes applied (commit hashes on `main`)

`7575ec2` fix(sdk): add missing encoders and account specs (audit-2026-04-27)
- Added `IX_TAG.UpdateAuthority = 83`. Wrapper anchor `src/percolator.rs:6876`.
- Added `AUTHORITY_KIND` const map.
- Added `encodeUpdateAuthority({ kind, newPubkey })`.
- Added `encodeReclaimEmptyAccount`. Wrapper `src/percolator.rs:10470`.
- Added `encodeSettleAccount`. Wrapper `src/percolator.rs:10503`.
- Added `encodeDepositFeeCredits`. Wrapper `src/percolator.rs:10557`.
- Added `encodeConvertReleasedPnl`. Wrapper `src/percolator.rs:10636`.
- Added `ACCOUNTS_RECLAIM_EMPTY_ACCOUNT`, `ACCOUNTS_SETTLE_ACCOUNT`,
  `ACCOUNTS_DEPOSIT_FEE_CREDITS`, `ACCOUNTS_CONVERT_RELEASED_PNL`,
  `ACCOUNTS_SET_INSURANCE_WITHDRAW_POLICY`, `ACCOUNTS_UPDATE_AUTHORITY`.

`bf6492b` test(parity): add v12.17 encoder byte parity (audit-2026-04-27)
- 27 byte-level parity tests at `test/parity/v12.17-encoder-bytes.parity.test.ts`.
- `fixtures/parity/v12.17-encoder-bytes.json` documenting expected hex per encoder.
- Coverage gate: enumerates v12.17 reachable list and asserts every name has IX_TAG.
- `specs/wrapper-tags.json`: added UpdateAuthority entry.
- `test/parity-fixtures.test.ts` sdkMap: added UpdateAuthority.
- `vitest.config.ts`: registered new parity test file.
- `encodeUpdateConfig` jsdoc updated for v12.17 vs v12.19 split.

`d1f908a` release: v1.0.0-beta.38. coverage and correctness audit on v12.17 line.
- README.md test-count + version bump.
- CHANGELOG.md beta.38 entry with all encoder anchors.
- package.json version bump.

## Residuals deferred to STAGE II

| gap | what | reason |
|:---|:---|:---|
| G-1 | `encodeUpdateConfig` v12.19 5-field variant (adds tvl_insurance_cap_mult u16) | v12.19-only. STAGE II PHASE C will add `target='v12.19'` parameter. |
| G-5 | tags 59-63 (PERC-628 shared vault) currently throw | Wrapper handlers exist in v12.19 but v12.17 deployed does not reach them. STAGE II PHASE C adds v12.19-target encoders. |
| InitMarket 40-byte drift | v12.19 wrapper drops `maxInsuranceFloor + minOraclePriceCap + minInitialDeposit` | v12.19-only. STAGE II PHASE C adds `target='v12.19'` parameter. |

## Wrapper-side residuals (cannot push from this session)

- W-1 in `audit-2026-04-27/wrapper-findings.md`: wrapper's
  `src/bin/sdk_parity_fixtures.rs` enumerates 78 tags but stops at tag 82.
  Missing tag 83 UpdateAuthority. Both sides stale together so
  `pnpm run parity:check` returns clean. Will surface in next wrapper sync.

## Gates green

- pnpm build: ESM build success in 18ms, dist 263.80 KB.
- pnpm lint: zero errors.
- pnpm test: 25 files, 809 PASS, 31 SKIPPED.
- pnpm run parity:check not exercised this stage. Cross-program parity
  status unchanged from beta.37.

## Commit hashes

```
d1f908a release: v1.0.0-beta.38. coverage and correctness audit on v12.17 line.
bf6492b test(parity): add v12.17 encoder byte parity (audit-2026-04-27)
7575ec2 fix(sdk): add missing encoders and account specs (audit-2026-04-27)
015b4e7 fix(sdk): beta.37 — expose configMarkEwmaOff for v12.17 fill-price recovery (prior baseline)
```

## Verdict

STAGE I COMPLETE. Proceeding to STAGE II.
