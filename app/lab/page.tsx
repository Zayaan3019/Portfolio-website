import type { Metadata } from "next";
import { Rail } from "@/components/Rail";
import { Lab } from "@/components/lab/LabLoader";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Four in-browser experiments: KV-cache equivalence, Avellaneda–Stoikov market making, a paired-bootstrap regression gate, and Merkle delta sync.",
  alternates: { canonical: "/lab" },
};

const ITEMS = [
  { id: "kv", label: "KV-cache equivalence" },
  { id: "mm", label: "Market making" },
  { id: "bs", label: "Regression gate" },
  { id: "mk", label: "Merkle sync" },
  { id: "home", label: "Back to the main page", href: "/" },
];

export default function LabPage() {
  return (
    <div className="shell">
      <Rail items={ITEMS} />
      <main id="content">
        <section className="intro" aria-labelledby="lab-h">
          <h1 id="lab-h">Lab</h1>
          <p className="intro-text">
            Four ideas from my projects, reimplemented small enough to run in a browser and exact enough to test. The
            simulation code is unit-tested in this site&apos;s repository, with seeded random numbers so every run is
            reproducible.
          </p>
        </section>
        <section id="kv" className="section">
          <Lab id="kv-cache" />
        </section>
        <section id="mm" className="section">
          <Lab id="market-making" />
        </section>
        <section id="bs" className="section">
          <Lab id="bootstrap" />
        </section>
        <section id="mk" className="section">
          <Lab id="merkle" />
        </section>
        <Footer />
      </main>
    </div>
  );
}
