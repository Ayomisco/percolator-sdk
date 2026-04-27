# Coverage matrix — wrapper @ d760fc4 vs SDK @ 015b4e7 (beta.37)

Status legend:
- OK_FULL: encoder + accounts spec + parity coverage
- OK_NO_PARITY: encoder + accounts spec, no parity fixture
- OK_NO_ACCOUNTS_SPEC: encoder present, no `ACCOUNTS_*` constant
- MISSING_ENCODER: wrapper accepts tag, SDK has no encoder
- MISSING_ENCODER_AND_DEAD_TAG: tag in IX_TAG but neither side implements
- WRONG_TAG_BYTE: SDK encoder/spec uses wrong byte
- WIRE_FORMAT_DRIFT: encoder shape disagrees with wrapper decode
- DEPRECATED_BOTH_SIDES: wrapper rejects, SDK throws
- DEPRECATED_BUT_HANDLER_EXISTS: SDK throws but wrapper has handler

| tag | wrapper variant | sdk key | status | target |
|---:|:---|:---|:---|:---|
| 0 | InitMarket | InitMarket | OK_NO_PARITY | both |
| 1 | InitUser | InitUser | OK_NO_PARITY | both |
| 2 | InitLP | InitLP | OK_NO_PARITY | both |
| 3 | DepositCollateral | DepositCollateral | OK_NO_PARITY | both |
| 4 | WithdrawCollateral | WithdrawCollateral | OK_NO_PARITY | both |
| 5 | KeeperCrank | KeeperCrank | OK_NO_PARITY | both |
| 6 | TradeNoCpi | TradeNoCpi | OK_NO_PARITY | both |
| 7 | LiquidateAtOracle | LiquidateAtOracle | OK_NO_PARITY | both |
| 8 | CloseAccount | CloseAccount | OK_NO_PARITY | both |
| 9 | TopUpInsurance | TopUpInsurance | OK_NO_PARITY | both |
| 10 | TradeCpi | TradeCpi | OK_NO_PARITY | both |
| 11 | REJECTED | SetRiskThreshold (throws) | DEPRECATED_BOTH_SIDES | n/a |
| 12 | UpdateAdmin | UpdateAdmin | OK_NO_PARITY | both |
| 13 | CloseSlab | CloseSlab | OK_NO_PARITY | both |
| 14 | UpdateConfig | UpdateConfig | **WIRE_FORMAT_DRIFT** (sdk encodes 4 fields, wrapper decodes 5; missing `tvl_insurance_cap_mult: u16`) | both |
| 15 | REJECTED | SetMaintenanceFee (throws) | DEPRECATED_BOTH_SIDES | n/a |
| 16 | REJECTED | (removed in beta.29) | DEPRECATED_BOTH_SIDES | n/a |
| 17 | REJECTED | (removed in beta.29) | DEPRECATED_BOTH_SIDES | n/a |
| 18 | SetOraclePriceCap | SetOraclePriceCap | OK_NO_PARITY | both |
| 19 | ResolveMarket | ResolveMarket | OK_NO_PARITY | both |
| 20 | WithdrawInsurance | WithdrawInsurance | OK_NO_PARITY | both |
| 21 | AdminForceCloseAccount | AdminForceClose | OK_NO_PARITY | both |
| 22 | SetInsuranceWithdrawPolicy | SetInsuranceWithdrawPolicy | OK_NO_ACCOUNTS_SPEC (encoder present, no ACCOUNTS_) | both |
| 23 | WithdrawInsuranceLimited | WithdrawInsuranceLimited | OK_NO_PARITY | both |
| 24 | (gap) | QueryLpFees | DEAD_TAG_BOTH_SIDES (wrapper has no decode arm; sdk has no encoder) | n/a |
| 25 | ReclaimEmptyAccount | ReclaimEmptyAccount | **MISSING_ENCODER** (wrapper handler exists, sdk has no encoder + no ACCOUNTS_) | both |
| 26 | SettleAccount | SettleAccount | **MISSING_ENCODER** (wrapper handler exists) | both |
| 27 | DepositFeeCredits | DepositFeeCredits | **MISSING_ENCODER** (wrapper handler exists) | both |
| 28 | ConvertReleasedPnl | ConvertReleasedPnl | **MISSING_ENCODER** (wrapper handler exists) | both |
| 29 | ResolvePermissionless | ResolvePermissionless | OK_NO_PARITY | both |
| 30 | ForceCloseResolved | ForceCloseResolved | OK_NO_PARITY | both |
| 31 | (gap, was CatchupAccrue on v12.17) | (no IX_TAG) | DEAD_TAG_BOTH_SIDES | v12.17_only — REMOVED in v12.19 |
| 32 | REJECTED | SetPythOracle (throws) | DEPRECATED_BOTH_SIDES | n/a |
| 33 | REJECTED | UpdateMarkPrice (throws) | DEPRECATED_BOTH_SIDES | n/a |
| 34 | UpdateHyperpMark | UpdateHyperpMark | OK_NO_PARITY | both |
| 35 | REJECTED | TradeCpiV2 (throws) | DEPRECATED_BOTH_SIDES | n/a |
| 36 | REJECTED | UnresolveMarket (throws) | DEPRECATED_BOTH_SIDES | n/a |
| 37 | CreateLpVault | CreateLpVault | OK_NO_PARITY | both |
| 38 | LpVaultDeposit | LpVaultDeposit | OK_NO_PARITY | both |
| 39 | LpVaultWithdraw | LpVaultWithdraw | OK_NO_PARITY | both |
| 40 | LpVaultCrankFees | LpVaultCrankFees | OK_NO_PARITY | both |
| 41 | FundMarketInsurance | FundMarketInsurance | OK_NO_PARITY | both |
| 42 | (no decode arm) | SetInsuranceIsolation (throws) | DEPRECATED_BOTH_SIDES | n/a |
| 43 | ChallengeSettlement | ChallengeSettlement | OK_NO_PARITY | both |
| 44 | ResolveDispute | ResolveDispute | OK_NO_PARITY | both |
| 45 | DepositLpCollateral | DepositLpCollateral | OK_NO_PARITY | both |
| 46 | WithdrawLpCollateral | WithdrawLpCollateral | OK_NO_PARITY | both |
| 47 | QueueWithdrawal | QueueWithdrawal | OK_NO_PARITY | both |
| 48 | ClaimQueuedWithdrawal | ClaimQueuedWithdrawal | OK_NO_PARITY | both |
| 49 | CancelQueuedWithdrawal | CancelQueuedWithdrawal | OK_NO_PARITY | both |
| 50 | ExecuteAdl | ExecuteAdl | OK_NO_PARITY | both |
| 51 | CloseStaleSlabs | CloseStaleSlabs | OK_NO_PARITY | both |
| 52 | ReclaimSlabRent | ReclaimSlabRent | OK_NO_PARITY | both |
| 53 | AuditCrank | AuditCrank | OK_NO_PARITY | both |
| 54 | SetOffsetPair | SetOffsetPair | OK_NO_PARITY | both |
| 55 | AttestCrossMargin | AttestCrossMargin | OK_NO_PARITY | both |
| 56 | AdvanceOraclePhase | AdvanceOraclePhase | OK_NO_PARITY | both |
| 57 | (gap, keeper fund removed) | (no IX_TAG) | DEAD_TAG_BOTH_SIDES | n/a |
| 58 | (no decode arm) | SlashCreationDeposit (throws) | DEPRECATED_BOTH_SIDES (wrapper never implemented) | n/a |
| 59 | InitSharedVault | InitSharedVault (throws) | **DEPRECATED_BUT_HANDLER_EXISTS** (sdk throws but wrapper has handler) | both |
| 60 | AllocateMarket | AllocateMarket (throws) | **DEPRECATED_BUT_HANDLER_EXISTS** | both |
| 61 | QueueWithdrawalSV | QueueWithdrawalSV (throws) | **DEPRECATED_BUT_HANDLER_EXISTS** | both |
| 62 | ClaimEpochWithdrawal | ClaimEpochWithdrawal (throws) | **DEPRECATED_BUT_HANDLER_EXISTS** | both |
| 63 | AdvanceEpoch | AdvanceEpoch (throws) | **DEPRECATED_BUT_HANDLER_EXISTS** | both |
| 64 | MintPositionNft | MintPositionNft | OK_NO_PARITY | both |
| 65 | TransferPositionOwnership | TransferPositionOwnership | OK_NO_PARITY | both |
| 66 | BurnPositionNft | BurnPositionNft | OK_NO_PARITY | both |
| 67 | SetPendingSettlement | SetPendingSettlement | OK_NO_PARITY | both |
| 68 | ClearPendingSettlement | ClearPendingSettlement | OK_NO_PARITY | both |
| 69 | TransferOwnershipCpi | TransferOwnershipCpi | OK_NO_PARITY | both |
| 70 | SetWalletCap | SetWalletCap | OK_NO_PARITY | both |
| 71 | SetOiImbalanceHardBlock | SetOiImbalanceHardBlock | OK_NO_PARITY | both |
| 72 | RescueOrphanVault | RescueOrphanVault | OK_NO_PARITY | both |
| 73 | CloseOrphanSlab | CloseOrphanSlab | OK_NO_PARITY | both |
| 74 | SetDexPool | SetDexPool | OK_NO_PARITY | both |
| 75 | InitMatcherCtx | InitMatcherCtx | OK_NO_PARITY | both |
| 76 | PauseMarket | PauseMarket | OK_NO_PARITY | both |
| 77 | UnpauseMarket | UnpauseMarket | OK_NO_PARITY | both |
| 78 | SetMaxPnlCap | SetMaxPnlCap | OK_NO_PARITY | both |
| 79 | SetOiCapMultiplier | SetOiCapMultiplier | OK_NO_PARITY | both |
| 80 | SetDisputeParams | SetDisputeParams | OK_NO_PARITY | both |
| 81 | SetLpCollateralParams | SetLpCollateralParams | OK_NO_PARITY | both |
| 82 | AcceptAdmin | AcceptAdmin | OK_NO_PARITY | both |
| 83 | UpdateAuthority | (NOT IN IX_TAG) | **MISSING_ENCODER** (added in v12.18.x; needed for v12.17.7 deployed instruction list) | both |

