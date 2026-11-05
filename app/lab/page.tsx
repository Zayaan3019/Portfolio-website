import type { Metadata } from "next";
import { Lab } from "@/components/lab/LabLoader";
import { Footer } from "@/components/site/Footer";
import { TopBar } from "@/components/site/TopBar";
import { SectionHead } from "@/components/home/Sections";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Four in-browser experiments: KV-cache equivalence, Avellaneda–Stoikov market making, a paired-bootstrap regression gate, and Merkle delta sync.",
  alternates: { canonical: "/lab" },
};

const ITEMS = [
  { id: "kv", label: "KV cache" },
  { id: "mm", label: "Market making" },
  { id: "bs", label: "Regression gate" },
  { id: "mk", label: "Merkle sync" },
];

export default function LabPage() {
  return (
    <>
      <TopBar items={ITEMS} home={false} />
      <main id="content" className="lab-page">
        <section className="section wrap lab-intro" aria-labelledby="lab-page-h">
          <SectionHead
            id="lab-page-h"
            index="Lab"
            title={
              <>
                Four experiments. <em>Real computation.</em>
              </>
            }
            lede="Ideas from my projects, reimplemented small enough to run in a browser and exact enough to test. The simulation code is unit-tested in this site's CI with seeded random numbers, so every run is reproducible."
          />
        </section>
        <section id="kv" className="section wrap lab-slot">
          <Lab id="kv-cache" />
        </section>
        <section id="mm" className="section wrap lab-slot">
          <Lab id="market-making" />
        </section>
        <section id="bs" className="section wrap lab-slot">
          <Lab id="bootstrap" />
        </section>
        <section id="mk" className="section wrap lab-slot">
          <Lab id="merkle" />
        </section>
      </main>
      <Footer />
    </>
  );
}
