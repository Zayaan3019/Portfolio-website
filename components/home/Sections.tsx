import Link from "next/link";
import { PROJECTS } from "@/content/projects";
import { EVIDENCE, EXPERIENCE, PATENTS, PROFILE, PUBLICATIONS, RECOGNITION, SKILLS, sourceText, sourceUrl } from "@/content/site";
import { CountUp } from "../site/CountUp";
import { CopyEmail } from "../site/CopyEmail";

export function SectionHead({ index, title, lede, id }: { index: string; title: React.ReactNode; lede?: React.ReactNode; id: string }) {
  return (
    <header className="shead" data-reveal>
      <p className="shead-index mono" aria-hidden="true">
        <span>{index}</span>
        <i />
      </p>
      <h2 id={id}>{title}</h2>
      {lede && <p className="shead-lede">{lede}</p>}
    </header>
  );
}

/* ------------------------------------------------------------------ principles */

const PRINCIPLES = [
  {
    n: "01",
    title: "Reproduce before improving.",
    body: "Before NanoLM's decoding was made fast, it was proven equal: cached generation against the full forward pass, to a maximum deviation of 5.96e-8.",
    href: "/work/nanolm",
    cta: "NanoLM",
  },
  {
    n: "02",
    title: "Let statistics decide.",
    body: "My evaluation gate blocks a pull request only when a 10,000-resample paired interval excludes zero, and refuses to judge on fewer than 20 cases.",
    href: "/work/ai-evals",
    cta: "AI-Evals",
  },
  {
    n: "03",
    title: "Hunt for the failure first.",
    body: "Every case file has a section on what measurement caught: a clock 677 ms ahead of the exchange, an over-fill bug that flipped an ablation, a remote-write hole in my own file sync.",
    href: "/work/amme",
    cta: "AMME",
  },
];

