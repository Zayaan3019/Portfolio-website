"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HISTORY,
  LIQ_COST,
  RISK_LIMIT,
  RISK_PENALTY,
  STEPS,
  STEP_MS,
  finalScore,
  fmt,
  hudOf,
  newSim,
  stepSim,
  type Hud,
  type Phase,
  type Sim,
  type Tick,
} from "@/lib/sim/desk";

/*
 * A 45-second market-making round. You quote a bid and an ask around a mid price
 * that follows the Avellaneda–Stoikov (2008) setup: s0 = 100, sigma = 2, k = 1.5,
 * A = 140, T = 1. Market orders arrive with intensity A * exp(-k * delta), so a
 * tighter quote fills more often. Every so often informed traders arrive: the
 * price trends and they lift whichever side is stale.
 *
 * The opponent is the Avellaneda–Stoikov quoter with gamma = 0.1. It sees the
 * same price path and the same random arrivals (common random numbers), so the
 * comparison measures quoting, not luck.
 */

export default function DeskGame({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [hud, setHud] = useState<Hud | null>(null);
  const [seed, setSeed] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [result, setResult] = useState<{ me: number; bot: number; q: number; botQ: number; seed: number } | null>(null);

  useEffect(() => {
    try {
      const b = localStorage.getItem("desk-best");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a browser-only store once on mount
      if (b !== null) setBest(Number(b));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const start = useCallback(() => {
    const sd = Math.floor(Math.random() * 1e6);
    simRef.current = newSim(sd);
    setSeed(sd);
    setResult(null);
    setHud(hudOf(simRef.current));
    setPhase("live");
  }, []);

  const nudge = useCallback((dh: number, ds: number) => {
    const s = simRef.current;
    if (!s) return;
    s.half = Math.min(3, Math.max(0.05, +(s.half + dh).toFixed(2)));
    s.skew = Math.min(3, Math.max(-3, +(s.skew + ds).toFixed(2)));
    setHud(hudOf(s));
  }, []);

  const set = useCallback((half?: number, skew?: number) => {
    const s = simRef.current;
    if (!s) return;
    if (half !== undefined) s.half = half;
    if (skew !== undefined) s.skew = skew;
    setHud(hudOf(s));
  }, []);

  // Keyboard: arrows move the quotes, space starts or restarts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input[type=range]")) return;
      if (phase !== "live") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          start();
        }
        return;
      }
      const map: Record<string, [number, number]> = {
        ArrowUp: [0.05, 0],
        ArrowDown: [-0.05, 0],
        ArrowLeft: [0, -0.1],
        ArrowRight: [0, 0.1],
      };
      const m = map[e.key];
      if (m) {
        e.preventDefault();
        nudge(m[0], m[1]);
      }
      if (e.key === "0") set(undefined, 0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, start, nudge, set]);

  // Simulation clock.
  useEffect(() => {
    if (phase !== "live") return;
    const id = window.setInterval(() => {
      const s = simRef.current;
      if (!s) return;
      stepSim(s);
      setHud(hudOf(s));
      if (s.step >= STEPS) {
        window.clearInterval(id);
        const me = finalScore(s.me, s.mid);
        const bot = finalScore(s.bot, s.mid);
        setResult({ me, bot, q: s.me.q, botQ: s.bot.q, seed });
        setBest((b) => {
          const nb = b === null ? me : Math.max(b, me);
          try {
            localStorage.setItem("desk-best", String(nb));
          } catch {
            /* ignore */
          }
          return nb;
        });
        setPhase("done");
      }
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [phase, seed]);

  // Chart.
  useEffect(() => {
    const c = canvasRef.current;
    const s = simRef.current;
    if (!c || !s) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = c.clientWidth;
    const H = c.clientHeight;
    if (c.width !== Math.floor(W * dpr)) {
      c.width = Math.floor(W * dpr);
      c.height = Math.floor(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const cs = getComputedStyle(c);
    const col = (v: string, f: string) => cs.getPropertyValue(v).trim() || f;
    const ink3 = col("--ink-3", "#74838f");
    const rule = col("--rule", "#1e2a35");
    const cA = col("--chart-a", "#6fd3e8");
    const cB = col("--accent", "#ff8f3c");
    const pass = col("--pass", "#55c993");
    const fail = col("--fail", "#f08a7b");
    const h = s.hist;
    if (h.length < 2) {
      ctx.fillStyle = ink3;
      ctx.font = "12px var(--font-mono), monospace";
      ctx.fillText("waiting for the first prints…", 16, H / 2);
      return;
    }
    let lo = Infinity;
    let hi = -Infinity;
    for (const t of h) {
      lo = Math.min(lo, t.bid, t.botBid, t.mid);
      hi = Math.max(hi, t.ask, t.botAsk, t.mid);
    }
    const pad = (hi - lo) * 0.12 + 0.2;
    lo -= pad;
    hi += pad;
    const L = 46;
    const R = 10;
    const x = (i: number) => L + (i / (HISTORY - 1)) * (W - L - R);
    const y = (v: number) => 10 + (1 - (v - lo) / (hi - lo)) * (H - 28);

    ctx.strokeStyle = rule;
    ctx.lineWidth = 1;
    ctx.fillStyle = ink3;
    ctx.font = "11px ui-monospace, monospace";
    for (let g = 0; g <= 4; g++) {
      const v = lo + ((hi - lo) * g) / 4;
      ctx.beginPath();
      ctx.moveTo(L, y(v));
      ctx.lineTo(W - R, y(v));
      ctx.stroke();
      ctx.fillText(v.toFixed(2), 4, y(v) + 4);
    }
    const line = (get: (t: Tick) => number, color: string, width: number, dash: number[] = []) => {
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      h.forEach((t, i) => (i === 0 ? ctx.moveTo(x(i), y(get(t))) : ctx.lineTo(x(i), y(get(t)))));
      ctx.stroke();
      ctx.setLineDash([]);
    };
    ctx.globalAlpha = 0.45;
    line((t) => t.botBid, ink3, 1, [3, 4]);
    line((t) => t.botAsk, ink3, 1, [3, 4]);
    ctx.globalAlpha = 1;
    line((t) => t.bid, cA, 1.6);
    line((t) => t.ask, cB, 1.6);
    line((t) => t.mid, col("--ink", "#e8edf0"), 1.8);
    h.forEach((t, i) => {
      if (!t.fill) return;
      const yy = t.fill === 1 ? y(t.bid) : y(t.ask);
      ctx.fillStyle = t.fill === 1 ? pass : fail;
      ctx.beginPath();
      if (t.fill === 1) {
        ctx.moveTo(x(i), yy - 6);
        ctx.lineTo(x(i) - 5, yy + 3);
        ctx.lineTo(x(i) + 5, yy + 3);
      } else {
        ctx.moveTo(x(i), yy + 6);
        ctx.lineTo(x(i) - 5, yy - 3);
        ctx.lineTo(x(i) + 5, yy - 3);
      }
      ctx.fill();
    });
  }, [hud]);

  const remaining = hud ? Math.max(0, ((STEPS - hud.step) * STEP_MS) / 1000) : 45;
  const lead = hud ? hud.me - hud.bot : 0;

  return (
    <div className="desk">
      <header className="desk-head">
        <div>
          <p className="desk-kicker mono">Trading desk · seed {phase === "intro" ? "—" : seed}</p>
          <h2 id="desk-title">Make a market. Beat Avellaneda–Stoikov.</h2>
        </div>
        <button type="button" className="tool-btn icon-only" onClick={onClose} aria-label="Close the trading desk">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {phase === "intro" && (
        <div className="desk-intro">
          <ol>
            <li>
              You quote a <b className="c-bid">bid</b> and an <b className="c-ask">ask</b> around the mid. Tighter quotes
              fill more often: intensity is <span className="mono">140·e^(−1.5δ)</span>.
            </li>
            <li>
              <b>↑ ↓</b> widen or narrow the spread. <b>← →</b> skew both quotes. <b>0</b> recentres.
            </li>
            <li>
              Watch for informed flow: the price starts trending and one side keeps getting hit. Lean away or widen.
            </li>
            <li>
              Inventory is risk: every tick you hold <span className="mono">q</span> shares costs{" "}
              <span className="mono">{RISK_PENALTY}·q²</span>. At the close, anything left is flattened at{" "}
              {LIQ_COST.toFixed(2)} per share. Hard limit ±{RISK_LIMIT}.
            </li>
          </ol>
          <p className="desk-note">
            Your opponent is the closed-form Avellaneda–Stoikov quoter (γ = 0.1). It sees the same prices and the same order
            arrivals as you, so luck cancels.
          </p>
          <div className="desk-actions">
            <button type="button" className="btn btn-primary" onClick={start} autoFocus>
              Start trading <kbd>Space</kbd>
            </button>
            {best !== null && <span className="mono desk-best">your best {fmt(best)}</span>}
          </div>
        </div>
      )}

      {phase !== "intro" && hud && (
        <div className="desk-live">
          <div className="desk-stats">
            <div>
              <span>You, risk-adjusted</span>
              <strong className={hud.me >= 0 ? "pos" : "neg"}>{fmt(hud.me)}</strong>
            </div>
            <div>
              <span>Avellaneda–Stoikov</span>
              <strong>{fmt(hud.bot)}</strong>
            </div>
            <div>
              <span>Lead</span>
              <strong className={lead >= 0 ? "pos" : "neg"}>{fmt(lead)}</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{remaining.toFixed(1)}s</strong>
            </div>
          </div>
          <div className="desk-timebar" aria-hidden="true">
            <i style={{ transform: `scaleX(${hud.step / STEPS})` }} />
          </div>
          <canvas ref={canvasRef} className="desk-chart" aria-label="Mid price with your bid and ask, the bot's quotes dashed, and your fills marked." role="img" />
          <div className="desk-legend mono">
            <span><i className="lg-mid" />mid</span>
            <span><i className="lg-bid" />your bid</span>
            <span><i className="lg-ask" />your ask</span>
            <span><i className="lg-bot" />A–S quotes</span>
            <span>▲ bought ▼ sold</span>
          </div>

          <div className="desk-controls">
            <div className="gauge">
              <span className="gauge-label">Inventory <b>{hud.q > 0 ? `+${hud.q}` : hud.q}</b></span>
              <div className="gauge-bar">
                <i className="gauge-zero" />
                <i
                  className={Math.abs(hud.q) > RISK_LIMIT * 0.7 ? "gauge-fill hot" : "gauge-fill"}
                  style={{
                    left: hud.q >= 0 ? "50%" : `${50 + (hud.q / RISK_LIMIT) * 50}%`,
                    width: `${(Math.abs(hud.q) / RISK_LIMIT) * 50}%`,
                  }}
                />
              </div>
              <span className="gauge-sub mono">A–S holds {hud.botQ > 0 ? `+${hud.botQ}` : hud.botQ}</span>
            </div>
            <div className="gauge">
              <span className="gauge-label">Recent fills <b>{hud.imbalance > 0.5 ? "mostly buys" : hud.imbalance < -0.5 ? "mostly sells" : "balanced"}</b></span>
              <div className="gauge-bar">
                <i className="gauge-zero" />
                <i
                  className={Math.abs(hud.imbalance) > 0.5 ? "gauge-fill hot" : "gauge-fill"}
                  style={{
                    left: hud.imbalance >= 0 ? "50%" : `${50 + hud.imbalance * 50}%`,
                    width: `${Math.abs(hud.imbalance) * 50}%`,
                  }}
                />
              </div>
              <span className="gauge-sub mono">{hud.fills} fills</span>
            </div>
            <label className="desk-slider">
              <span>Half-spread <output className="mono">{hud.half.toFixed(2)}</output></span>
              <input type="range" min={0.05} max={3} step={0.05} value={hud.half} disabled={phase !== "live"} onChange={(e) => set(Number(e.target.value))} />
            </label>
            <label className="desk-slider">
              <span>Skew <output className="mono">{hud.skew > 0 ? `+${hud.skew.toFixed(2)}` : hud.skew.toFixed(2)}</output></span>
              <input type="range" min={-3} max={3} step={0.1} value={hud.skew} disabled={phase !== "live"} onChange={(e) => set(undefined, Number(e.target.value))} />
            </label>
          </div>
        </div>
      )}

      {phase === "done" && result && (
        <div className="desk-result" role="status">
          <p className="desk-verdict">
            {result.me > result.bot ? (
              <>
                You beat Avellaneda–Stoikov by <b className="pos">{(result.me - result.bot).toFixed(2)}</b>.
              </>
            ) : (
              <>
                Avellaneda–Stoikov won by <b className="neg">{(result.bot - result.me).toFixed(2)}</b>.
              </>
            )}
          </p>
          <p>
            Risk-adjusted, after flattening: you {fmt(result.me)} ({result.q > 0 ? `+${result.q}` : result.q} shares), the model{" "}
            {fmt(result.bot)} ({result.botQ > 0 ? `+${result.botQ}` : result.botQ}). It never chases fills: its reservation
            price leans against inventory by qγσ²(T−t), and its spread narrows as the close approaches.
          </p>
          <div className="desk-actions">
            <button type="button" className="btn btn-primary" onClick={start} autoFocus>
              Play again <kbd>Space</kbd>
            </button>
            <Link className="btn btn-ghost" href="/work/amme" onClick={onClose}>
              The production version: AMME
            </Link>
            {best !== null && <span className="mono desk-best">your best {fmt(best)}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
