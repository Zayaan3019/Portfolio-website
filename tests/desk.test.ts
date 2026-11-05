import { describe, expect, it } from "vitest";
import { STEPS, finalScore, newSim, stepSim } from "@/lib/sim/desk";
import { averageSpread, PAPER_PARAMS } from "@/lib/sim/marketMaking";

/** Play a full round with fixed quotes, standing in for a player who never adjusts. */
function playStatic(seed: number, half: number, skew = 0) {
  const s = newSim(seed);
  s.half = half;
  s.skew = skew;
  for (let i = 0; i < STEPS; i++) stepSim(s);
  return { me: finalScore(s.me, s.mid), bot: finalScore(s.bot, s.mid), meQ: s.me.q, botQ: s.bot.q };
}

describe("trading desk", () => {
  it("is deterministic for a seed", () => {
    expect(playStatic(42, 0.75)).toEqual(playStatic(42, 0.75));
  });

  it("rewards inventory control: Avellaneda–Stoikov beats a lazy symmetric quoter on average", () => {
    const half = averageSpread(PAPER_PARAMS) / 2; // same average spread as the model, as in the paper
    let lead = 0;
    let wins = 0;
    const N = 200;
    for (let seed = 1; seed <= N; seed++) {
      const r = playStatic(seed, half);
      lead += r.bot - r.me;
      if (r.bot > r.me) wins++;
    }
    expect(lead / N).toBeGreaterThan(0);
    expect(wins / N).toBeGreaterThan(0.5);
  });

  it("is beatable: leaning against inventory is what wins", () => {
    // A player who skews quotes against inventory, the core idea, should do at least as well as static quoting.
    let skewed = 0;
    let flat = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const s = newSim(seed);
      const f = newSim(seed);
      s.half = f.half = 0.8;
      for (let i = 0; i < STEPS; i++) {
        s.skew = -0.12 * s.me.q;
        stepSim(s);
        stepSim(f);
      }
      skewed += finalScore(s.me, s.mid);
      flat += finalScore(f.me, f.mid);
    }
    expect(skewed).toBeGreaterThan(flat);
  });
});
