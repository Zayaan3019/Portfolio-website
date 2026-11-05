import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Rail } from "@/components/Rail";
import { SourceLink } from "@/components/SourceLink";
import { Footer } from "@/components/Footer";
import { Lab } from "@/components/lab/LabLoader";
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

  const sections = [
    { id: "problem", label: "The problem" },
    { id: "system", label: "The system" },
    { id: "decisions", label: "Decisions" },
    ...(p.findings.length ? [{ id: "findings", label: "What measurement caught" }] : []),
    { id: "results", label: "Results" },
    ...(p.lab ? [{ id: "try", label: "Try it" }] : []),
    { id: "all-work", label: "All work", href: "/#work" },
  ];

  return (
    <div className="shell">
      <Rail items={sections} />
      <main id="content">
        <p className="crumbs">
          <Link href="/#work">Work</Link>
        </p>
        <article>
          <header className="case-head">
            <h1>{p.title}</h1>
            <p className="case-tagline">{p.tagline}</p>
            <dl className="facts case-facts">
              <div>
                <dt>Headline</dt>
                <dd>
                  <strong className="num">{p.headline.figure}</strong> {p.headline.label}
                </dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{p.stack.join(", ")}</dd>
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
          </header>

          <div className="case-section">
            {p.summary.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          <section id="problem" className="case-section" aria-labelledby="problem-h">
            <h2 id="problem-h">Why the obvious approach fails</h2>
            {p.problem.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </section>

          <section id="system" className="case-section" aria-labelledby="system-h">
            <h2 id="system-h">The system, in data-flow order</h2>
            <ol className="pipeline">
              {p.pipeline.map((s) => (
                <li key={s.name}>
                  <strong>{s.name}</strong>
                  <span>{s.detail}</span>
                </li>
              ))}
            </ol>
          </section>

          <section id="decisions" className="case-section" aria-labelledby="decisions-h">
            <h2 id="decisions-h">Decisions and trade-offs</h2>
            <table className="decisions">
              <thead>
                <tr>
                  <th scope="col">Chose</th>
                  <th scope="col">Instead of</th>
                  <th scope="col">Because</th>
                </tr>
              </thead>
              <tbody>
                {p.decisions.map((d) => (
                  <tr key={d.choice}>
                    <td>{d.choice}</td>
                    <td>{d.over}</td>
                    <td>{d.because}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {p.findings.length > 0 && (
            <section id="findings" className="case-section" aria-labelledby="findings-h">
              <h2 id="findings-h">What measurement caught</h2>
              <ul className="findings">
                {p.findings.map((f) => (
                  <li key={f.title}>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                    {f.source && <SourceLink source={f.source} />}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="results" className="case-section" aria-labelledby="results-h">
            <h2 id="results-h">Results</h2>
            <ul className="evidence">
              {p.results.map((r) => (
                <li key={r.label}>
                  <span className="evidence-figure">{r.figure}</span>
                  <div>
                    <p className="evidence-claim">{r.label}</p>
                    {r.source && <SourceLink source={r.source} />}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {p.lab && (
            <section id="try" className="case-section" aria-labelledby="try-h">
              <h2 id="try-h">Try the core idea</h2>
              <Lab id={p.lab} showProjectLink={false} />
            </section>
          )}
        </article>

        <nav className="case-nav" aria-label="More work">
          <Link href={`/work/${prev.slug}`}>
            <span>Previous</span>
            {prev.title}
          </Link>
          <Link href={`/work/${next.slug}`}>
            <span>Next</span>
            {next.title}
          </Link>
        </nav>
        <Footer />
      </main>
    </div>
  );
}
