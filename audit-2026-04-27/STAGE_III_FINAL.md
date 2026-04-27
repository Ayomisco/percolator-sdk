# STAGE III — final report

Two-track package split. Cut 2.0.0-rc.0 on `sync/v12.19-sdk` branch.

## Verdict

GO. Vanilla subpath ships at 28 KB, full SDK unchanged at 265 KB.

## Structure decision

Option (2) single repo, multi entry. See
`audit-2026-04-27/STAGE_III_DECISION.md` for the rejected alternatives.

`src/index.ts` continues to export the full surface. `src/vanilla.ts`
exports the v12.17.7 deployed-line subset.
`package.json` `exports` maps both subpaths.

## Vanilla subset

27 instructions, 28 ACCOUNTS_ specs, 10 encoding primitives, 2 const
maps (IX_TAG, AUTHORITY_KIND). Authoritative list at
`audit-2026-04-27/vanilla-subset.md`.

## Surface gate

`test/vanilla.test.ts` asserts:
1. Every documented vanilla encoder is exported.
2. Every documented account spec is exported.
3. Every documented primitive is exported.
4. IX_TAG and AUTHORITY_KIND const maps are exported.
5. NO fork-extended symbols are leaked (45-name forbidden list).
6. Total export count matches the documented bound.

If a refactor accidentally re-exports a fork symbol via `src/vanilla.ts`,
the test fails with the offending name.

## Build output

```
$ pnpm build
ESM dist/vanilla.js     28.18 KB
ESM dist/index.js       265.07 KB
ESM dist/vanilla.js.map 142.93 KB
ESM dist/index.js.map   655.89 KB
ESM ⚡️ Build success in 17ms
```

`dist/vanilla.d.ts` and `dist/index.d.ts` emitted by `tsc` per the
package.json `build` script.

## Resolution path verified

Per the brief: "verify import { encodeInitUser } from
@percolatorct/sdk/vanilla resolves via test build." The `test/vanilla.test.ts`
file imports `* as vanilla from "../src/vanilla.js"` and asserts on the
exported names. The TS-level resolution works. The `package.json` `exports`
field maps `./vanilla` -> `dist/vanilla.{d.ts,js}`. After publish, npm
consumers can import via `@percolatorct/sdk/vanilla`.

## Gates green

- pnpm build: dist/index.js + dist/vanilla.js emitted.
- pnpm lint: zero errors.
- pnpm test: 27 files, 832 PASS, 31 SKIPPED.

## Commit hashes

```
<sha-stage-III> release: v2.0.0-rc.0. two-flavor package split.
tag v2.0.0-rc.0
```

Branch: `sync/v12.19-sdk` (not pushed remote, beta.39-presync + 2.0.0-rc.0
share the branch).

## Verdict

STAGE III COMPLETE. Writing FINAL.md and stopping.
