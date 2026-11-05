"use client";

import { useEffect, useRef } from "react";

/*
 * The hero background is a survey map and a loss landscape at the same time.
 * A smooth scalar field (a drifting sum of Gaussians plus a low-frequency ripple)
 * is contoured every frame with marching squares. Clicking drops an optimiser
 * that descends the analytic gradient of the same field: SGD, heavy-ball momentum
 * or Adam, each with the update rule from its paper. The cursor presses a well
 * into the terrain, so the landscape reacts to the reader.
 */

export type OptimiserId = "sgd" | "momentum" | "adam";

export const OPTIMISERS: { id: OptimiserId; label: string; color: string }[] = [
  { id: "sgd", label: "SGD", color: "var(--opt-sgd)" },
  { id: "momentum", label: "Momentum", color: "var(--opt-mom)" },
  { id: "adam", label: "Adam", color: "var(--opt-adam)" },
];

interface Bump {
  cx: number; // base centre, in units of height (x is scaled by aspect)
  cy: number;
  rx: number; // orbit radius
  ry: number;
  w: number; // angular speed
  ph: number; // phase
  amp: number;
  s: number; // width
}

const BUMPS: Bump[] = [
  { cx: 0.16, cy: 0.3, rx: 0.06, ry: 0.05, w: 0.11, ph: 0.0, amp: 1.0, s: 0.2 },
  { cx: 0.42, cy: 0.72, rx: 0.08, ry: 0.04, w: 0.08, ph: 1.7, amp: -0.95, s: 0.18 },
  { cx: 0.68, cy: 0.28, rx: 0.05, ry: 0.07, w: 0.09, ph: 3.1, amp: 0.8, s: 0.16 },
  { cx: 0.86, cy: 0.68, rx: 0.07, ry: 0.06, w: 0.07, ph: 4.4, amp: -0.85, s: 0.22 },
  { cx: 0.3, cy: 0.95, rx: 0.06, ry: 0.03, w: 0.1, ph: 2.2, amp: 0.7, s: 0.15 },
  { cx: 0.52, cy: 0.9, rx: 0.06, ry: 0.03, w: 0.06, ph: 5.3, amp: -1.15, s: 0.2 },
  { cx: 0.97, cy: 0.18, rx: 0.04, ry: 0.05, w: 0.12, ph: 0.9, amp: 0.65, s: 0.14 },
  { cx: 0.04, cy: 0.78, rx: 0.04, ry: 0.06, w: 0.09, ph: 3.8, amp: -0.7, s: 0.16 },
];

const WELL_AMP = -1.05;
const WELL_S = 0.085;
const LEVEL_MIN = -1.5;
const LEVEL_STEP = 0.13;
const LEVELS = 26;
const MIN_CELL = 17; // CSS px per marching-squares cell, grown on wide screens
const MAX_COLS = 96;
const MAX_BALLS = 14;
const BALL_LIFE = 11; // seconds

// Marching-squares segment table. Edges: 0 top, 1 right, 2 bottom, 3 left.
const SEGMENTS: number[][] = [
  [], [3, 2], [2, 1], [3, 1], [0, 1], [3, 0, 2, 1], [0, 2], [3, 0],
  [3, 0], [0, 2], [3, 2, 0, 1], [0, 1], [3, 1], [2, 1], [3, 2], [],
];

interface Ball {
  opt: OptimiserId;
  x: number; // field units
  y: number;
  vx: number;
  vy: number;
  mx: number;
  my: number;
  sx: number;
  sy: number;
  step: number;
  born: number;
  loss: number;
  trail: number[]; // flattened x,y in field units
}

export interface BallStats {
  opt: OptimiserId;
  loss: number;
  step: number;
}

interface FieldState {
  t: number;
  aspect: number;
  wellX: number;
  wellY: number;
  wellK: number; // eased 0..1
  wellTarget: number;
  pointerX: number;
  pointerY: number;
}

function bumpCentre(b: Bump, t: number, aspect: number) {
  return {
    x: b.cx * aspect + b.rx * Math.sin(b.w * t + b.ph),
    y: b.cy + b.ry * Math.cos(b.w * 0.8 * t + b.ph * 1.3),
  };
}

/** Field value and analytic gradient at (x, y), in field units. */
function sample(st: FieldState, x: number, y: number, centres: { x: number; y: number }[]) {
  let f = 0;
  let gx = 0;
  let gy = 0;
  for (let i = 0; i < BUMPS.length; i++) {
    const b = BUMPS[i];
    const dx = x - centres[i].x;
    const dy = y - centres[i].y;
    const inv = 1 / (2 * b.s * b.s);
    const g = b.amp * Math.exp(-(dx * dx + dy * dy) * inv);
    f += g;
    gx += -2 * dx * inv * g;
    gy += -2 * dy * inv * g;
  }
  // Low-frequency ripple keeps the terrain from ever being flat.
  const a = 3.1 * x + 0.13 * st.t;
  const c = 2.7 * y - 0.1 * st.t;
  f += 0.16 * Math.sin(a) * Math.cos(c);
  gx += 0.16 * 3.1 * Math.cos(a) * Math.cos(c);
  gy += -0.16 * 2.7 * Math.sin(a) * Math.sin(c);
  if (st.wellK > 0.001) {
    const dx = x - st.wellX;
    const dy = y - st.wellY;
    const inv = 1 / (2 * WELL_S * WELL_S);
    const g = WELL_AMP * st.wellK * Math.exp(-(dx * dx + dy * dy) * inv);
    f += g;
    gx += -2 * dx * inv * g;
    gy += -2 * dy * inv * g;
  }
  return { f, gx, gy };
}

