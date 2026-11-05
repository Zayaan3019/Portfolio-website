/**
 * Single-head causal self-attention in float32, computed two ways:
 *
 *   full    — one pass over the whole sequence, as during training. Dot products use
 *             pairwise (tree) summation, the way a batched GEMM kernel reorders sums.
 *   cached  — token-by-token decoding with a KV cache, as during generation. Each step
 *             projects only the new token and attends over the cached keys and values,
 *             summing sequentially.
 *
 * Mathematically the outputs are identical. In floating point they differ by a few
 * ulps because the summation order differs, which is why NanoLM's equivalence test
 * checks a tolerance rather than exact equality. A real bug (a wrong position index,
 * a missing causal mask) produces differences many orders of magnitude larger, and
 * the generated text can still look plausible.
 */
import { mulberry32, normalSampler } from "./rng";

export type InjectedBug = "none" | "position-offset" | "no-causal-mask";

export interface AttentionModel {
  d: number;
  wq: Float32Array;
  wk: Float32Array;
  wv: Float32Array;
  wo: Float32Array;
  embed: Float32Array; // vocab x d
  vocab: number;
}

export function makeModel(d: number, vocab: number, seed: number): AttentionModel {
  const g = normalSampler(mulberry32(seed));
  const mat = (rows: number, cols: number, scale: number) => {
    const m = new Float32Array(rows * cols);
    for (let i = 0; i < m.length; i++) m[i] = g() * scale;
    return m;
  };
  const s = 1 / Math.sqrt(d);
  return { d, vocab, wq: mat(d, d, s), wk: mat(d, d, s), wv: mat(d, d, s), wo: mat(d, d, s), embed: mat(vocab, d, 1) };
}

/** Counters for multiply-accumulate operations, so the cost comparison is measured, not asserted. */
export interface OpCount {
  projectionMacs: number;
  attentionMacs: number;
}

function sinusoidal(pos: number, d: number, out: Float32Array) {
  for (let i = 0; i < d; i++) {
    const freq = Math.pow(10000, -(2 * Math.floor(i / 2)) / d);
    out[i] = i % 2 === 0 ? Math.sin(pos * freq) : Math.cos(pos * freq);
  }
}

function inputAt(m: AttentionModel, token: number, pos: number): Float32Array {
  const x = new Float32Array(m.d);
  const pe = new Float32Array(m.d);
  sinusoidal(pos, m.d, pe);
  for (let i = 0; i < m.d; i++) x[i] = m.embed[token * m.d + i] + pe[i];
  return x;
}

/** Sequential float32 dot product. */
function dotSeq(a: Float32Array, ao: number, b: Float32Array, bo: number, n: number): number {
  let s = Math.fround(0);
  for (let i = 0; i < n; i++) s = Math.fround(s + Math.fround(a[ao + i] * b[bo + i]));
  return s;
}

/** Pairwise (tree) float32 dot product, a different but equally valid summation order. */
function dotTree(a: Float32Array, ao: number, b: Float32Array, bo: number, n: number): number {
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = Math.fround(a[ao + i] * b[bo + i]);
  let len = n;
  while (len > 1) {
    const half = len >> 1;
    for (let i = 0; i < half; i++) buf[i] = Math.fround(buf[2 * i] + buf[2 * i + 1]);
    if (len % 2 === 1) buf[half] = buf[len - 1];
    len = half + (len % 2);
  }
  return n ? buf[0] : 0;
}

type Dot = typeof dotSeq;

/** y = W x, with W stored row-major (rows = output dim). */
function matvec(w: Float32Array, x: Float32Array, d: number, dot: Dot, ops: OpCount): Float32Array {
  const y = new Float32Array(d);
  for (let r = 0; r < d; r++) y[r] = dot(w, r * d, x, 0, d);
  ops.projectionMacs += d * d;
  return y;
}

