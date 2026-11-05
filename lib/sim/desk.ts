/*
 * The trading-desk game's market. Avellaneda & Stoikov (2008) Section 4 setup:
 * s0 = 100, sigma = 2, k = 1.5, A = 140, T = 1, split into 300 ticks. Market orders
 * arrive with intensity A * exp(-k * delta). Informed episodes trend the price and
 * lift whichever side is stale. Both quoters see the same price path and the same
 * uniform draws (common random numbers), so a comparison measures quoting, not luck.
 */
import { PAPER_PARAMS, reservationPrice, totalSpread } from "./marketMaking";
import { mulberry32, normalSampler } from "./rng";

export const P = PAPER_PARAMS;
export const STEPS = 300;
export const DT = P.T / STEPS;
export const STEP_MS = 150; // 300 steps = 45 seconds
export const RISK_LIMIT = 25;
export const LIQ_COST = 0.25; // per share, to flatten terminal inventory
export const RISK_PENALTY = 0.0015; // charged q^2 * this every tick: the running-penalty form of the A-S objective
const DRIFT = 20;
const INFORMED_RATE = 60;
const INFORMED_HORIZON = 0.06;
export const HISTORY = 140;

export interface Book {
  q: number;
  cash: number;
  fills: number;
  risk: number; // accumulated inventory penalty
}

export interface Tick {
  mid: number;
  bid: number;
  ask: number;
  botBid: number;
  botAsk: number;
  fill: 0 | 1 | -1; // your fill: +1 bought, -1 sold
}

export interface Sim {
  step: number;
  mid: number;
  drift: number;
  me: Book;
  bot: Book;
  half: number;
  skew: number;
  hist: Tick[];
  recent: number[]; // your last fills, +1 buy / -1 sell
  rand: () => number;
  z: () => number;
}

export type Phase = "intro" | "live" | "done";

export interface Hud {
  step: number;
  mid: number;
  me: number;
  bot: number;
  q: number;
  botQ: number;
  fills: number;
  half: number;
  skew: number;
  imbalance: number;
  informed: boolean;
}

export const pnl = (b: Book, mid: number) => b.cash + b.q * mid;
export const score = (b: Book, mid: number) => pnl(b, mid) - b.risk;
export const fmt = (x: number) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(2)}`;

export function newSim(seed: number): Sim {
  const rand = mulberry32(seed);
  return {
    step: 0,
    mid: P.s0,
    drift: 0,
    me: { q: 0, cash: 0, fills: 0, risk: 0 },
    bot: { q: 0, cash: 0, fills: 0, risk: 0 },
    half: 0.75,
    skew: 0,
    hist: [],
    recent: [],
    rand,
    z: normalSampler(rand),
  };
}

export function stepSim(s: Sim) {
  const t = s.step * DT;
  const tau = P.T - t;

  // Your quotes, and the bot's, set before this step's arrivals.
  const bid = s.mid - s.half + s.skew;
  const ask = s.mid + s.half + s.skew;
  const r = reservationPrice(P, s.mid, s.bot.q, tau);
  const sp = totalSpread(P, tau) / 2;
  const botBid = r - sp;
  const botAsk = r + sp;

  // Common random numbers: one draw per event, shared by both quoters.
  const uBid = s.rand();
  const uAsk = s.rand();
  const uInf = s.rand();
  const pFill = (delta: number) => 1 - Math.exp(-P.A * Math.exp(-P.k * Math.max(0, delta)) * DT);
  const informedEdge = Math.abs(s.drift) * INFORMED_HORIZON;
  const pInformed = 1 - Math.exp(-INFORMED_RATE * DT);

  let myFill: 0 | 1 | -1 = 0;
  const trade = (b: Book, bidPx: number, askPx: number, isMe: boolean) => {
    let bought = uBid < pFill(s.mid - bidPx) && b.q < RISK_LIMIT;
    let sold = uAsk < pFill(askPx - s.mid) && b.q > -RISK_LIMIT;
    // Informed flow trades with whoever is stale, in the direction of the trend.
    if (s.drift > 0 && askPx - s.mid < informedEdge && uInf < pInformed && b.q > -RISK_LIMIT) sold = true;
    if (s.drift < 0 && s.mid - bidPx < informedEdge && uInf < pInformed && b.q < RISK_LIMIT) bought = true;
    if (bought) {
      b.q += 1;
      b.cash -= bidPx;
      b.fills++;
    }
    if (sold) {
      b.q -= 1;
      b.cash += askPx;
      b.fills++;
    }
    if (isMe && bought !== sold) myFill = bought ? 1 : -1;
    if (isMe && bought) s.recent.push(1);
    if (isMe && sold) s.recent.push(-1);
  };
  trade(s.me, bid, ask, true);
  trade(s.bot, botBid, botAsk, false);
  if (s.recent.length > 12) s.recent.splice(0, s.recent.length - 12);
  s.me.risk += RISK_PENALTY * s.me.q * s.me.q;
  s.bot.risk += RISK_PENALTY * s.bot.q * s.bot.q;

  // Regime: informed episodes start and stop at random.
  if (s.drift === 0) {
    if (s.rand() < 5 * DT) s.drift = s.rand() < 0.5 ? DRIFT : -DRIFT;
  } else if (s.rand() < 9 * DT) s.drift = 0;

  s.mid += s.drift * DT + P.sigma * Math.sqrt(DT) * s.z();
  s.step++;
  s.hist.push({ mid: s.mid, bid, ask, botBid, botAsk, fill: myFill });
  if (s.hist.length > HISTORY) s.hist.shift();
}

export function hudOf(s: Sim): Hud {
  const imb = s.recent.length ? s.recent.reduce((a, b) => a + b, 0) / s.recent.length : 0;
  return {
    step: s.step,
    mid: s.mid,
    me: score(s.me, s.mid),
    bot: score(s.bot, s.mid),
    q: s.me.q,
    botQ: s.bot.q,
    fills: s.me.fills,
    half: s.half,
    skew: s.skew,
    imbalance: imb,
    informed: s.drift !== 0,
  };
}

export function finalScore(b: Book, mid: number) {
  return score(b, mid) - Math.abs(b.q) * LIQ_COST;
}
