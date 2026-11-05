/*
 * One small, purpose-drawn figure per project: the idea that makes the project
 * work, not a screenshot. Pure SVG, server-rendered, animated with CSS only
 * (and still under prefers-reduced-motion).
 */
import type { Project } from "@/content/types";
import { mulberry32, normalSampler } from "@/lib/sim/rng";

const VB = "0 0 400 260";

function OrderBook() {
  const r = mulberry32(7);
  const rows = 7;
  const h = 14;
  const gap = 4;
  const mid = 130;
  const asks = Array.from({ length: rows }, (_, i) => 0.35 + 0.65 * r() * (0.5 + i / rows));
  const bids = Array.from({ length: rows }, (_, i) => 0.35 + 0.65 * r() * (0.5 + i / rows));
  return (
    <svg viewBox={VB} className="viz-svg" role="img" aria-label="Order book ladder: bids below the mid, asks above, with the market maker's quotes skewing as inventory changes.">
      {asks.map((w, i) => (
        <g key={`a${i}`} transform={`translate(0 ${mid - 12 - (i + 1) * (h + gap)})`}>
          <text x="196" y="11" textAnchor="end" className="viz-label">{(100.12 + i * 0.04).toFixed(2)}</text>
          <rect x="206" y="0" height={h} width={170 * w} rx="2" className="ob-ask" style={{ animationDelay: `${-i * 0.37}s` }} />
        </g>
      ))}
      <line x1="20" x2="380" y1={mid} y2={mid} className="viz-dash" />
      <text x="20" y={mid - 4} className="viz-label viz-strong">mid 100.08</text>
      <text x="380" y={mid - 4} textAnchor="end" className="viz-label">spread 0.04</text>
      {bids.map((w, i) => (
        <g key={`b${i}`} transform={`translate(0 ${mid + 12 + i * (h + gap)})`}>
          <text x="196" y="11" textAnchor="end" className="viz-label">{(100.04 - i * 0.04).toFixed(2)}</text>
          <rect x="206" y="0" height={h} width={170 * w} rx="2" className="ob-bid" style={{ animationDelay: `${-i * 0.53}s` }} />
        </g>
      ))}
      <g className="ob-quotes">
        <rect x="203" y={mid - 12 - 2 * (h + gap) - 2} width="176" height={h + 4} rx="3" className="ob-quote" />
        <rect x="203" y={mid + 12 + 1 * (h + gap) - 2} width="176" height={h + 4} rx="3" className="ob-quote" />
      </g>
      <text x="20" y="252" className="viz-label">quotes lean against inventory · q = +3</text>
    </svg>
  );
}

function Attention() {
  const n = 12;
  const cell = 15;
  const x0 = 110;
  const y0 = 22;
  const r = mulberry32(11);
  const cells: { i: number; j: number; a: number }[] = [];
  for (let i = 0; i < n; i++) {
    const w = Array.from({ length: i + 1 }, (_, j) => Math.exp(-0.35 * (i - j) + 1.2 * r()));
    const z = w.reduce((s, x) => s + x, 0);
    w.forEach((x, j) => cells.push({ i, j, a: x / z }));
  }
  return (
    <svg viewBox={VB} className="viz-svg" role="img" aria-label="Causal attention matrix: each query attends only to earlier keys; a highlighted row steps down as the KV cache decodes one token at a time.">
      {Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) =>
          j > i ? <rect key={`m${i}-${j}`} x={x0 + j * cell} y={y0 + i * cell} width={cell - 2} height={cell - 2} rx="2" className="att-mask" /> : null,
        ),
      )}
      {cells.map((c) => (
        <rect
          key={`${c.i}-${c.j}`}
          x={x0 + c.j * cell}
          y={y0 + c.i * cell}
          width={cell - 2}
          height={cell - 2}
          rx="2"
          className="att-cell"
          style={{ opacity: 0.18 + Math.min(1, c.a * 2.4) * 0.82 }}
        />
      ))}
      <rect x={x0 - 4} y={y0 - 2} width={n * cell + 6} height={cell + 2} rx="3" className="att-scan" />
      <text x={x0 - 10} y={y0 + 10} textAnchor="end" className="viz-label">query t</text>
      <text x={x0 + n * cell} y={y0 + n * cell + 16} textAnchor="end" className="viz-label">keys ≤ t</text>
      <text x="20" y="252" className="viz-label">cached decode = full pass, to 5.96e-8</text>
    </svg>
  );
}

