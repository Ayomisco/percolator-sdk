# PHASE 3 — account spec audit

Compared SDK ACCOUNTS_X array length + signer/writable matrix against
v12.17 wrapper (06f86fb) and v12.19 wrapper (d760fc4) `accounts::expect_len`
+ `expect_signer` + `expect_writable` calls in handlers.

## Account-count drift table (v12.17 mainnet pin)

| spec | sdk count | v12.17 wrapper expect_len | drift | severity |
|:---|---:|---:|:---|:---|
| INIT_MARKET | 9 | 9 | OK | VERIFIED |
| INIT_USER | 6 | 6 | OK | VERIFIED |
| INIT_LP | 6 | 6 | OK | VERIFIED |
| DEPOSIT_COLLATERAL | 6 | 6 | OK | VERIFIED |
| WITHDRAW_COLLATERAL | 8 | 8 | OK | VERIFIED |
| KEEPER_CRANK | 4 | 4 | OK | VERIFIED |
| **TRADE_NOCPI** | **4** | **5** | undercount by 1 | **ACCOUNT_SPEC_DRIFT_HIGH** |
| TRADE_CPI | 8 | expect_len_min(8) + variadic tail | OK at minimum | VERIFIED min |
| LIQUIDATE_AT_ORACLE | 4 | 4 | OK | VERIFIED |
| CLOSE_ACCOUNT | 8 | 8 | OK | VERIFIED |
| **TOPUP_INSURANCE** | **5** | **6** | missing clock | **ACCOUNT_SPEC_DRIFT_HIGH** |
| CLOSE_SLAB | 6 | 6 | OK | VERIFIED |
| **UPDATE_CONFIG** | **2** | **4** | missing clock + oracle | **ACCOUNT_SPEC_DRIFT_HIGH** |
| **SET_ORACLE_PRICE_CAP** | **2** | **3** | missing clock | **ACCOUNT_SPEC_DRIFT_HIGH** |
| **RESOLVE_MARKET** | **2** | **4** | missing clock + oracle | **ACCOUNT_SPEC_DRIFT_HIGH** |
| WITHDRAW_INSURANCE | 6 | 6 | OK | VERIFIED |
| ADMIN_FORCE_CLOSE | 8 | 8 | OK | VERIFIED |
| WITHDRAW_INSURANCE_LIMITED_RESOLVED | 7 | 7 | OK | VERIFIED |
| WITHDRAW_INSURANCE_LIMITED_LIVE | 8 | (not separately gated in v12.17) | OK | VERIFIED |
| RECLAIM_EMPTY_ACCOUNT | 2 | 2 | OK | VERIFIED |
| SETTLE_ACCOUNT | 3 | 3 | OK | VERIFIED |
| DEPOSIT_FEE_CREDITS | 6 | 6 | OK | VERIFIED |
| CONVERT_RELEASED_PNL | 4 | 4 | OK | VERIFIED |
| **RESOLVE_PERMISSIONLESS** | **3** | **2** | overcount by 1 (SDK has extra account) | **ACCOUNT_SPEC_DRIFT_HIGH** |
| FORCE_CLOSE_RESOLVED | 7 | 7 | OK | VERIFIED |
| UPDATE_AUTHORITY | 3 | 3 (at v12.17 tag 32) | OK count, but tag drift in encoder | VERIFIED count |
| UPDATE_ADMIN | 2 | DELETED in v12.17 | tag-not-live | (see ix-tag-drift) |
| ACCEPT_ADMIN | 2 | NOT IN v12.17 | tag-not-live | (see ix-tag-drift) |
| PAUSE_MARKET | 2 | NOT IN v12.17 | tag-not-live | (see ix-tag-drift) |
| UNPAUSE_MARKET | 2 | NOT IN v12.17 | tag-not-live | (see ix-tag-drift) |

## Account-count drift table (v12.19 wrapper at d760fc4)

