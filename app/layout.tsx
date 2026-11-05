import type { Metadata, Viewport } from "next";
import { Archivo, Geist, JetBrains_Mono } from "next/font/google";
import { PROFILE, SITE_URL } from "@/content/site";
import { CommandPalette } from "@/components/site/CommandPalette";
import { Desk } from "@/components/desk/Desk";
import { RevealObserver } from "@/components/site/RevealObserver";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const description =
  "Mohamed Zayaan S, final-year engineer at IIT Madras. GPT and ViT from first principles, a live market maker, LLM evaluation infrastructure, a FUSE filesystem and 12.5M-record entity resolution. Every figure links to the code that produced it.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PROFILE.name}: ML, systems and quant engineer`,
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
    title: `${PROFILE.name}: ML, systems and quant engineer`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${PROFILE.name}: ML, systems and quant engineer`,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1ede3" },
    { media: "(prefers-color-scheme: dark)", color: "#070b10" },
  ],
};

/*
 * Runs before first paint: applies the stored theme (dark unless the visitor chose light)
 * and marks the document as scripted so reveal-on-scroll never hides content without JS.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("theme");d.dataset.theme=t==="light"?"light":"dark"}catch(e){d.dataset.theme="dark"}})();`;

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PROFILE.name,
  url: SITE_URL,
  image: `${SITE_URL}/zayaan-color.webp`,
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
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      </head>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        {children}
        <CommandPalette />
        <Desk />
        <RevealObserver />
      </body>
    </html>
  );
}