function Entities() {
  const centre = { x: 300, y: 128 };
  const recs = [
    { t: "Lumière Café SARL", y: 34 },
    { t: "LUMIERE CAFE", y: 74 },
    { t: "Café Lumiere, Paris 11e", y: 114 },
    { t: "ルミエール・カフェ", y: 154 },
    { t: "Lumière Cafe Ltd.", y: 194 },
  ];
  return (
    <svg viewBox={VB} className="viz-svg" role="img" aria-label="Five differently written records, in several scripts, resolved into a single entity.">
      {recs.map((r, i) => (
        <g key={r.t}>
          <path d={`M178 ${r.y + 10} C 230 ${r.y + 10}, 240 ${centre.y}, ${centre.x - 26} ${centre.y}`} className="er-link" style={{ animationDelay: `${i * 0.25}s` }} />
          <rect x="16" y={r.y} width="162" height="22" rx="4" className="er-rec" />
          <text x="26" y={r.y + 15} className="viz-label viz-strong">{r.t}</text>
        </g>
      ))}
      <circle cx={centre.x} cy={centre.y} r="26" className="er-entity" />
      <circle cx={centre.x} cy={centre.y} r="26" className="er-pulse" />
      <text x={centre.x} y={centre.y + 4} textAnchor="middle" className="viz-label viz-strong">entity</text>
      <text x={centre.x} y={centre.y + 48} textAnchor="middle" className="viz-label">1 of 12.5M</text>
      <text x="16" y="252" className="viz-label">no shared IDs · nine scripts · illustrative</text>
    </svg>
  );
}

function Bootstrap() {
  const r = mulberry32(5);
  const z = normalSampler(r);
  const bins = new Array(30).fill(0);
  for (let i = 0; i < 4000; i++) {
    const v = z() * 0.9 - 1.9;
    const b = Math.floor(((v + 5) / 7) * 30);
    if (b >= 0 && b < 30) bins[b]++;
  }
  const max = Math.max(...bins);
  const bw = 11;
  const x0 = 34;
  const base = 196;
  const zeroX = x0 + ((0 + 5) / 7) * 30 * bw;
  const lo = x0 + ((-3.66 + 5) / 7) * 30 * bw;
  const hi = x0 + ((-0.14 + 5) / 7) * 30 * bw;
  return (
    <svg viewBox={VB} className="viz-svg" role="img" aria-label="Bootstrap distribution of a score change; the 95% interval sits entirely below zero, so the gate blocks the change.">
      <rect x={lo} y="40" width={hi - lo} height={base - 40} className="bs-band" />
      {bins.map((c, i) => (
        <rect key={i} x={x0 + i * bw} y={base - (c / max) * 140} width={bw - 2} height={(c / max) * 140} rx="1.5" className="bs-bar" style={{ animationDelay: `${i * 0.03}s` }} />
      ))}
      <line x1={zeroX} x2={zeroX} y1="30" y2={base + 6} className="viz-dash" />
      <text x={zeroX + 6} y="40" className="viz-label">0</text>
      <line x1={x0} x2={x0 + 30 * bw} y1={base} y2={base} className="viz-axis" />
      <text x={(lo + hi) / 2} y={base + 20} textAnchor="middle" className="viz-label">95% interval</text>
      <g transform="translate(250 22)">
        <rect width="132" height="26" rx="5" className="bs-verdict" />
        <text x="66" y="17" textAnchor="middle" className="viz-label bs-verdict-t">blocked: regression</text>
      </g>
      <text x="20" y="252" className="viz-label">10,000 paired resamples per verdict</text>
    </svg>
  );
}

