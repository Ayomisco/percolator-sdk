# PHASE 9 — named constants + auth kinds audit

## AUTHORITY_KIND const map

| sdk | wrapper v12.17 | wrapper v12.19 | drift |
|:---|:---|:---|:---|
| Admin: 0 | AUTHORITY_ADMIN: u8 = 0 (v12.17 src/percolator.rs:1432) | AUTHORITY_ADMIN: u8 = 0 (v12.19 src/percolator.rs:6862) | VERIFIED both |
| HyperpMark: 1 | AUTHORITY_HYPERP_MARK: u8 = 1 | AUTHORITY_HYPERP_MARK: u8 = 1 | VERIFIED both |
| Insurance: 2 | AUTHORITY_INSURANCE: u8 = 2 | AUTHORITY_INSURANCE: u8 = 2 | VERIFIED both |
| InsuranceOperator: 4 | AUTHORITY_INSURANCE_OPERATOR: u8 = 4 | AUTHORITY_INSURANCE_OPERATOR: u8 = 4 | VERIFIED both. Note kind=3 reserved (v12.18.x close authority merged into admin per v12.17 enum comment). |

## MARK_PRICE_EMA constants

| sdk | wrapper v12.19 | drift |
|:---|:---|:---|
| MARK_PRICE_EMA_WINDOW_SLOTS = 72_000n | `pub const MARK_PRICE_EMA_WINDOW_SLOTS: u64 = 72_000` (v12.19 src/percolator.rs:296) | VERIFIED |
| MARK_PRICE_EMA_ALPHA_E6 = 2_000_000n / (WINDOW + 1n) | `pub const MARK_PRICE_EMA_ALPHA_E6: u64 = 2_000_000 / (MARK_PRICE_EMA_WINDOW_SLOTS + 1)` (v12.19 src/percolator.rs:298) | VERIFIED |

## ORACLE_PHASE constants

| sdk | wrapper v12.19 | drift |
|:---|:---|:---|
| ORACLE_PHASE_NASCENT = 0 | `ORACLE_PHASE_NASCENT: u8 = 0` (v12.19 L3023) | VERIFIED |
| ORACLE_PHASE_GROWING = 1 | `ORACLE_PHASE_GROWING: u8 = 1` (L3024) | VERIFIED |
| ORACLE_PHASE_MATURE = 2 | `ORACLE_PHASE_MATURE: u8 = 2` (L3025) | VERIFIED |

## PHASE transition thresholds

| sdk | wrapper | drift |
|:---|:---|:---|
| PHASE1_MIN_SLOTS = 648_000n | NOT defined as constant in v12.19 wrapper | **CONST_DRIFT_MEDIUM** |
| PHASE1_VOLUME_MIN_SLOTS = 36_000n | NOT defined | CONST_DRIFT_MEDIUM |
| PHASE2_VOLUME_THRESHOLD = 100_000_000_000n | NOT defined | CONST_DRIFT_MEDIUM |
| PHASE2_MATURITY_SLOTS = 3_024_000n | NOT defined | CONST_DRIFT_MEDIUM |

The wrapper's `check_phase_transition` (v12.19 src/percolator.rs:3061-3071)
ignores all inputs and returns `(ORACLE_PHASE_MATURE, false)` — phase
transition is effectively a NO-OP on chain. SDK consumers using
`checkPhaseTransition` (src/abi/instructions.ts:1359+) get a different
result than the chain would compute.