## Counts

- Wrapper accepts: 71 active tags (gaps: 24, 31, 57; explicit reject: 11, 15, 16, 17, 32, 33, 35, 36, 42, 58, plus everything 84+).
- SDK IX_TAG keys: 73 (some throw).
- OK_FULL: 0 (no tag has parity coverage).
- OK_NO_PARITY: 60.
- WIRE_FORMAT_DRIFT: 1 (UpdateConfig tag 14).
- MISSING_ENCODER: 5 (ReclaimEmptyAccount, SettleAccount, DepositFeeCredits, ConvertReleasedPnl, UpdateAuthority).
- OK_NO_ACCOUNTS_SPEC: 1 (SetInsuranceWithdrawPolicy).
- DEPRECATED_BUT_HANDLER_EXISTS: 5 (InitSharedVault tag 59, AllocateMarket 60, QueueWithdrawalSV 61, ClaimEpochWithdrawal 62, AdvanceEpoch 63).
- DEPRECATED_BOTH_SIDES: 11 (correctly handled).
- DEAD_TAG_BOTH_SIDES: 3 (24, 31, 57 — correctly absent).

## v12.17 deployed reachability check

Brief lists 27 instructions reachable on v12.17.7 mainnet. Cross-check:
- All present in d760fc4 wrapper EXCEPT: PushHyperpMark (tag 17, removed Phase G), CatchupAccrue (tag 31, removed v12.19).
- UpdateAuthority (tag 83) is in d760fc4 — added in v12.18.x. Would need v12.17 binary check to confirm it ships there. Brief asserts it does.

## Critical gaps to fix in PHASE 3

1. WIRE_FORMAT_DRIFT tag 14 UpdateConfig (silent corruption).
2. MISSING_ENCODER tags 25, 26, 27, 28 — common per-account ops, missing on SDK.
3. MISSING_ENCODER tag 83 UpdateAuthority — required for v12.17 deployed support.
4. OK_NO_ACCOUNTS_SPEC tag 22 — add ACCOUNTS_SET_INSURANCE_WITHDRAW_POLICY.
5. DEPRECATED_BUT_HANDLER_EXISTS tags 59-63 — investigate whether to un-throw or leave as `throws` and document.
