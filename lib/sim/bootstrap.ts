/**
 * Paired bootstrap regression gate, the statistical core of AI-Evals.
 *
 * Every eval case is scored by both the baseline and the candidate. Cases differ far
 * more in difficulty than prompts differ in quality, so the test resamples *cases*
 * and keeps each pair together: the between-case variance cancels in the difference.
 * An unpaired bootstrap on the same data is computed alongside to show what that buys.
 */
import { mulberry32, normalSampler, quantileSorted, mean } from "./rng";

export type ScoreKind = "continuous" | "pass-fail";

export interface EvalSetParams {
  n: number; // number of eval cases
  trueDelta: number; // candidate - baseline, in logit units
  caseSpread: number; // std of per-case difficulty
  noise: number; // per-run noise
  kind: ScoreKind;
  seed: number;
}

export interface EvalSet {
  baseline: Float64Array;
  candidate: Float64Array;
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

export function generateEvalSet(p: EvalSetParams): EvalSet {
  const uni = mulberry32(p.seed);
  const g = normalSampler(uni);
  const baseline = new Float64Array(p.n);
  const candidate = new Float64Array(p.n);
  for (let i = 0; i < p.n; i++) {
    const difficulty = p.caseSpread * g();
    const lb = 0.8 + difficulty + p.noise * g();
    const lc = 0.8 + p.trueDelta + difficulty + p.noise * g();
    if (p.kind === "continuous") {
      baseline[i] = sigmoid(lb);
      candidate[i] = sigmoid(lc);
    } else {
      baseline[i] = uni() < sigmoid(lb) ? 1 : 0;
      candidate[i] = uni() < sigmoid(lc) ? 1 : 0;
    }
  }
  return { baseline, candidate };
}

export type Verdict = "regression" | "improvement" | "no-detectable-change" | "insufficient-data";

export interface GateResult {
  observedDelta: number;
  paired: { lo: number; hi: number; deltas: Float64Array };
  unpaired: { lo: number; hi: number };
  verdict: Verdict;
  resamples: number;
}

/** Minimum cases before the gate will give a verdict at all. */
export const MIN_CASES = 20;

export function pairedBootstrap(
  set: EvalSet,
  resamples: number,
  seed: number,
  alpha = 0.05,
): GateResult {
  const n = set.baseline.length;
  const diff = new Float64Array(n);
  for (let i = 0; i < n; i++) diff[i] = set.candidate[i] - set.baseline[i];
  const observedDelta = mean(diff);

  const uni = mulberry32(seed);
  const deltas = new Float64Array(resamples);
  for (let b = 0; b < resamples; b++) {
    let s = 0;
    for (let i = 0; i < n; i++) s += diff[(uni() * n) | 0];
    deltas[b] = s / n;
  }
  const sorted = Float64Array.from(deltas).sort();

  // Unpaired: resample each arm independently, which keeps case difficulty in the noise.
  const unpairedDeltas = new Float64Array(resamples);
  for (let b = 0; b < resamples; b++) {
    let sb = 0;
    let sc = 0;
    for (let i = 0; i < n; i++) {
      sb += set.baseline[(uni() * n) | 0];
      sc += set.candidate[(uni() * n) | 0];
    }
    unpairedDeltas[b] = (sc - sb) / n;
  }
  unpairedDeltas.sort();

  const lo = quantileSorted(sorted, alpha / 2);
  const hi = quantileSorted(sorted, 1 - alpha / 2);
  let verdict: Verdict;
  if (n < MIN_CASES) verdict = "insufficient-data";
  else if (hi < 0) verdict = "regression";
  else if (lo > 0) verdict = "improvement";
  else verdict = "no-detectable-change";

  return {
    observedDelta,
    paired: { lo, hi, deltas },
    unpaired: {
      lo: quantileSorted(unpairedDeltas, alpha / 2),
      hi: quantileSorted(unpairedDeltas, 1 - alpha / 2),
    },
    verdict,
    resamples,
  };
}

/** Histogram helper shared by the lab charts. */
export function histogram(values: ArrayLike<number>, bins: number, lo?: number, hi?: number) {
  let min = lo ?? Infinity;
  let max = hi ?? -Infinity;
  if (lo === undefined || hi === undefined) {
    for (let i = 0; i < values.length; i++) {
      if (lo === undefined) min = Math.min(min, values[i]);
      if (hi === undefined) max = Math.max(max, values[i]);
    }
  }
  if (max === min) max = min + 1e-9;
  const counts = new Array<number>(bins).fill(0);
  const w = (max - min) / bins;
  for (let i = 0; i < values.length; i++) {
    const k = Math.min(bins - 1, Math.max(0, Math.floor((values[i] - min) / w)));
    counts[k]++;
  }
  return { counts, min, max, width: w };
}
