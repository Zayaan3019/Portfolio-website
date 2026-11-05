"use client";

import { useCallback, useState } from "react";
import { PROFILE } from "@/content/site";
import { openDesk, openPalette } from "../state";
import { ContourField, OPTIMISERS, type BallStats, type OptimiserId } from "./ContourField";
import { TitleBlock } from "./TitleBlock";

export function Hero() {
  const [opt, setOpt] = useState<OptimiserId>("adam");
  const [stats, setStats] = useState<{ s: BallStats | null; n: number }>({ s: null, n: 0 });
  const onStats = useCallback((s: BallStats | null, n: number) => setStats({ s, n }), []);
  const active = OPTIMISERS.find((o) => o.id === (stats.s?.opt ?? opt));

  return (
    <section className="hero" aria-labelledby="hero-name">
      <ContourField optimiser={opt} onStats={onStats} />
      <div className="hero-vignette" aria-hidden="true" />

      <div className="hero-inner wrap">
        <div className="hero-copy">
          <p className="hero-status" data-rise>
            <span className="pulse" aria-hidden="true" />
            Final year at IIT Madras. Open to full-time roles from 2027.
          </p>
          <p id="hero-name" className="hero-name" data-rise>
            {PROFILE.name}
          </p>
          <h1 className="hero-title" data-rise>
            <span>Engineered</span> <span>to carry</span> <span className="hero-load">load.</span>
          </h1>
          <p className="hero-lede" data-rise>
            Civil engineer by degree, systems builder by habit. I build{" "}
            <strong>language and vision models from first principles</strong>, a <strong>live market maker</strong>,{" "}
            <strong>LLM-evaluation infrastructure</strong> and a <strong>FUSE filesystem</strong>, then load-test them
            until the numbers hold.
          </p>
          <div className="hero-actions" data-rise>
            <a className="btn btn-primary" href="#work">
              See the work
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </a>
            <a className="btn btn-ghost" href={PROFILE.links.resume} target="_blank" rel="noopener noreferrer">
              Resume
            </a>
            <button type="button" className="btn btn-ghost btn-desk" onClick={openDesk}>
              Trade against my market maker
            </button>
            <button type="button" className="kbd-hint" onClick={openPalette}>
              <kbd>Ctrl</kbd>
              <kbd>K</kbd>
              <span>to jump anywhere</span>
            </button>
          </div>
        </div>

        <TitleBlock />
      </div>

      <div className="hero-hud wrap" data-no-drop>
        <div className="hud-card">
          <p className="hud-title">
            This terrain is a loss surface. <span>Click anywhere on it to drop an optimiser.</span>
          </p>
          <div className="hud-row">
            <div className="hud-opts" role="radiogroup" aria-label="Optimiser">
              {OPTIMISERS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={opt === o.id}
                  className={opt === o.id ? "on" : undefined}
                  onClick={() => setOpt(o.id)}
                  style={{ "--c": o.color } as React.CSSProperties}
                >
                  <i aria-hidden="true" />
                  {o.label}
                </button>
              ))}
            </div>
            <p className="hud-readout mono" aria-live="off">
              {stats.s ? (
                <>
                  <span style={{ color: active?.color }}>{active?.label}</span> step {stats.s.step} · loss{" "}
                  {stats.s.loss.toFixed(3)}
                </>
              ) : (
                <>no optimiser running</>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
