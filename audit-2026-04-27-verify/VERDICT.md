# Verdict — independent drift verification

## NO_GO

10 BLOCKING findings + 8 HIGH findings against the SDK at
sync/v12.19-sdk (HEAD ~911e879). The SDK builds incorrect transactions
against v12.17.7 mainnet (the deployed program at
`BCGNFw6vDinWTF9AybAbi8vr69gx5nk5w8o2vEWgpsiw`) for several core
instructions. SDK consumers calling these encoders today get
InvalidInstructionData or NotEnoughAccountKeys runtime rejections.

## Blocking summary

1. **B-7 InitMarket wire-format excess on v12.17 default** — 344 bytes vs
   wrapper-expected 296. `encodeInitMarket` without `target: 'v12.19'` is
   broken on mainnet. Every market-creation tx fails.
2. **B-2 UpdateConfig wire-format short on v12.17 default** — 33 bytes
   vs wrapper-expected 35. Mainnet pin DOES include
   `tvl_insurance_cap_mult: u16` (added 2026-04-21, before mainnet pin
   2026-04-22). The audit-2026-04-27 STAGE I report's "v12.17 = 33 bytes
   correct" claim was based on a misread of the commit history.
3. **B-1, B-6 UpdateAdmin (12) + AcceptAdmin (82) absent on v12.17** —
   v12.17 wrapper deleted both; uses single-shot UpdateAuthority at tag
   32. SDK still encodes both.
4. **B-3 SetInsuranceWithdrawPolicy (22) absent on v12.17** — folded
   into UpdateConfig. SDK still encodes.
5. **B-4 + B-5 UpdateAuthority tag-byte drift** — v12.17 mainnet uses
   tag 32; SDK uses tag 83. SDK has no encoder targeting tag 32.
6. **B-8 dist/ stale** — bundled artifact does not contain the v12.19
   target branches. Even consumers explicitly passing `target: 'v12.19'`
   to `encodeInitMarket` or `encodeUpdateConfig` get the v12.17 payload
   from the committed dist.
7. **B-9 detectSlabLayout missing v12.19** — read paths return null or
   stale layout for v12.19 slabs.
8. **B-10 parity:check red** — wrapper-side parity binary missing tag
   83; CI gate fails.

## High summary (account spec drifts that solana-runtime rejects)

1. ACCOUNTS_TRADE_NOCPI: 4 vs 5
2. ACCOUNTS_TOPUP_INSURANCE: 5 vs 6 (missing clock)
3. ACCOUNTS_UPDATE_CONFIG: 2 vs 4 (missing clock + oracle)
4. ACCOUNTS_SET_ORACLE_PRICE_CAP: 2 vs 3
5. ACCOUNTS_RESOLVE_MARKET: 2 vs 4
6. ACCOUNTS_RESOLVE_PERMISSIONLESS: 3 vs 2 (drift v12.17 only)
7. deriveInsuranceLpMint wrong PDA seed (`ins_lp` vs `lp_vault_mint`)
8. PushHyperpMark + CatchupAccrue have no SDK encoder despite being live on v12.17

## What works

The encoding primitives (encU8/16/32/64/128, encI64/128, encPubkey,
concatBytes) are byte-correct. Little-endian + two's-complement
implementations match wrapper `from_le_bytes`.

The IX_TAG byte values for the simple per-account ops (DepositCollateral,
WithdrawCollateral, KeeperCrank, TradeNoCpi, TradeCpi, LiquidateAtOracle,
CloseAccount, TopUpInsurance, ReclaimEmptyAccount, SettleAccount,
DepositFeeCredits, ConvertReleasedPnl, ResolveMarket, WithdrawInsurance,
WithdrawInsuranceLimited, AdminForceClose, ForceCloseResolved) all match
wrapper decode arms on both v12.17 and v12.19.

Account specs for those simple per-account ops are mostly correct (the
8 HIGH-severity drifts are concentrated in admin / oracle / sysvar
plumbing, not user-trading paths).

PDA derivations for vault, lp, creator_lock, position_nft, position_nft_mint
match wrapper. Only deriveInsuranceLpMint is wrong.

Slab MAGIC, LiquidationPolicy enum, AUTHORITY_KIND, MARK_PRICE_EMA,
ORACLE_PHASE constants, matcher constants — all VERIFIED.

Error codes 0-27 align (28 entries). Drift starts at position 28.

The 27-instruction byte-parity test added in audit-2026-04-27 STAGE I
PASSES — but it tests SDK-encoder-byte-shape against an in-test
fixture, NOT against actual wrapper decode positions. So it gives a
false sense of safety.

## Action implications (informational)

If the goal is "ship 2.0.0-rc.0 to npm for mainnet consumers":
- NO_GO. Multiple BLOCKING wire-format drifts. Consumers cannot reach
  many core instructions. The "v12.17 default" target is broken
  against mainnet at the most important encoders.

If the goal is "verify against v12.19 wrapper post-merge":
- Closer to GO_WITH_NOTES. Most v12.19-target paths work in source
  (subject to dist refresh). 8 HIGH account-spec drifts still apply.
  detectSlabLayout v12.19 work still pending.

The fundamental issue: the audit-2026-04-27 STAGE I assumption that
v12.17 mainnet = pre-tvl_insurance_cap_mult, pre-UpdateAuthority-at-32,
pre-tag-12-deletion was wrong. Mainnet pin (06f86fb, 2026-04-22) is
post-all-those-changes. The "v12.17 default" SDK behavior consequently
targets a snapshot that doesn't match deployed mainnet.

Verdict: **NO_GO for mainnet publication.** The SDK does NOT build
correct transactions for v12.17.7 deployed line.