Severity: CONST_DRIFT_MEDIUM. The SDK helper is misleading but does not
build wrong transactions (calling AdvanceOraclePhase tag 56 still works;
it's just that the chain does nothing). UX bug only.

## BPS / fee constants

| sdk | wrapper |drift |
|:---|:---|:---|
| BPS_DENOM = 10_000n (src/abi/instructions.ts:1284) | `10_000` literal in many wrapper math sites | VERIFIED |
| E2BPS_DENOM | not exported by SDK; e2bps semantics implied via 1_000_000 | (not asserted; not in IX_TAG/encode.ts) | n/a |
| IM_BPS_DEFAULT, MM_BPS_DEFAULT | not exported by SDK | wrapper has DEFAULT_INITIAL_MARGIN_BPS / DEFAULT_MAINTENANCE_MARGIN_BPS in constants.rs (not verified value-by-value) | OUT_OF_SCOPE |
| MAX_LEVERAGE_BPS | not exported | not in scope | OUT_OF_SCOPE |

## RENOUNCE / UNRESOLVE confirmations

| sdk | wrapper | drift |
|:---|:---|:---|
| RENOUNCE_ADMIN_CONFIRMATION = 0x52454E4F554E4345n ("RENOUNCE") | not used in v12.17/v12.19 (RenounceAdmin removed) | DEAD constant. encodeRenounceAdmin throws. Status DOC_DRIFT_LOW. |
| UNRESOLVE_CONFIRMATION = 0xDEAD_BEEF_CAFE_1234n | not used (UnresolveMarket removed) | DEAD constant. encodeUnresolveMarket throws. Status DOC_DRIFT_LOW. |

## Matcher constants

| sdk | wrapper / matcher | drift |
|:---|:---|:---|
| VAMM_MAGIC = 0x504552434d415443n | `MATCHER_MAGIC` from matcher-parity.json | VERIFIED via parity-fixtures.test.ts |
| MATCHER_CONTEXT_LEN = 320 | matcher-parity sizes | VERIFIED via parity-fixtures.test.ts |
| MATCHER_RETURN_LEN = 64 | matcher-parity sizes | VERIFIED via parity-fixtures.test.ts |
| MATCHER_CALL_LEN = 67 | matcher-parity sizes | VERIFIED via parity-fixtures.test.ts |
| INIT_CTX_LEN = 78 | matcher-parity sizes | VERIFIED via parity-fixtures.test.ts |
| CTX_VAMM_OFFSET = 64 | matcher-parity sizes | VERIFIED |
| CTX_VAMM_LEN = 256 | matcher-parity sizes | VERIFIED |
| CTX_RETURN_OFFSET = 0 | matcher-parity sizes | VERIFIED |

## Pyth program ids

| sdk | wrapper / Pyth | drift |
|:---|:---|:---|
| PYTH_RECEIVER_PROGRAM_ID = 'rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ' | Pyth Solana Receiver mainnet program ID | VERIFIED-by-spec (off-chain Pyth) |
| PYTH_PUSH_ORACLE_PROGRAM_ID = 'pythWSnswVUd12oZpeFP8e9CVaEqJg25g1Vtc2biRsT' (in pda.ts) | Pyth Pull mainnet program ID | VERIFIED-by-spec |
| PUMPSWAP_PROGRAM_ID, RAYDIUM_CLMM_PROGRAM_ID, METEORA_DLMM_PROGRAM_ID | matched against on-chain DEX programs | NOT VERIFIED (out of scope for wrapper byte audit) |

## Slab MAGIC

| sdk | wrapper | drift |
|:---|:---|:---|
| MAGIC = 0x504552434f4c4154 ("PERCOLAT") | `pub const MAGIC: u64 = 0x504552434f4c4154` (both v12.17 and v12.19 src/percolator.rs:18) | VERIFIED both |

## Summary

| status | count |
|:---|---:|
| VERIFIED | ~25 named constants |
| CONST_DRIFT_MEDIUM | 4 (PHASE1_MIN_SLOTS, PHASE1_VOLUME_MIN_SLOTS, PHASE2_VOLUME_THRESHOLD, PHASE2_MATURITY_SLOTS — wrapper doesn't enforce them) |
| DOC_DRIFT_LOW | 2 (RENOUNCE_ADMIN_CONFIRMATION, UNRESOLVE_CONFIRMATION — refer to deleted instructions) |
| OUT_OF_SCOPE | several DEX program ids + IM/MM defaults |
