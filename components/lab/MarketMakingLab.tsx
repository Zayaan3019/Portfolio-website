"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { PAPER_PARAMS, PAPER_TABLE_GAMMA_01, monteCarlo, simulate, type MarketParams } from "@/lib/sim/marketMaking";
import { histogram } from "@/lib/sim/bootstrap";
import { Histogram, LineChart } from "./charts";
import { Check, Slider } from "./Slider";
import { useHydrated } from "../state";

const PATHS = 400;
const GAMMAS = [0.01, 0.05, 0.1, 0.25, 0.5, 1];

export default function MarketMakingLab({ showProjectLink = true }: { showProjectLink?: boolean }) {
  const hydrated = useHydrated();
  const [gammaIdx, setGammaIdx] = useState(2);
  const [k, setK] = useState(PAPER_PARAMS.k);
  const [sigma, setSigma] = useState(PAPER_PARAMS.sigma);
  const [toxic, setToxic] = useState(false);
  const [gate, setGate] = useState(false);
  const [seed, setSeed] = useState(1);

  const params: MarketParams = useMemo(
    () => ({ ...PAPER_PARAMS, gamma: GAMMAS[gammaIdx], k, sigma, toxic, gate }),
    [gammaIdx, k, sigma, toxic, gate],
  );
  const deferred = useDeferredValue(params);
  const isPaper = deferred.gamma === 0.1 && deferred.k === 1.5 && deferred.sigma === 2 && !deferred.toxic && !deferred.gate;

  const path = useMemo(() => (hydrated ? simulate(deferred, "inventory", seed) : null), [deferred, seed, hydrated]);
  const sym = useMemo(() => (hydrated ? simulate(deferred, "symmetric", seed) : null), [deferred, seed, hydrated]);
  const mc = useMemo(() => (hydrated ? monteCarlo(deferred, PATHS, 1) : null), [deferred, hydrated]);

  const hist = useMemo(() => {
    if (!mc) return null;
    let lo = Infinity;
    let hi = -Infinity;
    for (const s of [mc.inventory.pnls, mc.symmetric.pnls])
      for (const v of s) {
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
      }
    return {
      inv: histogram(mc.inventory.pnls, 40, lo, hi),
      sym: histogram(mc.symmetric.pnls, 40, lo, hi),
      lo,
      hi,
    };
  }, [mc]);

  return (
    <figure className="figure" aria-labelledby="mm-title">
      <h3 id="mm-title">Market making against informed flow</h3>
      <p className="figure-sub">
        Avellaneda–Stoikov quoting versus a symmetric quoter with the same average spread. Default parameters are the
        ones in Section 4 of the 2008 paper.
      </p>

      <div className="controls">
        <Slider label="Risk aversion γ" value={gammaIdx} min={0} max={GAMMAS.length - 1} step={1} onChange={setGammaIdx} format={(i) => String(GAMMAS[i])} />
        <Slider label="Book depth k" value={k} min={0.5} max={3} step={0.1} onChange={setK} format={(v) => v.toFixed(1)} />
        <Slider label="Volatility σ" value={sigma} min={1} max={4} step={0.1} onChange={setSigma} format={(v) => v.toFixed(1)} />
        <div className="control" style={{ alignContent: "end", gap: "0.45rem" }}>
          <Check label="Informed, trending flow" checked={toxic} onChange={setToxic} />
          <Check label="Flow-imbalance gate" checked={gate} onChange={setGate} />
        </div>
      </div>

      <div className="button-row">
        <button type="button" className="button secondary" onClick={() => setSeed((s) => s + 1)}>
          Draw another path
        </button>
        <span className="chunk-caption">Path seed {seed}. The table below always uses the same {PATHS} seeds.</span>
      </div>

      {path && sym ? (
        <>
          <div className="chart-legend" style={{ marginTop: "1rem" }}>
            <span>
              <i style={{ background: "var(--chart-c)" }} />
              Mid price
            </span>
            <span>
              <i style={{ background: "var(--chart-a)" }} />
              Avellaneda–Stoikov bid and ask
            </span>
          </div>
          <LineChart
            label="One simulated path: mid price with the inventory-aware bid and ask quotes around it."
            series={[
              { values: path.mid, color: "var(--chart-c)", width: 1.75 },
              { values: path.ask, color: "var(--chart-a)", width: 1 },
              { values: path.bid, color: "var(--chart-a)", width: 1 },
            ]}
            height={200}
            xMax={deferred.T}
          />
          <div className="chart-legend">
            <span>
              <i style={{ background: "var(--chart-a)" }} />
              Inventory, Avellaneda–Stoikov
            </span>
            <span>
              <i style={{ background: "var(--chart-b)" }} />
              Inventory, symmetric
            </span>
          </div>
          <LineChart
            label="Inventory over the same path: the inventory-aware quoter stays near zero while the symmetric one drifts."
            series={[
              { values: path.inventory, color: "var(--chart-a)" },
              { values: sym.inventory, color: "var(--chart-b)" },
            ]}
            height={150}
            xMax={deferred.T}
          />
        </>
      ) : (
        <p className="chunk-caption" style={{ marginTop: "1rem" }}>
          Running the simulation…
        </p>
      )}

      {mc && hist && (
        <>
          <div className="table-scroll">
            <table className="readout">
              <caption className="visually-hidden">Monte Carlo summary over {PATHS} paths</caption>
              <thead>
                <tr>
                  <th scope="col">Strategy, {PATHS} paths</th>
                  <th scope="col">Mean P&amp;L</th>
                  <th scope="col">Std P&amp;L</th>
                  <th scope="col">Std final inventory</th>
                  {isPaper && <th scope="col">Paper: mean / std P&amp;L</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Avellaneda–Stoikov</th>
                  <td>{mc.inventory.meanPnl.toFixed(2)}</td>
                  <td>{mc.inventory.stdPnl.toFixed(2)}</td>
                  <td>{mc.inventory.stdFinalInventory.toFixed(2)}</td>
                  {isPaper && (
                    <td>
                      {PAPER_TABLE_GAMMA_01.inventory.profit} / {PAPER_TABLE_GAMMA_01.inventory.stdProfit}
                    </td>
                  )}
                </tr>
                <tr>
                  <th scope="row">Symmetric</th>
                  <td>{mc.symmetric.meanPnl.toFixed(2)}</td>
                  <td>{mc.symmetric.stdPnl.toFixed(2)}</td>
                  <td>{mc.symmetric.stdFinalInventory.toFixed(2)}</td>
                  {isPaper && (
                    <td>
                      {PAPER_TABLE_GAMMA_01.symmetric.profit} / {PAPER_TABLE_GAMMA_01.symmetric.stdProfit}
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="chart-legend" style={{ marginTop: "1.25rem" }}>
            <span>
              <i style={{ background: "var(--chart-a)" }} />
              Final P&amp;L, Avellaneda–Stoikov
            </span>
            <span>
              <i style={{ background: "var(--chart-b)" }} />
              Final P&amp;L, symmetric
            </span>
          </div>
          <Histogram
            label="Distribution of final profit across simulated paths for both strategies."
            bins={hist.inv.counts}
            overlay={{ bins: hist.sym.counts, color: "var(--chart-b)" }}
            min={hist.lo}
            max={hist.hi}
            color="var(--chart-a)"
            height={150}
          />
        </>
      )}

      <figcaption>
        <p>
          The reservation price r = s − qγσ²(T − t) leans against inventory, so the quoter sells more readily when long.
          It gives up a little mean profit for a much narrower distribution, which is the trade the paper reports. Turn on
          informed flow: the symmetric quoter is picked off on every trend, while inventory skew absorbs most of the damage.
          The imbalance gate, a simple stand-in for VPIN, helps the quoter that has no inventory control.
        </p>
        {showProjectLink && (
          <p>
            The production version of this, with a neural drift signal and a separate risk service, is the{" "}
            <Link href="/work/amme">Adaptive Market Making Engine</Link>.
          </p>
        )}
      </figcaption>
    </figure>
  );
}
