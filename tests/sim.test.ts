import { describe, expect, it } from "vitest";
import { mulberry32, quantileSorted, std, mean } from "@/lib/sim/rng";
import {
  PAPER_PARAMS,
  PAPER_TABLE_GAMMA_01,
  averageSpread,
  monteCarlo,
  reservationPrice,
  simulate,
  totalSpread,
} from "@/lib/sim/marketMaking";
import { generateEvalSet, pairedBootstrap, histogram } from "@/lib/sim/bootstrap";
import {
  decodeCached,
  forwardFull,
  makeModel,
  maxAbsDiff,
  tokenize,
  uncachedGenerationOps,
} from "@/lib/sim/attention";
import { contentDefinedBoundaries, planSync, reconstruct } from "@/lib/sim/merkle";

describe("rng", () => {
  it("is deterministic per seed and uniform-ish", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const xs = Array.from({ length: 20000 }, () => a());
    expect(xs.slice(0, 5)).toEqual(Array.from({ length: 5 }, () => b()));
    expect(mean(xs)).toBeGreaterThan(0.49);
    expect(mean(xs)).toBeLessThan(0.51);
    expect(std(xs)).toBeCloseTo(Math.sqrt(1 / 12), 2);
  });
  it("interpolates quantiles", () => {
    expect(quantileSorted([0, 10], 0.5)).toBe(5);
    expect(quantileSorted([1, 2, 3, 4, 5], 0)).toBe(1);
    expect(quantileSorted([1, 2, 3, 4, 5], 1)).toBe(5);
  });
});

describe("Avellaneda-Stoikov", () => {
  it("reservation price leans against inventory and equals the mid when flat", () => {
    const p = PAPER_PARAMS;
    expect(reservationPrice(p, 100, 0, 0.5)).toBe(100);
    expect(reservationPrice(p, 100, 3, 0.5)).toBeLessThan(100);
    expect(reservationPrice(p, 100, -3, 0.5)).toBeGreaterThan(100);
    expect(reservationPrice(p, 100, 3, 0)).toBe(100);
  });

  it("spread matches the closed form and shrinks toward the horizon", () => {
    const p = PAPER_PARAMS;
    const expected = 0.1 * 4 * 1 + (2 / 0.1) * Math.log(1 + 0.1 / 1.5);
    expect(totalSpread(p, 1)).toBeCloseTo(expected, 12);
    expect(totalSpread(p, 0)).toBeLessThan(totalSpread(p, 1));
    // The paper reports an average spread of 1.49 for gamma = 0.1.
    expect(averageSpread(p)).toBeCloseTo(PAPER_TABLE_GAMMA_01.inventory.spread, 1);
  });

  it("produces finite, well-formed paths with bid < ask", () => {
    const path = simulate(PAPER_PARAMS, "inventory", 7);
    expect(path.mid.length).toBe(201);
    for (let i = 0; i < path.mid.length; i++) {
      expect(Number.isFinite(path.pnl[i])).toBe(true);
      expect(path.bid[i]).toBeLessThan(path.ask[i]);
    }
    expect(path.fills).toBeGreaterThan(0);
  });

  it("reproduces the paper's finding: inventory control cuts P&L and inventory variance", () => {
    const mc = monteCarlo(PAPER_PARAMS, 400, 1);
    const inv = mc.inventory;
    const sym = mc.symmetric;
    // Paper (Table 1, gamma = 0.1): std profit 5.89 vs 13.43; std final q 2.80 vs 8.66.
    expect(inv.stdPnl).toBeLessThan(sym.stdPnl * 0.7);
    expect(inv.stdFinalInventory).toBeLessThan(sym.stdFinalInventory * 0.6);
    // Mean profits land in the paper's neighbourhood (62.94 and 67.21).
    expect(inv.meanPnl).toBeGreaterThan(50);
    expect(inv.meanPnl).toBeLessThan(75);
    expect(sym.meanPnl).toBeGreaterThan(50);
    expect(sym.meanPnl).toBeLessThan(80);
  });

  it("toxic flow wrecks symmetric quoting; inventory skew absorbs most of it", () => {
    const toxic = { ...PAPER_PARAMS, toxic: true };
    const base = monteCarlo(PAPER_PARAMS, 300, 3);
    const hurt = monteCarlo(toxic, 300, 3);
    const gated = monteCarlo({ ...toxic, gate: true }, 300, 3);
    const symLoss = base.symmetric.meanPnl - hurt.symmetric.meanPnl;
    const invLoss = base.inventory.meanPnl - hurt.inventory.meanPnl;
    expect(symLoss).toBeGreaterThan(0);
    expect(symLoss).toBeGreaterThan(3 * Math.max(invLoss, 0));
    expect(hurt.symmetric.stdPnl).toBeGreaterThan(3 * base.symmetric.stdPnl);
    // The imbalance gate is a partial defence for the quoter with no inventory control.
    expect(gated.symmetric.meanPnl).toBeGreaterThan(hurt.symmetric.meanPnl);
  });
});

