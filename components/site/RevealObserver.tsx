"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for the whole page: anything marked data-reveal fades and lifts in
 * the first time it enters the viewport. Content is only hidden when the boot script
 * has marked the document as scripted, so nothing disappears without JavaScript.
 */
export function RevealObserver() {
  const path = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)"));
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add("in"));
      document.querySelectorAll(".viz").forEach((v) => v.classList.add("live"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((e) => io.observe(e));

    // Figures animate only while visible, so off-screen SVG never costs a paint.
    const live = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("live", e.isIntersecting);
      },
      { rootMargin: "80px 0px" },
    );
    document.querySelectorAll(".viz").forEach((v) => live.observe(v));
    return () => {
      io.disconnect();
      live.disconnect();
    };
  }, [path]);
  return null;
}
