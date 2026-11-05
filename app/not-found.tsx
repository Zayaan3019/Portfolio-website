import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell">
      <div />
      <main id="content">
        <section className="intro">
          <h1>Page not found</h1>
          <p className="intro-text">
            There is nothing at this address. The <Link href="/#work">list of work</Link> has every project.
          </p>
        </section>
      </main>
    </div>
  );
}
