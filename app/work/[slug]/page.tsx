import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SourceLink } from "@/components/SourceLink";
import { Footer } from "@/components/site/Footer";
import { TopBar, type NavItem } from "@/components/site/TopBar";
import { Lab } from "@/components/lab/LabLoader";
import { ProjectViz } from "@/components/viz/ProjectViz";
import { PROJECTS, projectBySlug } from "@/content/projects";
import { GITHUB_USER } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.tagline,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: p.title, description: p.tagline, url: `/work/${p.slug}`, type: "article" },
  };
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) notFound();

  const idx = PROJECTS.findIndex((x) => x.slug === p.slug);
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  const sections: NavItem[] = [
    { id: "problem", label: "Problem" },
    { id: "system", label: "System" },
    { id: "decisions", label: "Decisions" },
    ...(p.findings.length ? [{ id: "findings", label: "Caught" }] : []),
    { id: "results", label: "Results" },
    ...(p.lab ? [{ id: "try", label: "Try it" }] : []),
  ];

  return (
    <>
      <TopBar items={sections} home={false} />
      <main id="content" className="case">
        <header className="case-hero">
          <div className="wrap case-hero-inner">
            <div className="case-hero-copy">
              <p className="crumbs mono">
                <Link href="/#work">Work</Link> <span aria-hidden="true">/</span> {p.kind === "competition" ? "Competition" : "Project"} · {p.year}
              </p>
              <h1 data-rise>{p.title}</h1>
              <p className="case-tagline" data-rise>
                {p.tagline}
              </p>
              <dl className="case-facts" data-rise>
                <div>
                  <dt>Headline</dt>
                  <dd>
                    <strong>{p.headline.figure}</strong> {p.headline.label}
                  </dd>
                </div>
                {p.team && (
                  <div>
                    <dt>Context</dt>
                    <dd>{p.team}</dd>
                  </div>
                )}
                {p.repo && (
                  <div>
                    <dt>Code</dt>
                    <dd>
                      <a className="mono" href={`https://github.com/${GITHUB_USER}/${p.repo}`} target="_blank" rel="noopener noreferrer">
                        github.com/{GITHUB_USER}/{p.repo}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              <ul className="chips" aria-label="Stack">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="case-hero-visual" data-rise>
              <ProjectViz project={p} />
            </div>
          </div>
        </header>

        <article className="wrap case-body">
          <div className="case-section case-summary" data-reveal>
            {p.summary.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          <section id="problem" className="case-section" aria-labelledby="problem-h">
            <h2 id="problem-h" data-reveal>
              <span className="mono">01</span> Why the obvious approach fails
            </h2>
            {p.problem.map((para) => (
              <p key={para} data-reveal>
                {para}
              </p>
            ))}
          </section>

          <section id="system" className="case-section" aria-labelledby="system-h">
            <h2 id="system-h" data-reveal>
              <span className="mono">02</span> The system, in data-flow order
            </h2>
            <ol className="pipeline">
              {p.pipeline.map((s) => (
                <li key={s.name} data-reveal>
                  <strong>{s.name}</strong>
                  <span>{s.detail}</span>
                </li>
              ))}
            </ol>
          </section>

          <section id="decisions" className="case-section" aria-labelledby="decisions-h">
            <h2 id="decisions-h" data-reveal>
              <span className="mono">03</span> Decisions and trade-offs
            </h2>
            <ul className="decisions">
              {p.decisions.map((d) => (
                <li key={d.choice} data-reveal>
                  <p className="dec-choice">
                    <span className="mono">Chose</span>
                    {d.choice}
                  </p>
                  <p className="dec-over">
                    <span className="mono">Over</span>
                    {d.over}
                  </p>
                  <p className="dec-why">
                    <span className="mono">Because</span>
                    {d.because}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {p.findings.length > 0 && (
            <section id="findings" className="case-section" aria-labelledby="findings-h">
              <h2 id="findings-h" data-reveal>
                <span className="mono">04</span> What measurement caught
              </h2>
              <ul className="findings">
                {p.findings.map((f) => (
                  <li key={f.title} data-reveal>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                    {f.source && <SourceLink source={f.source} />}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="results" className="case-section" aria-labelledby="results-h">
            <h2 id="results-h" data-reveal>
              <span className="mono">{p.findings.length ? "05" : "04"}</span> Results
            </h2>
            <ul className="receipts receipts-case">
              {p.results.map((r) => (
                <li key={r.label} className="receipt" data-reveal>
                  <p className="receipt-fig">{r.figure}</p>
                  <p className="receipt-claim">{r.label}</p>
                  {r.source && (
                    <p className="receipt-foot">
                      <SourceLink source={r.source} />
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {p.lab && (
            <section id="try" className="case-section" aria-labelledby="try-h">
              <h2 id="try-h" data-reveal>
                <span className="mono">↯</span> Try the core idea
              </h2>
              <Lab id={p.lab} showProjectLink={false} />
            </section>
          )}
        </article>

        <nav className="wrap case-nav" aria-label="More work">
          <Link href={`/work/${prev.slug}`}>
            <span>Previous</span>
            {prev.title}
          </Link>
          <Link href={`/work/${next.slug}`}>
            <span>Next</span>
            {next.title}
          </Link>
        </nav>
      </main>
      <Footer />
    </>
  );
}
