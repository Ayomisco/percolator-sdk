# PHASE 1 — gap report

## G-1: WIRE_FORMAT_DRIFT tag 14 UpdateConfig

**Severity:** HIGH
**Target:** both v12.17 and v12.19

What's wrong: `encodeUpdateConfig` at src/abi/instructions.ts:704 emits tag(1) + 4 fields (4 × 8 = 32 bytes) for total 33 bytes. Wrapper decode at src/percolator.rs:2027 reads 5 fields including `tvl_insurance_cap_mult: u16` (33 bytes payload + 1 tag = 34 bytes total). The SDK's payload is 1 byte short. Wrapper's `read_u16` errors out with `InvalidInstructionData`.

Wrapper file:line: src/percolator.rs:2027-2041.
SDK file:line: src/abi/instructions.ts:697-712.

Proposed fix: add `tvlInsuranceCapMult: bigint | string | number` to `UpdateConfigArgs`, append `encU16(args.tvlInsuranceCapMult)` to the encoder. Default to `0` if omitted (matches existing zero-disable semantics).

## G-2: MISSING_ENCODER tag 83 UpdateAuthority

**Severity:** HIGH
**Target:** both v12.17 and v12.19

What's wrong: Wrapper handler `handle_update_authority` at src/percolator.rs:6876 accepts tag 83 with payload `kind: u8` + `new_pubkey: Pubkey`. Three accounts: `[current_authority(signer), new_authority(signer), slab(writable)]`. Brief lists this as a v12.17.7 deployed instruction. SDK has no IX_TAG entry, no encoder, no accounts spec.

Wrapper file:line: src/percolator.rs:6876 (handler), 2140-2146 (decode), 6862-6868 (kind constants).
SDK file:line: not present.

Proposed fix:
- Add `IX_TAG.UpdateAuthority: 83` to instructions.ts:152 region.
- Add `AUTHORITY_KIND` const map: `{ Admin: 0, HyperpMark: 1, Insurance: 2, InsuranceOperator: 4 }`. (Wrapper uses 0/1/2/4 — kind 3 is reserved per v12.18.x split.)
- Add `encodeUpdateAuthority({ kind, newPubkey })` returning tag(1) + kind(1) + pubkey(32) = 34 bytes.
- Add `ACCOUNTS_UPDATE_AUTHORITY` to accounts.ts: 3 accounts, 0 and 1 signers, all 3 writable per wrapper requirement at src/percolator.rs:6928 region.

## G-3: MISSING_ENCODER tags 25-28

**Severity:** MEDIUM
**Target:** both

What's wrong: Wrapper handlers exist:
- tag 25 ReclaimEmptyAccount: `{ user_idx: u16 }` — src/percolator.rs:2088
- tag 26 SettleAccount: `{ user_idx: u16 }` — src/percolator.rs:2092
- tag 27 DepositFeeCredits: `{ user_idx: u16, amount: u64 }` — src/percolator.rs:2097
- tag 28 ConvertReleasedPnl: `{ user_idx: u16, amount: u64 }` — src/percolator.rs:2103

SDK has IX_TAG entries (lines 48, 49, 51, 52) but no encoder functions and no `ACCOUNTS_*` constants.

Proposed fix: add 4 trivial encoders following the pattern at src/abi/instructions.ts:476 (encodeDepositCollateral). Add 4 `ACCOUNTS_*` constants in accounts.ts.

## G-4: OK_NO_ACCOUNTS_SPEC tag 22 SetInsuranceWithdrawPolicy

**Severity:** LOW
**Target:** both

What's wrong: `encodeSetInsuranceWithdrawPolicy` at src/abi/instructions.ts:1777 exists. No `ACCOUNTS_SET_INSURANCE_WITHDRAW_POLICY` constant. Callers must hand-roll keys array.

Wrapper file:line: src/percolator.rs:2066 (decode). Handler accounts: 2 ([admin(signer), slab(writable)]).

Proposed fix: add `ACCOUNTS_SET_INSURANCE_WITHDRAW_POLICY` after the existing `ACCOUNTS_SET_*` block.

## G-5: DEPRECATED_BUT_HANDLER_EXISTS tags 59-63

**Severity:** MEDIUM (but not gating mainnet)
**Target:** both

What's wrong: SDK encoders for InitSharedVault (59), AllocateMarket (60), QueueWithdrawalSV (61), ClaimEpochWithdrawal (62), AdvanceEpoch (63) all `removedInstruction(...)` (throw). Wrapper has live handlers at src/percolator.rs:2249-2263.

This is the PERC-628 "elastic shared vault" feature. Reading the SDK code, these were stubbed as throws because the on-chain handler was not yet present at SDK ship. Wrapper now has handlers per d760fc4. SDK callers cannot invoke even though the wrapper would accept.

Risk assessment: not on the v12.17.7 deployed instruction list per brief. Probably v12.19+ feature only. Defer to STAGE II PHASE C with a v12.19-only flag.

Proposed fix in STAGE I: leave as throws but rewrite the throw message to "PERC-628 shared vault: encoder available in v12.19 SDK target" to clarify the version gate.

## G-6: parity-binary tag 83 omission

**Severity:** MEDIUM (audit hygiene)
**Target:** both

What's wrong: wrapper's `src/bin/sdk_parity_fixtures.rs` enumerates 78 tags but stops at tag 82 AcceptAdmin. Tag 83 UpdateAuthority is missing. `specs/wrapper-tags.json` correspondingly omits tag 83. `pnpm run parity:check` returns clean only because both sides are stale.

Proposed fix: this is a wrapper-side fix. Per the brief I cannot push to wrapper. Log this as a wrapper-finding and add tag 83 to `specs/wrapper-tags.json` on the SDK side anticipating the wrapper update. Mark with a TODO note.

## G-7: parity coverage = 0%

**Severity:** MEDIUM
**Target:** both

What's wrong: 60 OK_NO_PARITY tags. Zero parity fixtures exist under `fixtures/parity/`. PHASE 4 will add per-instruction fixtures + a meta-test enforcing coverage.

## Summary by severity

| severity | count |
|:---|---:|
| BLOCKING | 0 |
| HIGH | 2 (G-1, G-2) |
| MEDIUM | 4 (G-3, G-5, G-6, G-7) |
| LOW | 1 (G-4) |
