"use client";

/*
 * Minimal SVG charts. Colours come from CSS variables, so charts follow the theme.
 * Every chart takes an aria label that states what it shows in words.
 */

export interface Series {
  values: ArrayLike<number>;
  color: string;
  width?: number;
  dash?: string;
}

const W = 720;

function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [min];
  const span = max - min;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => span / s <= count) ?? step0;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-12; v += step) out.push(Number(v.toPrecision(12)));
  return out;
}

const fmt = (v: number) => {
  const a = Math.abs(v);
  if (a !== 0 && (a < 1e-3 || a >= 1e5)) return v.toExponential(0);
  return Number(v.toPrecision(4)).toString();
};

export function LineChart({
  series,
  height = 220,
  label,
  yLabel,
  xMax,
}: {
  series: Series[];
  height?: number;
  label: string;
  yLabel?: string;
  xMax?: number;
}) {
  const pad = { l: 44, r: 8, t: 10, b: 22 };
  const n = Math.max(...series.map((s) => s.values.length));
  let lo = Infinity;
  let hi = -Infinity;
  for (const s of series)
    for (let i = 0; i < s.values.length; i++) {
      lo = Math.min(lo, s.values[i]);
      hi = Math.max(hi, s.values[i]);
    }
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const padY = (hi - lo) * 0.06;
  lo -= padY;
  hi += padY;
  const x = (i: number) => pad.l + (i / Math.max(n - 1, 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (height - pad.t - pad.b);
  const ticks = niceTicks(lo, hi);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label}>
      {ticks.map((t) => (
        <g key={t}>
          <line className="grid" x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end">
            {fmt(t)}
          </text>
        </g>
      ))}
      <line className="axis" x1={pad.l} x2={W - pad.r} y1={height - pad.b} y2={height - pad.b} />
      {xMax !== undefined && (
        <>
          <text x={pad.l} y={height - 6}>
            0
          </text>
          <text x={W - pad.r} y={height - 6} textAnchor="end">
            {fmt(xMax)}
          </text>
        </>
      )}
      {yLabel && (
        <text x={pad.l + 4} y={pad.t + 10}>
          {yLabel}
        </text>
      )}
      {series.map((s, k) => {
        let d = "";
        for (let i = 0; i < s.values.length; i++) d += `${i ? "L" : "M"}${x(i).toFixed(1)},${y(s.values[i]).toFixed(1)}`;
        return (
          <path
            key={k}
            d={d}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width ?? 1.5}
            strokeDasharray={s.dash}
            strokeLinejoin="round"
          />
        );
      })}
    </svg>
  );
}

export interface Marker {
  at: number;
  color: string;
  label?: string;
  dash?: string;
}

