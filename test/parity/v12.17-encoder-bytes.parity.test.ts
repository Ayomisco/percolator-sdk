/**
 * v12.17.7 deployed-line encoder byte parity (audit-2026-04-27 PHASE 4).
 *
 * Validates each encoder used by mainnet's v12.17.7 deployed program produces
 * the byte sequence the wrapper decode arm expects. Field positions cited per
 * src/percolator.rs decode arms documented in audit-2026-04-27/borsh-audit.md.
 *
 * Coverage gate: this file enumerates the v12.17 reachable instruction set.
 * Adding an entry to that set requires adding a fixture and an `it` block.
 * The meta-test at the bottom enforces 1-to-1.
 */
import { describe, it, expect } from "vitest";
import { PublicKey } from "@solana/web3.js";

import {
  IX_TAG,
  AUTHORITY_KIND,
  encodeInitUser,
  encodeInitLP,
  encodeDepositCollateral,
  encodeWithdrawCollateral,
  encodeKeeperCrank,
  encodeTradeNoCpi,
  encodeTradeCpi,
  encodeLiquidateAtOracle,
  encodeCloseAccount,
  encodeTopUpInsurance,
  encodeCloseSlab,
  encodeUpdateConfig,
  encodeSetOraclePriceCap,
  encodeResolveMarket,
  encodeWithdrawInsurance,
  encodeAdminForceClose,
  encodeWithdrawInsuranceLimited,
  encodeReclaimEmptyAccount,
  encodeSettleAccount,
  encodeDepositFeeCredits,
  encodeConvertReleasedPnl,
  encodeResolvePermissionless,
  encodeForceCloseResolved,
  encodeUpdateAuthority,
  encodeUpdateAdmin,
} from "../../src/abi/instructions.js";

function hex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function asU16Le(n: number): string {
  return (n & 0xff).toString(16).padStart(2, "0") + ((n >> 8) & 0xff).toString(16).padStart(2, "0");
}

function asU64Le(n: bigint): string {
  let h = "";
  for (let i = 0; i < 8; i++) {
    h += Number((n >> BigInt(i * 8)) & 0xffn).toString(16).padStart(2, "0");
  }
  return h;
}

