/**
 * Avellaneda & Stoikov (2008), "High-frequency trading in a limit order book".
 *
 * The dealer quotes around a reservation price that leans against inventory:
 *   r(s, q, t)   = s - q * gamma * sigma^2 * (T - t)
 *   delta_a + delta_b = gamma * sigma^2 * (T - t) + (2 / gamma) * ln(1 + gamma / k)
 * Market orders arrive as Poisson processes with intensity A * exp(-k * delta),
 * so a quote delta away from the mid fills with probability 1 - exp(-lambda * dt).
 *
 * The "symmetric" benchmark quotes the same average spread centred on the mid,
 * exactly as in Section 4 of the paper. The optional toxic regime adds the thing
 * the paper leaves out: informed flow that trends the price and hits the stale side.
 */
import { mulberry32, normalSampler, mean, std } from "./rng";

export type Strategy = "inventory" | "symmetric";

export interface MarketParams {
  s0: number; // initial mid price
  T: number; // horizon
  dt: number; // time step
  sigma: number; // volatility per unit time
  gamma: number; // risk aversion
  k: number; // order-book liquidity (intensity decay)
  A: number; // baseline arrival intensity
  toxic: boolean; // add informed, trending flow
  gate: boolean; // widen quotes when recent fills are one-sided
}

/** Section 4 of the paper: s0=100, T=1, sigma=2, dt=0.005, gamma=0.1, k=1.5, A=140. */
export const PAPER_PARAMS: MarketParams = {
  s0: 100,
  T: 1,
  dt: 0.005,
  sigma: 2,
  gamma: 0.1,
  k: 1.5,
  A: 140,
  toxic: false,
  gate: false,
};

export interface Path {
  t: Float64Array;
  mid: Float64Array;
  bid: Float64Array;
  ask: Float64Array;
  inventory: Float64Array;
  pnl: Float64Array; // mark-to-market: cash + q * mid
  fills: number;
}

export function totalSpread(p: MarketParams, tau: number): number {
  return p.gamma * p.sigma ** 2 * tau + (2 / p.gamma) * Math.log(1 + p.gamma / p.k);
}

export function reservationPrice(p: MarketParams, mid: number, q: number, tau: number): number {
  return mid - q * p.gamma * p.sigma ** 2 * tau;
}

/** Average total spread over the horizon, used to make the symmetric benchmark a fair comparison. */
export function averageSpread(p: MarketParams): number {
  const n = Math.round(p.T / p.dt);
  let s = 0;
  for (let i = 0; i < n; i++) s += totalSpread(p, p.T - i * p.dt);
  return s / n;
}

const GATE_WINDOW = 12; // recent fills inspected by the imbalance gate
const GATE_THRESHOLD = 0.6; // |buys - sells| / fills above this widens quotes
const GATE_WIDEN = 2.0;
const TOXIC_DRIFT = 20; // price drift per unit time while informed flow is active
const INFORMED_RATE = 60; // informed order arrivals per unit time
const INFORMED_HORIZON = 0.06; // how far ahead informed traders see