export function Histogram({
  bins,
  min,
  max,
  height = 180,
  label,
  color,
  overlay,
  band,
  markers = [],
}: {
  bins: number[];
  min: number;
  max: number;
  height?: number;
  label: string;
  color: string;
  overlay?: { bins: number[]; color: string };
  band?: { lo: number; hi: number; color: string };
  markers?: Marker[];
}) {
  const pad = { l: 12, r: 12, t: 16, b: 22 };
  const peak = Math.max(1, ...bins, ...(overlay?.bins ?? []));
  const x = (v: number) => pad.l + ((v - min) / (max - min || 1)) * (W - pad.l - pad.r);
  const bw = (W - pad.l - pad.r) / bins.length;
  const h = (c: number) => (c / peak) * (height - pad.t - pad.b);
  const base = height - pad.b;
  const ticks = niceTicks(min, max, 5);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label}>
      {band && (
        <rect
          x={x(band.lo)}
          y={pad.t}
          width={Math.max(1, x(band.hi) - x(band.lo))}
          height={base - pad.t}
          fill={band.color}
          opacity={0.16}
        />
      )}
      {bins.map((c, i) => (
        <rect key={i} x={pad.l + i * bw + 0.5} y={base - h(c)} width={Math.max(bw - 1, 0.5)} height={h(c)} fill={color} opacity={0.75} />
      ))}
      {overlay && (
        <path
          d={overlay.bins.map((c, i) => `${i ? "L" : "M"}${pad.l + i * bw},${base - h(c)}H${pad.l + (i + 1) * bw}`).join("")}
          fill="none"
          stroke={overlay.color}
          strokeWidth={1.75}
        />
      )}
      <line className="axis" x1={pad.l} x2={W - pad.r} y1={base} y2={base} />
      {ticks.map((t) => (
        <text key={t} x={x(t)} y={height - 6} textAnchor="middle">
          {fmt(t)}
        </text>
      ))}
      {markers.map((m, i) => (
        <g key={i}>
          <line x1={x(m.at)} x2={x(m.at)} y1={pad.t - 4} y2={base} stroke={m.color} strokeWidth={1.5} strokeDasharray={m.dash} />
          {m.label && (
            <text x={x(m.at) + 4} y={pad.t + 2} style={{ fill: m.color }}>
              {m.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

/** Horizontal intervals on a shared axis, e.g. paired vs unpaired confidence intervals. */
export function Intervals({
  rows,
  label,
  zero = 0,
}: {
  rows: { name: string; lo: number; hi: number; point: number; color: string }[];
  label: string;
  zero?: number;
}) {
  const rowH = 30;
  const pad = { l: 120, r: 16, t: 8, b: 22 };
  const height = pad.t + rows.length * rowH + pad.b;
  let lo = Math.min(zero, ...rows.map((r) => r.lo));
  let hi = Math.max(zero, ...rows.map((r) => r.hi));
  const span = hi - lo || 1;
  lo -= span * 0.08;
  hi += span * 0.08;
  const x = (v: number) => pad.l + ((v - lo) / (hi - lo)) * (W - pad.l - pad.r);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label}>
      <line x1={x(zero)} x2={x(zero)} y1={pad.t} y2={height - pad.b} stroke="var(--ink-3)" strokeDasharray="3 3" />
      <text x={x(zero)} y={height - 6} textAnchor="middle">
        no change
      </text>
      {rows.map((r, i) => {
        const cy = pad.t + i * rowH + rowH / 2;
        return (
          <g key={r.name}>
            <text x={0} y={cy + 4} style={{ fill: "var(--ink-2)", fontSize: 12 }}>
              {r.name}
            </text>
            <line x1={x(r.lo)} x2={x(r.hi)} y1={cy} y2={cy} stroke={r.color} strokeWidth={3} strokeLinecap="round" />
            <circle cx={x(r.point)} cy={cy} r={4.5} fill="var(--surface)" stroke={r.color} strokeWidth={2} />
          </g>
        );
      })}
    </svg>
  );
}

/** Bars on a log10 axis, for errors that span many orders of magnitude. */
export function LogBars({
  values,
  floor = 1e-10,
  ceil = 1,
  threshold,
  height = 170,
  label,
  color,
  failColor,
}: {
  values: number[];
  floor?: number;
  ceil?: number;
  threshold: number;
  height?: number;
  label: string;
  color: string;
  failColor: string;
}) {
  const pad = { l: 44, r: 8, t: 10, b: 20 };
  const lf = Math.log10(floor);
  const lc = Math.log10(ceil);
  const y = (v: number) => {
    const l = Math.log10(Math.min(Math.max(v, floor), ceil));
    return pad.t + (1 - (l - lf) / (lc - lf)) * (height - pad.t - pad.b);
  };
  const bw = (W - pad.l - pad.r) / Math.max(values.length, 1);
  const base = height - pad.b;
  const ticks: number[] = [];
  for (let e = Math.ceil(lf); e <= lc; e += 2) ticks.push(10 ** e);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label}>
      {ticks.map((t) => (
        <g key={t}>
          <line className="grid" x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
          <text x={pad.l - 6} y={y(t) + 4} textAnchor="end">
            {`1e${Math.round(Math.log10(t))}`}
          </text>
        </g>
      ))}
      {values.map((v, i) => (
        <rect
          key={i}
          x={pad.l + i * bw + 0.5}
          y={y(v)}
          width={Math.max(bw - 1.5, 0.75)}
          height={Math.max(base - y(v), v > 0 ? 1 : 0)}
          fill={v > threshold ? failColor : color}
          opacity={0.85}
        />
      ))}
      <line x1={pad.l} x2={W - pad.r} y1={y(threshold)} y2={y(threshold)} stroke={failColor} strokeDasharray="4 3" />
      <text x={W - pad.r} y={y(threshold) - 4} textAnchor="end" style={{ fill: failColor }}>
        test tolerance
      </text>
      <line className="axis" x1={pad.l} x2={W - pad.r} y1={base} y2={base} />
      <text x={pad.l} y={height - 4}>
        position 0
      </text>
      <text x={W - pad.r} y={height - 4} textAnchor="end">
        {values.length - 1}
      </text>
    </svg>
  );
}
