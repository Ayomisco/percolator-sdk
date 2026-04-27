# PHASE 2 — Borsh field audit on top 12

Wrapper @ d760fc4 (v12.19). Mainnet at v12.17.7 (deployed line). For each encoder I checked:
- field order
- per-field width + endianness
- missing or extra fields
- pubkey shape
- enum variant byte
- signedness
- BigInt boundaries

I cross-referenced wrapper's `Instruction::decode` (src/percolator.rs:1789+) and the handler signatures.

## Critical: target divergence

`tvl_insurance_cap_mult` (UpdateConfig 5th field) and the pre-RiskParams trio
(`maxInsuranceFloor` + `minOraclePriceCap` + `minInitialDeposit`) wire layout
landed AFTER v12.17.7. Trace:
- `4ec51cc` 2026-04-21 — Add tvl_insurance_cap_mult (UpdateConfig drift starts here)
- `86ea41f` 2026-04-22 — UpdateAuthority + ML8 wire-format drops first appear

So the SDK's beta.37 wire format MATCHES v12.17.7 deployed mainnet but DIVERGES from d760fc4.
v12.19-side fixes belong in STAGE II.

## 1. encodeInitMarket (tag 0)

**SDK encoder:** src/abi/instructions.ts:377 → 344 bytes (1 + 343 body).
**Wrapper decode (d760fc4):** src/percolator.rs:1789 → 304 bytes minimal, 370 with extended tail.
**v12.17.7 deployed:** SDK matches (no tvl_cap_mult, no ML8 drops).

Field order (SDK vs wrapper-v12.17 deployed expectation):
```
1   tag                              u8     OK
1   admin                            Pubkey OK
33  collateralMint                   Pubkey OK
65  indexFeedId                      [u8;32] OK
97  maxStalenessSecs                 u64    OK
105 confFilterBps                    u16    OK
107 invert                           u8     OK
108 unitScale                        u32    OK
112 initialMarkPriceE6               u64    OK
120 maxMaintenanceFeePerSlot         u128   OK (wrapper field name maintenance_fee_per_slot)
136 maxInsuranceFloor                u128   v12.17 yes; v12.19 dropped
152 minOraclePriceCap                u64    v12.17 yes; v12.19 dropped
160 hMin                             u64    OK
168 maintenanceMarginBps             u64    OK
176 initialMarginBps                 u64    OK
184 tradingFeeBps                    u64    OK
192 maxAccounts                      u64    OK
200 newAccountFee                    u128   OK
216 insuranceFloor                   u128   v12.17 yes; v12.19 still read-and-discarded
232 hMax                             u64    OK
240 maxCrankStalenessSlots           u64    v12.17 yes; v12.19 still read-and-discarded
248 liquidationFeeBps                u64    OK
256 liquidationFeeCap                u128   OK
272 liquidationBufferBps             u64    OK (wrapper field name resolve_price_deviation_bps in v12.19)
280 minLiquidationAbs                u128   OK
296 minInitialDeposit                u128   v12.17 yes; v12.19 dropped
312 minNonzeroMmReq                  u128   OK
328 minNonzeroImReq                  u128   OK
                                            total 344 bytes ✓
```

Optional 66-byte tail at offset 344 (when `extendedTail` set). Field order matches wrapper L1841-1849.

**Verdict v12.17.7:** PASS — no fix needed.
**Verdict v12.19:** WIRE_FORMAT_DRIFT — 3 fields removed (40 bytes). STAGE II will add `target='v12.19'` mode that omits maxInsuranceFloor + minOraclePriceCap + minInitialDeposit.

## 2. encodeInitUser (tag 1)

SDK: tag(1) + feePayment u64(8) = 9 bytes.
Wrapper: matches.

PASS. No drift v12.17 vs v12.19.

## 3. encodeInitLP (tag 2)

SDK: tag(1) + matcherProgram Pubkey(32) + matcherContext Pubkey(32) + feePayment u64(8) = 73 bytes.
Wrapper: matches.

PASS.

## 4. encodeDepositCollateral (tag 3)

SDK: tag(1) + userIdx u16(2) + amount u64(8) = 11 bytes.
Wrapper: matches.

PASS.

## 5. encodeWithdrawCollateral (tag 4)

SDK: tag(1) + userIdx u16(2) + amount u64(8) = 11 bytes.
Wrapper: matches.

PASS.

## 6. encodeKeeperCrank (tag 5)

SDK at src/abi/instructions.ts:533. Wire format:
- tag(1) + callerIdx u16(2) + format_version u8(1) + per-candidate [idx u16 + policy u8 (+ qty u128 if ExactPartial)]

Wrapper at src/percolator.rs:1922:
- read tag, caller_idx, format_version
- if format_version == 1: loop reading idx u16 + policy u8 (+ u128 if tag=1)
- else: InvalidInstructionData

PASS. SDK enforces format_version=1 (line 537 `encU8(1)`).

## 7. encodeTradeNoCpi (tag 6)

SDK: tag(1) + lpIdx u16(2) + userIdx u16(2) + size i128(16) = 21 bytes.
Wrapper: matches.

PASS.

## 8. encodeTradeCpi (tag 10)

SDK: tag(1) + lpIdx u16(2) + userIdx u16(2) + size i128(16) + limitPriceE6 u64(8) = 29 bytes.
Wrapper at src/percolator.rs:1994: matches.

PASS.

## 9. encodeLiquidateAtOracle (tag 7)

SDK: tag(1) + targetIdx u16(2) = 3 bytes.
Wrapper: matches.

PASS.

## 10. encodeCloseAccount (tag 8)

SDK: tag(1) + userIdx u16(2) = 3 bytes.
Wrapper: matches.

PASS.

## 11. encodeConvertReleasedPnl (tag 28)

**MISSING_ENCODER on SDK side.**

Wrapper at src/percolator.rs:2103:
- tag(1) + userIdx u16(2) + amount u64(8) = 11 bytes.

Need to add `encodeConvertReleasedPnl({ userIdx: number, amount: bigint | string })` returning 11 bytes.

## 12. encodeSettleAccount (tag 26)

**MISSING_ENCODER on SDK side.**

Wrapper at src/percolator.rs:2092:
- tag(1) + userIdx u16(2) = 3 bytes.

Need to add `encodeSettleAccount({ userIdx: number })` returning 3 bytes.

## Bonus encoders to add in PHASE 3 (per gap-report G-3)

- encodeReclaimEmptyAccount (tag 25): tag(1) + userIdx u16(2) = 3 bytes.
- encodeDepositFeeCredits (tag 27): tag(1) + userIdx u16(2) + amount u64(8) = 11 bytes.

## Conclusions

- 9 of 10 encoders that are present + reachable on v12.17 are byte-correct.
- 2 encoders (SettleAccount, ConvertReleasedPnl) and 2 more from G-3 (ReclaimEmptyAccount, DepositFeeCredits) are missing.
- 1 encoder (UpdateAuthority tag 83) is missing entirely.
- The InitMarket and UpdateConfig drifts are v12.19-only and out of scope for STAGE I.