export function simulate(p: MarketParams, strategy: Strategy, seed: number): Path {
  const n = Math.round(p.T / p.dt);
  const uni = mulberry32(seed);
  const gauss = normalSampler(uni);
  const out: Path = {
    t: new Float64Array(n + 1),
    mid: new Float64Array(n + 1),
    bid: new Float64Array(n + 1),
    ask: new Float64Array(n + 1),
    inventory: new Float64Array(n + 1),
    pnl: new Float64Array(n + 1),
    fills: 0,
  };
  const symSpread = averageSpread(p);
  let s = p.s0;
  let q = 0;
  let cash = 0;
  // Toxic regime: a drift that switches sign at random, with informed traders on its side.
  let drift = 0;
  const recent: number[] = []; // +1 = we sold (ask hit), -1 = we bought (bid hit)

  for (let i = 0; i <= n; i++) {
    const t = i * p.dt;
    const tau = Math.max(p.T - t, 0);

    let half: number;
    let center: number;
    if (strategy === "inventory") {
      center = reservationPrice(p, s, q, tau);
      half = totalSpread(p, tau) / 2;
    } else {
      center = s;
      half = symSpread / 2;
    }
    if (p.gate && recent.length >= 4) {
      let imb = 0;
      for (const f of recent) imb += f;
      if (Math.abs(imb) / recent.length > GATE_THRESHOLD) half *= GATE_WIDEN;
    }
    const bid = center - half;
    const ask = center + half;

    out.t[i] = t;
    out.mid[i] = s;
    out.bid[i] = bid;
    out.ask[i] = ask;
    out.inventory[i] = q;
    out.pnl[i] = cash + q * s;
    if (i === n) break;

    // Order arrivals for this step. Distances are measured from the mid.
    const dA = Math.max(ask - s, 0);
    const dB = Math.max(s - bid, 0);
    const lamA = p.A * Math.exp(-p.k * dA);
    const lamB = p.A * Math.exp(-p.k * dB);
    let hitAsk = uni() < 1 - Math.exp(-lamA * p.dt);
    let hitBid = uni() < 1 - Math.exp(-lamB * p.dt);
    if (p.toxic && drift !== 0) {
      // Informed traders know the coming move. They take our quote only when it sits
      // inside the move they expect, so a wider quote is the only defence.
      const edge = Math.abs(drift) * INFORMED_HORIZON;
      const informed = uni() < 1 - Math.exp(-INFORMED_RATE * p.dt);
      if (informed && drift > 0 && dA < edge) hitAsk = true;
      if (informed && drift < 0 && dB < edge) hitBid = true;
    }
    if (hitAsk) {
      q -= 1;
      cash += ask;
      out.fills++;
      recent.push(1);
    }
    if (hitBid) {
      q += 1;
      cash -= bid;
      out.fills++;
      recent.push(-1);
    }
    while (recent.length > GATE_WINDOW) recent.shift();

    if (p.toxic && uni() < 6 * p.dt) {
      // Regime switch roughly six times per unit of time.
      const r = uni();
      drift = r < 0.35 ? TOXIC_DRIFT : r < 0.7 ? -TOXIC_DRIFT : 0;
    }
    // The paper's mid moves by +/- sigma*sqrt(dt); a Gaussian step has the same variance.
    s += drift * p.dt + p.sigma * Math.sqrt(p.dt) * gauss();
  }
  return out;
}

export interface MonteCarloSummary {
  strategy: Strategy;
  meanPnl: number;
  stdPnl: number;
  meanFinalInventory: number;
  stdFinalInventory: number;
  pnls: Float64Array;
}

/**
 * Run both strategies on the same seeds, so each pair sees the same random draws
 * at the start and differences come from the strategy, not the luck of the draw.
 */
export function monteCarlo(p: MarketParams, paths: number, seed: number): Record<Strategy, MonteCarloSummary> {
  const res = {} as Record<Strategy, MonteCarloSummary>;
  for (const strategy of ["inventory", "symmetric"] as Strategy[]) {
    const pnls = new Float64Array(paths);
    const inv = new Float64Array(paths);
    for (let j = 0; j < paths; j++) {
      const path = simulate(p, strategy, seed + j * 7919);
      pnls[j] = path.pnl[path.pnl.length - 1];
      inv[j] = path.inventory[path.inventory.length - 1];
    }
    res[strategy] = {
      strategy,
      meanPnl: mean(pnls),
      stdPnl: std(pnls),
      meanFinalInventory: mean(inv),
      stdFinalInventory: std(inv),
      pnls,
    };
  }
  return res;
}

/** Table 1 of the paper (gamma = 0.1, 1000 simulations), for side-by-side comparison. */
export const PAPER_TABLE_GAMMA_01 = {
  inventory: { spread: 1.49, profit: 62.94, stdProfit: 5.89, finalQ: 0.1, stdQ: 2.8 },
  symmetric: { spread: 1.49, profit: 67.21, stdProfit: 13.43, finalQ: -0.018, stdQ: 8.66 },
};
