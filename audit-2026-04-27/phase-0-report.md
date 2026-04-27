# PHASE 0 — recon report

Wrapper @ d760fc4. SDK @ 015b4e7 (beta.37). 2026-04-27.

## Scope

71 wrapper-accepted tags. 73 SDK IX_TAG keys.

## Counts

| status | count |
|:---|---:|
| OK_NO_PARITY (encoder + accounts spec) | 60 |
| WIRE_FORMAT_DRIFT | 1 |
| MISSING_ENCODER | 5 |
| OK_NO_ACCOUNTS_SPEC | 1 |
| DEPRECATED_BUT_HANDLER_EXISTS | 5 |
| DEPRECATED_BOTH_SIDES | 11 |
| DEAD_TAG_BOTH_SIDES (correctly absent) | 3 |
| **Total wrapper-active tags addressed** | 71 |

## Critical findings

1. tag 14 UpdateConfig — SDK omits `tvl_insurance_cap_mult: u16` field. Wrapper rejects `InvalidInstructionData` because trailing bytes guard runs after read_u16 fails. **HIGH severity wire bug.**

2. tag 83 UpdateAuthority — wrapper accepts (handler at src/percolator.rs:6876), SDK has no IX_TAG entry, no encoder, no accounts spec. Brief lists this as a v12.17.7 deployed instruction. **HIGH severity coverage gap.**

3. tags 25, 26, 27, 28 — wrapper handlers exist (ReclaimEmptyAccount, SettleAccount, DepositFeeCredits, ConvertReleasedPnl). SDK has IX_TAG entries but no encoder functions. **MEDIUM severity coverage gap.**

4. tags 59-63 — wrapper has handlers (InitSharedVault, AllocateMarket, QueueWithdrawalSV, ClaimEpochWithdrawal, AdvanceEpoch). SDK encoders throw "removed". Mismatch: SDK callers cannot invoke these even though wrapper accepts. **MEDIUM severity coverage gap.**

5. tag 22 SetInsuranceWithdrawPolicy — encoder present, no `ACCOUNTS_*` constant. **LOW severity ergonomics gap.**

## Parity infrastructure

- `scripts/check-parity-fixtures.mjs` runs `cargo run --bin sdk_parity_fixtures` in 4 repos and diffs against `specs/*.json`.
- Wrapper binary `src/bin/sdk_parity_fixtures.rs` enumerates 78 tags but **omits tag 83 UpdateAuthority**.
- SDK spec `specs/wrapper-tags.json` likewise omits tag 83.
- `pnpm run parity:check` would currently show drift only if wrapper binary updated; both stale together so it returns clean.

## Test coverage

- 24 test files. 782 PASS / 31 SKIPPED.
- Encoder coverage in `test/encode.test.ts` (54 tests). Spot-checks correct shape but does NOT compare against wrapper-decoded bytes.
- No `test/parity/<instruction>.parity.test.ts` files. PHASE 4 will add these.

## Next: PHASE 1 — gap report.