export function Principles() {
  return (
    <section className="section wrap" aria-labelledby="how-h">
      <SectionHead
        id="how-h"
        index="01"
        title={
          <>
            Civil engineering taught me one thing: <em>check the calculations.</em>
          </>
        }
        lede="A structure fails at its weakest joint, under the load nobody modelled. Software and models fail the same way, so this is how I work."
      />
      <ol className="principles">
        {PRINCIPLES.map((p) => (
          <li key={p.n} className="principle" data-reveal>
            <span className="principle-n mono">{p.n}</span>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
            <Link className="link-arrow" href={p.href}>
              {p.cta}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ route (experience) */

const START = { y: 2023, m: 7 };
function chainage(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  const months = Math.max(0, (y - START.y) * 12 + (m - START.m));
  return `${Math.floor(months / 12)}+${String(months % 12).padStart(2, "0")}`;
}
const fmt = (iso: string) => {
  const [y, m] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
};

export function Route() {
  return (
    <section id="route" className="section wrap" aria-labelledby="route-h">
      <SectionHead
        id="route-h"
        index="04"
        title="The route so far"
        lede={
          <>
            Surveyed like a road: each station&apos;s chainage is years and months since I joined IIT Madras. Open any station
            for the details.
          </>
        }
      />
      <ol className="route">
        {EXPERIENCE.map((r, i) => (
          <li key={r.org} className="station" data-reveal>
            <details open={i === 0}>
              <summary>
                <span className="station-ch mono">CH {chainage(r.start)}</span>
                <span className="station-main">
                  <strong>{r.org}</strong>
                  <span>{r.title}</span>
                </span>
                <span className="station-date mono">
                  {fmt(r.start)} – {fmt(r.end)}
                </span>
                <span className="station-toggle" aria-hidden="true" />
              </summary>
              <div className="station-body">
                {r.supervisor && <p className="station-sup">With {r.supervisor}</p>}
                <ul>
                  {r.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
                <ul className="chips">
                  {r.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </details>
          </li>
        ))}
        <li className="station station-origin" data-reveal>
          <div className="station-static">
            <span className="station-ch mono">CH 0+00</span>
            <span className="station-main">
              <strong>{PROFILE.school}</strong>
              <span>
                {PROFILE.degree}. CGPA {PROFILE.cgpa}.
              </span>
            </span>
            <span className="station-date mono">{PROFILE.years}</span>
          </div>
        </li>
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ receipts */

export function Receipts() {
  const title = (slug: string) => PROJECTS.find((p) => p.slug === slug)?.title ?? slug;
  return (
    <section id="receipts" className="section wrap" aria-labelledby="receipts-h">
      <SectionHead
        id="receipts-h"
        index="05"
        title="Receipts"
        lede="Numbers are cheap on a portfolio. Each one here links to the file, and the line, in a public repository that produces or records it."
      />
      <ul className="receipts">
        {EVIDENCE.map((e) => (
          <li key={e.id} className="receipt" data-reveal>
            <p className="receipt-fig">{e.figure}</p>
            <p className="receipt-claim">{e.claim}</p>
            <p className="receipt-foot">
              <Link href={`/work/${e.project}`}>{title(e.project)}</Link>
              <a className="receipt-src mono" href={sourceUrl(e.source)} target="_blank" rel="noopener noreferrer">
                {sourceText(e.source)}
              </a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ research */

function SkeletonGlyph() {
  const pts = [
    [60, 30], [60, 70], [30, 100], [90, 100], [60, 120], [40, 160], [80, 160], [20, 70], [100, 70],
  ];
  const edges = [[0, 1], [1, 7], [1, 8], [1, 4], [7, 2], [8, 3], [4, 5], [4, 6]];
  return (
    <svg viewBox="0 0 120 180" className="paper-glyph" aria-hidden="true">
      {edges.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} />
      ))}
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 1 || i === 4 ? 5 : 3.5} />
      ))}
    </svg>
  );
}

export function Research() {
  const pub = PUBLICATIONS[0];
  const pat = PATENTS[0];
  return (
    <section id="research" className="section wrap" aria-labelledby="research-h">
      <SectionHead id="research-h" index="06" title="Research and IP" />
      <div className="research">
        <article className="paper" data-reveal>
          <SkeletonGlyph />
          <div>
            <p className="paper-kind mono">Paper · {pub.note.replace(".", "")}</p>
            <h3>{pub.title}</h3>
            <p className="paper-venue">{pub.venue}</p>
            <p>{pub.summary}</p>
            <p className="paper-links">
              {pub.links.map((l) => (
                <a key={l.href} className="link-arrow" href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              ))}
            </p>
          </div>
        </article>
        <article className="paper paper-patent" data-reveal>
          <div>
            <p className="paper-kind mono">Patent application</p>
            <h3>{pat.title}</h3>
            <p className="paper-venue">{pat.status}</p>
            <p>{pat.summary}</p>
          </div>
        </article>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ scoreboard */

export function Scoreboard() {
  const boards = [
    { big: <>Top 6</>, of: <>of <CountUp value={11500} /> teams</>, what: RECOGNITION[0].where, href: "/work/amex-codestreet" },
    { big: <><CountUp value={175} />th</>, of: <>of <CountUp value={90000} /> registrations</>, what: RECOGNITION[1].where, href: "/work/amazon-ml" },
    { big: <CountUp value={1423} grouping={false} />, of: <>max rating, Specialist</>, what: "Codeforces", href: PROFILE.links.codeforces },
    { big: <><CountUp value={500} />+</>, of: <>problems solved</>, what: "LeetCode, Codeforces, CodeChef, GfG" },
  ];
  return (
    <section className="section wrap" aria-labelledby="score-h">
      <SectionHead id="score-h" index="07" title="Scoreboard" />
      <ul className="scoreboard">
        {boards.map((b, i) => {
          const inner = (
            <>
              <p className="score-big">{b.big}</p>
              <p className="score-of">{b.of}</p>
              <p className="score-what mono">{b.what}</p>
            </>
          );
          return (
            <li key={i} data-reveal>
              {b.href ? (
                b.href.startsWith("http") ? (
                  <a href={b.href} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </a>
                ) : (
                  <Link href={b.href}>{inner}</Link>
                )
              ) : (
                <div>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ toolbox */

/** Split "AWS (EC2, ECS), Docker" on top-level commas only. */
function splitItems(s: string) {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function usedIn(item: string) {
  const key = item.replace(/\s*\(.*\)/, "").toLowerCase();
  return PROJECTS.filter((p) => p.stack.some((s) => s.toLowerCase().includes(key) || key.includes(s.toLowerCase()))).slice(0, 3);
}

export function Toolbox() {
  return (
    <section className="section wrap" aria-labelledby="tools-h">
      <SectionHead id="tools-h" index="08" title="Toolbox" lede="Hover a tool to see where it was used in anger." />
      <div className="toolbox">
        {SKILLS.map((g) => (
          <div key={g.area} className="tool-group" data-reveal>
            <h3>{g.area}</h3>
            <ul className="tools">
              {splitItems(g.items).map((it) => {
                const uses = usedIn(it);
                return (
                  <li key={it} tabIndex={uses.length ? 0 : undefined} className={uses.length ? "has-uses" : undefined}>
                    {it}
                    {uses.length > 0 && (
                      <span className="tool-uses" role="tooltip">
                        Used in{" "}
                        {uses.map((u, i) => (
                          <span key={u.slug}>
                            {i > 0 && ", "}
                            {u.title}
                          </span>
                        ))}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ contact */

export function Contact() {
  return (
    <section id="contact" className="contact" aria-labelledby="contact-h">
      <div className="wrap contact-inner">
        <p className="shead-index mono" aria-hidden="true">
          <span>09</span>
          <i />
        </p>
        <h2 id="contact-h" data-reveal>
          Have something that needs to <span className="hero-load">hold?</span>
        </h2>
        <p className="contact-lede" data-reveal>
          I am looking for full-time roles in ML, software, applied science, data science and quant research, starting 2027.
          The fastest way to reach me is email.
        </p>
        <div className="contact-actions" data-reveal>
          <CopyEmail email={PROFILE.email} />
          <a className="btn btn-ghost" href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a className="btn btn-ghost" href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a className="btn btn-ghost" href={PROFILE.links.resume} target="_blank" rel="noopener noreferrer">
            Resume
          </a>
        </div>
      </div>
    </section>
  );
}