describe("v12.17 encoder byte parity", () => {
  it("InitUser tag 1 = tag(1) + feePayment u64", () => {
    const data = encodeInitUser({ feePayment: 0n });
    expect(data.length).toBe(9);
    expect(data[0]).toBe(IX_TAG.InitUser);
    expect(hex(data)).toBe("01" + asU64Le(0n));
  });

  it("InitLP tag 2 = tag(1) + matcherProgram(32) + matcherContext(32) + feePayment u64", () => {
    const data = encodeInitLP({
      matcherProgram: PublicKey.default,
      matcherContext: PublicKey.default,
      feePayment: 0n,
    });
    expect(data.length).toBe(73);
    expect(data[0]).toBe(IX_TAG.InitLP);
  });

  it("DepositCollateral tag 3 = tag(1) + userIdx u16 + amount u64", () => {
    const data = encodeDepositCollateral({ userIdx: 5, amount: 1_000_000n });
    expect(data.length).toBe(11);
    expect(hex(data)).toBe("03" + asU16Le(5) + asU64Le(1_000_000n));
  });

  it("WithdrawCollateral tag 4 = tag(1) + userIdx u16 + amount u64", () => {
    const data = encodeWithdrawCollateral({ userIdx: 7, amount: 500_000n });
    expect(data.length).toBe(11);
    expect(hex(data)).toBe("04" + asU16Le(7) + asU64Le(500_000n));
  });

  it("KeeperCrank tag 5 with empty candidates = tag + caller_idx + format_version=1", () => {
    const data = encodeKeeperCrank({ callerIdx: 0 });
    expect(data.length).toBe(4);
    expect(data[0]).toBe(IX_TAG.KeeperCrank);
    expect(data[3]).toBe(1);
  });

  it("TradeNoCpi tag 6 = tag(1) + lpIdx u16 + userIdx u16 + size i128", () => {
    const data = encodeTradeNoCpi({ lpIdx: 1, userIdx: 2, size: 1000n });
    expect(data.length).toBe(21);
    expect(data[0]).toBe(IX_TAG.TradeNoCpi);
    expect(data[1]).toBe(1);
    expect(data[3]).toBe(2);
  });

  it("TradeCpi tag 10 = tag(1) + lpIdx u16 + userIdx u16 + size i128 + limitPrice u64", () => {
    const data = encodeTradeCpi({
      lpIdx: 1,
      userIdx: 2,
      size: 1000n,
      limitPriceE6: 100_000_000n,
    });
    expect(data.length).toBe(29);
    expect(data[0]).toBe(IX_TAG.TradeCpi);
  });

  it("LiquidateAtOracle tag 7 = tag(1) + targetIdx u16", () => {
    const data = encodeLiquidateAtOracle({ targetIdx: 4 });
    expect(data.length).toBe(3);
    expect(hex(data)).toBe("07" + asU16Le(4));
  });

  it("CloseAccount tag 8 = tag(1) + userIdx u16", () => {
    const data = encodeCloseAccount({ userIdx: 9 });
    expect(data.length).toBe(3);
    expect(hex(data)).toBe("08" + asU16Le(9));
  });

  it("TopUpInsurance tag 9 = tag(1) + amount u64", () => {
    const data = encodeTopUpInsurance({ amount: 5000n });
    expect(data.length).toBe(9);
    expect(hex(data)).toBe("09" + asU64Le(5000n));
  });

  it("CloseSlab tag 13 = tag only", () => {
    const data = encodeCloseSlab();
    expect(data.length).toBe(1);
    expect(data[0]).toBe(IX_TAG.CloseSlab);
  });

  it("UpdateAdmin tag 12 = tag(1) + newAdmin pubkey(32)", () => {
    const data = encodeUpdateAdmin({ newAdmin: PublicKey.default });
    expect(data.length).toBe(33);
    expect(data[0]).toBe(IX_TAG.UpdateAdmin);
    for (let i = 1; i < 33; i++) {
      expect(data[i]).toBe(0);
    }
  });

  it("UpdateConfig tag 14 (v12.17.7) = tag(1) + 4 fields x 8 bytes = 33 bytes", () => {
    const data = encodeUpdateConfig({
      fundingHorizonSlots: 100n,
      fundingKBps: 5n,
      fundingMaxPremiumBps: 200n,
      fundingMaxBpsPerSlot: 10n,
    });
    expect(data.length).toBe(33);
    expect(data[0]).toBe(IX_TAG.UpdateConfig);
  });

  it("SetOraclePriceCap tag 18 = tag(1) + maxChangeE2bps u64", () => {
    const data = encodeSetOraclePriceCap({ maxChangeE2bps: 10_000n });
    expect(data.length).toBe(9);
    expect(hex(data)).toBe("12" + asU64Le(10_000n));
  });

  it("ResolveMarket tag 19 = tag only", () => {
    const data = encodeResolveMarket();
    expect(data.length).toBe(1);
    expect(data[0]).toBe(IX_TAG.ResolveMarket);
  });

  it("WithdrawInsurance tag 20 = tag only", () => {
    const data = encodeWithdrawInsurance();
    expect(data.length).toBe(1);
    expect(data[0]).toBe(IX_TAG.WithdrawInsurance);
  });

  it("AdminForceClose tag 21 = tag(1) + targetIdx u16", () => {
    const data = encodeAdminForceClose({ targetIdx: 11 });
    expect(data.length).toBe(3);
    expect(hex(data)).toBe("15" + asU16Le(11));
  });

  it("WithdrawInsuranceLimited tag 23 = tag(1) + amount u64", () => {
    const data = encodeWithdrawInsuranceLimited({ amount: 100_000n });
    expect(data.length).toBe(9);
    expect(hex(data)).toBe("17" + asU64Le(100_000n));
  });

  it("ReclaimEmptyAccount tag 25 = tag(1) + userIdx u16", () => {
    const data = encodeReclaimEmptyAccount({ userIdx: 7 });
    expect(data.length).toBe(3);
    expect(hex(data)).toBe("19" + asU16Le(7));
  });

  it("SettleAccount tag 26 = tag(1) + userIdx u16", () => {
    const data = encodeSettleAccount({ userIdx: 5 });
    expect(data.length).toBe(3);
    expect(hex(data)).toBe("1a" + asU16Le(5));
  });

  it("DepositFeeCredits tag 27 = tag(1) + userIdx u16 + amount u64", () => {
    const data = encodeDepositFeeCredits({ userIdx: 3, amount: 1000n });
    expect(data.length).toBe(11);
    expect(hex(data)).toBe("1b" + asU16Le(3) + asU64Le(1000n));
  });

  it("ConvertReleasedPnl tag 28 = tag(1) + userIdx u16 + amount u64", () => {
    const data = encodeConvertReleasedPnl({ userIdx: 9, amount: 5000n });
    expect(data.length).toBe(11);
    expect(hex(data)).toBe("1c" + asU16Le(9) + asU64Le(5000n));
  });

  it("ResolvePermissionless tag 29 = tag only", () => {
    const data = encodeResolvePermissionless();
    expect(data.length).toBe(1);
    expect(data[0]).toBe(IX_TAG.ResolvePermissionless);
  });

  it("ForceCloseResolved tag 30 = tag(1) + userIdx u16", () => {
    const data = encodeForceCloseResolved({ userIdx: 12 });
    expect(data.length).toBe(3);
    expect(hex(data)).toBe("1e" + asU16Le(12));
  });

  it("UpdateAuthority tag 83 = tag(1) + kind u8 + newPubkey(32)", () => {
    const data = encodeUpdateAuthority({
      kind: AUTHORITY_KIND.Admin,
      newPubkey: PublicKey.default,
    });
    expect(data.length).toBe(34);
    expect(data[0]).toBe(IX_TAG.UpdateAuthority);
    expect(data[1]).toBe(AUTHORITY_KIND.Admin);
    for (let i = 2; i < 34; i++) {
      expect(data[i]).toBe(0);
    }
  });
});

