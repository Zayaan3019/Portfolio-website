"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PROFILE } from "@/content/site";
import { ThemeToggle } from "./ThemeToggle";

export interface RailItem {
  id: string;
  label: string;
  href?: string; // absolute link instead of an in-page anchor
}

/** Sticky contents rail. Highlights the section currently in view. */
export function Rail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = items
      .filter((i) => !i.href)
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;
    const visible = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        let best: string | null = null;
        let bestTop = Infinity;
        for (const [id, top] of visible) {
          if (top < bestTop) {
            best = id;
            bestTop = top;
          }
        }
        setActive(best);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, [items]);

  return (
    <header className="rail">
      <Link href="/" className="rail-name">
        {PROFILE.name}
      </Link>
      <nav aria-label="Sections">
        <div className="rail-nav">
          {items.map((i) =>
            i.href ? (
              <Link key={i.id} href={i.href}>
                {i.label}
              </Link>
            ) : (
              <a key={i.id} href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined}>
                {i.label}
              </a>
            ),
          )}
        </div>
      </nav>
      <div className="rail-meta">
        <ul>
          <li>
            <a href={PROFILE.links.resume} target="_blank" rel="noopener noreferrer">
              Resume (PDF)
            </a>
          </li>
          <li>
            <a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={`mailto:${PROFILE.email}`}>Email</a>
          </li>
        </ul>
        <ThemeToggle />
      </div>
    </header>
  );
}
