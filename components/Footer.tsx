import { PROFILE } from "@/content/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <p>
        Built by {PROFILE.name} with Next.js, server-rendered and statically generated. The lab&apos;s simulations are
        unit-tested and run entirely in your browser. Source on{" "}
        <a href={`${PROFILE.links.github}/Portfolio-website`} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        .
      </p>
    </footer>
  );
}
