"use client";

import { useState } from "react";
import type { LensId, LensOrAll } from "@/content/types";
import { setLens, useLens } from "../state";

/*
 * The cards are rendered on the server, all of them. This shell only sets
 * data-lens on the list; CSS reorders the cards (each carries --o-{lens}) and
 * hides the ones outside the top six for that lens until the list is expanded.
 * The lens lives in the URL (?for=quant), so a link can be sent per application.
 */
export function WorkShell({
  lenses,
  total,
  featured,
  children,
}: {
  lenses: { id: LensId; label: string; pitch: string }[];
  total: number;
  featured: number;
  children: React.ReactNode;
}) {
  const lens = useLens();
  const [open, setOpen] = useState(false);
  const current = lenses.find((l) => l.id === lens);
  const options: { id: LensOrAll; label: string }[] = [{ id: "all", label: "Everything" }, ...lenses];

  return (
    <>
      <div className="filters" data-reveal>
        <p className="filters-q">What are you hiring for?</p>
        <div className="filter-chips" role="group" aria-label="Order the work for a role">
          {options.map((o) => (
            <button key={o.id} type="button" aria-pressed={lens === o.id} onClick={() => setLens(o.id)}>
              {o.label}
            </button>
          ))}
        </div>
        <p className="filters-pitch" aria-live="polite">
          {current ? current.pitch : "Six projects first, in the order I would show them to anyone. Pick a role and they re-rank."}
          {current && (
            <span className="mono filters-url">
              {" "}
              This view has its own link: ?for={current.id}
            </span>
          )}
        </p>
      </div>

      <div className="work-list" data-lens={lens} data-open={open || undefined}>
        {children}
      </div>

      <div className="work-more">
        <button type="button" className="btn btn-accent" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? "Show the top six only" : `Open the other ${total - featured} case files`}
          <svg viewBox="0 0 16 16" aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : undefined }}>
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
    </>
  );
}
