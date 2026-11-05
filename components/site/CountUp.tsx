"use client";

import { useEffect, useRef, useState } from "react";

/** Counts a number up the first time it scrolls into view. Server-renders the final value. */
export function CountUp({ value, grouping = true, duration = 1400 }: { value: number; grouping?: boolean; duration?: number }) {
  const format = (n: number) => (grouping ? n.toLocaleString("en-US") : String(n));
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          setShown(p >= 1 ? null : Math.round(value * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        setShown(0);
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return <span ref={ref}>{format(shown ?? value)}</span>;
}
