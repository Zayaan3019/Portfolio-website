"use client";

import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";
import {
  decodeCached,
  forwardFull,
  makeModel,
  maxAbsDiff,
  perPositionDiff,
  tokenize,
  uncachedGenerationOps,
  type InjectedBug,
} from "@/lib/sim/attention";
import { LogBars } from "./charts";
import { Select } from "./Slider";
import { useHydrated } from "../state";

const TOLERANCE = 1e-5;
const VOCAB = 256;
const MAX_TOKENS = 96;

export default function KVCacheLab({ showProjectLink = true }: { showProjectLink?: boolean }) {
  const hydrated = useHydrated();
  const promptId = useId();
  const [prompt, setPrompt] = useState("Plausible text is not evidence that the cache is correct.");
  const [bug, setBug] = useState<InjectedBug>("none");
  const [d, setD] = useState<"16" | "32" | "64">("32");
  const deferredPrompt = useDeferredValue(prompt);

  const result = useMemo(() => {
    if (!hydrated) return null;
    const dim = Number(d);
    const model = makeModel(dim, VOCAB, 7);
    const tokens = tokenize(deferredPrompt, VOCAB).slice(0, MAX_TOKENS);
    if (tokens.length === 0) return { empty: true as const };
    const full = forwardFull(model, tokens, bug === "no-causal-mask" ? bug : "none");
    const cached = decodeCached(model, tokens, bug === "position-offset" ? bug : "none");
    const uncached = uncachedGenerationOps(model, tokens);
    return {
      empty: false as const,
      tokens: tokens.length,
      diff: maxAbsDiff(full.outputs, cached.outputs),
      perPos: perPositionDiff(full.outputs, cached.outputs),
      cachedMacs: cached.ops.projectionMacs + cached.ops.attentionMacs,
      uncachedMacs: uncached.projectionMacs + uncached.attentionMacs,
    };
  }, [hydrated, deferredPrompt, bug, d]);

  const pass = result && !result.empty && result.diff <= TOLERANCE;

  return (
    <figure className="figure" aria-labelledby="kv-title">
      <h3 id="kv-title">Is the KV cache actually correct?</h3>
      <p className="figure-sub">
        A causal attention layer in float32, run two ways: one pass over the whole sequence (training), and token by
        token with a key-value cache (generation). The test that matters is whether they agree.
      </p>

      <div className="controls">
        <div className="control" style={{ gridColumn: "1 / -1" }}>
          <label className="control-label" htmlFor={promptId}>
            <span>Prompt, tokenised as bytes</span>
            <output htmlFor={promptId}>{result && !result.empty ? `${result.tokens} tokens` : ""}</output>
          </label>
          <textarea id={promptId} value={prompt} maxLength={MAX_TOKENS * 2} rows={2} onChange={(e) => setPrompt(e.target.value)} />
        </div>
        <Select
          label="Inject a bug"
          value={bug}
          onChange={setBug}
          options={[
            { value: "none", label: "No bug" },
            { value: "position-offset", label: "Cache: position index off by one" },
            { value: "no-causal-mask", label: "Full pass: causal mask missing" },
          ]}
        />
        <Select
          label="Model width d"
          value={d}
          onChange={setD}
          options={[
            { value: "16", label: "16" },
            { value: "32", label: "32" },
            { value: "64", label: "64" },
          ]}
        />
      </div>

      {result && result.empty && <p className="chunk-caption">Type a prompt to run both paths.</p>}
      {result && !result.empty && (
        <>
          <div className="stat-line">
            <span className={pass ? "verdict pass" : "verdict fail"}>{pass ? "Equivalent" : "Mismatch, test fails"}</span>
            <span>
              Max |full − cached| <strong className="mono">{result.diff === 0 ? "0" : result.diff.toExponential(2)}</strong>
            </span>
            <span>
              Tolerance <strong className="mono">1e-5</strong>
            </span>
          </div>
          <LogBars
            values={result.perPos}
            threshold={TOLERANCE}
            label={`Per-position maximum difference between the full pass and cached decoding, log scale. ${pass ? "All positions are within rounding error." : "Some positions exceed the tolerance."}`}
            color="var(--chart-a)"
            failColor="var(--fail)"
          />
          <table className="readout">
            <thead>
              <tr>
                <th scope="col">Generating every prefix</th>
                <th scope="col">Multiply-adds</th>
                <th scope="col">Relative</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">With the KV cache</th>
                <td>{result.cachedMacs.toLocaleString("en-US")}</td>
                <td>1×</td>
              </tr>
              <tr>
                <th scope="row">Recomputing the prefix each step</th>
                <td>{result.uncachedMacs.toLocaleString("en-US")}</td>
                <td>{(result.uncachedMacs / result.cachedMacs).toFixed(1)}×</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <figcaption>
        <p>
          With no bug, the two paths differ only because they add numbers in a different order, so the error stays near
          float32 rounding (2⁻²⁴ ≈ 5.96e-8). Both injected bugs still produce outputs of the right shape and plausible
          magnitude. Only a numerical equivalence test catches them. The counts are measured by the code, not assumed.
        </p>
        {showProjectLink && (
          <p>
            <Link href="/work/nanolm">NanoLM</Link> runs this check on a full GPT, across batch sizes and lengths, and
            measures a maximum deviation of 5.96e-8.
          </p>
        )}
      </figcaption>
    </figure>
  );
}
