import Link from "next/link";
import { PROJECTS } from "@/content/projects";
import { GITHUB_USER, LENSES } from "@/content/site";
import type { LensId, Project } from "@/content/types";
import { ProjectViz } from "../viz/ProjectViz";
import { WorkShell } from "./WorkShell";

const FEATURED = 6;
const DEFAULT_ORDER = ["amazon-ml", "nanolm", "amme", "ai-evals", "distributed-file-sync", "chronicle"];

/** Rank for the neutral view: the curated six first, then the rest in content order. */
function neutralRank(p: Project) {
  const i = DEFAULT_ORDER.indexOf(p.slug);
  return i >= 0 ? i : DEFAULT_ORDER.length + PROJECTS.indexOf(p);
}

function rankFor(lens: LensId): Map<string, number> {
  const startHere = LENSES.find((l) => l.id === lens)?.startHere ?? [];
  const sorted = [...PROJECTS].sort((a, b) => {
    const sa = startHere.indexOf(a.slug);
    const sb = startHere.indexOf(b.slug);
    if (sa >= 0 || sb >= 0) return (sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb);
    return b.relevance[lens] - a.relevance[lens] || neutralRank(a) - neutralRank(b);
  });
  return new Map(sorted.map((p, i) => [p.slug, i]));
}

export function Work() {
  const ranks = Object.fromEntries(LENSES.map((l) => [l.id, rankFor(l.id)])) as Record<LensId, Map<string, number>>;
  const lensInfo = LENSES.map((l) => ({ id: l.id, label: l.label, pitch: l.pitch }));

  return (
    <WorkShell lenses={lensInfo} total={PROJECTS.length} featured={FEATURED}>
      {PROJECTS.map((p) => {
        const order: Record<string, number> = { "--o-all": neutralRank(p) };
        const top: string[] = neutralRank(p) < FEATURED ? ["all"] : [];
        for (const l of LENSES) {
          const r = ranks[l.id].get(p.slug) ?? 99;
          order[`--o-${l.id}`] = r;
          if (r < FEATURED) top.push(l.id);
        }
        return <ProjectCard key={p.slug} p={p} style={order as React.CSSProperties} top={top.join(" ")} />;
      })}
    </WorkShell>
  );
}

function ProjectCard({ p, style, top }: { p: Project; style: React.CSSProperties; top: string }) {
  const results = p.results.slice(0, 2);
  return (
    <article className="pcard" style={style} data-top={top} aria-labelledby={`p-${p.slug}`}>
      <div className="pcard-copy">
        <p className="pcard-meta mono">
          <span>{p.kind === "competition" ? "Competition" : "Project"}</span>
          <span>{p.year}</span>
          {p.team && <span className="pcard-team">{p.team.split(/[.,]/)[0]}</span>}
        </p>
        <h3 id={`p-${p.slug}`}>
          <Link href={`/work/${p.slug}`}>{p.title}</Link>
        </h3>
        <p className="pcard-tagline">{p.tagline}</p>
        <ul className="pcard-results">
          {results.map((r) => (
            <li key={r.label}>
              <strong>{r.figure}</strong> {r.label}
            </li>
          ))}
        </ul>
        <ul className="chips" aria-label="Stack">
          {p.stack.slice(0, 5).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <div className="pcard-links">
          <Link className="btn btn-small btn-primary" href={`/work/${p.slug}`}>
            Read the case file
          </Link>
          {p.repo && (
            <a className="link-arrow" href={`https://github.com/${GITHUB_USER}/${p.repo}`} target="_blank" rel="noopener noreferrer">
              Code
            </a>
          )}
        </div>
      </div>
      <div className="pcard-visual">
        <ProjectViz project={p} />
        <div className="stamp" aria-hidden="true">
          <strong>{p.headline.figure}</strong>
          <span>{p.headline.label}</span>
        </div>
      </div>
    </article>
  );
}
