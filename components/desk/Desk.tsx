"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { DESK_EVENT } from "../state";

/* The game is its own chunk, fetched the first time someone opens the desk. */
const DeskGame = dynamic(() => import("./DeskGame"), {
  ssr: false,
  loading: ({ error }) =>
    error ? (
      <p className="desk-loading mono" data-error={String(error)}>
        The exchange did not answer. Reload the page to try again.
      </p>
    ) : (
      <p className="desk-loading mono">Connecting to the exchange…</p>
    ),
});

export function Desk() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(DESK_EVENT, onOpen);
    return () => window.removeEventListener(DESK_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="desk-overlay" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="desk-dialog" role="dialog" aria-modal="true" aria-labelledby="desk-title">
        <DeskGame onClose={() => setOpen(false)} />
      </div>
    </div>
  );
}
