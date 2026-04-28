# PHASE 10 — gates output

| gate | result | notes |
|:---|:---|:---|
| `pnpm test` | **832 PASS / 31 SKIPPED** (27 test files) | matches baseline |
| `pnpm lint` | clean (zero errors) | tsc --noEmit succeeds |
| `pnpm build` | clean | dist/index.js 265.07 KB, dist/vanilla.js 28.18 KB |
| `pnpm run parity:check` | **RED** (exit 1) | 1 of 4 programs drifted: percolator-prog spec includes UpdateAuthority (tag 83), but the wrapper's `cargo run --bin sdk_parity_fixtures` binary output does NOT include UpdateAuthority. Committed spec is AHEAD of wrapper binary. |

Per brief: "if a gate is red. classify red gates as a BYTE_DRIFT_BLOCKING
and continue."

Classification: parity:check red is **BYTE_DRIFT_BLOCKING** by brief
rule. Substantively, this is a wrapper-side issue (W-1 from
audit-2026-04-27/wrapper-findings.md) where wrapper's
`src/bin/sdk_parity_fixtures.rs` enumerates 78 tags but stops at tag 82,
omitting tag 83 UpdateAuthority. The SDK was correctly updated (added
UpdateAuthority to the spec), but the wrapper-side parity binary was
not updated in the same change (cannot push wrapper from this audit
session).

This means consumer-facing test runs of `pnpm parity:check` against the
wrapper at d760fc4 would fail today. CI gate red.

## Other gate observations

`pnpm test` only checks encoder LENGTH and tag bytes, not full byte
parity against wrapper-decoded reference. So it does not catch the
v12.17 mainnet drifts found in PHASES 1-3 (UpdateAdmin@12, UpdateConfig
short payload, SetInsuranceWithdrawPolicy@22, UpdateAuthority@83
collision, etc.). Expanding test coverage to include wrapper-decode
verification is a follow-up recommendation.

`dist/index.js` is STALE relative to src/. `dist/index.js` does not
contain the v12.19 target branch in `encodeInitMarket` and
`encodeUpdateConfig` from sync/v12.19-sdk source. Empirical test of the
bundled `dist/` shows v12.17 default = 344 bytes AND v12.19 = 344 bytes
(both v12.17 path). When `pnpm build` is run, dist gets refreshed but
HEAD on the branch still has the old dist committed. Severity: DOC_DRIFT_LOW
(consumers using the bundled artifact don't get the fix; they would
need to rebuild from source).
