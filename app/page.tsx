import Link from "next/link";
import { Rail } from "@/components/Rail";
import { EvidenceList, LensPicker, WorkIndex, type ProjectSummary } from "@/components/Lens";
import { FeaturedLab } from "@/components/lab/LabLoader";
import { Footer } from "@/components/Footer";
import { PROJECTS } from "@/content/projects";
import { EXPERIENCE, PATENTS, PROFILE, PUBLICATIONS, RECOGNITION, SKILLS } from "@/content/site";

const SECTIONS = [
  { id: "evidence", label: "Results" },
  { id: "work", label: "Work" },
  { id: "lab", label: "Lab" },
  { id: "experience", label: "Experience" },
  { id: "research", label: "Research" },
  { id: "background", label: "Background" },
  { id: "contact", label: "Contact" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function month(iso: string) {
  const [y, m] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

const summaries: ProjectSummary[] = PROJECTS.map(({ slug, title, kind, tagline, headline, relevance }) => ({
  slug,
  title,
  kind,
  tagline,
  headline,
  relevance,
}));

export default function Home() {
  return (
    <div className="shell">
      <Rail items={SECTIONS} />
      <main id="content">
        <section className="intro" aria-labelledby="name">
          <h1 id="name">{PROFILE.name}</h1>
          <p className="intro-text">{PROFILE.intro}</p>
          <p className="intro-actions">
            <a href={PROFILE.links.resume} target="_blank" rel="noopener noreferrer">
              Resume
            </a>
            <a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          </p>
          <LensPicker projects={summaries} />
        </section>

        <section id="evidence" className="section" aria-labelledby="evidence-h">
          <h2 id="evidence-h">Measured results</h2>
          <p className="section-lede">
            Each figure links to the file in a public repository that produces or records it, so you can check it.
          </p>
          <EvidenceList />
        </section>

        <section id="work" className="section" aria-labelledby="work-h">
          <h2 id="work-h">Work</h2>
          <p className="section-lede">
            Each project has a write-up: why the obvious approach fails, what I built, the decisions, and what measurement
            caught.
          </p>
          <WorkIndex projects={summaries} />
        </section>

        <section id="lab" className="section" aria-labelledby="lab-h">
          <h2 id="lab-h">Lab</h2>
          <p className="section-lede">
            Small, exact reimplementations of ideas from the projects, running in your browser. Change an input and the
            computation reruns.
          </p>
          <FeaturedLab />
        </section>

        <section id="experience" className="section" aria-labelledby="exp-h">
          <h2 id="exp-h">Experience</h2>
          <ol className="timeline" reversed>
            {EXPERIENCE.map((r) => (
              <li key={r.org + r.start}>
                <time dateTime={r.start}>
                  {month(r.start)} to {month(r.end)}
                </time>
                <div>
                  <h3>{r.org}</h3>
                  <p className="role-title">
                    {r.title}
                    {r.supervisor ? `, with ${r.supervisor}` : ""}
                  </p>
                  <ul>
                    {r.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                  <ul className="tags" aria-label="Tools">
                    {r.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="research" className="section" aria-labelledby="research-h">
          <h2 id="research-h">Research</h2>
          <ul className="entries">
            {PUBLICATIONS.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p className="entry-meta">
                  {p.venue} {p.note}
                </p>
                <p>{p.summary}</p>
                <p className="entry-links">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ))}
                </p>
              </li>
            ))}
            {PATENTS.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p className="entry-meta">{p.status}</p>
                <p>{p.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="background" className="section" aria-labelledby="bg-h">
          <h2 id="bg-h">Background</h2>
          <dl className="facts">
            <div>
              <dt>Education</dt>
              <dd>
                {PROFILE.degree}, {PROFILE.school}, {PROFILE.years}. CGPA {PROFILE.cgpa}.
              </dd>
            </div>
            {RECOGNITION.map((r) => (
              <div key={r.what}>
                <dt>{r.where}</dt>
                <dd>
                  {r.slug ? (
                    <Link href={`/work/${r.slug}`}>{r.what}</Link>
                  ) : r.href ? (
                    <a href={r.href} target="_blank" rel="noopener noreferrer">
                      {r.what}
                    </a>
                  ) : (
                    r.what
                  )}
                </dd>
              </div>
            ))}
            {SKILLS.map((s) => (
              <div key={s.area}>
                <dt>{s.area}</dt>
                <dd>{s.items}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="contact" className="section" aria-labelledby="contact-h">
          <h2 id="contact-h">Contact</h2>
          <p>
            I graduate in May 2027 and am looking for full-time roles in machine learning, applied science, software
            engineering, data science and quantitative research.
          </p>
          <p className="contact-line">
            <a href={`mailto:${PROFILE.email}`}>{PROFILE.email}</a>
          </p>
          <p className="intro-actions" style={{ marginTop: 0 }}>
            <a href={PROFILE.links.resume} target="_blank" rel="noopener noreferrer">
              Resume
            </a>
            <a href={PROFILE.links.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <a href={PROFILE.links.codeforces} target="_blank" rel="noopener noreferrer">
              Codeforces
            </a>
          </p>
        </section>
        <Footer />
      </main>
    </div>
  );
}
