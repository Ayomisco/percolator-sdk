# SDK drift verification — Heartbeat

## ALL 12 PHASES COMPLETE

Verdict: **NO_GO** for mainnet publication.

10 BLOCKING + 8 HIGH + 5 MEDIUM + 3 LOW drifts.

## Worktree cleanup

Both /tmp/wrapper-v12.17 and /tmp/engine-v12.17 removed.

## Key BLOCKING findings

1. encodeInitMarket v12.17 default sends 344 bytes, mainnet expects 296.
2. encodeUpdateConfig v12.17 default sends 33 bytes, mainnet expects 35.
3. encodeUpdateAdmin (tag 12) — mainnet has it deleted.
4. encodeSetInsuranceWithdrawPolicy (tag 22) — mainnet has it deleted.
5. encodeUpdateAuthority sends tag 83 — mainnet uses tag 32.
6. encodeAcceptAdmin (tag 82) — not in v12.17 mainnet.
7. dist/ stale relative to src/ — bundled artifact lacks v12.19 target branches.
8. detectSlabLayout missing v12.19 layouts.
9. parity:check fails (CI gate red).

The audit-2026-04-27 STAGE I report was based on a bad assumption that
v12.17 mainnet pin = pre-tvl_insurance_cap_mult, pre-UpdateAuthority-at-32,
pre-tag-12-deletion. Mainnet pin (06f86fb, 2026-04-22) is post-all-those.

## Stopping per brief.