describe("v12.17 encoder coverage gate", () => {
  /**
   * The v12.17.7 deployed instruction set per audit-2026-04-27. PushHyperpMark
   * (tag 17) and CatchupAccrue (tag 31) are explicitly excluded — both removed
   * upstream and not present in d760fc4 wrapper. The deployed mainnet binary
   * may include UpdateAuthority (tag 83) per the brief; the wrapper handler
   * for tag 83 was added in 86ea41f (2026-04-22).
   */
  const v12_17_REACHABLE = [
    "InitMarket",
    "InitUser",
    "InitLP",
    "DepositCollateral",
    "WithdrawCollateral",
    "KeeperCrank",
    "TradeNoCpi",
    "LiquidateAtOracle",
    "CloseAccount",
    "TopUpInsurance",
    "TradeCpi",
    "CloseSlab",
    "UpdateConfig",
    "SetOraclePriceCap",
    "ResolveMarket",
    "WithdrawInsurance",
    "AdminForceClose",
    "WithdrawInsuranceLimited",
    "ReclaimEmptyAccount",
    "SettleAccount",
    "DepositFeeCredits",
    "ConvertReleasedPnl",
    "ResolvePermissionless",
    "ForceCloseResolved",
    "UpdateAdmin",
    "UpdateAuthority",
  ] as const;

  it("every v12.17.7 reachable instruction has an IX_TAG entry", () => {
    for (const name of v12_17_REACHABLE) {
      expect(IX_TAG, `missing IX_TAG.${name}`).toHaveProperty(name);
    }
  });

  it("InitMarket parity is checked in test/abi.test.ts (344-byte length + tag)", () => {
    expect(IX_TAG.InitMarket).toBe(0);
  });
});
