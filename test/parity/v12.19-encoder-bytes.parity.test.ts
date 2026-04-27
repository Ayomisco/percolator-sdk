/**
 * v12.19 wrapper-target encoder byte parity (audit-2026-04-27 PHASE D).
 *
 * Tests encoders that diverge between v12.17 and v12.19 wire formats.
 * v12.17 baseline coverage lives in v12.17-encoder-bytes.parity.test.ts.
 *
 * Wrapper target d760fc4 (PR #271).
 */
import { describe, it, expect } from "vitest";
import { PublicKey } from "@solana/web3.js";

import {
  IX_TAG,
  AUTHORITY_KIND,
  encodeInitMarket,
  encodeUpdateConfig,
  encodeInitSharedVault,
  encodeAllocateMarket,
  encodeQueueWithdrawalSV,
  encodeClaimEpochWithdrawal,
  encodeAdvanceEpoch,
} from "../../src/abi/instructions.js";

const ZERO_FEED = "0000000000000000000000000000000000000000000000000000000000000000";

describe("v12.19 encoder byte parity", () => {
  describe("UpdateConfig (tag 14)", () => {
    it("v12.17 default: 33 bytes (4 funding fields)", () => {
      const data = encodeUpdateConfig({
        fundingHorizonSlots: 100n,
        fundingKBps: 5n,
        fundingMaxPremiumBps: 200n,
        fundingMaxBpsPerSlot: 10n,
      });
      expect(data.length).toBe(33);
      expect(data[0]).toBe(IX_TAG.UpdateConfig);
    });

    it("v12.19 target: 35 bytes (adds tvl_insurance_cap_mult u16)", () => {
      const data = encodeUpdateConfig({
        fundingHorizonSlots: 100n,
        fundingKBps: 5n,
        fundingMaxPremiumBps: 200n,
        fundingMaxBpsPerSlot: 10n,
        tvlInsuranceCapMult: 250,
        target: 'v12.19',
      });
      expect(data.length).toBe(35);
      expect(data[0]).toBe(IX_TAG.UpdateConfig);
      // tvlInsuranceCapMult = 250 = 0xFA00 LE -> [0xFA, 0x00]
      expect(data[33]).toBe(0xFA);
      expect(data[34]).toBe(0x00);
    });

    it("v12.19 target with omitted tvlInsuranceCapMult defaults to 0", () => {
      const data = encodeUpdateConfig({
        fundingHorizonSlots: 0n,
        fundingKBps: 0n,
        fundingMaxPremiumBps: 0n,
        fundingMaxBpsPerSlot: 0n,
        target: 'v12.19',
      });
      expect(data.length).toBe(35);
      expect(data[33]).toBe(0);
      expect(data[34]).toBe(0);
    });
  });

  describe("InitMarket (tag 0)", () => {
    const baseArgs = {
      admin: PublicKey.default,
      collateralMint: PublicKey.default,
      indexFeedId: ZERO_FEED,
      maxStalenessSecs: 60n,
      confFilterBps: 50,
      invert: 0,
      unitScale: 0,
      initialMarkPriceE6: 0n,
      warmupPeriodSlots: 1000n,
      maintenanceMarginBps: 500n,
      initialMarginBps: 1000n,
      tradingFeeBps: 10n,
      maxAccounts: 1000n,
      newAccountFee: 1_000_000n,
      maintenanceFeePerSlot: 100n,
      maxCrankStalenessSlots: 50n,
      liquidationFeeBps: 100n,
      liquidationFeeCap: 10_000_000n,
      liquidationBufferBps: 50n,
      minLiquidationAbs: 1_000_000n,
      minInitialDeposit: 500_000n,
      minNonzeroMmReq: 1000n,
      minNonzeroImReq: 2000n,
    };

    it("v12.17 default: 344-byte base payload", () => {
      const data = encodeInitMarket(baseArgs);
      expect(data.length).toBe(344);
      expect(data[0]).toBe(IX_TAG.InitMarket);
    });

    it("v12.19 target: 304-byte base payload (drops 40 bytes)", () => {
      const data = encodeInitMarket({ ...baseArgs, target: 'v12.19' });
      expect(data.length).toBe(304);
      expect(data[0]).toBe(IX_TAG.InitMarket);
    });

    it("v12.19 ignores maxInsuranceFloor + minOraclePriceCap + minInitialDeposit", () => {
      const v17 = encodeInitMarket(baseArgs);
      const v19 = encodeInitMarket({
        ...baseArgs,
        target: 'v12.19',
        maxInsuranceFloor: 99999n,
        minOraclePriceCap: 88888n,
        minInitialDeposit: 77777n,
      });
      expect(v17.length - v19.length).toBe(40);
    });
  });

  describe("PERC-628 shared vault (tags 59-63)", () => {
    it("InitSharedVault (tag 59) with v12.19 target encodes 11 bytes", () => {
      const data = encodeInitSharedVault({
        epochDurationSlots: 1000n,
        maxMarketExposureBps: 500,
        target: 'v12.19',
      });
      expect(data.length).toBe(11);
      expect(data[0]).toBe(IX_TAG.InitSharedVault);
    });

    it("InitSharedVault (tag 59) without target throws (v12.17 default)", () => {
      expect(() =>
        encodeInitSharedVault({
          epochDurationSlots: 1000n,
          maxMarketExposureBps: 500,
        }),
      ).toThrow();
    });

    it("AllocateMarket (tag 60) with v12.19 target encodes 17 bytes", () => {
      const data = encodeAllocateMarket({
        amount: 1_000_000_000n,
        target: 'v12.19',
      });
      expect(data.length).toBe(17);
      expect(data[0]).toBe(IX_TAG.AllocateMarket);
    });

    it("AllocateMarket (tag 60) without target throws", () => {
      expect(() => encodeAllocateMarket({ amount: 1n })).toThrow();
    });

    it("QueueWithdrawalSV (tag 61) with v12.19 target encodes 9 bytes", () => {
      const data = encodeQueueWithdrawalSV({
        lpAmount: 1000n,
        target: 'v12.19',
      });
      expect(data.length).toBe(9);
      expect(data[0]).toBe(IX_TAG.QueueWithdrawalSV);
    });

    it("QueueWithdrawalSV (tag 61) without target throws", () => {
      expect(() => encodeQueueWithdrawalSV({ lpAmount: 1n })).toThrow();
    });

    it("ClaimEpochWithdrawal (tag 62) with v12.19 target encodes 1 byte", () => {
      const data = encodeClaimEpochWithdrawal({ target: 'v12.19' });
      expect(data.length).toBe(1);
      expect(data[0]).toBe(IX_TAG.ClaimEpochWithdrawal);
    });

    it("ClaimEpochWithdrawal (tag 62) without target throws", () => {
      expect(() => encodeClaimEpochWithdrawal()).toThrow();
    });

    it("AdvanceEpoch (tag 63) with v12.19 target encodes 1 byte", () => {
      const data = encodeAdvanceEpoch({ target: 'v12.19' });
      expect(data.length).toBe(1);
      expect(data[0]).toBe(IX_TAG.AdvanceEpoch);
    });

    it("AdvanceEpoch (tag 63) without target throws", () => {
      expect(() => encodeAdvanceEpoch()).toThrow();
    });
  });

  describe("v12.19-only IX_TAG sanity", () => {
    it("UpdateAuthority (tag 83) and PERC-628 tags are present", () => {
      expect(IX_TAG.UpdateAuthority).toBe(83);
      expect(IX_TAG.InitSharedVault).toBe(59);
      expect(IX_TAG.AllocateMarket).toBe(60);
      expect(IX_TAG.QueueWithdrawalSV).toBe(61);
      expect(IX_TAG.ClaimEpochWithdrawal).toBe(62);
      expect(IX_TAG.AdvanceEpoch).toBe(63);
      expect(AUTHORITY_KIND.Admin).toBe(0);
    });
  });
});
