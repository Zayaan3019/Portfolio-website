import Link from "next/link";
import { GITHUB_USER, PROFILE } from "@/content/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <p>
          <strong>{PROFILE.name}</strong> · IIT Madras · {new Date().getFullYear()}
        </p>
        <p className="footer-tech">
          Next.js server components, one hand-written stylesheet and canvas. No UI kit. Simulations unit-tested in CI.{" "}
          <a href={`https://github.com/${GITHUB_USER}/Portfolio-website`} target="_blank" rel="noopener noreferrer">
            Source
          </a>
          {" · "}
          <Link href="/lab">Lab</Link>
        </p>
      </div>
    </footer>
  );
}
