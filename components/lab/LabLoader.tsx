"use client";

import dynamic from "next/dynamic";
import type { LabId } from "@/content/types";

const Loading = () => (
  <div className="figure" aria-busy="true">
    <p className="chunk-caption">Loading the experiment…</p>
  </div>
);

/* Each experiment is its own chunk, loaded only where it is shown. */
const LABS: Record<LabId, React.ComponentType<{ showProjectLink?: boolean }>> = {
  "kv-cache": dynamic(() => import("./KVCacheLab"), { ssr: false, loading: Loading }),
  "market-making": dynamic(() => import("./MarketMakingLab"), { ssr: false, loading: Loading }),
  bootstrap: dynamic(() => import("./BootstrapLab"), { ssr: false, loading: Loading }),
  merkle: dynamic(() => import("./MerkleLab"), { ssr: false, loading: Loading }),
};

export const LAB_TITLES: Record<LabId, string> = {
  "kv-cache": "KV-cache equivalence",
  "market-making": "Market making against informed flow",
  bootstrap: "Paired-bootstrap regression gate",
  merkle: "Merkle delta sync",
};

export function Lab({ id, showProjectLink = true }: { id: LabId; showProjectLink?: boolean }) {
  const C = LABS[id];
  return <C showProjectLink={showProjectLink} />;
}
