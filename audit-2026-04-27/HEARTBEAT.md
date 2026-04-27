# SDK audit — Heartbeat

## STAGE I COMPLETE → starting STAGE II

Cut 1.0.0-beta.38 on `main`. 809 PASS / 31 SKIPPED. STAGE_I_FINAL.md present.

5 missing encoders + 6 ACCOUNTS_ specs + 27 byte-level parity tests added.
v12.19-only fixes (UpdateConfig 5-field variant, InitMarket 40-byte drift,
PERC-628 shared vault tags 59-63) deferred to STAGE II.

Wrapper finding W-1 (sdk_parity_fixtures.rs missing tag 83) logged for
next wrapper sync. Cannot push from this session per brief.

## Stage II PHASE A about to start

Recheck PR state for branch policy decision.