function Merkle() {
  const leaves = 8;
  const W = 360;
  const x0 = 20;
  const levels = [8, 4, 2, 1];
  const ys = [206, 146, 86, 28];
  const changed = 5;
  const hashes = ["3fa9", "c01d", "77e2", "a4b8", "1e6f", "d93c", "50aa", "b7c4"];
  const nodes: { x: number; y: number; on: boolean; lvl: number; i: number }[] = [];
  levels.forEach((count, lvl) => {
    for (let i = 0; i < count; i++) {
      const x = x0 + (W / count) * (i + 0.5);
      const on = Math.floor(changed / Math.pow(2, lvl)) === i;
      nodes.push({ x, y: ys[lvl], on, lvl, i });
    }
  });
  const at = (lvl: number, i: number) => nodes.find((n) => n.lvl === lvl && n.i === i)!;
  return (
    <svg viewBox={VB} className="viz-svg" role="img" aria-label="Merkle tree: one changed chunk changes only the hashes on its path to the root, so only that chunk crosses the network.">
      {nodes
        .filter((n) => n.lvl > 0)
        .flatMap((n) => [at(n.lvl - 1, n.i * 2), at(n.lvl - 1, n.i * 2 + 1)].map((c) => ({ p: n, c })))
        .map(({ p, c }) => (
          <line key={`${p.lvl}${p.i}-${c.i}`} x1={p.x} y1={p.y + 10} x2={c.x} y2={c.y - 10} className={p.on && c.on ? "mk-edge on" : "mk-edge"} />
        ))}
      {nodes.map((n) => (
        <g key={`${n.lvl}-${n.i}`} className={n.on ? "mk-node on" : "mk-node"} style={{ animationDelay: `${(3 - n.lvl) * 0.18}s` }}>
          <rect x={n.x - 20} y={n.y - 10} width="40" height="20" rx="4" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" className="viz-label">
            {n.lvl === 0 ? hashes[n.i] : n.lvl === 3 ? "root" : "…"}
          </text>
        </g>
      ))}
      <text x="20" y="252" className="viz-label">1 of {leaves} chunks changed → 1 chunk sent</text>
    </svg>
  );
}

function PointInTime() {
  const docs = [
    { x: 40, h: 46, t: "10-K" },
    { x: 86, h: 34, t: "8-K" },
    { x: 128, h: 52, t: "10-Q" },
    { x: 176, h: 30, t: "8-K" },
    { x: 216, h: 48, t: "10-Q" },
    { x: 270, h: 40, t: "10-K/A" },
    { x: 318, h: 36, t: "8-K" },
    { x: 356, h: 50, t: "10-Q" },
  ];
  const asOf = 248;
  return (
    <svg viewBox={VB} className="viz-svg" role="img" aria-label="Filings on a timeline; anything filed after the question's as-of date is invisible to retrieval, including a later amendment.">
      <line x1="20" x2="384" y1="180" y2="180" className="viz-axis" />
      {docs.map((d, i) => {
        const future = d.x > asOf;
        return (
          <g key={i} className={future ? "pit-doc future" : "pit-doc"}>
            <rect x={d.x - 15} y={180 - d.h} width="30" height={d.h} rx="3" />
            <text x={d.x} y="198" textAnchor="middle" className="viz-label">{d.t}</text>
          </g>
        );
      })}
      <rect x={asOf} y="40" width={384 - asOf} height="150" className="pit-shade" />
      <line x1={asOf} x2={asOf} y1="34" y2="190" className="pit-line" />
      <text x={asOf - 6} y="48" textAnchor="end" className="viz-label viz-strong">as of</text>
      <text x={asOf + 8} y="62" className="viz-label">not yet filed</text>
      <text x="20" y="252" className="viz-label">retrieval cannot see the future · numbers must cite</text>
    </svg>
  );
}

function Pipeline({ project }: { project: Project }) {
  const stages = project.pipeline.slice(0, 5);
  const rowH = 44;
  const y0 = 18;
  return (
    <svg viewBox={VB} className="viz-svg" role="img" aria-label={`System stages: ${stages.map((s) => s.name).join(", ")}.`}>
      <line x1="34" x2="34" y1={y0 + 14} y2={y0 + 14 + (stages.length - 1) * rowH} className="pl-rail" />
      <circle cx="34" cy={y0 + 14} r="4" className="pl-dot" style={{ ["--travel" as string]: `${(stages.length - 1) * rowH}px` }} />
      {stages.map((s, i) => (
        <g key={s.name} transform={`translate(0 ${y0 + i * rowH})`}>
          <circle cx="34" cy="14" r="7" className="pl-node" />
          <text x="34" y="18" textAnchor="middle" className="viz-label pl-num">{i + 1}</text>
          <rect x="54" y="0" width="326" height="28" rx="5" className="pl-box" />
          <text x="66" y="18" className="viz-label viz-strong">
            {s.name.length > 44 ? `${s.name.slice(0, 43)}…` : s.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

const BESPOKE: Record<string, () => React.ReactElement> = {
  amme: OrderBook,
  nanolm: Attention,
  "amazon-ml": Entities,
  "ai-evals": Bootstrap,
  "distributed-file-sync": Merkle,
  chronicle: PointInTime,
};

export function ProjectViz({ project }: { project: Project }) {
  const C = BESPOKE[project.slug];
  return <div className="viz">{C ? <C /> : <Pipeline project={project} />}</div>;
}
