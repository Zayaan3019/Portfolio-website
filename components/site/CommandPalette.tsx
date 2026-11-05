"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PROJECTS } from "@/content/projects";
import { LENSES, PROFILE } from "@/content/site";
import { PALETTE_EVENT, openDesk, setLens, setTheme } from "../state";

interface Cmd {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
  run: () => void;
}

/** Ctrl/Cmd+K (or "/") opens a keyboard-first jump list over every section, project and action. */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const go = (hash: string) => {
    if (window.location.pathname === "/") {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(history.state, "", `${window.location.search}#${hash}`);
    } else router.push(`/#${hash}`);
  };

  const commands: Cmd[] = useMemo(
    () => [
      ...[
        ["work", "Work"],
        ["lab", "Lab: live experiments"],
        ["route", "Route: experience"],
        ["receipts", "Receipts: every number, sourced"],
        ["research", "Research and IP"],
        ["contact", "Contact"],
      ].map(([id, label]) => ({ id: `s-${id}`, group: "Sections", label, run: () => go(id) })),
      ...PROJECTS.map((p) => ({
        id: `p-${p.slug}`,
        group: "Case files",
        label: p.title,
        hint: `${p.headline.figure} ${p.headline.label}`,
        keywords: `${p.tagline} ${p.stack.join(" ")} ${p.pipeline.map((x) => x.name).join(" ")}`,
        run: () => router.push(`/work/${p.slug}`),
      })),
      ...LENSES.map((l) => ({
        id: `l-${l.id}`,
        group: "Order the work for",
        label: l.label,
        hint: `?for=${l.id}`,
        run: () => {
          if (window.location.pathname !== "/") router.push(`/?for=${l.id}#work`);
          else {
            setLens(l.id);
            go("work");
          }
        },
      })),
      { id: "a-desk", group: "Actions", label: "Play the trading desk", hint: "market-making game", run: openDesk },
      {
        id: "a-email",
        group: "Actions",
        label: "Copy email address",
        hint: PROFILE.email,
        run: () => {
          navigator.clipboard?.writeText(PROFILE.email).then(
            () => setToast("Email copied"),
            () => (window.location.href = `mailto:${PROFILE.email}`),
          );
        },
      },
      { id: "a-resume", group: "Actions", label: "Open resume", run: () => window.open(PROFILE.links.resume, "_blank", "noopener") },
      {
        id: "a-theme",
        group: "Actions",
        label: "Toggle light and dark",
        run: () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"),
      },
      { id: "a-lab", group: "Actions", label: "Open the full lab page", run: () => router.push("/lab") },
      { id: "x-gh", group: "Elsewhere", label: "GitHub", run: () => window.open(PROFILE.links.github, "_blank", "noopener") },
      { id: "x-li", group: "Elsewhere", label: "LinkedIn", run: () => window.open(PROFILE.links.linkedin, "_blank", "noopener") },
      { id: "x-cf", group: "Elsewhere", label: "Codeforces", run: () => window.open(PROFILE.links.codeforces, "_blank", "noopener") },
      { id: "x-arxiv", group: "Elsewhere", label: "Cortex-Synth on arXiv", run: () => window.open(PROFILE.links.arxiv, "_blank", "noopener") },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- go only closes over router
    [router],
  );

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return commands;
    const words = t.split(/\s+/);
    return commands.filter((c) => {
      const hay = `${c.label} ${c.hint ?? ""} ${c.group} ${c.keywords ?? ""}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [q, commands]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, select, [contenteditable]");
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "/" && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const id = window.setTimeout(() => inputRef.current?.focus(), 10);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const close = () => {
    setOpen(false);
    setQ("");
    setSel(0);
  };
  const run = (c: Cmd | undefined) => {
    if (!c) return;
    close();
    c.run();
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(filtered.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(filtered[sel]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  let lastGroup = "";
  return (
    <>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {open && (
        <div className="palette-overlay" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette">
            <div className="palette-input">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                autoFocus
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={onInputKey}
                placeholder="Search projects, sections, actions…"
                aria-label="Search"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={filtered[sel] ? `cmd-${filtered[sel].id}` : undefined}
              />
              <kbd>Esc</kbd>
            </div>
            <ul id="palette-list" className="palette-list" role="listbox" ref={listRef}>
              {filtered.length === 0 && <li className="palette-empty">Nothing matches “{q}”.</li>}
              {filtered.map((c, i) => {
                const header = c.group !== lastGroup ? c.group : null;
                lastGroup = c.group;
                return (
                  <li key={c.id} role="presentation">
                    {header && <p className="palette-group">{header}</p>}
                    <div
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={i === sel}
                      data-i={i}
                      className={i === sel ? "palette-item on" : "palette-item"}
                      onMouseMove={() => setSel(i)}
                      onClick={() => run(c)}
                    >
                      <span>{c.label}</span>
                      {c.hint && <span className="palette-hint mono">{c.hint}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="palette-foot mono">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> move
              </span>
              <span>
                <kbd>Enter</kbd> open
              </span>
              <span>
                <kbd>/</kbd> or <kbd>Ctrl K</kbd> anywhere
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
