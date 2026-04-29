/**
 * v12.19 encoder byte parity.
 *
 * Wrapper target d760fc4 (PR #271, branch sync/v12.19-wrapper).
 * Single-target SDK after audit-2026-04-28.
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
    it("emits 35 bytes (4 funding fields + tvl_insurance_cap_mult u16)", () => {
      const data = encodeUpdateConfig({
        fundingHorizonSlots: 100n,
        fundingKBps: 5n,
        fundingMaxPremiumBps: 200n,
        fundingMaxBpsPerSlot: 10n,
        tvlInsuranceCapMult: 250,
      });
      expect(data.length).toBe(35);
      expect(data[0]).toBe(IX_TAG.UpdateConfig);
      // tvlInsuranceCapMult = 250 = 0x00FA LE -> [0xFA, 0x00]
      expect(data[33]).toBe(0xFA);
      expect(data[34]).toBe(0x00);
    });

    it("omitted tvlInsuranceCapMult defaults to 0", () => {
      const data = encodeUpdateConfig({
        fundingHorizonSlots: 0n,
        fundingKBps: 0n,
        fundingMaxPremiumBps: 0n,
        fundingMaxBpsPerSlot: 0n,
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
      minNonzeroMmReq: 1000n,
      minNonzeroImReq: 2000n,
    };

    it("emits 370-byte v12.19 payload (304 base + 66 mandatory ext tail)", () => {
      const data = encodeInitMarket(baseArgs);
      expect(data.length).toBe(370);
      expect(data[0]).toBe(IX_TAG.InitMarket);
    });

    it("ignores deprecated v12.17 fields (maxInsuranceFloor, minOraclePriceCap, minInitialDeposit)", () => {
      const without = encodeInitMarket(baseArgs);
      const withDeprecated = encodeInitMarket({
        ...baseArgs,
        maxInsuranceFloor: 99999n,
        minOraclePriceCap: 88888n,
        minInitialDeposit: 77777n,
      });
      expect(without.length).toBe(370);
      expect(withDeprecated.length).toBe(370);
      expect(Buffer.from(without).equals(Buffer.from(withDeprecated))).toBe(true);
    });
  });

  describe("PERC-628 shared vault (tags 59-63)", () => {
    it("InitSharedVault (tag 59) emits 11 bytes", () => {
      const data = encodeInitSharedVault({
        epochDurationSlots: 1000n,
        maxMarketExposureBps: 500,
      });
      expect(data.length).toBe(11);
      expect(data[0]).toBe(IX_TAG.InitSharedVault);
    });

    it("AllocateMarket (tag 60) emits 17 bytes", () => {
      const data = encodeAllocateMarket({ amount: 1_000_000_000n });
      expect(data.length).toBe(17);
      expect(data[0]).toBe(IX_TAG.AllocateMarket);
    });

    it("QueueWithdrawalSV (tag 61) emits 9 bytes", () => {
      const data = encodeQueueWithdrawalSV({ lpAmount: 1000n });
      expect(data.length).toBe(9);
      expect(data[0]).toBe(IX_TAG.QueueWithdrawalSV);
    });

    it("ClaimEpochWithdrawal (tag 62) emits 1 byte", () => {
      const data = encodeClaimEpochWithdrawal();
      expect(data.length).toBe(1);
      expect(data[0]).toBe(IX_TAG.ClaimEpochWithdrawal);
    });

    it("AdvanceEpoch (tag 63) emits 1 byte", () => {
      const data = encodeAdvanceEpoch();
      expect(data.length).toBe(1);
      expect(data[0]).toBe(IX_TAG.AdvanceEpoch);
    });
  });

  describe("v12.19 IX_TAG sanity", () => {
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
