"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useId, useState } from "react";
import { planSync, reconstruct, type Chunking, type SyncPlan } from "@/lib/sim/merkle";
import { Select } from "./Slider";

const ORIGINAL =
  "Peers compare a single root hash first. When the roots match, the files are identical and nothing else is sent. " +
  "When they differ, the peers exchange leaf hashes and transfer only the chunks the other side does not already hold. " +
  "Vector clocks decide whether one edit happened after another or whether the two were concurrent, in which case " +
  "both versions survive as visible conflict files. Every connection is authenticated and encrypted per direction.";

const enc = new TextEncoder();

interface Outcome {
  plan: SyncPlan;
  verified: boolean;
}

export default function MerkleLab({ showProjectLink = true }: { showProjectLink?: boolean }) {
  const localId = useId();
  const remoteId = useId();
  const [remote, setRemote] = useState(ORIGINAL);
  const [local, setLocal] = useState(ORIGINAL.replace("single root hash", "single Merkle root"));
  const [chunking, setChunking] = useState<Chunking>("fixed");
  const [size, setSize] = useState<"16" | "32" | "64">("32");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const dLocal = useDeferredValue(local);
  const dRemote = useDeferredValue(remote);

  useEffect(() => {
    let cancelled = false;
    const a = enc.encode(dLocal);
    const b = enc.encode(dRemote);
    planSync(a, b, chunking, Number(size)).then((plan) => {
      if (cancelled) return;
      const rebuilt = new TextDecoder().decode(reconstruct(a, b, plan));
      setOutcome({ plan, verified: rebuilt === dLocal });
    });
    return () => {
      cancelled = true;
    };
  }, [dLocal, dRemote, chunking, size]);

  const plan = outcome?.plan;
  const missing = new Set(plan?.missing ?? []);
  const sent = plan ? plan.bytesHashes + plan.bytesChunks : 0;

  return (
    <figure className="figure" aria-labelledby="mk-title">
      <h3 id="mk-title">What actually crosses the network</h3>
      <p className="figure-sub">
        Real SHA-256 in your browser. Edit either copy, and the sync plan is recomputed: which chunks the peer is missing,
        and how many bytes that costs compared with sending the whole file.
      </p>

      <div className="controls">
        <div className="control" style={{ gridColumn: "1 / -1" }}>
          <label className="control-label" htmlFor={localId}>
            <span>Your copy</span>
          </label>
          <textarea id={localId} value={local} rows={4} maxLength={4000} onChange={(e) => setLocal(e.target.value)} />
        </div>
        <div className="control" style={{ gridColumn: "1 / -1" }}>
          <label className="control-label" htmlFor={remoteId}>
            <span>The peer&apos;s copy</span>
          </label>
          <textarea id={remoteId} value={remote} rows={4} maxLength={4000} onChange={(e) => setRemote(e.target.value)} />
        </div>
        <Select
          label="Chunk boundaries"
          value={chunking}
          onChange={setChunking}
          options={[
            { value: "fixed", label: "Fixed size (as in the project)" },
            { value: "content-defined", label: "Content-defined (rolling hash)" },
          ]}
        />
        <Select
          label="Target chunk size, bytes"
          value={size}
          onChange={setSize}
          options={[
            { value: "16", label: "16" },
            { value: "32", label: "32" },
            { value: "64", label: "64" },
          ]}
        />
      </div>

      <div className="button-row">
        <button type="button" className="button secondary" onClick={() => setLocal(ORIGINAL.replace("Every connection", "Each connection"))}>
          Edit one word
        </button>
        <button type="button" className="button secondary" onClick={() => setLocal("Note: " + ORIGINAL)}>
          Insert at the start
        </button>
        <button type="button" className="button secondary" onClick={() => setLocal(ORIGINAL)}>
          Make them identical
        </button>
      </div>

      {plan && (
        <>
          <div className="stat-line">
            <span className={plan.identical ? "verdict pass" : "verdict hold"}>
              {plan.identical ? "Roots match: nothing to send" : `${plan.missing.length} of ${plan.local.length} chunks to send`}
            </span>
            <span>
              Sent <strong>{sent.toLocaleString("en-US")} B</strong> vs full copy{" "}
              <strong>{plan.bytesFullCopy.toLocaleString("en-US")} B</strong>
            </span>
            <span>
              Rebuilt file matches <strong>{outcome?.verified ? "yes" : "no"}</strong>
            </span>
          </div>
          <div className="chunk-caption">Your copy, one block per chunk. Highlighted chunks are the ones the peer lacks.</div>
          <div className="chunks" aria-hidden="true">
            {plan.local.map((c, i) => (
              <span
                key={`${c.start}-${c.hash.slice(0, 8)}`}
                className={missing.has(i) ? "changed" : undefined}
                style={{ flexGrow: c.end - c.start, flexBasis: `${(c.end - c.start) * 0.32}rem` }}
                title={`bytes ${c.start}–${c.end}`}
              />
            ))}
          </div>
          <table className="readout">
            <thead>
              <tr>
                <th scope="col">Transfer</th>
                <th scope="col">Bytes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Root, then leaf hashes (32 B each)</th>
                <td>{plan.bytesHashes.toLocaleString("en-US")}</td>
              </tr>
              <tr>
                <th scope="row">Missing chunks</th>
                <td>{plan.bytesChunks.toLocaleString("en-US")}</td>
              </tr>
              <tr>
                <th scope="row">Root hashes</th>
                <td className="mono">
                  {plan.localTree.root.slice(0, 10)} / {plan.remoteTree.root.slice(0, 10)}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <figcaption>
        <p>
          Change one word and one chunk moves. Insert a word at the start with fixed-size chunks and every boundary after it
          shifts, so almost everything looks new. Switch to content-defined boundaries and the chunker re-synchronises
          right after the edit. With chunks this small the hash list dominates; at the project&apos;s 4 KB chunks it is
          under 1% of the data.
        </p>
        {showProjectLink && (
          <p>
            <Link href="/work/distributed-file-sync">Distributed File Sync</Link> uses fixed 4 KB chunks with vector clocks,
            encrypted transport and a FUSE mount. Content-defined chunking is an extension shown here, not part of it.
          </p>
        )}
      </figcaption>
    </figure>
  );
}
