import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google";
import { PROFILE, SITE_URL } from "@/content/site";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-plex-sans",
  display: "swap",
});

const condensed = IBM_Plex_Sans_Condensed({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-plex-condensed",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

const description =
  "ML and software engineer, final year at IIT Madras. GPT and ViT from first principles, a live market maker, LLM evaluation tooling, a FUSE filesystem, and 12.5M-record entity resolution. Every figure links to the code that produced it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PROFILE.name}: ML and software engineer`,
    template: `%s | ${PROFILE.name}`,
  },
  description,
  applicationName: PROFILE.name,
  authors: [{ name: PROFILE.name, url: SITE_URL }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: PROFILE.name,
    title: `${PROFILE.name}: ML and software engineer`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${PROFILE.name}: ML and software engineer`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef1f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1217" },
  ],
};

/* Runs before first paint so the stored or system theme never flashes. */
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})();`;

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.name,
  url: SITE_URL,
  jobTitle: "Machine learning and software engineer",
  email: `mailto:${PROFILE.email}`,
  alumniOf: { "@type": "CollegeOrUniversity", name: PROFILE.school },
  sameAs: [PROFILE.links.github, PROFILE.links.linkedin, PROFILE.links.codeforces],
  knowsAbout: [
    "Machine learning",
    "Deep learning",
    "Large language models",
    "LLM evaluation",
    "Distributed systems",
    "Market microstructure",
    "Entity resolution",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${condensed.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      </head>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
