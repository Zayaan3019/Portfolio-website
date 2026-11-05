"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { LabId } from "@/content/types";
import { lensById } from "@/content/site";
import { useLens } from "../state";

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

/** Mid-sentence names, keeping proper nouns and acronyms capitalised. */
const LAB_INLINE: Record<LabId, string> = {
  "kv-cache": "KV-cache equivalence",
  "market-making": "market making against informed flow",
  bootstrap: "the paired-bootstrap regression gate",
  merkle: "Merkle delta sync",
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

/** The home page shows the experiment that best fits the active role lens. */
export function FeaturedLab() {
  const lens = useLens();
  const id: LabId = lens === "all" ? "kv-cache" : lensById(lens)?.lab ?? "kv-cache";
  const others = (Object.keys(LAB_TITLES) as LabId[]).filter((k) => k !== id);
  return (
    <>
      <Lab id={id} />
      <p className="lab-more">
        Three more on the <Link href="/lab">lab page</Link>: {others.map((o, i) => (i === others.length - 1 ? `and ${LAB_INLINE[o]}` : LAB_INLINE[o])).join(", ")}.
      </p>
    </>
  );
}