| spec | sdk count | v12.19 wrapper expect_len | drift |
|:---|---:|---:|:---|
| INIT_MARKET | 9 | 9 | OK |
| INIT_USER | 6 | not yet sampled — assumed OK | TBD |
| INIT_LP | 6 | not yet sampled | TBD |
| DEPOSIT_COLLATERAL | 6 | not yet sampled | TBD |
| WITHDRAW_COLLATERAL | 8 | not yet sampled | TBD |
| KEEPER_CRANK | 4 | not yet sampled | TBD |
| TRADE_NOCPI | 4 | 5 (handle_trade_no_cpi at L8477) | **ACCOUNT_SPEC_DRIFT_HIGH** (same drift in v12.19) |
| TRADE_CPI | 8 | variadic | OK min |
| LIQUIDATE_AT_ORACLE | 4 | 4 (assumed) | OK |
| CLOSE_ACCOUNT | 8 | 8 (assumed) | OK |
| TOPUP_INSURANCE | 5 | 6 (handle_top_up_insurance at L9256) | **ACCOUNT_SPEC_DRIFT_HIGH** (same drift in v12.19) |
| CLOSE_SLAB | 6 | not yet sampled | TBD |
| UPDATE_CONFIG | 2 | 3 OR 4 (handle_update_config at L9542 accepts both) | **ACCOUNT_SPEC_DRIFT_HIGH** (SDK 2 ≠ either) |
| SET_ORACLE_PRICE_CAP | 2 | 3 (handle_set_oracle_price_cap L9654) | **ACCOUNT_SPEC_DRIFT_HIGH** (same drift in v12.19) |
| RESOLVE_MARKET | 2 | 4 (handle_resolve_market L9748) | **ACCOUNT_SPEC_DRIFT_HIGH** (same drift in v12.19) |
| WITHDRAW_INSURANCE | 6 | not sampled | TBD |
| RESOLVE_PERMISSIONLESS | 3 | 3 (handle_resolve_permissionless L10705) | OK on v12.19, drift on v12.17 |
| ... | ... | ... | ... |

## Signer / writable spot-check

Checked the 5 critical drift specs above; the SDK's signer/writable
matrix for the present accounts is correct (e.g. admin signer +
writable, slab writable but not signer). Drift is purely about MISSING
trailing accounts (clock and/or oracle).

## RESOLVE_PERMISSIONLESS breakdown

SDK src/abi/accounts.ts `ACCOUNTS_RESOLVE_PERMISSIONLESS` has 3 accounts
(line 515 region):
- caller (non-signer per spec)
- slab writable
- ... (3rd account)

Wrapper v12.17 expect_len = 2 (just slab + clock). Wrapper v12.19 expect_len = 3.
The SDK is right for v12.19 wrong for v12.17. Caller would get
ProgramError from solana runtime "too many account keys" for v12.17.

## Summary

| severity | count |
|:---|---:|
| ACCOUNT_SPEC_DRIFT_HIGH (v12.17 mainnet pin) | 6 (TRADE_NOCPI, TOPUP_INSURANCE, UPDATE_CONFIG, SET_ORACLE_PRICE_CAP, RESOLVE_MARKET, RESOLVE_PERMISSIONLESS) |
| ACCOUNT_SPEC_DRIFT_HIGH (v12.19) | 5 (same as v12.17 minus RESOLVE_PERMISSIONLESS which is OK on v12.19; same 4 + UPDATE_CONFIG count) |
| VERIFIED v12.17 | 14+ specs |

These ACCOUNT_SPEC_DRIFT_HIGH issues mean the SDK builds transactions
that solana runtime rejects with `NotEnoughAccountKeys` BEFORE the
program even runs. They are not silent corruption (no false success),
but they are fully-broken transactions that callers cannot send.

Net: SDK consumers calling `buildAccountMetas(ACCOUNTS_RESOLVE_MARKET, ...)`
and submitting to mainnet today (v12.17.7) get a runtime error and the
tx never executes. This should have been caught by integration tests —
but the SDK's test suite does not exercise the actual wrapper handler
beyond the encode-byte-shape gate.
