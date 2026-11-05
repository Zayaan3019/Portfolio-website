"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PROFILE } from "@/content/site";
import { openDesk, openPalette, setTheme, useTheme } from "../state";

export interface NavItem {
  id: string;
  label: string;
  href?: string;
}

export const HOME_NAV: NavItem[] = [
  { id: "work", label: "Work" },
  { id: "lab", label: "Lab" },
  { id: "route", label: "Route" },
  { id: "receipts", label: "Receipts" },
  { id: "research", label: "Research" },
  { id: "contact", label: "Contact" },
];

function Icon({ d, label }: { d: string; label?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden={label ? undefined : true} role={label ? "img" : undefined}>
      {label && <title>{label}</title>}
      <path d={d} fill="currentColor" />
    </svg>
  );
}

const GH =
  "M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z";
const LI =
  "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z";

export function TopBar({ items = HOME_NAV, home = true }: { items?: NavItem[]; home?: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? h.scrollTop / max : 0);
      setScrolled(h.scrollTop > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const targets = items
      .filter((i) => !i.href)
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        let best: string | null = null;
        let top = Infinity;
        for (const [id, t] of visible) if (t < top) [best, top] = [id, t];
        setActive(best);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [items]);

  return (
    <header className={scrolled ? "topbar scrolled" : "topbar"}>
      <div className="topbar-inner wrap">
        <Link href="/" className="brand" aria-label={`${PROFILE.name}, home`}>
          <span className="brand-mark" aria-hidden="true">
            MZ
          </span>
          <span className="brand-name">{PROFILE.name}</span>
        </Link>

        <nav className="topnav" aria-label="Sections">
          {items.map((i) =>
            i.href ? (
              <Link key={i.id} href={i.href}>
                {i.label}
              </Link>
            ) : (
              <a key={i.id} href={home ? `#${i.id}` : `/#${i.id}`} aria-current={active === i.id ? "true" : undefined}>
                {i.label}
              </a>
            ),
          )}
        </nav>

        <div className="topbar-tools">
          <button type="button" className="tool-btn palette-btn" onClick={openPalette} aria-label="Open the command palette">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="palette-label">Jump to</span>
            <kbd>Ctrl K</kbd>
          </button>
          <button type="button" className="tool-btn desk-btn" onClick={openDesk} title="Trading desk: a market-making game">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M3 17l5-6 4 3 6-8 3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <span className="desk-label">Trade</span>
          </button>
          <button
            type="button"
            className="tool-btn icon-only"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to the light theme" : "Switch to the dark theme"}
          >
            {theme === "light" ? (
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2" fill="currentColor" />
                <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <a className="tool-btn icon-only hide-sm" href={PROFILE.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Icon d={GH} />
          </a>
          <a className="tool-btn icon-only hide-sm" href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Icon d={LI} />
          </a>
        </div>
      </div>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  );
}
