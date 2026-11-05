"use client";

import { useState } from "react";
import type { LabId } from "@/content/types";
import { lensById } from "@/content/site";
import { useLens } from "../state";
import { Lab, LAB_TITLES } from "./LabLoader";

const BLURB: Record<LabId, string> = {
  "kv-cache": "Float32 attention, run as a full pass and as cached decoding. Inject a bug and watch equivalence break.",
  "market-making": "Avellaneda–Stoikov against a symmetric quoter, with informed flow and an imbalance gate.",
  bootstrap: "The paired-bootstrap gate from AI-Evals, deciding whether a prompt change made an agent worse.",
  merkle: "Real SHA-256 in your browser: what a one-word edit costs with fixed versus content-defined chunks.",
};

/** The lab section on the home page: four live experiments, one tab each. Defaults to the role lens. */
export function LabTabs() {
  const lens = useLens();
  const fallback: LabId = lens === "all" ? "kv-cache" : lensById(lens)?.lab ?? "kv-cache";
  const [picked, setPicked] = useState<LabId | null>(null);
  const id = picked ?? fallback;
  const ids = Object.keys(LAB_TITLES) as LabId[];

  return (
    <div className="labtabs">
      <div className="labtabs-list" role="tablist" aria-label="Experiments">
        {ids.map((k, i) => (
          <button
            key={k}
            type="button"
            role="tab"
            id={`tab-${k}`}
            aria-selected={id === k}
            aria-controls="lab-panel"
            onClick={() => setPicked(k)}
          >
            <span className="mono">0{i + 1}</span>
            <strong>{LAB_TITLES[k]}</strong>
            <span>{BLURB[k]}</span>
          </button>
        ))}
      </div>
      <div id="lab-panel" role="tabpanel" aria-labelledby={`tab-${id}`} className="labtabs-panel">
        <Lab id={id} />
      </div>
    </div>
  );
}