function stepBall(b: Ball, gx: number, gy: number) {
  b.step++;
  if (b.opt === "sgd") {
    b.x -= 0.0016 * gx;
    b.y -= 0.0016 * gy;
  } else if (b.opt === "momentum") {
    b.vx = 0.9 * b.vx + gx;
    b.vy = 0.9 * b.vy + gy;
    b.x -= 0.00042 * b.vx;
    b.y -= 0.00042 * b.vy;
  } else {
    const b1 = 0.9;
    const b2 = 0.999;
    b.mx = b1 * b.mx + (1 - b1) * gx;
    b.my = b1 * b.my + (1 - b1) * gy;
    b.sx = b2 * b.sx + (1 - b2) * gx * gx;
    b.sy = b2 * b.sy + (1 - b2) * gy * gy;
    const c1 = 1 - Math.pow(b1, b.step);
    const c2 = 1 - Math.pow(b2, b.step);
    b.x -= (0.0042 * (b.mx / c1)) / (Math.sqrt(b.sx / c2) + 1e-8);
    b.y -= (0.0042 * (b.my / c1)) / (Math.sqrt(b.sy / c2) + 1e-8);
  }
}

export function ContourField({
  optimiser,
  onStats,
}: {
  optimiser: OptimiserId;
  onStats?: (s: BallStats | null, count: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const optRef = useRef(optimiser);
  const statsRef = useRef(onStats);

  useEffect(() => {
    optRef.current = optimiser;
  }, [optimiser]);
  useEffect(() => {
    statsRef.current = onStats;
  }, [onStats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const host = canvas.parentElement as HTMLElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let cols = 0;
    let CELL = MIN_CELL;
    let onScreen = true;
    let lastVisCheck = 0;
    let rows = 0;
    let values = new Float32Array(0);
    let colors = { minor: "rgba(120,200,220,0.12)", major: "rgba(120,200,220,0.3)", low: "rgba(255,150,70,0.22)" };
    let ballColors: Record<OptimiserId, string> = { sgd: "#e8edf0", momentum: "#ff8f3c", adam: "#7ee0a1" };
    const st: FieldState = { t: 0, aspect: 1, wellX: -10, wellY: -10, wellK: 0, wellTarget: 0, pointerX: -10, pointerY: -10 };
    const balls: Ball[] = [];
    let raf = 0;
    let running = true;
    let visible = true;
    let last = performance.now();
    let lastStats = 0;
    const start = performance.now();

    const readColors = () => {
      const cs = getComputedStyle(host);
      colors = {
        minor: cs.getPropertyValue("--contour").trim() || colors.minor,
        major: cs.getPropertyValue("--contour-major").trim() || colors.major,
        low: cs.getPropertyValue("--contour-low").trim() || colors.low,
      };
      ballColors = {
        sgd: cs.getPropertyValue("--opt-sgd").trim() || ballColors.sgd,
        momentum: cs.getPropertyValue("--opt-mom").trim() || ballColors.momentum,
        adam: cs.getPropertyValue("--opt-adam").trim() || ballColors.adam,
      };
    };

    const resize = () => {
      const r = host.getBoundingClientRect();
      W = Math.max(1, Math.floor(r.width));
      H = Math.max(1, Math.floor(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      CELL = Math.max(MIN_CELL, Math.ceil(W / MAX_COLS));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      st.aspect = W / H;
      cols = Math.ceil(W / CELL) + 1;
      rows = Math.ceil(H / CELL) + 1;
      values = new Float32Array(cols * rows);
      if (!running) draw();
    };

    const toField = (px: number, py: number) => ({ x: px / H, y: py / H });

    const spawn = (px: number, py: number, opt: OptimiserId) => {
      const p = toField(px, py);
      if (balls.length >= MAX_BALLS) balls.shift();
      balls.push({ opt, x: p.x, y: p.y, vx: 0, vy: 0, mx: 0, my: 0, sx: 0, sy: 0, step: 0, born: st.t, loss: 0, trail: [] });
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const centres = BUMPS.map((b) => bumpCentre(b, st.t, st.aspect));

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const p = toField(i * CELL, j * CELL);
          values[j * cols + i] = sample(st, p.x, p.y, centres).f;
        }
      }

      ctx.lineJoin = "round";
      for (let l = 0; l < LEVELS; l++) {
        const L = LEVEL_MIN + l * LEVEL_STEP;
        const major = l % 5 === 0;
        ctx.beginPath();
        for (let j = 0; j < rows - 1; j++) {
          const y0 = j * CELL;
          for (let i = 0; i < cols - 1; i++) {
            const a = values[j * cols + i];
            const b = values[j * cols + i + 1];
            const c = values[(j + 1) * cols + i + 1];
            const d = values[(j + 1) * cols + i];
            const idx = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
            if (idx === 0 || idx === 15) continue;
            const seg = SEGMENTS[idx];
            const x0 = i * CELL;
            for (let s = 0; s < seg.length; s += 2) {
              for (let e = 0; e < 2; e++) {
                const edge = seg[s + e];
                let x = x0;
                let y = y0;
                if (edge === 0) x = x0 + ((L - a) / (b - a)) * CELL;
                else if (edge === 1) {
                  x = x0 + CELL;
                  y = y0 + ((L - b) / (c - b)) * CELL;
                } else if (edge === 2) {
                  x = x0 + ((L - d) / (c - d)) * CELL;
                  y = y0 + CELL;
                } else y = y0 + ((L - a) / (d - a)) * CELL;
                if (e === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
            }
          }
        }
        ctx.strokeStyle = L < -0.55 ? colors.low : major ? colors.major : colors.minor;
        ctx.lineWidth = major ? 1.15 : 0.7;
        ctx.stroke();
      }

      // Optimisers: trail, then the ball.
      for (const b of balls) {
        const age = st.t - b.born;
        const alpha = age > BALL_LIFE - 1.2 ? Math.max(0, (BALL_LIFE - age) / 1.2) : 1;
        const col = ballColors[b.opt];
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let k = 0; k < b.trail.length; k += 2) {
          const x = b.trail[k] * H;
          const y = b.trail[k + 1] * H;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(b.x * H, b.y * H, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    };

    const update = (dt: number) => {
      st.t += dt;
      st.wellK += (st.wellTarget - st.wellK) * Math.min(1, dt * 3);
      st.wellX += (st.pointerX - st.wellX) * Math.min(1, dt * 6);
      st.wellY += (st.pointerY - st.wellY) * Math.min(1, dt * 6);
      const centres = BUMPS.map((b) => bumpCentre(b, st.t, st.aspect));
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        if (st.t - b.born > BALL_LIFE) {
          balls.splice(i, 1);
          continue;
        }
        for (let k = 0; k < 2; k++) {
          const s = sample(st, b.x, b.y, centres);
          b.loss = s.f;
          stepBall(b, s.gx, s.gy);
        }
        b.x = Math.min(Math.max(b.x, 0), st.aspect);
        b.y = Math.min(Math.max(b.y, 0), 1);
        b.trail.push(b.x, b.y);
        if (b.trail.length > 240) b.trail.splice(0, 2);
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      if (dt < 1 / 40) return; // ~30-40 fps is plenty for a background
      if (now - lastVisCheck > 300) {
        // Belt and braces: never draw while scrolled away, even if the observer is late.
        lastVisCheck = now;
        const r = host.getBoundingClientRect();
        onScreen = r.bottom > 0 && r.top < window.innerHeight;
      }
      last = now;
      if (!onScreen) return;
      update(dt);
      draw();
      if (statsRef.current && now - lastStats > 120) {
        lastStats = now;
        const b = balls[balls.length - 1];
        statsRef.current(b ? { opt: b.opt, loss: b.loss - LEVEL_MIN, step: b.step } : null, balls.length);
      }
    };

    const play = () => {
      if (reduced || !visible || document.hidden) return;
      if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const p = toField(e.clientX - r.left, e.clientY - r.top);
      st.pointerX = p.x;
      st.pointerY = p.y;
      if (st.wellK < 0.01) {
        st.wellX = p.x;
        st.wellY = p.y;
      }
      st.wellTarget = e.pointerType === "mouse" ? 1 : 0;
    };
    const onLeave = () => {
      st.wellTarget = 0;
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, input, select, textarea, label, [data-no-drop]")) return;
      const r = host.getBoundingClientRect();
      spawn(e.clientX - r.left, e.clientY - r.top, optRef.current);
      if (!running && reduced) draw();
    };

    readColors();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const themeObs = new MutationObserver(() => {
      readColors();
      if (!running) draw();
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else pause();
    });
    io.observe(host);
    const onVis = () => (document.hidden ? pause() : play());
    document.addEventListener("visibilitychange", onVis);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);

    // Seed three optimisers from the same point so the difference is visible at once.
    const seedTimer = window.setTimeout(() => {
      const sx = W * 0.57;
      const sy = H * 0.16;
      spawn(sx, sy, "sgd");
      spawn(sx + 6, sy + 4, "momentum");
      spawn(sx - 6, sy + 8, "adam");
    }, 900);

    if (reduced) {
      st.t = 12;
      running = false;
      draw();
    } else {
      running = false;
      st.t = (performance.now() - start) / 1000;
      play();
    }

    return () => {
      pause();
      window.clearTimeout(seedTimer);
      ro.disconnect();
      io.disconnect();
      themeObs.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={canvasRef} className="contour-canvas" aria-hidden="true" />;
}
