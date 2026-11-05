import Link from "next/link";
import { TopBar } from "@/components/site/TopBar";

export default function NotFound() {
  return (
    <>
      <TopBar items={[]} home={false} />
      <main id="content" className="wrap notfound">
        <p className="mono notfound-code">CH ?+?? · survey point not found</p>
        <h1>
          This station <em>isn&apos;t on the map.</em>
        </h1>
        <p>The page may have moved. Every project has a case file under the work index.</p>
        <p className="notfound-actions">
          <Link className="btn btn-primary" href="/">
            Back to the start
          </Link>
          <Link className="btn btn-ghost" href="/#work">
            See the work
          </Link>
        </p>
      </main>
    </>
  );
}
