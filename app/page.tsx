import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { Work } from "@/components/home/Work";
import { Contact, Principles, Receipts, Research, Route, Scoreboard, SectionHead, Toolbox } from "@/components/home/Sections";
import { LabTabs } from "@/components/lab/LabTabs";
import { Footer } from "@/components/site/Footer";
import { TopBar } from "@/components/site/TopBar";

export default function Home() {
  return (
    <>
      <TopBar />
      <main id="content">
        <Hero />
        <Ticker />
        <Principles />

        <section id="work" className="section wrap" aria-labelledby="work-h">
          <SectionHead
            id="work-h"
            index="02"
            title="Load-tested work"
            lede="Each project opens into a full case file: why the obvious approach fails, the system, the trade-offs, and what measurement caught."
          />
          <Work />
        </section>

        <section id="lab" className="section wrap" aria-labelledby="lab-h">
          <SectionHead
            id="lab-h"
            index="03"
            title={
              <>
                Don&apos;t take my word for it. <em>Run it.</em>
              </>
            }
            lede="Four ideas from the projects, reimplemented small enough to run in your browser and exact enough to unit-test. Seeded, so every run is reproducible."
          />
          <LabTabs />
        </section>

        <Route />
        <Receipts />
        <Research />
        <Scoreboard />
        <Toolbox />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
