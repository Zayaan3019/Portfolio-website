"use client";

import { useRef } from "react";
import { PROFILE } from "@/content/site";

/*
 * Engineering drawings carry a title block: who drew it, the discipline, the scale,
 * the revision. This one describes the engineer instead of the drawing.
 */
const ROWS: [string, string][] = [
  ["Drawn by", "Mohamed Zayaan S"],
  ["Discipline", "Civil Engg. + CS minor"],
  ["Institution", "IIT Madras, class of 2027"],
  ["Builds", "LLMs, market makers, distributed systems"],
  ["Rated", "Codeforces Specialist, 1423"],
  ["Open to", "ML, SDE, applied science, DS, quant"],
];

export function TitleBlock() {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="tb-stage" data-reveal data-no-drop>
      <div className="tb" ref={ref} onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="tb-head">
          <span>Sheet 01 of 01</span>
          <span>Rev. 2026.11</span>
        </div>
        <div className="tb-photo">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static asset, no optimiser needed */}
          <img src="/zayaan.webp" alt={`Portrait of ${PROFILE.name}`} width={640} height={800} />
          <span className="tb-cross tb-cross-a" aria-hidden="true" />
          <span className="tb-cross tb-cross-b" aria-hidden="true" />
          <span className="tb-dim" aria-hidden="true">
            <i />
            <b>1 : 1</b>
            <i />
          </span>
        </div>
        <dl className="tb-rows">
          {ROWS.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="tb-stamp" aria-label="Amazon ML Challenge 2026: 175th of 90,000">
          <span>Load tested</span>
          <strong>Top 0.2%</strong>
          <span>Amazon ML 2026</span>
        </div>
        <div className="tb-glare" aria-hidden="true" />
      </div>
    </div>
  );
}