describe("paired bootstrap gate", () => {
  const base = { n: 200, caseSpread: 1.5, noise: 0.25, kind: "continuous" as const, seed: 11 };

  it("detects a real regression and a real improvement", () => {
    const worse = pairedBootstrap(generateEvalSet({ ...base, trueDelta: -0.3 }), 4000, 5);
    expect(worse.verdict).toBe("regression");
    expect(worse.paired.hi).toBeLessThan(0);
    const better = pairedBootstrap(generateEvalSet({ ...base, trueDelta: 0.3 }), 4000, 5);
    expect(better.verdict).toBe("improvement");
  });

  it("does not cry wolf when nothing changed, at roughly the nominal rate", () => {
    let falseAlarms = 0;
    const trials = 60;
    for (let s = 0; s < trials; s++) {
      const r = pairedBootstrap(generateEvalSet({ ...base, trueDelta: 0, seed: 100 + s }), 1000, s);
      if (r.verdict !== "no-detectable-change") falseAlarms++;
    }
    expect(falseAlarms / trials).toBeLessThan(0.15);
  });

  it("pairing gives a much tighter interval than an unpaired bootstrap", () => {
    const r = pairedBootstrap(generateEvalSet({ ...base, trueDelta: 0.1 }), 4000, 9);
    const pairedWidth = r.paired.hi - r.paired.lo;
    const unpairedWidth = r.unpaired.hi - r.unpaired.lo;
    expect(pairedWidth).toBeLessThan(unpairedWidth * 0.5);
    expect(r.observedDelta).toBeGreaterThan(r.paired.lo);
    expect(r.observedDelta).toBeLessThan(r.paired.hi);
  });

  it("refuses to judge tiny eval sets", () => {
    const r = pairedBootstrap(generateEvalSet({ ...base, n: 10, trueDelta: -2 }), 500, 1);
    expect(r.verdict).toBe("insufficient-data");
  });

  it("histogram conserves counts", () => {
    const h = histogram([0, 0.5, 1, 1, 2], 4);
    expect(h.counts.reduce((a, b) => a + b, 0)).toBe(5);
  });
});

describe("KV-cache equivalence", () => {
  const model = makeModel(16, 64, 3);
  const tokens = tokenize("the cache must not change the answer", 64);

  it("cached decoding matches the full pass to float32 rounding error", () => {
    const full = forwardFull(model, tokens);
    const cached = decodeCached(model, tokens);
    const diff = maxAbsDiff(full.outputs, cached.outputs);
    expect(diff).toBeLessThan(1e-5);
  });

  it("an off-by-one position index is caught by the same check", () => {
    const full = forwardFull(model, tokens);
    const buggy = decodeCached(model, tokens, "position-offset");
    expect(maxAbsDiff(full.outputs, buggy.outputs)).toBeGreaterThan(1e-2);
  });

  it("a missing causal mask is caught by the same check", () => {
    const buggy = forwardFull(model, tokens, "no-causal-mask");
    const cached = decodeCached(model, tokens);
    expect(maxAbsDiff(buggy.outputs, cached.outputs)).toBeGreaterThan(1e-2);
  });

  it("the cache turns quadratic projection work into linear work", () => {
    const cached = decodeCached(model, tokens).ops.projectionMacs;
    const uncached = uncachedGenerationOps(model, tokens).projectionMacs;
    // Per token: 4 projections of d*d. Without a cache, step t re-projects the whole prefix.
    expect(cached).toBe(tokens.length * 4 * 16 * 16);
    expect(uncached / cached).toBeCloseTo((tokens.length + 1) / 2, 5);
  });
});

describe("Merkle delta sync", () => {
  const enc = (s: string) => new TextEncoder().encode(s);
  // Non-repetitive text: in periodic text, shifted chunks can match other chunks by content.
  const words = ["delta", "sync", "chunk", "merkle", "root", "leaf", "hash", "peer", "clock", "vector", "file", "byte"];
  const rnd = mulberry32(2024);
  const text = Array.from({ length: 110 }, () => words[(rnd() * words.length) | 0]).join(" ");

  it("identical files are settled by comparing roots", async () => {
    const plan = await planSync(enc(text), enc(text), "fixed", 16);
    expect(plan.identical).toBe(true);
    expect(plan.missing).toEqual([]);
    expect(plan.bytesHashes).toBe(32);
  });

  it("a one-byte edit transfers one chunk and reconstructs exactly", async () => {
    const edited = text.slice(0, 100) + "X" + text.slice(101);
    const plan = await planSync(enc(edited), enc(text), "fixed", 16);
    expect(plan.identical).toBe(false);
    expect(plan.missing.length).toBe(1);
    expect(new TextDecoder().decode(reconstruct(enc(edited), enc(text), plan))).toBe(edited);
  });

  it("an insertion defeats fixed-size chunks but not content-defined chunks", async () => {
    const inserted = "!" + text;
    const fixed = await planSync(enc(inserted), enc(text), "fixed", 16);
    const cdc = await planSync(enc(inserted), enc(text), "content-defined", 16);
    expect(fixed.missing.length).toBeGreaterThan(fixed.local.length * 0.8);
    expect(cdc.missing.length).toBeLessThanOrEqual(4);
    expect(cdc.missing.length).toBeLessThan(fixed.missing.length / 4);
    expect(new TextDecoder().decode(reconstruct(enc(inserted), enc(text), cdc))).toBe(inserted);
  });

  it("content-defined boundaries respect min and max lengths", () => {
    const data = enc(text);
    const cuts = [0, ...contentDefinedBoundaries(data, 16), data.length];
    for (let i = 1; i < cuts.length; i++) {
      const len = cuts[i] - cuts[i - 1];
      expect(len).toBeLessThanOrEqual(64);
      if (i < cuts.length - 1) expect(len).toBeGreaterThanOrEqual(4);
    }
  });
});