function attendRow(
  q: Float32Array,
  keys: Float32Array[],
  values: Float32Array[],
  d: number,
  dot: Dot,
  ops: OpCount,
): Float32Array {
  const scale = Math.fround(1 / Math.sqrt(d));
  const scores = new Float32Array(keys.length);
  let max = -Infinity;
  for (let j = 0; j < keys.length; j++) {
    scores[j] = Math.fround(dot(q, 0, keys[j], 0, d) * scale);
    if (scores[j] > max) max = scores[j];
  }
  let z = Math.fround(0);
  for (let j = 0; j < scores.length; j++) {
    scores[j] = Math.fround(Math.exp(scores[j] - max));
    z = Math.fround(z + scores[j]);
  }
  const out = new Float32Array(d);
  for (let j = 0; j < scores.length; j++) {
    const w = Math.fround(scores[j] / z);
    for (let i = 0; i < d; i++) out[i] = Math.fround(out[i] + Math.fround(w * values[j][i]));
  }
  ops.attentionMacs += 2 * keys.length * d;
  return out;
}

export interface RunResult {
  outputs: Float32Array[]; // one d-vector per position
  ops: OpCount;
}

/** Training-style forward over the full sequence. */
export function forwardFull(m: AttentionModel, tokens: number[], bug: InjectedBug = "none"): RunResult {
  const ops: OpCount = { projectionMacs: 0, attentionMacs: 0 };
  const xs = tokens.map((t, p) => inputAt(m, t, p));
  const ks = xs.map((x) => matvec(m.wk, x, m.d, dotTree, ops));
  const vs = xs.map((x) => matvec(m.wv, x, m.d, dotTree, ops));
  const outputs = xs.map((x, t) => {
    const q = matvec(m.wq, x, m.d, dotTree, ops);
    const span = bug === "no-causal-mask" ? tokens.length : t + 1;
    const a = attendRow(q, ks.slice(0, span), vs.slice(0, span), m.d, dotTree, ops);
    return matvec(m.wo, a, m.d, dotTree, ops);
  });
  return { outputs, ops };
}

/** Generation-style decoding with a KV cache: project only the newest token at each step. */
export function decodeCached(m: AttentionModel, tokens: number[], bug: InjectedBug = "none"): RunResult {
  const ops: OpCount = { projectionMacs: 0, attentionMacs: 0 };
  const kCache: Float32Array[] = [];
  const vCache: Float32Array[] = [];
  const outputs: Float32Array[] = [];
  tokens.forEach((tok, t) => {
    const pos = bug === "position-offset" && t > 0 ? t + 1 : t;
    const x = inputAt(m, tok, pos);
    kCache.push(matvec(m.wk, x, m.d, dotSeq, ops));
    vCache.push(matvec(m.wv, x, m.d, dotSeq, ops));
    const q = matvec(m.wq, x, m.d, dotSeq, ops);
    const a = attendRow(q, kCache, vCache, m.d, dotSeq, ops);
    outputs.push(matvec(m.wo, a, m.d, dotSeq, ops));
  });
  return { outputs, ops };
}

/**
 * Cost of generating every prefix without a cache: at step t the whole prefix is
 * re-projected and re-attended. This is what the cache exists to avoid.
 */
export function uncachedGenerationOps(m: AttentionModel, tokens: number[]): OpCount {
  const total: OpCount = { projectionMacs: 0, attentionMacs: 0 };
  for (let t = 1; t <= tokens.length; t++) {
    const r = forwardFull(m, tokens.slice(0, t));
    total.projectionMacs += r.ops.projectionMacs;
    total.attentionMacs += r.ops.attentionMacs;
  }
  return total;
}

export function maxAbsDiff(a: Float32Array[], b: Float32Array[]): number {
  let m = 0;
  for (let t = 0; t < Math.min(a.length, b.length); t++)
    for (let i = 0; i < a[t].length; i++) m = Math.max(m, Math.abs(a[t][i] - b[t][i]));
  return m;
}

export function perPositionDiff(a: Float32Array[], b: Float32Array[]): number[] {
  return a.map((row, t) => {
    let m = 0;
    for (let i = 0; i < row.length; i++) m = Math.max(m, Math.abs(row[i] - b[t][i]));
    return m;
  });
}

/** Deterministic toy "tokenizer": bytes of the prompt modulo the vocabulary. */
export function tokenize(text: string, vocab: number): number[] {
  return Array.from(new TextEncoder().encode(text)).map((b) => b % vocab);
}
