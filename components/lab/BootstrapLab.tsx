"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { MIN_CASES, generateEvalSet, histogram, pairedBootstrap, type ScoreKind, type Verdict } from "@/lib/sim/bootstrap";
import { Histogram, Intervals } from "./charts";
import { Select, Slider } from "./Slider";
import { useHydrated } from "../state";

const VERDICT: Record<Verdict, { text: string; tone: "pass" | "fail" | "hold" }> = {
  regression: { text: "Blocked: regression", tone: "fail" },
  improvement: { text: "Passed: improvement", tone: "pass" },
  "no-detectable-change": { text: "Passed: no detectable change", tone: "hold" },
  "insufficient-data": { text: `Refused: fewer than ${MIN_CASES} cases`, tone: "hold" },
};

export default function BootstrapLab({ showProjectLink = true }: { showProjectLink?: boolean }) {
  const hydrated = useHydrated();
  const [n, setN] = useState(120);
  const [delta, setDelta] = useState(-0.12);
  const [spread, setSpread] = useState(1.5);
  const [kind, setKind] = useState<ScoreKind>("continuous");
  const [resamples, setResamples] = useState<"2000" | "10000">("10000");
  const [seed, setSeed] = useState(3);

  const inputs = useMemo(() => ({ n, delta, spread, kind, resamples, seed }), [n, delta, spread, kind, resamples, seed]);
  const deferred = useDeferredValue(inputs);

  const out = useMemo(() => {
    if (!hydrated) return null;
    const set = generateEvalSet({
      n: deferred.n,
      trueDelta: deferred.delta,
      caseSpread: deferred.spread,
      noise: 0.3,
      kind: deferred.kind,
      seed: deferred.seed,
    });
    const r = pairedBootstrap(set, Number(deferred.resamples), deferred.seed + 1000);
    const lo = Math.min(r.unpaired.lo, r.paired.lo, 0);
    const hi = Math.max(r.unpaired.hi, r.paired.hi, 0);
    const pad = (hi - lo) * 0.05;
    return { r, hist: histogram(r.paired.deltas, 60, lo - pad, hi + pad) };
  }, [hydrated, deferred]);

  const v = out ? VERDICT[out.r.verdict] : null;

  return (
    <figure className="figure" aria-labelledby="bs-title">
      <h3 id="bs-title">Did the prompt change make the agent worse?</h3>
      <p className="figure-sub">
        A simulated eval set scored by a baseline and a candidate. The gate resamples cases with replacement, keeping
        each case&apos;s two scores together, and blocks the change only if the interval excludes zero.
      </p>

      <div className="controls">
        <Slider label="Eval cases" value={n} min={10} max={500} step={10} onChange={setN} />
        <Slider
          label="True effect (logits)"
          value={delta}
          min={-0.5}
          max={0.5}
          step={0.02}
          onChange={setDelta}
          format={(x) => (x > 0 ? `+${x.toFixed(2)}` : x.toFixed(2))}
        />
        <Slider label="Spread of case difficulty" value={spread} min={0} max={3} step={0.1} onChange={setSpread} format={(x) => x.toFixed(1)} />
        <Select
          label="Evaluator output"
          value={kind}
          onChange={setKind}
          options={[
            { value: "continuous", label: "Score in [0, 1]" },
            { value: "pass-fail", label: "Pass or fail" },
          ]}
        />
        <Select
          label="Resamples"
          value={resamples}
          onChange={setResamples}
          options={[
            { value: "2000", label: "2,000" },
            { value: "10000", label: "10,000" },
          ]}
        />
        <div className="control" style={{ alignContent: "end" }}>
          <button type="button" className="button secondary" onClick={() => setSeed((s) => s + 1)}>
            Draw a new eval set
          </button>
        </div>
      </div>

      {out && v ? (
        <>
          <div className="stat-line">
            <span className={`verdict ${v.tone}`}>{v.text}</span>
            <span>
              Observed change <strong>{out.r.observedDelta >= 0 ? "+" : ""}{out.r.observedDelta.toFixed(4)}</strong>
            </span>
            <span>
              95% interval{" "}
              <strong>
                [{out.r.paired.lo.toFixed(4)}, {out.r.paired.hi.toFixed(4)}]
              </strong>
            </span>
            <span className="chunk-caption">
              {Number(deferred.resamples).toLocaleString("en-US")} resamples of {deferred.n} cases
            </span>
          </div>
          <Histogram
            label="Bootstrap distribution of the mean score change, with the 95% interval shaded and zero marked."
            bins={out.hist.counts}
            min={out.hist.min}
            max={out.hist.max}
            color="var(--chart-a)"
            band={{ lo: out.r.paired.lo, hi: out.r.paired.hi, color: "var(--chart-a)" }}
            markers={[{ at: 0, color: "var(--ink-2)", label: "0", dash: "3 3" }]}
            height={170}
          />
          <Intervals
            label="Paired versus unpaired 95% intervals for the same data."
            rows={[
              { name: "Paired", lo: out.r.paired.lo, hi: out.r.paired.hi, point: out.r.observedDelta, color: "var(--chart-a)" },
              { name: "Unpaired", lo: out.r.unpaired.lo, hi: out.r.unpaired.hi, point: out.r.observedDelta, color: "var(--chart-b)" },
            ]}
          />
        </>
      ) : (
        <p className="chunk-caption">Running the bootstrap…</p>
      )}

      <figcaption>
        <p>
          Cases differ in difficulty far more than prompts differ in quality. Pairing cancels that variance, so the paired
          interval is several times narrower than the unpaired one on identical data. Raise the difficulty spread and
          watch the unpaired interval swallow a real regression. Below {MIN_CASES} cases the gate refuses to judge, because
          &ldquo;we could not tell&rdquo; must never be read as &ldquo;it is fine&rdquo;.
        </p>
        {showProjectLink && (
          <p>
            This is the regression gate in <Link href="/work/ai-evals">AI-Evals</Link>, which runs 10,000 resamples per
            verdict and blocks the pull request.
          </p>
        )}
      </figcaption>
    </figure>
  );
}
