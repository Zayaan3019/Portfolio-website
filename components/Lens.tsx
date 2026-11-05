"use client";

import Link from "next/link";
import { useState } from "react";
import { DEFAULT_EVIDENCE, DEFAULT_START, EVIDENCE, LENSES, lensById } from "@/content/site";
import type { LensId, LensOrAll, Project } from "@/content/types";
import { setLens, useLens } from "./state";
import { SourceLink } from "./SourceLink";

export type ProjectSummary = Pick<Project, "slug" | "title" | "kind" | "tagline" | "headline" | "relevance">;

/** The role picker. Changing it re-ranks evidence, work and the featured experiment. */
export function LensPicker({ projects }: { projects: ProjectSummary[] }) {
  const lens = useLens();
  const active = lens === "all" ? undefined : lensById(lens);
  const start = (active?.startHere ?? DEFAULT_START)
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is ProjectSummary => Boolean(p));

  return (
    <div className="lens">
      <fieldset>
        <legend>What are you hiring for?</legend>
        <div className="lens-options">
          {[{ id: "all" as const, label: "Show everything" }, ...LENSES].map((l) => (
            <label key={l.id} className="lens-option">
              <input
                type="radio"
                name="lens"
                value={l.id}
                checked={lens === l.id}
                onChange={() => setLens(l.id as LensOrAll)}
              />
              <span>{l.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="lens-readout" aria-live="polite">
        <p>
          {active
            ? active.pitch
            : "The page is ordered for a general reader. Pick a role and the results, the work and the featured experiment re-rank for it."}
        </p>
        <p className="lens-start">
          Start with{" "}
          {start.map((p, i) => (
            <span key={p.slug}>
              <Link href={`/work/${p.slug}`}>{p.title}</Link>
              {i < start.length - 2 ? ", " : i === start.length - 2 ? " and " : "."}
            </span>
          ))}
        </p>
        {active && <ShareLine lens={active.id} />}
      </div>
    </div>
  );
}

function ShareLine({ lens }: { lens: LensId }) {
  const [copied, setCopied] = useState(false);
  const path = `/?for=${lens}`;
  return (
    <p className="lens-share">
      This view has its own address, <code>{path}</code>.{" "}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.origin + path);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
    </p>
  );
}

export function EvidenceList() {
  const lens = useLens();
  const ids = lens === "all" ? DEFAULT_EVIDENCE : lensById(lens)?.evidence ?? DEFAULT_EVIDENCE;
  const items = ids.map((id) => EVIDENCE.find((e) => e.id === id)).filter((e) => e !== undefined);
  return (
    <ul className="evidence">
      {items.map((e) => (
        <li key={e.id}>
          <span className="evidence-figure">{e.figure}</span>
          <div>
            <p className="evidence-claim">
              <Link href={`/work/${e.project}`}>{e.claim}</Link>
            </p>
            <SourceLink source={e.source} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function WorkIndex({ projects }: { projects: ProjectSummary[] }) {
  const lens = useLens();
  if (lens === "all") {
    return (
      <ul className="work-list">
        {projects.map((p) => (
          <WorkRow key={p.slug} p={p} />
        ))}
      </ul>
    );
  }
  const active = lensById(lens)!;
  const ranked = projects
    .map((p, i) => ({ p, i, r: p.relevance[active.id] }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  const primary = ranked.filter((x) => x.r >= 2).map((x) => x.p);
  const rest = ranked.filter((x) => x.r < 2).map((x) => x.p);
  return (
    <>
      <div className="work-group">
        <h3>Most relevant to a {active.role} role</h3>
        <ul className="work-list">
          {primary.map((p) => (
            <WorkRow key={p.slug} p={p} />
          ))}
        </ul>
      </div>
      {rest.length > 0 && (
        <div className="work-group">
          <h3>Also built</h3>
          <ul className="work-list">
            {rest.map((p) => (
              <WorkRow key={p.slug} p={p} quiet />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function WorkRow({ p, quiet }: { p: ProjectSummary; quiet?: boolean }) {
  return (
    <li className={quiet ? "work-row is-quiet" : "work-row"}>
      <Link href={`/work/${p.slug}`}>
        <div>
          <span className="work-title">{p.title}</span>
          {p.kind === "competition" && <span className="work-kind">Competition</span>}
          <p className="work-tagline">{p.tagline}</p>
        </div>
        <div className="work-figure">
          <strong>{p.headline.figure}</strong>
          <span>{p.headline.label}</span>
        </div>
      </Link>
    </li>
  );
}
